import { Archivo, Hanken_Grotesk, Fraunces } from "next/font/google";

/**
 * Typography system — pairing "E" (experimental / Hello Monday energy).
 *
 * The brief's families are commercial (PangramPangram): Monument Extended,
 * PP Mori, Editorial New. With no licence files in the repo we ship close FREE
 * look-alikes via next/font (self-hosted, zero layout shift). To use the real
 * fonts later, drop the .woff2 into /public and swap these for next/font/local.
 */

/** Display — Monument Extended stand-in. Wide architectural grotesque; the
 *  variable width axis lets big headlines expand for that "Monument" feel. */
export const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  axes: ["wdth"],
});

/** Body / UI — PP Mori stand-in. Clean, slightly geometric grotesque. */
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700"],
});

/** Accent / editorial serif — Editorial New stand-in. High-contrast serif for
 *  pull-quotes and editorial statements; opsz drives the display contrast. */
export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
  style: ["normal"],
});
