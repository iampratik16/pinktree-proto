import type { CaseStudy, Discipline } from "@/content/schema";
import { img } from "@/lib/media";

/**
 * Builds a clearly-marked PLACEHOLDER case study. Copy is neutral and obviously
 * provisional — Pink Tree to confirm the client and supply real assets, copy
 * and results (see CONTENT-TODO.md). No client results are fabricated.
 */
export function placeholderStudy(opts: {
  slug: string;
  client: string;
  sector: string;
  order: number;
  disciplines: Discipline[];
  heroSrc: string;
  heroAlt: string;
}): CaseStudy {
  const { slug, client, sector, order, disciplines, heroSrc, heroAlt } = opts;
  return {
    slug,
    client,
    sector,
    order,
    placeholder: true,
    disciplines,
    heroMedia: img(heroSrc, heroAlt, 2560, 1600),
    oneLineOutcome: "Case study in preparation.",
    theClient:
      "TODO: client to supply — a short paragraph introducing who they are.",
    theChallenge:
      "TODO: client to supply — a short paragraph on what they needed.",
    delivered: disciplines.map((area) => ({
      area,
      summary: `TODO: client to supply — what Pink Tree delivered under ${area}.`,
    })),
    work: [],
    results: [],
    seo: {
      title: `${client} — Case study`,
      description: `A Pink Tree Media case study for ${client}. Details to follow.`,
      ogImage: heroSrc,
    },
  };
}
