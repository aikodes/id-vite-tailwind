import { isTabletOrAbove, isMobile } from './utils.js';

function initializeMegaMenu(options = {}) {
  const {
    menuKey = 'menu3',
    mainMenuId = 'main-menu',
    overlayId = 'menu-overlay',
    containerId = 'mega-menu-container',
    titleId = 'mega-menu-title',
    closeButtonId = 'mega-menu-close-button',
  } = options;

  const mainMenu = document.getElementById(mainMenuId);
  const overlay = document.getElementById(overlayId);
  const container = document.getElementById(containerId);
  const titleEl = document.getElementById(titleId);
  const closeButton = document.getElementById(closeButtonId);

  if (!mainMenu || !overlay || !container || !titleEl || !closeButton) {
    console.error('Mega menu: required DOM elements not found');
    return;
  }

  const menuItem = mainMenu.querySelector(`.main-menu-item[data-menu="${menuKey}"]`);
  const trigger = menuItem?.querySelector('button');

  if (!menuItem || !(trigger instanceof HTMLButtonElement)) {
    console.error(`Mega menu: trigger button not found for ${menuKey}`);
    return;
  }

  let previouslyFocusedElement = null;

  function lockBodyScroll() {
    const body = document.body;
    const count = Number.parseInt(body.dataset.navLockCount || '0');
    if (count === 0) body.dataset.navPrevOverflow = body.style.overflow || '';
    body.dataset.navLockCount = String(count + 1);
    body.style.overflow = 'hidden';
  }

  function unlockBodyScroll() {
    const body = document.body;
    const count = Number.parseInt(body.dataset.navLockCount || '0');
    const next = Math.max(0, count - 1);
    body.dataset.navLockCount = String(next);

    if (next === 0) {
      body.style.overflow = body.dataset.navPrevOverflow || '';
      delete body.dataset.navPrevOverflow;
    }
  }

  function applyPosition() {
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;

    if (isTabletOrAbove()) {
      container.style.top = headerHeight + 16 + 'px';
      container.style.bottom = '';
      container.style.left = '';
      container.style.right = '';
      container.style.maxHeight = `calc(100vh - ${headerHeight + 32}px)`;
    } else {
      container.style.top = '16px';
      container.style.bottom = '16px';
      container.style.left = '8px';
      container.style.right = '8px';
      container.style.maxHeight = 'calc(100vh - 32px)';
    }
  }

  function getFocusableElements() {
    const elements = container.querySelectorAll(
      'button:not([disabled]), a[href]:not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"])',
    );

    return Array.from(elements).filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.offsetParent === null && el !== document.activeElement) return false;
      return true;
    });
  }

  function updateAria() {
    const expanded = container.classList.contains('active');
    trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    trigger.setAttribute('aria-controls', containerId);

    if (expanded) trigger.classList.add('active');
    else trigger.classList.remove('active');
  }

  function isOpen() {
    return container.classList.contains('active');
  }

  function openMenu({ focus = false } = {}) {
    previouslyFocusedElement = document.activeElement;

    document.dispatchEvent(
      new CustomEvent('navmenu:open', {
        detail: {
          type: 'mega',
          key: menuKey,
        },
      }),
    );

    overlay.classList.add('active');
    overlay.classList.remove('hidden');

    container.hidden = false;
    requestAnimationFrame(() => {
      container.classList.add('active');
      updateAria();
    });

    if (isMobile()) {
      container.setAttribute('role', 'dialog');
      container.setAttribute('aria-modal', 'true');
    } else {
      container.setAttribute('role', 'region');
      container.removeAttribute('aria-modal');
    }
    container.setAttribute('aria-labelledby', titleId);

    applyPosition();
    updateAria();

    if (isMobile()) lockBodyScroll();

    if (focus) {
      requestAnimationFrame(() => {
        const focusable = getFocusableElements();
        const first = focusable[0];
        if (first) first.focus();
      });
    }
  }

  function closeMenu({ restoreFocus = true } = {}) {
    container.classList.remove('active');

    updateAria();

    window.setTimeout(() => {
      container.hidden = true;

      const miller = document.getElementById('column-menu-container');
      const shouldHideOverlay = !(miller && miller.classList.contains('active'));

      // Only remove the overlay active state if no other menu is using it.
      if (shouldHideOverlay) overlay.classList.remove('active');
      if (shouldHideOverlay) overlay.classList.add('hidden');

      if (isMobile()) unlockBodyScroll();

      if (restoreFocus && previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
      previouslyFocusedElement = null;

      document.dispatchEvent(
        new CustomEvent('navmenu:close', {
          detail: {
            type: 'mega',
            key: menuKey,
          },
        }),
      );
    }, 200);
  }

  function toggleMenu() {
    if (isOpen()) {
      closeMenu();
      return;
    }

    openMenu({ focus: isMobile() });
  }

  trigger.addEventListener('click', () => {
    toggleMenu();
  });

  closeButton.addEventListener('click', () => {
    closeMenu();
  });

  overlay.addEventListener('click', () => {
    if (!isOpen()) return;
    closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;

    if (e.key === 'Escape') {
      closeMenu();
      return;
    }

    if (e.key === 'Tab' && isMobile()) {
      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const currentIndex = focusable.indexOf(document.activeElement);
      const nextIndex = e.shiftKey
        ? currentIndex <= 0
          ? focusable.length - 1
          : currentIndex - 1
        : currentIndex === focusable.length - 1
          ? 0
          : currentIndex + 1;

      e.preventDefault();
      focusable[nextIndex].focus();
    }
  });

  document.addEventListener('focusin', (e) => {
    if (!isOpen()) return;
    if (!isTabletOrAbove()) return;

    const target = e.target;
    if (!(target instanceof Node)) return;

    if (target === trigger) return;
    if (container.contains(target)) return;

    closeMenu({ restoreFocus: false });
  });

  window.addEventListener('resize', () => {
    if (!isOpen()) return;
    applyPosition();
  });

  document.addEventListener('navmenu:open', (e) => {
    const type = e?.detail?.type;
    if (type && type !== 'mega' && isOpen()) {
      closeMenu({ restoreFocus: false });
    }
  });

  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', containerId);

  applyPosition();
  updateAria();
}

export { initializeMegaMenu };
