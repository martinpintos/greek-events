import Link from "next/link";
import { Icon } from "./Icon";
import { OverlayButton } from "./ChromeOverlays";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-paper border-b border-line">
      <div className="mx-auto max-w-5xl px-4 md:px-8 h-14 md:h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="display-h text-[26px] md:text-[30px] leading-none inline-flex items-baseline gap-1 hover:opacity-70 transition-opacity"
        >
          Nightly
          <span className="italic text-mute text-[13px] tracking-normal">
            .gr
          </span>
          <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-accent" />
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          <Link
            href="/mykonos"
            className="hidden md:inline-block px-3 py-1.5 text-[13px] font-mono uppercase tracking-[0.12em] text-mute hover:text-ink transition-colors"
          >
            Mykonos
          </Link>
          <Link
            href="/about"
            className="hidden md:inline-block px-3 py-1.5 text-[13px] font-mono uppercase tracking-[0.12em] text-mute hover:text-ink transition-colors"
          >
            About
          </Link>
          <OverlayButton
            kind="search"
            className="w-9 h-9 md:w-10 md:h-10 grid place-items-center border border-line rounded-full hover:bg-ink hover:text-paper transition-colors"
            ariaLabel="Search"
          >
            <Icon name="search" size={15} />
          </OverlayButton>
          <OverlayButton
            kind="filter"
            className="w-9 h-9 md:w-10 md:h-10 grid place-items-center border border-line rounded-full hover:bg-ink hover:text-paper transition-colors"
            ariaLabel="Filter"
          >
            <Icon name="menu" size={15} />
          </OverlayButton>
        </nav>
      </div>
    </header>
  );
}
