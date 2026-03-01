# ClawOps KPI Dashboard

## Philosophy

We track what matters, not what's easy to measure. KPIs should drive decisions, not just look pretty in a spreadsheet. If a metric doesn't change behavior, stop tracking it.

---

## KPI Categories

### 1. Revenue & Financial Health
### 2. Client Satisfaction & Retention
### 3. Delivery & Operational Excellence
### 4. Team Productivity & Utilization
### 5. Growth & Pipeline

---

## 1. Revenue & Financial Health

### Monthly Recurring Revenue (MRR)
**What:** Predictable monthly income from retainers and subscriptions  
**Target:** Grow 15-20% month over month in first year  
**Why it matters:** MRR is stability. One-time projects are great, but retainers pay the bills.

**How to track:**
- Notion database: Mark projects as "Retainer" type
- Sum all active retainer values
- Update first day of each month
- Chart trend line

**Green:** MRR growing  
**Yellow:** MRR flat for 2+ months  
**Red:** MRR declining

---

### Monthly Revenue (Total)
**What:** MRR + one-time project revenue  
**Target:** $20k month 1, grow to $50k by month 6, $100k by month 12  
**Why it matters:** Total revenue funds growth and proves business viability.

**How to track:**
- Export Clockify monthly hours by project
- Multiply by rates (or use fixed project values)
- Add one-time project completions
- Log in Notion finance tracker

**Components:**
- Retainer revenue (predictable)
- Project revenue (lumpy)
- Consulting/advisory (bonus)

---

### Gross Profit Margin
**What:** (Revenue - Direct Costs) / Revenue  
**Target:** 60-70% (healthy for service business)  
**Why it matters:** Revenue is vanity, profit is sanity.

**Direct costs include:**
- Contractor payments (if applicable)
- Tool subscriptions (allocated to projects)
- Third-party services (APIs, cloud costs)

**How to track:**
- Monthly reconciliation in spreadsheet
- Track project-level profitability
- Identify unprofitable work patterns

**Green:** >65%  
**Yellow:** 50-65%  
**Red:** <50%

---

### Cash Runway
**What:** Months of operating expenses covered by current cash  
**Target:** Minimum 3 months, comfortable at 6 months  
**Why it matters:** Running out of cash = game over.

**How to track:**
- Monthly operating expenses (tools, contractors, overhead)
- Divided by current cash balance
- Review on first day of month

**Green:** >6 months  
**Yellow:** 3-6 months  
**Red:** <3 months (time to get aggressive on sales)

---

## 2. Client Satisfaction & Retention

### Net Promoter Score (NPS)
**What:** "On a scale of 0-10, how likely are you to recommend us?"  
**Target:** >50 (world-class service)  
**Why it matters:** Happy clients refer, stay longer, and pay more.

**How to track:**
- Quarterly survey via Tally or Google Forms
- Send to all active and recently completed clients
- Calculate: % promoters (9-10) minus % detractors (0-6)

**Survey timing:**
- After project completion
- Quarterly for retainer clients
- Before renewal conversations

**Green:** >50  
**Yellow:** 30-50  
**Red:** <30 or declining trend

---

### Client Retention Rate
**What:** Percentage of clients that renew or continue working with us  
**Target:** >80% annual retention  
**Why it matters:** Keeping clients is way cheaper than finding new ones.

**How to track:**
- Count clients at start of quarter
- Count how many are still active at end
- Retention = (End - New) / Start × 100

**Track separately:**
- Retainer retention (most important)
- Project repeat rate (did they come back?)

**Green:** >80%  
**Yellow:** 60-80%  
**Red:** <60%

---

### Average Client Lifetime Value (LTV)
**What:** Total revenue from a client over entire relationship  
**Target:** $50k+ (aim for relationships, not transactions)  
**Why it matters:** Tells us how much we can spend to acquire a client.

**How to track:**
- Sum all revenue per client in Notion
- Calculate average across all clients
- Segment by client type (startup vs enterprise)

**Goal:** LTV should be 3x+ customer acquisition cost.

---

### Client Health Score
**What:** Composite score indicating risk of churn  
**Target:** 80%+ clients in "green" health  
**Why it matters:** Early warning system for problems.

**Scoring factors (each 0-10):**
- Payment timeliness (10 = always on time)
- Communication responsiveness (10 = replies quickly)
- Satisfaction signals (10 = enthusiastic)
- Project velocity (10 = moving fast)
- Renewal likelihood (10 = definitely renewing)

**How to track:**
- Weekly update in Notion client database
- Red flag clients get immediate attention
- Track trend over time

**Green:** 8-10 (healthy)  
**Yellow:** 5-7 (needs attention)  
**Red:** 0-4 (at risk, escalate)

---

## 3. Delivery & Operational Excellence

### On-Time Delivery Rate
**What:** Percentage of projects/milestones delivered on or before deadline  
**Target:** >90%  
**Why it matters:** Reliability builds trust. Slipping deadlines kills relationships.

**How to track:**
- Mark project due dates in Notion
- Track actual completion dates
- Calculate monthly percentage

**Count as "on time":**
- Delivered early (great!)
- Delivered on deadline day
- Delivered within negotiated extension (if agreed in advance)

**Count as "late":**
- Missed deadline without client agreement
- "Surprised" client with delay

**Green:** >90%  
**Yellow:** 80-90%  
**Red:** <80%

---

### Project Profitability
**What:** Actual hours/costs vs budgeted for each project  
**Target:** 80%+ projects at or under budget  
**Why it matters:** Unprofitable projects drain the business, even if revenue looks good.

**How to track:**
- Estimate hours when scoping project
- Track actual hours in Clockify
- Compare at project completion
- Log in Notion project database

**Analyze:**
- Which types of projects go over?
- Which clients underestimate scope?
- Where do we underestimate effort?

**Green:** Actual <100% of estimate  
**Yellow:** 100-120% of estimate  
**Red:** >120% of estimate (losing money)

---

### Average Project Cycle Time
**What:** Days from project kickoff to delivery  
**Target:** <30 days for standard automation projects  
**Why it matters:** Faster delivery = more projects = more revenue.

**How to track:**
- Start date = kickoff meeting
- End date = client accepts deliverable
- Calculate average monthly
- Trend over time

**Segment by project type:**
- Simple automation: <14 days
- Complex integration: <45 days
- Ongoing retainer: N/A (measure differently)

---

### Rework Rate
**What:** Percentage of delivered work requiring significant changes  
**Target:** <10%  
**Why it matters:** Rework is expensive and frustrates clients.

**What counts as rework:**
- Major functionality changes after "delivery"
- Rebuilding due to misunderstood requirements
- Client unhappy with initial delivery

**What doesn't count:**
- Normal iteration during development
- Minor tweaks and polish
- Agreed expansion of scope

**How to track:**
- Flag projects requiring rework in Notion
- Track rework hours in Clockify
- Calculate monthly percentage

**Green:** <10%  
**Yellow:** 10-20%  
**Red:** >20%

---

## 4. Team Productivity & Utilization

### Billable Utilization Rate
**What:** Percentage of working hours spent on client work  
**Target:** 60-70% (70-80% if we're crushing it)  
**Why it matters:** Too low = burning money. Too high = burning out.

**How to track:**
- Weekly export from Clockify
- Billable hours / Total tracked hours × 100
- Calculate per person and team average

**Time categories:**
- **Billable**: Client project work, meetings, support
- **Non-billable**: Sales, internal ops, learning, admin
- **Untracked**: Break time (don't track every minute)

**Green:** 60-75%  
**Yellow:** 50-60% or 75-85%  
**Red:** <50% (need more work) or >85% (burnout risk)

---

### Revenue Per Team Member
**What:** Monthly revenue / number of team members  
**Target:** $15k-25k per person (depends on rates)  
**Why it matters:** Efficiency metric. Are we profitable per head?

**How to track:**
- Total monthly revenue / FTE count
- Track trend over time
- Compare to industry benchmarks

**Notes:**
- Early months will be lower (ramp time)
- Contractors count as fractional FTE
- Founders count (don't cheat the math)

---

### Team Satisfaction Score
**What:** How happy is the team?  
**Target:** >8/10 average  
**Why it matters:** Unhappy team = high turnover = client disruption.

**How to track:**
- Quick monthly pulse survey (anonymous)
- 3 questions:
  1. How satisfied are you? (0-10)
  2. What's working well?
  3. What would you change?

**Use Tally or Google Forms, 2-minute max.**

**Green:** >8/10  
**Yellow:** 6-8/10  
**Red:** <6/10 (immediate one-on-ones needed)

---

### Professional Development Hours
**What:** Hours spent learning new skills per person per month  
**Target:** 8-12 hours per person  
**Why it matters:** We work in AI/automation. If we're not learning, we're dying.

**What counts:**
- Online courses
- Reading technical docs
- Experimenting with new tools
- Conference attendance
- Writing technical blog posts (learning by teaching)

**How to track:**
- Tag time entries in Clockify as "Learning"
- Review monthly
- Encourage team to hit target

**This is an investment, not overhead.**

---

## 5. Growth & Pipeline

### Sales Pipeline Value
**What:** Total potential revenue from active opportunities  
**Target:** 3x monthly revenue target (healthy coverage)  
**Why it matters:** Pipeline today = revenue next month.

**How to track:**
- Notion database of opportunities
- Stages: Lead → Qualified → Proposal → Negotiation → Won/Lost
- Assign value and probability to each

**Pipeline coverage = Pipeline value / Monthly revenue target**

**Green:** >3x  
**Yellow:** 2-3x  
**Red:** <2x (need more leads NOW)

---

### Win Rate
**What:** Percentage of proposals that turn into projects  
**Target:** >40%  
**Why it matters:** Too low = wrong leads or bad proposals. Too high = underpricing.

**How to track:**
- Count proposals sent
- Count proposals won
- Win rate = Won / Total × 100
- Calculate monthly and rolling 3-month

**Analyze losses:**
- Why did we lose?
- Price? Fit? Timing? Competition?
- Learn and adjust

**Green:** >40%  
**Yellow:** 25-40%  
**Red:** <25%

---

### Lead Response Time
**What:** Time from inbound lead to first response  
**Target:** <2 hours during business hours  
**Why it matters:** Speed kills. Fast response = higher conversion.

**How to track:**
- Log lead timestamp in Notion
- Log first response timestamp
- Calculate average weekly

**Best practice:**
- Auto-reply immediately (set expectations)
- Personal follow-up within 2 hours
- Meeting scheduled within 24 hours

**Green:** <2 hours  
**Yellow:** 2-24 hours  
**Red:** >24 hours

---

### Marketing Qualified Leads (MQLs) per Month
**What:** Number of good-fit leads entering the pipeline  
**Target:** 10+ per month (adjust based on close rate)  
**Why it matters:** No leads = no revenue. Track the top of the funnel.

**What counts as MQL:**
- Fits our ideal client profile
- Has a real problem we can solve
- Has budget and authority
- Interested in working with us

**What doesn't count:**
- Tire kickers
- Students asking for free help
- Wrong service fit

**How to track:**
- Tag leads in Notion when qualified
- Count monthly
- Source tracking (where did they come from?)

---

### Customer Acquisition Cost (CAC)
**What:** Total sales & marketing cost / New customers acquired  
**Target:** <$2k per client (aim for LTV:CAC ratio of 3:1)  
**Why it matters:** Tells us how much we can spend to grow.

**Costs to include:**
- Marketing tools and ads
- Sales team time (if applicable)
- Lead generation activities
- Proposal creation time

**How to track:**
- Monthly total of S&M expenses
- Divide by new customers that month
- Compare to LTV (should be 3x+ CAC)

**Green:** LTV > 3x CAC  
**Yellow:** LTV = 2-3x CAC  
**Red:** LTV < 2x CAC

---

## Dashboard Format

### Notion Dashboard Setup

Create a Notion page: "KPI Dashboard"

**Structure:**

```
📊 KPI Dashboard - [Current Month]

Last updated: [Date & Time]

🟢 Green: On target | 🟡 Yellow: Needs attention | 🔴 Red: Critical

───────────────────────────────────
💰 REVENUE & FINANCIAL HEALTH
───────────────────────────────────
MRR: $X | 🟢/🟡/🔴 | Target: $Y | +Z% vs last month
Total Revenue: $X | 🟢/🟡/🔴 | Target: $Y
Gross Margin: X% | 🟢/🟡/🔴 | Target: 65%
Cash Runway: X months | 🟢/🟡/🔴 | Target: 6 months

───────────────────────────────────
😊 CLIENT SATISFACTION & RETENTION
───────────────────────────────────
NPS: X | 🟢/🟡/🔴 | Target: >50
Retention Rate: X% | 🟢/🟡/🔴 | Target: >80%
Avg Client LTV: $X | Target: $50k+
Clients in Green Health: X of Y (Z%)

───────────────────────────────────
🚀 DELIVERY & OPERATIONS
───────────────────────────────────
On-Time Delivery: X% | 🟢/🟡/🔴 | Target: >90%
Projects On/Under Budget: X of Y (Z%)
Avg Cycle Time: X days | Target: <30 days
Rework Rate: X% | 🟢/🟡/🔴 | Target: <10%

───────────────────────────────────
👥 TEAM PRODUCTIVITY
───────────────────────────────────
Billable Utilization: X% | 🟢/🟡/🔴 | Target: 60-75%
Revenue per Person: $X | Target: $15-25k
Team Satisfaction: X/10 | 🟢/🟡/🔴 | Target: >8
Learning Hours: X hrs/person | Target: 8-12

───────────────────────────────────
📈 GROWTH & PIPELINE
───────────────────────────────────
Pipeline Coverage: Xx | 🟢/🟡/🔴 | Target: 3x+
Win Rate: X% | 🟢/🟡/🔴 | Target: >40%
Lead Response Time: X hours | Target: <2
MQLs This Month: X | Target: 10+
CAC: $X | LTV:CAC Ratio: Xx | Target: >3:1

───────────────────────────────────
📝 NOTES & ACTION ITEMS
───────────────────────────────────
[Quick notes on what's working, what needs attention, actions to take]
```

---

## Weekly Review Process

**Every Friday (30 min):**

1. Update all metrics (pull from Clockify, Notion, spreadsheets)
2. Set red/yellow/green status for each
3. Identify trends (better or worse than last week?)
4. Write 2-3 sentence summary
5. Create action items for yellow/red metrics

**Monthly deep dive (2 hours):**
- Full analysis of all KPIs
- Create charts and trend lines
- Present to team
- Adjust targets if needed
- Update strategy based on data

---

## Data Sources

| Metric | Source | Update Frequency |
|--------|--------|------------------|
| Revenue | Notion + Clockify | Weekly |
| Costs | Manual tracking | Monthly |
| Client satisfaction | Tally surveys | Quarterly |
| Delivery performance | Notion projects | Weekly |
| Time tracking | Clockify | Daily |
| Pipeline | Notion CRM | Daily |
| Team satisfaction | Anonymous survey | Monthly |

---

## Red Flag Protocols

**If any metric hits RED:**

1. **Immediate:** Note in Slack #operations
2. **Same day:** COO investigates root cause
3. **Within 48 hours:** Action plan created
4. **Weekly:** Progress update until back to green

**Don't ignore red flags. They compound.**

---

## KPI Evolution

**Month 1-3: Survival metrics**
- Focus on revenue and cash
- Track everything but don't stress perfection
- Learn what's realistic

**Month 4-6: Optimization**
- Focus on profitability and efficiency
- Refine targets based on actuals
- Drop metrics that don't drive decisions

**Month 7-12: Growth**
- Focus on scalability
- Add team and pipeline metrics
- Prepare for next stage

**The dashboard should evolve as the business matures.**

---

## What NOT to Track

**Vanity metrics (they feel good but don't matter):**
- Total hours worked (only billable % matters)
- Number of proposals sent (only win rate matters)
- Social media followers (unless that's your sales channel)
- Website traffic (unless converting to leads)
- Lines of code written (output ≠ outcomes)

**If a metric doesn't change how you make decisions, stop tracking it.**

---

## Success Definition

**This dashboard is working if:**
- We make different decisions because of it
- Yellow/red metrics get immediate attention
- Team understands what we're optimizing for
- We're improving month over month
- It takes <30 min per week to update

**This dashboard is failing if:**
- No one looks at it
- Metrics never change behavior
- Takes hours to update
- Full of red flags nobody addresses
- Causes stress without clarity

**Fix it or simplify it. Don't suffer through useless reporting.**

---

*Last updated: 2024-02-20*  
*Owner: Harper (COO)*  
*Review frequency: Monthly or when business model changes*
