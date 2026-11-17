/**
 * Widget Module - Tasks, Habits, Snippets
 */

import { store } from './storage.js';
import { escapeHTML, showToast, dayKey, copyText } from './core.js';

const PRIORITY_WEIGHT = { h: 3, m: 2, l: 1 };

export function initWidget() {
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

export function switchWidgetTab(tabName) {
  document.querySelectorAll('.w-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.widget-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabName}`);
  });
  const clearBtn = document.getElementById('clear-done-btn');
  if (clearBtn) clearBtn.style.display = tabName === 'tasks' ? 'inline-block' : 'none';
}

export function parsePriority(rawText) {
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
export function renderTodos() {
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

export function addTodo(e) {
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

export function editTodo(i) {
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

export function toggleTodo(i) {
  const todos = store.get('TODOS');
  if (!todos[i]) return;
  todos[i].done = !todos[i].done;
  store.set('TODOS', todos);
}

export function deleteTodo(i) {
  const todos = store.get('TODOS');
  if (!todos[i]) return;
  todos.splice(i, 1);
  store.set('TODOS', todos);
}

export function clearDoneTodos() {
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
export function checkDailyHabitReset() {
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

export function updateStreakBadge() {
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

export function renderHabits() {
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

export function addHabit(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const val = e.target.value.trim();
  if (!val) return;
  const habits = store.get('HABITS');
  habits.push({ text: val, done: false });
  store.set('HABITS', habits);
  e.target.value = '';
}

export function editHabit(i) {
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

export function toggleHabit(i) {
  const habits = store.get('HABITS');
  if (!habits[i]) return;
  habits[i].done = !habits[i].done;
  store.set('HABITS', habits);
}

export function deleteHabit(i) {
  const habits = store.get('HABITS');
  if (!habits[i]) return;
  habits.splice(i, 1);
  store.set('HABITS', habits);
}

/* ========== SNIPPETS ========== */
export function renderSnippets() {
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

export function copySnippet(i) {
  const snippets = store.get('SNIPPETS');
  const item = snippets[i];
  if (!item) return;
  copyText(item.code, `Copied: ${item.title}`);
}

export function addSnippet(e) {
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

export function editSnippet(i) {
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

export function deleteSnippet(i) {
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
export function initWidgetEvents() {
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