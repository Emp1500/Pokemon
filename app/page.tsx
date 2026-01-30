'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import PokemonCard from '@/components/PokemonCard';
import PokemonDescription from '@/components/PokemonDescription';
import StatsSection from '@/components/StatsSection';
import Sidebar from '@/components/Sidebar';
import NavigationArrow from '@/components/NavigationArrow';
import { mockPokemonList } from '@/lib/mockData';
import { getTypeColor } from '@/lib/colors';
import { Pokemon } from '@/types/pokemon';
import { usePokemonStore } from '@/store/pokemonStore';
import { pokemonService } from '@/lib/pokemonService';

export default function Home() {
  const { allPokemon, filteredPokemon, setAllPokemon, isLoading, setLoading, setError } = usePokemonStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon>(mockPokemonList[0]);
  const [direction, setDirection] = useState(0);

  // Load Pokemon data on mount
  useEffect(() => {
    const loadPokemon = async () => {
      setLoading(true);
      try {
        // Start with mock data for instant display
        setAllPokemon(mockPokemonList);

        const generations = [
          { start: 1, end: 151 },   // Gen 1 - Kanto
          { start: 152, end: 251 }, // Gen 2 - Johto
          { start: 252, end: 386 }, // Gen 3 - Hoenn
          { start: 387, end: 493 }, // Gen 4 - Sinnoh
          { start: 494, end: 649 }, // Gen 5 - Unova
          { start: 650, end: 721 }, // Gen 6 - Kalos
          { start: 722, end: 809 }, // Gen 7 - Alola
          { start: 810, end: 905 }, // Gen 8 - Galar
          { start: 906, end: 1025 },// Gen 9 - Paldea
        ];

        let loadedPokemon: Pokemon[] = [];
        for (const gen of generations) {
          const pokemon = await pokemonService.fetchRange(gen.start, gen.end);
          loadedPokemon = [...loadedPokemon, ...pokemon];
          setAllPokemon(loadedPokemon);
        }

        console.log(`Loaded ${loadedPokemon.length} Pokemon from all 9 generations!`);
      } catch (error) {
        console.error('Error loading Pokemon:', error);
        setError('Failed to load Pokemon data. Using cached data.');
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, [setAllPokemon, setLoading, setError]);

  // Use filtered Pokemon list
  const pokemonList = filteredPokemon();

  const handlePokemonChange = (id: number) => {
    const newIndex = pokemonList.findIndex((p) => p.id === id);
    if (newIndex !== -1) {
      setDirection(newIndex > currentIndex ? 1 : -1);
      setCurrentIndex(newIndex);
      setCurrentPokemon(pokemonList[newIndex]);
    }
  };

  const handleNext = () => {
    if (pokemonList.length === 0) return;
    const newIndex = (currentIndex + 1) % pokemonList.length;
    setDirection(1);
    setCurrentIndex(newIndex);
    setCurrentPokemon(pokemonList[newIndex]);
  };

  const handleShuffle = () => {
    if (pokemonList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    setDirection(randomIndex > currentIndex ? 1 : -1);
    setCurrentIndex(randomIndex);
    setCurrentPokemon(pokemonList[randomIndex]);
  };

  const typeColors = getTypeColor(currentPokemon.type);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden bg-black"
    >
      {/* Loading Indicator */}
      {isLoading && allPokemon.length < 1025 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-8 z-50 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 text-white text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Loading Pokemon... {allPokemon.length}/1025</span>
          </div>
        </motion.div>
      )}

      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: typeColors.bg }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: typeColors.bg }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Navigation Arrow */}
      <NavigationArrow onClick={handleNext} />

      {/* Main Content */}
      <div className="relative z-10">
        <Navbar
          siblings={currentPokemon.siblings}
          onPokemonChange={handlePokemonChange}
          onShuffle={handleShuffle}
        />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPokemon.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <PokemonCard pokemon={currentPokemon} />
            <PokemonDescription
              category={currentPokemon.category}
              description={currentPokemon.description}
              generation={currentPokemon.generation}
              region={currentPokemon.region}
              legendaryStatus={currentPokemon.legendaryStatus}
            />
            <StatsSection stats={currentPokemon.stats} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
