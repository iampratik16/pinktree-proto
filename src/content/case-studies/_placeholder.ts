import type { CaseStudy, Discipline, Media } from "@/content/schema";
import { img, loop } from "@/lib/media";

/**
 * Builds a case study from a compact spec: handles the hero (image or Veo
 * hover-loop), the "The Work" gallery and SEO boilerplate, while the narrative
 * copy (client, challenge, what we delivered) is supplied per study. No hard
 * result metrics are invented — `results` stays empty until real figures exist.
 */
export function buildStudy(opts: {
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
  oneLineOutcome: string;
  theClient: string;
  theChallenge: string;
  /** "What we delivered" summary, keyed by discipline. */
  delivered: Partial<Record<Discipline, string>>;
}): CaseStudy {
  const { slug, client, sector, order, disciplines, heroSrc, heroAlt, heroVideo } = opts;
  return {
    slug,
    client,
    sector,
    order,
    placeholder: false,
    disciplines,
    heroMedia: heroVideo
      ? loop(heroSrc.replace(/\.[^.]+$/, ""), heroSrc, heroAlt, 2560, 1600)
      : img(heroSrc, heroAlt, 2560, 1600),
    oneLineOutcome: opts.oneLineOutcome,
    theClient: opts.theClient,
    theChallenge: opts.theChallenge,
    delivered: disciplines.map((area) => ({
      area,
      summary: opts.delivered[area] ?? "",
    })),
    work: opts.work ?? [],
    results: [],
    seo: {
      title: `${client}, Case study`,
      description: `A Pink Tree Media case study for ${client}. ${opts.oneLineOutcome}`,
      ogImage: heroSrc,
    },
    liveUrl: opts.liveUrl,
  };
}
