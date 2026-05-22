"use client";

import { useState } from "react";
import type { DerivedEvent } from "@/lib/types";
import { EventCard } from "./EventCard";

const INITIAL_COUNT = 12;
const STEP = 12;

export function VenueUpcomingList({ events }: { events: DerivedEvent[] }) {
  const [visible, setVisible] = useState(INITIAL_COUNT);
  const shown = events.slice(0, visible);
  const remaining = events.length - shown.length;

  return (
    <>
      {shown.map((e) => (
        <EventCard key={e.id} ev={e} showDate hideVenue />
      ))}
      {remaining > 0 && (
        <div className="border-t border-hairline px-4 md:px-6 py-5 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisible((v) => Math.min(v + STEP, events.length))
            }
            className="px-4 py-2 border border-line rounded-full text-sm hover:bg-ink hover:text-paper transition-colors"
          >
            Show more ({remaining} left)
          </button>
        </div>
      )}
    </>
  );
}
