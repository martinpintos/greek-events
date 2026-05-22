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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow rule-label mb-3">{children}</div>;
}

export async function generateStaticParams() {
  const [events, venues] = await Promise.all([
    fetchAllEvents(),
    fetchAllVenues(),
  ]);
  const byId = new Map(venues.map((v) => [v.id, v]));
  return events
    .filter((e) => e.venue_id != null && byId.has(e.venue_id))
    .map((e) => ({ venue: byId.get(e.venue_id!)!.slug, event: e.slug }));
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
    title: `${ev.title} | ${ev.venue.name}`,
    description: ev.offTheRecord ?? `${ev.title}. Lineup, tickets, insider tips.`,
    alternates: { canonical: `/mykonos/${venue}/${event}` },
    openGraph: {
      title: ev.title,
      description: ev.offTheRecord ?? undefined,
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
      "Door tightens after 1am. Be in by 12:30 or expect a queue in the wind.",
    );
  }
  if (ev.tags.includes("sunset")) {
    tips.push(
      "Sunset hits around 19:42 this time of year. Eat at the long table, dance once the sun drops.",
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
    description: ev.offTheRecord ?? undefined,
  };

  return (
    <ChromeOverlays events={allEvents} venues={venues}>
      <Header />
      <main>
        <section
          className="relative overflow-hidden text-paper hero-noise min-h-[244px] md:min-h-[360px] lg:min-h-[390px]"
          style={heroStyle}
        >
          <div className="absolute inset-0 detail-hero-scrim" />
          <div className="hero-stripes relative min-h-[244px] md:min-h-[360px] lg:min-h-[390px]">
            <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-8 py-6 gap-1 md:gap-2 pointer-events-none opacity-90">
              <div className="display-h text-[76px] md:text-[170px] lg:text-[220px] leading-[0.82] uppercase text-white/[0.09] truncate">
                {stripText}
              </div>
              <div className="display-h text-[76px] md:text-[170px] lg:text-[220px] leading-[0.82] uppercase text-white/[0.08] truncate text-right">
                MYK
              </div>
              <div className="display-h text-[76px] md:text-[170px] lg:text-[220px] leading-[0.82] uppercase text-white/[0.08] truncate">
                {ev.startTime}
              </div>
            </div>

            <div className="relative mx-auto max-w-5xl px-4 md:px-8 pt-20 md:pt-28 pb-10 md:pb-14">
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-paper font-mono text-[10px] uppercase tracking-[0.14em] mb-4">
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
              <h1 className="display-h text-[44px] md:text-6xl lg:text-7xl leading-[0.92] mb-4 md:mb-6 text-shadow-soft max-w-3xl">
                {ev.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] md:text-[12px] uppercase tracking-[0.06em] text-paper/90">
                <span>
                  <span className="font-semibold">{ev.startTime}</span>
                  {ev.endTime ? `-${ev.endTime}` : ""}
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

        {ev.tiers.length === 0 && (
          <section className="mx-auto max-w-5xl px-4 md:px-8 pt-6 lg:hidden">
            <TicketBar ev={ev} inline />
          </section>
        )}

        <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-start">
            <div className="min-w-0 space-y-10">
              {(ev.offTheRecord || ev.lgbtq || ev.tags.length > 0) && (
                <section>
                  {ev.offTheRecord && (
                    <>
                      <SectionLabel>Off the record</SectionLabel>
                      <p className="display-h text-xl md:text-2xl leading-[1.32] m-0">
                        {ev.offTheRecord}
                      </p>
                    </>
                  )}
                  {(ev.lgbtq || ev.tags.length > 0) && (
                    <div
                      className={`flex flex-wrap gap-2 ${ev.offTheRecord ? "mt-4" : ""}`}
                    >
                      {ev.lgbtq && (
                        <Tag kind="queer" size="lg">
                          Queer-friendly
                        </Tag>
                      )}
                      {ev.tags.map((t) => (
                        <Tag
                          key={t}
                          size="lg"
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
                  )}
                </section>
              )}

              {ev.lineup.length > 0 && (
                <section>
                  <SectionLabel>Lineup</SectionLabel>
                  <div className="divide-y divide-hairline">
                    {ev.lineup.map((name, i) => (
                      <div
                        key={`${name}-${i}`}
                        className="py-3 md:py-4"
                      >
                        <span className="display-h text-2xl md:text-3xl leading-tight">
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <SectionLabel>The venue</SectionLabel>
                <Link
                  href={`/mykonos/${ev.venue.slug}`}
                  className="block group h-[150px] md:h-[158px] border border-line bg-paper-3 p-4 overflow-hidden hover:bg-paper-2 transition-colors"
                >
                  <div className="grid h-full grid-cols-[124px_1fr] md:grid-cols-[136px_1fr] gap-4 md:gap-5 items-center">
                    <div
                      className="w-full aspect-[4/3] border border-line bg-paper-2 grid place-items-center overflow-hidden font-mono text-[10px] uppercase tracking-widest text-mute"
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
                        <span className="text-[13px] leading-relaxed text-ink-2 clamp-4">
                          {ev.venue.description}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </section>

              {tips.length > 0 && (
                <section>
                  <SectionLabel>Insider tips</SectionLabel>
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
                </section>
              )}

              <section>
                <SectionLabel>Getting there</SectionLabel>
                <div className="text-[14px] leading-[1.5] text-ink-2 space-y-3">
                  <p className="grid grid-cols-[16px_1fr] gap-2 items-start m-0">
                    <span className="w-4 h-4 mt-0.5 grid place-items-start">
                      <Icon name="ferry" size={14} />
                    </span>
                    <span>
                      Ferries to {ev.venue.city} from Piraeus run morning,
                      midday, evening. Last ferry off the island next morning
                      ~07:30.
                    </span>
                  </p>
                  <p className="grid grid-cols-[16px_1fr] gap-2 items-start m-0">
                    <span className="w-4 h-4 mt-0.5 grid place-items-start">
                      <Icon name="pin" size={14} />
                    </span>
                    <span>
                      {ev.venue.name}, {ev.venue.area ?? ev.venue.city}. Road in
                      jams up after 1am. Leave early or grab a moto.
                    </span>
                  </p>
                </div>
              </section>
            </div>

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

        {ev.tiers.length > 0 && <TicketBar ev={ev} />}

        {related.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 md:px-8 mt-8 md:mt-10">
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
