'use client';

import { motion } from 'framer-motion';
import { BookOpen, Info } from 'lucide-react';

interface PokemonDescriptionProps {
  category?: string;
  description?: string;
  generation?: number;
  region?: string;
  legendaryStatus?: string;
}

export default function PokemonDescription({
  category,
  description,
  generation,
  region,
  legendaryStatus,
}: PokemonDescriptionProps) {
  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-8 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20">
          <BookOpen className="w-5 h-5 text-white/80" />
        </div>
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider">
          About
        </h2>
      </div>

      {/* Content Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4">
        {/* Category */}
        {category && (
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 min-w-[140px]">
              <Info className="w-4 h-4 text-white/60" />
              <span className="text-sm font-medium tracking-wide uppercase text-white/60">
                Category
              </span>
            </div>
            <span className="text-lg font-semibold text-white/90">
              {category}
            </span>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="pt-2">
            <p className="text-base leading-relaxed text-white/80">
              {description}
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="pt-4 flex flex-wrap gap-4 border-t border-white/10">
          {generation && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium tracking-wide uppercase text-white/50">
                Generation
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-bold text-white/90">
                Gen {generation}
              </span>
            </div>
          )}

          {region && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium tracking-wide uppercase text-white/50">
                Region
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-bold text-white/90 capitalize">
                {region}
              </span>
            </div>
          )}

          {legendaryStatus && legendaryStatus !== 'normal' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium tracking-wide uppercase text-white/50">
                Status
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-sm font-bold text-yellow-200 capitalize">
                {legendaryStatus}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
