'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Leaf, Flame, Droplet, Zap, Brain, Snowflake, Moon } from 'lucide-react';
import { Pokemon } from '@/types/pokemon';
import { formatPokemonId, capitalizeFirstLetter } from '@/lib/colors';

const TYPE_ICONS = {
  grass: Leaf,
  fire: Flame,
  water: Droplet,
  electric: Zap,
  psychic: Brain,
  ice: Snowflake,
  dark: Moon,
  fairy: Moon,
  normal: Moon,
  fighting: Flame,
  flying: Leaf,
  poison: Droplet,
  ground: Moon,
  rock: Moon,
  bug: Leaf,
  ghost: Moon,
  steel: Moon,
  dragon: Flame,
};

interface PokemonCardProps {
  pokemon: Pokemon;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const TypeIcon = TYPE_ICONS[pokemon.type] || Leaf;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-8 py-16">
      {/* Background ID Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.span
          className="text-[15rem] md:text-[20rem] font-black text-white/5 select-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {formatPokemonId(pokemon.id)}
        </motion.span>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Pokemon Info */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Type Badge */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <TypeIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase text-white/80">
              {pokemon.type}
            </span>
          </div>

          {/* Name */}
          <motion.h1
            className="text-7xl md:text-8xl font-black uppercase text-white leading-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {pokemon.name}
          </motion.h1>

          {/* Meta Information */}
          <motion.div
            className="space-y-4 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium tracking-wide uppercase text-white/60 w-20">
                  Height
                </span>
                <span className="text-xl font-bold text-white">
                  {pokemon.height}M
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium tracking-wide uppercase text-white/60 w-20">
                  Weight
                </span>
                <span className="text-xl font-bold text-white">
                  {pokemon.weight}KG
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium tracking-wide uppercase text-white/60 w-20">
                  Ability
                </span>
                <span className="text-xl font-bold text-white">
                  {pokemon.abilities[0]}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Pokemon Image */}
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <motion.div
            className="relative w-full max-w-md aspect-square"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Image
              src={pokemon.imageUrl}
              alt={pokemon.name}
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
