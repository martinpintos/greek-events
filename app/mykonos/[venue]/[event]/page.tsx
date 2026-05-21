import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllEvents,
  getEventBySlug,
  getVenues,
} from "@/lib/data";
import { parseISO } from "@/lib/format";
import { fetchAllEvents, fetchAllVenues } from "@/lib/supabase";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { ChromeOverlays } from "@/app/components/ChromeOverlays";
import { EventCard } from "@/app/components/EventCard";
import { Tag } from "@/app/components/Tag";
import { TicketBar } from "@/app/components/TicketBar";
import { Icon } from "@/app/components/Icon";

export const revalidate = 3600;

export async function generateStaticParams() {
  const [events, venues] = await Promise.all([
    fetchAllEvents(),
    fetchAllVenues(),
  ]);
  const byId = new Map(venues.map((v) => [v.id, v]));
  return events
    .filter((e) => byId.has(e.venue_id))
    .map((e) => ({ venue: byId.get(e.venue_id)!.slug, event: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string; event: string }>;
}): Promise<Metadata> {
  const { venue, event } = await params;
  const ev = await getEventBySlug(event);
  if (!ev) return { title: "Event not found" };
  return {
    title: `${ev.title} — ${ev.venue.name}`,
    description: ev.notes ?? `${ev.title}. Lineup, tickets, insider tips.`,
    alternates: { canonical: `/mykonos/${venue}/${event}` },
    openGraph: {
      title: ev.title,
      description: ev.notes ?? undefined,
      type: "article",
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ venue: string; event: string }>;
}) {
  const { venue: venueSlug, event: eventSlug } = await params;

  const [ev, allEvents, venues] = await Promise.all([
    getEventBySlug(eventSlug),
    getAllEvents(),
    getVenues(),
  ]);

  if (!ev || ev.venue.slug !== venueSlug) notFound();

  const related = allEvents
    .filter(
      (e) =>
        e.id !== ev.id &&
        e.venue.slug === ev.venue.slug &&
        e.date >= ev.date,
    )
    .slice(0, 3);

  const dateText = parseISO(ev.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const heroStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${ev.palette[0]} 0%, ${ev.palette[1]} 70%)`,
  };

  const stripText = (ev.lineup[0] || ev.title).toUpperCase();

  const tips: string[] = [...ev.venue.insiderTips];
  if (ev.tags.includes("after-hours")) {
    tips.push(
      "Door tightens after 1am — be in by 12:30 or expect a queue in the wind.",
    );
  }
  if (ev.tags.includes("sunset")) {
    tips.push(
      "Sunset hits around 19:42 this time of year — eat at the long table, dance once the sun drops.",
    );
  }
  if (tips.length === 0) {
    tips.push("Cash works at the bar; cards work at the door.");
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title,
    startDate: `${ev.date}T${ev.startTime || "23:00"}:00+03:00`,
    endDate: ev.endTime ? `${ev.date}T${ev.endTime}:00+03:00` : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: ev.venue.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: ev.venue.city,
        addressRegion: ev.venue.area ?? undefined,
        addressCountry: ev.venue.country,
      },
    },
    performer: ev.lineup.map((name) => ({
      "@type": "PerformingGroup",
      name,
    })),
    offers: ev.tiers.map((t) => ({
      "@type": "Offer",
      name: t.label,
      price: t.price,
      priceCurrency: "EUR",
      url: t.url,
      availability: "https://schema.org/InStock",
    })),
    description: ev.notes ?? undefined,
  };

  return (
    <ChromeOverlays events={allEvents} venues={venues}>
      <Header />
      <main>
        {/* Hero — full bleed, contained text */}
        <section
          className="relative overflow-hidden text-paper hero-noise"
          style={heroStyle}
        >
          <div className="hero-stripes relative">
            <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-8 pt-16 pb-40 md:pb-48 gap-2 pointer-events-none">
              <div className="display-h text-[80px] md:text-[180px] lg:text-[220px] leading-[0.82] uppercase tracking-[-0.03em] text-white/[0.08] truncate">
                {stripText}
              </div>
              <div className="display-h text-[80px] md:text-[180px] lg:text-[220px] leading-[0.82] uppercase tracking-[-0.03em] text-white/[0.08] truncate text-right">
                MYK
              </div>
              <div className="display-h text-[80px] md:text-[180px] lg:text-[220px] leading-[0.82] uppercase tracking-[-0.03em] text-white/[0.08] truncate">
                {ev.startTime}
              </div>
            </div>

            <div className="relative mx-auto max-w-5xl px-4 md:px-8 pt-24 md:pt-32 pb-10 md:pb-16">
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-paper font-mono text-[10px] uppercase tracking-[0.14em] mb-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                  {dateText}
                </span>
                <span className="opacity-50">·</span>
                <span>
                  {ev.venue.venue_type === "beach_club"
                    ? "Beach"
                    : ev.venue.venue_type ?? "Venue"}
                </span>
              </div>
              <h1 className="display-h text-4xl md:text-6xl lg:text-7xl leading-[0.95] mb-4 md:mb-6 text-shadow-sm max-w-3xl">
                {ev.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] md:text-[12px] uppercase tracking-[0.06em]">
                <span>
                  <span className="font-semibold">{ev.startTime}</span>
                  {ev.endTime ? `–${ev.endTime}` : ""}
                </span>
                <Link
                  href={`/mykonos/${ev.venue.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {ev.venue.name} · {ev.venue.area ?? ev.venue.city}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Body — 2-col on desktop: content + sticky ticket */}
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-start">
            {/* Content column */}
            <div className="min-w-0">
              {ev.notes && (
                <p className="display-h text-xl md:text-2xl leading-[1.32] m-0 mb-10">
                  <em className="not-italic text-accent font-mono text-[10px] uppercase tracking-[0.16em] mr-2 align-middle">
                    Off the record
                  </em>
                  {ev.notes}
                </p>
              )}

              {ev.lineup.length > 0 && (
                <>
                  <div className="eyebrow rule-label mt-2 mb-3">Lineup</div>
                  <div className="border-y border-hairline">
                    {ev.lineup.map((name, i) => (
                      <div
                        key={`${name}-${i}`}
                        className="py-3 md:py-4 border-t border-hairline first:border-t-0"
                      >
                        <span className="display-h text-xl md:text-2xl leading-tight">
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {(ev.lgbtq || ev.tags.length > 0) && (
                <>
                  <div className="eyebrow rule-label mt-10 mb-3">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ev.lgbtq && <Tag kind="queer">Queer-friendly</Tag>}
                    {ev.tags.map((t) => (
                      <Tag
                        key={t}
                        kind={
                          t === "after-hours" || t === "sunset" || t === "season-opener"
                            ? t
                            : "default"
                        }
                      >
                        {t.replace("-", " ")}
                      </Tag>
                    ))}
                  </div>
                </>
              )}

              <div className="eyebrow rule-label mt-10 mb-3">The room</div>
              <Link
                href={`/mykonos/${ev.venue.slug}`}
                className="block group border border-line bg-paper-3 p-4 hover:bg-paper-2 transition-colors"
              >
                <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] gap-4">
                  <div
                    className="aspect-square border border-line bg-paper-2 grid place-items-center overflow-hidden font-mono text-[10px] uppercase tracking-widest text-mute"
                    style={
                      ev.venue.image_url
                        ? {
                            backgroundImage: `url(${ev.venue.image_url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {!ev.venue.image_url &&
                      ev.venue.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex flex-col gap-1.5">
                    <span className="display-h text-xl md:text-2xl leading-none">
                      {ev.venue.name}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
                      {ev.venue.venue_type === "beach_club"
                        ? "Beach"
                        : ev.venue.venue_type ?? "Venue"}
                      {ev.venue.capacity
                        ? ` · Cap ${ev.venue.capacity.toLocaleString()}`
                        : ""}{" "}
                      · {ev.venue.area ?? ev.venue.city}
                    </span>
                    {ev.venue.description && (
                      <span className="text-[13px] leading-relaxed text-ink-2 line-clamp-2 md:line-clamp-3">
                        {ev.venue.description}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {tips.length > 0 && (
                <>
                  <div className="eyebrow rule-label mt-10 mb-2">
                    Insider tips
                  </div>
                  <div className="divide-y divide-hairline">
                    {tips.map((tip, i) => (
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

              <div className="eyebrow rule-label mt-10 mb-3">Getting there</div>
              <div className="text-[14px] leading-[1.5] text-ink-2 space-y-3">
                <p className="flex gap-2 items-start m-0">
                  <Icon name="ferry" size={14} />
                  <span>
                    Ferries to {ev.venue.city} from Piraeus run morning, midday,
                    evening. Last ferry off the island next morning ~07:30.
                  </span>
                </p>
                <p className="flex gap-2 items-start m-0">
                  <Icon name="pin" size={14} />
                  <span>
                    {ev.venue.name} — {ev.venue.area ?? ev.venue.city}. Road in
                    jams up after 1am — leave early or grab a moto.
                  </span>
                </p>
              </div>
            </div>

            {/* Sidebar ticket — inline on desktop */}
            <aside className="hidden lg:block sticky top-24">
              <TicketBar ev={ev} inline />
              {(ev.venue.website || ev.venue.instagram) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {ev.venue.website && (
                    <a
                      href={ev.venue.website}
                      target="_blank"
                      rel="noopener"
                      className="px-3 py-2 border border-line rounded-full text-xs font-mono uppercase tracking-wider hover:bg-ink hover:text-paper transition-colors"
                    >
                      Website
                    </a>
                  )}
                  {ev.venue.instagram && (
                    <a
                      href={
                        ev.venue.instagram.startsWith("http")
                          ? ev.venue.instagram
                          : `https://instagram.com/${ev.venue.instagram.replace(/^@/, "")}`
                      }
                      target="_blank"
                      rel="noopener"
                      className="px-3 py-2 border border-line rounded-full text-xs font-mono uppercase tracking-wider hover:bg-ink hover:text-paper transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Mobile sticky ticket */}
        <TicketBar ev={ev} />

        {related.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 md:px-8 mt-10 md:mt-16 pb-4">
            <div className="eyebrow rule-label mb-3 opacity-75">
              If you like this
            </div>
            <div className="-mx-4 md:-mx-6">
              {related.map((r) => (
                <EventCard key={r.id} ev={r} compact />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </ChromeOverlays>
  );
}
