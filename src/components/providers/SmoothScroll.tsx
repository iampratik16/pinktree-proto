"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { loadGsap } from "@/lib/gsap";

/**
 * Mounts Lenis inertia scroll and binds it to the GSAP ticker + ScrollTrigger.
 * Both libraries are dynamically imported so they stay out of the critical
 * path. Disabled entirely under `prefers-reduced-motion` (native scroll then).
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        loadGsap(),
      ]);
      if (cancelled) return;

      const lenis = new Lenis({
        lerp: 0.09,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });
      window.__lenis = lenis;

      lenis.on("scroll", ScrollTrigger.update);
      const onRaf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(onRaf);
      gsap.ticker.lagSmoothing(0);

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);

      cleanup = () => {
        gsap.ticker.remove(onRaf);
        window.removeEventListener("load", refresh);
        lenis.destroy();
        window.__lenis = undefined;
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  // On every route change, jump to top and recompute scroll triggers.
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    const id = window.setTimeout(() => {
      loadGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh());
    }, 80);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
