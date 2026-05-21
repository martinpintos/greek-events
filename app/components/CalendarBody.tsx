"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { DerivedEvent, IslandId } from "@/lib/types";
import { ISLANDS } from "@/lib/islands";
import {
  addDays,
  dateHeadline,
  dayOfMonth,
  editorNoteForDate,
  endOfMonth,
  fullDateLine,
  monthLabel,
  parseISO,
  shortDOW,
  startOfMonth,
  todayISO,
} from "@/lib/format";
import { pickHero } from "@/lib/derive";
import { Icon } from "./Icon";
import { HeroEvent } from "./HeroEvent";
import { InsiderNote } from "./InsiderNote";
import { EventFeed } from "./EventFeed";
import { QueerRail } from "./QueerRail";

function isoRange(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

function clampSeason(iso: string, today: string): string {
  const d = parseISO(iso);
  const m = d.getMonth();
  if (m < 4 || m > 9) return today;
  return iso;
}

export function CalendarBody({
  allEvents,
  basePath,
  islandLock,
  today,
}: {
  allEvents: DerivedEvent[];
  basePath: string;
  islandLock?: IslandId;
  today: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Determine the selected date from the URL, defaulting to today.
  const rawDate = sp.get("date");
  const selectedISO =
    rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? clampSeason(rawDate, today)
      : today;

  // Active island filter (from URL on home; locked to a single island on /mykonos).
  const islandsParam = sp.get("islands");
  const activeIslands = useMemo<IslandId[]>(() => {
    if (islandLock) return [islandLock];
    return islandsParam
      ? (islandsParam.split(",").filter(Boolean) as IslandId[])
      : [];
  }, [islandLock, islandsParam]);

  // Filter the in-memory event set by island. Client-side, instant.
  const eventsAfterIsland = useMemo(() => {
    if (activeIslands.length === 0) return allEvents;
    return allEvents.filter((e) => activeIslands.includes(e.venue.island));
  }, [allEvents, activeIslands]);

  const countsByDate = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of eventsAfterIsland) c[e.date] = (c[e.date] ?? 0) + 1;
    return c;
  }, [eventsAfterIsland]);

  const todaysEvents = useMemo(
    () => eventsAfterIsland.filter((e) => e.date === selectedISO),
    [eventsAfterIsland, selectedISO],
  );

  const countsByIsland = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of allEvents) {
      if (e.date === selectedISO) {
        c[e.venue.island] = (c[e.venue.island] ?? 0) + 1;
      }
    }
    return c;
  }, [allEvents, selectedISO]);

  const totalCount = useMemo(
    () => allEvents.filter((e) => e.date === selectedISO).length,
    [allEvents, selectedISO],
  );

  const queerEvents = useMemo(() => {
    const cutoff = addDays(today, 7);
    return allEvents
      .filter((e) => e.lgbtq && e.date >= today && e.date <= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [allEvents, today]);

  // Month-view computation for the date strip.
  const month = startOfMonth(selectedISO);
  const monthIdx = parseISO(month).getMonth();
  const days = useMemo(
    () => isoRange(month, endOfMonth(selectedISO)),
    [month, selectedISO],
  );

  const setQuery = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const jumpMonth = (delta: -1 | 1) => {
    const d = parseISO(month);
    d.setMonth(d.getMonth() + delta);
    const m = d.getMonth();
    if (m < 4 || m > 9) return;
    setQuery({
      date: `${d.getFullYear()}-${String(m + 1).padStart(2, "0")}-01`,
    });
  };

  const heroEv = pickHero(todaysEvents);
  const otherEvents = heroEv
    ? todaysEvents.filter((e) => e.id !== heroEv.id)
    : todaysEvents;
  const headline = dateHeadline(selectedISO, today);
  const isPastDay = selectedISO < today;
  const note = editorNoteForDate(selectedISO);
  const canPrev = monthIdx > 4;
  const canNext = monthIdx < 9;

  return (
    <div>
      {/* Date navigator: month header + day strip + filter button */}
      <section className="border-b border-hairline bg-paper">
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-3 md:py-4 flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => jumpMonth(-1)}
            disabled={!canPrev}
            className="w-8 h-8 grid place-items-center border border-line disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-paper transition-colors"
            aria-label="Previous month"
          >
            <Icon name="chevron_l" size={14} stroke={2} />
          </button>
          <div className="display-h text-[20px] md:text-[22px] leading-none px-2 flex-1 text-center md:text-left">
            {monthLabel(selectedISO)}
          </div>
          <button
            type="button"
            onClick={() => jumpMonth(1)}
            disabled={!canNext}
            className="w-8 h-8 grid place-items-center border border-line disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-paper transition-colors"
            aria-label="Next month"
          >
            <Icon name="chevron_r" size={14} stroke={2} />
          </button>
          <button
            type="button"
            onClick={() => setQuery({ date: today })}
            className="ml-2 h-8 px-3 inline-flex items-center gap-1.5 border border-line font-mono text-[10px] font-semibold uppercase tracking-[0.12em] hover:bg-ink hover:text-paper transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Today
          </button>
        </div>

        <div className="mx-auto max-w-5xl px-4 md:px-8 pb-3 md:pb-4">
          <div className="flex gap-1 scroll-x">
            {days.map((iso) => {
              const isOn = iso === selectedISO;
              const isToday = iso === today;
              const isPast = iso < today && !isToday;
              const has = (countsByDate[iso] ?? 0) > 0;
              return (
                <button
                  type="button"
                  key={iso}
                  onClick={() => setQuery({ date: iso })}
                  data-on={isOn ? "1" : "0"}
                  data-today={isToday ? "1" : "0"}
                  className={[
                    "shrink-0 min-w-[48px] md:min-w-[52px] py-2 px-1.5 flex flex-col items-center gap-1 border transition-colors",
                    isOn
                      ? "bg-ink text-paper border-ink"
                      : isToday
                        ? "bg-paper text-ink border-accent"
                        : isPast
                          ? "bg-paper text-ink/40 border-transparent hover:border-hairline"
                          : "bg-paper text-ink border-transparent hover:border-hairline",
                  ].join(" ")}
                >
                  <span
                    className={`font-mono text-[9px] uppercase tracking-[0.1em] ${
                      isToday && !isOn ? "text-accent font-semibold" : ""
                    }`}
                  >
                    {shortDOW(iso)}
                  </span>
                  <span className="display-h text-[20px] leading-none">
                    {dayOfMonth(iso)}
                  </span>
                  <span className="h-1 flex gap-0.5">
                    {has && (
                      <span
                        className={`w-0.5 h-0.5 rounded-full ${isOn ? "bg-paper" : "bg-mute"}`}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Island chips */}
      <section className="border-b border-hairline bg-paper">
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-3 flex gap-2 scroll-x">
          {!islandLock && (
            <button
              type="button"
              onClick={() => setQuery({ islands: null })}
              data-on={activeIslands.length === 0 ? "1" : "0"}
              className={[
                "shrink-0 px-4 py-2 rounded-full border text-sm font-medium inline-flex items-center gap-2 transition-colors",
                activeIslands.length === 0
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-ink border-line hover:bg-paper-2",
              ].join(" ")}
            >
              All islands
              <span
                className={`font-mono text-[11px] px-1.5 py-0.5 rounded-full ${
                  activeIslands.length === 0
                    ? "bg-white/20 text-paper"
                    : "bg-paper-2 text-mute"
                }`}
              >
                {totalCount}
              </span>
            </button>
          )}

          {ISLANDS.map((i) => {
            const isOn = activeIslands.includes(i.id);
            if (!i.active) {
              return (
                <span
                  key={i.id}
                  className="shrink-0 px-4 py-2 rounded-full border border-hairline text-sm text-mute inline-flex items-center gap-2 opacity-50 cursor-not-allowed"
                  title="Coming in v2"
                >
                  {i.name}
                  <span className="font-mono text-[10px] uppercase tracking-wider">
                    soon
                  </span>
                </span>
              );
            }
            return (
              <button
                key={i.id}
                type="button"
                disabled={!!islandLock && islandLock !== i.id}
                onClick={() => {
                  if (islandLock) return;
                  if (isOn) setQuery({ islands: null });
                  else setQuery({ islands: i.id });
                }}
                data-on={isOn ? "1" : "0"}
                className={[
                  "shrink-0 px-4 py-2 rounded-full border text-sm font-medium inline-flex items-center gap-2 transition-colors",
                  isOn
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper text-ink border-line hover:bg-paper-2",
                  islandLock && islandLock !== i.id ? "opacity-50" : "",
                ].join(" ")}
              >
                {i.name}
                <span
                  className={`font-mono text-[11px] px-1.5 py-0.5 rounded-full ${
                    isOn ? "bg-white/20 text-paper" : "bg-paper-2 text-mute"
                  }`}
                >
                  {countsByIsland[i.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Date headline */}
      <section className="mx-auto max-w-5xl px-4 md:px-8 pt-8 md:pt-12 pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="display-h text-3xl md:text-5xl leading-none m-0">
              {headline}
            </h1>
            {isPastDay && (
              <span className="inline-block px-2 py-1 border border-line font-mono text-[9px] uppercase tracking-[0.16em] text-mute">
                Past
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
            {todaysEvents.length}{" "}
            {todaysEvents.length === 1 ? "event" : "events"}
          </span>
        </div>
        <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.06em] text-mute">
          {fullDateLine(selectedISO)}
        </div>
      </section>

      {/* Hero + Insider note: side by side on desktop */}
      {(heroEv || note) && (
        <section className="mx-auto max-w-5xl px-4 md:px-8 mb-8 md:mb-12">
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 md:gap-8 items-start">
            {heroEv ? (
              <HeroEvent ev={heroEv} />
            ) : (
              <div className="hidden lg:block" />
            )}
            {note && (
              <div className="lg:pt-2">
                <InsiderNote text={note} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Feed */}
      <section className="mx-auto max-w-5xl">
        <EventFeed events={otherEvents} />
      </section>

      {/* Queer rail */}
      <div className="mx-auto max-w-5xl">
        <QueerRail events={queerEvents} />
      </div>
    </div>
  );
}
