# Client Onboarding SOP

> **Standard Operating Procedure: Signed Contract to Project Kickoff**
> **Owner:** ClawOps Operations
> **Last Updated:** 2026-02-23
> **Target Timeline:** 3-5 business days from signed contract to kickoff

---

## Overview

This SOP covers every step from the moment a client signs their contract to the official project kickoff. Every step has an owner, a timeline, and a quality gate. Nothing gets skipped. Inspired by Apple's New Product Introduction (NPI) stage-gate process, scaled for a lean agency.

---

## Phase 1: Contract Signed (Day 0)

### Checklist

- [ ] Signed contract received and filed in `clients/[client-name]/contracts/`
- [ ] Payment terms confirmed (deposit invoice sent if applicable)
- [ ] Client added to project registry (`claw-agency/operations/project-registry.md`)
- [ ] DRI assigned (Directly Responsible Individual for this engagement)
- [ ] Internal project folder created using standard structure (see below)

### Project Folder Structure

```
clients/[client-name]/
├── contracts/          # Signed agreements, SOWs, amendments
├── discovery/          # Intake questionnaire, notes, research
├── deliverables/       # All project outputs
├── communications/     # Key email threads, meeting notes
├── status-reports/     # Weekly status updates
└── post-project/       # Review, feedback, case study materials
```

---

## Phase 2: Welcome Email (Day 0-1)

Send the welcome email within 24 hours of contract signing. This sets the tone for the entire engagement.

### Welcome Email Template

```
Subject: Welcome to ClawOps - Let's Build Something Great

Hi [Client First Name],

Welcome aboard! We're excited to partner with you on [project name/description].

Here's what happens next:

1. INTAKE QUESTIONNAIRE (attached or linked below)
   Please complete this within 2 business days. It helps us understand your
   environment, goals, and any technical requirements before we kick off.

2. ACCESS PROVISIONING
   We'll send a separate checklist of any credentials, accounts, or
   documentation we need from your side. The sooner we have access, the
   faster we move.

3. KICKOFF MEETING
   We'll schedule a 60-minute kickoff call within the next 3-5 business days.
   This is where we align on timeline, milestones, communication cadence,
   and expectations.

A few things to know about working with us:

- You'll get a weekly status update every Friday by 5pm ET.
- We respond to all messages within 4 business hours during business days.
- If anything urgent comes up, flag it with "URGENT" and we'll prioritize it.

Your dedicated point of contact for this project is [DRI Name]. All
project-related communication should go through [preferred channel].

Looking forward to getting started.

Best,
[DRI Name]
ClawOps
[email]
```

### Quality Gate

- [ ] Email sent within 24 hours of signed contract
- [ ] Intake questionnaire attached or linked
- [ ] Correct client name, project name, and DRI info

---

## Phase 3: Intake Questionnaire (Day 1-3)

Send with the welcome email. Follow up after 48 hours if not received.

### Intake Questionnaire

```
CLIENT INTAKE QUESTIONNAIRE
============================

SECTION 1: COMPANY OVERVIEW
1. Company name:
2. Industry:
3. Company size (employees):
4. Website URL:
5. Primary contact name, role, email, phone:
6. Secondary contact (backup) name, role, email:

SECTION 2: PROJECT CONTEXT
7. Describe the problem you're trying to solve in 2-3 sentences:
8. What does success look like for this project? Be specific:
9. Have you tried to solve this before? What happened?
10. What is driving the timeline? Is there a hard deadline? Why?
11. Who will use the final deliverable day-to-day?
12. Who are the decision-makers for approvals and sign-offs?

SECTION 3: TECHNICAL ENVIRONMENT
13. What tools/platforms do you currently use? (CRM, email, project
    management, databases, etc.)
14. Do you have any existing automations or integrations? Describe them:
15. Are there any technical constraints we should know about? (security
    policies, compliance requirements, preferred platforms)
16. What does your current data flow look like? (where does data come
    from, where does it go, what transformations happen)

SECTION 4: COMMUNICATION PREFERENCES
17. Preferred communication channel: (email / Slack / Discord / other)
18. Preferred meeting cadence: (weekly / biweekly / as-needed)
19. Best days/times for meetings (include timezone):
20. Any blackout dates or upcoming events that affect the project?

SECTION 5: ACCESS AND RESOURCES
21. List all accounts/platforms we'll need access to:
22. Is there existing documentation we should review? (link or attach)
23. Any brand guidelines or style requirements?
24. Do you have a staging/test environment we can use?

SECTION 6: BUDGET AND EXPECTATIONS
25. Are there any budget constraints beyond the agreed scope?
26. How do you prefer to handle change requests? (formal process /
    flexible within reason)
27. What would make you say "this was the best investment we made
    this quarter"?
```

### Follow-Up Protocol

| Timeline | Action |
|----------|--------|
| Day 1 | Questionnaire sent with welcome email |
| Day 3 | If not received, send friendly follow-up |
| Day 5 | If still not received, call the primary contact directly |
| Day 7 | Escalate: project timeline at risk, notify client of delay impact |

---

## Phase 4: Access Provisioning (Day 2-4)

### Access Provisioning Checklist

Complete this based on the intake questionnaire responses. Check off each item as access is confirmed and tested.

```
ACCESS PROVISIONING CHECKLIST
==============================
Client: _______________
Project: _______________
Date: _______________

ACCOUNTS AND CREDENTIALS
- [ ] Platform/tool #1: _____________ (access confirmed, tested)
- [ ] Platform/tool #2: _____________ (access confirmed, tested)
- [ ] Platform/tool #3: _____________ (access confirmed, tested)
- [ ] Platform/tool #4: _____________ (access confirmed, tested)
- [ ] Platform/tool #5: _____________ (access confirmed, tested)

DOCUMENTATION RECEIVED
- [ ] Existing workflow documentation
- [ ] Brand/style guidelines (if applicable)
- [ ] API documentation or credentials
- [ ] Sample data or test accounts
- [ ] Org chart or stakeholder map

ENVIRONMENTS
- [ ] Staging/test environment access confirmed
- [ ] Production environment access confirmed (if needed)
- [ ] Deployment process documented or explained

COMMUNICATION SETUP
- [ ] Client added to project communication channel
- [ ] Weekly status call scheduled (recurring)
- [ ] DRI contact info shared with client
- [ ] Escalation contacts exchanged

SECURITY
- [ ] Credentials stored securely (password manager, not plaintext)
- [ ] Access scoped to minimum required permissions
- [ ] Client's security policies reviewed and acknowledged
- [ ] NDA or confidentiality terms confirmed
```

### Quality Gate

- [ ] All required access confirmed and tested (we can log in and navigate)
- [ ] No access requests outstanding for more than 3 business days
- [ ] Credentials stored securely, never in plaintext or chat logs

---

## Phase 5: Project Setup (Day 3-4)

### Internal Setup Checklist

- [ ] Client Success Release written (1-page document describing the finished project from the client's perspective, per the Amazon "Working Backwards" method)
- [ ] Project broken into milestones (maximum 5 per project)
- [ ] Hours estimated per milestone with 20% buffer included
- [ ] Project timeline created with milestone due dates
- [ ] Project tracking board created (Notion, Linear, or equivalent)
- [ ] Status report template set up for this client
- [ ] Risk register started (known risks, mitigations, owners)

### Client Success Release Template

```
CLIENT SUCCESS RELEASE
=======================
Client: _______________
Project: _______________
Date: _______________

HEADLINE
What the client will be able to say when this project is complete:
"[One sentence from the client's perspective]"

PROBLEM
[2-3 sentences describing their current pain, in their own words]

SOLUTION
[2-3 sentences describing what we will build and how it works]

SUCCESS METRICS
How the client will know this is working:
1. [Specific, measurable outcome]
2. [Specific, measurable outcome]
3. [Specific, measurable outcome]

MILESTONES
1. [Milestone] - Target date: ___
2. [Milestone] - Target date: ___
3. [Milestone] - Target date: ___

FAQ
Q: [Anticipated client question]
A: [Answer]

Q: [Anticipated client question]
A: [Answer]
```

---

## Phase 6: Kickoff Meeting (Day 4-5)

### Kickoff Meeting Agenda (60 minutes)

```
KICKOFF MEETING AGENDA
=======================
Client: _______________
Date/Time: _______________
Attendees: _______________

1. INTRODUCTIONS (5 min)
   - Team intros (if multiple stakeholders)
   - Roles and responsibilities

2. PROJECT OVERVIEW (10 min)
   - Review Client Success Release together
   - Confirm problem statement and success metrics
   - Align on what "done" looks like

3. TIMELINE AND MILESTONES (10 min)
   - Walk through project timeline
   - Confirm milestone dates and dependencies
   - Identify any scheduling conflicts or blackout dates

4. COMMUNICATION AND PROCESS (10 min)
   - Weekly status update cadence (Fridays by 5pm ET)
   - Preferred communication channel confirmed
   - Response time expectations (4 business hours)
   - How to flag urgent issues
   - Escalation path (who to contact if something is stuck)

5. ACCESS AND ENVIRONMENT REVIEW (10 min)
   - Confirm all access is provisioned and working
   - Walk through any environment-specific details
   - Identify outstanding access items (assign owners and deadlines)

6. REVIEW AND REVISION PROCESS (10 min)
   - How we'll present deliverables for review
   - Revision limits and process (per project scope)
   - Approval workflow (who signs off on each milestone)

7. QUESTIONS AND NEXT STEPS (5 min)
   - Open questions from either side
   - Confirm: first milestone target date
   - Confirm: next check-in date/time
```

### Post-Kickoff Actions (same day)

- [ ] Send kickoff meeting summary to client via email
- [ ] Document any decisions or changes from the meeting
- [ ] Update project timeline if anything shifted
- [ ] Begin work on Milestone 1

---

## Onboarding Quality Gates Summary

| Gate | Criteria | Timeline |
|------|----------|----------|
| Contract Filed | Signed contract stored, project registry updated | Day 0 |
| Welcome Sent | Welcome email with questionnaire sent | Day 0-1 |
| Questionnaire Received | Completed intake form from client | Day 1-3 |
| Access Confirmed | All required access tested and working | Day 2-4 |
| Project Set Up | Client Success Release written, milestones defined, tracking board live | Day 3-4 |
| Kickoff Complete | Meeting held, summary sent, work begins | Day 4-5 |

**Rule: Do not start project work until the Kickoff Complete gate is passed.** Exceptions require DRI approval with documented rationale.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Client hasn't returned questionnaire after 5 days | Call directly. If unresponsive after 7 days, send formal notice that project timeline is shifting. |
| Access not provisioned after 3 days | Escalate to client's secondary contact. Document the delay in the project risk register. |
| Client wants to skip kickoff | Push back. The kickoff aligns expectations and prevents scope disputes later. Offer a shorter 30-minute version if needed. |
| Scope discussed in kickoff differs from contract | Document the discrepancy. Do not proceed until a formal change order or contract amendment is signed. |

---

*This SOP is a living document. Update it after every onboarding cycle based on lessons learned. The goal: every client has a consistent, professional, zero-surprise onboarding experience.*
