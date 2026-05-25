import Link from "next/link";
import type { DerivedEvent } from "@/lib/types";
import { dayOfMonth, shortMonth } from "@/lib/format";
import { Tag } from "./Tag";

export function EventCard({
  ev,
  compact = false,
  showDate = false,
  hideVenue = false,
}: {
  ev: DerivedEvent;
  compact?: boolean;
  showDate?: boolean;
  hideVenue?: boolean;
}) {
  const href = `/${ev.venue.island}/${ev.venue.slug}/${ev.slug}`;
  return (
    <Link
      href={href}
      className="group block border-t border-hairline first:border-t-0 hover:bg-paper-2 focus-visible:bg-paper-2 transition-colors"
    >
      <div
        className={[
          "grid gap-3 md:gap-6 px-5 md:px-6 py-4 md:py-5 items-start",
          showDate
            ? "grid-cols-[44px_56px_1fr_auto] md:grid-cols-[56px_72px_1fr_auto]"
            : "grid-cols-[60px_1fr_auto] md:grid-cols-[80px_1fr_auto]",
        ].join(" ")}
      >
        {showDate && (
          <div className="flex flex-col items-start pt-0.5 leading-none">
            <span className="font-mono text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              {shortMonth(ev.date)}
            </span>
            <span className="display-h text-[28px] md:text-[34px] leading-none mt-1 tabular-nums">
              {dayOfMonth(ev.date)}
            </span>
          </div>
        )}

        <div className="flex flex-col pt-0.5">
          <span className="display-h-strong text-[17px] md:text-xl leading-none">
            {ev.startTime}
          </span>
          <span className="font-mono text-[10px] md:text-[11px] text-mute leading-none mt-1">
            → {ev.endTime}
          </span>
        </div>

        {/* Title and venue*/}
        <div className="min-w-0">
          {/* Title */}
          <h3
            className={[
              "display-h leading-[1.12] mb-1.5 group-hover:text-ink-2",
              compact ? "text-[18px] md:text-[22px]" : "text-[19px] md:text-[23px]",
            ].join(" ")}
          >
            {ev.title}
          </h3>

          {/* Venue and area */}
          {!hideVenue && (
            <div className="flex flex-wrap items-center gap-x-1.5 text-xs md:text-[13px] text-mute">
              <span className="font-medium text-ink">{ev.venue.name}</span>
              <span className="opacity-40">·</span>
              <span>{ev.venue.area ?? ev.venue.city}</span>
            </div>
          )}

          {!compact && (ev.tags.length > 0 || ev.lgbtq) && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {ev.lgbtq && <Tag kind="queer">Queer</Tag>}
              {ev.tags.includes("after-hours") && <Tag kind="after-hours">After-hours</Tag>}
              {ev.tags.includes("sunset") && <Tag kind="sunset">Sunset</Tag>}
              {ev.tags.includes("day") && <Tag kind="day">Day</Tag>}
              {ev.tags.includes("season-opener") && <Tag kind="season-opener">Season opener</Tag>}
            </div>
          )}

          {!compact && ev.offTheRecord && (
            <div className="mt-3 md:mt-4 pl-3 pr-3 py-2.5 border-l-2 border-accent bg-paper-3 max-w-md">
              <div className="font-mono text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.16em] text-accent mb-1">
                Off the record
              </div>
              <div className="font-display italic text-[14px] md:text-[15px] leading-[1.4] text-ink-2">
                {ev.offTheRecord}
              </div>
            </div>
          )}
        </div>

        {/* Price and ticket info */}
        <div className="flex flex-col items-end">
          {ev.tiers.length === 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-wider text-mute whitespace-nowrap">
              At the door
            </span>
          ) : (
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-accent whitespace-nowrap">
              From €{ev.priceFrom}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
