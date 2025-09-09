// ops/dev/smoke.mjs
// Purpose: hit APIs quickly to confirm app is alive
import http from "node:http";

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const opts = { hostname: "localhost", port: 3000, path, method, headers: {} };
    if (data) { opts.headers["content-type"] = "application/json"; opts.headers["content-length"] = data.length; }
    const r = http.request(opts, res => {
      let chunks = "";
      res.on("data", d => chunks += d);
      res.on("end", () => resolve({ status: res.statusCode, body: chunks }));
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  const list = await req("GET", "/api/offers");
  if (list.status !== 200) { console.error("GET /api/offers failed", list.status); process.exit(1); }

  const created = await req("POST", "/api/offers", { name: "SmokeTest", price_usd: 123 });
  if (![200,201].includes(created.status)) { console.error("POST /api/offers failed", created.status); process.exit(1); }

  let id;
  try { id = JSON.parse(created.body).id; } catch {}
  if (!id) { console.error("Invalid POST response body"); process.exit(1); }

  const got = await req("GET", `/api/offers/${id}`);
  if (got.status !== 200) { console.error("GET /api/offers/:id failed", got.status); process.exit(1); }

  console.log("[smoke] OK");
})().catch(e => { console.error("[smoke] Error:", e.message); process.exit(1); });