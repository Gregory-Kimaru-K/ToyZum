import { Link, Outlet } from 'react-router-dom';
import { AuthProvider } from '../Context/AuthContext';
import BrandLogo from '../components/ui/BrandLogo';
import ThemeToggle from '../components/ui/ThemeToggle';
import PlayArtwork from '../components/storefront/PlayArtwork';
import Icon from '../components/storefront/Icon';
import '../styles/storefront.css';
import '../styles/app-ui.css';

export default function AuthLayout() {
  return <AuthProvider><div className="gh-storefront gh-auth-layout"><header className="gh-auth-header gh-container"><Link to="/home"><BrandLogo alt="Gamehouse Kenya home" /></Link><div className="gh-auth-actions"><ThemeToggle /><Link className="gh-text-link" to="/home">Back to the good times <Icon name="arrow" size={17} /></Link></div></header><main className="gh-auth-grid gh-container"><aside className="gh-auth-story"><p className="gh-eyebrow">YOUR PEOPLE. YOUR PLAY.</p><h1>Good times.<br />Great company.<br /><em>Your Gamehouse.</em></h1><p>A little fun for everyone. A place to find your next favourite and make more time together.</p><PlayArtwork /><span className="gh-auth-signoff">Never too young. Never too grown-up.</span></aside><section className="gh-auth-form"><Outlet /></section></main><footer className="gh-auth-footer gh-container">© {new Date().getFullYear()} Gamehouse Kenya · Let the good times play.</footer></div></AuthProvider>;
}
