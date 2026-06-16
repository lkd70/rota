/** @typedef {'xp' | 'bet365'} EasterEggThemeId */

/** @type {Record<EasterEggThemeId, { sequence: string, unlockKey: string }>} */
export const EASTER_EGG_THEMES = {
  xp: { sequence: 'bliss', unlockKey: 'wc-availability-xp-unlocked' },
  bet365: { sequence: 'bet365', unlockKey: 'wc-availability-bet365-unlocked' },
};

const MAX_SEQUENCE_LENGTH = Math.max(
  ...Object.values(EASTER_EGG_THEMES).map((theme) => theme.sequence.length),
);

/** @param {EasterEggThemeId} id @returns {boolean} */
export function isEasterEggUnlocked(id) {
  try {
    return sessionStorage.getItem(EASTER_EGG_THEMES[id].unlockKey) === '1';
  } catch {
    return false;
  }
}

/** @param {EasterEggThemeId} id */
export function markEasterEggUnlocked(id) {
  try {
    sessionStorage.setItem(EASTER_EGG_THEMES[id].unlockKey, '1');
  } catch {
    /* ignore */
  }
}

/** @param {string} buffer @param {string} key @param {number} [maxLength] @returns {string} */
export function advanceUnlockBuffer(buffer, key, maxLength = MAX_SEQUENCE_LENGTH) {
  return (buffer + key.toLowerCase()).slice(-maxLength);
}

/** @param {string} buffer @returns {EasterEggThemeId | null} */
export function matchEasterEggSequence(buffer) {
  for (const [id, config] of Object.entries(EASTER_EGG_THEMES)) {
    if (buffer.endsWith(config.sequence)) return /** @type {EasterEggThemeId} */ (id);
  }
  return null;
}

/** @param {(id: EasterEggThemeId) => void} onUnlock @returns {() => void} */
export function attachEasterEggListeners(onUnlock) {
  let buffer = '';
  /** @type {number | undefined} */
  let resetTimer;

  /** @param {KeyboardEvent} event */
  function onKeydown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length !== 1) return;

    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable)
    ) {
      return;
    }

    buffer = advanceUnlockBuffer(buffer, event.key);
    const matched = matchEasterEggSequence(buffer);
    if (matched) {
      buffer = '';
      onUnlock(matched);
    }

    if (resetTimer) window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      buffer = '';
    }, 3500);
  }

  window.addEventListener('keydown', onKeydown);
  return () => {
    window.removeEventListener('keydown', onKeydown);
    if (resetTimer) window.clearTimeout(resetTimer);
  };
}

/** @deprecated Use isEasterEggUnlocked('xp') */
export function isXpUnlocked() {
  return isEasterEggUnlocked('xp');
}

/** @deprecated Use markEasterEggUnlocked('xp') */
export function markXpUnlocked() {
  markEasterEggUnlocked('xp');
}

/** @param {string} buffer @returns {boolean} */
export function isBlissSequence(buffer) {
  return buffer === EASTER_EGG_THEMES.xp.sequence;
}

/** @param {EasterEggThemeId} id @returns {string} */
export function easterEggSessionThemeKey(id) {
  return `wc-availability-${id}-theme`;
}
