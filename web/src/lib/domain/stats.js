import { dayKindFor } from './kinds.js';
import { shiftDurationMinutes } from './intervals.js';
import { weekCoverCounts, weekRangeLabel } from './grid.js';

/** @import { Day, WeekCell, ScheduleStats } from './types.js' */

/** @param {Day[]} days @param {WeekCell[][]} [weeks] @returns {ScheduleStats} */
export function scheduleStats(days, weeks = []) {
  let restDays = 0;
  let officeDays = 0;
  let eveningShifts = 0;
  let overnightShifts = 0;
  let totalWorkMinutes = 0;
  let longestRestStreak = 0;
  let longestWorkStreak = 0;
  let currentRestStreak = 0;
  let currentWorkStreak = 0;

  for (const day of days) {
    const kind = dayKindFor(day);
    if (kind === 'rest') {
      restDays++;
      currentRestStreak++;
      currentWorkStreak = 0;
      longestRestStreak = Math.max(longestRestStreak, currentRestStreak);
    } else {
      currentRestStreak = 0;
      currentWorkStreak++;
      longestWorkStreak = Math.max(longestWorkStreak, currentWorkStreak);
      if (kind === 'office') officeDays++;
      else if (kind === 'late') eveningShifts++;
      else overnightShifts++;
      totalWorkMinutes += shiftDurationMinutes(day);
    }
  }

  /** @type {{ index: number, shifts: number, label: string } | null} */
  let busiestWeek = null;
  weeks.forEach((week, index) => {
    const { shifts } = weekCoverCounts(week);
    if (shifts > 0 && (!busiestWeek || shifts > busiestWeek.shifts)) {
      busiestWeek = { index, shifts, label: weekRangeLabel(week) };
    }
  });

  return {
    totalDays: days.length,
    restDays,
    workDays: officeDays + eveningShifts + overnightShifts,
    officeDays,
    eveningShifts,
    overnightShifts,
    totalWorkMinutes,
    longestRestStreak,
    longestWorkStreak,
    busiestWeek,
  };
}
