"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* ============================================================================
   Tunable values — adjust the bend here.
   ========================================================================== */
const MESH_SUBDIVISIONS = 20; // grid resolution of the plane (vertices per side)
const BEND_STRENGTH = 0.3; // how far the mesh bends toward the cursor (world units; low)
const MOUSE_EASING = 0.1; // cursor lerp (0.08–0.12) — higher = snappier
const HOVER_EASING = 0.09; // fade the effect in/out
const RIPPLE_AMPLITUDE = 0.012; // faint wavy edges in the vertex bend (near zero)
const RIPPLE_UV = 0.0015; // faint surface ripple in the texture sample (near zero)
/* ========================================================================== */

const CAMERA_Z = 5;
const FOV = 45;

const VERT = /* glsl */ `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 uMouse;   // -1..1 within the card
uniform float uHover;  // 0..1
uniform float uBend;
uniform float uRipple;
uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  vec2 np = uv * 2.0 - 1.0;
  float d = distance(np, uMouse);
  // localized push near the cursor + a gentle overall tilt toward it = the bend
  float push = 1.0 - smoothstep(0.0, 1.5, d);
  p.z += push * uBend * uHover;
  p.z += dot(np, uMouse) * uBend * 0.22 * uHover;
  // faint wavy edges
  p.z += (sin(np.x * 6.2831 + uTime) + cos(np.y * 5.0 + uTime * 1.2)) * uRipple * uHover;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uCover;     // object-fit: cover correction
uniform float uRippleUV; // near-zero surface ripple
uniform float uHover;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 uv = vUv * uCover + (1.0 - uCover) * 0.5;
  uv.x += sin(vUv.y * 18.0 + uTime) * uRippleUV * uHover;
  uv.y += cos(vUv.x * 18.0 + uTime) * uRippleUV * uHover;
  gl_FragColor = texture2D(tMap, uv);
}`;

type Props = { src: string; className?: string; children: ReactNode };

/**
 * Hello Monday-style mesh "bend": the image is rendered on a subdivided WebGL
 * plane (OGL) whose vertices displace toward the eased cursor, bending the card
 * with gentle wavy edges and only a hint of surface ripple. The `next/image`
 * passed as children is the base layer and the fallback for reduced-motion,
 * touch, no-WebGL, and while the texture loads. The render loop runs only while
 * hovered + in view, and stops once the bend settles.
 */
export default function BendImage({ src, className = "", children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    // Opt-outs: reduced motion + coarse pointers fall back to the static image.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      let ogl;
      try {
        ogl = await import("ogl");
      } catch {
        return; // no WebGL lib → keep static image
      }
      if (disposed) return;
      const { Renderer, Camera, Transform, Plane, Program, Mesh, Texture, Vec2 } = ogl;

      let renderer;
      try {
        renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: true, antialias: true });
      } catch {
        return; // WebGL unavailable
      }
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const camera = new Camera(gl, { fov: FOV });
      camera.position.z = CAMERA_Z;
      const scene = new Transform();

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        transparent: true,
        uniforms: {
          tMap: { value: new Texture(gl) },
          uMouse: { value: new Vec2(0, 0) },
          uCover: { value: new Vec2(1, 1) },
          uHover: { value: 0 },
          uBend: { value: BEND_STRENGTH },
          uRipple: { value: RIPPLE_AMPLITUDE },
          uRippleUV: { value: RIPPLE_UV },
          uTime: { value: 0 },
        },
      });

      const geometry = new Plane(gl, {
        width: 1,
        height: 1,
        widthSegments: MESH_SUBDIVISIONS,
        heightSegments: MESH_SUBDIVISIONS,
      });
      const mesh = new Mesh(gl, { geometry, program });
      mesh.setParent(scene);

      const visibleHeight = 2 * Math.tan((FOV * Math.PI) / 180 / 2) * CAMERA_Z;

      const setCover = (iw: number, ih: number, w: number, h: number) => {
        const planeA = w / h;
        const imageA = iw / ih;
        program.uniforms.uCover.value.set(
          Math.min(planeA / imageA, 1),
          Math.min(imageA / planeA, 1),
        );
      };

      let imgW = 1;
      let imgH = 1;
      const resize = () => {
        const r = wrap.getBoundingClientRect();
        const w = Math.max(1, r.width);
        const h = Math.max(1, r.height);
        renderer.setSize(w, h);
        camera.perspective({ aspect: w / h });
        mesh.scale.set(visibleHeight * (w / h), visibleHeight, 1);
        setCover(imgW, imgH, w, h);
      };

      // Load the texture (smaller, optimised) once the card is near the viewport.
      let ready = false;
      let texStarted = false;
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
          program.uniforms.tMap.value.image = img;
          imgW = img.naturalWidth;
          imgH = img.naturalHeight;
          const r = wrap.getBoundingClientRect();
          setCover(imgW, imgH, r.width, r.height);
          ready = true;
          if (hovering) start();
        };
      };

      // State
      let hovering = false;
      let raf = 0;
      let running = false;
      let hover = 0;
      let hoverTarget = 0;
      const mouse = new Vec2(0, 0);
      const mouseTarget = new Vec2(0, 0);

      const loop = (t: number) => {
        hover += (hoverTarget - hover) * HOVER_EASING;
        mouse.x += (mouseTarget.x - mouse.x) * MOUSE_EASING;
        mouse.y += (mouseTarget.y - mouse.y) * MOUSE_EASING;
        program.uniforms.uHover.value = hover;
        program.uniforms.uMouse.value.set(mouse.x, mouse.y);
        program.uniforms.uTime.value = t * 0.001;
        renderer.render({ scene, camera });
        canvas.style.opacity = String(Math.min(1, hover));
        if (hoverTarget === 0 && hover < 0.002) {
          running = false;
          canvas.style.opacity = "0";
          return;
        }
        raf = requestAnimationFrame(loop);
      };
      const start = () => {
        if (running || !ready) return;
        running = true;
        raf = requestAnimationFrame(loop);
      };

      const onEnter = () => {
        hovering = true;
        hoverTarget = 1;
        if (ready) start();
        else loadTexture();
      };
      const onLeave = () => {
        hovering = false;
        hoverTarget = 0;
        start(); // ensure the settle-out runs
      };
      const onMove = (e: MouseEvent) => {
        const r = wrap.getBoundingClientRect();
        mouseTarget.set(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -(((e.clientY - r.top) / r.height) * 2 - 1),
        );
      };

      wrap.addEventListener("mouseenter", onEnter);
      wrap.addEventListener("mouseleave", onLeave);
      wrap.addEventListener("mousemove", onMove);

      const ro = new ResizeObserver(resize);
      ro.observe(wrap);

      // Preload texture + pause when off-screen.
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) loadTexture();
            else {
              hovering = false;
              hoverTarget = 0;
            }
          }
        },
        { rootMargin: "200px" },
      );
      io.observe(wrap);

      resize();

      cleanup = () => {
        cancelAnimationFrame(raf);
        wrap.removeEventListener("mouseenter", onEnter);
        wrap.removeEventListener("mouseleave", onLeave);
        wrap.removeEventListener("mousemove", onMove);
        ro.disconnect();
        io.disconnect();
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
    <div ref={wrapRef} className={className}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full opacity-0"
      />
    </div>
  );
}
