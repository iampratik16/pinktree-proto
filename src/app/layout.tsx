import type { Metadata, Viewport } from "next";
import { archivo, hanken, fraunces } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import RevealObserver from "@/components/providers/RevealObserver";
import Cursor from "@/components/providers/Cursor";
import PageTransition from "@/components/providers/PageTransition";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/layout/FloatingActions";
import JsonLd from "@/components/seo/JsonLd";
import { organizationLd, localBusinessLd } from "@/lib/structured-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#14110f",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${archivo.variable} ${hanken.variable} ${fraunces.variable}`}
      // The inline script below adds the `js` (and later `gsap-failsafe`)
      // classes before hydration; suppress the expected html-attribute diff so
      // React doesn't discard and re-render the tree.
      suppressHydrationWarning
    >
      <head>
        {/* Enable JS-gated reveal styles before paint to avoid any flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');" +
              // Failsafe: if GSAP is slow or blocked, reveal split headings anyway.
              "setTimeout(function(){document.documentElement.classList.add('gsap-failsafe')},2500);",
          }}
        />
      </head>
      <body>
        <SmoothScroll />
        <RevealObserver />
        <Cursor />
        <PageTransition>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <FloatingActions />
        </PageTransition>
        <JsonLd data={[organizationLd(), localBusinessLd()]} />
      </body>
    </html>
  );
}
