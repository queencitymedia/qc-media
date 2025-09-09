const base = process.env.BASE;
(async () => {
  const headers = { "content-type": "application/json" };
  const j = async (r) => ({ r, body: await r.text() });

  let r = await fetch(base + "/api/offers", { headers });
  const rootHdr = { "cache-control": r.headers.get("cache-control"), "x-qc-route": r.headers.get("x-qc-route") };

  r = await fetch(base + "/api/offers", { method: "POST", headers, body: JSON.stringify({ title: "Block12 OnePaste", price: 123, status: "active" }) });
  if (r.status !== 201) throw new Error("POST " + r.status);
  let created = JSON.parse(await r.text());
  const id = created.id;

  r = await fetch(base + "/api/offers/" + id, { method: "PATCH", headers, body: JSON.stringify({ title: "Block12 OnePaste (edited)", price: 321 }) });
  const idHdrPatch = { "x-qc-route": r.headers.get("x-qc-route") };
  const patched = JSON.parse(await r.text());

  r = await fetch(base + "/api/offers/" + id, { headers });
  const idHdrGet = { "x-qc-route": r.headers.get("x-qc-route") };
  const got = JSON.parse(await r.text());

  await fetch(base + "/api/offers/" + id, { method: "DELETE" });

  const changed = patched.title === "Block12 OnePaste (edited)" && patched.price === 321
               && got.title === "Block12 OnePaste (edited)" && got.price === 321;

  console.log(JSON.stringify({
    base, headers: { rootHdr, idHdrPatch, idHdrGet }, changed, created, patched, got
  }, null, 2));
})().catch(e => { console.error(JSON.stringify({ error: String(e) }, null, 2)); process.exit(1); });