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
