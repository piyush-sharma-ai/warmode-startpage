/**
 * Tools Module - Cheat sheets and quick tools
 */

import { store } from './storage.js';
import { showToast, createElement } from './core.js';
import { closeCheatOverlay, getActiveCheatKey } from './overlay.js';
import { handleSearch } from './search.js';
import { prepareModal, restoreModal } from './modal.js';

let currentToolModalMode = 'cheat';
let dragToolIdx = null;

export function initTools() {
  renderQuickTools();
  store.subscribe('QUICK_TOOLS', renderQuickTools);
  store.subscribe('CHEATS', renderQuickTools);
}

export function renderQuickTools() {
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

export function setToolModalMode(mode) {
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

export function openToolModal(editIdx = null, forceCheatKey = null) {
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

  prepareModal('tool-modal');
  modal.classList.add('show');
  lblInput.focus();
}

export function closeToolModal() {
  const modal = document.getElementById('tool-modal');
  if (modal) modal.classList.remove('show');
  restoreModal('tool-modal');
}

export function saveCustomTool() {
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

export function runQuickCmd(cmdText) {
  const q = document.getElementById('q');
  if (!q) return;
  q.value = cmdText;
  handleSearch(new Event('submit'));
}

export function fillQuickCmd(prefixText) {
  const q = document.getElementById('q');
  if (!q) return;
  closeCheatOverlay();
  q.value = prefixText;
  q.focus();
}

export function editCurrentCheatSheet() {
  const cheatKey = getActiveCheatKey();
  if (cheatKey) {
    openToolModal(null, cheatKey);
  }
}