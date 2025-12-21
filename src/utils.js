// Utility functions for device breakpoints and more

/**
 * Returns true if the viewport is tablet size or larger (min-width: 768px)
 */
export function isTabletOrAbove() {
  return window.matchMedia('(min-width: 768px)').matches;
}

/**
 * Returns true if the viewport is mobile size (max-width: 767px)
 */
export function isMobile() {
  return window.matchMedia('(max-width: 767px)').matches;
}

/**
 * Shared scroll lock helpers used by navigation overlays/drawers.
 * Uses a ref-count to safely nest multiple locks.
 */
export function lockBodyScroll() {
  const body = document.body;
  const count = Number.parseInt(body.dataset.navLockCount || '0', 10);
  if (count === 0) body.dataset.navPrevOverflow = body.style.overflow || '';
  body.dataset.navLockCount = String(count + 1);
  body.style.overflow = 'hidden';
}

export function unlockBodyScroll() {
  const body = document.body;
  const count = Number.parseInt(body.dataset.navLockCount || '0', 10);
  const next = Math.max(0, count - 1);
  body.dataset.navLockCount = String(next);

  if (next === 0) {
    body.style.overflow = body.dataset.navPrevOverflow || '';
    delete body.dataset.navPrevOverflow;
  }
}
