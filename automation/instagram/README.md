# Instagram Self-Management System

Automated Instagram account management: unfollow non-followers, enrich account data, and receive daily email reports.

## Overview

This system has three components:

1. **Unfollow Manager** - Identifies and unfollows accounts that don't follow you back
2. **Enrichment Script** - Fetches follower counts and updates the local database
3. **Daily Report** - Sends a clean HTML email with stats and trends

### Safety Features

- Accounts with 1,500+ followers are **protected** and never unfollowed (they have value)
- Maximum 25 unfollows per run, 6 runs per day (150/day cap)
- Random delays (30-90 seconds) between unfollows to avoid rate limits
- Automatic rate limit detection: scripts stop early if Instagram pushes back
- All actions logged with timestamps

## Prerequisites

- Node.js 18+
- npm
- An Instagram account
- SMTP access for email reports (Gmail with App Passwords works well)

## Setup

### 1. Install dependencies

```bash
cd automation/instagram
npm install
```

### 2. Initialize the database

```bash
npm run setup-db
```

This creates `data/accounts.db` with all necessary tables and indexes.

### 3. Configure environment variables

Create a `.env` file or export these variables. **Never commit credentials to git.**

```bash
# Instagram credentials
export IG_USERNAME="your_instagram_username"
export IG_PASSWORD="your_instagram_password"

# SMTP for daily email reports
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="your_email@gmail.com"
export SMTP_PASS="your_gmail_app_password"
export SMTP_FROM="your_email@gmail.com"
```

**Gmail App Passwords:** If using Gmail, you need to generate an App Password:
1. Go to Google Account > Security > 2-Step Verification
2. At the bottom, click "App passwords"
3. Generate one for "Mail" and use it as `SMTP_PASS`

### 4. Configure settings

Edit `config.json` to adjust:

```json
{
  "protectedFollowerThreshold": 1500,
  "unfollowsPerRun": 25,
  "runsPerDay": 6,
  "delayRange": { "minSeconds": 30, "maxSeconds": 90 },
  "emailRecipient": "jacksonroy152@gmail.com"
}
```

### 5. First run (manual)

Run each script manually to verify everything works:

```bash
# Populate the database with followers/following
npm run unfollow

# Enrich accounts with follower counts
npm run enrich

# Send a test report
npm run report
```

### 6. Set up cron jobs

See `cron-config.md` for the exact crontab entries. Summary:

| Script | Schedule | Frequency |
|--------|----------|-----------|
| Unfollow Manager | Every 4 hours | 6x daily |
| Enrichment | Every hour (at :30) | 24x daily |
| Daily Report | 9 PM EST | 1x daily |

## File Structure

```
automation/instagram/
  config.json          - Main configuration
  package.json         - Dependencies and scripts
  ig-client.js         - Shared Instagram client (session management)
  unfollow-manager.js  - Core unfollow logic
  enrichment.js        - Follower count enrichment
  daily-report.js      - HTML email reporter
  setup-db.js          - Database initialization
  cron-config.md       - Cron schedule documentation
  README.md            - This file
  data/
    accounts.db        - SQLite database
    .ig-session.json   - Saved Instagram session (auto-generated)
  logs/
    unfollow-YYYY-MM-DD.log
    enrichment-YYYY-MM-DD.log
    report-YYYY-MM-DD.log
```

## Database Schema

### accounts
Stores every account in your follower/following lists with follower counts and protection status.

### follower_history
Time-series data tracking follower count changes for trend analysis.

### unfollow_log
Record of every unfollow action with timestamps and reasons.

### run_log
Audit trail of script executions, their status, and how many accounts were processed.

## How It Works

### Unfollow Flow

1. Fetches your complete followers and following lists from Instagram
2. Identifies "non-followers" (people you follow who don't follow back)
3. Checks each against the protection threshold (1,500+ followers = protected)
4. Unfollows up to 25 accounts with random delays between each
5. Logs every action and updates the database

### Enrichment Flow

1. Selects 50 accounts from the database, prioritizing those never enriched or oldest updated
2. Fetches each account's profile info from Instagram
3. Updates follower counts and protection status
4. Records a history entry for trend tracking

### Report Flow

1. Queries the database for daily and weekly stats
2. Builds a clean HTML email with Instagram-style gradient header
3. Includes: unfollowed today, ratio, protected accounts, weekly trends, run history
4. Sends via SMTP to the configured recipient

## Troubleshooting

**"Missing IG_USERNAME or IG_PASSWORD"** - Set the environment variables before running.

**Challenge/checkpoint errors** - Instagram detected unusual activity. Wait 24 hours, then:
1. Log in to Instagram manually on the same device/IP
2. Complete any verification prompts
3. Delete `data/.ig-session.json` and try again

**Rate limit errors** - Scripts automatically stop early. No action needed, next cron run will continue.

**Session expired** - Delete `data/.ig-session.json` and the script will create a fresh session on next run.

**Email not sending** - Verify SMTP credentials. For Gmail, ensure you are using an App Password, not your regular password.

## Security Notes

- Credentials are stored only in environment variables, never in code
- The `.ig-session.json` file contains a session token. Treat it as sensitive.
- Add `data/.ig-session.json` to `.gitignore`
- The SQLite database contains usernames and follower counts (public data), but keep it private anyway.
