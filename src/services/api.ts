import { ChatMessage, DifficultyLevel, Topic, TurnEvaluation } from '../types';

export interface ChatTurnResponse {
  reply: string;
  replyIndonesianTranslation?: string;
  evaluation: TurnEvaluation;
  isTranslationHelpRequest?: boolean;
}

export async function sendChatTurn(
  userInput: string,
  difficulty: DifficultyLevel,
  topic: Topic,
  history: ChatMessage[],
  isIndonesianHelp: boolean = false
): Promise<ChatTurnResponse> {
  const response = await fetch('/api/chat-turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userInput,
      difficulty,
      topic,
      history,
      isIndonesianHelp,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to send message');
  }

  return await response.json();
}

export async function fetchRandomTopic(difficulty: DifficultyLevel): Promise<Topic> {
  const response = await fetch('/api/generate-topic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate topic');
  }

  return await response.json();
}

export interface TranslationHelpResult {
  primaryEnglish: string;
  alternativeEnglish?: string;
  pronunciationGuide?: string;
  explanationIndonesian: string;
}

export async function fetchTranslationHelp(
  textIndonesian: string,
  contextTopicTitle: string = ''
): Promise<TranslationHelpResult> {
  const response = await fetch('/api/translate-help', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      textIndonesian,
      contextTopic: contextTopicTitle,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to translate sentence');
  }

  return await response.json();
}
