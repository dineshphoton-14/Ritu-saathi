import React, {useCallback, useEffect, useState} from 'react';
import {
  Activity,
  Bell,
  CalendarHeart,
  Droplets,
  FileHeart,
  Flower2,
  Home,
  Menu,
  Mic,
  Settings as SettingsIcon,
  Utensils,
  WifiOff,
  X,
} from 'lucide-react';
import type {
  ActivityRecord,
  HealthNote,
  MealRecord,
  NavSection,
  PeriodRecord,
  SupportedLanguage,
  UserSettings,
  WellnessReminder,
} from './types/wellness';
import {initializeAndLoadAll, loadAllWellnessData, rituDb} from './db/rituDb';
import {SUPPORTED_LANGUAGES, UI_COPY} from './data/wellnessContent';
import {useOnlineStatus} from './hooks/useOnlineStatus';
import {RituLogo} from './components/RituLogo';
import {PWAInstallButton} from './components/PWAInstallButton';
import {HomeDashboardPage} from './pages/HomeDashboardPage';
import {PeriodTrackerPage} from './pages/PeriodTrackerPage';
import {PcosPcodPage} from './pages/PcosPcodPage';
import {DietPlannerPage} from './pages/DietPlannerPage';
import {ActivitiesPage} from './pages/ActivitiesPage';
import {HygienePage} from './pages/HygienePage';
import {VoiceAssistantPage} from './pages/VoiceAssistantPage';
import {OfflineRecordsPage} from './pages/OfflineRecordsPage';
import {SettingsPage} from './pages/SettingsPage';

const NAV_ITEMS: Array<{
  id: NavSection;
  label: string;
  icon: React.ComponentType<{className?: string}>;
}> = [
  {id: 'home', label: 'Home', icon: Home},
  {id: 'tracker', label: 'Period Tracker', icon: CalendarHeart},
  {id: 'pcos', label: 'PCOS / PCOD', icon: Flower2},
  {id: 'diet', label: 'Diet Planner', icon: Utensils},
  {id: 'activities', label: 'Activities', icon: Activity},
  {id: 'hygiene', label: 'Period Hygiene', icon: Droplets},
  {id: 'assistant', label: 'AI Voice Assistant', icon: Mic},
  {id: 'records', label: 'My Records', icon: FileHeart},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
];

export default function App() {
  const isOnline = useOnlineStatus();
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [periods, setPeriods] = useState<PeriodRecord[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [notes, setNotes] = useState<HealthNote[]>([]);
  const [reminders, setReminders] = useState<WellnessReminder[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    key: 'user_prefs',
    language: 'en',
    notificationsEnabled: false,
    averageCycleLength: 28,
    onboardingSeeded: true,
  });

  const [activeAlert, setActiveAlert] = useState<{title: string; category: string} | null>(null);

  const refreshData = useCallback(async () => {
    const data = await loadAllWellnessData();
    setPeriods(data.periods);
    setMeals(data.meals);
    setActivities(data.activities);
    setNotes(data.notes);
    setReminders(data.reminders);
    setSettings(data.settings);
  }, []);

  useEffect(() => {
    initializeAndLoadAll()
      .then((data) => {
        setPeriods(data.periods);
        setMeals(data.meals);
        setActivities(data.activities);
        setNotes(data.notes);
        setReminders(data.reminders);
        setSettings(data.settings);
        setLoading(false);
      })
      .catch(() => {
        setDbError('Could not initialize local IndexedDB storage in this browser.');
        setLoading(false);
      });
  }, []);

  const triggerReminderAlert = useCallback(
    (reminder: WellnessReminder) => {
      setActiveAlert({title: reminder.title, category: reminder.category});
      if (
        settings.notificationsEnabled &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification('RituSaathi Reminder', {
            body: reminder.title,
            icon: '/pwa-192x192.png',
          });
        } catch {
          // In-app alert banner serves as reliable fallback
        }
      }
    },
    [settings.notificationsEnabled],
  );

  // Minute-level background reminder checker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayKey = now.toISOString().slice(0, 13); // hourly dedup key

      reminders.forEach((rem) => {
        if (!rem.enabled) return;
        if (rem.time === hhmm && rem.lastTriggeredAt !== todayKey) {
          triggerReminderAlert(rem);
          const updated = {...rem, lastTriggeredAt: todayKey};
          void rituDb.saveReminder(updated).then(refreshData);
        }
      });
    }, 30000);

    return () => clearInterval(timer);
  }, [reminders, triggerReminderAlert, refreshData]);

  const navigateTo = (section: NavSection) => {
    setActiveSection(section);
    setMobileMoreOpen(false);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleChangeLanguage = async (language: SupportedLanguage) => {
    const updated = {...settings, language};
    setSettings(updated);
    await rituDb.saveSettings(updated);
  };

  const handleEnableBrowserNotifications = async () => {
    if (typeof Notification === 'undefined') {
      setActiveAlert({
        title: 'Browser notifications are unavailable here; in-app alerts remain active.',
        category: 'notification',
      });
      return;
    }
    const perm = await Notification.requestPermission();
    const granted = perm === 'granted';
    const updated = {...settings, notificationsEnabled: granted};
    setSettings(updated);
    await rituDb.saveSettings(updated);
    setActiveAlert({
      title: granted
        ? 'Browser notifications enabled for RituSaathi reminders.'
        : 'Browser permission declined — in-app reminder banners will appear instead.',
      category: 'notification',
    });
  };

  const handleExportBackup = async () => {
    const payload = await rituDb.exportBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ritusaathi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    await rituDb.importBackup(parsed);
    await refreshData();
  };

  const copy = UI_COPY[settings.language];
  const currentNavLabel = NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? 'RituSaathi';

  return (
    <div className="min-h-screen bg-[#FAF8FC] text-[#221830]">
      {/* Desktop Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#E6DDF0] bg-white lg:flex">
        <div className="flex items-center justify-between border-b border-[#F0E9F7] px-5 py-4">
          <RituLogo />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#EDE9FE] text-[#4C1D95]'
                    : 'text-[#524366] hover:bg-[#FAF8FC] hover:text-[#221830]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#6D28D9]' : ''}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-[#F0E9F7] p-4">
          <PWAInstallButton />

          <div className="flex items-center justify-between gap-2 text-xs text-[#6B5B7E]">
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
            <select
              aria-label="Select language"
              value={settings.language}
              onChange={(e) => void handleChangeLanguage(e.target.value as SupportedLanguage)}
              className="rounded-lg border border-[#E6DDF0] bg-[#FAF8FC] px-2 py-1 text-xs font-medium text-[#4C1D95]"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar (Compact <= 54px) */}
      <header className="sticky top-0 z-30 flex h-[54px] items-center justify-between border-b border-[#E6DDF0] bg-white/95 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 text-left"
        >
          <RituLogo compact />
          <span className="font-display text-base font-semibold text-[#221830] truncate max-w-[165px]">
            {activeSection === 'home' ? 'RituSaathi' : currentNavLabel}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <select
            aria-label="Select language"
            value={settings.language}
            onChange={(e) => void handleChangeLanguage(e.target.value as SupportedLanguage)}
            className="min-h-[36px] rounded-lg border border-[#E6DDF0] bg-[#FAF8FC] px-2 text-xs font-medium text-[#4C1D95]"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName}
              </option>
            ))}
          </select>
          <PWAInstallButton compact />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lg:pl-64 pb-24 lg:pb-12">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {/* Offline Banner */}
          {!isOnline && (
            <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-[#F5D0FE] bg-[#FDF4FF] px-4 py-3 text-xs font-medium text-[#6B21A8]">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>{copy.offlineBanner}</span>
            </div>
          )}

          {/* In-App Reminder Banner Fallback */}
          {activeAlert && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-[#C4B5FD] bg-[#F5F3FF] px-4 py-3 text-xs text-[#4C1D95]">
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 shrink-0 text-[#6D28D9]" />
                <span>
                  <strong className="capitalize">{activeAlert.category} reminder:</strong>{' '}
                  {activeAlert.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveAlert(null)}
                aria-label="Dismiss reminder"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {dbError && (
            <div className="mb-6 rounded-2xl border border-[#FECDD3] bg-[#FFF1F2] p-4 text-sm text-[#9F1239]">
              {dbError}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="h-44 animate-pulse rounded-3xl bg-[#EFE9F6]" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-28 animate-pulse rounded-2xl bg-[#EFE9F6]" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeSection === 'home' && (
                <HomeDashboardPage
                  language={settings.language}
                  periods={periods}
                  meals={meals}
                  activities={activities}
                  notes={notes}
                  reminders={reminders}
                  isOnline={isOnline}
                  onNavigate={navigateTo}
                  onTriggerReminderTest={triggerReminderAlert}
                />
              )}

              {activeSection === 'tracker' && (
                <PeriodTrackerPage
                  periods={periods}
                  onSavePeriod={async (record) => {
                    await rituDb.savePeriod(record);
                    await refreshData();
                  }}
                  onDeletePeriod={async (id) => {
                    await rituDb.deletePeriod(id);
                    await refreshData();
                  }}
                />
              )}

              {activeSection === 'pcos' && (
                <PcosPcodPage
                  onSaveNote={async (note) => {
                    await rituDb.saveNote(note);
                    await refreshData();
                  }}
                  onNavigate={navigateTo}
                />
              )}

              {activeSection === 'diet' && (
                <DietPlannerPage
                  language={settings.language}
                  isOnline={isOnline}
                  meals={meals}
                  onSaveMeal={async (meal) => {
                    await rituDb.saveMeal(meal);
                    await refreshData();
                  }}
                  onDeleteMeal={async (id) => {
                    await rituDb.deleteMeal(id);
                    await refreshData();
                  }}
                />
              )}

              {activeSection === 'activities' && (
                <ActivitiesPage
                  activities={activities}
                  reminders={reminders}
                  notificationsEnabled={settings.notificationsEnabled}
                  onSaveActivity={async (act) => {
                    await rituDb.saveActivity(act);
                    await refreshData();
                  }}
                  onDeleteActivity={async (id) => {
                    await rituDb.deleteActivity(id);
                    await refreshData();
                  }}
                  onSaveReminder={async (rem) => {
                    await rituDb.saveReminder(rem);
                    await refreshData();
                  }}
                  onDeleteReminder={async (id) => {
                    await rituDb.deleteReminder(id);
                    await refreshData();
                  }}
                  onEnableBrowserNotifications={handleEnableBrowserNotifications}
                  onTriggerReminderTest={triggerReminderAlert}
                />
              )}

              {activeSection === 'hygiene' && (
                <HygienePage
                  language={settings.language}
                  isOnline={isOnline}
                  onChangeLanguage={(lang) => void handleChangeLanguage(lang)}
                />
              )}

              {activeSection === 'assistant' && (
                <VoiceAssistantPage
                  language={settings.language}
                  isOnline={isOnline}
                  periods={periods}
                  onChangeLanguage={(lang) => void handleChangeLanguage(lang)}
                />
              )}

              {activeSection === 'records' && (
                <OfflineRecordsPage
                  periods={periods}
                  meals={meals}
                  activities={activities}
                  notes={notes}
                  onSaveNote={async (note) => {
                    await rituDb.saveNote(note);
                    await refreshData();
                  }}
                  onDeleteNote={async (id) => {
                    await rituDb.deleteNote(id);
                    await refreshData();
                  }}
                  onDeletePeriod={async (id) => {
                    await rituDb.deletePeriod(id);
                    await refreshData();
                  }}
                  onDeleteMeal={async (id) => {
                    await rituDb.deleteMeal(id);
                    await refreshData();
                  }}
                  onDeleteActivity={async (id) => {
                    await rituDb.deleteActivity(id);
                    await refreshData();
                  }}
                  onExportBackup={handleExportBackup}
                  onImportBackup={handleImportBackup}
                  onClearDemoData={async () => {
                    await rituDb.clearDemoRecords();
                    await refreshData();
                  }}
                />
              )}

              {activeSection === 'settings' && (
                <SettingsPage
                  settings={settings}
                  isOnline={isOnline}
                  onChangeLanguage={handleChangeLanguage}
                  onEnableNotifications={handleEnableBrowserNotifications}
                  onToggleNotifications={async (enabled) => {
                    const updated = {...settings, notificationsEnabled: enabled};
                    setSettings(updated);
                    await rituDb.saveSettings(updated);
                  }}
                  onExportBackup={handleExportBackup}
                  onImportBackup={handleImportBackup}
                  onRestoreDemoData={async () => {
                    await rituDb.restoreDemoRecords();
                    await refreshData();
                  }}
                  onDeleteAllData={async () => {
                    await rituDb.deleteAllData();
                    await refreshData();
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (5 Ergonomic Thumb Tabs) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E6DDF0] bg-white/95 backdrop-blur-md pb-safe lg:hidden"
      >
        <div className="grid h-16 grid-cols-5 items-center">
          {(
            [
              {id: 'home', label: 'Home', icon: Home},
              {id: 'tracker', label: 'Tracker', icon: CalendarHeart},
              {id: 'assistant', label: 'Voice AI', icon: Mic},
              {id: 'hygiene', label: 'Hygiene', icon: Droplets},
            ] as Array<{id: NavSection; label: string; icon: React.ComponentType<{className?: string}>}>
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeSection === tab.id && !mobileMoreOpen;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigateTo(tab.id)}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 ${
                  active ? 'text-[#6D28D9]' : 'text-[#6B5B7E]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMobileMoreOpen((o) => !o)}
            className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 ${
              mobileMoreOpen ||
              ['pcos', 'diet', 'activities', 'records', 'settings'].includes(activeSection)
                ? 'text-[#6D28D9]'
                : 'text-[#6B5B7E]'
            }`}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Bottom Sheet */}
      {mobileMoreOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-[#221830]/40 backdrop-blur-xs lg:hidden">
          <div className="w-full rounded-t-3xl border-t border-[#E6DDF0] bg-white p-5 pb-8 shadow-xl">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#DFD4EE]" />
            <div className="flex items-center justify-between pb-3">
              <span className="font-display text-lg font-semibold text-[#221830]">
                All RituSaathi Sections
              </span>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#5F5070]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`flex min-h-[48px] items-center gap-2.5 rounded-xl border px-3.5 text-left text-xs font-semibold ${
                      active
                        ? 'border-[#6D28D9] bg-[#EDE9FE] text-[#4C1D95]'
                        : 'border-[#E6DDF0] bg-[#FAF8FC] text-[#221830]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#6D28D9]" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
