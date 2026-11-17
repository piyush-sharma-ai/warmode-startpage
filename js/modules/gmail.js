/**
 * Gmail Module - Dynamic email accounts
 */

import { store } from './storage.js';
import { escapeHTML, showToast, createElement, normalizeUrl } from './core.js';
import { closeCheatOverlay, closeOmniSuggestions } from './overlay.js';

export function initGmail() {
  renderGmails();
  store.subscribe('GMAILS', renderGmails);
}

export function renderGmails() {
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

export function openGmailModal(editIdx = null) {
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

export function closeGmailModal() {
  const modal = document.getElementById('gmail-modal');
  if (modal) modal.classList.remove('show');
}

export function saveGmailAccount() {
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

export function closeGmailMenu() {
  const menu = document.getElementById('gmail-menu');
  const btn = document.getElementById('gmail-btn');
  if (menu) menu.classList.remove('show');
  if (btn) {
    btn.classList.remove('open');
    btn.removeAttribute('aria-expanded');
  }
}

export function toggleGmailMenu(e) {
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
export { closeCheatOverlay, closeOmniSuggestions };