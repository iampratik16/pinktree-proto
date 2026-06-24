/**
 * Generates an ambient hero video via Vertex AI Veo (image-to-video from the
 * hero still so it matches the poster). Saves raw mp4 to scratch path given as
 * arg. Auth via env VERTEX_TOKEN + PROJECT.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOKEN = process.env.VERTEX_TOKEN;
const PROJECT = process.env.PROJECT;
const LOCATION = process.env.LOCATION ?? "us-central1";
const OUT = process.argv[2] ?? join(ROOT, "public", "media", "hero", "home-veo.mp4");

const MODELS = ["veo-3.0-fast-generate-001", "veo-2.0-generate-001"];
const PROMPT =
  "Extremely slow, gentle drifting motion of softly flowing champagne silk fabric, subtle shimmering light, serene and luxurious, cinematic ambient loop, minimal movement";

const base = (m) =>
  `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${m}`;

async function tryModel(model, imgB64) {
  const body = {
    instances: [
      { prompt: PROMPT, image: { bytesBase64Encoded: imgB64, mimeType: "image/jpeg" } },
    ],
    parameters: { aspectRatio: "16:9", sampleCount: 1, generateAudio: false },
  };
  const submit = await fetch(`${base(model)}:predictLongRunning`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!submit.ok) {
    console.log(`  ${model}: submit HTTP ${submit.status} — ${(await submit.text()).slice(0, 160)}`);
    return null;
  }
  const { name } = await submit.json();
  console.log(`  ${model}: op submitted, polling…`);

  for (let i = 0; i < 40; i++) {
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
        console.log(`  ${model}: op error ${JSON.stringify(op.error).slice(0, 200)}`);
        return null;
      }
      const r = op.response ?? {};
      const sample =
        r.videos?.[0]?.bytesBase64Encoded ??
        r.generatedSamples?.[0]?.video?.uri ??
        r.predictions?.[0]?.bytesBase64Encoded;
      const gcs = r.videos?.[0]?.gcsUri ?? r.generatedSamples?.[0]?.video?.uri;
      if (sample && sample.length > 500) {
        await writeFile(OUT, Buffer.from(sample, "base64"));
        console.log(`  ✓ ${model}: wrote ${OUT}`);
        return OUT;
      }
      if (gcs) {
        console.log(`  ${model}: video at GCS ${gcs}`);
        await writeFile(OUT + ".gcs.txt", gcs);
        return OUT + ".gcs.txt";
      }
      console.log(`  ${model}: done but no video payload: ${JSON.stringify(op).slice(0, 200)}`);
      return null;
    }
    console.log(`  …polling (${(i + 1) * 10}s)`);
  }
  console.log(`  ${model}: timed out`);
  return null;
}

async function main() {
  const imgB64 = (await readFile(join(ROOT, "public", "media", "hero", "home.jpg"))).toString("base64");
  for (const model of MODELS) {
    const out = await tryModel(model, imgB64);
    if (out) {
      console.log(`DONE:${out}`);
      return;
    }
  }
  console.log("VEO_FAILED");
  process.exit(2);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
