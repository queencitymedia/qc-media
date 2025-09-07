import { handleLogin, handleLogout } from "@/lib/auth";
export const runtime = "nodejs";

export async function POST(req: Request) { return handleLogin(req); }
export async function DELETE(req: Request) { return handleLogout(req); }