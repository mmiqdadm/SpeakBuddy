import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, Sparkles } from 'lucide-react';
import { FlashcardItem } from '../data/flashcardsData';

interface FlashcardIllustrationProps {
  card: FlashcardItem;
  gameMode: 'repeat' | 'guess';
  isRevealed: boolean;
  onImageClick?: () => void;
}

export const FlashcardIllustration: React.FC<FlashcardIllustrationProps> = React.memo(({
  card,
  gameMode,
  isRevealed,
  onImageClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const canPlayAudio = true;

  // Derive gradient color class or default
  const colorGradient = card.color || 'from-amber-300 to-yellow-500';

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onImageClick?.()}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl relative overflow-hidden my-2.5 shadow-md border-3 border-white/90 group flex flex-col items-center justify-center transition-all cursor-pointer hover:shadow-xl shrink-0"
    >
      {/* Cartoon Vector Layer 1: Vibrant Multi-Tone Gradient Canvas */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr ${colorGradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
      />

      {/* Cartoon Vector Layer 2: Vector Pattern Polka Dots & Rays */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:14px_14px]" />

      {/* Vector Layer 3: Dynamic Sunburst Background Accent */}
      <div className="absolute -inset-10 opacity-20 pointer-events-none flex items-center justify-center">
        <div className="w-72 h-72 rounded-full bg-gradient-to-r from-amber-200 via-rose-200 to-indigo-200 animate-spin-slow blur-md" />
      </div>

      {/* Corner Sparkle Decor */}
      <div className="absolute top-3 left-3 text-amber-500/80 group-hover:text-amber-500 transition-colors z-10">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>

      {/* Main Content Area: High-Precision Vector Illustration Subject */}
      <div className="w-full h-full p-4 flex flex-col items-center justify-center relative z-0">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex flex-col items-center justify-center text-center"
        >
          {/* Vector 3D Child-Friendly Emoji Illustration */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-6 bg-gradient-to-tr from-white/90 via-amber-100/60 to-indigo-100/60 rounded-full blur-md group-hover:scale-110 transition-transform duration-300" />
            <span className="text-8xl sm:text-9xl relative z-10 drop-shadow-xl select-none transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 block">
              {card.emoji}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Audio Play Indicator */}
      <motion.span
        animate={{ scale: isHovered ? 1.15 : 1 }}
        className="absolute bottom-3 right-3 bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-2xl shadow-md border border-emerald-400/50 flex items-center justify-center z-10"
        title="Dengarkan Suara"
      >
        <Volume2 className="w-4.5 h-4.5" />
      </motion.span>
    </motion.div>
  );
});

FlashcardIllustration.displayName = 'FlashcardIllustration';


