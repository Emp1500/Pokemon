import { PokemonType } from '@/types/pokemon';

export const TYPE_COLORS: Record<PokemonType, { bg: string; gradient: string; text: string }> = {
  grass: {
    bg: 'rgb(76, 175, 80)',
    gradient: 'linear-gradient(135deg, rgb(76, 175, 80) 0%, rgb(56, 142, 60) 100%)',
    text: 'text-white',
  },
  fire: {
    bg: 'rgb(244, 67, 54)',
    gradient: 'linear-gradient(135deg, rgb(244, 67, 54) 0%, rgb(211, 47, 47) 100%)',
    text: 'text-white',
  },
  water: {
    bg: 'rgb(33, 150, 243)',
    gradient: 'linear-gradient(135deg, rgb(33, 150, 243) 0%, rgb(25, 118, 210) 100%)',
    text: 'text-white',
  },
  electric: {
    bg: 'rgb(255, 235, 59)',
    gradient: 'linear-gradient(135deg, rgb(255, 235, 59) 0%, rgb(253, 216, 53) 100%)',
    text: 'text-gray-900',
  },
  psychic: {
    bg: 'rgb(236, 64, 122)',
    gradient: 'linear-gradient(135deg, rgb(236, 64, 122) 0%, rgb(216, 27, 96) 100%)',
    text: 'text-white',
  },
  ice: {
    bg: 'rgb(79, 195, 247)',
    gradient: 'linear-gradient(135deg, rgb(79, 195, 247) 0%, rgb(41, 182, 246) 100%)',
    text: 'text-white',
  },
  dragon: {
    bg: 'rgb(103, 58, 183)',
    gradient: 'linear-gradient(135deg, rgb(103, 58, 183) 0%, rgb(81, 45, 168) 100%)',
    text: 'text-white',
  },
  dark: {
    bg: 'rgb(66, 66, 66)',
    gradient: 'linear-gradient(135deg, rgb(66, 66, 66) 0%, rgb(33, 33, 33) 100%)',
    text: 'text-white',
  },
  fairy: {
    bg: 'rgb(244, 143, 177)',
    gradient: 'linear-gradient(135deg, rgb(244, 143, 177) 0%, rgb(240, 98, 146) 100%)',
    text: 'text-white',
  },
  normal: {
    bg: 'rgb(158, 158, 158)',
    gradient: 'linear-gradient(135deg, rgb(158, 158, 158) 0%, rgb(117, 117, 117) 100%)',
    text: 'text-white',
  },
  fighting: {
    bg: 'rgb(211, 47, 47)',
    gradient: 'linear-gradient(135deg, rgb(211, 47, 47) 0%, rgb(183, 28, 28) 100%)',
    text: 'text-white',
  },
  flying: {
    bg: 'rgb(129, 212, 250)',
    gradient: 'linear-gradient(135deg, rgb(129, 212, 250) 0%, rgb(79, 195, 247) 100%)',
    text: 'text-gray-900',
  },
  poison: {
    bg: 'rgb(156, 39, 176)',
    gradient: 'linear-gradient(135deg, rgb(156, 39, 176) 0%, rgb(123, 31, 162) 100%)',
    text: 'text-white',
  },
  ground: {
    bg: 'rgb(141, 110, 99)',
    gradient: 'linear-gradient(135deg, rgb(141, 110, 99) 0%, rgb(109, 76, 65) 100%)',
    text: 'text-white',
  },
  rock: {
    bg: 'rgb(109, 76, 65)',
    gradient: 'linear-gradient(135deg, rgb(109, 76, 65) 0%, rgb(78, 52, 46) 100%)',
    text: 'text-white',
  },
  bug: {
    bg: 'rgb(139, 195, 74)',
    gradient: 'linear-gradient(135deg, rgb(139, 195, 74) 0%, rgb(104, 159, 56) 100%)',
    text: 'text-white',
  },
  ghost: {
    bg: 'rgb(94, 53, 177)',
    gradient: 'linear-gradient(135deg, rgb(94, 53, 177) 0%, rgb(74, 20, 140) 100%)',
    text: 'text-white',
  },
  steel: {
    bg: 'rgb(96, 125, 139)',
    gradient: 'linear-gradient(135deg, rgb(96, 125, 139) 0%, rgb(69, 90, 100) 100%)',
    text: 'text-white',
  },
};

export const getTypeColor = (type: PokemonType) => {
  return TYPE_COLORS[type] || TYPE_COLORS.normal;
};

export const formatPokemonId = (id: number): string => {
  return `#${id.toString().padStart(3, '0')}`;
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
