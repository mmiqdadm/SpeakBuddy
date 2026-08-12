import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FLASHCARD_CATEGORIES,
  FlashcardCategory,
  FlashcardItem,
} from '../data/flashcardsData';
import { VoiceProfile, VoiceSpeed, UserStats } from '../types';
import { speakText, stopSpeaking, createSpeechRecognition } from '../services/speech';
import { FlashcardIllustration } from './FlashcardIllustration';
import {
  Volume2,
  Mic,
  MicOff,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  Grid,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Award,
  ChevronRight,
  RefreshCcw,
} from 'lucide-react';

interface FlashcardGameProps {
  voiceSpeed: VoiceSpeed;
  selectedVoice: VoiceProfile;
  stats: UserStats;
  onUpdateStars: (starsAmount: number) => void;
}

type GameMode = 'repeat' | 'guess';

export const FlashcardGame: React.FC<FlashcardGameProps> = ({
  voiceSpeed,
  selectedVoice,
  stats,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FlashcardCategory | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('repeat');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  // Pronunciation Evaluation State (Zero XP / Stars)
  const [pronunciationResult, setPronunciationResult] = useState<{
    accuracyScore: number;
    statusLabel: string;
    statusColor: string;
    feedbackMessage: string;
    spokenText: string;
    phoneticTip: string;
  } | null>(null);

  // Guess the word state
  const [guessResult, setGuessResult] = useState<{
    isCorrect: boolean;
    accuracyScore: number;
    message: string;
    spokenWord: string;
    phoneticTip: string;
  } | null>(null);

  const [isRevealed, setIsRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [imageError, setImageError] = useState(false);

  const recognitionRef = useRef<any>(null);

  const activeCard: FlashcardItem | null = selectedCategory
    ? selectedCategory.cards[currentIndex]
    : null;

  // Filtered categories for search
  const filteredCategories = FLASHCARD_CATEGORIES.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.titleIndonesian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigation handlers
  const handleNextCard = () => {
    stopSpeaking();
    setIsRevealed(false);
    setShowHint(false);
    setImageError(false);
    setPronunciationResult(null);
    setGuessResult(null);
    setSpokenTranscript('');
    setMicError(null);

    if (selectedCategory) {
      setCurrentIndex((prev) => (prev + 1) % selectedCategory.cards.length);
    }
  };

  const handlePrevCard = () => {
    stopSpeaking();
    setIsRevealed(false);
    setShowHint(false);
    setImageError(false);
    setPronunciationResult(null);
    setGuessResult(null);
    setSpokenTranscript('');
    setMicError(null);

    if (selectedCategory) {
      setCurrentIndex((prev) =>
        prev === 0 ? selectedCategory.cards.length - 1 : prev - 1
      );
    }
  };

  const handleRandomCard = () => {
    stopSpeaking();
    setIsRevealed(false);
    setShowHint(false);
    setImageError(false);
    setPronunciationResult(null);
    setGuessResult(null);
    setSpokenTranscript('');
    setMicError(null);

    if (selectedCategory && selectedCategory.cards.length > 1) {
      let nextIdx = Math.floor(Math.random() * selectedCategory.cards.length);
      if (nextIdx === currentIndex) {
        nextIdx = (currentIndex + 1) % selectedCategory.cards.length;
      }
      setCurrentIndex(nextIdx);
    }
  };

  // Play word audio
  const handlePlayWordAudio = (textToSpeak?: string) => {
    if (!activeCard) return;
    setIsPlayingAudio(true);
    const target = textToSpeak || activeCard.word;
    speakText(target, voiceSpeed, selectedVoice);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 1600);
  };

  // Speech Recognition
  const handleStartMic = () => {
    setMicError(null);
    setSpokenTranscript('');

    const rec = createSpeechRecognition(
      (transcript, isFinal) => {
        setSpokenTranscript(transcript);
        if (isFinal && transcript.trim()) {
          evaluatePronunciation(transcript.trim());
        }
      },
      (err) => {
        console.warn('Flashcard Mic error:', err);
        setMicError('Izin mikrofon diperlukan untuk menilai pelafalan suaramu.');
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      'en-US'
    );

    if (!rec) {
      setMicError('Browser tidak mendukung perekaman suara langsung.');
      return;
    }

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleStopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Evaluate user pronunciation (Articulation & Clarity - No XP/Stars)
  const evaluatePronunciation = (transcript: string) => {
    if (!activeCard) return;

    const cleanSpoken = transcript.toLowerCase().trim();
    const cleanTarget = activeCard.word.toLowerCase().trim();

    let accuracyScore = 0;
    if (cleanSpoken === cleanTarget) {
      accuracyScore = 98;
    } else if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
      accuracyScore = 85;
    } else {
      const targetWords = cleanTarget.split(' ');
      const spokenWords = cleanSpoken.split(' ');
      let matches = 0;
      targetWords.forEach((tw) => {
        if (spokenWords.some((sw) => sw.includes(tw) || tw.includes(sw))) {
          matches++;
        }
      });
      accuracyScore = Math.round((matches / targetWords.length) * 80);
      if (accuracyScore === 0 && cleanSpoken.length > 0) accuracyScore = 55;
    }

    // Pronunciation Status & Articulation Tip
    let statusLabel = 'Perlu Latihan Artikulas';
    let statusColor = 'bg-amber-100 text-amber-800 border-amber-200';
    let feedbackMessage = 'Perhatikan penekanan bunyi huruf pada kata ini.';
    let phoneticTip = `Cara baca: ${activeCard.phonetic}. Coba ucapkan pelan-pelan & jelas.`;

    if (accuracyScore >= 90) {
      statusLabel = '🟢 Sangat Fasih & Jelas!';
      statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      feedbackMessage = 'Luar biasa! Pelafalan dan intonasimu sangat tepat mirip penutur asli.';
      phoneticTip = `Pelafalan '${activeCard.word}' (${activeCard.phonetic}) sudah sangat sempurna!`;
    } else if (accuracyScore >= 70) {
      statusLabel = '🟡 Pelafalan Cukup Bagus';
      statusColor = 'bg-sky-100 text-sky-800 border-sky-200';
      feedbackMessage = 'Pengucapanmu sudah cukup jelas dan dapat dipahami dengan baik.';
      phoneticTip = `Fokus pada artikulasi bunyi '${activeCard.word[0]}' dan akhiran kata.`;
    }

    if (gameMode === 'repeat') {
      setPronunciationResult({
        accuracyScore,
        statusLabel,
        statusColor,
        feedbackMessage,
        spokenText: transcript,
        phoneticTip,
      });

      if (accuracyScore >= 80) {
        speakText('Great pronunciation!', voiceSpeed, selectedVoice);
      }
    } else {
      // Guess mode evaluation
      const isCorrectGuess =
        accuracyScore >= 70 ||
        cleanSpoken === cleanTarget ||
        cleanSpoken.includes(cleanTarget);

      if (isCorrectGuess) {
        setIsRevealed(true);
        setGuessResult({
          isCorrect: true,
          accuracyScore: Math.max(accuracyScore, 90),
          message: `TEPAT SEKALI! Kata ini adalah '${activeCard.word}'.`,
          spokenWord: transcript,
          phoneticTip: `Pelafalanmu tepat (${activeCard.phonetic}).`,
        });
        speakText(`Correct! It is ${activeCard.word}!`, voiceSpeed, selectedVoice);
      } else {
        setGuessResult({
          isCorrect: false,
          accuracyScore,
          message: `Terdeteksi: "${transcript}". Coba sebutkan kata dalam Bahasa Inggris lagi ya!`,
          spokenWord: transcript,
          phoneticTip: `Petunjuk: '${activeCard.word}' (${activeCard.phonetic})`,
        });
      }
    }
  };

  // 1. Simpler & Compact Category Selection Menu
  if (!selectedCategory) {
    return (
      <div className="max-w-4xl mx-auto w-full px-3 py-4 sm:p-5 space-y-4">
        {/* Header Title & Compact Search Input */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Grid className="w-5 h-5 text-emerald-600" />
                <span>Pilih Tema Flashcard</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pilih tema kosakata untuk melatih pelafalan & memori kata
              </p>
            </div>

            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto border border-slate-200/60">
              {FLASHCARD_CATEGORIES.length} Kategori Tersedia
            </span>
          </div>

          {/* Quick Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tema kosakata (misal: Hewan, Makanan, Profesi)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 font-bold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Compact Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredCategories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
                setIsRevealed(false);
                setImageError(false);
                setPronunciationResult(null);
                setGuessResult(null);
              }}
              className="bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-xs rounded-2xl p-3.5 text-left transition-all flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Category Icon Badge */}
                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  {cat.icon}
                </div>

                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-800 text-sm truncate group-hover:text-emerald-600 transition-colors">
                    {cat.titleIndonesian}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {cat.cards.length} Kata • {cat.cards[0]?.word}, {cat.cards[1]?.word}...
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </motion.button>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500 font-medium">
            Tidak ada tema kosakata yang cocok dengan "{searchQuery}".
          </div>
        )}
      </div>
    );
  }

  // 2. Active Game Arena View
  return (
    <div className="max-w-2xl mx-auto w-full px-3 py-3 sm:p-4 flex flex-col space-y-3">
      {/* Top Controls Bar (Fully Responsive & Wrap Cleanly on Mobile) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Left: Change Theme & Title */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <button
            onClick={() => {
              stopSpeaking();
              setSelectedCategory(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ganti Tema</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
            <span>{selectedCategory.icon}</span>
            <span className="truncate max-w-[130px] sm:max-w-none">
              {selectedCategory.titleIndonesian}
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              {currentIndex + 1}/{selectedCategory.cards.length}
            </span>
          </div>
        </div>

        {/* Right: Mode Switcher Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/50 justify-center">
          <button
            onClick={() => {
              setGameMode('repeat');
              setIsRevealed(false);
              setImageError(false);
              setPronunciationResult(null);
              setGuessResult(null);
            }}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-lg transition-all cursor-pointer ${
              gameMode === 'repeat'
                ? 'bg-emerald-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎧 Dengar & Ulangi
          </button>
          <button
            onClick={() => {
              setGameMode('guess');
              setIsRevealed(false);
              setImageError(false);
              setPronunciationResult(null);
              setGuessResult(null);
            }}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-lg transition-all cursor-pointer ${
              gameMode === 'guess'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧩 Tebak Kata
          </button>
        </div>
      </div>

      {/* Main Flashcard Arena */}
      {activeCard && (
        <div className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCard.id + gameMode + currentIndex}
              initial={{ scale: 0.96, opacity: 0, y: 6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="w-full bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden flex flex-col items-center text-center space-y-4"
            >
              {/* Category Tag Header */}
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                {activeCard.category}
              </span>

              {/* Soft, Eye-Friendly Image Display Frame */}
              <FlashcardIllustration
                card={activeCard}
                gameMode={gameMode}
                isRevealed={isRevealed}
                onImageClick={handlePlayWordAudio}
              />

              {/* Mode 1: Listen & Repeat View */}
              {gameMode === 'repeat' && (
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                      {activeCard.word}
                    </h3>
                    <button
                      onClick={() => handlePlayWordAudio()}
                      className={`p-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all cursor-pointer ${
                        isPlayingAudio ? 'ring-4 ring-emerald-200 scale-105' : ''
                      }`}
                      title="Dengarkan Suara"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-mono text-slate-600">
                      {activeCard.phonetic}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-extrabold text-sm">
                      {activeCard.translation}
                    </span>
                  </div>

                  {/* Example Sentence Box */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-left text-xs space-y-0.5">
                    <p className="font-bold text-slate-700">
                      💡 "{activeCard.exampleSentence}"
                    </p>
                    <p className="text-slate-500 italic">
                      "{activeCard.exampleTranslation}"
                    </p>
                  </div>
                </div>
              )}

              {/* Mode 2: Guess the Word View */}
              {gameMode === 'guess' && (
                <div className="w-full space-y-3">
                  {isRevealed ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-1"
                    >
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-0.5 rounded-full inline-block">
                        🎉 Jawaban Tepat!
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-black text-slate-800">
                        {activeCard.word}
                      </h3>
                      <p className="text-xs font-bold text-emerald-600">
                        ({activeCard.translation})
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {/* Masked Letter Slots */}
                      <div className="flex items-center justify-center gap-1.5 py-1">
                        {activeCard.word.split('').map((char, i) => (
                          <span
                            key={i}
                            className={`w-8 h-10 sm:w-10 sm:h-12 border-2 border-slate-200 bg-slate-50 rounded-xl flex items-center justify-center text-xl font-black text-slate-800 shadow-2xs ${
                              char === ' ' ? 'border-transparent bg-transparent w-3' : ''
                            }`}
                          >
                            {showHint && i === 0 ? char : '?'}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs font-semibold text-slate-500">
                        Sebutkan nama kata pada gambar dalam Bahasa Inggris!
                      </p>

                      {/* Hint Toggle */}
                      <div>
                        {showHint ? (
                          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl text-xs text-amber-900 font-medium text-left">
                            💡 <strong>Petunjuk:</strong> {activeCard.hint} (Huruf depan: '{activeCard.word[0]}')
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowHint(true)}
                            className="text-xs text-amber-600 hover:text-amber-800 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Butuh Petunjuk / Clue?</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mic Listening Live Bar */}
              {isListening && (
                <div className="w-full p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-pulse">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-xs font-bold block">Mendengarkan suaramu... 🎧</span>
                    <p className="text-xs font-medium italic truncate">
                      {spokenTranscript || 'Ucapkan kata sekarang...'}
                    </p>
                  </div>
                  <button
                    onClick={handleStopMic}
                    className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 cursor-pointer"
                  >
                    Selesai 🛑
                  </button>
                </div>
              )}

              {/* Pronunciation & Articulation Result Box (Clean, No XP / Stars) */}
              {pronunciationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-extrabold text-slate-800">
                        Hasil Penilaian Pelafalan
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${pronunciationResult.statusColor}`}
                    >
                      {pronunciationResult.statusLabel} ({pronunciationResult.accuracyScore}%)
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700">
                    {pronunciationResult.feedbackMessage}
                  </p>

                  <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Kosakata Target:</span>
                      <span className="font-extrabold text-emerald-700">
                        "{activeCard.word}" ({activeCard.phonetic})
                      </span>
                    </div>
                    {pronunciationResult.spokenText && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Suara Kamu:</span>
                        <span className="font-bold text-slate-800 italic">
                          "{pronunciationResult.spokenText}"
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 bg-sky-50 border border-sky-100 p-2 rounded-xl font-medium">
                    💡 <strong>Tips Artikulasi:</strong> {pronunciationResult.phoneticTip}
                  </div>
                </motion.div>
              )}

              {/* Guess Result Box */}
              {guessResult && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-full p-3.5 rounded-2xl border text-left space-y-1.5 ${
                    guessResult.isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{guessResult.isCorrect ? '🎉 Tebakan Tepat!' : '🤔 Coba Lagi'}</span>
                    <span className="text-[10px] font-extrabold bg-white/80 px-2 py-0.5 rounded-md">
                      Akurasi Pelafalan: {guessResult.accuracyScore}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold">{guessResult.message}</p>
                  <p className="text-[11px] opacity-80">{guessResult.phoneticTip}</p>
                </motion.div>
              )}

              {/* Mic Error */}
              {micError && (
                <div className="w-full p-2.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {micError}
                </div>
              )}

              {/* Main Action Buttons */}
              <div className="w-full pt-1">
                {gameMode === 'repeat' ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Button 1: Dengarkan */}
                    <button
                      onClick={() => handlePlayWordAudio()}
                      className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm active:scale-95"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Dengarkan 🔊</span>
                    </button>

                    {/* Button 2: Ulangi / Tirukan */}
                    <button
                      onClick={isListening ? handleStopMic : handleStartMic}
                      className={`font-bold py-3 px-4 rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm active:scale-95 text-white ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span>Hentikan</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span>Ulangi / Tirukan 🎙️</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Tebak Kata Mode: NO Dengarkan button! Single Full-Width Answer Button */
                  <button
                    onClick={isListening ? handleStopMic : handleStartMic}
                    className={`w-full font-bold py-3.5 px-4 rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base active:scale-95 text-white ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-amber-500 hover:bg-amber-600'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        <span>Hentikan 🛑</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        <span>Jawab Suara / Ucapkan 🎙️</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Card Navigation Controls */}
          <div className="flex items-center justify-between w-full mt-4">
            <button
              onClick={handlePrevCard}
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-xl border border-slate-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={handleRandomCard}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer text-xs"
              title="Acak Kartu"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Acak Kartu</span>
            </button>

            <button
              onClick={handleNextCard}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-xs cursor-pointer text-xs"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
