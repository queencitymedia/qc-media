import { promises as fs } from "node:fs";
import path from "node:path";

export type Offer = { id: number; name: string; price_usd?: number; summary?: string; features?: string[] };

const DATA_FILE = path.resolve(process.cwd(), "ops/data/offers.json");

async function ensureFile() {
  try { await fs.access(DATA_FILE); }
  catch { await fs.mkdir(path.dirname(DATA_FILE), { recursive: true }); await fs.writeFile(DATA_FILE, "[]", "utf8"); }
}

async function readOffers(): Promise<Offer[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try { return JSON.parse(raw) as Offer[]; } catch { return []; }
}

async function writeOffers(all: Offer[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), "utf8");
}

export async function getAllOffers(): Promise<Offer[]> {
  return await readOffers();
}

export async function getOffer(id: number): Promise<Offer | undefined> {
  const all = await readOffers();
  return all.find(o => o.id === id);
}

export async function createOffer(partial: Omit<Offer,"id"> & { name: string }): Promise<Offer> {
  const all = await readOffers();
  const nextId = all.length ? Math.max(...all.map(o => o.id)) + 1 : 1;
  const offer: Offer = { id: nextId, ...partial };
  all.push(offer);
  await writeOffers(all);
  return offer;
}

export async function updateOffer(id: number, patch: Partial<Omit<Offer,"id">>): Promise<Offer | undefined> {
  const all = await readOffers();
  const i = all.findIndex(o => o.id === id);
  if (i < 0) return undefined;
  all[i] = { ...all[i], ...patch, id };
  await writeOffers(all);
  return all[i];
}

export async function deleteOffer(id: number): Promise<boolean> {
  const all = await readOffers();
  const next = all.filter(o => o.id !== id);
  if (next.length === all.length) return false;
  await writeOffers(next);
  return true;
}
