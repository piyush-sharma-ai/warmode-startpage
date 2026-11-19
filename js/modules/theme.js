/**
 * Theme Module - Curated dark palette system + light/dark mode toggle
 *
 * Architecture:
 *   - `DARK_THEMES` is an ordered list of premium dark palettes. The numeric
 *     index persisted in `warmode_theme` is the position in this list.
 *   - `LIGHT_THEME` is applied when Dark Mode is switched off. It is NOT part
 *     of the cycle: cycling always lands back on a dark palette.
 *   - `warmode_theme_id` stores the resolved theme id so the inline pre-paint
 *     bootstrap in index.html can apply the palette before first paint
 *     (prevents a flash of the default theme).
 *   - All color values live in css/themes.css; this module only owns ids,
 *     names, ordering, and mode state.
 */

import { store } from './storage.js';
import { showToast } from './core.js';

/** Premium dark palettes, in cycle order. */
export const DARK_THEMES = [
  { name: 'Agni', id: 'agni' },
  { name: 'Sagar', id: 'sagar' },
  { name: 'Van', id: 'van' },
  { name: 'Akasha', id: 'akasha' },
  { name: 'Himadri', id: 'himadri' },
  { name: 'Aranya', id: 'aranya' },
  { name: 'Calm Dark', id: 'calm' },
  { name: 'HackTheBox', id: 'htb' },
  { name: 'Catppuccin', id: 'catppuccin' },
  { name: 'GitHub', id: 'github' },
  { name: 'VS Code', id: 'vscode' },
  { name: 'Nord', id: 'nord' },
  { name: 'Claude', id: 'claude' },
  { name: 'ChatGPT', id: 'chatgpt' },
  { name: 'Atom', id: 'atom' },
  { name: 'Athena OS', id: 'athena' },
  { name: 'Kali Linux', id: 'kali' },
];

/** Applied when Dark Mode is off. Deliberately excluded from the cycle. */
export const LIGHT_THEME = { name: 'Daylight', id: 'daylight' };

const THEME_INDEX_KEY = 'warmode_theme';
const THEME_ID_KEY = 'warmode_theme_id';
const DARK_MODE_KEY = 'warmode_dark';

/** All selectable themes, exposed for UIs that list them. */
export const THEMES = [...DARK_THEMES, LIGHT_THEME];

export function getThemeIndex() {
  const raw = parseInt(localStorage.getItem(THEME_INDEX_KEY), 10);
  if (!Number.isFinite(raw)) return 0;
  return ((raw % DARK_THEMES.length) + DARK_THEMES.length) % DARK_THEMES.length;
}

/** Dark Mode is on unless the user explicitly stored '0'. */
export function isDarkMode() {
  return localStorage.getItem(DARK_MODE_KEY) !== '0';
}

function persist(themeId, index, dark) {
  localStorage.setItem(THEME_ID_KEY, themeId);
  localStorage.setItem(THEME_INDEX_KEY, String(index));
  localStorage.setItem(DARK_MODE_KEY, dark ? '1' : '0');
}

function paint(themeId, displayName) {
  const dark = isDarkMode();
  document.documentElement.dataset.theme = themeId;
  document.documentElement.classList.toggle('light-mode', !dark);

  const k = document.getElementById('theme-name');
  if (k) k.textContent = displayName;

  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.setAttribute('aria-checked', String(dark));
    toggle.classList.toggle('is-dark', dark);
    toggle.setAttribute('aria-label', dark ? 'Dark Mode on — switch to Light Mode' : 'Light Mode on — switch to Dark Mode');
    const label = document.getElementById('dark-mode-label');
    if (label) label.textContent = dark ? 'Dark' : 'Light';
  }
}

/**
 * Apply a dark palette by index. Switching to any dark palette also turns
 * Dark Mode back on, which is what a user expects after picking a theme.
 */
export function applyTheme(index) {
  const safeIdx = ((index % DARK_THEMES.length) + DARK_THEMES.length) % DARK_THEMES.length;
  const theme = DARK_THEMES[safeIdx];
  persist(theme.id, safeIdx, true);
  paint(theme.id, theme.name);
  store.set('THEME', safeIdx);
  return theme;
}

/** Switch between the selected dark palette and the light palette. */
export function setDarkMode(enabled, announce = false) {
  const dark = Boolean(enabled);
  if (dark) {
    applyTheme(getThemeIndex());
  } else {
    persist(LIGHT_THEME.id, getThemeIndex(), false);
    paint(LIGHT_THEME.id, LIGHT_THEME.name);
  }
  if (announce) showToast(dark ? '🌙 Dark Mode on' : '☀️ Light Mode on');
  return dark;
}

export function toggleDarkMode() {
  return setDarkMode(!isDarkMode(), true);
}

/** Advance to the next dark palette (always exits light mode). */
export function cycleTheme() {
  const next = (getThemeIndex() + 1) % DARK_THEMES.length;
  const theme = applyTheme(next);
  showToast(`Theme: ${theme.name}`);
  return theme;
}

export function initTheme() {
  if (!isDarkMode()) {
    setDarkMode(false);
    return LIGHT_THEME;
  }
  return applyTheme(getThemeIndex());
}

/** Currently displayed palette, regardless of mode. */
export function getActiveTheme() {
  if (!isDarkMode()) return LIGHT_THEME;
  return DARK_THEMES[getThemeIndex()] || DARK_THEMES[0];
}