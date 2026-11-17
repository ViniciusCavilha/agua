const CACHE_VERSION_KEY = 'agua-plus-cache-version';
const CURRENT_CACHE_VERSION = '2026-11-17-account-scoped-v4';
const LEGACY_GLOBAL_KEYS = new Set([
  'agua-plus-account',
  'agua-plus-goals',
  'agua-plus-notifications',
]);

const shouldRemoveKey = (key) => {
  return LEGACY_GLOBAL_KEYS.has(key);
};

export const clearStaleLocalCache = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const currentVersion = localStorage.getItem(CACHE_VERSION_KEY);

    if (currentVersion === CURRENT_CACHE_VERSION) {
      return;
    }

    Object.keys(localStorage)
      .filter(shouldRemoveKey)
      .forEach((key) => localStorage.removeItem(key));

    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
  } catch (error) {
    // Se o navegador bloquear localStorage, o app segue usando Firebase normalmente.
  }
};
