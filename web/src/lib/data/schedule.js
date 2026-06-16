import raw from '../../../../data/schedule.json';
import { createCalendar, setActiveCalendar } from '../domain/calendar.js';

/** @typedef {import('../domain/types.js').ScheduleDocument} ScheduleDocument */

/** @type {ScheduleDocument} */
export const schedule = /** @type {ScheduleDocument} */ (raw);

export const calendar = createCalendar(schedule.meta.timezone);
setActiveCalendar(calendar);
