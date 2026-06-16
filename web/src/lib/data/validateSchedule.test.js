import schema from '../../../../schema/schedule.schema.json';
import schedule from '../../../../data/schedule.json';
import { describe, expect, it } from 'vitest';
import { validateScheduleDocument } from './validateSchedule.js';

describe('validateScheduleDocument', () => {
  it('accepts the canonical schedule', () => {
    expect(validateScheduleDocument(schema, schedule).days.length).toBeGreaterThan(0);
  });

  it('rejects gaps in consecutive dates', () => {
    const broken = structuredClone(schedule);
    broken.days.splice(1, 1);
    expect(() => validateScheduleDocument(schema, broken)).toThrow(/missing day/i);
  });

  it('rejects duplicate dates', () => {
    const broken = structuredClone(schedule);
    broken.days[1] = { ...broken.days[0] };
    expect(() => validateScheduleDocument(schema, broken)).toThrow(/unique dates/i);
  });
});
