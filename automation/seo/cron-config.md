# SEO Monitoring System - Cron Configuration

All times in Eastern Standard Time (EST / America/New_York).

## Cron Schedule

### Backlink Opportunity Scanner
- **Frequency:** Every 6 hours
- **Cron expression:** `0 */6 * * *`
- **Command:** `cd /Users/agentclaw/.openclaw/workspace/automation/seo && node backlink-scanner.js`
- **Output:** `data/backlink-opportunities.json`

### Content Gap Analyzer
- **Frequency:** Daily at 3:00 AM EST
- **Cron expression:** `0 3 * * *`
- **Command:** `cd /Users/agentclaw/.openclaw/workspace/automation/seo && node content-gap.js`
- **Output:** `data/content-gaps.json`

### GSC Rank Monitor
- **Frequency:** Daily at 6:00 AM EST
- **Cron expression:** `0 6 * * *`
- **Command:** `cd /Users/agentclaw/.openclaw/workspace/automation/seo && node rank-monitor.js`
- **Output:** `data/rank-history.json`, `data/rank-alerts.json` (when alerts exist)

### Citation Tracker
- **Frequency:** Weekly on Mondays at 2:00 AM EST
- **Cron expression:** `0 2 * * 1`
- **Command:** `cd /Users/agentclaw/.openclaw/workspace/automation/seo && node citation-tracker.js`
- **Output:** `data/citations.json`

## Installing with crontab

Run `crontab -e` and add:

```cron
# SEO Monitoring System - ClawOps
# Timezone: Ensure system timezone is EST or use TZ prefix

# Backlink Scanner - every 6 hours
0 */6 * * * cd /Users/agentclaw/.openclaw/workspace/automation/seo && /usr/local/bin/node backlink-scanner.js >> /tmp/seo-backlink.log 2>&1

# Content Gap Analyzer - daily at 3 AM EST
0 3 * * * cd /Users/agentclaw/.openclaw/workspace/automation/seo && /usr/local/bin/node content-gap.js >> /tmp/seo-content-gap.log 2>&1

# Rank Monitor - daily at 6 AM EST
0 6 * * * cd /Users/agentclaw/.openclaw/workspace/automation/seo && /usr/local/bin/node rank-monitor.js >> /tmp/seo-rank-monitor.log 2>&1

# Citation Tracker - weekly on Mondays at 2 AM EST
0 2 * * 1 cd /Users/agentclaw/.openclaw/workspace/automation/seo && /usr/local/bin/node citation-tracker.js >> /tmp/seo-citation.log 2>&1
```

## Installing with OpenClaw Cron

Alternatively, use OpenClaw's built-in cron system:

```bash
openclaw cron add --name "seo-backlink-scanner" --schedule "0 */6 * * *" --command "cd automation/seo && node backlink-scanner.js"
openclaw cron add --name "seo-content-gap" --schedule "0 3 * * *" --command "cd automation/seo && node content-gap.js"
openclaw cron add --name "seo-rank-monitor" --schedule "0 6 * * *" --command "cd automation/seo && node rank-monitor.js"
openclaw cron add --name "seo-citation-tracker" --schedule "0 2 * * 1" --command "cd automation/seo && node citation-tracker.js"
```

## Manual Runs

You can run any module manually:

```bash
cd /Users/agentclaw/.openclaw/workspace/automation/seo

# Run individual modules
node backlink-scanner.js
node content-gap.js
node rank-monitor.js
node citation-tracker.js
```

## Log Monitoring

Check logs for errors:

```bash
tail -f /tmp/seo-backlink.log
tail -f /tmp/seo-content-gap.log
tail -f /tmp/seo-rank-monitor.log
tail -f /tmp/seo-citation.log
```
