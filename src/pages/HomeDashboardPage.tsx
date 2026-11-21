import React from 'react';
import {
  Activity,
  Bell,
  CalendarHeart,
  Droplets,
  FileHeart,
  Flower2,
  Mic,
  ShieldCheck,
  Utensils,
} from 'lucide-react';
import type {
  ActivityRecord,
  HealthNote,
  MealRecord,
  NavSection,
  PeriodRecord,
  SupportedLanguage,
  WellnessReminder,
} from '../types/wellness';
import {computeCycleStats, formatReadableDate} from '../utils/cycleMath';
import {UI_COPY} from '../data/wellnessContent';
import {WellnessImage} from '../components/RituLogo';

interface HomeDashboardPageProps {
  language: SupportedLanguage;
  periods: PeriodRecord[];
  meals: MealRecord[];
  activities: ActivityRecord[];
  notes: HealthNote[];
  reminders: WellnessReminder[];
  isOnline: boolean;
  onNavigate: (section: NavSection) => void;
  onTriggerReminderTest: (reminder: WellnessReminder) => void;
}

const SHORTCUTS: Array<{
  section: NavSection;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{className?: string}>;
  accentBg: string;
  accentText: string;
}> = [
  {
    section: 'tracker',
    label: 'Period Tracker',
    sublabel: 'Log dates, flow & calendar',
    icon: CalendarHeart,
    accentBg: 'bg-[#FDF2F8]',
    accentText: 'text-[#BE185D]',
  },
  {
    section: 'pcos',
    label: 'PCOS / PCOD',
    sublabel: 'Education & daily routines',
    icon: Flower2,
    accentBg: 'bg-[#F5F3FF]',
    accentText: 'text-[#6D28D9]',
  },
  {
    section: 'diet',
    label: 'Diet Planner',
    sublabel: 'Indian meals & hydration',
    icon: Utensils,
    accentBg: 'bg-[#FAF5FF]',
    accentText: 'text-[#7E22CE]',
  },
  {
    section: 'activities',
    label: 'Physical Activity',
    sublabel: 'Yoga, walking & rest',
    icon: Activity,
    accentBg: 'bg-[#F5F3FF]',
    accentText: 'text-[#5B21B6]',
  },
  {
    section: 'hygiene',
    label: 'Period Hygiene',
    sublabel: 'Safe care & myths vs facts',
    icon: Droplets,
    accentBg: 'bg-[#FDF2F8]',
    accentText: 'text-[#9D174D]',
  },
  {
    section: 'assistant',
    label: 'AI Voice Assistant',
    sublabel: 'English · हिन्दी · తెలుగు · اردو',
    icon: Mic,
    accentBg: 'bg-[#EDE9FE]',
    accentText: 'text-[#5B21B6]',
  },
  {
    section: 'records',
    label: 'Offline Records',
    sublabel: 'Private local health vault',
    icon: FileHeart,
    accentBg: 'bg-[#F8F5FC]',
    accentText: 'text-[#4C1D95]',
  },
];

export const HomeDashboardPage: React.FC<HomeDashboardPageProps> = ({
  language,
  periods,
  meals,
  activities,
  notes,
  reminders,
  isOnline,
  onNavigate,
  onTriggerReminderTest,
}) => {
  const stats = computeCycleStats(periods);
  const copy = UI_COPY[language];
  const todayIso = new Date().toISOString().slice(0, 10);

  const todaysMeals = meals.filter((m) => m.date === todayIso);
  const displayMeals = todaysMeals.length > 0 ? todaysMeals : meals.slice(0, 2);

  const todaysActivities = activities.filter((a) => a.date === todayIso);
  const displayActivities =
    todaysActivities.length > 0 ? todaysActivities : activities.slice(0, 2);

  const activeReminders = reminders.filter((r) => r.enabled).slice(0, 3);
  const recentSymptoms = stats.lastPeriod?.symptoms ?? [];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="overflow-hidden rounded-3xl border border-[#E6DDF0] bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
            <div>
              <p className="text-xs font-medium text-[#6D28D9]">
                RituSaathi · {isOnline ? 'Connected' : 'Offline ready'} · Local-first privacy
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#221830] sm:text-4xl">
                {copy.welcomeTitle}
              </h1>
              <p className="mt-2 text-base font-medium text-[#5B21B6]">{copy.tagline}</p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#524366]">
                Track your cycle gently, explore trusted PCOS/PCOD and period hygiene guides,
                plan wholesome Indian meals, and speak with RituSaathi in English, Hindi,
                Telugu, or Urdu — with your private health records stored safely on your device.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('assistant')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#6D28D9] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5B21B6] whitespace-nowrap"
              >
                <Mic className="h-4 w-4 shrink-0" />
                <span>Open Voice Assistant</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('tracker')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-4 py-2.5 text-sm font-medium text-[#4C1D95] transition-colors hover:bg-[#F3EEF9] whitespace-nowrap"
              >
                <CalendarHeart className="h-4 w-4 shrink-0" />
                <span>Log Period</span>
              </button>
            </div>
          </div>

          <div className="relative min-h-[220px] border-t border-[#E6DDF0] lg:col-span-5 lg:border-t-0 lg:border-l">
            <WellnessImage
              src="/src/assets/images/ritusaathi_hero_wellness_1795252245393.jpg"
              alt="Serene lotus and lavender wellness illustration for RituSaathi"
              fallbackTitle="RituSaathi Wellness Companion"
              className="h-full w-full object-cover lg:h-full"
            />
          </div>
        </div>
      </section>

      {/* Primary Cycle Summary Strip (4-column KPI strip) */}
      <section aria-label="Cycle summary">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
            <p className="text-xs font-medium text-[#6B5B7E]">Last recorded period</p>
            <p className="mt-2 font-display text-2xl font-semibold text-[#221830] tabular-nums">
              {stats.lastPeriod ? formatReadableDate(stats.lastPeriod.startDate) : 'No record yet'}
            </p>
            <p className="mt-1 text-xs text-[#6B5B7E] tabular-nums">
              {stats.lastPeriod
                ? `Flow: ${stats.lastPeriod.flowLevel} · ${stats.lastPeriod.cycleLength}d cycle`
                : 'Log your first cycle in Period Tracker'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
            <p className="text-xs font-medium text-[#6B5B7E]">Estimated next period</p>
            <p className="mt-2 font-display text-2xl font-semibold text-[#9D174D] tabular-nums">
              {stats.estimatedNextPeriod ? formatReadableDate(stats.estimatedNextPeriod) : '—'}
            </p>
            <p className="mt-1 text-xs text-[#6B5B7E] tabular-nums">
              {stats.daysUntilNext !== null
                ? stats.daysUntilNext >= 0
                  ? `Estimated in ${stats.daysUntilNext} days · not a diagnosis`
                  : `${Math.abs(stats.daysUntilNext)} days past average window`
                : 'Add a cycle to view estimates'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
            <p className="text-xs font-medium text-[#6B5B7E]">Cycle overview</p>
            <p className="mt-2 font-display text-2xl font-semibold text-[#221830] tabular-nums">
              {stats.currentCycleDay ? `Day ${stats.currentCycleDay}` : '—'}
            </p>
            <p className="mt-1 text-xs text-[#6B5B7E] tabular-nums">
              Avg {stats.averageCycleLength} days cycle · {stats.averagePeriodDuration} days flow
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
            <p className="text-xs font-medium text-[#6B5B7E]">Recent symptoms &amp; mood</p>
            <p className="mt-2 font-display text-xl font-semibold text-[#221830] truncate">
              {stats.lastPeriod?.mood || notes[0]?.mood || 'Calm'}
            </p>
            <p className="mt-1 text-xs text-[#6B5B7E] truncate">
              {recentSymptoms.length > 0
                ? recentSymptoms.slice(0, 3).join(' · ')
                : 'No recent symptoms recorded'}
            </p>
          </div>
        </div>
      </section>

      {/* Shortcuts Grid */}
      <section aria-label="Quick navigation shortcuts">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-[#221830]">
            Explore your wellness companion
          </h2>
          <span className="text-xs text-[#6B5B7E]">7 core spaces</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.section}
                type="button"
                onClick={() => onNavigate(item.section)}
                className="group flex min-h-[76px] items-center gap-3.5 rounded-2xl border border-[#E6DDF0] bg-white p-4 text-left transition-colors hover:border-[#C4B5FD] hover:bg-[#FAF7FE]"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.accentBg} ${item.accentText}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#221830] group-hover:text-[#5B21B6]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B5B7E] truncate">{item.sublabel}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dashboard Details: Today's Meal Plan, Activity Plan, Reminders, Recent Records */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Meal Plan */}
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-[#221830]">
              Today’s meal plan
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('diet')}
              className="text-xs font-semibold text-[#6D28D9] hover:underline whitespace-nowrap"
            >
              Open Diet Planner
            </button>
          </div>
          {displayMeals.length === 0 ? (
            <p className="mt-4 text-sm text-[#6B5B7E]">
              No meals logged yet today. Open Diet Planner for Indian balanced meal ideas.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0E9F7]">
              {displayMeals.map((meal) => (
                <li key={meal.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-medium text-[#6D28D9] capitalize">
                    {meal.mealType} · {formatReadableDate(meal.date)}
                    {meal.isDemo ? ' · Demo sample' : ''}
                  </p>
                  <p className="mt-1 text-sm text-[#221830]">{meal.items}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Today's Activity Plan */}
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-[#221830]">
              Today’s activity &amp; recovery
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('activities')}
              className="text-xs font-semibold text-[#6D28D9] hover:underline whitespace-nowrap"
            >
              Open Activities
            </button>
          </div>
          {displayActivities.length === 0 ? (
            <p className="mt-4 text-sm text-[#6B5B7E]">
              No movements logged yet today. Gentle stretching or rest counts too.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0E9F7]">
              {displayActivities.map((act) => (
                <li key={act.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-medium text-[#9D174D] capitalize tabular-nums">
                    {act.type} · {act.durationMinutes} min · {act.comfortLevel}
                    {act.isDemo ? ' · Demo sample' : ''}
                  </p>
                  <p className="mt-1 text-sm text-[#221830]">{act.title}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-[#221830]">
              Upcoming reminders
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('activities')}
              className="text-xs font-semibold text-[#6D28D9] hover:underline whitespace-nowrap"
            >
              Manage reminders
            </button>
          </div>
          {activeReminders.length === 0 ? (
            <p className="mt-4 text-sm text-[#6B5B7E]">
              All reminders are currently paused. Enable them in Activities or Settings.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0E9F7]">
              {activeReminders.map((rem) => (
                <li
                  key={rem.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#221830] truncate">{rem.title}</p>
                    <p className="text-xs text-[#6B5B7E] capitalize tabular-nums">
                      {rem.category} · {rem.time} · {rem.frequency.replace('_', ' ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTriggerReminderTest(rem)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E6DDF0] px-3 py-1.5 text-xs font-medium text-[#4C1D95] hover:bg-[#F5F0FC] whitespace-nowrap shrink-0"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span>Remind now</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Health Records */}
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-[#221830]">
              Recent offline health records
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('records')}
              className="text-xs font-semibold text-[#6D28D9] hover:underline whitespace-nowrap"
            >
              View all records
            </button>
          </div>
          {notes.length === 0 ? (
            <p className="mt-4 text-sm text-[#6B5B7E]">
              No notes recorded yet. Add private cycle or PCOS reflections in My Records.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0E9F7]">
              {notes.slice(0, 3).map((note) => (
                <li key={note.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-medium text-[#6B5B7E] capitalize tabular-nums">
                    {note.category} · {formatReadableDate(note.date)}
                    {note.isDemo ? ' · Demo sample' : ''}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#221830]">{note.title}</p>
                  <p className="mt-0.5 text-xs text-[#524366] line-clamp-2">{note.content}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex items-center gap-2 border-t border-[#F0E9F7] pt-3 text-xs text-[#6B5B7E]">
            <ShieldCheck className="h-4 w-4 text-[#6D28D9] shrink-0" />
            <span>
              Stored privately in IndexedDB on this device — accessible even without internet.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
