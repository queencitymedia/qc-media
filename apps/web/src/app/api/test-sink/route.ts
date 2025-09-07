import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  return NextResponse.json({ received: true, bytes: body.length, preview: body.slice(0, 200) });
}
export async function GET() {
  return NextResponse.json({ ok: true, msg: "test-sink up" });
}
