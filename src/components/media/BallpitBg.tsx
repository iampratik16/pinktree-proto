"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";

// Code-split the three.js ballpit; only load when the footer is near the viewport.
const Ballpit = dynamic(() => import("@/components/media/Ballpit"), {
  ssr: false,
}) as ComponentType<Record<string, unknown>>;

// Bone → blush → rosewood balls (light-weighted) so they read clearly on the ink
// footer — the default black would be invisible.
const COLORS = [0xefeae1, 0xd8c2c5, 0xa86b72];

/**
 * Ballpit background for the footer's closing invitation. It's a 150-ball physics
 * sim, so it's gated to desktop, non-reduced-motion, non-Data-Saver, and only
 * mounts (creating its WebGL context) once the footer is near the viewport. The
 * component pauses its own rAF when off-screen / tab hidden.
 */
export default function BallpitBg() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (reduced || coarse || nav.connection?.saveData === true) return;

    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShow(entry.isIntersecting), {
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 z-0">
      {show && (
        <Ballpit
          className="size-full"
          count={150}
          gravity={0.5}
          friction={0.86}
          wallBounce={0.92}
          followCursor
          colors={COLORS}
          ambientIntensity={1.5}
          lightIntensity={280}
          minSize={0.7}
          maxSize={1.35}
        />
      )}
    </div>
  );
}
