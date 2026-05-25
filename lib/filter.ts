import type { DerivedEvent, IslandId, VenueType } from "./types";

export type FilterState = {
  islands: IslandId[];
  venues: string[]; // venue slugs
  venueTypes: VenueType[];
  queer: boolean;
  afterHours: boolean;
};

export const EMPTY_FILTERS: FilterState = {
  islands: [],
  venues: [],
  venueTypes: [],
  queer: false,
  afterHours: false,
};

function splitList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function filtersFromSearchParams(
  sp: Record<string, string | string[] | undefined>
): FilterState {
  const get = (k: string): string | undefined => {
    const v = sp[k];
    if (Array.isArray(v)) return v[0];
    return v;
  };
  return {
    islands: splitList(get("islands")) as IslandId[],
    venues: splitList(get("venues")),
    venueTypes: splitList(get("type")) as VenueType[],
    queer: get("queer") === "1",
    afterHours: get("after") === "1",
  };
}

export function filtersToQuery(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.islands.length) p.set("islands", f.islands.join(","));
  if (f.venues.length) p.set("venues", f.venues.join(","));
  if (f.venueTypes.length) p.set("type", f.venueTypes.join(","));
  if (f.queer) p.set("queer", "1");
  if (f.afterHours) p.set("after", "1");
  return p;
}

export function activeFilterCount(f: FilterState): number {
  return (
    f.islands.length +
    f.venues.length +
    f.venueTypes.length +
    (f.queer ? 1 : 0) +
    (f.afterHours ? 1 : 0)
  );
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
    if (f.afterHours && !e.tags.includes("after-hours")) return false;
    return true;
  });
}
