/**
 * Timezone-aware calendar operations on ISO dates (YYYY-MM-DD).
 * All date boundaries use the schedule IANA timezone, not the browser locale.
 *
 * @param {string} timezone
 */
export function createCalendar(timezone) {
  const isoFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  });

  /** @type {Record<string, number>} */
  const weekdayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  /** @param {Date} instant @returns {string} */
  function toIsoDate(instant) {
    return isoFormatter.format(instant);
  }

  /** @param {string} isoDate @returns {Date} */
  function noonInstant(isoDate) {
    let guess = new Date(`${isoDate}T12:00:00.000Z`);
    for (let i = 0; i < 4; i++) {
      const local = toIsoDate(guess);
      if (local === isoDate) return guess;
      guess = new Date(guess.getTime() + (local < isoDate ? 1 : -1) * 86_400_000);
    }
    return guess;
  }

  /** @param {string} a @param {string} b @returns {number} */
  function compare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  /** @param {string} isoDate @param {number} [days=1] */
  function addDays(isoDate, days = 1) {
    return toIsoDate(new Date(noonInstant(isoDate).getTime() + days * 86_400_000));
  }

  /** @param {string} isoDate @returns {number} */
  function weekday(isoDate) {
    const name = weekdayFormatter.format(noonInstant(isoDate));
    return weekdayIndex[name] ?? 0;
  }

  /** @param {string} isoDate */
  function isWeekend(isoDate) {
    const day = weekday(isoDate);
    return day === 0 || day === 6;
  }

  /** @param {string} isoDate */
  function dayOfMonth(isoDate) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      day: 'numeric',
    }).formatToParts(noonInstant(isoDate));
    return Number(parts.find((part) => part.type === 'day')?.value ?? 1);
  }

  /** @param {string} isoDate */
  function isFirstOfMonth(isoDate) {
    return dayOfMonth(isoDate) === 1;
  }

  /** @param {string} isoDate */
  function mondayOnOrBefore(isoDate) {
    const day = weekday(isoDate);
    const diff = day === 0 ? 6 : day - 1;
    return addDays(isoDate, -diff);
  }

  /** @param {string} isoDate */
  function sundayOnOrAfter(isoDate) {
    const day = weekday(isoDate);
    return addDays(isoDate, day === 0 ? 0 : 7 - day);
  }

  /** @param {string} fromDate @param {number} fromMinutes @param {string} toDate @param {number} toMinutes */
  function minutesFromTo(fromDate, fromMinutes, toDate, toMinutes) {
    let total = toMinutes - fromMinutes;
    let cursor = fromDate;
    while (compare(cursor, toDate) < 0) {
      total += 1440;
      cursor = addDays(cursor, 1);
    }
    while (compare(cursor, toDate) > 0) {
      total -= 1440;
      cursor = addDays(cursor, -1);
    }
    return total;
  }

  return {
    timezone,
    toIsoDate,
    noonInstant,
    addDays,
    compare,
    weekday,
    isWeekend,
    dayOfMonth,
    isFirstOfMonth,
    mondayOnOrBefore,
    sundayOnOrAfter,
    minutesFromTo,
  };
}

/** @typedef {ReturnType<typeof createCalendar>} Calendar */

/**
 * Active calendar for the loaded schedule.
 * Single-schedule app: domain helpers read this after bootstrap in schedule.js.
 * Clock instances are passed explicitly; the calendar is ambient per loaded document.
 */
/** @type {Calendar} */
let activeCalendar = createCalendar('UTC');

/** @param {Calendar} calendar */
export function setActiveCalendar(calendar) {
  activeCalendar = calendar;
}

/** @returns {Calendar} */
export function getCalendar() {
  return activeCalendar;
}
