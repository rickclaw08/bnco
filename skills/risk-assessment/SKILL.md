# Risk Assessment

**Version:** 0.1.0
**Owner:** Shield (CRO/Risk Officer)
**Description:** Evaluate risk on business decisions, contracts, financial commitments, and strategic moves. Covers risk identification, severity rating, mitigation recommendations, and dealbreaker flagging.

## Trigger Keywords

- "risk check"
- "what could go wrong"
- "should we do this"
- "risk assessment"
- "risk analysis"
- "evaluate risk"
- "due diligence"
- "red flags"

## Overview

This skill provides a structured framework for evaluating risk before committing to a decision. It identifies what could go wrong, rates how bad it would be, and recommends what to do about it. Use it for contracts, partnerships, financial decisions, strategic pivots, or any situation where the downside matters.

## Workflow

### Step 1: Define the Decision

Clearly state what is being evaluated:

- **What is the decision?** (one sentence)
- **What is the context?** (why are we considering this)
- **What is the timeline?** (how soon must we decide)
- **What is the scale?** (financial commitment, duration, reversibility)
- **Who is involved?** (counterparties, stakeholders)

If the request is vague ("is this a good idea?"), ask clarifying questions before proceeding.

### Step 2: Identify Risks

Systematically scan for risks across these categories:

#### Financial Risks
- [ ] Cash flow impact (upfront costs, ongoing expenses)
- [ ] Revenue dependency (single client, single product)
- [ ] Payment risk (will we get paid? On time?)
- [ ] Currency/market exposure
- [ ] Hidden costs (maintenance, scaling, compliance)
- [ ] Opportunity cost (what else could this money/time do)

#### Legal and Regulatory Risks
- [ ] Contractual obligations and liabilities
- [ ] Regulatory compliance requirements
- [ ] Intellectual property exposure
- [ ] Jurisdictional issues
- [ ] Licensing requirements
- [ ] Litigation potential

#### Operational Risks
- [ ] Capacity to deliver (do we have the team/tools)
- [ ] Dependency on third parties
- [ ] Single points of failure
- [ ] Timeline feasibility
- [ ] Quality control challenges
- [ ] Scope creep potential

#### Reputational Risks
- [ ] Brand alignment (does this fit who we are)
- [ ] Public perception
- [ ] Client/partner relationship impact
- [ ] Precedent setting (will this create expectations)

#### Strategic Risks
- [ ] Alignment with long-term goals
- [ ] Market timing
- [ ] Competitive response
- [ ] Lock-in or path dependency
- [ ] Distraction from core priorities

See `references/common-risks.md` for a comprehensive list organized by decision type.

### Step 3: Rate Each Risk

Use the risk matrix (see `references/risk-matrix.md`):

#### Likelihood Scale
| Rating | Label | Description |
|--------|-------|-------------|
| 1 | Rare | Very unlikely, would require multiple failures |
| 2 | Unlikely | Could happen but not expected |
| 3 | Possible | Reasonable chance, has happened before |
| 4 | Likely | More likely than not |
| 5 | Almost Certain | Expected to happen unless prevented |

#### Severity Scale
| Rating | Label | Description |
|--------|-------|-------------|
| 1 | Negligible | Minor inconvenience, easily absorbed |
| 2 | Minor | Some impact, manageable with effort |
| 3 | Moderate | Significant impact, requires response |
| 4 | Major | Serious damage, hard to recover from |
| 5 | Critical | Existential threat, catastrophic consequences |

#### Risk Score

Risk Score = Likelihood x Severity

| Score Range | Level | Action |
|-------------|-------|--------|
| 1-4 | LOW | Accept, monitor |
| 5-9 | MEDIUM | Mitigate, plan contingency |
| 10-15 | HIGH | Must mitigate before proceeding |
| 16-25 | CRITICAL | Dealbreaker unless fundamentally restructured |

### Step 4: Flag Dealbreakers

Some risks are automatic dealbreakers regardless of score:

**Hard Dealbreakers (do not proceed):**
- Illegal activity or regulatory violation
- Unbounded liability with no cap
- Conflict of interest that cannot be disclosed
- Fraud indicators or dishonest counterparty
- Irreversible commitment with no exit clause

**Soft Dealbreakers (proceed only with explicit approval):**
- Risk score of 16+ on any single item
- Multiple items scoring 10+
- Total exposure exceeds available resources
- Counterparty has poor track record
- Decision contradicts stated strategic goals

When flagging a dealbreaker, state clearly:
1. What the dealbreaker is
2. Why it qualifies as a dealbreaker
3. What would need to change for it to become acceptable

### Step 5: Recommend Mitigations

For each risk rated MEDIUM or higher, provide:

1. **Mitigation strategy** - How to reduce likelihood or severity
2. **Contingency plan** - What to do if it happens anyway
3. **Cost of mitigation** - What does the mitigation itself cost (time, money, complexity)
4. **Residual risk** - What is the risk level after mitigation

See `references/mitigation-playbook.md` for standard mitigation strategies by risk type.

**Common mitigation patterns:**
| Pattern | When to Use |
|---------|-------------|
| Contract clause | Risk can be allocated via agreement |
| Insurance | Financial risk that can be transferred |
| Phased approach | Large commitment, test before scaling |
| Escrow/milestone payments | Payment risk on either side |
| Exit clause | Lock-in risk, add termination rights |
| Diversification | Dependency on single party/resource |
| Monitoring | Risk is acceptable if caught early |
| Avoidance | Risk is not worth the reward |

### Step 6: Overall Assessment

Provide a clear recommendation:

| Recommendation | When |
|----------------|------|
| PROCEED | Low overall risk, benefits clearly outweigh |
| PROCEED WITH CAUTION | Medium risk, mitigations available and feasible |
| PROCEED AFTER CHANGES | High risk items that can be resolved |
| DO NOT PROCEED | Dealbreakers present or risk/reward ratio is poor |
| NEED MORE INFORMATION | Cannot assess without additional data |

### Step 7: Deliver Risk Report

## Output Format

```
## Risk Assessment Report
- Decision: [what is being evaluated]
- Date: [assessment date]
- Assessor: Shield (Risk Officer)
- Overall Recommendation: [PROCEED / CAUTION / CHANGES NEEDED / DO NOT PROCEED / NEED INFO]

## Executive Summary
[2-3 sentence summary of findings and recommendation]

## Risk Register
| # | Category | Risk | Likelihood | Severity | Score | Level |
|---|----------|------|------------|----------|-------|-------|
| 1 | [cat]    | [risk description] | [1-5] | [1-5] | [L*S] | [level] |

## Dealbreakers
- [List any dealbreakers, or "None identified"]

## Key Risks and Mitigations
### Risk #[n]: [name]
- **Description:** [what could go wrong]
- **Score:** [L] x [S] = [score] ([level])
- **Mitigation:** [recommended action]
- **Contingency:** [backup plan]
- **Residual Risk:** [risk after mitigation]

## Recommendation
[Detailed recommendation with reasoning]

## Open Questions
- [Things that need answers before finalizing assessment]
```

## Reference Files

| File | Purpose |
|------|---------|
| `references/risk-matrix.md` | Full risk matrix with scoring guide and visual reference |
| `references/common-risks.md` | Comprehensive list of common risks by decision type |
| `references/mitigation-playbook.md` | Standard mitigation strategies and contingency patterns |

## Notes

- Risk assessment is about informed decisions, not avoiding all risk. The goal is to understand what could go wrong and prepare for it.
- Be honest and direct. Sugarcoating risks helps no one.
- When in doubt, rate higher. It is better to over-prepare than to be caught off guard.
- Revisit assessments when conditions change. A risk rated LOW today might be HIGH tomorrow.
- Not all risks are bad. Some "risks" are actually opportunities in disguise. Note those too.
- If a decision is time-sensitive, provide a quick assessment first, then follow up with the full report.
