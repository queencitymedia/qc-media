import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, kind: 'thumb', note: 'placeholder' }, { status: 200 });
}