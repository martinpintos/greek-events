import type {
  DerivedEvent,
  EventBucket,
  EventRow,
  EventTag,
  Tier,
  Venue,
} from "./types";
import {
  formatTime,
  parseInsiderTips,
  parseLineup,
} from "./format";
import { islandFromCity, ISLANDS } from "./islands";
import type { VenueRow } from "./types";

const PALETTES: [string, string][] = [
  ["#ff4d2e", "#0c0c0c"],
  ["#1b3a4b", "#f6f4ee"],
  ["#102a3f", "#b85a32"],
  ["#7a3a2b", "#c75441"],
  ["#0c0c0c", "#ff4d2e"],
];

// Deterministic non-negative integer hash from a string (e.g. a uuid).
// Used to seed the visual palette so the same row always gets the same colors.
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function startHour(start: string | null): number {
  if (!start) return 22;
  const [h, m] = start.split(":").map(Number);
  return (h ?? 0) + (m ?? 0) / 60;
}

function bucketFor(start: string | null): EventBucket {
  const h = startHour(start);
  if (h >= 5 && h < 12) return "late";
  if (h >= 12 && h < 22) return "sundown";
  return "prime";
}

function tagsFor(row: EventRow, venue: Venue): EventTag[] {
  const tags: EventTag[] = [];
  const h = startHour(row.start_time);
  if (h >= 23 || h < 4) tags.push("night");
  if (venue.venue_type === "beach_club" && h >= 18 && h < 21)
    tags.push("sunset");
  if (venue.venue_type === "beach_club" && h < 18) tags.push("day");
  // season-opener: first event of May (the season starts) at this venue
  const month = Number(row.date.slice(5, 7));
  const day = Number(row.date.slice(8, 10));
  if (month === 5 && day <= 14) tags.push("season-opener");
  if (/local|greek classics/i.test(row.title)) tags.push("locals");
  return tags;
}

function num(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

// Build ticket tiers from the real ticket URLs/prices stored on the row. We
// never invent values — no URL means the event is "at the door" (empty tiers),
// and a missing price column just renders without a price.
function tiersFor(row: EventRow): Tier[] {
  const tiers: Tier[] = [];

  const gaUrl = row.ticket_url ?? null;
  if (gaUrl) {
    tiers.push({ kind: "ga", label: "General", url: gaUrl, price: num(row.price_from) });
  }
  if (row.vip_ticket_url) {
    tiers.push({ kind: "vip", label: "VIP entry", url: row.vip_ticket_url, price: num(row.vip_price) });
  }
  if (row.table_url) {
    tiers.push({ kind: "table", label: "Table", url: row.table_url, price: num(row.table_price) });
  }

  return tiers;
}

function paletteFor(seed: number): [string, string] {
  return PALETTES[seed % PALETTES.length];
}

export function deriveVenue(row: VenueRow): Venue {
  return {
    ...row,
    island: islandFromCity(row.city),
    insiderTips: parseInsiderTips(row.insider_tips),
  };
}

export function deriveVenues(rows: VenueRow[]): Venue[] {
  return rows.map(deriveVenue);
}

export function deriveEvent(row: EventRow, venuesById: Map<number, Venue>): DerivedEvent {
  const venue = venuesById.get(row.venue_id);
  if (!venue) {
    throw new Error(`No venue for event ${row.id} (venue_id=${row.venue_id})`);
  }
  const tiers = tiersFor(row);
  const tierPrices = tiers
    .map((t) => t.price)
    .filter((p): p is number => p != null);
  const priceFrom = tierPrices.length
    ? Math.min(...tierPrices)
    : num(row.price_from);
  return {
    id: row.id,
    slug: row.slug,
    date: row.date,
    startTime: formatTime(row.start_time),
    endTime: formatTime(row.end_time),
    title: row.title,
    lineup: parseLineup(row.lineup),
    offTheRecord: row.off_the_record,
    venue,
    tiers,
    priceFrom,
    lgbtq: row.is_lgbtq ?? false,
    tags: tagsFor(row, venue),
    bucket: bucketFor(row.start_time),
    palette: paletteFor(hashStr(row.id)),
  };
}

export function deriveEvents(
  rows: EventRow[],
  venues: Venue[]
): DerivedEvent[] {
  const byId = new Map(venues.map((v) => [v.id, v]));
  return rows
    .filter((r) => byId.has(r.venue_id))
    .map((r) => deriveEvent(r, byId));
}

const HERO_VENUE_PRIORITY = ["scorpios", "alemagou", "santanna"];

export function pickHero(events: DerivedEvent[]): DerivedEvent | null {
  if (events.length === 0) return null;
  for (const slug of HERO_VENUE_PRIORITY) {
    const match = events.find((e) => e.venue.slug === slug);
    if (match) return match;
  }
  const cavo = events.find(
    (e) => e.venue.slug === "cavo-paradiso" && e.tags.includes("night")
  );
  if (cavo) return cavo;
  const ah = events.find((e) => e.tags.includes("night"));
  if (ah) return ah;
  return events[0];
}

export type DayGroup = { date: string; events: DerivedEvent[] };

export function groupByDate(events: DerivedEvent[]): DayGroup[] {
  const groups: DayGroup[] = [];
  let current: DayGroup | null = null;
  for (const ev of events) {
    if (!current || current.date !== ev.date) {
      current = { date: ev.date, events: [] };
      groups.push(current);
    }
    current.events.push(ev);
  }
  return groups;
}

export function partitionByBucket(events: DerivedEvent[]): {
  sundown: DerivedEvent[];
  prime: DerivedEvent[];
  late: DerivedEvent[];
} {
  const sundown: DerivedEvent[] = [];
  const prime: DerivedEvent[] = [];
  const late: DerivedEvent[] = [];
  for (const e of events) {
    if (e.bucket === "sundown") sundown.push(e);
    else if (e.bucket === "prime") prime.push(e);
    else late.push(e);
  }
  const cmp = (a: DerivedEvent, b: DerivedEvent) =>
    a.startTime.localeCompare(b.startTime);
  sundown.sort(cmp);
  prime.sort(cmp);
  late.sort(cmp);
  return { sundown, prime, late };
}

export function activeIslands() {
  return ISLANDS;
}
