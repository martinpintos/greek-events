import Link from "next/link";
import type { DerivedEvent } from "@/lib/types";
import { parseISO } from "@/lib/format";

function PrideBar() {
  return (
    <div className="flex h-1 w-16">
      <span className="flex-1 bg-[#e63946]" />
      <span className="flex-1 bg-[#f1a208]" />
      <span className="flex-1 bg-[#ffe066]" />
      <span className="flex-1 bg-[#2ec4b6]" />
      <span className="flex-1 bg-[#3a86ff]" />
      <span className="flex-1 bg-[#8338ec]" />
    </div>
  );
}

export function QueerRail({ events }: { events: DerivedEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section
      className="mt-8 border-y border-line"
      style={{
        background:
          "linear-gradient(135deg, rgba(214,35,94,0.06) 0%, rgba(255,77,46,0.05) 100%)",
      }}
      aria-label="Queer nights this week"
    >
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-6 md:py-8">
        <PrideBar />
        <h3 className="display-h text-2xl md:text-3xl mt-3 mb-1">
          Queer nights this week
        </h3>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute mb-4">
          Vetted by us · across the islands
        </div>

        <div className="flex gap-3 scroll-x -mx-4 md:-mx-8 px-4 md:px-8">
          {events.map((ev) => {
          const dow = parseISO(ev.date)
            .toLocaleDateString("en-GB", { weekday: "short" })
            .toUpperCase();
          return (
            <Link
              key={ev.id}
              href={`/mykonos/${ev.venue.slug}/${ev.slug}`}
              className="shrink-0 w-55 md:w-65 border border-line p-3 bg-paper hover:bg-paper-2 transition-colors flex flex-col gap-1.5"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-queer">
                {dow} · {ev.startTime}
              </span>
              <span className="display-h text-[17px] md:text-lg leading-[1.1]">
                {ev.title}
              </span>
              <span className="font-mono text-[11px] text-mute">
                {ev.venue.name} · {ev.venue.area ?? ev.venue.city}
              </span>
            </Link>
          );
          })}
        </div>
      </div>
    </section>
  );
}
