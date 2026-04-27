"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Heart, Sparkles, Users } from 'lucide-react';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, type: "spring" as const, bounce: 0.4 } }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen pt-24 pb-20 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] -z-10" />

      <motion.div 
        className="w-full max-w-4xl text-center mb-16"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <span className="px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-widest mb-4 inline-block">
          Our Story
        </span>
        <h1 className="text-4xl md:text-6xl font-black glow-text text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 dark:from-orange-400 dark:to-yellow-300 drop-shadow-sm mb-6">
          About Team EGB
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto flex items-center justify-center gap-2">
          Celebrating Devotion, Unity, and Culture <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
        </p>
      </motion.div>

      <motion.div 
        className="w-full max-w-4xl space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* English Content Card */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 md:p-10 relative overflow-hidden border-t-4 border-t-orange-500 shadow-2xl hover:shadow-orange-500/10 transition-shadow">
            <div className="absolute -right-8 -top-8 text-orange-500/5 rotate-12">
              <Users size={120} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6 text-foreground/90 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">EN</span>
                Our Essence
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-foreground/80 font-medium">
                Team EGB stands as a symbol of unwavering devotion, unity, and spirit. Every year, we come together with one heart and one belief to welcome Lord Ganesha with pure faith, joy, and dedication. What we create is more than a celebration—it is a powerful expression of culture, brotherhood, and divine connection. 
                <br /><br />
                From the moment we welcome Bappa with happiness and energy, to the final day when we bid him farewell with the same joy through a grand procession, every moment reflects our true devotion. Through every prayer, every effort, and every celebration, we seek blessings, spread positivity, and strengthen the bond that defines us. 
                <br /><br />
                <span className="font-bold text-orange-600 dark:text-orange-400 text-xl block mt-4 border-l-4 border-orange-500 pl-4 py-2 bg-gradient-to-r from-orange-500/10 to-transparent">
                  For Team EGB, Ganesh Chaturthi is not just a festival—it is our pride, our tradition, and our devotion brought to life.
                </span>
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Kannada Content Card */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 md:p-10 relative overflow-hidden border-t-4 border-t-yellow-500 shadow-2xl hover:shadow-yellow-500/10 transition-shadow">
            <div className="absolute -left-8 -bottom-8 text-yellow-500/5 -rotate-12">
              <Sparkles size={120} />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6 text-foreground/90 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">ಕ</span>
                ನಮ್ಮ ಬಗ್ಗೆ
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-foreground/80 font-medium">
                TEAM EGB ಅಚಲ ಭಕ್ತಿ, ಏಕತೆ ಮತ್ತು ಉತ್ಸಾಹದ ಪ್ರತೀಕವಾಗಿದೆ. ಪ್ರತಿವರ್ಷ ನಾವು ಒಂದೇ ಮನಸ್ಸು ಮತ್ತು ನಂಬಿಕೆಯಿಂದ ಶ್ರೀ ಗಣೇಶನನ್ನು ಶುದ್ಧ ಭಕ್ತಿ, ಸಂತೋಷ ಮತ್ತು ಸಮರ್ಪಣೆಯಿಂದ ಸ್ವಾಗತಿಸುತ್ತೇವೆ. ನಮ್ಮದು ಕೇವಲ ಒಂದು ಹಬ್ಬವಲ್ಲ—ಇದು ಸಂಸ್ಕೃತಿ, ಸಹೋದರತ್ವ ಮತ್ತು ದೈವಿಕ ಸಂಪರ್ಕದ ಶಕ್ತಿಯುತ ಅಭಿವ್ಯಕ್ತಿ.
                <br /><br />
                ನಾವು ಹೇಗೆ ಸಂತೋಷದಿಂದ ಬಪ್ಪನನ್ನು ಸ್ವಾಗತಿಸುತ್ತೇವೋ, ಅದೇ ರೀತಿಯಲ್ಲಿ ಕೊನೆಯ ದಿನ ಅವನನ್ನು ಭವ್ಯ ಮೆರವಣಿಗೆಯೊಂದಿಗೆ ಅದೇ ಸಂತೋಷದಿಂದ ಬೀಳ್ಕೊಡುತ್ತೇವೆ. ಪ್ರತಿಯೊಂದು ಪೂಜೆ, ಪ್ರತಿಯೊಂದು ಪ್ರಯತ್ನ ಮತ್ತು ಪ್ರತಿಯೊಂದು ಸಂಭ್ರಮದ ಮೂಲಕ ನಾವು ಆಶೀರ್ವಾದಗಳನ್ನು ಪಡೆಯಲು, ಸಕಾರಾತ್ಮಕತೆಯನ್ನು ಹಂಚಲು ಮತ್ತು ನಮ್ಮ ಬಂಧವನ್ನು ಇನ್ನಷ್ಟು ಬಲಪಡಿಸುತ್ತೇವೆ.
                <br /><br />
                <span className="font-bold text-yellow-600 dark:text-yellow-400 text-xl block mt-4 border-l-4 border-yellow-500 pl-4 py-2 bg-gradient-to-r from-yellow-500/10 to-transparent">
                  TEAM EGBಗೆ ಗಣೇಶ ಚತುರ್ಥಿ ಕೇವಲ ಹಬ್ಬವಲ್ಲ—ಇದು ನಮ್ಮ ಗೌರವ, ನಮ್ಮ ಪರಂಪರೆ ಮತ್ತು ನಮ್ಮ ಭಕ್ತಿಯ ಜೀವಂತ ರೂಪವಾಗಿದೆ.
                </span>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}