// ops/dev/verify.mjs
// Purpose: fast file/data sanity check before dev
import { access, constants, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const mustExist = [
  "src/app/page.tsx",
  "src/app/api/offers/route.ts",
  "src/app/api/offers/[id]/route.ts",
  "src/lib/offers.ts",
  "ops/data/offers.json"
];

async function fileOk(p) {
  try { await access(path.join(root, p), constants.R_OK); return true; }
  catch { return false; }
}

const results = await Promise.all(mustExist.map(async p => [p, await fileOk(p)]));
const missing = results.filter(([, ok]) => !ok);
if (missing.length) {
  console.error("[verify] Missing files:");
  for (const [p] of missing) console.error(" -", p);
  process.exit(1);
}

try {
  const text = await readFile(path.join(root, "ops/data/offers.json"), "utf8");
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error("offers.json must be an array");
} catch (e) {
  console.error("[verify] Invalid ops/data/offers.json:", e.message);
  process.exit(1);
}

console.log("[verify] OK");