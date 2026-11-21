import React, {useRef, useState} from 'react';
import {Bell, Download, Globe, RotateCcw, ShieldCheck, Trash2, Upload, Wifi, WifiOff} from 'lucide-react';
import type {SupportedLanguage, UserSettings} from '../types/wellness';
import {SUPPORTED_LANGUAGES} from '../data/wellnessContent';
import {PWAInstallButton} from '../components/PWAInstallButton';

interface SettingsPageProps {
  settings: UserSettings;
  isOnline: boolean;
  onChangeLanguage: (lang: SupportedLanguage) => Promise<void>;
  onEnableNotifications: () => Promise<void>;
  onToggleNotifications: (enabled: boolean) => Promise<void>;
  onExportBackup: () => Promise<void>;
  onImportBackup: (file: File) => Promise<void>;
  onRestoreDemoData: () => Promise<void>;
  onDeleteAllData: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  isOnline,
  onChangeLanguage,
  onEnableNotifications,
  onToggleNotifications,
  onExportBackup,
  onImportBackup,
  onRestoreDemoData,
  onDeleteAllData,
}) => {
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#221830]">
            Settings &amp; Privacy
          </h1>
          <p className="mt-1 text-sm text-[#524366]">
            Customize language, reminders, offline backups, and local data privacy.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#E6DDF0] bg-white px-4 py-2 text-xs font-medium text-[#221830]">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-[#6D28D9]" />
              <span>Online · Live Gemini AI available</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-[#9D174D]" />
              <span>Offline · Local records &amp; guides active</span>
            </>
          )}
        </div>
      </header>

      {feedback && (
        <div className="rounded-2xl border border-[#C4B5FD] bg-[#F5F3FF] px-4 py-3 text-xs font-medium text-[#4C1D95]">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Language Selection */}
        <section className="rounded-2xl border border-[#E6DDF0] bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#4C1D95]">
            <Globe className="h-5 w-5" />
            <h2 className="font-display text-xl font-semibold text-[#221830]">
              Preferred language
            </h2>
          </div>
          <p className="text-xs text-[#524366]">
            Used across RituSaathi Voice Assistant, Period Hygiene Q&amp;A, and meal suggestions.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={async () => {
                  await onChangeLanguage(lang.code);
                  showFeedback(`Language updated to ${lang.name}.`);
                }}
                className={`min-h-[48px] rounded-xl border px-4 py-2.5 text-left transition-colors ${
                  settings.language === lang.code
                    ? 'border-[#6D28D9] bg-[#EDE9FE] text-[#4C1D95]'
                    : 'border-[#E6DDF0] bg-[#FAF8FC] text-[#221830] hover:bg-[#F3EEF9]'
                }`}
              >
                <p className="text-sm font-semibold">{lang.nativeName}</p>
                <p className="text-xs text-[#6B5B7E]">{lang.name}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="rounded-2xl border border-[#E6DDF0] bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#4C1D95]">
            <Bell className="h-5 w-5" />
            <h2 className="font-display text-xl font-semibold text-[#221830]">
              Notification preferences
            </h2>
          </div>
          <p className="text-xs text-[#524366]">
            Enable gentle browser alerts for pad changes, hydration, meals, and daily movement.
            In-app reminders always remain active as a fallback.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                if (settings.notificationsEnabled) {
                  await onToggleNotifications(false);
                  showFeedback('Browser notifications paused.');
                } else {
                  await onEnableNotifications();
                }
              }}
              className="min-h-[44px] rounded-xl bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5B21B6]"
            >
              {settings.notificationsEnabled
                ? 'Pause Browser Notifications'
                : 'Enable Browser Notifications'}
            </button>

            <PWAInstallButton compact />
          </div>
        </section>

        {/* Data Export & Import */}
        <section className="rounded-2xl border border-[#E6DDF0] bg-white p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#221830]">
            Personal data backup &amp; deletion
          </h2>
          <p className="text-xs leading-relaxed text-[#524366]">
            Export all your offline period cycles, notes, meals, and activity logs as a portable JSON
            file, or restore a previous backup anytime.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={async () => {
                await onExportBackup();
                showFeedback('Exported RituSaathi JSON backup.');
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-4 text-xs font-semibold text-[#4C1D95] hover:bg-[#F3EEF9]"
            >
              <Download className="h-4 w-4" />
              <span>Export JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-4 text-xs font-semibold text-[#4C1D95] hover:bg-[#F3EEF9]"
            >
              <Upload className="h-4 w-4" />
              <span>Import JSON Backup</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  await onImportBackup(file);
                  showFeedback('Backup restored successfully.');
                } catch (err) {
                  showFeedback(err instanceof Error ? err.message : 'Invalid backup file.');
                }
                e.target.value = '';
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={async () => {
                await onRestoreDemoData();
                showFeedback('Restored demonstration sample records.');
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#E6DDF0] px-4 text-xs font-medium text-[#524366] hover:bg-[#FAF8FC]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Restore Demo Samples</span>
            </button>
          </div>

          <div className="border-t border-[#F0E9F7] pt-4">
            {!confirmWipe ? (
              <button
                type="button"
                onClick={() => setConfirmWipe(true)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-4 text-xs font-semibold text-[#9F1239] hover:bg-[#FFE4E6]"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete All Local Data</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-medium text-[#9F1239]">
                  Erase all local cycles, meals, notes, and activities?
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await onDeleteAllData();
                    setConfirmWipe(false);
                    showFeedback('All local records have been erased from this device.');
                  }}
                  className="min-h-[40px] rounded-xl bg-[#BE123C] px-4 text-xs font-semibold text-white hover:bg-[#9F1239]"
                >
                  Yes, Delete Everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmWipe(false)}
                  className="min-h-[40px] rounded-xl border border-[#E6DDF0] px-4 text-xs font-medium text-[#524366]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Privacy & Medical Safety Information */}
        <section className="rounded-2xl border border-[#E6DDF0] bg-white p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#4C1D95]">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="font-display text-xl font-semibold text-[#221830]">
              Privacy &amp; medical safety
            </h2>
          </div>
          <ul className="space-y-2 text-xs leading-relaxed text-[#524366]">
            <li>
              • <strong>On-device storage:</strong> All period dates, symptoms, moods, meals, and
              personal notes live strictly in your browser’s IndexedDB storage.
            </li>
            <li>
              • <strong>Explicit AI sharing:</strong> Personal health records are never sent to
              Gemini AI unless you explicitly check the opt-in toggle in the Voice Assistant.
            </li>
            <li>
              • <strong>Educational purpose:</strong> Cycle predictions and AI explanations are
              general wellness support — never a medical diagnosis or prescription. Always seek a
              doctor for severe pain, heavy bleeding, or prolonged cycle absence.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
