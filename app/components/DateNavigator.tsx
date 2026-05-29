"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { dayOfMonth, monthLabel, shortDOW } from "@/lib/format";
import { OverlayButton } from "./ChromeOverlays";

function EventDots({
  count,
  active,
}: {
  count: number;
  active: boolean;
}) {
  const dots = Math.min(count, 3);

  return (
    <span className="h-1.5 flex items-center justify-center gap-0.5">
      {Array.from({ length: dots }).map((_, i) => (
        <span
          key={i}
          className={[
            "w-1 h-1 rounded-full",
            active ? "bg-paper" : "bg-mute",
          ].join(" ")}
        />
      ))}
    </span>
  );
}

export function DateNavigator({
  days,
  selectedISO,
  today,
  countsByDate,
  canPrev,
  canNext,
  filterCount,
  onSelect,
  onSelectMonth,
  onJumpMonth,
  onToday,
}: {
  days: string[];
  selectedISO: string;
  today: string;
  countsByDate: Record<string, number>;
  canPrev: boolean;
  canNext: boolean;
  filterCount: number;
  onSelect: (iso: string) => void;
  onSelectMonth: (iso: string) => void;
  onJumpMonth: (delta: -1 | 1) => void;
  onToday: () => void;
}) {
  const [showMonths, setShowMonths] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);
  const selectedButtonRef = useRef<HTMLButtonElement | null>(null);
  const selectedYear = Number(selectedISO.slice(0, 4));
  const selectedMonth = Number(selectedISO.slice(5, 7));
  const seasonMonths = [5, 6, 7, 8, 9, 10];

  useEffect(() => {
    const rail = railRef.current;
    const selected = selectedButtonRef.current;
    if (!rail || !selected || showMonths) return;
    rail.scrollTo({
      left: Math.max(selected.offsetLeft - 16, 0),
      behavior: "auto",
    });
  }, [selectedISO, showMonths]);

  // The day rail scrolls horizontally but the scrollbar is hidden. On desktop
  // (mouse, no touch) there's otherwise no way to reach later days, so we show
  // arrow buttons; these track whether there's anything to scroll to.
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || showMonths) return;
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      setEdges({ left: rail.scrollLeft > 1, right: rail.scrollLeft < max - 1 });
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(rail);
    return () => {
      rail.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [showMonths, days]);

  const scrollRail = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * rail.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <section className="border-b border-hairline bg-paper">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem_auto] md:grid-cols-[2.25rem_8rem_2.25rem_auto] items-stretch gap-2 py-3 md:w-fit md:gap-2 md:py-3">
          <button
            type="button"
            onClick={() => {
              setShowMonths(false);
              onJumpMonth(-1);
            }}
            disabled={!canPrev}
            className="w-10 h-10 md:w-9 md:h-9 grid place-items-center border border-line disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-paper transition-colors"
            aria-label="Previous month"
          >
            <Icon name="chevron_l" size={14} stroke={2} />
          </button>
          <button
            type="button"
            onClick={() => setShowMonths((v) => !v)}
            className="display-h h-10 md:h-9 box-border text-[22px] md:text-[18px] leading-none px-1 md:px-2 inline-flex items-center justify-center gap-2 border border-transparent hover:text-accent transition-colors"
            aria-expanded={showMonths}
          >
            {monthLabel(selectedISO)}
            <span className="font-mono text-[12px] md:text-[10px] text-mute">›</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMonths(false);
              onJumpMonth(1);
            }}
            disabled={!canNext}
            className="w-10 h-10 md:w-9 md:h-9 grid place-items-center border border-line disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-paper transition-colors"
            aria-label="Next month"
          >
            <Icon name="chevron_r" size={14} stroke={2} />
          </button>
          <OverlayButton
            kind="filter"
            className="h-10 md:h-9 box-border px-3 md:px-3 inline-flex items-center gap-2 border border-line font-mono text-[10px] md:text-[9px] leading-none font-semibold uppercase tracking-[0.16em] hover:bg-ink hover:text-paper transition-colors"
            ariaLabel="Filter"
          >
            <Icon name="filter" size={13} />
            Filter
            {filterCount > 0 && (
              <span className="grid min-w-4 h-4 place-items-center bg-accent text-ink px-1 text-[9px] tracking-normal">
                {filterCount}
              </span>
            )}
          </OverlayButton>
        </div>

        {showMonths ? (
          <div className="-mx-5 md:mx-0 px-5 md:px-0 pb-5">
            <div className="grid grid-cols-6 gap-1.5 md:flex md:w-fit md:gap-2">
              {seasonMonths.map((month) => {
                const iso = `${selectedYear}-${String(month).padStart(2, "0")}-01`;
                const active = month === selectedMonth;
                const label = new Date(selectedYear, month - 1, 1)
                  .toLocaleDateString("en-GB", { month: "short" })
                  .toUpperCase();

                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => {
                      setShowMonths(false);
                      onSelectMonth(iso);
                    }}
                    className={[
                      "h-10 md:h-11 min-w-0 md:min-w-[62px] border px-1 md:px-4 font-mono text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.13em] md:tracking-[0.16em] transition-colors",
                      active
                        ? "bg-ink text-paper border-ink shadow-[inset_0_3px_0_var(--color-accent)]"
                        : "bg-paper text-ink border-line hover:bg-paper-2",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-mute md:w-fit">
              Season runs May-Oct
            </div>
          </div>
        ) : (
          <div className="-mx-5 md:mx-0 px-5 md:px-0 pb-3 md:pb-5">
            <div className="flex gap-1.5 md:gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowMonths(false);
                  onToday();
                }}
                className="shrink-0 w-12 md:w-10.5 h-16 md:h-14 px-1 flex flex-col items-center justify-center gap-1 border border-line bg-paper text-ink hover:bg-ink hover:text-paper transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-mono text-[9px] md:text-[8px] font-semibold uppercase tracking-[0.1em]">
                  Today
                </span>
              </button>

              <button
                type="button"
                onClick={() => scrollRail(-1)}
                disabled={!edges.left}
                aria-label="Scroll to earlier days"
                className="hidden md:grid place-items-center w-9 h-14 self-center border border-line disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-paper transition-colors"
              >
                <Icon name="chevron_l" size={14} stroke={2} />
              </button>

              <div ref={railRef} className="min-w-0 flex-1 scroll-x">
                <div className="flex gap-1.5 md:gap-1 min-w-max">
                  {days.map((iso) => {
                    const isSelected = iso === selectedISO;
                    const isToday = iso === today;
                    const isPast = iso < today && !isToday;
                    const count = countsByDate[iso] ?? 0;

                    return (
                      <button
                        type="button"
                        key={iso}
                        ref={isSelected ? selectedButtonRef : undefined}
                        onClick={() => {
                          setShowMonths(false);
                          onSelect(iso);
                        }}
                        data-on={isSelected ? "1" : "0"}
                        data-today={isToday ? "1" : "0"}
                        className={[
                          "relative shrink-0 w-[48px] md:w-10.5 h-16 md:h-14 px-1.5 flex flex-col items-center justify-center gap-1 border transition-colors",
                          isSelected
                            ? "bg-ink text-paper border-ink shadow-[inset_0_3px_0_var(--color-accent)]"
                            : isToday
                              ? "bg-paper text-ink border-accent"
                              : isPast
                                ? "bg-paper text-ink/40 border-transparent hover:border-hairline"
                                : "bg-paper text-ink border-transparent hover:border-hairline",
                        ].join(" ")}
                        aria-current={isSelected ? "date" : undefined}
                      >
                        <span
                          className={[
                            "font-mono text-[9px] md:text-[8px] uppercase tracking-[0.1em]",
                            isToday && !isSelected
                              ? "text-accent font-semibold"
                              : "",
                            isSelected ? "text-paper/80" : "",
                          ].join(" ")}
                        >
                          {shortDOW(iso)}
                        </span>
                        <span className="display-h text-[22px] md:text-[18px] leading-none">
                          {dayOfMonth(iso)}
                        </span>
                        <EventDots count={count} active={isSelected} />
                        {isToday && !isSelected && (
                          <span className="absolute -bottom-px left-3 right-3 h-px bg-accent" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollRail(1)}
                disabled={!edges.right}
                aria-label="Scroll to later days"
                className="hidden md:grid place-items-center w-9 h-14 self-center border border-line disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-paper transition-colors"
              >
                <Icon name="chevron_r" size={14} stroke={2} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
