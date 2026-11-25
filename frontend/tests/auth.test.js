import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readStoredSession, refreshedSession, registrationPayload, requestTokens, sessionFromTokens } from '../src/lib/auth.js';

function token(claims) {
  return `e30.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.test`;
}
const user = { exp: 2000, email: 'player@example.com', role: 'END_USER', first_name: 'Player' };
const tokens = { access: token(user), refresh: token({ exp: 4000 }) };

test('stored authentication checks expiry inside the JWT and handles invalid storage', () => {
  assert.equal(readStoredSession({ getItem: () => JSON.stringify(tokens) }, 1000).user.role, 'END_USER');
  for (const value of [null, '{}', '{', '{"access":"invalid"}']) assert.equal(readStoredSession({ getItem: () => value }, 1000), null);
  assert.equal(readStoredSession({ getItem: () => { throw new Error('Storage denied'); } }), null);
  assert.equal(sessionFromTokens(tokens, 5000), null);
});

test('expired access with a usable refresh token can resume without exposing an expired user', () => {
  const session = sessionFromTokens(tokens, 3000);
  assert.equal(session.user, null);
  assert.equal(session.tokens.refresh, tokens.refresh);
});

test('refresh accepts rotated tokens and preserves the previous refresh when rotation is omitted', () => {
  const access = token({ ...user, exp: 5000 });
  const rotated = token({ exp: 6000 });
  assert.equal(refreshedSession(tokens, { access, refresh: rotated }, 3000).tokens.refresh, rotated);
  assert.equal(refreshedSession(tokens, { access }, 3000).tokens.refresh, tokens.refresh);
  assert.throws(() => refreshedSession(tokens, { access: tokens.access }, 3000), /Invalid authentication/);
});

test('registration sends only the agreed public customer fields to the registration endpoint', async t => {
  const form = { email: 'player@example.com', first_name: 'Test', last_name: 'Player', phone_number: '254700000000', password: 'A long passphrase', cpassword: 'A long passphrase', role: 'SUPERUSER', is_staff: true };
  let request;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    request = { url, ...options };
    return { ok: true, json: async () => tokens };
  });
  assert.deepEqual(await requestTokens('https://store.example/api/', 'register', form), tokens);
  assert.equal(request.url, 'https://store.example/api/user/create/');
  const payload = JSON.parse(request.body);
  assert.deepEqual(payload, registrationPayload(form));
  for (const key of ['cpassword', 'role', 'is_staff']) assert.equal(key in payload, false);
});

test('login and refresh keep their existing endpoints and request shapes', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => { calls.push({ url, payload: JSON.parse(options.body) }); return { ok: true, json: async () => tokens }; });
  await requestTokens('/api/', 'login', { email: '254700000000', password: 'secret' });
  await requestTokens('/api/', 'refresh', { refresh: tokens.refresh });
  assert.equal(calls[0].url, '/api/token/');
  assert.equal(calls[0].payload.email, '254700000000');
  assert.deepEqual(calls[1], { url: '/api/token/refresh/', payload: { refresh: tokens.refresh } });
});

test('authentication validation failures preserve readable server messages', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 400, json: async () => ({ password: ['This password is too common.'] }) }));
  await assert.rejects(requestTokens('/api/', 'register', {}), error => error.message === 'This password is too common.' && error.status === 400);
});
