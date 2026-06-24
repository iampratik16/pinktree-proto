import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";
import WorkCard from "@/components/work/WorkCard";
import Img from "@/components/media/Img";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/motion/Magnetic";
import TransitionLink from "@/components/ui/TransitionLink";
import { ArrowUpRight } from "@/components/ui/icons";
import { getAllCaseStudies } from "@/content";
import { img } from "@/lib/media";
import { CAPABILITIES } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// AI-generated stand-in imagery for the capability cards (see CONTENT-TODO.md).
const CAP_IMAGES = [
  img("/media/capabilities/01.jpg", "An embossed luxury branding suite with a wax seal and colour swatches", 1200, 1600),
  img("/media/capabilities/02.jpg", "A stack of foil-embossed print collateral beside a cotton tote", 1200, 1600),
  img("/media/capabilities/03.jpg", "A minimal website shown on a laptop and phone on a marble desk", 1200, 1600),
  img("/media/capabilities/04.jpg", "An editorial social-content flat lay of printed photo tiles and florals", 1200, 1600),
];

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

      {/* What we do — staggered capability cards with ghost numbers + hover */}
      <section className="border-y border-(--color-hairline)">
        <div className="container-page section">
          <Reveal as="p" className="eyebrow">
            What we do
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {CAPABILITIES.map((cap, i) => (
              <Reveal
                media
                key={cap}
                as="li"
                delay={i * 110}
                className={`cap-card group ${i % 2 === 1 ? "lg:mt-20" : ""}`}
              >
                <TransitionLink href="/work" className="block">
                  <span
                    aria-hidden
                    className="cap-card-num block text-[clamp(3.5rem,7vw,5.5rem)] tracking-tight"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="cap-card-media relative -mt-5 aspect-[4/5] overflow-hidden rounded-[var(--radius-sm)] bg-(--color-hairline)">
                    <Img
                      media={CAP_IMAGES[i]}
                      fill
                      sizes="(min-width: 1024px) 22vw, 45vw"
                      className="cap-card-img"
                    />
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <h3 className="text-h3 font-display font-medium tracking-tight transition-colors duration-500 group-hover:text-(--color-accent)">
                      {cap}
                    </h3>
                    <span className="cap-card-arrow grid size-10 shrink-0 place-items-center rounded-full border border-(--color-ink)/25 text-(--color-ink)">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </TransitionLink>
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
