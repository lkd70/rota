import { addDaysIso, labelFor } from '../domain/index.js';
import { dayRange } from '../domain/intervals.js';
import { downloadBlob } from './download.js';

/** @param {string} date @param {string} time */
function icsDateTime(date, time) {
  const [y, m, d] = date.split('-');
  const [hh, mm] = time.split(':');
  return `${y}${m}${d}T${hh}${mm}00`;
}

/** @param {Date} date */
function icsStamp(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** @param {string} text */
function escapeIcs(text) {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** @param {import('../domain/types.js').Day[]} days @param {import('../domain/types.js').ScheduleMeta} meta */
export function buildIcs(days, meta) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WC Availability//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(meta.eyebrow ?? meta.title)}`,
    `X-WR-TIMEZONE:${meta.timezone}`,
  ];

  const stamp = icsStamp(new Date());

  for (const day of days) {
    if (!day.start || !day.end) continue;
    const range = dayRange(day);
    const endDate = range?.overnight ? addDaysIso(day.date, 1) : day.date;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${day.date}-${day.start}@wc-availability`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;TZID=${meta.timezone}:${icsDateTime(day.date, day.start)}`);
    lines.push(`DTEND;TZID=${meta.timezone}:${icsDateTime(endDate, day.end)}`);
    lines.push(`SUMMARY:${escapeIcs(labelFor(day))}`);
    lines.push(`DESCRIPTION:${escapeIcs(`${day.start}–${day.end}${range?.overnight ? ' (next day)' : ''} ${meta.timezoneLabel}`)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}

/** @param {import('../domain/types.js').Day[]} days @param {import('../domain/types.js').ScheduleMeta} meta @param {string} [filename] */
export function downloadIcs(days, meta, filename = 'wc-availability.ics') {
  downloadBlob(filename, buildIcs(days, meta), 'text/calendar;charset=utf-8');
}
