import { describe, expect, it } from 'vitest';
import { scheduleStats } from './stats.js';

describe('scheduleStats streaks', () => {
  /** @type {import('./types.js').Day[]} */
  const days = [
    { date: '2026-06-11', type: 'norm', start: '09:00', end: '17:00' },
    { date: '2026-06-12', type: 'norm', start: '09:00', end: '17:00' },
    { date: '2026-06-13', type: 'norm', start: '09:00', end: '17:00' },
    { date: '2026-06-14', type: 'rest' },
    { date: '2026-06-15', type: 'rest' },
    { date: '2026-06-16', type: 'shift', start: '14:00', end: '22:00' },
    { date: '2026-06-17', type: 'shift', start: '14:00', end: '22:00' },
  ];

  it('tracks longest consecutive rest and work days', () => {
    const stats = scheduleStats(days);
    expect(stats.longestRestStreak).toBe(2);
    expect(stats.longestWorkStreak).toBe(3);
  });
});
