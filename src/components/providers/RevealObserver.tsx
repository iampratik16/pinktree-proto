"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Single IntersectionObserver that plays every `[data-reveal]` /
 * `[data-reveal-media]` element once as it scrolls into view (adds `.is-in`).
 * Re-scans on route change. The reveal styling lives in globals.css and is
 * gated behind `html.js`, so content is fully visible if this never runs.
 *
 * Honours an optional `data-reveal-delay` (ms) for staggered groups.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-media]"),
    ).filter((el) => !el.classList.contains("is-in"));

    if (reduced) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          if (delay) {
            window.setTimeout(() => el.classList.add("is-in"), delay);
          } else {
            el.classList.add("is-in");
          }
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
