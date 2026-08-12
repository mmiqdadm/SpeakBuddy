export type DifficultyLevel = 'starter' | 'beginner' | 'intermediate' | 'upper_intermediate' | 'advanced';

export type VoiceSpeed = 'slow' | 'normal' | 'fast';

export type VoiceGender = 'female' | 'male' | 'child';
export type VoiceAccent = 'US' | 'UK' | 'AU' | 'IN';

export interface VoiceProfile {
  id: string;
  name: string;
  flag: string;
  accent: VoiceAccent;
  accentName: string;
  gender: VoiceGender;
  toneDescription: string;
  langCode: string;
  pitch: number;
  rate: number;
  keywords: string[];
}

export interface Topic {
  id: string;
  title: string;
  titleIndonesian: string;
  category: string;
  icon: string;
  description: string;
  starterPrompt: string;
  initialMessage: string;
  keyVocabulary: { english: string; indonesian: string; example: string }[];
  suggestedPhrases: string[];
}

export interface GrammarCorrection {
  original: string;
  suggested: string;
  explanation: string;
  explanationIndonesian: string;
}

export interface TurnEvaluation {
  pronunciationScore: number; // 0 - 100
  grammarScore: number;       // 0 - 100
  fluencyScore: number;       // 0 - 100
  overallScore: number;       // 0 - 100
  badgeLabel: string;         // e.g., "Awesome Pronunciation! 🌟"
  feedbackSummary: string;    // Short encouraging note
  feedbackIndonesian: string; // Encouraging note in Indonesian
  corrections: GrammarCorrection[];
  betterAlternatives: string[];
  keyVocabularyUsed: string[];
  pronunciationTips?: { word: string; phonetic: string; tip: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'buddy';
  text: string;
  timestamp: string;
  translationIndonesian?: string;
  evaluation?: TurnEvaluation;
  isTranslationHelpRequest?: boolean;
  userPromptIndonesian?: string; // If user asked in Indonesian
  audioUrl?: string;
}

export interface UserStats {
  streakDays: number;
  totalTurnsSpoken: number;
  totalStarsEarned: number;
  averageScore: number;
  masteredWords: string[];
  completedTopics: string[];
}
