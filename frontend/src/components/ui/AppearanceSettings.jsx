import { useContext } from 'react';
import ThemeContext from '../../Context/ThemeContext';
import Icon from '../storefront/Icon';

export default function AppearanceSettings() {
  const { preference, setPreference } = useContext(ThemeContext);
  return <section className="gh-panel gh-form-narrow gh-appearance"><h2>Make it your kind of light.</h2><p>Choose an appearance for this device. “Device” follows your system settings.</p><div className="gh-theme-choices" role="group" aria-label="Appearance">{[{ value: 'light', name: 'Light', icon: 'sun' }, { value: 'dark', name: 'Dark', icon: 'moon' }, { value: 'system', name: 'Device', icon: 'device' }].map(choice => <button key={choice.value} type="button" aria-pressed={preference === choice.value} onClick={() => setPreference(choice.value)}><Icon name={choice.icon} size={22} /><span>{choice.name}</span></button>)}</div></section>;
}
