<script>
  import ModalDialog from './ModalDialog.svelte';
  import { formatDurationMinutes } from '$lib/domain/index.js';

  /** @type {{
    open: boolean,
    stats: import('$lib/domain/types.js').ScheduleStats,
    onClose: () => void,
  }} */
  let { open, stats, onClose } = $props();
</script>

<ModalDialog {open} title="Cover stats" titleId="stats-title" {onClose}>
  <dl class="stats-grid">
    <div>
      <dt>Total days</dt>
      <dd>{stats.totalDays}</dd>
    </div>
    <div>
      <dt>Work days</dt>
      <dd>{stats.workDays}</dd>
    </div>
    <div>
      <dt>Days off</dt>
      <dd>{stats.restDays}</dd>
    </div>
    <div>
      <dt>Total work time</dt>
      <dd>{formatDurationMinutes(stats.totalWorkMinutes)}</dd>
    </div>
    <div>
      <dt>Office days</dt>
      <dd>{stats.officeDays}</dd>
    </div>
    <div>
      <dt>Evening shifts</dt>
      <dd>{stats.eveningShifts}</dd>
    </div>
    <div>
      <dt>Overnight shifts</dt>
      <dd>{stats.overnightShifts}</dd>
    </div>
    <div>
      <dt>Longest break</dt>
      <dd>{stats.longestRestStreak} day{stats.longestRestStreak === 1 ? '' : 's'}</dd>
    </div>
    <div>
      <dt>Longest work streak</dt>
      <dd>{stats.longestWorkStreak} day{stats.longestWorkStreak === 1 ? '' : 's'}</dd>
    </div>
    {#if stats.busiestWeek}
      <div class="stats-wide">
        <dt>Busiest week</dt>
        <dd>
          Week {stats.busiestWeek.index + 1} · {stats.busiestWeek.label}
          <span class="stats-sub">{stats.busiestWeek.shifts} shifts</span>
        </dd>
      </div>
    {/if}
  </dl>
</ModalDialog>
