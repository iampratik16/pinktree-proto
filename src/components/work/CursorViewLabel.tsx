"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A "View" disc that follows the cursor within its positioned parent (the card's
 * media box) — Collins / Cuberto style — instead of sitting centred. Fades in on
 * enter, eases toward the pointer, fades out on leave. Hover-capable pointers only.
 */
export default function CursorViewLabel({ label = "View" }: { label?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!parent) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const at = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    const onMove = (e: PointerEvent) => at(e);
    const onEnter = (e: PointerEvent) => {
      at(e);
      setActive(true);
    };
    const onLeave = () => setActive(false);

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerenter", onEnter);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerenter", onEnter);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-[4] grid size-[clamp(4.5rem,6vw,5.75rem)] place-items-center rounded-full bg-(--color-paper)/95 text-xs uppercase tracking-[0.16em] text-(--color-ink) shadow-[0_10px_40px_rgba(20,17,15,0.28)] backdrop-blur-sm transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${active ? 1 : 0.6})`,
        opacity: active ? 1 : 0,
      }}
    >
      {label}
    </span>
  );
}
