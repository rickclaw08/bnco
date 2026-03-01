# Risk Matrix

**Version:** 0.1.0
**Last Updated:** 2026-02-21

Visual reference for the risk scoring system used in risk assessments.

---

## Risk Score Matrix

```
                        SEVERITY
                 1        2        3        4        5
              Negligible Minor  Moderate  Major   Critical
            +--------+--------+--------+--------+--------+
  5 Almost  |   5    |   10   |   15   |   20   |   25   |
    Certain |  MED   |  HIGH  |  HIGH  |  CRIT  |  CRIT  |
            +--------+--------+--------+--------+--------+
L 4 Likely  |   4    |   8    |   12   |   16   |   20   |
I           |  LOW   |  MED   |  HIGH  |  CRIT  |  CRIT  |
K           +--------+--------+--------+--------+--------+
E 3 Possible|   3    |   6    |   9    |   12   |   15   |
L           |  LOW   |  MED   |  MED   |  HIGH  |  HIGH  |
I           +--------+--------+--------+--------+--------+
H 2 Unlikely|   2    |   4    |   6    |   8    |   10   |
O           |  LOW   |  LOW   |  MED   |  MED   |  HIGH  |
O           +--------+--------+--------+--------+--------+
D 1 Rare    |   1    |   2    |   3    |   4    |   5    |
            |  LOW   |  LOW   |  LOW   |  LOW   |  MED   |
            +--------+--------+--------+--------+--------+
```

---

## Score Ranges and Actions

| Score | Level | Color | Required Action |
|-------|-------|-------|-----------------|
| 1-4 | LOW | Green | Accept and monitor. Document the risk but no immediate action needed. |
| 5-9 | MEDIUM | Yellow | Mitigate. Create a plan to reduce likelihood or severity. Monitor actively. |
| 10-15 | HIGH | Orange | Must mitigate before proceeding. Requires explicit approval to accept. |
| 16-25 | CRITICAL | Red | Dealbreaker unless fundamentally restructured. Do not proceed without resolution. |

---

## Likelihood Scale (Detailed)

### 1 - Rare
- Has never happened before in this context
- Would require multiple simultaneous failures
- Probability: less than 5%
- Example: "The payment processor, backup processor, AND manual payment all fail simultaneously"

### 2 - Unlikely
- Has happened before but is not common
- Requires specific conditions to occur
- Probability: 5-20%
- Example: "The client disputes an invoice after signing off on the deliverables"

### 3 - Possible
- Has happened before and could happen again
- Conditions for occurrence are not unusual
- Probability: 20-50%
- Example: "The project scope expands beyond the original estimate"

### 4 - Likely
- Happens regularly in similar situations
- More likely than not to occur
- Probability: 50-80%
- Example: "The project timeline slips by at least 2 weeks"

### 5 - Almost Certain
- Expected to happen unless actively prevented
- Historical precedent is strong
- Probability: greater than 80%
- Example: "The client will request at least one round of revisions beyond the agreed scope"

---

## Severity Scale (Detailed)

### 1 - Negligible
- Minor inconvenience
- Easily absorbed without impact on operations
- Financial impact: less than $500
- Example: "We need to redo a small section of a document"

### 2 - Minor
- Some impact on schedule or budget
- Manageable with reasonable effort
- Financial impact: $500 - $5,000
- Example: "We need an extra week to complete the project"

### 3 - Moderate
- Significant impact on the project or relationship
- Requires meaningful resources to address
- Financial impact: $5,000 - $25,000
- Example: "We need to redo a major deliverable, causing a month delay"

### 4 - Major
- Serious damage to finances, reputation, or operations
- Recovery is difficult and expensive
- Financial impact: $25,000 - $100,000
- Example: "Client terminates the contract and demands a refund"

### 5 - Critical
- Existential threat to the business or a major component
- Recovery may not be possible
- Financial impact: greater than $100,000 or immeasurable
- Example: "Lawsuit, regulatory fine, or loss of a key client that represents 50%+ of revenue"

---

## How to Use This Matrix

1. **Identify the risk** - What could go wrong?
2. **Rate likelihood** (1-5) - How likely is it to happen?
3. **Rate severity** (1-5) - How bad would it be if it happened?
4. **Calculate score** - Likelihood x Severity
5. **Look up the level** - LOW / MEDIUM / HIGH / CRITICAL
6. **Take the prescribed action** - See the action table above

### Tips for Accurate Rating

- **Use evidence over intuition.** Has this happened before? To whom? How often?
- **Consider the worst reasonable case**, not the absolute worst case
- **Rate before thinking about mitigations.** Score the raw risk first, then assess what mitigations change.
- **When in doubt, rate higher.** It is better to over-prepare than to be caught off guard.
- **Be consistent.** Use the same scale across all assessments so they are comparable.

### Adjusting for Context

The financial thresholds above are examples. Adjust based on the business:

| Business Size | Negligible | Minor | Moderate | Major | Critical |
|--------------|------------|-------|----------|-------|----------|
| Solo/Freelancer | <$100 | $100-$1K | $1K-$5K | $5K-$25K | >$25K |
| Small Business | <$500 | $500-$5K | $5K-$25K | $25K-$100K | >$100K |
| Mid-size | <$5K | $5K-$25K | $25K-$100K | $100K-$500K | >$500K |
| Enterprise | <$50K | $50K-$250K | $250K-$1M | $1M-$10M | >$10M |
