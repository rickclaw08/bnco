# Client Onboarding Workflow

## Overview
This workflow takes a client from "yes" to "project kickoff" in 3-5 business days. Every step includes automation checkpoints and human review gates.

## Phase 1: Contract & Payment (Day 0-1)

### Step 1: Immediate Post-Acceptance (Within 2 Hours)
**Trigger:** Client says "yes" or "let's do it"

**Actions:**
1. Send confirmation email (template below)
2. Generate custom SOW (Statement of Work) from pricing tier template
3. Create client folder structure:
   - `/clients/[client-name]/contracts/`
   - `/clients/[client-name]/project/`
   - `/clients/[client-name]/communications/`
   - `/clients/[client-name]/deliverables/`
4. Initialize project tracking document
5. Add client to CRM/dashboard

**Email Template: Deal Confirmation**
```
Subject: Let's make this official - [Client Name] x ClawOps

Hi [Name],

Excited to get started! Here's what happens next:

IMMEDIATE NEXT STEPS:
1. Review & sign the attached Statement of Work (SOW)
2. Complete payment via [Stripe link / wire instructions]
3. Schedule kickoff call (link below)

WHAT YOU'RE GETTING:
- [Tier-specific deliverables]
- [Response time commitment]
- [Meeting cadence]
- Direct access to your project dashboard

TIMELINE:
- Contract signed: Today
- Payment processed: 1-2 business days
- Kickoff call: [Date options]
- First delivery: [Date based on tier]

KICKOFF SCHEDULING:
[Calendly link or 3 specific time slots]

Questions? Reply to this email or text me at [number].

Looking forward to building something great together.

Rick
CEO, ClawOps
[email] | [phone]
```

**SOW Components (Auto-Generated from Tier):**
- Project scope and deliverables
- Timeline with specific dates
- Payment terms
- Communication protocols
- Change request process
- IP and confidentiality terms
- Acceptance criteria

### Step 2: Contract Execution (Day 1-2)
**Responsible:** Rick (CEO) reviews, client signs

**Process:**
1. Client receives DocuSign/PandaDoc link
2. Automated reminder at 24h if not signed
3. Human follow-up call at 48h if not signed
4. Payment link sent immediately after signature
5. Payment confirmation triggers Phase 2

**Payment Methods:**
- Stripe (preferred): Instant confirmation
- Wire transfer: 2-3 day confirmation
- Check: Not accepted for first project

**Red Flags (Pause & Review):**
- Contract modifications requested
- Payment delayed >3 days
- Scope significantly different from initial discussion

## Phase 2: Discovery & Setup (Day 2-3)

### Step 3: Kickoff Call Preparation
**Before the call, we prepare:**

1. **Client Intelligence Report** (AI agent researches):
   - Company background and recent news
   - Tech stack (if applicable)
   - Competitor analysis
   - Industry context
   - Key stakeholders on their team

2. **Kickoff Deck** (12 slides):
   - Slide 1: Agenda
   - Slide 2: Team intros (Rick + assigned agents)
   - Slide 3: Project scope recap
   - Slide 4: Timeline and milestones
   - Slide 5: Communication protocol
   - Slide 6: Tools and access
   - Slide 7-10: Discovery questions
   - Slide 11: Next steps
   - Slide 12: Emergency contacts

3. **Shared Project Dashboard** (Notion/Airtable):
   - Set up and pre-populated
   - Client access configured
   - First week tasks visible

### Step 4: Kickoff Call (60 minutes)
**Attendees:** Rick (CEO), assigned AI agents (via voice), client stakeholders

**Agenda:**
- 0-5 min: Intros and rapport building
- 5-15 min: Process and expectations walkthrough
- 15-45 min: Discovery deep-dive
- 45-55 min: Next steps and action items
- 55-60 min: Questions and scheduling

**Discovery Questions (Tier-Dependent):**

**Starter Tier:**
- What specific problem are we solving?
- Who is the end user?
- What does success look like in 2 weeks?
- Any existing code/assets we should know about?
- Who approves final deliverables?

**Growth Tier:**
- All starter questions plus:
- What is your current workflow/process?
- What have you tried before that didn't work?
- What integrations or systems do we need to work with?
- Who are the key decision-makers we'll interact with?
- What are your biggest concerns about this project?

**Enterprise Tier:**
- All growth questions plus:
- What is the broader business context?
- How does this fit into your roadmap?
- What compliance/security requirements exist?
- What is your internal review/approval process?
- What metrics will you use to measure ROI?

**Kickoff Call Output:**
- Completed discovery document
- Updated project timeline
- Access requests list
- Approved first milestone

### Step 5: Access & Environment Setup (Day 3)
**Immediately after kickoff:**

1. **Request Access:**
   - GitHub/GitLab repos
   - API keys and credentials
   - Design files and brand assets
   - Documentation
   - Relevant Slack/communication channels

2. **Set Up Communication Channels:**
   - Add client to project Slack channel (or create one)
   - Add to shared dashboard
   - Add to status email list
   - Set up weekly meeting recurring invite

3. **Technical Environment:**
   - Clone repos
   - Set up development environment
   - Test API access
   - Verify credentials
   - Document any blockers

4. **Project Kickoff Document:**
   - Summary of kickoff call
   - Action items with owners
   - Timeline confirmation
   - First milestone details
   - Next check-in date

**Email Template: Post-Kickoff**
```
Subject: [Client Name] Project Kickoff - Action Items & Next Steps

Hi [Name],

Great kickoff call! Here's what we covered and what happens next.

KEY TAKEAWAYS:
- [3-5 bullet points from discovery]

ACTION ITEMS:
Us:
- [Task 1 - Due date]
- [Task 2 - Due date]

You:
- [Task 1 - Due date]
- [Task 2 - Due date]

NEXT MILESTONE:
[Milestone name] - Due: [Date]
Deliverables: [List]

WEEKLY CHECK-IN:
[Day] at [Time] - [Meeting link]

PROJECT DASHBOARD:
[Link to shared dashboard]

Need anything? Just message in Slack or email.

Harper
COO, ClawOps
```

## Phase 3: Project Launch (Day 4-5)

### Step 6: First Week Execution
**Goal:** Ship something visible within 7 days

**Day 4-5 Activities:**
1. Development begins on first milestone
2. Daily internal standup (AI agents + Rick)
3. Update shared dashboard daily
4. Client check-in at day 5 (async or 15-min call)

**First Week Deliverable (Required):**
- Starter: Working prototype or first iteration
- Growth: Architecture document + initial implementation
- Enterprise: Technical design doc + prototype

### Step 7: First Delivery & Feedback Loop
**Process:**
1. Internal QA (see qa-checklist.md)
2. Demo video recorded and sent
3. Request client feedback within 48 hours
4. Incorporate feedback
5. Deliver final version of milestone 1

**Email Template: First Delivery**
```
Subject: [Client Name] - First Milestone Delivered 🎉

Hi [Name],

Milestone 1 is ready for your review.

WHAT WE BUILT:
[2-3 sentences describing the deliverable]

DEMO:
[Loom video link - 3-5 minutes]

ACCESS:
[GitHub link / staging URL / download link]

FEEDBACK NEEDED:
Please review by [Date, 48h from now] and let us know:
1. Does this match your expectations?
2. Any changes needed?
3. Ready to move to milestone 2?

We're standing by for questions.

Harper
COO, ClawOps
```

## Onboarding Checklist (Master)

### Pre-Contract
- [ ] Verbal or written "yes" received
- [ ] Pricing tier confirmed
- [ ] Payment method identified
- [ ] Decision-maker confirmed

### Contract Phase
- [ ] SOW generated and sent
- [ ] Contract signed
- [ ] Payment received/confirmed
- [ ] Client added to CRM
- [ ] Project folder structure created

### Discovery Phase
- [ ] Kickoff call scheduled
- [ ] Client intelligence report prepared
- [ ] Kickoff deck created
- [ ] Dashboard set up
- [ ] Kickoff call completed
- [ ] Discovery document finalized

### Setup Phase
- [ ] Access requests sent and received
- [ ] Communication channels established
- [ ] Technical environment configured
- [ ] Post-kickoff email sent
- [ ] First milestone work begun

### Launch Phase
- [ ] First deliverable created
- [ ] Internal QA passed
- [ ] Demo video recorded
- [ ] Deliverable sent to client
- [ ] Feedback received
- [ ] Milestone 1 approved

## Risk Mitigation

### Common Onboarding Failures & Prevention

**Problem:** Delayed contract signature
**Prevention:** Follow-up cadence (24h, 48h), phone call at 48h
**Escalation:** CEO direct outreach at 72h

**Problem:** Payment delays
**Prevention:** Require payment before work starts (except enterprise)
**Escalation:** Pause work, daily follow-up

**Problem:** Scope creep during discovery
**Prevention:** Document everything, reference original proposal
**Escalation:** Formal change request process

**Problem:** Access delays
**Prevention:** Request list sent same day as kickoff
**Escalation:** Work on what's possible, flag blockers immediately

**Problem:** Unclear requirements
**Prevention:** Structured discovery questions, written confirmation
**Escalation:** Additional discovery call, document assumptions

**Problem:** Client ghosting after payment
**Prevention:** Over-communicate, multiple channels
**Escalation:** Formal check-in email, CEO phone call

## Success Metrics

**Onboarding Health Indicators:**
- Time from "yes" to contract signed: <3 days
- Time from payment to kickoff: <2 days
- Time from kickoff to first delivery: <7 days
- Client satisfaction after first milestone: >4/5
- Onboarding completion rate: >95%

## Agent Responsibilities During Onboarding

**Rick (CEO):**
- Contract negotiation and signing
- Kickoff call lead
- Escalation point
- Final approvals

**Harper (COO):**
- Process execution
- Template generation
- Timeline management
- Client communication
- Risk monitoring

**Dev Agents:**
- Technical discovery
- Environment setup
- First milestone development
- Demo creation

**Research Agent:**
- Client intelligence report
- Competitive analysis
- Technical research

## Post-Onboarding Transition

Once milestone 1 is approved, project transitions to standard execution mode (see project-templates.md and communication-sop.md).

**Transition Checklist:**
- [ ] Onboarding retrospective (internal)
- [ ] Client feedback survey sent
- [ ] Project plan updated based on learnings
- [ ] Communication cadence confirmed
- [ ] Payment schedule confirmed (for recurring)
- [ ] Milestone 2 kickoff scheduled

---

*This workflow is designed to be executed by AI agents with human oversight at key decision points. Update based on learnings from each client.*
