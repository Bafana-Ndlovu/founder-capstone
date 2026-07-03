import type { ISODate } from '../data/app-types.ts';

export function toISO(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): ISODate {
  return toISO(new Date());
}

/**
 * Parse as a LOCAL calendar date. `new Date('2026-07-04')` parses as UTC
 * midnight, which is the previous evening in SAST and shifts every date by a
 * day — so we split the string ourselves.
 */
export function parseISO(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function daysFromToday(n: number): ISODate {
  const now = new Date();
  return toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + n));
}

export function addDaysISO(iso: ISODate, n: number): ISODate {
  const d = parseISO(iso);
  if (!d) return iso;
  return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

/** Number of calendar days from start to end, inclusive. Null if invalid. */
export function inclusiveDays(start: ISODate, end: ISODate): number | null {
  const s = parseISO(start);
  const e = parseISO(end);
  if (!s || !e || e.getTime() < s.getTime()) return null;
  return Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1;
}

/** Every date from start to end, inclusive. Empty if the range is invalid. */
export function eachDateISO(start: ISODate, end: ISODate): ISODate[] {
  const days = inclusiveDays(start, end);
  if (days === null) return [];
  const out: ISODate[] = [];
  for (let i = 0; i < days; i++) out.push(addDaysISO(start, i));
  return out;
}

/** Whole days between two ISO dates (b - a), or null if either is invalid. */
export function daysBetween(a: ISODate, b: ISODate): number | null {
  const da = parseISO(a);
  const db = parseISO(b);
  if (!da || !db) return null;
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

const dayFmt = new Intl.DateTimeFormat('en-ZA', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

export function formatDay(iso: ISODate): string {
  const d = parseISO(iso);
  return d ? dayFmt.format(d) : iso;
}

export function formatRange(start: ISODate, end: ISODate): string {
  return start === end ? formatDay(start) : `${formatDay(start)} – ${formatDay(end)}`;
}

const monthYearFmt = new Intl.DateTimeFormat('en-ZA', { month: 'long', year: 'numeric' });

export function formatMonthYear(iso: string): string {
  const d = parseISO(iso);
  return d ? monthYearFmt.format(d) : iso;
}

/** Collapse a sorted list of dates into consecutive ranges for display. */
export function groupConsecutive(dates: ISODate[]): Array<{ start: ISODate; end: ISODate }> {
  const sorted = [...dates].sort();
  const ranges: Array<{ start: ISODate; end: ISODate }> = [];
  for (const date of sorted) {
    const last = ranges[ranges.length - 1];
    if (last && addDaysISO(last.end, 1) === date) {
      last.end = date;
    } else {
      ranges.push({ start: date, end: date });
    }
  }
  return ranges;
}
