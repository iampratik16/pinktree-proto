import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";
import WorkCard from "@/components/work/WorkCard";
import { getAllCaseStudies } from "@/content";

export const metadata: Metadata = {
  title: "Selected Work",
  description:
    "A curated selection of Pink Tree Media case studies — brand worlds, websites, print and social built for ambitious brands.",
  alternates: { canonical: "/work" },
};

export default function WorkIndex() {
  const studies = getAllCaseStudies();

  return (
    <div className="container-page">
      {/* Page header */}
      <header className="pb-[clamp(3rem,8vh,6rem)] pt-[calc(var(--header-h)+clamp(3rem,10vh,8rem))]">
        <Reveal as="p" className="eyebrow">
          Selected work
        </Reveal>
        <SplitHeading
          as="h1"
          trigger="load"
          className="mt-6 max-w-[16ch] text-display font-light leading-[1.0] tracking-tight"
        >
          Depth over breadth.
        </SplitHeading>
        <Reveal delay={120}>
          <p className="mt-8 max-w-[52ch] text-h3 font-light leading-relaxed text-(--color-ink-soft)">
            A small number of brands, handled completely. Each project below shows
            the full breadth of what we do — design, print, digital and social —
            through real work.
          </p>
        </Reveal>
      </header>

      {/* Editorial list */}
      <ul className="grid gap-x-12 gap-y-24 pb-(--section-y) md:grid-cols-2 md:gap-y-32">
        {studies.map((study, i) => (
          <li
            key={study.slug}
            // First entry spans full width; the rest alternate with a gentle
            // vertical offset for an asymmetric editorial rhythm.
            className={
              i === 0
                ? "md:col-span-2"
                : i % 2 === 0
                  ? "md:mt-0"
                  : "md:mt-24"
            }
          >
            <WorkCard
              study={study}
              index={i + 1}
              feature={i === 0}
              sizes={i === 0 ? "100vw" : "(min-width: 768px) 46vw, 100vw"}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
