import React, {useState} from 'react';
import {Mic, MicOff, Send, ShieldCheck, Volume2, VolumeX} from 'lucide-react';
import type {ChatMessage, PeriodRecord, SupportedLanguage} from '../types/wellness';
import {
  SUPPORTED_LANGUAGES,
  UI_COPY,
  getOfflineAssistantResponse,
} from '../data/wellnessContent';
import {useSpeech} from '../hooks/useSpeech';
import {computeCycleStats, formatReadableDate} from '../utils/cycleMath';
import {createId} from '../db/rituDb';

interface VoiceAssistantPageProps {
  language: SupportedLanguage;
  isOnline: boolean;
  periods: PeriodRecord[];
  onChangeLanguage: (lang: SupportedLanguage) => void;
}

const TOPIC_CHIPS: Array<{label: string; topic: string; prompt: string}> = [
  {
    label: 'Period cramps',
    topic: 'Menstrual comfort',
    prompt: 'What helps soothe period cramps comfortably at home?',
  },
  {
    label: 'Cycle tracking',
    topic: 'Period tracking',
    prompt: 'What is a typical menstrual cycle length and when can cycles vary?',
  },
  {
    label: 'PCOS / PCOD',
    topic: 'PCOS and PCOD education',
    prompt: 'Can you explain the difference between PCOS and PCOD simply?',
  },
  {
    label: 'Balanced Indian diet',
    topic: 'Balanced diet',
    prompt: 'Suggest an easy Indian home meal for energy during periods.',
  },
  {
    label: 'Gentle activity',
    topic: 'Physical activities',
    prompt: 'Which gentle yoga poses or activities feel best during menstruation?',
  },
  {
    label: 'Period hygiene',
    topic: 'Period hygiene',
    prompt: 'How often should I change sanitary pads and dispose of them safely?',
  },
];

export const VoiceAssistantPage: React.FC<VoiceAssistantPageProps> = ({
  language,
  isOnline,
  periods,
  onChangeLanguage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      role: 'model',
      text: 'Namaste! I am RituSaathi Voice Assistant. Select your preferred language above — English, हिन्दी, తెలుగు, or اردو — and tap the microphone or type your question about periods, PCOS/PCOD, balanced Indian food, gentle activities, or menstrual hygiene.',
      language: 'en',
      disclaimer:
        'Educational support only — not a medical diagnosis or prescription.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('General women’s wellness');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [shareCycleSummary, setShareCycleSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const speech = useSpeech(language);
  const copy = UI_COPY[language];
  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) ?? SUPPORTED_LANGUAGES[0];

  const sendMessage = async (rawText: string, topicOverride?: string) => {
    const clean = rawText.trim();
    if (!clean || loading) return;

    setApiError(null);
    const activeTopic = topicOverride || selectedTopic;

    const userMsg: ChatMessage = {
      id: createId('msg'),
      role: 'user',
      text: clean,
      language,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    if (!isOnline) {
      const offline = getOfflineAssistantResponse(clean, language);
      const botMsg: ChatMessage = {
        id: createId('msg'),
        role: 'model',
        text: offline.reply,
        language,
        disclaimer: offline.disclaimer,
        isOfflineAnswer: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (autoSpeak) speech.speak(offline.reply, botMsg.id);
      return;
    }

    setLoading(true);
    try {
      let sharedContext = '';
      if (shareCycleSummary) {
        const stats = computeCycleStats(periods);
        if (stats.lastPeriod) {
          sharedContext = `Last period started ${formatReadableDate(stats.lastPeriod.startDate)}, average cycle length ${stats.averageCycleLength} days, recent mood: ${stats.lastPeriod.mood}.`;
        }
      }

      const historyPayload = messages
        .filter((m) => m.id !== 'welcome_msg')
        .slice(-6)
        .map((m) => ({role: m.role, text: m.text}));

      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          message: clean,
          language,
          topic: activeTopic,
          history: historyPayload,
          sharedContext,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not reach RituSaathi AI.');
      }

      const botMsg: ChatMessage = {
        id: createId('msg'),
        role: 'model',
        text: data.reply,
        language,
        disclaimer: data.disclaimer,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (autoSpeak) {
        speech.speak(data.reply, botMsg.id);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach Gemini right now.';
      setApiError(msg);
      const offline = getOfflineAssistantResponse(clean, language);
      const botMsg: ChatMessage = {
        id: createId('msg'),
        role: 'model',
        text: offline.reply,
        language,
        disclaimer: offline.disclaimer,
        isOfflineAnswer: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Language Switcher */}
      <section className="rounded-3xl border border-[#E6DDF0] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium text-[#6D28D9]">
              Multilingual Gemini Voice Companion · {isOnline ? 'Live AI ready' : 'Offline guide active'}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-[#221830]">
              RituSaathi Voice Assistant
            </h1>
            <p className="mt-1 text-sm text-[#524366]">
              Speak or type comfortably in English, Hindi, Telugu, or Urdu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap gap-1 rounded-xl bg-[#F3EEF9] p-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    speech.stopSpeaking();
                    onChangeLanguage(lang.code);
                  }}
                  className={`min-h-[40px] rounded-lg px-3.5 text-xs font-semibold transition-colors ${
                    language === lang.code
                      ? 'bg-[#6D28D9] text-white shadow-xs'
                      : 'text-[#4C1D95] hover:bg-white/70'
                  }`}
                >
                  {lang.nativeName} · {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voice Controls & Privacy Opt-In */}
        <div className="mt-5 flex flex-col gap-3 border-t border-[#F0E9F7] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#524366]">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="h-4 w-4 rounded accent-[#6D28D9]"
              />
              <span>Speak replies automatically</span>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={shareCycleSummary}
                onChange={(e) => setShareCycleSummary(e.target.checked)}
                className="h-4 w-4 rounded accent-[#6D28D9]"
              />
              <ShieldCheck className="h-3.5 w-3.5 text-[#6D28D9]" />
              <span>Share latest cycle summary with AI (optional)</span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              setInput(langMeta.samplePrompt);
            }}
            className="text-left text-xs font-medium text-[#6D28D9] hover:underline"
          >
            Try sample prompt in {langMeta.nativeName}
          </button>
        </div>
      </section>

      {/* Offline / Capability Notices */}
      {!isOnline && (
        <div className="rounded-2xl border border-[#F5D0FE] bg-[#FDF4FF] px-4 py-3 text-xs text-[#6B21A8]">
          {copy.offlineLiveNotice}
        </div>
      )}

      {language !== 'en' && !speech.hasExactLanguageVoice && speech.ttsSupported && (
        <div className="rounded-2xl border border-[#E6DDF0] bg-white px-4 py-3 text-xs text-[#524366]">
          Note: Your browser/OS may not have an installed {langMeta.name} voice pack for audio
          playback. Full {langMeta.nativeName} text answers always appear below.
        </div>
      )}

      {(speech.speechError || apiError) && (
        <div className="rounded-2xl border border-[#FECDD3] bg-[#FFF1F2] px-4 py-3 text-xs font-medium text-[#9F1239]">
          {speech.speechError || apiError}
        </div>
      )}

      {/* Topic Shortcuts */}
      <div className="flex flex-wrap gap-2">
        {TOPIC_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => {
              setSelectedTopic(chip.topic);
              void sendMessage(chip.prompt, chip.topic);
            }}
            className="min-h-[38px] rounded-xl border border-[#DFD4EE] bg-white px-3.5 py-1.5 text-xs font-medium text-[#4C1D95] transition-colors hover:bg-[#F5F3FF]"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Conversation Transcript */}
      <section className="rounded-3xl border border-[#E6DDF0] bg-white p-4 sm:p-6">
        <div className="max-h-[460px] space-y-4 overflow-y-auto pr-1">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const msgDir =
              SUPPORTED_LANGUAGES.find((l) => l.code === msg.language)?.dir ?? 'ltr';
            const isThisSpeaking = speech.isSpeaking && speech.speakingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  dir={msgDir}
                  className={`max-w-[88%] rounded-2xl px-4 py-3.5 sm:max-w-[78%] ${
                    isUser
                      ? 'bg-[#6D28D9] text-white'
                      : 'border border-[#E6DDF0] bg-[#FAF8FC] text-[#221830]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`text-[11px] font-medium ${
                        isUser ? 'text-white/80' : 'text-[#6D28D9]'
                      }`}
                    >
                      {isUser
                        ? 'You'
                        : msg.isOfflineAnswer
                          ? 'RituSaathi · Offline guide'
                          : 'RituSaathi · Gemini AI'}
                    </span>

                    {!isUser && (
                      <button
                        type="button"
                        onClick={() =>
                          isThisSpeaking
                            ? speech.stopSpeaking()
                            : speech.speak(msg.text, msg.id)
                        }
                        className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-[#E6DDF0] bg-white px-2.5 text-[11px] font-medium text-[#4C1D95] hover:bg-[#F3EEF9]"
                      >
                        {isThisSpeaking ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5" />
                            <span>{copy.stopLabel}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>{copy.listenLabel}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>

                  {msg.disclaimer && (
                    <p
                      className={`mt-2 border-t pt-2 text-[11px] ${
                        isUser
                          ? 'border-white/20 text-white/75'
                          : 'border-[#E6DDF0] text-[#6B5B7E]'
                      }`}
                    >
                      {msg.disclaimer}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-[#E6DDF0] bg-[#FAF8FC] px-4 py-3 text-xs text-[#6B5B7E]">
                RituSaathi is preparing a calm, clear answer...
              </div>
            </div>
          )}
        </div>

        {/* Voice Microphone & Text Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
          className="mt-5 flex flex-col gap-2.5 border-t border-[#F0E9F7] pt-4 sm:flex-row sm:items-center"
        >
          <button
            type="button"
            onClick={() => {
              if (speech.isListening) {
                speech.stopListening();
              } else {
                speech.startListening((transcript, isFinal) => {
                  setInput(transcript);
                  if (isFinal) {
                    void sendMessage(transcript);
                  }
                });
              }
            }}
            aria-label={speech.isListening ? 'Stop voice input' : 'Start voice input'}
            className={`inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${
              speech.isListening
                ? 'bg-[#DB2777] text-white'
                : 'border border-[#DFD4EE] bg-[#F5F3FF] text-[#5B21B6] hover:bg-[#EDE9FE]'
            }`}
          >
            {speech.isListening ? (
              <>
                <MicOff className="h-5 w-5" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                <span>Speak ({langMeta.nativeName})</span>
              </>
            )}
          </button>

          <input
            type="text"
            dir={langMeta.dir}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={copy.voicePlaceholder}
            className="flex-1 min-h-[48px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-4 text-sm text-[#221830] placeholder:text-[#8E7EA3] focus:border-[#6D28D9] focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-5 text-sm font-semibold text-white hover:bg-[#5B21B6] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </section>
    </div>
  );
};
