import type {
  ActivityRecord,
  HealthNote,
  MealRecord,
  PeriodRecord,
  UserSettings,
  WellnessBackupPayload,
  WellnessReminder,
} from '../types/wellness';
import {addDays, toISODate} from '../utils/cycleMath';

const DB_NAME = 'ritusaathi_db';
const DB_VERSION = 1;

export type StoreName =
  | 'periods'
  | 'meals'
  | 'activities'
  | 'notes'
  | 'reminders'
  | 'settings';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('periods')) {
        db.createObjectStore('periods', {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains('meals')) {
        db.createObjectStore('meals', {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains('activities')) {
        db.createObjectStore('activities', {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains('reminders')) {
        db.createObjectStore('reminders', {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', {keyPath: 'key'});
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });

  return dbPromise;
}

async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as T[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

async function putInStore<T>(storeName: StoreName, value: T): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteFromStore(storeName: StoreName, key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function buildDemoSeedData(): {
  periods: PeriodRecord[];
  meals: MealRecord[];
  activities: ActivityRecord[];
  notes: HealthNote[];
  reminders: WellnessReminder[];
  settings: UserSettings;
} {
  const today = toISODate(new Date());
  const nowIso = new Date().toISOString();

  // Create 3 realistic past cycles relative to today so Cycle Day is ~19 (mid-cycle)
  const p1Start = addDays(today, -18);
  const p1End = addDays(p1Start, 4);
  const p2Start = addDays(p1Start, -29);
  const p2End = addDays(p2Start, 4);
  const p3Start = addDays(p2Start, -28);
  const p3End = addDays(p3Start, 3);

  const periods: PeriodRecord[] = [
    {
      id: 'demo_period_1',
      startDate: p1Start,
      endDate: p1End,
      cycleLength: 29,
      flowLevel: 'medium',
      symptoms: ['Mild cramps', 'Lower back ache', 'Fatigue'],
      mood: 'Calm',
      notes: 'Warm water bag and ginger tea helped on day 1.',
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'demo_period_2',
      startDate: p2Start,
      endDate: p2End,
      cycleLength: 28,
      flowLevel: 'medium',
      symptoms: ['Bloating', 'Headache'],
      mood: 'Sensitive',
      notes: 'Steady 5-day flow, kept hydrated with buttermilk.',
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'demo_period_3',
      startDate: p3Start,
      endDate: p3End,
      cycleLength: 28,
      flowLevel: 'light',
      symptoms: ['Mild cramps'],
      mood: 'Balanced',
      notes: 'Lighter cycle after regular evening walks.',
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const meals: MealRecord[] = [
    {
      id: 'demo_meal_1',
      date: today,
      mealType: 'breakfast',
      items: '3 steamed idlis with sambar, coconut chutney & soaked almonds',
      waterGlasses: 3,
      notes: 'Light and easy to digest in the morning.',
      isDemo: true,
      createdAt: nowIso,
    },
    {
      id: 'demo_meal_2',
      date: today,
      mealType: 'lunch',
      items: '2 phulkas, yellow moong dal, palak sabzi & fresh curd',
      waterGlasses: 3,
      notes: 'Iron-rich lunch with cooling curd.',
      isDemo: true,
      createdAt: nowIso,
    },
    {
      id: 'demo_meal_3',
      date: today,
      mealType: 'snack',
      items: 'Moong sprouts bowl with pomegranate seeds & lemon',
      waterGlasses: 2,
      notes: 'Great evening energy boost.',
      isDemo: true,
      createdAt: nowIso,
    },
  ];

  const activities: ActivityRecord[] = [
    {
      id: 'demo_act_1',
      date: today,
      type: 'yoga',
      title: 'Gentle Morning Butterfly & Cat-Cow Stretch',
      durationMinutes: 15,
      comfortLevel: 'gentle',
      notes: 'Focused on slow breathing and hip relaxation.',
      isDemo: true,
      createdAt: nowIso,
    },
    {
      id: 'demo_act_2',
      date: addDays(today, -1),
      type: 'walking',
      title: 'Evening Park Walk',
      durationMinutes: 25,
      comfortLevel: 'moderate',
      notes: 'Felt refreshed and slept well.',
      isDemo: true,
      createdAt: nowIso,
    },
  ];

  const notes: HealthNote[] = [
    {
      id: 'demo_note_1',
      date: today,
      category: 'pcos',
      title: 'PCOS Lifestyle Reflection',
      content: 'Sleeping by 10:30 PM and eating protein with breakfast reduced afternoon tiredness this week.',
      mood: 'Hopeful',
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'demo_note_2',
      date: addDays(today, -2),
      category: 'mood',
      title: 'Mid-cycle Check-in',
      content: 'Energy is steady. Keeping 8 glasses of water and light evening stretching.',
      mood: 'Calm',
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const reminders: WellnessReminder[] = [
    {
      id: 'rem_hygiene',
      title: 'Change sanitary pad & wash hands (every 4–6 hours)',
      category: 'hygiene',
      time: '12:00',
      frequency: 'every_4h',
      enabled: true,
    },
    {
      id: 'rem_hydration',
      title: 'Drink a glass of water or warm jeera water',
      category: 'hydration',
      time: '15:00',
      frequency: 'daily',
      enabled: true,
    },
    {
      id: 'rem_activity',
      title: '15 min gentle walk or butterfly yoga stretch',
      category: 'activity',
      time: '18:00',
      frequency: 'daily',
      enabled: true,
    },
    {
      id: 'rem_meal',
      title: 'Balanced dinner before 8:30 PM',
      category: 'meal',
      time: '20:00',
      frequency: 'daily',
      enabled: true,
    },
  ];

  const settings: UserSettings = {
    key: 'user_prefs',
    language: 'en',
    notificationsEnabled: false,
    averageCycleLength: 28,
    onboardingSeeded: true,
  };

  return {periods, meals, activities, notes, reminders, settings};
}

export async function initializeAndLoadAll() {
  const existingSettings = await getAllFromStore<UserSettings>('settings');
  const prefs = existingSettings.find((s) => s.key === 'user_prefs');

  if (!prefs) {
    const seed = buildDemoSeedData();
    await Promise.all([
      ...seed.periods.map((p) => putInStore('periods', p)),
      ...seed.meals.map((m) => putInStore('meals', m)),
      ...seed.activities.map((a) => putInStore('activities', a)),
      ...seed.notes.map((n) => putInStore('notes', n)),
      ...seed.reminders.map((r) => putInStore('reminders', r)),
      putInStore('settings', seed.settings),
    ]);
  }

  return loadAllWellnessData();
}

export async function loadAllWellnessData() {
  const [periods, meals, activities, notes, reminders, settingsArr] = await Promise.all([
    getAllFromStore<PeriodRecord>('periods'),
    getAllFromStore<MealRecord>('meals'),
    getAllFromStore<ActivityRecord>('activities'),
    getAllFromStore<HealthNote>('notes'),
    getAllFromStore<WellnessReminder>('reminders'),
    getAllFromStore<UserSettings>('settings'),
  ]);

  const settings: UserSettings = settingsArr.find((s) => s.key === 'user_prefs') ?? {
    key: 'user_prefs',
    language: 'en',
    notificationsEnabled: false,
    averageCycleLength: 28,
    onboardingSeeded: true,
  };

  return {
    periods: periods.sort((a, b) => b.startDate.localeCompare(a.startDate)),
    meals: meals.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    activities: activities.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    notes: notes.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    reminders,
    settings,
  };
}

export const rituDb = {
  savePeriod: (record: PeriodRecord) => putInStore('periods', record),
  deletePeriod: (id: string) => deleteFromStore('periods', id),

  saveMeal: (record: MealRecord) => putInStore('meals', record),
  deleteMeal: (id: string) => deleteFromStore('meals', id),

  saveActivity: (record: ActivityRecord) => putInStore('activities', record),
  deleteActivity: (id: string) => deleteFromStore('activities', id),

  saveNote: (record: HealthNote) => putInStore('notes', record),
  deleteNote: (id: string) => deleteFromStore('notes', id),

  saveReminder: (record: WellnessReminder) => putInStore('reminders', record),
  deleteReminder: (id: string) => deleteFromStore('reminders', id),

  saveSettings: (settings: UserSettings) => putInStore('settings', settings),

  async clearDemoRecords() {
    const data = await loadAllWellnessData();
    await Promise.all([
      ...data.periods.filter((p) => p.isDemo).map((p) => deleteFromStore('periods', p.id)),
      ...data.meals.filter((m) => m.isDemo).map((m) => deleteFromStore('meals', m.id)),
      ...data.activities.filter((a) => a.isDemo).map((a) => deleteFromStore('activities', a.id)),
      ...data.notes.filter((n) => n.isDemo).map((n) => deleteFromStore('notes', n.id)),
    ]);
  },

  async restoreDemoRecords() {
    const seed = buildDemoSeedData();
    await Promise.all([
      ...seed.periods.map((p) => putInStore('periods', p)),
      ...seed.meals.map((m) => putInStore('meals', m)),
      ...seed.activities.map((a) => putInStore('activities', a)),
      ...seed.notes.map((n) => putInStore('notes', n)),
    ]);
  },

  async exportBackup(): Promise<WellnessBackupPayload> {
    const data = await loadAllWellnessData();
    return {
      app: 'RituSaathi',
      version: 1,
      exportedAt: new Date().toISOString(),
      ...data,
    };
  },

  async importBackup(payload: unknown): Promise<void> {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid backup file format.');
    }
    const p = payload as Partial<WellnessBackupPayload>;
    if (p.app !== 'RituSaathi') {
      throw new Error('This file is not a valid RituSaathi backup.');
    }

    const periods = Array.isArray(p.periods) ? p.periods : [];
    const meals = Array.isArray(p.meals) ? p.meals : [];
    const activities = Array.isArray(p.activities) ? p.activities : [];
    const notes = Array.isArray(p.notes) ? p.notes : [];
    const reminders = Array.isArray(p.reminders) ? p.reminders : [];

    await Promise.all([
      ...periods.map((item) => putInStore('periods', item)),
      ...meals.map((item) => putInStore('meals', item)),
      ...activities.map((item) => putInStore('activities', item)),
      ...notes.map((item) => putInStore('notes', item)),
      ...reminders.map((item) => putInStore('reminders', item)),
    ]);

    if (p.settings && p.settings.key === 'user_prefs') {
      await putInStore('settings', p.settings);
    }
  },

  async deleteAllData(): Promise<void> {
    await Promise.all([
      clearStore('periods'),
      clearStore('meals'),
      clearStore('activities'),
      clearStore('notes'),
      clearStore('reminders'),
    ]);
    await putInStore('settings', {
      key: 'user_prefs',
      language: 'en',
      notificationsEnabled: false,
      averageCycleLength: 28,
      onboardingSeeded: true,
    } satisfies UserSettings);
  },
};
