<script>
  import ToolbarIconButton from './ToolbarIconButton.svelte';

  /** @type {{
    wideLayoutAvailable: boolean,
    layout?: import('$lib/prefs/preferences.js').LayoutMode,
    theme?: import('$lib/prefs/preferences.js').ThemeMode,
    onOpenStats: () => void,
    onOpenDownload: () => void,
  }} */
  let {
    wideLayoutAvailable,
    layout = $bindable('compact'),
    theme = $bindable('system'),
    onOpenStats,
    onOpenDownload,
  } = $props();
</script>

<div class="page-toolbar">
  <div class="prefs-bar" aria-label="Display settings">
    {#if wideLayoutAvailable}
      <div class="pref-group" role="group" aria-label="Layout">
        <span class="pref-label">Layout</span>
        <button
          type="button"
          class="pref-btn"
          class:active={layout === 'compact'}
          aria-pressed={layout === 'compact'}
          onclick={() => (layout = 'compact')}>4:3</button
        >
        <button
          type="button"
          class="pref-btn"
          class:active={layout === 'wide'}
          aria-pressed={layout === 'wide'}
          onclick={() => (layout = 'wide')}>Wide</button
        >
      </div>
    {/if}
    <div class="pref-group" role="group" aria-label="Theme">
      <span class="pref-label">Theme</span>
      <button
        type="button"
        class="pref-btn"
        class:active={theme === 'system'}
        aria-pressed={theme === 'system'}
        onclick={() => (theme = 'system')}>System</button
      >
      <button
        type="button"
        class="pref-btn"
        class:active={theme === 'light'}
        aria-pressed={theme === 'light'}
        onclick={() => (theme = 'light')}>Light</button
      >
      <button
        type="button"
        class="pref-btn"
        class:active={theme === 'dark'}
        aria-pressed={theme === 'dark'}
        onclick={() => (theme = 'dark')}>Dark</button
      >
    </div>
  </div>
  <div class="toolbar-actions">
    <ToolbarIconButton label="Export schedule" title="Export schedule" onclick={onOpenDownload}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path d="M8.5 9.5 12 13l3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path d="M6 15v4h12v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </ToolbarIconButton>
    <ToolbarIconButton label="Schedule stats" title="Schedule stats" onclick={onOpenStats}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 19V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path d="M4 19H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <rect x="7" y="12" width="3" height="7" rx="0.5" fill="currentColor" />
        <rect x="12" y="9" width="3" height="10" rx="0.5" fill="currentColor" />
        <rect x="17" y="6" width="3" height="13" rx="0.5" fill="currentColor" />
      </svg>
    </ToolbarIconButton>
  </div>
</div>
