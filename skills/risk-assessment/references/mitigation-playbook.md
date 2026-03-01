# Mitigation Playbook

**Version:** 0.1.0
**Last Updated:** 2026-02-21

Standard mitigation strategies and contingency patterns for common risk categories. Use when developing mitigation plans in risk assessments.

---

## Mitigation Strategy Types

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Avoid** | Eliminate the risk by not doing the activity | Risk is too high and reward is too low |
| **Reduce** | Lower the likelihood or severity | Risk is manageable with effort |
| **Transfer** | Shift the risk to another party | Risk can be insured or contracted away |
| **Accept** | Acknowledge and monitor the risk | Risk is low and cost of mitigation exceeds potential loss |
| **Share** | Split the risk with a partner | Risk is mutual and both parties benefit from sharing |

---

## Financial Risk Mitigations

### Payment Risk (Client does not pay)

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Upfront deposit | Require 25-50% before starting work | Reduces exposure to remaining balance |
| Milestone payments | Tie payments to deliverables, collect before delivering next phase | Exposure limited to current phase |
| Credit check | Research client's payment history before engaging | Does not prevent, but informs decision |
| Late payment terms | Include interest and suspension rights in contract | Incentivizes timely payment |
| Escrow | Use escrow service for large engagements | Adds cost and complexity but eliminates payment risk |
| Smaller initial engagement | Start with a small project to test the relationship | Limits exposure until trust is established |

### Cash Flow Risk

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Payment in advance | Bill at start of period, not end | Timing risk for one period |
| Reserve fund | Maintain 3-6 months of operating expenses | Fund may be insufficient for extended downturns |
| Diversified revenue | Do not depend on single client for >30% of revenue | Takes time to build |
| Flexible costs | Keep fixed costs low, use variable/on-demand services | May limit capabilities |

### Hidden Cost Risk

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Total cost analysis | Calculate all costs before committing (licenses, maintenance, scaling) | Unknown unknowns may remain |
| Budget buffer | Add 20-30% contingency to all estimates | May still be insufficient |
| Phased approach | Commit to phase 1 only, evaluate before continuing | Delays full implementation |
| Cost caps | Negotiate maximum costs with vendors | May limit usage or quality |

---

## Legal Risk Mitigations

### Contract Disputes

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Clear scope definition | Detailed, measurable deliverables in writing | Interpretation differences may remain |
| Change order process | Written process for scope changes with pricing | Informal changes may bypass |
| Dispute resolution clause | Mediation before litigation | Adds time before resolution |
| Legal review | Have contracts reviewed by qualified counsel | Cost of review vs. risk |
| Documentation | Keep written records of all decisions and approvals | Relies on discipline |

### IP Ownership Disputes

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Explicit IP assignment | Clear ownership clause in every contract | Must be properly drafted |
| Work-for-hire language | Include where applicable | Not available for all work types |
| Pre-existing IP carve-out | Clearly define what you owned before the engagement | Must be documented before starting |
| IP warranty | Warrant that work is original and non-infringing | Liability still exists |
| Trademark search | Search before adopting names (see compliance-audit skill) | Unregistered marks may not appear |

### Regulatory/Compliance Risk

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Compliance audit | Regular audits (see compliance-audit skill) | Point-in-time assessment |
| Legal counsel | Engage attorney for high-risk areas | Cost, may slow progress |
| Privacy by design | Build compliance in from the start | Regulations may change |
| Documentation | Maintain compliance records as evidence of good faith | Does not prevent violations |
| Training | Ensure team understands requirements | Knowledge may not prevent mistakes |

---

## Operational Risk Mitigations

### Scope Creep

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Detailed scope document | Specific, measurable deliverables with exclusions listed | Interpretation gaps |
| Change order process | All changes in writing with cost/timeline impact | Client may resist formality |
| Regular check-ins | Weekly/biweekly alignment meetings | Does not prevent, but catches early |
| Fixed-price contracts | Price for scope, not for time | May limit flexibility |
| Scope buffer | Include 10-15% contingency in estimates | May not be sufficient |

### Dependency on Third Parties

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Vendor SLAs | Require service level agreements with penalties | SLA may not cover all scenarios |
| Backup vendors | Identify alternative providers | Switching cost and time |
| Reduced dependency | Build internal capability for critical functions | Higher cost, slower initially |
| Monitoring | Actively monitor vendor performance and health | Reactive, not preventive |
| Contractual protections | Source code escrow, data portability clauses | May not be available |

### Single Point of Failure

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Cross-training | Ensure 2+ agents/people can cover each critical function | Backup may be less proficient |
| Documentation | Document all processes, decisions, and institutional knowledge | Docs may be incomplete or outdated |
| Redundancy | Duplicate critical systems and data | Cost of maintaining duplicates |
| Succession planning | Identify who takes over if someone leaves | Transition still has friction |

---

## Reputational Risk Mitigations

### Negative Public Perception

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Quality controls | Review all public-facing content before release | Human error still possible |
| Response plan | Pre-written response templates for common issues | May not cover all scenarios |
| Monitoring | Track mentions and sentiment | Reactive, not preventive |
| Brand guidelines | Clear rules for brand representation | Enforcement requires discipline |
| Transparency | Honest, prompt communication when issues arise | May not satisfy all stakeholders |

---

## Strategic Risk Mitigations

### Market/Timing Risk

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Market research | Validate demand before committing | Research may not predict reality |
| MVP approach | Launch minimum viable product, iterate based on feedback | May miss market window |
| Pilot program | Test with small audience before full launch | Pilot results may not scale |
| Flexible commitments | Avoid long-term lock-in until validated | May limit favorable terms |

### Competitive Risk

| Mitigation | How | Residual Risk |
|------------|-----|---------------|
| Differentiation | Focus on unique value proposition | Competitors may copy |
| Speed | Move fast to establish position | Speed may sacrifice quality |
| Relationships | Build strong client relationships that resist switching | Not immune to better offers |
| Innovation | Continuously improve and evolve | Resource-intensive |

---

## Contingency Plan Template

For each HIGH or CRITICAL risk, prepare a contingency:

```
### Contingency: [Risk Name]

**Trigger:** What event or indicator activates this plan?
**Response:**
1. [Immediate action within first hour]
2. [Short-term action within first day]
3. [Medium-term action within first week]
**Owner:** Who is responsible for executing this plan?
**Resources Needed:** What do we need to respond? (budget, tools, people)
**Communication:** Who needs to be informed and how?
**Recovery Target:** What does "resolved" look like?
```

---

## Quick Reference: Mitigation by Risk Level

| Risk Level | Default Strategy | Additional Actions |
|------------|-----------------|-------------------|
| LOW (1-4) | Accept and monitor | Document, revisit quarterly |
| MEDIUM (5-9) | Reduce | Implement at least one mitigation, create monitoring plan |
| HIGH (10-15) | Reduce + Transfer | Multiple mitigations required, contingency plan mandatory |
| CRITICAL (16-25) | Avoid or Reduce fundamentally | Restructure the decision, or do not proceed |
