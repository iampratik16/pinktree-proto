"use client";

import { useEffect, useRef } from "react";

// ── Tunable constants (kept subtle for the Atelier look) ─────────────────────
const AMP = 0.07; // bulge depth — how far the nearest edge dents toward the cursor
const PROX = 1.6; // how tightly the bulge concentrates near the cursor's Y (higher = tighter)
const OVERSCAN = 0.15; // static image zoom so bulges have content; image stays undistorted
const EASE = 0.1; // mouse + hover easing

// VERTEX — pass-through ONLY. No displacement of position from mouse/time/z.
// This is what guarantees the image geometry never bends, skews or warps.
const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// FRAGMENT — the image is sampled at FIXED uv (cover-fit + a constant centre
// zoom). The cursor NEVER touches imgUv, so the picture cannot move or distort.
// Only the ALPHA MASK reads the cursor: it dents whichever EDGE(S) the pointer
// is nearest — left, right, top or bottom — with a single localised bulge that
// follows the pointer (arbitrary, NOT a periodic wave). Hovering from the top
// bends the top edge; from the side, that side. The image itself stays fixed.
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2 uImageSize;
  uniform vec2 uPlaneSize;
  uniform vec2 uMouse;     // cursor 0..1, eased (y is flipped to uv space)
  uniform float uHover;    // 0..1, eased
  uniform float uAmp;
  uniform float uProx;
  uniform float uOverscan;
  varying vec2 vUv;

  const float FEATHER = 0.004; // soft mask edge (anti-alias)

  void main() {
    // ---- IMAGE (FIXED): cover-fit + constant centre zoom. No cursor input. ----
    // Guard: before the texture loads uImageSize is the plane size → plain fit
    // (ratio = 1), never a square crop.
    vec2 ratio = vec2(
      min((uPlaneSize.x / uPlaneSize.y) / (uImageSize.x / uImageSize.y), 1.0),
      min((uPlaneSize.y / uPlaneSize.x) / (uImageSize.y / uImageSize.x), 1.0)
    );
    vec2 coverUv = (vUv - 0.5) * ratio + 0.5;
    vec2 imgUv = (coverUv - 0.5) / (1.0 + uOverscan) + 0.5; // static zoom ONLY
    vec4 color = texture2D(tMap, imgUv);

    // ---- ALPHA MASK (MOVES): cursor-driven dents on EVERY edge. Each edge pulls
    // in by a localised bulge that follows the pointer; the nearer the cursor is
    // to an edge, the more it reacts. No clock-driven sine → arbitrary, not a
    // marching wave. (uMouse.y is flipped to uv space: 1 = top, 0 = bottom.)
    float dx = vUv.x - uMouse.x;
    float dy = vUv.y - uMouse.y;
    float bulgeY = uHover * uAmp * exp(-uProx * 9.0 * dy * dy); // varies down left/right edges
    float bulgeX = uHover * uAmp * exp(-uProx * 9.0 * dx * dx); // varies along top/bottom edges

    // How near the cursor is to each edge.
    float leftBias = smoothstep(0.7, 0.0, uMouse.x);
    float rightBias = smoothstep(0.3, 1.0, uMouse.x);
    float topBias = smoothstep(0.3, 1.0, uMouse.y);
    float bottomBias = smoothstep(0.7, 0.0, uMouse.y);

    float left = bulgeY * (0.2 + 0.8 * leftBias);
    float right = bulgeY * (0.2 + 0.8 * rightBias);
    float top = bulgeX * (0.2 + 0.8 * topBias);
    float bottom = bulgeX * (0.2 + 0.8 * bottomBias);

    // Opaque only inside the (dented) boundaries on all four sides.
    float aL = smoothstep(left - FEATHER, left + FEATHER, vUv.x);
    float aR = 1.0 - smoothstep(1.0 - right - FEATHER, 1.0 - right + FEATHER, vUv.x);
    float aB = smoothstep(bottom - FEATHER, bottom + FEATHER, vUv.y);
    float aT = 1.0 - smoothstep(1.0 - top - FEATHER, 1.0 - top + FEATHER, vUv.y);
    float alpha = color.a * aL * aR * aB * aT;

    gl_FragColor = vec4(color.rgb, alpha);
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

/** A same-origin /_next/image URL never needs CORS; absolute URLs to other
 *  origins do, for the WebGL texture upload. */
function isCrossOrigin(url: string) {
  return /^https?:\/\//i.test(url) && typeof location !== "undefined" && !url.startsWith(location.origin);
}

/**
 * Hello Monday-style liquid edge for work-card imagery.
 *
 * Technique: a static WebGL texture (sampled at FIXED uv) under a fragment-shader
 * ALPHA MASK. Only the mask's left/right boundaries wave (vertical sine driven by
 * cursor + time); the image never moves, scales, skews or warps. Top and bottom
 * edges stay straight. A static <img> is the SSR base layer (no flash, no-JS); it
 * is hidden once the canvas is live so the wavy edges reveal the page behind, and
 * it is re-revealed if the GL context is ever lost — the card can never go blank.
 *
 * The WebGL context is created lazily (on first approach to the viewport) and
 * torn down on unmount, with a webglcontextlost safety net, to stay well within
 * the browser's simultaneous-context cap. Falls back to the plain <img> for
 * prefers-reduced-motion and for touch / non-hover devices.
 */
export default function BendImage({ src, alt, className = "", sizes }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const mount = mountRef.current;
    const base = baseRef.current;
    if (!wrap || !mount) return;

    // Fallbacks: skip WebGL entirely → the static base <img> is all that shows.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    if (reduced || noHover) return;

    let disposed = false;
    let started = false; // GL init kicked off
    let inView = false;
    let teardown = () => {};
    let resume = () => {};

    const revealBase = () => {
      if (!base) return;
      base.style.transition = "opacity 0.4s ease";
      base.style.opacity = "1";
      base.style.transform = "none";
    };

    // Lazy: only spin up a WebGL context when the card nears the viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inView = true;
          if (!started) {
            started = true;
            init();
          } else {
            resume();
          }
        } else {
          inView = false; // pauses the RAF loop via the frame() guard
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(wrap);

    function init() {
      import("ogl")
        .then(({ Renderer, Camera, Transform, Plane, Program, Mesh, Texture }) => {
          if (disposed || !wrap || !mount) return;

          let renderer: InstanceType<typeof Renderer>;
          try {
            renderer = new Renderer({
              alpha: true,
              premultipliedAlpha: false, // straight alpha → clean transparent edges
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
          canvas.style.transition = "opacity 0.5s ease";
          mount.appendChild(canvas);

          // Pre-match the base <img> to the shader's overscan zoom (instant, no
          // transition) so the later reveal is an OPACITY-only cross-fade with no
          // double-image / scale ghost.
          if (base) base.style.transform = `scale(${1 + OVERSCAN})`;

          const camera = new Camera(gl, { fov: 45 });
          camera.position.z = 5;

          const scene = new Transform();
          // A mask needs no mesh resolution → a single quad.
          const geometry = new Plane(gl, { width: 1, height: 1, widthSegments: 1, heightSegments: 1 });

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
              uAmp: { value: AMP },
              uProx: { value: PROX },
              uOverscan: { value: OVERSCAN },
            },
          });

          const mesh = new Mesh(gl, { geometry, program });
          mesh.setParent(scene);

          // ── Eased interaction state ────────────────────────────────────────
          const target = { x: 0.5, y: 0.5 };
          const current = { x: 0.5, y: 0.5 };
          let targetHover = 0;
          let hover = 0;
          let raf = 0;
          let running = false;
          let loaded = false;

          // Fit the quad to exactly fill the perspective frustum at z = 0.
          const resize = () => {
            const rect = wrap.getBoundingClientRect();
            const w = Math.max(1, rect.width);
            const h = Math.max(1, rect.height);
            renderer.dpr = Math.min(window.devicePixelRatio || 1, 2); // re-read for zoom / monitor move
            renderer.setSize(w, h);
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            camera.perspective({ aspect: w / h });
            const viewH = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
            const viewW = viewH * (w / h);
            mesh.scale.set(viewW, viewH, 1);
            program.uniforms.uPlaneSize.value = [w, h];
            // Until the texture loads, keep image aspect == plane aspect → plain fit.
            if (!loaded) program.uniforms.uImageSize.value = [w, h];
          };

          const render = () => renderer.render({ scene, camera });
          const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

          const frame = () => {
            current.x = lerp(current.x, target.x, EASE);
            current.y = lerp(current.y, target.y, EASE);
            hover = lerp(hover, targetHover, EASE);

            const u = program.uniforms;
            u.uMouse.value[0] = current.x;
            u.uMouse.value[1] = current.y;
            u.uHover.value = hover;
            render();

            // Cursor-driven (no clock): render only until the eased values settle;
            // pointermove / enter / leave restart the loop. Saves frames at rest.
            const settled =
              Math.abs(hover - targetHover) < 0.002 &&
              Math.abs(current.x - target.x) < 0.0006 &&
              Math.abs(current.y - target.y) < 0.0006;
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
          resume = () => {
            if (targetHover > 0) start();
          };

          // ── Pointer (normalised to the wrap; y flipped to plane uv space) ───
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
            start();
          };
          wrap.addEventListener("pointerenter", onEnter);
          wrap.addEventListener("pointermove", onMove);
          wrap.addEventListener("pointerleave", onLeave);

          const ro = new ResizeObserver(() => {
            resize();
            if (!running && loaded) render();
          });
          ro.observe(wrap);

          // Safety net: if the browser drops this context (e.g. too many live
          // contexts), re-reveal the static <img> so the card never goes blank.
          const onLost = (e: Event) => {
            e.preventDefault();
            cancelAnimationFrame(raf);
            running = false;
            revealBase();
          };
          canvas.addEventListener("webglcontextlost", onLost, false);

          const disposeGL = () => {
            cancelAnimationFrame(raf);
            running = false;
            ro.disconnect();
            wrap.removeEventListener("pointerenter", onEnter);
            wrap.removeEventListener("pointermove", onMove);
            wrap.removeEventListener("pointerleave", onLeave);
            canvas.removeEventListener("webglcontextlost", onLost);
            gl.getExtension("WEBGL_lose_context")?.loseContext();
            if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
          };

          // Load the texture, render one resting frame (full-bleed, mask open),
          // then cross-fade canvas in / base out (opacity only — matched zoom).
          const img = new Image();
          if (isCrossOrigin(optimized(src))) img.crossOrigin = "anonymous";
          img.decoding = "async";
          img.onload = () => {
            if (disposed) return;
            texture.image = img;
            program.uniforms.uImageSize.value = [img.naturalWidth, img.naturalHeight];
            loaded = true;
            resize();
            render();
            canvas.style.opacity = "1";
            if (base) {
              base.style.transition = "opacity 0.5s ease";
              base.style.opacity = "0";
            }
          };
          // On a failed/blocked load: keep the base <img> and free the context slot.
          img.onerror = () => {
            if (disposed) return;
            revealBase();
            disposeGL();
          };
          img.src = optimized(src);

          resize();

          teardown = () => {
            img.onload = null;
            img.onerror = null;
            revealBase();
            disposeGL();
          };
        })
        .catch(() => {
          /* OGL failed to load → base <img> remains */
        });
    }

    return () => {
      disposed = true;
      io.disconnect();
      teardown();
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={`relative size-full ${className}`}>
      {/* Static base layer: SSR, no flash, no-JS friendly. Hidden once WebGL is
          live; re-revealed on context loss so the card can never go blank. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={baseRef}
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
