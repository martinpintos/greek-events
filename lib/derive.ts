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
// Used to seed mock data (palette, price variance) so the same row always
// derives the same values.
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seedFor(row: EventRow): number {
  // Prefer the numeric idx column if present; fall back to hashing the uuid id.
  if (typeof row.idx === "number") return row.idx;
  return hashStr(row.id);
}

function startHour(start: string | null): number {
  if (!start) return 22;
  const [h, m] = start.split(":").map(Number);
  return (h ?? 0) + (m ?? 0) / 60;
}

function bucketFor(start: string | null): EventBucket {
  const h = startHour(start);
  if (h >= 12 && h < 21) return "sundown";
  if (h >= 21 || h < 4) return "prime";
  return "late";
}

function tagsFor(row: EventRow, venue: Venue): EventTag[] {
  const tags: EventTag[] = [];
  const h = startHour(row.start_time);
  if (h >= 23 || h < 4) tags.push("after-hours");
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

function priceVariance(seed: number): number {
  // ±20% deterministic per seed
  const r = ((seed * 9301 + 49297) % 233280) / 233280;
  return 0.8 + r * 0.4;
}

function tiersFor(row: EventRow, venue: Venue): Tier[] {
  const seed = seedFor(row);
  if (!row.ticket_url && !row.vip_ticket_url && !row.table_url) {
    // No real ticket URL anywhere → "at the door". Always render this for
    // events with no URLs (the mock prices are meaningless without a link).
    return [];
  }
  const v = priceVariance(seed);
  const tiers: Tier[] = [];

  // Base GA price by venue
  const gaBase =
    venue.slug === "cavo-paradiso"
      ? 75
      : venue.slug === "scorpios"
        ? 60
        : venue.slug === "santanna"
          ? 50
          : 30;
  const gaUrl = row.ticket_url ?? row.vip_ticket_url ?? row.source_url ?? "";
  if (gaUrl) {
    tiers.push({
      kind: "ga",
      label: "General",
      price: roundFiver(gaBase * v),
      url: gaUrl,
    });
  }

  // Beach club and Cavo also get VIP if they have a VIP URL, or we mock one for Scorpios.
  if (venue.slug === "cavo-paradiso" || venue.slug === "scorpios") {
    const vipUrl = row.vip_ticket_url ?? gaUrl;
    if (vipUrl) {
      const vipBase = venue.slug === "cavo-paradiso" ? 190 : 150;
      tiers.push({
        kind: "vip",
        label: "VIP entry",
        price: roundFiver(vipBase * v),
        url: vipUrl,
      });
    }
  }

  // Cavo also gets Tables
  if (venue.slug === "cavo-paradiso") {
    const tableUrl = row.table_url ?? row.vip_ticket_url ?? gaUrl;
    if (tableUrl) {
      tiers.push({
        kind: "table",
        label: "Table",
        price: roundFifty(1050 * v),
        url: tableUrl,
      });
    }
  }

  return tiers;
}

function roundFiver(n: number): number {
  return Math.max(5, Math.round(n / 5) * 5);
}

function roundFifty(n: number): number {
  return Math.max(50, Math.round(n / 50) * 50);
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
  if (row.venue_id == null) {
    throw new Error(`Event ${row.id} has no venue_id`);
  }
  const venue = venuesById.get(row.venue_id);
  if (!venue) {
    throw new Error(`No venue for event ${row.id} (venue_id=${row.venue_id})`);
  }
  const tiers = tiersFor(row, venue);
  const lowest = tiers.length
    ? tiers.reduce((a, b) => (a.price < b.price ? a : b))
    : null;
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
    priceFrom: lowest?.price ?? null,
    isFree: lowest?.price === 0,
    lgbtq: row.is_lgbtq ?? false,
    tags: tagsFor(row, venue),
    bucket: bucketFor(row.start_time),
    palette: paletteFor(seedFor(row)),
  };
}

export function deriveEvents(
  rows: EventRow[],
  venues: Venue[]
): DerivedEvent[] {
  const byId = new Map(venues.map((v) => [v.id, v]));
  return rows
    .filter((r) => r.venue_id != null && byId.has(r.venue_id))
    .map((r) => deriveEvent(r, byId));
}

export function pickHero(events: DerivedEvent[]): DerivedEvent | null {
  if (events.length === 0) return null;
  // Prefer Cavo Paradiso (club) late-night, else any after-hours, else first.
  const cavo = events.find(
    (e) => e.venue.slug === "cavo-paradiso" && e.tags.includes("after-hours")
  );
  if (cavo) return cavo;
  const ah = events.find((e) => e.tags.includes("after-hours"));
  if (ah) return ah;
  return events[0];
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
