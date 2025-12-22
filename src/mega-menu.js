import { getMenuOverlayController } from './overlay-controller.js';
import { isTabletOrAbove, isMobile, lockBodyScroll, unlockBodyScroll } from './utils.js';

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

  const listeners = new AbortController();
  const { signal } = listeners;

  let previouslyFocusedElement = null;
  let lastIsMobile = isMobile();

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

  function setRoleAndModal(isMobileView) {
    if (isMobileView) {
      container.setAttribute('role', 'dialog');
      container.setAttribute('aria-modal', 'true');
    } else {
      container.setAttribute('role', 'region');
      container.removeAttribute('aria-modal');
    }
    container.setAttribute('aria-labelledby', titleId);
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

    const overlayCtrl = getMenuOverlayController();
    overlayCtrl.acquire();

    container.hidden = false;
    requestAnimationFrame(() => {
      container.classList.add('active');
      updateAria();
    });

    lastIsMobile = isMobile();
    setRoleAndModal(lastIsMobile);

    applyPosition();
    updateAria();

    if (lastIsMobile) lockBodyScroll();

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

    const overlayCtrl = getMenuOverlayController();

    window.setTimeout(() => {
      container.hidden = true;
      overlayCtrl.release();

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

  trigger.addEventListener(
    'click',
    () => {
      toggleMenu();
    },
    { signal },
  );

  closeButton.addEventListener(
    'click',
    () => {
      closeMenu();
    },
    { signal },
  );

  overlay.addEventListener(
    'click',
    () => {
      if (!isOpen()) return;
      closeMenu();
    },
    { signal },
  );

  document.addEventListener(
    'keydown',
    (e) => {
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
    },
    { signal },
  );

  document.addEventListener(
    'focusin',
    (e) => {
      if (!isOpen()) return;
      if (!isTabletOrAbove()) return;

      const target = e.target;
      if (!(target instanceof Node)) return;

      if (target === trigger) return;
      if (container.contains(target)) return;

      closeMenu({ restoreFocus: false });
    },
    { signal },
  );

  window.addEventListener(
    'resize',
    () => {
      if (!isOpen()) return;
      const currentIsMobile = isMobile();
      if (currentIsMobile !== lastIsMobile) {
        setRoleAndModal(currentIsMobile);
        if (currentIsMobile) lockBodyScroll();
        else unlockBodyScroll();
        lastIsMobile = currentIsMobile;
      }
      applyPosition();
    },
    { signal },
  );

  document.addEventListener(
    'navmenu:open',
    (e) => {
      const type = e?.detail?.type;
      if (type && type !== 'mega' && isOpen()) {
        closeMenu({ restoreFocus: false });
      }
    },
    { signal },
  );

  document.addEventListener(
    'navmenu:requestclose',
    () => {
      if (isOpen()) {
        closeMenu({ restoreFocus: false });
      }
    },
    { signal },
  );

  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', containerId);

  applyPosition();
  updateAria();

  function destroy() {
    if (isOpen()) closeMenu({ restoreFocus: false });
    listeners.abort();
  }

  return { destroy };
}

export { initializeMegaMenu };
