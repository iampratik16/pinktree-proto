import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";
import MaskHeading from "@/components/motion/MaskHeading";
import Figure from "@/components/media/Figure";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/motion/Magnetic";
import { img } from "@/lib/media";

export const metadata: Metadata = {
  title: "About",
  description:
    "Pink Tree Media is a UK luxury creative consultancy, experienced, exacting, and built to be a trusted long-term partner to ambitious brands.",
  alternates: { canonical: "/about" },
};

const BLOCKS = [
  {
    eyebrow: "Experience",
    body: "Years of work across luxury hospitality, events, beauty and lifestyle, brands where presentation is everything and detail is non-negotiable.",
  },
  {
    eyebrow: "Approach",
    body: "Everything under one roof. Design and branding, print and merchandise, websites and digital, social media, considered together, never in silos.",
  },
  {
    eyebrow: "Quality",
    body: "We measure ourselves on craft. Fewer projects, more attention; nothing leaves the studio until it is genuinely worthy of the brands we serve.",
  },
  {
    eyebrow: "Partnership",
    body: "We work with a small number of clients for the long term, as a trusted partner invested in the reputation we help to build.",
  },
];

const about01 = img("/media/about/01.jpg", "A calm executive office with warm walnut interiors and a city view.", 1600, 2000);
const about02 = img("/media/about/02.jpg", "A boardroom overlooking the London skyline at golden hour.", 2560, 1600);
const about03 = img("/media/about/03.jpg", "The City of London skyline at golden hour.", 2400, 1600);
const about04 = img("/media/about/04.jpg", "A warm, plant-filled luxury creative office with skyline views.", 2400, 1600);
const about05 = img("/media/about/05.jpg", "A boardroom set for a business meeting, the city beyond.", 2400, 1600);

export default function AboutPage() {
  return (
    <div className="container-page">
      {/* Intro */}
      <header className="grid gap-y-10 pb-[clamp(3rem,8vh,6rem)] pt-[calc(var(--header-h)+clamp(3rem,10vh,8rem))] md:grid-cols-12">
        <Reveal as="p" className="eyebrow md:col-span-3">
          About
        </Reveal>
        <div className="md:col-span-9">
          <MaskHeading
            as="h1"
            className="max-w-[20ch] text-h1 font-light leading-[1.05] tracking-tight"
          >
            A consultancy built on taste, restraint and the long view.
          </MaskHeading>
        </div>
      </header>

      {/* Lead image */}
      <Figure media={about02} sizes="(min-width: 1600px) 1600px, 100vw" rounded parallax className="mb-(--section-y)" />

      {/* Blocks */}
      <section className="grid gap-x-16 gap-y-16 pb-(--section-y) md:grid-cols-2">
        <div className="md:sticky md:top-[calc(var(--header-h)+2rem)] md:self-start">
          <Figure media={about01} sizes="(min-width: 768px) 46vw, 100vw" rounded />
        </div>
        <dl className="flex flex-col">
          {BLOCKS.map((b, i) => (
            <Reveal
              key={b.eyebrow}
              delay={i * 60}
              className="border-t border-(--color-hairline) py-10 first:border-t-0 first:pt-0"
            >
              <dt className="eyebrow text-(--color-accent-ink)">{b.eyebrow}</dt>
              <dd className="mt-5 text-h3 font-light leading-relaxed">{b.body}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Gallery — the premium world we work in */}
      <section className="pb-(--section-y)">
        <Reveal as="p" className="eyebrow text-(--color-accent-ink)">
          The setting
        </Reveal>
        <div className="mt-8 grid gap-4 sm:gap-6 md:grid-cols-3">
          <Figure media={about03} sizes="(min-width: 768px) 31vw, 100vw" rounded />
          <Figure media={about04} sizes="(min-width: 768px) 31vw, 100vw" rounded />
          <Figure media={about05} sizes="(min-width: 768px) 31vw, 100vw" rounded />
        </div>
      </section>

      {/* CTA */}
      <section className="section border-t border-(--color-hairline) text-center">
        <SplitHeading
          as="h2"
          className="mx-auto max-w-[18ch] text-h1 font-light leading-[1.05] tracking-tight"
        >
          Let’s build something worth remembering.
        </SplitHeading>
        <Reveal delay={120} className="mt-12 flex justify-center">
          <Magnetic strength={0.5}>
            <Button href="/contact" variant="solid" withArrow>
              Start a conversation
            </Button>
          </Magnetic>
        </Reveal>
      </section>
    </div>
  );
}
