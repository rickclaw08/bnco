# Revenue Tracking

- **Name:** revenue-tracking
- **Version:** 0.1.0
- **Description:** Track revenue pipeline, monitor Stripe payments, update pipeline tracker, and forecast progress against the $100K target. Rick's financial pulse.
- **Owner:** Rick (CEO / main agent)

## Trigger Keywords

- "revenue status"
- "pipeline update"
- "how much have we made"
- "deal tracking"
- "stripe check"
- "revenue forecast"
- "are we on track"

## Prerequisites

- Stripe account: ClawOps (contact@aurolly.com)
- Browser access for Stripe dashboard
- pipeline-tracker.md in workspace (create if missing)
- Access to claw-agency/finance/ directory

## Workflow

### 1. Check Stripe for Payments

1. Open Stripe dashboard via browser tool (profile: openclaw)
2. Navigate to: https://dashboard.stripe.com/payments
3. Check for new payments since last check
4. Note: payment amount, customer, product/tier, date
5. Record any new payments in pipeline-tracker.md

### 2. Update Pipeline Tracker

File: `/Users/agentclaw/.openclaw/workspace/claw-agency/finance/pipeline-tracker.md`

Structure:
```markdown
# Revenue Pipeline Tracker

## Target: $100,000
## Deadline: Mid-March 2026
## Current Total: $X,XXX

## Closed Deals
| Date | Client | Product | Amount | Status |
|------|--------|---------|--------|--------|
| YYYY-MM-DD | Name | Tier | $X,XXX | Paid |

## Active Pipeline
| Lead | Product | Est. Value | Stage | Next Step |
|------|---------|-----------|-------|-----------|

## Lost/Stalled
| Lead | Reason | Date |
|------|--------|------|
```

Update rules:
- Move deals between sections as status changes
- Always recalculate Current Total after changes
- Add notes on deal stage changes

### 3. Calculate Progress and Burn Rate

1. Current revenue total from pipeline-tracker.md
2. Days elapsed since sprint start (Feb 17, 2026)
3. Days remaining to deadline (mid-March 2026 ~ March 15)
4. Required daily rate = (Target - Current) / Days Remaining
5. Actual daily rate = Current / Days Elapsed

Report format:
```
Revenue Status:
- Total earned: $X,XXX / $100,000
- Progress: X.X%
- Days elapsed: XX
- Days remaining: XX
- Required daily rate: $X,XXX/day
- Actual daily rate: $X,XXX/day
- On track: YES/NO
```

### 4. Revenue Sources Check

Check all revenue channels:

1. **Stripe Direct** - Payment links on theclawops.com
   - Starter Sprint: $600
   - Growth Retainer: $2,000/mo
   - Automation Sprint: $7,500
   - Enterprise: $5,000/mo

2. **Inbound Leads** - FormSubmit to agentclaw08@icloud.com
   - Check for new form submissions
   - Log any leads in pipeline

3. **Outbound** - Reddit, Discord, direct outreach
   - Check if any outreach converted
   - Update pipeline accordingly

4. **AutoPilot SaaS** - Recurring revenue
   - Free / $49 / $149 tiers
   - Check for signups

### 5. Alert on Significant Events

Alert Brand via Telegram when:
- New payment received (any amount)
- Deal closes or moves to final stage
- Revenue milestone hit (each $10K increment)
- Falling behind pace (daily rate drops below 50% of required)

Alert format:
```
openclaw message send --channel telegram --target 6596951046 --message "..."
```

### 6. Forecast and Strategy Adjustment

If behind target:
1. Calculate gap to close
2. Identify fastest path to revenue:
   - High-ticket deals ($7.5K-$15K sprints) for quick jumps
   - Retainers ($2K-$5K/mo) for recurring base
   - SaaS signups for volume
3. Recommend specific actions to Rick
4. Dispatch CRO (Jordan) or CMO (Victoria) if outreach needed

If ahead of target:
1. Log the win
2. Look for upsell opportunities
3. Focus on retention and quality delivery

## Pricing Reference

See references/pricing-tiers.md for full pricing details.

## KPI Definitions

See references/kpi-definitions.md for metric definitions.

## Reference Files

- `references/stripe-links.md` - Stripe payment links and dashboard URLs
- `references/pricing-tiers.md` - All pricing tiers and packages
- `references/kpi-definitions.md` - KPI and metric definitions
