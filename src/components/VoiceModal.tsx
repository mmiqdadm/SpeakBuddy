import React from 'react';
import { VoiceProfile, VoiceSpeed } from '../types';
import { VOICE_PROFILES } from '../data/voiceProfiles';
import { speakText, stopSpeaking } from '../services/speech';
import { Volume2, X, Check, Mic, Music, Gauge } from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: VoiceProfile;
  onSelectVoice: (profile: VoiceProfile) => void;
  voiceSpeed: VoiceSpeed;
  onChangeSpeed: (speed: VoiceSpeed) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  selectedVoice,
  onSelectVoice,
  voiceSpeed,
  onChangeSpeed,
}) => {
  if (!isOpen) return null;

  const handleTestVoice = (profile: VoiceProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeaking();
    const sampleText = `Hello there! I am ${profile.name}. Let's practice English together!`;
    speakText(sampleText, voiceSpeed, profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Pilihan Suara & Aksen 🎙️
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Pilih karakter, gender, aksen & kecepatan suara Buddy!
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

        {/* Speed Control Section */}
        <div className="mb-5 bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-500" />
              <span>Kecepatan Berbicara (Speed):</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => onChangeSpeed('slow')}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                voiceSpeed === 'slow'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              🐢 Pelan (Slow)
            </button>
            <button
              onClick={() => onChangeSpeed('normal')}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                voiceSpeed === 'normal'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              ⚡ Normal
            </button>
            <button
              onClick={() => onChangeSpeed('fast')}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                voiceSpeed === 'fast'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              🚀 Cepat (Fast)
            </button>
          </div>
        </div>

        {/* Voice Profile List */}
        <div className="space-y-2.5 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Daftar Suara & Aksen (Karakter):
          </span>

          {VOICE_PROFILES.map((profile) => {
            const isSelected = selectedVoice.id === profile.id;

            return (
              <div
                key={profile.id}
                onClick={() => onSelectVoice(profile)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-2xs'
                    : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                    {profile.flag}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800">{profile.name}</h4>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {profile.accentName}
                      </span>
                      {isSelected && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-700 font-medium mt-0.5">
                      {profile.toneDescription}
                    </p>
                  </div>
                </div>

                {/* Test Voice Sample Button */}
                <button
                  type="button"
                  onClick={(e) => handleTestVoice(profile, e)}
                  className="bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                  title="Tes Suara Ini"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Tes Suara</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Close */}
        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-2xl text-xs transition-colors cursor-pointer"
        >
          Simpan & Gunakan Suara Ini
        </button>
      </div>
    </div>
  );
};
