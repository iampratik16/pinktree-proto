import type { Metadata, Viewport } from "next";
import { fraunces, inter } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import RevealObserver from "@/components/providers/RevealObserver";
import Cursor from "@/components/providers/Cursor";
import PageTransition from "@/components/providers/PageTransition";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/layout/FloatingActions";
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
    <html lang="en-GB" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        {/* Enable JS-gated reveal styles before paint to avoid any flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
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
      </body>
    </html>
  );
}
