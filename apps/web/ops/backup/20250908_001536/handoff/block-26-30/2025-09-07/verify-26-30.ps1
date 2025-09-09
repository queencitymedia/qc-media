# verify-26-30.ps1 — Runtime & UX
$ErrorActionPreference = "Stop"
$web = Join-Path $HOME "qc-media\apps\web"
Set-Location $web

$need = @(
  "src/app/api/health/route.ts",
  "src/lib/ratelimit.ts",
  "src/lib/audit.ts",
  "src/app/not-found.tsx",
  "src/app/error.tsx"
)
$missing = @()
foreach($p in $need){ if(!(Test-Path -LiteralPath $p)){ $missing += $p } }
if($missing.Count){ throw "Missing: $($missing -join ', ')" }

Write-Host "[ok] 26–30 verified (files present)" -ForegroundColor Green