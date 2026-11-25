import { createContext, useCallback, useEffect, useState } from 'react';
import { readThemePreference, resolveTheme, saveThemePreference, THEME_PREFERENCES } from '../lib/theme';

const ThemeContext = createContext({ theme: 'light', preference: 'system', setPreference: () => {} });
export default ThemeContext;

function initialPreference() {
  try { return readThemePreference(localStorage); } catch { return 'system'; }
}
function deviceIsDark() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
}

export function ThemeProvider({ children }) {
  const [preference, updatePreference] = useState(initialPreference);
  const [systemDark, setSystemDark] = useState(deviceIsDark);
  const theme = resolveTheme(preference, systemDark);
  const setPreference = useCallback(value => {
    if (!THEME_PREFERENCES.includes(value)) return;
    updatePreference(value);
    try { saveThemePreference(localStorage, value); } catch { /* Keep the in-memory choice. */ }
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const change = event => setSystemDark(event.matches);
    setSystemDark(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151b17' : '#263c30');
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, preference, setPreference }}>{children}</ThemeContext.Provider>;
}
