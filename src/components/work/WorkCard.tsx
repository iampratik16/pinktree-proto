import TransitionLink from "@/components/ui/TransitionLink";
import Reveal from "@/components/motion/Reveal";
import BendImage from "@/components/media/BendImage";
import Img from "@/components/media/Img";
import Video from "@/components/media/Video";
import HoverVideo from "@/components/media/HoverVideo";
import CursorViewLabel from "@/components/work/CursorViewLabel";
import { ArrowUpRight } from "@/components/ui/icons";
import type { CaseStudy } from "@/content/schema";

type Props = {
  study: CaseStudy;
  /** Two-digit index shown as an editorial marker. */
  index?: number;
  /** Larger hero treatment for the first card. */
  feature?: boolean;
  sizes?: string;
  /** Override the media aspect ratio (e.g. WorkGrid's staggered columns). */
  ratio?: string;
  /** Heading level for the client name, to keep document outline sequential. */
  headingLevel?: "h2" | "h3";
  /** Skip the internal clip reveal (caller owns the animation, e.g. WorkGrid). */
  bare?: boolean;
  /** Render a plain, fixed image (no liquid edge bend) — e.g. the Proof feature. */
  noBend?: boolean;
  /** Play video on hover (Cuberto-style) rather than ambiently in view. */
  hoverPlay?: boolean;
  /** Mark this card's media as the LCP hero (first card) — preload eagerly. */
  priority?: boolean;
};

export default function WorkCard({
  study,
  index,
  feature = false,
  sizes,
  ratio,
  headingLevel: Heading = "h3",
  bare = false,
  noBend = false,
  hoverPlay = false,
  priority = false,
}: Props) {
  const aspect = ratio ?? (feature ? "16 / 10" : "4 / 3");
  const imgSizes = sizes ?? (feature ? "100vw" : "(min-width: 768px) 50vw, 100vw");

  // Video heroes preview on hover (hoverPlay) or loop ambiently in view.
  // Image heroes get the liquid-edge <BendImage> (cursor-driven mask); `noBend`
  // falls back to a plain <Img>. The box is a stable rounded rect.
  const mediaBox = (
    <div
      className="relative overflow-hidden rounded-[var(--radius-sm)] bg-(--color-ink)/5"
      style={{ aspectRatio: aspect }}
    >
      {study.heroMedia.type === "video" ? (
        hoverPlay ? (
          <HoverVideo media={study.heroMedia} sizes={imgSizes} priority={priority} />
        ) : (
          <Video media={study.heroMedia} fill sizes={imgSizes} eager={priority} />
        )
      ) : noBend ? (
        <Img media={study.heroMedia} fill sizes={imgSizes} priority={priority} className="size-full" />
      ) : (
        <BendImage
          src={study.heroMedia.src}
          alt={study.heroMedia.alt}
          sizes={imgSizes}
          className="size-full"
        />
      )}

      {/* Hover affordance — a 'View' disc that follows the cursor (Collins-style). */}
      <CursorViewLabel />

      {study.placeholder && (
        <span className="absolute left-4 top-4 z-[3] rounded-full bg-(--color-ink)/70 px-3 py-1 text-xs tracking-wide text-(--color-paper-on-dark) backdrop-blur-sm">
          In preparation
        </span>
      )}
    </div>
  );

  return (
    <TransitionLink href={`/work/${study.slug}`} className="work-card group block">
      {bare ? (
        <div className="relative">{mediaBox}</div>
      ) : (
        <Reveal media className="relative">
          {mediaBox}
        </Reveal>
      )}

      <div className="mt-6 flex items-start justify-between gap-6">
        <div>
          {index !== undefined && (
            <span className="eyebrow text-(--color-ink-soft)">
              {String(index).padStart(2, "0")}
            </span>
          )}
          <Heading className="mt-2 text-h3 font-display tracking-tight transition-colors duration-500 group-hover:text-(--color-accent)">
            {study.client}
          </Heading>
          <p className="mt-1.5 max-w-[42ch] text-(--color-ink-soft)">
            {study.oneLineOutcome}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
            {study.disciplines.map((d) => (
              <li key={d} className="text-xs uppercase tracking-[0.1em] text-(--color-ink-soft)">
                {d}
              </li>
            ))}
          </ul>
        </div>
        <ArrowUpRight className="mt-2 size-6 shrink-0 text-(--color-ink) transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-(--color-accent)" />
      </div>
    </TransitionLink>
  );
}
