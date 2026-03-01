# Utilities Suite - Cron Configuration

All schedules use America/New_York (EST/EDT) timezone.

## Cron Job Dashboard

- **Script:** `cron-dashboard.js`
- **Schedule:** Always running (long-lived HTTP server)
- **Port:** 4200 (configurable via DASHBOARD_PORT env var)
- **Start command:** `node /Users/agentclaw/.openclaw/workspace/automation/utilities/cron-dashboard.js`
- **Notes:** Should be started as a background process or managed via pm2/systemd. Auto-refreshes the web UI every 60 seconds.

```
# Start on boot / restart if crashed (using pm2):
# pm2 start cron-dashboard.js --name clawops-dashboard
```

## Google Drive Backup

- **Script:** `gdrive-backup.js`
- **Schedule:** Daily at 2:00 AM EST
- **Cron expression:** `0 2 * * *`
- **Required env vars:**
  - `GOOGLE_SERVICE_ACCOUNT_KEY` - Path to service account JSON key
  - `GDRIVE_PARENT_FOLDER_ID` - Target Google Drive folder ID
- **Retention:** Keeps last 7 backups, auto-deletes older ones

```cron
# Google Drive Backup - Daily at 2 AM EST
0 2 * * * cd /Users/agentclaw/.openclaw/workspace/automation/utilities && node gdrive-backup.js >> logs/gdrive-backup.log 2>&1
```

## Memory Context System

- **Script:** `memory-system.js`
- **Schedule:** Every 2 hours
- **Cron expression:** `0 */2 * * *`
- **Output:** Writes index to `data/memory-index.json`
- **CLI modes:**
  - `node memory-system.js` - Rebuild index
  - `node memory-system.js search "query"` - Search the index
  - `node memory-system.js topics` - List all topics
  - `node memory-system.js stats` - Show index statistics

```cron
# Memory Context System - Every 2 hours
0 */2 * * * cd /Users/agentclaw/.openclaw/workspace/automation/utilities && node memory-system.js >> logs/memory-system.log 2>&1
```

## Moltbook Engagement

- **Script:** `moltbook-engage.js`
- **Schedule:** Every 4 hours during active hours (8 AM - 10 PM EST, weekdays)
- **Cron expression:** `0 8,12,16,20 * * 1-5`
- **Config file:** `moltbook-config.json`
- **Required env vars:**
  - `MOLTBOOK_API_URL` - Platform API base URL
  - `MOLTBOOK_API_KEY` - API authentication key
  - `MOLTBOOK_USERNAME` - Account username
- **Safety:** Starts in dry-run mode by default. Set `safety.dryRun: false` in config to enable real actions.

```cron
# Moltbook Engagement - 4x daily on weekdays during active hours
0 8,12,16,20 * * 1-5 cd /Users/agentclaw/.openclaw/workspace/automation/utilities && node moltbook-engage.js >> logs/moltbook-engage.log 2>&1
```

## Complete Crontab

Copy and paste this block into your crontab (`crontab -e`):

```cron
# ClawOps Utilities Suite
# Timezone: America/New_York (EST/EDT)

# Google Drive Backup - Daily at 2 AM
0 2 * * * cd /Users/agentclaw/.openclaw/workspace/automation/utilities && node gdrive-backup.js >> logs/gdrive-backup.log 2>&1

# Memory Context System - Every 2 hours
0 */2 * * * cd /Users/agentclaw/.openclaw/workspace/automation/utilities && node memory-system.js >> logs/memory-system.log 2>&1

# Moltbook Engagement - 4x daily on weekdays
0 8,12,16,20 * * 1-5 cd /Users/agentclaw/.openclaw/workspace/automation/utilities && node moltbook-engage.js >> logs/moltbook-engage.log 2>&1
```

## Notes

- The cron dashboard runs as a persistent server, not a scheduled job. Use pm2 or a process manager to keep it alive.
- All scripts log to `automation/utilities/logs/` with their respective log files.
- Google Drive backup requires one-time setup of service account credentials.
- Moltbook engagement starts in dry-run mode for safety. Review logs before enabling live mode.
- All scripts handle errors gracefully and exit with non-zero codes on failure for cron alerting.
