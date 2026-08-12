import React, { useState } from 'react';
import { ChatMessage, VoiceProfile, VoiceSpeed } from '../types';
import { speakText, stopSpeaking } from '../services/speech';
import { Volume2, VolumeX, Languages, Sparkles, CheckCircle2, AlertCircle, HelpCircle, User, Bot, Award, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatArenaProps {
  messages: ChatMessage[];
  isBuddyThinking: boolean;
  voiceSpeed: VoiceSpeed;
  selectedVoice: VoiceProfile;
  onOpenFeedbackModal: (msg: ChatMessage) => void;
}

export const ChatArena: React.FC<ChatArenaProps> = ({
  messages,
  isBuddyThinking,
  voiceSpeed,
  selectedVoice,
  onOpenFeedbackModal,
}) => {
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [showTranslationIds, setShowTranslationIds] = useState<Record<string, boolean>>({});

  const handleTogglePlayAudio = (msg: ChatMessage) => {
    if (playingMessageId === msg.id) {
      stopSpeaking();
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(msg.id);
      speakText(msg.text, voiceSpeed, selectedVoice, () => {
        setPlayingMessageId(null);
      });
    }
  };

  const toggleTranslation = (id: string) => {
    setShowTranslationIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-5 mb-4 min-h-[380px] max-h-[550px] overflow-y-auto pr-1">
      {/* Messages List */}
      {messages.map((msg) => {
        const isBuddy = msg.sender === 'buddy';
        const isPlaying = playingMessageId === msg.id;
        const showTrans = showTranslationIds[msg.id];
        const evalData = msg.evaluation;

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${isBuddy ? 'flex-row' : 'flex-row-reverse'} group`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 shadow-xs ${
                isBuddy
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isBuddy ? '🤖' : <User className="w-5 h-5" />}
            </div>

            {/* Bubble Content */}
            <div className={`flex flex-col ${isBuddy ? 'items-start' : 'items-end'} max-w-[85%] sm:max-w-[75%]`}>
              {/* Header Label */}
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  {isBuddy ? 'Buddy' : 'Kamu'}
                </span>
                <span className="text-[10px] text-slate-300">{msg.timestamp}</span>

                {/* Indonesian Translation Tag */}
                {msg.isTranslationHelpRequest && (
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-indigo-100">
                    <HelpCircle className="w-3 h-3" /> Bantuan Bahasa
                  </span>
                )}
              </div>

              {/* Message Bubble Card */}
              <div
                className={`relative p-4 sm:p-5 rounded-3xl shadow-2xs border transition-all text-sm leading-relaxed ${
                  isBuddy
                    ? 'bg-white border-slate-100 text-slate-700 rounded-tl-none'
                    : 'bg-emerald-500 border-emerald-600 text-white font-medium rounded-tr-none shadow-xs'
                }`}
              >
                {/* Main Text */}
                <p className="whitespace-pre-line text-sm sm:text-base">{msg.text}</p>

                {/* Buddy Controls (Audio & Translation) */}
                {isBuddy && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Speaker Button */}
                      <button
                        onClick={() => handleTogglePlayAudio(msg)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer ${
                          isPlaying
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" /> Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" /> Dengar Suara
                          </>
                        )}
                      </button>

                      {/* Indonesian Translation Toggle */}
                      {msg.translationIndonesian && (
                        <button
                          onClick={() => toggleTranslation(msg.id)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          <Languages className="w-3.5 h-3.5" />
                          <span>{showTrans ? 'Sembunyikan' : 'Lihat Arti (ID)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Buddy Indonesian Translation Dropdown */}
                {isBuddy && showTrans && msg.translationIndonesian && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium">
                    <span className="font-bold text-slate-800">🇮🇩 Terjemahan:</span> {msg.translationIndonesian}
                  </div>
                )}
              </div>

              {/* User Turn Automatic Evaluation Badge */}
              {!isBuddy && evalData && (
                <div className="mt-2 flex flex-col items-end gap-1.5">
                  <div className="px-3 py-1 bg-white rounded-full border border-slate-100 shadow-2xs flex items-center gap-2.5">
                    <span className="text-emerald-600 font-black text-[10px] uppercase tracking-wider">
                      Score: {evalData.overallScore}
                    </span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${Math.min(100, Math.max(0, evalData.overallScore))}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {evalData.badgeLabel}
                    </span>
                    <button
                      onClick={() => onOpenFeedbackModal(msg)}
                      className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Detail 🔍
                    </button>
                  </div>

                  {/* Corrections preview if available */}
                  {evalData.corrections && evalData.corrections.length > 0 && (
                    <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-2.5 text-xs text-slate-700 max-w-xs text-left">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 mb-0.5">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span>Saran Perbaikan:</span>
                      </div>
                      <p className="text-[11px]">
                        <span className="line-through text-red-400 mr-1">{evalData.corrections[0].original}</span>
                        👉 <span className="font-bold text-emerald-700">{evalData.corrections[0].suggested}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Thinking Indicator */}
      {isBuddyThinking && (
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-xl font-bold shadow-xs">
            🤖
          </div>
          <div className="bg-white border border-slate-100 p-3.5 rounded-3xl rounded-tl-none shadow-2xs text-xs text-slate-600 flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping delay-100" />
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping delay-200" />
            </div>
            <span className="font-medium text-slate-600">Buddy sedang mengetik...</span>
          </div>
        </div>
      )}
    </div>
  );
};
