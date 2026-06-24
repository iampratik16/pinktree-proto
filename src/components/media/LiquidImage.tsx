"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * Hello Monday-style liquid hover: an SVG turbulence + displacement filter that
 * is attached only while hovering and animated into a gooey "splash", then a
 * gentle living wobble. Pointer/fine + motion-allowed only; otherwise the child
 * renders untouched (the CSS scale hover still applies).
 */
export default function LiquidImage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const turb = useRef<SVGFETurbulenceElement>(null);
  const rawId = useId();
  const fid = `liquid-${rawId.replace(/:/g, "")}`;

  useEffect(() => {
    const el = wrap.current;
    const d = disp.current;
    const t = turb.current;
    if (!el || !d || !t) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let cleanup = () => {};
    let cancelled = false;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      let wobble: ReturnType<typeof gsap.to> | null = null;

      const enter = () => {
        el.style.filter = `url(#${fid})`;
        gsap.to(d, { attr: { scale: 24 }, duration: 0.55, ease: "power3.out", overwrite: true });
        wobble?.kill();
        wobble = gsap.fromTo(
          t,
          { attr: { baseFrequency: 0.006 } },
          {
            attr: { baseFrequency: 0.016 },
            duration: 2.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          },
        );
      };

      const leave = () => {
        wobble?.kill();
        gsap.to(d, {
          attr: { scale: 0 },
          duration: 0.6,
          ease: "power3.out",
          overwrite: true,
          onComplete: () => {
            el.style.filter = "";
          },
        });
      };

      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      cleanup = () => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
        wobble?.kill();
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [fid]);

  return (
    <div ref={wrap} className={className} style={{ willChange: "filter" }}>
      {children}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={fid} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feTurbulence
            ref={turb}
            type="fractalNoise"
            baseFrequency="0.006"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            ref={disp}
            in="SourceGraphic"
            in2="noise"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </div>
  );
}
