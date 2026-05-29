import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "./components/CookieBanner";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Resolve relative metadata URLs (og:image, canonical) against the real
// deployment domain. On Vercel this is the production custom domain once set
// (e.g. nightly.gr), or the *.vercel.app domain until then. Falls back to the
// final domain for local builds.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://nightly.gr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "nightly.gr | Greek islands, in the know.",
    template: "%s · nightly.gr",
  },
  description:
    "An insider calendar for the Greek islands. Dates, rooms, lineups, and island intel before plans get made.",
  openGraph: {
    type: "website",
    siteName: "nightly.gr",
    title: "nightly.gr | Greek islands, in the know.",
    description: "Dates, rooms, lineups, and island intel before plans get made.",
  },
  twitter: { card: "summary_large_image" },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://nightly.gr/#org",
      name: "nightly.gr",
      url: "https://nightly.gr",
    },
    {
      "@type": "WebSite",
      "@id": "https://nightly.gr/#site",
      name: "nightly.gr",
      url: "https://nightly.gr",
      description: "An insider calendar for nightlife across the Greek islands.",
      publisher: { "@id": "https://nightly.gr/#org" },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        {children}
        <CookieBanner />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </body>
    </html>
  );
}
