# Day 1 with a New Client
**Last Updated:** 2026-02-20  
**Owner:** Harper (COO)  
**Version:** 1.0

This is the step-by-step guide from signed contract to first deliverable. Every action, every email, every system configuration.

---

## PRE-DAY 1: CONTRACT SIGNED

### Immediate Actions (Within 2 Hours of Signature)

**Owner:** Sales Agent (hands off to Harper after these steps)

1. **Send Welcome Email**
   ```
   Subject: Welcome to ClawOps! Next Steps

   Hi [Client Name],
   
   Welcome to ClawOps! We're excited to partner with you on [project description].
   
   I'm [Sales Agent Name], and I'll be handing you off to Harper, our COO, who will be your main point of contact going forward.
   
   Here's what happens next:
   1. Harper will reach out within 24 hours to schedule your kickoff call
   2. You'll receive access to your client dashboard
   3. We'll begin work on [first deliverable] by [date]
   
   In the meantime, please review the attached:
   - Signed agreement (for your records)
   - Project brief and timeline
   - Contact information sheet
   
   If you have any questions before Harper reaches out, feel free to reply to this email.
   
   Looking forward to working together!
   
   Best,
   [Sales Agent Name]
   ```

   **Attachments:**
   - Fully executed contract (PDF)
   - Project brief (one-page summary of scope, deliverables, timeline)
   - Contact sheet (Harper's email/phone, escalation contacts, support email)

2. **Internal Handoff**
   - Sales Agent creates client record in CRM
   - Logs all context from sales process (pain points, preferences, promises made)
   - Assigns client to Harper in project management system
   - Notifies Harper via Slack/Discord: "New client: [Name]. Kickoff call needed by [date]."

3. **Finance Notification**
   - Sales Agent notifies Finance Agent
   - Finance sets up client in accounting system
   - Finance creates invoice for first payment (if applicable)
   - Finance sends invoice (template below)

4. **Tech Notification**
   - Sales Agent notifies Tech Agent
   - Tech begins provisioning (client environment, dashboard access, API keys if needed)

---

## DAY 1: ONBOARDING BEGINS

### Morning (Within 24 Hours of Contract Signing)

**Owner:** Harper (COO)

---

### Step 1: Internal Kickoff (30 min)

**Attendees:** Harper, Sales Agent, assigned delivery agents (Tech, Marketing, etc.)

**Agenda:**
1. Review client background and goals
2. Clarify scope and deliverables
3. Identify any ambiguities or risks
4. Assign ownership for each deliverable
5. Confirm timeline and dependencies
6. Discuss client communication preferences

**Output:**
- Project plan documented in `/operations/client-ops/[client-name]/project-plan.md`
- Each agent knows their responsibilities
- Risks and mitigation strategies identified

---

### Step 2: Schedule Client Kickoff Call

**Owner:** Harper

**Action:**
- Send scheduling email (Calendly link or propose 3 time options)
- Aim for kickoff within 48-72 hours of contract signing

**Email Template:**
```
Subject: Let's Get Started - Kickoff Call Scheduling

Hi [Client Name],

Harper here, COO at ClawOps. Welcome aboard!

I'd love to schedule our kickoff call to align on goals, clarify any details, and get started on the right foot.

The call will take about 45 minutes, and we'll cover:
- Project goals and success metrics
- Detailed scope review
- Communication preferences and cadence
- Timeline and milestones
- Q&A

Please book a time that works for you: [Calendly link]
(Or if you prefer, reply with 2-3 times that work, and I'll send a calendar invite.)

Looking forward to it!

Best,
Harper
COO, ClawOps
[Phone] | [Email]
```

---

### Step 3: Set Up Client Infrastructure

**Owner:** Tech Agent

**Tasks (Complete Before Kickoff Call):**

1. **Client Dashboard Access**
   - Create client account in dashboard
   - Set permissions (what they can see/do)
   - Generate login credentials
   - Test login flow

2. **Communication Channels**
   - Set up Slack channel (or Discord, or email thread, per client preference)
   - Invite client to channel
   - Set up notifications for Harper + assigned agents

3. **Project Management Tool**
   - Create client workspace in PM tool (Notion, Asana, etc.)
   - Set up project board with milestones
   - Invite client with appropriate permissions

4. **File Storage**
   - Create client folder in secure storage (Google Drive, Dropbox, etc.)
   - Set permissions
   - Create subfolders: /deliverables, /drafts, /references, /contracts

5. **API / System Access (If Applicable)**
   - Provision API keys or system access as needed
   - Document credentials securely
   - Test connectivity

**Checklist:**
- [ ] Dashboard login tested
- [ ] Communication channel set up and tested
- [ ] Project management workspace created and client invited
- [ ] File storage set up with proper permissions
- [ ] All credentials documented in password manager
- [ ] Client access instructions drafted (for Step 4)

---

### Step 4: Send Welcome Package

**Owner:** Harper

**Timing:** Same day as kickoff call scheduled

**Email Template:**
```
Subject: Your ClawOps Welcome Package

Hi [Client Name],

Excited for our kickoff call on [date/time]!

In the meantime, here's everything you need to get started:

**Your ClawOps Dashboard**
- URL: [dashboard link]
- Username: [email]
- Temporary password: [password] (you'll be prompted to change it on first login)
- What's in the dashboard: Project status, deliverables, communication hub, invoices

**Communication**
- We've set up a [Slack/Discord/email] channel for day-to-day communication
- Invite link: [link]
- For urgent issues, contact me directly: [phone]

**Project Management**
- We're using [Notion/Asana/etc.] to track progress
- Your workspace: [link]
- You'll see all milestones, deadlines, and deliverables there

**File Sharing**
- All project files: [Google Drive/Dropbox link]
- You have edit access to /references and view access to /deliverables

**Before Our Kickoff Call**
Please review:
1. Attached project brief (confirm scope and timeline)
2. Any questions or clarifications you'd like to discuss

See you on [date]!

Best,
Harper
COO, ClawOps
```

**Attachments:**
- Project brief (one-page summary)
- Quick start guide (how to use dashboard and tools)
- Contact information sheet

---

## DAY 2-3: KICKOFF CALL

### Pre-Call Prep (30 min before call)

**Owner:** Harper + assigned delivery agents

**Actions:**
1. Review client background and sales notes
2. Review contract and scope
3. Prepare any clarifying questions
4. Have project plan doc open for live note-taking

---

### Kickoff Call Agenda (45 min)

**Attendees:** Harper, client primary contact, any relevant stakeholders on both sides

**Agenda:**

1. **Introductions** (5 min)
   - Harper introduces self and role
   - Introduce any agents joining the call
   - Client introduces their team and roles

2. **Project Overview** (10 min)
   - Recap project goals and success metrics
   - Walk through scope and deliverables
   - Confirm timeline and milestones
   - Clarify any ambiguities

3. **Communication & Process** (10 min)
   - How we'll communicate (Slack, email, calls)
   - Update cadence (daily, weekly, etc.)
   - How to request changes or provide feedback
   - Escalation process (when and how to escalate)

4. **Tools & Access** (5 min)
   - Walk through dashboard (if time allows, or offer separate demo)
   - Confirm access to all tools
   - Answer any tech questions

5. **Discovery / Requirements** (10 min)
   - Ask clarifying questions about deliverables
   - Understand client preferences and constraints
   - Identify any dependencies on client (assets, access, approvals)

6. **Q&A** (5 min)
   - Open floor for client questions

**End of Call:**
- Confirm next touchpoint (e.g., "I'll send a progress update on [date]")
- Thank client and express excitement to get started

---

### Post-Call Actions (Within 2 Hours)

**Owner:** Harper

1. **Send Meeting Summary Email**
   ```
   Subject: Kickoff Call Summary & Next Steps
   
   Hi [Client Name],
   
   Great meeting with you today! Here's a quick summary:
   
   **What We Discussed:**
   - [Key point 1]
   - [Key point 2]
   - [Key point 3]
   
   **Clarifications / Decisions:**
   - [Decision 1]
   - [Decision 2]
   
   **Next Steps:**
   - [Action item 1] - Owner: [Who] - Due: [Date]
   - [Action item 2] - Owner: [Who] - Due: [Date]
   
   **Our Next Touchpoint:**
   [Date/time of next check-in or deliverable]
   
   If I missed anything or you have additional thoughts, please let me know!
   
   Best,
   Harper
   ```

2. **Update Internal Systems**
   - Log meeting notes in CRM
   - Update project plan with any new information
   - Adjust timeline if needed
   - Assign action items to agents

3. **Notify Team**
   - Send summary to all assigned agents
   - Highlight any changes to scope or priorities
   - Confirm assignments and deadlines

---

## DAY 3-7: WORK BEGINS

### Daily Client Communication

**Owner:** Harper (or assigned project manager)

**Frequency:** Daily updates during first week, then adjust based on client preference

**Update Template (Async):**
```
**[Client Name] - Daily Update - [Date]**

PROGRESS TODAY:
- [What we accomplished]
- [What we're working on]

ON TRACK:
- [Deliverable 1] - [% complete] - Due [date]
- [Deliverable 2] - [% complete] - Due [date]

NEEDS FROM YOU:
- [Any input, approval, or access we need from client]

NEXT UPDATE:
[Tomorrow at this time / or specific time if different]

Questions? Just reply!

- Harper
```

---

### Internal Standups

**Owner:** Harper

**Frequency:** Daily during first week with new client

**Format:** Quick Slack/Discord message or 15-min call

**Questions:**
1. What did you complete on [Client Name] project?
2. What are you working on today?
3. Any blockers or questions?
4. On track for [next deliverable] by [date]?

---

### Mid-Week Check-In with Client (Day 4-5)

**Owner:** Harper

**Format:** Quick email or Slack message

**Template:**
```
Hi [Client Name],

Quick check-in: How's everything going so far?

A few questions:
1. Are you finding the tools (dashboard, Slack, etc.) easy to use?
2. Is our communication cadence working for you (too much, too little, just right)?
3. Any questions or concerns so far?

We want to make sure this is a great experience for you!

Best,
Harper
```

**Purpose:** Catch any issues early, adjust communication as needed

---

## DAY 7-10: FIRST DELIVERABLE

### Pre-Delivery QA (2 Days Before Deadline)

**Owner:** Delivery agent + Harper

**Actions:**
1. **Run QA Checklist** (See `/operations/client-ready/qa-checklist.md`)
   - Does it meet acceptance criteria?
   - Is it polished and professional?
   - Are all client requirements addressed?
   - Typos, formatting, branding correct?

2. **Internal Review**
   - Peer review by another agent
   - Harper reviews for quality and alignment

3. **Final Polish**
   - Incorporate feedback
   - Run final QA pass

**If Issues Found:**
- Fix before delivery
- If deadline at risk, communicate proactively to client (see incident response playbook)

---

### Delivery (On or Before Deadline)

**Owner:** Harper (delivers on behalf of team)

**Delivery Email Template:**
```
Subject: [Deliverable Name] - Ready for Your Review

Hi [Client Name],

Excited to share [deliverable name] with you!

**What's Included:**
- [Item 1]
- [Item 2]
- [Item 3]

**Where to Find It:**
[Link to dashboard / file storage / direct attachment]

**How to Review:**
1. [Step 1]
2. [Step 2]
3. Please provide feedback by [date, typically 3-5 business days]

**What Happens Next:**
- We'll incorporate your feedback and deliver the revised version within [timeframe]
- [Next deliverable] will be ready by [date]

I'm confident you'll love this, but if anything doesn't meet your expectations, please let me know immediately. We're here to make it right.

Looking forward to your feedback!

Best,
Harper
```

**Attachments / Links:**
- Deliverable file(s)
- User guide or instructions (if applicable)

---

### Post-Delivery Check-In (24 Hours After Delivery)

**Owner:** Harper

**Action:** Quick follow-up to confirm client received and can access deliverable

**Template:**
```
Hi [Client Name],

Just checking in: Did you receive [deliverable]? Any issues accessing it?

Let me know if you have questions as you review it!

Best,
Harper
```

---

### Feedback & Revision Phase

**Owner:** Harper + delivery agent

**When Client Provides Feedback:**

1. **Acknowledge Receipt (Within 2 Hours)**
   ```
   Hi [Client Name],
   
   Thanks for the feedback on [deliverable]!
   
   I've reviewed your notes, and here's our plan:
   - [Feedback item 1] - We'll address this by [approach]
   - [Feedback item 2] - We'll revise this by [approach]
   - [Feedback item 3] - Quick clarification: [question or note]
   
   Revised version will be ready by [date].
   
   Let me know if I missed anything!
   
   Best,
   Harper
   ```

2. **Internal Assignment**
   - Harper assigns revision tasks to delivery agent
   - Sets internal deadline (1-2 days before client deadline)

3. **Deliver Revision**
   - Run QA again before re-delivery
   - Clearly mark what changed (changelog or highlighted changes)
   - Re-deliver with similar email as initial delivery

4. **Confirm Acceptance**
   - Once client approves, mark deliverable as "Complete" in PM tool
   - Celebrate internally (recognize agent who delivered)

---

## DAY 10-14: ESTABLISH RHYTHM

### Weekly Check-In Call (Optional but Recommended)

**Owner:** Harper

**Frequency:** Weekly for first month, then adjust based on client preference

**Format:** 15-30 min call or video

**Agenda:**
1. Review progress (what's been delivered, what's in progress)
2. Preview next week's deliverables
3. Address any client questions or concerns
4. Gather feedback on process and communication

**Post-Call:** Send summary email with action items

---

### Client Satisfaction Check (End of Week 2)

**Owner:** Harper

**Action:** Short survey or informal conversation

**Questions:**
1. How satisfied are you with our work so far? (1-10)
2. Is our communication meeting your needs?
3. What's working well?
4. What could we improve?
5. Any concerns or questions?

**Purpose:** Identify issues early, adjust as needed, build trust

---

## DAY 30: FIRST MONTH RETROSPECTIVE

### Internal Review

**Owner:** Harper + team

**Questions:**
1. How did this client onboarding go?
2. What went well?
3. What could we improve?
4. Any process gaps or unclear steps?
5. Is client likely to renew/expand?

**Action:** Update this guide based on learnings

---

### Client Check-In

**Owner:** Harper

**Action:** Formal monthly review (if part of contract) or informal check-in

**Template:**
```
Hi [Client Name],

We've wrapped up our first month together! Here's a quick summary:

**What We Delivered:**
- [Deliverable 1]
- [Deliverable 2]
- [Deliverable 3]

**Coming Up Next:**
- [Preview of next month's deliverables]

**How Are We Doing?**
I'd love to get your feedback:
1. Are we meeting your expectations?
2. Anything we should do differently?
3. Any new priorities or needs we should address?

Thanks for being a great partner. Looking forward to month 2!

Best,
Harper
```

---

## ONGOING: MAINTAINING THE RELATIONSHIP

### Regular Touchpoints

**Daily/Weekly Updates:** Continue as established in first week (adjust frequency based on client preference)

**Monthly Reviews:** Recap progress, preview next month, gather feedback

**Quarterly Business Reviews (QBR):** For larger clients, formal presentation with metrics, achievements, and roadmap

---

### Proactive Communication

**When Things Go Well:**
- Share wins and positive outcomes
- Highlight value delivered
- Show ROI (quantify impact when possible)

**When Things Go Wrong:**
- Communicate proactively (see incident response playbook)
- Own mistakes, fix fast, learn from them

---

### Continuous Improvement

**After Every Deliverable:**
- Internal debrief: What went well? What could improve?
- Update processes and templates based on learnings

**After Every Project:**
- Request formal client testimonial or case study (if client is happy)
- Ask for referrals

---

## TOOLS & SYSTEMS CHECKLIST

**Before Day 1 with ANY Client:**

- [ ] CRM configured and tested
- [ ] Client dashboard functional and tested
- [ ] Communication platform set up (Slack, Discord, email)
- [ ] Project management tool configured
- [ ] File storage set up with proper permissions
- [ ] Accounting system ready to invoice
- [ ] QA checklist finalized
- [ ] All email templates reviewed and ready
- [ ] Incident response playbook ready
- [ ] Team trained on client communication protocols

---

## CLIENT-SPECIFIC CHECKLIST

**For Each New Client (Complete Before Kickoff Call):**

- [ ] Client record created in CRM
- [ ] Sales notes and context logged
- [ ] Contract and scope documented
- [ ] Client dashboard access created and tested
- [ ] Communication channel set up (Slack/Discord/email)
- [ ] Project management workspace created
- [ ] File storage folders created with permissions
- [ ] First invoice sent (if applicable)
- [ ] Team notified and agents assigned
- [ ] Kickoff call scheduled
- [ ] Welcome package sent
- [ ] Internal kickoff meeting completed
- [ ] Project plan documented

---

## KEY CONTACTS & ESCALATIONS

**Primary Client Contact:** Harper (COO)
- Email: [harper-email]
- Phone: [harper-phone]
- Response time: Within 4 hours (business hours), within 2 hours (urgent)

**Escalation (if Harper unavailable):** CEO
- Email: [ceo-email]
- Phone: [ceo-phone]

**Technical Issues:** Tech Agent via [tech-support-email]

**Billing Questions:** Finance Agent via [billing-email]

---

## REMEMBER

**First impressions matter.**

The first 30 days set the tone for the entire relationship. Be responsive, be proactive, be excellent.

**When in doubt:**
- Over-communicate (proactive updates build trust)
- Ask questions (clarify before assuming)
- Own mistakes (transparency > excuses)
- Delight the client (exceed expectations when possible)

**This guide is a living document. Update it as we learn and improve.**
