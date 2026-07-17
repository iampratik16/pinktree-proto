"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { useTransitionNavigate } from "@/components/providers/PageTransition";

type Item = { label: string; href: string };

type Props = {
  items: readonly Item[];
  /** -1 = no pill (e.g. the header on routes that aren't in the nav). */
  initialActiveIndex?: number;
  /** Filter mode: clicks drive a local selection instead of routing. */
  onSelect?: (index: number) => void;
};

/**
 * The nav / filter pills: a dark island with a pill behind the active item.
 *
 * Deliberately plain. The previous version (vendored React Bits "GooeyNav") drew
 * the pill as a metaball — blur(7px) contrast(100) with mix-blend-mode: lighten
 * over a backdrop-filter, plus per-click particle spans. Safari renders extreme
 * contrast with colour fringing (a yellow halo round the pill) and repaints the
 * blur every frame. The pill is now a plain scaled background: identical in every
 * browser, GPU-composited, and no per-frame filter work.
 */
export default function GooeyNav({ items, initialActiveIndex = 0, onSelect }: Props) {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const pathname = usePathname();
  const navigate = useTransitionNavigate();
  const isTabMode = typeof onSelect === "function";

  // Route mode: the pill follows the current path — the header persists across
  // navigations, so it can't rely on clicks alone.
  useEffect(() => {
    if (isTabMode) return;
    setActiveIndex(
      items.findIndex(
        (it) => it.href === pathname || (it.href !== "/" && pathname.startsWith(it.href)),
      ),
    );
  }, [pathname, isTabMode, items]);

  const handleClick = (e: MouseEvent, index: number, href: string) => {
    e.preventDefault();
    setActiveIndex(index);
    if (onSelect) onSelect(index);
    else navigate(href); // route through the transition curtain
  };

  return (
    <div className="gooey-nav-container" data-active={activeIndex >= 0}>
      <nav>
        <ul>
          {items.map((item, index) => (
            <li key={item.label} className={activeIndex === index ? "active" : ""}>
              {/* A real anchor: Enter activates it natively, and it's crawlable. */}
              <a href={item.href} onClick={(e) => handleClick(e, index, item.href)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
