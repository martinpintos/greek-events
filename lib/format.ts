export function todayISO(): string {
  // "Today" in Greece (Europe/Athens), independent of the server's timezone.
  // en-CA formats as YYYY-MM-DD; the timeZone option keeps us on the correct
  // calendar day even when the server runs in UTC (e.g. Vercel).
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Athens" });
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

export function shortDOW(iso: string): string {
  return parseISO(iso)
    .toLocaleDateString("en-GB", { weekday: "short" })
    .slice(0, 2)
    .toUpperCase();
}

export function shortMonth(iso: string): string {
  return parseISO(iso)
    .toLocaleDateString("en-GB", { month: "short" })
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

// Lifted from the design's data.js, with daily editor notes keyed by weekday.
const WEEKDAY_NOTES: Record<number, string> = {
  0: "Sunday slows down. Long lunches that bleed into sundown, beach clubs easing the volume back, one last stretch before the week resets.",
  1: "Monday is the reset. Ferries running, most rooms dark. Eat, swim, sleep, earn back the week.",
  2: "Tuesday is the soft open. Smaller crowds, easier doors, bar staff still have time to talk.",
  3: "Wednesday picks up. The week's residencies start hitting, but it's still lighter than the weekend.",
  4: "Thursday is the warm-up. Pre-weekend energy starts showing, doors get busier, lineups get sharper.",
  5: "Friday: everywhere's open, everywhere's busy. The obvious rooms fill first, so get there early or aim sideways.",
  6: "Saturday is the long day. Beach club through dusk, dancing through dawn. Pace yourself or pay for it tomorrow.",
};

export function editorNoteForDate(iso: string): string {
  return WEEKDAY_NOTES[parseISO(iso).getDay()] ?? WEEKDAY_NOTES[2];
}
