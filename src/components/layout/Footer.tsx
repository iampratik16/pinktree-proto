import TransitionLink from "@/components/ui/TransitionLink";
import Reveal from "@/components/motion/Reveal";
import Logo from "@/components/layout/Logo";
import FooterBallpit from "@/components/media/FooterBallpit";
import { ArrowUpRight, Instagram } from "@/components/ui/icons";
import { CONTACT, NAV, SITE } from "@/lib/site";

export default function Footer() {
  const year = 2026;

  return (
    <footer className="relative isolate overflow-hidden bg-(--color-ink) text-(--color-paper-on-dark)">
      {/* Bubbles span the whole footer */}
      <FooterBallpit />
      {/* Scrim — airy at the top so the invitation reads against the bubbles,
          darkening toward the bottom so the detail columns stay legible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-(--color-ink)/20 via-(--color-ink)/45 to-(--color-ink)/92"
      />

      <div className="container-page section relative z-10">
        {/* Closing invitation — bubbles play behind it */}
        <div className="relative -mt-4">
          {/* Soft dark halo so the light headline reads over the light bubbles. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -inset-y-8 z-0 bg-[radial-gradient(70%_130%_at_16%_50%,rgba(20,17,15,0.78),rgba(20,17,15,0.2)_58%,transparent_80%)]"
          />
          <Reveal className="relative z-10 flex min-h-[clamp(220px,36vh,420px)] flex-col justify-center">
            <p className="eyebrow text-(--color-paper-on-dark)/85 [text-shadow:0_1px_16px_rgba(20,17,15,0.85)]">
              Start a conversation
            </p>
            <TransitionLink href="/contact" className="group mt-6 inline-flex items-end gap-4">
              <span className="font-display text-[clamp(3.25rem,9.5vw,7.5rem)] font-normal leading-[0.92] tracking-tight text-(--color-paper-on-dark) [text-shadow:0_2px_60px_rgba(20,17,15,0.95),0_2px_12px_rgba(20,17,15,0.8)]">
                Let’s begin
              </span>
              <ArrowUpRight className="mb-2 size-[clamp(1.9rem,4.5vw,3.25rem)] text-(--color-accent-soft) drop-shadow-[0_2px_10px_rgba(20,17,15,0.85)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:-translate-y-2" />
            </TransitionLink>
          </Reveal>
        </div>

        <hr className="mt-12 h-px w-full border-0 bg-(--color-hairline-dark)" />

        {/* Detail columns */}
        <div className="mt-16 grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo onDark className="h-16 sm:h-20" />
            <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-(--color-paper-on-dark)/75">
              A UK luxury creative consultancy. Complete marketing solutions for
              ambitious brands.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            <p className="eyebrow text-(--color-paper-on-dark)/70">Menu</p>
            {NAV.map((item) => (
              <TransitionLink
                key={item.href}
                href={item.href}
                className="link-underline w-fit text-sm text-(--color-paper-on-dark)/85 hover:text-(--color-paper-on-dark)"
              >
                {item.label}
              </TransitionLink>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <p className="eyebrow text-(--color-paper-on-dark)/70">Contact</p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="link-underline w-fit text-sm text-(--color-paper-on-dark)/85 hover:text-(--color-paper-on-dark)"
            >
              {CONTACT.email}
            </a>
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="link-underline w-fit text-sm text-(--color-paper-on-dark)/85 hover:text-(--color-paper-on-dark)"
            >
              {CONTACT.phoneDisplay}
            </a>
            <a
              href={CONTACT.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex w-fit items-center gap-2 text-sm text-(--color-paper-on-dark)/85 hover:text-(--color-paper-on-dark)"
            >
              <Instagram className="size-4" />
              {CONTACT.social.handle}
            </a>
          </div>

          <address className="not-italic">
            <p className="eyebrow text-(--color-paper-on-dark)/70">Studio</p>
            <p className="mt-3 text-sm leading-relaxed text-(--color-paper-on-dark)/85">
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

        <div className="mt-20 flex flex-col items-start justify-between gap-3 text-xs text-(--color-paper-on-dark)/70 sm:flex-row sm:items-center">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p>Designed &amp; built with restraint.</p>
        </div>
      </div>
    </footer>
  );
}
