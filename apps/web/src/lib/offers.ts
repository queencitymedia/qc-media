import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, "../../../ops/data/offers.json");

export type Offer = { id: string; title: string; description?: string };

async function ensureFile() {
  try { await fs.access(DATA_FILE); }
  catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function readOffers(): Promise<Offer[]> {
  await ensureFile();
  try {
    const txt = await fs.readFile(DATA_FILE, "utf8");
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr as Offer[] : [];
  } catch { return []; }
}

export async function writeOffers(list: Offer[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
}

export async function getOffer(id: string) {
  const list = await readOffers();
  return list.find(o => o.id === id) ?? null;
}

export async function upsertOffer(data: Partial<Offer> & { title?: string }) {
  const title = (data.title ?? "").toString();
  if (!title) throw new Error("title_required");
  const description = (data.description ?? "").toString();

  const list = await readOffers();
  if (data.id) {
    const idx = list.findIndex(o => o.id === data.id);
    if (idx >= 0) {
      list[idx] = { id: data.id, title, description };
      await writeOffers(list);
      return list[idx];
    }
  }
  const id = "id-" + Math.random().toString(36).slice(2, 10);
  const item = { id, title, description };
  list.push(item);
  await writeOffers(list);
  return item;
}

export async function removeOffer(id: string) {
  const list = await readOffers();
  const next = list.filter(o => o.id !== id);
  if (next.length === list.length) return false;
  await writeOffers(next);
  return true;
}