const base = process.env.BASE;
(async () => {
  const j = (r) => r.json();
  const headers = { "content-type": "application/json" };

  // list (captures which handler answers)
  let r = await fetch(base + "/api/offers", { headers });
  if (!r.ok) throw new Error("GET list failed: " + r.status);
  const rootRoute = r.headers.get("x-qc-route");

  // create
  r = await fetch(base + "/api/offers", { method: "POST", headers, body: JSON.stringify({ title: "Block12 OnePaste", price: 123, status: "active" }) });
  if (r.status !== 201) throw new Error("POST failed: " + r.status);
  const created = await j(r);
  const id = created.id;

  // patch
  r = await fetch(base + "/api/offers/" + id, { method: "PATCH", headers, body: JSON.stringify({ title: "Block12 OnePaste (edited)", price: 321 }) });
  const idRouteHdr1 = r.headers.get("x-qc-route");
  if (!r.ok) throw new Error("PATCH failed: " + r.status);
  const patched = await j(r);

  // get
  r = await fetch(base + "/api/offers/" + id, { headers });
  const idRouteHdr2 = r.headers.get("x-qc-route");
  if (!r.ok) throw new Error("GET id failed: " + r.status);
  const got = await j(r);

  // delete
  r = await fetch(base + "/api/offers/" + id, { method: "DELETE" });
  if (!r.ok) throw new Error("DELETE failed: " + r.status);
  const del = await j(r);

  const changed = patched.title === "Block12 OnePaste (edited)" && patched.price === 321
               && got.title === "Block12 OnePaste (edited)" && got.price === 321;

  if (!changed) {
    console.error("FAIL: PATCH did not apply changes.", { rootRoute, idRouteHdr1, idRouteHdr2, patched, got });
    process.exit(1);
  }

  console.log(JSON.stringify({ base, rootRoute, idRouteHdr1, idRouteHdr2, created, patched, got, del }, null, 2));
})().catch(e => { console.error(String(e)); process.exit(1); });