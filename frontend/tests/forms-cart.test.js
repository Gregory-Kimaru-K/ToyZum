import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeNextPath, validateProduct, apiErrorMessage } from '../src/lib/forms.js';
import { addCartProduct, cartQuantity, readCart } from '../src/lib/cart.js';
import { productPrice } from '../src/lib/catalogue.js';

test('auth return links preserve local routes without accepting external or malformed destinations', () => {
  assert.equal(safeNextPath('/home/puzzle?quantity=2'), '/home/puzzle?quantity=2');
  for (const value of [null, '', 'https://example.com', '//example.com', '/\\example.com', '/\nexample.com']) assert.equal(safeNextPath(value), '/home');
});

const product = { id: 1, name: 'Game', slug: 'game', quantity: 3, price: '1500', discounted_price: '1200' };

test('bag adds and merges products while clamping quantities to available stock', () => {
  const first = addCartProduct([], product, 2);
  assert.equal(first.length, 1);
  assert.equal(first[0].cartQuantity, 2);
  const second = addCartProduct(first, { ...product, id: '1' }, 2);
  assert.equal(second.length, 1);
  assert.equal(second[0].cartQuantity, 3);
  assert.deepEqual(addCartProduct([], { ...product, quantity: 0 }, 2), []);
  assert.equal(cartQuantity(-1, 4), 1);
  assert.equal(cartQuantity(10, 4), 4);
  assert.equal(cartQuantity(2, 0), 0);
  assert.equal(productPrice(product), 1200);
});

test('bag handles malformed or non-array saved data without crashing', () => {
  for (const value of ['{', '{}', 'null']) assert.deepEqual(readCart({ getItem: () => value }), []);
  assert.equal(readCart({ getItem: () => JSON.stringify([null, product]) }).length, 1);
  assert.deepEqual(readCart({ getItem: () => { throw new Error('Storage blocked'); } }), []);
});

const form = { name: 'Game', description: 'A game for two', images: ['data:image/png;base64,x'], price: '1500', discounted_price: '1200', quantity: '3', category: '4' };

test('product form rejects missing or inconsistent fields before submitting to the existing API', () => {
  assert.equal(validateProduct(form), '');
  assert.match(validateProduct({ ...form, name: ' ' }), /name/);
  assert.match(validateProduct({ ...form, images: [] }), /image/);
  assert.match(validateProduct({ ...form, discounted_price: '1800' }), /sale price/);
  assert.match(validateProduct({ ...form, quantity: '1.5' }), /whole stock/);
  assert.match(validateProduct({ ...form, category: '' }), /category/);
  assert.equal(validateProduct({ ...form, discounted_price: '', quantity: '0' }), '');
});

test('server validation messages become readable inline text', () => {
  assert.equal(apiErrorMessage({ name: ['This field is required.'], price: ['Use a valid price.'] }), 'This field is required. Use a valid price.');
  assert.equal(apiErrorMessage('<html>Server error</html>', 'Try again.'), 'Try again.');
});
