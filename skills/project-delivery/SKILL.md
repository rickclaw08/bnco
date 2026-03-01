# Project Delivery

- **Name:** project-delivery
- **Version:** 0.1.0
- **Owner:** Harper (COO)
- **Description:** Manage active client projects from kickoff through handoff. Covers requirements gathering, sprint planning, QA, status reporting, and final delivery documentation.

## Trigger Keywords

- "project status"
- "delivery update"
- "sprint progress"
- "client deliverable"
- "project update"
- "QA check"
- "handoff"
- "project report"

## Prerequisites

- Completed client onboarding (see client-onboarding skill)
- Project timeline and scope document
- Active communication channel with client
- Assigned project team

## Workflow

### Step 1: Requirements Gathering

1. Load references/requirements-template.md
2. Conduct a requirements session with the client:
   - What problem are we solving?
   - Who are the end users?
   - What does success look like? (specific, measurable outcomes)
   - What are the hard constraints? (budget, timeline, tech stack)
   - What integrations are needed?
   - What does the client already have? (existing systems, data, docs)
3. Document requirements using the template:
   - Functional requirements (what the system must do)
   - Non-functional requirements (performance, security, scalability)
   - Acceptance criteria for each requirement
   - Priority ranking: must-have, should-have, nice-to-have
4. Review requirements with the client for sign-off
5. Store the finalized requirements document in the project folder

### Step 2: Sprint Planning

1. Break requirements into deliverable work items
2. Organize items into sprints (1-2 week cycles):
   - Sprint 1: Foundation and core functionality
   - Sprint 2-N: Feature buildout, iteration
   - Final sprint: Polish, testing, handoff prep
3. For each sprint, define:
   - Sprint goal (one sentence)
   - Work items with effort estimates
   - Dependencies and blockers
   - Sprint deliverable (what the client will see)
4. Share the sprint plan with the team
5. Confirm the client is aligned on sprint deliverables

### Step 3: Daily Execution Tracking

During active sprints:
1. Track work item status:
   - Not started
   - In progress
   - In review
   - Done
   - Blocked
2. Identify blockers early and escalate:
   - Missing client input or access
   - Technical challenges
   - Resource conflicts
   - Scope questions
3. Update progress daily in the project channel
4. Flag any risks to timeline immediately

### Step 4: Status Reporting

1. Load references/weekly-report-template.md
2. Prepare weekly status reports covering:
   ```
   ## Weekly Status Report
   **Client:** [Company Name]
   **Period:** [Date range]
   **Overall Status:** On Track / At Risk / Delayed

   ### Completed This Week
   - [Item 1]
   - [Item 2]

   ### In Progress
   - [Item 1] - [% complete or status]
   - [Item 2] - [% complete or status]

   ### Planned for Next Week
   - [Item 1]
   - [Item 2]

   ### Blockers / Risks
   - [Blocker 1] - [Owner] - [Action needed]

   ### Decisions Needed
   - [Decision 1] - [Context] - [Options]

   ### Metrics
   - Sprint progress: [X/Y items complete]
   - Timeline: [On track / X days ahead / X days behind]
   ```
3. Send to the client on the agreed day (typically Friday)
4. Send to internal team with additional internal notes
5. Log in project memory

### Step 5: Client Communication

1. Maintain regular communication cadence:
   - Weekly status report (written)
   - Weekly or bi-weekly sync meeting (30 min)
   - Ad-hoc updates for significant milestones or issues
2. Communication rules:
   - Be proactive. Share problems before the client asks
   - Be specific. "We are 2 days behind on the API integration because of X" not "things are a bit delayed"
   - Propose solutions, not just problems
   - Respond to client messages within 4 business hours
3. Never surprise a client with bad news at the end. Surface risks early

### Step 6: QA and Quality Checks

1. Load references/qa-checklist.md
2. Before delivering any sprint output:
   - [ ] Functional testing: all acceptance criteria met
   - [ ] Edge case testing: error handling works correctly
   - [ ] Performance: response times within acceptable range
   - [ ] Security: no exposed credentials, proper access controls
   - [ ] Documentation: code/config is documented
   - [ ] Brand compliance: any user-facing elements match guidelines
3. Log QA results:
   ```
   ## QA Report - Sprint [N]
   - Tests run: [count]
   - Tests passed: [count]
   - Issues found: [count]
   - Critical issues: [count]
   - Status: PASS / FAIL
   ```
4. Fix critical issues before delivery
5. Document known issues with severity and planned resolution

### Step 7: Sprint Review and Demo

1. At the end of each sprint:
   - Demo the deliverable to the client
   - Walk through what was built and how it works
   - Gather feedback and questions
   - Identify any scope adjustments needed
2. Document sprint review outcomes:
   - Client feedback
   - Approved items
   - Change requests
   - Next sprint adjustments
3. Update the project timeline if needed

### Step 8: Handoff and Delivery

1. Load references/handoff-template.md
2. Prepare handoff documentation:
   - **System overview:** Architecture, components, data flow
   - **Setup guide:** How to deploy, configure, and run
   - **User guide:** How end users interact with the system
   - **Admin guide:** Maintenance, monitoring, troubleshooting
   - **Access credentials:** All accounts, keys, and access (securely shared)
   - **Known issues:** Any open items with severity and workarounds
   - **Support plan:** Post-handoff support terms and contacts
3. Conduct a handoff meeting:
   - Walk through all documentation
   - Demonstrate the system end-to-end
   - Transfer all access and credentials
   - Confirm the client can operate independently
   - Answer final questions
4. Get formal sign-off from the client

### Step 9: Post-Delivery

1. Send a thank-you message
2. Schedule a 30-day follow-up check-in
3. Request a testimonial or case study (if appropriate)
4. Conduct an internal retrospective:
   - What went well?
   - What could improve?
   - Lessons learned for future projects
5. Archive the project documentation
6. Update internal knowledge base with learnings

## Project Health Indicators

| Indicator | Green | Yellow | Red |
|-----------|-------|--------|-----|
| Timeline | On track | 1-3 days behind | 4+ days behind |
| Budget | Under budget | At budget | Over budget |
| Client satisfaction | Positive feedback | No complaints | Complaints or concerns |
| Blockers | None | Blockers with plan | Blockers without plan |
| Scope | Stable | Minor changes | Scope creep |

## Escalation Path

1. **Yellow status:** Notify project lead, create mitigation plan
2. **Red status:** Notify project lead and COO, client communication within 24 hours
3. **Critical blocker:** Immediate escalation, same-day response

## Reference Files

| File | Purpose |
|------|---------|
| references/requirements-template.md | Requirements gathering document template |
| references/qa-checklist.md | Quality assurance checklist for deliverables |
| references/handoff-template.md | Project handoff documentation template |
| references/weekly-report-template.md | Weekly status report template |
