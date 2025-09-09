# QC Media — Block Plan (Blocks 30–200)

> **Rules**
> - Never use "@/"; always use relative imports in routes and libs.
> - Resolve `ops/data/offers.json` **relative to** `src/lib/offers.ts` via `__filename`.
> - Client probes must call `http://localhost:PORT/`; the HttpListener may bind on `http://+:PORT/`.
> - Windows-safe paths in all scripts.

## Blocks 30–49 — API & UI Stabilization + Seed
- Keep `/api/offers` CRUD stable using file-backed store (`ops/data/offers.json`).
- `src/lib/offers.ts` uses `__filename` to resolve the JSON.
- Home page lists offers + create form; minimal styling.
- **Smokes:** GET `/`, GET `/api/offers`, POST `/api/offers`, GET/PUT/DELETE `/api/offers/{id}`.

**Deliverables**
- `apps/web/src/lib/offers.ts`
- `apps/web/src/app/api/offers/route.ts`
- `ops/data/offers.json`

## Blocks 50–69 — Persistence: SQLite + Repository
- Add `better-sqlite3` at `apps/web/var/data.sqlite`.
- Migrate JSON → SQLite on first boot if DB empty.
- Repository layer `lib/repo/*` with typed methods.
- Feature flag `QC_DB=sqlite|json`.

## Blocks 70–89 — Media & Static
- Offer images (≤5) + metadata.
- `/api/media/thumb` on-demand thumbnails.
- Cache-Control + ETag for media.

## Blocks 90–109 — Auth + RBAC
- Dev-only local session cookie.
- Roles: guest/editor/admin, middleware protection.
- `/login`, `/logout`, `/admin`.

## Blocks 110–129 — Admin Console + Moderation
- Dashboard with filters, bulk actions.
- States: draft/published/archived.
- Audit log table.
- Export CSV `/api/admin/export.csv`.

## Blocks 130–149 — Checkout Sandbox (Local)
- Local cart + checkout simulator (no external payment).
- Orders table; statuses created/paid(simulated)/failed.
- UI cart page.

## Blocks 150–169 — Observability
- `/health`, `/metrics`, `/status`.
- Logs to `ops/logs/app-YYYYMMDD.log`.

## Blocks 170–189 — Jobs & Email Mock
- Local job runner for thumbnails/reindex with retry.
- Email outbox table + `/api/dev/outbox`.
- Admin jobs page.

## Blocks 190–200 — Hardening + Docs + QA + Versions
- `/api/qa/seed`, `/api/qa/wipe` (admin).
- E2E smoke coverage across features.
- `CHANGELOG.md`, `docs/README.md`, tag `v1.0.x`.

---
*This plan is what the Runner executes when you say “Blocks X–Y”.*