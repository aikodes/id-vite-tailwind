import { isTabletOrAbove, lockBodyScroll, unlockBodyScroll } from './utils.js';

/**
 * macOS Style Column View Menu
 * Vanilla JS implementation
 */

// Initialize the menu
function initializeMenu(menuData, options = {}) {
  // DOM elements
  const mainMenu = document.getElementById("main-menu")
  const menuOverlay = document.getElementById("menu-overlay")
  const columnMenuContainer = document.getElementById("column-menu-container")
  const columnsWrapper = document.getElementById("columns-wrapper")
  const menuTitle = document.getElementById("menu-title")
  const menuCloseButton = document.getElementById("menu-close-button")
  const focusSentinelStart = document.getElementById('miller-focus-sentinel-start')
  const focusSentinelEnd = document.getElementById('miller-focus-sentinel-end')
  const megaMenuContainer = document.getElementById("mega-menu-container")
  const listeners = new AbortController()
  const { signal } = listeners

  // Check if all required elements exist
  if (!mainMenu || !menuOverlay || !columnMenuContainer || !columnsWrapper || !menuTitle) {
    console.error("Required DOM elements not found")
    return
  }

  // Track active menu and path
  let activeMainMenu = null
  let activePath = []

  const { onSelect, millerMenuKeys } = options
  let previouslyFocusedElement = null

  const millerKeySet = new Set(
    Array.isArray(millerMenuKeys) ? millerMenuKeys : Object.keys(menuData || {}),
  )

  function isMillerMenuKey(menuKey) {
    if (!menuKey) return false
    if (!millerKeySet.has(menuKey)) return false
    const data = menuData?.[menuKey]
    return Boolean(data && Array.isArray(data.columns))
  }

  function applyMenuContainerPosition() {
    const headerHeight = document.querySelector("header")?.offsetHeight || 0
    const footerHeight = document.querySelector("footer")?.offsetHeight || 0

    // Only offset on tablets and above
    if (isTabletOrAbove()) {
      columnMenuContainer.style.top = headerHeight + 16 + "px"; // Add 16px spacing
      columnMenuContainer.style.bottom = footerHeight + 16 + "px"; // Add 16px spacing
    } else {
      // On mobile, use full device height
      columnMenuContainer.style.top = "16px"
      columnMenuContainer.style.bottom = "16px"
    }
  }

  function isVisibleForFocus(el) {
    if (!(el instanceof HTMLElement)) return false
    // Consider elements with client rects as visible enough for focus
    if (el.getClientRects().length === 0) return false
    return true
  }

  function getMenuFocusableElements({ includeSentinels = false } = {}) {
    const elements = columnMenuContainer.querySelectorAll(
      'button:not([disabled]), a[href]:not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"])',
    )
    return Array.from(elements).filter((el) => {
      if (!isVisibleForFocus(el)) return false
      if (!includeSentinels && (el === focusSentinelStart || el === focusSentinelEnd)) return false
      return true
    })
  }

  function getColumnItems(columnEl) {
    return Array.from(columnEl.querySelectorAll('.column-item[data-id]'))
  }

  function setRovingTabIndex(columnEl, preferredId) {
    const items = getColumnItems(columnEl)
    if (items.length === 0) return

    items.forEach((el) => el.setAttribute('tabindex', '-1'))
    const preferred =
      (preferredId && columnEl.querySelector(`.column-item[data-id="${preferredId}"]`)) || items[0]
    preferred.setAttribute('tabindex', '0')
  }

  function focusColumnItem(level, preferredId) {
    const column = columnsWrapper.querySelector(`.column[data-level="${level}"]`)
    if (!column) return

    setRovingTabIndex(column, preferredId)
    const target = column.querySelector('.column-item[tabindex="0"]')
    if (target instanceof HTMLElement) {
      target.focus()
      target.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' })
    }

    if (column instanceof HTMLElement && columnsWrapper instanceof HTMLElement) {
      const columnRect = column.getBoundingClientRect()
      const wrapperRect = columnsWrapper.getBoundingClientRect()
      const deltaLeft = columnRect.left - wrapperRect.left
      const deltaRight = columnRect.right - wrapperRect.right

      if (deltaLeft < 0) {
        columnsWrapper.scrollLeft += deltaLeft
      } else if (deltaRight > 0) {
        columnsWrapper.scrollLeft += deltaRight
      }
    }
  }

  function focusFirstMenuItem() {
    focusColumnItem(0)
  }

  function updateMainMenuAria() {
    mainMenuItems.forEach((mi) => {
      const btn = mi.querySelector('button')
      if (!btn) return
      const key = mi.dataset.menu
      if (!isMillerMenuKey(key)) return
      const expanded = Boolean(
        key && activeMainMenu === key && columnMenuContainer.classList.contains('active'),
      )
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false')
      btn.setAttribute('aria-controls', 'column-menu-container')
    })
  }

  // Initialize main menu event listeners
  const mainMenuItems = mainMenu.querySelectorAll(".main-menu-item")
  const mainMenuClickHandlers = new Map()
  const bindMainMenuItem = (item) => {
    const button = item.querySelector("button")
    const menuKey = item.dataset.menu

    if (!menuKey) return

    // Non-Miller items are expected to be normal links (or handled elsewhere).
    // If a menu overlay is open, close it when navigating away.
    if (!isMillerMenuKey(menuKey)) {
      const link = item.querySelector('a[href]')
      if (link) {
        link.addEventListener('click', () => {
          if (columnMenuContainer.classList.contains('active')) closeMenu()
        }, { signal })
      }
      return
    }

    if (!button) return

    const handler = () => {
      previouslyFocusedElement = document.activeElement

      // If clicking the same menu item that's already active, close the menu
      if (activeMainMenu === menuKey && columnMenuContainer.classList.contains("active")) {
        closeMenu()
        return
      }

      // Set active main menu
      activeMainMenu = menuKey
      activePath = []

      // Update active button styling
      mainMenuItems.forEach((mi) => {
        const btn = mi.querySelector("button")
        const key = mi.dataset.menu
        if (!isMillerMenuKey(key)) return
        if (btn) btn.classList.remove("active")
      })
      button.classList.add("active")

      // Open menu with the selected main menu data
      if (menuData[menuKey]) {
        openMenu(menuData[menuKey])
      } else {
        console.error(`Menu data for ${menuKey} not found`)
      }
    }

    button.addEventListener("click", handler, { signal })
    mainMenuClickHandlers.set(button, handler)
  }

  mainMenuItems.forEach(bindMainMenuItem)

  // Remove any existing event listeners to prevent duplicates
  menuOverlay.addEventListener("click", () => {
    if (columnMenuContainer.classList.contains('active')) closeMenu()
  }, { signal })

  if (menuCloseButton) {
    menuCloseButton.addEventListener('click', () => closeMenu(), { signal })
  }

  const bindSentinelFocus = (sentinel, direction) => {
    if (!sentinel) return
    sentinel.addEventListener('focus', () => {
      const focusables = getMenuFocusableElements()
      if (focusables.length === 0) return
      const target =
        direction === 'start'
          ? focusables[focusables.length - 1]
          : focusables[0]
      requestAnimationFrame(() => {
        if (target instanceof HTMLElement) target.focus()
      })
    }, { signal })
  }

  bindSentinelFocus(focusSentinelStart, 'start')
  bindSentinelFocus(focusSentinelEnd, 'end')

  // Function to open the menu
  function openMenu(menuObj) {
    if (!menuObj) {
      console.error("Menu object is undefined")
      return
    }

    document.dispatchEvent(
      new CustomEvent('navmenu:open', {
        detail: {
          type: 'miller',
          key: activeMainMenu,
        },
      }),
    )

    // Set menu title
    menuTitle.textContent = menuObj.title || "Menu"

    // Clear existing columns
    columnsWrapper.innerHTML = ""

    // Add initial columns
    if (menuObj.columns && Array.isArray(menuObj.columns)) {
      menuObj.columns.forEach((column) => {
        addColumn(column, 0)
      })
    } else {
      console.error("Menu columns are missing or not an array")
    }

    // Show menu and overlay (two-phase to ensure CSS transition runs)
    menuOverlay.classList.remove("hidden")
    columnMenuContainer.classList.remove("hidden")

    requestAnimationFrame(() => {
      menuOverlay.classList.add("active")
      columnMenuContainer.classList.add("active")
      updateMainMenuAria()
    })

    columnMenuContainer.setAttribute('role', 'dialog')
    columnMenuContainer.setAttribute('aria-modal', 'true')
    columnMenuContainer.setAttribute('aria-labelledby', 'menu-title')

    applyMenuContainerPosition()

    lockBodyScroll()

    requestAnimationFrame(() => {
      // Try focusing the first menu item; fallback to close button
      const firstItem = columnsWrapper.querySelector('.column-item')
      if (firstItem instanceof HTMLElement) {
        focusFirstMenuItem()
      } else if (menuCloseButton instanceof HTMLElement) {
        menuCloseButton.focus()
      }
    })
  }

  // Function to close the menu
  function closeMenu({ restoreFocus = true } = {}) {
    const closingKey = activeMainMenu

    // Hide menu and overlay
    const shouldKeepOverlayActive = Boolean(
      megaMenuContainer && megaMenuContainer.classList.contains('active'),
    )
    if (!shouldKeepOverlayActive) menuOverlay.classList.remove("active")
    columnMenuContainer.classList.remove("active")

    // Use setTimeout to match the transition duration
    setTimeout(() => {
      const shouldHideOverlay = !(megaMenuContainer && megaMenuContainer.classList.contains('active'))
      if (shouldHideOverlay) menuOverlay.classList.add("hidden")
      columnMenuContainer.classList.add("hidden")

      // Reset active states
      mainMenuItems.forEach((mi) => {
        const key = mi.dataset.menu
        if (!isMillerMenuKey(key)) return
        const btn = mi.querySelector('button')
        if (btn) btn.classList.remove('active')
      })

      activeMainMenu = null
      activePath = []

      updateMainMenuAria()

      if (restoreFocus && previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus()
      }
      previouslyFocusedElement = null

      document.dispatchEvent(
        new CustomEvent('navmenu:close', {
          detail: {
            type: 'miller',
            key: closingKey,
          },
        }),
      )

      unlockBodyScroll()
    }, 200)
  }

  function emitSelection(detail) {
    let canceled = false

    if (typeof onSelect === "function") {
      try {
        const result = onSelect(detail)
        if (result === false) canceled = true
      } catch (err) {
        console.error("Menu onSelect callback error", err)
      }
    }

    const event = new CustomEvent("menu:select", {
      detail,
      cancelable: true,
    })
    const dispatched = columnMenuContainer.dispatchEvent(event)
    if (dispatched === false) canceled = true

    return !canceled
  }

  // Function to add a column
  function addColumn(columnData, level) {
    if (!columnData) {
      console.error("Column data is missing")
      return
    }

    if (!columnData.items || !Array.isArray(columnData.items)) {
      console.error("Column items are missing or not an array", columnData)
      return
    }

    // Create column element
    const column = document.createElement("div")
    column.className =
      "column w-[clamp(200px,25vw,280px)] min-w-[200px] max-w-[320px] border-r border-gray-200 overflow-y-auto"
    column.setAttribute('role', 'listbox')
    column.setAttribute('aria-label', columnData.title || 'Column')
    column.dataset.level = level

    // Add column title
    const title = document.createElement("div")
    title.className = "font-medium p-3 border-b border-gray-200"
    title.textContent = columnData.title || "Column"
    title.setAttribute('role', 'heading')
    title.setAttribute('aria-level', `${Math.min(6, level + 2)}`)
    column.appendChild(title)

    // Add column items
    columnData.items.forEach((item) => {
      if (!item || !item.id) {
        console.error("Item or item ID is missing", item)
        return
      }

      const isLink = Boolean(item.href) && !item.hasChildren
      const itemEl = document.createElement(isLink ? 'a' : 'button')
      if (!isLink) itemEl.type = 'button'
      if (isLink) {
        itemEl.href = item.href
        if (item.target) itemEl.target = item.target
        if (item.target === '_blank') itemEl.rel = 'noopener noreferrer'
      }

      itemEl.className =
        "column-item flex justify-between items-center p-3 cursor-pointer transition-colors hover:bg-gray-100"
      itemEl.dataset.id = item.id
      itemEl.dataset.hasChildren = item.hasChildren ? 'true' : 'false'
      itemEl.setAttribute('role', 'option')
      itemEl.setAttribute('aria-selected', 'false')

      if (item.hasChildren) {
        itemEl.setAttribute('aria-haspopup', 'true')
        itemEl.setAttribute('aria-expanded', activePath[level] === item.id ? 'true' : 'false')
      }

      // Check if this item is in the active path
      if (activePath[level] === item.id) {
        itemEl.classList.add('active')
        itemEl.setAttribute('aria-selected', 'true')
        if (level === activePath.length - 1) {
          itemEl.classList.add('current')
          itemEl.setAttribute('aria-current', 'true')
        }
      }

      // Create item content
      const itemContent = document.createElement("span")
      itemContent.textContent = item.label || "Item"
      itemEl.appendChild(itemContent)

      // Add chevron if has children
      if (item.hasChildren) {
        const chevron = document.createElement("span")
        chevron.className = "opacity-50"
        chevron.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `
        itemEl.appendChild(chevron)
      }

      // Add click event
      itemEl.addEventListener('click', (e) => {
        const proceed = handleItemClick(item, level, { isLink })
        if (isLink && proceed === false) {
          e.preventDefault()
        }
      })

      column.appendChild(itemEl)
    })

    // Add column to wrapper
    columnsWrapper.appendChild(column)

    setRovingTabIndex(column, activePath[level])

    // Scroll to the right to show the new column
    columnsWrapper.scrollLeft = columnsWrapper.scrollWidth

    return column
  }

  // Function to handle item click
  function handleItemClick(item, level, { isLink = false } = {}) {
    if (!item) return

    // Update active path
    activePath = activePath.slice(0, level)
    activePath.push(item.id)

    // Remove all columns after this level
    const columns = columnsWrapper.querySelectorAll(".column")
    columns.forEach((col) => {
      if (Number.parseInt(col.dataset.level) > level) {
        col.remove()
      }
    })

    // The deepest selected item should be styled differently (Finder-like)
    const currentItems = columnsWrapper.querySelectorAll('.column-item.current')
    currentItems.forEach((el) => {
      el.classList.remove('current')
      el.removeAttribute('aria-current')
    })

    // Remove active class from all items at this level
    if (columns[level]) {
      const items = columns[level].querySelectorAll("[data-id]")
      items.forEach((i) => {
        i.classList.remove('active', 'current')
        i.setAttribute('aria-selected', 'false')
        i.removeAttribute('aria-current')
        if (i.getAttribute('data-has-children') === 'true') {
          i.setAttribute('aria-expanded', 'false')
        }
      })

      // Add active class to clicked item
      const clickedItem = columns[level].querySelector(`[data-id="${item.id}"]`)
      if (clickedItem) {
        clickedItem.classList.add('active', 'current')
        clickedItem.setAttribute('aria-current', 'true')
        clickedItem.setAttribute('aria-selected', 'true')
        if (clickedItem.getAttribute('data-has-children') === 'true') {
          clickedItem.setAttribute('aria-expanded', 'true')
        }

        setRovingTabIndex(columns[level], item.id)
        const active = columns[level].querySelector('.column-item[tabindex="0"]')
        if (active instanceof HTMLElement) active.focus()
      }
    }

    if (!item.hasChildren) {
      const shouldProceed = emitSelection({
        mainMenu: activeMainMenu,
        path: [...activePath],
        item,
      })

      if (!shouldProceed) return false

      closeMenu()

      // For link items, allow the native navigation to proceed unless we canceled.
      if (!isLink && item.href) {
        if (item.target === "_blank") {
          const newWindow = window.open(item.href, "_blank", "noopener,noreferrer")
          if (newWindow) newWindow.opener = null
        } else {
          window.location.assign(item.href)
        }
      }

      return true
    }

    // Find child data
    let currentData = menuData[activeMainMenu]

    // Navigate through the path to find the current data
    for (let i = 0; i < activePath.length; i++) {
      const pathId = activePath[i]
      if (currentData && currentData.children && currentData.children[pathId]) {
        currentData = currentData.children[pathId]
      } else {
        console.error("Could not find child data for path", activePath)
        return
      }
    }

    // Add new column if we have data
    if (currentData) {
      const newColumn = addColumn(currentData, level + 1)
      if (newColumn) {
        requestAnimationFrame(() => {
          focusColumnItem(level + 1)
        })
      }
    }

    return true
  }

  // Handle keyboard events
  function trapFocusWithinMenu(e) {
    const focusable = getMenuFocusableElements()
    if (focusable.length === 0) return

    const currentIndex = focusable.indexOf(document.activeElement)
    const nextIndex = e.shiftKey
      ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
      : (currentIndex === focusable.length - 1 ? 0 : currentIndex + 1)

    e.preventDefault()
    const next = focusable[nextIndex]
    if (next instanceof HTMLElement) {
      next.focus()
      if (next.classList.contains('column-item')) {
        const parentColumn = next.closest('.column')
        if (parentColumn && parentColumn.dataset.level) {
          const level = Number.parseInt(parentColumn.dataset.level)
          focusColumnItem(level, next.dataset.id)
        }
      } else if (next === menuCloseButton) {
        // Ensure wrapper scrolls back to start when wrapping to close then first item
        columnsWrapper.scrollLeft = 0
      }
    }
  }

  const onKeyDown = (e) => {
    if (!columnMenuContainer.classList.contains('active')) return

    if (e.key === 'Escape') {
      closeMenu()
      return
    }

    if (e.key === 'Tab') {
      trapFocusWithinMenu(e)
      return
    }

    const activeEl = document.activeElement
    if (!(activeEl instanceof HTMLElement)) return
    const activeItem = activeEl.closest('.column-item')
    if (!activeItem) return

    const column = activeItem.closest('.column')
    if (!column) return

    const level = Number.parseInt(column.dataset.level)
    const items = getColumnItems(column)
    const index = items.indexOf(activeItem)
    if (index === -1) return

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const nextIndex = e.key === 'ArrowDown' ? Math.min(items.length - 1, index + 1) : Math.max(0, index - 1)
      items.forEach((el) => el.setAttribute('tabindex', '-1'))
      items[nextIndex].setAttribute('tabindex', '0')
      items[nextIndex].focus()
      return
    }

    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      const nextIndex = e.key === 'Home' ? 0 : items.length - 1
      items.forEach((el) => el.setAttribute('tabindex', '-1'))
      items[nextIndex].setAttribute('tabindex', '0')
      items[nextIndex].focus()
      return
    }

    const dir = document.dir === 'rtl' ? 'rtl' : 'ltr'
    const forwardKey = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const backKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

    if (e.key === forwardKey) {
      if (activeItem.dataset.hasChildren !== 'true') return
      e.preventDefault()
      activeItem.click()
      return
    }

    if (e.key === backKey) {
      e.preventDefault()
      const previousLevel = Math.max(0, level - 1)
      const preferredId = activePath[previousLevel]
      focusColumnItem(previousLevel, preferredId)
      return
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      activeItem.click()
      return
    }
  }

  document.addEventListener('keydown', onKeyDown, { signal })

  // Handle window resize to adjust menu container position
  const onResize = () => {
    if (columnMenuContainer.classList.contains("active")) {
      applyMenuContainerPosition()
    }
  }
  window.addEventListener("resize", onResize, { signal })

  document.addEventListener('navmenu:open', (e) => {
    const type = e?.detail?.type
    if (type && type !== 'miller' && columnMenuContainer.classList.contains('active')) {
      closeMenu({ restoreFocus: false })
    }
  }, { signal })

  document.addEventListener('navmenu:requestclose', () => {
    if (columnMenuContainer.classList.contains('active')) {
      closeMenu({ restoreFocus: false })
    }
  }, { signal })

  // Initial calculation of header and footer heights
  applyMenuContainerPosition()

  function destroy() {
    listeners.abort()
  }

  return { destroy }
}

// Export the function for use in other files
export { initializeMenu }
