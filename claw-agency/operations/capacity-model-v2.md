# Capacity Planning Model

**Owner:** Harper (COO) | Last updated: 2026-02-21
**Purpose:** Know exactly how many clients we can handle, when we hit limits, and when to hire.

---

## Current Team

| Role | Person | Weekly Capacity | Billable Hours/Week |
|------|--------|----------------|---------------------|
| Founder/Lead Builder | Brand | 50 hrs/week total | 30 hrs billable (20 hrs sales, admin, strategy) |
| COO (Operations) | Harper (AI) | Unlimited ops support | 0 billable (all ops, comms, QA support) |

**Effective build capacity today: 30 billable hours/week.**

---

## Project Sizing Reference

| Project Type | Hours Required | Duration | Revenue |
|-------------|---------------|----------|---------|
| Small (single automation) | 15-25 hrs | 1-2 weeks | $1,500 - $3,000 |
| Medium (multi-step system) | 30-50 hrs | 2-3 weeks | $3,000 - $7,500 |
| Large (full system build) | 60-100 hrs | 3-4 weeks | $7,500 - $15,000 |
| Enterprise | 100-200 hrs | 4-8 weeks | $15,000 - $30,000+ |
| Retainer | 10-20 hrs/mo | Ongoing | $2,000 - $5,000/mo |

---

## Scenario Analysis

### Scenario 1: 1 Concurrent Client

**Situation:** Single active project at a time.

| Metric | Value |
|--------|-------|
| Active projects | 1 |
| Hours allocated to delivery | 20-25 hrs/week |
| Hours for sales and admin | 25-30 hrs/week |
| Contractor needed? | No |
| Monthly revenue potential | $3,000 - $15,000 (project-dependent) |
| Monthly throughput | 1-2 projects completed |
| Stress level | Low |

**Verdict:** Comfortable. Brand has plenty of bandwidth for sales, content, and business development alongside delivery. This is the ramp-up phase. Focus on closing deals and building case studies.

**Risk:** Revenue is lumpy. Gaps between projects mean $0 weeks.

---

### Scenario 2: 3 Concurrent Clients

**Situation:** Three active projects running simultaneously.

| Metric | Value |
|--------|-------|
| Active projects | 3 |
| Hours needed for delivery | 45-60 hrs/week |
| Hours available (Brand alone) | 30 hrs/week billable |
| Gap | 15-30 hrs/week |
| Contractor needed? | YES |
| Contractors required | 1 part-time (15-20 hrs/week) |
| Monthly revenue potential | $9,000 - $30,000 |
| Monthly throughput | 3-4 projects completed |
| Stress level | Medium-High |

**Verdict:** This is the inflection point. Brand cannot handle 3 concurrent builds solo without sacrificing quality or burning out. Bring on 1 contractor before hitting this point.

**Action triggers:**
- When the 3rd project is signed, a contractor should already be onboarded
- Contractor should be vetted and ready BEFORE this point (have a bench of 2-3 pre-vetted contractors)

**Contractor profile needed:**
- Automation/integration specialist (Make, Zapier, n8n, or custom API work)
- Can work independently with clear specs
- Available 15-20 hrs/week
- Rate: $30-50/hr (preserving margin at our pricing)

---

### Scenario 3: 5 Concurrent Clients

**Situation:** Five active projects running simultaneously.

| Metric | Value |
|--------|-------|
| Active projects | 5 |
| Hours needed for delivery | 75-100 hrs/week |
| Hours available (Brand alone) | 20 hrs/week billable (rest goes to management) |
| Gap | 55-80 hrs/week |
| Contractor needed? | YES, multiple |
| Contractors required | 2-3 part-time or 1-2 full-time |
| Monthly revenue potential | $15,000 - $50,000 |
| Monthly throughput | 5-8 projects completed |
| Stress level | High (manageable with the right team) |

**Verdict:** Brand's role shifts from builder to manager and sales. Most delivery is handled by contractors. Harper handles ops coordination, status updates, and QA oversight.

**Action triggers:**
- Brand should be spending 50%+ of time on sales, partnerships, and client relationships
- Need a project management system that scales (Linear, Notion with proper structure)
- Weekly internal standup with all contractors (30 min max)

**New operational needs:**
- Contractor onboarding process (separate doc)
- Code/config review process (Brand reviews all contractor work before client delivery)
- Shared knowledge base (how we build things, tool preferences, coding standards)

---

### Scenario 4: 10 Concurrent Clients

**Situation:** Ten active projects running simultaneously.

| Metric | Value |
|--------|-------|
| Active projects | 10 |
| Hours needed for delivery | 150-200 hrs/week |
| Hours available (Brand) | 10 hrs/week billable (rest is leadership) |
| Gap | 140-190 hrs/week |
| Contractor needed? | YES, full team |
| Contractors/employees required | 4-6 contractors or 2-3 full-time hires |
| Monthly revenue potential | $30,000 - $100,000+ |
| Monthly throughput | 8-15 projects completed |
| Stress level | Very High (requires real infrastructure) |

**Verdict:** This is an agency, not a freelance operation. Requires:

**Team structure at 10 clients:**

| Role | Count | Type | Cost/Month |
|------|-------|------|------------|
| Brand (CEO/Sales) | 1 | Founder | - |
| Harper (COO/Ops) | 1 | AI | - |
| Senior Builder | 1-2 | Full-time contractor | $6,000 - $10,000 each |
| Junior Builder | 2-3 | Part-time contractor | $3,000 - $5,000 each |
| QA/Documentation | 1 | Part-time | $2,000 - $3,000 |

**Total team cost at 10 clients:** $15,000 - $35,000/month
**Revenue at 10 clients:** $30,000 - $100,000/month
**Margin:** 50-65%

**New operational needs at this scale:**
- Formal project management (not just a Notion board)
- Client account managers (or Brand handling top accounts, contractors handling the rest)
- SOPs for contractors (this delivery framework becomes critical)
- Weekly leadership review (Brand + Harper)
- Monthly financial review
- Insurance (E&O, general liability)

---

## Throughput Calculator

**Formula:**
```
Max concurrent projects = Total billable hours per week / Average hours per project per week

Example (Brand solo):
30 hrs/week / 15 hrs/project/week = 2 concurrent projects max

Example (Brand + 1 contractor):
50 hrs/week / 15 hrs/project/week = 3.3 concurrent projects max

Example (Brand + 3 contractors):
90 hrs/week / 15 hrs/project/week = 6 concurrent projects max
```

---

## Revenue Projections (45-Day Target: $100K)

To hit $100K in 45 days, we need to close and deliver approximately:

| Strategy | Projects Needed | Avg. Price | Total |
|----------|----------------|-----------|-------|
| All large projects | 7-8 | $12,500-$15,000 | $100,000 |
| Mix of medium and large | 10-12 | $8,000-$10,000 | $100,000 |
| High volume small + medium | 15-20 | $5,000-$7,000 | $100,000 |
| 2-3 enterprise + retainers | 3-4 | $25,000-$35,000 | $100,000 |

**Most realistic path:** Land 2-3 large/enterprise clients ($15K-$30K each) + 5-8 medium clients ($5K-$10K each). This requires aggressive sales starting now and contractor capacity by Week 2.

---

## Hiring Triggers

| Signal | Action |
|--------|--------|
| 2+ projects signed with overlapping timelines | Start interviewing contractors immediately |
| Brand working 50+ hrs/week on delivery | Contractor should already be onboarded |
| 3+ concurrent active projects | 1 contractor must be in place |
| Pipeline has 5+ qualified leads | Pre-vet 2-3 contractors for fast activation |
| Revenue consistently above $20K/month | Consider first full-time hire |
| Revenue consistently above $50K/month | Hire a senior builder (full-time) |

---

## Contractor Sourcing

**Where to find contractors:**
1. Upwork (filter for automation specialists with 90%+ job success)
2. Twitter/X (automation and no-code community)
3. Discord communities (Make, n8n, Zapier power users)
4. Personal network referrals
5. Contra or Toptal (for higher-end talent)

**Vetting process:**
1. Review portfolio and past automation projects
2. Give a paid test task ($100-200, real-world scenario, 2-4 hours)
3. Evaluate: quality, communication, speed, and documentation
4. If pass: add to bench, ready to activate when needed

**Always maintain a bench of 2-3 pre-vetted contractors** so you can scale up within 48 hours of signing a new client.
