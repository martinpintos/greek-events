import type { Metadata } from "next";
import { getAllEvents, getVenues } from "@/lib/data";
import { todayISO } from "@/lib/format";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChromeOverlays } from "../components/ChromeOverlays";
import { CalendarBody } from "../components/CalendarBody";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mykonos — clubs, beach clubs, late nights",
  description:
    "Every night on Mykonos. Cavo Paradiso, Scorpios, SantAnna, Alemagou — lineups, tickets, insider tips.",
  alternates: { canonical: "/mykonos" },
};

export default async function MykonosHub() {
  const [events, venues] = await Promise.all([getAllEvents(), getVenues()]);
  const today = todayISO();
  const mykonosEvents = events.filter((e) => e.venue.island === "mykonos");

  return (
    <ChromeOverlays events={mykonosEvents} venues={venues.filter((v) => v.island === "mykonos")}>
      <Header />
      <main>
        <div className="mx-auto max-w-5xl px-4 md:px-8 pt-8 md:pt-14 pb-2">
          <div className="eyebrow eyebrow-accent mb-3 inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
            The island
          </div>
          <h1 className="display-h text-4xl md:text-6xl lg:text-7xl leading-[0.95] m-0">
            Mykonos.
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg text-ink-2 max-w-2xl leading-relaxed">
            Four rooms, one peninsula. Cavo Paradiso for late, Scorpios at
            sundown, SantAnna for day, Alemagou for the locals who never left.
          </p>
        </div>

        <CalendarBody
          allEvents={mykonosEvents}
          basePath="/mykonos"
          islandLock="mykonos"
          today={today}
        />
      </main>
      <Footer />
    </ChromeOverlays>
  );
}
