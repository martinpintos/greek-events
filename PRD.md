# nightly.gr — Product Requirements Document

**Version:** 0.4 (MVP)
**Status:** Database complete, design complete, ready to build
**Tagline:** Greek islands, after dark.
**Domain:** nightly.gr (registered)

---

## 1. Vision

nightly.gr is the definitive nightlife event calendar for the Greek islands — the Ibiza Spotlight of Greece. It aggregates events across venues into a single, beautifully designed, SEO-optimised destination that travelers and locals use to plan their nights out.

**Competitive reference:** Ibiza Spotlight (ibiza-spotlight.com) — party calendar with date navigation, venue grouping, lineup details and ticket links. nightly.gr is that for the Greek islands, with a more editorial, design-forward aesthetic.

---

## 2. Problem

No authoritative nightlife calendar exists for the Greek islands. Travelers planning a trip to Mykonos must piece together event info from multiple venue Instagram accounts, outdated blog posts, and sparse Resident Advisor listings.

---

## 3. Target Users

**Primary:** International tourists planning a Greek island trip, 22–38, who cite nightlife as a key reason for visiting. Peak planning window: March–June for summer travel.

**Secondary:** Expats and locals who want to know what's on this week.

---

## 4. MVP Scope — Mykonos Only

### In scope

- Public event calendar for Mykonos (4 venues: Scorpios, Cavo Paradiso, SantAnna, Alemagou)
- Date navigation (scrollable day strip, month picker)
- Venue filter
- Hero event on calendar home
- Individual event pages with full lineup, ticket/VIP/table links
- Individual venue pages with description, insider tips, image
- Mobile-first responsive design
- SEO (meta tags, JSON-LD structured data, sitemap, robots.txt)

### Out of scope for MVP

- User accounts / saved events
- Ticket sales (link out only — never handle payments)
- Other islands (v2)
- Artist pages (v2)
- Language switcher (v2)

---

## 5. Tech Stack

| Layer    | Choice                                           |
| -------- | ------------------------------------------------ |
| Frontend | Next.js 16 (App Router)                          |
| Database | Supabase (Postgres) — already live and populated |
| Hosting  | Vercel                                           |

---

## 6. Database (live in Supabase)

### Supabase project

- **Name:** greek-events
- **Region:** eu-central-1 (Frankfurt)
- **Data:** 331 events, 4 venues — all imported

### venues table

| Column       | Type        | Constraints                          | Notes                       |
| ------------ | ----------- | ------------------------------------ | --------------------------- |
| id           | int8        | PRIMARY KEY, identity auto-increment |                             |
| name         | text        | NOT NULL                             |                             |
| city         | text        | NOT NULL                             |                             |
| country      | text        | NOT NULL                             |                             |
| area         | text        | nullable                             | e.g. "Paraga Beach"         |
| venue_type   | text        | nullable                             | `beach_club` or `club`      |
| capacity     | int4        | nullable                             |                             |
| description  | text        | nullable                             | Short editorial description |
| insider_tips | text        | nullable                             | JSON array of tip strings   |
| image_url    | text        | nullable                             | Full URL to venue image     |
| instagram    | text        | nullable                             |                             |
| website      | text        | nullable                             |                             |
| slug         | text        | NOT NULL, UNIQUE                     |                             |
| created_at   | timestamptz | default now()                        |                             |

**Venue data:**
| id | name | slug | area | venue_type | capacity |
|---|---|---|---|---|---|
| 1 | Alemagou | alemagou | Ftelia Beach | beach_club | null |
| 2 | Scorpios | scorpios | Paraga Beach | beach_club | 1000 |
| 3 | SantAnna | santanna | Paraga Beach | beach_club | null |
| 4 | Cavo Paradiso | cavo-paradiso | Paradise Beach | club | 3000 |

### events table

| Column         | Type        | Constraints              | Notes                         |
| -------------- | ----------- | ------------------------ | ----------------------------- |
| id             | uuid        | PRIMARY KEY,             |                               |
| date           | date        | NOT NULL                 | YYYY-MM-DD                    |
| title          | text        | NOT NULL, default 'TBA'  |                               |
| lineup         | text        | nullable                 | Comma-separated artists       |
| venue_id       | int8        | NOT NULL, FK → venues.id |                               |
| start_time     | time        | nullable                 | 17:00 beach clubs, 23:00 Cavo |
| end_time       | time        | nullable                 | 00:00 beach clubs, 06:00 Cavo |
| ticket_url     | text        | nullable                 |                               |
| vip_ticket_url | text        | nullable                 | Cavo Paradiso has this        |
| table_url      | text        | nullable                 | Cavo Paradiso has this        |
| source_url     | text        | nullable                 |                               |
| is_verified    | boolean     | default false            |                               |
| notes          | text        | nullable                 | e.g. "Full Moon Party"        |
| slug           | text        | NOT NULL, UNIQUE         |                               |
| created_at     | timestamptz | default now()            |                               |

### Slug format

- Pattern: `{first-artist}-{YYYY-MM-DD}`
- Examples: `black-coffee-2026-07-13`, `valeron-band-live-2026-05-23`
- First artist = text before first comma in title, lowercased, hyphens

---

## 7. Pages & Routes

| Route                                | Description                                                 |
| ------------------------------------ | ----------------------------------------------------------- |
| `/`                                  | Homepage — hero event, upcoming events, featured venues     |
| `/mykonos`                           | All Mykonos events, filterable by date/venue                |
| `/mykonos/[venue-slug]`              | Venue page — description, insider tips, all upcoming events |
| `/mykonos/[venue-slug]/[event-slug]` | Individual event page                                       |
| `/about`                             | About nightly.gr                                            |

---

## 8. Screen Specs

### Calendar (`/mykonos`)

- DateNavigator: month + prev/next, scrollable day strip with event count dots, active day in accent
- VenueFilter: chip row — All / Scorpios / Cavo Paradiso / SantAnna / Alemagou
- DateHeadline: "Tonight" / "Tomorrow" / "Wednesday, 16 Jul" + event count
- HeroEvent: large featured card — venue, title, time, ticket CTA
- EventFeed: grouped — Sundown (17:00–21:00), Prime Time (21:00–01:00), After Hours (01:00+)
- EventCard: time (mono), venue (muted), title (prominent), ticket button if url exists

### Event Detail (`/mykonos/[venue-slug]/[event-slug]`)

- Venue name + area, event title (large serif), date + time (mono)
- Lineup: individual artists from comma-separated field
- Sticky bottom bar: "Get Tickets" / "VIP" / "Tables" — all open new tab, never handle payment
- Venue info: website + Instagram
- Related: next 3 events at same venue (optional)

### Venue Page (`/mykonos/[venue-slug]`)

- Venue image (full width), name, area, venue type, capacity
- Editorial description
- Insider tips as bullet list
- Website + Instagram links
- All upcoming events at this venue, chronological
