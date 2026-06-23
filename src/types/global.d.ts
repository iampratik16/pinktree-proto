import type Lenis from "lenis";

declare global {
  interface Window {
    /** Global Lenis instance, set by SmoothScroll provider (undefined when reduced-motion). */
    __lenis?: Lenis;
  }
}

export {};
