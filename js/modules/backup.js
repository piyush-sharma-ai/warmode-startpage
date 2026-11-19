/**
 * Backup Module - Export / Import all WarMode data as JSON
 */

import { store } from './storage.js';
import { showToast, dayKey } from './core.js';

export function exportAllData() {
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

export function triggerImportData() {
  const input = document.getElementById('import-file');
  if (input) input.click();
}

export function importAllData(e) {
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
      const known = Object.keys(data).filter(k => k.startsWith('warmode_'));
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