import { cache } from "react";
import {
  fetchAllEvents,
  fetchAllVenues,
  fetchEventBySlug,
  fetchVenueBySlug,
} from "./supabase";
import { deriveEvents, deriveVenues, deriveEvent } from "./derive";
import type { DerivedEvent, Venue } from "./types";

// Request-level dedup: every render in the same request shares one fetch.
export const getVenues = cache(async (): Promise<Venue[]> => {
  const rows = await fetchAllVenues();
  return deriveVenues(rows);
});

export const getAllEvents = cache(async (): Promise<DerivedEvent[]> => {
  const [venues, rows] = await Promise.all([
    getVenues(),
    fetchAllEvents(),
  ]);
  return deriveEvents(rows, venues);
});

export const getVenueBySlug = cache(
  async (slug: string): Promise<Venue | null> => {
    const venues = await getVenues();
    const venue = venues.find((v) => v.slug === slug);
    if (venue) return venue;
    const row = await fetchVenueBySlug(slug);
    return row ? deriveVenues([row])[0] : null;
  },
);

export const getEventBySlug = cache(
  async (slug: string): Promise<DerivedEvent | null> => {
    const [venues, row] = await Promise.all([
      getVenues(),
      fetchEventBySlug(slug),
    ]);
    if (!row) return null;
    const byId = new Map(venues.map((v) => [v.id, v]));
    if (!byId.has(row.venue_id)) return null;
    return deriveEvent(row, byId);
  },
);
