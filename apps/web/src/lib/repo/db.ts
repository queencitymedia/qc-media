import fs from 'fs';
import path from 'path';

const here = __filename;
const projectRoot = path.resolve(here, '../../../../'); // from src/lib/repo/db.ts to apps/web root
const dataPath = path.resolve(projectRoot, 'ops/data/offers.json');

export function readJson(): any {
  if (!fs.existsSync(dataPath)) return { offers: [] };
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch { return { offers: [] }; }
}
export function writeJson(obj: any) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(obj, null, 2), 'utf8');
}