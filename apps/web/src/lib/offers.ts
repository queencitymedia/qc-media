import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Offer = {
  id: number;
  title: string;
  status: "draft" | "active" | "archived";
  created_at: string;
  price_usd?: number;
  summary?: string;
  features?: string[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// data at apps/web/ops/data/offers.json (relative to this file)
const DATA_FILE = path.resolve(__dirname, "../../ops/data/offers.json");

function ensureStore() {
  const dir = path.dirname(DATA_FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, "[]", "utf8");
}

function load(): Offer[] {
  ensureStore();
  const raw = readFileSync(DATA_FILE, "utf8");
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(all: Offer[]) {
  ensureStore();
  writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), "utf8");
}

export function listOffers(): Offer[] {
  return load();
}

export function createOffer(input: {
  title?: string;
  name?: string;
  price_usd?: number;
  summary?: string;
  features?: string[];
}): Offer {
  const all = load();
  const nextId = all.reduce((m, o) => Math.max(m, o.id || 0), 0) + 1;
  const title = input.title ?? input.name ?? "Untitled";
  const now = new Date().toISOString();
  const offer: Offer = {
    id: nextId,
    title,
    status: "draft",
    created_at: now,
    ...(input.price_usd !== undefined ? { price_usd: input.price_usd } : {}),
    ...(input.summary ? { summary: input.summary } : {}),
    ...(input.features ? { features: input.features } : {}),
  };
  all.push(offer);
  save(all);
  return offer;
}

export function getOffer(id: number): Offer | null {
  const all = load();
  const found = all.find(o => o.id === id);
  return found ?? null;
}

export function deleteOffer(id: number): boolean {
  const all = load();
  const idx = all.findIndex(o => o.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  save(all);
  return true;
}