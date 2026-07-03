/**
 * Regenerates the four "What we do" capability cards via Vertex AI Imagen 4 with
 * a new "gallery plinth" creative direction (one sculptural hero per card, single
 * raking light, one long rosewood shadow — cohesive luxury set). OVERWRITES
 * 01–04.jpg and merges the blur map. Clearly-marked STAND-INS.
 *
 *   VERTEX_TOKEN=$(gcloud auth print-access-token) PROJECT=radlabs-497004 \
 *     node scripts/gen-capabilities-v2.mjs
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

const SPECS = [
  {
    name: "capabilities/01", w: 1200, h: 1600, aspect: "3:4",
    prompt:
      "A single sculptural hero object on a low rosewood plinth against a seamless warm bone-ivory backdrop (#f5f2ec): a deep-rosewood (#8e4f57) wax seal freshly pressed onto a thick blind-embossed bone-ivory identity card that curves upward and stands self-supporting like a folded ribbon, a curl of still-warm wax catching the light, a single brass stylus resting at its base. One sharp shaft of raking natural light rakes across from the left, grazing the paper grain and the glossy seal and throwing one long deep-rosewood shadow into the empty space. Gallery-like, museum-minimal, tactile matte paper against smooth stone, quietly expensive. The hero object composed centrally in the middle third of a tall 3:4 vertical frame with generous breathing room top and bottom so it stays clear of the edges. Shot on medium format, warm bone-ivory and muted rosewood (#a86b72) palette, natural light, extremely shallow depth of field, editorial, photorealistic, no text, no logos, no watermark.",
  },
  {
    name: "capabilities/02", w: 1200, h: 1600, aspect: "3:4",
    prompt:
      "A single sculptural hero object on a low rosewood plinth against a seamless warm bone-ivory backdrop (#f5f2ec): a fanned totem of stacked luxury printed matter — thick deckled-edge bone-ivory brochures and letterpress cards rising vertically, one leaf peeling upward to reveal a rosewood (#8e4f57) foil-stamped inner page, a softly draped natural cotton tote and a rolled fabric swatch resting against the base. One hard beam of low raking natural light grazes across the paper fibres and the metallic foil, revealing deckle texture, and casts one long clean deep-rosewood shadow across the seamless surface. Gallery still-life, museum-minimal, tactile, quietly expensive. The hero object composed centrally in the middle third of a tall 3:4 vertical frame with generous breathing room top and bottom so it stays clear of the edges. Shot on medium format, warm bone-ivory and muted rosewood (#a86b72) palette, natural light, extremely shallow depth of field, editorial, photorealistic, no text, no logos, no watermark.",
  },
  {
    name: "capabilities/03", w: 1200, h: 1600, aspect: "3:4",
    prompt:
      "A single sculptural hero object on a low rosewood plinth against a seamless warm bone-ivory backdrop (#f5f2ec): a slim frameless rosewood-tinted glass panel standing vertically like a monolith with a bone-ivory rounded tablet-like slab leaning against its base, its edge blooming to a soft rosewood (#8e4f57) glow, a dust-lit reflection tracing the aluminium lip, no visible screen content. One directional shaft of raking natural light grazes the glass and metal edges and throws one long geometric deep-rosewood shadow across the seamless surface. Gallery-like, calm, museum-minimal, quietly expensive. The hero object composed centrally in the middle third of a tall 3:4 vertical frame with generous breathing room top and bottom so it stays clear of the edges. Shot on medium format, warm bone-ivory and muted rosewood (#a86b72) palette, natural light, extremely shallow depth of field, editorial, photorealistic, no text, no logos, no watermark.",
  },
  {
    name: "capabilities/04", w: 1200, h: 1600, aspect: "3:4",
    prompt:
      "A single sculptural hero object on a low rosewood plinth against a seamless warm bone-ivory backdrop (#f5f2ec): a staggered cluster of small rounded bone-ivory and rosewood (#8e4f57) tiles and discs, some standing on edge in slotted stone bases at varying heights like a quiet gallery installation, one glossy printed photo tile curling at the corner to catch the light, a single sprig of dried rosewood-hued florals leaning in. One raking beam of natural light passes through the gaps and casts one long fan of overlapping deep-rosewood shadows across the seamless surface. Minimal, tactile, quietly expensive, no icons or symbols. The hero object composed centrally in the middle third of a tall 3:4 vertical frame with generous breathing room top and bottom so it stays clear of the edges. Shot on medium format, warm bone-ivory and muted rosewood (#a86b72) palette, natural light, extremely shallow depth of field, editorial, photorealistic, no text, no logos, no watermark.",
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
  console.log(`Regenerating ${SPECS.length} capability images via ${MODEL}…`);
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
