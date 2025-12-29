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
  if (!hexColor || typeof hexColor !== 'string') {
    return '#000000'; // fallback
  }

  // Remove # if present
  const cleanColor = hexColor.replace('#', '');
  
  // Handle 3-char shorthand (#RGB -> #RRGGBB)
  const fullColor = cleanColor.length === 3
    ? cleanColor.split('').map(c => c + c).join('')
    : cleanColor;
  
  const rgb = parseInt(fullColor, 16);
  if (isNaN(rgb)) {
    return '#000000'; // fallback
  }

  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  
  // WCAG-compliant relative luminance with gamma correction
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function updateNotificationTextContrast() {
  const root = document.documentElement;
  const notificationColor = getComputedStyle(root).getPropertyValue('--notification-color').trim();
  console.log('Notification Color:', notificationColor);
  if (notificationColor) {
    const textColor = getContrastColor(notificationColor);
    console.log('Calculated Text Color:', textColor);
    root.style.setProperty('--notification-text-color', textColor);
  }
}