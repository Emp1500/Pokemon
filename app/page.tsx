'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import PokemonCard from '@/components/PokemonCard';
import StatsSection from '@/components/StatsSection';
import Sidebar from '@/components/Sidebar';
import NavigationArrow from '@/components/NavigationArrow';
import { mockPokemonList } from '@/lib/mockData';
import { getTypeColor } from '@/lib/colors';
import { Pokemon } from '@/types/pokemon';

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon>(mockPokemonList[0]);
  const [direction, setDirection] = useState(0);

  const handlePokemonChange = (id: number) => {
    const newIndex = mockPokemonList.findIndex((p) => p.id === id);
    if (newIndex !== -1) {
      setDirection(newIndex > currentIndex ? 1 : -1);
      setCurrentIndex(newIndex);
      setCurrentPokemon(mockPokemonList[newIndex]);
    }
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % mockPokemonList.length;
    setDirection(1);
    setCurrentIndex(newIndex);
    setCurrentPokemon(mockPokemonList[newIndex]);
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * mockPokemonList.length);
    setDirection(randomIndex > currentIndex ? 1 : -1);
    setCurrentIndex(randomIndex);
    setCurrentPokemon(mockPokemonList[randomIndex]);
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
