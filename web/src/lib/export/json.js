import { downloadBlob } from './download.js';

/** @typedef {import('../domain/types.js').ScheduleDocument} ScheduleDocument */

/** @param {ScheduleDocument} schedule */
export function buildScheduleJson(schedule) {
  return JSON.stringify(
    {
      meta: schedule.meta,
      period: schedule.period,
      days: schedule.days,
    },
    null,
    2,
  );
}

/** @param {ScheduleDocument} schedule @param {string} [filename] */
export function downloadScheduleJson(schedule, filename = 'schedule.json') {
  downloadBlob(filename, buildScheduleJson(schedule), 'application/json;charset=utf-8');
}
