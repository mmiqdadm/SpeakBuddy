import React from 'react';
import { ChatMessage } from '../types';
import { X, Award, CheckCircle2, AlertTriangle, Sparkles, Volume2, BookOpen } from 'lucide-react';
import { speakText } from '../services/speech';

interface FeedbackModalProps {
  message: ChatMessage | null;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ message, onClose }) => {
  if (!message || !message.evaluation) return null;

  const evalData = message.evaluation;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Hasil Penilaian Ucapan 🎯
              </h3>
              <p className="text-xs text-slate-400 font-medium">{evalData.badgeLabel}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Said Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Kalimat Yang Kamu Ucapkan:
          </div>
          <p className="text-base font-semibold text-slate-800 flex items-center justify-between gap-2">
            <span>"{message.text}"</span>
            <button
              onClick={() => speakText(message.text, 'normal')}
              className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Dengar Kembali"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </p>
        </div>

        {/* Scores Meter Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-0.5">
              Pelafalan
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600">
              {evalData.pronunciationScore}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">/ 100</span>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl">
            <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block mb-0.5">
              Tata Bahasa
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-600">
              {evalData.grammarScore}
            </span>
            <span className="text-[10px] text-blue-600 block mt-0.5">/ 100</span>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
            <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider block mb-0.5">
              Kelancaran
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600">
              {evalData.fluencyScore}
            </span>
            <span className="text-[10px] text-indigo-600 block mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Feedback Summary Note */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-4 text-xs text-slate-700">
          <span className="font-bold text-slate-800 block mb-1">
            💬 Catatan Motivasi Buddy:
          </span>
          <p className="font-medium">{evalData.feedbackIndonesian}</p>
          <p className="text-[11px] text-slate-400 mt-1 italic">{evalData.feedbackSummary}</p>
        </div>

        {/* Grammar Corrections */}
        {evalData.corrections && evalData.corrections.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Saran Perbaikan Detail</span>
            </h4>

            <div className="space-y-2">
              {evalData.corrections.map((corr, idx) => (
                <div key={idx} className="bg-orange-50/60 border border-orange-100 rounded-2xl p-3 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="line-through text-red-400 font-medium">{corr.original}</span>
                    <span className="text-slate-300">➔</span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {corr.suggested}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{corr.explanationIndonesian}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Better Alternatives */}
        {evalData.betterAlternatives && evalData.betterAlternatives.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Cara Ngomong Lebih Alami (Native Way):</span>
            </h4>

            <div className="space-y-1.5">
              {evalData.betterAlternatives.map((alt, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800 font-semibold flex items-center justify-between gap-2">
                  <span>"{alt}"</span>
                  <button
                    onClick={() => speakText(alt, 'normal')}
                    className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                    title="Dengar Pengucapan"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl shadow-xs transition-colors text-sm cursor-pointer"
        >
          Siap, Lanjut Latihan! 🚀
        </button>
      </div>
    </div>
  );
};
