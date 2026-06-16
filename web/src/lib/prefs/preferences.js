const LAYOUT_KEY = 'wc-availability-layout';
const THEME_KEY = 'wc-availability-theme';

export const WIDE_LAYOUT_MIN_WIDTH = 900;

/** @typedef {'compact' | 'wide'} LayoutMode */
/** @typedef {'system' | 'light' | 'dark'} ThemeMode */
/** @typedef {'light' | 'dark'} ResolvedTheme */

/** @type {MediaQueryList | null} */
let systemMq = null;

/** @param {ThemeMode} theme @returns {ResolvedTheme} */
export function resolveTheme(theme) {
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

/** @returns {ThemeMode} */
export function loadTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'light' || theme === 'dark') return theme;
    return 'system';
  } catch {
    return 'system';
  }
}

/** @param {ThemeMode} theme */
export function saveTheme(theme) {
  try {
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
  return `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark')t='system';document.documentElement.dataset.theme=t;var r=t==='light'?'light':t==='dark'?'dark':matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.resolvedTheme=r;var l=localStorage.getItem('${LAYOUT_KEY}')==='wide'?'wide':'compact';document.documentElement.classList.toggle('layout-wide',l==='wide');document.documentElement.classList.toggle('layout-compact',l==='compact');}catch(e){}})();`;
}
