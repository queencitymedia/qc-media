export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getActivity, updateActivity, deleteActivity } from "../../../../lib/activities";

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const item = await getActivity(Number(params.id));
  return item ? NextResponse.json(item) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const patch = await req.json();
  const item = await updateActivity(Number(params.id), patch);
  return item ? NextResponse.json(item) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
  const ok = await deleteActivity(Number(params.id));
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
