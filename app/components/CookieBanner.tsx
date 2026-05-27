"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "nightly:cookies-ack";
const ACK_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 183;

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function getAcked() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return "0";

    const timestamp = Number(stored);
    if (!Number.isFinite(timestamp)) {
      localStorage.removeItem(STORAGE_KEY);
      return "0";
    }

    if (Date.now() - timestamp > ACK_MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return "0";
    }

    return "1";
  } catch {
    return "1";
  }
}

export function CookieBanner() {
  const acked = useSyncExternalStore(
    subscribe,
    getAcked,
    () => "1",
  );
  const [dismissed, setDismissed] = useState(false);

  if (acked === "1" || dismissed) return null;

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
    setDismissed(true);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-3 bottom-3 md:inset-x-auto md:right-5 md:bottom-5 md:max-w-sm z-50 bg-ink text-paper border border-white/15 shadow-2xl"
    >
      <div className="absolute inset-x-0 top-0 h-1 ticket-stub" />
      <div className="p-4 md:p-5">
        <div className="eyebrow text-faint flex items-center gap-2 mb-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
          Cookies
        </div>
        <p className="text-sm leading-relaxed text-paper/90 m-0">
          We use local storage for six months to remember this notice. No analytics or ad cookies
          are set right now. See our{" "}
          <Link
            href="/about#privacy"
            className="text-accent underline underline-offset-2"
          >
            privacy notice
          </Link>{" "}
          for details.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={accept}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-ink font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
