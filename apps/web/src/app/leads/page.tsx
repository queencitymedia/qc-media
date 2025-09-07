"use client";
import { useEffect, useState } from "react";

type Lead = {
  id: number; name: string; email?: string; phone?: string; company?: string;
  notes?: string; source?: string; created_at: string; status: string;
};

export default function LeadsPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Lead[]>([]);

  async function load(query = "") {
    const res = await fetch(`/api/leads${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    setRows(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: number, status: string) {
    const res = await fetch(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (res.ok) load(q);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Leads</h1>
      <div className="flex gap-2">
        <input className="border px-3 py-2 rounded w-64" placeholder="Search…" value={q}
               onChange={e => setQ(e.target.value)} />
        <button className="border px-3 py-2 rounded" onClick={() => load(q)}>Search</button>
        <a href="/leads/new" className="ml-auto border px-3 py-2 rounded">+ New Lead</a>
      <a className="border px-3 py-2 rounded" href="/api/leads/export">Export CSV</a><a href="/activities/new" className="border px-3 py-2 rounded">+ Log Activity</a></div>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2">ID</th>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Company</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.id}</td>
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.email}</td>
              <td className="p-2">{r.company}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">
                {["new","contacted","qualified","won","lost"].map(s=>(
                  <button key={s} className="border px-2 py-1 mr-1 rounded"
                          onClick={()=>setStatus(r.id, s)}>{s}</button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


