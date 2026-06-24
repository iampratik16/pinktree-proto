"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { getBlur } from "@/lib/media";
import type { VideoMedia } from "@/content/schema";

// ── Tunable constants ────────────────────────────────────────────────────────
const SEGMENTS = 48; // mesh resolution for smooth liquid deformation
const STRENGTH = 0.55; // depth of the cursor bulge + ripple (z displacement)
const REFRACT = 0.05; // liquid UV refraction amount in the fragment
const EASE = 0.08; // cursor + hover easing

// VERTEX — the plane is a fluid surface. A soft bulge rises toward the cursor and
// concentric ripples radiate from it (this is the HERO video, so geometric
// bending IS wanted). Everything is anchored to the cursor, not a marching grid.
const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform vec2 uMouse;     // 0..1, eased
  uniform float uHover;    // 0..1, eased
  uniform float uTime;
  uniform float uStrength;
  varying vec2 vUv;
  varying float vDisp;

  void main() {
    vUv = uv;
    vec3 pos = position;

    vec2 d = uv - uMouse;
    float dist = length(d);
    float bulge = exp(-dist * dist * 8.0);                       // lump under the cursor
    float ripple = sin(dist * 22.0 - uTime * 3.0) * exp(-dist * dist * 6.0); // liquid rings
    float disp = uHover * uStrength * (bulge * 0.65 + ripple * 0.35);

    pos.z += disp;
    vDisp = disp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// FRAGMENT — cover-fit video sample with a liquid refraction lens around the
// cursor and a faint specular lift on the ripple crests for a wet look.
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2 uImageSize;
  uniform vec2 uPlaneSize;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform float uRefract;
  varying vec2 vUv;
  varying float vDisp;

  void main() {
    vec2 ratio = vec2(
      min((uPlaneSize.x / uPlaneSize.y) / (uImageSize.x / uImageSize.y), 1.0),
      min((uPlaneSize.y / uPlaneSize.x) / (uImageSize.y / uImageSize.x), 1.0)
    );
    vec2 uv = (vUv - 0.5) * ratio + 0.5;

    vec2 d = vUv - uMouse;
    float dist = length(d);
    float lens = uHover * exp(-dist * dist * 7.0);
    uv += normalize(d + 1e-5) * lens * uRefract * sin(dist * 22.0 - uTime * 3.0);

    vec3 col = texture2D(tMap, uv).rgb;
    col += vDisp * 0.22; // crest highlight
    gl_FragColor = vec4(col, 1.0);
  }
`;

type Props = {
  media: VideoMedia;
  className?: string;
  sizes?: string;
};

/**
 * Hero ambient video on a WebGL fluid surface: a soft bulge and liquid ripples
 * follow the cursor while the muted loop plays as the texture. The poster paints
 * instantly (LCP); the canvas fades in once the video is playing. Falls back to a
 * plain <video> on touch / no-WebGL and to the poster under reduced-motion,
 * Save-Data or on small screens.
 */
export default function BendVideo({ media, className = "", sizes = "100vw" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [posterOnly, setPosterOnly] = useState(false);
  const [playing, setPlaying] = useState(false);
  const blur = getBlur(media.poster);

  // Poster-only under reduced motion or Data-Saver. The video DOES play on
  // phones (plain autoplay loop — muted + playsInline); WebGL bend is desktop-
  // only (the hover check below short-circuits on touch).
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (reduced || nav.connection?.saveData === true) setPosterOnly(true);
  }, []);

  // WebGL fluid bend (desktop, hover-capable). Uses the <video> as the texture.
  useEffect(() => {
    if (posterOnly) return;
    const wrap = wrapRef.current;
    const mount = mountRef.current;
    const video = videoRef.current;
    if (!wrap || !mount || !video) return;
    if (window.matchMedia("(hover: none)").matches) return; // touch → plain video

    let disposed = false;
    let cleanup = () => {};

    const boot = () =>
      import("ogl")
      .then(({ Renderer, Camera, Transform, Plane, Program, Mesh, Texture }) => {
        if (disposed || !wrapRef.current) return;

        let renderer: InstanceType<typeof Renderer>;
        try {
          // Cap dpr at 1.5: the ambient video surface re-uploads a full frame
          // every tick, so a smaller backing store keeps the hero buttery while
          // scrolling past, with no visible quality loss on a moving texture.
          renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5) });
        } catch {
          return; // no WebGL → plain <video> remains visible
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
        const geometry = new Plane(gl, { width: 1, height: 1, widthSegments: SEGMENTS, heightSegments: SEGMENTS });
        const texture = new Texture(gl, { generateMipmaps: false });
        const program = new Program(gl, {
          vertex,
          fragment,
          uniforms: {
            tMap: { value: texture },
            uImageSize: { value: [media.width, media.height] },
            uPlaneSize: { value: [1, 1] },
            uMouse: { value: [0.5, 0.5] },
            uHover: { value: 0 },
            uTime: { value: 0 },
            uStrength: { value: STRENGTH },
            uRefract: { value: REFRACT },
          },
        });
        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        const resize = () => {
          const rect = wrap.getBoundingClientRect();
          const w = Math.max(1, rect.width);
          const h = Math.max(1, rect.height);
          renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
          renderer.setSize(w, h);
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          camera.perspective({ aspect: w / h });
          const viewH = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
          // Overscan the plane (×1.12) so cursor ripples near the edges never
          // pull the surface in and reveal a gap.
          mesh.scale.set(viewH * (w / h) * 1.12, viewH * 1.12, 1);
          program.uniforms.uPlaneSize.value = [w, h];
        };

        const target = { x: 0.5, y: 0.5 };
        const current = { x: 0.5, y: 0.5 };
        let targetHover = 0;
        let hover = 0;
        let time = 0;
        let raf = 0;
        let inView = true;
        let revealed = false;
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const loop = () => {
          if (disposed || !inView) {
            raf = 0;
            return;
          }
          // Pull the latest decoded video frame into the texture.
          if (video.readyState >= 2) {
            texture.image = video;
            texture.needsUpdate = true;
            if (video.videoWidth) program.uniforms.uImageSize.value = [video.videoWidth, video.videoHeight];
            if (!revealed) {
              revealed = true;
              canvas.style.opacity = "1";
              video.style.opacity = "0"; // hand off to the WebGL surface
            }
          }
          current.x = lerp(current.x, target.x, EASE);
          current.y = lerp(current.y, target.y, EASE);
          hover = lerp(hover, targetHover, EASE);
          time += 0.016;

          const u = program.uniforms;
          u.uMouse.value[0] = current.x;
          u.uMouse.value[1] = current.y;
          u.uHover.value = hover;
          u.uTime.value = time;
          renderer.render({ scene, camera });
          raf = requestAnimationFrame(loop);
        };
        const startLoop = () => {
          if (!raf && inView && !disposed) raf = requestAnimationFrame(loop);
        };

        // Track the cursor across the whole hero (window-level → works under the
        // scrim/headline too); hover fades out when the pointer leaves the area.
        const onMove = (e: PointerEvent) => {
          const r = wrap.getBoundingClientRect();
          const mx = (e.clientX - r.left) / r.width;
          const my = (e.clientY - r.top) / r.height;
          target.x = mx;
          target.y = 1 - my;
          targetHover = mx >= 0 && mx <= 1 && my >= 0 && my <= 1 ? 1 : 0;
        };
        window.addEventListener("pointermove", onMove, { passive: true });

        const io = new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
            if (inView) {
              video.play().catch(() => {});
              startLoop();
            } else {
              video.pause();
            }
          },
          { rootMargin: "0px" },
        );
        io.observe(wrap);

        const ro = new ResizeObserver(resize);
        ro.observe(wrap);

        const onLost = (e: Event) => {
          e.preventDefault();
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
          video.style.opacity = "1"; // fall back to the plain video
        };
        canvas.addEventListener("webglcontextlost", onLost, false);

        resize();
        video.play().catch(() => {});
        startLoop();

        cleanup = () => {
          if (raf) cancelAnimationFrame(raf);
          io.disconnect();
          ro.disconnect();
          window.removeEventListener("pointermove", onMove);
          canvas.removeEventListener("webglcontextlost", onLost);
          gl.getExtension("WEBGL_lose_context")?.loseContext();
          if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
          video.style.opacity = "";
        };
      })
      .catch(() => {});

    // Boot the WebGL surface on idle so it never competes with hydration, the
    // LCP poster paint, or the first scroll frame (the poster shows meanwhile).
    let idle = 0;
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(() => boot(), { timeout: 1200 });
    } else {
      idle = window.setTimeout(() => boot(), 300);
    }

    return () => {
      disposed = true;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cleanup();
    };
  }, [posterOnly, media.width, media.height]);

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      {/* Poster — instant paint / LCP and the reduced-motion fallback. */}
      <NextImage
        src={media.poster}
        alt={media.alt}
        fill
        sizes={sizes}
        priority
        placeholder={blur ? "blur" : "empty"}
        blurDataURL={blur}
        className={`object-cover transition-opacity duration-700 ${playing ? "opacity-0" : "opacity-100"}`}
      />

      {/* Plain looping video — fallback on touch / no-WebGL; texture source +
          hidden behind the canvas when the WebGL surface is live. */}
      {!posterOnly && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden
          onPlaying={() => setPlaying(true)}
          className="absolute inset-0 size-full object-cover transition-opacity duration-500"
        >
          {media.sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}

      {/* WebGL fluid surface mounts here. */}
      <div ref={mountRef} aria-hidden className="pointer-events-none absolute inset-0" />
    </div>
  );
}
