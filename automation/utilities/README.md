# ClawOps Utilities Suite

Supporting automation tools for the ClawOps workspace. Production-ready with error handling, logging, and configurable scheduling.

## Components

### 1. Cron Job Logging Dashboard (`cron-dashboard.js`)

A real-time web dashboard for monitoring all ClawOps automation systems.

- **Port:** 4200 (configurable via `DASHBOARD_PORT`)
- **Features:**
  - Reads logs from lead-gen, instagram, seo, initiative-engine, and utilities
  - Color-coded status: green (success), red (failure), yellow (warnings)
  - Auto-refreshes every 60 seconds
  - JSON API at `/api/status` for programmatic access
  - Health check at `/health`

**Start:**
```bash
node cron-dashboard.js
# Or with pm2:
pm2 start cron-dashboard.js --name clawops-dashboard
```

### 2. Google Drive Backup (`gdrive-backup.js`)

Automated backup of key workspace files to Google Drive.

- **Schedule:** Daily at 2 AM EST
- **Targets:** claw-agency/, automation configs, automation data, memory/
- **Retention:** Keeps last 7 backups, auto-deletes older ones

**Setup:**
1. Create a Google Cloud project and enable the Drive API
2. Create a service account and download the JSON key
3. Create a folder in Google Drive and share it with the service account email
4. Set environment variables:

```bash
export GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json
export GDRIVE_PARENT_FOLDER_ID=your-drive-folder-id
```

**Run:**
```bash
node gdrive-backup.js
```

### 3. Memory Context System (`memory-system.js`)

Indexes all `memory/*.md` files for fast keyword search and topic tracking.

- **Schedule:** Every 2 hours
- **Output:** `data/memory-index.json`

**Usage:**
```bash
# Build/rebuild the index
node memory-system.js

# Search for keywords
node memory-system.js search "automation workflow"

# List all topics (headings) across memory files
node memory-system.js topics

# Show index statistics
node memory-system.js stats
```

### 4. Moltbook Engagement (`moltbook-engage.js`)

Automated community engagement on Moltbook (or similar platforms).

- **Schedule:** 4x daily on weekdays during active hours
- **Config:** `moltbook-config.json`
- **Safety:** Starts in dry-run mode by default

**Setup:**
1. Edit `moltbook-config.json` to customize targeting, engagement limits, and schedule
2. Set environment variables:

```bash
export MOLTBOOK_API_URL=https://api.moltbook.com
export MOLTBOOK_API_KEY=your-api-key
export MOLTBOOK_USERNAME=your-username
```

3. Test in dry-run mode first (default)
4. Set `safety.dryRun` to `false` in config when ready for live engagement

**Run:**
```bash
node moltbook-engage.js
```

## Directory Structure

```
automation/utilities/
  cron-dashboard.js      - Web dashboard server
  gdrive-backup.js       - Google Drive backup script
  memory-system.js       - Memory indexing system
  moltbook-engage.js     - Community engagement script
  moltbook-config.json   - Moltbook engagement configuration
  cron-config.md         - Cron schedule documentation
  README.md              - This file
  data/                  - Runtime data (indexes, state)
    memory-index.json    - Memory search index
    moltbook-state.json  - Engagement state tracking
  logs/                  - Log files
    gdrive-backup.log
    memory-system.log
    moltbook-engage.log
```

## Environment Variables

| Variable | Required By | Description |
|----------|-------------|-------------|
| `DASHBOARD_PORT` | cron-dashboard | Dashboard port (default: 4200) |
| `WORKSPACE_DIR` | all | Workspace root override |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | gdrive-backup | Path to service account JSON key |
| `GDRIVE_PARENT_FOLDER_ID` | gdrive-backup | Google Drive folder ID for backups |
| `BACKUP_RETENTION_COUNT` | gdrive-backup | Number of backups to keep (default: 7) |
| `MEMORY_DIR` | memory-system | Memory directory override |
| `MOLTBOOK_API_URL` | moltbook-engage | Platform API base URL |
| `MOLTBOOK_API_KEY` | moltbook-engage | API authentication key |
| `MOLTBOOK_USERNAME` | moltbook-engage | Account username |
| `MOLTBOOK_PASSWORD` | moltbook-engage | Account password (if needed) |

## Scheduling

See `cron-config.md` for detailed cron configuration and the complete crontab block.

## Dependencies

- **googleapis** - Google Drive API client (used by gdrive-backup.js)

Install with:
```bash
cd /Users/agentclaw/.openclaw/workspace/automation/utilities
npm install googleapis
```

All other scripts use only Node.js built-in modules (http, https, fs, path).

## Logging

All scripts write logs to the `logs/` directory. Log format:

```
[ISO-TIMESTAMP] [LEVEL] Message
```

Levels: INFO, WARN, ERROR

The cron dashboard reads these log files (and logs from other automation systems) to display status.
