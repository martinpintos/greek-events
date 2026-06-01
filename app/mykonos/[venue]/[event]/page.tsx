import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAllEvents, getEventBySlug, getVenues } from "@/lib/data";
import { addDays, parseISO } from "@/lib/format";
import { islandById } from "@/lib/islands";
import { fetchAllEvents, fetchAllVenues } from "@/lib/supabase";
import { jsonLdScript } from "@/lib/seo";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { ChromeOverlays } from "@/app/components/ChromeOverlays";
import { EventCard } from "@/app/components/EventCard";
import { Tag } from "@/app/components/Tag";
import { TicketBar } from "@/app/components/TicketBar";

export const revalidate = 3600;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow rule-label mb-3">{children}</div>;
}

export async function generateStaticParams() {
  const [events, venues] = await Promise.all([fetchAllEvents(), fetchAllVenues()]);
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
  const formattedDate = parseISO(ev.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const where = ev.venue.area ?? ev.venue.city;
  const islandName = islandById(ev.venue.island).name;
  // Day and month for the metadata title, e.g. "5 July" (no weekday, no year, no start time).
  const titleDate = parseISO(ev.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
  const ogVenue = `${ev.venue.name} · ${where}`;
  const ogImage = `/api/og?title=${encodeURIComponent(ev.title)}&venue=${encodeURIComponent(ogVenue)}&date=${encodeURIComponent(formattedDate)}&time=${encodeURIComponent(ev.startTime)}`;
  const whenText = ev.startTime ? `${formattedDate} from ${ev.startTime}` : formattedDate;
  const description = `${ev.venue.name}, ${where}, ${islandName}. ${whenText}. Who's playing, ticket tiers, table bookings, and insider tips.`;
  const pageTitle = `${ev.title} | ${ev.venue.name}, ${titleDate}`;
  return {
    title: pageTitle,
    description,
    alternates: { canonical: `/mykonos/${venue}/${event}` },
    openGraph: {
      title: pageTitle,
      description,
      type: "article",
      images: [ogImage],
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
    .filter((e) => e.id !== ev.id && e.venue.slug === ev.venue.slug && e.date >= ev.date)
    .slice(0, 3);

  const dateText = parseISO(ev.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const where = ev.venue.area ?? ev.venue.city;
  // Real venue photo is the best rich-result image; fall back to the dynamic OG card.
  const eventImage =
    ev.venue.image_url ??
    `https://nightly.gr/api/og?title=${encodeURIComponent(ev.title)}&venue=${encodeURIComponent(
      `${ev.venue.name} · ${where}`,
    )}&date=${encodeURIComponent(dateText)}&time=${encodeURIComponent(ev.startTime)}`;

  const heroStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${ev.palette[0]} 0%, ${ev.palette[1]} 70%)`,
  };

  const stripText = (ev.lineup[0] || ev.title).toUpperCase();

  const tips: string[] = ev.venue.insiderTips;

  const start = ev.startTime || "23:00";
  const endsNextDay = !!ev.endTime && ev.endTime < start;
  const endDateOnly = endsNextDay ? addDays(ev.date, 1) : ev.date;

  const tierOffers = ev.tiers.map((t) => ({
    "@type": "Offer",
    name: t.label,
    url: t.url,
    availability: "https://schema.org/InStock",
    ...(t.price != null ? { price: t.price, priceCurrency: "EUR" } : {}),
  }));
  const offers =
    ev.priceFrom != null
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "EUR",
          lowPrice: ev.priceFrom,
          offerCount: ev.tiers.length || 1,
          ...(tierOffers.length ? { offers: tierOffers } : {}),
        }
      : tierOffers.length
        ? tierOffers
        : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title,
    image: [eventImage],
    startDate: `${ev.date}T${start}:00+03:00`,
    endDate: ev.endTime ? `${endDateOnly}T${ev.endTime}:00+03:00` : undefined,
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
    offers: offers,
    description: ev.offTheRecord ?? undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "nightly.gr", item: "https://nightly.gr" },
      { "@type": "ListItem", position: 2, name: "Mykonos", item: "https://nightly.gr/mykonos" },
      {
        "@type": "ListItem",
        position: 3,
        name: ev.venue.name,
        item: `https://nightly.gr/mykonos/${ev.venue.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: ev.title,
        item: `https://nightly.gr/mykonos/${ev.venue.slug}/${ev.slug}`,
      },
    ],
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
            <div className="absolute inset-0 flex flex-col justify-center px-5 md:px-8 py-8 md:py-10 gap-1.5 md:gap-2 pointer-events-none opacity-90 overflow-hidden">
              <div className="display-h text-[64px] md:text-[clamp(72px,6vw,116px)] leading-[0.86] uppercase text-white/[0.09] whitespace-nowrap">
                {stripText}
              </div>
              <div className="display-h text-[64px] md:text-[clamp(72px,6vw,116px)] leading-[0.86] uppercase text-white/[0.08] whitespace-nowrap text-right">
                MYK
              </div>
              <div className="display-h text-[64px] md:text-[clamp(72px,6vw,116px)] leading-[0.86] uppercase text-white/[0.08] whitespace-nowrap">
                {ev.startTime}
              </div>
            </div>

            <div className="relative mx-auto max-w-5xl px-5 md:px-8 min-h-[244px] md:min-h-[360px] lg:min-h-[390px] pt-20 md:pt-28 pb-10 md:pb-14 flex flex-col items-start justify-end">
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-paper font-mono text-[10px] uppercase tracking-[0.14em] mb-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                  {dateText}
                </span>
                <span className="opacity-50">·</span>
                <span>
                  {ev.venue.venue_type === "beach_club"
                    ? "Beach"
                    : (ev.venue.venue_type ?? "Venue")}
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
          <section className="mx-auto max-w-5xl px-5 md:px-8 pt-6 lg:hidden">
            <TicketBar ev={ev} inline />
          </section>
        )}

        <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-start">
            <div className="min-w-0 space-y-10">
              {(ev.offTheRecord || ev.lgbtq || ev.tags.length > 0) && (
                <section>
                  {ev.offTheRecord && (
                    <p className="display-h text-xl md:text-2xl leading-[1.32] m-0">
                      <span className="text-accent">Off the record &mdash; </span>
                      {ev.offTheRecord}
                    </p>
                  )}
                  {(ev.lgbtq || ev.tags.length > 0) && (
                    <div
                      className={`flex flex-wrap gap-2 ${ev.offTheRecord ? "mt-8 md:mt-10" : ""}`}
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
                      <div key={`${name}-${i}`} className="py-3 md:py-4">
                        <span className="display-h text-2xl md:text-3xl leading-tight">{name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <SectionLabel>The venue</SectionLabel>
                <Link
                  href={`/mykonos/${ev.venue.slug}`}
                  className="mt-4 block group border border-line bg-paper-3 p-4 md:p-5 hover:bg-paper-2 transition-colors"
                >
                  <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[108px_1fr] md:grid-cols-[124px_1fr] gap-4 md:gap-5 items-center">
                    <div className="relative w-full aspect-[5/6] border border-line bg-paper-2 grid place-items-center overflow-hidden font-mono text-[10px] uppercase tracking-widest text-mute">
                      {ev.venue.image_url ? (
                        <Image
                          src={ev.venue.image_url}
                          alt=""
                          aria-hidden
                          fill
                          sizes="124px"
                          className="object-cover"
                        />
                      ) : (
                        ev.venue.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 3)
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center gap-2">
                      <span className="display-h-strong text-[22px] md:text-[26px] leading-none">
                        {ev.venue.name}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
                        {ev.venue.venue_type === "beach_club"
                          ? "Beach"
                          : (ev.venue.venue_type ?? "Venue")}
                        {ev.venue.capacity ? ` · Cap ${ev.venue.capacity.toLocaleString()}` : ""} ·{" "}
                        {ev.venue.area ?? ev.venue.city}
                      </span>
                      {ev.venue.description && (
                        <span className="text-[13px] leading-[1.35] text-ink-2 clamp-4">
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

            </div>

            <aside className="hidden lg:block sticky top-24">
              <TicketBar ev={ev} inline />
              {(ev.venue.website || ev.venue.instagram) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {ev.venue.website && (
                    <a
                      href={ev.venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
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
                      rel="noopener noreferrer"
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
          <section className="mx-auto max-w-5xl px-5 md:px-8 mt-8 md:mt-10">
            <div className="eyebrow rule-label mb-3 opacity-75">If you like this</div>
            <div className="-mx-4 md:-mx-6">
              {related.map((r) => (
                <EventCard key={r.id} ev={r} compact showDate />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />
    </ChromeOverlays>
  );
}
