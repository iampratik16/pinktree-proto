# Pink Tree Media

A premium, performance-obsessed marketing site for **Pink Tree Media** — a UK luxury creative consultancy. Built with Next.js 15 (App Router, RSC), TypeScript, Tailwind CSS v4, Lenis, and GSAP.

> Mantra: _less content, less clutter, more impact — luxury brand, not agency._

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, React Server Components), TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Smooth scroll | Lenis (lazy-loaded, reduced-motion aware) |
| Animation | GSAP 3.15 + ScrollTrigger + SplitText (dynamically imported) |
| Page transitions | Custom GSAP/CSS cover-wipe overlay (no white flash) |
| Content | Typed TS files validated by **Zod** at build |
| Forms | Route Handler + **Resend** (+ React Email template) |
| Images | `next/image` (AVIF/WebP, blur placeholders, zero CLS) |
| Video | Self-hosted MP4/WebM ambient loops, poster-first, Mux-ready |
| Hosting | Vercel |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in keys (see below)
npm run dev                  # http://localhost:3000
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `node scripts/gen-media.mjs` | Regenerate placeholder imagery + blur map |

### Environment variables

See `.env.example`. All are optional for local development.

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Absolute origin for canonicals/sitemap/OG/structured data |
| `RESEND_API_KEY` | Enables contact-form email delivery. **If unset, the form still works locally but does not send** (logs a warning, returns success). |
| `CONTACT_TO_EMAIL` | Enquiry recipient (default `info@pinktreemedia.com`) |
| `CONTACT_FROM_EMAIL` | Verified Resend sender |

## Project structure

```
src/
  app/                 routes (home, work, work/[slug], about, contact, api/contact)
                       sitemap.ts · robots.ts · opengraph-image.tsx · icon.svg
  components/
    layout/            Header, Footer, FloatingActions (WhatsApp + Enquiry), Logo
    providers/         SmoothScroll (Lenis), RevealObserver, Cursor, PageTransition
    motion/            MaskHeading (CSS reveal), SplitHeading (GSAP), Reveal, Parallax
    media/             Img, Video (poster-first/IO/Mux-ready), Figure
    work/              WorkCard
    contact/           ContactForm
    seo/               JsonLd
  content/             schema.ts (Zod) · case-studies/*.ts · index.ts (validated loader)
  lib/                 site.ts · fonts.ts · gsap.ts · media.ts · structured-data.ts · hooks.ts
  emails/              EnquiryEmail.tsx (React Email)
scripts/gen-media.mjs  placeholder media generator
```

## How to add a case study

1. Create `src/content/case-studies/<slug>.ts` exporting a `CaseStudy` (see `chigwell-marquees.ts` for the full shape, or `_placeholder.ts` for a stub).
2. Import it into `src/content/index.ts` and add it to the `RAW` array. `order` controls position on the homepage + `/work`.
3. Add media under `public/media/work/<slug>/…` and run `node scripts/gen-media.mjs` (or drop in real assets — see `MEDIA-README.md`) so blur placeholders exist.
4. Zod validates on build — a missing `alt`, bad `slug`, or empty field fails the build loudly.

The homepage **Selected Work** and the **/work** index both read from this single source. Services are demonstrated _through_ case studies — there are no separate service pages.

## How to swap in Mux (longer video)

The `<Video>` component and `Media` schema are Mux-ready:

1. `npm i @mux/mux-player-react`.
2. In the case study data, set the media `provider: "mux"` and `muxPlaybackId: "<id>"`.
3. In `src/components/media/Video.tsx`, render `<MuxPlayer>` in the `media.provider === "mux"` branch (currently it falls back to poster). No consumer changes required.

## Motion & accessibility

- Every animation has a `prefers-reduced-motion` fallback; the site is fully usable and beautiful with JS/animation disabled.
- Lenis, GSAP and parallax are disabled under reduced motion; reveals fall back to instant.
- Designed keyboard focus styles, skip link, semantic landmarks, labelled form fields with inline errors.

## Performance

Lighthouse (production build): **Desktop 100/100/100/100**; **Mobile** Perf 96–98, A11y 98–100, Best-Practices 100, SEO 100, CLS 0. Animation libraries are code-split out of the critical path (first-load JS ≈ 114–118 KB gz). See the handoff summary in `HANDOFF.md`.

## Deploy (Vercel)

Push to a Git repo, import into Vercel, set the env vars above. Image optimisation, edge caching and OG image generation work out of the box. 301 redirects (old WordPress → new IA) are configured in `next.config.ts`.
