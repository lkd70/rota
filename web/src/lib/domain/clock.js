/** @import { Calendar } from './calendar.js' */

/** @param {string} time */
export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** @param {number} totalMinutes */
export function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Explicit clock for "now" in the schedule timezone.
 * Spoofing is a UI/test concern — pass it in, don't mutate global state.
 */
export class Clock {
  /** @type {Calendar} */
  #calendar;

  /** @type {boolean} */
  #spoofed;

  /** @type {string | null} */
  #date;

  /** @type {number | null} */
  #minutes;

  /**
   * @param {Calendar} calendar
   * @param {{ spoofed?: boolean, date?: string | null, minutes?: number | null }} [options]
   */
  constructor(calendar, options = {}) {
    this.#calendar = calendar;
    this.#spoofed = options.spoofed ?? false;
    this.#date = options.date ?? null;
    this.#minutes = options.minutes ?? null;
  }

  /** @param {{ spoofed?: boolean, date?: string | null, minutes?: number | null }} options */
  with(options) {
    return new Clock(this.#calendar, {
      spoofed: options.spoofed ?? this.#spoofed,
      date: options.date ?? this.#date,
      minutes: options.minutes ?? this.#minutes,
    });
  }

  /** @returns {string} */
  realToday() {
    return this.#calendar.toIsoDate(new Date());
  }

  /** @returns {number} */
  realNowMinutes() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: this.#calendar.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());

    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
    return hour * 60 + minute;
  }

  /** @returns {string} */
  realTime() {
    return minutesToTime(this.realNowMinutes());
  }

  /** @returns {string} */
  today() {
    return this.#spoofed && this.#date ? this.#date : this.realToday();
  }

  /** @returns {number} */
  nowMinutes() {
    return this.#spoofed && this.#minutes != null ? this.#minutes : this.realNowMinutes();
  }
}
