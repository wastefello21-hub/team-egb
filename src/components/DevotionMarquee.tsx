'use client';

import React from 'react';
import { motion } from 'framer-motion';

const devotionalQuotes = [
  "🙏 The greatest wealth is devotion to the divine.",
  "✨ In every prayer, we find strength and peace.",
  "💫 Surrender to the divine, and all becomes possible.",
  "🕉️ Through faith and devotion, we transcend all boundaries.",
  "🙌 Every moment of worship is a moment of grace.",
  "✨ The heart that serves with love knows true freedom.",
  "🌟 Devotion is the language of the soul.",
  "💖 In silence and stillness, divinity reveals itself.",
  "🕉️ The path of devotion leads to eternal peace.",
  "✨ When the heart sings, the divine listens.",
];

export default function DevotionMarquee() {
  return (
    <div className="w-full bg-gradient-to-r from-orange-600/20 via-yellow-500/20 to-red-600/20 backdrop-blur-sm border-y border-orange-500/30 py-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      
      <motion.div
        className="flex whitespace-nowrap gap-8 px-4"
        animate={{ x: [-100, -5000] }}
        transition={{
          duration: 40,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {[...devotionalQuotes, ...devotionalQuotes].map((quote, index) => (
          <span
            key={index}
            className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-yellow-500 to-red-600 dark:from-yellow-400 dark:via-orange-400 dark:to-red-400 shrink-0"
          >
            {quote}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
