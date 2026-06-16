<script>
  /** @type {{ kind: import('$lib/domain/types.js').DayKind, busy?: boolean }} */
  let { kind, busy = false } = $props();
</script>

<span
  class="status-badge"
  class:busy={kind !== 'rest' && busy}
  class:free={kind !== 'rest' && !busy}
  class:off={kind === 'rest'}
>
  {#if kind === 'rest'}
    Off
  {:else if busy}
    On shift
  {:else}
    Free
  {/if}
</span>
