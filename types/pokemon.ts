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

export interface Pokemon {
  id: number;
  name: string;
  type: PokemonType;
  types: PokemonType[];
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
  siblings?: {
    prev?: { id: number; name: string };
    current: { id: number; name: string };
    next?: { id: number; name: string };
  };
}
