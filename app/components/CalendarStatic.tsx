import type { DerivedEvent } from "@/lib/types";
import {
  addDays,
  dayOfMonth,
  editorNoteForDate,
  endOfMonth,
  monthLabel,
  shortDOW,
  startOfMonth,
} from "@/lib/format";
import { groupByDate, pickHero } from "@/lib/derive";
import { DaySection } from "./DaySection";
import { Icon } from "./Icon";

const INITIAL_DAYS = 14;

function isoRange(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

/**
 * Server-rendered, non-interactive view of the calendar in its default state
 * (from today, no filters). It ships inside the static HTML and is used as the
 * Suspense fallback for the interactive CalendarBody, which reads the URL on the
 * client. For the default case the markup matches, so hydration swaps in with no
 * visible flash; crawlers and link previews get the real content.
 */
export function CalendarStatic({
  allEvents,
  today,
}: {
  allEvents: DerivedEvent[];
  today: string;
}) {
  const upcoming = allEvents.filter((e) => e.date >= today);
  const dayGroups = groupByDate(upcoming);
  const visibleGroups = dayGroups.slice(0, INITIAL_DAYS);

  const countsByDate: Record<string, number> = {};
  for (const g of dayGroups) countsByDate[g.date] = g.events.length;

  const heroEv = pickHero(upcoming.filter((e) => e.date === today));
  const dailyNote = editorNoteForDate(today);

  const days = isoRange(startOfMonth(today), endOfMonth(today));

  return (
    <div>
      {/* Static date strip — mirrors DateNavigator's collapsed layout so the
          interactive version hydrates in place without a layout jump. */}
      <div
        className="sticky z-20 bg-paper"
        style={{ top: "var(--header-h, 56px)" }}
      >
        <section className="border-b border-hairline bg-paper">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem_auto] md:grid-cols-[2.25rem_8rem_2.25rem_auto] items-stretch gap-2 py-3 md:w-fit md:gap-2 md:py-3">
              <div className="w-10 h-10 md:w-9 md:h-9 grid place-items-center border border-line opacity-25">
                <Icon name="chevron_l" size={14} stroke={2} />
              </div>
              <div className="display-h h-10 md:h-9 box-border text-[22px] md:text-[18px] leading-none px-1 md:px-2 inline-flex items-center justify-center gap-2 border border-transparent">
                {monthLabel(today)}
                <span className="font-mono text-[12px] md:text-[10px] text-mute">
                  ›
                </span>
              </div>
              <div className="w-10 h-10 md:w-9 md:h-9 grid place-items-center border border-line">
                <Icon name="chevron_r" size={14} stroke={2} />
              </div>
              <div className="h-10 md:h-9 box-border px-3 inline-flex items-center gap-2 border border-line font-mono text-[10px] md:text-[9px] leading-none font-semibold uppercase tracking-[0.16em]">
                <Icon name="filter" size={13} />
                Filter
              </div>
            </div>

            <div className="-mx-5 md:mx-0 px-5 md:px-0 pb-3 md:pb-5">
              <div className="flex gap-1.5 md:gap-2">
                <div className="shrink-0 w-12 md:w-10.5 h-16 md:h-14 px-1 flex flex-col items-center justify-center gap-1 border border-line bg-paper text-ink">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="font-mono text-[9px] md:text-[8px] font-semibold uppercase tracking-[0.1em]">
                    Today
                  </span>
                </div>
                <div className="min-w-0 flex-1 scroll-x">
                  <div className="flex gap-1.5 md:gap-1 min-w-max">
                    {days.map((iso) => {
                      const isToday = iso === today;
                      const isPast = iso < today;
                      const count = countsByDate[iso] ?? 0;
                      const dots = Math.min(count, 3);
                      return (
                        <div
                          key={iso}
                          className={[
                            "relative shrink-0 w-[48px] md:w-10.5 h-16 md:h-14 px-1.5 flex flex-col items-center justify-center gap-1 border",
                            isToday
                              ? "bg-paper text-ink border-accent"
                              : isPast
                                ? "bg-paper text-ink/40 border-transparent"
                                : "bg-paper text-ink border-transparent",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "font-mono text-[9px] md:text-[8px] uppercase tracking-[0.1em]",
                              isToday ? "text-accent font-semibold" : "",
                            ].join(" ")}
                          >
                            {shortDOW(iso)}
                          </span>
                          <span className="display-h text-[22px] md:text-[18px] leading-none">
                            {dayOfMonth(iso)}
                          </span>
                          <span className="h-1.5 flex items-center justify-center gap-0.5">
                            {Array.from({ length: dots }).map((_, i) => (
                              <span
                                key={i}
                                className="w-1 h-1 rounded-full bg-mute"
                              />
                            ))}
                          </span>
                          {isToday && (
                            <span className="absolute -bottom-px left-3 right-3 h-px bg-accent" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {visibleGroups.length === 0 ? (
        <div className="py-20 text-center mx-auto max-w-5xl px-5 md:px-8">
          <p className="display-h italic text-lg text-mute m-0">
            Nothing on the schedule yet.
          </p>
        </div>
      ) : (
        <div>
          {visibleGroups.map((g) => {
            const isToday = g.date === today;
            return (
              <DaySection
                key={g.date}
                date={g.date}
                events={g.events}
                today={today}
                hero={isToday ? heroEv : null}
                note={isToday ? dailyNote : null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
