<script>
  import ToolbarIconButton from './ToolbarIconButton.svelte';
  import { matchEasterEggSequence } from '$lib/prefs/easterEggs.js';

  /** @type {{
    wideLayoutAvailable: boolean,
    layout?: import('$lib/prefs/preferences.js').LayoutMode,
    theme?: import('$lib/prefs/preferences.js').ThemeMode,
    xpUnlocked?: boolean,
    bet365Unlocked?: boolean,
    onOpenStats: () => void,
    onOpenDownload: () => void,
    onUnlockEasterEgg: (id: import('$lib/prefs/easterEggs.js').EasterEggThemeId) => void,
  }} */
  let {
    wideLayoutAvailable,
    layout = $bindable('compact'),
    theme = $bindable('system'),
    xpUnlocked = false,
    bet365Unlocked = false,
    onOpenStats,
    onOpenDownload,
    onUnlockEasterEgg,
  } = $props();

  const HOLD_MS = 600;
  const IDLE_MS = 3500;

  let showSecretInput = $state(false);
  let secretValue = $state('');
  /** @type {HTMLInputElement | undefined} */
  let secretInputEl = $state();
  /** @type {number | undefined} */
  let holdTimer;
  /** @type {number | undefined} */
  let idleTimer;

  function openSecretInput() {
    showSecretInput = true;
    secretValue = '';
    queueMicrotask(() => secretInputEl?.focus());
  }

  function closeSecretInput() {
    showSecretInput = false;
    secretValue = '';
    if (idleTimer) {
      window.clearTimeout(idleTimer);
      idleTimer = undefined;
    }
  }

  function scheduleIdleClose() {
    if (idleTimer) window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(closeSecretInput, IDLE_MS);
  }

  function onThemeLabelPointerDown() {
    cancelHold();
    holdTimer = window.setTimeout(openSecretInput, HOLD_MS);
  }

  function cancelHold() {
    if (holdTimer) {
      window.clearTimeout(holdTimer);
      holdTimer = undefined;
    }
  }

  function onSecretInput() {
    const matched = matchEasterEggSequence(secretValue.toLowerCase());
    if (matched) {
      onUnlockEasterEgg(matched);
      closeSecretInput();
      return;
    }
    scheduleIdleClose();
  }
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
      <button
        type="button"
        class="pref-label pref-label--hold"
        onpointerdown={onThemeLabelPointerDown}
        onpointerup={cancelHold}
        onpointerleave={cancelHold}
        onpointercancel={cancelHold}
        oncontextmenu={(event) => event.preventDefault()}>Theme</button
      >
      {#if showSecretInput}
        <input
          bind:this={secretInputEl}
          class="pref-secret-input"
          bind:value={secretValue}
          oninput={onSecretInput}
          onblur={closeSecretInput}
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          inputmode="text"
          aria-label="Entry"
        />
      {/if}
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
      {#if bet365Unlocked}
        <button
          type="button"
          class="pref-btn pref-btn--bet365"
          class:active={theme === 'bet365'}
          aria-pressed={theme === 'bet365'}
          onclick={() => (theme = 'bet365')}>365</button
        >
      {/if}
      {#if xpUnlocked}
        <button
          type="button"
          class="pref-btn pref-btn--xp"
          class:active={theme === 'xp'}
          aria-pressed={theme === 'xp'}
          onclick={() => (theme = 'xp')}>XP</button
        >
      {/if}
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
