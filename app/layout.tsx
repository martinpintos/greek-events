import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://nightly.gr"),
  title: {
    default: "Nightly.gr — Greek islands, after dark.",
    template: "%s · Nightly.gr",
  },
  description:
    "An event calendar for the Greek islands — Mykonos, Santorini, Ios, Paros, Rhodes. The spots we'd send our own friends to, no algorithms.",
  openGraph: {
    type: "website",
    siteName: "Nightly.gr",
    title: "Nightly.gr — Greek islands, after dark.",
    description:
      "Tonight's parties across the Greek islands. Editorial, curated, no algorithms.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
