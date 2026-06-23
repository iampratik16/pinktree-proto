import { z } from "zod";

/** The four capabilities Pink Tree demonstrates through real work. */
export const DISCIPLINES = [
  "Design & Branding",
  "Print & Merchandise",
  "Websites & Digital",
  "Social Media",
] as const;

export const imageMediaSchema = z.object({
  type: z.literal("image"),
  src: z.string().min(1),
  alt: z.string().min(1, "Every image needs descriptive alt text (a11y)."),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  priority: z.boolean().optional(),
});

export const videoSourceSchema = z.object({
  src: z.string().min(1),
  // MIME type, e.g. "video/webm" or "video/mp4".
  type: z.string().min(1),
});

export const videoMediaSchema = z.object({
  type: z.literal("video"),
  poster: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Self-hosted MP4/WebM sources (omit when using Mux). */
  sources: z.array(videoSourceSchema).default([]),
  provider: z.enum(["self", "mux"]).default("self"),
  /** Mux playback id — set when provider === "mux" for longer clips. */
  muxPlaybackId: z.string().optional(),
});

export const mediaSchema = z.discriminatedUnion("type", [
  imageMediaSchema,
  videoMediaSchema,
]);

export const caseStudySchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  client: z.string().min(1),
  sector: z.string().min(1),
  /** Controls homepage + index ordering (ascending). */
  order: z.number().int(),
  /** Clearly-marked placeholder entries the client must still confirm. */
  placeholder: z.boolean().default(false),
  disciplines: z.array(z.enum(DISCIPLINES)).min(1),
  heroMedia: mediaSchema,
  oneLineOutcome: z.string().min(1),
  theClient: z.string().min(1),
  theChallenge: z.string().min(1),
  delivered: z
    .array(z.object({ area: z.enum(DISCIPLINES), summary: z.string().min(1) }))
    .min(1),
  work: z.array(mediaSchema).default([]),
  results: z
    .array(z.object({ value: z.string().optional(), label: z.string().min(1) }))
    .default([]),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    ogImage: z.string().min(1),
  }),
});

export type ImageMedia = z.infer<typeof imageMediaSchema>;
export type VideoMedia = z.infer<typeof videoMediaSchema>;
export type Media = z.infer<typeof mediaSchema>;
export type Discipline = (typeof DISCIPLINES)[number];
export type CaseStudy = z.infer<typeof caseStudySchema>;
