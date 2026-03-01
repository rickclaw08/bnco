# Unit Economics - ClawOps

**Purpose:** Understand the true profitability of each service tier and identify where to focus energy for maximum ROI.

**Updated:** Feb 20, 2026 (for $100K sprint context)

---

## Quick Reference: Which Tier Makes Money?

| Tier | Revenue | True Cost | Gross Margin | Margin % | LTV:CAC Ratio |
|------|---------|-----------|--------------|----------|---------------|
| Starter (optimized) | $600 | $525 | $75 | 12.5% | 2:1 |
| Automation Sprint | $12,000 | $4,200 | $7,800 | 65% | 8:1 |
| Growth Retainer | $2,000/mo | $1,353/mo | $647/mo | 32% | 12:1 |
| Enterprise Project | $10,000 | $1,834 | $8,166 | 82% | 20:1 |

**TL;DR:** Starter is break-even. Sprint and Enterprise are gold. Growth is solid once optimized.

---

## Full Unit Economics Breakdown

### Assumptions for All Calculations

**Labor costs:**
- Your time (CEO): $150/hour (market rate for AI consultant)
- Junior developer: $50/hour
- VA / ops: $20/hour

**Fixed overhead (allocated per client at 10-client scale):**
- $78/month per client

**Note:** First 3-5 clients will see higher costs (learning curve). These models assume "steady state" after process optimization.

---

## Tier 1: Starter Package

### Pricing

**Old pricing:** $500/month  
**Optimized pricing:** $600/month + $500 onboarding fee  
**Total first month:** $1,100  
**Ongoing monthly:** $600

### Cost Structure (First Month)

| Cost Category | Amount | Notes |
|--------------|--------|-------|
| **AI API costs** | $35 | GPT-4, Claude, embeddings |
| **Platform tools** | $22 | Make.com, Airtable, SendGrid |
| **Onboarding time** | $1,200 | 8 hours at $150/hr (templated) |
| **Overhead allocation** | $78 | Hosting, insurance, accounting, etc. |
| **Stripe fees** | $33 | 2.9% + $0.30 on $1,100 |
| **Total Cost** | **$1,368** | |
| **Revenue** | **$1,100** | |
| **First Month Loss** | **-$268** | |

### Cost Structure (Ongoing Monthly)

| Cost Category | Amount | Notes |
|--------------|--------|-------|
| **AI API costs** | $35 | |
| **Platform tools** | $22 | |
| **Ongoing support** | $300 | 2 hours/month at $150/hr |
| **Overhead allocation** | $78 | |
| **Stripe fees** | $18 | 2.9% + $0.30 on $600 |
| **Total Cost** | **$453** | |
| **Revenue** | **$600** | |
| **Monthly Profit** | **$147** | |
| **Margin %** | **24.5%** | |

### Lifetime Value (LTV) Analysis

**Average lifespan:** 6 months (many upgrade to Growth)

**Total revenue:** $1,100 (month 1) + $600 x 5 = $4,100  
**Total cost:** $1,368 (month 1) + $453 x 5 = $3,633  
**Net profit:** $467  
**LTV:** $467

### Customer Acquisition Cost (CAC)

**Assumes:** 30% close rate, $200 in outreach/marketing per deal

**CAC calculation:**
- Marketing spend per closed deal: $200 / 0.30 = $667
- Sales time (discovery + proposal): 3 hours at $150/hr = $450
- **Total CAC: $1,117**

**LTV:CAC Ratio:** $467 / $1,117 = **0.42:1** (UNDERWATER)

### Verdict: Starter Tier is a Loss Leader

**What this means:**
- You LOSE money on Starter clients if they churn before 12 months
- Only profitable if they upgrade to Growth (60% do, in healthy model)
- Should be used for lead generation and trust building, NOT profit

**Strategic recommendations:**
1. Price at $750-$1,000 (not $600) OR
2. Accept loss, focus on upselling to Growth within 90 days OR
3. Eliminate tier entirely, force clients to Growth minimum

---

## Tier 2: Automation Sprint

### Pricing

**Base price:** $12,000 one-time  
**Typical range:** $8,000-$15,000 depending on department

### Cost Structure

| Cost Category | Amount | Notes |
|--------------|--------|-------|
| **AI API costs** | $250 | 30-day heavy usage |
| **Platform tools** | $150 | Dedicated resources for month |
| **Build time** | $3,000 | 20 hours at $150/hr (optimized from 40 hrs) |
| **Overhead allocation** | $78 | One month allocated |
| **Stripe fees (ACH)** | $5 | Encourage bank transfer |
| **Total Cost** | **$3,483** | |
| **Revenue** | **$12,000** | |
| **Gross Profit** | **$8,517** | |
| **Margin %** | **71%** | |

### Lifetime Value (LTV)

**Sprint-only client (no retainer):**
- Revenue: $12,000
- Cost: $3,483
- Net profit: $8,517
- **LTV: $8,517**

**Sprint + retainer conversion (40% convert to $3K/mo retainer for 12 months):**
- Sprint profit: $8,517
- Retainer profit: $647/mo x 12 = $7,764
- **Total LTV: $16,281**

**Blended LTV (assuming 40% convert):**
- 60% x $8,517 = $5,110
- 40% x $16,281 = $6,512
- **Blended LTV: $11,622**

### Customer Acquisition Cost (CAC)

**Assumes:** 30% close rate, $500 in marketing per deal (higher tier = more effort)

**CAC calculation:**
- Marketing spend: $500 / 0.30 = $1,667
- Sales time (discovery + proposal + negotiation): 5 hours at $150/hr = $750
- **Total CAC: $2,417**

**LTV:CAC Ratio (sprint-only):** $8,517 / $2,417 = **3.5:1**  
**LTV:CAC Ratio (blended with retainer):** $11,622 / $2,417 = **4.8:1**

### Verdict: Sprint is the Sweet Spot

**Why this tier rocks:**
1. High margin (71%)
2. Fast close cycle (2-3 weeks)
3. Predictable delivery (templated)
4. Natural upsell to retainer
5. Strong LTV:CAC (4.8:1)

**This should be your PRIMARY offer for $100K sprint.**

---

## Tier 3: Growth Retainer

### Pricing

**Monthly price:** $2,000-$8,000 (modeling $2,000 base tier)

**Optimized pricing:** $3,000/month (3-month minimum) OR $30,000 annual prepay (17% discount)

### Cost Structure (Optimized, Post-Learning)

| Cost Category | Monthly Amount | Notes |
|--------------|----------------|-------|
| **AI API costs** | $140 | Ongoing automation usage |
| **Platform tools** | $55 | CRM, automation platforms |
| **Labor (ongoing)** | $900 | 6 hours/month (efficient ops) |
| **Labor (onboarding, amortized)** | $250 | $3,000 setup / 12 months |
| **Overhead allocation** | $78 | |
| **Stripe fees (ACH)** | $5 | |
| **Total Cost** | **$1,428** | |
| **Revenue** | **$3,000** | |
| **Monthly Profit** | **$1,572** | |
| **Margin %** | **52%** | |

**Note:** Using $3K pricing (not $2K). At $2K, margin drops to 28% ($2,000 rev - $1,428 cost = $572 profit).

### Lifetime Value (LTV)

**Average lifespan:** 18 months (retainers stick longer than projects)

**Total revenue:** $3,000 x 18 = $54,000  
**Total cost:** $1,428 x 18 = $25,704  
**Net profit:** $28,296  
**LTV:** $28,296

### Customer Acquisition Cost (CAC)

**Scenario A: Direct acquisition (cold outreach)**
- Marketing spend: $500 / 0.25 close rate = $2,000
- Sales time: 6 hours at $150/hr = $900
- **CAC: $2,900**

**Scenario B: Upsell from Starter**
- Marketing spend: $0 (already a client)
- Sales time: 2 hours (upgrade conversation) = $300
- **CAC: $300**

**Blended CAC (50% direct, 50% upsell):** ($2,900 + $300) / 2 = **$1,600**

**LTV:CAC Ratio (direct):** $28,296 / $2,900 = **9.8:1**  
**LTV:CAC Ratio (upsell):** $28,296 / $300 = **94:1** (!!!)  
**LTV:CAC Ratio (blended):** $28,296 / $1,600 = **17.7:1**

### Verdict: Growth Retainer is the Engine

**Why this tier wins:**
1. Recurring revenue (predictable cash flow)
2. Exceptional LTV ($28K per client)
3. Best LTV:CAC ratio (especially via upsell)
4. Stickiness (18-month average, some stay 3+ years)
5. Expands over time (clients add seats, departments)

**This should be your PRIMARY focus after initial Sprint closes.**

---

## Tier 4: Enterprise Project

### Pricing

**Typical range:** $10,000-$100,000  
**Modeling:** $25,000 (mid-range enterprise project)

### Cost Structure

| Cost Category | Amount | Notes |
|--------------|--------|-------|
| **AI API costs** | $800 | 60-90 day heavy usage |
| **Platform tools** | $400 | Custom integrations, monitoring |
| **Build time** | $7,500 | 50 hours at $150/hr (optimized from 80 hrs) |
| **Project management** | $1,500 | 10 hours at $150/hr |
| **Overhead allocation** | $156 | 2 months allocated |
| **Stripe fees (ACH)** | $5 | |
| **Total Cost** | **$10,361** | |
| **Revenue** | **$25,000** | |
| **Gross Profit** | **$14,639** | |
| **Margin %** | **58.5%** | |

### Lifetime Value (LTV)

**Project-only client:**
- Revenue: $25,000
- Cost: $10,361
- Net profit: $14,639
- **LTV: $14,639**

**Project + retainer conversion (50% convert to $6K/mo Professional retainer for 18 months):**
- Project profit: $14,639
- Retainer profit: $3,144/mo x 18 = $56,592 (using $6K/mo tier, 52% margin)
- **Total LTV: $71,231**

**Blended LTV (50% convert):**
- 50% x $14,639 = $7,320
- 50% x $71,231 = $35,616
- **Blended LTV: $42,936**

### Customer Acquisition Cost (CAC)

**Assumes:** 20% close rate (enterprise is harder), $1,000 in marketing per deal

**CAC calculation:**
- Marketing spend: $1,000 / 0.20 = $5,000
- Sales time (multiple calls, proposal, negotiation): 10 hours at $150/hr = $1,500
- **Total CAC: $6,500**

**LTV:CAC Ratio (project-only):** $14,639 / $6,500 = **2.3:1**  
**LTV:CAC Ratio (blended with retainer):** $42,936 / $6,500 = **6.6:1**

### Verdict: Enterprise is High-Reward but High-Effort

**Pros:**
1. Massive profit per deal ($14K-$60K)
2. Impressive case studies (brand building)
3. Strong retainer conversion potential
4. Can support hiring (one deal funds a developer for months)

**Cons:**
1. Long sales cycle (4-8 weeks)
2. High CAC ($6,500)
3. Delivery risk (more complex = more can go wrong)
4. Demands more of YOUR time (can't delegate as easily)

**Strategic use:** Close 2-3 per quarter to fund operations. Don't make it your only play.

---

## Comparative Analysis: Where to Focus?

### Revenue per Hour of Sales Effort

| Tier | Revenue | Sales Hours | Revenue/Hour | Win Rate | Expected Value/Hour |
|------|---------|-------------|--------------|----------|---------------------|
| Starter | $600 | 3 | $200 | 30% | $60 |
| Sprint | $12,000 | 5 | $2,400 | 30% | $720 |
| Growth | $3,000 | 6 | $500 | 25% | $125 |
| Enterprise | $25,000 | 10 | $2,500 | 20% | $500 |

**Winner: Automation Sprint** ($720 expected value per hour of sales effort)

**Insight:** Sprint offers best balance of deal size, close rate, and time investment.

---

### Profit per Hour of Delivery Effort

| Tier | Gross Profit | Delivery Hours | Profit/Hour |
|------|--------------|----------------|-------------|
| Starter | $75 | 10 (first month) | $7.50 |
| Sprint | $8,517 | 20 | $426 |
| Growth | $1,572 | 6 (monthly) | $262 |
| Enterprise | $14,639 | 60 | $244 |

**Winner: Automation Sprint** ($426 profit per hour of work)

**Insight:** Sprint is most efficient use of your time. Enterprise has higher total profit but requires 3x the hours.

---

### Payback Period (How fast do you recover CAC?)

| Tier | CAC | Monthly Profit | Months to Payback |
|------|-----|----------------|-------------------|
| Starter | $1,117 | $147 | 7.6 months |
| Sprint | $2,417 | $8,517 (one-time) | Immediate |
| Growth | $1,600 | $1,572 | 1 month |
| Enterprise | $6,500 | $14,639 (one-time) | Immediate |

**Winners: Sprint and Enterprise** (immediate payback)

**Insight:** One-time projects recover CAC instantly. Retainers take 1-8 months but keep paying forever.

---

## Strategic Focus: The $100K Sprint Plan

### Optimal Deal Mix for Maximum Revenue + Margin

**Goal:** $100K in 90 days, maximize margin and minimize burnout

**Recommended mix:**

| Tier | # of Deals | Revenue per Deal | Total Revenue | Total Profit | Delivery Hours |
|------|------------|------------------|---------------|--------------|----------------|
| Sprint | 6 | $12,000 | $72,000 | $51,102 | 120 hours |
| Growth (via upsell) | 3 | $6,000 (prepay) | $18,000 | $10,716 | 18 hours |
| Enterprise | 1 | $25,000 | $25,000 | $14,639 | 60 hours |
| Starter | 0 | - | $0 | $0 | 0 hours |
| **Total** | **10 deals** | - | **$115,000** | **$76,457** | **198 hours** |

**Why this mix:**
1. **Sprint-heavy** (6 deals) = fast close, high margin, repeatable
2. **Growth via Sprint upsell** (3 deals) = easy conversion, recurring revenue base
3. **One Enterprise anchor** = credibility, case study, big profit bump
4. **Zero Starter** = don't waste time on low-margin deals

**Delivery hours breakdown:**
- 198 hours over 90 days = 2.2 hours per day
- Actually manageable (leaves time for sales)
- With part-time dev help (week 6+), YOU only need 1 hour/day on delivery

**Margin:** 66% blended ($76,457 profit / $115,000 revenue)

---

## Alternative Mix: Volume Play (More Deals, Lower Margin)

| Tier | # of Deals | Revenue per Deal | Total Revenue | Total Profit | Delivery Hours |
|------|------------|------------------|---------------|--------------|----------------|
| Sprint | 4 | $12,000 | $48,000 | $34,068 | 80 hours |
| Growth (direct) | 10 | $6,000 (prepay) | $60,000 | $35,720 | 60 hours |
| Starter | 0 | - | $0 | $0 | 0 hours |
| **Total** | **14 deals** | - | **$108,000** | **$69,788** | **140 hours** |

**Why consider this:**
1. More deals = more clients = better LTV over time
2. Growth retainers = recurring revenue (compounds monthly)
3. Less delivery hours (140 vs 198)

**Tradeoff:**
- Lower immediate profit ($69K vs $76K)
- Higher ongoing revenue (10 retainers = $30K/mo recurring)
- More sales effort needed (14 deals vs 10)

---

## LTV:CAC Comparison (Which Tier Scales Best?)

| Tier | LTV | CAC | LTV:CAC Ratio | Verdict |
|------|-----|-----|---------------|---------|
| Starter (standalone) | $467 | $1,117 | 0.42:1 | UNSUSTAINABLE |
| Starter (with upsell) | $14,648 | $1,117 | 13:1 | GOOD (if 60% upgrade) |
| Sprint (standalone) | $8,517 | $2,417 | 3.5:1 | HEALTHY |
| Sprint (with retainer conversion) | $11,622 | $2,417 | 4.8:1 | EXCELLENT |
| Growth (direct acquisition) | $28,296 | $2,900 | 9.8:1 | EXCELLENT |
| Growth (upsell from Starter) | $28,296 | $300 | 94:1 | INCREDIBLE |
| Enterprise (standalone) | $14,639 | $6,500 | 2.3:1 | OK |
| Enterprise (with retainer conversion) | $42,936 | $6,500 | 6.6:1 | GREAT |

**Key insight:** Upsell paths have 5-10x better LTV:CAC than direct acquisition.

**Strategic implication:** Use Starter and Sprint as entry points to Growth retainers. That's where the real money lives.

---

## Break-Even Analysis: When Does ClawOps Become Profitable?

### Fixed Monthly Overhead (Business-Wide)

| Expense | Monthly Cost |
|---------|--------------|
| Tools (hosting, SaaS, APIs) | $300 |
| Insurance | $100 |
| Accounting | $50 |
| Marketing | $500 |
| Your salary (survival minimum) | $3,000 |
| **Total** | **$3,950/month** |

**To break even, need:**
- 2 Growth retainers ($3K each = $6K/mo) OR
- 5 Sprint deals per month ($12K each = $60K, covers 15 months overhead) OR
- 1 Enterprise per month ($25K covers 6 months overhead)

**Realistic break-even timeline:**
- Month 1: $0 revenue, -$3,950 cumulative
- Month 2: $3,000 revenue (1 Starter, 1 Growth), -$4,900 cumulative
- Month 3: $15,000 revenue (1 Sprint, 1 Growth), +$7,100 cumulative
- **Break-even: Month 3-4** (with focused Sprint sales)

---

## Profitability Roadmap: 12-Month Targets

### Month 1-3: Survival (Break Even)

**Target:**
- 6 Sprint deals ($72K)
- 3 Growth retainers ($18K MRR by month 3)
- **Total: $90K revenue, $60K profit**

**Focus:** Close deals fast, prove delivery, get testimonials

---

### Month 4-6: Scaling (Hire First Team Member)

**Target:**
- 6 more Sprint deals ($72K)
- 5 more Growth retainers ($33K MRR by month 6)
- 1 Enterprise ($25K)
- **Total: $169K revenue, $110K profit**

**Focus:** Systematize delivery, hire part-time dev, reduce your delivery hours

---

### Month 7-9: Optimization (Raise Prices, Kill Low-Margin Tiers)

**Target:**
- 4 Sprint deals at NEW $15K price ($60K)
- 8 Growth retainers at NEW $4K/mo price ($96K MRR)
- 2 Enterprise ($50K)
- **Total: $206K revenue, $144K profit**

**Focus:** Premium positioning, say no to cheap deals, improve margins

---

### Month 10-12: Dominance (Recurring Revenue Machine)

**Target:**
- 3 Sprint deals ($45K)
- 15 Growth retainers at $4K/mo ($180K MRR)
- 2 Enterprise ($50K)
- **Total: $275K revenue, $192K profit**

**Focus:** Retainer growth, referral engine, productize delivery

**Year 1 total:** $740K revenue, 65% margin, 30+ active clients

---

## Final Recommendations: Where to Focus for $100K Sprint

### 1. Lead with Automation Sprint

**Why:**
- Fastest close (2-3 weeks)
- Best margin (71%)
- Repeatable delivery (templated)
- Natural upsell to Growth retainer

**Sales script focus:** "30-day transformation, one department, guaranteed results"

### 2. Upsell Every Sprint to Growth Retainer

**Why:**
- LTV jumps from $8.5K to $16K+ per client
- Creates recurring revenue base
- Retainers have 18-month lifespan (vs Sprint is one-and-done)

**Timing:** Offer retainer at end of Sprint (during handoff call)

### 3. Close 1-2 Enterprise Deals for Credibility

**Why:**
- Big profit boost ($14K-$60K per deal)
- Impressive case studies (helps close future deals)
- Funds hiring and scaling

**When:** Pursue in parallel to Sprint deals, but don't wait for them to close

### 4. AVOID Starter Tier During Sprint

**Why:**
- Underwater economics (lose money unless they upgrade)
- Low deal value ($600 vs $12K Sprint)
- Distracts from high-value deals

**Exception:** Only accept Starter from inbound leads (no CAC) who commit to upgrade in 90 days

### 5. Hire Help by Week 6-8

**Why:**
- Can't deliver 10+ deals solo
- Part-time dev ($2K/mo) frees you for sales
- Hiring early = more deals closed

**Math:** One extra Sprint deal ($8.5K profit) pays for 4 months of dev help

---

## The Bottom Line

**To hit $100K in 90 days:**

Focus 80% of sales effort on **Automation Sprint** ($12K). Close 6-8 of these.

Upsell 40-50% to **Growth Retainer** ($3K/mo). Lock in recurring revenue.

Close 1-2 **Enterprise** deals ($25K+) for big profit bumps.

Ignore **Starter** tier unless they're hot inbound leads.

**This mix gets you to $100K+, 65%+ margin, and sets up $500K+ year 1.**

---

**Document Owner:** Morgan (CFO)  
**Created:** Feb 20, 2026  
**Next Review:** After first 10 deals (validate unit economics with real data)