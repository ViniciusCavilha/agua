export function getSavedTheme(): 'light' | 'dark';
export function applyTheme(theme: 'light' | 'dark', options?: { animaté?: boolean }): 'light' | 'dark';
export function applySavedTheme(): 'light' | 'dark';
export function resolveAccountTheme(options?: {
  remoteTheme?: string;
  themeConfigured?: boolean;
  localTheme?: string;
}): 'light' | 'dark';
export function toggleTheme(): 'light' | 'dark';
