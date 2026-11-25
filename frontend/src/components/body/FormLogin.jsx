import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
import FormField, { PasswordField } from '../ui/FormField';
import { Notice } from '../ui/Feedback';
import Icon from '../storefront/Icon';
import { safeNextPath } from '../../lib/forms';

export default function FormLogin() {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { search } = useLocation();
  const next = safeNextPath(new URLSearchParams(search).get('next'));
  const change = event => { setError(''); setLoginData(previous => ({ ...previous, [event.target.name]: event.target.value })); };
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError('');
    try {
      const result = await loginUser(loginData);
      if (result.success) navigate(next);
      else setError(result.errors || 'We couldn’t sign you in. Please try again.');
    } catch { setError('We couldn’t connect. Please try again.'); }
    finally { setPending(false); }
  }
  return <><p className="gh-eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>Welcome back.</h2><p className="gh-form-intro">Sign in for your next round of good times.</p><form className="gh-form" onSubmit={submit} aria-busy={pending}>
    <Notice kind="error">{error}</Notice>
    <FormField label="Email or phone number" name="email" type="text" autoComplete="username" required value={loginData.email} onChange={change} placeholder="Your email or phone number" />
    <PasswordField value={loginData.password} onChange={change} />
    <button className="gh-button" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}<Icon name="arrow" size={18} /></button>
  </form><p className="gh-auth-switch">New to Gamehouse? <Link to={`/auth/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></p><Link className="gh-auth-browse" to="/home/products">Keep exploring as a guest</Link></>;
}
