import { EASTER_EGG_THEMES, easterEggSessionThemeKey, isEasterEggUnlocked } from './easterEggs.js';

const LAYOUT_KEY = 'wc-availability-layout';
const THEME_KEY = 'wc-availability-theme';

export const WIDE_LAYOUT_MIN_WIDTH = 900;

/** @typedef {'compact' | 'wide'} LayoutMode */
/** @typedef {'system' | 'light' | 'dark' | 'xp' | 'bet365'} ThemeMode */
/** @typedef {'light' | 'dark' | 'xp' | 'bet365'} ResolvedTheme */

/** @type {ThemeMode[]} */
const EASTER_EGG_THEME_IDS = /** @type {ThemeMode[]} */ (Object.keys(EASTER_EGG_THEMES));

/** @param {string} theme @returns {theme is ThemeMode} */
function isEasterEggTheme(theme) {
  return EASTER_EGG_THEME_IDS.includes(/** @type {ThemeMode} */ (theme));
}

/** @type {MediaQueryList | null} */
let systemMq = null;

/** @param {ThemeMode} theme @returns {ResolvedTheme} */
export function resolveTheme(theme) {
  if (theme === 'xp') return 'xp';
  if (theme === 'bet365') return 'bet365';
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** @returns {LayoutMode} */
export function loadLayout() {
  try {
    return localStorage.getItem(LAYOUT_KEY) === 'wide' ? 'wide' : 'compact';
  } catch {
    return 'compact';
  }
}

/** @param {LayoutMode} layout */
export function saveLayout(layout) {
  try {
    localStorage.setItem(LAYOUT_KEY, layout);
  } catch {
    /* ignore */
  }
}

function clearEasterEggSessionThemes() {
  for (const id of EASTER_EGG_THEME_IDS) {
    sessionStorage.removeItem(easterEggSessionThemeKey(/** @type {import('./easterEggs.js').EasterEggThemeId} */ (id)));
  }
}

/** @returns {ThemeMode} */
export function loadTheme() {
  try {
    for (const id of EASTER_EGG_THEME_IDS) {
      const eggId = /** @type {import('./easterEggs.js').EasterEggThemeId} */ (id);
      if (
        sessionStorage.getItem(easterEggSessionThemeKey(eggId)) === id &&
        isEasterEggUnlocked(eggId)
      ) {
        return /** @type {ThemeMode} */ (id);
      }
    }

    const theme = localStorage.getItem(THEME_KEY);
    if (theme && isEasterEggTheme(theme)) {
      localStorage.removeItem(THEME_KEY);
    }
    if (theme === 'light' || theme === 'dark') return theme;
    return 'system';
  } catch {
    return 'system';
  }
}

/** @param {ThemeMode} theme */
export function saveTheme(theme) {
  try {
    if (isEasterEggTheme(theme)) {
      clearEasterEggSessionThemes();
      sessionStorage.setItem(
        easterEggSessionThemeKey(/** @type {import('./easterEggs.js').EasterEggThemeId} */ (theme)),
        theme,
      );
      return;
    }
    clearEasterEggSessionThemes();
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

function clearSystemListener() {
  if (!systemMq) return;
  systemMq.removeEventListener('change', onSystemThemeChange);
  systemMq = null;
}

function onSystemThemeChange() {
  if (document.documentElement.dataset.theme !== 'system') return;
  document.documentElement.dataset.resolvedTheme = resolveTheme('system');
}

/** @param {ThemeMode} theme */
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.resolvedTheme = resolveTheme(theme);

  clearSystemListener();
  if (theme === 'system') {
    systemMq = window.matchMedia('(prefers-color-scheme: dark)');
    systemMq.addEventListener('change', onSystemThemeChange);
  }
}

/** @param {LayoutMode} layout */
export function applyLayout(layout) {
  document.documentElement.classList.toggle('layout-wide', layout === 'wide');
  document.documentElement.classList.toggle('layout-compact', layout === 'compact');
}

export function initPreferences() {
  applyTheme(loadTheme());
  applyLayout(loadLayout());
}

/** Inline boot snippet injected into index.html at build time (see vite.config.js). */
export function buildPreferenceBootSnippet() {
  return `(function(){try{function egg(){if(sessionStorage.getItem('wc-availability-xp-unlocked')==='1'&&sessionStorage.getItem('wc-availability-xp-theme')==='xp')return'xp';if(sessionStorage.getItem('wc-availability-bet365-unlocked')==='1'&&sessionStorage.getItem('wc-availability-bet365-theme')==='bet365')return'bet365';return null;}var eggTheme=egg();var t=eggTheme||localStorage.getItem('${THEME_KEY}');if(t==='xp'||t==='bet365'){localStorage.removeItem('${THEME_KEY}');if(!eggTheme)t='system';}if(t!=='light'&&t!=='dark'&&t!=='xp'&&t!=='bet365')t='system';document.documentElement.dataset.theme=t;var r=t==='xp'||t==='bet365'?t:t==='light'?'light':t==='dark'?'dark':matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.resolvedTheme=r;var l=localStorage.getItem('${LAYOUT_KEY}')==='wide'?'wide':'compact';document.documentElement.classList.toggle('layout-wide',l==='wide');document.documentElement.classList.toggle('layout-compact',l==='compact');}catch(e){}})();`;
}
