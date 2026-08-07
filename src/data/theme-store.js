const THEME_KEY = 'agua-plus-theme';
const TRANSITION_CLASS = 'theme-transitioning';
const TRANSITION_MS = 340;
let transitionTimer;

export const getSavedTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch (error) {
    return 'light';
  }
};

const startThemeTransition = () => {
  window.clearTimeout(transitionTimer);
  document.documentElement.classList.add(TRANSITION_CLASS);

  transitionTimer = window.setTimeout(() => {
    document.documentElement.classList.remove(TRANSITION_CLASS);
  }, TRANSITION_MS);
};

export const applyTheme = (theme, options = {}) => {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';

  if (options.animate) {
    startThemeTransition();
  }

  document.documentElement.dataset.theme = nextTheme;
  document.body.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);
  return nextTheme;
};

export const applySavedTheme = () => {
  return applyTheme(getSavedTheme());
};

export const resolveAccountTheme = ({ remoteTheme, themeConfigured, localTheme } = {}) => {
  if (themeConfigured) {
    return remoteTheme === 'dark' ? 'dark' : 'light';
  }

  return remoteTheme === 'dark' || localTheme === 'dark' || getSavedTheme() === 'dark' ? 'dark' : 'light';
};

export const toggleTheme = () => {
  return applyTheme(getSavedTheme() === 'dark' ? 'light' : 'dark', { animate: true });
};
