export type IslandId = "mykonos" | "santorini" | "ios" | "paros" | "rhodes";

export type VenueType = "club" | "beach_club" | "bar" | "boat" | "festival";

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
  date: string;
  title: string;
  lineup: string | null;
  venue_id: number;
  start_time: string | null;
  end_time: string | null;
  ticket_url: string | null;
  vip_ticket_url: string | null;
  table_url: string | null;
  price_from: number | null;
  vip_price: number | null;
  table_price: number | null;
  is_verified: boolean;
  is_lgbtq: boolean | null;
  off_the_record: string | null;
  slug: string;
};

export type Venue = VenueRow & {
  island: IslandId;
  insiderTips: string[];
};

export type Tier = {
  kind: "ga" | "vip" | "table";
  label: string;
  url: string;
  price: number | null;
};

export type EventBucket = "sundown" | "prime" | "late";

export type EventTag =
  | "night"
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
  offTheRecord: string | null;
  venue: Venue;
  tiers: Tier[];
  priceFrom: number | null;
  lgbtq: boolean;
  tags: EventTag[];
  bucket: EventBucket;
  palette: [string, string];
};

// Slim shapes for the search/filter overlays. Every page ships these for all
// events, so they carry only the fields the sheets read. `DerivedEvent` and
// `Venue` are structurally assignable, so pages that already pass the full
// objects to other components can reuse the same array.
export type OverlayVenueRef = {
  name: string;
  slug: string;
  area: string | null;
  city: string;
  island: IslandId;
  venue_type: VenueType | null;
};

export type OverlayEvent = {
  id: string;
  slug: string;
  date: string;
  startTime: string;
  title: string;
  lineup: string[];
  lgbtq: boolean;
  tags: EventTag[];
  venue: OverlayVenueRef;
};

export type OverlayVenue = {
  name: string;
  slug: string;
  island: IslandId;
  venue_type: VenueType | null;
};

export type IslandMeta = {
  id: IslandId;
  name: string;
  short: string;
  vibe: string;
  active: boolean;
};
