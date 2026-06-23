import Img from "@/components/media/Img";
import Video from "@/components/media/Video";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import type { Media } from "@/content/schema";

type Props = {
  media: Media;
  sizes: string;
  className?: string;
  /** Show the alt text as a small caption beneath the media. */
  caption?: boolean;
  rounded?: boolean;
  /** Subtle vertical parallax within an over-sized frame (no edge gaps). */
  parallax?: boolean;
};

/**
 * Renders a single case-study media item (image or video) with a clip-path
 * reveal and optional subtle parallax. Used by the case-study gallery in
 * varied editorial layouts.
 */
export default function Figure({
  media,
  sizes,
  className = "",
  caption = false,
  rounded = true,
  parallax = false,
}: Props) {
  const radius = rounded ? "rounded-[var(--radius-sm)]" : "";

  const inner =
    media.type === "video" ? (
      <Video media={media} fill sizes={sizes} />
    ) : (
      <Img media={media} fill sizes={sizes} />
    );

  return (
    <figure className={className}>
      <Reveal media className={`relative overflow-hidden bg-(--color-hairline) ${radius}`}>
        <div className="relative" style={{ aspectRatio: `${media.width} / ${media.height}` }}>
          {parallax ? (
            // Over-size by 16% so the parallax travel never reveals an edge.
            <Parallax amount={0.1} className="absolute inset-x-0 -inset-y-[8%]">
              <div className="relative size-full">{inner}</div>
            </Parallax>
          ) : (
            inner
          )}
        </div>
      </Reveal>
      {caption && (
        <figcaption className="mt-3 text-sm text-(--color-ink-soft)">{media.alt}</figcaption>
      )}
    </figure>
  );
}
