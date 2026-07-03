"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";

// Code-split the heavy three.js + postprocessing bundle: it only loads when the
// section actually mounts the effect (never on initial page load). ssr:false
// because it touches window/WebGL. The prop is typed as a partial override —
// the component merges it over its own defaults at runtime.
const Hyperspeed = dynamic(() => import("@/components/media/Hyperspeed"), {
  ssr: false,
}) as ComponentType<{ effectOptions?: Record<string, unknown> }>;

// Module-level constant → stable reference, so the effect isn't torn down and
// rebuilt on every re-render. Only overrides the fog/background colour so distant
// streaks fade into the section's ink instead of pure black.
const OPTS = { colors: { background: 0x14110f } };

/**
 * Background layer for the dark "Our approach" section: the Hyperspeed highway.
 * Lazy-mounts via IntersectionObserver so the three.js scene (and its WebGL
 * context) only exists while the section is near the viewport, and is disposed
 * when it scrolls well away. Skipped entirely under reduced motion / Data-Saver.
 */
export default function HyperspeedBg() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (reduced || nav.connection?.saveData === true) return;

    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShow(entry.isIntersecting), {
      rootMargin: "300px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 z-0">
      {show && <Hyperspeed effectOptions={OPTS} />}
    </div>
  );
}
