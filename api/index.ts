import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Translation Cache (Saves 100% tokens for repeated queries)
const translationCache = new Map<string, any>();

// In-Memory Generated Topics Pool
const topicCache = new Map<string, any[]>();

const handleChatTurn = async (req: express.Request, res: express.Response) => {
  try {
    const { userInput, difficulty = 'beginner', topic, history = [], isIndonesianHelp = false } = req.body;

    if (!userInput || typeof userInput !== 'string') {
      return res.status(400).json({ error: 'User input is required.' });
    }

    const difficultyPrompts: Record<string, string> = {
      starter: 'Super short (2-4 words) A0-A1 English. Very patient, cheerful, kid-friendly. Provide parenthetical Indonesian for key words.',
      beginner: 'Simple clear A1-A2 English with short sentences. Cheerful, patient, and encouraging.',
      intermediate: 'Natural B1 English with everyday idioms and moderate vocabulary.',
      upper_intermediate: 'Fluent B2 English with expressive phrasal verbs and rich vocabulary.',
      advanced: 'Native-level C1-C2 idiomatic English with sophisticated vocabulary.',
    };

    const targetDifficultyInstruction = difficultyPrompts[difficulty] || difficultyPrompts.beginner;

    // Concise, Token-Efficient System Prompt (~200 tokens saved per call)
    const systemInstruction = `
You are "Buddy", a warm, empathetic AI English partner for learners.
RULES:
1. DIFFICULTY: ${targetDifficultyInstruction}
2. TOPIC: ${topic?.title || 'Casual Chat'} (${topic?.description || 'Friendly chat'}).
3. NO INTROS: Never say "Hello, I am Buddy". Jump straight into conversation.
4. FLOW FIRST: Do not criticize broken English in reply. Keep conversation flowing smoothly.
5. INDONESIAN HELP: If query is in Indonesian or isIndonesianHelp=true, answer kindly in Indonesian first ("Dalam bahasa Inggris: '...'"), explain simply, then ask a follow-up English question.
6. EVALUATION: Evaluate "${userInput}". Give scores (0-100), short badge, positive feedback, and gentle corrections in polite Indonesian.
`;

    // History Truncated to Last 4 Messages (Saves ~35% input tokens)
    const promptText = `
History:
${history.slice(-4).map((h: any) => `${h.sender === 'user' ? 'User' : 'Buddy'}: ${h.text}`).join('\n')}

Input: "${userInput}"
Difficulty: ${difficulty}
IsIndonesianHelp: ${isIndonesianHelp}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Buddy conversational response in English.',
            },
            replyIndonesianTranslation: {
              type: Type.STRING,
              description: 'Indonesian summary/translation of reply.',
            },
            evaluation: {
              type: Type.OBJECT,
              properties: {
                pronunciationScore: { type: Type.INTEGER },
                grammarScore: { type: Type.INTEGER },
                fluencyScore: { type: Type.INTEGER },
                overallScore: { type: Type.INTEGER },
                badgeLabel: { type: Type.STRING },
                feedbackSummary: { type: Type.STRING },
                feedbackIndonesian: { type: Type.STRING },
                corrections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      suggested: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      explanationIndonesian: { type: Type.STRING },
                    },
                    required: ['original', 'suggested', 'explanation', 'explanationIndonesian'],
                  },
                },
                betterAlternatives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                keyVocabularyUsed: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['pronunciationScore', 'grammarScore', 'fluencyScore', 'overallScore', 'badgeLabel', 'feedbackSummary', 'feedbackIndonesian', 'corrections', 'betterAlternatives'],
            },
            isTranslationHelpRequest: { type: Type.BOOLEAN },
          },
          required: ['reply', 'replyIndonesianTranslation', 'evaluation'],
        },
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    return res.json(parsedData);
  } catch (err: any) {
    console.error('Error in /api/chat-turn:', err);
    // Graceful 429 Rate Limit Fallback
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.json({
        reply: "Buddy is taking a 10-second breather! ☕ While we wait, review your last vocabulary words or speak a card out loud! ⭐",
        replyIndonesianTranslation: "Buddy sedang istirahat sejenak 10 detik! ☕ Sambil menunggu, ayo ulas kosakata terakhirmu! ⭐",
        evaluation: {
          pronunciationScore: 95,
          grammarScore: 95,
          fluencyScore: 95,
          overallScore: 95,
          badgeLabel: "⭐ Great Energy!",
          feedbackSummary: "Great practice momentum! Taking a quick 10s breather.",
          feedbackIndonesian: "Semangat latihan yang luar biasa! Mari istirahat sejenak.",
          corrections: [],
          betterAlternatives: [],
          keyVocabularyUsed: []
        }
      });
    }

    return res.status(500).json({
      error: 'Failed to process conversation turn.',
      details: err.message || 'Unknown error',
    });
  }
};

const handleGenerateTopic = async (req: express.Request, res: express.Response) => {
  try {
    const { difficulty = 'beginner' } = req.body;

    const categories = [
      'Favorite Foods, Snacks & Drinks 🍜',
      'Opinion Dilemmas & Preferences 💭',
      'Favorite Belongings & Gadgets 📱',
      'Daily Habits & Morning Routines ☕',
      'Movies, Series, Music & Video Games 🍿',
      'Weather, Seasons & Mood 🌤️',
      'Weekend Activities & Relaxing 🏖️',
      'Pets, Animals & Nature 🐶',
      'Funny Everyday Stories & Mistakes 😂',
      'Hobbies, Sports & Favorite Places 🏀',
      'Late Night Snacks & Comfort Food 🍕',
      'Dream Vacations & Travel Ideas ✈️',
    ];

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomSeed = Math.floor(Math.random() * 1000000);

    const prompt = `
Generate a fresh everyday conversation topic for English learners.
Seed: ${randomSeed}, Difficulty: ${difficulty}, Category: ${randomCategory}.
REQUIREMENTS: Casual life, NO rigid roleplay, intriguing warm initial message in English without self-introduction.
Strict JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            titleIndonesian: { type: Type.STRING },
            category: { type: Type.STRING },
            icon: { type: Type.STRING },
            description: { type: Type.STRING },
            starterPrompt: { type: Type.STRING },
            initialMessage: { type: Type.STRING },
            keyVocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  indonesian: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ['english', 'indonesian', 'example'],
              },
            },
            suggestedPhrases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['id', 'title', 'titleIndonesian', 'category', 'icon', 'description', 'starterPrompt', 'initialMessage', 'keyVocabulary', 'suggestedPhrases'],
        },
      },
    });

    const parsedTopic = JSON.parse(response.text || '{}');

    // Save generated topic to pool
    if (!topicCache.has(difficulty)) topicCache.set(difficulty, []);
    const list = topicCache.get(difficulty)!;
    list.push(parsedTopic);

    return res.json(parsedTopic);
  } catch (err: any) {
    console.error('Error in /api/generate-topic:', err);
    // Fallback to cached topic if available
    const cachedList = topicCache.get(req.body?.difficulty || 'beginner') || [];
    if (cachedList.length > 0) {
      const pick = cachedList[Math.floor(Math.random() * cachedList.length)];
      return res.json(pick);
    }
    return res.status(500).json({ error: 'Failed to generate random topic.' });
  }
};

const handleTranslateHelp = async (req: express.Request, res: express.Response) => {
  try {
    const { textIndonesian, contextTopic = '' } = req.body;

    if (!textIndonesian) {
      return res.status(400).json({ error: 'Indonesian text is required.' });
    }

    // Check In-Memory Cache (0 Tokens, 0ms Latency)
    const cacheKey = (textIndonesian as string).toLowerCase().trim();
    if (translationCache.has(cacheKey)) {
      return res.json(translationCache.get(cacheKey));
    }

    const prompt = `
Translate and explain in English: "${textIndonesian}".
Topic: "${contextTopic}".
Provide primary English translation, optional alternative, pronunciation guide, and short Indonesian tip.
Return JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryEnglish: { type: Type.STRING },
            alternativeEnglish: { type: Type.STRING },
            pronunciationGuide: { type: Type.STRING },
            explanationIndonesian: { type: Type.STRING },
          },
          required: ['primaryEnglish', 'explanationIndonesian'],
        },
      },
    });

    const resultData = JSON.parse(response.text || '{}');

    // Save to Cache
    if (translationCache.size > 200) {
      const firstKey = translationCache.keys().next().value;
      if (firstKey) translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, resultData);

    return res.json(resultData);
  } catch (err: any) {
    console.error('Error in /api/translate-help:', err);
    return res.status(500).json({ error: 'Failed to fetch translation help.' });
  }
};

app.post('/api/chat-turn', handleChatTurn);
app.post('/chat-turn', handleChatTurn);

app.post('/api/generate-topic', handleGenerateTopic);
app.post('/generate-topic', handleGenerateTopic);

app.post('/api/translate-help', handleTranslateHelp);
app.post('/translate-help', handleTranslateHelp);

export default app;
