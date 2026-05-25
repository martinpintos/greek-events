"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { DerivedEvent, IslandId } from "@/lib/types";
import {
  addDays,
  editorNoteForDate,
  endOfMonth,
  parseISO,
  startOfMonth,
} from "@/lib/format";
import { groupByDate, pickHero } from "@/lib/derive";
import { DateNavigator } from "./DateNavigator";
import { DaySection } from "./DaySection";

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

const INITIAL_DAYS = 14;
const LOAD_MORE_DAYS = 14;

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

  const rawDate = sp.get("date");
  const urlDateISO =
    rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? clampSeason(rawDate, today)
      : null;

  const islandsParam = sp.get("islands");
  const activeIslands = useMemo<IslandId[]>(() => {
    if (islandLock) return [islandLock];
    return islandsParam
      ? (islandsParam.split(",").filter(Boolean) as IslandId[])
      : [];
  }, [islandLock, islandsParam]);

  const eventsAfterIsland = useMemo(() => {
    if (activeIslands.length === 0) return allEvents;
    return allEvents.filter((e) => activeIslands.includes(e.venue.island));
  }, [allEvents, activeIslands]);

  const upcomingEvents = useMemo(
    () => eventsAfterIsland.filter((e) => e.date >= today),
    [eventsAfterIsland, today],
  );

  const dayGroups = useMemo(() => groupByDate(upcomingEvents), [upcomingEvents]);

  const countsByDate = useMemo(() => {
    const c: Record<string, number> = {};
    for (const g of dayGroups) c[g.date] = g.events.length;
    return c;
  }, [dayGroups]);

  const heroEv = useMemo(() => {
    const todaysEvents = upcomingEvents.filter((e) => e.date === today);
    return pickHero(todaysEvents);
  }, [upcomingEvents, today]);

  const dailyNote = useMemo(() => editorNoteForDate(today), [today]);

  const activeFilterCount = useMemo(() => {
    const countList = (key: string) =>
      sp.get(key)?.split(",").filter(Boolean).length ?? 0;
    return (
      (islandLock ? 0 : activeIslands.length) +
      countList("venues") +
      countList("type") +
      (sp.get("queer") === "1" ? 1 : 0) +
      (sp.get("after") === "1" ? 1 : 0)
    );
  }, [activeIslands.length, islandLock, sp]);

  const [visibleCount, setVisibleCount] = useState(() => {
    if (!urlDateISO) return INITIAL_DAYS;
    const idx = dayGroups.findIndex((g) => g.date === urlDateISO);
    return idx >= 0 ? Math.max(INITIAL_DAYS, idx + 1) : INITIAL_DAYS;
  });

  const filterSignature = useMemo(() => {
    return [
      activeIslands.join(","),
      sp.get("venues") ?? "",
      sp.get("type") ?? "",
      sp.get("queer") ?? "",
      sp.get("after") ?? "",
    ].join("|");
  }, [activeIslands, sp]);

  const [trackedSignature, setTrackedSignature] = useState(filterSignature);
  if (trackedSignature !== filterSignature) {
    setTrackedSignature(filterSignature);
    setVisibleCount(INITIAL_DAYS);
  }

  const visibleGroups = useMemo(
    () => dayGroups.slice(0, visibleCount),
    [dayGroups, visibleCount],
  );

  const remainingGroups = dayGroups.length - visibleGroups.length;
  const remainingEvents = useMemo(() => {
    let sum = 0;
    for (let i = visibleGroups.length; i < dayGroups.length; i++) {
      sum += dayGroups[i].events.length;
    }
    return sum;
  }, [dayGroups, visibleGroups.length]);

  const [activeDate, setActiveDate] = useState<string>(() => {
    if (urlDateISO) return urlDateISO;
    return dayGroups[0]?.date ?? today;
  });

  const chromeRef = useRef<HTMLDivElement | null>(null);

  const measureChrome = useCallback(() => {
    const chrome = chromeRef.current;
    if (!chrome) return 0;
    return Math.max(0, Math.round(chrome.getBoundingClientRect().bottom));
  }, []);

  useEffect(() => {
    const chrome = chromeRef.current;
    if (!chrome) return;
    const apply = () => {
      document.documentElement.style.setProperty(
        "--chrome-h",
        `${measureChrome()}px`,
      );
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(chrome);
    const headerEl = document.querySelector("header");
    if (headerEl) ro.observe(headerEl);
    window.addEventListener("resize", apply);
    window.addEventListener("scroll", apply, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      window.removeEventListener("scroll", apply);
    };
  }, [measureChrome]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const sections = document.querySelectorAll<HTMLElement>("[data-date]");
      if (sections.length === 0) return;
      const threshold = measureChrome() + 20;
      let nextActive = sections[0].dataset.date!;
      for (const s of Array.from(sections)) {
        if (s.getBoundingClientRect().top <= threshold) {
          nextActive = s.dataset.date!;
        } else {
          break;
        }
      }
      setActiveDate((cur) => (cur === nextActive ? cur : nextActive));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [visibleGroups.length, measureChrome]);

  const setQuery = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null) next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, sp],
  );

  const scrollToDate = useCallback(
    (iso: string) => {
      const idx = dayGroups.findIndex((g) => g.date === iso);
      if (idx >= 0 && idx >= visibleCount) {
        setVisibleCount(idx + 1);
      }
      setQuery({ date: iso });
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(`[data-date="${iso}"]`);
        if (!el) return;
        const y =
          el.getBoundingClientRect().top + window.scrollY - measureChrome();
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    },
    [dayGroups, visibleCount, setQuery, measureChrome],
  );

  const initialScrollDone = useRef(false);
  useEffect(() => {
    if (initialScrollDone.current) return;
    if (!urlDateISO) {
      initialScrollDone.current = true;
      return;
    }
    if (dayGroups.length === 0) return;
    initialScrollDone.current = true;
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-date="${urlDateISO}"]`,
      );
      if (!el) return;
      const y =
        el.getBoundingClientRect().top +
        window.scrollY -
        measureChrome();
      window.scrollTo({ top: y, behavior: "auto" });
    });
  }, [urlDateISO, dayGroups.length, measureChrome]);

  // Month strip computation: based on the currently active section.
  const stripAnchor = activeDate || today;
  const month = startOfMonth(stripAnchor);
  const monthIdx = parseISO(month).getMonth();
  const days = useMemo(
    () => isoRange(month, endOfMonth(stripAnchor)),
    [month, stripAnchor],
  );

  const jumpMonth = (delta: -1 | 1) => {
    const d = parseISO(month);
    d.setMonth(d.getMonth() + delta);
    const m = d.getMonth();
    if (m < 4 || m > 9) return;
    const targetISO = `${d.getFullYear()}-${String(m + 1).padStart(2, "0")}-01`;
    scrollToDate(targetISO);
  };

  const selectMonth = (iso: string) => {
    if (iso.slice(0, 7) === today.slice(0, 7)) {
      scrollToDate(today);
      return;
    }
    scrollToDate(iso);
  };

  const canPrev = monthIdx > 4;
  const canNext = monthIdx < 9;

  return (
    <div>
      <div
        ref={chromeRef}
        className="sticky z-20 bg-paper transition-transform duration-500 ease-out will-change-transform"
        style={{
          top: "var(--header-h, 56px)",
          transform: "translateY(calc(var(--chrome-hidden, 0) * -200%))",
        }}
      >
        <DateNavigator
          days={days}
          selectedISO={activeDate}
          today={today}
          countsByDate={countsByDate}
          canPrev={canPrev}
          canNext={canNext}
          filterCount={activeFilterCount}
          onSelect={scrollToDate}
          onSelectMonth={selectMonth}
          onJumpMonth={jumpMonth}
          onToday={() => scrollToDate(today)}
        />
      </div>

      {dayGroups.length === 0 ? (
        <div className="py-20 text-center mx-auto max-w-5xl px-5 md:px-8">
          <p className="display-h italic text-lg text-mute m-0">
            Nothing matches.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
            Try clearing a filter
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

          {remainingGroups > 0 && (
            <div className="mx-auto max-w-5xl px-5 md:px-8 py-10 md:py-14 flex items-center gap-4 md:gap-6">
              <div className="h-px flex-1 bg-hairline" />
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((n) =>
                    Math.min(n + LOAD_MORE_DAYS, dayGroups.length),
                  )
                }
                className="px-8 py-4 border border-line bg-paper flex flex-col items-center gap-1 hover:bg-ink hover:text-paper transition-colors"
              >
                <span className="display-h text-[20px] md:text-[22px] leading-none">
                  Load more dates
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-mute">
                  +{remainingEvents} {remainingEvents === 1 ? "event" : "events"}
                </span>
              </button>
              <div className="h-px flex-1 bg-hairline" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
