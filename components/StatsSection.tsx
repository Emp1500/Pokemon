'use client';

import { motion } from 'framer-motion';
import StatsBar from './StatsBar';

interface StatsSectionProps {
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const statsList = [
    { label: 'HP', value: stats.hp },
    { label: 'Attack', value: stats.attack },
    { label: 'Defense', value: stats.defense },
    { label: 'Sp. Atk', value: stats.spAtk },
    { label: 'Sp. Def', value: stats.spDef },
    { label: 'Speed', value: stats.speed },
  ];

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-8 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-4xl font-bold text-white mb-8 uppercase tracking-wider">
        Stats
      </h2>

      <div className="space-y-5">
        {statsList.map((stat, index) => (
          <StatsBar
            key={stat.label}
            label={stat.label}
            value={stat.value}
            delay={index * 100}
          />
        ))}
      </div>
    </motion.div>
  );
}
