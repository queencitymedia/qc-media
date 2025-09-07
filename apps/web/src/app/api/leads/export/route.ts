import { NextResponse } from "next/server";
import { listLeads } from "../../../../lib/leads";
export const runtime = "nodejs";

function toCSV(rows: any[]): string {
  if (!rows.length) return "id,name,email,phone,company,source,notes,created_at,status";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = (v ?? "").toString().replace(/"/g, '""');
    return /[,"\r\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map(h => escape((r as any)[h])).join(","));
  return lines.join("\r\n");
}

export async function GET() {
  try {
    const rows = await listLeads();
    const csv = toCSV(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="leads.csv"',
      }
    });
  } catch {
    return new NextResponse("error", { status: 500 });
  }
}
