# nightly.gr

Greek islands, what's on.

nightly.gr is a nightlife calendar for the Greek islands. The first version is focused on
Mykonos, with events, venues, lineups, dates, ticket links, VIP/table links, and simple
filters to help people plan their nights out.

It is built to feel more editorial than a generic listings site: quick to scan, nice to use
on mobile, and useful when someone just wants to know what is happening tonight, tomorrow,
or during their trip.

## Links

- Main domain: [nightly.gr](https://nightly.gr)
- Current live deployment: [nightly.gr.net](https://nightly.gr.net)
- Local development: [http://localhost:3000](http://localhost:3000)
- Product notes: [PRD.md](PRD.md)

## What Is Inside

- Mykonos nightlife calendar
- Venue pages
- Event detail pages
- Date, venue, island, type, queer-friendly, and after-hours filters
- External links for tickets, VIP, and table reservations
- SEO pages, sitemap, robots.txt, and event structured data

Current MVP venues:

- Scorpios
- Cavo Paradiso
- SantAnna
- Alemagou
- XLSIOR Festival
- Void

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- Supabase Postgres
- Vercel

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
NIGHTLY_SHOW_HOME_HERO=false
```

Start the dev server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Commands

| Command         | What it does                                |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Runs the app locally.                       |
| `npm run build` | Builds the production app and checks types. |
| `npm run start` | Starts the production build.                |
| `npm run lint`  | Runs ESLint.                                |

There is no separate test command yet. `npm run build` is the main production check.

## Project Structure

```text
app/      Pages, routes, and UI components
lib/      Data loading, formatting, filtering, and Supabase helpers
public/   Static assets
PRD.md    Product requirements and project notes
```

## Notes

- The app needs `SUPABASE_URL` and `SUPABASE_KEY` to run.
- Event and venue data comes from Supabase.
- Ticket buttons always link to external sites. nightly.gr does not sell tickets directly.
- Mykonos is the only active island for the MVP. More islands can come later.
- This project uses Next.js 16, so check the local Next docs before changing framework-level code.
