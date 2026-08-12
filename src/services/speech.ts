import { VoiceSpeed, VoiceProfile } from '../types';
import { VOICE_PROFILES } from '../data/voiceProfiles';

/**
 * Preload speech synthesis voices early so there is no audio delay when user clicks speak.
 */
export function preloadVoices(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }
}

export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\*\_\~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Enhanced Speech Synthesis with dynamic pitch & rate inflection
 * for warm, expressive, and natural conversational cadence.
 */
export function speakText(
  text: string,
  speed: VoiceSpeed = 'normal',
  voiceProfileOrId?: VoiceProfile | string,
  onEnd?: () => void
) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const profile: VoiceProfile = typeof voiceProfileOrId === 'string'
    ? (VOICE_PROFILES.find((p) => p.id === voiceProfileOrId) || VOICE_PROFILES[0])
    : (voiceProfileOrId || VOICE_PROFILES[0]);

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = profile.langCode || 'en-US';

  // Speed multiplier
  let rateMultiplier = 1.0;
  if (speed === 'slow') rateMultiplier = 0.78;
  else if (speed === 'fast') rateMultiplier = 1.22;

  let baseRate = (profile.rate || 1.0) * rateMultiplier;
  let basePitch = profile.pitch || 1.1;

  // --- Dynamic Expressiveness & Emotion Tone Tuning ---
  const isExcited =
    cleanText.includes('!') ||
    /\b(great|awesome|wow|amazing|wonderful|congratulations|haha|super|fantastic|yay|hooray|love|perfect)\b/i.test(cleanText);
  const isQuestion = cleanText.includes('?');
  const isThoughtful = /\b(well|hmmm|let's see|actually|maybe|probably|i think)\b/i.test(cleanText);

  if (isExcited) {
    basePitch += 0.12; // Brighter, energetic pitch
    baseRate *= 1.03;  // Slightly faster enthusiasm
  } else if (isQuestion) {
    basePitch += 0.08; // End-of-sentence question inflection
  } else if (isThoughtful) {
    basePitch -= 0.04; // Calmer, thoughtful tone
    baseRate *= 0.94;
  }

  // Ensure safe boundaries for Web Speech API
  utterance.pitch = Math.min(1.5, Math.max(0.7, basePitch));
  utterance.rate = Math.min(1.4, Math.max(0.65, baseRate));

  // --- Intelligent Natural Voice Matcher ---
  const voices = window.speechSynthesis.getVoices();

  if (voices.length > 0) {
    const langPrefix = profile.langCode.toLowerCase().split('-')[0]; // 'en'

    // Priority keywords for natural/premium browser TTS voices
    const premiumQualityKeywords = [
      'natural',
      'google',
      'samantha',
      'neural',
      'premium',
      'enhanced',
      'alex',
      'daniel',
      'karen',
      'serena',
      'zira',
      'david',
    ];

    // 1. Try matching language + quality keyword + user keywords
    let bestVoice = voices.find((v) => {
      const matchLang = v.lang.toLowerCase().replace('_', '-').startsWith(profile.langCode.toLowerCase());
      const matchProfileKw = profile.keywords.some((kw) => v.name.toLowerCase().includes(kw.toLowerCase()));
      const matchQuality = premiumQualityKeywords.some((pq) => v.name.toLowerCase().includes(pq));
      return matchLang && (matchProfileKw || matchQuality);
    });

    // 2. Fallback to any voice matching exact language code (e.g. 'en-US', 'en-GB')
    if (!bestVoice) {
      bestVoice = voices.find((v) =>
        v.lang.toLowerCase().replace('_', '-').startsWith(profile.langCode.toLowerCase())
      );
    }

    // 3. Fallback to any natural English voice
    if (!bestVoice) {
      bestVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(langPrefix) &&
        premiumQualityKeywords.some((pq) => v.name.toLowerCase().includes(pq))
      );
    }

    // 4. Any English voice
    if (!bestVoice) {
      bestVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
    }
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Browser Speech Recognition Helper
export function createSpeechRecognition(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void,
  language: string = 'en-US'
) {
  const SpeechRecognitionClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    return null;
  }

  const recognition = new SpeechRecognitionClass();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = language;

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript, true);
    } else if (interimTranscript) {
      onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (event: any) => {
    onError(event.error || 'Speech recognition error');
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
