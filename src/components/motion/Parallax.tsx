"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { registerGsap, gsap, ScrollTrigger } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  /** Fraction of element height to travel across the scroll range (≤0.12). */
  amount?: number;
  className?: string;
};

/**
 * Subtle vertical parallax (capped travel) tied to scroll. No-op under reduced
 * motion. Wrap an over-sized media element so the parallax never reveals edges.
 */
export default function Parallax({ children, amount = 0.1, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    registerGsap();
    const travel = Math.min(Math.abs(amount), 0.12) * 100;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -travel / 2 },
        {
          yPercent: travel / 2,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [amount]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
