import {useCallback, useEffect, useRef, useState} from 'react';
import type {SupportedLanguage} from '../types/wellness';

const SPEECH_LOCALE: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ur: 'ur-IN',
};

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {transcript: string};
    };
  };
}

interface BrowserSpeechRecognitionErrorEvent {
  error: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function useSpeech(language: SupportedLanguage) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const sttSupported =
    typeof window !== 'undefined' &&
    Boolean(
      (window as unknown as {SpeechRecognition?: unknown}).SpeechRecognition ||
        (window as unknown as {webkitSpeechRecognition?: unknown}).webkitSpeechRecognition,
    );

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!ttsSupported) return;
    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, [ttsSupported]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (ttsSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [ttsSupported]);

  const matchingVoice = (() => {
    if (voices.length === 0) return null;
    const prefix = language === 'ur' ? ['ur', 'hi'] : [language];
    // Prefer exact regional match first (e.g., te-IN, hi-IN, ur-PK/ur-IN, en-IN)
    const exact = voices.find((v) => v.lang.toLowerCase() === SPEECH_LOCALE[language].toLowerCase());
    if (exact) return exact;
    for (const p of prefix) {
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(p));
      if (match && (language !== 'ur' || match.lang.toLowerCase().startsWith('ur'))) {
        return match;
      }
    }
    return null;
  })();

  const hasExactLanguageVoice = Boolean(
    voices.find((v) => v.lang.toLowerCase().startsWith(language)),
  );

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore stop errors if already ended
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    (onTranscript: (text: string, isFinal: boolean) => void) => {
      setSpeechError(null);
      if (!sttSupported) {
        setSpeechError(
          'Voice typing is not supported in this browser. Please type your question below — Chrome or Edge supports voice input.',
        );
        return;
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSpeechError(
          'Browser speech-to-text requires internet in most browsers. You can still type your question to get offline guidance.',
        );
        return;
      }

      const SpeechCtor =
        (window as unknown as {SpeechRecognition?: new () => BrowserSpeechRecognition})
          .SpeechRecognition ||
        (window as unknown as {webkitSpeechRecognition?: new () => BrowserSpeechRecognition})
          .webkitSpeechRecognition;

      if (!SpeechCtor) return;

      try {
        recognitionRef.current?.abort();
        const recognition = new SpeechCtor();
        recognition.lang = SPEECH_LOCALE[language];
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          let full = '';
          let finalFlag = false;
          for (let i = 0; i < event.results.length; i++) {
            full += event.results[i][0].transcript;
            if (event.results[i].isFinal) finalFlag = true;
          }
          onTranscript(full.trim(), finalFlag);
        };

        recognition.onerror = (event) => {
          setIsListening(false);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setSpeechError('Microphone access was blocked. Please allow microphone permission in your browser.');
          } else if (event.error === 'no-speech') {
            setSpeechError('No speech was heard. Tap the microphone and speak clearly.');
          } else if (event.error === 'language-not-supported') {
            setSpeechError(
              `Voice recognition for this language is not supported by your browser yet. You can type in ${language.toUpperCase()} or English below.`,
            );
          } else {
            setSpeechError('Could not capture voice right now. You can type your question anytime.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        setIsListening(true);
        recognition.start();
      } catch {
        setIsListening(false);
        setSpeechError('Unable to start microphone right now. Please type your question instead.');
      }
    },
    [language, sttSupported],
  );

  const stopSpeaking = useCallback(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingId(null);
  }, [ttsSupported]);

  const speak = useCallback(
    (text: string, id?: string) => {
      setSpeechError(null);
      if (!ttsSupported) {
        setSpeechError('Text-to-speech playback is not supported in this browser.');
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = SPEECH_LOCALE[language];
      utterance.rate = 0.96;

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      } else if (language !== 'en') {
        setSpeechError(
          `Your device does not have an installed ${
            language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'Urdu'
          } speech voice, so audio playback may fall back or stay silent. The full answer is shown in text.`,
        );
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingId(id ?? 'active');
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [language, matchingVoice, ttsSupported],
  );

  return {
    sttSupported,
    ttsSupported,
    hasExactLanguageVoice,
    isListening,
    isSpeaking,
    speakingId,
    speechError,
    setSpeechError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
