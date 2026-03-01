# Social Monitoring

- **Name:** social-monitoring
- **Version:** 0.1.0
- **Description:** Check Discord, Reddit, email for replies, leads, and engagement on outreach. Surface actionable signals to Rick and Brand.
- **Owner:** Rick (CEO / main agent)

## Trigger Keywords

- "check socials"
- "any replies"
- "new leads"
- "check Reddit"
- "check Discord"
- "check email"
- heartbeat (periodic check)

## Prerequisites

- Reddit account: u/RickClaw_Dev (logged in via OpenClaw browser profile)
- Discord access via OpenClaw
- FormSubmit email: agentclaw08@icloud.com
- Browser tool for checking platforms
- Telegram CLI for alerting Brand

## Workflow

### 1. Check Reddit (u/RickClaw_Dev)

1. Open browser (profile: openclaw)
2. Navigate to: https://www.reddit.com/user/RickClaw_Dev
3. Check:
   - **Notifications/inbox** - Any replies to comments?
   - **Comment karma changes** - Are comments getting upvoted?
   - **DMs** - Any direct messages from potential leads?
4. For each reply/DM:
   - Is it a potential lead? (asking about automation, services, pricing)
   - Is it engagement? (upvotes, positive responses)
   - Is it negative? (downvotes, criticism)
5. Log findings in daily memory

**Reddit Strategy Context:**
- 15 genuine karma-building comments before promotional content
- Target subreddits: r/smallbusiness, r/automation, r/entrepreneur
- Tone: helpful, not salesy
- Editor uses Lexical (contenteditable div) - use DOM evaluate for text input

### 2. Check Discord

1. Check relevant Discord servers for:
   - #help channels - Are people asking questions we can answer?
   - Direct messages - Any leads or inquiries?
   - Mentions of ClawOps or automation services
2. For each opportunity:
   - Can we provide genuine help? (builds credibility)
   - Is this a potential client? (note for follow-up)
3. Log findings

### 3. Check Email (FormSubmit)

1. Check agentclaw08@icloud.com for:
   - Form submissions from theclawops.com
   - Audit form submissions from /tools/audit/
   - Direct emails from potential clients
   - FormSubmit activation confirmations
2. For each submission:
   - Categorize: lead / spam / informational
   - Extract: name, email, company, need
   - Priority: high-ticket potential vs. starter tier
3. Add qualified leads to pipeline-tracker.md

### 4. Assess and Prioritize

Rank all findings:

**Hot Lead (Alert Immediately):**
- Direct inquiry about services/pricing
- Form submission with budget info
- Reddit DM asking about automation help
- Response to outreach showing buying interest

**Warm Lead (Log and Plan Follow-up):**
- Positive engagement on Reddit comments
- Someone asking general automation questions
- Email inquiry without clear budget

**Engagement (Log Only):**
- Upvotes/karma gains
- Helpful replies to our comments
- Community goodwill building

**Noise (Skip):**
- Spam
- Irrelevant replies
- Bot messages

### 5. Alert on Hot Leads

For any hot lead, immediately alert Brand:

```bash
openclaw message send --channel telegram --target 6596951046 --message "New hot lead: [details]"
```

Include:
- Source (Reddit/Discord/Email)
- What they said/asked
- Recommended response
- Urgency level

### 6. Log Everything

Update daily memory (`memory/YYYY-MM-DD.md`):

```markdown
## Social Check - [TIME]
- Reddit: X replies, X karma change, X DMs
- Discord: X messages relevant
- Email: X submissions
- Hot leads: [list]
- Action items: [list]
```

### 7. Engagement Tracking

Maintain a running tally (update weekly):

```markdown
## Social Metrics - Week of [DATE]
- Reddit karma: [current] (change: +/- X)
- Reddit comments posted: X
- Discord interactions: X
- Form submissions: X
- Leads generated: X
- Leads converted: X
```

## Timing

- **During heartbeat**: Quick check, scan for hot leads only
- **Dedicated check**: Full scan of all platforms, update metrics
- **Frequency**: 2-4 times per day during active sprint
- **Quiet hours**: 23:00-08:00 ET, skip unless urgent

## Reference Files

- `references/platform-accounts.md` - Account details and access info
- `references/alert-templates.md` - Pre-written alert messages for common scenarios
