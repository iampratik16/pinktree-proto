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

    const init = async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        loadGsap(),
      ]);
      if (cancelled) return;

      const lenis = new Lenis({
        // Frame-rate-independent exponential smoothing — the "butter" feel.
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        // Smooth on trackpads/touch too, without overshoot.
        syncTouch: true,
        touchMultiplier: 1.4,
        // Keep programmatic scrollTo (anchors, route reset) eased.
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
    };

    // Defer to idle so animation libraries don't compete with hydration/paint
    // (keeps TBT low on throttled mobile). Falls back to a short timeout.
    const hasRic = typeof window.requestIdleCallback === "function";
    const handle = hasRic
      ? window.requestIdleCallback(() => init(), { timeout: 600 })
      : window.setTimeout(() => init(), 200);

    return () => {
      cancelled = true;
      if (hasRic) window.cancelIdleCallback(handle as number);
      else window.clearTimeout(handle as number);
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
