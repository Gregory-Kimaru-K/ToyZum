import { useContext } from 'react';
import ThemeContext from '../../Context/ThemeContext';
import Icon from '../storefront/Icon';

export default function ThemeToggle() {
  const { theme, setPreference } = useContext(ThemeContext);
  const dark = theme === 'dark';
  return <button type="button" className="gh-theme-toggle" onClick={() => setPreference(dark ? 'light' : 'dark')} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} aria-pressed={dark} title={`Switch to ${dark ? 'light' : 'dark'} mode`}><Icon name={dark ? 'sun' : 'moon'} size={21} /></button>;
}
