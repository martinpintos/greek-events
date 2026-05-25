import type { Metadata } from "next";
import { getAllEvents, getVenues } from "@/lib/data";
import { todayISO } from "@/lib/format";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ChromeOverlays } from "./components/ChromeOverlays";
import { CalendarBody } from "./components/CalendarBody";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nightly.gr | Greek islands, in the know.",
  description:
    "An insider calendar for the Greek islands. Dates, rooms, lineups, and island intel before plans get made.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [events, venues] = await Promise.all([getAllEvents(), getVenues()]);
  const today = todayISO();
  const showHomeHero = process.env.NIGHTLY_SHOW_HOME_HERO === "true";

  return (
    <ChromeOverlays events={events} venues={venues}>
      <Header />
      <main>
        {showHomeHero && (
          <div className="mx-auto max-w-5xl px-5 md:px-8 pt-8 md:pt-12 pb-5 md:pb-7">
            <div className="eyebrow eyebrow-accent mb-3 inline-flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
              Across the Greek islands
            </div>
            <h1 className="display-h text-4xl md:text-6xl lg:text-7xl leading-[0.95] m-0 max-w-4xl">
              Greek islands,{" "}
              <em className="not-italic text-accent">in the know.</em>
            </h1>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-mute max-w-xl leading-relaxed">
              Dates, rooms, lineups, and the island intel worth knowing before
              the group chat decides.
            </p>
          </div>
        )}

        <CalendarBody allEvents={events} today={today} />
      </main>
      <Footer />
    </ChromeOverlays>
  );
}
