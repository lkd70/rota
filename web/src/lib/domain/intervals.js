import { timeToMinutes } from './clock.js';
import { addDaysIso, minutesFromTo } from './dates.js';

/** @import { Day } from './types.js' */

/** @param {Day | null | undefined} day */
export function dayRange(day) {
  if (!day?.start || !day?.end) return null;
  return {
    start: day.start,
    end: day.end,
    overnight: timeToMinutes(day.start) >= timeToMinutes(day.end),
  };
}

/** @param {number} now @param {string} start @param {string} end */
export function isBusyAt(now, start, end) {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  if (s < e) return now >= s && now < e;
  return now >= s || now < e;
}

/** @param {Day | undefined} day @param {number} nowMins */
export function isDayBusyNow(day, nowMins) {
  const range = dayRange(day);
  if (!range) return false;
  return isBusyAt(nowMins, range.start, range.end);
}

/** @param {string} dateStr @param {Day[]} days @param {Record<string, Day>} byDate @param {number} nowMins */
export function isBusyOnDate(dateStr, days, byDate, nowMins) {
  if (isDayBusyNow(byDate[dateStr], nowMins)) return true;

  const idx = days.findIndex((day) => day.date === dateStr);
  if (idx > 0) {
    const prev = days[idx - 1];
    const range = dayRange(prev);
    if (range?.overnight && isBusyAt(nowMins, range.start, range.end)) return true;
  }
  return false;
}

/** @param {Day | null | undefined} day @returns {import('./types.js').DateTimePoint | null} */
export function workStartPoint(day) {
  const range = dayRange(day);
  if (!range || !day) return null;
  return { date: day.date, minutes: timeToMinutes(range.start) };
}

/** @param {Day | null | undefined} day @returns {import('./types.js').DateTimePoint | null} */
export function workEndPoint(day) {
  const range = dayRange(day);
  if (!range || !day) return null;
  return {
    date: range.overnight ? addDaysIso(day.date, 1) : day.date,
    minutes: timeToMinutes(range.end),
  };
}

/** @param {Day} day @param {string} fromDate @param {number} nowMins */
export function isInWorkPeriod(day, fromDate, nowMins) {
  const start = workStartPoint(day);
  const end = workEndPoint(day);
  if (!start || !end) return false;
  const afterStart = minutesFromTo(start.date, start.minutes, fromDate, nowMins) >= 0;
  const beforeEnd = minutesFromTo(fromDate, nowMins, end.date, end.minutes) > 0;
  return afterStart && beforeEnd;
}

/** @param {Day | null | undefined} day */
export function shiftDurationMinutes(day) {
  const start = workStartPoint(day);
  const end = workEndPoint(day);
  if (!start || !end) return 0;
  return minutesFromTo(start.date, start.minutes, end.date, end.minutes);
}

/** @typedef {{ type: 'rest' } | { type: 'range', start: string, end: string, overnight: boolean }} TimeDisplay */

/** @param {Day | undefined} day @returns {TimeDisplay} */
export function timeDisplayFor(day) {
  if (!day || day.type === 'rest') return { type: 'rest' };
  const range = dayRange(day);
  if (!range) return { type: 'rest' };
  return { type: 'range', ...range };
}
