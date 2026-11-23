/**
 * Modal Module - Accessible focus management for the app's modal dialogs.
 *
 * Responsibilities:
 *   - remember which element had focus when a modal opened (the trigger), so
 *     focus can be returned to it on close;
 *   - trap Tab/Shift+Tab within the open modal so keyboard focus never escapes
 *     to the background;
 *   - optionally move focus into the modal for dialogs that don't focus their
 *     own first field.
 *
 * The show/hide toggle (.show class) is owned by each module; this module only
 * wraps focus behaviour, so it can be layered onto the existing open/close
 * functions without changing their DOM logic.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), ' +
  'textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const lastFocused = new Map();

function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function focusableEls(modal) {
  return Array.from(modal.querySelectorAll(FOCUSABLE)).filter(isVisible);
}

function trapKeydown(e) {
  if (e.key !== 'Tab') return;
  const modal = e.currentTarget;
  const els = focusableEls(modal);
  if (els.length === 0) {
    e.preventDefault();
    if (typeof modal.focus === 'function') modal.focus({ preventScroll: true });
    return;
  }
  const first = els[0];
  const last = els[els.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus({ preventScroll: true });
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  }
}

/**
 * Prepare a modal for opening: remember the trigger and attach the Tab trap.
 * Call BEFORE moving focus into the modal so the trigger is captured.
 */
export function prepareModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  lastFocused.set(modalId, document.activeElement);
  modal.addEventListener('keydown', trapKeydown);
}

/**
 * Restore focus to the trigger and remove the Tab trap. Call when a modal
 * closes (from any path: close button, Escape, backdrop click).
 */
export function restoreModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.removeEventListener('keydown', trapKeydown);
  const prev = lastFocused.get(modalId);
  lastFocused.delete(modalId);
  if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
    prev.focus({ preventScroll: true });
  }
}

/** Move focus to the first focusable element inside a modal (for dialogs that
 *  don't focus their own field, e.g. the shortcuts cheat-sheet). */
export function focusFirst(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  const first = focusableEls(modal)[0];
  if (first) {
    first.focus({ preventScroll: true });
  } else {
    modal.setAttribute('tabindex', '-1');
    modal.focus({ preventScroll: true });
  }
}
