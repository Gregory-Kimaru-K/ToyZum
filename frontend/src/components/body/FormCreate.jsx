import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PhoneInputModule from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import AuthContext from '../../Context/AuthContext';
import FormField, { PasswordField } from '../ui/FormField';
import { Notice } from '../ui/Feedback';
import Icon from '../storefront/Icon';
import { safeNextPath } from '../../lib/forms';

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

export default function FormCreate() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '', password: '', cpassword: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const { createUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { search } = useLocation();
  const next = safeNextPath(new URLSearchParams(search).get('next'));
  const change = event => { setError(''); setForm(previous => ({ ...previous, [event.target.name]: event.target.value })); };
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    if (!/^[0-9]{9,15}$/.test(form.phone_number)) { setError('Please enter a valid phone number.'); return; }
    if (form.password !== form.cpassword) { setError('Your passwords don’t match.'); return; }
    setPending(true); setError('');
    try {
      const result = await createUser(form);
      if (result.success) navigate(next);
      else setError(result.errors || 'We couldn’t create your account. Please try again.');
    } catch { setError('We couldn’t connect. Please try again.'); }
    finally { setPending(false); }
  }
  return <><p className="gh-eyebrow">THERE’S ROOM FOR ONE MORE</p><h2>Join the good times.</h2><p className="gh-form-intro">Create your Gamehouse account.</p><form className="gh-form" onSubmit={submit} aria-busy={pending}><Notice kind="error">{error}</Notice><div className="gh-form-row"><FormField label="First name" name="first_name" autoComplete="given-name" required value={form.first_name} onChange={change} /><FormField label="Last name" name="last_name" autoComplete="family-name" required value={form.last_name} onChange={change} /></div><FormField label="Email address" name="email" type="email" autoComplete="email" required value={form.email} onChange={change} /><FormField label="Phone number" name="phone_number"><PhoneInput country="ke" value={form.phone_number} onChange={phone => setForm(previous => ({ ...previous, phone_number: phone }))} inputProps={{ id: 'phone_number', name: 'phone_number', required: true, autoComplete: 'tel' }} /></FormField><PasswordField autoComplete="new-password" minLength={8} value={form.password} onChange={change} hint="At least 8 characters. Avoid common passwords, all-digit passwords and personal details." /><PasswordField label="Confirm password" name="cpassword" autoComplete="new-password" value={form.cpassword} onChange={change} /><button className="gh-button" type="submit" disabled={pending}>{pending ? 'Creating account…' : 'Create account'}<Icon name="arrow" size={18} /></button></form><p className="gh-auth-switch">Already part of the fun? <Link to={`/auth/login?next=${encodeURIComponent(next)}`}>Sign in</Link></p></>;
}
