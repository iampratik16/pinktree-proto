"use client";

import { useLayoutEffect, useRef, type ElementType } from "react";
import { registerGsap, gsap, SplitText } from "@/lib/gsap";

type Props = {
  children: string;
  as?: ElementType;
  className?: string;
  /** "load" reveals on mount (hero); "scroll" reveals when scrolled into view. */
  trigger?: "load" | "scroll";
  delay?: number;
};

/**
 * Line-by-line headline reveal via GSAP SplitText with per-line masks. The raw
 * text is server-rendered for SEO and no-JS; the split/animation only runs on
 * capable clients and is skipped entirely under reduced motion. `autoSplit`
 * re-splits on resize/font-load and `onSplit` re-runs the reveal cleanly.
 */
export default function SplitHeading({
  children,
  as: Tag = "h2",
  className = "",
  trigger = "scroll",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    registerGsap();

    const ctx = gsap.context(() => {
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "split-line",
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.09,
            delay,
            ...(trigger === "scroll"
              ? { scrollTrigger: { trigger: el, start: "top 82%", once: true } }
              : {}),
          }),
      });
      return () => split.revert();
    }, el);

    return () => ctx.revert();
  }, [children, trigger, delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
