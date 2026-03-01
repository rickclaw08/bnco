# Client Communication Protocol

> **When, How, and How Fast We Communicate**
> **Owner:** ClawOps Operations
> **Last Updated:** 2026-02-23
> **Principle:** No surprises. Ever. Clients should never have to chase us.

---

## Overview

This protocol defines communication standards for all client interactions. It covers channel selection, response times, escalation paths, and status update cadence. Built from trillion-dollar ops standards (Apple's "no surprises for the CEO" philosophy, Google's SRE incident communication, Amazon's customer obsession) and scaled for a lean agency.

---

## Channel Selection: When to Use What

### Email

**Use for:**
- Formal deliverables and handoff packages
- Proposals, contracts, change orders, invoices
- Weekly status updates (if client prefers email)
- Anything that needs a paper trail
- First contact with new leads
- Post-project surveys and follow-ups

**Tone:** Professional but warm. Clear subject lines. Bullet points over paragraphs.

**Format Rules:**
- Subject line must include project name: `[ProjectName] Status Update - Week of Feb 23`
- Keep emails under 300 words when possible
- Use bullet points for action items
- Bold any deadlines or decisions needed
- Always end with a clear next step or call to action

### Chat (Slack, Discord, or Client's Preferred Platform)

**Use for:**
- Day-to-day project questions and clarifications
- Quick updates that don't need formal documentation
- Sharing links, screenshots, or quick demos
- Coordinating meeting times
- Low-urgency back-and-forth

**Tone:** Conversational, concise, responsive.

**Format Rules:**
- Use threads to keep conversations organized
- Pin important messages (decisions, credentials, key links)
- Don't send messages that just say "Hi" or "Are you there?" - lead with your question
- If a chat conversation results in a decision, summarize it and confirm in writing

### Video/Phone Call

**Use for:**
- Kickoff meetings
- Discovery sessions
- Deliverable demos and review sessions
- Handoff and training sessions
- Resolving misunderstandings or sensitive topics
- Any conversation where tone matters (frustration, confusion, bad news)
- Complex technical discussions that would take too long via chat

**Tone:** Prepared, structured, respectful of time.

**Format Rules:**
- Always send an agenda before the call (even 3 bullet points counts)
- Keep meetings to 30 minutes unless the agenda requires more
- Send a written summary within 24 hours of every call
- Record calls when the client consents (for training sessions especially)

### When to Escalate from Chat to Call

Escalate to a call when:
- A chat thread exceeds 10 back-and-forth messages without resolution
- The client seems frustrated or confused (read the tone)
- You need to deliver difficult news (delays, budget issues, scope problems)
- A misunderstanding is developing that text will make worse
- The topic is sensitive (pricing disputes, quality concerns)

**How to escalate:** "I think this would be easier to sort out on a quick call. Do you have 15 minutes today or tomorrow?"

---

## Response Time Standards

### During Business Hours (Monday - Friday, 9am - 6pm ET)

| Channel | Response Time Target | Maximum Acceptable |
|---------|---------------------|-------------------|
| Email | Within 4 business hours | Same business day |
| Chat | Within 1 hour | Within 4 business hours |
| Phone/Voicemail | Return call within 2 hours | Within 4 business hours |
| Urgent (flagged "URGENT") | Within 30 minutes | Within 1 hour |

### Outside Business Hours

| Situation | Response |
|-----------|----------|
| Non-urgent messages | Respond next business day by 10am ET |
| Urgent (production down, security issue) | Respond within 2 hours, any day |
| Weekend/holiday messages | Acknowledge within 2 hours if urgent, otherwise next business day |

### Response Does Not Mean Resolution

A response means: "I've seen this, here's what happens next." It can be as simple as:
- "Got it, I'll look into this and get back to you by [time]."
- "Thanks for flagging. I'm working on it now. Will update you in [timeframe]."
- "I see the issue. Let me investigate and send you a full update by end of day."

Never leave a client wondering if you saw their message.

---

## Proactive Communication Cadence

### Weekly (Non-Negotiable)

| What | When | How | Content |
|------|------|-----|---------|
| Status Update | Every Friday by 5pm ET | Email (or client's preferred channel) | Progress, blockers, budget status, next week plan |

### As-Needed (Triggered by Events)

| Trigger | Communication | Timeline |
|---------|---------------|----------|
| Milestone completed | Send deliverable with summary | Same day |
| Blocker discovered | Notify client with impact and proposed solution | Within 4 business hours |
| Budget reaching 80% | Alert client, discuss scope or budget adjustment | Immediately upon detection |
| Timeline slipping | Notify client with revised timeline and reason | As soon as identified |
| Scope change request from client | Acknowledge, assess, send change order | Within 1 business day |
| Good news (ahead of schedule, client win) | Share it! | Same day |

### Milestone Communication Protocol

At each milestone:
1. **Before:** Remind client the milestone is coming (2-3 days ahead)
2. **During:** Deliver with context, not just files ("Here's what this does and why it matters")
3. **After:** Confirm receipt, schedule review if needed

---

## Escalation Path

### Internal Escalation (When You Need Help)

| Level | Trigger | Who | Action |
|-------|---------|-----|--------|
| Level 1 | Standard question or issue | DRI | Handle directly |
| Level 2 | Issue beyond DRI's expertise or authority | Operations Lead | Consult, decide, respond within 4 hours |
| Level 3 | Client relationship at risk, contract dispute, security incident | Founder | Involved immediately, response within 1 hour |

### Client Escalation (When the Client Escalates)

| Signal | Interpretation | Response |
|--------|---------------|----------|
| Client follows up on unanswered message | We missed our response time SLA | Apologize, respond immediately, investigate the gap |
| Client CC's their manager | They're losing confidence | Escalate internally, schedule a call, address concerns directly |
| Client sends a formal complaint | Relationship at risk | Founder responds within 4 hours, schedule a call within 24 hours |
| Client threatens to cancel | Critical situation | Founder calls within 2 hours, prepare a recovery plan |

### Escalation Response Template

```
Subject: [ProjectName] - Addressing Your Concerns

Hi [Client Name],

Thank you for raising this. I want you to know we take your feedback
seriously and I want to address it directly.

HERE'S WHAT HAPPENED:
[Brief, honest explanation - no excuses]

HERE'S WHAT WE'RE DOING ABOUT IT:
1. [Immediate action taken]
2. [Corrective action with timeline]
3. [Process change to prevent recurrence]

I'd like to schedule a call to discuss this in more detail and make sure
we're aligned going forward. Are you available [suggest 2-3 times]?

Best,
[Name]
```

---

## Communication Principles

### 1. Lead with Transparency

Bad news does not improve with age. If there's a delay, a problem, or a mistake, communicate it immediately. Clients can handle problems; they cannot handle surprises.

**Template for delivering bad news:**
- What happened (facts only, no excuses)
- What the impact is (timeline, budget, deliverable)
- What we are doing about it (specific actions, not vague promises)
- What we need from the client (if anything)

### 2. Confirm Understanding

After every important conversation, send a written summary. After every decision, confirm it in writing. "Just to confirm, we agreed to X. Let me know if I have that wrong."

### 3. Be Specific, Not Vague

| Instead of... | Say... |
|--------------|--------|
| "I'll get back to you soon" | "I'll have an answer for you by 3pm ET today" |
| "We're making progress" | "Milestone 2 is 70% complete, on track for Friday delivery" |
| "There might be a delay" | "Milestone 3 will be 2 days late because [reason]. New target: March 5" |
| "We'll look into it" | "I'm investigating now. I'll send you an update by end of day" |

### 4. Match the Client's Energy

Some clients want detailed updates with technical depth. Others want a two-sentence summary. Learn your client's preference in the first week and adapt. Ask directly if you're unsure: "Would you prefer detailed technical updates or high-level summaries?"

### 5. End Every Message with a Clear Next Step

Every email, every status update, every chat message that's more than a quick answer should end with what happens next and when.

---

## Client Satisfaction Checkpoints

Build these into your cadence to catch issues early:

| When | What | How |
|------|------|-----|
| End of Week 1 | Quick pulse check | Chat: "How's everything going so far? Anything we can improve?" |
| Mid-project | Informal check-in | Call: 5 minutes at the end of a status call to ask how the experience is going |
| Post-delivery | Formal satisfaction survey | Email: 3-question survey (NPS, best thing, one improvement) |
| 30 days post-delivery | Follow-up | Email: "How is everything running? Any questions?" |

---

## Communication Don'ts

- **Don't ghost.** Even if you don't have an answer, acknowledge the message.
- **Don't over-communicate.** Sending 15 Slack messages instead of 1 structured email wastes the client's time.
- **Don't use jargon without context.** If you say "webhook" or "API rate limit," explain what it means for the client.
- **Don't make promises you can't keep.** Under-promise, over-deliver. Always.
- **Don't communicate only when you need something.** Share wins, progress, and good news proactively.
- **Don't send messages late at night expecting a response.** Respect the client's boundaries.
- **Don't blame.** If something went wrong, own it. Blameless communication builds trust.

---

*This protocol is reviewed quarterly. Track response time metrics in the KPI dashboard. Every SLA breach should trigger a brief review: what happened and how do we prevent it next time.*
