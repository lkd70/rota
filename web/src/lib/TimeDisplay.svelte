<script>
  import { timeDisplayFor } from './schedule.js';

  /** @type {{ entry: import('./schedule.js').ScheduleEntry, mini?: boolean }} */
  let { entry, mini = false } = $props();

  const display = $derived(timeDisplayFor(entry));
</script>

{#if display.type === 'rest'}
  <p class="time rest" class:mini>Day off</p>
{:else}
  <div class="time-range" class:mini class:overnight={display.overnight}>
    {#if !mini && display.overnight}
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
    {:else if !mini}
      <span class="time-value start">{display.start}</span>
      <span class="time-sep" aria-hidden="true">–</span>
      <span class="time-value end">{display.end}</span>
      <span class="tz">BST</span>
    {:else}
      <span class="time-value start">{display.start}</span>
      {#if display.overnight}
        <span class="time-sep overnight-sep" aria-label="Continues until next morning" title="Continues until next morning">
          <svg class="overnight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="M7 10l5-5 5 5" />
          </svg>
        </span>
      {:else}
        <span class="time-sep" aria-hidden="true">–</span>
      {/if}
      <span class="time-value end">{display.end}</span>
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

  .time-range {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    margin: 0;
  }

  .time-range:not(.mini) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: center;
    gap: 0.4rem;
  }

  .time-range:not(.mini).overnight {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-range:not(.mini).overnight .time-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .time-range.mini {
    gap: 0;
    margin-top: 0.1rem;
  }

  .time-value {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--text);
    line-height: 1.2;
  }

  .time-range:not(.mini) .time-value {
    font-size: 1.05rem;
  }

  .time-range.mini .time-value {
    font-size: 0.72rem;
  }

  .time-sep {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--muted);
    font-size: 0.72rem;
    line-height: 1;
  }

  .time-range.mini .time-sep {
    margin: 0.05rem 0;
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

  .time-range:not(.mini) .overnight-icon {
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
