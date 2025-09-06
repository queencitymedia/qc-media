
'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorState from './ErrorState';
import OfferRow from './OfferRow';
import type { Offer } from '@/src/lib/types';
import { useDebounce } from '@/src/lib/use-debounce';

type SortKey = 'id' | 'name' | 'price';
type Dir = 'asc' | 'desc';

export default function OffersDashboard() {
  const [items, setItems] = useState<Offer[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // controls
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('id');
  const [dir, setDir] = useState<Dir>('asc');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const debouncedQ = useDebounce(q, 300);
  const debouncedMin = useDebounce(minPrice, 300);
  const debouncedMax = useDebounce(maxPrice, 300);

  function updateLocal(updated: Offer) {
    setItems((prev) => {
      if (!prev) return prev;
      const idx = prev.findIndex((x) => x.id === updated.id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = updated;
      return copy;
    });
  }

  async function fetchData() {
    setErr(null);
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (sort) params.set('sort', sort);
    if (dir) params.set('dir', dir);
    if (debouncedMin !== '') params.set('minPrice', debouncedMin);
    if (debouncedMax !== '') params.set('maxPrice', debouncedMax);
    const res = await fetch(`/api/offers?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    return data.items as Offer[];
  }

  useEffect(() => {
    let mounted = true;
    startTransition(async () => {
      try {
        const list = await fetchData();
        if (mounted) setItems(list);
      } catch (e: any) {
        if (mounted) setErr(e.message || 'Failed to load');
      }
    });
    return () => { mounted = false; };
  }, [debouncedQ, sort, dir, debouncedMin, debouncedMax]);

  const count = items?.length ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 md:p-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Offers</h1>
          <p className="text-sm opacity-70">Search, sort, filter, and edit inline.</p>
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200/60 bg-white/60 p-4 shadow-sm backdrop-blur dark:border-gray-800/60 dark:bg-gray-900/40">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <input
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-gray-700 dark:bg-gray-900"
              placeholder="Search offers (id, name, price)…"
              value={q} onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-span-4">
            <select
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="id">Sort: ID</option>
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
            </select>
            <select
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={dir}
              onChange={(e) => setDir(e.target.value as Dir)}
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-span-3">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min $"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max $"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </section>

      {err && <ErrorState message={err} />}

      {!items && !err ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm opacity-70">{count} result{count === 1 ? '' : 's'}</span>
          </div>
          <div className="hidden grid-cols-12 gap-3 px-1 text-xs uppercase tracking-wide opacity-60 md:grid">
            <div className="col-span-2">ID</div>
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Actions</div>
          </div>
          <div className="space-y-2">
            {items?.map((o) => (
              <OfferRow key={o.id} offer={o} onLocalUpdate={updateLocal} />
            ))}
            {items && items.length === 0 && (
              <div className="rounded-2xl border border-dashed p-8 text-center opacity-70">
                No offers match your filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
