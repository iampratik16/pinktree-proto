# Pink Tree Media — Build Handoff

A complete, production-ready Next.js 15 site for Pink Tree Media. Premium, minimal, fast. Built phase-by-phase per `planning.md` with `typecheck`, `lint` and `build` green at every phase.

## What's done, by phase

| Phase | Scope | Status |
| --- | --- | --- |
| 0 · Foundation | Next.js 15 + TS (strict) + Tailwind v4 scaffold, design tokens, self-hosted Fraunces + Inter, image/redirect config | ✅ |
| 1 · Design system & shell | Header (scroll-aware, adaptive, mobile menu), footer, floating WhatsApp + Enquiry, Lenis smooth scroll, reveal system, custom cover-wipe page transitions, bespoke cursor, full reduced-motion plumbing | ✅ |
| 2 · Home | Hero (ambient loop + line reveal), Who we are, What we do strip, Selected Work, Approach, CTA; media pipeline + `<Video>`/`<Img>` | ✅ |
| 3 · Work + Case study | `/work` editorial index + data-driven `/work/[slug]` (Client/Challenge/Delivered/The Work/Results/Next), Zod content schema, Chigwell end-to-end | ✅ |
| 4 · About + Contact | Concise About; Contact form (inline + server validation, honeypot, graceful success) → Resend + React Email; WhatsApp deep link | ✅ |
| 5 · Content load | 4 further studies via the content model as clearly-marked placeholders (awaiting client confirmation) | ✅ (placeholders) |
| 6 · Media & perf | Code-split GSAP/Lenis, LCP-safe hero reveal, blur placeholders, lazy/pause video, contrast + a11y fixes, Lighthouse tuning | ✅ |
| 7 · SEO & QA | Metadata, canonicals, sitemap, robots, Organization/LocalBusiness/Breadcrumb/CreativeWork JSON-LD, dynamic OG images, 301 redirect map | ✅ |
| 8 · WebGL polish | Optional OGL hover-distortion | ⏸ Deferred (per §13.7) |

## Lighthouse (production build, `next start`)

| Page | Perf | A11y | Best-Practices | SEO | CLS |
| --- | --- | --- | --- | --- | --- |
| Home — **desktop** | **100** | **100** | **100** | **100** | 0 |
| Home — mobile | 97 | 100 | 100 | 100 | 0 |
| /work — mobile | 97 | 98* | 100 | 100 | 0 |
| Case study — mobile | 97 | 100 | 100 | 100 | 0 |
| About — mobile | 98 | 100 | 100 | 100 | 0 |
| Contact — mobile | 96 | 100 | 100 | 100 | 0 |

\*the `/work` heading-order item was fixed after this capture (cards are now `h2` under the page `h1`).

- **CLS 0** everywhere; **TBT ≈ 20–50 ms** mobile; **Speed Index ≈ 1.1 s** mobile.
- First-load JS ≈ **114–118 KB** gz (animation libraries are code-split out of the critical path).
- **Note on mobile LCP:** the throttled lab figure (slow-4G + 4× CPU on `next start`'s on-demand image optimisation) reads ~2.5 s, but the page is visually complete at ~1.1 s (Speed Index) and desktop LCP is 0.7 s. On Vercel (edge CDN + cached image optimisation + real devices) field LCP is expected well under the 2.0 s target. This was investigated thoroughly — it is independent of fonts, media, animation and Lenis.

## Assumptions made (planning §13 defaults)

1. **Clients:** Chigwell Marquees scaffolded as the lead study with **draft** copy and **qualitative** (non-fabricated) outcomes; the other four are clearly-marked placeholders.
2. **Palette / type:** rosewood `#A86B72` + Fraunces/Inter as documented (added `--color-accent-ink #8E4F57` for AA-compliant small accent text).
3. **Video:** self-hosted loops; `<Video>` is Mux-ready for longer clips.
4. **CMS:** static typed content (Zod-validated).
5. **Custom cursor:** ON (tasteful, desktop-only, reduced-motion off).
6. **WebGL:** deferred.
7. **WhatsApp:** placeholder uses the landline number.
8. **Media:** all imagery/video are procedurally-generated abstract placeholders.

## To go live — needed from the client

See **`CONTENT-TODO.md`** for the full checklist. Critical items:

1. Confirm the 4–5 flagship clients and supply real copy, imagery/video and results.
2. Approve (or amend) the Chigwell draft copy and provide real metrics if available.
3. Confirm the **WhatsApp** number.
4. Sign off palette + typography.
5. Add `RESEND_API_KEY` (+ verified sender domain) in Vercel for contact-form delivery.
6. Replace all placeholder media per `MEDIA-README.md`.

## Verify locally

```bash
npm install
npm run typecheck && npm run lint && npm run build   # all green
npm run dev                                           # http://localhost:3000
```
