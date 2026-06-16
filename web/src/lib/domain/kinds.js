import { dayRange } from './intervals.js';
import { formatRangeCompact, formatTimeShort } from './format.js';

/** @import { Day, DayKind } from './types.js' */

/** @type {DayKind[]} */
const LEGEND_KINDS = ['rest', 'office', 'late', 'night'];

/** @param {DayKind} kind @param {Day | undefined} sample */
export function legendLabelFor(kind, sample) {
  if (kind === 'rest') return 'Day off';
  if (!sample?.start || !sample.end) return labelFor(sample);
  const range = dayRange(sample);
  const hours = range
    ? formatRangeCompact(sample.start, sample.end, range.overnight)
    : `${formatTimeShort(sample.start)}–${formatTimeShort(sample.end)}`;
  if (kind === 'office') return `Office ${hours}`;
  if (kind === 'late') return `Evening cover ${hours}`;
  return `Overnight cover ${hours}`;
}

/** @param {Day[]} days */
export function scheduleLegend(days) {
  /** @type {Partial<Record<DayKind, Day>>} */
  const samples = {};
  for (const day of days) {
    const kind = dayKindFor(day);
    if (!samples[kind]) samples[kind] = day;
  }
  return LEGEND_KINDS.map((kind) => ({
    kind,
    label: legendLabelFor(kind, samples[kind]),
  }));
}

/** @param {Day | undefined} day @returns {DayKind} */
export function dayKindFor(day) {
  if (!day || day.type === 'rest') return 'rest';
  if (day.type === 'norm') return 'office';
  const range = dayRange(day);
  if (range?.overnight) return 'night';
  return 'late';
}

/** @param {Day | undefined} day */
export function labelFor(day) {
  const kind = dayKindFor(day);
  if (kind === 'rest') return 'Day off';
  if (kind === 'office') return 'Office hours';
  if (kind === 'late') return 'Evening cover';
  return 'Overnight cover';
}

/** @param {Day | undefined} day @param {string} timezoneLabel */
export function detailFor(day, timezoneLabel = 'BST') {
  if (!day) return 'Outside cover period';
  if (day.type === 'rest') return 'Available all day — no work scheduled';
  if (!day.start || !day.end) return 'Outside cover period';
  const overnight = dayRange(day)?.overnight;
  if (overnight) {
    return `Working ${day.start} to ${day.end} next day (${timezoneLabel}) · Free outside these hours`;
  }
  return `Working ${day.start} to ${day.end} (${timezoneLabel}) · Free outside these hours`;
}

/** @param {Day | undefined} day */
export function hoursFor(day) {
  if (!day) return null;
  if (day.type === 'rest') return 'Day off';
  if (!day.start || !day.end) return 'Day off';
  const overnight = dayRange(day)?.overnight;
  if (overnight) return `${day.start} – ${day.end} (next day)`;
  return `${day.start} – ${day.end}`;
}
