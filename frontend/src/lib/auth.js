import { jwtDecode } from 'jwt-decode';
import { apiErrorMessage } from './forms.js';

const endpoints = { register: 'user/create/', login: 'token/', refresh: 'token/refresh/' };

export function sessionFromTokens(tokens, now = Date.now() / 1000) {
  if (typeof tokens?.access !== 'string') throw new Error('Invalid authentication response.');
  const claims = jwtDecode(tokens.access);
  if (!Number.isFinite(claims.exp)) throw new Error('Invalid authentication response.');
  if (claims.exp > now) return { tokens, user: claims };
  if (typeof tokens.refresh === 'string' && jwtDecode(tokens.refresh).exp > now) return { tokens, user: null };
  return null;
}

export function readStoredSession(storage, now = Date.now() / 1000) {
  try { return sessionFromTokens(JSON.parse(storage.getItem('authTokens')), now); }
  catch { return null; }
}

export function registrationPayload(form) {
  const { email, phone_number, first_name, last_name, password } = form;
  return { email, phone_number, first_name, last_name, password };
}

export function refreshedSession(previous, response, now = Date.now() / 1000) {
  const session = sessionFromTokens({ access: response.access, refresh: response.refresh || previous.refresh }, now);
  if (!session?.user) throw new Error('Invalid authentication response.');
  return session;
}

export async function requestTokens(baseUrl, operation, payload) {
  if (!Object.hasOwn(endpoints, operation)) throw new Error('Unknown authentication operation.');
  const response = await fetch(`${baseUrl}${endpoints[operation]}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(operation === 'register' ? registrationPayload(payload) : payload),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(apiErrorMessage(data, 'We couldn’t sign you in. Please try again.'));
    error.status = response.status;
    throw error;
  }
  return data;
}
