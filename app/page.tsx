import type { Metadata } from "next";
import { getAllEvents, getVenues } from "@/lib/data";
import { todayISO } from "@/lib/format";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ChromeOverlays } from "./components/ChromeOverlays";
import { CalendarBody } from "./components/CalendarBody";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nightly.gr — Greek islands, after dark.",
  description:
    "Tonight's parties across the Greek islands. Hand-picked, no algorithms.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [events, venues] = await Promise.all([getAllEvents(), getVenues()]);
  const today = todayISO();

  return (
    <ChromeOverlays events={events} venues={venues}>
      <Header />
      <main>
        <div className="mx-auto max-w-5xl px-4 md:px-8 pt-8 md:pt-14 pb-2">
          <div className="eyebrow eyebrow-accent mb-3 inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
            Across the Greek islands
          </div>
          <h1 className="display-h text-4xl md:text-6xl lg:text-7xl leading-[0.95] m-0">
            Greek islands, <em className="not-italic text-accent">after dark.</em>
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-mute max-w-xl leading-relaxed">
            Hand-picked nights, lineups, and rooms. The spots we&rsquo;d send our
            own friends to — no algorithms.
          </p>
        </div>

        <CalendarBody allEvents={events} basePath="/" today={today} />
      </main>
      <Footer />
    </ChromeOverlays>
  );
}
