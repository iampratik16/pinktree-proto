/**
 * Generates warm, editorial PLACEHOLDER imagery + a low-res blur map.
 * These are neutral stand-ins (see CONTENT-TODO.md) — the client supplies real
 * photography/video later via the same media contract. Run: node scripts/gen-media.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "media");

// Warm "Atelier" palette tones.
const C = {
  paper: "#F5F2EC",
  ink: "#14110F",
  inkDeep: "#0e0c0a",
  accent: "#A86B72",
  accentSoft: "#D8C2C5",
  clay: "#8a5b54",
  sand: "#cdbfa8",
  olive: "#6b6450",
};

/** Duotone diagonal gradient + soft highlight + vignette as an SVG. */
function gradientSvg(w, h, from, to, angle = 135, highlight = "#ffffff") {
  const rad = (angle * Math.PI) / 180;
  const x2 = Math.round(50 + Math.cos(rad) * 50);
  const y2 = Math.round(50 + Math.sin(rad) * 50);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
      <radialGradient id="hl" cx="32%" cy="26%" r="68%">
        <stop offset="0%" stop-color="${highlight}" stop-opacity="0.22"/>
        <stop offset="55%" stop-color="${highlight}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="vig" cx="50%" cy="48%" r="78%">
        <stop offset="62%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.38"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" fill="url(#hl)"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
  </svg>`);
}

async function makeImage({ name, w, h, from, to, angle, highlight }) {
  const base = sharp(gradientSvg(w, h, from, to, angle, highlight)).resize(w, h);
  // Subtle film grain via gaussian noise in soft-light.
  const grain = await sharp({
    create: { width: w, height: h, channels: 3, noise: { type: "gaussian", mean: 128, sigma: 14 } },
  })
    .png()
    .toBuffer();

  const buf = await base
    .composite([{ input: grain, blend: "soft-light" }])
    .jpeg({ quality: 76, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toBuffer();

  const file = join(OUT, `${name}.jpg`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, buf);

  const blurBuf = await sharp(buf).resize(20).blur(1).jpeg({ quality: 40 }).toBuffer();
  const blur = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;
  console.log(`  ✓ ${name}.jpg (${(buf.length / 1024).toFixed(0)}kb)`);
  return [`/media/${name}.jpg`, blur];
}

// 2560 long-edge masters; next/image resizes down per `sizes`.
const LANDSCAPE = { w: 2560, h: 1600 };
const WIDE = { w: 2560, h: 1280 };
const PORTRAIT = { w: 1600, h: 2000 };
const SQUARE = { w: 1600, h: 1600 };

const SPECS = [
  // Home hero
  { name: "hero/home", ...WIDE, from: C.inkDeep, to: C.clay, angle: 120, highlight: C.accentSoft },
  // Case study heroes
  { name: "work/chigwell/hero", ...LANDSCAPE, from: C.ink, to: C.clay, angle: 125, highlight: C.sand },
  { name: "work/aya/hero", ...LANDSCAPE, from: C.accentSoft, to: C.ink, angle: 140, highlight: C.paper },
  { name: "work/swifty/hero", ...LANDSCAPE, from: C.inkDeep, to: C.accent, angle: 110, highlight: C.accentSoft },
  { name: "work/central/hero", ...LANDSCAPE, from: C.olive, to: C.ink, angle: 130, highlight: C.sand },
  { name: "work/north-mymms/hero", ...LANDSCAPE, from: C.sand, to: C.clay, angle: 135, highlight: C.paper },
  // Chigwell gallery (the fully-built case study)
  { name: "work/chigwell/01", ...PORTRAIT, from: C.ink, to: C.clay, angle: 160, highlight: C.sand },
  { name: "work/chigwell/02", ...LANDSCAPE, from: C.sand, to: C.olive, angle: 120, highlight: C.paper },
  { name: "work/chigwell/03", ...SQUARE, from: C.accentSoft, to: C.clay, angle: 145, highlight: C.paper },
  { name: "work/chigwell/04", ...WIDE, from: C.inkDeep, to: C.olive, angle: 115, highlight: C.sand },
  // About
  { name: "about/01", ...PORTRAIT, from: C.clay, to: C.ink, angle: 150, highlight: C.accentSoft },
  { name: "about/02", ...LANDSCAPE, from: C.sand, to: C.accent, angle: 130, highlight: C.paper },
];

async function main() {
  console.log("Generating placeholder media…");
  const blurMap = {};
  for (const spec of SPECS) {
    const [src, blur] = await makeImage(spec);
    blurMap[src] = blur;
  }
  await writeFile(join(ROOT, "src", "lib", "media-blur.json"), JSON.stringify(blurMap, null, 2) + "\n");
  console.log(`\nWrote ${Object.keys(blurMap).length} blur placeholders → src/lib/media-blur.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
