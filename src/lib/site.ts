/**
 * Single source of truth for site-wide constants: contact details, nav, social.
 * Real, client-supplied details from the brief. The WhatsApp number is a
 * placeholder (see CONTENT-TODO.md / planning §13.8) until confirmed.
 */

export const SITE = {
  name: "Pink Tree Media",
  shortName: "Pink Tree",
  // Used for absolute URLs (OG images, sitemap, structured data).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pinktreemedia.com",
  description:
    "Pink Tree Media provides complete marketing solutions for ambitious brands, a UK luxury creative consultancy spanning design, print, digital and social.",
  tagline: "Complete marketing solutions for ambitious brands.",
  locale: "en_GB",
} as const;

export const CONTACT = {
  email: "info@pinktreemedia.com",
  phoneDisplay: "+44 (0) 20 7193 1033",
  phoneHref: "+442071931033",
  // TODO: client to confirm whether WhatsApp is the landline or a dedicated
  // WhatsApp Business line (planning §13.8). Placeholder uses the landline.
  whatsappNumber: "442071931033",
  whatsappMessage:
    "Hello Pink Tree Media, I'd like to start a conversation about a project.",
  address: {
    street: "High Road",
    locality: "Chigwell",
    postalCode: "IG7 5BD",
    region: "Essex",
    country: "United Kingdom",
  },
  social: {
    handle: "@pinktreemediauk",
    instagram: "https://www.instagram.com/pinktreemediauk",
  },
} as const;

export const NAV: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const CAPABILITIES = [
  "Design & Branding",
  "Print & Merchandise",
  "Websites & Digital",
  "Social Media",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

/** Builds the WhatsApp deep link with a prefilled message. */
export function whatsappHref(message: string = CONTACT.whatsappMessage): string {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
