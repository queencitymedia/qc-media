REC4 â€” Risks / Rollback
- Risk: Dev server not running or port 3000 busy â†’ Ensure-DevServer starts it.
- Risk: File path changes â†’ This pack writes idempotently; rerun agent to restore.
- Rollback: Restore previous git state if under VCS; or back up ops\data\offers.json.