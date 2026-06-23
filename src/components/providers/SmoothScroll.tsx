"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { registerGsap, gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Mounts Lenis inertia scroll and binds it to the GSAP ticker + ScrollTrigger.
 * Disabled entirely under `prefers-reduced-motion` (native scroll then).
 * Mount once, high in the tree.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // Expose for programmatic scrolling (anchor links, scroll-to-top).
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const onRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    // Settle layout-driven triggers after fonts/media load.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      gsap.ticker.remove(onRaf);
      window.removeEventListener("load", refresh);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // On every route change, jump to top and recompute scroll triggers.
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
