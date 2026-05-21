export type IslandId = "mykonos" | "santorini" | "ios" | "paros" | "rhodes";

export type VenueType = "club" | "beach_club" | "bar" | "boat";

export type VenueRow = {
  id: number;
  name: string;
  city: string;
  country: string;
  area: string | null;
  venue_type: VenueType | null;
  capacity: number | null;
  description: string | null;
  insider_tips: string | null;
  image_url: string | null;
  instagram: string | null;
  website: string | null;
  slug: string;
};

export type EventRow = {
  id: string;
  idx?: number | null;
  date: string;
  title: string;
  lineup: string | null;
  venue_id: number;
  start_time: string | null;
  end_time: string | null;
  ticket_url: string | null;
  vip_ticket_url: string | null;
  table_url: string | null;
  source_url?: string | null;
  is_verified: boolean;
  notes: string | null;
  slug: string;
};

export type Venue = VenueRow & {
  island: IslandId;
  insiderTips: string[];
};

export type Tier = {
  kind: "ga" | "vip" | "table";
  label: string;
  price: number;
  url: string;
};

export type EventBucket = "sundown" | "prime" | "late";

export type EventTag =
  | "after-hours"
  | "sunset"
  | "day"
  | "season-opener"
  | "locals";

export type DerivedEvent = {
  id: string;
  slug: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  lineup: string[];
  notes: string | null;
  venue: Venue;
  tiers: Tier[];
  priceFrom: number | null;
  isFree: boolean;
  lgbtq: boolean;
  tags: EventTag[];
  bucket: EventBucket;
  palette: [string, string];
};

export type IslandMeta = {
  id: IslandId;
  name: string;
  short: string;
  vibe: string;
  active: boolean;
};
