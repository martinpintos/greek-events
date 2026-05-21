"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DerivedEvent } from "@/lib/types";
import { parseISO } from "@/lib/format";
import { Icon } from "./Icon";

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

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return events
      .filter((ev) => {
        if (ev.title.toLowerCase().includes(needle)) return true;
        if (ev.venue.name.toLowerCase().includes(needle)) return true;
        if (ev.venue.city.toLowerCase().includes(needle)) return true;
        if (ev.lineup.some((a) => a.toLowerCase().includes(needle))) return true;
        return false;
      })
      .slice(0, 40);
  }, [events, q]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-start md:justify-center bg-black/45 backdrop-blur-sm"
      style={{ animation: "fade-in 180ms ease-out" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-2xl md:mt-20 bg-paper flex flex-col max-h-[85vh] md:max-h-[70vh] rounded-t-2xl md:rounded-2xl overflow-hidden"
        style={{ animation: "slide-up 260ms cubic-bezier(.2,.7,.2,1)" }}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-4 border-b border-hairline">
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Artist, venue, party…"
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
              Try an artist, a venue, or an island.
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
