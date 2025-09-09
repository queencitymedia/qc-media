# verify-16-20.ps1 — Dev Hygiene
$ErrorActionPreference = "Stop"
$web = Join-Path $HOME "qc-media\apps\web"
Set-Location $web

$need = @(".editorconfig",".prettierrc.json",".prettierignore",".eslintrc.cjs",".gitattributes","package.json")
$missing = @()
foreach($p in $need){ if(!(Test-Path -LiteralPath $p)){ $missing += $p } }
if($missing.Count){ throw "Missing: $($missing -join ', ')" }

$pkg = Get-Content -Raw package.json | ConvertFrom-Json
$must = @("dev","build","start","clean","format","format:check","lint","typecheck")
$miss = @()
foreach($k in $must){ if(-not $pkg.scripts.$k){ $miss += $k } }
if($miss.Count){ throw "Missing npm scripts: $($miss -join ', ')" }

Write-Host "[ok] 16–20 verified" -ForegroundColor Green