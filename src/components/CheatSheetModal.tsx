import React from 'react';
import { Topic } from '../types';
import { speakText } from '../services/speech';
import { X, BookOpen, Volume2, MessageSquarePlus, Sparkles, Star } from 'lucide-react';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic;
  onSelectPhrase: (phrase: string) => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({
  isOpen,
  onClose,
  topic,
  onSelectPhrase,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Kosa Kata & Frasa Pilihan 📚
              </h3>
              <p className="text-xs text-slate-400 font-medium">Topik: {topic.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Vocabulary Cards */}
        <div className="mb-5">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Kata-kata Penting (Key Vocabulary):</span>
          </h4>

          <div className="space-y-2.5">
            {topic.keyVocabulary.map((vocab, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{vocab.english}</span>
                    <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-100">
                      🇮🇩 {vocab.indonesian}
                    </span>
                  </div>
                  <button
                    onClick={() => speakText(vocab.english, 'normal')}
                    className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer shrink-0"
                    title="Dengar Pengucapan"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-500 italic">Contoh: "{vocab.example}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Phrases */}
        <div className="mb-4">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Frasa Siap Pakai Untuk Diucapkan:</span>
          </h4>

          <div className="space-y-2">
            {topic.suggestedPhrases.map((phrase, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-100 hover:border-emerald-300 p-3 rounded-2xl flex items-center justify-between gap-2 transition-all"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(phrase, 'normal')}
                    className="p-1.5 rounded-lg bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 transition-colors cursor-pointer shrink-0"
                    title="Dengar Pengucapan"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-800">"{phrase}"</span>
                </div>

                <button
                  onClick={() => {
                    onSelectPhrase(phrase);
                    onClose();
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <MessageSquarePlus className="w-3 h-3" />
                  <span>Ucapkan</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Close */}
        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-2xl text-xs transition-colors cursor-pointer mt-2"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
