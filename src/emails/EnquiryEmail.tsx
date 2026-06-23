import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ContactInput } from "@/lib/contact-schema";

const PAPER = "#F5F2EC";
const INK = "#14110F";
const SOFT = "#6B645C";
const ACCENT = "#A86B72";

export default function EnquiryEmail({ name, email, telephone, company, enquiry }: ContactInput) {
  return (
    <Html>
      <Head />
      <Preview>New enquiry from {name}</Preview>
      <Body style={{ backgroundColor: PAPER, fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#fff", padding: 40, borderRadius: 4 }}>
          <Text style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, margin: 0 }}>
            Pink Tree Media
          </Text>
          <Heading style={{ fontSize: 24, fontWeight: 400, color: INK, margin: "12px 0 24px" }}>
            New enquiry
          </Heading>
          <Hr style={{ borderColor: "#E2DCD2", margin: "0 0 24px" }} />

          <Section>
            <Field label="Name" value={name} />
            <Field label="Email" value={email} />
            {telephone ? <Field label="Telephone" value={telephone} /> : null}
            {company ? <Field label="Company" value={company} /> : null}
          </Section>

          <Hr style={{ borderColor: "#E2DCD2", margin: "8px 0 24px" }} />

          <Text style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: SOFT, margin: "0 0 6px" }}>
            Enquiry
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 1.6, color: INK, margin: 0, whiteSpace: "pre-wrap" }}>
            {enquiry}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ fontSize: 15, color: INK, margin: "0 0 10px" }}>
      <span style={{ color: SOFT }}>{label}:&nbsp;</span>
      {value}
    </Text>
  );
}
