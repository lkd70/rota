<script>
  import DayIcon from './DayIcon.svelte';
  import TimeDisplay from './TimeDisplay.svelte';
  import { dayKindFor, formatDayNum, formatMonthShort, hoursFor, labelFor } from './schedule.js';

  /** @type {{
    entry: import('./schedule.js').ScheduleEntry,
    isToday?: boolean,
    showLive?: boolean,
    liveBusy?: boolean,
    mini?: boolean,
    compact?: boolean,
  }} */
  let {
    entry,
    isToday = false,
    showLive = false,
    liveBusy = false,
    mini = false,
    compact = true,
  } = $props();

  const kind = $derived(dayKindFor(entry));
  const label = $derived(labelFor(entry));
  const hours = $derived(hoursFor(entry));
</script>

<article
  class="card"
  class:mini
  class:compact={compact && !mini}
  class:expanded={!compact && !mini}
  class:today={isToday}
  class:rest={kind === 'rest'}
  class:office={kind === 'office'}
  class:late={kind === 'late'}
  class:night={kind === 'night'}
  aria-current={isToday ? 'date' : undefined}
  title={`${label} · ${hours} BST`}
>
  <div class="icon-wrap">
    <DayIcon {kind} />
  </div>

  <p class="date-line">
    <span class="day-num">{formatDayNum(entry.date)}</span>
    {#if !mini}
      <span class="month">{formatMonthShort(entry.date)}</span>
    {/if}
  </p>
  <p class="weekday">{entry.day}</p>

  {#if !mini}
    <p class="label">{label}</p>
  {/if}

  <div class="time-block">
    <TimeDisplay {entry} {mini} />
  </div>

  {#if showLive}
    <span class="live-pill" class:busy={liveBusy} class:free={!liveBusy && kind !== 'rest'} class:off={kind === 'rest'}>
      {#if kind === 'rest'}
        Off
      {:else if liveBusy}
        On shift
      {:else}
        Free
      {/if}
    </span>
  {/if}
</article>

<style>
  .card {
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.85rem 0.75rem 0.9rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.15rem;
    min-height: 100%;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .card.compact {
    width: 100%;
  }

  .card.mini {
    padding: 0.45rem 0.3rem 0.55rem;
    border-radius: 10px;
    gap: 0.05rem;
  }

  .card.expanded {
    align-items: flex-start;
    text-align: left;
    padding: 1.1rem 1.15rem;
    max-width: 420px;
  }

  .card.expanded .icon-wrap {
    margin-bottom: 0.35rem;
  }

  .card.expanded .time-block {
    align-self: stretch;
    margin-top: 0.35rem;
    padding: 0.55rem 0.65rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    border: 1px solid var(--border);
  }

  .card.expanded :global(.time-range) {
    align-items: flex-start;
  }

  .card.today {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 1px var(--accent-border), 0 4px 20px rgba(0, 0, 0, 0.25);
  }

  .card.mini.today {
    box-shadow: 0 0 0 2px var(--accent-border), 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  .card.rest {
    background: var(--kind-rest-bg);
    border-color: var(--kind-rest-border);
  }

  .card.office {
    background: var(--kind-office-bg);
    border-color: var(--kind-office-border);
  }

  .card.late {
    background: var(--kind-late-bg);
    border-color: var(--kind-late-border);
  }

  .card.night {
    background: var(--kind-night-bg);
    border-color: var(--kind-night-border);
  }

  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 10px;
    margin-bottom: 0.15rem;
  }

  .rest .icon-wrap { background: rgba(110, 231, 183, 0.14); }
  .office .icon-wrap { background: rgba(124, 184, 217, 0.14); }
  .late .icon-wrap { background: rgba(240, 176, 96, 0.16); }
  .night .icon-wrap { background: rgba(179, 157, 250, 0.16); }

  .mini .icon-wrap {
    width: 2rem;
    height: 2rem;
    border-radius: 8px;
    margin-bottom: 0.1rem;
  }

  .mini :global(.icon) {
    width: 1.2rem;
    height: 1.2rem;
  }

  .expanded .icon-wrap {
    width: 3rem;
    height: 3rem;
    border-radius: 12px;
  }

  .date-line {
    margin: 0;
    line-height: 1.1;
  }

  .day-num {
    font-size: 1.15rem;
    font-weight: 700;
  }

  .mini .day-num {
    font-size: 0.95rem;
  }

  .month {
    margin-left: 0.25rem;
    font-size: 0.82rem;
    color: var(--muted);
    font-weight: 600;
  }

  .weekday {
    margin: 0;
    color: var(--muted);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .mini .weekday {
    font-size: 0.62rem;
    letter-spacing: 0.04em;
  }

  .label {
    margin: 0.25rem 0 0;
    font-size: 0.78rem;
    font-weight: 650;
    color: var(--text);
  }

  .time-block {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .mini .time-block {
    margin-top: 0.05rem;
  }

  .live-pill {
    margin-top: 0.45rem;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    background: var(--pill-bg);
    color: var(--pill-text);
  }

  .mini .live-pill {
    margin-top: 0.2rem;
    font-size: 0.55rem;
    padding: 0.15rem 0.35rem;
  }

  .live-pill.free,
  .live-pill.off {
    background: var(--free-bg);
    color: var(--free);
  }

  .live-pill.busy {
    background: var(--busy-bg);
    color: var(--busy);
  }
</style>
