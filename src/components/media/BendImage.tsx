"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* ============================================================================
   Tunable values — adjust the bend here.
   ========================================================================== */
const SEGMENTS = 40; // mesh resolution, higher = smoother bend
const STRENGTH = 0.55; // bend depth toward the cursor
const FALLOFF = 4.0; // bend breadth — LOWER = the whole card leans, HIGHER = a tight local poke
const PROXIMITY = 150; // px around the card within which "hovering near" starts the bend
const RIPPLE = 0.015; // ambient wobble — keep LOW (this is the "liquid" amount)
const EASE = 0.1; // mouse + hover easing, lower = slower settle
/* ========================================================================== */

const FOV = 45;

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 uMouse;
uniform float uHover;
uniform float uTime;
uniform float uStrength;
uniform float uFalloff;
uniform float uRipple;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  float d = distance(uv, uMouse);
  float falloff = exp(-d * d * uFalloff);        // soft gaussian leaning toward the cursor
  float bend = falloff * uHover * uStrength;       // vertex displacement = the bend
  float ripple = sin(uv.x * 9.0 + uTime * 1.4) * cos(uv.y * 9.0 + uTime * 1.1);
  pos.z += bend + ripple * uRipple * uHover;       // subtle ambient wobble on top
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uResolution;
uniform vec2 uImageSize;
varying vec2 vUv;
void main() {
  // object-fit: cover
  float rs = uResolution.x / uResolution.y;
  float ri = uImageSize.x / uImageSize.y;
  vec2 newSize = rs < ri
    ? vec2(uImageSize.x * uResolution.y / uImageSize.y, uResolution.y)
    : vec2(uResolution.x, uImageSize.y * uResolution.x / uImageSize.x);
  vec2 offset = (rs < ri
    ? vec2((newSize.x - uResolution.x) / 2.0, 0.0)
    : vec2(0.0, (newSize.y - uResolution.y) / 2.0)) / newSize;
  vec2 uv = vUv * uResolution / newSize + offset;
  gl_FragColor = texture2D(tMap, uv);
}
`;

type Props = { src: string; className?: string; children: ReactNode };

/**
 * Hello Monday-style "bend on hover". The image is a subdivided WebGL plane (OGL)
 * whose vertices displace toward the cursor with a soft gaussian falloff. The
 * cursor is tracked at the window level so the card bends as the pointer comes
 * NEAR it (within PROXIMITY px) — not only when directly over the image — and
 * leans toward the pointer as a whole panel.
 *
 * The `next/image` passed as children is the SSR base layer and the fallback for
 * reduced-motion, touch / no-hover, no-WebGL, and while the texture loads. The
 * render loop runs only while in view and near/easing, then stops; dpr ≤ 2.
 */
export default function BendImage({ src, className = "", children }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    // Fallbacks: keep the plain image for reduced-motion + touch / no-hover.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      let ogl: typeof import("ogl");
      try {
        ogl = await import("ogl");
      } catch {
        return;
      }
      if (disposed) return;
      const { Renderer, Camera, Transform, Plane, Program, Mesh, Texture, Vec2 } = ogl;

      let renderer: InstanceType<typeof Renderer>;
      try {
        renderer = new Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
      } catch {
        return;
      }
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const camera = new Camera(gl, { fov: FOV });
      camera.position.z = 0.5 / Math.tan((FOV * Math.PI) / 180 / 2); // plane height 1 fills

      const scene = new Transform();
      const texture = new Texture(gl);
      const geometry = new Plane(gl, {
        width: 1,
        height: 1,
        widthSegments: SEGMENTS,
        heightSegments: SEGMENTS,
      });
      const program = new Program(gl, {
        vertex,
        fragment,
        transparent: true,
        uniforms: {
          tMap: { value: texture },
          uMouse: { value: new Vec2(0.5, 0.5) },
          uHover: { value: 0 },
          uTime: { value: 0 },
          uResolution: { value: new Vec2(1, 1) },
          uImageSize: { value: new Vec2(1, 1) },
          uStrength: { value: STRENGTH },
          uFalloff: { value: FALLOFF },
          uRipple: { value: RIPPLE },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });
      mesh.setParent(scene);

      let texStarted = false;
      let ready = false;
      const loadTexture = () => {
        if (texStarted) return;
        texStarted = true;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.src = `/_next/image?url=${encodeURIComponent(src)}&w=1280&q=75`;
        img.onload = () => {
          if (disposed) return;
          texture.image = img;
          program.uniforms.uImageSize.value.set(img.naturalWidth, img.naturalHeight);
          ready = true;
          ensure();
        };
      };

      const resize = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h);
        camera.perspective({ aspect: w / h });
        mesh.scale.x = w / h;
        program.uniforms.uResolution.value.set(w, h);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // Window-level cursor → bend when NEAR the card, not only over the image.
      const cursor = { x: 0, y: 0, active: false };
      const target = new Vec2(0.5, 0.5);
      let targetHover = 0;
      let inView = true;
      let raf = 0;
      let running = false;

      const loop = (t: number) => {
        const u = program.uniforms;
        const r = el.getBoundingClientRect();
        let near = 0;
        if (cursor.active && inView && r.width > 0) {
          target.set((cursor.x - r.left) / r.width, 1 - (cursor.y - r.top) / r.height);
          const dx = Math.max(r.left - cursor.x, 0, cursor.x - r.right);
          const dy = Math.max(r.top - cursor.y, 0, cursor.y - r.bottom);
          near = 1 - Math.min(Math.hypot(dx, dy) / PROXIMITY, 1);
        }
        targetHover = near;

        u.uMouse.value.x += (target.x - u.uMouse.value.x) * EASE;
        u.uMouse.value.y += (target.y - u.uMouse.value.y) * EASE;
        u.uHover.value += (targetHover - u.uHover.value) * EASE;
        u.uTime.value = t * 0.001;

        if (u.uHover.value > 0.001) renderer.render({ scene, camera });
        canvas.style.opacity = String(Math.min(1, u.uHover.value));

        if (targetHover < 0.001 && u.uHover.value < 0.002) {
          running = false;
          canvas.style.opacity = "0";
          return;
        }
        raf = requestAnimationFrame(loop);
      };

      const ensure = () => {
        if (ready && inView && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        }
      };

      const onMove = (e: PointerEvent) => {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
        cursor.active = true;
        ensure();
      };
      const onOut = () => {
        cursor.active = false;
        ensure();
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onOut);

      const io = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView) {
            loadTexture();
            ensure();
          }
        },
        { rootMargin: "200px" },
      );
      io.observe(el);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onOut);
        const ext = gl.getExtension("WEBGL_lose_context");
        ext?.loseContext();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [src]);

  return (
    <div ref={wrap} className={className}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full opacity-0"
      />
    </div>
  );
}
