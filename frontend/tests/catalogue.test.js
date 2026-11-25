import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchCatalogue, filterCatalogue, productPrice } from '../src/lib/catalogue.js';

const products = [
  { id: '1', name: 'Family Board Game', description: 'A strategy game for the table', price: '3000', discountedPrice: '2400', category: { name: 'Games', slug: 'games', industry: { slug: 'play' } } },
  { id: '2', name: 'Wooden Puzzle', description: 'Colourful animal pieces', price: '1200', discountedPrice: null, category: { name: 'Puzzles', slug: 'puzzles', industry: { slug: 'play' } } },
  { id: '3', name: 'Building Blocks', description: null, price: '2500', discountedPrice: '0', category: null },
];

test('search handles whitespace, case, multiple words and missing category data', () => {
  assert.deepEqual(filterCatalogue(products, new URLSearchParams('q=++FAMILY++strategy++')).map(p => p.id), ['1']);
  assert.deepEqual(filterCatalogue(products, new URLSearchParams('q=animal')).map(p => p.id), ['2']);
  assert.deepEqual(filterCatalogue(products, new URLSearchParams('q=blocks')).map(p => p.id), ['3']);
  assert.deepEqual(filterCatalogue(products, new URLSearchParams('q=unavailable')), []);
});

test('category, industry and inclusive budget filters combine using the displayed sale price', () => {
  assert.deepEqual(filterCatalogue(products, new URLSearchParams('industryId=play&categoryId=games&price_Gt=2000&price_Lt=2400')).map(p => p.id), ['1']);
  assert.deepEqual(filterCatalogue(products, new URLSearchParams('categoryId=puzzles&price_Gt=2000')), []);
  assert.equal(productPrice(products[0]), 2400);
  assert.equal(productPrice(products[2]), 2500);
  assert.equal(productPrice({ price: '100', discountedPrice: '120' }), 100);
});

function page(nodes, hasNextPage, endCursor) {
  return { ok: true, json: async () => ({ data: {
    allCategories: [{ id: 'c1', name: 'Games', slug: 'games' }],
    allProducts: { edges: nodes.map(node => ({ node })), pageInfo: { hasNextPage, endCursor } },
  } }) };
}

test('catalogue follows all pages and forwards seller scope and cancellation', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, ...options, payload: JSON.parse(options.body) });
    return calls.length === 1 ? page(products.slice(0, 2), true, 'page-2') : page(products.slice(2), false, 'end');
  });
  const controller = new AbortController();
  const result = await fetchCatalogue('https://store.example/api/', controller.signal, 'seller@example.com');
  assert.equal(result.products.length, 3);
  assert.equal(result.categories.length, 1);
  assert.equal(calls[0].url, 'https://store.example/api/toyzum/graphql/');
  assert.equal(calls[0].payload.variables.after, null);
  assert.equal(calls[1].payload.variables.after, 'page-2');
  assert.equal(calls[1].payload.variables.sellerEmail, 'seller@example.com');
  assert.equal(calls[1].signal, controller.signal);
});

test('HTTP and GraphQL failures are errors rather than empty shelves', async t => {
  const mock = t.mock.method(globalThis, 'fetch', async () => ({ ok: false }));
  await assert.rejects(fetchCatalogue('https://store.example/'), /unavailable/);
  mock.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ errors: [{ message: 'Schema error' }] }) }));
  await assert.rejects(fetchCatalogue('https://store.example/'), /unavailable/);
});

test('a repeated pagination cursor fails instead of looping indefinitely', async t => {
  t.mock.method(globalThis, 'fetch', async () => page([], true, 'same-cursor'));
  await assert.rejects(fetchCatalogue('https://store.example/'), /pagination failed/);
});

test('products can be found by any assigned category and department without matching unrelated combinations', () => {
  const product = { name: 'Together game', description: '', price: '1000', categories: [
    { name: 'Couples', slug: 'couples', industry: { slug: 'adults' } },
    { name: 'Party', slug: 'party', industry: { slug: 'friends' } },
  ] };
  assert.equal(filterCatalogue([product], new URLSearchParams('categoryId=party')).length, 1);
  assert.equal(filterCatalogue([product], new URLSearchParams('industryId=friends')).length, 1);
  assert.equal(filterCatalogue([product], new URLSearchParams('q=couples')).length, 1);
  assert.equal(filterCatalogue([product], new URLSearchParams('categoryId=couples&industryId=friends')).length, 0);
});
