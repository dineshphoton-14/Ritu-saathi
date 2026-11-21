import type {PeriodRecord} from '../types/wellness';

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function diffDays(startIso: string, endIso: string): number {
  const a = parseISODate(startIso).getTime();
  const b = parseISODate(endIso).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function formatReadableDate(iso: string): string {
  if (!iso) return '—';
  const d = parseISODate(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export interface CycleStats {
  lastPeriod: PeriodRecord | null;
  averageCycleLength: number;
  averagePeriodDuration: number;
  estimatedNextPeriod: string | null;
  daysUntilNext: number | null;
  currentCycleDay: number | null;
  recordedCyclesCount: number;
}

export function computeCycleStats(
  periods: PeriodRecord[],
  fallbackCycleLength = 28,
): CycleStats {
  if (periods.length === 0) {
    return {
      lastPeriod: null,
      averageCycleLength: fallbackCycleLength,
      averagePeriodDuration: 5,
      estimatedNextPeriod: null,
      daysUntilNext: null,
      currentCycleDay: null,
      recordedCyclesCount: 0,
    };
  }

  const sorted = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const lastPeriod = sorted[0];

  // Compute observed cycle intervals between consecutive starts when >= 2 records exist
  const intervals: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = diffDays(sorted[i + 1].startDate, sorted[i].startDate);
    if (gap >= 18 && gap <= 60) {
      intervals.push(gap);
    }
  }

  const averageCycleLength =
    intervals.length > 0
      ? Math.round(intervals.reduce((acc, v) => acc + v, 0) / intervals.length)
      : lastPeriod.cycleLength || fallbackCycleLength;

  const durations = sorted.map((p) => Math.max(1, diffDays(p.startDate, p.endDate) + 1));
  const averagePeriodDuration = Math.round(
    durations.reduce((acc, v) => acc + v, 0) / durations.length,
  );

  const estimatedNextPeriod = addDays(lastPeriod.startDate, averageCycleLength);
  const todayIso = toISODate(new Date());
  const daysUntilNext = diffDays(todayIso, estimatedNextPeriod);
  const currentCycleDay = Math.max(1, diffDays(lastPeriod.startDate, todayIso) + 1);

  return {
    lastPeriod,
    averageCycleLength,
    averagePeriodDuration,
    estimatedNextPeriod,
    daysUntilNext,
    currentCycleDay,
    recordedCyclesCount: sorted.length,
  };
}

export function isDateInPeriod(iso: string, periods: PeriodRecord[]): PeriodRecord | undefined {
  return periods.find((p) => iso >= p.startDate && iso <= p.endDate);
}

export function getMonthCalendarDays(year: number, monthIndex: number): Array<string | null> {
  const firstDay = new Date(year, monthIndex, 1);
  const startWeekday = firstDay.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<string | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISODate(new Date(year, monthIndex, day)));
  }
  return cells;
}
