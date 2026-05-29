"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse, { type IFuseOptions } from "fuse.js";
import type { DerivedEvent } from "@/lib/types";
import { parseISO } from "@/lib/format";
import { Icon } from "./Icon";
import { useFocusTrap } from "./useFocusTrap";

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parseSearch(value: string): {
  terms: string[];
  day: number | null;
  month: number | null;
} {
  const tokens = normalize(value).split(/[\s,./-]+/).filter(Boolean);
  let day: number | null = null;
  let month: number | null = null;
  const terms: string[] = [];

  for (const token of tokens) {
    const numeric = /^\d{1,2}$/.test(token) ? Number(token) : null;
    if (day === null && numeric !== null && numeric >= 1 && numeric <= 31) {
      day = numeric;
      continue;
    }

    const maybeMonth = MONTHS[token];
    if (month === null && maybeMonth) {
      month = maybeMonth;
      continue;
    }

    terms.push(token);
  }

  return { terms, day, month };
}

type SearchRecord = {
  ev: DerivedEvent;
  title: string;
  venue: string;
  lineup: string;
  place: string;
  tags: string;
};

function toRecord(ev: DerivedEvent): SearchRecord {
  return {
    ev,
    title: normalize(ev.title),
    venue: normalize(`${ev.venue.name} ${ev.venue.slug}`),
    lineup: normalize(ev.lineup.join(" ")),
    place: normalize(`${ev.venue.area ?? ""} ${ev.venue.city}`),
    tags: normalize(
      `${ev.tags.join(" ")} ${ev.lgbtq ? "queer lgbtq" : ""}`,
    ),
  };
}

// Weighted so a venue hit ranks above a lineup hit above a title hit, mirroring
// the old manual scoring. threshold 0.38 + ignoreLocation give typo tolerance
// without drifting into noise on a small dataset.
const FUSE_OPTIONS: IFuseOptions<SearchRecord> = {
  includeScore: true,
  ignoreLocation: true,
  threshold: 0.38,
  minMatchCharLength: 2,
  keys: [
    { name: "venue", weight: 0.32 },
    { name: "lineup", weight: 0.26 },
    { name: "title", weight: 0.22 },
    { name: "place", weight: 0.12 },
    { name: "tags", weight: 0.08 },
  ],
};

export function SearchSheet({
  events,
  onClose,
}: {
  events: DerivedEvent[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const records = useMemo(() => events.map(toRecord), [events]);
  const fuse = useMemo(() => new Fuse(records, FUSE_OPTIONS), [records]);

  const results = useMemo(() => {
    const needle = q.trim();
    if (!needle) return [];
    const parsed = parseSearch(needle);
    const hasStructuredDate = parsed.day !== null || parsed.month !== null;

    const matchesDate = (ev: DerivedEvent) => {
      if (parsed.day !== null && Number(ev.date.slice(8, 10)) !== parsed.day) {
        return false;
      }
      if (
        parsed.month !== null &&
        Number(ev.date.slice(5, 7)) !== parsed.month
      ) {
        return false;
      }
      return true;
    };

    // Pure date query ("30 aug"): chronological list, no text scoring.
    if (parsed.terms.length === 0) {
      if (!hasStructuredDate) return [];
      return records
        .filter((r) => matchesDate(r.ev))
        .map((r) => r.ev)
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            a.startTime.localeCompare(b.startTime) ||
            a.title.localeCompare(b.title),
        )
        .slice(0, 40);
    }

    // Fuzzy text query, optionally narrowed by a structured date.
    return fuse
      .search(parsed.terms.join(" "))
      .filter((m) => matchesDate(m.item.ev))
      .map((m) => m.item.ev)
      .slice(0, 40);
  }, [records, fuse, q]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 backdrop-blur-sm px-0 pt-[14vh] md:px-0 md:pt-20"
      style={{ animation: "fade-in 180ms ease-out" }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search events"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-none md:max-w-2xl h-[86vh] md:h-auto md:min-h-[360px] md:max-h-[70vh] bg-paper flex flex-col rounded-t-2xl md:rounded-2xl overflow-hidden"
        style={{ animation: "slide-up 260ms cubic-bezier(.2,.7,.2,1)" }}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-4 border-b border-hairline">
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Artist, venue, party..."
            aria-label="Search"
            className="display-h text-xl bg-transparent border-0 outline-none w-full placeholder:italic placeholder:text-mute/60"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 grid place-items-center border border-hairline rounded-full hover:bg-ink hover:text-paper transition-colors"
          >
            <Icon name="close" size={13} stroke={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {q.trim().length === 0 && (
            <div className="py-14 text-center font-mono text-[12px] uppercase tracking-widest text-mute">
              Try an artist, venue, island, or date.
            </div>
          )}
          {q.trim().length > 0 && results.length === 0 && (
            <div className="py-14 text-center font-mono text-[12px] uppercase tracking-widest text-mute">
              No events match.
            </div>
          )}
          {results.map((ev) => {
            const when = parseISO(ev.date).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            return (
              <button
                type="button"
                key={ev.id}
                onClick={() => {
                  router.push(`/mykonos/${ev.venue.slug}/${ev.slug}`);
                  onClose();
                }}
                className="w-full text-left px-5 py-4 border-t border-hairline first:border-t-0 hover:bg-paper-2 transition-colors flex flex-col gap-1"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
                  {when} · {ev.startTime}
                </span>
                <span className="display-h text-lg leading-tight">
                  {ev.title}
                </span>
                <span className="font-mono text-[11px] text-mute">
                  {ev.venue.name} · {ev.venue.area ?? ev.venue.city}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
