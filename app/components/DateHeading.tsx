export function DateHeading({
  headline,
  selectedLine,
  eventCount,
  isPastDay,
}: {
  headline: string;
  selectedLine: string;
  eventCount: number;
  isPastDay: boolean;
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 md:px-8 pt-7 md:pt-9 pb-5 md:pb-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="display-h text-3xl md:text-4xl leading-none m-0">
            {headline}
          </h1>
          {isPastDay && (
            <span className="inline-block px-2 py-1 border border-line font-mono text-[9px] uppercase tracking-[0.16em] text-mute">
              Past
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
          {eventCount} {eventCount === 1 ? "event" : "events"}
        </span>
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.06em] text-mute">
        {selectedLine}
      </div>
    </section>
  );
}
