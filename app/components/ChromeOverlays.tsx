"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { DerivedEvent, Venue } from "@/lib/types";
import { SearchSheet } from "./SearchSheet";
import { FilterSheet } from "./FilterSheet";

type OverlayKind = "search" | "filter" | null;

type Ctx = {
  open: OverlayKind;
  setOpen: (k: OverlayKind) => void;
};

const OverlayCtx = createContext<Ctx>({ open: null, setOpen: () => {} });

export function ChromeOverlays({
  events,
  venues,
  children,
}: {
  events: DerivedEvent[];
  venues: Venue[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<OverlayKind>(null);

  return (
    <OverlayCtx.Provider value={{ open, setOpen }}>
      {children}
      {open === "search" && (
        <SearchSheet
          events={events}
          onClose={() => setOpen(null)}
        />
      )}
      {open === "filter" && (
        <FilterSheet
          events={events}
          venues={venues}
          onClose={() => setOpen(null)}
        />
      )}
    </OverlayCtx.Provider>
  );
}

export function OverlayButton({
  kind,
  className,
  ariaLabel,
  children,
}: {
  kind: "search" | "filter";
  className: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const { setOpen } = useContext(OverlayCtx);
  const onClick = useCallback(() => setOpen(kind), [kind, setOpen]);
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
