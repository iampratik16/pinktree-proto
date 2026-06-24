"use client";

import { useEffect, useRef } from "react";

// ── Tunable constants (kept subtle for the Atelier look) ─────────────────────
const SEGMENTS = 48; // mesh resolution (vertices per side)
const STRENGTH = 0.18; // lean-toward-cursor amount
const RIPPLE = 0.06; // edge wave amount
const EASE = 0.1; // lerp smoothing for mouse + hover

// Centre-weighted bend: displacement is ~0 in the middle and grows toward the
// edges, so the subject stays put while only the border region flexes. The whole
// panel also leans toward the cursor, pivoting about the centre (z stays 0 there).
const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform vec2 uMouse;     // cursor in 0..1, eased
  uniform float uHover;    // 0..1, eased
  uniform float uTime;
  uniform float uStrength; // STRENGTH: lean toward cursor
  uniform float uRipple;   // RIPPLE: edge wave amount
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    vec2 c = uv - 0.5;          // centre = 0, edges grow outward
    vec2 m = uMouse - 0.5;      // cursor relative to centre

    // edge weight: ~0 in the middle, ~1 toward the corners.
    // this is what keeps the subject in the centre fixed.
    float edge = clamp(dot(c, c) * 4.0, 0.0, 1.0);

    // lean the whole panel toward the cursor. it pivots about the centre,
    // so the centre stays at z = 0 and the subject does not move.
    float tilt = dot(c, m) * 2.0;

    // travelling wave for the organic, liquid border motion.
    float wave = sin(c.x * 7.0 + uTime * 1.3) * cos(c.y * 7.0 + uTime * 1.1);

    pos.z += uHover * (tilt * uStrength + edge * wave * uRipple);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Cover-fit fragment shader (object-fit: cover, never stretched).
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2 uImageSize;
  uniform vec2 uPlaneSize;
  varying vec2 vUv;

  void main() {
    vec2 ratio = vec2(
      min((uPlaneSize.x / uPlaneSize.y) / (uImageSize.x / uImageSize.y), 1.0),
      min((uPlaneSize.y / uPlaneSize.x) / (uImageSize.y / uImageSize.x), 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    gl_FragColor = texture2D(tMap, uv);
  }
`;

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** sizes hint for the static base <img>. */
  sizes?: string;
};

/** Route the texture + base layer through Next's image optimiser (AVIF/WebP). */
function optimized(src: string, w = 1280, q = 75) {
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}`;
}

/**
 * Hello Monday-style "bend on hover" for work-card imagery.
 *
 * A subdivided WebGL plane (OGL) flexes toward the cursor: the EDGES wave while
 * the centred subject stays effectively fixed (see the centre-weighted vertex
 * shader above). A static <img> renders underneath as the base layer, so there
 * is no flash, no-JS works, and any edge gap from the lean shows the real image.
 *
 * Falls back to the plain <img> only (no WebGL) for prefers-reduced-motion and
 * for touch / non-hover devices.
 */
export default function BendImage({ src, alt, className = "", sizes }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const mount = mountRef.current;
    if (!wrap || !mount) return;

    // Fallbacks: skip WebGL entirely → the static base <img> is all that shows.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    if (reduced || noHover) return;

    let disposed = false;
    let cleanup = () => {};

    // Code-split OGL out of the critical path.
    import("ogl")
      .then(({ Renderer, Camera, Transform, Plane, Program, Mesh, Texture }) => {
        if (disposed || !wrapRef.current) return;

        let renderer: InstanceType<typeof Renderer>;
        try {
          renderer = new Renderer({
            alpha: true,
            antialias: true,
            dpr: Math.min(window.devicePixelRatio || 1, 2), // cap dpr at 2
          });
        } catch {
          return; // no WebGL → base <img> remains
        }

        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);

        const canvas = gl.canvas as HTMLCanvasElement;
        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.opacity = "0";
        canvas.style.transition = "opacity 0.6s ease";
        mount.appendChild(canvas);

        const camera = new Camera(gl, { fov: 45 });
        camera.position.z = 5;

        const scene = new Transform();
        const geometry = new Plane(gl, {
          width: 1,
          height: 1,
          widthSegments: SEGMENTS,
          heightSegments: SEGMENTS,
        });

        const texture = new Texture(gl, { generateMipmaps: false });
        const program = new Program(gl, {
          vertex,
          fragment,
          transparent: true,
          uniforms: {
            tMap: { value: texture },
            uImageSize: { value: [1, 1] },
            uPlaneSize: { value: [1, 1] },
            uMouse: { value: [0.5, 0.5] },
            uHover: { value: 0 },
            uTime: { value: 0 },
            uStrength: { value: STRENGTH },
            uRipple: { value: RIPPLE },
          },
        });

        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        // Fit the plane to exactly fill the perspective frustum at z = 0.
        const resize = () => {
          const rect = wrap.getBoundingClientRect();
          const w = Math.max(1, rect.width);
          const h = Math.max(1, rect.height);
          renderer.setSize(w, h);
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          camera.perspective({ aspect: w / h });
          const viewH = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
          const viewW = viewH * (w / h);
          mesh.scale.set(viewW, viewH, 1);
          program.uniforms.uPlaneSize.value = [w, h];
        };

        const render = () => renderer.render({ scene, camera });

        // ── Eased interaction state ──────────────────────────────────────────
        const target = { x: 0.5, y: 0.5 };
        const current = { x: 0.5, y: 0.5 };
        let targetHover = 0;
        let hover = 0;
        let time = 0;
        let raf = 0;
        let running = false;
        let inView = true;
        let loaded = false;

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const frame = () => {
          current.x = lerp(current.x, target.x, EASE);
          current.y = lerp(current.y, target.y, EASE);
          hover = lerp(hover, targetHover, EASE);
          time += 0.016;

          const u = program.uniforms;
          u.uMouse.value[0] = current.x;
          u.uMouse.value[1] = current.y;
          u.uHover.value = hover;
          u.uTime.value = time;
          render();

          // Keep rendering while active or still easing back to rest.
          const settled =
            hover < 0.001 &&
            Math.abs(hover - targetHover) < 0.001 &&
            Math.abs(current.x - target.x) < 0.001 &&
            Math.abs(current.y - target.y) < 0.001;

          if (inView && !settled) {
            raf = requestAnimationFrame(frame);
          } else {
            running = false;
          }
        };

        const start = () => {
          if (running || !inView || !loaded) return;
          running = true;
          raf = requestAnimationFrame(frame);
        };

        // ── Pointer (normalised to the wrap; y flipped to match plane uv) ─────
        const onMove = (e: PointerEvent) => {
          const rect = wrap.getBoundingClientRect();
          target.x = (e.clientX - rect.left) / rect.width;
          target.y = 1 - (e.clientY - rect.top) / rect.height;
          start();
        };
        const onEnter = () => {
          targetHover = 1;
          start();
        };
        const onLeave = () => {
          targetHover = 0;
          target.x = 0.5;
          target.y = 0.5;
          start();
        };
        wrap.addEventListener("pointerenter", onEnter);
        wrap.addEventListener("pointermove", onMove);
        wrap.addEventListener("pointerleave", onLeave);

        // Render only while in view; pause otherwise.
        const io = new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
            if (inView) start();
          },
          { rootMargin: "100px" },
        );
        io.observe(wrap);

        const ro = new ResizeObserver(() => {
          resize();
          if (!running && loaded) render();
        });
        ro.observe(wrap);

        // Load the texture, then reveal the canvas with a flat (resting) frame
        // that is pixel-identical to the base <img> underneath (no flash).
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.onload = () => {
          if (disposed) return;
          texture.image = img;
          program.uniforms.uImageSize.value = [img.naturalWidth, img.naturalHeight];
          loaded = true;
          resize();
          render();
          canvas.style.opacity = "1";
        };
        img.src = optimized(src);

        resize();

        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          ro.disconnect();
          wrap.removeEventListener("pointerenter", onEnter);
          wrap.removeEventListener("pointermove", onMove);
          wrap.removeEventListener("pointerleave", onLeave);
          img.onload = null;
          gl.getExtension("WEBGL_lose_context")?.loseContext();
          if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
        };
      })
      .catch(() => {
        /* OGL failed to load → base <img> remains */
      });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={`relative size-full ${className}`}>
      {/* Static base layer: no flash, no-JS friendly, fills any edge gap. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimized(src)}
        alt={alt}
        sizes={sizes}
        draggable={false}
        className="absolute inset-0 size-full object-cover"
      />
      {/* WebGL canvas mounts here and fades in over the base image. */}
      <div ref={mountRef} aria-hidden className="pointer-events-none absolute inset-0" />
    </div>
  );
}
