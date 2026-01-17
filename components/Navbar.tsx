'use client';

import { Search, Shuffle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { capitalizeFirstLetter } from '@/lib/colors';
import { usePokemonStore } from '@/store/pokemonStore';

interface NavbarProps {
  siblings?: {
    prev?: { id: number; name: string };
    current: { id: number; name: string };
    next?: { id: number; name: string };
  };
  onPokemonChange?: (id: number) => void;
  onShuffle?: () => void;
}

export default function Navbar({ siblings, onPokemonChange, onShuffle }: NavbarProps) {
  const { filters, setSearchQuery } = usePokemonStore();

  const handleNavClick = (id: number) => {
    if (onPokemonChange) {
      onPokemonChange(id);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <motion.nav
      className="w-full px-8 py-6 flex items-center justify-between backdrop-blur-md bg-white/5"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left: Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-lg">
            <Search className="w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="bg-transparent text-white placeholder-white/50 outline-none w-48 text-sm"
            />
          </div>
        </div>

        <button
          onClick={onShuffle}
          className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/20 transition-all shadow-lg"
          aria-label="Shuffle Pokémon"
        >
          <Shuffle className="w-5 h-5 text-white/80" />
        </button>
      </div>

      {/* Center: Sibling Navigation */}
      {siblings && (
        <div className="flex items-center gap-6">
          {siblings.prev && (
            <button
              onClick={() => handleNavClick(siblings.prev!.id)}
              className="text-white/50 hover:text-white transition-colors text-sm font-medium tracking-wide"
            >
              {capitalizeFirstLetter(siblings.prev.name)}
            </button>
          )}

          <span className="text-white font-bold text-base tracking-wide uppercase">
            {capitalizeFirstLetter(siblings.current.name)}
          </span>

          {siblings.next && (
            <button
              onClick={() => handleNavClick(siblings.next!.id)}
              className="text-white/50 hover:text-white transition-colors text-sm font-medium tracking-wide"
            >
              {capitalizeFirstLetter(siblings.next.name)}
            </button>
          )}
        </div>
      )}

      {/* Right: Filter */}
      <div className="relative">
        <button className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/20 transition-all shadow-lg">
          <span className="text-white/80 text-sm font-medium">Filter</span>
          <ChevronDown className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </motion.nav>
  );
}
