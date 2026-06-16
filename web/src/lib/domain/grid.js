import { getCalendar } from './calendar.js';
import {
  addDaysIso,
  minutesFromTo,
  mondayOnOrBefore,
  sundayOnOrAfter,
} from './dates.js';
import { workEndPoint, workStartPoint } from './intervals.js';

/** @import { Day, WeekCell } from './types.js' */

/** @param {Day[]} days */
export function indexByDate(days) {
  /** @type {Record<string, Day>} */
  const map = {};
  for (const day of days) map[day.date] = day;
  return map;
}

/** @param {Day[]} days @returns {WeekCell[][]} */
export function chunkWeeks(days) {
  if (!days.length) return [];

  const byDate = indexByDate(days);
  const periodStart = days[0].date;
  const periodEnd = days.at(-1).date;
  const gridStart = mondayOnOrBefore(periodStart);
  const gridEnd = sundayOnOrAfter(periodEnd);

  /** @type {WeekCell[][]} */
  const weeks = [];
  let cursor = gridStart;

  while (cursor <= gridEnd) {
    /** @type {WeekCell[]} */
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push({ date: cursor, day: byDate[cursor] ?? null });
      cursor = addDaysIso(cursor, 1);
    }
    weeks.push(week);
  }

  return weeks;
}

/** @param {WeekCell[]} week */
export function weekRangeLabel(week) {
  if (!week.length) return '';
  const calendar = getCalendar();
  const start = week[0].date;
  const end = week[6].date;
  const startDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: calendar.timezone,
    day: 'numeric',
    month: 'short',
  }).format(calendar.noonInstant(start));
  const endDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: calendar.timezone,
    day: 'numeric',
    month: 'short',
  }).format(calendar.noonInstant(end));
  return `${startDate} – ${endDate}`;
}

/** @param {WeekCell} prev @param {WeekCell} next */
export function restGapBetween(prev, next) {
  const end = workEndPoint(prev.day);
  const start = workStartPoint(next.day);
  if (!end || !start) return null;
  const gap = minutesFromTo(end.date, end.minutes, start.date, start.minutes);
  return gap > 0 ? gap : null;
}

/** @param {WeekCell[]} week */
export function weekCoverCounts(week) {
  let shifts = 0;
  let off = 0;
  for (const cell of week) {
    if (!cell.day) continue;
    if (cell.day.type === 'rest') off++;
    else shifts++;
  }
  return { shifts, off };
}

/** @param {WeekCell[]} week */
export function formatWeekCounts(week) {
  const { shifts, off } = weekCoverCounts(week);
  if (shifts === 0 && off === 0) return '';
  const parts = [];
  if (shifts) parts.push(`${shifts} shift${shifts === 1 ? '' : 's'}`);
  if (off) parts.push(`${off} off`);
  return parts.join(', ');
}
