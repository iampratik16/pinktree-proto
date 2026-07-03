/**
 * Ambient site-wide background: soft brand-tinted gradient blobs drifting slowly
 * behind all content. Pure CSS (no JS, no dependency) — the `.site-bg` layer is
 * `position: fixed` at a negative z-index, so it paints over the body colour but
 * under every section; transparent sections reveal it, dark sections cover it.
 * Transform-only keyframes keep it GPU-composited; frozen under reduced motion.
 */
export default function SiteBackground() {
  return (
    <div className="site-bg" aria-hidden>
      <span className="b1" />
      <span className="b2" />
      <span className="b3" />
      <span className="b4" />
    </div>
  );
}
