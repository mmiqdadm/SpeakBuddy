import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
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
  ArrowRight,
  ArrowLeft,
  Shuffle,
  Grid,
  Search,
  Sparkles,
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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FlashcardCategory | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('repeat');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  // Pronunciation Evaluation State
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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
    }, 1200);
  };

  const handleSelectCategory = (category: FlashcardCategory) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
    setIsRevealed(false);
    setPronunciationResult(null);
    setGuessResult(null);
    setSpokenTranscript('');
    setMicError(null);
  };

  const handleBackToCategories = () => {
    stopSpeaking();
    setSelectedCategory(null);
  };

  const handleStartSpeech = () => {
    if (!activeCard) return;
    setMicError(null);
    setPronunciationResult(null);
    setGuessResult(null);

    const rec = createSpeechRecognition(
      (transcript: string) => {
        setSpokenTranscript(transcript);
        const targetWord = activeCard.word.toLowerCase().trim();
        const userSpoken = transcript.toLowerCase().trim();

        if (gameMode === 'repeat') {
          const isMatch = userSpoken.includes(targetWord) || targetWord.includes(userSpoken);
          const accuracy = isMatch ? 95 : 60;
          setPronunciationResult({
            accuracyScore: accuracy,
            statusLabel: isMatch ? 'Great Pronunciation! ⭐' : 'Try Again!',
            statusColor: isMatch ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200',
            feedbackMessage: isMatch ? `Pengucapan "${transcript}" sangat bagus!` : `Kedengaran seperti "${transcript}". Coba ulangi "${activeCard.word}".`,
            spokenText: transcript,
            phoneticTip: activeCard.phonetic || '',
          });
        } else {
          const isCorrect = userSpoken.includes(targetWord) || targetWord.includes(userSpoken);
          setIsRevealed(true);
          setGuessResult({
            isCorrect,
            accuracyScore: isCorrect ? 100 : 50,
            message: isCorrect ? 'Tepat Sekali! 🎉' : `Jawaban tepatnya adalah "${activeCard.word}".`,
            spokenWord: transcript,
            phoneticTip: activeCard.phonetic || '',
          });
        }
      },
      (error: string) => {
        setIsListening(false);
        setMicError(`Mikrofon error: ${error || 'Silakan coba lagi.'}`);
      },
      () => {
        setIsListening(false);
      },
      'en-US'
    );

    if (!rec) {
      setMicError('Browser tidak mendukung Speech Recognition.');
      return;
    }

    recognitionRef.current = rec;
    setIsListening(true);
    setSpokenTranscript('Mendengarkan...');
    rec.start();
  };

  // Category Selection View
  if (!selectedCategory) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-sm mb-3">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Kartu Kosakata Interaktif
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pilih Kategori Kosakata 📚
          </h1>
          <p className="text-slate-600 mt-2 text-base max-w-xl mx-auto">
            Pelajari ratusan kata bahasa Inggris lengkap dengan suara pengucapan asli dan latihan pelafalan.
          </p>

          {/* Search Bar */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kategori (misal: Hewan, Makanan, Rumahan)..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-800 text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCategories.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelectCategory(cat)}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md hover:border-amber-400 cursor-pointer flex flex-col items-center text-center transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-3xl mb-3 shadow-inner transition-colors">
                {cat.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {cat.titleIndonesian}
              </p>
              <span className="mt-3 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                {cat.cards.length} Kata
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Active Flashcard Game View
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={handleBackToCategories}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors"
        >
          <Grid className="w-4 h-4 text-slate-500" />
          Kategori
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 font-bold text-slate-900 text-base">
            <span>{selectedCategory.icon}</span>
            <span>{selectedCategory.title}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Kartu {currentIndex + 1} dari {selectedCategory.cards.length}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setGameMode('repeat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'repeat'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ulangi 🗣️
          </button>
          <button
            onClick={() => {
              setGameMode('guess');
              setIsRevealed(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'guess'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tebak ❓
          </button>
        </div>
      </div>

      {/* Main Flashcard Display Card */}
      {activeCard && (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
          {/* Card Illustration */}
          <FlashcardIllustration
            card={activeCard}
            gameMode={gameMode}
            isRevealed={isRevealed}
            onImageClick={() => handlePlayWordAudio()}
          />

          {/* Word Text Display */}
          <div className="mt-4 mb-2">
            {gameMode === 'guess' && !isRevealed ? (
              <div className="py-2">
                <button
                  onClick={() => setIsRevealed(true)}
                  className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl border border-indigo-200 text-sm transition-all"
                >
                  Buka Jawaban 👁️
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                  {activeCard.word}
                  <button
                    onClick={() => handlePlayWordAudio()}
                    className={`p-2 rounded-full hover:bg-slate-100 transition-colors text-amber-600 ${
                      isPlayingAudio ? 'animate-bounce' : ''
                    }`}
                    title="Putar Suara"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </h2>
                {activeCard.phonetic && (
                  <p className="text-sm font-semibold text-amber-700/90 mt-1 font-mono bg-amber-50 inline-block px-3 py-0.5 rounded-full border border-amber-200/60">
                    {activeCard.phonetic}
                  </p>
                )}
                <p className="text-lg font-bold text-slate-600 mt-1.5">
                  {activeCard.translation}
                </p>
              </>
            )}
          </div>

          {/* Speech Feedback Box */}
          {pronunciationResult && (
            <div className={`mt-4 w-full p-4 rounded-2xl border text-sm font-medium ${pronunciationResult.statusColor}`}>
              <div className="font-bold text-base mb-1">{pronunciationResult.statusLabel}</div>
              <p>{pronunciationResult.feedbackMessage}</p>
            </div>
          )}

          {guessResult && (
            <div className={`mt-4 w-full p-4 rounded-2xl border text-sm font-medium ${guessResult.isCorrect ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
              <div className="font-bold text-base mb-1">{guessResult.message}</div>
            </div>
          )}

          {micError && (
            <div className="mt-4 w-full p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {micError}
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="mt-6 flex items-center justify-center gap-3 w-full">
            <button
              onClick={handlePrevCard}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Kartu Sebelumnya"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleStartSpeech}
              disabled={isListening}
              className={`flex-1 max-w-xs py-3.5 px-6 rounded-2xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                isListening
                  ? 'bg-rose-500 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>Mendengarkan...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Ucapkan Kata 🎙️</span>
                </>
              )}
            </button>

            <button
              onClick={handleRandomCard}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Kartu Acak"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={handleNextCard}
              className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-colors"
              title="Kartu Berikutnya"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};