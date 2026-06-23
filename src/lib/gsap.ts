"use client";

import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import type { SplitText as SplitTextType } from "gsap/SplitText";

type GsapBundle = {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  SplitText: typeof SplitTextType;
};

let promise: Promise<GsapBundle> | null = null;

/**
 * Lazily code-splits GSAP + ScrollTrigger + SplitText out of the initial
 * bundle and registers plugins exactly once, client-side only. Components call
 * this inside effects so animation code loads after hydration, keeping the
 * critical-path JS small. SplitText/ScrollTrigger are free on public npm.
 */
export function loadGsap(): Promise<GsapBundle> {
  if (!promise) {
    promise = Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/SplitText"),
    ]).then(([core, st, sp]) => {
      const gsap = core.gsap ?? core.default;
      gsap.registerPlugin(st.ScrollTrigger, sp.SplitText);
      return { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText };
    });
  }
  return promise;
}
