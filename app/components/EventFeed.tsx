import type { DerivedEvent } from "@/lib/types";
import { partitionByBucket } from "@/lib/derive";
import { EventCard } from "./EventCard";

function SectionHeader({
  title,
  meta,
}: {
  title: string;
  meta: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 md:px-6 pt-8 pb-2">
      <h3 className="display-h text-[22px] md:text-2xl m-0">{title}</h3>
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
        {meta}
      </span>
    </div>
  );
}

export function EventFeed({ events }: { events: DerivedEvent[] }) {
  const { sundown, prime, late } = partitionByBucket(events);

  if (events.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="display-h italic text-lg text-mute m-0">
          Nothing matches tonight.
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
          Try a different day, or clear a filter
        </p>
      </div>
    );
  }

  return (
    <div>
      {sundown.length > 0 && (
        <section>
          <SectionHeader title="Sundown" meta="Day → dusk · 13:00–21:00" />
          <div>
            {sundown.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </section>
      )}
      {prime.length > 0 && (
        <section>
          <SectionHeader title="Prime time" meta="21:00 onwards" />
          <div>
            {prime.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </section>
      )}
      {late.length > 0 && (
        <section>
          <SectionHeader title="After-hours" meta="When it actually starts" />
          <div>
            {late.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
