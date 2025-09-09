# ops/dev/boot.ps1
# Purpose: fast, SAFE dev boot for qc-media/apps/web
# Safety: only touches caches INSIDE apps/web and creates ops/data/offers.json if missing.

$ErrorActionPreference = "Stop"

# --- Resolve paths ---
$root = Join-Path $HOME "qc-media"
$web  = Join-Path $root "apps\web"
if (!(Test-Path -LiteralPath $web)) {
  throw "Project not found at $web. Adjust the path in ops/dev/boot.ps1 if needed."
}
Set-Location -LiteralPath $web

Write-Host "[boot] Working dir: $((Get-Location).Path)"

# --- Dependency install strategy (safe) ---
# Priority: pnpm workspace if available; otherwise npm in this app folder.
$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
$havePnpm = $pnpm -ne $null
$pkgJsonPath = Join-Path $web "package.json"

if (!(Test-Path -LiteralPath (Join-Path $root "node_modules")) -and !(Test-Path -LiteralPath (Join-Path $web "node_modules"))) {
  if ($havePnpm) {
    Write-Host "[install] Detected pnpm. Installing at repo root (if present) or app folder..."
    if (Test-Path -LiteralPath (Join-Path $root "pnpm-workspace.yaml")) {
      Push-Location $root
      pnpm install
      Pop-Location
    } else {
      pnpm install
    }
  } else {
    Write-Host "[install] pnpm not found. Falling back to npm install in apps/web..."
    if (Test-Path -LiteralPath (Join-Path $web "package-lock.json")) {
      npm ci
    } else {
      npm install
    }
  }
} else {
  Write-Host "[install] Dependencies already present. Skipping install."
}

# --- Clean SAFE caches inside apps/web only ---
$targets = @(".next", ".turbo", "node_modules\.cache")
foreach ($t in $targets) {
  $p = Join-Path $web $t
  if (Test-Path -LiteralPath $p) {
    Write-Host "[clean] Removing $t ..."
    try {
      Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop
    } catch {
Write-Warning ("Could not remove {0}: {1}" -f $t, $_.Exception.Message)
    }
  }
}

# --- Ensure ops/data/offers.json seeded (non-destructive if exists) ---
$dataDir = Join-Path $web "ops\data"
if (!(Test-Path -LiteralPath $dataDir)) {
  New-Item -ItemType Directory -Path $dataDir | Out-Null
}
$offers = Join-Path $dataDir "offers.json"
if (!(Test-Path -LiteralPath $offers)) {
@'
[
  { "id": 1, "name": "Starter", "price_usd": 750 },
  { "id": 2, "name": "Growth",  "price_usd": 1800 },
  { "id": 3, "name": "Pro",     "price_usd": 3200 }
]
'@ | Set-Content -Encoding UTF8 $offers
  Write-Host "[seed] Created ops/data/offers.json (starter data)"
} else {
  Write-Host "[seed] ops/data/offers.json already exists. Leaving it untouched."
}

# --- Encoding & env niceties ---
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:NODE_OPTIONS="--enable-source-maps"
$env:PORT="3000"

# --- Start Next.js dev server ---
Write-Host "[dev] Launching Next.js on http://localhost:3000"
npm run dev
