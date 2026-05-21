import type { IslandMeta } from "./types";

export const ISLANDS: IslandMeta[] = [
  {
    id: "mykonos",
    name: "Mykonos",
    short: "MYK",
    vibe: "Big rooms, bigger egos. Pay-to-play and proud of it.",
    active: true,
  },
  {
    id: "santorini",
    name: "Santorini",
    short: "JTR",
    vibe: "Caldera sunsets bleed into late nights in Fira.",
    active: false,
  },
  {
    id: "ios",
    name: "Ios",
    short: "IOS",
    vibe: "Backpacker mayhem. Still where you go to be twenty.",
    active: false,
  },
  {
    id: "paros",
    name: "Paros",
    short: "PAS",
    vibe: "Quieter than Mykonos, smarter than Ios.",
    active: false,
  },
  {
    id: "rhodes",
    name: "Rhodes",
    short: "RHO",
    vibe: "Old town bars and beach clubs that go til dawn.",
    active: false,
  },
];

const BY_CITY: Record<string, IslandMeta["id"]> = {
  mykonos: "mykonos",
  santorini: "santorini",
  ios: "ios",
  paros: "paros",
  rhodes: "rhodes",
};

export function islandFromCity(city: string): IslandMeta["id"] {
  const key = city.trim().toLowerCase();
  return BY_CITY[key] ?? "mykonos";
}

export function islandById(id: IslandMeta["id"]): IslandMeta {
  return ISLANDS.find((i) => i.id === id) ?? ISLANDS[0];
}
