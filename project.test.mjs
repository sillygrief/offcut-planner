import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spec} from './app.mjs';
import {Workspace} from './lib/workspace.mjs';
async function sample(){const input=structuredClone(spec.sample);return input;}

test('project has business forms, review output and actual deliverable formats',async()=>{const input=await sample(),result=await spec.run(input),view=spec.product.describe(result,input),artifacts=spec.product.artifacts(result,input,{runId:'fixture',createdAt:'2026-10-18T00:00:00.000Z'});assert.ok(spec.product.fields.length>=2);assert.ok(view.metrics.length);assert.ok(view.tables.length);assert.ok(artifacts.length);assert.ok(artifacts.every(a=>a.content.length&&a.extension));});

test('business-specific revision and release behavior',async()=>{const input=await sample();const r=await spec.run(input),v=spec.product.describe(r,input);assert.equal(r.totals.placed,3);assert.equal(v.graphic.type,'stock');assert.ok(spec.product.artifacts(r,input,{}).find(a=>a.id==='cut-list').content.includes('beam-3'));});

test('real business result survives project storage, cloning and input restore',async t=>{const dir=mkdtempSync(join(tmpdir(),'offcut-project-')),config={mode:'local',workspaceDir:dir};let workspace=new Workspace(spec,config,null);t.after(()=>{workspace.close();rmSync(dir,{recursive:true,force:true});});let project=workspace.create({name:'Offcut Planner acceptance fixture',data:await sample()}),output=await workspace.run(project.id,{revision:project.revision});assert.equal(output.run.state,'complete');const runId=output.run.id;workspace.close();workspace=new Workspace(spec,config,null);const restored=workspace.runDetail(project.id,runId);assert.deepEqual(restored.result,output.run.result);assert.ok(restored.downloads.length>=2);const duplicate=workspace.clone(project.id,{revision:workspace.get(project.id).revision});assert.equal(duplicate.runs.length,0);assert.deepEqual(duplicate.data,restored.input);});
