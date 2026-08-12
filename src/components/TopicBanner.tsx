import React, { useState } from 'react';
import { Topic, DifficultyLevel } from '../types';
import { DIFFICULTY_DETAILS } from '../data/voiceProfiles';
import { Sparkles, Shuffle, BookOpen, Lightbulb, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface TopicBannerProps {
  topic: Topic;
  difficulty: DifficultyLevel;
  onRandomizeTopic: () => void;
  onSelectSuggestedPhrase: (phrase: string) => void;
  isLoadingTopic: boolean;
  onOpenCheatSheet: () => void;
}

export const TopicBanner: React.FC<TopicBannerProps> = ({
  topic,
  difficulty,
  onRandomizeTopic,
  onSelectSuggestedPhrase,
  isLoadingTopic,
  onOpenCheatSheet,
}) => {
  const [showPhrases, setShowPhrases] = useState(false);
  const currentLevelDetail = DIFFICULTY_DETAILS[difficulty];

  return (
    <div className="bg-orange-50/80 border border-orange-100 rounded-2xl p-3 sm:p-4 mb-3 transition-all shadow-2xs">
      <div className="flex items-start justify-between gap-2.5">
        {/* Left Topic Details */}
        <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border border-orange-100 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-2xs">
            {topic.title.split(' ').pop() || '💬'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-orange-800 font-bold bg-orange-100/90 px-2 py-0.2 rounded-full border border-orange-200/60">
                {topic.category}
              </span>
              <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.2 rounded-full border ${currentLevelDetail.color}`}>
                {currentLevelDetail.badge}
              </span>
            </div>

            <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {topic.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate">
              {topic.titleIndonesian}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenCheatSheet}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-orange-100/60 text-orange-900 border border-orange-200/80 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            title="Lihat Kosa Kata & Frasa"
          >
            <BookOpen className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">Kosa Kata</span>
          </button>

          <button
            onClick={onRandomizeTopic}
            disabled={isLoadingTopic}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs flex items-center gap-1"
            title="Cari Topik Acak Baru"
          >
            <Shuffle className={`w-3.5 h-3.5 ${isLoadingTopic ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoadingTopic ? 'Mencari...' : 'Topik Acak'}</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Phrases Bar (Collapsible on mobile) */}
      {topic.suggestedPhrases && topic.suggestedPhrases.length > 0 && (
        <div className="mt-2 pt-2 border-t border-orange-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-orange-800 font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Contoh Ide Bicara:</span>
            </div>

            <button
              onClick={() => setShowPhrases(!showPhrases)}
              className="text-[10px] sm:text-xs text-orange-700 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>{showPhrases ? 'Sembunyikan' : 'Tampilkan Frasa'}</span>
              {showPhrases ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {(showPhrases || window.innerWidth >= 640) && (
            <div className="flex flex-wrap gap-1.5 mt-1.5 animate-in fade-in duration-150">
              {topic.suggestedPhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestedPhrase(phrase)}
                  className="bg-white hover:bg-orange-100/60 text-slate-700 text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-xl border border-orange-200/80 transition-all text-left flex items-center gap-1 cursor-pointer shadow-2xs active:scale-98"
                >
                  <MessageCircle className="w-3 h-3 text-orange-500 shrink-0" />
                  <span>"{phrase}"</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
