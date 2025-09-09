param(
  [int]$Port = 3000,
  [switch]$Probe
)

$ErrorActionPreference = "Stop"
$web = Join-Path $HOME "qc-media\apps\web"
if (!(Test-Path -LiteralPath $web)) { Write-Error "Project not found at $web"; exit 1 }
Set-Location $web

function Note($area, $ok, $msg) {
  $label = if ($ok) { "PASS" } else { "FAIL" }
  $color = if ($ok) { "Green" } else { "Red" }
  Write-Host ("[{0}] {1} - {2}" -f $label, $area, $msg) -ForegroundColor $color
}

# --- 16-20: Dev hygiene ---
$need16_20 = @(".editorconfig",".prettierrc.json",".prettierignore",".eslintrc.cjs",".gitattributes","package.json")
$missing = $need16_20 | Where-Object { -not (Test-Path $_) }
if ($missing) { Note "16-20 files" $false ("Missing: {0}" -f ($missing -join ", ")) } else { Note "16-20 files" $true "All present" }

try {
  $pkg = Get-Content -Raw package.json | ConvertFrom-Json
  $must = @("dev","build","start","clean","format","format:check","lint","typecheck")
  $miss = $must | Where-Object { -not $pkg.scripts.$_ }
  if ($miss) { Note "19 scripts" $false ("Missing npm scripts: {0}" -f ($miss -join ", ")) } else { Note "19 scripts" $true "All scripts exist" }
} catch { Note "package.json" $false ("Invalid JSON: {0}" -f $_.Exception.Message) }

# --- 21-25: Public & SEO ---
$need21_25 = @("public/robots.txt","public/sitemap.xml","public/site.webmanifest","public/favicon.svg")
$missing = $need21_25 | Where-Object { -not (Test-Path $_) }
if ($missing) { Note "21-25 files" $false ("Missing: {0}" -f ($missing -join ", ")) } else { Note "21-25 files" $true "All present" }

try {
  $manifest = Get-Content -Raw "public/site.webmanifest" | ConvertFrom-Json
  foreach($k in @("name","short_name","start_url","display","icons")){
    if(-not $manifest.PSObject.Properties.Name.Contains($k)){ throw "Manifest missing key: $k" }
  }
  Note "23 manifest" $true "Manifest JSON valid with required keys"
} catch { Note "23 manifest" $false ("Invalid manifest: {0}" -f $_.Exception.Message) }

# --- 26-30: Runtime & UX (+ duplicate special files check) ---
$need26_30 = @("src/app/api/health/route.ts","src/lib/ratelimit.ts","src/lib/audit.ts","src/app/not-found.tsx","src/app/error.tsx")
$missing = $need26_30 | Where-Object { -not (Test-Path $_) }
if ($missing) { Note "26-30 files" $false ("Missing: {0}" -f ($missing -join ", ")) } else { Note "26-30 files" $true "All present" }

# Duplicates: .js AND .tsx side-by-side will break Next dev
$dupeList = @()
@("error","not-found","loading","page","layout") | ForEach-Object {
  $js = "src/app/$_.js"; $tsx = "src/app/$_.tsx"
  if ((Test-Path $js) -and (Test-Path $tsx)) { $dupeList += ("{0} & {1}" -f $js, $tsx) }
}
if ($dupeList.Count) { Note "Special file duplicates" $false ($dupeList -join "; ") } else { Note "Special file duplicates" $true "None detected" }

# --- Optional: Live probe on running dev server ---
if ($Probe) {
  $base = "http://localhost:$Port"
  Write-Host "`n[probe] Checking $base ..." -ForegroundColor Cyan

  function TryReq([string]$url){
    try {
      $r = Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 6
      return @{ ok=$true; status=$r.StatusCode; headers=$r.Headers; body=$r.Content }
    } catch {
      $code = $_.Exception.Response.StatusCode.Value__ 2>$null
      $body = $null
      try { $sr = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream()); $body = $sr.ReadToEnd() } catch {}
      return @{ ok=$false; status=$code; headers=$null; body=$body }
    }
  }

  $root = TryReq "$base/"
  if ($root.ok) { Note "GET /" $true ("status={0}" -f $root.status) } else { Note "GET /" $false ("status={0}" -f $root.status) ; if($root.body){ "`n--- / error ---`n" + $root.body.Substring(0,[Math]::Min(600,$root.body.Length)) | Write-Host } }

  $health = TryReq "$base/api/health"
  if ($health.ok -and $health.body -match '"ok"\s*:\s*true') { Note "GET /api/health" $true ("status={0}; ok=true" -f $health.status) }
  elseif ($health.ok) { Note "GET /api/health" $false ("status={0}; unexpected body" -f $health.status); "`n--- /api/health body ---`n$($health.body)" | Write-Host }
  else { Note "GET /api/health" $false ("status={0}" -f $health.status); if($health.body){ "`n--- /api/health error ---`n" + $health.body.Substring(0,[Math]::Min(600,$health.body.Length)) | Write-Host } }

  if ($root.ok -and $root.headers) {
    $hasCSP  = $root.headers["Content-Security-Policy"] -ne $null
    $hasXCTO = $root.headers["X-Content-Type-Options"] -ne $null
    Note "Middleware headers" ($hasCSP -and $hasXCTO) ("CSP=" + $hasCSP + ", X-Content-Type-Options=" + $hasXCTO)
  }
}

Write-Host "`n=== Blocks 16-30 System Check Complete ===" -ForegroundColor Cyan