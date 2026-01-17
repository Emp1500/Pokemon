'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface NavigationArrowProps {
  onClick?: () => void;
}

export default function NavigationArrow({ onClick }: NavigationArrowProps) {
  return (
    <motion.button
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all border border-white/20 shadow-lg hidden lg:block"
      onClick={onClick}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Next Pokémon"
    >
      <ChevronRight className="w-8 h-8 text-white" />
    </motion.button>
  );
}
