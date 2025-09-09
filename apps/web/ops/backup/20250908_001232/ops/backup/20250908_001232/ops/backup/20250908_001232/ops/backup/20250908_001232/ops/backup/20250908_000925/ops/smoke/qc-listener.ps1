param([int]\5680 = 5680, [string]\C:\Users\chase\qc-media\apps\web = "C:\Users\chase\qc-media\apps\web", [string]\C:\Users\chase\qc-media\apps\web\ops\smoke\qc-runner.log = "C:\Users\chase\qc-media\apps\web\ops\smoke\qc-runner.log")
\Stop = "Stop"

# Helpers
\ = New-Object System.Text.UTF8Encoding(\False)
function Log(\){ try { [IO.Directory]::CreateDirectory((Split-Path -Parent \C:\Users\chase\qc-media\apps\web\ops\smoke\qc-runner.log))|Out-Null; [IO.File]::AppendAllText(\C:\Users\chase\qc-media\apps\web\ops\smoke\qc-runner.log, "[\2025-09-07T15:53:44] \
", \) } catch {} }

function Get-Prop(\, \) {
  if (\ -eq \) { return \ }
  # Hashtable / IDictionary
  if (\ -is [System.Collections.IDictionary]) {
    if (\.Contains(\)) { return \[\] } else { return \ }
  }
  # PSCustomObject
  try { \ = \.PSObject.Properties.Match(\, \True); if (\.Count -gt 0) { return \[0].Value } } catch {}
  return \
}
function To-Array(\){
  if (\ -eq \) { return @() }
  if (\ -is [string]) { return ,\ }
  if (\ -is [System.Collections.IEnumerable]) { return @(\) }
  return ,\
}
function Json-Parse(\) {
  if ([string]::IsNullOrWhiteSpace(\)) { return \ }
  try { return \ | ConvertFrom-Json -Depth 100 } catch {
    try {
      Add-Type -AssemblyName System.Web.Extensions -ErrorAction SilentlyContinue
      \ = New-Object System.Web.Script.Serialization.JavaScriptSerializer
      return \.DeserializeObject(\)
    } catch { return \ }
  }
}
function Write-FileUtf8(\,\,\){
  if([string]::IsNullOrWhiteSpace(\)){ throw "Empty path" }
  \=[IO.Path]::GetFullPath((Join-Path \ \)); \=[IO.Path]::GetFullPath(\)
  if(-not \.StartsWith(\,[StringComparison]::OrdinalIgnoreCase)){ throw "Path escapes sandbox: \" }
  [IO.Directory]::CreateDirectory((Split-Path -Parent \))|Out-Null
  [IO.File]::WriteAllText(\,[string]\,\); return \
}
function Run-PS(\,\){
  \=[Diagnostics.ProcessStartInfo]::new()
  \.FileName="\C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe"
  \.Arguments="-NoProfile -ExecutionPolicy Bypass -Command ""\"""
  \.RedirectStandardOutput=\True; \.RedirectStandardError=\True
  \.UseShellExecute=\False; \.WorkingDirectory=\
  \=[Diagnostics.Process]::new(); \.StartInfo=\; [void]\.Start()
  \=\.StandardOutput.ReadToEnd(); \=\.StandardError.ReadToEnd(); \.WaitForExit()
  return [pscustomobject]@{ ok=(\.ExitCode -eq 0); code=\.ExitCode; stdout=\; stderr=\ }
}

# URLACLs (safe if already exist)
try { Start-Process powershell -Verb RunAs -Wait -ArgumentList ("netsh http add urlacl url=http://+:{0}/ user={1}" -f \5680,\chase) | Out-Null } catch {}
try { Start-Process powershell -Verb RunAs -Wait -ArgumentList ("netsh http add urlacl url=http://localhost:{0}/ user={1}" -f \5680,\chase) | Out-Null } catch {}

# Listener
\=[System.Net.HttpListener]::new()
\="http://+:{0}/" -f \5680
\.Prefixes.Add(\)
try { \.Start() } catch { throw ("Cannot bind {0}: {1}" -f \, \.Exception.Message) }
Log "runner STARTED on \; base=\C:\Users\chase\qc-media\apps\web"

Write-Host ("[RUNNING] QC listener on http://localhost:{0}/  (bound {1})" -f \5680, \) -ForegroundColor Green
Write-Host "Press Ctrl+C in this window to stop."

while(\.IsListening){
  \=\.GetContext()
  try {
    \ = \.Request.Url.AbsolutePath.ToLowerInvariant()
    if(\.Request.HttpMethod -eq "GET" -and \ -eq "/health"){
      \=[Text.Encoding]::UTF8.GetBytes('{""ok"":true}')
      \.Response.StatusCode=200; \.Response.ContentType="application/json"
      \.Response.OutputStream.Write(\,0,\.Length); \.Response.Close(); continue
    }
    if(\.Request.HttpMethod -ne "POST" -or \ -ne "/webhook/qc-run"){
      \=[Text.Encoding]::UTF8.GetBytes('{""ok"":false,""message"":""not found""}')
      \.Response.StatusCode=404; \.Response.ContentType="application/json"
      \.Response.OutputStream.Write(\,0,\.Length); \.Response.Close(); continue
    }

    # Read raw body as UTF-8 bytes (do NOT rely on Request.ContentEncoding)
    \=New-Object IO.MemoryStream
    \.Request.InputStream.CopyTo(\); \=\.ToArray(); \=[Text.Encoding]::UTF8.GetString(\)
    Log ("incoming len={0} ct='{1}'" -f \.Length, \.Request.ContentType)
    \ = Json-Parse \

    # mode from body or header
    \ = Get-Prop \ "mode"
    if([string]::IsNullOrWhiteSpace([string]\)){ \ = \.Request.Headers['x-qc-mode'] }
    if([string]::IsNullOrWhiteSpace([string]\)){ throw "Missing 'mode'. Use: write_files, run_script, probe." }
    \ = [string]\
    Log ("resolved mode='{0}'" -f \)

    switch(\.ToLowerInvariant()){
      "write_files" {
        \ = To-Array (Get-Prop \ "files")
        if(\.Count -eq 0){ throw "files[] required" }
        \=@()
        foreach(\ in \){
          # handle hashtable or object
          \ = if(\ -is [System.Collections.IDictionary]) { \[""path""] } else { (Get-Prop \ "path") }
          \ = if(\ -is [System.Collections.IDictionary]) { \[""content""] } else { (Get-Prop \ "content") }
          if([string]::IsNullOrWhiteSpace([string]\) -or -not ([string]\ -is [string])){ throw "files[] needs {path, content}" }
          \ += (Write-FileUtf8 \C:\Users\chase\qc-media\apps\web ([string]\) ([string]\))
        }
        \ = @{ ok=\True; message="files written"; files=\ }
      }
      "run_script" {
        \ = Get-Prop \ "script"
        if([string]::IsNullOrWhiteSpace([string]\)){ throw "script required" }
        \ = Run-PS ([string]\) \C:\Users\chase\qc-media\apps\web
        \ = \ | Select-Object ok,code,stdout,stderr
      }
      "probe" {
        \ = To-Array (Get-Prop \ "urls") | ForEach-Object { if(\){ ""+\ } }
        if(\.Count -eq 0){ throw "urls[] required" }
        \=@()
        foreach(\ in \){
          \=0;\=0;\=\;\=[Diagnostics.Stopwatch]::StartNew()
          try{ \=Invoke-WebRequest -Uri \ -UseBasicParsing -TimeoutSec 8 -ErrorAction Stop; \=\.StatusCode }catch{ \=\.Exception.Message }
          finally{ \.Stop(); \=[int]\.ElapsedMilliseconds }
          \ += [pscustomobject]@{ url=\; status=\; ms=\; error=\ }
        }
        \=@{ ok=\True; checks=\ }
      }
      default { throw ("Unsupported mode '{0}'" -f \) }
    }

    \=(\|ConvertTo-Json -Depth 100); \=[Text.Encoding]::UTF8.GetBytes(\)
    \.Response.StatusCode=200; \.Response.ContentType="application/json"
    \.Response.OutputStream.Write(\,0,\.Length); \.Response.Close()
  } catch {
    \ = \.Exception.Message; Log ("ERROR: {0}" -f \)
    \ = (@{ ok=\False; message=\ }|ConvertTo-Json -Depth 10); \=[Text.Encoding]::UTF8.GetBytes(\)
    try{ \.Response.StatusCode=500; \.Response.ContentType="application/json"; \.Response.OutputStream.Write(\,0,\.Length); \.Response.Close() }catch{}
  }
}