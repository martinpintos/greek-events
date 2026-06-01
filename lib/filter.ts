import type { DerivedEvent, IslandId, VenueType } from "./types";

export type FilterState = {
  islands: IslandId[];
  venues: string[]; // venue slugs
  venueTypes: VenueType[];
  queer: boolean;
  afterHours: boolean;
};

export function filtersToQuery(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.islands.length) p.set("islands", f.islands.join(","));
  if (f.venues.length) p.set("venues", f.venues.join(","));
  if (f.venueTypes.length) p.set("type", f.venueTypes.join(","));
  if (f.queer) p.set("queer", "1");
  if (f.afterHours) p.set("after", "1");
  return p;
}

export function applyFilters(
  events: DerivedEvent[],
  f: FilterState
): DerivedEvent[] {
  return events.filter((e) => {
    if (f.islands.length && !f.islands.includes(e.venue.island)) return false;
    if (f.venues.length && !f.venues.includes(e.venue.slug)) return false;
    if (
      f.venueTypes.length &&
      (!e.venue.venue_type || !f.venueTypes.includes(e.venue.venue_type))
    )
      return false;
    if (f.queer && !e.lgbtq) return false;
    if (f.afterHours && !e.tags.includes("night")) return false;
    return true;
  });
}
