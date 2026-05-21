import Link from "next/link";
import type { DerivedEvent } from "@/lib/types";
import { Icon } from "./Icon";

export function HeroEvent({ ev }: { ev: DerivedEvent }) {
  const href = `/mykonos/${ev.venue.slug}/${ev.slug}`;
  const lead = (ev.lineup[0] || ev.title).toUpperCase();
  const style: React.CSSProperties = {
    background: `linear-gradient(135deg, ${ev.palette[0]} 0%, ${ev.palette[1]} 70%)`,
  };

  return (
    <Link
      href={href}
      className="group block relative overflow-hidden text-paper hero-noise"
      style={style}
    >
      <div className="hero-stripes relative aspect-[4/5] md:aspect-[16/10]">
        {/* Decorative repeating type backdrop */}
        <div className="absolute inset-0 flex flex-col justify-end px-5 md:px-10 pt-10 pb-28 md:pb-32 gap-2 pointer-events-none">
          <div className="display-h text-[60px] md:text-[120px] leading-[0.82] uppercase tracking-[-0.03em] text-white/[0.08] truncate">
            {lead}
          </div>
          <div className="display-h text-[60px] md:text-[120px] leading-[0.82] uppercase tracking-[-0.03em] text-white/[0.08] truncate text-right">
            {lead}
          </div>
          <div className="display-h text-[60px] md:text-[120px] leading-[0.82] uppercase tracking-[-0.03em] text-white/[0.08] truncate">
            {lead}
          </div>
        </div>

        {/* Eyebrow */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
          <span className="font-mono text-[9.5px] md:text-[10px] font-semibold uppercase tracking-[0.2em] text-paper">
            Tonight&rsquo;s pick · {ev.venue.area ?? ev.venue.city}
          </span>
        </div>

        {/* Title block */}
        <div className="absolute left-4 right-4 bottom-4 md:left-8 md:right-8 md:bottom-8 z-10">
          <h2 className="display-h text-[34px] md:text-[56px] leading-[0.95] mb-3 md:mb-4">
            {ev.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-paper/85">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" size={11} /> {ev.startTime}–{ev.endTime}
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
