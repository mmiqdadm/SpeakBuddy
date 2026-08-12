import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

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

// In-Memory Translation Cache
const translationCache = new Map<string, any>();

// In-Memory Generated Topics Pool
const topicCache = new Map<string, any[]>();

// Endpoint: Process Chat Turn with Scoring and Evaluation
app.post('/api/chat-turn', async (req, res) => {
  try {
    const { userInput, difficulty = 'beginner', topic, history = [], isIndonesianHelp = false } = req.body;

    if (!userInput || typeof userInput !== 'string') {
      return res.status(400).json({ error: 'User input is required.' });
    }

    const difficultyPrompts: Record<string, string> = {
      starter: 'Use super simple, very short (2-5 words) A0-A1 English. Be extremely warm, cheerful, kid-friendly. Include parenthetical Indonesian translations for key tricky words.',
      beginner: 'Use simple, clear A1-A2 English with short sentences. Be enthusiastic, patient, and friendly. Ask simple follow-up questions.',
      intermediate: 'Use natural everyday B1 English with relaxed idioms, fun commentary, and moderate vocabulary. Keep dialogue flowing like real friends.',
      upper_intermediate: 'Use fluent B2 English with expressive phrasal verbs, humor, and rich natural expressions.',
      advanced: 'Use native-level C1-C2 idiomatic English with nuanced vocabulary, witty commentary, and deep engaging questions.',
    };

    const targetDifficultyInstruction = difficultyPrompts[difficulty] || difficultyPrompts.beginner;

    // Natural Best-Friend Persona Prompt (Endless Flowing Conversation)
    const systemInstruction = `
You are "Buddy", a warm, witty, and empathetic best friend having a casual English conversation with the user.

CONVERSATIONAL RULES FOR REAL FRIENDLIKE CHAT:
1. TALK LIKE A REAL CLOSE FRIEND: Never sound like a teacher, robot, or language instructor. React authentically to what the user says with emotion, humor, or shared experience (e.g. "Oh no way!", "Haha I completely agree!", "Wait, really? That's awesome!").
2. ENDLESS CONVERSATION FLOW: Always connect your reply directly to the exact details the user mentioned, share a mini thought or opinion of your own, and end with an intriguing, natural open-ended question that makes the user want to reply immediately.
3. NEVER USE ROBOTIC TEMPLATES: Avoid generic repetitive phrases like "That sounds wonderful! Let's keep practicing!" or "What else would you like to share?". Be spontaneous, creative, and genuine.
4. TARGET DIFFICULTY: ${targetDifficultyInstruction}
5. CURRENT TOPIC: ${topic?.title || 'Casual Chat'} (${topic?.description || 'Friendly chat'}).
6. INDONESIAN HELP & TRANSLATION: If the user asks in Indonesian or isIndonesianHelp=true, reply kindly in Indonesian first ("Dalam bahasa Inggris, kamu bisa bilang: '...'"), explain simply, then ask a friendly English question to continue.
7. REAL-TIME EVALUATION: Evaluate "${userInput}". Give estimated scores (0-100), badge label, constructive feedback, and gentle corrections explained in friendly, polite Indonesian.
`;

    const promptText = `
Recent Chat History:
${history.slice(-4).map((h: any) => `${h.sender === 'user' ? 'User' : 'Buddy'}: ${h.text}`).join('\n')}

Latest User Input: "${userInput}"
Difficulty Level: ${difficulty}
Is Indonesian Help Request: ${isIndonesianHelp}

Generates response strictly matching JSON schema.
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
              description: 'Buddy natural best-friend response in English (or friendly Indonesian explanation if asked for help).',
            },
            replyIndonesianTranslation: {
              type: Type.STRING,
              description: 'Indonesian summary/translation of Buddy reply.',
            },
            evaluation: {
              type: Type.OBJECT,
              properties: {
                pronunciationScore: { type: Type.INTEGER, description: 'Estimated score 0-100.' },
                grammarScore: { type: Type.INTEGER, description: 'Estimated score 0-100.' },
                fluencyScore: { type: Type.INTEGER, description: 'Estimated score 0-100.' },
                overallScore: { type: Type.INTEGER, description: 'Estimated overall score 0-100.' },
                badgeLabel: { type: Type.STRING, description: 'Short badge e.g. "⭐ Super Natural!", "🌟 Great Flow!"' },
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

    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'Rate limit reached. Please wait a few seconds before sending another message.',
      });
    }

    return res.status(500).json({
      error: err?.message || 'Failed to process conversation turn.',
      details: err?.message || 'Unknown error',
    });
  }
});

// Endpoint: Generate Random Custom Thematic Topic
app.post('/api/generate-topic', async (req, res) => {
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
Generate a fresh, engaging everyday conversation topic for English learners.
Seed: ${randomSeed}, Difficulty: ${difficulty}, Category: ${randomCategory}.
REQUIREMENTS: Casual life, NO roleplay scripts, warm intriguing initial message from Buddy asking a friendly question without self-introduction.
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

    if (!topicCache.has(difficulty)) topicCache.set(difficulty, []);
    const list = topicCache.get(difficulty)!;
    list.push(parsedTopic);

    return res.json(parsedTopic);
  } catch (err: any) {
    console.error('Error in /api/generate-topic:', err);
    const cachedList = topicCache.get(req.body?.difficulty || 'beginner') || [];
    if (cachedList.length > 0) {
      const pick = cachedList[Math.floor(Math.random() * cachedList.length)];
      return res.json(pick);
    }

    return res.status(500).json({ error: 'Failed to generate random topic.' });
  }
});

// Endpoint: Direct Translation / Sentence Builder Helper
app.post('/api/translate-help', async (req, res) => {
  try {
    const { textIndonesian, contextTopic = '' } = req.body;

    if (!textIndonesian) {
      return res.status(400).json({ error: 'Indonesian text is required.' });
    }

    const cacheKey = (textIndonesian as string).toLowerCase().trim();
    if (translationCache.has(cacheKey)) {
      return res.json(translationCache.get(cacheKey));
    }

    const prompt = `
Translate and explain in English: "${textIndonesian}".
Topic context: "${contextTopic}".
Provide primary natural English translation, casual alternative, phonetic guide, and brief Indonesian tip.
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
});

// Start Express Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpeakBuddy AI server running on http://localhost:${PORT}`);
  });
}

startServer();
