import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";
import EnquiryEmail from "@/emails/EnquiryEmail";
import { CONTACT } from "@/lib/site";

export const runtime = "nodejs";

const TO = process.env.CONTACT_TO_EMAIL ?? CONTACT.email;
// Until a domain is verified in Resend, their onboarding sender works for tests.
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Pink Tree Media <onboarding@resend.dev>";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot tripped → pretend success, send nothing.
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;

  // Graceful local-dev path: no key configured → don't fail the demo.
  if (!apiKey) {
    console.warn(
      "[contact] RESEND_API_KEY not set — enquiry not emailed. Payload:",
      { name: data.name, email: data.email },
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: data.email,
      subject: `New enquiry — ${data.name}${data.company ? ` · ${data.company}` : ""}`,
      react: EnquiryEmail(data),
    });
    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json({ error: "Could not send your enquiry." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json({ error: "Could not send your enquiry." }, { status: 500 });
  }
}
