# Initiative Engine - Cron Configuration

## Schedule

### Engine Scan (every 4 hours)
```
0 */4 * * * cd /Users/agentclaw/.openclaw/workspace && node automation/initiative-engine/engine.js >> automation/initiative-engine/logs/cron.log 2>&1
```

### Daily Summary (10 PM EST)
```
0 22 * * * cd /Users/agentclaw/.openclaw/workspace && node automation/initiative-engine/daily-summary.js >> automation/initiative-engine/logs/cron.log 2>&1
```

## Setup

To install the cron jobs:

```bash
# Edit crontab
crontab -e

# Add the two lines above (without the backtick fences)
```

## Environment Variables Required

These must be set in the cron environment or in a `.env` file at the workspace root:

- `SMTP_HOST` - SMTP server hostname (e.g., smtp.gmail.com)
- `SMTP_PORT` - SMTP port (e.g., 587)
- `SMTP_USER` - SMTP username/email
- `SMTP_PASS` - SMTP password or app-specific password
- `SMTP_FROM` - Sender email address

## Notes

- The engine logs all output to `automation/initiative-engine/logs/`
- Each run creates a timestamped log file
- The daily summary compiles all activity from that day
- Cron output is also captured in `cron.log` as a fallback
- All times assume the system timezone is set to America/New_York (EST/EDT)
