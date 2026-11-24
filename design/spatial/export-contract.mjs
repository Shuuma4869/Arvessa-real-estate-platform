// Keep production scene inputs tied to the existing demo and shared floorplan.
import ts from '../../apps/web/node_modules/typescript/lib/typescript.js';
import { readFile, writeFile } from 'node:fs/promises';
async function load(relative) {
  const source = await readFile(new URL(relative, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}
const { createSeed } = await load('../../apps/web/src/services/mocks/seed.ts');
const { residenceLayout } = await load('../../apps/web/src/features/spatial/residence-layout.ts');
const seed = createSeed(0);
const apartment = seed.properties.find(p => p.id === 'A0302');
const project = seed.projects.find(p => p.id === 'stillwater');
const units = seed.properties.filter(p => p.projectId === project.id);
if (units.length !== 48 || apartment.beds !== 2 || apartment.area !== 107) throw Error('Flagship contract changed; review scope before building.');
const layout = residenceLayout(apartment.beds, apartment.area);
const contract = { baseline: '8eb6d2976cf156a626db73827b0926251e215feb', project, units, apartment, layout, metresPerLayoutUnit: Math.sqrt(apartment.area / (layout.width * layout.depth)), coordinateMapping: 'Blender: x=layout.x*s, y=-layout.z*s, z=height; glTF exports Y up. Gross illustrative footprint scaled to 107m2; not a surveyed construction plan.', expansionApproved: false };
await writeFile(new URL('scene-contract.json', import.meta.url), JSON.stringify(contract, null, 2) + '\n');
console.log({ units: units.length, apartment: apartment.id, rooms: layout.rooms.length, metresPerLayoutUnit: contract.metresPerLayoutUnit });
