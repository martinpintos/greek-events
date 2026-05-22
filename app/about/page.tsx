import type { Metadata } from "next";
import { getAllEvents, getVenues } from "@/lib/data";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChromeOverlays } from "../components/ChromeOverlays";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description:
    "A small editorial desk for the Greek islands. Dates, rooms, lineups, and island intel before plans get made.",
  alternates: { canonical: "/about" },
};

export default async function About() {
  const [events, venues] = await Promise.all([getAllEvents(), getVenues()]);

  return (
    <ChromeOverlays events={events} venues={venues}>
      <Header />
      <main className="mx-auto max-w-3xl px-4 md:px-8 py-10 md:py-16">
        <div className="eyebrow eyebrow-accent mb-3 inline-flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
          About
        </div>
        <h1 className="display-h text-5xl md:text-7xl leading-[0.95] m-0 mb-8">
          Greek islands, <em className="not-italic text-accent">in the know.</em>
        </h1>

        <p className="display-h text-xl md:text-2xl leading-[1.32] m-0 mb-10">
          Nightly.gr is a small editorial desk for the Greek islands. We tell you which dates
          matter, which rooms are worth the taxi, and where we&rsquo;d send our own friends.
        </p>

        <div className="eyebrow rule-label mb-3">Coverage</div>
        <p className="text-base leading-relaxed text-ink-2 m-0">
          We start with Mykonos for the 2026 season. Santorini, Ios, Paros, and Rhodes follow once
          we have the same editorial bench in each town. We don&rsquo;t list something just to fill
          a date.
        </p>

        <div className="eyebrow rule-label mt-10 mb-3">Contact</div>
        <p className="text-base leading-relaxed text-ink-2 m-0">
          Tips, submissions, partnerships, corrections:{" "}
          <a
            href="mailto:nightlygreece@gmail.com"
            className="text-accent underline underline-offset-2"
          >
            nightlygreece@gmail.com
          </a>
          .
        </p>

        <div id="privacy" className="eyebrow rule-label mt-10 mb-3">
          Privacy
        </div>
        <p className="text-base leading-relaxed text-ink-2 m-0">
          We don&rsquo;t track you. No accounts, no analytics cookies. Ticket links go straight to
          the venue or promoter. They handle payment, not us.
        </p>

        <div id="terms" className="eyebrow rule-label mt-10 mb-3">
          Terms
        </div>
        <p className="text-base leading-relaxed text-ink-2 m-0">
          We do our best to keep lineups and times accurate, but the night owns the night. Always
          double-check with the venue before you go.
        </p>
      </main>
      <Footer />
    </ChromeOverlays>
  );
}
