/**
 * Dock Module - Dynamic dock with add/edit/delete/drag
 */

import { store } from './storage.js';
import { escapeHTML, safeHostname, FALLBACK_ICON, showToast, createElement, normalizeUrl } from './core.js';
import { prepareModal, restoreModal } from './modal.js';

let dragDockIndex = null;

export function initDock() {
  renderDock();
  store.subscribe('DOCK', renderDock);
}

export function renderDock() {
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

export function openDockModal(editIdx = null) {
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
  prepareModal('dock-modal');
  document.getElementById('dock-modal').classList.add('show');
  nameInput.focus();
}

export function closeDockModal() {
  const modal = document.getElementById('dock-modal');
  if (modal) modal.classList.remove('show');
  restoreModal('dock-modal');
}

export function saveDockSite() {
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