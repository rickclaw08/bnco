# Incident Response Playbook
**Last Updated:** 2026-02-20  
**Owner:** Harper (COO)  
**Version:** 1.0

When things go wrong, this is the playbook. Every scenario, every step, every communication template.

---

## SEVERITY DEFINITIONS

### P0 - CRITICAL
**Impact:** Complete service outage, data breach, or client-facing catastrophe  
**Response Time:** Immediate (within 15 minutes)  
**Examples:**
- All agents down, clients cannot be served
- Data breach or unauthorized access detected
- Client production system completely broken due to our work
- Major security vulnerability actively exploited

**Escalation:** Notify CEO immediately, all hands on deck

---

### P1 - HIGH
**Impact:** Major feature broken, significant client impact, or urgent deadline at risk  
**Response Time:** Within 1 hour  
**Examples:**
- Single agent down, impacting active client work
- Client deliverable will miss deadline without intervention
- Payment processing broken
- Critical bug in delivered work affecting client operations

**Escalation:** Notify Harper (COO) and relevant agent owner

---

### P2 - MEDIUM
**Impact:** Non-critical feature broken, client inconvenience, or internal process disruption  
**Response Time:** Within 4 hours (business hours)  
**Examples:**
- Client dashboard unavailable but work continues
- Internal tool malfunction
- Client complaint about quality (not urgent)
- Minor bug in delivered work

**Escalation:** Notify Harper (COO) and relevant agent owner

---

### P3 - LOW
**Impact:** Cosmetic issue, minor annoyance, or process improvement needed  
**Response Time:** Within 24 hours  
**Examples:**
- Typo in client communication
- UI glitch that doesn't block work
- Process inefficiency discovered
- Client feature request (non-urgent)

**Escalation:** Log and address in normal workflow

---

## INCIDENT TYPES & RESPONSES

---

## 1. CLIENT IS UNHAPPY

### Scenario A: Client Complaint About Deliverable Quality

**Immediate Response (within 2 hours):**

1. **Acknowledge & Own It**
   - Harper (or assigned client success owner) responds immediately
   - Template:
     ```
     Hi [Client Name],
     
     Thank you for bringing this to our attention. I understand your concern about [specific issue], and I want to address this right away.
     
     I'm personally taking ownership of this. Here's what we're doing:
     1. [Specific action to investigate]
     2. [Specific action to fix]
     3. [Specific action to prevent recurrence]
     
     I'll have an update for you by [specific time, within 4 hours].
     
     I apologize for the inconvenience. We're committed to making this right.
     
     Best,
     Harper (COO)
     ```

2. **Internal Triage**
   - Pull in the agent who delivered the work
   - Review the deliverable against QA checklist
   - Identify what went wrong (rushed? misunderstood requirement? technical error?)

3. **Fix Plan**
   - Determine fix approach (revise, redo, escalate to specialist)
   - Assign owner and deadline (typically within 24 hours)
   - Consider offering something extra (discount, bonus deliverable, priority support)

4. **Follow-Up Communication (within 4 hours)**
   - Update client with findings and fix plan
   - Template:
     ```
     Hi [Client Name],
     
     Update on [issue]:
     
     We've identified the root cause: [brief explanation without making excuses].
     
     Here's our fix plan:
     - [Specific action 1] - Complete by [time]
     - [Specific action 2] - Complete by [time]
     
     To make this right, we're also [offering something extra, if appropriate].
     
     You'll have the revised [deliverable] by [specific deadline].
     
     Thank you for your patience.
     
     Best,
     Harper
     ```

5. **Deliver Fix**
   - Execute fix with extra QA review
   - Deliver on time or early
   - Follow up to confirm satisfaction

6. **Post-Incident**
   - Log what happened in `/operations/incidents/`
   - Update QA checklist to catch this type of issue
   - If agent made preventable error, provide feedback and training
   - Review with team in next weekly meeting

---

### Scenario B: Client Unhappy About Communication / Responsiveness

**Immediate Response (within 1 hour):**

1. **Acknowledge & Apologize**
   - Harper responds personally
   - Template:
     ```
     Hi [Client Name],
     
     I apologize for the delayed response / lack of communication. That's not the experience we want you to have.
     
     I'm Harper, the COO, and I'm stepping in to ensure you get the attention you deserve.
     
     [Answer their question / provide their update immediately]
     
     Going forward, here's what we're changing:
     - [Specific change to communication cadence]
     - [Assigned point of contact]
     - [Escalation path if you don't hear from us]
     
     You should never have to chase us. We'll do better.
     
     Best,
     Harper
     ```

2. **Internal Root Cause**
   - Why did communication break down? (agent overloaded? notification missed? unclear responsibility?)
   - Fix the underlying issue (adjust workload, improve alerting, clarify ownership)

3. **Monitor Closely**
   - Harper personally monitors this client for next 2 weeks
   - Check in proactively (don't wait for them to ask)

4. **Post-Incident**
   - Update communication SOP if needed
   - Adjust capacity planning if agent was overloaded

---

### Scenario C: Client Wants to Cancel / Churn

**Immediate Response (within 1 hour):**

1. **Engage CEO + Harper**
   - This is a retention priority
   - Schedule live call ASAP (within 24 hours)

2. **Discovery Call**
   - Understand the real reason (often not what they first say)
   - Listen more than talk
   - Ask: "What would need to change for you to stay?"

3. **Retention Offer (if appropriate)**
   - Discount for next month
   - Dedicated support
   - Specific improvement commitment
   - Free deliverable to demonstrate value

4. **If Churn is Inevitable**
   - Make it graceful (don't burn bridges)
   - Offer smooth offboarding
   - Ask for detailed exit feedback
   - Leave door open for future return

5. **Post-Mortem**
   - Full team debrief: What could we have done differently?
   - Update processes to prevent recurrence
   - If multiple churns for same reason, this is a product/service issue (escalate to strategy discussion)

---

## 2. DELIVERY IS LATE

### Scenario A: Deadline at Risk (Identified Early)

**Response (as soon as identified):**

1. **Internal Assessment**
   - Why are we behind? (scope creep? underestimated? blocker? agent capacity?)
   - Can we still hit deadline with overtime/reprioritization?
   - If not, what's realistic new deadline?

2. **Proactive Client Communication (ASAP)**
   - Do NOT wait until deadline to tell them
   - Template:
     ```
     Hi [Client Name],
     
     I wanted to give you a heads-up on [deliverable].
     
     We've encountered [brief explanation: scope expanded / unexpected complexity / dependency delay]. 
     
     Original deadline: [date]
     Revised deadline: [date] (or [if still on track but tight]: We're working to hit the original deadline, but it'll be close. I wanted to keep you informed.)
     
     Here's what we're doing to get this to you ASAP:
     - [Specific action 1]
     - [Specific action 2]
     
     I'll update you daily until this is delivered.
     
     I apologize for the delay. Let me know if this impacts anything on your end.
     
     Best,
     [Agent or Harper]
     ```

3. **Execution**
   - Reprioritize agent workload (delay less urgent work)
   - Add extra QA to ensure quality doesn't suffer
   - Deliver on revised deadline or early

4. **Post-Incident**
   - Why did we underestimate? Update estimation process.
   - Was scope creep involved? Improve change request process.

---

### Scenario B: Deadline Missed (Realized Last-Minute)

**Response (immediately upon realization):**

1. **Notify Client Immediately**
   - Call or message, do not delay
   - Template:
     ```
     Hi [Client Name],
     
     I need to inform you that we will miss today's deadline for [deliverable].
     
     This is on us. [Brief honest explanation of what went wrong]
     
     New deadline: [specific date, typically within 24-48 hours]
     
     To make this right:
     - [What we're doing differently]
     - [Compensation, if appropriate: discount, rush priority, etc.]
     
     I'm personally overseeing this to ensure we deliver [date].
     
     I apologize for letting you down. This isn't our standard.
     
     Best,
     Harper (COO)
     ```

2. **All-Hands Fix**
   - Harper coordinates
   - Pull in resources from other agents if needed
   - QA review before delivery
   - Deliver ASAP, ideally within 24 hours

3. **Post-Incident**
   - Mandatory incident report (why did we not catch this earlier?)
   - Update monitoring/alerting to catch deadline risks earlier
   - If agent error, provide feedback and process training
   - Discuss in next weekly review

---

## 3. AI MAKES A MISTAKE

### Scenario A: Incorrect Information in Deliverable

**Response:**

1. **Assess Impact**
   - Has client acted on the incorrect information?
   - Could it cause harm (financial, reputational, operational)?

2. **Immediate Correction (within 2 hours of discovery)**
   - Notify client immediately
   - Template:
     ```
     Hi [Client Name],
     
     We've discovered an error in [deliverable, section X].
     
     Incorrect: [what we said]
     Correct: [what it should be]
     
     We've updated the deliverable and attached the corrected version.
     
     If you've already acted on this, please let us know immediately so we can help address any downstream impact.
     
     We're implementing additional verification steps to prevent this type of error.
     
     I apologize for the mistake.
     
     Best,
     [Agent or Harper]
     ```

3. **Internal Review**
   - Why did QA not catch this?
   - Was it a hallucination? Outdated training data? Misunderstood prompt?
   - Update QA checklist with specific check for this type of error

4. **Post-Incident**
   - If high-stakes information (legal, financial, technical), consider adding human expert review layer
   - Update prompt engineering if AI misunderstood intent

---

### Scenario B: AI Produces Offensive or Inappropriate Content

**Response (IMMEDIATE - within 15 minutes):**

1. **Pull Content Immediately**
   - If already sent to client, send urgent follow-up
   - Template:
     ```
     Hi [Client Name],
     
     Please disregard the previous message/deliverable. We're sending a corrected version immediately.
     
     I'll follow up with a full explanation shortly.
     
     Apologies,
     Harper
     ```

2. **Assess & Fix**
   - Regenerate content with better guardrails
   - Human review before resending

3. **Full Apology (within 1 hour)**
   - Template:
     ```
     Hi [Client Name],
     
     I want to personally apologize for the inappropriate content in [deliverable].
     
     This does not reflect our values or standards. Here's what happened: [brief technical explanation without making excuses].
     
     We've:
     - Implemented stricter content filters
     - Added mandatory human review for this type of content
     - Retrained our QA process
     
     Attached is the corrected [deliverable].
     
     If this has damaged your trust, I understand. We're committed to earning it back.
     
     Best,
     Harper (COO)
     ```

4. **Internal Review**
   - CEO + Harper + Tech Agent review
   - Implement content filters
   - Consider what other content types need human review

---

### Scenario C: AI Performance Degrades (Slow, Buggy, Unresponsive)

**Response:**

1. **Immediate Workaround**
   - Switch to backup system or manual process
   - Notify affected clients if there will be delays

2. **Technical Investigation**
   - Tech Agent diagnoses: API rate limits? Model degradation? Infrastructure issue?
   - Implement fix or escalate to vendor (OpenAI, etc.)

3. **Client Communication (if impacting delivery)**
   - Template:
     ```
     Hi [Client Name],
     
     We're experiencing a temporary technical issue that may delay [deliverable] by [timeframe].
     
     We've implemented a workaround and expect to deliver by [revised time].
     
     I'll keep you updated every [frequency].
     
     Best,
     [Agent or Harper]
     ```

4. **Post-Incident**
   - Improve monitoring to catch performance issues earlier
   - Consider redundancy (multiple model providers)

---

## 4. DATA BREACH OCCURS

**CRITICAL - P0 INCIDENT**

### Immediate Response (within 15 minutes of discovery)

1. **STOP THE BREACH**
   - Tech Agent: Isolate affected systems immediately
   - Revoke compromised credentials
   - Block unauthorized access

2. **Notify CEO + Harper Immediately**
   - All hands on deck
   - Do NOT communicate externally yet (need to assess scope first)

3. **Assess Scope (within 1 hour)**
   - What data was accessed?
   - How many clients affected?
   - How did breach occur?
   - Is breach still ongoing?

---

### Client Notification (within 4 hours of confirming scope)

**Legal Requirement:** Many jurisdictions require breach notification within 72 hours. Consult attorney immediately.

**Communication Template:**
```
URGENT: Security Incident Notification

Hi [Client Name],

I'm writing to inform you of a security incident that may have affected your data.

WHAT HAPPENED:
[Brief, factual description of the breach]

WHAT DATA WAS AFFECTED:
[Specific data types: names, emails, project files, etc.]

WHAT WE'RE DOING:
1. We've immediately secured our systems and stopped the breach
2. We're conducting a full forensic investigation
3. We've engaged cybersecurity experts to prevent recurrence
4. We're notifying all affected parties
5. [Any specific actions client should take, e.g., reset passwords]

WHAT YOU SHOULD DO:
[Specific recommended actions]

We take this extremely seriously. I will personally update you every [frequency] until this is fully resolved.

If you have questions or concerns, please contact me directly at [phone] or [email].

I apologize for this incident and the concern it may cause.

Best,
[CEO Name]
CEO, ClawOps
```

---

### Immediate Actions (First 24 Hours)

1. **Legal & Regulatory**
   - Engage attorney immediately
   - Determine notification requirements (GDPR, CCPA, etc.)
   - File required regulatory reports

2. **Technical**
   - Full security audit
   - Patch vulnerabilities
   - Implement additional security measures
   - Preserve evidence for forensic investigation

3. **Client Support**
   - Set up dedicated breach response hotline/email
   - Assign team members to respond to client questions
   - Consider offering credit monitoring or identity protection (if PII exposed)

4. **PR / Reputation Management**
   - Prepare public statement (if needed)
   - Monitor social media and press
   - Coordinate messaging across all channels

---

### Recovery Phase (Week 1-4)

1. **Full Incident Report**
   - Detailed timeline of breach
   - Root cause analysis
   - All data affected
   - Remediation steps taken

2. **Client Retention**
   - Offer discounts or service credits
   - Provide enhanced security for affected clients
   - Transparent ongoing updates

3. **System Hardening**
   - Implement findings from security audit
   - Penetration testing
   - Enhanced monitoring and alerting

4. **Insurance Claim**
   - File claim with cyber liability insurance
   - Document all costs and impacts

---

### Post-Incident (Long-Term)

1. **Mandatory Security Review**
   - Full team training on security best practices
   - Update all security protocols
   - Regular security audits (quarterly)

2. **Rebuild Trust**
   - Publish transparency report (what happened, what we learned, what we changed)
   - Achieve security certification (SOC 2, ISO 27001, etc.)
   - Third-party security validation

3. **Process Changes**
   - Data minimization (don't store what we don't need)
   - Encryption everywhere
   - Zero-trust architecture
   - Regular security drills

---

## 5. AGENT GOES DOWN

### Scenario A: Single Agent Unavailable

**Response (within 1 hour):**

1. **Assess Impact**
   - What client work is this agent currently handling?
   - Any deadlines in next 48 hours?

2. **Reassign Work**
   - Harper reassigns urgent tasks to other agents
   - Notify clients if delays expected
   - Template:
     ```
     Hi [Client Name],
     
     Quick update: We're experiencing a temporary issue with one of our systems, which may cause a slight delay in [deliverable].
     
     We've reassigned your project to ensure continuity. Expected delivery: [date].
     
     Let me know if you have any questions.
     
     Best,
     Harper
     ```

3. **Technical Fix**
   - Tech Agent investigates and restores service
   - If extended outage, implement workaround

4. **Post-Incident**
   - Why did agent go down? (Infrastructure? API? Bug?)
   - Improve redundancy
   - Update monitoring to catch failures faster

---

### Scenario B: Multiple Agents Down (System-Wide Outage)

**P0 - CRITICAL**

**Response (within 15 minutes):**

1. **All Hands Emergency**
   - CEO + Harper + Tech Agent
   - Assess scope: Is this infrastructure? API provider outage? Our bug?

2. **Client Communication (within 1 hour)**
   - Proactive notification to all active clients
   - Template:
     ```
     Hi [Client Name],
     
     We're currently experiencing a system outage affecting our services.
     
     Impact to you: [Specific impact to their project]
     
     We're working to restore service ASAP. Estimated resolution: [timeframe, if known].
     
     I'll update you every hour until resolved.
     
     For urgent needs, contact me directly at [phone].
     
     Apologies,
     Harper (COO)
     ```

3. **Status Page**
   - Update public status page (if we have one)
   - Provide real-time updates

4. **Recovery**
   - All hands until service restored
   - Hourly client updates
   - Once resolved, send all-clear message

5. **Post-Mortem (within 48 hours of resolution)**
   - Mandatory full team review
   - Root cause analysis
   - Prevention plan
   - Publish incident report to clients (transparency builds trust)

---

## COMMUNICATION TEMPLATES

### Generic Incident Notification

```
Hi [Client Name],

I'm reaching out about an issue with [affected item].

WHAT HAPPENED:
[Brief, honest explanation]

IMPACT TO YOU:
[Specific impact to their work]

WHAT WE'RE DOING:
1. [Action 1]
2. [Action 2]
3. [Action 3]

NEXT STEPS:
[What happens next, with timeline]

I'll update you by [specific time].

If you have questions or concerns, please reply or call me at [phone].

Best,
Harper (COO)
```

---

### Resolution Notification

```
Hi [Client Name],

Good news: The issue with [affected item] has been resolved.

RESOLUTION:
[What we did to fix it]

PREVENTION:
[What we're doing to prevent recurrence]

NEXT STEPS:
[Any actions needed from client, or what happens next]

Thank you for your patience. Please let me know if you experience any further issues.

Best,
Harper
```

---

## INCIDENT LOG

**Every incident must be logged in `/operations/incidents/YYYY-MM-DD-[short-description].md`**

**Template:**

```markdown
# Incident: [Short Title]
**Date:** YYYY-MM-DD  
**Severity:** P0 / P1 / P2 / P3  
**Owner:** [Name]  
**Status:** Open / Resolved

## Summary
[One-paragraph description of what happened]

## Timeline
- **HH:MM** - [Event]
- **HH:MM** - [Event]

## Impact
- Clients affected: [Number or names]
- Services affected: [List]
- Duration: [Timeframe]

## Root Cause
[Why did this happen?]

## Resolution
[How was it fixed?]

## Prevention
[What are we changing to prevent recurrence?]

## Action Items
- [ ] [Action 1] - Owner: [Name] - Due: [Date]
- [ ] [Action 2] - Owner: [Name] - Due: [Date]
```

---

## ESCALATION MATRIX

| Incident Type | Initial Response | Escalate To | Escalate When |
|---------------|------------------|-------------|---------------|
| Client unhappy | Harper (COO) | CEO | Client threatens to churn |
| Delivery late | Agent + Harper | CEO | > 48 hours late OR multiple missed deadlines |
| AI mistake | Agent + Harper | CEO + Tech | Offensive content OR high-stakes error |
| Data breach | Tech + CEO + Harper | Legal + Board | Any confirmed breach |
| Agent down | Tech Agent | Harper + CEO | > 2 hours downtime OR multiple agents down |

---

## QUARTERLY INCIDENT REVIEW

**Last Friday of Each Quarter:**

1. Review all incidents from the quarter
2. Identify patterns and trends
3. Update this playbook based on learnings
4. Celebrate improvements (e.g., "We had 50% fewer P1 incidents this quarter")

---

## REMEMBER

**When an incident occurs:**
1. Stay calm
2. Communicate proactively (don't make clients ask)
3. Own it (no excuses, no blame)
4. Fix it fast
5. Learn from it
6. Prevent it from happening again

**Incidents are opportunities to build trust through transparency and competence.**
