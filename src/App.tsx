import React, { useState, useEffect } from 'react';
import { ChatMessage, DifficultyLevel, Topic, UserStats, VoiceSpeed, VoiceProfile } from './types';
import { DEFAULT_TOPICS } from './data/defaultTopics';
import { VOICE_PROFILES } from './data/voiceProfiles';
import { sendChatTurn, fetchRandomTopic } from './services/api';
import { speakText, stopSpeaking, preloadVoices } from './services/speech';

import { Navbar } from './components/Navbar';
import { TopicBanner } from './components/TopicBanner';
import { ChatArena } from './components/ChatArena';
import { VoiceInputBar } from './components/VoiceInputBar';
import { FlashcardGame } from './components/FlashcardGame';
import { FeedbackModal } from './components/FeedbackModal';
import { TranslationModal } from './components/TranslationModal';
import { CheatSheetModal } from './components/CheatSheetModal';
import { StatsDrawer } from './components/StatsDrawer';
import { TopicsModal } from './components/TopicsModal';
import { VoiceModal } from './components/VoiceModal';
import { LevelModal } from './components/LevelModal';

const getRandomTopic = () => {
  const randomIndex = Math.floor(Math.random() * DEFAULT_TOPICS.length);
  return DEFAULT_TOPICS[randomIndex];
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'conversation' | 'flashcard'>('conversation');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [voiceSpeed, setVoiceSpeed] = useState<VoiceSpeed>('normal');
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(VOICE_PROFILES[0]);
  const [currentTopic, setCurrentTopic] = useState<Topic>(getRandomTopic);
  const [customTopics, setCustomTopics] = useState<Topic[]>([]);
  const [isLoadingNewTopic, setIsLoadingNewTopic] = useState(false);

  // Preload speech voices on mount
  useEffect(() => {
    preloadVoices();
  }, []);

  // Chat Messages State initialized with Buddy initial greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      sender: 'buddy',
      text: currentTopic.initialMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      translationIndonesian: currentTopic.description,
    },
  ]);

  const [isBuddyThinking, setIsBuddyThinking] = useState(false);

  // User Gamification Stats
  const [stats, setStats] = useState<UserStats>({
    streakDays: 3,
    totalTurnsSpoken: 5,
    totalStarsEarned: 120,
    averageScore: 92,
    masteredWords: ['Flavor', 'Scoop', 'Cone', 'Delicious', 'Yummy'],
    completedTopics: [DEFAULT_TOPICS[0].id],
  });

  // Modal Controllers
  const [selectedFeedbackMsg, setSelectedFeedbackMsg] = useState<ChatMessage | null>(null);
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);
  const [isCheatSheetModalOpen, setIsCheatSheetModalOpen] = useState(false);
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false);
  const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  // Speak initial message on load or topic change option
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'buddy') {
      speakText(messages[0].text, voiceSpeed, selectedVoice);
    }
  }, [currentTopic]);

  const handleSelectTopic = (newTopic: Topic) => {
    stopSpeaking();
    setCurrentTopic(newTopic);
    const initMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'buddy',
      text: newTopic.initialMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      translationIndonesian: newTopic.description,
    };
    setMessages([initMsg]);
    speakText(newTopic.initialMessage, voiceSpeed, selectedVoice);
  };

  const handleGenerateNewRandomTopic = async () => {
    setIsLoadingNewTopic(true);
    try {
      const generatedTopic = await fetchRandomTopic(difficulty);
      setCustomTopics((prev) => [generatedTopic, ...prev]);
      handleSelectTopic(generatedTopic);
    } catch (err) {
      console.error('Failed to generate random topic, using default preset:', err);
      const randomIndex = Math.floor(Math.random() * DEFAULT_TOPICS.length);
      handleSelectTopic(DEFAULT_TOPICS[randomIndex]);
    } finally {
      setIsLoadingNewTopic(false);
    }
  };

  const handleSendMessage = async (userText: string, isIndonesianHelp = false) => {
    if (!userText.trim() || isBuddyThinking) return;

    stopSpeaking();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `user-${Date.now()}`;

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: userText,
      timestamp,
      isTranslationHelpRequest: isIndonesianHelp,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsBuddyThinking(true);

    try {
      const response = await sendChatTurn(
        userText,
        difficulty,
        currentTopic,
        messages,
        isIndonesianHelp
      );

      const buddyMsgId = `buddy-${Date.now()}`;
      const newBuddyMsg: ChatMessage = {
        id: buddyMsgId,
        sender: 'buddy',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        translationIndonesian: response.replyIndonesianTranslation,
      };

      // Update evaluation on user turn message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId
            ? {
                ...m,
                evaluation: response.evaluation,
              }
            : m
        ).concat(newBuddyMsg)
      );

      // Auto-speak Buddy's response out loud
      speakText(response.reply, voiceSpeed, selectedVoice);

      // Update User Stats
      if (response.evaluation) {
        setStats((prev) => {
          const newTurns = prev.totalTurnsSpoken + 1;
          const turnScore = response.evaluation.overallScore || 90;
          const newAvg = Math.round((prev.averageScore * prev.totalTurnsSpoken + turnScore) / newTurns);
          const starsEarned = Math.max(10, Math.round(turnScore / 10));

          // Extract new vocabulary
          const newVocab = response.evaluation.keyVocabularyUsed || [];
          const updatedWords = Array.from(new Set([...prev.masteredWords, ...newVocab]));

          return {
            ...prev,
            totalTurnsSpoken: newTurns,
            averageScore: newAvg,
            totalStarsEarned: prev.totalStarsEarned + starsEarned,
            masteredWords: updatedWords,
          };
        });
      }
    } catch (err: any) {
      console.error('Error handling chat turn:', err);
      const isApiKeyErr = err?.message?.includes('API key') || err?.message?.includes('INVALID_ARGUMENT');
      const isRateLimitErr = err?.message?.includes('Rate limit') || err?.message?.includes('429');

      let errorText = "Oops! Something went wrong on my end. Could you say that again? 😊";
      let errorIndonesian = "Waduh, terjadi kendala teknis singkat. Boleh coba kirim ulang pesannya? 😊";

      if (isApiKeyErr) {
        errorText = "⚠️ GEMINI_API_KEY is not configured or invalid. Please add a valid API key in your .env or Vercel Environment Variables.";
        errorIndonesian = "⚠️ GEMINI_API_KEY belum dikonfigurasi atau tidak valid. Silakan pasang API key di file .env atau Vercel Environment Variables.";
      } else if (isRateLimitErr) {
        errorText = "☕ Buddy is taking a 10-second breather due to high activity! Try sending your message again in a moment. ⭐";
        errorIndonesian = "☕ Buddy sedang istirahat sejenak 10 detik! Coba kirim ulang pesanmu sesaat lagi. ⭐";
      }

      const fallbackMsg: ChatMessage = {
        id: `buddy-error-${Date.now()}`,
        sender: 'buddy',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        translationIndonesian: errorIndonesian,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (!isApiKeyErr) {
        speakText(fallbackMsg.text, voiceSpeed, selectedVoice);
      }
    } finally {
      setIsBuddyThinking(false);
    }
  };

  const handleAddStars = (starsAmount: number) => {
    setStats((prev) => ({
      ...prev,
      totalStarsEarned: prev.totalStarsEarned + starsAmount,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 flex flex-col font-sans selection:bg-emerald-100 antialiased">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        difficulty={difficulty}
        onOpenLevelModal={() => setIsLevelModalOpen(true)}
        selectedVoice={selectedVoice}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        stats={stats}
        onOpenTopics={() => setIsTopicsModalOpen(true)}
        onOpenStats={() => setIsStatsDrawerOpen(true)}
        onOpenCheatSheet={() => setIsCheatSheetModalOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-2.5 sm:p-5 flex flex-col">
        {activeTab === 'conversation' ? (
          <>
            {/* Thematic Topic Header Banner */}
            <TopicBanner
              topic={currentTopic}
              difficulty={difficulty}
              onRandomizeTopic={handleGenerateNewRandomTopic}
              onSelectSuggestedPhrase={(phrase) => handleSendMessage(phrase)}
              isLoadingTopic={isLoadingNewTopic}
              onOpenCheatSheet={() => setIsCheatSheetModalOpen(true)}
            />

            {/* Chat Arena with Audio Avatars & Transcripts */}
            <div className="flex-1 bg-white border border-slate-100 rounded-3xl p-3 sm:p-6 shadow-2xs mb-2 flex flex-col justify-between">
              <ChatArena
                messages={messages}
                isBuddyThinking={isBuddyThinking}
                voiceSpeed={voiceSpeed}
                selectedVoice={selectedVoice}
                onOpenFeedbackModal={(msg) => setSelectedFeedbackMsg(msg)}
              />

              {/* Voice & Text Input Control Bar */}
              <VoiceInputBar
                onSendMessage={(txt) => handleSendMessage(txt)}
                disabled={isBuddyThinking}
                onOpenTranslationModal={() => setIsTranslationModalOpen(true)}
              />
            </div>
          </>
        ) : (
          <FlashcardGame
            voiceSpeed={voiceSpeed}
            selectedVoice={selectedVoice}
            stats={stats}
            onUpdateStars={handleAddStars}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <FeedbackModal
        message={selectedFeedbackMsg}
        onClose={() => setSelectedFeedbackMsg(null)}
      />

      <TranslationModal
        isOpen={isTranslationModalOpen}
        onClose={() => setIsTranslationModalOpen(false)}
        topicTitle={currentTopic.title}
        onSendTranslatedMessage={(txt) => handleSendMessage(txt)}
      />

      <CheatSheetModal
        isOpen={isCheatSheetModalOpen}
        onClose={() => setIsCheatSheetModalOpen(false)}
        topic={currentTopic}
        onSelectPhrase={(phrase) => handleSendMessage(phrase)}
      />

      <StatsDrawer
        isOpen={isStatsDrawerOpen}
        onClose={() => setIsStatsDrawerOpen(false)}
        stats={stats}
      />

      <TopicsModal
        isOpen={isTopicsModalOpen}
        onClose={() => setIsTopicsModalOpen(false)}
        currentTopic={currentTopic}
        customTopics={customTopics}
        onSelectTopic={handleSelectTopic}
        onGenerateNewTopic={handleGenerateNewRandomTopic}
        isLoadingNewTopic={isLoadingNewTopic}
        difficulty={difficulty}
      />

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        selectedVoice={selectedVoice}
        onSelectVoice={(profile) => setSelectedVoice(profile)}
        voiceSpeed={voiceSpeed}
        onChangeSpeed={(speed) => setVoiceSpeed(speed)}
      />

      <LevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        selectedLevel={difficulty}
        onSelectLevel={(lvl) => setDifficulty(lvl)}
      />
    </div>
  );
}
