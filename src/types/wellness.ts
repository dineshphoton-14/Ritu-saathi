export type NavSection =
  | 'home'
  | 'tracker'
  | 'pcos'
  | 'diet'
  | 'activities'
  | 'hygiene'
  | 'assistant'
  | 'records'
  | 'settings';

export type SupportedLanguage = 'en' | 'hi' | 'te' | 'ur';

export type FlowLevel = 'spotting' | 'light' | 'medium' | 'heavy';

export interface PeriodRecord {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  cycleLength: number;
  flowLevel: FlowLevel;
  symptoms: string[];
  mood: string;
  notes: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealRecord {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  items: string;
  waterGlasses: number;
  notes: string;
  isDemo?: boolean;
  createdAt: string;
}

export type ActivityCategory =
  | 'walking'
  | 'yoga'
  | 'stretching'
  | 'dancing'
  | 'relaxation'
  | 'rest';

export interface ActivityRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: ActivityCategory;
  title: string;
  durationMinutes: number;
  comfortLevel: 'gentle' | 'moderate' | 'restorative';
  notes: string;
  isDemo?: boolean;
  createdAt: string;
}

export type NoteCategory = 'cycle' | 'pcos' | 'symptom' | 'mood' | 'general';

export interface HealthNote {
  id: string;
  date: string; // YYYY-MM-DD
  category: NoteCategory;
  title: string;
  content: string;
  mood?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReminderCategory = 'period' | 'hygiene' | 'activity' | 'meal' | 'hydration';

export interface WellnessReminder {
  id: string;
  title: string;
  category: ReminderCategory;
  time: string; // HH:MM
  frequency: 'daily' | 'every_4h' | 'cycle_day';
  enabled: boolean;
  lastTriggeredAt?: string;
}

export interface UserSettings {
  key: 'user_prefs';
  language: SupportedLanguage;
  notificationsEnabled: boolean;
  averageCycleLength: number;
  onboardingSeeded: boolean;
}

export interface AIMealSlot {
  title: string;
  suggestedTime: string;
  items: string[];
  benefitNote: string;
}

export interface AIDietPlan {
  breakfast: AIMealSlot;
  lunch: AIMealSlot;
  eveningSnack: AIMealSlot;
  dinner: AIMealSlot;
  hydrationTip: string;
  gentleNote: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  language: SupportedLanguage;
  disclaimer?: string;
  isOfflineAnswer?: boolean;
  timestamp: string;
}

export interface WellnessBackupPayload {
  app: 'RituSaathi';
  version: number;
  exportedAt: string;
  periods: PeriodRecord[];
  meals: MealRecord[];
  activities: ActivityRecord[];
  notes: HealthNote[];
  reminders: WellnessReminder[];
  settings: UserSettings;
}
