import Link from "next/link";
import type { Venue } from "@/lib/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      href={`/mykonos/${venue.slug}`}
      className="block group border border-line bg-paper-3 hover:bg-paper-2 transition-colors"
    >
      <div className="grid grid-cols-[80px_1fr] gap-4 p-4">
        <div className="relative aspect-square border border-line bg-paper-2 grid place-items-center overflow-hidden font-mono text-[10px] uppercase tracking-widest text-mute">
          {venue.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={venue.image_url}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            initials(venue.name)
          )}
        </div>
        <div className="min-w-0 flex flex-col gap-1.5">
          <span className="display-h text-xl leading-none">{venue.name}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
            {venue.venue_type === "beach_club" ? "Beach" : venue.venue_type ?? "Venue"}
            {venue.capacity ? ` · Cap ${venue.capacity.toLocaleString()}` : ""}
            {" · "}
            {venue.area ?? venue.city}
          </span>
          {venue.description && (
            <span className="text-[13px] leading-relaxed text-ink-2 line-clamp-3">
              {venue.description}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
