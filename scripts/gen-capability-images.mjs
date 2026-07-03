/**
 * Regenerates the 4 home "What we do" capability images in a bold, saturated,
 * non-human "Collins" style (portrait 3:4 to match the cards). Merges blur into
 * media-blur.json. Auth: VERTEX_TOKEN=$(gcloud auth print-access-token) PROJECT=...
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
if (!TOKEN || !PROJECT) { console.error("Missing VERTEX_TOKEN or PROJECT"); process.exit(1); }
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`;

const STYLE =
  "bold hyper-saturated graphic editorial poster art, dramatic theatrical studio lighting, high contrast, glossy, striking, single dominant colour story, no people, no faces, no text, no logos, no watermark";

const SPECS = {
  "01": { prompt: `Abstract brand-identity forms, glossy geometric monogram and logo shapes and colour swatches arranged sculpturally, deep violet and magenta, ${STYLE}` },
  "02": { prompt: `Abstract folded paper, printed collateral and merchandise forms in a sculptural graphic stack, vivid coral and red-orange, ${STYLE}` },
  "03": { prompt: `Abstract floating digital UI panels, glowing screens and geometric interface shapes, vivid electric cyan and teal, ${STYLE}` },
  "04": { prompt: `Abstract stacked social content tiles, glossy heart and speech-bubble forms and floating media shapes, vivid hot pink and magenta, ${STYLE}` },
};

async function generate(prompt, attempt = 1) {
  const body = { instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: "3:4", sampleImageSize: "2K", personGeneration: "dont_allow", addWatermark: false } };
  const res = await fetch(ENDPOINT, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) {
    if (attempt < 3) { await new Promise((r) => setTimeout(r, 1500 * attempt)); return generate(prompt, attempt + 1); }
    throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
  }
  const json = await res.json();
  const b64 = json.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    if (attempt < 3) { await new Promise((r) => setTimeout(r, 1500 * attempt)); return generate(prompt, attempt + 1); }
    throw new Error(json.predictions?.[0]?.raiFilteredReason ?? "no image");
  }
  return Buffer.from(b64, "base64");
}

async function main() {
  const want = process.argv.slice(2);
  const keys = want.length ? want : Object.keys(SPECS);
  const blurMap = JSON.parse(await readFile(BLUR_FILE, "utf8"));
  for (const n of keys) {
    const raw = await generate(SPECS[n].prompt);
    const buf = await sharp(raw).resize(1200, 1600, { fit: "cover", position: "attention" }).jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:2:0" }).toBuffer();
    await writeFile(join(OUT, "capabilities", `${n}.jpg`), buf);
    const blur = await sharp(buf).resize(20).blur(1).jpeg({ quality: 40 }).toBuffer();
    blurMap[`/media/capabilities/${n}.jpg`] = `data:image/jpeg;base64,${blur.toString("base64")}`;
    console.log(`  ✓ capabilities/${n}.jpg`);
  }
  await writeFile(BLUR_FILE, JSON.stringify(blurMap, null, 2) + "\n");
  console.log("merged blur");
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
