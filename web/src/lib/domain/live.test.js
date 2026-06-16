import { beforeEach, describe, expect, it } from 'vitest';
import { createCalendar, setActiveCalendar } from './calendar.js';
import {
  buildPageTitle,
  formatNextShiftStart,
  nextWorkStart,
  resolveLinkFocusDate,
} from './live.js';
import { indexByDate } from './grid.js';

const timezone = 'Europe/London';

beforeEach(() => {
  setActiveCalendar(createCalendar(timezone));
});

describe('resolveLinkFocusDate', () => {
  it('resolves today alias and rejects invalid values', () => {
    expect(resolveLinkFocusDate('today', '2026-06-11')).toBe('2026-06-11');
    expect(resolveLinkFocusDate('2026-06-12', '2026-06-11')).toBe('2026-06-12');
    expect(resolveLinkFocusDate('nope', '2026-06-11')).toBeNull();
    expect(resolveLinkFocusDate(null, '2026-06-11')).toBeNull();
  });
});

describe('nextWorkStart', () => {
  /** @type {import('./types.js').Day[]} */
  const days = [
    { date: '2026-06-11', type: 'shift', start: '14:00', end: '22:00' },
    { date: '2026-06-12', type: 'rest' },
    { date: '2026-06-13', type: 'shift', start: '14:00', end: '22:00' },
  ];

  it('finds the next upcoming shift from a rest day', () => {
    const next = nextWorkStart(days, '2026-06-12', 600);
    expect(next?.start.date).toBe('2026-06-13');
    expect(next?.until).toBeGreaterThan(0);
  });
});

describe('formatNextShiftStart', () => {
  it('labels same-day and next-day starts', () => {
    expect(
      formatNextShiftStart({ date: '2026-06-11', minutes: 840 }, '2026-06-11', 'BST'),
    ).toBe('at 14:00 BST');
    expect(
      formatNextShiftStart({ date: '2026-06-12', minutes: 840 }, '2026-06-11', 'BST'),
    ).toBe('tomorrow at 14:00 BST');
  });
});

describe('buildPageTitle', () => {
  it('reflects rest, busy, and free states', () => {
    expect(
      buildPageTitle({
        inPeriod: true,
        busyNow: false,
        todayKind: 'rest',
        shiftEnd: null,
        nextShift: null,
        title: 'Availability',
      }),
    ).toBe('Off today · Availability');

    expect(
      buildPageTitle({
        inPeriod: true,
        busyNow: true,
        todayKind: 'late',
        shiftEnd: {
          until: 30,
          end: { date: '2026-06-11', minutes: 1320 },
          day: { date: '2026-06-11', type: 'shift', start: '14:00', end: '22:00' },
        },
        nextShift: null,
        title: 'Availability',
      }),
    ).toContain('On shift');
  });
});

describe('indexByDate', () => {
  it('indexes days by ISO date', () => {
    /** @type {import('./types.js').Day[]} */
    const days = [{ date: '2026-06-11', type: 'rest' }];
    expect(indexByDate(days)['2026-06-11'].type).toBe('rest');
  });
});
