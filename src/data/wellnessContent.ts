import type {AIDietPlan, SupportedLanguage} from '../types/wellness';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  samplePrompt: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    samplePrompt: 'How often should I change a sanitary pad?',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    dir: 'ltr',
    samplePrompt: 'पीरियड्स के दौरान पेट दर्द में क्या आरामदायक होता है?',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    dir: 'ltr',
    samplePrompt: 'పీరియడ్స్ సమయంలో ప్యాడ్ ఎన్ని గంటలకు మార్చాలి?',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    dir: 'rtl',
    samplePrompt: 'حیض کے دوران صفائی کا خیال کیسے رکھیں؟',
  },
];

export const UI_COPY: Record<
  SupportedLanguage,
  {
    welcomeTitle: string;
    tagline: string;
    offlineBanner: string;
    voicePlaceholder: string;
    listenLabel: string;
    stopLabel: string;
    askButton: string;
    offlineLiveNotice: string;
  }
> = {
  en: {
    welcomeTitle: 'Warm welcome to RituSaathi',
    tagline: 'Your Period & Wellness Companion.',
    offlineBanner: 'Offline mode — Your saved records and local wellness guides remain available.',
    voicePlaceholder: 'Ask about periods, PCOS/PCOD, Indian meals, gentle yoga, or hygiene...',
    listenLabel: 'Listen',
    stopLabel: 'Stop audio',
    askButton: 'Ask RituSaathi',
    offlineLiveNotice:
      'You are currently offline. Live Gemini responses require internet access — showing trusted educational guidance from RituSaathi’s local library.',
  },
  hi: {
    welcomeTitle: 'ऋतुसाथी में आपका स्वागत है',
    tagline: 'आपकी पीरियड्स और स्वास्थ्य साथी।',
    offlineBanner: 'ऑफ़लाइन मोड — आपके सहेजे गए रिकॉर्ड और स्थानीय जानकारी अभी भी उपलब्ध हैं।',
    voicePlaceholder: 'पीरियड्स, PCOS/PCOD, भारतीय भोजन, योग या स्वच्छता के बारे में पूछें...',
    listenLabel: 'सुनें',
    stopLabel: 'रोकें',
    askButton: 'ऋतुसाथी से पूछें',
    offlineLiveNotice:
      'आप अभी ऑफ़लाइन हैं। लाइव जेमिनी उत्तर के लिए इंटरनेट आवश्यक है — नीचे ऋतुसाथी की स्थानीय शैक्षिक जानकारी दी गई है।',
  },
  te: {
    welcomeTitle: 'ఋతుసాథికి స్వాగతం',
    tagline: 'మీ పీరియడ్స్ మరియు ఆరోగ్య నేస్తం.',
    offlineBanner: 'ఆఫ్‌లైన్ మోడ్ — మీరు సేవ్ చేసిన రికార్డులు మరియు స్థానిక గైడ్‌లు అందుబాటులో ఉన్నాయి.',
    voicePlaceholder: 'పీరియడ్స్, PCOS/PCOD, భారతీయ ఆహారం, యోగా లేదా శుభ్రత గురించి అడగండి...',
    listenLabel: 'వినండి',
    stopLabel: 'ఆపండి',
    askButton: 'ఋతుసాథిని అడగండి',
    offlineLiveNotice:
      'మీరు ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉన్నారు. లైవ్ జెమిని సమాధానాల కోసం ఇంటర్నెట్ అవసరం — స్థానిక విద్యాపరమైన మార్గదర్శకం క్రింద ఉంది.',
  },
  ur: {
    welcomeTitle: 'رتو ساتھی میں خوش آمدید',
    tagline: 'آپ کی ماہواری اور صحت کی ساتھی۔',
    offlineBanner: 'آف لائن موڈ — آپ کا محفوظ ریکارڈ اور مقامی رہنمائی ابھی بھی دستیاب ہے۔',
    voicePlaceholder: 'ماہواری، PCOS/PCOD، متوازن غذا، ہلکی ورزش یا صفائی کے بارے میں پوچھیں...',
    listenLabel: 'سنیں',
    stopLabel: 'روکیں',
    askButton: 'رتو ساتھی سے پوچھیں',
    offlineLiveNotice:
      'آپ اس وقت آف لائن ہیں۔ لائیو جیمنی جوابات کے لیے انٹرنیٹ ضروری ہے — نیچے مقامی تعلیمی رہنمائی موجود ہے۔',
  },
};

export const PCOS_CONTENT = {
  intro:
    'Polycystic Ovary Syndrome (PCOS) and Polycystic Ovarian Disease (PCOD) are common hormonal conditions affecting women of reproductive age. Understanding the difference helps you have calmer, better-informed conversations with a gynecologist.',
  comparison: [
    {
      title: 'What is PCOD?',
      summary:
        'PCOD (Polycystic Ovarian Disease) occurs when ovaries release immature or partially mature eggs over time, which can form small fluid-filled cysts and slightly enlarge the ovaries.',
      points: [
        'Very common and often responds well to steady lifestyle habits such as regular sleep, balanced meals, and gentle physical activity.',
        'Many women with PCOD have mildly irregular periods, fatigue, or mild hormonal acne.',
      ],
    },
    {
      title: 'What is PCOS?',
      summary:
        'PCOS (Polycystic Ovary Syndrome) is a broader endocrine and metabolic condition in which the ovaries produce higher-than-usual levels of androgens, affecting ovulation, insulin sensitivity, and cycle regularity.',
      points: [
        'Requires proper evaluation by a qualified doctor (often combining symptom history, blood tests, and ultrasound if advised).',
        'Long-term support focuses on metabolic health, emotional wellbeing, and individualized medical guidance.',
      ],
    },
  ],
  commonSymptoms: [
    'Irregular, delayed, or missed menstrual periods',
    'Heavier or unusually light bleeding when cycles arrive',
    'Excess facial or body hair growth (hirsutism) or scalp hair thinning',
    'Persistent acne along the jawline, cheeks, or back',
    'Low energy, afternoon fatigue, or mood fluctuations',
    'Difficulty conceiving due to irregular ovulation',
  ],
  dailyRoutines: [
    {
      time: 'Morning',
      habit: 'Wake at a consistent time, drink plain or warm water, and include protein + fiber at breakfast (such as idli with sambar, moong chilla, or eggs with roti).',
    },
    {
      time: 'Midday',
      habit: 'Have a balanced home meal with dal, seasonal sabzi, curd, and whole grains; take a relaxed 10-minute post-lunch stroll.',
    },
    {
      time: 'Evening',
      habit: '20–30 minutes of joyful movement you enjoy — walking, gentle yoga, stretches, or dancing — without harsh over-exercising.',
    },
    {
      time: 'Night',
      habit: 'Wind down screens 30 minutes before bed and aim for 7.5–8 hours of restful sleep to support natural hormone rhythms.',
    },
  ],
  faqs: [
    {
      q: 'Can an app or symptom checklist diagnose PCOS or PCOD?',
      a: 'No. Only a qualified healthcare professional (such as a gynecologist or endocrinologist) can diagnose PCOS or PCOD after reviewing your medical history, physical exam, and any advised lab or ultrasound tests.',
    },
    {
      q: 'Do I need to follow a strict diet or give up rice and rotis?',
      a: 'No. Sustainable Indian home food works wonderfully — pairing rice or roti with plenty of dal, vegetables, sprouts, curd, or paneer helps steady energy without extreme restrictions.',
    },
    {
      q: 'When should I consult a doctor promptly?',
      a: 'Consult a healthcare professional if your periods are absent for more than 3 months, cycles are consistently shorter than 21 days or longer than 35–40 days, you soak through a pad every 1–2 hours, or experience severe pain, dizziness, or sudden mood distress.',
    },
  ],
};

export const HYGIENE_CONTENT = {
  essentials: [
    {
      title: 'Change pads every 4 to 6 hours',
      detail:
        'Even on light-flow days, changing your sanitary pad every 4–6 hours keeps skin dry, prevents odor, and lowers the risk of rashes or bacterial irritation.',
    },
    {
      title: 'Wash hands before and after',
      detail:
        'Always wash your hands with soap and clean water before and after changing any menstrual product.',
    },
    {
      title: 'Gentle external intimate care',
      detail:
        'Rinse only the external genital area (vulva) with plain lukewarm water once or twice a day. Avoid perfumed soaps, vaginal washes, or douching — the vagina cleans itself naturally.',
    },
    {
      title: 'Wear clean, breathable cotton underwear',
      detail:
        'Soft cotton underwear allows airflow and reduces moisture buildup. Change underwear daily (or immediately if damp) and sun-dry thoroughly.',
    },
    {
      title: 'Safe, hygienic disposal',
      detail:
        'Wrap used disposable pads in newspaper or their wrapper and place them in a covered dustbin. Never flush pads down the toilet as they clog plumbing and harm sanitation workers.',
    },
  ],
  products: [
    {
      name: 'Disposable Sanitary Pads',
      guidance: 'Widely available and easy to use. Choose unscented, soft-top pads and change every 4–6 hours.',
    },
    {
      name: 'Reusable Cloth Pads',
      guidance: 'Eco-friendly when washed thoroughly with mild soap in clean water and dried completely in direct sunlight before reuse.',
    },
    {
      name: 'Menstrual Cups',
      guidance: 'Medical-grade silicone cup worn internally for 8–12 hours. Sterilize in boiling water for 5 minutes before and after each cycle.',
    },
    {
      name: 'Period Underwear',
      guidance: 'Washable absorbent briefs great for backup or light days. Rinse in cold water first, then wash cleanly and air dry.',
    },
  ],
  mythsAndFacts: [
    {
      myth: 'You should not wash your hair or bathe during periods.',
      fact: 'Bathing daily with warm water during periods keeps you clean, refreshes your body, and can actually soothe cramps.',
    },
    {
      myth: 'Period blood is dirty or impure.',
      fact: 'Menstruation is a natural, healthy shedding of the uterine lining — blood, mucus, and tissue — not toxic waste.',
    },
    {
      myth: 'Scented pads or intimate sprays are needed to stay fresh.',
      fact: 'Artificial fragrances often irritate sensitive skin and cause itching. Plain water and timely pad changes are safest.',
    },
    {
      myth: 'Using a menstrual cup is unsafe for unmarried women.',
      fact: 'Menstrual cups are safe for anyone who feels comfortable inserting them; choosing the right size and relaxing makes it easy.',
    },
  ],
  faqs: [
    {
      q: 'What if I notice redness or itching from pads?',
      a: 'Try switching to unscented, cotton-top pads, changing more frequently, and keeping the area dry. If itching, unusual white/green discharge, or burning persists, consult a doctor.',
    },
    {
      q: 'How should I manage hygiene at school, college, or work?',
      a: 'Keep a small zip pouch with 2–3 spare pads, a spare cotton panty, small paper bags/newspaper strips for wrapping, and pocket tissues or sanitizer.',
    },
  ],
};

export const OFFLINE_DIET_PLANS: Record<'vegetarian' | 'eggetarian' | 'non-vegetarian', AIDietPlan> = {
  vegetarian: {
    breakfast: {
      title: 'Warm Steamed Idli & Sambar',
      suggestedTime: '8:00 AM – 9:00 AM',
      items: [
        '3 soft steamed idlis with vegetable sambar',
        '1 tbsp fresh coconut-mint chutney',
        '4–5 soaked almonds & 1 small seasonal fruit',
      ],
      benefitNote: 'Fermented batter supports gentle gut comfort while dal in sambar adds steady morning protein.',
    },
    lunch: {
      title: 'Wholesome Dal, Sabzi & Curd Thali',
      suggestedTime: '1:00 PM – 2:00 PM',
      items: [
        '2 whole-wheat phulkas or 1 cup hand-pounded rice',
        '1 bowl yellow moong or masoor dal with jeera tempering',
        '1 bowl seasonal green sabzi (palak, bhindi, or lauki)',
        '1 small bowl fresh homemade curd with cucumber',
      ],
      benefitNote: 'Iron from greens paired with vitamin-rich veggies and probiotic curd nourishes steady afternoon energy.',
    },
    eveningSnack: {
      title: 'Sprouts Chaat & Warm Herbal Tea',
      suggestedTime: '4:30 PM – 5:30 PM',
      items: [
        '1 bowl lightly steamed moong sprouts with tomato, onion, pomegranate & lemon',
        '1 cup ginger-tulsi tea or roasted makhana',
      ],
      benefitNote: 'Plant protein and vitamin C from lemon help natural iron absorption.',
    },
    dinner: {
      title: 'Comforting Vegetable Khichdi or Paneer Dosa',
      suggestedTime: '7:30 PM – 8:30 PM',
      items: [
        'Moong dal & vegetable khichdi with 1 tsp ghee (or 2 crispy dosas with paneer bhurji)',
        'Light carrot-beetroot salad',
      ],
      benefitNote: 'Warm, light evening meals support comfortable digestion and restful sleep.',
    },
    hydrationTip: 'Sip 8–10 glasses of water across the day — include plain water, buttermilk (chaas), or warm ajwain/jeera water during cramps.',
    gentleNote: 'Offline balanced guide: adjust portions freely to your hunger and family kitchen.',
  },
  eggetarian: {
    breakfast: {
      title: 'Masala Omelette / Boiled Eggs & Poha',
      suggestedTime: '8:00 AM – 9:00 AM',
      items: [
        '2 boiled eggs or vegetable masala omelette',
        '1 small bowl vegetable poha with peanuts & curry leaves',
        '1 fresh orange or guava',
      ],
      benefitNote: 'Eggs provide high-quality protein and vitamin B12 to keep mid-morning tiredness away.',
    },
    lunch: {
      title: 'Rajma/Dal, Roti & Fresh Curd',
      suggestedTime: '1:00 PM – 2:00 PM',
      items: [
        '2 multigrain rotis or rice',
        '1 bowl rajma or toor dal',
        'Stir-fried beans or methi sabzi + 1 bowl curd',
      ],
      benefitNote: 'Balanced fiber and protein help keep blood sugar smooth through the afternoon.',
    },
    eveningSnack: {
      title: 'Roasted Chana & Fresh Fruit',
      suggestedTime: '5:00 PM',
      items: [
        'Handful of roasted chana with 1 banana or apple',
        '1 cup warm cardamom milk or herbal tea',
      ],
      benefitNote: 'Simple, portable snack rich in potassium and crunch.',
    },
    dinner: {
      title: 'Egg Bhurji, Roti & Warm Soup',
      suggestedTime: '8:00 PM',
      items: [
        '1–2 rotis with home-style egg bhurji or palak paneer',
        'Warm tomato-coriander soup',
      ],
      benefitNote: 'Nourishing and gentle before bedtime.',
    },
    hydrationTip: 'Keep a water bottle nearby and enjoy coconut water or chaas on warmer days.',
    gentleNote: 'Offline balanced guide: listen to your appetite and comfort.',
  },
  'non-vegetarian': {
    breakfast: {
      title: 'Dosa with Egg Curry or Paneer',
      suggestedTime: '8:30 AM',
      items: [
        '2 crisp ragi or rice dosas with light sambar',
        '1 boiled egg or 50g grilled paneer',
        'Sliced papaya or pomegranate',
      ],
      benefitNote: 'Combines comforting South Indian carbs with satisfying protein.',
    },
    lunch: {
      title: 'Home-Style Fish/Chicken Curry & Rice',
      suggestedTime: '1:30 PM',
      items: [
        '1 cup steamed rice or 2 rotis',
        'Light home-cooked fish curry or chicken stew with minimal oil',
        '1 bowl cucumber-onion kachumber & vegetable poriyal',
      ],
      benefitNote: 'Fish offers omega-3s that naturally support comfort during cycles.',
    },
    eveningSnack: {
      title: 'Moong Sprouts & Buttermilk',
      suggestedTime: '5:00 PM',
      items: [
        '1 cup fresh sprouts salad with lemon',
        '1 glass spiced buttermilk (chaas) with mint',
      ],
      benefitNote: 'Cooling hydration plus crisp fiber.',
    },
    dinner: {
      title: 'Dal Tadka, Roti & Stir-Fried Veggies',
      suggestedTime: '8:00 PM',
      items: [
        '2 soft phulkas with yellow dal tadka',
        'Lightly sauteed paneer or seasonal vegetables',
      ],
      benefitNote: 'Keeping dinner lighter and plant-forward aids restful overnight recovery.',
    },
    hydrationTip: 'Aim for steady sips of water every 1–2 hours rather than chugging all at once.',
    gentleNote: 'Offline balanced guide: never skip meals during menstruation when your body needs warmth and iron.',
  },
};

export const ACTIVITY_GUIDES = [
  {
    type: 'walking' as const,
    title: 'Mindful Walking',
    duration: '15–30 min',
    bestFor: 'Energy, PCOS lifestyle support & gentle mood lift',
    description: 'An easy, unhurried walk outdoors or on your terrace. No step-count pressure — move at a pace where you can talk comfortably.',
  },
  {
    type: 'yoga' as const,
    title: 'Restorative Yoga',
    duration: '15–20 min',
    bestFor: 'Cramp comfort & pelvic relaxation',
    description: 'Gentle poses such as Baddha Konasana (Butterfly), Balasana (Child’s Pose), and Marjaryasana (Cat-Cow) with slow belly breathing.',
  },
  {
    type: 'stretching' as const,
    title: 'Gentle Stretching',
    duration: '10–15 min',
    bestFor: 'Lower back stiffness & desk fatigue',
    description: 'Soft neck rolls, seated side bends, and hamstring stretches to release tension held in the back and hips.',
  },
  {
    type: 'dancing' as const,
    title: 'Joyful Free Dancing',
    duration: '15–25 min',
    bestFor: 'Stress relief & uplifting endorphins',
    description: 'Put on 3–4 favorite songs in your room and move freely for joy, not calories.',
  },
  {
    type: 'relaxation' as const,
    title: 'Pranayama & Calm Breathing',
    duration: '10 min',
    bestFor: 'PMS sensitivity, anxiety & better sleep',
    description: 'Anulom Vilom or 4-6 slow breathing (inhale 4 seconds, exhale 6 seconds) to calm the nervous system.',
  },
  {
    type: 'rest' as const,
    title: 'Rest & Recovery Day',
    duration: '20–30 min',
    bestFor: 'Heavy flow days & deep fatigue',
    description: 'Permission to pause! Warm heating pad on the lower belly, legs elevated on a pillow, and quiet rest counts as wellness.',
  },
];

export function getOfflineAssistantResponse(
  query: string,
  language: SupportedLanguage,
): {reply: string; disclaimer: string} {
  const q = query.toLowerCase();

  const disclaimers: Record<SupportedLanguage, string> = {
    en: 'Offline educational guide — not a medical diagnosis. Consult a doctor for severe or unusual symptoms.',
    hi: 'ऑफ़लाइन शैक्षिक जानकारी — यह चिकित्सकीय निदान नहीं है। गंभीर लक्षणों के लिए डॉक्टर से मिलें।',
    te: 'ఆఫ్‌లైన్ విద్యా సమాచారం — ఇది వైద్య నిర్ధారణ కాదు. తీవ్రమైన లక్షణాలకు డాక్టర్‌ను కలవండి.',
    ur: 'آف لائن تعلیمی رہنمائی — یہ طبی تشخیص نہیں ہے۔ شدید علامات کے لیے ڈاکٹر سے مشورہ کریں۔',
  };

  const isHygiene =
    q.includes('pad') ||
    q.includes('hygiene') ||
    q.includes('wash') ||
    q.includes('clean') ||
    q.includes('cup') ||
    q.includes('पैड') ||
    q.includes('स्वच्छ') ||
    q.includes('صفائی') ||
    q.includes('پیاڈ') ||
    q.includes('ప్యాడ్') ||
    q.includes('శుభ్ర');

  const isCramp =
    q.includes('pain') ||
    q.includes('cramp') ||
    q.includes('stomach') ||
    q.includes('दर्द') ||
    q.includes('درد') ||
    q.includes('నొప్పి');

  const isPcos = q.includes('pcos') || q.includes('pcod') || q.includes('irregular') || q.includes('अनियमित');

  const isDiet =
    q.includes('diet') ||
    q.includes('food') ||
    q.includes('eat') ||
    q.includes('meal') ||
    q.includes('भोजन') ||
    q.includes('खाना') ||
    q.includes('ఆహారం') ||
    q.includes('غذا');

  if (language === 'hi') {
    if (isHygiene) {
      return {
        reply:
          'पीरियड्स के दौरान हर 4 से 6 घंटे में सैनिटरी पैड बदलना सबसे अच्छा होता है, चाहे प्रवाह हल्का ही क्यों न हो। पैड बदलने से पहले और बाद में साबुन से हाथ धोएं। बाहरी हिस्से को केवल गुनगुने या सादे पानी से धोएं, खुशबूदार साबुन का उपयोग न करें। इस्तेमाल किए गए पैड को कागज़ में लपेटकर ढक्कन वाले कूड़ेदान में डालें, टॉयलेट में न बहाएं।',
        disclaimer: disclaimers.hi,
      };
    }
    if (isCramp) {
      return {
        reply:
          'हल्के पीरियड दर्द में पेट के निचले हिस्से पर गुनगुनी पानी की थैली रखना, अदरक या अजवाइन का गुनगुना पानी पीना, और बटरफ्लाई या चाइल्ड पोज़ जैसी हल्की स्ट्रेचिंग मदद कर सकती है। यदि दर्द बहुत तेज हो या रोज़मर्रा के काम रोक दे, तो कृपया डॉक्टर से सलाह लें।',
        disclaimer: disclaimers.hi,
      };
    }
    if (isPcos) {
      return {
        reply:
          'PCOS और PCOD हार्मोन से जुड़ी सामान्य स्थितियां हैं, जिनकी सही पहचान केवल डॉक्टर ही जांच के बाद कर सकते हैं। नियमित नींद, घर का संतुलित भोजन (दाल, सब्ज़ी, दही, अंकुरित अनाज) और रोज़ाना 20–30 मिनट हल्की वॉक या योग सहायक होते हैं। यदि पीरियड्स 3 महीने से अधिक समय तक न आएं तो स्त्री रोग विशेषज्ञ से मिलें।',
        disclaimer: disclaimers.hi,
      };
    }
    if (isDiet) {
      return {
        reply:
          'संतुलित भारतीय भोजन सबसे अच्छा रहता है: सुबह इडली-सांभर या मूंग चीला, दोपहर में दाल, रोटी, हरी सब्ज़ी और दही, शाम को अंकुरित मूंग या फल, और रात में हल्की खिचड़ी। दिन भर पर्याप्त पानी पिएं और किसी भी सख्त डाइट से बचें।',
        disclaimer: disclaimers.hi,
      };
    }
    return {
      reply:
        'आप अभी ऑफ़लाइन हैं, लेकिन आप अपने पीरियड रिकॉर्ड, कैलेंडर, भोजन और व्यायाम को सुरक्षित रूप से देख और जोड़ सकती हैं। हर 4–6 घंटे में पैड बदलें, पर्याप्त पानी पिएं और आराम को प्राथमिकता दें। इंटरनेट जुड़ने पर ऋतुसाथी AI आपके हर सवाल का लाइव उत्तर देगा।',
      disclaimer: disclaimers.hi,
    };
  }

  if (language === 'te') {
    if (isHygiene) {
      return {
        reply:
          'పీరియడ్స్ సమయంలో రక్తస్రావం తక్కువగా ఉన్నా ప్రతి 4 నుండి 6 గంటలకు ఒకసారి శానిటరీ ప్యాడ్ మార్చాలి. ప్యాడ్ మార్చడానికి ముందు మరియు తర్వాత సబ్బుతో చేతులు కడుక్కోండి. బయటి భాగాన్ని గోరువెచ్చని లేదా సాధారణ నీటితో మాత్రమే శుభ్రం చేయండి. వాడిన ప్యాడ్‌ను కాగితంలో చుట్టి చెత్తబుట్టలో వేయండి, టాయిలెట్‌లో ఫ్లష్ చేయకండి.',
        disclaimer: disclaimers.te,
      };
    }
    if (isCramp) {
      return {
        reply:
          'తేలికపాటి పీరియడ్ నొప్పికి పొత్తికడుపుపై గోరువెచ్చని నీటి బ్యాగ్ పెట్టుకోవడం, అల్లం లేదా జీలకర్ర గోరువెచ్చని నీరు తాగడం, మరియు తేలికపాటి బటర్‌ఫ్లై స్ట్రెచింగ్ సహాయపడతాయి. నొప్పి చాలా ఎక్కువగా ఉంటే దయచేసి డాక్టర్‌ను సంప్రదించండి.',
        disclaimer: disclaimers.te,
      };
    }
    if (isPcos) {
      return {
        reply:
          'PCOS మరియు PCOD హార్మోన్లకు సంబంధించినవి; వీటిని వైద్యులు మాత్రమే పరీక్షల ద్వారా నిర్ధారిస్తారు. సమయానికి నిద్ర, పప్పు, కూరగాయలు, పెరుగు వంటి ఇంటి ఆహారం, మరియు రోజూ 20–30 నిమిషాల నడక లేదా యోగా మంచి అలవాట్లు. పీరియడ్స్ 3 నెలలకు పైగా ఆలస్యమైతే గైనకాలజిస్ట్‌ను కలవండి.',
        disclaimer: disclaimers.te,
      };
    }
    return {
      reply:
        'మీరు ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉన్నారు, అయినా మీ పీరియడ్ రికార్డులు, క్యాలెండర్ మరియు ఆహార డైరీ పూర్తిగా పనిచేస్తాయి. ప్రతి 4–6 గంటలకు ప్యాడ్ మార్చండి, తగినంత నీరు తాగండి మరియు తగిన విశ్రాంతి తీసుకోండి.',
      disclaimer: disclaimers.te,
    };
  }

  if (language === 'ur') {
    if (isHygiene) {
      return {
        reply:
          'ماہواری کے دوران ہر 4 سے 6 گھنٹے میں سینیٹری پیڈ تبدیل کرنا بہتر ہے، چاہے بہاؤ ہلکا ہی کیوں نہ ہو۔ پیڈ بدلنے سے پہلے اور بعد میں صابن سے ہاتھ دھوئیں۔ بیرونی صفائی صرف سادے یا نیم گرم پانی سے کریں، خوشبو دار صابن استعمال نہ کریں۔ استعمال شدہ پیڈ کو کاغذ میں لپیٹ کر کوڑے دان میں ڈالیں، ٹوائلٹ میں نہ بہائیں۔',
        disclaimer: disclaimers.ur,
      };
    }
    if (isCramp) {
      return {
        reply:
          'ہلکے درد میں پیٹ کے نچلے حصے پر گرم پانی کی بوتل رکھنا، ادرک یا اجوائن کا نیم گرم پانی پینا اور ہلکی اسٹریچنگ آرام دیتی ہے۔ اگر درد بہت شدید ہو یا روزمرہ کام متاثر ہوں تو ڈاکٹر سے ضرور مشورہ کریں۔',
        disclaimer: disclaimers.ur,
      };
    }
    if (isPcos) {
      return {
        reply:
          'PCOS اور PCOD ہارمونل کیفیتیں ہیں جن کی تشخیص صرف مستند ڈاکٹر ہی کر سکتے ہیں۔ باقاعدہ نیند، گھر کا متوازن کھانا (دال، سبزیاں، دہی، پھل) اور روزانہ 20 سے 30 منٹ ہلکی چہل قدمی یا یوگا مددگار ہوتے ہیں۔ اگر ماہواری 3 ماہ سے زیادہ رکی رہے تو ڈاکٹر سے رجوع کریں۔',
        disclaimer: disclaimers.ur,
      };
    }
    return {
      reply:
        'آپ اس وقت آف لائن ہیں، تاہم آپ اپنے محفوظ صحت کے ریکارڈ اور کیلنڈر دیکھ اور شامل کر سکتی ہیں۔ ہر 4 سے 6 گھنٹے میں پیڈ بدلیں، پانی پیتے رہیں اور آرام کو ترجیح دیں۔ انٹرنیٹ آنے پر رتو ساتھی لائیو جواب دے گی۔',
      disclaimer: disclaimers.ur,
    };
  }

  // English fallback
  if (isHygiene) {
    return {
      reply:
        'Change your sanitary pad every 4 to 6 hours — even on lighter days — to keep skin dry and prevent irritation. Wash your hands with soap before and after changing, rinse only externally with plain warm water (no scented washes), wear clean cotton underwear, and wrap used pads in paper for a covered bin rather than flushing.',
      disclaimer: disclaimers.en,
    };
  }
  if (isCramp) {
    return {
      reply:
        'For mild period cramps, try a warm water bottle on your lower belly, sipping warm ginger or ajwain water, resting with knees slightly bent, or gentle butterfly and child’s pose stretches. If pain is severe, causes fainting, or does not ease, please consult a doctor.',
      disclaimer: disclaimers.en,
    };
  }
  if (isPcos) {
    return {
      reply:
        'PCOS and PCOD are common hormonal conditions that only a qualified doctor can diagnose after proper evaluation. Supportive daily habits include balanced Indian meals (pairing dal, vegetables, curd, sprouts, or eggs with rice/roti), steady 7.5–8 hour sleep, and 20–30 minutes of joyful walking or yoga.',
      disclaimer: disclaimers.en,
    };
  }
  if (isDiet) {
    return {
      reply:
        'Aim for comforting, nourishing Indian meals without crash dieting: steamed idli-sambar or eggs for breakfast, dal-sabzi-curd-roti for lunch, sprouts with fruit or roasted chana in the evening, and warm khichdi or paneer at dinner, alongside 8 glasses of water.',
      disclaimer: disclaimers.en,
    };
  }

  return {
    reply:
      'You are viewing RituSaathi in offline mode. All your cycle records, notes, meals, and activity logs remain privately saved on your device. Feel free to ask about period hygiene, cramps, PCOS/PCOD education, or balanced Indian meals — and reconnect anytime for live Gemini answers.',
    disclaimer: disclaimers.en,
  };
}
