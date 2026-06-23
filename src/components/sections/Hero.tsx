import Video from "@/components/media/Video";
import SplitHeading from "@/components/motion/SplitHeading";
import { loop } from "@/lib/media";

const homeHero = loop(
  "/media/hero/home",
  "/media/hero/home.jpg",
  "Ambient abstraction in warm rosewood and ink tones.",
  1920,
  960,
);

export default function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-(--color-ink)">
      <Video media={homeHero} fill eager sizes="100vw" />
      {/* Legibility scrim */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-(--color-ink)/80 via-(--color-ink)/15 to-(--color-ink)/35" />

      <div className="container-page relative z-10 pb-[clamp(3.5rem,9vh,7rem)] pt-[var(--header-h)]">
        <p
          data-reveal
          data-reveal-delay={150}
          className="eyebrow text-(--color-paper-on-dark)/70"
        >
          Pink Tree Media — UK Creative Consultancy
        </p>
        <SplitHeading
          as="h1"
          trigger="load"
          delay={0.25}
          className="display mt-7 max-w-[18ch] text-(--color-paper-on-dark)"
        >
          Complete marketing solutions for ambitious brands.
        </SplitHeading>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-(--color-paper-on-dark)/60"
      >
        <span className="text-[0.7rem] uppercase tracking-[0.2em]">Scroll</span>
        <span className="scroll-cue h-10 w-px bg-(--color-paper-on-dark)/40" />
      </div>
    </section>
  );
}
