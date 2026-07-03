import blurMap from "@/lib/media-blur.json";
import type { ImageMedia, VideoMedia } from "@/content/schema";

const BLUR: Record<string, string> = blurMap;

// Bump to bust the Vercel/Next image + CDN cache after regenerating assets in
// place (same path, new content) — otherwise mobile can keep serving stale
// optimized variants. Appended as ?v= to every media URL.
const CACHE_V = "3";
const v = (src: string) => `${src}?v=${CACHE_V}`;

/** Returns the precomputed blurDataURL for a local image src, if any. */
export function getBlur(src: string): string | undefined {
  return BLUR[src.split("?")[0]];
}

/** Convenience builder for a local placeholder image with blur baked in. */
export function img(
  src: string,
  alt: string,
  width: number,
  height: number,
  priority = false,
): ImageMedia {
  return { type: "image", src: v(src), alt, width, height, priority };
}

/** Convenience builder for a self-hosted ambient video loop (MP4 + WebM). */
export function loop(
  base: string,
  poster: string,
  alt: string,
  width: number,
  height: number,
): VideoMedia {
  return {
    type: "video",
    poster: v(poster),
    alt,
    width,
    height,
    provider: "self",
    sources: [
      { src: v(`${base}.webm`), type: "video/webm" },
      { src: v(`${base}.mp4`), type: "video/mp4" },
    ],
  };
}
