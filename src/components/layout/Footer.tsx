import type { CSSProperties } from "react";
import Image from "next/image";
import TransitionLink from "@/components/ui/TransitionLink";
import Reveal from "@/components/motion/Reveal";
import Logo from "@/components/layout/Logo";
import FooterBallpit from "@/components/media/FooterBallpit";
import { ArrowUpRight, Instagram } from "@/components/ui/icons";
import { CONTACT, NAV, SITE } from "@/lib/site";
import { getBlur } from "@/lib/media";

// ── Footer background: two versions kept side by side ───────────────────────
//   "image"   → static minimalist pink marketing still-life (Vertex AI). Light
//               background, so the footer switches to a LIGHT treatment
//               (dark ink text, light scrim, colour logo).
//   "ballpit" → the ambient 3D bubbles (FooterBallpit) with the DARK treatment
//               (cream text on ink). Still fully intact.
// Flip this single value to switch back to the dynamic footer any time.
const FOOTER_VARIANT: "image" | "ballpit" = "image";

// ?v bumped whenever the image file is regenerated in place — Next's image
// optimiser caches by URL, so the query is what busts the stale optimised copy.
const FOOTER_IMAGE = "/media/footer/marketing.jpg";
const FOOTER_IMAGE_SRC = `${FOOTER_IMAGE}?v=2`;

export default function Footer() {
  const year = 2026;
  const isImage = FOOTER_VARIANT === "image";

  // All footer text colour flows from this one variable; only the structural
  // bits (scrim, halo, logo, shadows) branch on the variant below.
  const fgStyle = {
    "--footer-fg": isImage ? "var(--color-ink)" : "var(--color-paper-on-dark)",
  } as CSSProperties;

  return (
    <footer
      style={fgStyle}
      className="relative isolate overflow-hidden bg-(--color-ink) text-(--footer-fg)"
    >
      {/* Background — static marketing image or the ambient bubbles (see FOOTER_VARIANT) */}
      {isImage ? (
        <div aria-hidden className="absolute inset-0 z-0">
          <Image
            src={FOOTER_IMAGE_SRC}
            alt=""
            fill
            sizes="100vw"
            placeholder="blur"
            blurDataURL={getBlur(FOOTER_IMAGE)}
            className="object-cover object-center"
          />
        </div>
      ) : (
        <FooterBallpit />
      )}

      {/* Scrim — light image: gently lift the bottom so the detail columns read;
          bubbles: darken toward the bottom so cream text stays legible. */}
      {isImage ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-(--color-paper) via-(--color-paper)/88 via-45% to-transparent to-72%"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-(--color-ink)/20 via-(--color-ink)/45 to-(--color-ink)/92"
        />
      )}

      <div className="container-page relative z-10 pt-[clamp(5rem,10vh,8rem)] pb-[clamp(3rem,7vh,5rem)]">
        {/* Closing invitation */}
        <div className="relative -mt-4">
          {/* Soft dark halo so the cream headline reads over the light bubbles. */}
          {!isImage && (
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-10 -inset-y-8 z-0 bg-[radial-gradient(70%_130%_at_16%_50%,rgba(20,17,15,0.78),rgba(20,17,15,0.2)_58%,transparent_80%)]"
            />
          )}
          <Reveal className="relative z-10 flex min-h-[clamp(140px,22vh,260px)] flex-col justify-center">
            <p
              className={`eyebrow text-(--footer-fg)/85 ${
                isImage ? "" : "[text-shadow:0_1px_16px_rgba(20,17,15,0.85)]"
              }`}
            >
              Start a conversation
            </p>
            <TransitionLink href="/contact" className="group mt-6 inline-flex items-end gap-4">
              <span
                className={`font-display text-[clamp(3.25rem,9.5vw,7.5rem)] font-normal leading-[0.92] tracking-tight text-(--footer-fg) ${
                  isImage
                    ? ""
                    : "[text-shadow:0_2px_60px_rgba(20,17,15,0.95),0_2px_12px_rgba(20,17,15,0.8)]"
                }`}
              >
                Let’s begin
              </span>
              <ArrowUpRight
                className={`mb-2 size-[clamp(1.9rem,4.5vw,3.25rem)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:-translate-y-2 ${
                  isImage
                    ? "text-(--color-accent-ink)"
                    : "text-(--color-accent-soft) drop-shadow-[0_2px_10px_rgba(20,17,15,0.85)]"
                }`}
              />
            </TransitionLink>
          </Reveal>
        </div>

        <hr
          className={`mt-10 h-px w-full border-0 ${
            isImage ? "bg-(--color-hairline)" : "bg-(--color-hairline-dark)"
          }`}
        />

        {/* Detail columns */}
        <div className="mt-12 grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo onDark={!isImage} className="h-16 sm:h-20" />
            <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-(--footer-fg)/75">
              A UK luxury creative consultancy. Complete marketing solutions for
              ambitious brands.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            <p className="eyebrow text-(--footer-fg)/70">Menu</p>
            {NAV.map((item) => (
              <TransitionLink
                key={item.href}
                href={item.href}
                className="link-underline w-fit text-sm text-(--footer-fg)/85 hover:text-(--footer-fg)"
              >
                {item.label}
              </TransitionLink>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <p className="eyebrow text-(--footer-fg)/70">Contact</p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="link-underline w-fit text-sm text-(--footer-fg)/85 hover:text-(--footer-fg)"
            >
              {CONTACT.email}
            </a>
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="link-underline w-fit text-sm text-(--footer-fg)/85 hover:text-(--footer-fg)"
            >
              {CONTACT.phoneDisplay}
            </a>
            <a
              href={CONTACT.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex w-fit items-center gap-2 text-sm text-(--footer-fg)/85 hover:text-(--footer-fg)"
            >
              <Instagram className="size-4" />
              {CONTACT.social.handle}
            </a>
          </div>

          <address className="not-italic">
            <p className="eyebrow text-(--footer-fg)/70">Studio</p>
            <p className="mt-3 text-sm leading-relaxed text-(--footer-fg)/85">
              {CONTACT.address.street}
              <br />
              {CONTACT.address.locality}
              <br />
              {CONTACT.address.postalCode}
              <br />
              {CONTACT.address.country}
            </p>
          </address>
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 text-xs text-(--footer-fg)/70 sm:flex-row sm:items-center">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
