"use client";

import { useState } from "react";
import type { DerivedEvent, Tier } from "@/lib/types";
import { Icon } from "./Icon";

export function TicketBar({
  ev,
  inline = false,
}: {
  ev: DerivedEvent;
  inline?: boolean;
}) {
  const [selected, setSelected] = useState<Tier["kind"]>(
    ev.tiers[0]?.kind ?? "ga",
  );

  // No tickets at all → small CTA explaining
  if (ev.tiers.length === 0) {
    return (
      <div
        className={
          inline
            ? "border border-line bg-ink text-paper"
            : "sticky bottom-0 z-30 bg-ink text-paper border-t border-ink lg:hidden"
        }
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/60">
              Pay
            </span>
            <span className="display-h text-xl leading-none">At the door</span>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 font-mono text-[11px] uppercase tracking-[0.12em] opacity-70">
            <Icon name="ticket" size={14} />
            No advance tickets
          </span>
        </div>
      </div>
    );
  }

  if (ev.tiers.length === 1) {
    const tier = ev.tiers[0];
    const isTable = tier.kind === "table";
    return (
      <div
        className={
          inline
            ? "border border-line bg-ink text-paper"
            : "sticky bottom-0 z-30 bg-ink text-paper border-t border-ink lg:hidden"
        }
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/60">
              {tier.price != null ? tier.label : isTable ? "Reserve" : "Tickets"}
            </span>
            <span className="display-h text-2xl leading-none">
              {tier.price != null ? `€${tier.price}` : tier.label}
            </span>
          </div>
          <a
            href={tier.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-ink font-mono text-[12px] font-bold uppercase tracking-[0.16em] hover:brightness-110 transition-all"
          >
            <Icon name={isTable ? "calendar" : "ticket"} size={14} />
            {isTable ? "Reserve table" : "Get tickets"}
          </a>
        </div>
      </div>
    );
  }

  const tier = ev.tiers.find((t) => t.kind === selected) ?? ev.tiers[0];
  const isTable = tier.kind === "table";

  return (
    <div
      className={
        inline
          ? "border border-line bg-ink text-paper"
          : "sticky bottom-0 z-30 bg-ink text-paper border-t border-ink lg:hidden"
      }
    >
      <div className="grid grid-cols-3 border-b border-white/10">
        {ev.tiers.map((t) => {
          const on = t.kind === tier.kind;
          return (
            <button
              key={t.kind}
              type="button"
              onClick={() => setSelected(t.kind)}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-3 border-r border-white/10 last:border-r-0 transition-opacity ${
                on ? "opacity-100" : "opacity-60 hover:opacity-90"
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                {t.label}
              </span>
              {t.price != null && (
                <span className="display-h text-lg leading-none">€{t.price}</span>
              )}
              {on && (
                <span className="absolute left-[18%] right-[18%] bottom-0 h-0.5 bg-accent" />
              )}
            </button>
          );
        })}
      </div>
      <a
        href={tier.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="flex items-center gap-3 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-accent text-ink font-mono text-[12px] font-bold uppercase tracking-[0.16em] hover:brightness-110 transition-all"
      >
        <Icon name={isTable ? "calendar" : "ticket"} size={14} />
        <span className="flex-1">
          {isTable ? "Reserve table" : `Buy ${tier.label} tickets`}
        </span>
        {tier.price != null && (
          <span className="display-h text-lg normal-case tracking-tight">
            €{tier.price}
          </span>
        )}
        <Icon name="arrow_r" size={14} stroke={2} />
      </a>
    </div>
  );
}
