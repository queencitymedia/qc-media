import { readJson, writeJson } from '../repo/db';

export type Offer = { id: string; title: string; price: number; active?: boolean };

function genId(){ return 'id-' + Math.random().toString(36).slice(2,10); }

export function list(): Offer[] {
  const data = readJson(); return Array.isArray(data.offers) ? data.offers : [];
}

export function create(patch: Partial<Offer>): Offer {
  const data = readJson();
  const item: Offer = { id: genId(), title: String(patch.title ?? 'Untitled'), price: Number(patch.price ?? 0), active: patch.active ?? true };
  data.offers = Array.isArray(data.offers) ? data.offers : [];
  data.offers.push(item); writeJson(data); return item;
}

export function get(id: string): Offer | null {
  return list().find(x => x.id === id) ?? null;
}

export function update(id: string, patch: Partial<Offer>): Offer | null {
  const data = readJson(); data.offers = Array.isArray(data.offers) ? data.offers : [];
  const ix = data.offers.findIndex((x: Offer) => x.id === id);
  if (ix < 0) return null;
  const next = { ...data.offers[ix], ...patch };
  data.offers[ix] = next; writeJson(data); return next;
}

export function remove(id: string): boolean {
  const data = readJson(); data.offers = Array.isArray(data.offers) ? data.offers : [];
  const before = data.offers.length;
  data.offers = data.offers.filter((x: Offer) => x.id !== id);
  const changed = data.offers.length !== before; if (changed) writeJson(data);
  return changed;
}