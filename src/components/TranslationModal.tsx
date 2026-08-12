import React, { useState } from 'react';
import { fetchTranslationHelp, TranslationHelpResult } from '../services/api';
import { speakText } from '../services/speech';
import { X, Languages, Volume2, Sparkles, Send, Loader2, Lightbulb } from 'lucide-react';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  onSendTranslatedMessage: (englishText: string) => void;
}

export const TranslationModal: React.FC<TranslationModalProps> = ({
  isOpen,
  onClose,
  topicTitle,
  onSendTranslatedMessage,
}) => {
  const [indonesianInput, setIndonesianInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationHelpResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indonesianInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetchTranslationHelp(indonesianInput.trim(), topicTitle);
      setResult(res);
    } catch (err: any) {
      setError('Gagal menerjemahkan. Pastikan koneksi internet stabil!');
    } finally {
      setLoading(false);
    }
  };

  const handleUsePhrase = (englishText: string) => {
    onSendTranslatedMessage(englishText);
    onClose();
    setIndonesianInput('');
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Tanya Bahasa Indonesia 💡
              </h3>
              <p className="text-xs text-slate-400 font-medium">Bingung ngomongnya di Bahasa Inggris? Tanya saja!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTranslate} className="mb-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Tulis Maksudmu dalam Bahasa Indonesia:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={indonesianInput}
              onChange={(e) => setIndonesianInput(e.target.value)}
              placeholder="Contoh: Aku besok mau beli sepeda..."
              className="flex-1 bg-slate-100 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl px-3.5 py-2.5 text-sm outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !indonesianInput.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Tanyakan</span>
            </button>
          </div>
        </form>

        {error && <p className="text-xs text-red-600 font-semibold mb-3">{error}</p>}

        {/* Result Card */}
        {result && (
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-4 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                Bahasa Inggris Yang Tepat:
              </span>
              <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-xl border border-emerald-100">
                <span className="text-base font-bold text-slate-900">"{result.primaryEnglish}"</span>
                <button
                  onClick={() => speakText(result.primaryEnglish, 'normal')}
                  className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer shrink-0"
                  title="Dengar Pengucapan"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {result.alternativeEnglish && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Alternatif Santai:</span>
                <p className="text-xs text-slate-700 font-semibold">"{result.alternativeEnglish}"</p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Penjelasan & Tips:</span>
              <p className="text-xs text-slate-600">{result.explanationIndonesian}</p>
            </div>

            <button
              onClick={() => handleUsePhrase(result.primaryEnglish)}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Gunakan Kalimat Ini Dalam Obrolan!</span>
            </button>
          </div>
        )}

        {/* Quick Examples */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Contoh pertanyaan cepat:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Gimana cara bilang "aku mau es krim"?',
              'Apa bahasa inggrisnya "aku tidak mengerti"?',
              'Gimana ngomong "terima kasih banyak"?',
            ].map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setIndonesianInput(sample)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
