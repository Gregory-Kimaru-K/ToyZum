import { Link } from 'react-router-dom';
import Icon from '../storefront/Icon';

export function Notice({ children, kind = 'info' }) {
  if (!children) return null;
  return <div className={`gh-notice gh-notice-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</div>;
}

export function EmptyState({ title, children, icon = 'box', to, label, action }) {
  return <div className="gh-empty"><span className="gh-empty-icon"><Icon name={icon} size={30} /></span><h2>{title}</h2><div>{children}</div>{to && <Link className="gh-button" to={to}>{label || 'Explore games & toys'}<Icon name="arrow" size={18} /></Link>}{action}</div>;
}

export function AccessState({ seller = false, next = '/profile' }) {
  return <EmptyState title={seller ? 'This space is for store management.' : 'Your Gamehouse starts here.'} icon="user" to={`/auth/login?next=${encodeURIComponent(next)}`} label="Sign in"><p>{seller ? 'Sign in with an authorised store account to manage the catalogue.' : 'Sign in to see your account and orders.'}</p></EmptyState>;
}
