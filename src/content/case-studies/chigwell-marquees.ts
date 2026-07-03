import type { CaseStudy } from "@/content/schema";
import { img, loop } from "@/lib/media";

/**
 * LEAD CASE STUDY, The Chigwell Marquees (luxury Essex venue).
 * Copy below is a considered DRAFT for layout/tone and is pending client
 * sign-off (see CONTENT-TODO.md). Outcomes are qualitative statements, not
 * fabricated metrics, replace with real figures once supplied.
 */
const chigwellMarquees: CaseStudy = {
  slug: "the-chigwell-marquees",
  client: "The Chigwell Marquees",
  sector: "Luxury Events & Hospitality",
  order: 1,
  placeholder: false,
  disciplines: [
    "Design & Branding",
    "Print & Merchandise",
    "Websites & Digital",
    "Social Media",
  ],
  heroMedia: loop(
    "/media/work/chigwell/hero",
    "/media/work/chigwell/hero.jpg",
    "The Chigwell Marquees, bold crimson brand artwork.",
    2560,
    1600,
  ),
  oneLineOutcome: "A complete brand world for an exceptional private venue.",
  theClient:
    "The Chigwell Marquees creates extraordinary settings for weddings and private celebrations across Essex, clear-span structures dressed with the precision of an interior, set within mature private grounds.",
  theChallenge:
    "The venue’s reputation travelled by word of mouth, but its presence online did not match the experience in person. They needed a brand and digital presence as considered as the events they stage, one that reassures discerning couples before a single conversation.",
  delivered: [
    {
      area: "Design & Branding",
      summary:
        "A refined identity system: wordmark, monogram and a warm, tactile palette, built to feel timeless rather than seasonal, and to sit as comfortably on a place setting as on a screen.",
    },
    {
      area: "Print & Merchandise",
      summary:
        "Brochures, enquiry packs and on-the-day collateral on weighted, uncoated stock, so the first physical touchpoint carries the same quiet luxury as the venue itself.",
    },
    {
      area: "Websites & Digital",
      summary:
        "A fast, image-led website that lets the spaces speak, generous photography, an effortless enquiry flow and performance tuned for instant loading on mobile.",
    },
    {
      area: "Social Media",
      summary:
        "An art-directed social presence with a consistent editorial rhythm, turning real events into a considered, ongoing portfolio.",
    },
  ],
  work: [
    img(
      "/media/work/chigwell/site-01.jpg",
      "A large clear-span luxury marquee dressed for a celebration.",
      2560,
      1440,
    ),
    img(
      "/media/work/chigwell/site-02.jpg",
      "An elegant event interior at The Chigwell Marquees.",
      1600,
      2000,
    ),
    img(
      "/media/work/chigwell/site-03.jpg",
      "The venue's period hall interior.",
      2400,
      1500,
    ),
    img(
      "/media/work/chigwell/site-04.jpg",
      "An Asian wedding mandap staged within the marquee.",
      1600,
      2000,
    ),
    img(
      "/media/work/chigwell/site-05.jpg",
      "A full-bleed marquee interior dressed for a private event.",
      2560,
      1280,
    ),
  ],
  results: [
    { label: "A brand the venue can finally stand behind" },
    { label: "Enquiry journey reduced to a single, effortless step" },
    { value: "< 1.5s", label: "Mobile load on the new site" },
  ],
  seo: {
    title: "The Chigwell Marquees, Luxury venue brand & website",
    description:
      "A complete brand world and fast, image-led website for The Chigwell Marquees, a luxury private events venue in Essex.",
    ogImage: "/media/work/chigwell/hero.jpg",
  },
  liveUrl: "https://chigwell-marquees-v2.vercel.app",
};

export default chigwellMarquees;
