const TZ = 'Europe/London';

/** @typedef {{ date: string, day: string, type: 'rest'|'norm'|'shift', hours?: string, note?: string }} ScheduleEntry */
/** @typedef {{ enabled: boolean, date: string | null, minutes: number | null }} TestClock */

/** @type {TestClock} */
let testClock = { enabled: false, date: null, minutes: null };

/** @param {Partial<TestClock>} config */
export function configureTestClock(config) {
  testClock = { ...testClock, ...config };
}

export function resetTestClock() {
  testClock = { enabled: false, date: null, minutes: null };
}

export function isTestMode() {
  return testClock.enabled;
}

/** @returns {string} YYYY-MM-DD in BST (always real clock) */
export function realTodayBst() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

/** @returns {number} minutes since midnight in BST (always real clock) */
export function realNowMinutesBst() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

/** @returns {string} HH:MM in BST (always real clock) */
export function realTimeBst() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return `${hour}:${minute}`;
}

/** @returns {string} YYYY-MM-DD in BST */
export function todayBst() {
  if (testClock.enabled && testClock.date) return testClock.date;
  return realTodayBst();
}

/** @returns {number} minutes since midnight in BST */
export function nowMinutesBst() {
  if (testClock.enabled && testClock.minutes != null) return testClock.minutes;
  return realNowMinutesBst();
}

/** @param {string} time HH:MM */
export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** @param {string} hours "HH:MM-HH:MM" */
export function parseHours(hours) {
  const [start, end] = hours.split('-');
  return {
    start,
    end,
    overnight: timeToMinutes(start) >= timeToMinutes(end),
  };
}

/** @param {number} now @param {string} start @param {string} end */
export function isBusyAt(now, start, end) {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  if (s < e) return now >= s && now < e;
  return now >= s || now < e;
}

/** @param {ScheduleEntry | undefined} entry */
export function isEntryBusyNow(entry) {
  if (!entry?.hours) return false;
  const { start, end } = parseHours(entry.hours);
  return isBusyAt(nowMinutesBst(), start, end);
}

/**
 * @param {string} dateStr
 * @param {ScheduleEntry[]} schedule
 * @param {Record<string, ScheduleEntry>} byDate
 */
export function isBusyOnDate(dateStr, schedule, byDate) {
  const entry = byDate[dateStr];
  if (isEntryBusyNow(entry)) return true;

  const idx = schedule.findIndex((d) => d.date === dateStr);
  if (idx > 0) {
    const prev = schedule[idx - 1];
    if (prev?.hours) {
      const { start, end, overnight } = parseHours(prev.hours);
      if (overnight && isBusyAt(nowMinutesBst(), start, end)) return true;
    }
  }
  return false;
}

/** @typedef {'rest' | 'office' | 'late' | 'night'} DayKind */

/** @param {ScheduleEntry | undefined} entry @returns {DayKind} */
export function dayKindFor(entry) {
  if (!entry || entry.type === 'rest') return 'rest';
  if (entry.type === 'norm') return 'office';
  if (entry.hours && parseHours(entry.hours).overnight) return 'night';
  return 'late';
}

/** @param {ScheduleEntry | undefined} entry */
export function labelFor(entry) {
  const kind = dayKindFor(entry);
  if (kind === 'rest') return 'Day off';
  if (kind === 'office') return 'Office hours';
  if (kind === 'late') return 'Evening cover';
  return 'Overnight cover';
}

/** @param {ScheduleEntry[]} schedule */
export function chunkWeeks(schedule) {
  /** @type {ScheduleEntry[][]} */
  const weeks = [];
  for (let i = 0; i < schedule.length; i += 7) {
    weeks.push(schedule.slice(i, i + 7));
  }
  return weeks;
}

/** @param {ScheduleEntry[]} week */
export function weekRangeLabel(week) {
  if (!week.length) return '';
  const start = week[0].date;
  const end = week[week.length - 1].date;
  const startDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
    new Date(`${start}T12:00:00`),
  );
  const endDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
    new Date(`${end}T12:00:00`),
  );
  return start === end ? startDate : `${startDate} – ${endDate}`;
}

/** @typedef {{ type: 'rest' } | { type: 'range', start: string, end: string, overnight: boolean }} TimeDisplay */

/** @param {ScheduleEntry | undefined} entry @returns {TimeDisplay} */
export function timeDisplayFor(entry) {
  if (!entry || entry.type === 'rest') return { type: 'rest' };
  if (!entry.hours) return { type: 'rest' };
  const { start, end, overnight } = parseHours(entry.hours);
  return { type: 'range', start, end, overnight };
}

/** @param {ScheduleEntry | undefined} entry */
export function hoursFor(entry) {
  if (!entry) return null;
  const display = timeDisplayFor(entry);
  if (display.type === 'rest') return 'Day off';
  if (display.overnight) return `${display.start} – ${display.end} (next day)`;
  return `${display.start} – ${display.end}`;
}

/** @param {ScheduleEntry | undefined} entry */
export function detailFor(entry) {
  if (!entry) return 'Outside cover period';
  const display = timeDisplayFor(entry);
  if (display.type === 'rest') return 'Available all day — no work scheduled';
  if (display.overnight) {
    return `Working ${display.start} to ${display.end} next day (BST) · Free outside these hours`;
  }
  return `Working ${display.start} to ${display.end} (BST) · Free outside these hours`;
}

/** @param {string} dateStr */
export function formatDate(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** @param {string} dateStr */
export function formatDayNum(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(date);
}

/** @param {string} dateStr */
export function formatMonthShort(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date);
}

/** @param {string} dateStr */
export function formatShortDate(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/** @param {string} start @param {string} end @param {number} [days=1] */
export function addDaysIso(start, days = 1) {
  const date = new Date(`${start}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/** @param {ScheduleEntry[]} schedule @param {string} fromDate @param {number} count */
export function sliceFrom(schedule, fromDate, count) {
  const idx = schedule.findIndex((d) => d.date >= fromDate);
  if (idx === -1) return [];
  return schedule.slice(idx, idx + count);
}

/** @param {ScheduleEntry[]} schedule */
export function indexByDate(schedule) {
  /** @type {Record<string, ScheduleEntry>} */
  const map = {};
  for (const entry of schedule) map[entry.date] = entry;
  return map;
}
