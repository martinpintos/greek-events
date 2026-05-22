import Link from "next/link";
import type { CSSProperties } from "react";
import { islandById } from "@/lib/islands";
import type { DerivedEvent } from "@/lib/types";
import { Icon } from "./Icon";

export function HeroEvent({ ev }: { ev: DerivedEvent }) {
  const href = `/mykonos/${ev.venue.slug}/${ev.slug}`;
  const lead = (ev.lineup[0] || ev.title).toUpperCase();
  const islandName = islandById(ev.venue.island).name.toUpperCase();
  const accent =
    ev.palette.find((color) => color !== "#0c0c0c" && color !== "#f6f4ee") ??
    "#ff4d2e";
  const style: CSSProperties = {
    background: `
      linear-gradient(90deg, rgba(8, 4, 3, 0.08) 0%, rgba(4, 4, 4, 0.7) 100%),
      radial-gradient(circle at 0% 0%, ${accent} 0%, #58190f 36%, #050505 100%)
    `,
  };

  return (
    <Link
      href={href}
      className="group block w-full max-w-[380px] md:max-w-[560px] border border-accent/70 bg-paper p-1.5 shadow-[0_18px_34px_rgba(255,77,46,0.16),0_18px_38px_rgba(12,12,12,0.16)] transition-shadow hover:shadow-[0_20px_38px_rgba(255,77,46,0.2),0_22px_42px_rgba(12,12,12,0.2)]"
    >
      <div
        className="hero-stripes hero-noise relative aspect-[4/5] md:aspect-[16/10] overflow-hidden bg-ink text-paper"
        style={style}
      >
        <div className="absolute inset-0 featured-card-scrim z-[1]" />
        {/* Decorative repeating type backdrop */}
        <div className="absolute inset-0 flex flex-col justify-center px-5 md:px-9 pt-12 pb-24 md:pb-28 gap-2 pointer-events-none">
          <div className="display-h text-[68px] md:text-[116px] leading-[0.82] uppercase text-white/[0.14] truncate">
            {lead}
          </div>
          <div className="display-h text-[68px] md:text-[116px] leading-[0.82] uppercase text-white/[0.12] truncate text-right">
            {lead}
          </div>
          <div className="display-h text-[68px] md:text-[116px] leading-[0.82] uppercase text-white/[0.12] truncate">
            {lead}
          </div>
        </div>

        {/* Eyebrow */}
        <div className="absolute top-4 left-4 md:top-5 md:left-5 z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2b100c]/84 backdrop-blur-md shadow-[0_0_18px_rgba(0,0,0,0.2)]">
          <span className="relative inline-flex w-4 h-4 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-accent/35 pulse-ring" />
            <span className="relative inline-block w-2 h-2 rounded-full bg-accent pick-dot-pulse" />
          </span>
          <span className="font-mono text-[9.5px] md:text-[10px] font-semibold uppercase tracking-[0.2em] text-paper">
            Tonight&rsquo;s pick · {islandName}
          </span>
        </div>

        {/* Title block */}
        <div className="absolute left-4 right-4 bottom-4 md:left-7 md:right-7 md:bottom-7 z-10">
          <h2 className="display-h text-[31px] md:text-[50px] leading-[0.95] mb-3 md:mb-4 text-shadow-soft">
            {ev.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.1em] text-paper/92">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" size={11} /> {ev.startTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="pin" size={11} /> {ev.venue.name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
