import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type Offer = { id: number; name: string; price_usd?: number };

// Resolve ops/data/offers.json relative to THIS file (src/lib/offers.ts)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// offers.ts is at apps/web/src/lib; go up two to apps/web, then ops/data/offers.json
const DATA_FILE = path.resolve(__dirname, "../../ops/data/offers.json");

async function readJson(): Promise<Offer[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Offer[];
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

async function writeJson(offers: Offer[]): Promise<void> {
  const pretty = JSON.stringify(offers, null, 2);
  await fs.writeFile(DATA_FILE, pretty, "utf8");
}

export async function readOffers(): Promise<Offer[]> {
  return readJson();
}

export async function readOffer(id: number): Promise<Offer | null> {
  const list = await readJson();
  return list.find(o => o.id === id) ?? null;
}

export async function createOffer(input: Omit<Offer, "id"> & Partial<Pick<Offer, "id">>): Promise<Offer> {
  const list = await readJson();
  const nextId = input.id ?? (list.length ? Math.max(...list.map(o => o.id)) + 1 : 1);
  const offer: Offer = { id: nextId, name: input.name, price_usd: input.price_usd };
  list.push(offer);
  await writeJson(list);
  return offer;
}

export async function updateOffer(id: number, patch: Partial<Offer>): Promise<Offer | null> {
  const list = await readJson();
  const idx = list.findIndex(o => o.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch, id }; // never change id
  list[idx] = updated;
  await writeJson(list);
  return updated;
}

export async function deleteOffer(id: number): Promise<boolean> {
  const list = await readJson();
  const next = list.filter(o => o.id !== id);
  if (next.length === list.length) return false;
  await writeJson(next);
  return true;
}