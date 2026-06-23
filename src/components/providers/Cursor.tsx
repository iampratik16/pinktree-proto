"use client";

import { useEffect, useRef } from "react";

/**
 * Minimal bespoke cursor: a small rosewood-ringed disc that lerps toward the
 * pointer and expands over interactive elements. Fine-pointer devices only;
 * fully disabled under reduced motion. Native cursor stays as a fallback.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    const el = ref.current;
    if (!el) return;

    document.documentElement.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let x = mouseX;
    let y = mouseY;
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      const interactive = (e.target as HTMLElement)?.closest(
        "a, button, [role='button'], input, textarea, select, label, [data-cursor='grow']",
      );
      el.dataset.active = interactive ? "true" : "false";
    };

    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };

    const tick = () => {
      x += (mouseX - x) * 0.18;
      y += (mouseY - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return <div ref={ref} aria-hidden className="cursor-dot" />;
}
