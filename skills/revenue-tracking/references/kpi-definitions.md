# KPI Definitions

Key Performance Indicators for ClawOps revenue tracking and business health.

## Revenue KPIs

### Total Revenue
- Definition: Sum of all payments received (confirmed/settled in Stripe)
- Source: Stripe dashboard, payments tab
- Frequency: Check daily during sprint

### Monthly Recurring Revenue (MRR)
- Definition: Sum of all active subscription payments per month
- Includes: Growth Retainer ($2K) + Enterprise ($5K) + AutoPilot subscriptions
- Does NOT include: One-time payments (Starter Sprint, Automation Sprint)

### Average Revenue Per Client (ARPC)
- Definition: Total revenue / Number of unique paying clients
- Target: $2,000+ (indicates we are selling mid-to-high tier)

### Deal Velocity
- Definition: Average days from first contact to payment
- Target: Under 14 days for Starter, under 30 days for higher tiers

### Conversion Rate
- Definition: Paying clients / Total qualified leads
- Track by source: website form, Reddit, Discord, direct outreach

## Pipeline KPIs

### Pipeline Value
- Definition: Total estimated value of all active (non-closed, non-lost) deals
- Rule: Only count deals with a real conversation or form submission

### Pipeline Coverage Ratio
- Definition: Pipeline Value / Remaining Revenue Target
- Healthy: 3x or higher (need $30K in pipeline to close $10K)

### Lead Sources
- Track where each lead came from:
  - Website form (FormSubmit)
  - Reddit outreach
  - Discord
  - Upwork/Fiverr
  - Referral
  - Direct/cold outreach

## Operational KPIs

### Burn Rate
- Definition: Daily/weekly expenses (hosting, tools, subscriptions)
- Current: Near $0 (GitHub Pages free, OpenClaw on local Mac)

### Days to Target
- Definition: Calendar days remaining until $100K deadline
- Sprint start: Feb 17, 2026
- Deadline: ~March 15, 2026

### Required Daily Revenue
- Definition: (Target - Current Revenue) / Days Remaining
- Update daily

### Revenue Gap
- Definition: Target - Current Revenue
- The number to close

## Health Indicators

### Green (On Track)
- Actual daily rate >= Required daily rate
- Pipeline coverage >= 3x
- New leads coming in daily

### Yellow (Caution)
- Actual daily rate at 50-99% of required
- Pipeline coverage 1.5-3x
- Lead flow slowing

### Red (Behind)
- Actual daily rate < 50% of required
- Pipeline coverage < 1.5x
- No new leads in 48+ hours
- Action: Emergency strategy session, pivot tactics
