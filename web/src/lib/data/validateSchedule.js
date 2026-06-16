import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { createCalendar } from '../domain/calendar.js';

/** @typedef {import('../domain/types.js').ScheduleDocument} ScheduleDocument */

/** @param {import('ajv').ErrorObject[] | null | undefined} errors */
function formatValidationErrors(errors) {
  return (errors ?? [])
    .map((error) => `${error.instancePath || '/'} ${error.message ?? 'invalid'}`)
    .join('\n');
}

/** @param {ScheduleDocument} doc */
function assertScheduleInvariants(doc) {
  const calendar = createCalendar(doc.meta.timezone);
  const dates = doc.days.map((day) => day.date);
  const sorted = [...dates].sort();
  const unique = new Set(dates);

  if (dates.join() !== sorted.join()) {
    throw new Error('Schedule validation failed: days must be sorted by date');
  }
  if (unique.size !== dates.length) {
    throw new Error('Schedule validation failed: days must have unique dates');
  }
  if (doc.days[0]?.date !== doc.period.start || doc.days.at(-1)?.date !== doc.period.end) {
    throw new Error('Schedule validation failed: period must match first and last day');
  }

  for (const day of doc.days) {
    if (calendar.compare(day.date, doc.period.start) < 0 || calendar.compare(day.date, doc.period.end) > 0) {
      throw new Error(`Schedule validation failed: day ${day.date} is outside period`);
    }
  }

  for (let i = 1; i < doc.days.length; i++) {
    const expected = calendar.addDays(doc.days[i - 1].date, 1);
    if (doc.days[i].date !== expected) {
      throw new Error(
        `Schedule validation failed: missing day between ${doc.days[i - 1].date} and ${doc.days[i].date}`,
      );
    }
  }
}

/** @param {object} schema @param {unknown} raw @returns {ScheduleDocument} */
export function validateScheduleDocument(schema, raw) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const schemaBody = { ...schema };
  delete schemaBody.$schema;
  delete schemaBody.$id;
  const validate = ajv.compile(schemaBody);

  if (!validate(raw)) {
    throw new Error(`Schedule validation failed:\n${formatValidationErrors(validate.errors)}`);
  }

  const doc = /** @type {ScheduleDocument} */ (raw);
  assertScheduleInvariants(doc);
  return doc;
}
