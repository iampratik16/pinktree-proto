"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";

// Code-split the three.js ballpit; only mount when the footer nears the viewport.
const Ballpit = dynamic(() => import("@/components/media/Ballpit"), {
  ssr: false,
}) as ComponentType<Record<string, unknown>>;

// Pearlescent white → blush → rosewood, on-brand for Pink Tree. First entry also
// tints the point light, so it stays light.
const COLORS = [0xf7f1ef, 0xe8cbd1, 0xcf97a2];

/**
 * Full-bleed ballpit behind the whole footer. gravity: 0 so the (small, dense)
 * bubbles fill the entire space evenly instead of piling at the bottom. Gated to
 * non-reduced-motion / non-touch / non-Data-Saver; lazy-mounts its own WebGL and
 * pauses when off-screen. Fresh canvas per mount (StrictMode-safe).
 */
export default function FooterBallpit() {
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
      rootMargin: "300px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 z-0">
      {show && (
        <Ballpit
          className="size-full"
          count={320}
          gravity={0}
          friction={0.9975}
          wallBounce={0.9}
          maxVelocity={0.12}
          followCursor
          colors={COLORS}
          ambientIntensity={1.6}
          lightIntensity={240}
          minSize={0.35}
          maxSize={0.85}
          maxZ={1.4}
        />
      )}
    </div>
  );
}
