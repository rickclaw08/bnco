# Financial Analysis

**Version:** 0.1.0
**Owner:** Morgan (CFO)
**Description:** Run financial projections, pricing analysis, ROI calculations, and cost-benefit analysis for RickClaw ventures.

## Trigger Keywords

- "run numbers"
- "pricing analysis"
- "ROI"
- "financial projection"
- "cost analysis"
- "break-even"
- "unit economics"
- "margin analysis"

## When to Use

Use this skill when the team needs:
- Revenue or cost projections for a new initiative
- Pricing validation or tier comparison
- ROI calculation on a campaign, tool, or hire
- Cost-benefit analysis on a decision
- Break-even timeline for a project
- Unit economics breakdown

## Workflow

### Step 1: Clarify the Ask

Determine which type of analysis is needed:

| Type | Input Needed | Output |
|------|-------------|--------|
| Financial Projection | Time horizon, revenue assumptions, cost inputs | Monthly/quarterly forecast |
| Pricing Analysis | Target market, competitor data, cost basis | Recommended price points |
| ROI Calculation | Investment amount, expected returns, timeline | ROI %, payback period |
| Cost-Benefit Analysis | Options to compare, costs, benefits per option | Ranked recommendation |
| Break-Even Analysis | Fixed costs, variable costs, price per unit | Break-even volume/timeline |

### Step 2: Gather Inputs

For any analysis, collect:

1. **Revenue side:** Current MRR/ARR, growth rate, pipeline deals, average deal size
2. **Cost side:** Fixed costs (hosting, tools, salaries), variable costs (API usage, per-project costs)
3. **Timeline:** How far out to project (30/60/90 days, quarterly, annual)
4. **Assumptions:** Growth rate, churn rate, conversion rate, seasonality

Check these workspace files for current data:
- `memory/` files for recent financial discussions
- Any existing budget or revenue tracking files
- Pipeline tracker for deal-based projections

### Step 3: Build the Projection

#### Revenue Projection Template

```
Month | New Clients | Avg Deal Size | New MRR | Churn | Net MRR | Cumulative
------|-------------|---------------|---------|-------|---------|----------
M1    | X           | $Y            | $Z      | $C    | $N      | $T
M2    | X           | $Y            | $Z      | $C    | $N      | $T
...
```

#### Key Formulas

- **New MRR** = New Clients x Avg Deal Size
- **Churn MRR** = Previous MRR x Churn Rate
- **Net MRR** = Previous MRR + New MRR - Churn MRR
- **ARR** = MRR x 12
- **Gross Margin** = (Revenue - COGS) / Revenue x 100
- **Net Margin** = (Revenue - Total Costs) / Revenue x 100
- **CAC** = Total Sales & Marketing Costs / New Customers
- **LTV** = Avg Revenue Per Customer x Avg Customer Lifetime
- **LTV:CAC Ratio** = LTV / CAC (target: 3:1 or better)

#### Break-Even Formula

- **Break-Even Units** = Fixed Costs / (Price Per Unit - Variable Cost Per Unit)
- **Break-Even Revenue** = Fixed Costs / Gross Margin %
- **Payback Period** = Total Investment / Monthly Net Benefit

### Step 4: Pricing Analysis

When analyzing pricing:

1. **Check current tiers** in `references/pricing-tiers.md`
2. **Calculate cost basis** per tier (what it costs us to deliver)
3. **Compare competitor pricing** (web search if needed)
4. **Calculate margins** per tier
5. **Recommend adjustments** based on:
   - Target margin (aim for 70%+ on services)
   - Market positioning (premium vs. volume)
   - Value delivered vs. price charged

#### Pricing Decision Framework

- **Floor price** = Cost to deliver + 20% buffer
- **Target price** = Floor price / (1 - Target Margin)
- **Ceiling price** = Maximum the market will bear
- **Sweet spot** = Where conversion rate x margin is maximized

### Step 5: ROI Calculation

For any investment decision:

```
Investment: $X (one-time or recurring)
Expected Returns:
  - Direct revenue: $A/month
  - Cost savings: $B/month
  - Productivity gains: $C/month (estimated)
Total Monthly Benefit: $A + $B + $C

ROI = (Total Benefit - Total Cost) / Total Cost x 100
Payback Period = Total Investment / Monthly Net Benefit
```

#### ROI Categories

- **Direct ROI:** Revenue generated minus cost of investment
- **Indirect ROI:** Time saved, errors avoided, reputation built
- **Strategic ROI:** Market position, capability building, future optionality

### Step 6: Present Results

Format output based on audience:

**For CEO (Rick):**
- Lead with the bottom line (profitable? yes/no, by how much)
- Key metrics: margin, ROI, payback period
- One clear recommendation
- Risk factors in bullet points

**For the team:**
- Full breakdown with methodology
- Assumptions clearly stated
- Sensitivity analysis (best/worst/expected case)
- Action items

### Step 7: Track and Update

After analysis:
1. Save key findings to `memory/YYYY-MM-DD.md`
2. Update any relevant budget or projection files
3. Set reminder to revisit projections monthly
4. Flag if actuals deviate >15% from projections

## Sensitivity Analysis Template

For major decisions, run three scenarios:

| Scenario | Growth Rate | Churn | Avg Deal | Result |
|----------|------------|-------|----------|--------|
| Bear (worst) | -50% from base | +50% | -20% | $X |
| Base (expected) | Current trend | Current | Current | $Y |
| Bull (best) | +50% from base | -25% | +20% | $Z |

## Red Flags to Watch

- Gross margin below 50% on any tier
- CAC exceeding 1/3 of LTV
- Payback period longer than 6 months for small investments
- Revenue concentration: any single client > 30% of total
- Month-over-month growth below 10% in early stage

## Reference Files

- `references/pricing-tiers.md` - All 4 pricing tiers with full details
- `references/projection-templates.md` - Ready-to-use projection formats
- `references/cost-structure.md` - Cost categories and current rates
