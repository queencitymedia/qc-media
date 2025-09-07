const base = process.env.BASE; // we will set to http://localhost:3010
(async () => {
  const headers = { "content-type": "application/json" };
  const rProbe = await fetch(base + "/api/_probe");
  const probe = { status: rProbe.status, hdr: rProbe.headers.get("x-qc-probe"), body: await rProbe.json() };

  let r = await fetch(base + "/api/offers", { headers });
  const rootHdr = { "cache-control": r.headers.get("cache-control"), "x-qc-route": r.headers.get("x-qc-route") };

  r = await fetch(base + "/api/offers", { method: "POST", headers, body: JSON.stringify({ title: "Block12 OnePaste", price: 123, status: "active" }) });
  if (r.status !== 201) throw new Error("POST " + r.status);
  let created = await r.json();
  const id = created.id;

  r = await fetch(base + "/api/offers/" + id, { method: "PATCH", headers, body: JSON.stringify({ title: "Block12 OnePaste (edited)", price: 321 }) });
  const idHdrPatch = { "x-qc-route": r.headers.get("x-qc-route") };
  const patched = await r.json();

  r = await fetch(base + "/api/offers/" + id, { headers });
  const idHdrGet = { "x-qc-route": r.headers.get("x-qc-route") };
  const got = await r.json();

  await fetch(base + "/api/offers/" + id, { method: "DELETE" });

  const changed = patched.title === "Block12 OnePaste (edited)" && patched.price === 321
               && got.title === "Block12 OnePaste (edited)" && got.price === 321;

  console.log(JSON.stringify({ base, probe, headers: { rootHdr, idHdrPatch, idHdrGet }, changed, created, patched, got }, null, 2));
})().catch(e => { console.error(JSON.stringify({ error: String(e) }, null, 2)); process.exit(1); });