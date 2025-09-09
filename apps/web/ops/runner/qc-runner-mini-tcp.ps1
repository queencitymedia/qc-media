param(
  [string] \127.0.0.1 = "127.0.0.1",
  [int]    \     = 5680,
  [string] \     = "C:\Users\chase\qc-media\apps\web",
  [string] \      = "C:\Users\chase\qc-media\apps\web\ops\smoke\mini-tcp.log"
)
\Stop = "Stop"
function Log(\){ "\2025-09-08T00:15:40.9825291-04:00 	 \" | Out-File -FilePath \ -Encoding utf8 -Append }
function Ensure-Dir(\){ if(-not(Test-Path -LiteralPath \)){ New-Item -ItemType Directory -Force -Path \ | Out-Null } }

function Op-WriteFiles(\){
  foreach(\ in \){
    \ = Join-Path \ ([string]\.path)
    Ensure-Dir (Split-Path -Parent \)
    [IO.File]::WriteAllText(\, [string]\.content, [Text.UTF8Encoding]::new(\False))
  }
  @{ ok = \True; wrote = (\ | ForEach-Object { \.path }) }
}
function Op-RunScript([string]\){
  Push-Location \
  try {
    \ = powershell -NoProfile -ExecutionPolicy Bypass -Command \ 2>&1 | Out-String
    @{ ok = \True; output = \.Trim() }
  } finally { Pop-Location }
}
function Op-Probe(\){
  \=@()
  foreach(\ in \){
    try { \ = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -Uri \; \ += @{ url=\; status=\.StatusCode } }
    catch { \ += @{ url=\; status=0; error=\.Exception.Message } }
  }
  @{ ok = \True; results = \ }
}

# --- Tiny HTTP helpers ---
function Read-Request([IO.Stream]\){
  \ = New-Object IO.StreamReader(\, [Text.Encoding]::ASCII, \True, 1024, \True)
  \ = \.ReadLine(); if(-not \){ return \ }
  \ = \
  \ = @{}
  while(\True){
    \ = \.ReadLine()
    if(\ -eq \ -or \ -eq ""){ break }
    \ = \.Split(":",2)
    if(\.Count -eq 2){ \[\[0].Trim()] = \[1].Trim() }
  }
  \ = \.Split(" ")[0]
  \   = \.Split(" ")[1]
  \   = ""
  if (\.ContainsKey("Content-Length")){
    \ = [int]\["Content-Length"]
    if (\ -gt 0){
      \ = New-Object byte[] \
      \ = 0
      while(\ -lt \){
        \ = \.Read(\, \, (\-\))
        if (\ -le 0){ break }
        \ += \
      }
      \ = [Text.Encoding]::UTF8.GetString(\,0,\)
    }
  }
  return @{ method=\; path=\; headers=\; body=\ }
}

function Write-Json([IO.Stream]\,[int]\,\){
  \ = (\ | ConvertTo-Json -Depth 50)
  \ = [Text.Encoding]::UTF8.GetBytes(\)
  \ = ("HTTP/1.1 {0} OK
Content-Type: application/json
Content-Length: {1}
Connection: close

" -f \, \.Length)
  \ = [Text.Encoding]::ASCII.GetBytes(\)
  \.Write(\,0,\.Length); \.Write(\,0,\.Length); \.Flush()
}

# --- Start listener ---
Add-Type -AssemblyName System.Net
\ = [System.Net.IPAddress]::Parse(\127.0.0.1)
\ = [System.Net.Sockets.TcpListener]::new(\, \)
\.Start()
Log ("Listening " + ("tcp://{0}:{1}" -f \127.0.0.1, \))

# --- Loop ---
while(\True){
  \ = \.AcceptTcpClient()
  try {
    \ = \.GetStream()
    \ = Read-Request \
    if(-not \){ \.Close(); continue }
    if(\.method -eq "GET" -and \.path -like "/health*"){
      Write-Json \ 200 @{ ok=\True; runner="mini-tcp-v3.2" }
      \.Close(); continue
    }
    if(\.method -eq "POST" -and \.path -like "/run*"){
      \ = \
      try {
        \ = \.body | ConvertFrom-Json -Depth 100
        if (\ -and \.jobs) { \ = \.jobs } else { \ = \ }
      } catch { Write-Json \ 400 @{ ok=\False; error="bad json" }; \.Close(); continue }
      if (-not \) { Write-Json \ 400 @{ ok=\False; error="no jobs" }; \.Close(); continue }

      \ = New-Object System.Collections.ArrayList
      foreach(\ in \){
        try {
          \ = [string]\.kind
          if (\ -eq "write_files"){ [void]\.Add((Op-WriteFiles \.files)) }
          elseif (\ -eq "run_script"){ [void]\.Add((Op-RunScript \.script)) }
          elseif (\ -eq "probe"){ [void]\.Add((Op-Probe \.urls)) }
          else { [void]\.Add(@{ ok=\False; error=("unknown kind: " + \) }) }
        } catch {
          [void]\.Add(@{ ok=\False; error=("job exception: " + \.Exception.Message) })
        }
      }
      Write-Json \ 200 @{ ok=\True; results=\ }
      \.Close(); continue
    }

    Write-Json \ 404 @{ ok=\False; error="not found" }
    \.Close()
  } catch {
    try { Write-Json \ 500 @{ ok=\False; error="runner exception" } } catch {}
    Log ("ERR " + \.Exception.Message)
    try { \.Close() } catch {}
  }
}