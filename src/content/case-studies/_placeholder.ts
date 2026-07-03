import type { CaseStudy, Discipline, Media } from "@/content/schema";
import { img, loop } from "@/lib/media";

/**
 * Builds a clearly-marked PLACEHOLDER case study. Copy is neutral and obviously
 * provisional, Pink Tree to confirm the client and supply real assets, copy
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
  /** When true, the hero plays a Veo ambient loop on hover (poster = heroSrc). */
  heroVideo?: boolean;
  /** Real project imagery for the "The Work" section. */
  work?: Media[];
  /** Live website we built for this client, if published. */
  liveUrl?: string;
}): CaseStudy {
  const { slug, client, sector, order, disciplines, heroSrc, heroAlt, heroVideo } = opts;
  return {
    slug,
    client,
    sector,
    order,
    placeholder: true,
    disciplines,
    heroMedia: heroVideo
      ? loop(heroSrc.replace(/\.[^.]+$/, ""), heroSrc, heroAlt, 2560, 1600)
      : img(heroSrc, heroAlt, 2560, 1600),
    oneLineOutcome: "Case study in preparation.",
    theClient:
      "TODO: client to supply, a short paragraph introducing who they are.",
    theChallenge:
      "TODO: client to supply, a short paragraph on what they needed.",
    delivered: disciplines.map((area) => ({
      area,
      summary: `TODO: client to supply, what Pink Tree delivered under ${area}.`,
    })),
    work: opts.work ?? [],
    results: [],
    seo: {
      title: `${client}, Case study`,
      description: `A Pink Tree Media case study for ${client}. Details to follow.`,
      ogImage: heroSrc,
    },
    liveUrl: opts.liveUrl,
  };
}
