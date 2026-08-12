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

const handleChatTurn = async (req: express.Request, res: express.Response) => {
  try {
    const { userInput, difficulty = 'beginner', topic, history = [], isIndonesianHelp = false } = req.body;

    if (!userInput || typeof userInput !== 'string') {
      return res.status(400).json({ error: 'User input is required.' });
    }

    const difficultyPrompts: Record<string, string> = {
      starter: 'Use super simple, very short (2-4 words) English sentences (A0-A1 level). Be extremely cheerful, patient, kid-friendly, and supportive! Provide parenthetical Indonesian translations for key words so absolute beginners and kids easily understand.',
      beginner: 'Use simple, clear English with short sentences (A1-A2 level). Be extremely cheerful, patient, and encouraging! Include gentle hints when useful.',
      intermediate: 'Use natural everyday English (B1 level) with friendly conversational idioms and moderate vocabulary. Keep the flow relaxed and engaging.',
      upper_intermediate: 'Use fluent, expressive, idiomatic English (B2 level) with natural phrasal verbs, richer vocabulary, and smooth transitions.',
      advanced: 'Use native-level, expressive, nuanced, and fast-paced idiomatic English (C1-C2 level) with sophisticated vocabulary.',
    };

    const targetDifficultyInstruction = difficultyPrompts[difficulty] || difficultyPrompts.beginner;

    const systemInstruction = `
You are "Buddy", a warm, empathetic, and cheerful AI conversational language partner designed to help users (including children and beginners) practice speaking English casually.

CORE RULES FOR CONVERSATION:
1. TARGET DIFFICULTY LEVEL: ${targetDifficultyInstruction}
2. CURRENT CONVERSATION TOPIC: ${topic?.title || 'General Casual Chat'} (${topic?.description || 'Friendly chat'}).
3. NO SELF-INTRODUCTIONS: NEVER start messages with repetitive intros like "Hello, my name is Buddy" or "Halo! Namaku Buddy...". Directly answer and jump right into natural, friendly conversation!
4. FLOW FIRST PRINCIPLE: If the user speaks broken English or makes grammar errors, DO NOT break the conversational flow or criticize them in your reply. Respond smoothly and naturally as a true friend would, continuing the scenario.
5. INDONESIAN ASSISTANCE & TRANSLATION:
   - If the user asks a question in Indonesian (e.g. "gimana ngomong...", "artinya apa...", "bahasa inggrisnya..."), or if isIndonesianHelp is true:
     - Answer their question kindly in friendly Indonesian first ("Dalam bahasa Inggris, kamu bisa bilang: '...'"), then pronounce/explain it in English, and follow up with a friendly question in English to keep practice going!
6. EVALUATION & SCORING MANDATE:
   - Evaluated sentence: "${userInput}".
   - Provide an automatic real-time evaluation with estimated Pronunciation, Grammar, and Fluency scores (0 to 100).
   - If user input is in Indonesian asking for translation, score their engagement high (e.g. 90+) and encourage them for asking!
   - Provide gentle, constructive corrections in the evaluation field without being punitive.
   - For corrections, write explanations in simple, polite Indonesian so beginners understand easily!
`;

    const promptText = `
Recent Conversation History:
${history.slice(-6).map((h: any) => `${h.sender === 'user' ? 'User' : 'Buddy'}: ${h.text}`).join('\n')}

Latest User Input: "${userInput}"
Difficulty: ${difficulty}
Is Indonesian Translation/Help Query: ${isIndonesianHelp}

Generates response strictly matching JSON schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Buddy natural conversational response in English (or friendly Indonesian explanation if user asked for translation).',
            },
            replyIndonesianTranslation: {
              type: Type.STRING,
              description: 'Indonesian translation/summary of Buddy reply so beginners and kids easily understand.',
            },
            evaluation: {
              type: Type.OBJECT,
              properties: {
                pronunciationScore: { type: Type.INTEGER, description: 'Estimated pronunciation clarity score (0-100).' },
                grammarScore: { type: Type.INTEGER, description: 'Grammar correctness score (0-100).' },
                fluencyScore: { type: Type.INTEGER, description: 'Natural expression and fluency score (0-100).' },
                overallScore: { type: Type.INTEGER, description: 'Combined overall score (0-100).' },
                badgeLabel: { type: Type.STRING, description: 'Short celebratory badge, e.g., "⭐ Super Natural!", "🌟 Great Effort!"' },
                feedbackSummary: { type: Type.STRING, description: 'Short positive feedback in English.' },
                feedbackIndonesian: { type: Type.STRING, description: 'Short encouraging feedback in Indonesian.' },
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
                  description: '1 or 2 alternative natural phrasing options.',
                },
                keyVocabularyUsed: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['pronunciationScore', 'grammarScore', 'fluencyScore', 'overallScore', 'badgeLabel', 'feedbackSummary', 'feedbackIndonesian', 'corrections', 'betterAlternatives'],
            },
            isTranslationHelpRequest: {
              type: Type.BOOLEAN,
              description: 'True if user asked for translation/help in Indonesian.',
            },
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
Generate a completely fresh, unique, and engaging everyday conversation topic for English learners.
Random seed: ${randomSeed}.
Target Difficulty Level: ${difficulty}.
Suggested Angle Category: ${randomCategory}.

REQUIREMENTS:
1. Topic must be realistic, everyday casual life (e.g., favorite snacks, opinions on cats vs dogs, morning routine, favorite shoes/bag, funny stories, coffee/tea preferences, weekend habits).
2. DO NOT use rigid roleplays or artificial script scenarios.
3. The initialMessage MUST BE an intriguing, warm question that directly engages the user in English.
4. CRITICAL: The initialMessage MUST NOT contain self-introductions like "Hello, my name is Buddy" or "Halo! Namaku Buddy...". Jump straight into the conversation question!

Return strict JSON matching schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: 'English title with emoji, e.g. Pizza Party 🍕' },
            titleIndonesian: { type: Type.STRING, description: 'Indonesian title, e.g. Pesta Pizza' },
            category: { type: Type.STRING, description: 'Topic category' },
            icon: { type: Type.STRING, description: 'Icon identifier name' },
            description: { type: Type.STRING, description: 'Fun description' },
            starterPrompt: { type: Type.STRING, description: 'System persona prompt for Buddy' },
            initialMessage: { type: Type.STRING, description: 'Buddy warm initial greeting' },
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
    return res.json(parsedTopic);
  } catch (err: any) {
    console.error('Error in /api/generate-topic:', err);
    return res.status(500).json({ error: 'Failed to generate random topic.' });
  }
};

const handleTranslateHelp = async (req: express.Request, res: express.Response) => {
  try {
    const { textIndonesian, contextTopic = '' } = req.body;

    if (!textIndonesian) {
      return res.status(400).json({ error: 'Indonesian text is required.' });
    }

    const prompt = `
The user is learning English and wants to know how to express this Indonesian thought in English: "${textIndonesian}".
Topic context: "${contextTopic}".

Provide 1-2 natural, polite English translations, phonetic pronunciation guide for difficult words, and simple usage tips in Indonesian.
Return JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryEnglish: { type: Type.STRING, description: 'Best natural English sentence' },
            alternativeEnglish: { type: Type.STRING, description: 'Casual/Alternative English sentence' },
            pronunciationGuide: { type: Type.STRING, description: 'How to pronounce key words simply' },
            explanationIndonesian: { type: Type.STRING, description: 'Brief tip in Indonesian' },
          },
          required: ['primaryEnglish', 'explanationIndonesian'],
        },
      },
    });

    return res.json(JSON.parse(response.text || '{}'));
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
