import { placeholderStudy } from "@/content/case-studies/_placeholder";
import { img } from "@/lib/media";

// TODO: client to confirm (planning §13.1) and supply real copy/results.
export default placeholderStudy({
  slug: "swifty-beats",
  client: "Swifty Beats",
  sector: "Music & Entertainment",
  order: 3,
  disciplines: ["Design & Branding", "Social Media"],
  heroSrc: "/media/work/swifty/hero.jpg",
  heroAlt: "Swifty Beats, a live festival stage lit in gold and purple.",
  heroVideo: true,
  liveUrl: "https://swiftybeats.vercel.app",
  work: [
    img("/media/work/swifty/site-01.jpg", "Swifty Beats, a warm-lit recording studio.", 2400, 1680),
    img("/media/work/swifty/site-02.jpg", "Swifty Beats, a live broadcast set.", 2400, 1680),
    img("/media/work/swifty/site-03.jpg", "Swifty Beats, hands mixing on a DJ deck.", 2560, 1280),
  ],
});
