import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type Offer = {
  id: number;
  title: string;
  description?: string;
  price?: number;
  status: "draft"|"active"|"archived";
  created_at: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
// src/lib/offers.ts -> ../../ops/data/offers.json
const DATA_FILE  = path.resolve(__dirname, "../../ops/data/offers.json");

async function ensureFile() {
  try { await fs.access(DATA_FILE); }
  catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function listOffers(): Promise<Offer[]> {
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

export async function saveOffers(all: Offer[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), "utf8");
}

export async function createOffer(input: Partial<Offer>): Promise<Offer> {
  const all = await listOffers();
  const id = (all.at(-1)?.id ?? 0) + 1;
  const offer: Offer = {
    id,
    title: input.title ?? "Untitled",
    description: input.description,
    price: typeof input.price === "number" ? input.price : undefined,
    status: (input.status as Offer["status"]) ?? "draft",
    created_at: new Date().toISOString(),
  };
  all.push(offer);
  await saveOffers(all);
  return offer;
}

export async function getOffer(id: number) {
  return (await listOffers()).find(o => o.id === id) ?? null;
}

export async function updateOffer(id: number, patch: Partial<Offer>) {
  const all = await listOffers();
  const idx = all.findIndex(o => o.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch };
  await saveOffers(all);
  return all[idx];
}

export async function deleteOffer(id: number) {
  const all = await listOffers();
  const keep = all.filter(o => o.id !== id);
  const removed = keep.length !== all.length;
  if (removed) await saveOffers(keep);
  return removed;
}
