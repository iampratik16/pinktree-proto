import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Clip-path media reveal vs. translate/opacity content reveal. */
  media?: boolean;
  /** Stagger delay in ms, read by the global RevealObserver. */
  delay?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Server component. Marks its subtree for the global IntersectionObserver
 * reveal system (see RevealObserver + globals.css). No JS shipped for this
 * itself — content is fully visible without JS or under reduced motion.
 */
export default function Reveal({
  children,
  media = false,
  delay,
  as: Tag = "div",
  className = "",
}: Props) {
  const attr = media ? { "data-reveal-media": "" } : { "data-reveal": "" };
  return (
    <Tag {...attr} data-reveal-delay={delay} className={className}>
      {children}
    </Tag>
  );
}
