import React, { useState } from 'react';
import { DifficultyLevel, VoiceProfile, UserStats } from '../types';
import { DIFFICULTY_DETAILS } from '../data/voiceProfiles';
import {
  Flame,
  Star,
  Volume2,
  RefreshCw,
  BarChart2,
  BookOpen,
  Menu,
  ChevronDown,
  X,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'conversation' | 'flashcard';
  onSelectTab: (tab: 'conversation' | 'flashcard') => void;
  difficulty: DifficultyLevel;
  onOpenLevelModal: () => void;
  selectedVoice: VoiceProfile;
  onOpenVoiceModal: () => void;
  stats: UserStats;
  onOpenTopics: () => void;
  onOpenStats: () => void;
  onOpenCheatSheet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  difficulty,
  onOpenLevelModal,
  selectedVoice,
  onOpenVoiceModal,
  stats,
  onOpenTopics,
  onOpenStats,
  onOpenCheatSheet,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentLevelDetail = DIFFICULTY_DETAILS[difficulty];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-2.5 sm:px-5 py-2">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Main View Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-2xs shrink-0">
              L
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base tracking-tight text-slate-800">
                  Speak<span className="text-emerald-500">Buddy</span>
                </h1>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Teman Belajar AI
              </p>
            </div>
          </div>

          {/* Tab Switcher Pills */}
          <div className="flex bg-slate-100 p-0.5 sm:p-1 rounded-2xl border border-slate-200/60 text-xs font-bold">
            <button
              onClick={() => onSelectTab('conversation')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'conversation'
                  ? 'bg-white text-slate-800 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>💬</span>
              <span>Percakapan</span>
            </button>
            <button
              onClick={() => onSelectTab('flashcard')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'flashcard'
                  ? 'bg-amber-400 text-amber-950 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🎴</span>
              <span>Flashcard</span>
            </button>
          </div>
        </div>

        {/* Desktop Quick Controls */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          {/* Level Selector Button */}
          <button
            onClick={onOpenLevelModal}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${currentLevelDetail.color}`}
            title="Ubah tingkat kesulitan"
          >
            <span>{currentLevelDetail.badge}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Voice Selector Button */}
          <button
            onClick={onOpenVoiceModal}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/80 font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Pengaturan Suara, Gender & Aksen"
          >
            <span>{selectedVoice.flag}</span>
            <span className="font-bold">{selectedVoice.name}</span>
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Desktop Stats XP */}
          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1.5 rounded-xl border border-amber-100 font-bold">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{stats.totalStarsEarned} XP</span>
          </div>

          {/* Topic Selector Button */}
          <button
            onClick={onOpenTopics}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tema</span>
          </button>

          {/* Cheat Sheet Vocabulary Button */}
          <button
            onClick={onOpenCheatSheet}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Kosa Kata</span>
          </button>

          {/* Progress Stats Button */}
          <button
            onClick={onOpenStats}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Lihat Stat Kemajuan"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Header Menu Button */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="hidden xs:inline">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Sheet */}
      {isMobileMenuOpen && (
        <div className="md:hidden pt-2.5 mt-2 border-t border-slate-100 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLevelModal();
              }}
              className={`p-2 rounded-xl flex items-center justify-between border cursor-pointer ${currentLevelDetail.color}`}
            >
              <span className="truncate">{currentLevelDetail.badge}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenVoiceModal();
              }}
              className="bg-slate-100 text-slate-800 p-2 rounded-xl flex items-center justify-between border border-slate-200/60 cursor-pointer"
            >
              <span className="flex items-center gap-1 truncate">
                <span>{selectedVoice.flag}</span>
                <span>{selectedVoice.name}</span>
              </span>
              <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTopics();
              }}
              className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ganti Tema Obrolan</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCheatSheet();
              }}
              className="bg-slate-100 text-slate-700 p-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Kosa Kata Penting</span>
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-orange-800 font-bold">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>{stats.streakDays}d Streak</span>
              </div>
              <div className="flex items-center gap-1 text-amber-800 font-bold">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{stats.totalStarsEarned} XP</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenStats();
              }}
              className="text-emerald-600 font-bold flex items-center gap-1 cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Statistik</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
