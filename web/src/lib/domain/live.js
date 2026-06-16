import { addDaysIso, minutesFromTo } from './dates.js';
import { formatShortDate } from './format.js';
import { indexByDate } from './grid.js';
import { isInWorkPeriod, workEndPoint, workStartPoint } from './intervals.js';
import { minutesToTime } from './clock.js';

/** @import { Day, NextWorkStart, ActiveWorkEnd, DateTimePoint } from './types.js' */

/** @param {Day[]} days @param {string} fromDate @param {number} nowMins */
export function nextWorkStart(days, fromDate, nowMins) {
  for (const day of days) {
    if (!day.start || !day.end) continue;
    if (isInWorkPeriod(day, fromDate, nowMins)) continue;
    const start = workStartPoint(day);
    if (!start) continue;
    const until = minutesFromTo(fromDate, nowMins, start.date, start.minutes);
    if (until > 0) return { until, start, day };
  }
  return null;
}

/** @param {Day[]} days @param {string} fromDate @param {number} nowMins */
export function activeWorkEnd(days, fromDate, nowMins) {
  const byDate = indexByDate(days);
  const todayDay = byDate[fromDate];
  if (todayDay && isInWorkPeriod(todayDay, fromDate, nowMins)) {
    const end = workEndPoint(todayDay);
    if (end) {
      return {
        until: minutesFromTo(fromDate, nowMins, end.date, end.minutes),
        end,
        day: todayDay,
      };
    }
  }

  const idx = days.findIndex((day) => day.date === fromDate);
  if (idx > 0) {
    const prev = days[idx - 1];
    if (prev.start && prev.end && isInWorkPeriod(prev, fromDate, nowMins)) {
      const end = workEndPoint(prev);
      if (end) {
        return {
          until: minutesFromTo(fromDate, nowMins, end.date, end.minutes),
          end,
          day: prev,
        };
      }
    }
  }

  return null;
}

/** @param {Day[]} days @param {string} fromDate */
export function nextDayOff(days, fromDate) {
  for (const day of days) {
    if (day.date <= fromDate) continue;
    if (day.type === 'rest') return day;
  }
  return null;
}

/** @param {string} periodEnd @param {string} fromDate */
export function daysLeftInCover(periodEnd, fromDate) {
  if (fromDate > periodEnd) return 0;
  return Math.floor(minutesFromTo(fromDate, 0, periodEnd, 0) / 1440) + 1;
}

/** @param {string} periodEnd @param {string} fromDate */
export function formatDaysLeftInCover(periodEnd, fromDate) {
  const days = daysLeftInCover(periodEnd, fromDate);
  if (days <= 0) return null;
  return `${days} day${days === 1 ? '' : 's'} left in cover`;
}

/** @param {DateTimePoint} start @param {string} todayDate @param {string} timezoneLabel */
export function formatNextShiftStart(start, todayDate, timezoneLabel) {
  const time = minutesToTime(start.minutes);
  if (start.date === todayDate) return `at ${time} ${timezoneLabel}`;
  if (start.date === addDaysIso(todayDate, 1)) return `tomorrow at ${time} ${timezoneLabel}`;
  return `${formatShortDate(start.date)} at ${time} ${timezoneLabel}`;
}

/** @param {DateTimePoint} end @param {string} todayDate @param {string} timezoneLabel */
export function formatWorkEndTime(end, todayDate, timezoneLabel) {
  const time = minutesToTime(end.minutes);
  if (end.date === todayDate) return `${time} ${timezoneLabel}`;
  if (end.date === addDaysIso(todayDate, 1)) return `${time} ${timezoneLabel} tomorrow`;
  return `${time} ${timezoneLabel} · ${formatShortDate(end.date)}`;
}

/** @param {string | null | undefined} param @param {string} realToday */
export function resolveLinkFocusDate(param, realToday) {
  if (!param) return null;
  if (param === 'today') return realToday;
  return /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : null;
}

/**
 * @param {{
 *   inPeriod: boolean,
 *   busyNow: boolean,
 *   todayKind: import('./types.js').DayKind,
 *   shiftEnd: ActiveWorkEnd | null,
 *   nextShift: NextWorkStart | null,
 *   title: string,
 * }} state
 */
export function buildPageTitle(state) {
  const base = state.title;
  if (!state.inPeriod) return base;
  if (state.todayKind === 'rest') return `Off today · ${base}`;
  if (state.busyNow && state.shiftEnd) {
    return `On shift · ends ${minutesToTime(state.shiftEnd.end.minutes)} · ${base}`;
  }
  if (state.nextShift) {
    return `Free · next shift ${minutesToTime(state.nextShift.start.minutes)} · ${base}`;
  }
  return base;
}
