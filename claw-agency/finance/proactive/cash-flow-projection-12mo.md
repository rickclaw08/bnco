# ClawOps 12-Month Cash Flow Projection

*Base Date: March 2026 (Month 1) — February 2027 (Month 12)*

---

## Assumptions

### Revenue Assumptions by Scenario

| Assumption | Conservative | Moderate | Aggressive |
|-----------|-------------|----------|------------|
| Starting clients | 0 | 0 | 0 |
| New clients/mo (avg) | 1 | 2 | 3-4 |
| Client mix (S/G/E) | 60/30/10% | 40/45/15% | 30/45/25% |
| Monthly churn | 5% | 3% | 2% |
| Avg revenue/client | $900 | $1,400 | $2,000 |
| Setup fee collection | 50% | 70% | 80% |
| Annual prepay rate | 0% | 10% | 25% |

### Cost Assumptions (All Scenarios)

| Expense | Monthly Cost | Notes |
|---------|-------------|-------|
| AI/LLM APIs | 15% of revenue | Scales with clients |
| Cloud/Infra | $200 base + 5% rev | Semi-fixed |
| Payment processing | 3% of revenue | Stripe default |
| Tools/Software | $300/mo | Fixed early stage |
| Marketing | $500-2,000/mo | Scales with scenario |
| Legal/Accounting | $200/mo | Outsourced |
| Insurance | $150/mo | E&O + general |
| Contractor/Labor | $0 → scales | Hire at ~$15K MRR |
| Owner draw | $3,000/mo | Starting Month 3 |

---

## CONSERVATIVE SCENARIO

*Slow, steady growth. 1 new client/month avg. Higher churn. Lower tier mix.*

| Month | New | Lost | Total Clients | MRR | COGS (18%) | Gross Profit | OpEx | Net Cash Flow | Cumulative |
|-------|-----|------|---------------|------|------------|-------------|------|---------------|------------|
| 1 | 1 | 0 | 1 | $497 | $89 | $408 | $1,350 | -$942 | -$942 |
| 2 | 1 | 0 | 2 | $1,394 | $251 | $1,143 | $1,400 | -$257 | -$1,199 |
| 3 | 1 | 0 | 3 | $1,891 | $340 | $1,551 | $4,450 | -$2,899 | -$4,098 |
| 4 | 1 | 0 | 4 | $2,788 | $502 | $2,286 | $4,500 | -$2,214 | -$6,312 |
| 5 | 1 | 0 | 5 | $3,285 | $591 | $2,694 | $4,550 | -$1,856 | -$8,168 |
| 6 | 1 | 1 | 5 | $3,685 | $663 | $3,022 | $4,600 | -$1,578 | -$9,746 |
| 7 | 1 | 0 | 6 | $4,582 | $825 | $3,757 | $4,700 | -$943 | -$10,689 |
| 8 | 1 | 0 | 7 | $5,079 | $914 | $4,165 | $4,800 | -$635 | -$11,324 |
| 9 | 1 | 1 | 7 | $5,479 | $986 | $4,493 | $4,850 | -$357 | -$11,681 |
| 10 | 1 | 0 | 8 | $6,376 | $1,148 | $5,228 | $4,950 | $278 | -$11,403 |
| 11 | 1 | 0 | 9 | $6,873 | $1,237 | $5,636 | $5,050 | $586 | -$10,817 |
| 12 | 2 | 1 | 10 | $8,267 | $1,488 | $6,779 | $5,150 | $1,629 | -$9,188 |

**Conservative Year-End:** ~$8.3K MRR | 10 clients | Breakeven ~Month 10 | Cash needed: ~$12K

---

## MODERATE SCENARIO

*Healthy growth. 2 new clients/month. Better tier mix. Lower churn.*

| Month | New | Lost | Total Clients | MRR | COGS (18%) | Gross Profit | OpEx | Net Cash Flow | Cumulative |
|-------|-----|------|---------------|------|------------|-------------|------|---------------|------------|
| 1 | 2 | 0 | 2 | $1,894 | $341 | $1,553 | $1,500 | $53 | $53 |
| 2 | 2 | 0 | 4 | $4,188 | $754 | $3,434 | $1,650 | $1,784 | $1,837 |
| 3 | 2 | 0 | 6 | $6,882 | $1,239 | $5,643 | $4,800 | $843 | $2,680 |
| 4 | 2 | 0 | 8 | $9,576 | $1,724 | $7,852 | $5,000 | $2,852 | $5,532 |
| 5 | 2 | 1 | 9 | $11,473 | $2,065 | $9,408 | $5,200 | $4,208 | $9,740 |
| 6 | 2 | 0 | 11 | $14,167 | $2,550 | $11,617 | $5,500 | $6,117 | $15,857 |
| 7 | 3 | 0 | 14 | $18,258 | $3,286 | $14,972 | $8,500 | $6,472 | $22,329 |
| 8 | 2 | 1 | 15 | $19,755 | $3,556 | $16,199 | $8,700 | $7,499 | $29,828 |
| 9 | 3 | 0 | 18 | $24,246 | $4,364 | $19,882 | $9,200 | $10,682 | $40,510 |
| 10 | 2 | 1 | 19 | $25,743 | $4,634 | $21,109 | $9,500 | $11,609 | $52,119 |
| 11 | 3 | 1 | 21 | $29,234 | $5,262 | $23,972 | $10,000 | $13,972 | $66,091 |
| 12 | 2 | 1 | 22 | $30,731 | $5,532 | $25,199 | $10,300 | $14,899 | $80,990 |

**Moderate Year-End:** ~$30.7K MRR | 22 clients | Profitable from Month 1 | Cash: ~$81K

---

## AGGRESSIVE SCENARIO

*Fast growth. 3-4 new clients/month. Strong enterprise mix. Low churn. Hiring by Month 4.*

| Month | New | Lost | Total Clients | MRR | COGS (18%) | Gross Profit | OpEx | Net Cash Flow | Cumulative |
|-------|-----|------|---------------|------|------------|-------------|------|---------------|------------|
| 1 | 3 | 0 | 3 | $4,491 | $808 | $3,683 | $2,000 | $1,683 | $1,683 |
| 2 | 3 | 0 | 6 | $9,882 | $1,779 | $8,103 | $2,300 | $5,803 | $7,486 |
| 3 | 4 | 0 | 10 | $17,270 | $3,109 | $14,161 | $5,500 | $8,661 | $16,147 |
| 4 | 4 | 0 | 14 | $25,258 | $4,546 | $20,712 | $12,000 | $8,712 | $24,859 |
| 5 | 4 | 1 | 17 | $32,249 | $5,805 | $26,444 | $13,000 | $13,444 | $38,303 |
| 6 | 4 | 0 | 21 | $41,237 | $7,423 | $33,814 | $14,500 | $19,314 | $57,617 |
| 7 | 4 | 1 | 24 | $47,228 | $8,501 | $38,727 | $16,000 | $22,727 | $80,344 |
| 8 | 5 | 1 | 28 | $56,216 | $10,119 | $46,097 | $18,000 | $28,097 | $108,441 |
| 9 | 4 | 1 | 31 | $62,207 | $11,197 | $51,010 | $19,500 | $31,510 | $139,951 |
| 10 | 5 | 1 | 35 | $72,195 | $12,995 | $59,200 | $22,000 | $37,200 | $177,151 |
| 11 | 4 | 1 | 38 | $78,186 | $14,073 | $64,113 | $23,000 | $41,113 | $218,264 |
| 12 | 5 | 1 | 42 | $88,174 | $15,871 | $72,303 | $25,000 | $47,303 | $265,567 |

**Aggressive Year-End:** ~$88K MRR (~$1M ARR) | 42 clients | Cash: ~$266K

---

## Scenario Comparison Summary

| Metric | Conservative | Moderate | Aggressive |
|--------|-------------|----------|------------|
| End-of-Year MRR | $8,267 | $30,731 | $88,174 |
| End-of-Year ARR | $99,204 | $368,772 | $1,058,088 |
| Total Clients (M12) | 10 | 22 | 42 |
| Total Revenue (Year) | ~$50K | ~$196K | ~$535K |
| Total Expenses (Year) | ~$55K | ~$80K | ~$153K |
| Year-End Cash Position | -$9,188 | +$80,990 | +$265,567 |
| Breakeven Month | 10 | 1 | 1 |
| First Hire Month | N/A | 7 | 4 |
| Startup Capital Needed | $12-15K | $0-2K | $0 |

---

## Key Milestones & Triggers

| Milestone | Conservative | Moderate | Aggressive |
|-----------|-------------|----------|------------|
| First client | Month 1 | Month 1 | Month 1 |
| $5K MRR | Month 9 | Month 3 | Month 2 |
| $10K MRR | Month 12+ | Month 5 | Month 3 |
| $25K MRR | Month 24+ | Month 9 | Month 5 |
| $50K MRR | N/A | Month 14+ | Month 8 |
| First hire | N/A | Month 7 | Month 4 |
| $100K ARR | Month 12 | Month 5 | Month 3 |

---

## Risk Factors

1. **Collection delays** — 30-60 day AR on enterprise invoices
2. **API cost spikes** — LLM pricing volatile; budget 20% buffer
3. **Churn concentration** — Losing 1 enterprise client = losing 5 starter
4. **Seasonal slowdown** — B2B buying slows Dec-Jan
5. **Scope creep** — Custom work eating into margins

## Capital Requirements

| Scenario | Recommended Runway | Source |
|----------|--------------------|--------|
| Conservative | $15-20K | Personal savings / credit line |
| Moderate | $5K safety buffer | Revenue funds growth |
| Aggressive | $10K buffer for hiring ahead of revenue | Revenue + small credit line |
