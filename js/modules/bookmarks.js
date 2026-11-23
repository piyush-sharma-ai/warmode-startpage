/**
 * Bookmarks Module - 4 sections with add/edit/delete/drag
 */

import { store } from './storage.js';
import { escapeHTML, safeHostname, FALLBACK_ICON, showToast, createElement, normalizeUrl } from './core.js';
import { prepareModal, restoreModal } from './modal.js';

let dragSource = { c: null, l: null };

export function initBookmarks() {
  renderBookmarks();
  store.subscribe('BOOKMARKS', renderBookmarks);
}

export function renderBookmarks() {
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

export function openSiteModal(colIndex, linkIndex = null) {
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
  prepareModal('site-modal');
  document.getElementById('site-modal').classList.add('show');
  nameInput.focus();
}

export function closeSiteModal() {
  const modal = document.getElementById('site-modal');
  if (modal) modal.classList.remove('show');
  restoreModal('site-modal');
}

export function saveNewSite() {
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