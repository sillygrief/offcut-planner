import test from 'node:test'; import assert from 'node:assert/strict'; import { planCuts } from './core.mjs';
test('three cuts with kerf leave 91 mm', () => { const r = planCuts([{ id: 'a', length: 1000, section: 'A' }], [{ id: 'x', length: 300, quantity: 3, section: 'A' }]); assert.equal(r.bars[0].used, 909); assert.equal(r.bars[0].remainder, 91); });
test('actual locked coordinates and bar identity survive replanning', () => {
  const lock = { id: 'x-1', barId: 'a', start: 500 }, r = planCuts([{ id: 'a', length: 1000, section: 'A' }], [{ id: 'x', length: 200, quantity: 2, section: 'A' }], 3, [lock]);
  const cut = r.placed.find(p => p.id === 'x-1'); assert.equal(cut.start, 500); assert.equal(cut.barId, 'a'); assert.equal(cut.locked, true);
});
test('damaged zones include kerf; section mismatch leaves pieces unplaced', () => {
  const r = planCuts([{ id: 'a', length: 1000, section: 'A', damaged: [{ start: 300, end: 500 }] }], [{ id: 'x', length: 300, quantity: 1, section: 'A' }, { id: 'y', length: 10, quantity: 1, section: 'B' }]);
  assert.equal(r.placed.find(p => p.id === 'x-1').start, 500); assert.equal(r.unplaced.length, 1);
});
test('infeasible lock is refused', () => assert.throws(() => planCuts([{ id: 'a', length: 100, section: 'A' }], [{ id: 'x', length: 99, quantity: 1, section: 'A' }], 3, [{ id: 'x-1', barId: 'a', start: 0 }]), /Infeasible/));
