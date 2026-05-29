"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { OverlayButton } from "./ChromeOverlays";

const HIDE_AFTER = 80;
const DELTA = 6;

export function Header() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.round(h)}px`,
      );
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--chrome-hidden",
      hidden ? "1" : "0",
    );
  }, [hidden]);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const diff = y - lastY.current;

      if (Math.abs(diff) > DELTA) {
        if (diff > 0 && y > HIDE_AFTER) {
          setHidden(true);
        } else if (diff < 0) {
          setHidden(false);
        }
        lastY.current = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-30 bg-paper border-b border-line transition-transform duration-500 ease-out will-change-transform ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto max-w-5xl px-5 md:px-8 h-14 md:h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="display-h italic text-[26px] md:text-[30px] leading-none inline-flex items-baseline hover:opacity-70 transition-opacity"
        >
          nightly<span className="text-accent">.gr</span>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          <OverlayButton
            kind="search"
            className="w-9 h-9 md:w-10 md:h-10 grid place-items-center border border-line rounded-full hover:bg-ink hover:text-paper transition-colors"
            ariaLabel="Search"
          >
            <Icon name="search" size={18} stroke={1.8} />
          </OverlayButton>
        </nav>
      </div>
    </header>
  );
}
