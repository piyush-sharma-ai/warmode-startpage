/**
 * Storage Module - Centralized data persistence
 */

import { safeLoadJSON, safeSaveJSON } from './core.js';

const STORAGE_KEYS = {
  DOCK: 'warmode_dock',
  BOOKMARKS: 'warmode_bookmarks',
  GMAILS: 'warmode_gmails',
  CHEATS: 'warmode_cheats',
  QUICK_TOOLS: 'warmode_quick_tools',
  TODOS: 'warmode_todos',
  HABITS: 'warmode_habits',
  SNIPPETS: 'warmode_snippets',
  THEME: 'warmode_theme',
  HERO_GREET: 'warmode_hero_greet',
  HERO_SUB: 'warmode_hero_sub',
  PROMPT_USER: 'warmode_prompt_user',
  PROMPT_PATH: 'warmode_prompt_path',
  PROMPT_HASH: 'warmode_prompt_hash',
  SCRATCHPAD: 'warmode_scratchpad',
  FOCUS: 'warmode_focus',
  HABIT_DATE: 'warmode_habit_date',
  STREAK: 'warmode_streak',
  AUDIO_MODE: 'warmode_audio_mode',
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
      // Only persist keys that actually exist. Exporting null (a key that was
      // never written) would, on restore, store the string "null" and corrupt
      // the round-trip for object/array collections.
      const value = localStorage.getItem(storageKey);
      if (value !== null) payload[storageKey] = value;
    });
    return payload;
  }

  importAll(data) {
    Object.entries(data).forEach(([storageKey, value]) => {
      // Ignore anything that is not a WarMode key, and refuse null/undefined
      // (and the literal string "null") so a bad export can never write a
      // corrupt sentinel that would crash collectors on load.
      if (!storageKey.startsWith('warmode_')) return;
      if (value === null || value === undefined) return;
      if (value === 'null') return;
      localStorage.setItem(storageKey, value);
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
export function restoreDefaultSites() {
  store.restoreAllDefaults();
  if (typeof window.showToast === 'function') {
    window.showToast('✔ All Default Sites, Emails, Dock & Tools Restored!');
  }
}

export const store = new Store();
export { STORAGE_KEYS, DEFAULTS };