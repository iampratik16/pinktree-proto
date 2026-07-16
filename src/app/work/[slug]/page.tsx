import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Reveal from "@/components/motion/Reveal";
import MaskHeading from "@/components/motion/MaskHeading";
import Figure from "@/components/media/Figure";
import Img from "@/components/media/Img";
import Video from "@/components/media/Video";
import TransitionLink from "@/components/ui/TransitionLink";
import JsonLd from "@/components/seo/JsonLd";
import { ArrowUpRight } from "@/components/ui/icons";
import { SITE } from "@/lib/site";
import { breadcrumbLd, caseStudyLd } from "@/lib/structured-data";
import {
  getAllSlugs,
  getCaseStudy,
  getNextCaseStudy,
} from "@/content";
import type { Media } from "@/content/schema";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: study.seo.title,
    description: study.seo.description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "article",
      title: study.seo.title,
      description: study.seo.description,
      url: `${SITE.url}/work/${slug}`,
      // og:image is provided automatically by ./opengraph-image.tsx
    },
  };
}

/** Editorial width per media aspect ratio. */
function layoutFor(media: Media): { wrap: string; fullBleed: boolean; sizes: string } {
  const ratio = media.width / media.height;
  if (media.type === "video" || ratio >= 1.85) {
    return { wrap: "", fullBleed: true, sizes: "100vw" };
  }
  if (ratio <= 0.85) {
    return {
      wrap: "mx-auto w-full max-w-2xl",
      fullBleed: false,
      sizes: "(min-width: 768px) 42rem, 100vw",
    };
  }
  return {
    wrap: "mx-auto w-full max-w-5xl",
    fullBleed: false,
    sizes: "(min-width: 768px) 64rem, 100vw",
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const next = getNextCaseStudy(slug);

  return (
    <article>
      <JsonLd
        data={[
          caseStudyLd(study),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
            { name: study.client, path: `/work/${study.slug}` },
          ]),
        ]}
      />
      {/* Hero */}
      <header className="relative flex min-h-[68svh] flex-col justify-end overflow-hidden bg-(--color-ink) text-(--color-paper-on-dark)">
        <div
          className={`absolute inset-0${
            study.heroMedia.type !== "video" ? " cinematic-hero" : ""
          }`}
        >
          {study.heroMedia.type === "video" ? (
            <Video media={study.heroMedia} fill eager sizes="100vw" />
          ) : (
            <Img media={study.heroMedia} fill priority sizes="100vw" className="size-full" />
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-(--color-ink)/85 via-(--color-ink)/20 to-(--color-ink)/40" />
        {/* Candlelight — warm flickering glow that makes the still feel filmed. */}
        {study.heroMedia.type !== "video" && (
          <div className="candle-glow pointer-events-none absolute inset-0" />
        )}

        <div className="container-page relative z-10 pb-[clamp(3rem,8vh,6rem)] pt-[var(--header-h)]">
          <Reveal as="p" className="eyebrow text-(--color-paper-on-dark)/70">
            {study.sector}
          </Reveal>
          <MaskHeading
            as="h1"
            delay={100}
            className="mt-6 max-w-[16ch] text-display font-light leading-[1.0] tracking-tight"
          >
            {study.client}
          </MaskHeading>
          <Reveal delay={150}>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {study.disciplines.map((d) => (
                <li
                  key={d}
                  className="text-xs uppercase tracking-[0.12em] text-(--color-paper-on-dark)/70"
                >
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
          {study.liveUrl && (
            <Reveal delay={200}>
              <a
                href={study.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-9 inline-flex items-center gap-2 rounded-full border border-(--color-paper-on-dark)/40 px-6 py-3 text-sm tracking-tight text-(--color-paper-on-dark) transition-colors duration-500 hover:border-transparent hover:bg-(--color-paper-on-dark) hover:text-(--color-ink)"
              >
                Visit the live site
                <ArrowUpRight className="size-4" />
              </a>
            </Reveal>
          )}
        </div>
      </header>

      {/* The Client / The Challenge */}
      <section className="section container-page">
        <div className="grid gap-x-12 gap-y-16 md:grid-cols-2">
          <div>
            <Reveal as="p" className="eyebrow">
              The Client
            </Reveal>
            <Reveal>
              <p className="mt-6 text-h3 font-light leading-relaxed">{study.theClient}</p>
            </Reveal>
          </div>
          <div>
            <Reveal as="p" className="eyebrow">
              The Challenge
            </Reveal>
            <Reveal>
              <p className="mt-6 text-h3 font-light leading-relaxed">{study.theChallenge}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What We Delivered */}
      <section className="border-y border-(--color-hairline) bg-(--color-paper)">
        <div className="container-page section">
          <Reveal as="p" className="eyebrow">
            What we delivered
          </Reveal>
          <dl className="mt-12 divide-y divide-(--color-hairline)">
            {study.delivered.map((d, i) => (
              <Reveal
                key={d.area}
                delay={i * 60}
                className="grid gap-x-12 gap-y-4 py-9 md:grid-cols-12"
              >
                <dt className="font-display text-h3 font-light tracking-tight md:col-span-4">
                  {d.area}
                </dt>
                <dd className="text-(--color-ink-soft) md:col-span-7 md:col-start-6">
                  {d.summary}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* The Work — the visual heart */}
      {study.work.length > 0 && (
        <section className="section">
          <div className="container-page">
            <Reveal as="p" className="eyebrow">
              The Work
            </Reveal>
          </div>
          <div className="mt-14 flex flex-col gap-[clamp(2rem,6vh,6rem)]">
            {study.work.map((media, i) => {
              const { wrap, fullBleed, sizes } = layoutFor(media);
              const figure = (
                <Figure
                  media={media}
                  sizes={sizes}
                  rounded={!fullBleed}
                  parallax={fullBleed}
                  className={fullBleed ? "w-full" : wrap}
                />
              );
              return fullBleed ? (
                <div key={i}>{figure}</div>
              ) : (
                <div key={i} className="container-page">
                  {figure}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Results */}
      {study.results.length > 0 && (
        <section className="section bg-(--color-ink) text-(--color-paper-on-dark)">
          <div className="container-page">
            <Reveal as="p" className="eyebrow text-(--color-paper-on-dark)/70">
              Results
            </Reveal>
            <ul className="mt-14 grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {study.results.map((r, i) => (
                <Reveal key={i} delay={i * 80} as="li">
                  {r.value && (
                    <p className="font-display text-[clamp(3rem,6vw,5rem)] font-light leading-none tracking-tight text-(--color-accent-soft)">
                      {r.value}
                    </p>
                  )}
                  <p
                    className={`max-w-[28ch] text-h3 font-light leading-snug ${
                      r.value ? "mt-4 text-(--color-paper-on-dark)/80" : ""
                    }`}
                  >
                    {r.label}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Next case study */}
      <section className="border-t border-(--color-hairline)">
        <TransitionLink
          href={`/work/${next.slug}`}
          className="group container-page flex flex-col items-center py-(--section-y) text-center"
        >
          <span className="eyebrow">Next case study</span>
          <span className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span className="text-balance text-h1 font-display font-light tracking-tight transition-colors duration-500 group-hover:text-(--color-accent) sm:text-display">
              {next.client}
            </span>
            <ArrowUpRight className="size-[clamp(1.5rem,3vw,2.5rem)] shrink-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:text-(--color-accent)" />
          </span>
        </TransitionLink>
      </section>
    </article>
  );
}
