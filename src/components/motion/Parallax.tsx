"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { loadGsap } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  /** Fraction of element height to travel across the scroll range (≤0.12). */
  amount?: number;
  className?: string;
};

/**
 * Subtle vertical parallax (capped travel) tied to scroll. No-op under reduced
 * motion. GSAP is dynamically imported. Wrap an over-sized media element so the
 * parallax never reveals edges.
 */
export default function Parallax({ children, amount = 0.1, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const travel = Math.min(Math.abs(amount), 0.12) * 100;
    let revert = () => {};
    let cancelled = false;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { yPercent: -travel / 2 },
          {
            yPercent: travel / 2,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }, el);
      revert = () => ctx.revert();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      revert();
    };
  }, [amount]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
