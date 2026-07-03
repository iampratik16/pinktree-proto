"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { getBlur } from "@/lib/media";
import type { VideoMedia } from "@/content/schema";

type Props = {
  media: VideoMedia;
  className?: string;
  sizes?: string;
};

/**
 * Cuberto-style hover preview. The poster paints instantly; on hover (pointer
 * devices only) the muted loop mounts, plays, and cross-fades over the poster —
 * on leave it pauses, rewinds, and fades back. Touch / reduced-motion / Data-Saver
 * get the poster only (never loads the video). The video is mounted on first hover
 * and kept for instant replays.
 */
export default function HoverVideo({ media, className = "", sizes = "50vw" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canHover, setCanHover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState(false);
  const blur = getBlur(media.poster);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hover = window.matchMedia("(hover: hover)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (!reduced && hover && nav.connection?.saveData !== true) setCanHover(true);
  }, []);

  // Play/pause follows the hover state once the <video> is in the DOM.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovering) {
      v.play().catch(() => {});
    } else {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        // some browsers throw if metadata isn't ready yet — harmless
      }
      setPlaying(false);
    }
  }, [hovering, mounted]);

  const onEnter = () => {
    if (!canHover) return;
    setMounted(true);
    setHovering(true);
  };
  const onLeave = () => setHovering(false);

  return (
    <div
      className={`relative size-full overflow-hidden ${className}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <NextImage
        src={media.poster}
        alt={media.alt}
        fill
        sizes={sizes}
        placeholder={blur ? "blur" : "empty"}
        blurDataURL={blur}
        className={`object-cover transition-opacity duration-500 ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      />

      {mounted && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          onPlaying={() => setPlaying(true)}
          className="absolute inset-0 size-full object-cover"
        >
          {media.sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}
    </div>
  );
}
