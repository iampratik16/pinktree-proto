# The Web Performance Build Standard

**A reusable rulebook for building fast websites — for every project going forward.**

Version 1 · Distilled from the Chigwell Marquees performance rescue (Next.js + Vercel).
Every number in the "Measured" lines is a real before/after result from that build.

---

## What we are trying to achieve

**One goal: the visitor sees a working, usable page as fast as possible — especially
the returning visitor, on a phone, on mobile data.**

Not the highest score on a tool. Not the smallest bundle for its own sake. The felt
experience of *"this site is quick"* for a real person who is not on office wi-fi and
has never seen the page before.

Three things this protects against, all of which we hit on a real project:

1. **A site that is ready but hidden.** The page had finished loading in ~0.3s but a
   splash screen kept it invisible until 5.4s — on *every* visit. The site was never
   slow. It was slow to *reveal*. Perceived speed is the product.
2. **A site that never gets faster.** Media was served with `Cache-Control: max-age=0`,
   so every returning visitor re-downloaded ~3MB from scratch. Your most loyal, most
   frequent users had the worst experience.
3. **A bug you can't see from your desk.** Localhost on wi-fi has infinite bandwidth and
   a warm cache — the exact opposite of a first-time mobile visitor. The whole problem
   was invisible until we tested cold, throttled, on mobile emulation.

**The test of success:** on a throttled "Slow 4G" cold load, meaningful content is
visible in about a second, and a second visit re-downloads almost nothing.

> **On the examples below:** the ❌ blocks are written for a Next.js/React project
> because that's where they were proven. The *principle* is universal — WordPress,
> Astro, plain HTML, Vue, all of it. Only the API names change. Read the principle,
> then find its equivalent on your stack.

---

## Phase 1 — Never make the user wait for what's already there

Perceived speed beats real speed. The most common "slow site" isn't slow; it's ready
and hidden behind an intro, a spinner, or a transition.

### Rule 1.1 — Show meaningful content in under one second, always

Something real must paint fast: text, a hero image, the actual page. A visitor staring
at a spinner at 3 seconds has already decided you're slow.

### Rule 1.2 — A splash/intro screen gates on the bare minimum, then leaves ⚠️

If you must have one:
- Gate it on fonts being ready, **never** on the full page-load event.
- Hard-cap it (~1.5s) so a slow asset can't trap the visitor.
- Show it **once per session**, not on every page view.

```jsx
// ❌ WHAT NOT TO DO — splash waits for the entire page, including
//    every below-fold image and the hero video. On slow 4G this is 5s+.
useEffect(() => {
  window.addEventListener("load", () => setSplashDone(true));
}, []);
// ...and it re-runs on every single navigation, with no "seen it" flag.

// ✅ DO THIS — gate on fonts only, hard cap, once per session.
useEffect(() => {
  if (sessionStorage.getItem("splash-seen")) { setSplashDone(true); return; }
  sessionStorage.setItem("splash-seen", "1");
  const cap = setTimeout(() => setSplashDone(true), 1500); // never trap the user
  document.fonts.ready.then(() => { clearTimeout(cap); setSplashDone(true); });
}, []);
```

> **Measured:** splash reveal 5.4s → ~1s first visit, ~0.1s on repeat visits.

### Rule 1.3 — Keep transitions short. Motion is seasoning, not the meal

Page-change curtains feel premium at ~300–500ms and feel *broken* at ~1.5s. Every
animation the user waits *through* is latency wearing a nice coat.

```jsx
// ❌ WHAT NOT TO DO — 0.8s curtain + 0.25s delay + 0.6s fade = ~1.65s
//    of dead time on every click.
transition={{ duration: 0.8 }}          // curtain
transition={{ duration: 0.6, delay: 0.25 }} // content

// ✅ DO THIS — half a second, total.
transition={{ duration: 0.45 }}
transition={{ duration: 0.4, delay: 0.1 }}
```

> **Measured:** route-change curtain 1.65s → 0.55s per click.

---

## Phase 2 — Load the right thing, in the right order

The browser can only do so much at once. What competes during the first second decides
how fast the page feels.

### Rule 2.1 — Only the hero loads eagerly. Everything below the fold is lazy

Mark the one above-the-fold hero image as eager/`priority`; let every other image load
as the user scrolls toward it.

```jsx
// ❌ WHAT NOT TO DO — priority on images the user won't see for five screens.
//    They fight the hero for bandwidth during the critical first second.
<Image src={gallery} priority />       // gallery, way below the fold
<Image src={footerLogo} priority />    // footer logo!

// ✅ DO THIS — priority ONLY on the true hero; the rest lazy-load by default.
<Image src={hero} priority sizes="100vw" />
<Image src={gallery} loading="lazy" />
```

> **Measured:** 3 eager below-fold images → 0.

### Rule 2.2 — Heavy media never blocks first paint. Defer it

Background video should not download during the critical load. Paint an instant poster
image, then start the clip afterwards.

```jsx
// ❌ WHAT NOT TO DO — autoPlay + preload="auto" start a multi-MB download
//    at parse time, starving fonts, CSS, and the hero image of bandwidth.
<video autoPlay preload="auto" poster={poster}>
  <source src="/hero.mp4" />
</video>

// ✅ DO THIS — preload nothing; start playback after the page has loaded.
<video muted loop playsInline preload="none">   {/* no autoPlay attribute */}
  <source src="/hero.mp4" />
</video>
// then, in an effect:
if (document.readyState === "complete") video.play();
else window.addEventListener("load", () => video.play(), { once: true });
```

> **Measured:** 1.5MB hero video pulled off the critical path entirely.

### Rule 2.3 — Load every asset exactly once. No duplicates

```jsx
// ❌ WHAT NOT TO DO — the poster attribute re-downloads the SAME frame the
//    optimized <Image> underlay already painted. Same picture, twice.
<Image src={poster} priority fill />          {/* optimized: ~110KB AVIF */}
<video poster="/hero-poster.jpg" ... />        {/* raw again: +135KB */}

// ✅ DO THIS — the <Image> underlay IS the poster. Don't set the attribute.
<Image src={poster} priority fill />
<video preload="none" ... />                   {/* no poster attr */}
```

> **Measured:** duplicate poster fetch removed, 245KB → 110KB.

---

## Phase 3 — Send fewer bytes, and send them once

The cheapest byte is the one you never send. The second cheapest is the one the browser
already has cached.

### Rule 3.1 — Serve modern image formats, sized per device — automatically

Store a high-quality source (JPG/PNG is fine as *source*); let the framework deliver
AVIF/WebP, resized via `srcset`/`sizes`. A phone must never download a desktop-width
image.

```jsx
// ❌ WHAT NOT TO DO — raw source file straight to the browser, one size for all.
//    Every phone downloads the full 2400px, 800KB original.
<img src="/media/hero.jpg" />

// ✅ DO THIS — the image pipeline serves AVIF, resized to the device.
<Image src="/media/hero.jpg" sizes="(max-width: 768px) 100vw, 50vw" />
// Next config: formats: ["image/avif", "image/webp"]
```

> **Measured:** all photos served as AVIF; a phone pulls the ~640px cut, not 1200px.

### Rule 3.2 — Compress video properly, and give phones a smaller cut

A muted background clip needs a fraction of a watchable video's bitrate.

```bash
# ✅ Re-encode: H.264, CRF ~27, strip audio, web-optimised. Roughly halves size.
ffmpeg -i hero.mp4 -c:v libx264 -crf 27 -preset slow -an \
       -movflags +faststart hero-v2.mp4

# ✅ A ~480p variant for phones (swap in at <768px viewport):
ffmpeg -i hero.mp4 -vf "scale=-2:480" -c:v libx264 -crf 28 -an \
       -movflags +faststart hero-v2-sm.mp4
```

> **Measured:** video folder 18MB → 13.5MB; phone hero 1.5MB → 0.9MB.

### Rule 3.3 — Cache static media hard, so repeat visits cost almost nothing

Send static assets with a long, immutable cache header. The default on many hosts is
`max-age=0`, which silently re-downloads everything on every visit.

```js
// ❌ WHAT NOT TO DO — leaving the host default (often max-age=0).
//    Every returning visitor re-downloads every image and video, every time.

// ✅ DO THIS — one year, immutable, for anything static.
async headers() {
  return [{
    source: "/media/:path*",
    headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
  }];
}
```

> **Measured (WebPageTest):** repeat-visit download 3MB → **103KB**.

### Rule 3.4 — When you cache forever, you must rename to replace ⚠️

Immutable caching means a browser keeps `hero.mp4` for up to a year. Overwriting the
file in place ships **nothing** to returning visitors — the new version needs a new
name. This is a discipline the caching buys you, not a bug.

```
# ❌ WHAT NOT TO DO — overwrite in place. Returning visitors keep the old file
#    for up to a year and never see the change.
public/media/hero.mp4   (replaced, same name)

# ✅ DO THIS — new version, new name.
public/media/hero-v2.mp4
```

> **Measured:** every re-encoded video was suffixed `-v2` for exactly this reason.

---

## Phase 4 — Measure like a stranger, on a real phone

Localhost on office wi-fi lies. Infinite bandwidth, warm cache — the opposite of a
first-time visitor on 4G.

### Rule 4.1 — Test throttled, cold, and on mobile emulation — never warm wi-fi

```
# ✅ Chrome DevTools → Network tab:
#    - Throttle: "Slow 4G"
#    - Check "Disable cache"
#    - Device toolbar: emulate a mid-range phone
# Or run PageSpeed Insights / WebPageTest on the LIVE url — they throttle for you.
```

> **Measured:** the entire slowness was invisible on localhost. It only appeared cold + throttled.

### Rule 4.2 — Trust field data over lab scores. Instrument the real moment

Lab metrics have blind spots: a full-screen hero can be excluded from LCP; a looping
video breaks "visually complete." Add real-user monitoring and a custom mark for the
moment that actually matters.

```js
// ✅ Mark the true "content is visible" moment yourself, and read it in
//    DevTools / PageSpeed User Timing. This is your real "loaded" number.
performance.mark("content-visible");

// ✅ Add real-user monitoring so you see actual visitors, per device/country:
//    e.g. Vercel Speed Insights, or any RUM tool. Field data > lab data.
```

> **Measured:** a custom `splash:dismissed` mark gave the true reveal time the lab LCP hid.

### Rule 4.3 — Keep the repo lean: commit what ships, ignore the rest

Media the CDN serves belongs in the repo. Raw source exports, dead imports, and scratch
files do not — they bloat every clone and every deploy for zero user benefit. Audit
references **before** deleting, both directions (nothing referenced is missing; nothing
remaining is unreferenced).

> **Measured:** removed 78MB of unreferenced media + source dumps from the tracked repo.

---

## The never list

Short version. If you're doing any of these, stop.

- ❌ **Never gate anything on the window `load` event.** It waits for the slowest asset on the page — usually the one you least need.
- ❌ **Never hand-ship a raw JPG/PNG/MP4 straight to the browser.** The source file is not the delivery file — run it through the pipeline or compress it.
- ❌ **Never lazy-load the hero.** The one thing above the fold is the one thing that must load first.
- ❌ **Never leave caching at the host default.** `max-age=0` punishes your most frequent visitors on every visit.
- ❌ **Never judge speed on localhost + wi-fi.** Infinite bandwidth and a warm cache hide the exact bug the client is reporting.
- ❌ **Never overwrite an immutably-cached file in place.** Rename it, or returning visitors keep the stale copy for a year.

---

## Pre-ship checklist

Run this before every launch. If all six pass **on a throttled cold load**, you're done.

- [ ] **Meaningful content paints under 1s** on Slow 4G, cache disabled.
- [ ] **Only the hero loads eagerly;** everything else is lazy.
- [ ] **No asset is downloaded twice,** and no raw source file is served.
- [ ] **Static media returns a long, immutable cache header** (not `max-age=0`).
- [ ] **A repeat visit re-downloads almost nothing** (reload → total transfer collapses to a few KB).
- [ ] **PageSpeed / WebPageTest run on the live URL, mobile,** results saved; field-data monitoring enabled for the weeks after launch.

---

*These are the fundamentals — deliberately format-agnostic. Extend per project, but
don't ship below this line. When a rule and a design wish conflict, measure both and let
the numbers decide.*
