REC4 Ã¢â‚¬â€ Risks / Rollback
- Risk: Dev server not running or port 3001 busy Ã¢â€ â€™ Ensure-DevServer starts it.
- Risk: File path changes Ã¢â€ â€™ This pack writes idempotently; rerun agent to restore.
- Rollback: Restore previous git state if under VCS; or back up ops\data\offers.json.