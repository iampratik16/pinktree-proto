"use client";

import { useEffect, useState } from "react";

/**
 * Initial-load preloader: a gooey rosewood blob (Uiverse "young-walrus-64",
 * retuned to the brand) covers the viewport on a hard page load, then fades to
 * reveal the page. Only full loads show it — client-side route changes use the
 * page-transition curtain instead. Skipped under reduced motion.
 *
 * The blob is a metaball: 7 blurred SVG polygons rotate inside an SVG mask, and
 * `filter: contrast(15)` on the mask fuses them into one morphing shape that
 * clips the gradient `.box` (see the `.loader` rules in globals.css).
 */
export default function Preloader() {
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Reduced motion → don't hold the page behind an animated loader.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    const MIN = 900; // keep the blob visible long enough to read, not flash
    const start = performance.now();
    let capId = 0;
    const finish = () => {
      const wait = Math.max(0, MIN - (performance.now() - start));
      window.setTimeout(() => setDone(true), wait);
    };
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      capId = window.setTimeout(finish, 4000); // never hold longer than 4s
    }
    return () => {
      window.removeEventListener("load", finish);
      if (capId) window.clearTimeout(capId);
    };
  }, []);

  // Unmount once the fade-out has finished.
  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setGone(true), 650);
    return () => window.clearTimeout(id);
  }, [done]);

  if (gone) return null;

  return (
    <div className="preloader" data-done={done} role="status" aria-label="Loading">
      <div className="loader">
        <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <mask id="clipping">
              <polygon points="0,0 100,0 100,100 0,100" fill="black" />
              <polygon points="25,25 75,25 50,75" fill="white" />
              <polygon points="50,25 75,75 25,75" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
            </mask>
          </defs>
        </svg>
        <div className="box" />
      </div>
    </div>
  );
}
