"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DerivedEvent, IslandId, Venue, VenueType } from "@/lib/types";
import { applyFilters, filtersToQuery, type FilterState } from "@/lib/filter";
import { ISLANDS } from "@/lib/islands";
import { Icon } from "./Icon";

const VENUE_TYPES: { id: VenueType; name: string }[] = [
  { id: "club", name: "Clubs" },
  { id: "beach_club", name: "Beach clubs" },
  { id: "bar", name: "Bars" },
  { id: "boat", name: "Boats" },
];

export function FilterSheet({
  events,
  venues,
  onClose,
}: {
  events: DerivedEvent[];
  venues: Venue[];
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const initial: FilterState = useMemo(
    () => ({
      islands: (sp.get("islands")?.split(",").filter(Boolean) ?? []) as IslandId[],
      venues: sp.get("venues")?.split(",").filter(Boolean) ?? [],
      venueTypes: (sp.get("type")?.split(",").filter(Boolean) ?? []) as VenueType[],
      queer: sp.get("queer") === "1",
      afterHours: sp.get("after") === "1",
      freeOnly: sp.get("free") === "1",
    }),
    [sp],
  );
  const [draft, setDraft] = useState<FilterState>(initial);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const islandCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of events) c[e.venue.island] = (c[e.venue.island] ?? 0) + 1;
    return c;
  }, [events]);

  const matchCount = applyFilters(events, draft).length;

  const toggleStr = (key: "venues", val: string) => {
    const arr = draft[key];
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    setDraft({ ...draft, [key]: next });
  };
  const toggleIsland = (val: IslandId) => {
    const next = draft.islands.includes(val)
      ? draft.islands.filter((x) => x !== val)
      : [...draft.islands, val];
    setDraft({ ...draft, islands: next });
  };
  const toggleType = (val: VenueType) => {
    const next = draft.venueTypes.includes(val)
      ? draft.venueTypes.filter((x) => x !== val)
      : [...draft.venueTypes, val];
    setDraft({ ...draft, venueTypes: next });
  };

  const reset = () =>
    setDraft({
      islands: [],
      venues: [],
      venueTypes: [],
      queer: false,
      afterHours: false,
      freeOnly: false,
    });

  const apply = () => {
    const q = filtersToQuery(draft);
    const date = sp.get("date");
    if (date) q.set("date", date);
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center bg-black/45 backdrop-blur-sm"
      style={{ animation: "fade-in 180ms ease-out" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md bg-paper flex flex-col max-h-[92vh] md:max-h-[80vh] rounded-t-2xl md:rounded-2xl overflow-hidden"
        style={{ animation: "slide-up 260ms cubic-bezier(.2,.7,.2,1)" }}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
          <h2 className="display-h text-3xl m-0">Filter</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 grid place-items-center border border-line rounded-full hover:bg-ink hover:text-paper transition-colors"
          >
            <Icon name="close" size={13} stroke={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <Group label="Islands" value={draft.islands.length || "All"}>
            <div className="grid grid-cols-2 gap-2">
              {ISLANDS.map((i) => {
                const isOn = draft.islands.includes(i.id);
                return (
                  <button
                    type="button"
                    key={i.id}
                    disabled={!i.active}
                    onClick={() => i.active && toggleIsland(i.id)}
                    data-on={isOn ? "1" : "0"}
                    className={[
                      "relative text-left p-3 border flex flex-col gap-1 transition-colors",
                      i.active ? "border-line" : "border-hairline opacity-50 cursor-not-allowed",
                      isOn ? "bg-ink text-paper border-ink" : "bg-paper",
                    ].join(" ")}
                  >
                    <span
                      className={`absolute top-2 right-2 font-mono text-[10px] border rounded-full px-1.5 ${
                        isOn ? "text-paper border-white/30" : "text-mute border-hairline"
                      }`}
                    >
                      {islandCounts[i.id] ?? 0}
                    </span>
                    <span className="display-h text-xl leading-none">{i.name}</span>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider ${
                        isOn ? "text-paper/70" : "text-mute"
                      }`}
                    >
                      {i.short}
                    </span>
                  </button>
                );
              })}
            </div>
          </Group>

          <Group
            label="Venue type"
            value={draft.venueTypes.length || "Any"}
          >
            <div className="flex flex-wrap gap-1.5">
              {VENUE_TYPES.map((vt) => {
                const on = draft.venueTypes.includes(vt.id);
                return (
                  <button
                    type="button"
                    key={vt.id}
                    onClick={() => toggleType(vt.id)}
                    className={[
                      "px-3 py-2 border rounded-full text-sm transition-colors",
                      on ? "bg-ink text-paper border-ink" : "bg-paper border-line hover:bg-paper-2",
                    ].join(" ")}
                  >
                    {vt.name}
                  </button>
                );
              })}
            </div>
          </Group>

          <Group label="Venue" value={draft.venues.length || "Any"}>
            <div className="border border-line bg-paper">
              {ISLANDS.filter(
                (i) =>
                  i.active &&
                  (draft.islands.length === 0 || draft.islands.includes(i.id)),
              ).map((island) => {
                const vs = venues.filter((v) => v.island === island.id);
                if (vs.length === 0) return null;
                return (
                  <div key={island.id} className="border-t border-hairline first:border-t-0">
                    <div className="flex justify-between items-baseline px-3 py-2 bg-paper-2 border-b border-hairline">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                        {island.name}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                        {island.short}
                      </span>
                    </div>
                    {vs.map((v) => {
                      const count = events.filter((e) => e.venue.slug === v.slug).length;
                      const isOn = draft.venues.includes(v.slug);
                      return (
                        <button
                          type="button"
                          key={v.slug}
                          onClick={() => toggleStr("venues", v.slug)}
                          className={[
                            "w-full text-left grid grid-cols-[22px_1fr_auto_auto] items-center gap-2.5 px-3 py-2.5 border-t border-hairline first:border-t-0 text-sm transition-colors",
                            isOn ? "bg-ink text-paper" : "bg-paper hover:bg-paper-2",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "w-5 h-5 grid place-items-center border",
                              isOn ? "bg-accent border-accent text-ink" : "border-line bg-paper",
                            ].join(" ")}
                          >
                            <Icon
                              name={isOn ? "close" : "plus"}
                              size={11}
                              stroke={2}
                            />
                          </span>
                          <span className="font-medium">{v.name}</span>
                          <span
                            className={`font-mono text-[9px] uppercase tracking-[0.16em] ${
                              isOn ? "text-paper/70" : "text-mute"
                            }`}
                          >
                            {v.venue_type === "beach_club" ? "beach" : v.venue_type ?? ""}
                          </span>
                          <span
                            className={`font-mono text-[10px] px-1.5 border min-w-6 text-center ${
                              isOn ? "border-white/30" : "border-hairline text-mute"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Group>

          <Group label="Tonight, specifically">
            <div className="flex flex-wrap gap-1.5">
              <Toggle
                on={draft.queer}
                onClick={() => setDraft({ ...draft, queer: !draft.queer })}
                kind="queer"
              >
                Queer-friendly only
              </Toggle>
              <Toggle
                on={draft.afterHours}
                onClick={() => setDraft({ ...draft, afterHours: !draft.afterHours })}
              >
                After-hours
              </Toggle>
              <Toggle
                on={draft.freeOnly}
                onClick={() => setDraft({ ...draft, freeOnly: !draft.freeOnly })}
              >
                Free entry
              </Toggle>
            </div>
          </Group>
        </div>

        <div className="grid grid-cols-[auto_1fr] border-t border-line bg-paper">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-mute border-r border-line hover:text-ink transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={apply}
            className="px-5 py-4 bg-ink text-paper font-mono text-[12px] font-semibold uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            Show {matchCount} {matchCount === 1 ? "event" : "events"}
            <Icon name="arrow_r" size={12} stroke={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Group({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | number;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
          {label}
        </span>
        {value !== undefined && (
          <span className="font-mono text-[10px] tracking-[0.06em]">
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  on,
  onClick,
  kind,
  children,
}: {
  on: boolean;
  onClick: () => void;
  kind?: "queer";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-2 border rounded-full text-sm transition-colors",
        on
          ? kind === "queer"
            ? "bg-queer text-paper border-queer"
            : "bg-ink text-paper border-ink"
          : "bg-paper border-line hover:bg-paper-2",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
