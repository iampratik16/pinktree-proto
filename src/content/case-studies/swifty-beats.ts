import { buildStudy } from "@/content/case-studies/_placeholder";
import { img } from "@/lib/media";

export default buildStudy({
  slug: "swifty-beats",
  client: "Swifty Beats",
  sector: "Music & Entertainment",
  order: 3,
  disciplines: ["Design & Branding", "Social Media"],
  heroSrc: "/media/work/swifty/hero.jpg",
  heroAlt: "Swifty Beats, a live festival stage lit in gold and purple.",
  heroVideo: true,
  liveUrl: "https://swiftybeats.vercel.app",
  oneLineOutcome: "A bold identity and social rhythm for a rising music brand.",
  theClient:
    "Swifty Beats is a music and entertainment brand built around live events, studio sessions and a fast-growing online audience, a name that trades on energy, momentum and a distinct sound.",
  theChallenge:
    "The music spoke for itself, but the brand around it did not yet match its ambition. Swifty Beats needed a bold, unmistakable identity and a social presence with the same rhythm as the sets, one that carries across stages, screens and streaming platforms.",
  delivered: {
    "Design & Branding":
      "A high-energy identity built for motion: a flexible logo, a charged colour palette and a typographic system designed to hold its own against neon, stage light and a small phone screen alike.",
    "Social Media":
      "A content system with a consistent visual beat, turning clips, releases and live moments into a recognisable feed that keeps the audience warm between events.",
  },
  work: [
    img("/media/work/swifty/site-01.jpg", "Swifty Beats, a warm-lit recording studio.", 2400, 1680),
    img("/media/work/swifty/site-02.jpg", "Swifty Beats, a live broadcast set.", 2400, 1680),
    img("/media/work/swifty/site-03.jpg", "Swifty Beats, hands mixing on a DJ deck.", 2560, 1280),
  ],
});
