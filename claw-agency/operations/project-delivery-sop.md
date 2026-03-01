# Project Delivery SOP

> **Standard Operating Procedure: Kickoff to Handoff**
> **Owner:** ClawOps Operations
> **Last Updated:** 2026-02-23
> **Applies to:** All client project engagements

---

## Overview

This SOP defines how ClawOps delivers projects from kickoff through handoff and into post-delivery support. Every phase has defined activities, quality gates, and SLAs. No phase is skipped. No deliverable ships without passing its quality gate.

Inspired by Apple's stage-gate product development, Amazon's single-threaded ownership, and Google's SRE error-budget model.

---

## Delivery Phases at a Glance

| Phase | Duration (typical) | Key Output |
|-------|-------------------|------------|
| 1. Discovery | 2-5 business days | Discovery brief, technical assessment, validated requirements |
| 2. Build | 5-15 business days (varies by scope) | Working deliverable, internal QA passed |
| 3. Testing | 2-3 business days | Tested deliverable in client environment |
| 4. Review and Revision | 3-5 business days | Client-approved deliverable |
| 5. Handoff | 1-2 business days | Documentation, training, deployed solution |
| 6. Post-Delivery Support | 14 calendar days (standard) | Bug fixes, questions answered, stabilization |

---

## Phase 1: Discovery (Days 1-5)

### Purpose

Validate assumptions, understand the client's environment deeply, and confirm that the project scope is achievable as defined.

### Activities

- [ ] Review completed intake questionnaire and all provided documentation
- [ ] Conduct discovery session(s) with client (1-2 calls, 30-60 min each)
- [ ] Map current workflows, data flows, and pain points
- [ ] Identify technical dependencies, constraints, and risks
- [ ] Document integration requirements (APIs, platforms, data sources)
- [ ] Validate that the Client Success Release still accurately reflects the goal
- [ ] Update project milestones if discovery reveals new complexity

### Deliverable: Discovery Brief

```
DISCOVERY BRIEF
================
Client: _______________
Project: _______________
Date: _______________
DRI: _______________

CURRENT STATE
[Describe how things work today, including pain points and inefficiencies]

DESIRED STATE
[Describe the target outcome after project completion]

TECHNICAL ASSESSMENT
- Platforms involved: _______________
- Integrations required: _______________
- Data sources and formats: _______________
- Technical constraints: _______________
- Security or compliance considerations: _______________

REQUIREMENTS (VALIDATED)
1. [Requirement] - Priority: Must-Have / Nice-to-Have
2. [Requirement] - Priority: Must-Have / Nice-to-Have
3. [Requirement] - Priority: Must-Have / Nice-to-Have

RISKS IDENTIFIED
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [risk] | High/Med/Low | High/Med/Low | [plan] |

REVISED MILESTONES (if changed from kickoff)
1. [Milestone] - Target: ___
2. [Milestone] - Target: ___

OPEN QUESTIONS
- [question needing client input]
```

### SLAs for Discovery Phase

| Commitment | Target |
|-----------|--------|
| Discovery session scheduled | Within 2 business days of kickoff |
| Discovery brief delivered to client | Within 5 business days of kickoff |
| Client questions responded to | Within 4 business hours |
| Discovery phase total duration | 2-5 business days |

### Quality Gate

- [ ] Discovery brief completed and shared with client
- [ ] Client confirms requirements are accurate (written confirmation via email or chat)
- [ ] All technical dependencies identified and access confirmed
- [ ] Risks documented with mitigations
- [ ] Project milestones updated if needed

**Rule: Do not begin the Build phase until the client has confirmed the discovery brief.**

---

## Phase 2: Build (Days 6-20)

### Purpose

Design, develop, and internally validate the solution. This is where the core work happens.

### Activities

- [ ] Break milestone into discrete tasks (1-4 hour blocks)
- [ ] Build the solution iteratively, testing as you go
- [ ] Commit work to version control regularly (if applicable)
- [ ] Send weekly status updates to client every Friday by 5pm ET
- [ ] Flag blockers within 4 business hours of discovery
- [ ] Conduct internal QA before any client-facing demo
- [ ] Document the solution as you build (not after)

### Weekly Status Update Template

```
PROJECT STATUS UPDATE
======================
Client: _______________
Week of: _______________
Status: [On Track] / [At Risk] / [Blocked]

COMPLETED THIS WEEK
- [task completed]
- [task completed]

IN PROGRESS
- [task in progress] - Expected completion: ___

PLANNED NEXT WEEK
- [task planned]
- [task planned]

BLOCKERS
- [blocker] - Owner: ___ - ETA for resolution: ___

BUDGET STATUS
Hours used: ___ / ___ budgeted (___ % consumed)
Milestone progress: ___ / ___ milestones complete

NOTES
[Any relevant context, decisions, or changes]
```

### SLAs for Build Phase

| Commitment | Target |
|-----------|--------|
| Weekly status update | Every Friday by 5pm ET, no exceptions |
| Blocker communication | Flagged to client within 4 business hours |
| Milestone delivery | Within 2 business days of agreed target date |
| Response to client questions | Within 4 business hours during business days |
| Build phase total duration | Per project scope (5-15 business days typical) |
| Budget overrun alert | Client notified when 80% of budgeted hours consumed |

### Quality Gate

- [ ] All milestone deliverables built and functional
- [ ] Internal QA checklist passed (see below)
- [ ] Documentation drafted
- [ ] Budget status reviewed (if over 80%, client notified and scope discussed)

---

## Phase 3: Testing (Days 21-23)

### Purpose

Validate the solution in the client's actual environment. Catch issues before the client sees them.

### Activities

- [ ] Deploy or configure the solution in client's staging/test environment
- [ ] Run through all use cases documented in the discovery brief
- [ ] Test edge cases: empty inputs, malformed data, high volume, error states
- [ ] Verify integrations with all connected systems
- [ ] Check performance against agreed benchmarks
- [ ] Security review: no exposed credentials, proper access controls, data handling
- [ ] Document any known limitations or caveats

### Internal QA Checklist

```
QA CHECKLIST
=============
Client: _______________
Project: _______________
Date: _______________
QA Performed By: _______________

FUNCTIONALITY
- [ ] Solves the stated problem in the Client Success Release
- [ ] All requirements from discovery brief are addressed
- [ ] Works correctly for the primary use case
- [ ] Works correctly for secondary/edge use cases

ENVIRONMENT
- [ ] Tested in client's environment, not just development
- [ ] All integrations connected and functioning
- [ ] Data flows correctly end-to-end

EDGE CASES
- [ ] Empty or null inputs handled gracefully
- [ ] Malformed or unexpected data handled gracefully
- [ ] Error messages are clear and actionable
- [ ] System recovers gracefully from failures

PERFORMANCE
- [ ] Meets agreed speed/throughput targets
- [ ] No obvious bottlenecks or resource issues
- [ ] Scales to expected volume

SECURITY
- [ ] No hardcoded credentials or API keys
- [ ] Access controls properly configured
- [ ] Sensitive data handled per client requirements
- [ ] HTTPS/encryption used where applicable

DOCUMENTATION
- [ ] Setup/configuration documented
- [ ] User guide or operating instructions written
- [ ] Troubleshooting guide for common issues
- [ ] Architecture diagram (if applicable)

ROLLBACK
- [ ] Rollback plan documented
- [ ] Can revert to previous state in under 5 minutes
- [ ] Client's existing workflows not disrupted until go-live

RESULT: [ PASS ] / [ FAIL - see notes ]
Notes: _______________
```

### SLAs for Testing Phase

| Commitment | Target |
|-----------|--------|
| Testing begins | Within 1 business day of build completion |
| Testing duration | 2-3 business days |
| Bug fixes (critical) | Same business day |
| Bug fixes (non-critical) | Within 2 business days |
| QA results shared with client | Before scheduling review session |

### Quality Gate

- [ ] Internal QA checklist fully passed
- [ ] All critical bugs fixed and re-tested
- [ ] Known limitations documented
- [ ] Solution ready for client review

**Rule: Do not invite the client to review until QA is passed. Never show broken work.**

---

## Phase 4: Review and Revision (Days 24-28)

### Purpose

Present the deliverable to the client, gather feedback, make revisions, and get formal approval.

### Activities

- [ ] Schedule a review/demo session (30-60 min)
- [ ] Walk the client through the deliverable in their environment
- [ ] Demonstrate all use cases from the discovery brief
- [ ] Document client feedback in real-time
- [ ] Categorize feedback: critical fix, nice-to-have, out of scope
- [ ] Complete revisions within the agreed revision limit
- [ ] Get written approval (email confirmation is sufficient)

### Revision Policy

| Item | Standard |
|------|----------|
| Revision rounds included | 2 rounds per milestone |
| Scope of revisions | Adjustments to agreed deliverables only |
| Out-of-scope requests | Documented and quoted as change orders |
| Revision turnaround | Within 2-3 business days per round |
| Additional revision rounds | Available at hourly rate, quoted in advance |

### Change Order Process

When a client requests work outside the original scope:

1. Acknowledge the request within 4 business hours
2. Assess the effort (hours, impact on timeline)
3. Send a written change order with: description, hours, cost, timeline impact
4. Client must approve the change order in writing before work begins
5. Update the project timeline and budget tracker

### SLAs for Review Phase

| Commitment | Target |
|-----------|--------|
| Review session scheduled | Within 2 business days of QA completion |
| Feedback documented and categorized | Within 1 business day of review session |
| Revision round 1 completed | Within 3 business days of feedback |
| Revision round 2 completed | Within 2 business days of additional feedback |
| Change order response | Within 1 business day of request |
| Review phase total duration | 3-5 business days |

### Quality Gate

- [ ] Client has reviewed the deliverable in a live demo or walkthrough
- [ ] All critical feedback addressed
- [ ] Revision rounds completed (within limit)
- [ ] Client provides written approval to proceed to handoff
- [ ] Any out-of-scope items documented and either quoted or deferred

**Rule: Do not proceed to handoff without written client approval. A verbal "looks good" is not sufficient.**

---

## Phase 5: Handoff (Days 29-30)

### Purpose

Transfer the completed solution to the client with full documentation, training, and deployment support.

### Activities

- [ ] Deploy the final solution to production environment
- [ ] Conduct a handoff/training session (30-60 min, recorded if possible)
- [ ] Walk through all documentation with the client
- [ ] Transfer ownership of all accounts, credentials, and assets
- [ ] Confirm the client can operate the solution independently
- [ ] Send the handoff package (see below)
- [ ] Set expectations for post-delivery support period

### Handoff Package

```
HANDOFF PACKAGE
================
Client: _______________
Project: _______________
Handoff Date: _______________

DELIVERABLES INCLUDED
1. [deliverable] - Location/access: ___
2. [deliverable] - Location/access: ___
3. [deliverable] - Location/access: ___

DOCUMENTATION
- Setup and Configuration Guide: [link]
- User Operating Manual: [link]
- Troubleshooting Guide: [link]
- Architecture Diagram: [link] (if applicable)

CREDENTIALS AND ACCESS
- [account/service] - Ownership transferred to: ___
- [account/service] - Ownership transferred to: ___

TRAINING
- Training session date: ___
- Recording link: ___ (if recorded)
- Key contacts for questions: ___

POST-DELIVERY SUPPORT
- Support period: 14 calendar days from handoff date
- Support ends: [date]
- What's covered: bug fixes, clarifying questions, minor adjustments
- What's not covered: new features, scope changes, re-training
- How to request support: [email/channel]
- Response time: within 4 business hours (business days)

SIGN-OFF
Client confirms receipt of all deliverables and documentation:
Name: _______________
Date: _______________
```

### SLAs for Handoff Phase

| Commitment | Target |
|-----------|--------|
| Handoff session scheduled | Within 2 business days of client approval |
| Handoff package delivered | Same day as handoff session |
| All credentials/access transferred | Before handoff session concludes |
| Training recording shared | Within 1 business day (if applicable) |
| Handoff phase total duration | 1-2 business days |

### Quality Gate

- [ ] Solution deployed to production and verified working
- [ ] Client can operate the solution independently (demonstrated in handoff session)
- [ ] All documentation delivered
- [ ] All credentials and access transferred
- [ ] Client has signed off on the handoff package
- [ ] Post-delivery support period communicated

---

## Phase 6: Post-Delivery Support (14 Calendar Days)

### Purpose

Provide a safety net after handoff. Fix bugs, answer questions, and ensure the solution stabilizes in production.

### What's Covered

- Bug fixes for functionality that was part of the original scope
- Clarifying questions about how the solution works
- Minor adjustments (configuration tweaks, small parameter changes)
- Help diagnosing issues that may be caused by external changes (API updates, platform changes)

### What's Not Covered

- New features or functionality not in the original scope
- Re-training or onboarding new team members
- Changes caused by the client modifying the solution without consultation
- Support for systems or tools outside the project scope

### SLAs for Post-Delivery Support

| Commitment | Target |
|-----------|--------|
| Response to support requests | Within 4 business hours (business days) |
| Critical bug fix | Within 1 business day |
| Non-critical bug fix | Within 3 business days |
| Clarifying questions | Within 4 business hours |
| Support period duration | 14 calendar days from handoff date |

### Escalation Path

| Level | Trigger | Action | Timeline |
|-------|---------|--------|----------|
| Level 1 | Client submits support request | DRI reviews and responds | Within 4 business hours |
| Level 2 | Issue not resolved within SLA | DRI escalates internally, provides status update to client | Within 1 business day |
| Level 3 | Critical issue affecting client operations | All-hands response, client updated every 2 hours until resolved | Immediate |

### End of Support

At the end of the 14-day support period:

- [ ] Send a summary of all support requests and resolutions
- [ ] Confirm no outstanding issues
- [ ] Offer ongoing support retainer options (if applicable)
- [ ] Trigger the Post-Project Review process (see post-project-review.md)
- [ ] Send client satisfaction survey

---

## SLA Summary Table

| SLA Category | Commitment | Measurement |
|-------------|-----------|-------------|
| **Response Time** | All client messages answered within 4 business hours | Timestamp in communication channel |
| **Status Updates** | Weekly update every Friday by 5pm ET | Delivery timestamp |
| **Milestone Delivery** | Within 2 business days of agreed target date | Project tracker |
| **Critical Bug Fix** | Within 1 business day of report | Issue log |
| **Non-Critical Bug Fix** | Within 3 business days of report | Issue log |
| **Revision Turnaround** | Within 3 business days per round | Project tracker |
| **Change Order Response** | Within 1 business day of request | Communication log |
| **Budget Alert** | Client notified at 80% budget consumption | Status update |
| **Availability** | Business hours M-F, 9am-6pm ET | Calendar |

---

## Revision Limits Summary

| Engagement Type | Included Rounds | Additional Rounds |
|----------------|----------------|-------------------|
| Standard Project | 2 per milestone | Billed at hourly rate |
| Retainer/Ongoing | Per agreement | Per agreement |
| Strategy/Consulting | 1 per deliverable | Billed at hourly rate |

---

## Project Status Indicators

Use these consistently in all status communications:

| Indicator | Meaning | Action Required |
|-----------|---------|-----------------|
| On Track | Project proceeding as planned | Continue normal cadence |
| At Risk | Potential issue that could impact timeline or budget | Flag in status update, propose mitigation |
| Blocked | Work cannot continue without resolution | Notify client immediately, escalate if needed |
| Complete | Phase or milestone finished and approved | Move to next phase |

---

## Emergency Protocol

For situations that require immediate action outside normal SLAs:

1. **Client's production system is down due to our deliverable:** Response within 1 hour, regardless of business hours. Fix or rollback immediately.
2. **Security incident (data exposure, credential leak):** Response within 30 minutes. Contain first, investigate second, communicate third.
3. **Scope dispute or contract disagreement:** Pause work, document the situation, schedule a call within 24 hours to resolve.

---

*This SOP is reviewed and updated after every project completion. Lessons learned feed directly into process improvements. The goal: predictable, high-quality delivery that clients trust and recommend.*
