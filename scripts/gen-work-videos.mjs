/**
 * Generates ambient hover-preview videos for each work case study via Vertex AI
 * Veo (image-to-video from the existing hero still, so the video IS the poster in
 * motion — seamless hover cross-fade). Writes hero.mp4 into each slug's media dir.
 *
 * Auth: env VERTEX_TOKEN + PROJECT. Usage: node gen-work-videos.mjs [slug ...]
 * (no args = all). Each clip's motion prompt is tuned to the scene.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOKEN = process.env.VERTEX_TOKEN;
const PROJECT = process.env.PROJECT;
const LOCATION = process.env.LOCATION ?? "us-central1";
const MODELS = ["veo-3.0-fast-generate-001", "veo-2.0-generate-001"];

const JOBS = {
  chigwell: {
    dir: "chigwell",
    prompt:
      "Candle flames flickering softly, sheer white drapes swaying gently in a light breeze, warm evening light shifting through the glass marquee roof, very slow gentle camera push-in, serene luxurious wedding ambiance, subtle cinematic motion, no people moving",
  },
  aya: {
    dir: "aya",
    prompt:
      "Extremely subtle ambient motion, soft warm light gently shifting, faint drift of a few hair strands, a slow calm breath, delicate and elegant, minimal restrained movement, cinematic beauty portrait",
  },
  swifty: {
    dir: "swifty",
    prompt:
      "Vinyl record slowly rotating on the turntable, VU meter needles gently flickering, warm amber studio light softly pulsing, subtle slow camera drift, moody analog music studio ambiance, cinematic",
  },
  central: {
    dir: "central",
    prompt:
      "Warm candlelight and wall-sconce lights flickering softly, subtle ambient life in an elegant dining room, slow refined camera drift, intimate evening restaurant ambiance, cinematic, no people moving",
  },
  "north-mymms": {
    dir: "north-mymms",
    prompt:
      "Soft natural daylight gently shifting, a faint breeze through the scene, slow graceful camera drift across the elegant space, timeless refined stately ambiance, subtle cinematic motion",
  },
};

const base = (m) =>
  `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${m}`;

async function tryModel(model, imgB64, prompt, out) {
  const body = {
    instances: [{ prompt, image: { bytesBase64Encoded: imgB64, mimeType: "image/jpeg" } }],
    parameters: { aspectRatio: "16:9", sampleCount: 1, generateAudio: false },
  };
  const submit = await fetch(`${base(model)}:predictLongRunning`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!submit.ok) {
    console.log(`  ${model}: submit HTTP ${submit.status} — ${(await submit.text()).slice(0, 200)}`);
    return null;
  }
  const { name } = await submit.json();
  console.log(`  ${model}: op submitted, polling…`);
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 10000));
    const poll = await fetch(`${base(model)}:fetchPredictOperation`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ operationName: name }),
    });
    if (!poll.ok) {
      console.log(`  poll HTTP ${poll.status}`);
      continue;
    }
    const op = await poll.json();
    if (op.done) {
      if (op.error) {
        console.log(`  ${model}: op error ${JSON.stringify(op.error).slice(0, 240)}`);
        return null;
      }
      const r = op.response ?? {};
      const b64 =
        r.videos?.[0]?.bytesBase64Encoded ??
        r.generatedSamples?.[0]?.video?.bytesBase64Encoded ??
        r.predictions?.[0]?.bytesBase64Encoded;
      const gcs = r.videos?.[0]?.gcsUri ?? r.generatedSamples?.[0]?.video?.uri;
      if (b64 && b64.length > 500) {
        await writeFile(out, Buffer.from(b64, "base64"));
        console.log(`  ✓ ${model}: wrote ${out}`);
        return out;
      }
      if (gcs) {
        await writeFile(out + ".gcs.txt", gcs);
        console.log(`  ${model}: GCS ${gcs}`);
        return out + ".gcs.txt";
      }
      console.log(`  ${model}: done but no payload: ${JSON.stringify(op).slice(0, 200)}`);
      return null;
    }
    console.log(`  …${((i + 1) * 10)}s`);
  }
  return null;
}

async function main() {
  const want = process.argv.slice(2);
  const slugs = want.length ? want : Object.keys(JOBS);
  const results = {};
  for (const slug of slugs) {
    const job = JOBS[slug];
    if (!job) {
      console.log(`skip unknown slug ${slug}`);
      continue;
    }
    console.log(`\n== ${slug} ==`);
    const img = join(ROOT, "public", "media", "work", job.dir, "hero.jpg");
    const out = join(ROOT, "public", "media", "work", job.dir, "hero.mp4");
    const imgB64 = (await readFile(img)).toString("base64");
    let done = null;
    for (const model of MODELS) {
      done = await tryModel(model, imgB64, job.prompt, out);
      if (done) break;
    }
    results[slug] = done ?? "FAILED";
  }
  console.log("\nSUMMARY " + JSON.stringify(results));
  const anyFail = Object.values(results).some((v) => v === "FAILED");
  process.exit(anyFail ? 2 : 0);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
