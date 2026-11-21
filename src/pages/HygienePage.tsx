import React, {useState} from 'react';
import {ChevronDown, ChevronUp, Droplets, Mic, MicOff, Send, Volume2, VolumeX} from 'lucide-react';
import {
  HYGIENE_CONTENT,
  SUPPORTED_LANGUAGES,
  UI_COPY,
  getOfflineAssistantResponse,
} from '../data/wellnessContent';
import type {SupportedLanguage} from '../types/wellness';
import {useSpeech} from '../hooks/useSpeech';
import {WellnessImage} from '../components/RituLogo';

interface HygienePageProps {
  language: SupportedLanguage;
  isOnline: boolean;
  onChangeLanguage: (lang: SupportedLanguage) => void;
}

const QUICK_HYGIENE_QUESTIONS: Record<SupportedLanguage, string[]> = {
  en: [
    'How often should I change my sanitary pad?',
    'Is it safe to use scented washes during periods?',
    'How do I dispose of sanitary pads safely?',
  ],
  hi: [
    'सैनिटरी पैड कितनी देर में बदलना चाहिए?',
    'पीरियड्स में सफाई कैसे रखें?',
    'इस्तेमाल किए हुए पैड को सुरक्षित कैसे फेंकें?',
  ],
  te: [
    'శానిటరీ ప్యాడ్ ఎన్ని గంటలకు మార్చాలి?',
    'పీరియడ్స్ సమయంలో శుభ్రత ఎలా పాటించాలి?',
    'వాడిన ప్యాడ్‌ను సురక్షితంగా ఎలా పారవేయాలి?',
  ],
  ur: [
    'سینیٹری پیڈ کتنی دیر میں بدلنا چاہیے؟',
    'ماہواری کے دوران صفائی کا خیال کیسے رکھیں؟',
    'استعمال شدہ پیڈ کو محفوظ طریقے سے کیسے ٹھکانے لگائیں؟',
  ],
};

export const HygienePage: React.FC<HygienePageProps> = ({
  language,
  isOnline,
  onChangeLanguage,
}) => {
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const speech = useSpeech(language);
  const copy = UI_COPY[language];
  const langDir = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.dir ?? 'ltr';

  const askHygieneQuestion = async (promptText: string) => {
    const clean = promptText.trim();
    if (!clean) return;
    setErrorMsg(null);
    setAskOpen(true);

    if (!isOnline) {
      const offline = getOfflineAssistantResponse(clean, language);
      setAnswer(offline.reply);
      setDisclaimer(offline.disclaimer);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          message: clean,
          language,
          topic: 'Period Hygiene Education',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not reach RituSaathi right now.');
      }
      setAnswer(data.reply);
      setDisclaimer(data.disclaimer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to fetch answer.';
      setErrorMsg(msg);
      const fallback = getOfflineAssistantResponse(clean, language);
      setAnswer(fallback.reply);
      setDisclaimer(fallback.disclaimer);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero + Dedicated Ask RituSaathi Button */}
      <section className="overflow-hidden rounded-3xl border border-[#E6DDF0] bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
            <div>
              <p className="text-xs font-medium text-[#9D174D]">
                Safe menstrual care &amp; myth-busting education
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-[#221830]">
                Period Hygiene Education
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#524366]">
                Clear, shame-free guidance on pad changing schedules, menstrual products, safe
                disposal, external washing, breathable underwear, and everyday myths vs facts.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setAskOpen(true)}
                className="inline-flex min-h-[48px] items-center gap-2.5 rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#5B21B6]"
              >
                <Mic className="h-4 w-4 shrink-0" />
                <span>Ask RituSaathi about Period Hygiene</span>
              </button>

              <div className="inline-flex items-center gap-1 rounded-xl bg-[#F3EEF9] p-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onChangeLanguage(lang.code)}
                    className={`min-h-[36px] rounded-lg px-2.5 text-xs font-medium transition-colors ${
                      language === lang.code
                        ? 'bg-white text-[#6D28D9] shadow-xs'
                        : 'text-[#524366] hover:text-[#221830]'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-h-[220px] border-t border-[#E6DDF0] lg:col-span-5 lg:border-t-0 lg:border-l">
            <WellnessImage
              src="/src/assets/images/ritusaathi_hygiene_care_1795252247408.jpg"
              alt="Clean folded cotton cloths, herbal tea, and lavender for comfortable period hygiene"
              fallbackTitle="Menstrual Hygiene Care"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Interactive Hygiene Voice & Text Q&A Panel */}
      {askOpen && (
        <section
          aria-label="Ask RituSaathi about Period Hygiene"
          className="rounded-2xl border border-[#C4B5FD] bg-[#FAF5FF] p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#4C1D95]">
              <Droplets className="h-5 w-5" />
              <h2 className="font-display text-xl font-semibold">
                Ask RituSaathi about Period Hygiene
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setAskOpen(false)}
              className="text-xs font-medium text-[#6B5B7E] hover:text-[#221830]"
            >
              Minimize
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_HYGIENE_QUESTIONS[language].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQuestion(q);
                  void askHygieneQuestion(q);
                }}
                className="min-h-[36px] rounded-xl border border-[#DFD4EE] bg-white px-3 py-1.5 text-xs font-medium text-[#4C1D95] hover:bg-[#F3EEF9]"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void askHygieneQuestion(question);
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="text"
              dir={langDir}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={copy.voicePlaceholder}
              className="flex-1 min-h-[46px] rounded-xl border border-[#DFD4EE] bg-white px-4 text-sm text-[#221830] focus:border-[#6D28D9] focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (speech.isListening) {
                    speech.stopListening();
                  } else {
                    speech.startListening((txt, isFinal) => {
                      setQuestion(txt);
                      if (isFinal) void askHygieneQuestion(txt);
                    });
                  }
                }}
                className={`inline-flex min-h-[46px] items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors ${
                  speech.isListening
                    ? 'bg-[#DB2777] text-white'
                    : 'border border-[#DFD4EE] bg-white text-[#4C1D95] hover:bg-[#F3EEF9]'
                }`}
              >
                {speech.isListening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    <span>Speak</span>
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#6D28D9] px-5 text-sm font-medium text-white hover:bg-[#5B21B6] disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Thinking...' : 'Ask'}</span>
              </button>
            </div>
          </form>

          {(speech.speechError || errorMsg) && (
            <p className="rounded-xl border border-[#FBCFE8] bg-white px-3.5 py-2.5 text-xs text-[#9D174D]">
              {speech.speechError || errorMsg}
            </p>
          )}

          {answer && (
            <div
              dir={langDir}
              className="rounded-2xl border border-[#E6DDF0] bg-white p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-[#6D28D9]">
                  RituSaathi · {isOnline ? 'Gemini Response' : 'Offline Guide'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    speech.isSpeaking ? speech.stopSpeaking() : speech.speak(answer, 'hygiene')
                  }
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#E6DDF0] px-3 text-xs font-medium text-[#4C1D95] hover:bg-[#F5F0FC]"
                >
                  {speech.isSpeaking ? (
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
              </div>
              <p className="text-sm leading-relaxed text-[#221830] whitespace-pre-line">{answer}</p>
              {disclaimer && <p className="text-xs text-[#6B5B7E]">{disclaimer}</p>}
            </div>
          )}
        </section>
      )}

      {/* Core Hygiene Essentials */}
      <section>
        <h2 className="font-display text-xl font-semibold text-[#221830]">
          5 essential habits for period hygiene
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {HYGIENE_CONTENT.essentials.map((item, index) => (
            <div key={item.title} className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
              <p className="text-xs font-semibold text-[#6D28D9] tabular-nums">
                0{index + 1}. Hygiene essential
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold text-[#221830]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#524366]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menstrual Product Guide */}
      <section className="rounded-2xl border border-[#E6DDF0] bg-white p-6">
        <h2 className="font-display text-xl font-semibold text-[#221830]">
          Menstrual product education
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HYGIENE_CONTENT.products.map((prod) => (
            <div key={prod.name} className="rounded-xl border border-[#F0E9F7] bg-[#FAF8FC] p-4">
              <h3 className="text-sm font-semibold text-[#221830]">{prod.name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#524366]">{prod.guidance}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Myths vs Facts + FAQs */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-7">
          <h2 className="font-display text-xl font-semibold text-[#221830]">
            Common myths &amp; medical facts
          </h2>
          <div className="mt-4 divide-y divide-[#F0E9F7]">
            {HYGIENE_CONTENT.mythsAndFacts.map((row) => (
              <div key={row.myth} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                <p className="text-xs font-semibold text-[#9D174D]">Myth: {row.myth}</p>
                <p className="text-sm text-[#221830]">
                  <span className="font-semibold text-[#6D28D9]">Fact: </span>
                  {row.fact}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-5">
          <h2 className="font-display text-xl font-semibold text-[#221830]">Hygiene FAQs</h2>
          <div className="mt-4 divide-y divide-[#F0E9F7]">
            {HYGIENE_CONTENT.faqs.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <div key={faq.q} className="py-3 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="flex w-full min-h-[44px] items-center justify-between gap-3 text-left text-sm font-semibold text-[#221830]"
                  >
                    <span>{faq.q}</span>
                    {open ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-[#6D28D9]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#6B5B7E]" />
                    )}
                  </button>
                  {open && <p className="mt-2 text-sm text-[#524366]">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
