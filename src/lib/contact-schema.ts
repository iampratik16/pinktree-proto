import { z } from "zod";

/**
 * Shared contact-form schema (client + server). No server-only imports so it
 * can power inline validation in the browser and authoritative validation in
 * the Route Handler.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(160),
  telephone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+()\d\s-]{7,}$/, "Please enter a valid telephone number.")
    .or(z.literal(""))
    .optional(),
  company: z.string().trim().max(160).optional(),
  enquiry: z
    .string()
    .trim()
    .min(10, "Please tell us a little more (at least 10 characters).")
    .max(4000),
  // Honeypot — humans never see it. Non-empty is handled in the Route Handler
  // (silent success, no email) rather than as a visible validation error.
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const CONTACT_FIELDS = [
  { name: "name", label: "Name", type: "text", required: true, autoComplete: "name" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "telephone", label: "Telephone", type: "tel", required: false, autoComplete: "tel" },
  { name: "company", label: "Company Name", type: "text", required: false, autoComplete: "organization" },
] as const;
