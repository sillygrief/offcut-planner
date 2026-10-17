import { insist, list, integer, unique, text } from './lib/validation.mjs';
const overlaps = (a, b) => a.start < b.end && b.start < a.end;
export function planCuts(materials, demand, kerf = 3, locked = []) {
  list(materials, 'stock', 200); list(demand, 'demand'); list(locked, 'locked'); integer(kerf, 'kerf', 0, 100); unique(materials); unique(demand); unique(locked);
  const bars = materials.map(b => {
    integer(b.length, 'stock length', 1, 10000000); text(b.section, 'section');
    for (const z of b.damaged || []) { integer(z.start, 'zone start', 0, b.length); integer(z.end, 'zone end', z.start + 1, b.length); }
    return { ...b, cuts: [], used: 0 };
  });
  const pieces = demand.flatMap(d => {
    integer(d.length, 'piece length', 1, 10000000); integer(d.quantity, 'quantity', 1, 500); text(d.section, 'section');
    return Array.from({ length: d.quantity }, (_, i) => ({ id: `${d.id}-${i + 1}`, length: d.length, section: d.section }));
  });
  insist(pieces.length <= 500, 'At most 500 pieces');
  const occupied = b => [...(b.damaged || []), ...b.cuts.map(c => ({ start: c.start, end: c.end + kerf }))];
  const place = (p, b, start, locked) => {
    const span = { start, end: start + p.length + kerf };
    insist(p.section === b.section && span.end <= b.length && !occupied(b).some(z => overlaps(z, span)), `Infeasible cut: ${p.id}`);
    const cut = { ...p, barId: b.id, start, end: start + p.length, kerf, locked, status: '已排入' }; b.cuts.push(cut); return cut;
  };
  const assigned = new Map();
  for (const lock of locked) {
    const p = pieces.find(p => p.id === lock.id), b = bars.find(b => b.id === lock.barId);
    insist(p && b, 'Unknown locked piece or stock'); integer(lock.start, 'lock start'); assigned.set(p.id, place(p, b, lock.start, true));
  }
  for (const p of pieces.slice().sort((a, b) => b.length - a.length || a.id.localeCompare(b.id))) {
    if (assigned.has(p.id)) continue;
    let choice;
    for (const b of bars.filter(b => b.section === p.section)) {
      for (const start of [0, ...occupied(b).map(z => z.end)].sort((a, b) => a - b)) {
        const end = start + p.length + kerf;
        if (end > b.length || occupied(b).some(z => overlaps({ start, end }, z))) continue;
        const cost = (b.cuts.length ? 0 : 100000000) + b.length - end;
        if (!choice || cost < choice.cost) choice = { bar: b, start, cost };
      }
    }
    assigned.set(p.id, choice ? place(p, choice.bar, choice.start, false) : { ...p, status: '未排入' });
  }
  for (const b of bars) { b.cuts.sort((a, b) => a.start - b.start); b.used = Math.max(0, ...b.cuts.map(c => c.end + kerf)); b.remainder = b.length - b.used; }
  const placed = pieces.map(p => assigned.get(p.id));
  return { bars, placed, unplaced: placed.filter(p => p.status === '未排入'), totals: { requested: pieces.length, placed: placed.filter(p => p.status !== '未排入').length }, optimal: false };
}
export function run(x) { return planCuts(x.stock, x.demand, x.kerf, x.locked); }
export function validate(x) { run(x); }
