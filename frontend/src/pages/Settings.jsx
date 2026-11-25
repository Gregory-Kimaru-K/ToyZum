import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';
import PageShell from '../components/ui/PageShell';
import { AccessState, Notice } from '../components/ui/Feedback';
import Icon from '../components/storefront/Icon';
import AppearanceSettings from '../components/ui/AppearanceSettings';

export default function Settings() {
  const { user, logoutUser } = useContext(AuthContext);
  return <PageShell title="Make yourself at home." eyebrow="ACCOUNT SETTINGS" description="Your account and appearance, your way." backTo="/profile" backLabel="My account"><AppearanceSettings />{!user ? <AccessState next="/settings" /> : <div className="gh-panel gh-form-narrow"><h2>Account details</h2><dl className="gh-definition-list"><div><dt>Email</dt><dd>{user.email || 'Not provided'}</dd></div><div><dt>Phone number</dt><dd>{user.phone_number || 'Not provided'}</dd></div></dl><Notice>Editing account details and changing your password aren’t available here yet.</Notice><div className="gh-form-actions"><Link className="gh-text-link" to="/profile">Back to my account</Link><button className="gh-button gh-button-outline" onClick={logoutUser}>Sign out <Icon name="arrow" size={17} /></button></div></div>}</PageShell>;
}
