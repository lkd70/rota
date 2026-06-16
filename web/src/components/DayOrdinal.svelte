<script>
  import { dayOrdinalParts } from '$lib/domain/index.js';

  /** @type {{ date: string }} */
  let { date } = $props();

  const parts = $derived(dayOrdinalParts(date));
</script>

<span class="day-num">
  <span class="day-num-value">{parts.num}</span><span class="ordinal">{parts.suffix}</span>
</span>
