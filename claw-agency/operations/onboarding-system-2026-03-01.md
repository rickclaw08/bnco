# ClawOps Zero-Friction Onboarding System
## Payment Received to Live AI Receptionist in Under 48 Hours
### Authored by Harper (COO) | March 1, 2026

**Objective:** When we close a deal, the client should hear their AI receptionist answering their phone within 48 hours. No friction. No excuses. Speed is our competitive moat.

---

## PART 1: Step-by-Step Onboarding Checklist

### Phase 0: Payment Confirmed (Hour 0)

| Step | Action | Owner | Time Estimate | Dependencies | Status |
|------|--------|-------|---------------|--------------|--------|
| 0.1 | Payment received and confirmed in Stripe/invoicing system | Morgan (CFO) | 0-15 min | Signed contract | [ ] |
| 0.2 | Client assigned Client ID (CL-YYYY-NNN) | Harper (COO) | 5 min | Payment confirmed | [ ] |
| 0.3 | Internal Slack/channel notification: "NEW CLIENT: [name]" | Harper (COO) | 2 min | Client ID assigned | [ ] |
| 0.4 | Client folder created in project structure | Cadence (PM) | 10 min | Client ID assigned | [ ] |
| 0.5 | Welcome email sent with intake form link | Cadence (PM) | 15 min | Client folder created | [ ] |

**Phase 0 Total: 30 minutes max from payment to welcome email.**

### Phase 1: Business Info Collection (Hours 0-8)

| Step | Action | Owner | Time Estimate | Dependencies | Status |
|------|--------|-------|---------------|--------------|--------|
| 1.1 | Client completes intake form (business info, hours, FAQs, contacts, brand voice) | CLIENT | 20-45 min | Welcome email received | [ ] |
| 1.2 | If intake form not received within 4 hours: follow-up call or text | Cadence (PM) | 10 min | 4-hour timer | [ ] |
| 1.3 | Intake form reviewed for completeness | Harper (COO) | 15 min | Intake form received | [ ] |
| 1.4 | Missing fields flagged and follow-up sent within 30 min | Cadence (PM) | 15 min | Review complete | [ ] |
| 1.5 | Client info logged in Client Health Dashboard | Cadence (PM) | 10 min | Complete intake form | [ ] |

**Phase 1 Total: 1-8 hours (depends on client response speed). Our part takes 50 minutes. The bottleneck is the client filling out the form.**

**Speed hack:** If the client is on a call when they close, Ember (AE) walks them through the intake form live on the call. Shaves hours off the timeline.

### Phase 2: System Configuration (Hours 4-16)

| Step | Action | Owner | Time Estimate | Dependencies | Status |
|------|--------|-------|---------------|--------------|--------|
| 2.1 | Provision Twilio phone number (local area code matching client) | Ethan (CTO) | 15 min | Complete intake form | [ ] |
| 2.2 | Generate system prompt from intake form data (business context, FAQs, booking flow, transfer rules, brand voice) | Ethan (CTO) | 45 min | Complete intake form | [ ] |
| 2.3 | Select and configure voice model (tone matching brand preference) | Ethan (CTO) | 15 min | System prompt generated | [ ] |
| 2.4 | Configure call routing: forwarding from client's existing number OR new number setup | Ethan (CTO) | 20 min | Twilio number provisioned | [ ] |
| 2.5 | Configure after-hours behavior (voicemail, message-taking, emergency transfer) | Ethan (CTO) | 15 min | System prompt generated | [ ] |
| 2.6 | Set up call logging, recording, and transcription | Ethan (CTO) | 15 min | Twilio configured | [ ] |
| 2.7 | Configure escalation/transfer rules (human handoff triggers) | Ethan (CTO) | 15 min | System prompt generated | [ ] |
| 2.8 | Connect scheduling integration if applicable (Calendly, ServiceTitan, etc.) | Ethan (CTO) | 30 min | Client provides access | [ ] |
| 2.9 | Set up client dashboard access (call logs, transcripts, reports) | Harper (COO) | 20 min | System configured | [ ] |
| 2.10 | Configure automated daily/weekly email reports for client | Harper (COO) | 15 min | Dashboard set up | [ ] |

**Phase 2 Total: ~3.5 hours of active work. Can run in parallel with Phase 1 (start provisioning Twilio as soon as payment confirms).**

### Phase 3: Phone Number Porting/Forwarding (Hours 8-24)

| Step | Action | Owner | Time Estimate | Dependencies | Status |
|------|--------|-------|---------------|--------------|--------|
| 3.1 | Determine routing method: call forwarding (fast) vs. full port (slow) | Ethan (CTO) | 10 min | Intake form Section 2 | [ ] |
| 3.2a | **If forwarding:** Client sets up call forwarding from their carrier to Twilio number | CLIENT + Cadence | 15 min | Twilio number provisioned | [ ] |
| 3.2b | **If porting:** Initiate port request with Twilio (takes 1-4 weeks - use forwarding as interim) | Ethan (CTO) | 30 min | Client LOA signed | [ ] |
| 3.3 | Verify inbound calls reach Twilio number successfully | Ethan (CTO) | 10 min | Forwarding/number active | [ ] |
| 3.4 | Test outbound caller ID displays correctly | Ethan (CTO) | 10 min | Routing confirmed | [ ] |

**Phase 3 Total: 30-60 minutes. Always use call forwarding for 48-hour onboarding. Full porting is a background process that happens later if needed.**

### Phase 4: Testing (Hours 16-36)

| Step | Action | Owner | Time Estimate | Dependencies | Status |
|------|--------|-------|---------------|--------------|--------|
| 4.1 | Internal test calls - 5 scenarios minimum (see QA checklist below) | Ethan (CTO) | 45 min | System fully configured | [ ] |
| 4.2 | Fix issues found in testing, re-test failed scenarios | Ethan (CTO) | 30 min | Test results reviewed | [ ] |
| 4.3 | Schedule 30-min client review call | Cadence (PM) | 10 min | Internal QA passed | [ ] |
| 4.4 | Walk client through live demo call + dashboard | Harper (COO) | 30 min | Review call scheduled | [ ] |
| 4.5 | Collect client feedback, make final adjustments | Ethan (CTO) | 30 min | Client feedback received | [ ] |
| 4.6 | Client gives verbal or written go-live approval | CLIENT | 5 min | Review complete | [ ] |
| 4.7 | "System Ready for Testing" email sent to client | Cadence (PM) | 10 min | Internal QA passed | [ ] |

**Phase 4 Total: ~2.5 hours of active work.**

#### QA Test Scenarios (Mandatory - All Must Pass)

1. **New customer inquiry:** Caller asks about services and pricing
2. **Appointment booking:** Caller wants to schedule a service
3. **Angry caller:** Frustrated tone triggers sentiment-based transfer
4. **After-hours call:** Correct after-hours behavior plays
5. **Emergency scenario:** Industry-specific emergency protocol fires correctly
6. **Edge case - silence:** Caller says nothing for 10 seconds
7. **Edge case - "talk to a human":** Transfer to live person triggers immediately

### Phase 5: Go-Live (Hours 36-48)

| Step | Action | Owner | Time Estimate | Dependencies | Status |
|------|--------|-------|---------------|--------------|--------|
| 5.1 | Activate live call routing (flip the switch) | Ethan (CTO) | 5 min | Client go-live approval | [ ] |
| 5.2 | Place verification call to confirm live system works | Ethan (CTO) | 10 min | Routing activated | [ ] |
| 5.3 | Verify call logs recording in dashboard | Harper (COO) | 5 min | Live call placed | [ ] |
| 5.4 | Verify escalation SMS/email notifications fire | Harper (COO) | 10 min | Live call placed | [ ] |
| 5.5 | Send "Go-Live Confirmation" email to client | Cadence (PM) | 10 min | All verifications passed | [ ] |
| 5.6 | Monitor first 5-10 live calls (review within 1 hour of each) | Harper (COO) | 60 min | System live | [ ] |
| 5.7 | Send end-of-day-one summary to client | Cadence (PM) | 15 min | Day 1 monitoring complete | [ ] |
| 5.8 | Log go-live in Client Health Dashboard | Cadence (PM) | 5 min | Go-live confirmed | [ ] |

**Phase 5 Total: ~2 hours including monitoring.**

### Total Timeline Summary

| Phase | Active Work Time | Calendar Time | Bottleneck |
|-------|-----------------|---------------|------------|
| 0: Payment Confirmed | 30 min | 30 min | None |
| 1: Business Info Collection | 50 min | 1-8 hours | Client filling out form |
| 2: System Configuration | 3.5 hours | 4-12 hours | Can start early |
| 3: Phone Number Setup | 30-60 min | 1-4 hours | Client carrier cooperation |
| 4: Testing | 2.5 hours | 4-8 hours | Client availability for review |
| 5: Go-Live | 2 hours | 2-4 hours | Monitoring window |
| **TOTAL** | **~10 hours work** | **24-48 hours calendar** | **Client responsiveness** |

---

## PART 2: Onboarding Email Templates

### Email 1: Welcome & Intake

```
Subject: Welcome to ClawOps - Your AI Receptionist Setup Starts Now

Hi [Client First Name],

You made a great call. (Pun intended.)

We're kicking off your AI receptionist setup right now. Our target: your phone
answered by AI within 48 hours.

Here's what we need from you to hit that timeline:

STEP 1: COMPLETE YOUR INTAKE FORM (15-20 minutes)
[INTAKE FORM LINK]

This form captures everything we need to build your AI receptionist:
your business hours, common caller questions, how you want calls handled,
and your brand voice preferences. The faster you complete this, the faster
we go live.

STEP 2: PHONE SETUP (we'll guide you through this)
We'll either set up call forwarding from your current number or provision
a new local number for you. We'll send instructions once your intake form
is in.

WHAT HAPPENS NEXT:
- We build and configure your AI receptionist (same day)
- We run internal testing (5+ call scenarios)
- We schedule a 30-minute review call with you to demo the system
- You approve, we go live

YOUR DEDICATED CONTACTS:
- Operations: [Harper/Cadence contact info]
- Technical: [Ethan contact info]
- For anything urgent, text or call [support number]

One ask: please complete the intake form within the next 4 hours if possible.
Every hour of delay on the form = an hour of delay on your go-live.

Let's get your phone answered.

Best,
[Name]
ClawOps
```

### Email 2: System Ready for Testing

```
Subject: Your AI Receptionist is Built - Ready for Your Review

Hi [Client First Name],

Your AI receptionist is configured and has passed our internal quality checks.
Here's what's ready:

WHAT WE BUILT:
- AI receptionist trained on your business info, hours, and FAQs
- [X] common caller scenarios programmed and tested
- Call forwarding configured to [Twilio number]
- After-hours handling set to [voicemail/message-taking/emergency transfer]
- Dashboard access ready at [dashboard link]

WHAT WE TESTED:
- New customer inquiries: PASS
- Appointment booking flow: PASS
- Angry caller transfer: PASS
- After-hours behavior: PASS
- Emergency protocol: PASS

NEXT STEP: 30-MINUTE REVIEW CALL
We'd like to walk you through a live demo so you can hear exactly how your
AI receptionist sounds. You'll be able to request adjustments before we go live.

Schedule your review call here: [SCHEDULING LINK]
Or reply to this email with 2-3 times that work for you this week.

YOUR DASHBOARD:
You already have access. Log in at [dashboard link] to see:
- Call logs and recordings
- Full transcripts of every conversation
- Appointments booked
- Missed call recovery stats

Login credentials:
- Email: [client email]
- Temporary password: [password] (you'll be prompted to change it)

We're on track for go-live within [X hours] of your review call.

Best,
[Name]
ClawOps
```

### Email 3: Go-Live Confirmation

```
Subject: You're Live - Your AI Receptionist is Answering Calls Now

Hi [Client First Name],

It's official. Your AI receptionist is live and answering calls on
[phone number] as of [date/time].

WHAT'S HAPPENING RIGHT NOW:
- Every call to [phone number] is being answered by your AI receptionist
- Call logs, transcripts, and recordings are flowing into your dashboard
- Our team is monitoring your first calls to ensure everything runs smoothly

YOUR DASHBOARD: [dashboard link]
Check it anytime to see real-time call activity, full transcripts,
appointments booked, and performance metrics.

WHAT TO EXPECT THIS WEEK:
- Day 1 (today): We monitor every call. You'll get an end-of-day summary.
- Day 3: We review your first 72 hours of call data and fine-tune the AI
  based on real conversations.
- Day 7: We schedule a 15-minute check-in to review your first week's
  performance report and make any adjustments.

HOW TO REACH US:
- Dashboard issues: [support email]
- Urgent (AI not answering, wrong info): text [support number] - we respond
  within 30 minutes during business hours
- Non-urgent changes (add FAQ, update hours): email [support email] - handled
  within 4 business hours

TWO QUICK ASKS:
1. Call your own number in the next hour and test it yourself. See how it
   sounds. If anything feels off, let us know immediately.
2. Let your staff know: calls are now being answered by AI first. Transfers
   to humans still work exactly as before.

Welcome aboard. Your phone is covered.

Best,
[Name]
ClawOps

P.S. If you know another business owner drowning in missed calls, we'd love
an introduction. We take care of people who come through referrals.
```

---

## PART 3: Client Dashboard Requirements

### What the Client Needs to See

The dashboard is the client's proof that we're worth every dollar. It should answer one question: "Is my AI receptionist working?"

#### Dashboard Sections

**1. Real-Time Overview (Home Screen)**

| Element | Description | Update Frequency |
|---------|-------------|-----------------|
| Today's Calls | Total calls received today, with handled/transferred/missed breakdown | Real-time |
| Status Indicator | Green = system healthy, Yellow = minor issue, Red = down | Real-time |
| Active Call | If a call is happening right now, show it (duration, caller number) | Real-time |
| This Week Summary | Total calls, AI resolution rate, avg call duration | Hourly |
| Quick Actions | "Listen to last call", "View today's transcripts", "Update business hours" | Always visible |

**2. Call Logs**

| Data Point | Details |
|------------|---------|
| Date/Time | When the call came in |
| Caller Number | Masked partially for privacy (optional) |
| Call Duration | In minutes:seconds |
| Outcome | Handled by AI / Transferred to human / Voicemail / Missed |
| Transcript | Full text of the conversation (expandable) |
| Recording | Playback button for audio |
| Sentiment | Positive / Neutral / Negative tag |
| Action Taken | Appointment booked, info provided, message taken, etc. |
| Notes | Auto-generated summary of the call |

**3. Transcripts**

| Feature | Description |
|---------|-------------|
| Full Text | Searchable, timestamped transcript of each call |
| Speaker Labels | AI vs. Caller clearly distinguished |
| Keyword Highlighting | Key terms highlighted (appointment, emergency, complaint, etc.) |
| Export | Download as PDF or CSV |

**4. Appointments Booked**

| Data Point | Details |
|------------|---------|
| Date/Time of Appointment | When the client was booked for |
| Caller Info | Name, phone, email (as collected by AI) |
| Service Requested | What the caller wanted |
| Confirmation Status | Confirmed / Pending / Cancelled |
| Calendar Sync | Shows in connected calendar (Google, Calendly, etc.) |

**5. Missed Call Recovery Stats**

| Metric | Description |
|--------|-------------|
| Calls Before AI | Historical missed call rate (if data available) |
| Calls Caught by AI | Calls that would have gone to voicemail but AI answered |
| After-Hours Calls Handled | Calls outside business hours the AI took |
| Messages Collected | Contact info captured from callers who would have hung up |
| Revenue Recovered (estimated) | Based on average deal value x calls caught |
| Recovery Rate | % of calls handled by AI that would have been missed |

**6. Performance Metrics (Weekly/Monthly)**

| Metric | Description |
|--------|-------------|
| Total Calls | Volume trend over time (chart) |
| AI Resolution Rate | % of calls handled without human transfer |
| Average Call Duration | Trend over time |
| Transfer Rate | % of calls sent to a human |
| Customer Satisfaction | Based on post-call survey (if enabled) |
| Top Questions Asked | What callers ask most (helps client improve their business) |
| Peak Call Times | Heat map showing busiest hours/days |
| Response Time | Average time to answer (should be <2 rings) |

**7. Settings (Client-Editable)**

| Setting | Client Can Change |
|---------|------------------|
| Business Hours | Yes - update hours per day |
| FAQ Answers | Yes - add/edit common Q&A |
| Escalation Contacts | Yes - update who gets transfers |
| After-Hours Behavior | Yes - toggle between voicemail/message/transfer |
| Notification Preferences | Yes - email frequency, SMS alerts |
| Dashboard Users | Yes - invite staff with view-only or admin access |

### Dashboard Technical Requirements

- **Responsive:** Works on desktop and mobile (client will check from their phone)
- **Load Time:** Dashboard loads in under 2 seconds
- **Data Freshness:** Call logs update within 60 seconds of call completion
- **Access:** Secure login with email + password, optional 2FA
- **White-Label:** For agency partners, dashboard shows their branding, not ours
- **Export:** All data exportable as CSV or PDF
- **API:** REST API for clients who want to pull data into their own systems (Pro/Enterprise only)

---

## PART 4: The Day 1-7 Pilot Experience

### Overview

The first 7 days determine whether a client stays forever or churns at renewal. Every day has a purpose. Every day the client sees value.

### Day 1: Go-Live Day

**What happens:**
- AI receptionist goes live on their phone number
- ClawOps team monitors every call in real-time
- Client receives go-live confirmation email with dashboard access
- Client tests the system by calling their own number

**What the client sees:**
- Dashboard showing first calls coming in
- Real-time call logs and transcripts populating
- End-of-day summary email: "Your AI handled [X] calls today. Here's what callers asked."

**What we track:**
| Metric | Target |
|--------|--------|
| Calls answered | 100% (zero missed) |
| Audio quality | Clear, no lag or artifacts |
| AI accuracy | Correct responses to FAQ |
| Transfer success | Transfers reach the right person |
| Client engagement | Did they log into the dashboard? |

**Internal action:** Review every call recording. Fix any prompt issues same-day.

### Day 2: First Full Day

**What happens:**
- AI handles a full business day of calls without hand-holding
- We review all call logs and identify patterns
- No client contact unless we find an issue (let them experience it naturally)

**What the client sees:**
- Dashboard data growing - more calls, more transcripts
- Automatic daily email summary: call volume, outcomes, any appointments booked

**What we track:**
| Metric | Target |
|--------|--------|
| Resolution rate | 80%+ calls handled without transfer |
| Caller satisfaction | No caller hang-ups from frustration |
| FAQ coverage | Are callers asking questions the AI can't answer? |
| After-hours handling | Correct behavior outside business hours |

**Internal action:** Log any new FAQ questions the AI couldn't answer. Prep prompt update.

### Day 3: First Check-In

**What happens:**
- Cadence sends a brief check-in email or text: "How's it going? Anything feel off?"
- We push a prompt update based on Day 1-2 call data (add any missing FAQs, refine responses)
- Client gets a "72-Hour Report" with stats and improvements made

**What the client sees:**
- 72-hour performance summary (total calls, resolution rate, appointments booked)
- List of improvements we already made: "We noticed callers asking about [X], so we added that to your AI's knowledge"
- Proof we're watching and optimizing, not just set-and-forget

**What we track:**
| Metric | Target |
|--------|--------|
| Client response to check-in | Within 24 hours |
| Prompt improvements deployed | 3+ based on real data |
| Resolution rate improvement | Trending up from Day 1 |
| Client dashboard logins | At least 2 in first 3 days |

**Internal action:** Update system prompt (version bump to v1.1). Re-test any changed scenarios.

### Day 4: Quiet Confidence

**What happens:**
- No proactive outreach unless there's an issue
- System runs, data accumulates, client gets used to the rhythm
- We continue monitoring call quality in the background

**What the client sees:**
- Daily email summary (automated)
- Dashboard showing consistent call handling
- Growing confidence that the system just works

**What we track:**
| Metric | Target |
|--------|--------|
| System uptime | 100% |
| Call volume trend | Stable or growing |
| Transfer rate | Decreasing (AI handling more) |
| Error/failure rate | 0% |

### Day 5: Optimization Push

**What happens:**
- Full review of all call data from Days 1-4
- Identify top 3 optimization opportunities (prompt refinement, new FAQ entries, better routing)
- Deploy prompt v1.2 with improvements
- Send a brief update to client: "We've fine-tuned your AI based on 5 days of real call data"

**What the client sees:**
- Update email showing specific improvements made
- Dashboard metrics improving (higher resolution rate, lower transfer rate)
- Feeling that ClawOps is proactively making things better without being asked

**What we track:**
| Metric | Target |
|--------|--------|
| Resolution rate | 85%+ |
| Top unanswered questions | 0 (all addressed in prompt) |
| Average call duration | Optimizing (not too short, not too long) |
| Client satisfaction signal | Positive response to update email |

### Day 6: Upsell Seed Planting

**What happens:**
- No overt sales - just plant seeds
- If client is on Growth/Pro plan: mention features they haven't activated yet
- If client has multiple locations: ask casually if other locations could use it
- Internal: prepare the 7-day report

**What the client sees:**
- Business as usual, system running smoothly
- Maybe a casual mention: "By the way, we noticed you get a lot of Spanish-speaking callers. Want us to enable bilingual mode?"

**What we track:**
| Metric | Target |
|--------|--------|
| Upsell opportunity identified | 1+ per client |
| Client engagement | Still logging into dashboard |
| Call volume baseline | Established for future comparison |

### Day 7: One-Week Review

**What happens:**
- Schedule and conduct 15-minute check-in call with client
- Present the 7-day performance report (professional, data-driven)
- Ask directly: "What do you like? What do you want changed?"
- Collect a testimonial if the client is happy (even informal - "Can I quote you on that?")
- Identify and document upsell opportunities

**What the client sees:**
- A polished 7-day report with real numbers:
  - Total calls handled
  - AI resolution rate (with trend line)
  - Appointments booked through AI
  - After-hours calls caught (that would have been missed)
  - Estimated revenue recovered from missed call prevention
  - Top caller questions and how AI handled them
- A clear picture of ROI: "Your AI receptionist handled [X] calls this week. Based on your average deal value of $[Y], we estimate [Z] in revenue that would have been missed."

**What we track:**
| Metric | Target |
|--------|--------|
| Client satisfaction (verbal) | Positive / willing to continue |
| Testimonial collected | Yes (even informal quote) |
| Upsell conversation started | Natural mention, no hard sell |
| Issues remaining | 0 critical, 0-1 minor |
| Client retention signal | Strong (engaged, responsive, positive) |

**Internal action:** Transition client from "onboarding" to "active" in dashboard. Set Day 14 and Day 30 check-in reminders.

### Day 1-7 Metrics Dashboard (Internal)

| Metric | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 | Target |
|--------|-------|-------|-------|-------|-------|-------|-------|--------|
| Calls Handled | | | | | | | | 100% |
| AI Resolution Rate | | | | | | | | 85%+ |
| Transfer Rate | | | | | | | | <15% |
| Avg Call Duration | | | | | | | | Optimizing |
| Missed/Failed Calls | | | | | | | | 0 |
| Client Dashboard Logins | | | | | | | | Daily |
| Prompt Version | v1.0 | v1.0 | v1.1 | v1.1 | v1.2 | v1.2 | v1.2 | Improving |
| Client Satisfaction | - | - | Check | - | Update | - | Review | Positive |
| System Uptime | | | | | | | | 100% |

### Success Criteria: Pilot Passes If...

1. AI resolution rate is 80% or higher by Day 7
2. Zero system downtime during the pilot
3. Client logged into dashboard at least 3 times
4. Client responded positively at Day 3 check-in AND Day 7 review
5. No unresolved critical issues
6. At least one prompt optimization deployed based on real call data

### Failure Signals: Escalate If...

1. AI resolution rate below 60% by Day 3
2. Client unresponsive to Day 3 check-in (call them directly)
3. Multiple caller hang-ups due to AI confusion
4. Client explicitly expresses dissatisfaction
5. System downtime exceeding 30 minutes

**If any failure signal triggers:** Harper and Ethan run a same-day war room. Fix the root cause, re-test, and send the client a personal update within 4 hours.

---

## Appendix A: Onboarding Speed Hacks

These are tactics to compress the 48-hour timeline even further:

1. **Live intake on the closing call.** Ember walks the client through the intake form while they're still excited. Saves 4-8 hours of waiting.
2. **Pre-built industry templates.** Restaurant, HVAC, dental, legal prompts pre-configured. Just swap in business-specific details. Saves 30+ minutes on system config.
3. **Twilio number pre-provisioned.** Keep a pool of 10 numbers ready in top metro areas. No provisioning delay.
4. **Parallel processing.** Start Twilio setup and system config as soon as payment hits - don't wait for intake form. Use industry defaults, customize later.
5. **Client call forwarding guide.** Pre-written instructions for AT&T, Verizon, T-Mobile, Spectrum, etc. Send immediately so client can set up while we build.

## Appendix B: Agent Responsibility Summary

| Agent | Onboarding Role | Key Deliverable |
|-------|----------------|-----------------|
| Morgan (CFO) | Payment confirmation | Invoice sent, payment verified |
| Harper (COO) | Onboarding oversight, dashboard setup, monitoring | Client live within 48 hours |
| Cadence (PM) | Client communication, scheduling, follow-ups | Intake collected, review call booked |
| Ethan (CTO) | System build, Twilio config, prompt engineering, testing | Working AI receptionist |
| Ember (AE) | Live intake on closing call (speed hack) | Warm handoff to operations |
| Pact (Contracts) | Contract and ToS | Signed agreement on file |

## Appendix C: Integration with Battle Plan

This onboarding system is designed to support the March Battle Plan's targets:
- **Week 1:** 1-2 deals closed, onboarded within 48 hours each
- **Week 2:** 5 deals, parallel onboarding (stagger by 1 day to manage capacity)
- **Week 3-4:** 8-11 deals/week. At this volume, we need batched onboarding (Mon/Wed intake, Tue/Thu build, Fri go-live) to maintain quality.

**Capacity limit without additional help:** 3 concurrent onboardings. Beyond that, we need to batch or bring on additional tech support.

---

*Document version 1.0 | Harper (COO) | March 1, 2026*
*Next review: March 7, 2026 (after first real client onboarding)*
