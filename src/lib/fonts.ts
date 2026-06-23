import { Fraunces, Inter } from "next/font/google";

/**
 * Display / editorial serif. Variable font — we expose the optical-size axis
 * so large headlines can use higher `opsz` for that high-contrast luxury feel.
 * Only the hero weight range is preloaded (see layout) to keep CLS at zero.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  // Variable weight axis is implicit; opsz drives the high-contrast display feel.
  axes: ["opsz"],
  style: ["normal", "italic"],
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
