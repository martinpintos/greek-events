<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project: nightly.gr

Nightlife event calendar for the Greek islands. MVP is Mykonos-only (4 venues, ~331 events). Stack: [Next.js](next.config.ts) 16 App Router + React 19 + Tailwind v4 + Supabase (Postgres). Domain: nightly.gr. Full product spec is in [PRD.md](PRD.md).

## Commands

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Start built app | `npm run start` |
| Lint | `npm run lint` |

No test runner is configured. There is no separate typecheck script — `next build` does the typecheck via the Next TS plugin.

## Required env vars (`.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NIGHTLY_SHOW_HOME_HERO` (optional, `"true"` toggles the editorial hero block on `/`)

Missing the two Supabase vars throws at import time from [lib/supabase.ts:7](lib/supabase.ts#L7).

## Data flow (read this before touching anything that loads events)

Three layers, do not skip:

1. **[lib/supabase.ts](lib/supabase.ts)** — raw row fetchers returning `EventRow` / `VenueRow`. Don't call from pages.
2. **[lib/derive.ts](lib/derive.ts)** — enriches rows into `DerivedEvent` / `Venue`. **Important:** `palette`, `tiers`, `priceFrom`, `lgbtq` are *deterministically mocked from a seed* (`row.idx` or hash of `row.id`) — they're not in the DB. Same row → same values. If you treat them as DB truth, you will be wrong.
3. **[lib/data.ts](lib/data.ts)** — public entry points (`getAllEvents`, `getVenues`, `getVenueBySlug`, `getEventBySlug`). Wrapped in React `cache()` for per-request dedup. **Pages must import from here, not from `lib/supabase` directly** — the only exceptions are [sitemap.ts](app/sitemap.ts) and `generateStaticParams` calls that need the raw rows.

## Routes

App Router. Next 16 — `params` is a `Promise`, always `await` it.

- `/` — home, calendar across all islands (currently only Mykonos data)
- `/mykonos` — island hub, same `CalendarBody` locked to `islandLock="mykonos"`
- `/mykonos/[venue]` — venue page (`generateStaticParams` from venues, `revalidate = 3600`)
- `/mykonos/[venue]/[event]` — event detail with JSON-LD `schema.org/Event` (`revalidate = 3600`)
- `/about`
- `/sitemap.xml`, `/robots.txt` — Metadata Route handlers in [app/sitemap.ts](app/sitemap.ts) / [app/robots.ts](app/robots.ts)

`/` and `/mykonos` use `export const dynamic = "force-dynamic"`. Detail pages are ISR.

## Calendar state lives in the URL

[app/components/CalendarBody.tsx](app/components/CalendarBody.tsx) is a client component that reads `?date=`, `?islands=`, `?venues=`, `?type=`, `?queer=1`, `?after=1` from `useSearchParams` and writes via `router.replace`. Filter parsing/serialization is in [lib/filter.ts](lib/filter.ts). Date selector clamps to season May–Oct via `clampSeason` — selecting an out-of-season date snaps back to today.

## Dates

All dates are string-based ISO `YYYY-MM-DD`. The date helpers in [lib/format.ts](lib/format.ts) (`todayISO`, `addDays`, `parseISO`, `isoDate`, `dateHeadline`, `editorNoteForDate`) construct `Date` at noon local time to avoid TZ-edge bugs. Don't introduce `new Date(iso)` — use `parseISO`.

## Conventions worth knowing

- Path alias: `@/*` → repo root (see [tsconfig.json](tsconfig.json)). Imports use `@/lib/...`, `@/app/components/...`.
- Slug format: `{first-artist-lowercased-hyphenated}-{YYYY-MM-DD}`. Slugs are stored in the DB and are unique; don't recompute them.
- Hero selection: [`pickHero`](lib/derive.ts) prefers Cavo Paradiso after-hours, then any after-hours, then first.
- Buckets: events are grouped sundown (12–21h) / prime (21–04h) / late by `start_time` in [`bucketFor`](lib/derive.ts).
- Islands: only `mykonos` is `active: true` in [lib/islands.ts](lib/islands.ts); the others are placeholders for v2.
- Tickets: never handle payments — all CTAs are external links that open in a new tab.
