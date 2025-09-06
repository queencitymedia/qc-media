import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:8000";

export async function GET(_req, { params }) {
  try {
    const r = await fetch(`${API_BASE}/offers/${params.id}`, { cache: "no-store" });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return NextResponse.json(data, { status: r.status });
  } catch (err) {
    return NextResponse.json({ error: String(err), API_BASE, id: params.id }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const r = await fetch(`${API_BASE}/offers/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return NextResponse.json(data, { status: r.status });
  } catch (err) {
    return NextResponse.json({ error: String(err), API_BASE, id: params.id }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const r = await fetch(`${API_BASE}/offers/${params.id}`, { method: "DELETE" });
    return new NextResponse(null, { status: r.status });
  } catch (err) {
    return NextResponse.json({ error: String(err), API_BASE, id: params.id }, { status: 500 });
  }
}
