import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type ActivityType = "call"|"email"|"note"|"meeting";
export type Activity = {
  id: number;
  lead_id: number;
  type: ActivityType;
  summary: string;
  details?: string;
  follow_up_at?: string; // ISO date
  created_at: string;
  updated_at?: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const DATA_FILE  = path.resolve(__dirname, "../../ops/data/activities.json");

async function ensureFile() {
  try { await fs.access(DATA_FILE); }
  catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function listActivities() {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
    return [];
  }
}

export async function saveActivities(all) {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), "utf8");
}

export async function createActivity(input) {
  const all = await listActivities();
  const id = (all.at(-1)?.id ?? 0) + 1;
  const now = new Date().toISOString();
  const act = {
    id,
    lead_id: Number(input.lead_id ?? 0),
    type: input.type ?? "note",
    summary: input.summary ?? "No summary",
    details: input.details,
    follow_up_at: input.follow_up_at,
    created_at: now,
    updated_at: now
  };
  all.push(act);
  await saveActivities(all);
  return act;
}

export async function getActivity(id) {
  return (await listActivities()).find(a => a.id === id) ?? null;
}

export async function updateActivity(id, patch) {
  const all = await listActivities();
  const idx = all.findIndex(a => a.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  await saveActivities(all);
  return all[idx];
}

export async function deleteActivity(id) {
  const all = await listActivities();
  const keep = all.filter(a => a.id !== id);
  const removed = keep.length !== all.length;
  if (removed) await saveActivities(keep);
  return removed;
}
