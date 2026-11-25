import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { readThemePreference, resolveTheme, saveThemePreference, THEME_KEY } from '../src/lib/theme.js';

const bootstrap = readFileSync(new URL('../public/theme-init.js', import.meta.url), 'utf8');

test('device appearance is the default and explicit preferences override it', () => {
  assert.equal(readThemePreference({ getItem: () => null }), 'system');
  assert.equal(readThemePreference({ getItem: () => 'invalid' }), 'system');
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('theme choice persists independently of authentication and tolerates unavailable storage', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  saveThemePreference(storage, 'dark');
  assert.equal(values.get(THEME_KEY), 'dark');
  assert.equal(readThemePreference(storage), 'dark');
  saveThemePreference(storage, 'system');
  assert.equal(readThemePreference(storage), 'system');
  saveThemePreference(storage, 'invalid');
  assert.equal(readThemePreference(storage), 'system');
  const blocked = { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } };
  assert.equal(readThemePreference(blocked), 'system');
  assert.doesNotThrow(() => saveThemePreference(blocked, 'dark'));
});

test('pre-paint bootstrap agrees with the app for saved and device themes', () => {
  for (const preference of ['light', 'dark', 'system', null, 'invalid']) {
    for (const systemDark of [false, true]) {
      const root = { dataset: {}, style: {} };
      let colour;
      runInNewContext(bootstrap, {
        localStorage: { getItem: () => preference },
        window: { matchMedia: () => ({ matches: systemDark }) },
        document: { documentElement: root, querySelector: () => ({ setAttribute: (_, value) => { colour = value; } }) },
      });
      const expected = resolveTheme(['light', 'dark'].includes(preference) ? preference : 'system', systemDark);
      assert.equal(root.dataset.theme, expected);
      assert.equal(root.style.colorScheme, expected);
      assert.equal(colour, expected === 'dark' ? '#151b17' : '#263c30');
    }
  }
});

test('pre-paint bootstrap follows device settings if storage is blocked', () => {
  const root = { dataset: {}, style: {} };
  runInNewContext(bootstrap, {
    localStorage: { getItem: () => { throw new Error(); } },
    window: { matchMedia: () => ({ matches: true }) },
    document: { documentElement: root, querySelector: () => null },
  });
  assert.equal(root.dataset.theme, 'dark');
});
