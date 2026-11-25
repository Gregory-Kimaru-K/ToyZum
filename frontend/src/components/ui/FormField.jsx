import { useState } from 'react';

export default function FormField({ label, name, hint, children, ...props }) {
  return <div className="gh-field"><label htmlFor={name}>{label}</label>{children || <input id={name} name={name} {...props} aria-describedby={hint ? `${name}-hint` : undefined} />}{hint && <p className="gh-field-hint" id={`${name}-hint`}>{hint}</p>}</div>;
}

export function PasswordField({ label = 'Password', name = 'password', autoComplete = 'current-password', hint, ...props }) {
  const [visible, setVisible] = useState(false);
  return <FormField label={label} name={name} hint={hint}><div className="gh-password"><input id={name} name={name} type={visible ? 'text' : 'password'} autoComplete={autoComplete} required {...props} aria-describedby={hint ? `${name}-hint` : undefined} /><button type="button" aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? 'Hide' : 'Show'}</button></div></FormField>;
}
