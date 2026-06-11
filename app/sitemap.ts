import type { MetadataRoute } from "next";
import { fetchAllEvents, fetchAllVenues } from "@/lib/supabase";
import { todayISO } from "@/lib/format";

const BASE = "https://nightly.gr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [venues, events] = await Promise.all([
    fetchAllVenues(),
    fetchAllEvents(),
  ]);

  const venueById = new Map(venues.map((v) => [v.id, v]));
  const today = todayISO();

  // /mykonos is omitted while its canonical points at / (see app/mykonos/page.tsx);
  // sitemaps should only list canonical URLs. Restore it when other islands launch.
  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const venuePaths: MetadataRoute.Sitemap = venues.map((v) => ({
    url: `${BASE}/mykonos/${v.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const eventPaths: MetadataRoute.Sitemap = events
    .filter((e) => e.date >= today && venueById.has(e.venue_id))
    .map((e) => ({
      url: `${BASE}/mykonos/${venueById.get(e.venue_id)!.slug}/${e.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
      lastModified: e.date,
    }));

  return [...staticPaths, ...venuePaths, ...eventPaths];
}
