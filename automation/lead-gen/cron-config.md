# Cron Configuration - Lead Generation Pipeline

## Schedule

The lead generation pipeline runs 4 times per day (every 6 hours) in the Eastern time zone.

| Run | Time (EST) | Purpose |
|-----|-----------|---------|
| 1   | 12:00 AM  | Overnight batch - captures late-night forum posts and discussions |
| 2   | 6:00 AM   | Morning batch - fresh business day content |
| 3   | 12:00 PM  | Midday batch - captures morning posts and job listings |
| 4   | 6:00 PM   | Evening batch - end-of-day business content |

## OpenClaw Cron Format

Add these cron jobs via the OpenClaw CLI:

```bash
# Lead Generation Pipeline - runs every 6 hours
openclaw cron add \
  --schedule "0 0,6,12,18 * * *" \
  --timezone "America/New_York" \
  --command "node /Users/agentclaw/.openclaw/workspace/automation/lead-gen/lead-pipeline.js" \
  --name "lead-gen-pipeline" \
  --description "Generate qualified leads and draft outreach emails"

# Send Approved Emails - runs 30 minutes after each pipeline batch
# (gives time for review, or sends previously approved drafts)
openclaw cron add \
  --schedule "30 0,6,12,18 * * *" \
  --timezone "America/New_York" \
  --command "node /Users/agentclaw/.openclaw/workspace/automation/lead-gen/send-approved.js" \
  --name "lead-gen-sender" \
  --description "Send approved outreach emails with rate limiting"
```

## Alternative: Using System Crontab

If you prefer system-level cron instead of OpenClaw cron:

```bash
# Edit crontab
crontab -e

# Add these lines (adjust paths as needed):
# Lead pipeline - every 6 hours at :00
0 0,6,12,18 * * * cd /Users/agentclaw/.openclaw/workspace/automation/lead-gen && /usr/local/bin/node lead-pipeline.js >> logs/cron.log 2>&1

# Email sender - every 6 hours at :30
30 0,6,12,18 * * * cd /Users/agentclaw/.openclaw/workspace/automation/lead-gen && /usr/local/bin/node send-approved.js >> logs/cron.log 2>&1
```

## Expected Output Per Day

- 4 batches x 10-12 leads = 40-50 qualified leads per day
- Drafts saved to `drafts/` for review
- Approved drafts sent with 30-second delays between emails
- Rate limited to 10 emails per hour max
- All activity logged to `logs/`

## Manual Runs

You can also trigger runs manually at any time:

```bash
# Run the pipeline
node lead-pipeline.js

# Run with custom batch size
node lead-pipeline.js --batch-size 15

# Review drafts
node approve-drafts.js

# Approve all pending
node approve-drafts.js approve-all

# Send approved (dry run first)
node send-approved.js --dry-run

# Send for real
node send-approved.js
```

## Monitoring

Check pipeline health:

```bash
# View recent logs
ls -la logs/
cat logs/pipeline-*.log | tail -50

# Check draft stats
node approve-drafts.js stats

# Check send logs
cat logs/sends.log | tail -20

# Check rate limit state
cat logs/rate-limit-state.json
```
