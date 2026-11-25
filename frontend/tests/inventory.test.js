import { test } from 'node:test';
import assert from 'node:assert/strict';
import { receiptRequestId } from '../src/lib/inventory.js';

test('receipt identifiers support both secure UUID generation and local-network development', () => {
  assert.equal(receiptRequestId({ randomUUID: () => 'request-id' }), 'request-id');
  const fallback = receiptRequestId({ getRandomValues: array => { array.fill(17); return array; } });
  assert.match(fallback, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.throws(() => receiptRequestId({}), /receipt couldn’t be prepared/);
});
