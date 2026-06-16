<script>
  import { formatDurationCompact, formatDurationMinutes } from '$lib/domain/index.js';

  /** @type {{ minutes: number }} */
  let { minutes } = $props();

  const label = $derived(formatDurationCompact(minutes));
  const title = $derived(`${formatDurationMinutes(minutes)} rest`);
</script>

<span class="rest-gap" {title} aria-label={title}>{label}</span>
