import React from 'react';
import { DifficultyLevel } from '../types';
import { DIFFICULTY_LEVELS_LIST, DIFFICULTY_DETAILS } from '../data/voiceProfiles';
import { Award, Check, X, Sparkles } from 'lucide-react';

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLevel: DifficultyLevel;
  onSelectLevel: (level: DifficultyLevel) => void;
}

export const LevelModal: React.FC<LevelModalProps> = ({
  isOpen,
  onClose,
  selectedLevel,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Pilih Tingkat Kesulitan (5 Level) 🎯
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Sesuaikan kemampuan berbahasa Inggrismu!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Levels List */}
        <div className="space-y-2.5 mb-5">
          {DIFFICULTY_LEVELS_LIST.map((item) => {
            const isSelected = selectedLevel === item.level;

            return (
              <div
                key={item.level}
                onClick={() => {
                  onSelectLevel(item.level);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 border-slate-100 hover:border-emerald-200 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 shadow-2xs ${item.color}`}>
                    {item.cefr}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800">{item.badge}</h4>
                      {isSelected && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-2xl text-xs transition-colors cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
