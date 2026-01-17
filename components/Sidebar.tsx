'use client';

import { motion } from 'framer-motion';
import { Github, Globe } from 'lucide-react';

export default function Sidebar() {
  return (
    <motion.div
      className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-8"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      {/* Vertical Line */}
      <div className="w-px h-24 bg-white/30" />

      {/* Social Icons */}
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all border border-white/20"
        aria-label="GitHub"
      >
        <Github className="w-5 h-5 text-white/80" />
      </a>

      <a
        href="#"
        className="p-3 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all border border-white/20"
        aria-label="Website"
      >
        <Globe className="w-5 h-5 text-white/80" />
      </a>

      {/* Vertical Line */}
      <div className="w-px h-24 bg-white/30" />
    </motion.div>
  );
}
