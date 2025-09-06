
# Block 5 — Offers Dashboard (UI + UX + Inline Edit)

**Objective:** Expand the offers UI into a small dashboard, add styling and better UX, and connect to future business logic.

## What’s included

- `apps/web/src/app/offers/page.tsx` — route page that renders the dashboard
- `apps/web/src/components/offers/OffersDashboard.tsx` — main dashboard UI
- `apps/web/src/components/offers/OfferRow.tsx` — row component with inline editing
- `apps/web/src/components/offers/LoadingSkeleton.tsx` — loading state
- `apps/web/src/components/offers/ErrorState.tsx` — error state
- `apps/web/src/lib/types.ts` — shared types
- `apps/web/src/lib/use-debounce.ts` — tiny debounce hook
- `apps/web/src/app/api/offers/route.ts` — GET with search/sort/filter
- `apps/web/src/app/api/offers/[id]/route.ts` — PATCH for inline editing

> These files assume you already have `apps/web/src/lib/offers.ts` that reads/writes `ops/data/offers.json`
> created in earlier blocks. If you don’t, see the stub in this README below to add it quickly.

---

## Install prerequisites (once per repo)

From repo root:

```powershell
# Ensure Tailwind 4 is set up (from earlier blocks). If shadcn/ui not installed yet, this still works.
# Optional (if you want shadcn/ui components):
# npx shadcn@latest init
# npx shadcn@latest add button input card table dropdown-menu toast
```

---

## Drop the files

Unzip this into your repo root so paths line up like:

```
apps/
  web/
    src/
      app/
        offers/page.tsx
        api/offers/route.ts
        api/offers/[id]/route.ts
      components/
        offers/
          OffersDashboard.tsx
          OfferRow.tsx
          LoadingSkeleton.tsx
          ErrorState.tsx
      lib/
        use-debounce.ts
        types.ts
        offers.ts        # (you should already have this from Block 3/4)
ops/
  data/
    offers.json          # your data file
```

---

## Run it

From repo root (or `apps/web`):

```powershell
# dev
cd apps/web
pnpm dev # or npm run dev / yarn dev
# open http://localhost:3000/offers
```

---

## Minimal `offers.ts` (only if you’re missing it)

Create `apps/web/src/lib/offers.ts` with:

```ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Offer } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, "../../ops/data/offers.json");

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function readOffers(): Promise<Offer[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw) as Offer[];
  } catch {
    return [];
  }
}

export async function writeOffers(list: Offer[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
}
```

---

## Notes

- Inline editing uses **optimistic UI** and PATCH `/api/offers/[id]`.
- Sort options: `id`, `name`, `price`. Add more anytime.
- Filters: min/max price; Search across id+name (case-insensitive).
