import assert from 'node:assert/strict';
import { planCuts } from './app.mjs';
const result = planCuts([{ id: 'A-01', length: 1000, section: 'A', damaged: [] }], [{ id: 'beam', length: 300, quantity: 3, section: 'A' }], 3);
assert.equal(result.bars[0].used, 909);
assert.equal(result.bars[0].length - result.bars[0].used, 91);
assert.equal(result.totals.placed, 3);
const damaged = planCuts([{ id: 'A-02', length: 1000, section: 'A', damaged: [{ start: 0, end: 500 }] }], [{ id: 'x', length: 600, quantity: 1, section: 'A' }], 3);
assert.equal(damaged.totals.placed, 0);
console.log('offcut: ok');
