/**
 * Hero Module - Editable hero text + terminal prompt
 */

const DEFAULTS = {
  greet: 'Welcome Operator!',
  sub: 'Build things. Stay focused.',
  user: 'user@warmode',
  path: '~',
  hash: '$',
};

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function getText(id, fallback) {
  const el = document.getElementById(id);
  const value = el ? el.innerText.trim() : '';
  return value || fallback;
}

export function initHero() {
  loadHeroText();
}

function loadHeroText() {
  setText('greeting', localStorage.getItem('traichu_hero_greet') || DEFAULTS.greet);
  setText('subline-text', localStorage.getItem('traichu_hero_sub') || DEFAULTS.sub);
  setText('prompt-user', localStorage.getItem('traichu_prompt_user') || DEFAULTS.user);
  setText('prompt-path', localStorage.getItem('traichu_prompt_path') || DEFAULTS.path);
  setText('prompt-hash', localStorage.getItem('traichu_prompt_hash') || DEFAULTS.hash);
}

export function saveHeroText() {
  localStorage.setItem('traichu_hero_greet', getText('greeting', DEFAULTS.greet));
  localStorage.setItem('traichu_hero_sub', getText('subline-text', DEFAULTS.sub));
  localStorage.setItem('traichu_prompt_user', getText('prompt-user', DEFAULTS.user));
  localStorage.setItem('traichu_prompt_path', getText('prompt-path', DEFAULTS.path));
  localStorage.setItem('traichu_prompt_hash', getText('prompt-hash', DEFAULTS.hash));

  // Keep the on-screen text in sync with what was actually persisted.
  setText('greeting', localStorage.getItem('traichu_hero_greet'));
  setText('subline-text', localStorage.getItem('traichu_hero_sub'));
}