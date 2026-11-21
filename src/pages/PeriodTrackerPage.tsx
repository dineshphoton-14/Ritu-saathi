import React, {useMemo, useState} from 'react';
import {Calendar, ChevronLeft, ChevronRight, Edit3, Plus, Trash2} from 'lucide-react';
import type {FlowLevel, PeriodRecord} from '../types/wellness';
import {
  addDays,
  computeCycleStats,
  formatReadableDate,
  getMonthCalendarDays,
  isDateInPeriod,
  toISODate,
} from '../utils/cycleMath';
import {createId} from '../db/rituDb';

interface PeriodTrackerPageProps {
  periods: PeriodRecord[];
  onSavePeriod: (record: PeriodRecord) => Promise<void>;
  onDeletePeriod: (id: string) => Promise<void>;
}

const SYMPTOM_OPTIONS = [
  'Mild cramps',
  'Strong cramps',
  'Bloating',
  'Lower back ache',
  'Headache',
  'Fatigue',
  'Breast tenderness',
  'Acne breakout',
];

const MOOD_OPTIONS = ['Calm', 'Balanced', 'Sensitive', 'Low energy', 'Irritable', 'Hopeful'];

export const PeriodTrackerPage: React.FC<PeriodTrackerPageProps> = ({
  periods,
  onSavePeriod,
  onDeletePeriod,
}) => {
  const stats = useMemo(() => computeCycleStats(periods), [periods]);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(toISODate(today));
  const [endDate, setEndDate] = useState(addDays(toISODate(today), 4));
  const [cycleLength, setCycleLength] = useState<number>(stats.averageCycleLength || 28);
  const [flowLevel, setFlowLevel] = useState<FlowLevel>('medium');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState('Calm');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const calendarDays = useMemo(
    () => getMonthCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const predictedRange = useMemo(() => {
    if (!stats.estimatedNextPeriod) return null;
    return {
      start: stats.estimatedNextPeriod,
      end: addDays(stats.estimatedNextPeriod, Math.max(3, stats.averagePeriodDuration - 1)),
    };
  }, [stats.estimatedNextPeriod, stats.averagePeriodDuration]);

  const resetForm = () => {
    setEditingId(null);
    const todayIso = toISODate(new Date());
    setStartDate(todayIso);
    setEndDate(addDays(todayIso, 4));
    setCycleLength(stats.averageCycleLength || 28);
    setFlowLevel('medium');
    setSymptoms([]);
    setMood('Calm');
    setNotes('');
    setFormError(null);
  };

  const handleEdit = (record: PeriodRecord) => {
    setEditingId(record.id);
    setStartDate(record.startDate);
    setEndDate(record.endDate);
    setCycleLength(record.cycleLength);
    setFlowLevel(record.flowLevel);
    setSymptoms(record.symptoms);
    setMood(record.mood);
    setNotes(record.notes);
    setFormError(null);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const toggleSymptom = (sym: string) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((item) => item !== sym) : [...prev, sym],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!startDate || !endDate) {
      setFormError('Please select both start and end dates.');
      return;
    }
    if (endDate < startDate) {
      setFormError('Period end date cannot be earlier than the start date.');
      return;
    }
    if (cycleLength < 15 || cycleLength > 90) {
      setFormError('Cycle length should be between 15 and 90 days.');
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const existing = periods.find((p) => p.id === editingId);
      const record: PeriodRecord = {
        id: editingId ?? createId('period'),
        startDate,
        endDate,
        cycleLength: Number(cycleLength),
        flowLevel,
        symptoms,
        mood,
        notes: notes.trim(),
        isDemo: false,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      await onSavePeriod(record);
      resetForm();
    } catch {
      setFormError('Unable to save this cycle record locally. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const todayIso = toISODate(today);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#221830]">
            Period &amp; Cycle Tracker
          </h1>
          <p className="mt-1 text-sm text-[#524366]">
            Record your menstrual dates, flow, symptoms, and mood privately on your device.
          </p>
        </div>
        <p className="text-xs text-[#6B5B7E]">
          Cycle predictions are estimates only and not a medical diagnosis.
        </p>
      </header>

      {/* Statistics Row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
          <p className="text-xs text-[#6B5B7E]">Estimated next period</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-[#9D174D] tabular-nums">
            {stats.estimatedNextPeriod ? formatReadableDate(stats.estimatedNextPeriod) : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
          <p className="text-xs text-[#6B5B7E]">Average cycle length</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-[#221830] tabular-nums">
            {stats.averageCycleLength} days
          </p>
        </div>
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
          <p className="text-xs text-[#6B5B7E]">Average flow duration</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-[#221830] tabular-nums">
            {stats.averagePeriodDuration} days
          </p>
        </div>
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
          <p className="text-xs text-[#6B5B7E]">Logged cycles</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-[#221830] tabular-nums">
            {stats.recordedCyclesCount}
          </p>
        </div>
      </section>

      {/* Log Form + Interactive Calendar */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-[#221830]">
              {editingId ? 'Edit period record' : 'Log period dates'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-medium text-[#6D28D9] hover:underline"
              >
                Cancel edit
              </button>
            )}
          </div>

          {formError && (
            <div className="rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-4 py-3 text-xs font-medium text-[#9F1239]">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Period start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830] focus:border-[#6D28D9] focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Period end date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830] focus:border-[#6D28D9] focus:outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Cycle length (days)</span>
              <input
                type="number"
                min={15}
                max={90}
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830] tabular-nums focus:border-[#6D28D9] focus:outline-none"
              />
            </label>

            <div>
              <span className="block text-xs font-medium text-[#4A3D5C]">Flow level</span>
              <div className="mt-1.5 grid grid-cols-4 gap-1 rounded-xl bg-[#F3EEF9] p-1">
                {(['spotting', 'light', 'medium', 'heavy'] as FlowLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFlowLevel(level)}
                    className={`min-h-[36px] rounded-lg px-2 text-xs font-medium capitalize transition-colors ${
                      flowLevel === level
                        ? 'bg-white text-[#6D28D9] shadow-xs'
                        : 'text-[#5F5070] hover:text-[#221830]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-[#4A3D5C]">Symptoms</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((sym) => {
                const active = symptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`min-h-[36px] rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'border-[#6D28D9] bg-[#EDE9FE] text-[#4C1D95]'
                        : 'border-[#E6DDF0] bg-[#FAF8FC] text-[#524366] hover:bg-[#F3EEF9]'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-[#4A3D5C]">Mood</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`min-h-[36px] rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                    mood === m
                      ? 'border-[#DB2777] bg-[#FCE7F3] text-[#9D174D]'
                      : 'border-[#E6DDF0] bg-[#FAF8FC] text-[#524366] hover:bg-[#F3EEF9]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-[#4A3D5C]">Personal notes (optional)</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sleep quality, cramp relief that helped, or questions for your doctor..."
              className="mt-1.5 w-full rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] p-3 text-sm text-[#221830] placeholder:text-[#8E7EA3] focus:border-[#6D28D9] focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5B21B6] disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            <span>{saving ? 'Saving...' : editingId ? 'Update Cycle Record' : 'Save Cycle Record'}</span>
          </button>
        </form>

        {/* Calendar View */}
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#6D28D9]" />
              <h2 className="font-display text-xl font-semibold text-[#221830]">{monthLabel}</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6DDF0] text-[#4C1D95] hover:bg-[#F5F0FC]"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6DDF0] text-[#4C1D95] hover:bg-[#F5F0FC]"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#6B5B7E]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {calendarDays.map((iso, index) => {
              if (!iso) return <div key={`empty_${index}`} className="h-11" />;
              const dayNum = Number(iso.slice(8, 10));
              const logged = isDateInPeriod(iso, periods);
              const isPredicted =
                !logged &&
                Boolean(
                  predictedRange && iso >= predictedRange.start && iso <= predictedRange.end,
                );
              const isToday = iso === todayIso;

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setStartDate(iso);
                    setEndDate(addDays(iso, 4));
                  }}
                  title={
                    logged
                      ? `Logged period (${logged.flowLevel})`
                      : isPredicted
                        ? 'Estimated next period window (not a diagnosis)'
                        : 'Click to set as period start date'
                  }
                  className={`flex h-11 flex-col items-center justify-center rounded-xl text-xs font-medium tabular-nums transition-colors ${
                    logged
                      ? 'bg-[#DB2777] text-white'
                      : isPredicted
                        ? 'border border-dashed border-[#C084FC] bg-[#FAF5FF] text-[#6D28D9]'
                        : isToday
                          ? 'border border-[#6D28D9] bg-[#EDE9FE] text-[#4C1D95]'
                          : 'bg-[#FAF8FC] text-[#221830] hover:bg-[#F3EEF9]'
                  }`}
                >
                  <span>{dayNum}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-[#F0E9F7] pt-4 text-xs text-[#524366]">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-xs bg-[#DB2777]" />
              Logged period days
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-xs border border-dashed border-[#C084FC] bg-[#FAF5FF]" />
              Estimated next window
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-xs border border-[#6D28D9] bg-[#EDE9FE]" />
              Today
            </span>
          </div>
          <p className="mt-3 text-xs text-[#6B5B7E]">
            Tip: Tap any date on the calendar to fill the start date in the form.
          </p>
        </div>
      </section>

      {/* Period History */}
      <section className="rounded-2xl border border-[#E6DDF0] bg-white p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-[#221830]">Period history</h2>
          <span className="text-xs text-[#6B5B7E] tabular-nums">{periods.length} entries</span>
        </div>

        {periods.length === 0 ? (
          <p className="mt-4 text-sm text-[#6B5B7E]">
            No cycles logged yet. Use the form above to record your first cycle.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-[#F0E9F7]">
            {periods.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#221830] tabular-nums">
                    {formatReadableDate(item.startDate)} — {formatReadableDate(item.endDate)}
                    {item.isDemo ? ' · Demo sample' : ''}
                  </p>
                  <p className="text-xs text-[#524366] capitalize tabular-nums">
                    Flow: {item.flowLevel} · Cycle length: {item.cycleLength} days · Mood: {item.mood}
                  </p>
                  {item.symptoms.length > 0 && (
                    <p className="text-xs text-[#6B5B7E]">
                      Symptoms: {item.symptoms.join(' · ')}
                    </p>
                  )}
                  {item.notes && <p className="text-xs text-[#4A3D5C]">{item.notes}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E6DDF0] px-3 py-1.5 text-xs font-medium text-[#4C1D95] hover:bg-[#F5F0FC]"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>

                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          await onDeletePeriod(item.id);
                          setConfirmDeleteId(null);
                        }}
                        className="min-h-[40px] rounded-xl bg-[#BE123C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#9F1239]"
                      >
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="min-h-[40px] rounded-xl border border-[#E6DDF0] px-3 py-1.5 text-xs font-medium text-[#524366]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#FECDD3] px-3 py-1.5 text-xs font-medium text-[#9F1239] hover:bg-[#FFF1F2]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
