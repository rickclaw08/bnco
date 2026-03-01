# Project Delivery Framework

**Goal:** Consistent, repeatable delivery of automation projects.
**Owner:** Harper (COO) | Last updated: 2026-02-21

---

## Delivery Lifecycle

Every project follows 5 phases. No skipping.

```
Discovery --> Scoping --> Execution --> QA --> Handoff
 (Day 1)    (Day 1-2)   (Day 3-N)   (Day N-1)  (Day N)
```

---

## Phase 1: Discovery

**Duration:** 1 call (30-60 min)
**Output:** Completed Discovery Call Checklist, rough scope estimate

The discovery call determines if a project is a fit and gathers enough information to scope accurately.

See: [discovery-call-checklist.md](discovery-call-checklist.md)

---

## Phase 2: Scoping and Requirements

**Duration:** 1-2 days after discovery
**Output:** Requirements doc, project timeline, signed proposal

1. Complete the Requirements Gathering Template with the client
2. Map requirements to specific deliverables
3. Estimate effort in hours for each deliverable
4. Select the appropriate sprint template (2-week or 4-week)
5. Build the project timeline
6. Price the project (hourly or fixed-fee)
7. Send the proposal for signature

See: [requirements-template.md](requirements-template.md)
See: [project-timeline-2-week.md](project-timeline-2-week.md)
See: [project-timeline-4-week.md](project-timeline-4-week.md)

---

## Phase 3: Execution

**Duration:** 2-4 weeks (depending on scope)
**Output:** Working automation, documentation

Execution Rules:
1. Break every deliverable into tasks of 4 hours or less
2. Update the project board daily
3. Commit code or save configs at the end of every work session
4. Test each component before moving to the next
5. Send the client a status update at least once per week
6. Flag blockers within 4 hours of discovering them
7. Document every decision (why we built it this way, not just what we built)

Communication during execution:
- Async updates in Slack/email
- Weekly status email (Friday)
- Quick sync call if anything is unclear (15 min max)

---

## Phase 4: QA and Testing

**Duration:** 1-3 days
**Output:** Completed QA Checklist, bug fixes

Before anything goes to the client, it runs through QA.

See: [qa-checklist.md](qa-checklist.md)

QA Rules:
1. The person who built it does NOT do the final QA (if possible with team size)
2. Test with real data, not dummy data
3. Test edge cases: empty inputs, large volumes, special characters, permissions
4. Test the failure path: what happens when it breaks?
5. Document any known limitations

---

## Phase 5: Handoff

**Duration:** 1 day
**Output:** Completed Handoff Document, client sign-off

See: [handoff-document.md](handoff-document.md)

Handoff includes:
1. Live walkthrough with the client (recorded)
2. Written documentation of everything built
3. Login credentials and access transferred to client
4. Training if needed (recorded)
5. Support period defined (typically 2 weeks post-handoff for bug fixes)
6. Client signs off or requests revisions

---

## Pricing Reference

| Project Type | Typical Duration | Price Range |
|-------------|------------------|-------------|
| Simple automation (1 workflow) | 1-2 weeks | $1,500 - $3,000 |
| Multi-step automation (3-5 workflows) | 2-3 weeks | $3,000 - $7,500 |
| Full system build (CRM, workflows, integrations) | 3-4 weeks | $7,500 - $15,000 |
| Enterprise/custom | 4-8 weeks | $15,000 - $30,000+ |
| Retainer (ongoing optimization) | Monthly | $2,000 - $5,000/mo |

---

## Quality Standards

Every deliverable must meet these before it leaves our hands:

1. It works as specified in the requirements doc
2. It handles errors gracefully (no silent failures)
3. It's documented (someone other than the builder can understand it)
4. It's tested with real or realistic data
5. The client has been walked through it
6. There's a clear support/maintenance plan
