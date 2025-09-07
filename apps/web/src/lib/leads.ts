import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type Lead = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
  created_at: string;
  status: "new"|"contacted"|"qualified"|"lost"|"won";
};

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
// src/lib/leads.ts -> ../../ops/data/leads.json
const DATA_FILE  = path.resolve(__dirname, "../../ops/data/leads.json");

async function ensureFile() {
  try { await fs.access(DATA_FILE); }
  catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function listLeads(): Promise<Lead[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
    return [];
  }
}

export async function saveLeads(all: Lead[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), "utf8");
}

export async function createLead(input: Partial<Lead>): Promise<Lead> {
  const all = await listLeads();
  const id = (all.at(-1)?.id ?? 0) + 1;
  const lead: Lead = {
    id,
    name: input.name ?? "Unknown",
    email: input.email,
    phone: input.phone,
    company: input.company,
    source: input.source ?? "website_form",
    notes: input.notes,
    status: "new",
    created_at: new Date().toISOString()
  };
  all.push(lead);
  await saveLeads(all);
  return lead;
}

export async function getLead(id: number) {
  return (await listLeads()).find(l => l.id === id) ?? null;
}

export async function updateLead(id: number, patch: Partial<Lead>) {
  const all = await listLeads();
  const idx = all.findIndex(l => l.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch };
  await saveLeads(all);
  return all[idx];
}

export async function deleteLead(id: number) {
  const all = await listLeads();
  const keep = all.filter(l => l.id !== id);
  const removed = keep.length !== all.length;
  if (removed) await saveLeads(keep);
  return removed;
}
