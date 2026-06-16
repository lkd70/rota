import {
  dayOrdinalParts,
  dayOfMonth,
  ordinalSuffix,
} from './dates.js';
import { getCalendar } from './calendar.js';

/** @param {string} time */
export function formatTimeShort(time) {
  const [h, m] = time.split(':');
  if (m === '00') return String(Number(h));
  return `${Number(h)}:${m}`;
}

/** @param {string} start @param {string} end @param {boolean} overnight */
export function formatRangeCompact(start, end, overnight) {
  const s = formatTimeShort(start);
  const e = formatTimeShort(end);
  return overnight ? `${s}→${e}` : `${s}–${e}`;
}

/** @param {string} dateStr @param {Intl.DateTimeFormatOptions} options */
function formatInScheduleZone(dateStr, options) {
  const calendar = getCalendar();
  return new Intl.DateTimeFormat('en-GB', { timeZone: calendar.timezone, ...options }).format(
    calendar.noonInstant(dateStr),
  );
}

/** @param {string} dateStr */
export function formatDate(dateStr) {
  const day = dayOfMonth(dateStr);
  const weekday = formatInScheduleZone(dateStr, { weekday: 'long' });
  const month = formatInScheduleZone(dateStr, { month: 'long' });
  const year = formatInScheduleZone(dateStr, { year: 'numeric' });
  return `${weekday}, ${day}${ordinalSuffix(day)} ${month} ${year}`;
}

/** @param {import('./types.js').Period} period */
export function formatPeriodHeading(period) {
  const start = formatDate(period.start);
  const endDay = dayOfMonth(period.end);
  const endMonth = formatInScheduleZone(period.end, { month: 'long' });
  const endYear = formatInScheduleZone(period.end, { year: 'numeric' });
  return `${start} – ${endDay}${ordinalSuffix(endDay)} ${endMonth} ${endYear}`;
}

/** @param {string} dateStr */
export function formatWeekdayShort(dateStr) {
  return formatInScheduleZone(dateStr, { weekday: 'short' });
}

/** @param {string} dateStr */
export function formatMonthShort(dateStr) {
  return formatInScheduleZone(dateStr, { month: 'short' });
}

/** @param {string} dateStr */
export function formatShortDate(dateStr) {
  const day = dayOfMonth(dateStr);
  const weekday = formatInScheduleZone(dateStr, { weekday: 'short' });
  const month = formatInScheduleZone(dateStr, { month: 'short' });
  return `${weekday}, ${day}${ordinalSuffix(day)} ${month}`;
}

/** @param {number} totalMinutes */
export function formatDurationMinutes(totalMinutes) {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (remHours === 0 && mins === 0) return `${days} day${days === 1 ? '' : 's'}`;
  if (mins === 0) return `${days}d ${remHours}h`;
  return `${days}d ${remHours}h ${mins}m`;
}

/** @param {number} totalMinutes */
export function formatDurationCompact(totalMinutes) {
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d${remHours}h` : `${days}d`;
}

export { dayOrdinalParts };
