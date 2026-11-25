import { useContext } from 'react';
import ThemeContext from '../../Context/ThemeContext';
import LightLogo from '../../assets/gamehouse-wordmark.webp';
import DarkLogo from '../../assets/gamehouse-wordmark-dark.webp';

export default function BrandLogo({ alt = 'Gamehouse Kenya' }) {
  const { theme } = useContext(ThemeContext);
  return <img className="gh-wordmark" src={theme === 'dark' ? DarkLogo : LightLogo} width="640" height="213" alt={alt} />;
}
