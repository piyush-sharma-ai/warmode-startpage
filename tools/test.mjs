#!/usr/bin/env node
/**
 * WarMode — zero-dependency test runner for pure logic.
 *
 * The startpage ships no build step and no node_modules, so this script uses
 * only Node's built-in test-free assertions and dynamic import() to exercise
 * the pure functions that carry the highest regression risk: the arithmetic
 * parser, the CIDR calculator, the reverse-shell generator, URL/HTML escaping,
 * and the theme/storage guards.
 *
 * Run:  node tools/test.mjs
 * Exit code is non-zero if any assertion fails.
 */

// ---- Browser-ish globals ---------------------------------------------------
// storage.js instantiates the store at import time, which reads localStorage.
// Provide a minimal in-memory localStorage and a defensive document stub so
// module import never throws outside a browser.
const _ls = new Map();
globalThis.localStorage = {
  getItem: (k) => (_ls.has(k) ? _ls.get(k) : null),
  setItem: (k, v) => _ls.set(k, String(v)),
  removeItem: (k) => _ls.delete(k),
  clear: () => _ls.clear(),
};
globalThis.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => ({
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    setAttribute() {},
    appendChild() {},
    addEventListener() {},
  }),
  body: { classList: { contains: () => false, add() {}, remove() {}, toggle() {} } },
  documentElement: { dataset: {}, classList: { add() {}, remove() {}, toggle() {} } },
};

// ---- Tiny assert harness ---------------------------------------------------
let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log('  [32m✓[0m ' + msg);
  } else {
    failed++;
    failures.push(msg);
    console.log('  [31m✗ FAIL[0m ' + msg);
  }
}

function eq(actual, expected, msg) {
  assert(actual === expected, `${msg} (got ${JSON.stringify(actual)})`);
}

function section(name) {
  console.log('\n[1m' + name + '[0m');
}

// ---- Import modules (after globals exist) ---------------------------------
const core = await import('../js/modules/core.js');
const search = await import('../js/modules/search.js');
const widget = await import('../js/modules/widget.js');
const theme = await import('../js/modules/theme.js');

// ===========================================================================
section('core.js — escapeHTML');
eq(core.escapeHTML('<b>"x"&\'y\'</b>'), '&lt;b&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/b&gt;', 'escapeHTML escapes all five special chars');
eq(core.escapeHTML(null), '', 'escapeHTML handles null');
eq(core.escapeHTML(42), '42', 'escapeHTML coerces numbers');

section('core.js — normalizeUrl');
eq(core.normalizeUrl('example.com'), 'https://example.com/', 'normalizeUrl adds https:// and trailing slash');
eq(core.normalizeUrl('https://github.com/x'), 'https://github.com/x', 'normalizeUrl keeps explicit https');
eq(core.normalizeUrl('javascript:alert(1)'), '#', 'normalizeUrl blocks javascript: scheme');
eq(core.normalizeUrl('ftp://files.example'), '#', 'normalizeUrl blocks non-http(s) schemes');
eq(core.normalizeUrl('not a url at all'), '#', 'normalizeUrl blocks unparseable input');
eq(core.normalizeUrl(''), '', 'normalizeUrl returns empty for empty input');

section('core.js — safeHostname');
eq(core.safeHostname('https://github.com/piyush'), 'github.com', 'safeHostname extracts hostname');
eq(core.safeHostname('javascript:x'), 'example.com', 'safeHostname falls back for blocked schemes');

section('core.js — dayKey');
assert(/^\d{4}-\d{2}-\d{2}$/.test(core.dayKey(new Date(2026, 0, 15))), 'dayKey returns YYYY-MM-DD (en-CA)');

section('core.js — safeLoadJSON');
_ls.clear();
eq(JSON.stringify(core.safeLoadJSON('missing', [1, 2])), '[1,2]', 'safeLoadJSON returns deep-copied default when key missing');
_ls.set('arr', '[1,2,3]');
eq(JSON.stringify(core.safeLoadJSON('arr', [])), '[1,2,3]', 'safeLoadJSON returns parsed array');
_ls.set('bad', 'null');
eq(JSON.stringify(core.safeLoadJSON('bad', [1])), '[1]', 'safeLoadJSON falls back for stored "null"');
_ls.set('wrongtype', '{"a":1}');
eq(JSON.stringify(core.safeLoadJSON('wrongtype', [1])), '[1]', 'safeLoadJSON falls back on array/object type mismatch');
_ls.set('garbage', '{not json');
eq(JSON.stringify(core.safeLoadJSON('garbage', { x: 1 })), '{"x":1}', 'safeLoadJSON falls back on invalid JSON');

section('core.js — safeSaveJSON');
_ls.clear();
assert(core.safeSaveJSON('k', { a: 1 }) === true, 'safeSaveJSON returns true on success');
eq(_ls.get('k'), '{"a":1}', 'safeSaveJSON persists JSON');

// ===========================================================================
section('search.js — evaluateExpression');
eq(search.evaluateExpression('2+3'), '5', '2+3 = 5');
eq(search.evaluateExpression('10-4*2'), '2', '10-4*2 = 2 (operator precedence)');
eq(search.evaluateExpression('(2+3)*4'), '20', '(2+3)*4 = 20 (parens)');
eq(search.evaluateExpression('2**3'), '8', '2**3 = 8');
eq(search.evaluateExpression('2^3'), '8', '2^3 = 8 (^ maps to **)');
eq(search.evaluateExpression('7%3'), '1', '7%3 = 1');
eq(search.evaluateExpression('2.5*2'), '5', '2.5*2 = 5 (floats)');
eq(search.evaluateExpression('-3+5'), '2', '-3+5 = 2 (unary minus)');
eq(search.evaluateExpression('abc'), null, 'non-arithmetic returns null');
eq(search.evaluateExpression('2+'), null, 'dangling operator returns null');
eq(search.evaluateExpression('2/0'), null, 'division by zero returns null');
eq(search.evaluateExpression('2 3'), null, 'space-separated numbers return null');

section('search.js — calculateCidr');
const c24 = search.calculateCidr('192.168.1.0/24');
assert(c24.includes('Network:   192.168.1.0'), 'CIDR /24 network address');
assert(c24.includes('Broadcast: 192.168.1.255'), 'CIDR /24 broadcast address');
assert(c24.includes('Usable Hosts: 254'), 'CIDR /24 usable hosts = 254');
assert(c24.includes('Netmask:   255.255.255.0'), 'CIDR /24 netmask');
const c32 = search.calculateCidr('10.0.0.1/32');
assert(c32.includes('Usable Hosts: 1'), 'CIDR /32 usable hosts = 1');
const c31 = search.calculateCidr('10.0.0.0/31');
assert(c31.includes('Usable Hosts: 2'), 'CIDR /31 usable hosts = 2');
assert(search.calculateCidr('not-a-cidr').startsWith('Usage'), 'CIDR rejects malformed input');
assert(search.calculateCidr('999.1.1.1/24').startsWith('Invalid'), 'CIDR rejects out-of-range octets');

section('search.js — generateRevShells');
const rs = search.generateRevShells('10.10.14.2', '4444');
assert(rs.includes('10.10.14.2') && rs.includes('4444'), 'rev shells include the IP and port');
assert(rs.includes('bash -i'), 'rev shells include a bash payload');
assert(rs.includes('python3 -c'), 'rev shells include a python3 payload');
// Invalid inputs fall back to safe defaults (no injection through the payload).
const rsSafe = search.generateRevShells('$(rm -rf /)', 'evil');
assert(rsSafe.includes('10.10.14.2') && !rsSafe.includes('rm -rf'), 'rev shells sanitize bad IP input');
assert(!rsSafe.includes('evil'), 'rev shells sanitize bad port input');

// ===========================================================================
section('widget.js — parsePriority');
const p1 = widget.parsePriority('Write exploit !h');
eq(p1.text, 'Write exploit', 'parsePriority strips !h and returns text');
eq(p1.prio, 'h', 'parsePriority extracts priority h');
const p2 = widget.parsePriority('plain task');
eq(p2.text, 'plain task', 'parsePriority keeps text without priority');
eq(p2.prio, null, 'parsePriority returns null prio when absent');
const p3 = widget.parsePriority('!m medium task');
eq(p3.text, 'medium task', 'parsePriority strips leading !m');
eq(p3.prio, 'm', 'parsePriority extracts priority m');

// ===========================================================================
section('theme.js — getThemeIndex / isDarkMode');
_ls.clear();
eq(theme.getThemeIndex(), 0, 'getThemeIndex defaults to 0');
_ls.set('warmode_theme', '99');
eq(theme.getThemeIndex(), 99 % theme.DARK_THEMES.length, 'getThemeIndex wraps within range');
_ls.set('warmode_theme', '-1');
eq(theme.getThemeIndex(), theme.DARK_THEMES.length - 1, 'getThemeIndex wraps negatives');
_ls.clear();
assert(theme.isDarkMode() === true, 'isDarkMode defaults to true');
_ls.set('warmode_dark', '0');
assert(theme.isDarkMode() === false, 'isDarkMode false when stored "0"');

// ===========================================================================
console.log('\n' + '─'.repeat(50));
console.log(`[1m${passed} passed, ${failed} failed[0m`);
if (failed > 0) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
} else {
  console.log('All tests passed.');
}
