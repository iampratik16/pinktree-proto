import { Fraunces, Inter } from "next/font/google";

/**
 * Display / editorial serif. Variable font — we expose the optical-size axis
 * so large headlines can use higher `opsz` for that high-contrast luxury feel.
 * Only the hero weight range is preloaded (see layout) to keep CLS at zero.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  // "optional" avoids a late web-font swap re-painting the LCP headline on slow
  // connections (stable, fast LCP). Cached / fast loads still get Fraunces;
  // first cold loads briefly use the size-adjusted fallback.
  display: "optional",
  variable: "--font-fraunces",
  // Variable weight axis is implicit; opsz drives the high-contrast display feel.
  // No italic (unused) keeps the display-font payload small for fast LCP.
  axes: ["opsz"],
  style: ["normal"],
});

/**
 * Neutral grotesque for UI, body, labels and eyebrows.
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});
