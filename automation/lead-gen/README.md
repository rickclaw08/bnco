# Lead Generation Pipeline - ClawOps

Automated lead generation system that finds businesses needing AI automation or photography services, qualifies them, drafts personalized outreach emails, and sends approved messages.

## Overview

The system has three main components:

1. **Lead Pipeline** (`lead-pipeline.js`) - Searches, scrapes, qualifies, and drafts emails
2. **Draft Approval** (`approve-drafts.js`) - Review and approve/reject drafts before sending
3. **Email Sender** (`send-approved.js`) - Sends approved emails with rate limiting

## Directory Structure

```
automation/lead-gen/
  lead-pipeline.js     # Main pipeline script
  approve-drafts.js    # Draft review and approval tool
  send-approved.js     # Email sender with rate limiting
  cron-config.md       # Cron schedule documentation
  .env                 # Environment variables (create this)
  drafts/              # Pending email drafts (JSON)
  approved/            # Approved drafts queued for sending
  sent/                # Sent email records
  logs/                # Pipeline logs, send logs, rate limit state
```

## Setup

### 1. Install Dependencies

```bash
cd /Users/agentclaw/.openclaw/workspace/automation/lead-gen
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Search API (optional but recommended for reliable results)
BRAVE_API_KEY=your_brave_api_key

# SMTP Configuration (pick one)
# For iCloud Mail:
SMTP_HOST=smtp.mail.me.com
SMTP_PORT=587
SMTP_USER=your@icloud.com
SMTP_PASS=your-app-specific-password

# For Gmail:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your@gmail.com
# SMTP_PASS=your-app-password

# Sender Info
SENDER_EMAIL=your@email.com
SENDER_NAME=Brand
SENDER_COMPANY=ClawOps

# Rate Limiting
SEND_RATE_LIMIT=10
SEND_DELAY_MS=30000

# Pipeline Settings
LEAD_GEN_BATCH_SIZE=12
```

### 3. Generate App-Specific Password

**For iCloud Mail:**
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in, go to "Sign-In and Security" then "App-Specific Passwords"
3. Generate a new password for "ClawOps Lead Pipeline"
4. Use that password as `SMTP_PASS`

**For Gmail:**
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Generate a new app password
3. Use that password as `SMTP_PASS`

## Usage

### Daily Workflow

**Step 1: Generate leads** (runs automatically via cron, or manually)

```bash
node lead-pipeline.js
```

This searches for businesses, scrapes their info, qualifies them, and saves draft emails to `drafts/`.

**Step 2: Review drafts**

```bash
# Interactive review
node approve-drafts.js

# Or quick commands
node approve-drafts.js list          # List pending
node approve-drafts.js approve <id>  # Approve one
node approve-drafts.js approve-all   # Approve all
node approve-drafts.js reject <id>   # Reject one
node approve-drafts.js stats         # View statistics
```

**Step 3: Send approved emails**

```bash
# Always do a dry run first to double-check
node send-approved.js --dry-run

# Send for real
node send-approved.js

# Limit number of sends
node send-approved.js --limit 5
```

### Automated Schedule

The pipeline is configured to run every 6 hours (see `cron-config.md`):

- **12:00 AM EST** - Overnight batch
- **6:00 AM EST** - Morning batch
- **12:00 PM EST** - Midday batch
- **6:00 PM EST** - Evening batch

Each batch targets 10-12 qualified leads, for a daily total of 40-50 leads.

Emails are sent 30 minutes after each pipeline run, giving time for review.

## How It Works

### Search Strategy

The pipeline uses targeted search queries designed to find businesses that genuinely need help:

- `"[city] small business struggling with manual processes"`
- `"small business owner needs help with automation"`
- `"[industry] business hiring for repetitive tasks"`
- `"photographer needs client management system"`

Cities and industries are rotated randomly each run for variety.

### Qualification Scoring

Each lead gets a score from 0-100 based on:

- **Keyword matches** (+5 each) - automation, workflow, manual processes, etc.
- **Contact info** (+15 for email, +5 for phone)
- **Small business signals** (+3 each) - "family owned", "local", etc.
- **Pain point mentions** (+7 each) - "struggling", "overwhelmed", etc.
- **Penalties** (-15 to -30) - directory listings, big companies, irrelevant sites

Only leads scoring 40+ are kept.

### Email Personalization

Emails are drafted using details specific to each business:

- References their business name
- Mentions their industry
- Addresses their specific pain points
- Offers relevant service (automation vs photography workflows)
- Conversational tone, not salesy template spam

### Rate Limiting

To avoid spam flags:

- Max 10 emails per hour (configurable)
- 30-second delay between each send
- Max 20 emails per run
- Tracking state persisted in `logs/rate-limit-state.json`

## File Formats

### Draft JSON

```json
{
  "id": "uuid",
  "createdAt": "2026-02-22T00:00:00.000Z",
  "runId": "abc12345",
  "status": "pending",
  "to": "contact@business.com",
  "subject": "Quick idea for Acme Corp",
  "body": "Hi there...",
  "businessName": "Acme Corp",
  "website": "https://acmecorp.com",
  "industry": "dental",
  "city": "Austin",
  "qualificationScore": 65,
  "qualificationSignals": ["Matched keyword: 'scheduling'"],
  "painPoints": ["scheduling and booking is a headache"],
  "bestService": "automation",
  "phone": "512-555-1234"
}
```

### Status Flow

```
pending --> approved --> sent
   |
   +--> rejected
```

## Troubleshooting

**No results from search:**
- Check if `BRAVE_API_KEY` is set (recommended for reliable results)
- Google scraping may be rate-limited; wait and try again
- Check `logs/` for detailed error messages

**SMTP connection fails:**
- Verify credentials in `.env`
- Make sure you are using an app-specific password (not your account password)
- Check that "less secure app access" is not required (use app passwords instead)
- Try `node send-approved.js --dry-run` to test without sending

**Low qualification scores:**
- Review the qualification signals in draft JSON files
- Adjust `qualificationThreshold` if needed (default: 40)
- Check search queries are returning relevant results

**Rate limit reached:**
- Wait for the hourly window to reset
- Check `logs/rate-limit-state.json` for current state
- Adjust `SEND_RATE_LIMIT` if needed

## Security Notes

- Never commit `.env` to version control
- Use app-specific passwords, not your main account password
- All credentials are loaded from environment variables
- No sensitive data is hardcoded in scripts
- The `.env.example` file contains only placeholder values
