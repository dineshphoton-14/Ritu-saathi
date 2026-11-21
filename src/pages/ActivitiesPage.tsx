import React, {useState} from 'react';
import {Activity, Bell, Plus, Trash2} from 'lucide-react';
import type {
  ActivityCategory,
  ActivityRecord,
  ReminderCategory,
  WellnessReminder,
} from '../types/wellness';
import {ACTIVITY_GUIDES} from '../data/wellnessContent';
import {createId} from '../db/rituDb';
import {formatReadableDate, toISODate} from '../utils/cycleMath';
import {WellnessImage} from '../components/RituLogo';

interface ActivitiesPageProps {
  activities: ActivityRecord[];
  reminders: WellnessReminder[];
  notificationsEnabled: boolean;
  onSaveActivity: (record: ActivityRecord) => Promise<void>;
  onDeleteActivity: (id: string) => Promise<void>;
  onSaveReminder: (reminder: WellnessReminder) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
  onEnableBrowserNotifications: () => Promise<void>;
  onTriggerReminderTest: (reminder: WellnessReminder) => void;
}

export const ActivitiesPage: React.FC<ActivitiesPageProps> = ({
  activities,
  reminders,
  notificationsEnabled,
  onSaveActivity,
  onDeleteActivity,
  onSaveReminder,
  onDeleteReminder,
  onEnableBrowserNotifications,
  onTriggerReminderTest,
}) => {
  const [date, setDate] = useState(toISODate(new Date()));
  const [type, setType] = useState<ActivityCategory>('yoga');
  const [title, setTitle] = useState('Gentle Butterfly & Hip Relaxation');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [comfortLevel, setComfortLevel] = useState<'gentle' | 'moderate' | 'restorative'>('gentle');
  const [notes, setNotes] = useState('');

  // Custom Reminder Form
  const [remTitle, setRemTitle] = useState('');
  const [remCategory, setRemCategory] = useState<ReminderCategory>('activity');
  const [remTime, setRemTime] = useState('18:00');
  const [remFreq, setRemFreq] = useState<'daily' | 'every_4h' | 'cycle_day'>('daily');

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSaveActivity({
      id: createId('act'),
      date,
      type,
      title: title.trim(),
      durationMinutes: Number(durationMinutes),
      comfortLevel,
      notes: notes.trim(),
      isDemo: false,
      createdAt: new Date().toISOString(),
    });
    setNotes('');
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;
    await onSaveReminder({
      id: createId('rem'),
      title: remTitle.trim(),
      category: remCategory,
      time: remTime,
      frequency: remFreq,
      enabled: true,
    });
    setRemTitle('');
  };

  return (
    <div className="space-y-8">
      {/* Intro Split */}
      <section className="overflow-hidden rounded-3xl border border-[#E6DDF0] bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
          <div className="p-6 sm:p-8 lg:col-span-7">
            <p className="text-xs font-medium text-[#6D28D9]">
              Optional &amp; comfort-first movement
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-[#221830]">
              Gentle Activities &amp; Reminders
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#524366]">
              Every body feels different across a menstrual cycle. Choose walking, restorative
              yoga, stretching, joyful dancing, breathing relaxation, or pure rest — always
              adaptable to your comfort today.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ACTIVITY_GUIDES.map((guide) => (
                <button
                  key={guide.type}
                  type="button"
                  onClick={() => {
                    setType(guide.type);
                    setTitle(guide.title);
                    setComfortLevel(guide.type === 'rest' || guide.type === 'relaxation' ? 'restorative' : 'gentle');
                  }}
                  className={`rounded-2xl border p-3.5 text-left transition-colors ${
                    type === guide.type
                      ? 'border-[#6D28D9] bg-[#F5F3FF]'
                      : 'border-[#E6DDF0] bg-[#FAF8FC] hover:bg-[#F3EEF9]'
                  }`}
                >
                  <p className="text-sm font-semibold text-[#221830]">{guide.title}</p>
                  <p className="mt-0.5 text-xs text-[#6D28D9] tabular-nums">{guide.duration}</p>
                  <p className="mt-1 text-xs text-[#524366]">{guide.bestFor}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[220px] border-t border-[#E6DDF0] lg:col-span-5 lg:border-t-0 lg:border-l">
            <WellnessImage
              src="/src/assets/images/ritusaathi_yoga_calm_1795252247377.jpg"
              alt="Peaceful morning yoga mat in sunlit room for gentle stretching and relaxation"
              fallbackTitle="Gentle Movement & Rest"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Activity Planner Form + Activity History */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleLogActivity}
          className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#6D28D9]" />
            <h2 className="font-display text-xl font-semibold text-[#221830]">
              Plan or log activity
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Category</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityCategory)}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
              >
                <option value="walking">Walking</option>
                <option value="yoga">Yoga</option>
                <option value="stretching">Gentle stretching</option>
                <option value="dancing">Dancing</option>
                <option value="relaxation">Relaxation</option>
                <option value="rest">Rest &amp; recovery</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-[#4A3D5C]">Activity title</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Duration (minutes)</span>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830] tabular-nums"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Comfort pace</span>
              <select
                value={comfortLevel}
                onChange={(e) =>
                  setComfortLevel(e.target.value as 'gentle' | 'moderate' | 'restorative')
                }
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
              >
                <option value="gentle">Gentle</option>
                <option value="moderate">Moderate</option>
                <option value="restorative">Restorative</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-[#4A3D5C]">How did your body feel?</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Back felt looser after 15 mins..."
              className="mt-1 w-full rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] p-3 text-sm text-[#221830]"
            />
          </label>

          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2 text-sm font-medium text-white hover:bg-[#5B21B6]"
          >
            <Plus className="h-4 w-4" />
            <span>Save Activity Record</span>
          </button>
        </form>

        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-[#221830]">
              Daily activity history
            </h2>
            <span className="text-xs text-[#6B5B7E] tabular-nums">{activities.length} logs</span>
          </div>

          {activities.length === 0 ? (
            <p className="mt-4 text-sm text-[#6B5B7E]">
              No activities logged yet. Choose a gentle option on the left.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0E9F7]">
              {activities.map((act) => (
                <li
                  key={act.id}
                  className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-xs font-medium text-[#9D174D] capitalize tabular-nums">
                      {act.type} · {act.durationMinutes} min · {act.comfortLevel} ·{' '}
                      {formatReadableDate(act.date)}
                      {act.isDemo ? ' · Demo sample' : ''}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#221830]">{act.title}</p>
                    {act.notes && <p className="mt-0.5 text-xs text-[#6B5B7E]">{act.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => void onDeleteActivity(act.id)}
                    aria-label="Delete activity record"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#9F1239] hover:bg-[#FFF1F2]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Reminders & Browser Notifications */}
      <section className="rounded-2xl border border-[#E6DDF0] bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#221830]">
              Wellness &amp; hygiene reminders
            </h2>
            <p className="mt-0.5 text-xs text-[#6B5B7E]">
              Supports browser notifications when enabled, with automatic in-app reminder banners.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onEnableBrowserNotifications()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-4 py-2 text-xs font-semibold text-[#4C1D95] hover:bg-[#F3EEF9] whitespace-nowrap shrink-0"
          >
            <Bell className="h-4 w-4" />
            <span>
              {notificationsEnabled
                ? 'Browser notifications active'
                : 'Enable browser notifications'}
            </span>
          </button>
        </div>

        <form
          onSubmit={handleAddReminder}
          className="mt-5 grid grid-cols-1 gap-3 border-y border-[#F0E9F7] py-4 sm:grid-cols-12"
        >
          <input
            type="text"
            required
            value={remTitle}
            onChange={(e) => setRemTitle(e.target.value)}
            placeholder="Custom reminder (e.g. Evening stretch or warm water)"
            className="min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830] sm:col-span-5"
          />
          <select
            value={remCategory}
            onChange={(e) => setRemCategory(e.target.value as ReminderCategory)}
            className="min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830] sm:col-span-2"
          >
            <option value="period">Period</option>
            <option value="hygiene">Hygiene</option>
            <option value="activity">Activity</option>
            <option value="meal">Meal</option>
            <option value="hydration">Hydration</option>
          </select>
          <input
            type="time"
            value={remTime}
            onChange={(e) => setRemTime(e.target.value)}
            className="min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830] tabular-nums sm:col-span-2"
          />
          <select
            value={remFreq}
            onChange={(e) => setRemFreq(e.target.value as 'daily' | 'every_4h' | 'cycle_day')}
            className="min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830] sm:col-span-1"
          >
            <option value="daily">Daily</option>
            <option value="every_4h">4h</option>
            <option value="cycle_day">Cycle</option>
          </select>
          <button
            type="submit"
            className="min-h-[44px] rounded-xl bg-[#6D28D9] px-4 text-sm font-medium text-white hover:bg-[#5B21B6] sm:col-span-2"
          >
            Add reminder
          </button>
        </form>

        <ul className="mt-4 divide-y divide-[#F0E9F7]">
          {reminders.map((rem) => (
            <li
              key={rem.id}
              className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-[#221830]">{rem.title}</p>
                <p className="text-xs text-[#6B5B7E] capitalize tabular-nums">
                  {rem.category} · {rem.time} · {rem.frequency.replace('_', ' ')} ·{' '}
                  {rem.enabled ? 'Active' : 'Paused'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onTriggerReminderTest(rem)}
                  className="min-h-[38px] rounded-xl border border-[#E6DDF0] px-3 text-xs font-medium text-[#4C1D95] hover:bg-[#F5F0FC]"
                >
                  Test alert
                </button>
                <button
                  type="button"
                  onClick={() => void onSaveReminder({...rem, enabled: !rem.enabled})}
                  className={`min-h-[38px] rounded-xl px-3 text-xs font-medium ${
                    rem.enabled
                      ? 'bg-[#EDE9FE] text-[#4C1D95]'
                      : 'border border-[#E6DDF0] text-[#6B5B7E]'
                  }`}
                >
                  {rem.enabled ? 'Pause' : 'Resume'}
                </button>
                <button
                  type="button"
                  onClick={() => void onDeleteReminder(rem.id)}
                  aria-label="Delete reminder"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#9F1239] hover:bg-[#FFF1F2]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
