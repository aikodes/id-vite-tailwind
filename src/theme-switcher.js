(() => {
  const THEME_STORAGE_KEY = 'themeStyle';
  const THEME_OPTIONS = ['default', 'deta', 'softpop'];

  try {
    const stored = localStorage.getItem('themeMode');
    if (
      stored
        ? stored === 'dark'
        : matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      document.documentElement.classList.add('dark');
    }
  } catch {}

  const apply = (dark) => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('themeMode', dark ? 'dark' : 'light');
    } catch {}
  };

  document.addEventListener('basecoat:theme', (event) => {
    const mode = event.detail?.mode;
    apply(
      mode === 'dark'
        ? true
        : mode === 'light'
          ? false
          : !document.documentElement.classList.contains('dark'),
    );
  });

  const enableTheme = (name) => {
    const normalized = THEME_OPTIONS.includes(name) ? name : 'default';
    const links = /** @type {NodeListOf<HTMLLinkElement>} */ (
      document.querySelectorAll('link[data-theme-name]')
    );

    links.forEach((link) => {
      const isMatch = link.dataset.themeName === normalized;
      link.disabled = !isMatch;
    });

    try {
      localStorage.setItem(THEME_STORAGE_KEY, normalized);
    } catch {}

    const radios = document.querySelectorAll('[data-theme-option]');
    radios.forEach((el) => {
      const isActive = el.getAttribute('data-theme-option') === normalized;
      el.setAttribute('aria-checked', String(isActive));
      el.setAttribute('tabindex', isActive ? '0' : '-1');
      el.setAttribute('data-state', isActive ? 'checked' : 'unchecked');
    });
  };

  const initThemeDropdown = () => {
    const trigger = document.getElementById('theme-dropdown-trigger');
    const menu = document.getElementById('theme-dropdown-menu');
    if (!trigger || !menu) return;

    const saved = (() => {
      try {
        return localStorage.getItem(THEME_STORAGE_KEY) || undefined;
      } catch {
        return undefined;
      }
    })();
    enableTheme(saved);

    menu.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const option = target.closest('[data-theme-option]');
      if (!option) return;
      const theme = option.getAttribute('data-theme-option');
      if (!theme) return;
      enableTheme(theme);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeDropdown, {
      once: true,
    });
  } else {
    initThemeDropdown();
  }
})();
