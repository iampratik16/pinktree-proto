import blurMap from "@/lib/media-blur.json";
import type { ImageMedia, VideoMedia } from "@/content/schema";

const BLUR: Record<string, string> = blurMap;

/** Returns the precomputed blurDataURL for a local image src, if any. */
export function getBlur(src: string): string | undefined {
  return BLUR[src];
}

/** Convenience builder for a local placeholder image with blur baked in. */
export function img(
  src: string,
  alt: string,
  width: number,
  height: number,
  priority = false,
): ImageMedia {
  return { type: "image", src, alt, width, height, priority };
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
    poster,
    alt,
    width,
    height,
    provider: "self",
    sources: [
      { src: `${base}.webm`, type: "video/webm" },
      { src: `${base}.mp4`, type: "video/mp4" },
    ],
  };
}
