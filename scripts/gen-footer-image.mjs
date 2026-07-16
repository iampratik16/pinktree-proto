/**
 * Generates static marketing-related footer background CANDIDATES (wide banner)
 * via Vertex AI Imagen. Writes 2560x1200 jpgs to $OUTDIR (default: scratchpad).
 * Pick the winner, then copy it to public/media/footer/marketing.jpg.
 *
 * Auth: VERTEX_TOKEN=$(gcloud auth print-access-token) PROJECT=radlabs-497004 \
 *       OUTDIR=/path node scripts/gen-footer-image.mjs [key ...]
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

// On-brand pink: light pink / baby pink / white, minimalist and airy. The
// subject sits in the UPPER-RIGHT; the whole BOTTOM band and the LEFT are calm
// empty pale-blush space so the footer's dark-ink headline (left) and the detail
// columns (across the bottom) stay perfectly legible over the image.
const STYLE =
  "minimalist and airy, soft diffused studio lighting, gentle soft shadows, clean and refined, the entire bottom third and the left side are calm empty pale blush pink background with generous negative space, subject kept compact in the upper right, light pink baby pink and white pastel palette, bright high-key, elegant premium editorial aesthetic, no people, no faces, no text, no lettering, no logos, no watermark, high detail";

const SPECS = {
  a: `A minimalist creative still life: a single sculptural gracefully folded paper petal form in soft baby pink and white, floating compact in the upper-right area, ${STYLE}`,
  b: `A minimalist abstract composition of a few small overlapping soft pink and white geometric paper shapes casting subtle soft shadows, grouped compact in the upper-right corner, ${STYLE}`,
  c: `A minimalist creative image: a delicate blush pink silk ribbon curling gracefully in the upper-right area, ${STYLE}`,
  d: `A minimalist still life: three smooth rounded pastel spheres in baby pink, blush and white with soft gradients and gentle shadows, grouped compact in the upper-right, ${STYLE}`,
};

async function generate(prompt, key, attempt = 1) {
  const body = {
    instances: [{ prompt }],
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
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return generate(prompt, key, attempt + 1);
    }
    throw new Error(`${key}: HTTP ${res.status} ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  const b64 = json.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    const reason = json.predictions?.[0]?.raiFilteredReason ?? "no image";
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return generate(prompt, key, attempt + 1);
    }
    throw new Error(`${key}: ${reason}`);
  }
  return Buffer.from(b64, "base64");
}

async function main() {
  const want = process.argv.slice(2);
  const keys = want.length ? want : Object.keys(SPECS);
  for (const key of keys) {
    const prompt = SPECS[key];
    if (!prompt) {
      console.log(`skip unknown ${key}`);
      continue;
    }
    const raw = await generate(prompt, key);
    // Wide banner crop for the short footer.
    const buf = await sharp(raw)
      .resize(2560, 1200, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toBuffer();
    const out = join(OUTDIR, `footer-cand-${key}.jpg`);
    await writeFile(out, buf);
    console.log(`  ✓ ${out} (${(buf.length / 1024).toFixed(0)}kb)`);
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
