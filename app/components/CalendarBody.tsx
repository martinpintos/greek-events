"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { DerivedEvent, IslandId } from "@/lib/types";
import {
  addDays,
  dateHeadline,
  editorNoteForDate,
  endOfMonth,
  fullDateLine,
  parseISO,
  startOfMonth,
} from "@/lib/format";
import { pickHero } from "@/lib/derive";
import { HeroEvent } from "./HeroEvent";
import { InsiderNote } from "./InsiderNote";
import { EventFeed } from "./EventFeed";
import { QueerRail } from "./QueerRail";
import { DateNavigator } from "./DateNavigator";
import { IslandChips } from "./IslandChips";
import { DateHeading } from "./DateHeading";

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
  islandLock,
  today,
}: {
  allEvents: DerivedEvent[];
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

  const activeFilterCount = useMemo(() => {
    const countList = (key: string) =>
      sp.get(key)?.split(",").filter(Boolean).length ?? 0;
    return (
      (islandLock ? 0 : activeIslands.length) +
      countList("venues") +
      countList("type") +
      (sp.get("queer") === "1" ? 1 : 0) +
      (sp.get("after") === "1" ? 1 : 0) +
      (sp.get("free") === "1" ? 1 : 0)
    );
  }, [activeIslands.length, islandLock, sp]);

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

  const selectMonth = (iso: string) => {
    if (iso.slice(0, 7) === today.slice(0, 7)) {
      setQuery({ date: today });
      return;
    }
    setQuery({ date: iso });
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
      <DateNavigator
        days={days}
        selectedISO={selectedISO}
        today={today}
        countsByDate={countsByDate}
        canPrev={canPrev}
        canNext={canNext}
        filterCount={activeFilterCount}
        onSelect={(iso) => setQuery({ date: iso })}
        onSelectMonth={selectMonth}
        onJumpMonth={jumpMonth}
        onToday={() => setQuery({ date: today })}
      />

      <IslandChips
        islandLock={islandLock}
        activeIslands={activeIslands}
        totalCount={totalCount}
        countsByIsland={countsByIsland}
        onClear={() => setQuery({ islands: null })}
        onToggle={(id) => {
          if (islandLock) return;
          if (activeIslands.includes(id)) setQuery({ islands: null });
          else setQuery({ islands: id });
        }}
      />

      <DateHeading
        headline={headline}
        selectedLine={fullDateLine(selectedISO)}
        eventCount={todaysEvents.length}
        isPastDay={isPastDay}
      />

      {/* Hero + Insider note: side by side on desktop */}
      {(heroEv || note) && (
        <section className="mx-auto max-w-5xl px-4 md:px-8 mb-8 md:mb-10">
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 md:gap-9 items-start">
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
