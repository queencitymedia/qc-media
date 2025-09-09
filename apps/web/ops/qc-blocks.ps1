param(
  [int]$Start = 30,
  [int]$End   = 50,
  [int]$DevPort = 3001
)
$ErrorActionPreference = "Stop"

# Paths
$BaseFolder = Join-Path $env:USERPROFILE 'qc-media\apps\web'
$SmokeDir   = Join-Path $BaseFolder 'ops\smoke'
$ReportDir  = Join-Path $BaseFolder 'ops\reports'
$JobName    = "qc-dev-$DevPort"

# Helpers
function Ensure-Dir($p){ if(-not (Test-Path -LiteralPath $p)){ New-Item -ItemType Directory -Force -Path $p | Out-Null } }
function Test-Port([int]$port){
  try{ $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 -Uri ("http://localhost:{0}/" -f $port); return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) }catch{ return $false }
}
function Get-Err([object]$err){ try{ if($err.Exception.Response.StatusCode){ return [string]([int]$err.Exception.Response.StatusCode) } }catch{}; "ERR" }
function Log-Status($list,[string]$label,[string]$code){ $list.Add(("{0} {1} {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $label.PadRight(22), $code)) | Out-Null }

# File search helpers (WinPS 5.1)
function Get-CodeFiles($root, $sub=""){
  $path = if($sub){ Join-Path $root $sub } else { $root }
  Get-ChildItem -Path $path -Include *.ts,*.tsx -Recurse -File -ErrorAction SilentlyContinue
}
function Find-Regex($files, $pattern){
  if($null -eq $files){ @() } else { $files | Select-String -Pattern $pattern -ErrorAction SilentlyContinue }
}
function Find-Simple($files, $text){
  if($null -eq $files){ @() } else { $files | Select-String -SimpleMatch $text -ErrorAction SilentlyContinue }
}

Ensure-Dir $SmokeDir
Ensure-Dir $ReportDir

Write-Host ("# QC Blocks Orchestrator - {0}..{1}" -f $Start, $End) -ForegroundColor Cyan

# Ensure dev is up
if(-not (Test-Port $DevPort)){
  Write-Host "Dev not responding on :$DevPort - starting..." -ForegroundColor Yellow
  Push-Location $BaseFolder
  try{
    $useNpmScript = $false
    $pkgPath = Join-Path $BaseFolder 'package.json'
    if(Test-Path -LiteralPath $pkgPath){
      try{ $pkg = Get-Content -LiteralPath $pkgPath -Raw | ConvertFrom-Json }catch{}
      if($pkg -and $pkg.scripts -and $pkg.scripts.dev){ $useNpmScript = $true }
    }
    Get-Job -Name $JobName -ErrorAction SilentlyContinue | Remove-Job -Force -ErrorAction SilentlyContinue | Out-Null
    $sb = {
      param($BaseFolder,$DevPort,$useNpmScript)
      Set-Location $BaseFolder
      $env:PORT = "$DevPort"
      if($useNpmScript){ npm run dev 2>&1 } else { npx --yes next dev -p $DevPort 2>&1 }
    }
    Start-Job -Name $JobName -ScriptBlock $sb -ArgumentList @($BaseFolder,$DevPort,$useNpmScript) | Out-Null
    $deadline=(Get-Date).AddMinutes(5); $last=0
    while((Get-Date) -lt $deadline){
      if(Test-Port $DevPort){ break }
      $out = Receive-Job -Name $JobName -Keep -ErrorAction SilentlyContinue
      if($out){
        $slice=$out[$last..($out.Count-1)] 2>$null
        if($slice){ $slice | Select-String -Pattern 'ready|compiled|error|started|port' | % { "dev: " + $_ } }
        $last=$out.Count
      }
      Start-Sleep -Milliseconds 1600
    }
    if(-not (Test-Port $DevPort)){ throw "Dev not reachable on :$DevPort" }
  } finally { Pop-Location }
}

# Sprint chunks (5 blocks each)
for($blk=$Start; $blk -le $End; $blk+=5){
  $blkEnd = [Math]::Min($blk+4, $End)
  $stamp  = Get-Date -Format "yyyyMMdd-HHmmss"
  $log    = New-Object System.Collections.Generic.List[string]
  $recap  = @()

  Write-Host ""
  Write-Host ("=== Sprint {0}-{1} ===" -f $blk, $blkEnd) -ForegroundColor Cyan
  $log.Add(("# QC Sprint {0}-{1} - {2}" -f $blk, $blkEnd, (Get-Date -Format o))) | Out-Null

  # 1) VERIFY
  $allCode   = Get-CodeFiles $BaseFolder 'src'
  $routeCode = Get-CodeFiles $BaseFolder 'src\app\api'

  $ServerRelativeAPIFetch = Find-Regex $allCode "fetch\(['""]\/api\/"
  if($ServerRelativeAPIFetch){ $ServerRelativeAPIFetch = $ServerRelativeAPIFetch | Where-Object { $_.Path -notmatch 'src\\app\\api\\' } }

  $HeadersCalls = Find-Regex $allCode "headers\("
  $HeadersNotAwaited = @()
  if($HeadersCalls){
    $HeadersNotAwaited = $HeadersCalls | Where-Object { $_.Line -notmatch 'await\s+headers\(' }
  }

  $BadAtAliasInRoutes = Find-Simple $routeCode '"@/'

  $Finds = @{
    "ServerRelativeAPIFetch" = $ServerRelativeAPIFetch
    "HeadersNotAwaited"      = $HeadersNotAwaited
    "BadAtAliasInRoutes"     = $BadAtAliasInRoutes
  }

  $issues = 0
  foreach($k in $Finds.Keys){
    $count = @($Finds[$k]).Count
    $log.Add(("VERIFY {0}: {1}" -f $k, $count)) | Out-Null
    if($count -gt 0){ $issues += $count }
  }

  # 2) AUTOFIX
  if($Finds.HeadersNotAwaited){
    foreach($hit in $Finds.HeadersNotAwaited){
      $p = $hit.Path
      $raw = Get-Content -LiteralPath $p -Raw
      $patched = $raw -replace '([^a-zA-Z0-9_]|^)(headers\(\))', '$1await headers()'
      if($patched -ne $raw){
        [System.IO.File]::WriteAllText($p, $patched, [System.Text.UTF8Encoding]::new($false))
        $log.Add("FIX   await headers(): $p") | Out-Null
      }
    }
  }

  if($Finds.ServerRelativeAPIFetch){
    foreach($hit in $Finds.ServerRelativeAPIFetch){
      $p = $hit.Path
      $raw = Get-Content -LiteralPath $p -Raw

      # Ensure import { getBaseUrl } ...; if missing, prepend it.
      if($raw -notmatch 'import\s*\{\s*getBaseUrl\s*\}\s*from\s*"\.\.\/lib\/base-url"'){
        $raw = "import { getBaseUrl } from ""../lib/base-url"";`r`n" + $raw
      }

      # Ensure const base = await getBaseUrl(); after the import line
      if($raw -notmatch 'const\s+base\s*=\s*await\s+getBaseUrl\(\)'){
        if($raw -match '(^.*getBaseUrl.*\r?\n)'){
          $raw = $raw -replace '(^.*getBaseUrl.*\r?\n)', ('$1' + "const base = await getBaseUrl();`r`n")
        } else {
          # Fallback: insert at top (less ideal but functional)
          $raw = "const base = await getBaseUrl();`r`n" + $raw
        }
      }

      # Replace fetch('/api/...') with fetch(`${base}/api/...`)
      $patternFetch = '(fetch\s*\(\s*)[''"]/api/'
      $replacementFetch = '$1`${base}/api/'
      $patched = $raw -replace $patternFetch, $replacementFetch

      if($patched -ne $raw){
        [System.IO.File]::WriteAllText($p, $patched, [System.Text.UTF8Encoding]::new($false))
        $log.Add("FIX   absolute /api fetch via base: $p") | Out-Null
      }
    }
  }

  if($Finds.BadAtAliasInRoutes){
    foreach($hit in $Finds.BadAtAliasInRoutes){
      $p = $hit.Path
      $raw = Get-Content -LiteralPath $p -Raw
      $patternAt = '"@/([^"]+)"'
      $replacementAt = '"../../$1"'
      $patched = $raw -replace $patternAt, $replacementAt
      if($patched -ne $raw){
        [System.IO.File]::WriteAllText($p, $patched, [System.Text.UTF8Encoding]::new($false))
        $log.Add("FIX   '@/'' import -> relative: $p") | Out-Null
      }
    }
  }

  # 3) RE-VERIFY
  $allCode2   = Get-CodeFiles $BaseFolder 'src'
  $routeCode2 = Get-CodeFiles $BaseFolder 'src\app\api'
  $ServerRelativeAPIFetch2 = Find-Regex $allCode2 "fetch\(['""]\/api\/"
  if($ServerRelativeAPIFetch2){ $ServerRelativeAPIFetch2 = $ServerRelativeAPIFetch2 | Where-Object { $_.Path -notmatch 'src\\app\\api\\' } }
  $HeadersCalls2 = Find-Regex $allCode2 "headers\("
  $HeadersNotAwaited2 = if($HeadersCalls2){ $HeadersCalls2 | Where-Object { $_.Line -notmatch 'await\s+headers\(' } } else { @() }
  $BadAtAliasInRoutes2 = Find-Simple $routeCode2 '"@/'

  $Finds2 = @{
    "ServerRelativeAPIFetch" = $ServerRelativeAPIFetch2
    "HeadersNotAwaited"      = $HeadersNotAwaited2
    "BadAtAliasInRoutes"     = $BadAtAliasInRoutes2
  }
  foreach($k in $Finds2.Keys){ $log.Add(("REVERIFY {0}: {1}" -f $k, (@($Finds2[$k]).Count))) | Out-Null }

  # 4) SMOKES
  $base = "http://localhost:{0}" -f $DevPort
  $statuses = New-Object System.Collections.Generic.List[string]
  try{ $r0 = Invoke-WebRequest -UseBasicParsing ($base + "/"); Log-Status $statuses "GET /" ([string]$r0.StatusCode) }catch{ Log-Status $statuses "GET /" (Get-Err $_) }
  try{ $r1 = Invoke-WebRequest -UseBasicParsing ($base + "/api/offers"); Log-Status $statuses "GET /api/offers" ([string]$r1.StatusCode) }catch{ Log-Status $statuses "GET /api/offers" (Get-Err $_) }
  $id=$null
  $b = (@{ title=("Blocks " + $blk + "-" + $blkEnd); description=("at " + (Get-Date -Format o)) } | ConvertTo-Json -Depth 5)
  try{
    $p = Invoke-WebRequest -UseBasicParsing -Method Post -ContentType "application/json" -Body $b -Uri ($base + "/api/offers")
    Log-Status $statuses "POST /api/offers" ([string]$p.StatusCode)
    try{ $id = ($p.Content | ConvertFrom-Json).id }catch{}
  }catch{ Log-Status $statuses "POST /api/offers" (Get-Err $_) }
  if($id){
    try{ $g = Invoke-WebRequest -UseBasicParsing ($base + "/api/offers/$id"); Log-Status $statuses "GET /api/offers/{id}" ([string]$g.StatusCode) }catch{ Log-Status $statuses "GET /api/offers/{id}" (Get-Err $_) }
    $body = (@{ title=("Blocks " + $blk + "-" + $blkEnd + " (upd)"); description="upd" } | ConvertTo-Json -Depth 5)
    try{ $u = Invoke-WebRequest -UseBasicParsing -Method Put -ContentType "application/json" -Body $body -Uri ($base + "/api/offers/$id"); Log-Status $statuses "PUT /api/offers/{id}" ([string]$u.StatusCode) }catch{ Log-Status $statuses "PUT /api/offers/{id}" (Get-Err $_) }
    try{ $d = Invoke-WebRequest -UseBasicParsing -Method Delete -Uri ($base + "/api/offers/$id"); Log-Status $statuses "DELETE /api/offers/{id}" ([string]$d.StatusCode) }catch{ Log-Status $statuses "DELETE /api/offers/{id}" (Get-Err $_) }
    try{ $x = Invoke-WebRequest -UseBasicParsing ($base + "/api/offers/$id"); Log-Status $statuses "GET {id} after delete" ([string]$x.StatusCode) }catch{ Log-Status $statuses "GET {id} after delete" (Get-Err $_) }
  }

  # 5) RECAPPACK
  $recFile = Join-Path $ReportDir ("qc-sprint-{0:D2}-{1:D2}.md" -f $blk, $blkEnd)
  $rec = @()
  $rec += ("# Recap Pack - Blocks {0}-{1}" -f $blk, $blkEnd)
  $rec += "## REC1: Executive Summary"
  $rec += "- Verification and auto-fix completed"
  $rec += "- Dev up on :$DevPort; smokes executed"
  $rec += "## REC2: Changes"
  $rec += "- Auto-fixes applied where needed (await headers, absolute /api fetch, '@/')"
  $rec += "## REC3: Verification"
  $rec += "````"
  $rec += ($log -join "`r`n")
  $rec += ""
  $rec += ($statuses -join "`r`n")
  $rec += "````"
  $rec += "## REC4: Risks / Rollback"
  $rec += "- If any fix misapplied, restore from VCS or revert the specific file."
  $rec += "## REC5: UI Look-Fors"
  $rec += "- Home renders offers; CRUD works end-to-end."
  $rec += "## REC6: Next-Handoff Prompt"
  $rec += "> QC Foreman: proceed to next 5-block sprint; repeat verify -> auto-fix -> re-verify -> smokes."
  [System.IO.File]::WriteAllLines($recFile, $rec, [System.Text.UTF8Encoding]::new($false))

  # Tiny per-sprint status log
  $tiny = Join-Path $SmokeDir ("qc-sprint-{0:D2}-{1:D2}.log" -f $blk, $blkEnd)
  $statuses.Insert(0, ("# Sprint {0}-{1} - {2}" -f $blk, $blkEnd, (Get-Date -Format o)))
  $statuses | Out-File -FilePath $tiny -Encoding utf8

  Write-Host ("Sprint {0}-{1} complete. Recap: {2}" -f $blk, $blkEnd, $recFile) -ForegroundColor Green
}
Write-Host "`nDone."