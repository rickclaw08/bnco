# MRR Growth Model - Post Market Pivot
**Date:** February 24, 2026
**Author:** Morgan (CFO)

---

## Overview

This model projects Monthly Recurring Revenue (MRR) growth over 6 months following the market pivot. The new service structure creates two distinct recurring revenue streams that didn't exist under the old model:

1. **AI Receptionist** - $300-$500/mo per client (high volume, low touch)
2. **Automation-as-a-Service (AaaS)** - $2,000-$5,000/mo per client (lower volume, higher touch)

---

## Scenario: Moderate Execution (Base Case)

### Input Assumptions

| Variable | Value | Rationale |
|----------|-------|-----------|
| AI Receptionist avg price | $400/mo | Mid-tier; avoid thin $300/mo margin |
| AaaS avg price | $3,000/mo | Mix of $2K base and $3.5K professional |
| AI Recep. monthly churn | 5% | Service businesses somewhat sticky |
| AaaS monthly churn | 3% | Higher value, more integrated, stickier |
| AI Recep. new clients/mo (M1-3) | 2/mo | Ramp-up phase |
| AI Recep. new clients/mo (M4-6) | 3-4/mo | Productized, referrals kicking in |
| AaaS new clients/mo | 1/mo (M1-3), 2/mo (M4-6) | Via Sprint/Agent upsell |

### Month-by-Month Detail

#### Month 1 (March 2026)
| Metric | AI Receptionist | AaaS | Total |
|--------|----------------|------|-------|
| Starting clients | 0 | 0 | 0 |
| New clients | 1 | 0 | 1 |
| Churned clients | 0 | 0 | 0 |
| Ending clients | 1 | 0 | 1 |
| **MRR** | **$400** | **$0** | **$400** |

*Note: Month 1 is light. Pipeline still building. First AI Receptionist likely comes from an audit conversion.*

---

#### Month 2 (April 2026)
| Metric | AI Receptionist | AaaS | Total |
|--------|----------------|------|-------|
| Starting clients | 1 | 0 | 1 |
| New clients | 2 | 1 | 3 |
| Churned clients | 0 | 0 | 0 |
| Ending clients | 3 | 1 | 4 |
| **MRR** | **$1,200** | **$3,000** | **$4,200** |

*First AaaS client likely converts from a Revenue Ops Sprint completed in Month 1-2.*

---

#### Month 3 (May 2026)
| Metric | AI Receptionist | AaaS | Total |
|--------|----------------|------|-------|
| Starting clients | 3 | 1 | 4 |
| New clients | 2 | 1 | 3 |
| Churned clients | 0 (5% of 3 = 0.15, rounds to 0) | 0 | 0 |
| Ending clients | 5 | 2 | 7 |
| **MRR** | **$2,000** | **$6,000** | **$8,000** |

*Pipeline maturing. First referrals from AI Receptionist clients expected late month 3.*

---

#### Month 4 (June 2026)
| Metric | AI Receptionist | AaaS | Total |
|--------|----------------|------|-------|
| Starting clients | 5 | 2 | 7 |
| New clients | 3 | 1 | 4 |
| Churned clients | 0 (5% of 5 = 0.25, rounds to 0) | 0 | 0 |
| Ending clients | 8 | 3 | 11 |
| **MRR** | **$3,200** | **$9,000** | **$12,200** |

*Referral engine starting. At least 1 of the 3 new AI Receptionist clients comes via referral.*

---

#### Month 5 (July 2026)
| Metric | AI Receptionist | AaaS | Total |
|--------|----------------|------|-------|
| Starting clients | 8 | 3 | 11 |
| New clients | 3 | 2 | 5 |
| Churned clients | 1 (5% of 8 = 0.4, round to 0-1) | 0 | 1 |
| Ending clients | 10 | 5 | 15 |
| **MRR** | **$4,000** | **$15,000** | **$19,000** |

*Two new AaaS clients - one from AI Agent Development upsell, one from Sprint.*

---

#### Month 6 (August 2026)
| Metric | AI Receptionist | AaaS | Total |
|--------|----------------|------|-------|
| Starting clients | 10 | 5 | 15 |
| New clients | 4 | 2 | 6 |
| Churned clients | 1 (5% of 10 = 0.5, round to 1) | 0 (3% of 5 = 0.15) | 1 |
| Ending clients | 13 | 7 | 20 |
| **MRR** | **$5,200** | **$21,000** | **$26,200** |

---

### MRR Summary Table

| Month | AI Recep. MRR | AaaS MRR | Total MRR | MoM Growth | Annualized |
|-------|-------------|---------|-----------|------------|------------|
| 1 | $400 | $0 | $400 | - | $4,800 |
| 2 | $1,200 | $3,000 | $4,200 | +950% | $50,400 |
| 3 | $2,000 | $6,000 | $8,000 | +90% | $96,000 |
| 4 | $3,200 | $9,000 | $12,200 | +53% | $146,400 |
| 5 | $4,000 | $15,000 | $19,000 | +56% | $228,000 |
| 6 | $5,200 | $21,000 | $26,200 | +38% | $314,400 |

### 6-Month Cumulative Recurring Revenue

| Month | Monthly MRR Earned | Cumulative from Recurring |
|-------|-------------------|--------------------------|
| 1 | $400 | $400 |
| 2 | $4,200 | $4,600 |
| 3 | $8,000 | $12,600 |
| 4 | $12,200 | $24,800 |
| 5 | $19,000 | $43,800 |
| 6 | $26,200 | $70,000 |

**Total recurring revenue over 6 months: $70,000**

This is revenue that literally didn't exist in the old model. The old "Growth Retainer" at $2K/mo was positioned as dev hours, not a managed service. The new structure (AI Receptionist + AaaS) is outcome-based and stickier.

---

## Scenario: Conservative Execution

### Adjustments
- AI Receptionist: 1/mo for first 4 months, 2/mo for months 5-6
- AaaS: 1 every other month
- Churn: 8% AI Receptionist, 5% AaaS (higher than base case)

| Month | AI Recep. MRR | AaaS MRR | Total MRR |
|-------|-------------|---------|-----------|
| 1 | $400 | $0 | $400 |
| 2 | $800 | $0 | $800 |
| 3 | $1,100 | $3,000 | $4,100 |
| 4 | $1,400 | $2,850 | $4,250 |
| 5 | $2,100 | $5,700 | $7,800 |
| 6 | $2,700 | $8,400 | $11,100 |

**6-Month Cumulative (Conservative): $28,450**

---

## Scenario: Aggressive Execution

### Adjustments
- AI Receptionist: 3/mo from month 1 (strong vertical targeting + partnerships)
- AaaS: 1/mo from month 1, 3/mo by month 5
- Churn: 3% AI Receptionist, 2% AaaS (excellent delivery, strong ROI)

| Month | AI Recep. MRR | AaaS MRR | Total MRR |
|-------|-------------|---------|-----------|
| 1 | $1,200 | $3,000 | $4,200 |
| 2 | $2,300 | $6,000 | $8,300 |
| 3 | $3,400 | $8,800 | $12,200 |
| 4 | $5,300 | $11,600 | $16,900 |
| 5 | $7,700 | $17,000 | $24,700 |
| 6 | $10,500 | $22,700 | $33,200 |

**6-Month Cumulative (Aggressive): $99,500**

---

## Revenue Mix: One-Time vs. Recurring

### Moderate Scenario - 6 Month Total Revenue

| Revenue Type | Amount | % of Total |
|-------------|--------|------------|
| AI Readiness Audits | $6,000 | 4% |
| AI Receptionist (setup fees) | $36,000 | 23% |
| Revenue Ops Sprints | $30,000 | 20% |
| AI Agent Development | $15,000 | 10% |
| **One-time subtotal** | **$87,000** | **56%** |
| AI Receptionist (monthly) | $16,200 | 10% |
| AaaS Retainers | $54,000 | 35% |
| **Recurring subtotal** | **$70,200** | **44%** |
| **Grand Total** | **$157,200** | **100%** |

**Key insight:** By month 6, 44% of total revenue is recurring. Under the old model, recurring was ~15% of revenue. This is a fundamentally healthier business.

---

## MRR Milestones

| Milestone | Moderate | Conservative | Aggressive |
|-----------|----------|-------------|------------|
| $1K MRR | Month 2 | Month 2 | Month 1 |
| $5K MRR | Month 3 | Month 4 | Month 2 |
| $10K MRR | Month 4 | Month 6 | Month 3 |
| $20K MRR | Month 5 | Not in 6 mo | Month 5 |
| $25K MRR | Month 6 | Not in 6 mo | Month 5 |
| $30K MRR | Not in 6 mo | Not in 6 mo | Month 6 |

---

## What MRR Means for the Business

### Cash Flow Stability
At $26,200 MRR (Month 6 Moderate):
- **Covers all operating expenses** ($4,550/mo at scale) with $21,650 surplus
- **Funds 1-2 full-time hires** without needing new project revenue
- **Reduces pressure on sales** - you have a $26K/mo floor to stand on

### Valuation Impact
SaaS/service businesses with recurring revenue trade at 3-8x ARR.
- At $314K ARR (Month 6): business could be valued at **$940K-$2.5M**
- Under old project model with $145K annual: valued at **$145K-$435K** (1-3x revenue)
- Recurring revenue literally 3-5x the business valuation

### Compounding Effect
If MRR growth continues at ~35% MoM (decelerating from 90% early):
- Month 9 MRR: ~$45K ($540K ARR)
- Month 12 MRR: ~$75K ($900K ARR)
- Month 18 MRR: ~$150K ($1.8M ARR)

This is why the pivot matters. Projects are linear. Recurring revenue is exponential.

---

*Document Owner: Morgan (CFO)*
*Created: February 24, 2026*
