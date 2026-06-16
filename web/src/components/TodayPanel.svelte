<script>
  import DayIcon from './DayIcon.svelte';
  import DayOrdinal from './DayOrdinal.svelte';
  import LiveStatus from './LiveStatus.svelte';
  import {
    formatDurationMinutes,
    formatMonthShort,
    formatNextShiftStart,
    formatShortDate,
    formatWeekdayShort,
    formatWorkEndTime,
    hoursFor,
    labelFor,
  } from '$lib/domain/index.js';

  /** @type {{
    day: import('$lib/domain/types.js').Day,
    kind: import('$lib/domain/types.js').DayKind,
    today: string,
    timezoneLabel: string,
    busyNow: boolean,
    testMode: boolean,
    shiftEnd: import('$lib/domain/types.js').ActiveWorkEnd | null,
    nextShift: import('$lib/domain/types.js').NextWorkStart | null,
    nextOff: import('$lib/domain/types.js').Day | null,
  }} */
  let { day, kind, today, timezoneLabel, busyNow, testMode, shiftEnd, nextShift, nextOff } = $props();
</script>

<section class="today-panel" aria-label="Today">
  <div
    class="today-card"
    class:rest={kind === 'rest'}
    class:office={kind === 'office'}
    class:late={kind === 'late'}
    class:night={kind === 'night'}
  >
    <div class="today-main">
      <div class="today-icon"><DayIcon {kind} /></div>
      <div class="today-copy">
        <p class="today-kicker">Today</p>
        <p class="today-date">
          {formatWeekdayShort(today)}, <DayOrdinal date={today} />
          {formatMonthShort(today)}
        </p>
        <p class="today-meta">{labelFor(day)} · {hoursFor(day)}</p>
      </div>
      <LiveStatus {kind} busy={busyNow} />
    </div>
    {#if busyNow && shiftEnd}
      <div class="today-countdown">
        <span class="countdown-value">{formatDurationMinutes(shiftEnd.until)}</span>
        until shift ends
        <span class="countdown-when">{formatWorkEndTime(shiftEnd.end, today, timezoneLabel)}</span>
        {#if testMode}<span class="sim-tag">simulated</span>{/if}
      </div>
    {:else if nextShift != null}
      <div class="today-countdown">
        <span class="countdown-value">{formatDurationMinutes(nextShift.until)}</span>
        until next shift
        <span class="countdown-when">{formatNextShiftStart(nextShift.start, today, timezoneLabel)}</span>
        {#if testMode}<span class="sim-tag">simulated</span>{/if}
      </div>
    {/if}
    {#if nextOff}
      <div class="today-extra">Next day off: {formatShortDate(nextOff.date)}</div>
    {/if}
  </div>
</section>
