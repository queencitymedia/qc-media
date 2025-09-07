import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.resolve(__dirname, "../../ops/logs/audit.ndjson");

export type AuditEntry = {
  at: string;           // ISO timestamp
  ip?: string | null;
  method: string;
  path: string;
  status: number;
  user?: "authed" | "guest";
  note?: string;        // selected fields snapshot
};

export async function auditAppend(e: AuditEntry) {
  const line = JSON.stringify(e) + "\n";
  await fs.appendFile(LOG_FILE, line, "utf8").catch(() => {});
}

export function ipFrom(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-for") || "";
  const first = xf.split(",")[0].trim();
  return first || req.headers.get("x-real-ip") || null;
}

export function isAuthedCookie(req: Request): boolean {
  const cookie = req.headers.get("cookie") || "";
  return /(?:^|;\s*)auth_ok=true(?:;|$)/.test(cookie);
}