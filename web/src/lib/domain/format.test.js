import { beforeEach, describe, expect, it } from 'vitest';
import { createCalendar, setActiveCalendar } from './calendar.js';
import { formatDate, formatPeriodHeading, formatShortDate } from './format.js';

const timezone = 'Europe/London';

beforeEach(() => {
  setActiveCalendar(createCalendar(timezone));
});

describe('formatDate', () => {
  it('formats using the schedule timezone calendar', () => {
    expect(formatDate('2026-06-11')).toContain('11th');
    expect(formatDate('2026-06-11')).toContain('June');
  });
});

describe('formatPeriodHeading', () => {
  it('combines full start date with compact end date', () => {
    const heading = formatPeriodHeading({ start: '2026-06-11', end: '2026-07-19' });
    expect(heading).toContain('2026');
    expect(heading).toContain('19th July');
  });
});

describe('formatShortDate', () => {
  it('includes weekday and ordinal day', () => {
    expect(formatShortDate('2026-06-13')).toMatch(/13th/);
  });
});
