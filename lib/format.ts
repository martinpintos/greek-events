export function todayISO(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return isoDate(d);
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function startOfMonth(iso: string): string {
  const d = parseISO(iso);
  return isoDate(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function endOfMonth(iso: string): string {
  const d = parseISO(iso);
  return isoDate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function monthLabel(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function dateHeadline(iso: string, today: string): string {
  if (iso === today) return "Today";
  if (iso === addDays(today, 1)) return "Tomorrow";
  return parseISO(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function fullDateLine(iso: string): string {
  return parseISO(iso)
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .toUpperCase();
}

export function shortDOW(iso: string): string {
  return parseISO(iso)
    .toLocaleDateString("en-GB", { weekday: "short" })
    .slice(0, 2)
    .toUpperCase();
}

export function dayOfMonth(iso: string): number {
  return parseISO(iso).getDate();
}

export function parseLineup(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseInsiderTips(raw: string | null): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed))
        return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch {
      // fall through
    }
  }
  return trimmed
    .split(/\r?\n|•|·|;|\|/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatTime(t: string | null): string {
  if (!t) return "";
  return t.slice(0, 5);
}

export function timeRange(start: string | null, end: string | null): string {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s}-${e}`;
  return s || e || "";
}

// Lifted from the design's data.js, with daily editor notes keyed by weekday.
const WEEKDAY_NOTES: Record<number, string> = {
  0: "Sunday Service. Honey's Astra residency starts at 11, ends when she's ready. Tea dances on Rhodes if you're on that side.",
  1: "Monday is for hangovers and ferries. One late bar on Paros, one on Ios. Otherwise: eat, swim, sleep.",
  2: "Tuesday's the soft open of the week. Clubs warming up but the bar staff still remember your name. Astra and Scorpios over Cavo unless you're chasing the headliner.",
  3: "Wednesday belongs to Cavo. Music On has been running every Wednesday since 2014 and hasn't missed yet. Sleep early if you're flying tomorrow.",
  4: "Thursday tilts queer. Astra's drag night and Paragon's tea dance on Rhodes. Tale Of Us at Cavo if you want the big-room sweat.",
  5: "Friday: everywhere's open, half of it's mediocre. Stick to Cavo, Pathos on Ios for the late shift, or Toy Room if hip-hop's the move.",
  6: "Saturday is for beach clubs and pacing yourself. Don't blow it on a midday daybed bottle. You'll need the energy at 4am.",
};

export function editorNoteForDate(iso: string): string {
  return WEEKDAY_NOTES[parseISO(iso).getDay()] ?? WEEKDAY_NOTES[2];
}

export function pluralize(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}
