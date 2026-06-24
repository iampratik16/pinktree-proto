"use client";

import { useEffect, useRef } from "react";

/**
 * Bespoke cursor: a small rosewood disc that lerps toward the pointer, expands
 * over interactive elements, and morphs into a labelled pill ("View") over
 * elements carrying `data-cursor-label` (Hello Monday-style). Fine-pointer only;
 * disabled under reduced motion. Native cursor remains as a fallback.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label) return;

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
      const target = e.target as HTMLElement;
      const labelled = target?.closest<HTMLElement>("[data-cursor-label]");
      const interactive = target?.closest(
        "a, button, [role='button'], input, textarea, select, label, [data-cursor='grow']",
      );

      if (labelled) {
        el.dataset.state = "label";
        label.textContent = labelled.dataset.cursorLabel || "View";
      } else if (interactive) {
        el.dataset.state = "grow";
      } else {
        el.dataset.state = "default";
      }
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

  return (
    <div ref={ref} aria-hidden className="cursor-dot" data-state="default">
      <span ref={labelRef} className="cursor-dot__label" />
    </div>
  );
}
