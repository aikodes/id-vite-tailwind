let cachedController = null;

function createOverlayController() {
  const overlay = document.getElementById('menu-overlay');
  if (!overlay) {
    console.error('Menu overlay element (#menu-overlay) not found');
    return {
      acquire: () => {},
      release: () => {},
      forceHide: () => {},
      isActive: () => false,
    };
  }

  let lockCount = 0;

  function show() {
    overlay.classList.add('active');
    overlay.classList.remove('hidden');
  }

  function hide() {
    overlay.classList.remove('active');
    overlay.classList.add('hidden');
  }

  return {
    acquire() {
      lockCount += 1;
      if (lockCount === 1) show();
    },
    release() {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) hide();
    },
    forceHide() {
      lockCount = 0;
      hide();
    },
    isActive() {
      return lockCount > 0;
    },
  };
}

export function getMenuOverlayController() {
  if (cachedController) return cachedController;
  cachedController = createOverlayController();
  return cachedController;
}
