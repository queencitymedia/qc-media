import { getBaseUrl } from "../lib/base-url";
const base = await getBaseUrl();
"use client";
import { useEffect, useMemo, useState } from "react";
import Toast from "@/components/ui/Toast";
import Confirm from "@/components/ui/Confirm";
import OfferForm from "./OfferForm";
import useDebounce from "@/components/ui/useDebounce";

type Offer = { id:number; name:string; price_usd?:number; summary?:string; features?:string[] };

type SortKey = "id"|"name"|"price_usd";
type SortDir = "asc"|"desc";

export default function OffersTable() {
  const [data, setData] = useState<Offer[]>([]);
  const [sort, setSort] = useState<SortKey>("id");
  const [dir, setDir] = useState<SortDir>("asc");
  const [toast, setToast] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Offer | null>(null);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [busyCsv, setBusyCsv] = useState(false);

  // New Block 11 state:
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 350);
  const [min, setMin] = useState<string>("");
  const [max, setMax] = useState<string>("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  async function load() {
    const sp = new URLSearchParams({
      sort, dir,
      page: String(page),
      size: String(size),
    });
    if (debouncedQ) sp.set("q", debouncedQ);
    const minNum = Number(min);
    const maxNum = Number(max);
    if (!Number.isNaN(minNum) && min !== "") sp.set("min", min);
    if (!Number.isNaN(maxNum) && max !== "") sp.set("max", max);
    const res = await fetch(`/api/offers?` + sp.toString());
    const json = await res.json();
    setData(Array.isArray(json) ? json : []);
    setTotal(Number(res.headers.get("X-Total-Count") ?? "0"));
  }

  // Fetch when filters/sort/pagination change
  useEffect(() => { load(); }, [sort, dir, debouncedQ, min, max, page, size]);

  function toggleSort(k:SortKey) {
    if (k === sort) setDir(d => d === "asc" ? "desc" : "asc");
    else { setSort(k); setDir("asc"); }
  }

  async function onCreated(newOffer: Offer) {
    setToast("Offer created");
    // naive refresh: go to first page to see newest (or you can stay)
    setPage(1);
    load();
  }
  async function onEdited(updated: Offer) {
    setToast("Offer updated");
    setEditing(null);
    setData(d => d.map(o => o.id === updated.id ? updated : o));
  }

  async function doDelete(id:number) {
    setToDelete(null);
    const prev = data;
    setData(d => d.filter(o => o.id !== id)); // optimistic
    const res = await fetch(`/api/offers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setData(prev); // rollback
      setToast("Delete failed");
    } else {
      setToast("Offer deleted");
      // adjust page if we deleted last row on the page
      const newTotal = total - 1;
      const lastPage = Math.max(1, Math.ceil(newTotal / size));
      if (page > lastPage) setPage(lastPage);
      else load();
      setTotal(newTotal);
    }
  }

  async function exportCsv() {
    setBusyCsv(true);
    const res = await fetch(`${base}/api/offers/csv");
    const text = await res.text();
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "offers.csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    setBusyCsv(false);
  }

  async function importCsv(file: File) {
    setBusyCsv(true);
    const text = await file.text();
    const res = await fetch(`${base}/api/offers/csv", { method: "POST", body: text, headers: { "Content-Type": "text/csv" }});
    setBusyCsv(false);
    if (!res.ok) {
      setToast("CSV import failed");
      return;
    }
    setToast("CSV imported");
    setPage(1);
    load();
  }

  const pages = Math.max(1, Math.ceil(total / size));
  const startRow = total === 0 ? 0 : (page - 1) * size + 1;
  const endRow = Math.min(total, page * size);
  const sortedIndicator = useMemo(() => ({ key:sort, dir }), [sort,dir]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <h2 className="text-xl font-semibold">Manage Offers</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={e=>{ setQ(e.target.value); setPage(1); }}
            placeholder="Search name, summary, featuresâ€¦"
            className="border rounded-lg px-3 py-2 w-64"
          />
          <input
            value={min}
            onChange={e=>{ setMin(e.target.value); setPage(1); }}
            placeholder="Min $"
            inputMode="decimal"
            className="border rounded-lg px-3 py-2 w-28"
          />
          <input
            value={max}
            onChange={e=>{ setMax(e.target.value); setPage(1); }}
            placeholder="Max $"
            inputMode="decimal"
            className="border rounded-lg px-3 py-2 w-28"
          />
          <select
            value={size}
            onChange={e=>{ setSize(Number(e.target.value)); setPage(1); }}
            className="border rounded-lg px-3 py-2"
            aria-label="Rows per page"
          >
            {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
          </select>
          <button onClick={exportCsv} disabled={busyCsv} className="px-3 py-2 rounded-lg border disabled:opacity-60">{busyCsv?"Exportingâ€¦":"Export CSV"}</button>
          <label className="px-3 py-2 rounded-lg border cursor-pointer">
            Import CSV
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if (f) importCsv(f); e.currentTarget.value=""; }} />
          </label>
        </div>
      </div>

      <OfferForm onSaved={onCreated} mode="create" />

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              {[
                ["id","ID"],
                ["name","Name"],
                ["price_usd","Price"],
                ["summary","Summary"],
                ["features","Features"],
                ["",""],
              ].map(([k,label],i)=>(
                <th key={i} className="px-3 py-2">
                  {k ? (
                    <button className="flex items-center gap-1" onClick={()=>toggleSort(k as SortKey)}>
                      <span>{label}</span>
                      {(sortedIndicator.key===k) && <span>{sortedIndicator.dir==="asc"?"â–²":"â–¼"}</span>}
                    </button>
                  ) : <span>{label}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(o=>(
              <tr key={o.id} className="border-t">
                <td className="px-3 py-2">{o.id}</td>
                <td className="px-3 py-2">{o.name}</td>
                <td className="px-3 py-2">{o.price_usd ?? ""}</td>
                <td className="px-3 py-2">{o.summary ?? ""}</td>
                <td className="px-3 py-2">{(o.features ?? []).join(", ")}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <button className="px-2 py-1 rounded-lg border" onClick={()=>setEditing(o)}>Edit</button>
                    <button className="px-2 py-1 rounded-lg border" onClick={()=>setToDelete(o)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length===0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">No offers match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          {total===0 ? "No results" : `Showing ${startRow}-${endRow} of ${total}`}
        </div>
        <div className="flex gap-2">
          <button className="px-2 py-1 rounded-lg border" onClick={()=>setPage(1)} disabled={page===1}>&laquo; First</button>
          <button className="px-2 py-1 rounded-lg border" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button>
          <span className="px-2 py-1 text-sm">Page {page} / {pages}</span>
          <button className="px-2 py-1 rounded-lg border" onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}>Next</button>
          <button className="px-2 py-1 rounded-lg border" onClick={()=>setPage(pages)} disabled={page===pages}>Last &raquo;</button>
        </div>
      </div>

      {editing && (
        <div className="border rounded-xl p-4">
          <OfferForm
            mode="edit"
            initial={editing}
            onSaved={onEdited}
          />
          <div className="mt-3">
            <button className="px-3 py-2 rounded-lg border" onClick={()=>setEditing(null)}>Close</button>
          </div>
        </div>
      )}

      {toDelete && <Confirm text={`Delete "${toDelete.name}"? This cannot be undone.`} onCancel={()=>setToDelete(null)} onConfirm={()=>doDelete(toDelete.id)} />}
      {toast && <Toast msg={toast} onDone={()=>setToast(null)} />}
    </div>
  );
}