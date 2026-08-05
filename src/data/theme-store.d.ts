export function getSavedTheme(): 'light' | 'dark';
export function applyTheme(theme: 'light' | 'dark', options?: { animate?: boolean }): 'light' | 'dark';
export function applySavedTheme(): 'light' | 'dark';
export function toggleTheme(): 'light' | 'dark';
