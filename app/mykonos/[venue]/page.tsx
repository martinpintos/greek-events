import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEvents, getVenueBySlug, getVenues } from "@/lib/data";
import { todayISO } from "@/lib/format";
import { fetchAllVenues } from "@/lib/supabase";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { ChromeOverlays } from "@/app/components/ChromeOverlays";
import { EventCard } from "@/app/components/EventCard";

export const revalidate = 3600;

export async function generateStaticParams() {
  const venues = await fetchAllVenues();
  return venues.map((v) => ({ venue: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string }>;
}): Promise<Metadata> {
  const { venue } = await params;
  const v = await getVenueBySlug(venue);
  if (!v) return { title: "Venue not found" };
  return {
    title: `${v.name} — ${v.city}`,
    description:
      v.description ??
      `Upcoming events at ${v.name}, ${v.city}. Lineups, tickets, insider tips.`,
    alternates: { canonical: `/mykonos/${v.slug}` },
  };
}

export default async function VenuePage({
  params,
}: {
  params: Promise<{ venue: string }>;
}) {
  const { venue: slug } = await params;

  const [venue, allEvents, venues] = await Promise.all([
    getVenueBySlug(slug),
    getAllEvents(),
    getVenues(),
  ]);
  if (!venue) notFound();

  const today = todayISO();
  const upcoming = allEvents
    .filter((e) => e.venue.slug === slug && e.date >= today)
    .slice(0, 50);

  return (
    <ChromeOverlays events={allEvents} venues={venues}>
      <Header />
      <main>
        {/* Hero image / banner */}
        <section
          className="relative overflow-hidden border-b border-line"
          style={{
            backgroundImage: venue.image_url
              ? `url(${venue.image_url})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: venue.image_url ? undefined : "var(--color-paper-2)",
          }}
        >
          <div className="aspect-video md:aspect-21/9 max-h-120" />
          {venue.image_url && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)",
              }}
            />
          )}
          <div className="absolute left-0 right-0 bottom-0 p-4 md:p-8 text-paper">
            <div className="mx-auto max-w-5xl">
              <div className="eyebrow text-white/85 mb-2">
                {venue.area ? `${venue.area} · ` : ""}
                {venue.city}
                {venue.venue_type
                  ? ` · ${venue.venue_type === "beach_club" ? "Beach club" : venue.venue_type}`
                  : ""}
                {venue.capacity
                  ? ` · Cap ${venue.capacity.toLocaleString()}`
                  : ""}
              </div>
              <h1 className="display-h text-5xl md:text-7xl leading-[0.95] m-0">
                {venue.name}
              </h1>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14 items-start">
            <div>
              {venue.description && (
                <p className="display-h text-xl md:text-2xl leading-[1.32] m-0 mb-8">
                  {venue.description}
                </p>
              )}

              {venue.insiderTips.length > 0 && (
                <>
                  <div className="eyebrow rule-label mb-2">Insider tips</div>
                  <div className="divide-y divide-hairline">
                    {venue.insiderTips.map((tip, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[14px_1fr] gap-3 py-3 items-start text-[14px] leading-[1.45] text-ink-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.75" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {(venue.website || venue.instagram) && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {venue.website && (
                    <a
                      href={venue.website}
                      target="_blank"
                      rel="noopener"
                      className="px-4 py-2 border border-line rounded-full text-sm hover:bg-ink hover:text-paper transition-colors"
                    >
                      Website
                    </a>
                  )}
                  {venue.instagram && (
                    <a
                      href={
                        venue.instagram.startsWith("http")
                          ? venue.instagram
                          : `https://instagram.com/${venue.instagram.replace(/^@/, "")}`
                      }
                      target="_blank"
                      rel="noopener"
                      className="px-4 py-2 border border-line rounded-full text-sm hover:bg-ink hover:text-paper transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="border border-line bg-paper-3 p-4">
                <div className="eyebrow mb-3">Quick facts</div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-mute">Type</dt>
                    <dd className="font-medium">
                      {venue.venue_type === "beach_club"
                        ? "Beach club"
                        : venue.venue_type ?? "Venue"}
                    </dd>
                  </div>
                  {venue.capacity && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-mute">Capacity</dt>
                      <dd className="font-medium">
                        {venue.capacity.toLocaleString()}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <dt className="text-mute">Area</dt>
                    <dd className="font-medium">
                      {venue.area ?? venue.city}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-mute">Upcoming</dt>
                    <dd className="font-medium">{upcoming.length} events</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>

        <section className="mx-auto max-w-5xl">
          <div className="px-4 md:px-8 flex items-baseline justify-between gap-4 pt-2 pb-2">
            <h2 className="display-h text-2xl md:text-3xl m-0">Upcoming</h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
              {upcoming.length} {upcoming.length === 1 ? "event" : "events"}
            </span>
          </div>
          <div className="mt-3">
            {upcoming.length === 0 ? (
              <div className="py-12 text-center">
                <p className="display-h italic text-lg text-mute m-0">
                  Nothing on the schedule yet.
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
                  Check back closer to summer
                </p>
              </div>
            ) : (
              upcoming.map((e) => <EventCard key={e.id} ev={e} />)
            )}
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
          <Link
            href="/mykonos"
            className="inline-block px-4 py-2 border border-line rounded-full text-sm hover:bg-ink hover:text-paper transition-colors"
          >
            ← Back to Mykonos
          </Link>
        </div>
      </main>
      <Footer />
    </ChromeOverlays>
  );
}
