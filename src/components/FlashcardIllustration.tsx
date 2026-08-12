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
  const [imgError, setImgError] = useState(false);

  const colorGradient = card.color || 'from-emerald-400 to-teal-600';

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onImageClick?.()}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl relative overflow-hidden my-3 shadow-lg border-4 border-white/90 group flex flex-col items-center justify-center transition-all cursor-pointer hover:shadow-2xl shrink-0 select-none bg-white"
    >
      {/* Dynamic Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr ${colorGradient} opacity-15 group-hover:opacity-25 transition-opacity duration-300`}
      />

      {/* Playful Vector Dots */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#0f172a_1.5px,transparent_1.5px)] [background-size:14px_14px]" />

      {/* Sunburst Radial Glow */}
      <div className="absolute -inset-10 opacity-20 pointer-events-none flex items-center justify-center">
        <div className="w-80 h-80 rounded-full bg-gradient-to-r from-emerald-200 via-sky-200 to-indigo-200 animate-spin-slow blur-xl" />
      </div>

      {/* Corner Decor Sparkles */}
      <div className="absolute top-3 left-3 text-amber-500/90 group-hover:text-amber-500 transition-colors z-10 flex items-center gap-1">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>

      {/* Category Tag Badge */}
      {card.category && (
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase text-slate-600 border border-slate-200/60 shadow-2xs z-10">
          {card.category}
        </div>
      )}

      {/* Main Illustration Area */}
      <div className="w-full h-full p-4 flex flex-col items-center justify-center relative z-0">
        <motion.div
          key={card.id}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="flex flex-col items-center justify-center text-center"
        >
          {card.imageUrl && !imgError ? (
            <div className="relative flex items-center justify-center w-40 h-40">
              <img
                src={card.imageUrl}
                alt={card.word}
                onError={() => setImgError(true)}
                className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-6 bg-gradient-to-tr from-white/90 via-amber-100/60 to-sky-100/60 rounded-full blur-md group-hover:scale-110 transition-transform duration-300" />
              <span className="text-8xl sm:text-9xl relative z-10 drop-shadow-xl select-none transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 block filter contrast-125">
                {card.emoji}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Interactive Sound Trigger */}
      <motion.div
        animate={{ scale: isHovered ? 1.12 : 1 }}
        className="absolute bottom-3 right-3 bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-2xl shadow-md border border-emerald-400/60 flex items-center justify-center z-10 transition-colors"
        title="Dengarkan Pengucapan"
      >
        <Volume2 className="w-5 h-5" />
      </motion.div>
    </motion.div>
  );
});

FlashcardIllustration.displayName = 'FlashcardIllustration';
