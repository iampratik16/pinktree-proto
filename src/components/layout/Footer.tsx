import TransitionLink from "@/components/ui/TransitionLink";
import Reveal from "@/components/motion/Reveal";
import { ArrowUpRight, Instagram } from "@/components/ui/icons";
import { CONTACT, NAV, SITE } from "@/lib/site";

export default function Footer() {
  const year = 2026;

  return (
    <footer className="bg-(--color-ink) text-(--color-paper-on-dark)">
      <div className="container-page section">
        {/* Closing invitation */}
        <Reveal>
          <p className="eyebrow text-(--color-paper-on-dark)/70">Start a conversation</p>
          <TransitionLink
            href="/contact"
            className="group mt-8 inline-flex items-end gap-4"
          >
            <span className="font-[var(--font-display)] text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95] tracking-tight">
              Let’s begin
            </span>
            <ArrowUpRight className="mb-2 size-[clamp(1.75rem,4vw,3rem)] text-(--color-accent-soft) transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:-translate-y-2" />
          </TransitionLink>
        </Reveal>

        <hr className="mt-20 h-px w-full border-0 bg-(--color-hairline-dark)" />

        {/* Detail columns */}
        <div className="mt-16 grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="font-[var(--font-display)] text-2xl font-light">{SITE.name}</p>
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
