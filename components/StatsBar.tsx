'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StatsBarProps {
  label: string;
  value: number;
  maxValue?: number;
  delay?: number;
}

export default function StatsBar({ label, value, maxValue = 255, delay = 0 }: StatsBarProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const percentage = (value / maxValue) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="flex items-center gap-6 group">
      {/* Label */}
      <div className="w-24 text-right">
        <span className="text-sm font-medium tracking-wide uppercase text-white/80">
          {label}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="flex-1 relative">
        <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-white rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: isAnimating ? `${percentage}%` : 0 }}
            transition={{
              duration: 1,
              ease: 'easeOut',
              delay: 0.1,
            }}
          />
        </div>
      </div>

      {/* Value */}
      <div className="w-16 text-left">
        <motion.span
          className="text-lg font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          {value}
        </motion.span>
      </div>
    </div>
  );
}
