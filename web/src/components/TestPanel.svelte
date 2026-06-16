<script>
  /** @type {{
    period: import('$lib/domain/types.js').Period,
    timezoneLabel: string,
    testMode?: boolean,
    spoofedDate?: string,
    spoofedTime?: string,
    showTestPanel?: boolean,
    onUseRealNow: () => void,
    onExitTestMode: () => void,
  }} */
  let {
    period,
    timezoneLabel,
    testMode = $bindable(false),
    spoofedDate = $bindable(''),
    spoofedTime = $bindable(''),
    showTestPanel = $bindable(false),
    onUseRealNow,
    onExitTestMode,
  } = $props();
</script>

<section class="test-panel">
  <button class="test-toggle" type="button" aria-expanded={showTestPanel} onclick={() => (showTestPanel = !showTestPanel)}>
    {showTestPanel ? 'Hide test mode' : 'Test mode'}
  </button>
  {#if showTestPanel}
    <div class="test-controls">
      <label class="test-check">
        <input type="checkbox" bind:checked={testMode} />
        Enable date/time spoofing
      </label>
      <div class="test-fields">
        <label>
          <span>Date</span>
          <input type="date" bind:value={spoofedDate} min={period.start} max={period.end} disabled={!testMode} />
        </label>
        <label>
          <span>Time ({timezoneLabel})</span>
          <input type="time" bind:value={spoofedTime} disabled={!testMode} />
        </label>
      </div>
      <div class="test-actions">
        <button type="button" class="test-btn" disabled={!testMode} onclick={onUseRealNow}>Use real now</button>
        <button type="button" class="test-btn" disabled={!testMode} onclick={onExitTestMode}>Exit test mode</button>
      </div>
      <p class="test-hint">
        Tip: open with <code>?test=1&amp;date=2026-06-27&amp;time=21:00</code> to jump straight into a scenario.
      </p>
    </div>
  {/if}
</section>
