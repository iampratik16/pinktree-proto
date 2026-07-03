/**
 * Regenerates ONLY the 5 work case-study hero images in a bold, saturated,
 * non-human "Collins" style (each a single dominant colour story). Crops to the
 * layout dims (2560x1600) and MERGES the blur entries into media-blur.json
 * (leaves home/about/sub-images untouched).
 *
 * Auth: VERTEX_TOKEN=$(gcloud auth print-access-token) PROJECT=... node scripts/gen-work-images.mjs [slug ...]
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "media");
const BLUR_FILE = join(ROOT, "src", "lib", "media-blur.json");
const TOKEN = process.env.VERTEX_TOKEN;
const PROJECT = process.env.PROJECT;
const LOCATION = process.env.LOCATION ?? "us-central1";
const MODEL = process.env.IMAGEN_MODEL ?? "imagen-4.0-generate-001";

if (!TOKEN || !PROJECT) {
  console.error("Missing VERTEX_TOKEN or PROJECT env.");
  process.exit(1);
}

const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`;

// Bold, hyper-saturated, graphic editorial — the wearecollins.com energy. No
// people, no text; each card is one striking dominant-colour story.
const STYLE =
  "bold hyper-saturated graphic editorial poster art, dramatic theatrical studio lighting, high contrast, glossy, striking and confident, single dominant colour story, no people, no faces, no text, no logos, no watermark";

const SPECS = {
  chigwell: {
    name: "work/chigwell/hero",
    prompt: `Cascading crimson silk drapery and abstract oversized red roses, luxurious event elegance abstracted, deep scarlet and crimson, ${STYLE}`,
  },
  aya: {
    name: "work/aya/hero",
    prompt: `Swirling glossy cream and serum textures with cosmetic droplets and abstract petals, high-key beauty abstraction, vivid hot-pink and magenta, ${STYLE}`,
  },
  swifty: {
    name: "work/swifty/hero",
    prompt: `Abstract neon sound waves, a stylised vinyl record and glowing studio forms, music energy abstracted, vivid electric green and lime, ${STYLE}`,
  },
  central: {
    name: "work/central/hero",
    prompt: `A dramatic graphic arrangement of abstract culinary forms, citrus, glassware and molten light, fine-dining energy abstracted, vivid amber and orange, ${STYLE}`,
  },
  "north-mymms": {
    name: "work/north-mymms/hero",
    prompt: `Abstracted grand stately architecture with bold geometric forms and dramatic light, luxury venue abstracted, vivid electric blue and cobalt, ${STYLE}`,
  },
};

async function generate(spec, attempt = 1) {
  const body = {
    instances: [{ prompt: spec.prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: "16:9",
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
      console.log(`   retry ${spec.name} (HTTP ${res.status})`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return generate(spec, attempt + 1);
    }
    throw new Error(`${spec.name}: HTTP ${res.status} ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  const b64 = json.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    const reason = json.predictions?.[0]?.raiFilteredReason ?? "no image";
    if (attempt < 3) {
      console.log(`   retry ${spec.name} (${reason})`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return generate(spec, attempt + 1);
    }
    throw new Error(`${spec.name}: ${reason}`);
  }
  return Buffer.from(b64, "base64");
}

async function main() {
  const want = process.argv.slice(2);
  const slugs = want.length ? want : Object.keys(SPECS);
  const blurMap = JSON.parse(await readFile(BLUR_FILE, "utf8"));
  for (const slug of slugs) {
    const spec = SPECS[slug];
    if (!spec) {
      console.log(`skip unknown ${slug}`);
      continue;
    }
    const raw = await generate(spec);
    const buf = await sharp(raw)
      .resize(2560, 1600, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toBuffer();
    await writeFile(join(OUT, `${spec.name}.jpg`), buf);
    const blurBuf = await sharp(buf).resize(20).blur(1).jpeg({ quality: 40 }).toBuffer();
    blurMap[`/media/${spec.name}.jpg`] = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;
    console.log(`  ✓ ${spec.name}.jpg (${(buf.length / 1024).toFixed(0)}kb)`);
  }
  await writeFile(BLUR_FILE, JSON.stringify(blurMap, null, 2) + "\n");
  console.log(`merged blur → ${BLUR_FILE}`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
