import { describe, expect, it } from 'vitest';
import { legendLabelFor, scheduleLegend } from './kinds.js';

describe('scheduleLegend', () => {
  /** @type {import('./types.js').Day[]} */
  const days = [
    { date: '2026-06-11', type: 'rest' },
    { date: '2026-06-12', type: 'norm', start: '09:00', end: '17:00' },
    { date: '2026-06-13', type: 'shift', start: '14:00', end: '22:00' },
    { date: '2026-06-14', type: 'shift', start: '22:00', end: '06:00' },
  ];

  it('derives labels from sample days in the schedule', () => {
    const legend = scheduleLegend(days);
    expect(legend.find((entry) => entry.kind === 'office')?.label).toBe('Office 9–17');
    expect(legend.find((entry) => entry.kind === 'late')?.label).toContain('14–22');
    expect(legend.find((entry) => entry.kind === 'night')?.label).toContain('22→6');
  });

  it('falls back when a kind is absent', () => {
    expect(legendLabelFor('rest', undefined)).toBe('Day off');
  });
});
