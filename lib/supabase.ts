import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { EventRow, VenueRow } from "./types";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  throw new Error(
    "Supabase env vars missing. Set SUPABASE_URL and SUPABASE_KEY in .env.local."
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export async function fetchAllVenues(): Promise<VenueRow[]> {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .order("name");
  if (error) throw new Error(`venues: ${error.message}`);
  return (data ?? []) as VenueRow[];
}

export async function fetchVenueBySlug(
  slug: string
): Promise<VenueRow | null> {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`venue ${slug}: ${error.message}`);
  return (data as VenueRow | null) ?? null;
}

export async function fetchAllEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date")
    .order("start_time");
  if (error) throw new Error(`events: ${error.message}`);
  return (data ?? []) as EventRow[];
}

export async function fetchEventsForRange(
  startISO: string,
  endISO: string
): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("date", startISO)
    .lte("date", endISO)
    .order("date")
    .order("start_time");
  if (error) throw new Error(`events range: ${error.message}`);
  return (data ?? []) as EventRow[];
}

export async function fetchEventsForDate(iso: string): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("date", iso)
    .order("start_time");
  if (error) throw new Error(`events ${iso}: ${error.message}`);
  return (data ?? []) as EventRow[];
}

export async function fetchEventBySlug(
  slug: string
): Promise<EventRow | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`event ${slug}: ${error.message}`);
  return (data as EventRow | null) ?? null;
}

export async function fetchUpcomingEventsForVenue(
  venueId: number,
  fromISO: string,
  limit = 20
): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("venue_id", venueId)
    .gte("date", fromISO)
    .order("date")
    .order("start_time")
    .limit(limit);
  if (error) throw new Error(`venue events ${venueId}: ${error.message}`);
  return (data ?? []) as EventRow[];
}
