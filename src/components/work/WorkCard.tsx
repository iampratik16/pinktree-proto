import TransitionLink from "@/components/ui/TransitionLink";
import Reveal from "@/components/motion/Reveal";
import Img from "@/components/media/Img";
import Video from "@/components/media/Video";
import LiquidImage from "@/components/media/LiquidImage";
import { ArrowUpRight } from "@/components/ui/icons";
import type { CaseStudy } from "@/content/schema";

type Props = {
  study: CaseStudy;
  /** Two-digit index shown as an editorial marker. */
  index?: number;
  /** Larger hero treatment for the first card. */
  feature?: boolean;
  sizes?: string;
  /** Heading level for the client name, to keep document outline sequential. */
  headingLevel?: "h2" | "h3";
  /** Skip the internal clip reveal (caller owns the animation, e.g. WorkGrid). */
  bare?: boolean;
};

export default function WorkCard({
  study,
  index,
  feature = false,
  sizes,
  headingLevel: Heading = "h3",
  bare = false,
}: Props) {
  const aspect = feature ? "16 / 10" : "4 / 3";
  const imgSizes = sizes ?? (feature ? "100vw" : "(min-width: 768px) 50vw, 100vw");

  const mediaBox = (
    <div
      className="relative overflow-hidden rounded-[var(--radius-sm)] bg-(--color-hairline)"
      style={{ aspectRatio: aspect }}
    >
      {study.heroMedia.type === "video" ? (
        <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]">
          <Video media={study.heroMedia} className="size-full" sizes={imgSizes} />
        </div>
      ) : (
        <LiquidImage className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]">
          <Img media={study.heroMedia} fill sizes={imgSizes} className="size-full" />
        </LiquidImage>
      )}

      {study.placeholder && (
        <span className="absolute left-4 top-4 rounded-full bg-(--color-ink)/70 px-3 py-1 text-xs tracking-wide text-(--color-paper-on-dark) backdrop-blur-sm">
          In preparation
        </span>
      )}

      {/* Subtle accent veil on hover */}
      <span className="pointer-events-none absolute inset-0 bg-(--color-accent) opacity-0 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-[0.12]" />
    </div>
  );

  return (
    <TransitionLink
      href={`/work/${study.slug}`}
      data-cursor-label="View"
      className="group block"
    >
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
          <Heading className="mt-2 text-h3 font-[var(--font-display)] tracking-tight transition-colors duration-500 group-hover:text-(--color-accent)">
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
