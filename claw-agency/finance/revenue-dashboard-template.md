# ClawOps Revenue Dashboard Template

**Format:** Google Sheets (5 tabs)
**Last Updated:** 2026-02-28
**Owner:** CFO (Morgan) / RevOps (Ledger)

---

## Overview

This dashboard tracks the full revenue lifecycle: from pipeline through close, forecasting, expense management, and KPI monitoring. Each tab is described below with column definitions, formulas, and logic for all calculated fields.

---

## Tab 1: Pipeline

Tracks every active opportunity from first contact through close or loss.

### Columns

| Column | Type | Description |
|--------|------|-------------|
| **Lead ID** | Auto-increment | Unique identifier (e.g., CL-001) |
| **Lead Source** | Dropdown | Where the lead originated: Outbound Email, LinkedIn, Referral, Inbound (Website), Cold Call, Partner, Social Media |
| **Company Name** | Text | Prospect company or individual name |
| **Contact Name** | Text | Primary point of contact |
| **Contact Email** | Text | Email address |
| **Deal Value (Setup)** | Currency | One-time setup fee based on tier |
| **Deal Value (MRR)** | Currency | Monthly recurring revenue if closed |
| **Plan Tier** | Dropdown | Direct Client, Agency White-Label, Enterprise, Pilot, Case Study |
| **Stage** | Dropdown | See stage definitions below |
| **Probability (%)** | Percentage | Auto-populated based on stage, manually adjustable |
| **Expected Close Date** | Date | Estimated close date |
| **Assigned Agent** | Dropdown | Team member owning the deal |
| **Days in Stage** | Calculated | How long the deal has been in current stage |
| **Weighted Setup Value** | Calculated | Setup fee weighted by probability |
| **Weighted MRR** | Calculated | MRR weighted by probability |
| **Last Activity Date** | Date | Date of most recent touchpoint |
| **Next Action** | Text | Specific next step |
| **Notes** | Text | Free-form context |

### Stage Definitions and Default Probabilities

| Stage | Default Probability | Definition |
|-------|-------------------|------------|
| Prospect | 10% | Initial contact, no qualifying conversation yet |
| Discovery | 20% | Qualifying call scheduled or completed |
| Demo/Proposal | 40% | Live demo delivered or proposal sent |
| Negotiation | 60% | Actively discussing terms, pricing, or scope |
| Verbal Commit | 80% | Verbal yes, pending contract/payment |
| Closed Won | 100% | Contract signed, payment received or scheduled |
| Closed Lost | 0% | Deal did not close |
| Stalled | 5% | No activity for 14+ days, needs re-engagement |

### Calculated Field Formulas

**Days in Stage:**
```
=IF(Stage="Closed Won" OR Stage="Closed Lost", "", TODAY() - [Stage Change Date])
```

**Weighted Setup Value:**
```
=[Deal Value (Setup)] * [Probability (%)]
```

**Weighted MRR:**
```
=[Deal Value (MRR)] * [Probability (%)]
```

### Conditional Formatting Rules

- Deals with Days in Stage > 14 and Stage not Closed: highlight row yellow (stale deal alert)
- Deals with Expected Close Date < TODAY() and Stage not Closed: highlight row red (overdue)
- Probability >= 80%: green text on Probability cell

### Summary Row (Bottom of Tab)

| Metric | Formula |
|--------|---------|
| Total Pipeline (Setup) | `=SUM(Deal Value Setup) where Stage NOT IN (Closed Won, Closed Lost)` |
| Total Pipeline (MRR) | `=SUM(Deal Value MRR) where Stage NOT IN (Closed Won, Closed Lost)` |
| Weighted Pipeline (Setup) | `=SUM(Weighted Setup Value) where Stage NOT IN (Closed Won, Closed Lost)` |
| Weighted Pipeline (MRR) | `=SUM(Weighted MRR) where Stage NOT IN (Closed Won, Closed Lost)` |
| Active Deals Count | `=COUNTIFS(Stage, NOT "Closed Won", Stage, NOT "Closed Lost")` |
| Average Deal Cycle (days) | `=AVERAGE(Close Date - Created Date) for Closed Won deals` |

---

## Tab 2: Closed Won

Master record of all paying clients. Single source of truth for active revenue.

### Columns

| Column | Type | Description |
|--------|------|-------------|
| **Client ID** | Auto-increment | Unique client identifier (e.g., CW-001) |
| **Client Name** | Text | Company or individual name |
| **Contact Name** | Text | Primary contact |
| **Contact Email** | Text | Email |
| **Plan Tier** | Dropdown | Direct Client, Agency White-Label, Enterprise, Pilot, Case Study |
| **Setup Fee Collected** | Currency | Actual setup fee received |
| **MRR** | Currency | Monthly recurring revenue |
| **Seats (if White-Label)** | Number | Number of active seats (Agency tier only) |
| **Start Date** | Date | Service start date |
| **Contract End Date** | Date | End of current term (blank if month-to-month) |
| **Payment Method** | Dropdown | Stripe, Wire Transfer, ACH, Check, Invoice Net-30 |
| **Payment Frequency** | Dropdown | Monthly, Quarterly (10% discount applied), Annual |
| **Quarterly Discount Applied** | Boolean | YES if paying quarterly (10% off monthly rate) |
| **Effective Monthly Rate** | Calculated | Actual monthly rate after any discounts |
| **Months Active** | Calculated | Tenure in months |
| **Lifetime Revenue** | Calculated | Total revenue collected from this client |
| **Status** | Dropdown | Active, Churned, Paused, Pilot (converting) |
| **Churn Date** | Date | Date client canceled (blank if active) |
| **Churn Reason** | Dropdown | Budget, Competitor, Poor Fit, Feature Gap, Unresponsive, Other |
| **Lead Source** | Text | Original lead source (pulled from Pipeline tab) |
| **Notes** | Text | Account notes |

### Calculated Field Formulas

**Effective Monthly Rate:**
```
=IF(Quarterly Discount Applied = "YES", MRR * 0.90, MRR)
```
For Agency White-Label with quarterly:
```
=IF(Quarterly Discount Applied = "YES", Seats * $100 * 0.90, Seats * $100)
```

**Months Active:**
```
=IF(Status="Active", DATEDIF(Start Date, TODAY(), "M"), DATEDIF(Start Date, Churn Date, "M"))
```

**Lifetime Revenue:**
```
=[Setup Fee Collected] + ([Effective Monthly Rate] * [Months Active])
```

### Summary Row (Bottom of Tab)

| Metric | Formula |
|--------|---------|
| Total Active Clients | `=COUNTIF(Status, "Active")` |
| Total Setup Fees Collected | `=SUM(Setup Fee Collected)` |
| Total MRR (Active Only) | `=SUMIF(Status, "Active", Effective Monthly Rate)` |
| Total Lifetime Revenue | `=SUM(Lifetime Revenue)` |
| Average Client Tenure (months) | `=AVERAGE(Months Active) for Active clients` |
| Churned This Month | `=COUNTIFS(Churn Date, ">="&EOMONTH(TODAY(),-1)+1, Churn Date, "<="&EOMONTH(TODAY(),0))` |

---

## Tab 3: Revenue Forecast

Projects future revenue based on pipeline probability and current MRR base.

### Section A: Pipeline-Based Forecast (Weekly)

| Column | Type | Description |
|--------|------|-------------|
| **Week Starting** | Date | Monday of each forecast week (rolling 12 weeks) |
| **Expected Setup Revenue** | Calculated | Sum of weighted setup values for deals expected to close that week |
| **Expected New MRR** | Calculated | Sum of weighted MRR for deals expected to close that week |
| **Cumulative New MRR** | Calculated | Running total of expected new MRR additions |

**Expected Setup Revenue:**
```
=SUMPRODUCT(
  (Pipeline!Expected Close Date >= [Week Start]) *
  (Pipeline!Expected Close Date < [Week Start + 7]) *
  Pipeline!Weighted Setup Value
)
```

**Expected New MRR:**
```
=SUMPRODUCT(
  (Pipeline!Expected Close Date >= [Week Start]) *
  (Pipeline!Expected Close Date < [Week Start + 7]) *
  Pipeline!Weighted MRR
)
```

**Cumulative New MRR:**
```
=[Previous Row Cumulative New MRR] + [Current Row Expected New MRR]
```

### Section B: Monthly Revenue Forecast

| Column | Type | Description |
|--------|------|-------------|
| **Month** | Date | Forecast month (rolling 6 months) |
| **Base MRR (Existing Clients)** | Calculated | Current MRR from Closed Won tab, active clients |
| **Projected New MRR** | Calculated | Sum of weighted MRR from pipeline deals expected to close in that month |
| **Projected Churn** | Input/Estimate | Estimated MRR lost to churn (default: Base MRR * historical churn rate) |
| **Net New MRR** | Calculated | Projected New MRR minus Projected Churn |
| **Projected Total MRR** | Calculated | Base MRR + Net New MRR |
| **Projected Setup Revenue** | Calculated | Sum of weighted setup fees for that month |
| **Projected Total Monthly Revenue** | Calculated | Projected Total MRR + Projected Setup Revenue |
| **Projected Cumulative Revenue** | Calculated | Running total of Projected Total Monthly Revenue |

**Base MRR (Existing Clients):**
```
=ClosedWon!Total MRR (Active Only)  [for current month]
=[Previous Month Projected Total MRR]  [for future months]
```

**Projected Churn (default estimate):**
```
=[Base MRR] * [Historical Monthly Churn Rate from KPIs tab]
```
Override manually when you have specific intel on at-risk accounts.

**Net New MRR:**
```
=[Projected New MRR] - [Projected Churn]
```

**Projected Total MRR:**
```
=[Base MRR] + [Net New MRR]
```

**Projected Total Monthly Revenue:**
```
=[Projected Total MRR] + [Projected Setup Revenue]
```

### Section C: Scenario Modeling

Three columns for each monthly row:

| Scenario | Pipeline Multiplier | Churn Multiplier | Description |
|----------|-------------------|------------------|-------------|
| Conservative | 0.6x weighted values | 1.5x churn estimate | Deals slip, churn runs hot |
| Base Case | 1.0x weighted values | 1.0x churn estimate | Pipeline closes at weighted probability |
| Optimistic | 1.3x weighted values | 0.5x churn estimate | Strong close rates, retention holds |

---

## Tab 4: Expense Tracking

Tracks all costs, with per-client COGS visibility for margin analysis.

### Section A: Fixed Monthly Costs

| Expense Category | Monthly Cost | Notes |
|-----------------|-------------|-------|
| Fly.io Hosting (base) | Variable | Base infrastructure cost |
| OpenAI API (base/internal) | Variable | Internal usage, not client-attributable |
| Twilio (base number) | Variable | Platform number costs |
| Software Subscriptions | Variable | CRM, email tools, etc. |
| Domain/DNS | Variable | Annual, amortized monthly |

### Section B: Per-Client Variable Costs (COGS)

| Column | Type | Description |
|--------|------|-------------|
| **Client Name** | Text | Linked to Closed Won tab |
| **Plan Tier** | Text | Auto-populated from Closed Won |
| **Twilio Cost** | Currency | Monthly Twilio usage for this client |
| **OpenAI API Cost** | Currency | Monthly API consumption for this client |
| **Fly.io Cost (incremental)** | Currency | Additional hosting cost attributable to this client |
| **Other Variable Costs** | Currency | Any other per-client costs |
| **Total COGS** | Calculated | Sum of all variable costs for this client |
| **Client MRR** | Currency | Pulled from Closed Won tab |
| **Client Gross Margin ($)** | Calculated | Client MRR minus Total COGS |
| **Client Gross Margin (%)** | Calculated | Gross margin as percentage |

**Total COGS:**
```
=[Twilio Cost] + [OpenAI API Cost] + [Fly.io Cost] + [Other Variable Costs]
```

**Client Gross Margin ($):**
```
=[Client MRR] - [Total COGS]
```

**Client Gross Margin (%):**
```
=([Client MRR] - [Total COGS]) / [Client MRR] * 100
```

### Section C: Monthly Expense Summary

| Column | Type | Description |
|--------|------|-------------|
| **Month** | Date | Calendar month |
| **Total Fixed Costs** | Calculated | Sum of Section A for that month |
| **Total Variable Costs (COGS)** | Calculated | Sum of all client COGS for that month |
| **Total Expenses** | Calculated | Fixed + Variable |
| **Total Revenue** | Linked | From Revenue Forecast tab |
| **Net Operating Income** | Calculated | Total Revenue minus Total Expenses |
| **Operating Margin (%)** | Calculated | Net Operating Income / Total Revenue * 100 |

**Net Operating Income:**
```
=[Total Revenue] - [Total Expenses]
```

**Operating Margin (%):**
```
=[Net Operating Income] / [Total Revenue] * 100
```

### COGS Benchmarks (Target Ranges)

| Cost Category | Target Per Client (Direct Tier) | Notes |
|--------------|-------------------------------|-------|
| Twilio | $15-$40/mo | Depends on call volume |
| OpenAI API | $30-$80/mo | Depends on conversation volume |
| Fly.io (incremental) | $10-$25/mo | Per-client compute allocation |
| **Total COGS Target** | **$55-$145/mo** | Targeting <30% of MRR |

---

## Tab 5: KPIs

Central metrics dashboard. All values calculated from the other four tabs.

### Revenue Metrics

| KPI | Formula | Target |
|-----|---------|--------|
| **MRR** | `=ClosedWon!Total MRR (Active Only)` | Track growth month-over-month |
| **ARR** | `=MRR * 12` | Annualized run rate |
| **MRR Growth Rate (%)** | `=(Current Month MRR - Previous Month MRR) / Previous Month MRR * 100` | >15% month-over-month in first year |
| **Net Revenue Retention (%)** | `=(MRR from clients active last month, including expansion - churn) / Last Month MRR * 100` | >100% (expansion > churn) |
| **Total Revenue (Month)** | `=Forecast!Projected Total Monthly Revenue (current month)` | Matches or exceeds forecast |
| **Setup Revenue (Month)** | `=SUM(ClosedWon!Setup Fee Collected) for current month closes` | Tracks new business velocity |

### Sales Metrics

| KPI | Formula | Target |
|-----|---------|--------|
| **Close Rate (%)** | `=COUNTIF(Pipeline!Stage, "Closed Won") / (COUNTIF(Stage, "Closed Won") + COUNTIF(Stage, "Closed Lost")) * 100` | >25% |
| **Average Deal Size (Setup)** | `=AVERAGE(ClosedWon!Setup Fee Collected)` | Track trend |
| **Average Deal Size (MRR)** | `=AVERAGE(ClosedWon!MRR) for Active clients` | Track trend |
| **Average Sales Cycle (days)** | `=AVERAGE(Close Date - Pipeline Created Date) for Closed Won` | <30 days |
| **Pipeline Coverage Ratio** | `=Total Weighted Pipeline MRR / MRR Target for Period` | >3x |
| **Deals in Pipeline** | `=COUNTIFS(Pipeline!Stage, NOT "Closed Won", NOT "Closed Lost")` | Healthy funnel indicator |
| **Conversion by Stage** | `=Deals advancing from Stage N to Stage N+1 / Total deals entering Stage N` | Track bottlenecks |

### Unit Economics

| KPI | Formula | Target |
|-----|---------|--------|
| **CAC (Customer Acquisition Cost)** | `=Total Sales & Marketing Spend (month) / New Clients Closed (month)` | <3 months MRR |
| **LTV (Lifetime Value)** | `=Average MRR * Average Client Lifespan (months)` | >3x CAC |
| **LTV:CAC Ratio** | `=LTV / CAC` | >3:1 |
| **CAC Payback Period (months)** | `=CAC / Average MRR` | <6 months |
| **Gross Margin (%)** | `=(Total MRR - Total COGS) / Total MRR * 100` | >70% |
| **Average COGS per Client** | `=Expenses!Total Variable Costs / Active Client Count` | <$145/mo |

### Retention Metrics

| KPI | Formula | Target |
|-----|---------|--------|
| **Monthly Churn Rate (%)** | `=Clients Churned This Month / Active Clients at Start of Month * 100` | <5% |
| **Revenue Churn Rate (%)** | `=MRR Lost to Churn This Month / MRR at Start of Month * 100` | <3% |
| **Average Client Lifespan (months)** | `=1 / Monthly Churn Rate` | >20 months |
| **Pilot Conversion Rate (%)** | `=Pilots Converted to Paid / Total Pilots Completed * 100` | >60% |

### Monthly Snapshot (Rolling 12 Months)

A row for each month with all KPI values, enabling trend analysis and month-over-month comparison. Each row captures:

- Month, MRR, ARR, MRR Growth %, New Clients, Churned Clients, Churn Rate %, Close Rate %, Average Deal Size, CAC, LTV, LTV:CAC, Gross Margin %, Net Operating Income, Operating Margin %

### Dashboard Alerts (Conditional Formatting)

| Condition | Alert |
|-----------|-------|
| Churn Rate > 5% | Red highlight |
| MRR Growth < 10% | Yellow highlight |
| Gross Margin < 65% | Red highlight |
| LTV:CAC < 3:1 | Yellow highlight |
| Pipeline Coverage < 2x | Red highlight |
| Close Rate < 20% | Yellow highlight |
| Any client Gross Margin < 50% | Orange highlight on Expenses tab |

---

## Setup Instructions

1. Create a new Google Sheet named "ClawOps Revenue Dashboard"
2. Create 5 tabs: Pipeline, Closed Won, Revenue Forecast, Expense Tracking, KPIs
3. Set up columns per the definitions above
4. Apply data validation (dropdowns) for Stage, Plan Tier, Payment Method, Status, Lead Source
5. Add conditional formatting rules per the alerts section
6. Link cross-tab formulas (KPIs pull from all other tabs)
7. Protect formula cells to prevent accidental overwrites
8. Share with team: CFO (edit), RevOps (edit), CEO (view)

## Maintenance Cadence

| Task | Frequency | Owner |
|------|-----------|-------|
| Update Pipeline stages | Daily | Sales/Assigned Agent |
| Log new Closed Won deals | Upon close | Sales + CFO |
| Update expense actuals | Weekly | CFO |
| Review KPIs | Weekly | CFO + CEO |
| Refresh forecast scenarios | Bi-weekly | CFO |
| Full dashboard audit | Monthly | CFO |
