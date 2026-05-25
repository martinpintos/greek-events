import type { DerivedEvent } from "@/lib/types";
import { partitionByBucket } from "@/lib/derive";
import { EventCard } from "./EventCard";

function SectionHeader({ title, meta, first }: { title: string; meta: string; first: boolean }) {
  return (
    <div
      className={[
        "flex items-baseline justify-between gap-4 px-5 md:px-6 pb-2",
        first ? "pt-0" : "pt-5 md:pt-6",
      ].join(" ")}
    >
      <h3 className="display-h text-[22px] md:text-2xl m-0">{title}</h3>
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">{meta}</span>
    </div>
  );
}

export function EventFeed({ events }: { events: DerivedEvent[] }) {
  const { sundown, prime, late } = partitionByBucket(events);

  if (events.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="display-h italic text-lg text-mute m-0">Nothing matches tonight.</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
          Try a different day, or clear a filter
        </p>
      </div>
    );
  }

  const buckets = [
    {
      key: "sundown",
      items: sundown,
      title: "Sundown",
      meta: "Day → dusk · 12:00-22:00",
    },
    {
      key: "prime",
      items: prime,
      title: "Prime time",
      meta: "22:00 onwards",
    },
    {
      key: "late",
      items: late,
      title: "After-hours",
      meta: "When it actually starts",
    },
  ].filter((b) => b.items.length > 0);

  return (
    <div>
      {buckets.map((bucket, idx) => (
        <section key={bucket.key}>
          <SectionHeader title={bucket.title} meta={bucket.meta} first={idx === 0} />
          <div>
            {bucket.items.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
