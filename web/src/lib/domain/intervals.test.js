import { createCalendar, setActiveCalendar } from '$lib/domain/calendar.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Clock } from './clock.js';
import { dayRange, isBusyAt, isBusyOnDate, shiftDurationMinutes } from './intervals.js';
import { chunkWeeks, indexByDate, restGapBetween } from './grid.js';

const timezone = 'Europe/London';

beforeEach(() => {
  setActiveCalendar(createCalendar(timezone));
});

afterEach(() => {
  setActiveCalendar(createCalendar('UTC'));
});

describe('isBusyAt', () => {
  it('detects daytime shifts', () => {
    expect(isBusyAt(600, '09:00', '17:00')).toBe(true);
    expect(isBusyAt(480, '09:00', '17:00')).toBe(false);
    expect(isBusyAt(1020, '09:00', '17:00')).toBe(false);
  });

  it('detects overnight shifts', () => {
    expect(isBusyAt(1320, '22:00', '06:00')).toBe(true);
    expect(isBusyAt(180, '22:00', '06:00')).toBe(true);
    expect(isBusyAt(720, '22:00', '06:00')).toBe(false);
  });
});

describe('isBusyOnDate', () => {
  /** @type {import('./types.js').Day[]} */
  const days = [
    { date: '2026-06-11', type: 'shift', start: '22:00', end: '06:00' },
    { date: '2026-06-12', type: 'rest' },
  ];
  const byDate = indexByDate(days);
  const calendar = createCalendar(timezone);

  it('carries overnight busy state into the next calendar day', () => {
    const clock = new Clock(calendar, { spoofed: true, date: '2026-06-12', minutes: 120 });
    expect(isBusyOnDate('2026-06-12', days, byDate, clock.nowMinutes())).toBe(true);
  });
});

describe('shiftDurationMinutes', () => {
  it('counts overnight shift length across midnight', () => {
    /** @type {import('./types.js').Day} */
    const day = { date: '2026-06-11', type: 'shift', start: '22:00', end: '06:00' };
    expect(shiftDurationMinutes(day)).toBe(480);
  });

  it('returns zero for rest days', () => {
    expect(shiftDurationMinutes({ date: '2026-06-12', type: 'rest' })).toBe(0);
  });
});

describe('dayRange', () => {
  it('flags overnight ranges', () => {
    expect(dayRange({ date: '2026-06-11', type: 'shift', start: '22:00', end: '06:00' })).toEqual({
      start: '22:00',
      end: '06:00',
      overnight: true,
    });
  });
});

describe('chunkWeeks', () => {
  it('pads partial weeks at the start and end of the cover period', () => {
    /** @type {import('./types.js').Day[]} */
    const days = [
      { date: '2026-06-11', type: 'shift', start: '14:00', end: '22:00' },
      { date: '2026-06-12', type: 'rest' },
    ];
    const weeks = chunkWeeks(days);
    expect(weeks).toHaveLength(1);
    expect(weeks[0]).toHaveLength(7);
    expect(weeks[0][0].day).toBeNull();
    expect(weeks[0].find((cell) => cell.date === '2026-06-11')?.day?.date).toBe('2026-06-11');
  });
});

describe('restGapBetween', () => {
  it('measures free time between consecutive shifts', () => {
    /** @type {import('./types.js').WeekCell} */
    const prev = { date: '2026-06-11', day: { date: '2026-06-11', type: 'shift', start: '14:00', end: '22:00' } };
    /** @type {import('./types.js').WeekCell} */
    const next = { date: '2026-06-12', day: { date: '2026-06-12', type: 'shift', start: '14:00', end: '22:00' } };
    expect(restGapBetween(prev, next)).toBe(960);
  });
});

describe('calendar', () => {
  it('adds days within the configured timezone', () => {
    const calendar = createCalendar('Europe/London');
    expect(calendar.addDays('2026-06-11', 1)).toBe('2026-06-12');
    expect(calendar.weekday('2026-06-11')).toBe(4);
  });
});
