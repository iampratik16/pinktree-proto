import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";
import WorkCard from "@/components/work/WorkCard";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/motion/Magnetic";
import TransitionLink from "@/components/ui/TransitionLink";
import { ArrowUpRight } from "@/components/ui/icons";
import { getAllCaseStudies } from "@/content";
import { CAPABILITIES } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const studies = getAllCaseStudies();
  const [feature, ...rest] = studies;

  return (
    <>
      <Hero />

      {/* Who we are */}
      <section className="section container-page">
        <div className="grid gap-y-10 md:grid-cols-12">
          <Reveal as="p" className="eyebrow md:col-span-3">
            Who we are
          </Reveal>
          <div className="md:col-span-8 md:col-start-5">
            <SplitHeading
              as="p"
              className="font-serif text-h2 font-light leading-[1.15] tracking-tight"
            >
              A luxury creative consultancy handling every aspect of a brand’s
              marketing under one roof — quietly, and exceptionally well.
            </SplitHeading>
          </div>
        </div>
      </section>

      {/* What we do — quiet capability strip */}
      <section className="border-y border-(--color-hairline)">
        <div className="container-page">
          <Reveal as="p" className="eyebrow pt-(--section-y)">
            What we do
          </Reveal>
          <ul className="grid grid-cols-1 pb-(--section-y) pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((cap, i) => (
              <Reveal
                key={cap}
                delay={i * 80}
                as="li"
                className="group flex items-baseline gap-4 border-t border-(--color-hairline) py-6 lg:border-l lg:border-t-0 lg:px-7 lg:py-0 lg:first:pl-0"
              >
                <span className="eyebrow text-(--color-accent-ink)">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-h3 font-display font-light tracking-tight">
                  {cap}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Selected work */}
      <section className="section container-page">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Reveal as="p" className="eyebrow">
              Selected work
            </Reveal>
            <SplitHeading as="h2" className="mt-5 text-h1 font-light tracking-tight">
              Proof, not promises.
            </SplitHeading>
          </div>
          <TransitionLink
            href="/work"
            className="link-underline hidden shrink-0 pb-2 text-sm uppercase tracking-[0.12em] text-(--color-ink-soft) hover:text-(--color-accent) sm:inline-block"
          >
            All work
          </TransitionLink>
        </div>

        <div className="mt-16">
          <WorkCard study={feature} index={1} feature noBend />
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-20 md:mt-24 md:grid-cols-2">
          {rest.map((study, i) => (
            <WorkCard key={study.slug} study={study} index={i + 2} />
          ))}
        </div>
      </section>

      {/* Approach teaser */}
      <section className="section bg-(--color-ink) text-(--color-paper-on-dark)">
        <div className="container-page grid gap-y-10 md:grid-cols-12">
          <Reveal as="p" className="eyebrow text-(--color-paper-on-dark)/70 md:col-span-3">
            Our approach
          </Reveal>
          <div className="md:col-span-8 md:col-start-5">
            <SplitHeading
              as="p"
              className="font-serif text-h2 font-light leading-[1.18] tracking-tight"
            >
              We don’t chase volume. We partner with a small number of ambitious
              brands, for the long term, and treat their reputation as our own.
            </SplitHeading>
            <Reveal delay={120}>
              <TransitionLink
                href="/about"
                className="link-underline mt-10 inline-flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-(--color-accent-soft) hover:text-(--color-paper-on-dark)"
              >
                More about us
                <ArrowUpRight className="size-4" />
              </TransitionLink>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section container-page text-center">
        <Reveal as="p" className="eyebrow">
          Begin
        </Reveal>
        <SplitHeading
          as="h2"
          className="mx-auto mt-8 max-w-[20ch] text-display font-light leading-[1.0] tracking-tight"
        >
          Start a conversation.
        </SplitHeading>
        <Reveal delay={150} className="mt-12 flex justify-center">
          <Magnetic strength={0.5}>
            <Button href="/contact" variant="solid" withArrow>
              Start a conversation
            </Button>
          </Magnetic>
        </Reveal>
      </section>
    </>
  );
}
