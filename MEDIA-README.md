# Media — optimisation & encoding guide

How to prepare real photography and video so the site stays **very, very fast**. The current `public/media/**` files are procedurally-generated abstract placeholders; replace them with real assets using the settings below.

## Folder layout

```
public/media/
  hero/home.{jpg,mp4,webm}        home ambient hero (poster + loop)
  work/<slug>/hero.jpg            case-study hero (image)
  work/<slug>/01.jpg … NN.jpg     case-study gallery
  about/01.jpg, about/02.jpg      about imagery
```

Keep these paths (the case-study data references them) or update the data in `src/content/case-studies/*`.

## Images

- **Max source size:** 2560px on the long edge. Larger is wasted — `next/image` resizes per `sizes`.
- Deliver high-quality JPEG (or PNG for flat art); Next serves **AVIF → WebP → original** automatically. Do **not** pre-convert to AVIF/WebP.
- Provide both orientations as needed; keep the **aspect ratio** consistent with the data (`width`/`height`) so there is **zero CLS**.
- Target compressed JPEGs roughly **150–400 KB** at 2560px.

```bash
# Resize + compress a source image to a 2560px master JPEG
ffmpeg -i source.jpg -vf "scale='min(2560,iw)':-2" -q:v 3 out.jpg
# or with ImageMagick
magick source.jpg -resize 2560x2560\> -quality 82 out.jpg
```

### Blur placeholders

Every image needs a `blurDataURL` in `src/lib/media-blur.json` (keyed by `/media/...` path) so nothing pops in. Two options:

1. **Placeholders (current):** `node scripts/gen-media.mjs` regenerates art + blur map together.
2. **Real assets:** generate a tiny blur per file and add it to `src/lib/media-blur.json`:

```bash
# 20px wide blurred data URI
node -e "const sharp=require('sharp');sharp('public/media/work/foo/hero.jpg').resize(20).blur(1).jpeg({quality:40}).toBuffer().then(b=>console.log('\"/media/work/foo/hero.jpg\": \"data:image/jpeg;base64,'+b.toString('base64')+'\",'))"
```

If a `blurDataURL` is missing the image still works — it just renders with an empty placeholder.

## Video — ambient loops (the make-or-break)

- **Length:** ≤ 6s, seamless. **Muted, `playsInline`, `loop`, `autoplay`** (handled by `<Video>`).
- **Encode both** WebM (VP9/AV1) **and** MP4 (H.264); target **< 2–3 MB**.
- Always ship a **poster** (`.jpg`) — it paints instantly and is the reduced-motion / Save-Data / mobile fallback.
- `<Video>` lazy-mounts via `IntersectionObserver`, **pauses off-screen**, and shows **poster only** under reduced motion, Save-Data, or on mobile (≤767px).

```bash
# H.264 MP4 (faststart for instant playback)
ffmpeg -i in.mov -vf "scale=1920:-2" -c:v libx264 -crf 24 -preset slow -an -movflags +faststart out.mp4
# VP9 WebM
ffmpeg -i in.mov -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 32 -b:v 0 -an out.webm
# Poster from the first frame
ffmpeg -i in.mov -vf "scale=1920:-2" -frames:v 1 -q:v 3 poster.jpg
```

Reference the loop in case-study data via the `loop()` helper:

```ts
loop("/media/hero/home", "/media/hero/home.jpg", "Alt text", 1920, 960)
// expects /media/hero/home.webm, /media/hero/home.mp4, and the poster
```

## Longer video → Mux

For longer / heavier clips use **Mux** (adaptive HLS, fast-start, generated posters). The `Media` schema and `<Video>` are ready: set `provider: "mux"` + `muxPlaybackId`, install `@mux/mux-player-react`, and render it in the `mux` branch of `src/components/media/Video.tsx`. See `README.md → How to swap in Mux`.

## Accessibility

- Every image needs **descriptive `alt`** text (Zod fails the build without it).
- Ambient video is decorative (`aria-hidden`); any **meaningful** video must have captions/controls.
