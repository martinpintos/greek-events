import Link from "next/link";
import { Icon } from "./Icon";
import { ISLANDS } from "@/lib/islands";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-6 md:mt-8 bg-ink text-paper relative">
      <div className="absolute inset-x-0 top-0 h-1.5 ticket-stub" />

      <div className="mx-auto max-w-5xl px-5 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1.45fr_0.9fr_1fr] gap-y-9 md:gap-14">
          <div>
            <div className="eyebrow text-faint flex items-center gap-2 mb-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
              nightly.gr · est. 2026 · Athens
            </div>
            <p className="display-h text-2xl md:text-[34px] leading-[1.05] mb-4 max-w-sm">
              Greek islands, what&apos;s on.
            </p>
            <p className="text-sm leading-relaxed text-faint max-w-sm">
              Plan your week on the Greek islands. Venues, lineups, opening hours, and the small
              things locals would tell you.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href="https://instagram.com/nightly.gr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 border border-white/20 rounded-full text-xs font-mono tracking-wider hover:border-accent hover:text-accent transition-colors"
              >
                <Icon name="ig" size={14} /> Instagram
              </a>
              <a
                href="https://open.spotify.com/playlist/3UW2zSV5caZ2ZdLi3u485K?si=DzhVAgAnR_CqcOwS9SdFcg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 border border-white/20 rounded-full text-xs font-mono tracking-wider hover:border-accent hover:text-accent transition-colors"
              >
                <Icon name="play" size={13} /> Spotify mixes
              </a>
            </div>
          </div>

          <div className="grid grid-cols-[max-content_max-content] justify-start gap-x-10 sm:gap-x-14 md:contents">
            <div>
              <div className="eyebrow text-faint mb-4 pb-2 border-b border-white/10">Islands</div>
              <ul className="space-y-2 text-sm">
                {ISLANDS.map((i) => (
                  <li key={i.id}>
                    {i.active ? (
                      <Link href={`/${i.id}`} className="hover:text-accent transition-colors">
                        {i.name}
                      </Link>
                    ) : (
                      <span className="text-faint">
                        {i.name} <span className="font-mono text-[10px] tracking-wider">soon</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="eyebrow text-faint mb-4 pb-2 border-b border-white/10">Contact</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-accent transition-colors">
                    About nightly.gr
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:nightlygreece@gmail.com?subject=Submit%20an%20event"
                    className="hover:text-accent transition-colors"
                  >
                    Submit an event
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:nightlygreece@gmail.com?subject=Venue%20partner"
                    className="hover:text-accent transition-colors"
                  >
                    Venue partners
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:nightlygreece@gmail.com?subject=Advertise"
                    className="hover:text-accent transition-colors"
                  >
                    Advertise
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="my-9 md:my-10 h-px dashed-rule" />

        <div className="flex flex-col md:flex-row md:flex-wrap md:items-baseline md:justify-between gap-2 md:gap-4">
          <div className="display-h italic text-xl flex items-baseline">
            nightly<span className="text-accent">.gr</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-faint">
            <span>© {year} nightly.gr</span>
            <span className="opacity-50">·</span>
            <Link href="/about#privacy" className="hover:text-accent transition-colors">
              Privacy
            </Link>
            <span className="opacity-50">·</span>
            <Link href="/about#terms" className="hover:text-accent transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
