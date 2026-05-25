import type { CSSProperties } from "react";
import type { DerivedEvent } from "@/lib/types";
import {
  addDays,
  dayOfMonth,
  parseISO,
  shortMonth,
} from "@/lib/format";
import { HeroEvent } from "./HeroEvent";
import { InsiderNote } from "./InsiderNote";
import { EventFeed } from "./EventFeed";

function headlineFor(iso: string, today: string): string {
  if (iso === today) return "Today";
  if (iso === addDays(today, 1)) return "Tomorrow";
  return parseISO(iso).toLocaleDateString("en-GB", { weekday: "long" });
}

function DateMark({
  day,
  month,
  isToday,
  size,
}: {
  day: number;
  month: string;
  isToday: boolean;
  size: "sm" | "lg";
}) {
  const dim =
    size === "lg" ? "w-[88px] h-[88px]" : "w-[56px] h-[56px]";
  const numSize = size === "lg" ? "text-[32px]" : "text-[21px]";
  const monthSize = size === "lg" ? "text-[10px]" : "text-[8px]";
  return (
    <div
      className={[
        dim,
        "shrink-0 flex flex-col items-center justify-center border",
        isToday
          ? "bg-ink text-paper border-ink shadow-[inset_0_3px_0_var(--color-accent)]"
          : "bg-paper-3 text-ink border-line",
      ].join(" ")}
    >
      <span
        className={`display-h ${numSize} leading-none tabular-nums`}
      >
        {day}
      </span>
      <span
        className={[
          `font-mono ${monthSize} uppercase tracking-[0.14em] leading-none mt-0.5`,
          isToday ? "text-paper/70" : "text-mute",
        ].join(" ")}
      >
        {month}
      </span>
    </div>
  );
}

const STICKY_OFFSET = "var(--chrome-h, 120px)";
const DESKTOP_STICKY_OFFSET = "calc(var(--chrome-h, 120px) + 16px)";
const TODAY_TINT = "#f1ead8";

export function DaySection({
  date,
  events,
  today,
  hero,
  note,
}: {
  date: string;
  events: DerivedEvent[];
  today: string;
  hero?: DerivedEvent | null;
  note?: string | null;
}) {
  const isToday = date === today;
  const headline = headlineFor(date, today);
  const day = dayOfMonth(date);
  const monthShort = shortMonth(date);
  const eventCount = events.length;
  const mobileStickyStyle: CSSProperties = { top: STICKY_OFFSET };
  const desktopStickyStyle: CSSProperties = { top: DESKTOP_STICKY_OFFSET };
  const scrollAnchorStyle: CSSProperties = {
    scrollMarginTop: STICKY_OFFSET,
  };
  return (
    <section
      data-date={date}
      style={scrollAnchorStyle}
      className="border-t border-hairline first:border-t-0 pb-10 md:pb-14"
    >
      {/* Mobile sticky header — divider below; high z-index so it never hides behind hero badges */}
      <header
        className="md:hidden sticky z-30 border-b border-hairline"
        style={{
          ...mobileStickyStyle,
          backgroundColor: isToday ? TODAY_TINT : "var(--color-paper)",
        }}
      >
        <div className="px-5 py-4 flex items-stretch gap-4">
          <DateMark
            day={day}
            month={monthShort}
            isToday={isToday}
            size="sm"
          />
          <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
            <h2 className="display-h text-[26px] leading-none m-0">
              {headline}
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
              {eventCount} {eventCount === 1 ? "event" : "events"}
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-5xl md:px-8 md:pt-10">
        <div className="md:grid md:grid-cols-[220px_1fr] md:gap-8">
          {/* Desktop sticky left column */}
          <aside
            className="hidden md:block md:sticky md:self-start"
            style={desktopStickyStyle}
          >
            <DateMark
              day={day}
              month={monthShort}
              isToday={isToday}
              size="lg"
            />
            <h2 className="display-h text-[36px] leading-none mt-4 mb-1.5">
              {headline}
            </h2>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
              {eventCount} {eventCount === 1 ? "event" : "events"}
            </div>
            {isToday && (
              <div className="mt-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Tonight
              </div>
            )}
          </aside>

          {/* Right column */}
          <div className="min-w-0">
            {(hero || note) && (
              <div className="px-5 md:px-6 pt-4 md:pt-0">
                {hero && (
                  <div className="mb-6 md:mb-8">
                    <HeroEvent ev={hero} />
                  </div>
                )}
                {note && (
                  <div className="mb-6 md:mb-8">
                    <InsiderNote text={note} />
                  </div>
                )}
              </div>
            )}
            {events.length > 0 && (
              <div className={hero || note ? "" : "pt-2 md:pt-0"}>
                <EventFeed events={events} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
