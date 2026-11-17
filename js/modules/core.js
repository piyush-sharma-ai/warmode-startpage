/**
 * Core Utilities - Security, Storage, DOM Helpers
 */

export function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeUrl(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '#';
    return url.href;
  } catch {
    return '#';
  }
}

export const FALLBACK_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233fd9e8' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18'/%3E%3C/svg%3E";

export function safeHostname(url) {
  try { return new URL(normalizeUrl(url)).hostname; } catch { return 'example.com'; }
}

export function safeLoadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return JSON.parse(JSON.stringify(fallback));
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return JSON.parse(JSON.stringify(fallback));
    }
    return parsed;
  } catch {
    return JSON.parse(JSON.stringify(fallback));
  }
}

export function safeSaveJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
    return false;
  }
}

export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

export async function copyText(text, label = "Copied to clipboard") {
  const value = String(text ?? '');
  let ok = false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch (e) {
      ok = false;
    }
  }
  if (!ok) {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
  }
  showToast(ok ? `✔ ${label}` : `⚠ Copy failed — select manually`);
  return ok;
}

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Create an element from a declarative attribute bag.
 *
 * Supports:
 *   - `className`, `textContent`, `innerHTML`, `value`, `title`, ...
 *     assigned as real DOM properties so labels actually render.
 *   - `style` as a string or an object of CSS declarations.
 *   - `dataset` as an object of data-* entries.
 *   - `on*` keys as event listeners.
 *   - boolean attributes (`disabled`, `checked`, `draggable`, ...) coerced.
 *   - `children` as strings/nodes appended after attributes.
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  const BOOLEAN_ATTRS = new Set([
    'disabled', 'checked', 'selected', 'readonly', 'required', 'multiple',
    'autofocus', 'hidden', 'open', 'novalidate',
  ]);

  const PROPERTY_KEYS = new Set([
    'textContent', 'innerHTML', 'innerText', 'value', 'className', 'id',
    'title', 'htmlFor', 'tabIndex', 'draggable',
  ]);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;

    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
      return;
    }

    if (key === 'dataset') {
      Object.entries(value).forEach(([k, v]) => {
        el.dataset[k] = v == null ? '' : String(v);
      });
      return;
    }

    if (key === 'style') {
      if (typeof value === 'string') {
        el.style.cssText = value;
      } else {
        Object.entries(value).forEach(([prop, val]) => {
          if (val != null) el.style[prop] = String(val);
        });
      }
      return;
    }

    if (PROPERTY_KEYS.has(key)) {
      el[key] = value;
      return;
    }

    if (BOOLEAN_ATTRS.has(key)) {
      el.setAttribute(key, '');
      if (key in el) el[key] = true;
      return;
    }

    el.setAttribute(key, value === true ? '' : String(value));
  });

  children.forEach(child => {
    if (child === null || child === undefined || child === false) return;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });

  return el;
}

export function dayKey(date = new Date()) {
  return date.toLocaleDateString('en-CA');
}

export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}