import BendVideo from "@/components/media/BendVideo";
import MaskHeading from "@/components/motion/MaskHeading";
import { loop } from "@/lib/media";

const homeHero = loop(
  "/media/hero/home",
  "/media/hero/home.jpg",
  "Pink Tree Media brand reel.",
  1280,
  580,
);

export default function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-(--color-ink)">
      <BendVideo media={homeHero} className="absolute inset-0 size-full" sizes="100vw" />
      {/* Legibility scrim */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-(--color-ink)/80 via-(--color-ink)/15 to-(--color-ink)/35" />

      <div className="container-page relative z-10 pb-[clamp(3.5rem,9vh,7rem)] pt-[var(--header-h)]">
        <MaskHeading
          as="h1"
          delay={40}
          className="display max-w-[18ch] text-(--color-paper-on-dark)"
        >
          Complete marketing solutions for ambitious brands.
        </MaskHeading>
      </div>
    </section>
  );
}
