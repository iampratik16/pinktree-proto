/**
 * Generates photographic placeholder imagery via Vertex AI Imagen 4, then
 * crops each to the exact dimensions the layout expects (zero CLS) and rebuilds
 * the blur map. These remain clearly-marked STAND-INS (see CONTENT-TODO.md).
 *
 * Auth: pass a gcloud access token via env VERTEX_TOKEN and project via PROJECT.
 *   VERTEX_TOKEN=$(gcloud auth print-access-token) PROJECT=... node scripts/gen-media-vertex.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "media");
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
  "shot on medium format, natural light, warm bone-ivory and muted rosewood palette, refined, minimal, luxurious, editorial, photorealistic, high detail, no watermark";

const SPECS = [
  {
    name: "hero/home", w: 2560, h: 1280, aspect: "16:9",
    prompt: `Cinematic abstract of softly flowing champagne silk and warm light, gentle folds and bokeh, elegant and serene, ${STYLE}, no text`,
  },
  {
    name: "work/chigwell/hero", w: 2560, h: 1600, aspect: "16:9",
    prompt: `A luxury clear-span glass marquee at blue-hour dusk, warm candlelight, draped interior, tall floral arrangements, refined table settings, English country grounds beyond, shallow depth of field, ${STYLE}, no faces, no text`,
  },
  {
    name: "work/aya/hero", w: 2560, h: 1600, aspect: "16:9",
    prompt: `Editorial beauty still life, premium skincare glass bottles on warm stone with delicate shadows, minimal luxury cosmetics photography, ${STYLE}, no logos, no text`,
  },
  {
    name: "work/swifty/hero", w: 2560, h: 1600, aspect: "16:9",
    prompt: `Moody music studio scene, vinyl record and analog mixing console under warm low light, deep shadows with a rosewood glow, atmospheric and cinematic, ${STYLE}, no text`,
  },
  {
    name: "work/central/hero", w: 2560, h: 1600, aspect: "16:9",
    prompt: `Elegant restaurant and lounge interior at night, warm amber lighting, plush seating, marble bar, intimate fine-dining ambience, ${STYLE}, no faces, no text`,
  },
  {
    name: "work/north-mymms/hero", w: 2560, h: 1600, aspect: "16:9",
    prompt: `Grand English country house estate at golden hour, honey limestone facade, manicured gardens, soft warm light, luxury wedding venue, cinematic wide shot, ${STYLE}, no text`,
  },
  {
    name: "work/chigwell/01", w: 1600, h: 2000, aspect: "3:4",
    prompt: `Top-down flat lay of a luxury blank stationery suite on warm uncoated paper, embossed monogram, wax seal and a eucalyptus sprig, soft natural light, refined branding mockup, ${STYLE}, no readable text`,
  },
  {
    name: "work/chigwell/02", w: 2560, h: 1600, aspect: "16:9",
    prompt: `A minimal luxury website shown on a laptop and phone on a warm marble desk, elegant editorial layout with blank screens, soft daylight, ${STYLE}, no readable text`,
  },
  {
    name: "work/chigwell/03", w: 1600, h: 1600, aspect: "1:1",
    prompt: `Refined event detail, close up of an elegant floral centrepiece and candlelight on a draped table, soft focus background, luxury wedding, ${STYLE}, no text`,
  },
  {
    name: "work/chigwell/04", w: 2560, h: 1280, aspect: "16:9",
    prompt: `Full-bleed interior of a luxury marquee dressed for a wedding breakfast, long banquet tables, hanging greenery and warm festoon lighting, cinematic wide shot, ${STYLE}, no faces, no text`,
  },
  {
    name: "about/01", w: 1600, h: 2000, aspect: "3:4",
    prompt: `Quiet creative studio detail, a designer's desk with paper swatches, a brass ruler and warm light, tactile craft, editorial still life, ${STYLE}, no readable text`,
  },
  {
    name: "about/02", w: 2560, h: 1600, aspect: "16:9",
    prompt: `Calm expansive creative studio interior, a minimal warm space with large windows and soft daylight, plants and refined furniture, architectural editorial photograph, ${STYLE}, no faces, no text`,
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
  console.log(`Generating ${SPECS.length} images via ${MODEL}…`);
  const blurMap = {};
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
  await writeFile(join(ROOT, "src", "lib", "media-blur.json"), JSON.stringify(blurMap, null, 2) + "\n");
  console.log(`\nWrote ${Object.keys(blurMap).length} blur placeholders → src/lib/media-blur.json`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
