/**
 * Generates premium BUSINESS imagery candidates for the About page (boardrooms,
 * London skyline, luxury offices, meeting rooms, high-end architecture) — no
 * people. Writes candidates to $OUTDIR for review; pick one landscape + one
 * portrait and copy to public/media/about/{02,01}.jpg.
 *
 * Auth: VERTEX_TOKEN=$(gcloud auth print-access-token) PROJECT=radlabs-497004 \
 *       OUTDIR=/path node scripts/gen-about-images.mjs [key ...]
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const TOKEN = process.env.VERTEX_TOKEN;
const PROJECT = process.env.PROJECT;
const LOCATION = process.env.LOCATION ?? "us-central1";
const MODEL = process.env.IMAGEN_MODEL ?? "imagen-4.0-generate-001";
const OUTDIR = process.env.OUTDIR ?? ".";

if (!TOKEN || !PROJECT) {
  console.error("Missing VERTEX_TOKEN or PROJECT env.");
  process.exit(1);
}

const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`;

const STYLE =
  "premium corporate architectural photography, warm natural light, elegant minimal, aspirational and high-end, editorial, cinematic, no people, no faces, no text, no lettering, no logos, no watermark, high detail";

// key: [prompt, aspectRatio, outW, outH]
const SPECS = {
  // Landscape — the lead image (2560x1600)
  land1: [
    `A luxurious modern boardroom with a long polished walnut table and designer chairs, floor-to-ceiling windows overlooking the London skyline at golden hour, ${STYLE}`,
    "16:9",
    2560,
    1600,
  ],
  land2: [
    `The London skyline at golden hour, iconic high-end skyscrapers and the river Thames, warm cinematic light, elevated view, aspirational, ${STYLE}`,
    "16:9",
    2560,
    1600,
  ],
  land3: [
    `An elegant luxury office lounge interior with designer furniture, marble and warm wood, an expansive calm space with large windows and soft daylight, ${STYLE}`,
    "16:9",
    2560,
    1600,
  ],
  // Portrait — the sticky detail image (1600x2000)
  port1: [
    `A striking upward view of a high-end modern glass office skyscraper in London, dramatic architecture against a bright sky, ${STYLE}`,
    "3:4",
    1600,
    2000,
  ],
  port2: [
    `An elegant luxury executive office interior corner with designer furniture and warm wood, a floor-to-ceiling window overlooking the city, soft daylight, ${STYLE}`,
    "3:4",
    1600,
    2000,
  ],
  port3: [
    `A sophisticated marketing meeting room with a large table, pendant lighting and a glass wall onto the London skyline, ${STYLE}`,
    "3:4",
    1600,
    2000,
  ],
  // Extra gallery candidates (landscape 3:2 for a grid)
  g1: [
    `Iconic modern London financial-district skyscrapers seen from street level, dramatic glass architecture and warm afternoon light, ${STYLE}`,
    "16:9",
    2400,
    1600,
  ],
  g2: [
    `An elegant open-plan luxury creative agency office with warm wood, greenery, designer lighting and large windows with a city view, ${STYLE}`,
    "16:9",
    2400,
    1600,
  ],
  g3: [
    `A stylish boardroom prepared for a business meeting, notebooks and glasses of water arranged on a long table, glass walls and warm daylight, ${STYLE}`,
    "16:9",
    2400,
    1600,
  ],
};

async function generate(prompt, aspectRatio, key, attempt = 1) {
  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio,
      sampleImageSize: "2K",
      personGeneration: "dont_allow",
      addWatermark: false,
    },
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return generate(prompt, aspectRatio, key, attempt + 1);
    }
    throw new Error(`${key}: HTTP ${res.status} ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  const b64 = json.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    const reason = json.predictions?.[0]?.raiFilteredReason ?? "no image";
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return generate(prompt, aspectRatio, key, attempt + 1);
    }
    throw new Error(`${key}: ${reason}`);
  }
  return Buffer.from(b64, "base64");
}

async function main() {
  const want = process.argv.slice(2);
  const keys = want.length ? want : Object.keys(SPECS);
  for (const key of keys) {
    const spec = SPECS[key];
    if (!spec) {
      console.log(`skip unknown ${key}`);
      continue;
    }
    const [prompt, aspectRatio, w, h] = spec;
    const raw = await generate(prompt, aspectRatio, key);
    const buf = await sharp(raw)
      .resize(w, h, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toBuffer();
    const out = join(OUTDIR, `about-${key}.jpg`);
    await writeFile(out, buf);
    console.log(`  ✓ ${out} (${(buf.length / 1024).toFixed(0)}kb)`);
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
