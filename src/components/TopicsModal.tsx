import React from 'react';
import { Topic, DifficultyLevel } from '../types';
import { DEFAULT_TOPICS } from '../data/defaultTopics';
import { X, Sparkles, Shuffle, CheckCircle2, RefreshCw } from 'lucide-react';

interface TopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic: Topic;
  customTopics?: Topic[];
  onSelectTopic: (topic: Topic) => void;
  onGenerateNewTopic: () => void;
  isLoadingNewTopic: boolean;
  difficulty: DifficultyLevel;
}

export const TopicsModal: React.FC<TopicsModalProps> = ({
  isOpen,
  onClose,
  currentTopic,
  customTopics = [],
  onSelectTopic,
  onGenerateNewTopic,
  isLoadingNewTopic,
  difficulty,
}) => {
  if (!isOpen) return null;

  const allTopics = [...customTopics, ...DEFAULT_TOPICS];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Pilih / Buat Tema Obrolan 💬
              </h3>
              <p className="text-xs text-slate-400 font-medium">Ubah suasana obrolan atau buat tema AI acak baru!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generate Custom AI Topic Button */}
        <div className="mb-4">
          <button
            onClick={() => {
              onGenerateNewTopic();
            }}
            disabled={isLoadingNewTopic}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-3.5 rounded-2xl shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 text-orange-200 ${isLoadingNewTopic ? 'animate-spin' : ''}`} />
            <span>
              {isLoadingNewTopic
                ? 'Sedang Meracik Tema Baru dengan AI...'
                : '✨ Buat Tema Acak Baru dengan AI!'}
            </span>
          </button>
        </div>

        {/* List of Topics */}
        <div className="space-y-2.5 mb-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Daftar Tema Percakapan Sehari-hari:
          </span>

          {allTopics.map((top, index) => {
            const isSelected = top.id === currentTopic.id;

            return (
              <div
                key={`${top.id}-${index}`}
                onClick={() => {
                  onSelectTopic(top);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 border-slate-100 hover:border-emerald-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 text-orange-700 flex items-center justify-center text-xl shrink-0">
                    {top.title.split(' ').pop() || '💬'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-800">{top.title}</h4>
                      {isSelected && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-orange-700 font-semibold mt-0.5">{top.titleIndonesian}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{top.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-2xl text-xs transition-colors cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
