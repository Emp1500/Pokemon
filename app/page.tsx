'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import PokemonCard from '@/components/PokemonCard';
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

        // Load Generation 1 (Kanto) Pokemon in the background
        const gen1 = await pokemonService.fetchRange(1, 151);
        setAllPokemon(gen1);

        // Optionally load more generations in the background
        Promise.all([
          pokemonService.fetchRange(152, 251), // Gen 2
          // Add more generations as needed
        ]).then((generations) => {
          const allGen = [...gen1, ...generations.flat()];
          setAllPokemon(allGen);
        }).catch(err => {
          console.error('Error loading additional generations:', err);
        });
      } catch (error) {
        console.error('Error loading Pokemon:', error);
        setError('Failed to load Pokemon data. Using cached data.');
        // Keep using mock data on error
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
            <StatsSection stats={currentPokemon.stats} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
