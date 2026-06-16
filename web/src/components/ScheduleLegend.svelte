<script>
  import DayIcon from './DayIcon.svelte';
  import { scheduleLegend } from '$lib/domain/kinds.js';

  /** @type {{ days: import('$lib/domain/types.js').Day[] }} */
  let { days } = $props();

  const entries = $derived(scheduleLegend(days));
</script>

<nav class="schedule-legend" aria-label="Schedule key">
  {#each entries as entry (entry.kind)}
    <span class="schedule-legend__item"><DayIcon kind={entry.kind} /> {entry.label}</span>
  {/each}
</nav>
