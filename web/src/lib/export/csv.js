import { dayKindFor, formatWeekdayShort } from '../domain/index.js';
import { downloadBlob } from './download.js';

/** @typedef {import('../domain/types.js').ScheduleDocument} ScheduleDocument */

/** @param {string} value */
function escapeCsv(value) {
  const text = value ?? '';
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

/** @param {ScheduleDocument} schedule */
export function buildScheduleCsv(schedule) {
  const rows = [
    ['date', 'weekday', 'type', 'kind', 'start', 'end', 'note'].map(escapeCsv).join(','),
  ];

  for (const day of schedule.days) {
    rows.push(
      [
        day.date,
        formatWeekdayShort(day.date),
        day.type,
        dayKindFor(day),
        day.start ?? '',
        day.end ?? '',
        day.note ?? '',
      ]
        .map(escapeCsv)
        .join(','),
    );
  }

  return `${rows.join('\n')}\n`;
}

/** @param {ScheduleDocument} schedule @param {string} [filename] */
export function downloadScheduleCsv(schedule, filename = 'schedule.csv') {
  downloadBlob(filename, buildScheduleCsv(schedule), 'text/csv;charset=utf-8');
}
