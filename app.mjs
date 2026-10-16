import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

function overlaps(a, b) { return a.start < b.end && b.start < a.end; }

export function planCuts(materials, demand, kerf = 3, locked = []) {
  const pieces = demand.flatMap(item => Array.from({ length: item.quantity }, (_, i) => ({ id: `${item.id}-${i + 1}`, length: item.length, section: item.section })));
  const bars = materials.map(bar => ({ ...bar, cuts: [], used: 0 }));
  const placed = [];
  for (const piece of pieces.sort((a, b) => b.length - a.length)) {
    const lock = locked.find(item => item.id === piece.id);
    const candidates = bars.filter(bar => bar.section === piece.section).sort((a, b) => (a.length - a.used) - (b.length - b.used));
    let choice = null;
    for (const bar of candidates) {
      let cursor = bar.used;
      while (cursor + piece.length <= bar.length) {
        const span = { start: cursor, end: cursor + piece.length };
        const blocked = (bar.damaged ?? []).some(zone => overlaps(span, zone)) || bar.cuts.some(cut => overlaps(span, { start: cut.start - kerf, end: cut.end + kerf }));
        if (!blocked) { choice = { bar, start: cursor, end: cursor + piece.length }; break; }
        cursor += 1;
      }
      if (choice) break;
    }
    if (!choice) { placed.push({ ...piece, status: '未排入' }); continue; }
    const cut = { ...piece, barId: choice.bar.id, start: choice.start, end: choice.end, status: lock ? '已锁定' : '已排入' };
    choice.bar.cuts.push(cut); choice.bar.used = Math.max(choice.bar.used, choice.end + kerf); placed.push(cut);
  }
  return { bars, placed, unplaced: placed.filter(item => item.status === '未排入'), totals: { requested: pieces.length, placed: placed.filter(item => item.status !== '未排入').length } };
}

function html() { return `<!doctype html><meta charset="utf-8"><title>余料 · 小作坊下料单</title><style>body{font:16px system-ui;margin:0;background:#f3efe5;color:#23333a}main{max-width:1000px;margin:auto;padding:32px}textarea{width:100%;min-height:100px;font:14px ui-monospace;padding:10px;box-sizing:border-box}section{background:#fff;padding:18px;margin:16px 0;border:1px solid #d6cbbd}button{background:#a83f12;color:#fff;border:0;padding:10px 14px;border-radius:3px}pre{white-space:pre-wrap;background:#f6d7bd;padding:12px}</style><main><p>余料 / 小作坊下料单</p><h1>每一刀都有位置，余料看得见。</h1><section><label>原料 JSON<textarea id="stock">[{"id":"A-01","length":1000,"section":"A","damaged":[]}]</textarea></label><label>需求 JSON<textarea id="demand">[{"id":"横梁","length":300,"quantity":3,"section":"A"}]</textarea></label><label>锯缝（mm）<input id="kerf" value="3" type="number"></label></section><button id="run">生成切割单</button><pre id="out">等待输入</pre></main><script>run.onclick=async()=>{const r=await fetch('/api/plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({stock:JSON.parse(stock.value),demand:JSON.parse(demand.value),kerf:Number(kerf.value)})});out.textContent=JSON.stringify(await r.json(),null,2)}</script>`; }

if (process.argv[1] === fileURLToPath(import.meta.url)) createServer((req, res) => { if (req.method === 'GET') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html()); return; } let body = ''; req.on('data', c => { body += c; }); req.on('end', () => { try { const input = JSON.parse(body); res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(planCuts(input.stock, input.demand, input.kerf))); } catch (error) { res.writeHead(400, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: error.message })); } }); }).listen(process.env.PORT || 3000);
