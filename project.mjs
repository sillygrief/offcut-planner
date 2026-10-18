import { field, table, column, view, metric, item, csvArtifact, summary } from './lib/product-kit.mjs';
export const product = {
  category: 'Workshop planning', projectNoun: 'Cutting job', runLabel: 'Plan this cutting job',
  outcome: 'Maintain stock, demand and operator locks; review stock layouts and export the workshop cut list.',
  fields: [
    table('stock','Stock inventory',[column('id','Stock ID'),column('length','Length (mm)','number'),column('section','Section'),column('damaged','Damaged zones','zones')]),
    table('demand','Required pieces',[column('id','Piece type'),column('length','Length (mm)','number'),column('quantity','Quantity','number'),column('section','Section')]),
    field('kerf','Kerf per cut (mm)','number'),
    table('locked','Locked placements',[column('id','Expanded piece ID'),column('barId','Stock ID'),column('start','Start (mm)','number')]),
  ],
  describe(result) {
    return summary([metric('Requested pieces',result.totals.requested),metric('Placed',result.totals.placed),metric('Unplaced',result.unplaced.length)], [
      view('Workshop cut list',[column('id','Piece'),column('barId','Stock'),column('start','Start mm'),column('end','End mm'),column('kerf','Kerf'),column('locked','Locked'),column('status','State')],result.placed),
      view('Stock summary',[column('id','Stock'),column('length','Length'),column('used','Occupied through'),column('remainder','End remainder')],result.bars),
    ],result.placed.map(p=>item(`piece:${p.id}`,p.id,p.barId ? `${p.barId}: ${p.start}–${p.end} mm`:'Add compatible stock or adjust demand.',!p.barId)),{type:'stock',bars:result.bars});
  },
  artifacts(result) {
    return [csvArtifact('cut-list','Workshop cut list',[column('id','Piece'),column('barId','Stock'),column('length','Length mm'),column('start','Start mm'),column('end','End mm'),column('kerf','Kerf mm'),column('status','State')],result.placed),
      csvArtifact('stock','Remaining stock',[column('id','Stock'),column('section','Section'),column('length','Length mm'),column('remainder','End remainder mm')],result.bars)];
  },
};
