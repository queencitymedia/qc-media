"use client";
import { useEffect, useState } from "react";

type Activity = {
  id: number; lead_id: number; type: string; summary: string;
  details?: string; follow_up_at?: string; created_at: string; updated_at?: string;
};

export default function ActivitiesPage() {
  const [q, setQ] = useState("");
  const [lead, setLead] = useState("");
  const [rows, setRows] = useState<Activity[]>([]);

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (lead) params.set("lead", lead);
    const res = await fetch(`/api/activities${params.toString() ? `?${params}` : ""}`);
    setRows(await res.json());
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Activities</h1>
      <div className="flex gap-2">
        <input className="border px-3 py-2 rounded w-56" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
        <input className="border px-3 py-2 rounded w-40" placeholder="Lead ID" value={lead} onChange={e=>setLead(e.target.value)} />
        <button className="border px-3 py-2 rounded" onClick={load}>Filter</button>
        <a href="/activities/new" className="ml-auto border px-3 py-2 rounded">+ New Activity</a>
      </div>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2">ID</th>
            <th className="text-left p-2">Lead</th>
            <th className="text-left p-2">Type</th>
            <th className="text-left p-2">Summary</th>
            <th className="text-left p-2">Follow-up</th>
            <th className="text-left p-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.id}</td>
              <td className="p-2">{r.lead_id}</td>
              <td className="p-2">{r.type}</td>
              <td className="p-2">{r.summary}</td>
              <td className="p-2">{r.follow_up_at ?? "-"}</td>
              <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
