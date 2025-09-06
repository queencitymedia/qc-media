
'use client';

import { useState, useTransition } from 'react';
import type { Offer } from '@/lib/types';

type Props = {
  offer: Offer;
  onLocalUpdate: (next: Offer) => void;
};

export default function OfferRow({ offer, onLocalUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(offer.name);
  const [price, setPrice] = useState(offer.price_usd ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const optimistic: Offer = { ...offer, name, price_usd: price };
    onLocalUpdate(optimistic); // optimistic
    setIsEditing(false);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/offers/${offer.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, price_usd: price }),
        });
        if (!res.ok) {
          throw new Error((await res.json()).error || 'Update failed');
        }
        const data = await res.json();
        onLocalUpdate(data.item);
      } catch (e: any) {
        setError(e.message || 'Update failed');
        // revert UI by refetching (quick fallback)
        try { await fetchAndHydrate(); } catch {}
      }
    });
  }

  async function fetchAndHydrate() {
    const res = await fetch('/api/offers');
    const data = await res.json();
    const actual = (data.items as Offer[]).find(x => x.id === offer.id);
    if (actual) onLocalUpdate(actual);
  }

  return (
    <div className="grid grid-cols-12 items-center gap-3 rounded-2xl border border-gray-200/60 bg-white/60 p-3 shadow-sm backdrop-blur dark:border-gray-800/60 dark:bg-gray-900/40">
      <div className="col-span-2 text-sm tabular-nums opacity-70">#{offer.id}</div>
      <div className="col-span-6">
        {isEditing ? (
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-gray-700 dark:bg-gray-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <div className="font-medium">{offer.name}</div>
        )}
      </div>
      <div className="col-span-2">
        {isEditing ? (
          <input
            type="number"
            step="1"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-gray-700 dark:bg-gray-900"
            value={price ?? ''}
            onChange={(e) => setPrice(e.target.value === '' ? null : Number(e.target.value))}
            placeholder="â€”"
          />
        ) : (
          <div className="tabular-nums">${price != null ? price : 'â€”'}</div>
        )}
      </div>
      <div className="col-span-2 flex justify-end gap-2">
        {isEditing ? (
          <>
            <button
              className="rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-gray-300 hover:bg-gray-50 dark:ring-gray-600 dark:hover:bg-gray-800"
              onClick={() => { setIsEditing(false); setName(offer.name); setPrice(offer.price_usd ?? null); }}
              disabled={pending}
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              onClick={save}
              disabled={pending}
            >
              Save
            </button>
          </>
        ) : (
          <button
            className="rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-gray-300 hover:bg-gray-50 dark:ring-gray-600 dark:hover:bg-gray-800"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="col-span-12 text-sm text-red-600 dark:text-red-300">{error}</div>
      )}
    </div>
  );
}
