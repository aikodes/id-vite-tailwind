import { lockBodyScroll, unlockBodyScroll } from "./utils.js";

/**
 * Mobile Header Interactions - Improved Version
 * Handles Search Overlay and Mobile Drawer with proper error handling and cleanup
 */

export function initializeMobileInteractions() {
  // Prevent multiple initializations
  if (window.mobileInteractionsInitialized) {
    console.warn('Mobile interactions already initialized');
    return;
  }
  window.mobileInteractionsInitialized = true;

  // AbortController for cleanup
  const abortController = new AbortController();
  const signal = abortController.signal;

  // --- Focus Trap Utility ---
  function getFocusableElements(container) {
    try {
      const elements = container.querySelectorAll(
        'button:not([disabled]), a[href]:not([aria-disabled="true"]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(elements).filter((el) => {
        if (!(el instanceof HTMLElement)) return false;
        if (el.offsetParent === null && el !== document.activeElement) return false;
        return true;
      });
    } catch (error) {
      console.error('Error getting focusable elements:', error);
      return [];
    }
  }

  function trapFocus(e, container) {
    try {
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
    } catch (error) {
      console.error('Error in focus trap:', error);
    }
  }

  // --- Mobile Search ---
  const mobileSearchTrigger = document.getElementById("mobile-search-trigger");
  const unifiedSearchContainer = document.getElementById("unified-search-container");
  const mobileSearchClose = document.getElementById("mobile-search-close");
  const searchInput = document.getElementById("search-input");

  let searchPreviousFocus = null;

  function isSearchOpen() {
    try {
      return unifiedSearchContainer && unifiedSearchContainer.hasAttribute("data-open");
    } catch (error) {
      console.error('Error checking search state:', error);
      return false;
    }
  }

  function openSearch() {
    try {
      if (unifiedSearchContainer) {
        searchPreviousFocus = document.activeElement;
        unifiedSearchContainer.setAttribute("data-open", "");
        if (searchInput) {
          // Use requestAnimationFrame to ensure DOM is updated
          requestAnimationFrame(() => {
            searchInput.focus();
          });
        }
      }
    } catch (error) {
      console.error('Error opening search:', error);
    }
  }

  function closeSearch() {
    try {
      if (unifiedSearchContainer) {
        unifiedSearchContainer.removeAttribute("data-open");
        if (searchPreviousFocus instanceof HTMLElement) {
          searchPreviousFocus.focus();
        }
        searchPreviousFocus = null;
      }
    } catch (error) {
      console.error('Error closing search:', error);
    }
  }

  // Add event listeners with signal for cleanup
  if (mobileSearchTrigger) {
    mobileSearchTrigger.addEventListener("click", openSearch, { signal });
  }

  if (mobileSearchClose) {
    mobileSearchClose.addEventListener("click", closeSearch, { signal });
  }

  // --- Mobile Drawer ---
  const mobileMenuTrigger = document.getElementById("mobile-menu-trigger");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const mobileDrawerOverlay = document.getElementById("mobile-drawer-overlay");
  const mobileDrawerClose = document.getElementById("mobile-drawer-close");
  const mobileMenuList = document.getElementById("mobile-menu-list");
  const mainMenu = document.getElementById("main-menu");

  let drawerPreviousFocus = null;
  let isDrawerOpening = false; // Prevent race conditions

  function isDrawerOpen() {
    try {
      return mobileDrawer && mobileDrawer.hasAttribute("data-open");
    } catch (error) {
      console.error('Error checking drawer state:', error);
      return false;
    }
  }

  function openDrawer() {
    if (isDrawerOpening) return; // Prevent multiple calls
    isDrawerOpening = true;

    try {
      if (mobileDrawer && mobileDrawerOverlay) {
        drawerPreviousFocus = document.activeElement;
        mobileDrawer.setAttribute("data-open", "");
        mobileDrawerOverlay.setAttribute("data-open", "");
        lockBodyScroll();

        // Focus first focusable element in drawer
        requestAnimationFrame(() => {
          const focusable = getFocusableElements(mobileDrawer);
          if (focusable.length > 0) {
            focusable[0].focus();
          }
          isDrawerOpening = false;
        });
      }
    } catch (error) {
      console.error('Error opening drawer:', error);
      isDrawerOpening = false;
    }
  }

  function closeDrawer() {
    try {
      if (mobileDrawer && mobileDrawerOverlay) {
        mobileDrawer.removeAttribute("data-open");
        mobileDrawerOverlay.removeAttribute("data-open");
        unlockBodyScroll();

        if (drawerPreviousFocus instanceof HTMLElement) {
          drawerPreviousFocus.focus();
        }
        drawerPreviousFocus = null;
      }
    } catch (error) {
      console.error('Error closing drawer:', error);
    }
  }

  if (mobileMenuTrigger) {
    mobileMenuTrigger.addEventListener("click", openDrawer, { signal });
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener("click", closeDrawer, { signal });
  }

  if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener("click", closeDrawer, { signal });
  }

  // --- Keyboard Handlers ---
  document.addEventListener("keydown", (e) => {
    try {
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
    } catch (error) {
      console.error('Error in keyboard handler:', error);
    }
  }, { signal });

  // --- Back to Mobile Menu Buttons ---
  const backButtons = document.querySelectorAll(".back-to-mobile-menu");
  backButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Prevent multiple simultaneous requests
      if (isDrawerOpening) return;

      // Dispatch navmenu:requestclose to ask menus to close
      document.dispatchEvent(new CustomEvent("navmenu:requestclose"));

      // Use a promise-based approach with proper cleanup
      let menuClosed = false;
      
      const handleMenuClose = () => {
        menuClosed = true;
        if (!isDrawerOpen()) {
          openDrawer();
        }
      };

      // Listen once for the menu close event
      document.addEventListener("navmenu:close", handleMenuClose, { once: true, signal });

      // Fallback timeout with longer delay to match animations
      const fallbackTimeout = setTimeout(() => {
        if (!menuClosed && !isDrawerOpen()) {
          openDrawer();
        }
      }, 300); // Increased timeout for smoother animations

      // Clean up timeout if signal is aborted
      signal.addEventListener('abort', () => {
        clearTimeout(fallbackTimeout);
      });
    }, { signal });
  });

  // --- Populate Mobile Menu ---
  if (mainMenu && mobileMenuList) {
    try {
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
          try {
            if (originalButton.tagName.toLowerCase() === "a") {
              window.location.href = originalButton.href;
            } else {
              closeDrawer();
              // Use a more reliable approach with animation detection
              let retryCount = 0;
              const maxRetries = 10;
              const checkDrawerClosed = () => {
                if (!isDrawerOpen() || retryCount >= maxRetries) {
                  originalButton.click();
                } else {
                  retryCount++;
                  // Check again after a short delay
                  setTimeout(checkDrawerClosed, 50);
                }
              };
              setTimeout(checkDrawerClosed, 50);
            }
          } catch (error) {
            console.error('Error handling button click:', error);
          }
        }, { signal });

        li.appendChild(button);
        mobileMenuList.appendChild(li);
      });
    } catch (error) {
      console.error('Error populating mobile menu:', error);
    }
  }

  // Return cleanup function
  return function cleanup() {
    abortController.abort();
    window.mobileInteractionsInitialized = false;
    unlockBodyScroll(); // Ensure body scroll is unlocked
  };
}

// Export cleanup function for external access
export function getMobileInteractionsCleanup() {
  return window.mobileInteractionsCleanup;
}
