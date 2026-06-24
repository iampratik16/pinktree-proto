import type { CSSProperties } from "react";

// Deterministic specks (no Math.random → no hydration mismatch).
const SPECKS = [
  { left: "6%", top: "12%", size: 5, dur: 17, delay: 0, drift: 22 },
  { left: "18%", top: "62%", size: 3, dur: 21, delay: 2, drift: -16 },
  { left: "29%", top: "28%", size: 4, dur: 19, delay: 5, drift: 18 },
  { left: "41%", top: "78%", size: 6, dur: 23, delay: 1, drift: -24 },
  { left: "52%", top: "16%", size: 3, dur: 18, delay: 4, drift: 14 },
  { left: "63%", top: "54%", size: 5, dur: 25, delay: 3, drift: -20 },
  { left: "74%", top: "32%", size: 4, dur: 20, delay: 6, drift: 16 },
  { left: "83%", top: "72%", size: 3, dur: 22, delay: 2, drift: -14 },
  { left: "91%", top: "22%", size: 5, dur: 19, delay: 5, drift: 20 },
  { left: "12%", top: "88%", size: 4, dur: 24, delay: 0, drift: -18 },
  { left: "47%", top: "44%", size: 3, dur: 26, delay: 7, drift: 12 },
  { left: "68%", top: "9%", size: 4, dur: 18, delay: 3, drift: -22 },
];

/**
 * Quiet drifting specks behind the work grid — the subtle "atmosphere" from
 * the Unseen reference. Decorative, CSS-animated, paused under reduced motion.
 */
export default function Particles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {SPECKS.map((s, i) => (
        <span
          key={i}
          className="speck"
          style={
            {
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
              "--drift": `${s.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
