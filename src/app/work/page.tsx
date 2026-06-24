import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import MaskHeading from "@/components/motion/MaskHeading";
import WorkGrid from "@/components/work/WorkGrid";
import Particles from "@/components/work/Particles";
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
    <div className="relative">
      <Particles />

      <div className="container-page">
        {/* Page header */}
        <header className="pb-[clamp(2rem,5vh,4rem)] pt-[calc(var(--header-h)+clamp(3rem,10vh,8rem))]">
          <Reveal as="p" className="eyebrow">
            Selected work
          </Reveal>
          <MaskHeading
            as="h1"
            className="mt-6 max-w-[16ch] text-display font-light leading-[1.0] tracking-tight"
          >
            Depth over breadth.
          </MaskHeading>
          <Reveal delay={120}>
            <p className="mt-8 max-w-[52ch] text-h3 font-light leading-relaxed text-(--color-ink-soft)">
              A small number of brands, handled completely. Each project shows the
              full breadth of what we do — design, print, digital and social —
              through real work.
            </p>
          </Reveal>
        </header>

        <div className="pb-(--section-y)">
          <WorkGrid studies={studies} />
        </div>
      </div>
    </div>
  );
}
