import React, {useRef, useState} from 'react';
import {Download, Edit3, Plus, ShieldCheck, Trash2, Upload} from 'lucide-react';
import type {
  ActivityRecord,
  HealthNote,
  MealRecord,
  NoteCategory,
  PeriodRecord,
} from '../types/wellness';
import {createId} from '../db/rituDb';
import {formatReadableDate, toISODate} from '../utils/cycleMath';

interface OfflineRecordsPageProps {
  periods: PeriodRecord[];
  meals: MealRecord[];
  activities: ActivityRecord[];
  notes: HealthNote[];
  onSaveNote: (note: HealthNote) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onDeletePeriod: (id: string) => Promise<void>;
  onDeleteMeal: (id: string) => Promise<void>;
  onDeleteActivity: (id: string) => Promise<void>;
  onExportBackup: () => Promise<void>;
  onImportBackup: (file: File) => Promise<void>;
  onClearDemoData: () => Promise<void>;
}

type RecordFilter = 'all' | 'notes' | 'periods' | 'meals' | 'activities';

export const OfflineRecordsPage: React.FC<OfflineRecordsPageProps> = ({
  periods,
  meals,
  activities,
  notes,
  onSaveNote,
  onDeleteNote,
  onDeletePeriod,
  onDeleteMeal,
  onDeleteActivity,
  onExportBackup,
  onImportBackup,
  onClearDemoData,
}) => {
  const [filter, setFilter] = useState<RecordFilter>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDate, setNoteDate] = useState(toISODate(new Date()));
  const [category, setCategory] = useState<NoteCategory>('general');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('Calm');
  const [content, setContent] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasDemoItems =
    periods.some((p) => p.isDemo) ||
    meals.some((m) => m.isDemo) ||
    activities.some((a) => a.isDemo) ||
    notes.some((n) => n.isDemo);

  const resetNoteForm = () => {
    setEditingNoteId(null);
    setNoteDate(toISODate(new Date()));
    setCategory('general');
    setTitle('');
    setMood('Calm');
    setContent('');
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const now = new Date().toISOString();
    const existing = notes.find((n) => n.id === editingNoteId);
    await onSaveNote({
      id: editingNoteId ?? createId('note'),
      date: noteDate,
      category,
      title: title.trim(),
      mood: mood.trim(),
      content: content.trim(),
      isDemo: false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    resetNoteForm();
    setStatusMessage('Health record saved privately to IndexedDB.');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await onImportBackup(file);
      setStatusMessage('Backup restored successfully to your local IndexedDB vault.');
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Unable to import this backup file.',
      );
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Privacy Header + Backup Actions */}
      <section className="rounded-3xl border border-[#E6DDF0] bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#6D28D9]">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Local IndexedDB Vault · Works Offline</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold text-[#221830]">
              My Offline Health Records
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#524366]">
              Your cycle history, symptoms, mood reflections, PCOS notes, meals, and activities stay
              privately inside your browser’s IndexedDB storage on this device. Nothing is sent to
              Gemini AI unless you explicitly choose to share a summary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => void onExportBackup()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5B21B6]"
            >
              <Download className="h-4 w-4" />
              <span>Export Backup (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-4 py-2 text-xs font-semibold text-[#4C1D95] hover:bg-[#F3EEF9]"
            >
              <Upload className="h-4 w-4" />
              <span>Import Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={(e) => void handleImportFile(e)}
              className="hidden"
            />

            {hasDemoItems && (
              <button
                type="button"
                onClick={() => void onClearDemoData()}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-4 py-2 text-xs font-semibold text-[#9F1239] hover:bg-[#FFE4E6]"
              >
                <span>Clear Demo Samples</span>
              </button>
            )}
          </div>
        </div>

        {statusMessage && (
          <p className="mt-4 rounded-xl border border-[#C4B5FD] bg-[#F5F3FF] px-4 py-2.5 text-xs font-medium text-[#4C1D95]">
            {statusMessage}
          </p>
        )}
      </section>

      {/* Add / Edit Personal Note + Filtered Records List */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSaveNote}
          className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-5 space-y-4 self-start"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-[#221830]">
              {editingNoteId ? 'Edit health note' : 'Add personal health record'}
            </h2>
            {editingNoteId && (
              <button
                type="button"
                onClick={resetNoteForm}
                className="text-xs font-medium text-[#6D28D9] hover:underline"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Date</span>
              <input
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
              >
                <option value="general">Personal note</option>
                <option value="pcos">PCOS / PCOD note</option>
                <option value="symptom">Symptom record</option>
                <option value="mood">Mood record</option>
                <option value="cycle">Cycle observation</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Title</span>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Energy & sleep log"
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Mood</span>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="Calm, Sensitive..."
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-[#4A3D5C]">Details</span>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your symptoms, doctor questions, mood, or personal wellness notes..."
              className="mt-1 w-full rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] p-3 text-sm text-[#221830]"
            />
          </label>

          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2 text-sm font-medium text-white hover:bg-[#5B21B6]"
          >
            <Plus className="h-4 w-4" />
            <span>{editingNoteId ? 'Update Record' : 'Save Record Offline'}</span>
          </button>
        </form>

        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-[#221830]">
              Saved records
            </h2>
            <div className="inline-flex flex-wrap gap-1 rounded-xl bg-[#F3EEF9] p-1">
              {(
                [
                  {id: 'all', label: 'All'},
                  {id: 'notes', label: 'Notes & Mood'},
                  {id: 'periods', label: 'Periods'},
                  {id: 'meals', label: 'Diet'},
                  {id: 'activities', label: 'Activities'},
                ] as Array<{id: RecordFilter; label: string}>
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`min-h-[34px] rounded-lg px-2.5 text-xs font-medium transition-colors ${
                    filter === tab.id
                      ? 'bg-white text-[#6D28D9] shadow-xs'
                      : 'text-[#524366] hover:text-[#221830]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#F0E9F7]">
            {(filter === 'all' || filter === 'notes') &&
              notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start justify-between gap-4 py-3.5 first:pt-0"
                >
                  <div>
                    <p className="text-xs font-medium text-[#6D28D9] capitalize tabular-nums">
                      Note · {note.category} · {formatReadableDate(note.date)}
                      {note.mood ? ` · Mood: ${note.mood}` : ''}
                      {note.isDemo ? ' · Demo sample' : ''}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#221830]">{note.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#524366]">
                      {note.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setNoteDate(note.date);
                        setCategory(note.category);
                        setTitle(note.title);
                        setMood(note.mood ?? '');
                        setContent(note.content);
                      }}
                      aria-label="Edit note"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4C1D95] hover:bg-[#F5F0FC]"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDeleteNote(note.id)}
                      aria-label="Delete note"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-[#9F1239] hover:bg-[#FFF1F2]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

            {(filter === 'all' || filter === 'periods') &&
              periods.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between gap-4 py-3.5"
                >
                  <div>
                    <p className="text-xs font-medium text-[#9D174D] capitalize tabular-nums">
                      Period · {formatReadableDate(p.startDate)} – {formatReadableDate(p.endDate)}
                      {p.isDemo ? ' · Demo sample' : ''}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#221830] capitalize">
                      Flow: {p.flowLevel} · Cycle: {p.cycleLength}d · Mood: {p.mood}
                    </p>
                    {p.symptoms.length > 0 && (
                      <p className="mt-0.5 text-xs text-[#524366]">{p.symptoms.join(' · ')}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void onDeletePeriod(p.id)}
                    aria-label="Delete period record"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#9F1239] hover:bg-[#FFF1F2]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

            {(filter === 'all' || filter === 'meals') &&
              meals.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-xs font-medium text-[#7E22CE] capitalize tabular-nums">
                      Diet · {m.mealType} · {formatReadableDate(m.date)}
                      {m.isDemo ? ' · Demo sample' : ''}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#221830]">{m.items}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onDeleteMeal(m.id)}
                    aria-label="Delete meal record"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#9F1239] hover:bg-[#FFF1F2]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

            {(filter === 'all' || filter === 'activities') &&
              activities.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-xs font-medium text-[#5B21B6] capitalize tabular-nums">
                      Activity · {a.type} · {a.durationMinutes} min · {formatReadableDate(a.date)}
                      {a.isDemo ? ' · Demo sample' : ''}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#221830]">{a.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onDeleteActivity(a.id)}
                    aria-label="Delete activity record"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#9F1239] hover:bg-[#FFF1F2]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

            {notes.length + periods.length + meals.length + activities.length === 0 && (
              <p className="py-4 text-sm text-[#6B5B7E]">
                Your offline vault is empty. Add your first note or cycle entry to store it locally.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
