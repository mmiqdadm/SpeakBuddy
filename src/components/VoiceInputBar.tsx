import React, { useState, useEffect, useRef } from 'react';
import { createSpeechRecognition } from '../services/speech';
import { Mic, MicOff, Send, HelpCircle, Sparkles, Volume2, Globe, AlertCircle, RefreshCw } from 'lucide-react';

interface VoiceInputBarProps {
  onSendMessage: (text: string, isIndonesianHelp?: boolean) => void;
  disabled: boolean;
  onOpenTranslationModal: () => void;
}

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  onSendMessage,
  disabled,
  onOpenTranslationModal,
}) => {
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    setMicError(null);
    setInterimTranscript('');

    const rec = createSpeechRecognition(
      (transcript, isFinal) => {
        if (isFinal) {
          setTextInput((prev) => (prev ? prev + ' ' + transcript : transcript));
          setInterimTranscript('');
        } else {
          setInterimTranscript(transcript);
        }
      },
      (error) => {
        console.warn('Mic recognition error:', error);
        setMicError('Gagal mengakses mikrofon. Kamu bisa mengetik pesan di bawah!');
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      },
      'en-US'
    );

    if (!rec) {
      setMicError('Browser ini tidak mendukung pengenalan suara otomatis. Silakan gunakan fitur ketik!');
      return;
    }

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleToggleMic = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalMsg = textInput.trim() || interimTranscript.trim();
    if (!finalMsg || disabled) return;

    if (isRecording) {
      stopListening();
    }

    onSendMessage(finalMsg, false);
    setTextInput('');
    setInterimTranscript('');
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-2.5 sm:p-4 shadow-sm sticky bottom-1 sm:bottom-3">
      {/* Mic Error Banner if any */}
      {micError && (
        <div className="mb-2 p-2 rounded-xl bg-red-50 border border-red-100 text-[11px] text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate">{micError}</span>
          </div>
          <button onClick={() => setMicError(null)} className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer shrink-0 ml-1">
            Tutup
          </button>
        </div>
      )}

      {/* Live Interim Transcript Display while recording */}
      {isRecording && (
        <div className="mb-2 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="flex-1 overflow-hidden">
            <span className="text-[11px] font-bold text-emerald-900 block">Sedang merekam suaramu... 🎧</span>
            <p className="text-xs font-medium text-emerald-800 italic truncate">
              {interimTranscript || textInput || 'Ucapkan kata/kalimat dalam Bahasa Inggris...'}
            </p>
          </div>
          <button
            onClick={stopListening}
            className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0 cursor-pointer"
          >
            Selesai 🛑
          </button>
        </div>
      )}

      {/* Primary Input Controls */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
        {/* Text Input Field */}
        <div className="relative flex-1 bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all flex items-center px-3 sm:px-4 py-1">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={disabled}
            placeholder={isRecording ? 'Merekam suara...' : 'Ketik pesan / "Tanya ID..."'}
            className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-xs sm:text-sm py-1.5 sm:py-2 disabled:opacity-50"
          />

          {/* Quick Helper / Indonesian Ask Button inside Input bar */}
          <button
            type="button"
            onClick={onOpenTranslationModal}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Tanya Bahasa Indonesia / Minta Tolong Translate"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Big Mic Button */}
        <button
          type="button"
          onClick={handleToggleMic}
          disabled={disabled}
          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold transition-all shrink-0 cursor-pointer ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 ring-4 sm:ring-8 ring-red-50 scale-105'
              : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 ring-4 sm:ring-8 ring-emerald-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isRecording ? 'Hentikan Rekaman Suara' : 'Tekan untuk Bicara (Voice Input)'}
        >
          {isRecording ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || (!textInput.trim() && !interimTranscript.trim())}
          className="bg-slate-800 hover:bg-slate-900 disabled:opacity-30 text-white p-2.5 sm:p-3 rounded-2xl font-bold transition-all shadow-2xs flex items-center justify-center cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Helper Bar Bottom */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="hidden sm:inline">Latihan Percakapan Real-time</span>
          <span className="sm:hidden">Latihan Real-time</span>
        </div>

        <button
          onClick={onOpenTranslationModal}
          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
          <span>Bantuan ID 💡</span>
        </button>
      </div>
    </div>
  );
};
