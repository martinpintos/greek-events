import { ISLANDS } from "@/lib/islands";
import type { IslandId } from "@/lib/types";

export function IslandChips({
  islandLock,
  activeIslands,
  totalCount,
  countsByIsland,
  onClear,
  onToggle,
}: {
  islandLock?: IslandId;
  activeIslands: IslandId[];
  totalCount: number;
  countsByIsland: Record<string, number>;
  onClear: () => void;
  onToggle: (id: IslandId) => void;
}) {
  return (
    <section className="border-b border-hairline bg-paper/95">
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-3 md:py-3.5 scroll-x">
        <div className="flex items-center gap-2 min-w-max">
          {!islandLock && (
            <button
              type="button"
              onClick={onClear}
              data-on={activeIslands.length === 0 ? "1" : "0"}
              className={[
                "h-10 shrink-0 px-4 rounded-full border text-sm font-medium inline-flex items-center gap-2 transition-colors",
                activeIslands.length === 0
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-ink border-line hover:bg-paper-2",
              ].join(" ")}
            >
              All islands
              <span
                className={[
                  "font-mono text-[11px] px-1.5 py-0.5 rounded-full",
                  activeIslands.length === 0
                    ? "bg-white/20 text-paper"
                    : "bg-paper-2 text-mute",
                ].join(" ")}
              >
                {totalCount}
              </span>
            </button>
          )}

          {ISLANDS.map((island) => {
            const isOn = activeIslands.includes(island.id);

            if (!island.active) {
              return (
                <span
                  key={island.id}
                  className="h-10 shrink-0 px-4 rounded-full border border-hairline text-sm text-mute inline-flex items-center gap-2 opacity-45 cursor-not-allowed"
                  title="Coming soon"
                >
                  <span className="leading-none">{island.name}</span>
                  <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-wider leading-none">
                    soon
                  </span>
                </span>
              );
            }

            return (
              <button
                key={island.id}
                type="button"
                disabled={!!islandLock && islandLock !== island.id}
                onClick={() => onToggle(island.id)}
                data-on={isOn ? "1" : "0"}
                className={[
                  "h-10 shrink-0 px-4 rounded-full border text-sm font-medium inline-flex items-center gap-2 transition-colors",
                  isOn
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper text-ink border-line hover:bg-paper-2",
                  islandLock && islandLock !== island.id ? "opacity-50" : "",
                ].join(" ")}
              >
                {island.name}
                <span
                  className={[
                    "font-mono text-[11px] px-1.5 py-0.5 rounded-full",
                    isOn ? "bg-white/20 text-paper" : "bg-paper-2 text-mute",
                  ].join(" ")}
                >
                  {countsByIsland[island.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
