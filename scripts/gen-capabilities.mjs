/**
 * Generates the four "What we do" capability cards via Vertex AI Imagen 4.
 * MERGE-SAFE: reads the existing blur map, adds only the new entries and writes
 * it back (does NOT regenerate or clobber existing imagery). Clearly-marked
 * STAND-INS (see CONTENT-TODO.md).
 *
 *   VERTEX_TOKEN=$(gcloud auth print-access-token) PROJECT=radlabs-497004 \
 *     node scripts/gen-capabilities.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
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

const STYLE =
  "shot on medium format, natural light, warm bone-ivory and muted rosewood palette, refined, minimal, luxurious, editorial, photorealistic, high detail, no watermark, no readable text, no logos";

const SPECS = [
  {
    name: "capabilities/01", w: 1200, h: 1600, aspect: "3:4",
    prompt: `Top-down still life of a luxury brand identity suite — blank embossed business cards, a wax seal, colour swatch chips and a brass pen arranged on warm uncoated paper, soft directional light, refined craft, ${STYLE}`,
  },
  {
    name: "capabilities/02", w: 1200, h: 1600, aspect: "3:4",
    prompt: `Tactile arrangement of premium printed matter — a neat stack of foil-embossed brochures, folded letterpress cards and a natural cotton tote on warm stone, raking light revealing paper texture, ${STYLE}`,
  },
  {
    name: "capabilities/03", w: 1200, h: 1600, aspect: "3:4",
    prompt: `A minimal luxury website on a slim laptop with a phone beside it on a warm marble desk, elegant blank editorial layout, soft daylight, shallow depth of field, ${STYLE}`,
  },
  {
    name: "capabilities/04", w: 1200, h: 1600, aspect: "3:4",
    prompt: `Editorial social-content flat lay on warm linen — a phone, dried florals, a ceramic cup and a few printed photo tiles arranged in a refined grid, soft natural light, ${STYLE}`,
  },
];

async function generate(spec, attempt = 1) {
  const body = {
    instances: [{ prompt: spec.prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: spec.aspect,
      sampleImageSize: "2K",
      personGeneration: "allow_adult",
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
  console.log(`Generating ${SPECS.length} capability images via ${MODEL}…`);
  const blurMap = JSON.parse(await readFile(BLUR_FILE, "utf8").catch(() => "{}"));
  for (const spec of SPECS) {
    const raw = await generate(spec);
    const buf = await sharp(raw)
      .resize(spec.w, spec.h, { fit: "cover", position: "attention" })
      .jpeg({ quality: 80, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toBuffer();

    const file = join(OUT, `${spec.name}.jpg`);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, buf);

    const blurBuf = await sharp(buf).resize(20).blur(1).jpeg({ quality: 40 }).toBuffer();
    blurMap[`/media/${spec.name}.jpg`] = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;
    console.log(`  ✓ ${spec.name}.jpg (${(buf.length / 1024).toFixed(0)}kb, ${spec.w}x${spec.h})`);
  }
  await writeFile(BLUR_FILE, JSON.stringify(blurMap, null, 2) + "\n");
  console.log(`\nMerged → ${Object.keys(blurMap).length} total blur placeholders in src/lib/media-blur.json`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
