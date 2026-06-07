<script>
  /** @type {{ kind: 'rest' | 'office' | 'late' | 'night' }} */
  let { kind } = $props();
</script>

<svg class="icon {kind}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#if kind === 'rest'}
    <!-- Bed — headboard + footboard frame -->
    <path d="M3 6.5v9.5" />
    <path d="M7 8.5v7.5" />
    <path d="M3 6.5h4" />
    <path d="M16.5 10.5v5.5" />
    <path d="M20.5 10.5v5.5" />
    <path d="M16.5 10.5h4" />
    <path d="M3 16h17.5" />
    <rect x="4" y="11.5" width="3.5" height="2.25" rx="0.5" />
    <path d="M7.5 12.5h11.5" />
    <path d="M7.5 12.5v1.75" />
  {:else if kind === 'office'}
    <!-- Briefcase — office hours -->
    <path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
    <rect x="4" y="7" width="16" height="12" rx="2" />
    <path d="M4 12h16" />
  {:else if kind === 'late'}
    <!-- Clock (~7 pm) — evening cover -->
    <circle cx="12" cy="12" r="7.5" />
    <path d="M12 8.5V12" stroke-width="2" />
    <path d="M12 12 9 15.5" stroke-width="2" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  {:else}
    <!-- Crescent moon — overnight cover -->
    <path
      d="M20.8 13.2a7.8 7.8 0 0 1-9.5-9.5 8.2 8.2 0 1 0 9.5 9.5z"
      fill="currentColor"
      stroke="none"
    />
  {/if}
</svg>

<style>
  .icon {
    width: 2rem;
    height: 2rem;
  }

  .rest { color: var(--kind-rest); }
  .office { color: var(--kind-office); }
  .late { color: var(--kind-late); }
  .night { color: var(--kind-night); }
</style>
