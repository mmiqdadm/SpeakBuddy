import React from 'react';
import { UserStats } from '../types';
import { X, Flame, Star, Trophy, Target, Award, CheckCircle2, TrendingUp } from 'lucide-react';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Statistik Kemajuan Bicara 📊
              </h3>
              <p className="text-xs text-slate-400 font-medium">Lacak kemampuan berbahasa Inggrismu!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-emerald-500 text-white p-3.5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-100 mb-1">
              <Flame className="w-4 h-4 fill-white" />
              <span>Latihan Harian</span>
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold">{stats.streakDays} Hari</span>
            <span className="text-[10px] text-emerald-100 block mt-0.5">Semangat terus! 🔥</span>
          </div>

          <div className="bg-amber-500 text-white p-3.5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-100 mb-1">
              <Star className="w-4 h-4 fill-white" />
              <span>Bintang Bicara</span>
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold">{stats.totalStarsEarned}</span>
            <span className="text-[10px] text-amber-100 block mt-0.5">Dikumpulkan ⭐</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Rata-rata Skor</span>
            </div>
            <span className="text-2xl font-black text-emerald-600">{stats.averageScore || 90}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Dari 100 poin</span>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl">
            <div className="flex items-center gap-1 text-xs font-bold text-blue-800 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Total Ucapan</span>
            </div>
            <span className="text-2xl font-black text-blue-600">{stats.totalTurnsSpoken}</span>
            <span className="text-[10px] text-blue-600 block mt-0.5">Kalimat dilatih</span>
          </div>
        </div>

        {/* Mastered Vocabulary Summary */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-5 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800 mb-2">
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Kosa Kata Dikuasai:</span>
            </span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              {stats.masteredWords.length} Kata
            </span>
          </div>

          {stats.masteredWords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {stats.masteredWords.map((word, idx) => (
                <span
                  key={idx}
                  className="bg-white border border-slate-200 text-slate-800 font-semibold px-2 py-1 rounded-xl text-[11px]"
                >
                  ✨ {word}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-[11px] italic">
              Ayo terus bicara dengan Buddy untuk membuka kata-kata baru!
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl shadow-xs transition-colors text-xs cursor-pointer"
        >
          Tutup & Lanjut Bicara! 🚀
        </button>
      </div>
    </div>
  );
};
