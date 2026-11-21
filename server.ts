import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {GoogleGenAI, Type} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

type SupportedLanguage = 'en' | 'hi' | 'te' | 'ur';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'Hindi (Devanagari script, warm everyday conversational Hindi)',
  te: 'Telugu (Telugu script, warm everyday conversational Telugu)',
  ur: 'Urdu (Urdu Perso-Arabic script, warm respectful everyday Urdu)',
};

const DISCLAIMERS: Record<SupportedLanguage, string> = {
  en: 'Educational wellness guidance only — not a medical diagnosis or prescription. Please consult a qualified doctor or gynecologist for concerning symptoms.',
  hi: 'यह केवल सामान्य स्वास्थ्य और जागरूकता जानकारी है, चिकित्सकीय निदान या दवा का नुस्खा नहीं। किसी गंभीर या लगातार समस्या के लिए कृपया डॉक्टर या स्त्री रोग विशेषज्ञ से सलाह लें।',
  te: 'ఇది కేవలం సాధారణ ఆరోగ్య అవగాహన సమాచారం మాత్రమే, వైద్య నిర్ధారణ లేదా మందుల సూచన కాదు. తీవ్రమైన లక్షణాలు ఉంటే దయచేసి డాక్టర్‌ను సంప్రదించండి.',
  ur: 'یہ صرف عمومی صحت اور آگاہی کی معلومات ہے، طبی تشخیص یا دوا کا نسخہ نہیں۔ کسی بھی تشویشناک علامت کے لیے براہِ کرم مستند ڈاکٹر یا ماہرِ امراضِ نسواں سے مشورہ کریں۔',
};

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function normalizeLanguage(lang: unknown): SupportedLanguage {
  if (lang === 'hi' || lang === 'te' || lang === 'ur' || lang === 'en') {
    return lang;
  }
  return 'en';
}

async function startServer() {
  const app = express();
  app.use(express.json({limit: '1mb'}));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      hasGeminiKey: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
      ),
    });
  });

  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const body = req.body ?? {};
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      const language = normalizeLanguage(body.language);
      const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 80) : 'general wellness';
      const sharedContext =
        typeof body.sharedContext === 'string' ? body.sharedContext.trim().slice(0, 1200) : '';
      const rawHistory = Array.isArray(body.history) ? body.history.slice(-8) : [];

      if (!message || message.length > 2000) {
        res.status(400).json({
          error: 'Please enter a question between 1 and 2000 characters.',
        });
        return;
      }

      const ai = getGeminiClient();

      const systemInstruction = [
        'You are RituSaathi, a warm, empathetic, culturally thoughtful Indian women’s health and wellness educator.',
        `Respond strictly in ${LANGUAGE_LABELS[language]}.`,
        'Use clear, gentle, accessible language suitable for both reading and spoken text-to-speech playback.',
        'Avoid markdown syntax like **, ##, or tables so your response reads and speaks naturally.',
        'Topics you support: period tracking, menstrual cycle comfort, period hygiene, PCOS and PCOD general education, balanced Indian home-cooked nutrition, and gentle movement or rest.',
        'STRICT SAFETY BOUNDARIES:',
        '1. Never diagnose PCOS, PCOD, endometriosis, thyroid disorders, anemia, or any medical condition.',
        '2. Never prescribe medications, supplements, dosages, or unverified herbal cures.',
        '3. Never recommend restrictive crash diets or weight-loss challenges.',
        '4. Clearly distinguish general educational information from personalized medical advice.',
        '5. If the user describes severe pelvic pain, soaking a pad every hour, fainting, fever, foul-smelling discharge, bleeding after menopause, or periods absent for over 90 days, warmly encourage seeing a doctor or gynecologist promptly.',
        '6. Keep answers concise (roughly 80 to 160 words) with clear short paragraphs or simple numbered points.',
      ].join('\n');

      const conversationParts = rawHistory
        .filter(
          (item: unknown): item is {role: 'user' | 'model'; text: string} =>
            Boolean(item) &&
            typeof item === 'object' &&
            ((item as {role?: unknown}).role === 'user' ||
              (item as {role?: unknown}).role === 'model') &&
            typeof (item as {text?: unknown}).text === 'string',
        )
        .map((item: {role: 'user' | 'model'; text: string}) => ({
          role: item.role,
          parts: [{text: item.text.slice(0, 1000)}],
        }));

      const contextBlock = sharedContext
        ? `\n[User-approved wellness summary shared for context]\n${sharedContext}\n`
        : '';

      const userPrompt = `Topic focus: ${topic}${contextBlock}\nQuestion: ${message}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          ...conversationParts,
          {role: 'user', parts: [{text: userPrompt}]},
        ],
        config: {
          systemInstruction,
        },
      });

      const replyText = (response.text ?? '').trim();
      if (!replyText) {
        res.status(502).json({
          error: 'RituSaathi could not generate a response right now. Please try asking again.',
        });
        return;
      }

      res.json({
        reply: replyText,
        language,
        disclaimer: DISCLAIMERS[language],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown server error';
      if (msg === 'GEMINI_API_KEY_MISSING') {
        res.status(503).json({
          error:
            'Gemini API key is not configured on the server yet. Please set GEMINI_API_KEY in Settings > Secrets, or switch to offline guidance.',
        });
        return;
      }
      console.error('Assistant API error:', msg);
      res.status(502).json({
        error: 'Unable to reach RituSaathi AI right now. Please check your connection and try again.',
      });
    }
  });

  app.post('/api/ai/diet-plan', async (req, res) => {
    try {
      const body = req.body ?? {};
      const preference =
        body.preference === 'non-vegetarian' || body.preference === 'eggetarian'
          ? body.preference
          : 'vegetarian';
      const goalFocus =
        typeof body.goalFocus === 'string' && body.goalFocus.trim()
          ? body.goalFocus.trim().slice(0, 120)
          : 'balanced energy and gentle hormone-friendly nutrition';
      const allergiesOrNotes =
        typeof body.allergiesOrNotes === 'string' ? body.allergiesOrNotes.trim().slice(0, 300) : '';
      const language = normalizeLanguage(body.language);

      const ai = getGeminiClient();

      const prompt = [
        `Create a gentle, practical 1-day Indian wellness meal plan in ${LANGUAGE_LABELS[language]}.`,
        `Dietary preference: ${preference}.`,
        `Wellness focus: ${goalFocus}.`,
        allergiesOrNotes ? `Preferences / foods to avoid: ${allergiesOrNotes}.` : '',
        'Use familiar, affordable Indian home foods such as idli, dosa, poha, upma, dal, roti, brown/hand-pounded rice, sabzi, curd/dahi, buttermilk, fresh seasonal fruits, sprouts, chana, paneer, eggs (if eggetarian/non-veg), and light fish/chicken curry (only if non-veg).',
        'Do NOT include restrictive diets, fasting challenges, weight-loss promises, or unverified medical/PCOS treatment claims.',
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are RituSaathi, an approachable Indian everyday nutrition educator. Focus on nourishment, iron/fiber/protein balance, hydration, and joy in home-cooked food. Never suggest extreme restrictions or medical cures.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              breakfast: {
                type: Type.OBJECT,
                properties: {
                  title: {type: Type.STRING},
                  suggestedTime: {type: Type.STRING},
                  items: {type: Type.ARRAY, items: {type: Type.STRING}},
                  benefitNote: {type: Type.STRING},
                },
                required: ['title', 'suggestedTime', 'items', 'benefitNote'],
              },
              lunch: {
                type: Type.OBJECT,
                properties: {
                  title: {type: Type.STRING},
                  suggestedTime: {type: Type.STRING},
                  items: {type: Type.ARRAY, items: {type: Type.STRING}},
                  benefitNote: {type: Type.STRING},
                },
                required: ['title', 'suggestedTime', 'items', 'benefitNote'],
              },
              eveningSnack: {
                type: Type.OBJECT,
                properties: {
                  title: {type: Type.STRING},
                  suggestedTime: {type: Type.STRING},
                  items: {type: Type.ARRAY, items: {type: Type.STRING}},
                  benefitNote: {type: Type.STRING},
                },
                required: ['title', 'suggestedTime', 'items', 'benefitNote'],
              },
              dinner: {
                type: Type.OBJECT,
                properties: {
                  title: {type: Type.STRING},
                  suggestedTime: {type: Type.STRING},
                  items: {type: Type.ARRAY, items: {type: Type.STRING}},
                  benefitNote: {type: Type.STRING},
                },
                required: ['title', 'suggestedTime', 'items', 'benefitNote'],
              },
              hydrationTip: {type: Type.STRING},
              gentleNote: {type: Type.STRING},
            },
            required: ['breakfast', 'lunch', 'eveningSnack', 'dinner', 'hydrationTip', 'gentleNote'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json({plan: parsed, language});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown server error';
      if (msg === 'GEMINI_API_KEY_MISSING') {
        res.status(503).json({
          error:
            'Gemini API key is not configured on the server yet. Please set GEMINI_API_KEY in Settings > Secrets, or choose from RituSaathi’s offline Indian meal ideas.',
        });
        return;
      }
      console.error('Diet planner API error:', msg);
      res.status(502).json({
        error: 'Unable to generate an AI meal plan right now. You can still browse and log offline meal ideas.',
      });
    }
  });

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  } else {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RituSaathi server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start RituSaathi server:', err);
  process.exit(1);
});
