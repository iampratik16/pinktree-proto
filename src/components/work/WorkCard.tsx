import TransitionLink from "@/components/ui/TransitionLink";
import Reveal from "@/components/motion/Reveal";
import BendImage from "@/components/media/BendImage";
import Video from "@/components/media/Video";
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

  // Hello Monday-style WebGL bend lives in <BendImage>: a subdivided mesh flexes
  // its EDGES toward the cursor while the centred subject stays fixed. The box
  // keeps a stable rounded rect + overflow:hidden so the card outline is calm.
  const mediaBox = (
    <div
      className="relative overflow-hidden rounded-[var(--radius-sm)] bg-(--color-hairline)"
      style={{ aspectRatio: aspect }}
    >
      {study.heroMedia.type === "video" ? (
        <Video media={study.heroMedia} fill sizes={imgSizes} />
      ) : (
        <BendImage
          src={study.heroMedia.src}
          alt={study.heroMedia.alt}
          sizes={imgSizes}
          className="size-full"
        />
      )}

      {/* Subtle accent veil on hover */}
      <span className="pointer-events-none absolute inset-0 z-[2] bg-(--color-accent) opacity-0 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-[0.1]" />

      {study.placeholder && (
        <span className="absolute left-4 top-4 z-[3] rounded-full bg-(--color-ink)/70 px-3 py-1 text-xs tracking-wide text-(--color-paper-on-dark) backdrop-blur-sm">
          In preparation
        </span>
      )}
    </div>
  );

  return (
    <TransitionLink
      href={`/work/${study.slug}`}
      data-cursor-label="View"
      className="work-card group block"
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
