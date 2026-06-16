/** @typedef {'rest' | 'norm' | 'shift'} DayType */
/** @typedef {'rest' | 'office' | 'late' | 'night'} DayKind */

/** @typedef {{
 *   eyebrow?: string,
 *   title: string,
 *   timezone: string,
 *   timezoneLabel: string,
 * }} ScheduleMeta */

/** @typedef {{ start: string, end: string }} Period */

/** @typedef {{
 *   date: string,
 *   type: DayType,
 *   start?: string,
 *   end?: string,
 *   note?: string,
 * }} Day */

/** @typedef {{
 *   meta: ScheduleMeta,
 *   period: Period,
 *   days: Day[],
 * }} ScheduleDocument */

/** @typedef {{ date: string, day: Day | null }} WeekCell */

/** @typedef {{ date: string, minutes: number }} DateTimePoint */

/** @typedef {{ until: number, start: DateTimePoint, day: Day }} NextWorkStart */

/** @typedef {{ until: number, end: DateTimePoint, day: Day }} ActiveWorkEnd */

/** @typedef {{
 *   totalDays: number,
 *   restDays: number,
 *   workDays: number,
 *   officeDays: number,
 *   eveningShifts: number,
 *   overnightShifts: number,
 *   totalWorkMinutes: number,
 *   longestRestStreak: number,
 *   longestWorkStreak: number,
 *   busiestWeek: { index: number, shifts: number, label: string } | null,
 * }} ScheduleStats */

export {};
