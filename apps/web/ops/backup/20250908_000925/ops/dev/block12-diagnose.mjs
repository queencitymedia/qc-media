import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const base = process.env.BASE;
const jsonHeaders = { "content-type": "application/json" };

function sha1(s){ return crypto.createHash("sha1").update(String(s)).digest("hex"); }
async function j(r){ const body = await r.text(); let json; try{ json = JSON.parse(body) } catch { json = { __raw: body } } ; return { r, json, body }; }

function now(){ const t = process.hrtime.bigint(); return Number(t / 1000000n); } // ms
async function timedFetch(url, init){
  const t0 = now();
  const r = await fetch(url, init);
  const t1 = now();
  return { ms: t1 - t0, r };
}

function walkUpFind(start, file){
  let cur = start;
  for (let i=0;i<8;i++){
    const p = path.join(cur, file);
    if (fs.existsSync(p)) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return null;
}

function candidateFiles(){
  const here = path.resolve("./");
  const rootGuess = walkUpFind(here, "package.json") ?? process.env.PROJECT_CWD ?? process.env.INIT_CWD ?? process.cwd();
  const arr = [
    process.env.PROJECT_CWD && path.resolve(process.env.PROJECT_CWD, "ops/data/offers.json"),
    process.env.INIT_CWD && path.resolve(process.env.INIT_CWD, "ops/data/offers.json"),
    path.resolve(rootGuess, "ops/data/offers.json"),
    path.resolve(here, "ops/data/offers.json"),
    path.resolve(here, "../../ops/data/offers.json"),
    path.resolve(here, "../../../ops/data/offers.json"),
    path.resolve(process.cwd(), "ops/data/offers.json"),
  ].filter(Boolean);
  const seen = new Set(); const out = [];
  for(const p of arr){ if(!seen.has(p)){ seen.add(p); out.push(p); } }
  return out;
}

function readFileInfo(p){
  try{
    if(!fs.existsSync(p)) return { path: p, exists: false };
    const txt = fs.readFileSync(p, "utf8");
    return { path: p, exists: true, size: Buffer.byteLength(txt), sha1: sha1(txt), preview: txt.slice(0, 160) };
  }catch(e){
    return { path: p, exists: true, error: String(e) };
  }
}

function listShadowRoutes(){
  const root = path.resolve("./");
  const shadows = [];
  const pat = new RegExp("\\\\api\\\\offers(\\\\|\\[)"); // regex-safe on Windows
  function scan(dir){
    let entries = [];
    try{ entries = fs.readdirSync(dir, { withFileTypes:true }); }catch{ return; }
    for(const f of entries){
      const fp = path.join(dir, f.name);
      if (f.isDirectory()) { scan(fp); continue; }
      if (!f.isFile()) continue;
      const win = fp.replace(/\//g,"\\");
      const isShadow = pat.test(win)
        && !win.endsWith(path.join("src","app","api","offers","route.ts"))
        && !win.endsWith(path.join("src","app","api","offers","[id]","route.ts"));
      if (isShadow) shadows.push(win);
    }
  }
  scan(root);
  return shadows;
}

(async () => {
  const info = {
    meta: {
      os: `${os.platform()} ${os.release()}`,
      node: process.version,
      cwd: process.cwd(),
      env: { PROJECT_CWD: process.env.PROJECT_CWD || null, INIT_CWD: process.env.INIT_CWD || null }
    },
    base,
    routes: {},
    steps: [],
    files: [],
    shadows: listShadowRoutes(),
    perf_ms: {}
  };

  // 1) GET /api/offers (checks cache-control + x-qc-route)
  let t = await timedFetch(base + "/api/offers", { headers: jsonHeaders });
  info.perf_ms.GET_list = t.ms;
  info.routes.rootStatus = t.r.status;
  info.routes.rootHeaders = {
    "cache-control": t.r.headers.get("cache-control"),
    "x-qc-route": t.r.headers.get("x-qc-route")
  };
  let { json: list1 } = await j(t.r);

  // 2) POST create
  t = await timedFetch(base + "/api/offers", { method: "POST", headers: jsonHeaders, body: JSON.stringify({ title: "B12 Diag", price: 100, status: "active", description: "first" }) });
  info.perf_ms.POST_create = t.ms;
  const postStatus = t.r.status;
  const { json: created } = await j(t.r);
  const id = created?.id;

  // 3) PATCH update
  t = await timedFetch(base + `/api/offers/${id}`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ title: "B12 Diag (patched)", price: 999, description: "edited", status: "draft" }) });
  info.perf_ms.PATCH_update = t.ms;
  info.routes.idPatchStatus = t.r.status;
  info.routes.idPatchHeader = { "x-qc-route": t.r.headers.get("x-qc-route") };
  const { json: patched } = await j(t.r);

  // 4) GET by id
  t = await timedFetch(base + `/api/offers/${id}`, { headers: jsonHeaders });
  info.perf_ms.GET_by_id = t.ms;
  info.routes.idGetStatus = t.r.status;
  info.routes.idGetHeader = { "x-qc-route": t.r.headers.get("x-qc-route") };
  const { json: got } = await j(t.r);

  // 5) DELETE
  t = await timedFetch(base + `/api/offers/${id}`, { method: "DELETE" });
  info.perf_ms.DELETE = t.ms;
  const delStatus = t.r.status;
  const { json: del } = await j(t.r);

  // 6) GET list again
  t = await timedFetch(base + "/api/offers", { headers: jsonHeaders });
  info.perf_ms.GET_list_after = t.ms;
  const { json: list2 } = await j(t.r);

  // 7) file candidates (resolver sanity)
  info.files = candidateFiles().map(readFileInfo);

  // Verdicts
  const changed =
    patched?.title === "B12 Diag (patched)" && patched?.price === 999 &&
    got?.title === "B12 Diag (patched)" && got?.price === 999;

  const cacheNoStore = (info.routes.rootHeaders["cache-control"] || "").toLowerCase().includes("no-store");

  info.result = {
    changed,                                   // true only if PATCH applied
    cache_no_store: cacheNoStore,              // true if our no-store header is present
    used_root_handler: !!info.routes.rootHeaders["x-qc-route"], // we stamp x-qc-route
    used_id_handler: !!(info.routes.idPatchHeader["x-qc-route"] || info.routes.idGetHeader["x-qc-route"]),
    shadows_exist: info.shadows.length > 0,
    reason: changed ? "PATCH applied" : "PATCH did NOT apply"
  };

  info.steps.push(
    { step: "GET list", status: info.routes.rootStatus, ms: info.perf_ms.GET_list, cache: info.routes.rootHeaders["cache-control"], x_route: info.routes.rootHeaders["x-qc-route"], length: Array.isArray(list1)? list1.length : null },
    { step: "POST create", status: postStatus, ms: info.perf_ms.POST_create, created },
    { step: "PATCH mutate", status: info.routes.idPatchStatus, ms: info.perf_ms.PATCH_update, patched, x_route: info.routes.idPatchHeader["x-qc-route"] },
    { step: "GET by id", status: info.routes.idGetStatus, ms: info.perf_ms.GET_by_id, got, x_route: info.routes.idGetHeader["x-qc-route"] },
    { step: "DELETE", status: delStatus, ms: info.perf_ms.DELETE, del },
    { step: "GET list (after)", status: 200, ms: info.perf_ms.GET_list_after, length: Array.isArray(list2)? list2.length : null }
  );

  console.log(JSON.stringify(info, null, 2));
})().catch(e => {
  console.error(JSON.stringify({ error: String(e), stack: e?.stack }, null, 2));
  process.exit(1);
});