import { getCalendar } from './calendar.js';

/** @param {number} day */
export function ordinalSuffix(day) {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/** @param {string} dateStr */
export function addDaysIso(dateStr, days = 1) {
  return getCalendar().addDays(dateStr, days);
}

/** @param {string} fromDate @param {number} fromMinutes @param {string} toDate @param {number} toMinutes */
export function minutesFromTo(fromDate, fromMinutes, toDate, toMinutes) {
  return getCalendar().minutesFromTo(fromDate, fromMinutes, toDate, toMinutes);
}

/** @param {string} dateStr */
export function mondayOnOrBefore(dateStr) {
  return getCalendar().mondayOnOrBefore(dateStr);
}

/** @param {string} dateStr */
export function sundayOnOrAfter(dateStr) {
  return getCalendar().sundayOnOrAfter(dateStr);
}

/** @param {string} dateStr */
export function isWeekend(dateStr) {
  return getCalendar().isWeekend(dateStr);
}

/** @param {string} dateStr */
export function isFirstOfMonth(dateStr) {
  return getCalendar().isFirstOfMonth(dateStr);
}

/** @param {string} dateStr */
export function dayOfMonth(dateStr) {
  return getCalendar().dayOfMonth(dateStr);
}

/** @param {string} dateStr */
export function dayOrdinalParts(dateStr) {
  const num = dayOfMonth(dateStr);
  return { num, suffix: ordinalSuffix(num) };
}

/** @param {string} dateStr @returns {Date} */
export function parseIsoDate(dateStr) {
  return getCalendar().noonInstant(dateStr);
}
