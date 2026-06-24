import { SITE, CONTACT } from "@/lib/site";
import type { CaseStudy } from "@/content/schema";

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE.url}${path}`);

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    email: CONTACT.email,
    telephone: CONTACT.phoneDisplay,
    sameAs: [CONTACT.social.instagram],
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.locality,
      postalCode: CONTACT.address.postalCode,
      addressRegion: CONTACT.address.region,
      addressCountry: "GB",
    },
  };
}

export function localBusinessLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE.url}/#localbusiness`,
    name: SITE.name,
    image: abs("/media/hero/home.jpg"),
    url: SITE.url,
    telephone: CONTACT.phoneDisplay,
    email: CONTACT.email,
    priceRange: "£££",
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.locality,
      postalCode: CONTACT.address.postalCode,
      addressRegion: CONTACT.address.region,
      addressCountry: "GB",
    },
    areaServed: "United Kingdom",
  };
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function caseStudyLd(study: CaseStudy) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${study.client} — ${study.oneLineOutcome}`,
    headline: study.seo.title,
    description: study.seo.description,
    url: `${SITE.url}/work/${study.slug}`,
    image: abs(study.seo.ogImage),
    about: study.sector,
    keywords: study.disciplines.join(", "),
    creator: { "@id": `${SITE.url}/#organization` },
  };
}
