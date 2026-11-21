import React, {useState} from 'react';
import {ChevronDown, ChevronUp, Mic, Plus, Stethoscope} from 'lucide-react';
import {PCOS_CONTENT} from '../data/wellnessContent';
import type {HealthNote, NavSection} from '../types/wellness';
import {createId} from '../db/rituDb';
import {toISODate} from '../utils/cycleMath';

interface PcosPcodPageProps {
  onSaveNote: (note: HealthNote) => Promise<void>;
  onNavigate: (section: NavSection) => void;
}

export const PcosPcodPage: React.FC<PcosPcodPageProps> = ({onSaveNote, onNavigate}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSavePcosNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    const now = new Date().toISOString();
    await onSaveNote({
      id: createId('note'),
      date: toISODate(new Date()),
      category: 'pcos',
      title: noteTitle.trim() || 'PCOS/PCOD Wellness Note',
      content: noteContent.trim(),
      isDemo: false,
      createdAt: now,
      updatedAt: now,
    });
    setNoteTitle('');
    setNoteContent('');
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3500);
  };

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[#E6DDF0] bg-white p-6 sm:p-8">
        <p className="text-xs font-medium text-[#6D28D9]">
          Educational wellness guide · Non-diagnostic information
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#221830]">
          Understanding PCOS &amp; PCOD
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#524366]">
          {PCOS_CONTENT.intro}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate('assistant')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2 text-sm font-medium text-white hover:bg-[#5B21B6]"
          >
            <Mic className="h-4 w-4" />
            <span>Ask RituSaathi about PCOS / PCOD</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('diet')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-4 py-2 text-sm font-medium text-[#4C1D95] hover:bg-[#F3EEF9]"
          >
            <span>Explore balanced meal ideas</span>
          </button>
        </div>
      </header>

      {/* PCOS vs PCOD Comparison */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {PCOS_CONTENT.comparison.map((card) => (
          <div key={card.title} className="rounded-2xl border border-[#E6DDF0] bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-[#221830]">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4A3D5C]">{card.summary}</p>
            <ul className="mt-4 space-y-2 border-t border-[#F0E9F7] pt-4 text-sm text-[#524366]">
              {card.points.map((pt) => (
                <li key={pt} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C3AED]" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Common Symptoms + When to Consult a Doctor */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-7">
          <h2 className="font-display text-xl font-semibold text-[#221830]">
            Common signs people notice
          </h2>
          <p className="mt-1 text-xs text-[#6B5B7E]">
            Experiencing one or more of these does not diagnose PCOS/PCOD — share patterns with your doctor.
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {PCOS_CONTENT.commonSymptoms.map((sym) => (
              <li
                key={sym}
                className="rounded-xl border border-[#F0E9F7] bg-[#FAF8FC] px-3.5 py-2.5 text-sm text-[#221830]"
              >
                {sym}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#FBCFE8] bg-[#FDF2F8] p-6 lg:col-span-5">
          <div className="flex items-center gap-2.5 text-[#9D174D]">
            <Stethoscope className="h-5 w-5 shrink-0" />
            <h2 className="font-display text-xl font-semibold">When to see a doctor</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#6B2143]">
            RituSaathi cannot diagnose PCOS or PCOD. Please consult a gynecologist or healthcare
            provider if you notice:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[#6B2143]">
            <li>• Periods absent for 90 days or longer (without pregnancy)</li>
            <li>• Cycles consistently shorter than 21 days or longer than 35–40 days</li>
            <li>• Heavy bleeding soaking a pad every 1–2 hours, or severe pelvic pain</li>
            <li>• Rapid hair growth, persistent fatigue, or emotional distress</li>
          </ul>
        </div>
      </section>

      {/* Healthy Daily Routine Guidance */}
      <section className="rounded-2xl border border-[#E6DDF0] bg-white p-6">
        <h2 className="font-display text-xl font-semibold text-[#221830]">
          Supportive daily lifestyle rhythm
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PCOS_CONTENT.dailyRoutines.map((slot) => (
            <div key={slot.time} className="rounded-xl border border-[#F0E9F7] bg-[#FAF8FC] p-4">
              <p className="text-xs font-semibold text-[#6D28D9]">{slot.time}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4A3D5C]">{slot.habit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs + Quick Note Logger */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-7">
          <h2 className="font-display text-xl font-semibold text-[#221830]">
            Frequently asked questions
          </h2>
          <div className="mt-4 divide-y divide-[#F0E9F7]">
            {PCOS_CONTENT.faqs.map((faq, idx) => {
              const expanded = openFaq === idx;
              return (
                <div key={faq.q} className="py-3 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(expanded ? null : idx)}
                    className="flex w-full min-h-[44px] items-center justify-between gap-4 text-left text-sm font-semibold text-[#221830]"
                  >
                    <span>{faq.q}</span>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-[#6D28D9]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#6B5B7E]" />
                    )}
                  </button>
                  {expanded && (
                    <p className="mt-2 text-sm leading-relaxed text-[#524366]">{faq.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSavePcosNote}
          className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-5 space-y-4"
        >
          <h2 className="font-display text-xl font-semibold text-[#221830]">
            Save a private PCOS/PCOD note
          </h2>
          <p className="text-xs text-[#6B5B7E]">
            Keep questions for your gynecologist or lifestyle observations offline in My Records.
          </p>
          {savedBanner && (
            <div className="rounded-xl border border-[#C4B5FD] bg-[#F5F3FF] px-3 py-2 text-xs font-medium text-[#5B21B6]">
              Saved privately to your offline IndexedDB records.
            </div>
          )}
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Title (e.g. Questions for doctor visit)"
            className="w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830] focus:border-[#6D28D9] focus:outline-none"
          />
          <textarea
            rows={4}
            required
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write energy levels, sleep habits, or symptoms you want to discuss with a doctor..."
            className="w-full rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] p-3 text-sm text-[#221830] focus:border-[#6D28D9] focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2 text-sm font-medium text-white hover:bg-[#5B21B6]"
          >
            <Plus className="h-4 w-4" />
            <span>Save to Offline Records</span>
          </button>
        </form>
      </section>
    </div>
  );
};
