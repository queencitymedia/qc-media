param(
  [int] \ = 5680,
  [string] \C:\Users\chase\qc-media\apps\web = "C:\Users\chase\qc-media\apps\web",
  [string] \ = "C:\Users\chase\qc-media\apps\web\ops\smoke\qc-runner.log"
)
\Stop = "Stop"

function Log([string]\){ "\2025-09-07T23:56:25.2482586-04:00 \" | Out-File -FilePath \ -Encoding utf8 -Append }

function Ensure-Dir([string]\){ if(-not(Test-Path -LiteralPath \)){ New-Item -ItemType Directory -Force -Path \ | Out-Null } }

function Do-WriteFiles(\){
  foreach(\ in \){
    \ = Join-Path \C:\Users\chase\qc-media\apps\web \.path
    Ensure-Dir (Split-Path -Parent \)
    [IO.File]::WriteAllText(\, [string]\.content, [Text.UTF8Encoding]::new(\False))
  }
  return @{ ok = \True; wrote = (\ | ForEach-Object { \.path }) }
}

function Do-RunScript([string]\){
  Push-Location \C:\Users\chase\qc-media\apps\web
  try {
    \ = powershell -NoProfile -ExecutionPolicy Bypass -Command \ 2>&1 | Out-String
    return @{ ok=\True; output=\.Trim() }
  } finally { Pop-Location }
}

function Do-Probe([string[]]\){
  \ = @()
  foreach(\ in \){
    try { \ = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -Uri \; \ += @{ url=\; status=\.StatusCode } }
    catch { \ += @{ url=\; status=0; error=\.Exception.Message } }
  }
  return @{ ok=\True; results=\ }
}

function Test-RunnerPort([int]\){
  try { \ = Invoke-RestMethod -UseBasicParsing -TimeoutSec 3 -Uri ("http://localhost:{0}/health" -f \); return (\.ok -eq \True) } catch { return \False }
}

function Do-SmokeNext([int]\3000){
  \ = "http://localhost:{0}" -f \3000
  \ = @{ root=0; list=0; post=0; text="" }
  try { \ = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -Uri (\ + "/"); \.root = \.StatusCode } catch { \.root = 0 }
  try { \ = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -Uri (\ + "/api/offers"); \.list = \.StatusCode } catch { \.list = 0 }
  try {
    \ = @{ title="Untitled"; status="draft" } | ConvertTo-Json
    \ = Invoke-WebRequest -UseBasicParsing -Method POST -ContentType "application/json" -TimeoutSec 10 -Uri (\ + "/api/offers") -Body \
    \.post = \.StatusCode; \.text = \.Content
  } catch { \.post = 0; \.text = \.Exception.Message }
  return @{ ok = \True; smoke = \ }
}

function Do-StartDev([int]\3000){
  # If already healthy, bail.
  try { \ = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 -Uri ("http://localhost:{0}/api/health" -f \3000); if(\.StatusCode -eq 200){ return @{ ok=\True; alreadyRunning=\True } } } catch {}
  \ = "cd "\C:\Users\chase\qc-media\apps\web"; if(Test-Path package.json){ \=''; npm run dev } else { Write-Host 'package.json missing' }"
  \ = Start-Process powershell -ArgumentList @("-NoLogo","-NoExit","-ExecutionPolicy","Bypass","-Command",\) -PassThru
  return @{ ok=\True; startedPid=\.Id }
}

function Do-Report([string]\){
  \ = Join-Path \C:\Users\chase\qc-media\apps\web 'ops\smoke'
  Ensure-Dir \
  \ = Join-Path \ ('report-{0:yyyyMMdd_HHmmss}.json' -f (Get-Date))
  \ = @{ at=(Get-Date); title=\; runnerPort=5680 }
  (\ | ConvertTo-Json -Depth 20) | Out-File -FilePath \ -Encoding utf8
  return @{ ok=\True; report=\ }
}

# Listener
Add-Type -AssemblyName System.Net.HttpListener
\ = [System.Net.HttpListener]::new()
\.Prefixes.Add("http://+:5680/")
try {
  \.Start(); Log "Listening on http://+:5680/"
} catch {
  Log "Listener failed: \"
  throw
}

while(\True){
  \ = \.GetContext()
  \ = \.Request; \ = \.Response
  try {
    if (\.HttpMethod -eq "GET" -and \.RawUrl -like "/health*"){
      \ = [Text.Encoding]::UTF8.GetBytes('{ "ok": true, "runner": "qc-runner v2" }')
      \.ContentType = "application/json"; \.OutputStream.Write(\,0,\.Length); \.StatusCode = 200; \.Close(); continue
    }
    if (\.HttpMethod -ne "POST" -or \.RawUrl -notlike "/webhook/qc-run*"){
      \.StatusCode = 404; \.Close(); continue
    }
    \ = New-Object IO.StreamReader(\.InputStream, \.ContentEncoding)
    \ = \.ReadToEnd()
    \ = \
    try { \ = \ | ConvertFrom-Json -Depth 100 } catch { \.StatusCode=400; \=[Text.Encoding]::UTF8.GetBytes('{ "ok": false, "error": "bad json" }'); \.OutputStream.Write(\,0,\.Length); \.Close(); continue }
    \ = [System.Collections.ArrayList]::new()
    \ = \.mode
    if (-not \ -and \.jobs){ \ = "jobs" }

    if (\ -eq "write_files"){
      \.Add((Do-WriteFiles \.files)) | Out-Null
    }
    elseif (\ -eq "run_script"){
      \.Add((Do-RunScript \.script)) | Out-Null
    }
    elseif (\ -eq "probe"){
      \.Add((Do-Probe \.urls)) | Out-Null
    }
    elseif (\ -eq "smoke_next"){
      \.Add((Do-SmokeNext \.devPort)) | Out-Null
    }
    elseif (\ -eq "start_dev"){
      \.Add((Do-StartDev \.devPort)) | Out-Null
    }
    elseif (\ -eq "report"){
      \.Add((Do-Report (\.title ?? "Run report"))) | Out-Null
    }
    elseif (\ -eq "jobs"){
      \ = 0
      foreach(\ in \.jobs){
        \++
        \ = \.kind
        if (\ -eq "write_files"){ \.Add((Do-WriteFiles \.files)) | Out-Null }
        elseif (\ -eq "run_script"){ \.Add((Do-RunScript \.script)) | Out-Null }
        elseif (\ -eq "probe"){ \.Add((Do-Probe \.urls)) | Out-Null }
        elseif (\ -eq "smoke_next"){ \.Add((Do-SmokeNext \.devPort)) | Out-Null }
        elseif (\ -eq "start_dev"){ \.Add((Do-StartDev \.devPort)) | Out-Null }
        elseif (\ -eq "report"){ \.Add((Do-Report (\.title ?? "Report #\"))) | Out-Null }
        else { \.Add(@{ ok=\False; error="unknown kind: \" }) | Out-Null }
      }
    } else {
      \.Add(@{ ok=\False; error="unknown mode: \" }) | Out-Null
    }

    \ = @{ ok=\True; results=\ } | ConvertTo-Json -Depth 50
    \ = [Text.Encoding]::UTF8.GetBytes(\)
    \.ContentType = "application/json"
    \.OutputStream.Write(\,0,\.Length)
    \.StatusCode = 200
    \.Close()
  } catch {
    try {
      \ = '{ "ok": false, "error": ' + ([System.Text.Json.JsonSerializer]::Serialize(\.Exception.Message)) + ' }'
    } catch { \ = '{ "ok": false, "error": "runner exception" }' }
    \ = [Text.Encoding]::UTF8.GetBytes(\)
    \.ContentType = "application/json"
    \.OutputStream.Write(\,0,\.Length)
    \.StatusCode = 500
    \.Close()
    Log ("Handler exception: " + \.Exception.Message)
  }
}