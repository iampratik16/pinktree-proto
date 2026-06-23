import NextImage from "next/image";
import { getBlur } from "@/lib/media";
import type { ImageMedia } from "@/content/schema";

type Props = {
  media: ImageMedia;
  sizes: string;
  className?: string;
  /** Override media.priority (e.g. force the LCP hero). */
  priority?: boolean;
  /** Use object-fit cover within a sized parent instead of intrinsic box. */
  fill?: boolean;
};

/**
 * next/image wrapper that auto-applies the precomputed blur placeholder and
 * enforces explicit dimensions (zero CLS). Modern formats are negotiated by
 * the Next image optimiser (AVIF → WebP → original).
 */
export default function Img({ media, sizes, className = "", priority, fill }: Props) {
  const blur = getBlur(media.src);
  const usePriority = priority ?? media.priority ?? false;

  if (fill) {
    return (
      <NextImage
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={usePriority}
        placeholder={blur ? "blur" : "empty"}
        blurDataURL={blur}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <NextImage
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      priority={usePriority}
      placeholder={blur ? "blur" : "empty"}
      blurDataURL={blur}
      className={className}
    />
  );
}
