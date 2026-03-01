# Budget Tracking

**Version:** 0.1.0
**Owner:** Morgan (CFO)
**Description:** Track spending, API costs, token usage, and ROI per initiative. Monitor profitability and flag overspend.

## Trigger Keywords

- "budget status"
- "spending report"
- "cost tracking"
- "are we profitable"
- "how much are we spending"
- "token usage"
- "API costs"
- "monthly expenses"
- "burn rate"

## When to Use

Use this skill when:
- Someone asks about current spending or profitability
- Monthly budget review is due
- API costs seem high and need investigation
- A new expense needs to be categorized and tracked
- Revenue vs. cost comparison is needed
- Burn rate or runway calculation is requested

## Workflow

### Step 1: Gather Current Data

Collect from these sources:

1. **Revenue data:**
   - Check pipeline tracker for closed deals
   - Check memory files for recent payments received
   - Check Stripe dashboard (if accessible) for actual receipts

2. **Cost data:**
   - API provider dashboards (OpenAI, Anthropic)
   - Tool subscription records
   - Any invoices paid
   - Time spent (opportunity cost)

3. **Reference data:**
   - `references/cost-categories.md` for category framework
   - `references/budget-thresholds.md` for alert levels

### Step 2: Categorize All Costs

Use the standard categories from `references/cost-categories.md`:

| Category | Examples | Tracking Method |
|----------|---------|----------------|
| API & AI Models | OpenAI, Anthropic usage | Monthly dashboard check |
| Infrastructure | Hosting, domains, DNS | Fixed monthly tally |
| Tools & Subscriptions | GitHub, search APIs, TTS | Monthly subscription list |
| Marketing & Outreach | Ads, sponsored posts, tools | Per-campaign tracking |
| Subcontractors | Freelancer payments | Per-project tracking |
| Miscellaneous | One-off purchases | As incurred |

### Step 3: Build the Monthly Report

```
MONTHLY BUDGET REPORT
Period: [Month Year]
Prepared: [Date]

REVENUE
- Client payments received:  $___
- Retainer income:           $___
- Other income:              $___
- TOTAL REVENUE:             $___

COSTS
- API & AI Models:           $___
- Infrastructure:            $___
- Tools & Subscriptions:     $___
- Marketing & Outreach:      $___
- Subcontractors:            $___
- Miscellaneous:             $___
- TOTAL COSTS:               $___

PROFITABILITY
- Gross Profit:              $___
- Gross Margin:              ___%
- Net Profit:                $___
- Net Margin:                ___%

MONTH-OVER-MONTH
- Revenue change:            ___% (up/down)
- Cost change:               ___% (up/down)
- Margin change:             ___pp (up/down)
```

### Step 4: Calculate Key Metrics

Run these calculations every time:

1. **Gross Margin** = (Revenue - Direct Costs) / Revenue x 100
   - Target: 70%+
   - Alert: Below 50%

2. **Burn Rate** = Total Monthly Costs
   - Track trend: increasing, stable, or decreasing?

3. **Runway** = Cash on Hand / Monthly Burn Rate
   - If applicable and cash data is available

4. **Revenue per Client** = Total Revenue / Active Clients
   - Track if this is growing (good) or shrinking (bad)

5. **Cost per Project** = Total Variable Costs / Projects Delivered
   - Compare against tier pricing to verify margins

6. **API Cost Ratio** = API Costs / Revenue x 100
   - Target: Under 10%
   - Alert: Over 20%

### Step 5: Check Against Thresholds

Compare current spending against limits in `references/budget-thresholds.md`:

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Gross Margin | >70% | 50-70% | <50% |
| API Cost Ratio | <10% | 10-20% | >20% |
| Monthly Burn | Under budget | 10-20% over | >20% over |
| Single Client Revenue % | <30% | 30-50% | >50% |

### Step 6: Flag Issues and Recommend Actions

If any metric is Yellow or Red:

**Yellow Actions:**
- Note the concern in the report
- Identify the cause
- Suggest optimization (e.g., switch to cheaper model, renegotiate tool pricing)
- Monitor weekly until resolved

**Red Actions:**
- Immediately flag to CEO (Rick)
- Provide specific diagnosis
- Present 2-3 options to fix
- Implement quickest fix while waiting for decision

### Step 7: Track ROI Per Initiative

For each major initiative or campaign:

```
INITIATIVE ROI TRACKER
Initiative: [Name]
Start Date: [Date]
Status: [Active / Completed / Paused]

INVESTMENT TO DATE
- Direct costs: $___
- Time invested: ___ hours (valued at $___/hr)
- Total investment: $___

RETURNS TO DATE
- Revenue generated: $___
- Leads generated: ___
- Clients acquired: ___
- Cost savings: $___

ROI: ___% ((Returns - Investment) / Investment x 100)
Status: [Profitable / Break-even / Not yet profitable]
Projected break-even: [Date or N/A]
```

### Step 8: Save and Schedule

1. Save report to `memory/YYYY-MM-DD.md` with "BUDGET REPORT" header
2. Update any running budget tracking files
3. Schedule next review (monthly minimum, weekly if spending is volatile)
4. Share summary with CEO when requested or when Red flags appear

## Quick Profitability Check

For a fast answer to "are we profitable?":

```
Last 30 days:
Revenue:  $[sum of payments received]
Costs:    $[sum of all expenses]
Profit:   $[revenue - costs]
Verdict:  [Profitable / Break-even / Losing money]
```

## Token Usage Tracking

When tracking API/token costs specifically:

1. Check OpenAI usage page: https://platform.openai.com/usage
2. Check Anthropic usage (console or API)
3. Calculate cost per model used
4. Compare against project revenue to ensure margins hold
5. Recommend model switches if costs are too high:
   - High-cost task on expensive model? Try cheaper model first
   - Repetitive task? Cache results
   - Batch similar requests to reduce overhead

## Reference Files

- `references/cost-categories.md` - All cost categories with examples
- `references/budget-thresholds.md` - Alert levels and spending limits
