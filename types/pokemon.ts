export type PokemonType =
  | 'grass'
  | 'fire'
  | 'water'
  | 'electric'
  | 'psychic'
  | 'ice'
  | 'dragon'
  | 'dark'
  | 'fairy'
  | 'normal'
  | 'fighting'
  | 'flying'
  | 'poison'
  | 'ground'
  | 'rock'
  | 'bug'
  | 'ghost'
  | 'steel';

export interface PokemonStat {
  name: string;
  value: number;
  maxValue?: number;
}

export type Region = 'kanto' | 'johto' | 'hoenn' | 'sinnoh' | 'unova' | 'kalos' | 'alola' | 'galar' | 'paldea';
export type LegendaryStatus = 'normal' | 'legendary' | 'mythical' | 'ultra-beast';

export interface Pokemon {
  id: number;
  name: string;
  type: PokemonType;
  types: PokemonType[];
  generation?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  region?: Region;
  height: number; // in meters
  weight: number; // in kg
  abilities: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  imageUrl: string;
  sprites?: {
    normal: string;
    shiny?: string;
    artwork?: string;
  };
  legendaryStatus?: LegendaryStatus;
  description?: string; // Pokemon lore/flavor text
  category?: string; // e.g., "Seed Pokemon", "Flame Pokemon"
  searchTerms?: string[]; // Pre-computed for search optimization
  evolutionChain?: number[]; // IDs of related Pokemon
  siblings?: {
    prev?: { id: number; name: string };
    current: { id: number; name: string };
    next?: { id: number; name: string };
  };
}
