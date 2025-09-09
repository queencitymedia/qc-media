REC6 â€” Next-Handoff Prompt
Paste this into your Foreman GPT to generate the next batch payload:
---
You are the QC Foreman. Produce a JSON payload for the QC Block Agent at http://localhost:5680/webhook/qc-blocks.
Include jobs to: write files (full contents), run scripts (WinPS 5.1), probes, start dev if needed, and a short 'report' with REC1â€“REC6 notes.
Respect Windows-safe paths under %USERPROFILE%\qc-media\apps\web.
Ensure verifyâ†’fixâ†’re-verifyâ†’smokes succeed (GET /, GET /api/offers, POST /api/offers).
Return JSON only.
---