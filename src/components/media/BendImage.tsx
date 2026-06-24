"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* ============================================================================
   Tunable values — adjust the bend here.
   ========================================================================== */
const SEGMENTS = 40; // mesh resolution, higher = smoother bend
const STRENGTH = 0.55; // bend depth toward the cursor
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
uniform float uRipple;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  float d = distance(uv, uMouse);
  float falloff = exp(-d * d * 12.0);          // soft gaussian around the cursor
  float bend = falloff * uHover * uStrength;     // vertex displacement toward cursor
  float ripple = sin(uv.x * 9.0 + uTime * 1.4) * cos(uv.y * 9.0 + uTime * 1.1);
  pos.z += bend + ripple * uRipple * uHover;     // subtle ambient wobble on top
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
 * Hello Monday-style "bend on hover". The image is rendered on a subdivided
 * WebGL plane (OGL); a vertex shader displaces vertices toward the eased cursor
 * with a soft gaussian falloff, so the surface and edges flex as the pointer
 * moves over it. A faint ambient ripple (RIPPLE, kept low) adds life, not water.
 *
 * The `next/image` passed as children is the SSR base layer and the fallback for
 * reduced-motion, touch / no-hover, no-WebGL, and while the texture loads. The
 * render loop runs only while the card is in view and hovered (or still easing
 * back), then stops; dpr is capped at 2.
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
        return; // no WebGL lib → keep the static image
      }
      if (disposed) return;
      const { Renderer, Camera, Transform, Plane, Program, Mesh, Texture, Vec2 } = ogl;

      let renderer;
      try {
        renderer = new Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
      } catch {
        return; // WebGL unavailable
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
          uRipple: { value: RIPPLE },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });
      mesh.setParent(scene);

      // Lazy-load an optimised texture once the card nears the viewport.
      let texStarted = false;
      let ready = false;
      const loadTexture = () => {
        if (texStarted) return;
        texStarted = true;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        // w must be one of next.config images.deviceSizes (1280 is configured).
        img.src = `/_next/image?url=${encodeURIComponent(src)}&w=1280&q=75`;
        img.onload = () => {
          if (disposed) return;
          texture.image = img;
          program.uniforms.uImageSize.value.set(img.naturalWidth, img.naturalHeight);
          ready = true;
          if (hovering) start();
        };
      };

      const resize = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h);
        camera.perspective({ aspect: w / h });
        mesh.scale.x = w / h; // fill horizontally, plane height stays 1
        program.uniforms.uResolution.value.set(w, h);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      const target = new Vec2(0.5, 0.5);
      let targetHover = 0;
      let hovering = false;
      let inView = true;

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      };
      const onEnter = () => {
        hovering = true;
        targetHover = 1;
        if (ready) start();
        else loadTexture();
      };
      const onLeave = () => {
        hovering = false;
        targetHover = 0;
        start(); // run the ease-back, then the loop stops itself
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);

      const io = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView) loadTexture();
          else {
            hovering = false;
            targetHover = 0;
          }
        },
        { rootMargin: "200px" },
      );
      io.observe(el);

      let raf = 0;
      let running = false;
      const loop = (t: number) => {
        const u = program.uniforms;
        u.uMouse.value.x += (target.x - u.uMouse.value.x) * EASE;
        u.uMouse.value.y += (target.y - u.uMouse.value.y) * EASE;
        u.uHover.value += (targetHover - u.uHover.value) * EASE;
        u.uTime.value = t * 0.001;
        renderer.render({ scene, camera });
        canvas.style.opacity = String(Math.min(1, u.uHover.value));
        // stop once eased back so we don't burn frames at rest
        if (targetHover === 0 && u.uHover.value < 0.002) {
          running = false;
          canvas.style.opacity = "0";
          return;
        }
        raf = requestAnimationFrame(loop);
      };
      const start = () => {
        if (running || !ready || !inView) return;
        running = true;
        raf = requestAnimationFrame(loop);
      };

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
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
    // The caller's className positions + sizes this wrapper (e.g. "absolute
    // inset-0 …"); do not set inline position here or it would override that and
    // collapse the box (the children are fill/absolute and add no height).
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
