"use client";

import { useEffect, useRef } from "react";

/** Trail follow speed. Higher = snappier; 1 = locked to the cursor. */
const EASE = 0.2;

/**
 * A "View" disc that follows the cursor within its positioned parent (the card's
 * media box) — Collins / Cuberto style — instead of sitting centred. Fades in on
 * enter, eases toward the pointer, fades out on leave. Hover-capable pointers only.
 *
 * The eased trail is done in JS (a lerp in one rAF), NOT with a CSS transition.
 * A `transition: transform` that is re-targeted on every pointermove makes the
 * browser restart a fresh interpolation ~60×/second, so the disc never catches
 * up and feels laggy and stuck — badly so in Safari, which can respawn a
 * compositor animation per re-target. Writing the eased value directly each
 * frame is both smoother and cheaper.
 *
 * The layer is promoted only while the disc is actually moving, so the large
 * soft box-shadow rasterises once instead of every frame, and the parent's box
 * is cached so a fast pointer never forces a synchronous layout.
 */
export default function CursorViewLabel({ label = "View" }: { label?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // target vs current (eased) state
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let tScale = 0.6;
    let cScale = 0.6;
    let tOpacity = 0;
    let cOpacity = 0;
    let raf = 0;

    let box = parent.getBoundingClientRect();
    const remeasure = () => {
      box = parent.getBoundingClientRect();
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const write = () => {
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) scale(${cScale})`;
      el.style.opacity = String(cOpacity);
    };

    const loop = () => {
      const e = reduced ? 1 : EASE;
      cx = lerp(cx, tx, e);
      cy = lerp(cy, ty, e);
      cScale = lerp(cScale, tScale, e);
      cOpacity = lerp(cOpacity, tOpacity, e);
      write();

      const settled =
        Math.abs(cx - tx) < 0.1 &&
        Math.abs(cy - ty) < 0.1 &&
        Math.abs(cScale - tScale) < 0.002 &&
        Math.abs(cOpacity - tOpacity) < 0.01;

      if (settled) {
        // Snap to exact target, drop the compositor hint and stop: an idle disc
        // must cost nothing and must not hold a promoted layer per card.
        cx = tx;
        cy = ty;
        cScale = tScale;
        cOpacity = tOpacity;
        write();
        el.style.willChange = "auto";
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf) return;
      el.style.willChange = "transform, opacity";
      raf = requestAnimationFrame(loop);
    };

    const onEnter = (e: PointerEvent) => {
      remeasure();
      tx = e.clientX - box.left;
      ty = e.clientY - box.top;
      // Appear at the cursor instead of flying in from wherever it last sat.
      cx = tx;
      cy = ty;
      tScale = 1;
      tOpacity = 1;
      start();
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX - box.left;
      ty = e.clientY - box.top;
      start();
    };
    const onLeave = () => {
      tScale = 0.6;
      tOpacity = 0;
      start();
    };

    parent.addEventListener("pointerenter", onEnter);
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    // The card moves with scroll/resize only — cheap to refresh there rather
    // than measuring on every pointer event.
    window.addEventListener("scroll", remeasure, { passive: true });
    window.addEventListener("resize", remeasure);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      parent.removeEventListener("pointerenter", onEnter);
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", remeasure);
      window.removeEventListener("resize", remeasure);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-[4] grid size-[clamp(4.5rem,6vw,5.75rem)] place-items-center rounded-full bg-(--color-paper)/95 text-xs uppercase tracking-[0.16em] text-(--color-ink) opacity-0 shadow-[0_10px_40px_rgba(20,17,15,0.28)]"
      style={{ transform: "translate3d(0,0,0) translate(-50%,-50%) scale(0.6)" }}
    >
      {label}
    </span>
  );
}
