/**
 * Scratchpad Module - Brain dump, telemetry, and JSON backup/restore
 */

import { store } from './storage.js';
import { showToast, dayKey } from './core.js';
import { exportAllData, triggerImportData, importAllData } from './backup.js';

const SCRATCHPAD_KEY = 'traichu_scratchpad';

export function initScratchpad() {
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

export function toggleScratchpad() {
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

export function downloadScratchpad() {
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

export function renderPomoChart() {
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
export { exportAllData, triggerImportData, importAllData };