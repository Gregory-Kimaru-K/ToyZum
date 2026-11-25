export const THEME_KEY = 'gamehouse-theme';
export const THEME_PREFERENCES = ['light', 'dark', 'system'];

export function readThemePreference(storage) {
  try {
    const value = storage.getItem(THEME_KEY);
    return THEME_PREFERENCES.includes(value) ? value : 'system';
  } catch { return 'system'; }
}

export function resolveTheme(preference, systemDark) {
  return preference === 'dark' || (preference === 'system' && systemDark) ? 'dark' : 'light';
}

export function saveThemePreference(storage, preference) {
  if (!THEME_PREFERENCES.includes(preference)) return;
  try { storage.setItem(THEME_KEY, preference); } catch { /* Apply for this session if storage is blocked. */ }
}
