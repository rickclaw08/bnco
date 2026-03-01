# ClawOps Escalation Playbook

## Philosophy

Things will go wrong. That's not failure, that's business. This playbook isn't about preventing every problem (impossible). It's about responding fast, transparently, and learning from each incident.

**Core principles:**
1. **Communicate early** - Tell clients about problems before they discover them
2. **Own it completely** - No excuses, no blaming tools or team
3. **Fix forward** - Focus on solutions, not blame
4. **Learn publicly** - Share what went wrong and how we'll prevent it
5. **Compensate fairly** - Make clients whole when we mess up

---

## Escalation Levels

### Level 1: Minor Issue (Handle & Monitor)
**Impact:** Small delay, minor inconvenience, no client-facing impact  
**Response time:** 24 hours  
**Owner:** Individual team member

**Examples:**
- Small bug in internal tool
- 1-2 day project slip (with notice)
- Tool downtime that doesn't affect clients
- Team member out sick (covered by others)

**Response:**
1. Fix the issue
2. Note in Notion project
3. Mention in Friday review
4. Update timeline if needed

**No escalation needed unless pattern emerges.**

---

### Level 2: Client-Facing Issue (Escalate to COO)
**Impact:** Client experiences problem, deadline at risk, quality concern  
**Response time:** 4 hours  
**Owner:** COO (Harper) coordinates response

**Examples:**
- Automation stopped working
- Missed deadline without prior warning
- Client unhappy with deliverable quality
- Scope creep causing budget overrun
- Communication breakdown with client

**Response:**

**Immediate (within 1 hour):**
1. Acknowledge the issue to client
2. Post in Slack #operations with details
3. Assign owner to fix
4. Set timeline for resolution

**Within 4 hours:**
5. Diagnose root cause
6. Present solution options to client
7. Get client approval on path forward
8. Begin implementation

**Within 24 hours:**
9. Provide status update to client
10. Update Notion project with incident details
11. Create action item to prevent recurrence

**Follow-up:**
- Daily updates until resolved
- Post-incident review when closed
- Compensation discussion if we caused delay/cost

---

### Level 3: Critical Incident (All-Hands Response)
**Impact:** Major client disruption, revenue at risk, reputation damage  
**Response time:** 1 hour  
**Owner:** COO leads, all team members support

**Examples:**
- Production system down affecting client operations
- Data loss or security breach
- Client threatening to cancel contract
- Legal or compliance issue
- Multiple projects failing simultaneously
- Team member emergency causing critical gap

**Response:**

**Immediate (within 30 minutes):**
1. **Alert:** Post in Slack #operations: "CRITICAL INCIDENT"
2. **Assemble:** COO calls emergency meeting (all hands)
3. **Inform:** Notify affected clients immediately
   - "We're aware of [issue]"
   - "Team is actively working on it"
   - "We'll update you every [X hours]"
4. **Assign:** Clear owner for resolution
5. **Support:** Other team members provide backup

**Within 1 hour:**
6. **Diagnose:** Understand what happened and why
7. **Contain:** Stop the bleeding (temporary fix if needed)
8. **Communicate:** First detailed update to client
   - What happened
   - What we're doing
   - Expected timeline
   - Your direct contact (phone/Slack)

**Ongoing:**
9. **Update:** Client updates every 2-4 hours (even if "still working on it")
10. **Fix:** Implement permanent solution
11. **Verify:** Test thoroughly before declaring resolved
12. **Document:** Everything, in real-time

**Post-Resolution:**
13. **Confirm:** Client verifies issue is resolved
14. **Apologize:** Sincere, specific, no excuses
15. **Compensate:** Offer credit, refund, or free work (case by case)
16. **Debrief:** Full post-mortem (see below)
17. **Prevent:** Implement safeguards to prevent recurrence

---

## Incident Response Templates

### Level 2: Initial Client Notification

```
Subject: [Project Name] - Issue Identified & Response Plan

Hi [Client Name],

I wanted to reach out immediately about an issue we've identified with [specific component].

What happened:
[Clear, honest description of the problem]

Impact:
[How this affects the client - be specific]

What we're doing:
[Immediate actions being taken]
[Expected resolution timeline]

Your point of contact:
[Name] is leading the response and available directly at [phone/Slack/email].

I'll update you by [specific time] with progress, and we'll have this resolved by [realistic timeline].

I take full responsibility for this, and we're committed to making it right.

Harper
COO, ClawOps
[Direct contact info]
```

---

### Level 3: Critical Incident Notification

```
Subject: URGENT - [System/Project] Issue & Immediate Response

Hi [Client Name],

I'm reaching out immediately about a critical issue affecting [system/project].

SITUATION:
[What's broken, in plain language]
[Impact on client operations]
[When it started]

IMMEDIATE ACTIONS:
• [Action 1 - already in progress]
• [Action 2 - starting now]
• [Action 3 - in parallel]

TIMELINE:
• Temporary fix: [X hours]
• Permanent fix: [Y hours]
• Full resolution: [Z hours]

YOUR SUPPORT:
• Direct line to me: [phone]
• Status updates every 2 hours
• Slack channel for real-time updates: [link]

I'm personally overseeing the response. We won't rest until this is resolved.

Harper
COO, ClawOps
[Phone]
```

---

### Post-Resolution Follow-Up

```
Subject: [Issue] - Resolved & Making It Right

Hi [Client Name],

The issue we experienced with [system] is now fully resolved and verified.

WHAT HAPPENED (Root Cause):
[Honest explanation without technical jargon]
[No excuses, just facts]

WHAT WE FIXED:
[Specific changes made]
[Why it won't happen again]

MAKING IT RIGHT:
[Compensation offered - credit, free hours, extended support, etc.]

WHAT WE LEARNED:
[New processes or safeguards implemented]
[How we're better because of this]

Thank you for your patience and partnership during this. We take your trust seriously, and we're committed to being better.

Let's schedule a brief call to discuss any remaining concerns and ensure you're 100% satisfied with the resolution.

Harper
COO, ClawOps
```

---

## Post-Incident Review (Post-Mortem)

**Conduct within 72 hours of resolution.**

**Attendees:**
- COO (facilitates)
- Team members involved
- Anyone with relevant context

**Duration:** 60 minutes

**Agenda:**

### 1. Timeline (10 min)
- What happened, in chronological order
- When did we know about it?
- When did the client know about it?
- Key decision points

### 2. Root Cause Analysis (15 min)
**Use "5 Whys" technique:**
- Problem: [State the problem]
- Why did it happen? [Immediate cause]
- Why did that happen? [Deeper cause]
- Why did that happen? [Deeper still]
- Why did that happen? [Root cause]
- Why did that happen? [Systemic issue]

**Example:**
- Problem: Client's automation broke
- Why? Code had a bug
- Why? We didn't test edge case
- Why? Testing checklist was incomplete
- Why? We don't have a standard testing protocol
- Why? We've been moving fast and skipped process documentation

**Root cause: Lack of documented testing standards**

### 3. What Went Well (10 min)
**Yes, even in incidents, something went right:**
- Fast detection?
- Good communication?
- Team rallied quickly?
- Client was understanding?

**Celebrate what worked. We need to repeat those things.**

### 4. What Went Poorly (15 min)
**Honest assessment, no blame:**
- What made it worse?
- What delayed response?
- What surprised us?
- What could we have caught earlier?

**Focus on systems, not people.**

### 5. Action Items (10 min)
**Concrete, assignable, trackable:**
- What will we change?
- Who owns each change?
- When will it be done?
- How will we verify it works?

**Example action items:**
- [ ] Create testing checklist template (Owner: Dev Lead, Due: Next week)
- [ ] Add automated monitoring for [system] (Owner: Harper, Due: 2 weeks)
- [ ] Document escalation thresholds (Owner: COO, Due: This week)

### 6. Documentation (ongoing)
**Create post-mortem document in Notion:**
- Link to incident
- Timeline
- Root cause
- Action items
- Date of review

**Share with team. This is learning material.**

---

## Common Scenarios & Response Guides

### Scenario 1: Client Unhappy with Deliverable

**Signals:**
- "This isn't what I expected"
- Delayed feedback or approval
- Tone shift in communication
- Requesting major changes after "final" delivery

**Response:**

1. **Don't get defensive** - Listen fully
2. **Acknowledge** - "I hear that this isn't meeting your expectations"
3. **Understand** - Ask specific questions
   - What specifically isn't working?
   - What did you expect to see?
   - Can you show me an example of what you envisioned?
4. **Own it** - Even if you think they're wrong, own the communication gap
5. **Options** - Present 2-3 paths forward
   - Revise based on feedback (with timeline)
   - Collaborative redesign session
   - Different approach entirely
6. **Decide together** - Let client choose path
7. **Deliver** - Execute with extra attention to detail
8. **Follow up** - "Is this now what you were looking for?"

**Prevention:**
- Show work early and often (no big reveal)
- Use mockups and examples during scoping
- Confirm understanding in writing
- Check in at 25%, 50%, 75% completion

---

### Scenario 2: Scope Creep Threatening Budget/Timeline

**Signals:**
- "While you're at it, can you also..."
- "Oh, I forgot to mention..."
- Feature requests that weren't in scope
- Timeline pressure with expanding requirements

**Response:**

1. **Recognize it early** - Don't let it accumulate
2. **Friendly boundary** - "That's a great idea! That would be a change to the original scope."
3. **Quantify impact** - "Adding that would require X additional hours/days"
4. **Options:**
   - Add to current project (adjust timeline/budget)
   - Create new project for phase 2
   - Descope something else to make room
   - Decline politely
5. **Get agreement in writing** - Email or Slack confirmation
6. **Update project plan** - Notion reflects new scope

**Prevention:**
- Detailed SOW upfront
- "Scope" section in all proposals
- Change request process documented
- Weekly alignment on what's in/out

---

### Scenario 3: Technical Blocker (Can't Deliver as Promised)

**Signals:**
- API doesn't support needed feature
- Third-party tool limitation discovered late
- Technical approach isn't working
- Performance issues at scale

**Response:**

1. **Alert immediately** - Don't hide it hoping it resolves
2. **Research alternatives** - Before going to client, explore options
3. **Present solutions** - Not just the problem
   - Alternative technical approach
   - Different tool
   - Workaround (with tradeoffs)
   - Adjust deliverable
4. **Be honest about tradeoffs** - No magic solutions
5. **Client decides** - Based on their priorities
6. **Adjust timeline** - Realistic, not optimistic

**Prevention:**
- Technical validation during sales/scoping
- Proof of concept for unfamiliar tools
- Architecture review before committing
- Buffer time in estimates

---

### Scenario 4: Team Member Emergency/Unavailability

**Signals:**
- Sick leave
- Family emergency
- Unexpected departure
- Burnout

**Response:**

1. **Support the human first** - Their wellbeing matters most
2. **Assess impact** - What projects are affected?
3. **Coverage plan:**
   - Redistribute urgent work immediately
   - Identify what can wait
   - Bring in contractor if needed (cost of business)
4. **Notify clients** - Only if it impacts them
   - "We've had a team change, but [project] remains on track"
   - Don't share personal details
5. **Document knowledge** - Transfer context to backup
6. **Check in** - Regular updates with absent team member

**Prevention:**
- Cross-training (everyone knows multiple projects)
- Documentation (so work isn't locked in one head)
- Backup plans (who covers for whom)
- Sustainable pace (prevent burnout)

---

### Scenario 5: Client Payment Issues

**Signals:**
- Invoice past due
- "Check is in the mail" repeatedly
- Requesting payment plan
- Scope questions tied to payment

**Response:**

**First 7 days overdue:**
1. Friendly reminder - "Just checking if you received the invoice"
2. Assume good intent (it happens)

**8-14 days overdue:**
3. Direct follow-up - "I wanted to touch base about invoice [X]"
4. Ask if there's an issue - "Is there anything preventing payment?"
5. Offer to discuss if there's a concern

**15-30 days overdue:**
6. Firm but professional - "We need to resolve this"
7. Pause new work - "We'll resume once the account is current"
8. Payment plan option - If client is having cash flow issues
9. Set clear terms - Specific dates and amounts

**30+ days overdue:**
10. Escalate - Legal demand letter (if amount justifies)
11. Learn from it - Red flags we missed?

**Prevention:**
- Require deposit (50% upfront for new clients)
- Milestone-based payments (not all at end)
- Check payment terms during sales
- Monthly invoicing for retainers (not quarterly)
- Credit check for large projects (if possible)

---

### Scenario 6: Security Incident or Data Breach

**This is ALWAYS Level 3 - Critical.**

**Response:**

1. **Immediate containment** - Stop the breach
2. **Assess impact** - What data was accessed/exposed?
3. **Legal consult** - Call lawyer immediately (may have reporting obligations)
4. **Notify affected clients** - Within 24-72 hours (check legal requirements)
5. **Document everything** - For legal and insurance purposes
6. **Remediate** - Fix the vulnerability
7. **Third-party audit** - Bring in security expert
8. **Notification** - May need to notify authorities (depends on data type and jurisdiction)

**Template notification:**
```
Subject: Security Incident Notification - Action Required

[Client Name],

I'm reaching out about a security incident that may have affected your data.

WHAT HAPPENED:
[Specific description of breach]
[Date/time discovered]
[How it occurred]

WHAT DATA WAS AFFECTED:
[Be specific and honest]
[What was NOT affected, if relevant]

WHAT WE'RE DOING:
• Breach contained as of [time]
• Third-party security audit in progress
• [Specific remediation steps]

WHAT YOU SHOULD DO:
[Specific recommendations for the client]
[Any actions they need to take]

SUPPORT:
We're providing [credit monitoring/support/compensation] at no cost.

I'm deeply sorry this happened. We're taking this with the utmost seriousness and have engaged legal and security experts.

I'm available immediately at [phone] to discuss.

Harper
```

**Prevention:**
- Security audit during setup
- Regular updates and patching
- Access controls and least privilege
- Encryption for sensitive data
- Incident response plan (this playbook!)
- Insurance (cyber liability policy)

---

## Communication Principles During Incidents

### DO:
✅ **Communicate early** - Tell them before they discover  
✅ **Be specific** - Vague updates create anxiety  
✅ **Own it completely** - No excuses or blame-shifting  
✅ **Set realistic timelines** - Under-promise, over-deliver  
✅ **Update proactively** - Even if it's "still working on it"  
✅ **Make it right** - Offer fair compensation  
✅ **Learn publicly** - Share what you learned  

### DON'T:
❌ **Hide problems** - They always come out worse later  
❌ **Blame tools/clients/team** - You're responsible  
❌ **Make promises you can't keep** - Credibility dies here  
❌ **Go dark** - Silence makes people assume the worst  
❌ **Get defensive** - Listen, acknowledge, fix  
❌ **Minimize** - Don't say "it's not a big deal" if it is to them  
❌ **Forget to follow up** - Close the loop  

---

## Compensation Guidelines

**When we cause client problems, we make it right.**

### Minor issues (Level 1-2):
- **Apology + fix** - Usually sufficient
- **Small credit** - 10-20% of project value if we caused delay
- **Free hours** - 5-10 hours of additional work

### Major issues (Level 3):
- **Significant credit** - 25-50% of project value
- **Free sprint** - Additional week of work at no charge
- **Extended support** - 3-6 months of free maintenance
- **Full refund** - In extreme cases (rare, but possible)

**Guidelines:**
- Offer compensation, don't wait to be asked
- Make it proportional to impact
- Put it in writing
- Follow through completely
- No strings attached (don't make them feel guilty)

**Example:**
```
"Given the 3-day delay we caused, we'd like to offer you a 20% credit on this invoice and an additional week of support at no charge. We value your partnership and want to make this right."
```

---

## Prevention: Making Incidents Rare

**Incidents will happen. But we can reduce frequency.**

### Project Setup
- [ ] Clear scope document signed by client
- [ ] Technical validation of approach
- [ ] Risk assessment and mitigation plan
- [ ] Backup plan if primary approach fails
- [ ] Buffer time in estimates (20-30%)

### During Execution
- [ ] Daily standups (even if async)
- [ ] Show work early (25%, 50%, 75% reviews)
- [ ] Proactive status updates to clients
- [ ] Document as you go
- [ ] Test before shipping

### Team Health
- [ ] Sustainable workload (not burning out)
- [ ] Cross-training (no single points of failure)
- [ ] Psychological safety (people speak up about problems)
- [ ] Regular retrospectives (learning from close calls)

### Systems & Tools
- [ ] Monitoring and alerts on production systems
- [ ] Automated testing where possible
- [ ] Version control and backups
- [ ] Documented runbooks for common issues
- [ ] Escalation paths clear to everyone

---

## Escalation Decision Tree

```
Problem occurs
    |
    ├─ Can I fix it myself in <1 hour? 
    │   └─ YES → Fix it, document in Notion, mention in Friday review (Level 1)
    │
    ├─ Does it affect client deliverable or timeline?
    │   └─ YES → Notify COO immediately, flag client (Level 2)
    │
    ├─ Is production system down or data at risk?
    │   └─ YES → CRITICAL INCIDENT - all hands (Level 3)
    │
    └─ Is client threatening to leave or major revenue at risk?
        └─ YES → CRITICAL INCIDENT - all hands (Level 3)
```

**When in doubt, escalate up. Better safe than sorry.**

---

## Role Responsibilities

### Individual Team Members:
- Identify and flag issues early
- Document problems and attempted solutions
- Escalate when appropriate (don't suffer silently)
- Support response when needed
- Learn from incidents (review post-mortems)

### COO (Harper):
- Receive and triage escalations
- Lead Level 2 and Level 3 responses
- Client communication during incidents
- Facilitate post-mortems
- Track patterns and systemic issues
- Update this playbook based on learnings

### Entire Team:
- Blameless culture (we learn, not punish)
- Support each other during incidents
- Be honest about mistakes
- Contribute to prevention
- Review incidents together

---

## Success Metrics

**This playbook is working if:**
- Issues get escalated quickly (not hidden)
- Clients hear about problems from us first
- Post-mortems lead to real changes
- Same incident doesn't happen twice
- Team feels supported, not blamed
- Client relationships survive incidents

**This playbook is failing if:**
- Problems fester because people are afraid to escalate
- Clients discover issues before we tell them
- We keep making the same mistakes
- Incidents result in finger-pointing
- People hide problems

**Fix the playbook if it's not working. It's a living document.**

---

## Quick Reference Card

**Print this or pin in Slack:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CLAWOPS ESCALATION QUICK REF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Level 1: MINOR
→ Fix & document
→ Response: 24 hours

Level 2: CLIENT-FACING  
→ Notify COO immediately
→ Response: 4 hours
→ Slack: #operations

Level 3: CRITICAL
→ Post "CRITICAL INCIDENT" in Slack
→ Response: 1 hour
→ All hands on deck

COMMUNICATION RULES:
✅ Tell clients before they discover
✅ Update every 2-4 hours during critical
✅ Own it, no excuses
✅ Offer compensation proactively

POST-INCIDENT:
□ Document in Notion
□ Post-mortem within 72 hours
□ Create prevention action items
□ Update this playbook

When in doubt: ESCALATE UP.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

*Last updated: 2024-02-20*  
*Owner: Harper (COO)*  
*This is a living document. Update it after every incident.*
