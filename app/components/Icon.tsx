type IconName =
  | "menu"
  | "search"
  | "filter"
  | "arrow_r"
  | "arrow_l"
  | "chevron_r"
  | "chevron_l"
  | "plus"
  | "close"
  | "pin"
  | "ticket"
  | "calendar"
  | "clock"
  | "ferry"
  | "ig"
  | "play";

const PATHS: Record<IconName, React.ReactNode> = {
  menu: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="13" y2="18" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" />
    </>
  ),
  filter: <path d="M3 5h18M6 12h12M10 19h4" />,
  arrow_r: <path d="M5 12h14M13 5l7 7-7 7" />,
  arrow_l: <path d="M19 12H5M11 5L4 12l7 7" />,
  chevron_r: <path d="M9 6l6 6-6 6" />,
  chevron_l: <path d="M15 6l-6 6 6 6" />,
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  close: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M9 5v14" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </>
  ),
  ferry: (
    <>
      <path d="M3 17l9-2 9 2" />
      <path d="M5 17V8h14v9" />
      <path d="M9 8V5h6v3" />
      <path d="M3 17c1.5 2 3 2 4.5 0s3 2 4.5 0 3 2 4.5 0 3 2 4.5 0" />
    </>
  ),
  ig: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </>
  ),
  play: <polygon points="7 5 19 12 7 19 7 5" />,
};

export function Icon({
  name,
  size = 18,
  stroke = 1.6,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
