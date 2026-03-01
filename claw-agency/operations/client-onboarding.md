# ClawOps - Client Onboarding Guide

Standard onboarding process for every new ClawOps client. Copy checklists to the client's project board and check off as you go.

Website: https://rickclaw08.github.io/claw-systems/
Contact: agentclaw08@icloud.com

---

## Onboarding Overview

| Phase | Timeline | Owner |
|-------|----------|-------|
| Pre-Contract | 1-3 days | Sales/You |
| Workspace Setup | Day of signing | Ops |
| Kickoff | Within 2 days of signing | You |
| First Milestone | Per project template | Dev |

---

## Phase 1: Pre-Contract Checklist

- [ ] Intake form received and reviewed
- [ ] Lead scored (Hot / Warm / Cold)
- [ ] Lead added to HubSpot CRM (see crm-setup-guide.md)
- [ ] Discovery call scheduled (Cal.com)
- [ ] Discovery call completed
- [ ] Scope and requirements documented
- [ ] Pricing tier confirmed: Starter ($500) / Growth ($2K/mo) / Enterprise (Custom)
- [ ] Proposal drafted and sent (see templates.md)
- [ ] Proposal accepted or negotiation complete
- [ ] Contract sent (DocuSign/PandaDoc)
- [ ] Contract signed by both parties
- [ ] Deposit invoiced (Stripe): 50% for Starter, first month for Growth
- [ ] Deposit received and confirmed
- [ ] CRM deal moved to "Closed Won"

---

## Phase 2: Workspace Setup Checklist

Complete within 24 hours of signed contract:

- [ ] Trello board or Notion project created from template
- [ ] GitHub repo created (private, branch protection on `main`)
- [ ] Client added to Slack/Discord channel (named: `client-[companyname]`)
- [ ] Client credentials/API keys collected securely (1Password shared vault or secure form)
- [ ] Environment variables documented in `.env.example`
- [ ] Deployment environment provisioned (Vercel/Railway)
- [ ] Project folder structure initialized
- [ ] Welcome email sent (template below)

### Welcome Email Template

Subject: Welcome to ClawOps - Let's Build

```
Hi [Name],

Welcome aboard! We're excited to work with you.

Here's what happens next:

1. You'll receive access to our shared project board: [link]
2. Join our communication channel: [Slack/Discord link]
3. Kickoff call is scheduled for: [date/time]

Before our kickoff, please:
- Share any relevant docs, assets, or credentials via the secure link I'll send separately
- Review the project timeline on the board
- Note any questions you'd like to discuss

Looking forward to building something great together.

Best,
ClawOps
agentclaw08@icloud.com
https://rickclaw08.github.io/claw-systems/
```

---

## Phase 3: Kickoff Call Agenda (45 min)

Send this agenda to the client 24 hours before the call:

1. **Introductions and goals** (5 min)
   - Confirm project objectives and success criteria
2. **Walk through project board** (10 min)
   - Review milestones, timeline, deliverables
3. **Communication norms** (5 min)
   - Status updates: Monday and Thursday async in Slack/Discord
   - Response time: 24 hours on business days
   - Preferred contact method and escalation path
4. **Technical setup** (10 min)
   - Confirm access to all systems, APIs, credentials
   - Review tech stack and infrastructure decisions
5. **Questions and next steps** (10 min)
   - Confirm first milestone target and check-in date
   - Assign any client action items
6. **Wrap-up** (5 min)
   - Confirm everyone is aligned
   - Set first status update date

### Post-Kickoff Actions
- [ ] Kickoff notes shared with client
- [ ] Milestones and timeline confirmed in writing
- [ ] Point of contact confirmed
- [ ] First milestone check-in date set
- [ ] First status update sent

---

## Phase 4: Ongoing Delivery Checkpoints

For each milestone:

- [ ] Milestone deliverables built
- [ ] Internal QA completed (see qa-process.md)
- [ ] Demo/review call with client
- [ ] Client feedback collected and incorporated
- [ ] Milestone signed off by client
- [ ] Payment tranche invoiced (if milestone-based billing)
- [ ] CRM updated with milestone status

### Status Update Template

Post in client Slack/Discord channel every Monday and Thursday:

```
Status Update - [Date]

Completed:
- [list items]

In Progress:
- [list items]

Blockers:
- [list any, or "None"]

Next Milestone: [date] - [description]
```

---

## Phase 5: Handoff and Close

- [ ] Final QA pass completed (see qa-process.md)
- [ ] Client UAT period: 3 business days, feedback collected
- [ ] UAT fixes applied
- [ ] Handoff package delivered:
  - [ ] Technical documentation (README, ARCHITECTURE.md)
  - [ ] User guide / SOP
  - [ ] Admin guide
  - [ ] Loom walkthrough recorded
- [ ] Repo access transferred or granted
- [ ] Knowledge transfer call completed (30 min)
- [ ] Final invoice sent (remaining balance)
- [ ] Final payment received
- [ ] 14-day support period starts (end date: _______)
- [ ] Maintenance retainer offered (see pricing below)
- [ ] Client testimonial or review requested
- [ ] Project archived (board moved to Done, repo tagged)
- [ ] CRM deal marked complete, notes finalized

---

## ClawOps Pricing Reference

| Tier | Price | Description |
|------|-------|-------------|
| Starter | $500 | One-time project or setup |
| Growth | $2,000/mo | Ongoing development and support |
| Enterprise | Custom | Large-scale, multi-system builds |

## Maintenance Retainer Options

| Tier | Hours/mo | Response Time | Price |
|------|----------|---------------|-------|
| Basic | 5 hrs | 48h | $500/mo |
| Standard | 10 hrs | 24h | $1,000/mo |
| Premium | 20 hrs | 4h (business) | $2,000/mo |

---

## Client Communication Principles

1. Respond within 24 hours on business days
2. Flag risks early, never wait to be asked
3. Over-communicate progress, under-promise timelines
4. Confirm understanding before building
5. Document everything in the shared channel
