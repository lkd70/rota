<script>
  import { formatDate, formatPeriodHeading } from '$lib/domain/index.js';

  /** @type {{
    meta: import('$lib/domain/types.js').ScheduleMeta,
    period: import('$lib/domain/types.js').Period,
    inPeriod: boolean,
    today: string,
    daysLeftLabel: string | null,
  }} */
  let { meta, period, inPeriod, today, daysLeftLabel } = $props();
</script>

<header class="hero">
  <p class="eyebrow">{meta.eyebrow ?? 'Cover'} · {meta.timezoneLabel}</p>
  <h1>{meta.title}</h1>
  <p class="sub">{formatPeriodHeading(period)}</p>
  {#if daysLeftLabel}
    <p class="status-line muted">{daysLeftLabel}</p>
  {:else if !inPeriod}
    {#if today < period.start}
      <p class="status-line muted">Cover starts {formatDate(period.start)}</p>
    {:else}
      <p class="status-line muted">Cover period has ended</p>
    {/if}
  {/if}
</header>
