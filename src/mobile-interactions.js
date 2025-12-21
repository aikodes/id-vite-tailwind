import { lockBodyScroll, unlockBodyScroll } from "./utils.js";

/**
 * Mobile Header Interactions
 * Handles Search Overlay and Mobile Drawer
 */

export function initializeMobileInteractions() {

  // --- Focus Trap Utility ---
  function getFocusableElements(container) {
    const elements = container.querySelectorAll(
      'button:not([disabled]), a[href]:not([aria-disabled="true"]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(elements).filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.offsetParent === null && el !== document.activeElement) return false;
      return true;
    });
  }

  function trapFocus(e, container) {
    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // --- Mobile Search ---
  const mobileSearchTrigger = document.getElementById("mobile-search-trigger");
  const unifiedSearchContainer = document.getElementById("unified-search-container");
  const mobileSearchClose = document.getElementById("mobile-search-close");
  const searchInput = document.getElementById("search-input");

  let searchPreviousFocus = null;

  function isSearchOpen() {
    return unifiedSearchContainer && unifiedSearchContainer.hasAttribute("data-open");
  }

  function openSearch() {
    if (unifiedSearchContainer) {
      searchPreviousFocus = document.activeElement;
      unifiedSearchContainer.setAttribute("data-open", "");
      if (searchInput) searchInput.focus();
    }
  }

  function closeSearch() {
    if (unifiedSearchContainer) {
      unifiedSearchContainer.removeAttribute("data-open");
      if (searchPreviousFocus instanceof HTMLElement) {
        searchPreviousFocus.focus();
      }
      searchPreviousFocus = null;
    }
  }

  if (mobileSearchTrigger) {
    mobileSearchTrigger.addEventListener("click", openSearch);
  }

  if (mobileSearchClose) {
    mobileSearchClose.addEventListener("click", closeSearch);
  }

  // --- Mobile Drawer ---
  const mobileMenuTrigger = document.getElementById("mobile-menu-trigger");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const mobileDrawerOverlay = document.getElementById("mobile-drawer-overlay");
  const mobileDrawerClose = document.getElementById("mobile-drawer-close");
  const mobileMenuList = document.getElementById("mobile-menu-list");
  const mainMenu = document.getElementById("main-menu");

  let drawerPreviousFocus = null;

  function isDrawerOpen() {
    return mobileDrawer && mobileDrawer.hasAttribute("data-open");
  }

  function openDrawer() {
    if (mobileDrawer && mobileDrawerOverlay) {
      drawerPreviousFocus = document.activeElement;
      mobileDrawer.setAttribute("data-open", "");
      mobileDrawerOverlay.setAttribute("data-open", "");
      lockBodyScroll();

      // Focus first focusable element in drawer
      requestAnimationFrame(() => {
        const focusable = getFocusableElements(mobileDrawer);
        if (focusable.length > 0) focusable[0].focus();
      });
    }
  }

  function closeDrawer() {
    if (mobileDrawer && mobileDrawerOverlay) {
      mobileDrawer.removeAttribute("data-open");
      mobileDrawerOverlay.removeAttribute("data-open");
      unlockBodyScroll();

      if (drawerPreviousFocus instanceof HTMLElement) {
        drawerPreviousFocus.focus();
      }
      drawerPreviousFocus = null;
    }
  }

  if (mobileMenuTrigger) {
    mobileMenuTrigger.addEventListener("click", openDrawer);
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener("click", closeDrawer);
  }

  if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener("click", closeDrawer);
  }

  // --- Keyboard Handlers ---
  document.addEventListener("keydown", (e) => {
    // Escape closes search overlay
    if (e.key === "Escape" && isSearchOpen()) {
      closeSearch();
      return;
    }

    // Escape closes drawer
    if (e.key === "Escape" && isDrawerOpen()) {
      closeDrawer();
      return;
    }

    // Focus trap for drawer
    if (e.key === "Tab" && isDrawerOpen() && mobileDrawer) {
      trapFocus(e, mobileDrawer);
    }
  });

  // --- Back to Mobile Menu Buttons ---
  const backButtons = document.querySelectorAll(".back-to-mobile-menu");
  backButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Dispatch navmenu:requestclose to ask menus to close
      document.dispatchEvent(new CustomEvent("navmenu:requestclose"));

      // Listen once for the menu close event, then open drawer
      const openDrawerOnce = () => {
        openDrawer();
        document.removeEventListener("navmenu:close", openDrawerOnce);
      };

      document.addEventListener("navmenu:close", openDrawerOnce);

      // Fallback timeout in case navmenu:close doesn't fire
      setTimeout(() => {
        document.removeEventListener("navmenu:close", openDrawerOnce);
        if (!isDrawerOpen()) {
          openDrawer();
        }
      }, 100);
    });
  });

  // --- Populate Mobile Menu ---
  if (mainMenu && mobileMenuList) {
    mobileMenuList.innerHTML = "";

    const mainMenuItems = mainMenu.querySelectorAll(".main-menu-item");

    mainMenuItems.forEach((item) => {
      const originalButton = item.querySelector("button, a");
      if (!originalButton) return;

      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";

      // Copy text content (without chevron text)
      const textContent = originalButton.childNodes[0]?.textContent?.trim() || 
                          originalButton.textContent.trim().split('\n')[0].trim();
      button.textContent = textContent;

      button.className = "flex w-full items-center justify-between rounded-md p-2 hover:bg-gray-100 text-left text-sm font-medium text-gray-700";

      // Add chevron if it was a dropdown/menu
      const hasChevron = originalButton.querySelector("svg");
      if (hasChevron) {
        const chevron = document.createElement("span");
        chevron.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        button.appendChild(chevron);
      }

      button.addEventListener("click", () => {
        if (originalButton.tagName.toLowerCase() === "a") {
          window.location.href = originalButton.href;
        } else {
          closeDrawer();
          // Small delay to let drawer close animation start
          setTimeout(() => {
            originalButton.click();
          }, 50);
        }
      });

      li.appendChild(button);
      mobileMenuList.appendChild(li);
    });
  }
}
