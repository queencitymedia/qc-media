# verify-21-25.ps1 — Public & SEO
$ErrorActionPreference = "Stop"
$web = Join-Path $HOME "qc-media\apps\web"
Set-Location $web

$need = @("public/robots.txt","public/sitemap.xml","public/site.webmanifest","public/favicon.svg")
$missing = @()
foreach($p in $need){ if(!(Test-Path -LiteralPath $p)){ $missing += $p } }
if($missing.Count){ throw "Missing: $($missing -join ', ')" }

try {
  $manifest = Get-Content -Raw "public/site.webmanifest" | ConvertFrom-Json
  foreach($k in @("name","short_name","start_url","display","icons")){
    if(-not $manifest.PSObject.Properties.Name.Contains($k)){ throw "Manifest missing key: $k" }
  }
} catch { throw "site.webmanifest invalid JSON or missing keys: $($_.Exception.Message)" }

Write-Host "[ok] 21–25 verified" -ForegroundColor Green