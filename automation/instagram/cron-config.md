# Instagram Automation - Cron Configuration

All times are in EST (America/New_York timezone).

## Unfollow Manager - Every 4 hours (6 times daily)

```cron
0 0,4,8,12,16,20 * * * cd /Users/agentclaw/.openclaw/workspace/automation/instagram && /usr/local/bin/node unfollow-manager.js >> logs/cron-unfollow.log 2>&1
```

**Schedule:** Midnight, 4 AM, 8 AM, Noon, 4 PM, 8 PM EST
**Rate:** 25 unfollows per run, 150 per day max

## Enrichment - Every 1 hour

```cron
30 * * * * cd /Users/agentclaw/.openclaw/workspace/automation/instagram && /usr/local/bin/node enrichment.js >> logs/cron-enrichment.log 2>&1
```

**Schedule:** 30 minutes past every hour (offset from unfollow runs to avoid overlap)
**Rate:** 50 accounts enriched per run

## Daily Report - Once at 9 PM EST

```cron
0 21 * * * cd /Users/agentclaw/.openclaw/workspace/automation/instagram && /usr/local/bin/node daily-report.js >> logs/cron-report.log 2>&1
```

**Schedule:** 9:00 PM EST daily

## Setup Instructions

1. Open crontab editor:
   ```bash
   EDITOR=nano crontab -e
   ```

2. Add the environment variables at the top of the crontab:
   ```cron
   IG_USERNAME=your_instagram_username
   IG_PASSWORD=your_instagram_password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   TZ=America/New_York
   PATH=/usr/local/bin:/usr/bin:/bin
   ```

3. Paste the three cron entries from above.

4. Save and exit.

## Verifying Cron

```bash
# List active cron jobs
crontab -l

# Check cron logs (macOS)
log show --predicate 'process == "cron"' --last 1h

# Check script logs
tail -f /Users/agentclaw/.openclaw/workspace/automation/instagram/logs/cron-unfollow.log
```

## Notes

- The enrichment job runs at :30 past each hour to avoid colliding with unfollow runs at :00.
- All scripts handle errors gracefully and will not crash the cron daemon.
- Logs rotate daily by filename (e.g., unfollow-2026-02-22.log).
- If Instagram returns a challenge or rate limit, scripts stop early and log the issue.
