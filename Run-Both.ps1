# Run-Both.ps1 — starts API (port 8000) and Web (port 3000) in separate terminals
$root = Join-Path $HOME "qc-media"

# API window
$apiCmd = @"
cd `"$root\apps\api-core`"
if (-not (Test-Path .\.venv\Scripts\Activate)) { python -m venv .venv }
. .\.venv\Scripts\Activate
pip install -q -r requirements.txt
uvicorn main:app --reload --port 8000
"@
Start-Process powershell -ArgumentList "-NoExit","-Command",$apiCmd

# Web window
$webCmd = @"
cd `"$root\apps\web`"
pnpm dev
"@
Start-Process powershell -ArgumentList "-NoExit","-Command",$webCmd
