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


export function getContrastColor(hexColor) {
  // Remove # if present
  const cleanColor = hexColor.replace('#', '');
  const rgb = parseInt(cleanColor, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function updateNotificationTextContrast() {
  const root = document.documentElement;
  const notificationColor = getComputedStyle(root).getPropertyValue('--notification-color').trim();
  
  if (notificationColor) {
    const textColor = getContrastColor(notificationColor);
    root.style.setProperty('--notification-text-color', textColor);
  }
}