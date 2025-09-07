# QC Media Speed Kit (Drop‑In)

This kit gives you a safe, repeatable way to boot your Next.js app fast, verify critical files, and smoke‑test your API.

## What’s inside

```
ops/
  dev/
    boot.ps1      # one‑command safe launcher (Windows PowerShell)
    verify.mjs    # quick file/data sanity check
    smoke.mjs     # quick API check on :3000
.vscode/
  tasks.json      # VS Code tasks for one‑key runs
```

## Safety
- **Deletion scope is limited** to: `apps/web/.next`, `apps/web/.turbo`, and `apps/web/node_modules/.cache`.
- **Data safety:** The script only **creates** `ops/data/offers.json` if it does **not** exist. If you already have one, it is **left untouched**.
- **No git or config changes** are made automatically.
- The script operates only inside `apps/web`.

## Install (Drop‑in)
1. Download the ZIP and extract it.
2. Move the `ops` and `.vscode` folders into your repo:
   - Destination: `C:\Users\<you>\qc-media\apps\web\`
   - You should end up with: `qc-media/apps/web/ops/dev/*` and `qc-media/apps/web/.vscode/tasks.json`
3. In `apps/web/package.json`, add scripts (or merge if you have them already):

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "clean": "rimraf .next node_modules/.cache .turbo",
    "verify": "node ./ops/dev/verify.mjs",
    "smoke": "node ./ops/dev/smoke.mjs"
  }
}
```

If you don't use `rimraf`, install it once: `npm i -D rimraf`

## Use
- **Fast boot:** Open Windows PowerShell, then:
  ```powershell
  cd $HOME\qc-media\apps\web
  .\ops\dev\boot.ps1
  ```
- **Quick checks (if dev server already running elsewhere):**
  ```bash
  npm run verify && npm run smoke
  ```

## Optional: VS Code shortcuts
Open the Command Palette → "Tasks: Run Task" → choose _Dev_, _Clean+Dev_, or _Verify+Smoke_. You can bind hotkeys to these tasks.

## Notes
- If you prefer `pwsh` (PowerShell 7), you can run `boot.ps1` there too.
- If your repo uses `pnpm` workspaces, the script will install at the repo root; otherwise it installs in `apps/web`.
- The script sets `PORT=3000` and `NODE_OPTIONS=--enable-source-maps` for better stack traces.