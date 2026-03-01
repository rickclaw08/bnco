# Weekly Operations Cadence
**Effective Date:** 2026-02-20  
**Owner:** Harper (COO)  
**Review Frequency:** Monthly

This document defines our operational rhythm. Everyone knows what to expect, when to expect it, and what to deliver.

---

## MONDAY: Planning & Alignment

### 9:00 AM - Weekly Planning Session (60 min)
**Attendees:** All agents (CEO, COO, Legal, Finance, Tech, Marketing, Sales)  
**Format:** Synchronous (live discussion or async thread with 2-hour response window)

**Agenda:**
1. **Review previous week** (10 min)
   - What shipped
   - What blocked
   - Key learnings

2. **This week's priorities** (20 min)
   - Each agent shares top 3 priorities
   - Flag dependencies and handoffs
   - Identify potential blockers

3. **Client status** (15 min)
   - Active clients: health, upcoming deliverables, issues
   - Sales pipeline: hot leads, proposals out, follow-ups needed
   - New client onboarding in progress

4. **Resource allocation** (10 min)
   - Who is at capacity
   - What needs backup
   - Workload balancing

5. **Decisions needed** (5 min)
   - Quick decisions made now
   - Complex decisions assigned owner + deadline

**Deliverable:** Each agent commits to 3 priorities for the week (logged in `/operations/weekly-priorities-YYYY-MM-DD.md`)

---

### End of Day Monday - Priority Confirmation
**Owner:** Harper  
**Action:** Review all agent priorities, confirm alignment with company goals, flag conflicts or gaps

---

## TUESDAY-THURSDAY: Daily Standups

### 9:30 AM - Async Daily Standup (15 min)
**Format:** Each agent posts update to shared channel (Slack, Discord, or `/operations/standups/YYYY-MM-DD.md`)

**Template:**
```
**[Agent Name] - [Date]**

YESTERDAY:
- [What I completed]
- [Blockers encountered]

TODAY:
- [What I'm working on]
- [What I need help with]

ALERTS:
- [Anything urgent the team should know]
```

**Review Window:** Harper reviews by 10:30 AM, responds to blockers, escalates urgent items

---

### 5:00 PM - End of Day Check
**Owner:** Each agent  
**Action:** 
- Update project board with progress
- Flag anything that won't hit this week's deadline
- Respond to any open questions from team

**Harper Review (5:30 PM):**
- Scan project board
- Check for stalled items
- Prep any interventions for tomorrow

---

## FRIDAY: Review & Retrospective

### 9:00 AM - Weekly Review (45 min)
**Attendees:** All agents  
**Format:** Synchronous or async with 2-hour response window

**Agenda:**
1. **Scorecard Review** (15 min)
   - Did we hit our weekly priorities? (% complete)
   - Client satisfaction metrics (if any feedback this week)
   - Pipeline movement (leads added, proposals sent, deals closed)
   - System uptime and incident count

2. **Wins & Lessons** (15 min)
   - What went exceptionally well?
   - What did we learn?
   - What surprised us?

3. **Blockers & Fails** (10 min)
   - What's still stuck?
   - Where did we miss the mark?
   - What needs to change?

4. **Next Week Preview** (5 min)
   - Any known big items coming up
   - Anyone out or at reduced capacity
   - Heads up on upcoming deadlines

**Deliverable:** Harper logs summary to `/operations/weekly-reviews/YYYY-MM-DD.md`

---

### 4:00 PM - Week Close
**Owner:** Each agent  
**Action:**
- Move all "Done" items on project board to archive
- Update status of in-progress items
- Prep Monday priorities (draft)
- Clear urgent notifications (nothing should wait until Monday unless critical)

**Harper Action (by EOD):**
- Review all agent updates
- Send any kudos or critical feedback
- Prep Monday planning agenda
- Update master launch checklist (if pre-launch) or OKR tracker (if post-launch)

---

## MONTHLY: Retrospective & Strategic Review

### Last Friday of Month - Monthly Retrospective (90 min)
**Attendees:** All agents  
**Format:** Synchronous (this one requires real-time discussion)

**Agenda:**
1. **Metrics Review** (20 min)
   - Revenue vs. target
   - Client count and churn
   - Delivery quality (QA scores, client feedback)
   - Agent utilization and capacity
   - System uptime and incidents

2. **Process Retrospective** (30 min)
   - What processes are working well?
   - What processes are breaking down?
   - Where are we wasting time?
   - What should we automate?

3. **Client Feedback** (15 min)
   - Review all client feedback from the month
   - Identify patterns
   - Decide on changes

4. **Strategic Adjustments** (20 min)
   - Are we on track with goals?
   - Do priorities need to shift?
   - What experiments should we run next month?

5. **Action Items** (5 min)
   - Assign owners and deadlines for improvements
   - Schedule any deep-dive sessions needed

**Deliverable:** Harper logs full retrospective to `/operations/monthly-retros/YYYY-MM.md` with action items tracked

---

### First Monday of Month - Goal Setting
**Owner:** CEO + Harper  
**Action:**
- Review previous month's OKRs
- Set current month's OKRs
- Communicate to all agents
- Update tracking systems

---

## QUARTERLY: Strategic Planning

### Week 1 of Quarter - Strategic Planning Sprint
**Duration:** Full week  
**Attendees:** All agents (heavier time commitment)

**Activities:**
1. **Q-1 Review:** What worked, what didn't, why
2. **Market Analysis:** Competitive landscape, customer needs, trends
3. **Financial Review:** Profitability, cashflow, runway
4. **Roadmap Planning:** What to build, improve, sunset
5. **Goal Setting:** OKRs for the next quarter
6. **Resource Planning:** Hiring, tools, infrastructure needs

**Deliverable:** Quarterly plan document with OKRs, roadmap, and resource allocation

---

## AD-HOC: Incident Response

### When an Incident Occurs
**Owner:** Harper (coordinator) + relevant agent (resolver)

**Immediate (within 1 hour):**
1. Harper notified (or discovers via monitoring)
2. Assess severity (P0-Critical, P1-High, P2-Medium, P3-Low)
3. Assign owner to investigate and resolve
4. Communicate to affected clients (if applicable)
5. Log in `/operations/incidents/YYYY-MM-DD-[description].md`

**Resolution Phase:**
- Owner provides updates every 2 hours (P0/P1) or daily (P2/P3)
- Harper tracks and unblocks
- Document workarounds for clients

**Post-Incident (within 48 hours of resolution):**
- Owner writes incident report (what happened, why, how fixed)
- Team reviews report
- Identify preventive measures
- Update playbooks and monitoring

**Reference:** Full incident response playbook at `/operations/incident-response.md`

---

## TRACKING SYSTEMS

### Project Board
**Location:** `/operations/project-board.md`  
**Update Frequency:** Daily (end of day)  
**Owner:** Each agent updates their own items, Harper reviews daily

### Weekly Priorities
**Location:** `/operations/weekly-priorities-YYYY-MM-DD.md`  
**Update Frequency:** Every Monday  
**Owner:** Each agent logs their 3 priorities, Harper reviews and confirms

### Standups
**Location:** `/operations/standups/YYYY-MM-DD.md` (or Slack/Discord channel)  
**Update Frequency:** Daily (Tue-Thu) by 9:30 AM  
**Owner:** Each agent posts their update

### Weekly Reviews
**Location:** `/operations/weekly-reviews/YYYY-MM-DD.md`  
**Update Frequency:** Every Friday  
**Owner:** Harper logs summary

### Monthly Retros
**Location:** `/operations/monthly-retros/YYYY-MM.md`  
**Update Frequency:** Last Friday of month  
**Owner:** Harper logs full retrospective with action items

### Incidents
**Location:** `/operations/incidents/YYYY-MM-DD-[description].md`  
**Update Frequency:** As incidents occur  
**Owner:** Incident owner writes report, Harper tracks

---

## COMMUNICATION PROTOCOLS

### Response Time Expectations
- **Critical (Client issue, system down):** 1 hour, 24/7
- **Urgent (Blocker, deadline at risk):** 4 hours during business hours
- **Normal (Questions, updates):** Same business day (by 5 PM)
- **Low Priority (Ideas, suggestions):** Within 48 hours

### Escalation Path
1. Try to resolve with relevant agent
2. If blocked > 4 hours on urgent item, escalate to Harper
3. If Harper can't resolve or cross-functional decision needed, escalate to CEO
4. If legal/financial risk, immediately escalate to CEO + relevant specialist

### Meeting Etiquette
- **Start on time** (async: response window starts at posted time)
- **Come prepared** (read pre-reads, bring your updates)
- **Be concise** (respect everyone's time)
- **Document decisions** (if it's not written down, it didn't happen)
- **Async default** (only go synchronous when truly needed)

---

## REPORTING

### What Harper Tracks Weekly:
- [ ] All 3 weekly priorities per agent (completion %)
- [ ] Project board health (anything stuck > 3 days?)
- [ ] Client satisfaction signals (any complaints or praise?)
- [ ] Incident count and severity
- [ ] Blockers and how long they've been blocked

### What Harper Reports to CEO Weekly:
- Summary of week's progress (1 paragraph)
- Key wins (3-5 bullets)
- Key concerns (3-5 bullets)
- Decisions needed (with recommendation)

### What Gets Escalated Immediately:
- Client threatening to churn
- System outage > 2 hours
- Legal or regulatory issue
- Team member completely blocked > 24 hours
- Revenue miss > 20% of projection

---

## ITERATION

**This cadence is v2. It will evolve.**

Every month, we ask:
1. Are meetings still valuable?
2. Are we tracking the right things?
3. Are we communicating effectively?
4. What can we automate or eliminate?

If something isn't working, we change it. Document the change, communicate it, and update this file.

**This is a living document. Treat it as the operating system of the company.**
