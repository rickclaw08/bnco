# Sales Pipeline

**Version:** 0.1.0
**Owner:** Jordan (CRO)
**Description:** Manage the sales pipeline from lead to close. Track deal stages, send follow-ups, schedule calls, and report pipeline health.

## Trigger Keywords

- "pipeline status"
- "deal update"
- "follow up"
- "move to next stage"
- "pipeline report"
- "deal stages"
- "where are we on"
- "update pipeline"

## When to Use

Use this skill when:
- Checking the status of active deals
- Moving a deal to the next stage
- Sending follow-up messages to prospects
- Generating a pipeline report for the CEO
- A new qualified lead needs to enter the pipeline
- A deal is won or lost and needs to be logged

## Pipeline Tracker Location

Main tracker file: `/Users/agentclaw/.openclaw/workspace/pipeline-tracker.md`

If this file doesn't exist, create it with the format below.

## Workflow

### Step 1: Understand Pipeline Stages

See `references/pipeline-stages.md` for full details. Quick summary:

| Stage | Description | Target Duration |
|-------|------------|----------------|
| 1. Lead | New prospect identified, not yet contacted | 0-2 days |
| 2. Contacted | Initial outreach sent | 1-3 days |
| 3. Qualified | Meets qualification criteria, has responded | 1-5 days |
| 4. Proposal Sent | Proposal delivered, awaiting response | 3-7 days |
| 5. Negotiating | Client engaged, discussing terms | 3-14 days |
| 6. Closing | Agreement reached, finalizing paperwork | 1-5 days |
| 7. Won | Deal closed, payment received | -- |
| 8. Lost | Deal didn't close | -- |

### Step 2: Update the Pipeline Tracker

For each deal update, modify the pipeline tracker:

```markdown
## Active Pipeline

| # | Client | Source | Tier | Stage | Value | Last Contact | Next Action | Due |
|---|--------|--------|------|-------|-------|-------------|-------------|-----|
| 1 | [Name] | [Upwork/Reddit/etc] | [1-4] | [Stage] | $[X] | [Date] | [Action] | [Date] |
```

When updating:
1. Change the stage number/name
2. Update "Last Contact" date
3. Set the next action and due date
4. Add notes if the situation changed

### Step 3: Execute Stage-Appropriate Actions

#### Stage 1: Lead (New)
- Verify qualification (see prospect-hunting skill)
- Assign lead score (A/B/C/D)
- Move to Stage 2 by sending initial outreach

#### Stage 2: Contacted
- Send initial outreach message
- Log the outreach attempt
- Set follow-up for 48-72 hours if no response
- After 3 attempts with no response, move to Lost

#### Stage 3: Qualified
- Confirm they meet all must-have criteria
- Schedule a discovery call or start scoping
- Determine the right tier
- Prepare to create a proposal

#### Stage 4: Proposal Sent
- Generate proposal using deal-closing skill
- Send to client with clear call-to-action
- Set follow-up sequence (see `references/follow-up-sequences.md`)
- Track if/when they open or respond

#### Stage 5: Negotiating
- Handle objections (see `references/objection-handling.md`)
- Adjust scope or pricing if needed (with CFO approval)
- Keep momentum - don't let it stall
- Schedule call to resolve remaining concerns

#### Stage 6: Closing
- Generate contract (deal-closing skill)
- Send payment link (Stripe)
- Confirm payment received
- Transition to project delivery

#### Stage 7: Won
- Log final deal details
- Calculate actual revenue vs. projected
- Send to CFO for financial tracking
- Ask for referral or testimonial (30 days post-delivery)

#### Stage 8: Lost
- Log reason for loss
- Note any lessons learned
- Add to "re-engage" list if appropriate (3-6 months)
- Analyze patterns in lost deals

### Step 4: Follow-Up Cadence

Follow-up is critical. Most deals are lost to silence, not rejection.

| Situation | When to Follow Up | Template |
|-----------|------------------|----------|
| Initial outreach, no response | 48-72 hours | Gentle nudge |
| Proposal sent, no response | 3 days | Check-in |
| Proposal sent, still silent | 7 days | Value-add |
| Proposal sent, still silent | 14 days | Final nudge |
| Post-call, awaiting decision | 3-5 days | Recap + next steps |
| Negotiating, gone quiet | 5-7 days | Address concerns |

See `references/follow-up-sequences.md` for specific templates.

### Step 5: Generate Pipeline Report

When asked for pipeline status, generate:

```
PIPELINE REPORT
Date: [Date]
Prepared for: CEO

SUMMARY
- Total active deals: [Number]
- Total pipeline value: $[Sum of all active deal values]
- Weighted pipeline value: $[Sum of (value x probability by stage)]
- Deals closing this week: [Number]
- Deals at risk: [Number]

BY STAGE
- Lead: [X] deals, $[Y] value
- Contacted: [X] deals, $[Y] value
- Qualified: [X] deals, $[Y] value
- Proposal Sent: [X] deals, $[Y] value
- Negotiating: [X] deals, $[Y] value
- Closing: [X] deals, $[Y] value

THIS WEEK'S PRIORITIES
1. [Deal] - [Action needed]
2. [Deal] - [Action needed]
3. [Deal] - [Action needed]

WINS THIS MONTH: [Number] deals, $[Amount]
LOSSES THIS MONTH: [Number] deals, $[Amount]
WIN RATE: [Wins / (Wins + Losses)] x 100 = [X]%
```

### Step 6: Handle Stalled Deals

A deal is "stalled" if it hasn't moved stages in:
- Stage 1-2: 5+ days
- Stage 3: 7+ days
- Stage 4: 10+ days
- Stage 5-6: 14+ days

For stalled deals:
1. Review last communication
2. Try a different channel (email vs. message vs. call)
3. Offer something new (insight, adjusted scope, limited-time pricing)
4. If still no response after 3 attempts, move to Lost

### Step 7: Weekly Pipeline Review

Every Friday (or when requested):
1. Review every active deal
2. Update stages and next actions
3. Flag stalled deals
4. Calculate pipeline metrics
5. Report to CEO
6. Plan next week's priorities

## Pipeline Health Indicators

| Indicator | Healthy | Warning | Unhealthy |
|-----------|---------|---------|-----------|
| Active deals | 5-15 | 3-4 or 16-20 | <3 or >20 |
| Avg days to close | <21 | 21-30 | >30 |
| Win rate | >25% | 15-25% | <15% |
| Pipeline to revenue ratio | 3:1+ | 2:1 | <2:1 |
| Deals added per week | 3+ | 1-2 | 0 |

## Reference Files

- `references/pipeline-stages.md` - Detailed stage definitions and criteria
- `references/follow-up-sequences.md` - Follow-up message sequences
- `references/objection-handling.md` - Common objections and responses
