<script>
  import { formatRangeCompact, hoursFor, timeDisplayFor } from '$lib/domain/index.js';

  /** @type {{ day: import('$lib/domain/types.js').Day, mini?: boolean, timezoneLabel?: string }} */
  let { day, mini = false, timezoneLabel = 'BST' } = $props();

  const display = $derived(timeDisplayFor(day));
  const fullRange = $derived(hoursFor(day));
</script>

{#if display.type === 'rest'}
  <p class="time-display time-display--rest" class:time-display--mini={mini}>Day off</p>
{:else if mini}
  <p class="time-display time-display--compact" title="{fullRange} {timezoneLabel}">
    {formatRangeCompact(display.start, display.end, display.overnight)}
  </p>
{:else}
  <div class="time-display time-display--range" class:time-display--overnight={display.overnight}>
    {#if display.overnight}
      <div class="time-display__row">
        <span class="time-display__value">{display.start}</span>
        <span class="time-display__sep time-display__sep--overnight" aria-hidden="true">
          <svg class="time-display__overnight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14" />
            <path d="M7 10l5-5 5 5" />
          </svg>
        </span>
        <span class="time-display__value">{display.end}</span>
      </div>
      <span class="time-display__next-day">ends next morning · {timezoneLabel}</span>
    {:else}
      <span class="time-display__value">{display.start}</span>
      <span class="time-display__sep" aria-hidden="true">–</span>
      <span class="time-display__value">{display.end}</span>
      <span class="time-display__tz">{timezoneLabel}</span>
    {/if}
  </div>
{/if}
