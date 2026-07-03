/**
 * Ambient hover videos for the home "What we do" capability cards, via Vertex AI
 * Veo image-to-video from each capabilities/0X.jpg (portrait 9:16 to match the
 * cards). Writes capabilities/0X.mp4. Auth: env VERTEX_TOKEN + PROJECT.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOKEN = process.env.VERTEX_TOKEN;
const PROJECT = process.env.PROJECT;
const LOCATION = process.env.LOCATION ?? "us-central1";
const MODELS = ["veo-3.0-fast-generate-001", "veo-2.0-generate-001"];

const JOBS = [
  { n: "01", prompt: "Soft studio light slowly shifting across an embossed branding suite and wax seal, gentle shadow drift, refined minimal luxurious motion, no people" },
  { n: "02", prompt: "Pages of a print collateral suite gently settling and turning, soft light drifting over foil and uncoated paper, refined minimal motion, no people" },
  { n: "03", prompt: "Soft daylight slowly shifting across a laptop and phone on a marble desk, faint screen glow and gentle reflection drift, minimal elegant motion, no people" },
  { n: "04", prompt: "Gentle drift across an editorial social flat lay of printed photo tiles and dried florals, soft light slowly shifting, minimal refined motion, no people" },
];

const base = (m) => `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${m}`;

async function tryModel(model, imgB64, prompt, out) {
  const body = {
    instances: [{ prompt, image: { bytesBase64Encoded: imgB64, mimeType: "image/jpeg" } }],
    parameters: { aspectRatio: "9:16", sampleCount: 1, generateAudio: false },
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
  console.log(`  ${model}: polling…`);
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 10000));
    const poll = await fetch(`${base(model)}:fetchPredictOperation`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ operationName: name }),
    });
    if (!poll.ok) continue;
    const op = await poll.json();
    if (op.done) {
      if (op.error) { console.log(`  op error ${JSON.stringify(op.error).slice(0, 200)}`); return null; }
      const r = op.response ?? {};
      const b64 = r.videos?.[0]?.bytesBase64Encoded ?? r.generatedSamples?.[0]?.video?.bytesBase64Encoded ?? r.predictions?.[0]?.bytesBase64Encoded;
      if (b64 && b64.length > 500) { await writeFile(out, Buffer.from(b64, "base64")); console.log(`  ✓ wrote ${out}`); return out; }
      console.log(`  done but no payload`); return null;
    }
    console.log(`  …${(i + 1) * 10}s`);
  }
  return null;
}

async function main() {
  const want = process.argv.slice(2);
  const jobs = want.length ? JOBS.filter((j) => want.includes(j.n)) : JOBS;
  const results = {};
  for (const job of jobs) {
    console.log(`\n== capability ${job.n} ==`);
    const img = join(ROOT, "public", "media", "capabilities", `${job.n}.jpg`);
    const out = join(ROOT, "public", "media", "capabilities", `${job.n}.mp4`);
    const imgB64 = (await readFile(img)).toString("base64");
    let done = null;
    for (const model of MODELS) { done = await tryModel(model, imgB64, job.prompt, out); if (done) break; }
    results[job.n] = done ?? "FAILED";
  }
  console.log("\nSUMMARY " + JSON.stringify(results));
  process.exit(Object.values(results).some((v) => v === "FAILED") ? 2 : 0);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
