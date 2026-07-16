import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import MaskHeading from "@/components/motion/MaskHeading";
import ContactForm from "@/components/contact/ContactForm";
import { WhatsApp, Instagram, TikTok, LinkedIn, YouTube } from "@/components/ui/icons";
import { CONTACT, whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation with Pink Tree Media. Enquire about complete marketing for your brand, design, print, digital and social.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-page">
      <header className="pb-[clamp(2.5rem,6vh,4rem)] pt-[calc(var(--header-h)+clamp(3rem,10vh,8rem))]">
        <Reveal as="p" className="eyebrow">
          Contact
        </Reveal>
        <MaskHeading
          as="h1"
          className="mt-6 max-w-[18ch] text-display font-light leading-[1.0] tracking-tight"
        >
          Start a conversation.
        </MaskHeading>
      </header>

      <div className="grid gap-x-16 gap-y-20 pb-(--section-y) lg:grid-cols-12">
        {/* Form */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        {/* Direct details */}
        <aside className="flex flex-col gap-12 lg:col-span-4 lg:col-start-9">
          <Reveal>
            <p className="eyebrow">Direct</p>
            <div className="mt-5 flex flex-col gap-2">
              <a href={`mailto:${CONTACT.email}`} className="link-underline w-fit text-lg hover:text-(--color-accent)">
                {CONTACT.email}
              </a>
              <a href={`tel:${CONTACT.phoneHref}`} className="link-underline w-fit text-lg hover:text-(--color-accent)">
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </Reveal>

          <Reveal>
            <p className="eyebrow">Studio</p>
            <address className="mt-5 text-lg not-italic leading-relaxed text-(--color-ink-soft)">
              {CONTACT.address.street}
              <br />
              {CONTACT.address.locality}, {CONTACT.address.postalCode}
              <br />
              {CONTACT.address.country}
            </address>
          </Reveal>

          <Reveal>
            <p className="eyebrow">Connect</p>
            <div className="mt-5 flex items-center gap-5">
              {[
                { label: "Message Pink Tree Media on WhatsApp", href: whatsappHref(), Icon: WhatsApp },
                { label: "Pink Tree Media on Instagram", href: CONTACT.social.instagram, Icon: Instagram },
                { label: "Pink Tree Media on TikTok", href: CONTACT.social.tiktok, Icon: TikTok },
                { label: "Pink Tree Media on LinkedIn", href: CONTACT.social.linkedin, Icon: LinkedIn },
                { label: "Pink Tree Media on YouTube", href: CONTACT.social.youtube, Icon: YouTube },
              ].map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-(--color-ink-soft) transition-colors duration-500 hover:text-(--color-accent)"
                >
                  <Icon className="size-6" />
                </a>
              ))}
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
