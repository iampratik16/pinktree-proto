"use client";

import { useLayoutEffect, useRef, type ElementType } from "react";
import { loadGsap } from "@/lib/gsap";

type Props = {
  children: string;
  as?: ElementType;
  className?: string;
  /** "load" reveals on mount (hero); "scroll" reveals when scrolled into view. */
  trigger?: "load" | "scroll";
  delay?: number;
};

/**
 * Line-by-line headline reveal via GSAP SplitText with per-line masks. GSAP is
 * dynamically imported. The element carries `data-split`, which globals.css
 * hides on JS-capable browsers until animated — preventing a flash of static
 * text before the reveal. Reduced motion and a load failsafe keep text visible
 * if animation is disabled or never loads. SEO/no-JS see the raw text.
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

    const reveal = () => el.classList.add("is-split");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }

    let revert = () => {};
    let cancelled = false;

    loadGsap().then(({ gsap, SplitText }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          // Don't let SplitText add aria-label (prohibited on <p>); the raw
          // text remains in the DOM in order for assistive tech.
          aria: "none",
          linesClass: "split-line",
          onSplit: (self) => {
            reveal();
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.09,
              delay,
              ...(trigger === "scroll"
                ? { scrollTrigger: { trigger: el, start: "top 82%", once: true } }
                : {}),
            });
          },
        });
        return () => split.revert();
      }, el);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert();
    };
  }, [children, trigger, delay]);

  return (
    <Tag ref={ref} data-split className={className}>
      {children}
    </Tag>
  );
}
