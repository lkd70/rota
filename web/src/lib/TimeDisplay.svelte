<script>
  import { formatRangeCompact, hoursFor, timeDisplayFor } from './schedule.js';

  /** @type {{ entry: import('./schedule.js').ScheduleEntry, mini?: boolean }} */
  let { entry, mini = false } = $props();

  const display = $derived(timeDisplayFor(entry));
  const fullRange = $derived(hoursFor(entry));
</script>

{#if display.type === 'rest'}
  <p class="time rest" class:mini>Day off</p>
{:else if mini}
  <p class="time compact-line" title="{fullRange} BST">{formatRangeCompact(display.start, display.end, display.overnight)}</p>
{:else}
  <div class="time-range" class:overnight={display.overnight}>
    {#if display.overnight}
      <div class="time-row">
        <span class="time-value start">{display.start}</span>
        <span class="time-sep overnight-sep" aria-hidden="true">
          <svg class="overnight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14" />
            <path d="M7 10l5-5 5 5" />
          </svg>
        </span>
        <span class="time-value end">{display.end}</span>
      </div>
      <span class="next-day">ends next morning · BST</span>
    {:else}
      <span class="time-value start">{display.start}</span>
      <span class="time-sep" aria-hidden="true">–</span>
      <span class="time-value end">{display.end}</span>
      <span class="tz">BST</span>
    {/if}
  </div>
{/if}

<style>
  .time {
    margin: 0;
    font-weight: 600;
    color: var(--muted);
  }

  .time.rest {
    color: var(--kind-rest);
  }

  .time.rest.mini {
    font-size: 0.7rem;
  }

  .compact-line {
    margin: 0;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    font-size: 0.72rem;
    letter-spacing: 0.01em;
    color: var(--text);
    line-height: 1.2;
    white-space: nowrap;
  }

  .time-range {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: center;
    gap: 0.4rem;
    margin: 0;
  }

  .time-range.overnight {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-range.overnight .time-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .time-value {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--text);
    line-height: 1.2;
  }

  .time-range .time-value {
    font-size: 1.05rem;
  }

  @media (max-width: 640px) {
    .compact-line {
      font-size: 0.62rem;
    }

    .time.rest.mini {
      font-size: 0.58rem;
    }
  }

  .time-sep {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--muted);
    font-size: 0.72rem;
    line-height: 1;
  }

  .overnight-sep {
    color: var(--kind-night);
  }

  .overnight-icon {
    width: 0.85rem;
    height: 0.85rem;
    display: block;
    transform: rotate(180deg);
  }

  .time-range .overnight-icon {
    width: 1rem;
    height: 1rem;
  }

  .next-day {
    margin-top: 0.15rem;
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--kind-night);
    letter-spacing: 0.02em;
  }

  .tz {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--muted);
    letter-spacing: 0.04em;
  }
</style>
