# Client Delivery Playbook - AI Receptionist for Contractors
**Product:** ClawOps AI Receptionist
**Price:** $2,500 setup + $250/mo
**Stack:** VAPI voice AI (Elliot voice, Jordan Belfort-style prompt) + GHL CRM + Twilio + post-call SMS/email
**Owner:** Harper (COO) | Last Updated: 2026-03-13
**Version:** 1.0

> This is the single source of truth for delivering our AI Receptionist product. Every step from payment to go-live. No guessing, no improvising.

---

## TABLE OF CONTENTS

1. [Service Level Agreements (SLAs)](#1-service-level-agreements-slas)
2. [Client Onboarding Checklist](#2-client-onboarding-checklist)
3. [Client Welcome Email Template](#3-client-welcome-email-template)
4. [Day 1 Setup Email Template](#4-day-1-setup-email-template)
5. [Quality Assurance Checklist](#5-quality-assurance-checklist)
6. [Escalation Protocol](#6-escalation-protocol)

---

## 1. SERVICE LEVEL AGREEMENTS (SLAs)

What we promise. What we deliver. No exceptions.

### Delivery Timeline

| Milestone | SLA | Hard Deadline | Owner |
|-----------|-----|---------------|-------|
| Payment confirmation + welcome email | Within 1 hour of payment | Same day | Harper |
| Client intake form sent | Immediately (auto-triggered with welcome email) | Same day | Harper |
| Intake form follow-up (if not completed) | 12 hours after send | 24 hours max | Harper |
| VAPI assistant cloned + customized | Within 8 hours of receiving intake form | 12 hours max | Ethan |
| Phone number provisioned (Twilio) | Within 4 hours of intake form | 8 hours max | Ethan |
| GHL sub-account created + configured | Within 8 hours of intake form | 12 hours max | Harper |
| First test call (internal QA) | Within 18 hours of payment | 24 hours max | Ethan |
| Client test call (they hear their AI) | Within 24 hours of payment | 24 hours max | Ethan + Harper |
| QA checklist completed | Within 36 hours of payment | 40 hours max | Harper |
| Full go-live (call forwarding active) | Within 48 hours of payment | 48 hours hard cap | Ethan |
| Post-go-live confirmation call | Within 2 hours of go-live | Same day | Harper |

### Support SLAs (Post Go-Live)

| Support Type | Response Time | Resolution Time |
|-------------|---------------|-----------------|
| Critical (AI completely down, no calls answered) | 15 minutes | 1 hour |
| High (AI answering but wrong info, failed transfers) | 30 minutes | 4 hours |
| Medium (minor prompt issues, SMS formatting, etc.) | 2 hours (business hours) | 24 hours |
| Low (feature requests, prompt tweaks, cosmetic) | Same business day | 48 hours |
| Monthly check-in call | Proactively scheduled | N/A |

**Business hours:** Monday-Friday, 9 AM - 6 PM ET
**Emergency line:** Available 24/7 for Critical issues (AI completely down)

### What "Go-Live" Means

Go-live is NOT just "the AI answers." Go-live means ALL of the following are verified:
- [ ] AI answers calls with correct business name, greeting, and personality
- [ ] AI captures caller info accurately (name, phone, service needed, urgency)
- [ ] Post-call SMS fires within 60 seconds
- [ ] Post-call email fires within 5 minutes
- [ ] Emergency calls route correctly
- [ ] GHL contact is created with all captured data
- [ ] GHL pipeline stage is set correctly
- [ ] Call recordings are logging
- [ ] Client can see leads in their GHL dashboard

---

## 2. CLIENT ONBOARDING CHECKLIST

Copy this entire section for each new client. Check off every single item. Skip nothing.

### PHASE 1: PAYMENT + ADMIN (Hour 0-1)

**Trigger:** Stripe payment of $2,500 received.

- [ ] **Stripe payment confirmed** - Verify $2,500 setup fee cleared in Stripe dashboard
- [ ] **Invoice generated** - Auto-generated receipt sent to client email
- [ ] **Client folder created** - `clients/[client-name]/` with sub-folders:
  ```
  clients/[client-name]/
    contracts/        # Payment receipt, terms of service
    intake/           # Completed intake form, business assets
    config/           # VAPI config, GHL config, phone number details
    qa/               # QA test results, call recordings
    communications/   # Key emails, notes
    reports/          # Monthly performance reports
  ```
- [ ] **Client added to master tracker** - Update `operations/client-registry.md` with:
  - Client name, business name, contact email, phone
  - Payment date, subscription start date
  - Assigned DRI (Directly Responsible Individual)
  - Current status: `ONBOARDING`
- [ ] **Welcome email sent** - (see Section 3 below) - within 1 hour of payment
- [ ] **Client intake form sent** - Attached to or linked in welcome email
- [ ] **Internal Slack/Discord notification** - Alert team: "NEW CLIENT: [Business Name] - Clock starts now"

### PHASE 2: CLIENT INTAKE (Hour 1-24)

**Trigger:** Client submits intake form. If not received within 12 hours, follow up by phone.

**Intake Form Must Capture:**

Business Information:
- [ ] Business legal name
- [ ] DBA / brand name (what AI should say)
- [ ] Business address (service area)
- [ ] Business phone number (the one calls will forward FROM)
- [ ] Website URL
- [ ] Owner/manager name + direct cell number

Hours and Availability:
- [ ] Business hours for each day of the week
- [ ] After-hours handling preference (voicemail, emergency only, or full AI)
- [ ] Holiday schedule / planned closures

Services Offered:
- [ ] Complete list of services with brief descriptions
- [ ] Pricing ranges (if they want AI to quote) or "call for estimate"
- [ ] Most common services (for AI to prioritize)
- [ ] Services they do NOT offer (so AI can politely decline)
- [ ] Service area / geographic boundaries

Team Information:
- [ ] Staff names the AI might reference (owner, dispatchers, techs)
- [ ] Who should be mentioned as "the person who will call you back"
- [ ] Scheduling person's name and contact

Emergency Protocols:
- [ ] What qualifies as an emergency for this business (e.g., gas leak, burst pipe, no heat)
- [ ] Emergency dispatch phone number
- [ ] Emergency instructions (does AI transfer live? Take info and escalate? Both?)
- [ ] After-hours emergency protocol (different from business hours?)

Call Handling Preferences:
- [ ] Preferred AI receptionist name (we suggest one, they can change)
- [ ] Tone preference (friendly and casual? Professional? Somewhere in between?)
- [ ] Specific phrases to use or avoid
- [ ] Competitor names to watch for (do they want to know if callers mention competitors?)
- [ ] How to handle solicitors / spam calls

Follow-Up Preferences:
- [ ] Post-call SMS - confirm they want it, review template
- [ ] Post-call email - confirm they want it, review template
- [ ] Who receives lead notifications (email + phone for SMS alerts)
- [ ] Preferred notification method (email, SMS, both, GHL dashboard only)

Existing Systems:
- [ ] Current phone provider (for call forwarding setup)
- [ ] Current CRM (if any - we're replacing with GHL)
- [ ] Any existing call answering service (we're replacing this)
- [ ] Google Business Profile (for consistency)

### PHASE 3: TECHNICAL SETUP (Hour 4-18)

**Trigger:** Intake form received and reviewed.

**3A - VAPI Assistant Setup**
- [ ] Clone base VAPI assistant template for contractor niche
- [ ] Customize system prompt with client's specific data:
  - Business name, AI name, greeting
  - Services list with descriptions
  - Business hours per day
  - Emergency rules and dispatch number
  - FAQ responses from intake form
  - Tone/personality per client preference
- [ ] Set voice to Elliot (or client-preferred if specified)
- [ ] Configure Jordan Belfort-style closing prompt elements:
  - Urgency injection ("We can get someone out as early as [next available]")
  - Value reframe on hesitation ("Most homeowners who wait end up paying 2-3x more")
  - Soft close on every call ("Let me get you on the schedule")
- [ ] Configure VAPI tool functions:
  - `capture_caller_info` - name, phone, address, service, urgency
  - `schedule_callback` - preferred time, reason
  - `flag_emergency` - trigger emergency protocol
- [ ] Set up VAPI webhook to push call data to GHL
- [ ] Test VAPI assistant in sandbox (internal call, not connected to Twilio yet)

**3B - Phone Number Provisioning (Twilio)**
- [ ] Purchase local phone number in client's area code (Twilio)
- [ ] Configure voice webhook to VAPI endpoint
- [ ] Configure status callback URL
- [ ] Test inbound call to new number (internal)
- [ ] Document number in client config: `clients/[client-name]/config/phone-number.md`
- [ ] Verify SMS capability on the number (for post-call texts)

**3C - GHL Sub-Account Setup**
- [ ] Create GHL sub-account for client
- [ ] Configure custom fields:
  - Caller name, phone, address
  - Service requested, urgency level
  - Call recording URL, transcript summary
  - Lead source: "AI Receptionist"
  - Call timestamp
- [ ] Create pipeline: "Inbound Leads"
  - Stages: New Lead > Contacted > Estimate Scheduled > Job Booked > Completed
- [ ] Configure automations:
  - On new contact (from VAPI webhook): create opportunity in "New Lead" stage
  - Trigger post-call SMS (within 60 seconds of call end)
  - Trigger post-call email (within 5 minutes of call end)
  - Notification to client (email + SMS) on every new lead
- [ ] Set up post-call SMS template:
  ```
  Hi [Caller Name], thanks for calling [Business Name]! 
  We got your info and someone will be reaching out shortly 
  to help with your [service requested]. 
  If this is urgent, reply URGENT and we'll prioritize you.
  ```
- [ ] Set up post-call email template (professional, branded, includes next steps)
- [ ] Configure lead notification to client owner:
  ```
  NEW LEAD from AI Receptionist:
  Name: [name]
  Phone: [phone]
  Service: [service]
  Urgency: [level]
  Summary: [AI transcript summary]
  Call Recording: [link]
  ```
- [ ] Grant client dashboard access (email invite)
- [ ] Create client login credentials, document in config

**3D - Call Forwarding Setup**
- [ ] Determine client's current phone provider
- [ ] Provide client with call forwarding instructions specific to their provider:
  - Carrier-based forwarding (most common for contractors using cell phones)
  - VoIP forwarding (if they use RingCentral, Vonage, etc.)
  - Google Voice forwarding
  - Landline forwarding
- [ ] Two forwarding options to discuss with client:
  - **Option A: Full forward** - All calls go to AI first (recommended)
  - **Option B: Overflow forward** - Calls forward to AI only if not answered in X rings
- [ ] Test call forwarding with client on the phone (confirm call routes correctly)
- [ ] Document forwarding configuration in `clients/[client-name]/config/call-forwarding.md`

### PHASE 4: TESTING (Hour 18-36)

**Trigger:** All technical setup complete.

- [ ] Run full QA checklist (see Section 5 below) - ALL items must pass
- [ ] Record at least 3 internal test calls with different scenarios
- [ ] Client test call #1 - Harper calls with client listening (screen share or speakerphone)
  - Walk client through what the AI does
  - Show them the GHL dashboard in real-time
  - Show them the SMS and email that fires after the call
- [ ] Client test call #2 - Client calls themselves, solo
  - Let them experience it as their customer would
  - Debrief immediately: what do they want changed?
- [ ] Implement any client-requested changes
- [ ] Re-test after changes
- [ ] Client signs off: "This is ready for my real customers"
- [ ] Sign-off documented (email confirmation or message screenshot saved to `clients/[client-name]/communications/`)

### PHASE 5: GO-LIVE (Hour 36-48)

**Trigger:** Client sign-off received. QA checklist 100% passed.

- [ ] Activate call forwarding to live number
- [ ] Monitor first 5 live calls in real-time (check VAPI logs, GHL dashboard)
- [ ] Verify post-call SMS and email fire correctly on live calls
- [ ] Verify GHL contacts and pipeline are populating correctly
- [ ] Send "Day 1 Setup Complete" email (see Section 4 below)
- [ ] Schedule 24-hour check-in call with client
- [ ] Schedule 72-hour check-in call with client
- [ ] Schedule Week 1 review call with client
- [ ] Update client status in registry: `ONBOARDING` -> `LIVE`
- [ ] Start 30-day intensive monitoring period

### PHASE 6: POST GO-LIVE (Day 2-30)

**Trigger:** Client is live.

- [ ] 24-hour check-in call - review first day of calls, any issues?
- [ ] 72-hour check-in call - review call quality, lead capture accuracy
- [ ] Week 1 review - pull call stats, discuss any prompt adjustments
- [ ] Week 2 check-in - brief call or email, ensure everything smooth
- [ ] Week 4 / Month 1 review - full performance report:
  - Total calls handled
  - Leads captured
  - Conversion rate (calls to scheduled jobs)
  - SMS/email delivery rate
  - Average call duration
  - Client satisfaction
- [ ] Invoice first monthly payment ($250) at 30-day mark
- [ ] Collect testimonial / review (if client is happy)
- [ ] Offer referral incentive ("Know another contractor? We'll give you a free month")
- [ ] Transition from intensive monitoring to standard support

---

## 3. CLIENT WELCOME EMAIL TEMPLATE

**Send within:** 1 hour of payment confirmation
**From:** Brand Lio, ClawOps <rickclaw08@gmail.com>
**Subject:** You're In - Here's What Happens Next [ClawOps AI Receptionist]

---

Hi [Client First Name],

Welcome to ClawOps. Your payment of $2,500 has been received and your setup has officially started.

Here is exactly what happens from here:

**NEXT 24 HOURS:**
1. You will receive a Client Intake Form (link below or attached). Fill this out as completely as possible - it tells us everything we need to build your AI receptionist. Business name, hours, services, emergency protocols, the works.
2. We start building your AI receptionist immediately once we have your intake form.
3. You will hear your AI receptionist on a test call within 24 hours.

**NEXT 48 HOURS:**
4. We fine-tune the AI based on your feedback from the test call.
5. We set up your GHL dashboard where you will see every lead that comes in.
6. We activate call forwarding and your AI receptionist goes live.

**WHAT WE NEED FROM YOU RIGHT NOW:**

Complete your intake form here: [INTAKE FORM LINK]

This is the single biggest thing that determines how fast we move. The sooner you fill it out, the sooner your receptionist is live and catching calls you are currently missing.

If you get stuck on any question, skip it and we will fill in the gaps on our setup call.

**YOUR SUPPORT:**
- Email: rickclaw08@gmail.com
- Response time: Within 2 hours during business hours (Mon-Fri, 9 AM - 6 PM ET)
- Emergency (AI completely down): [EMERGENCY CONTACT - 24/7]

**YOUR SLAs:**
- First test call: Within 24 hours
- Fully live and taking calls: Within 48 hours
- Monthly service: $250/month, billed on the [DATE] of each month

We built this to make you money from day one. Every call your AI answers is a call that would have gone to voicemail or a competitor. That changes now.

Let's get you set up.

Brand Lio
ClawOps
[PHONE]

P.S. - Have questions before filling out the form? Reply to this email or text me directly. I respond fast.

---

## 4. DAY 1 SETUP EMAIL TEMPLATE

**Send when:** AI receptionist is live and verified (all QA passed, call forwarding active)
**From:** Brand Lio, ClawOps <rickclaw08@gmail.com>
**Subject:** Your AI Receptionist is LIVE - Here's Everything You Need to Know

---

Hi [Client First Name],

Your AI receptionist for [Business Name] is live and answering calls right now.

Here is everything you need to know:

**YOUR AI RECEPTIONIST:**
- Name: [AI Name, e.g., "Mike"]
- Phone number: [Twilio Number] (calls forwarding from your main number)
- Voice: Professional, friendly, [personality summary]
- Active: [Hours, e.g., "24/7" or "During business hours only"]

**WHAT HAPPENS ON EVERY CALL:**
1. Your AI answers with: "[Greeting, e.g., Hey, thanks for calling Business Name! This is Mike. What can I do for you?]"
2. It captures the caller's name, phone number, what they need, and how urgent it is
3. For emergencies, it [describe emergency protocol: transfers to dispatch / takes info and texts you immediately]
4. Within 60 seconds of the call ending, the caller gets a follow-up text from your business
5. Within 5 minutes, they get a follow-up email
6. You get a lead notification with all the details, including the call recording

**YOUR DASHBOARD:**
Log in to your GHL dashboard to see every lead, listen to call recordings, and track your pipeline:
- Dashboard URL: [GHL LOGIN URL]
- Username: [EMAIL]
- Password: [TEMP PASSWORD - prompt to change on first login]

**WHAT YOU SHOULD DO:**
1. **Check your dashboard once in the morning and once in the evening** - see new leads, follow up on hot ones
2. **Follow up on leads within 1 hour** - the AI captures them, but you close them. Speed wins
3. **Listen to call recordings** - at least the first 5-10 calls. This helps you tell us if anything needs adjusting
4. **Text or email us feedback** - "The AI should mention we do free estimates" or "It's pronouncing our business name wrong" - we fix things fast

**YOUR UPCOMING CHECK-INS:**
- 24-hour check-in: [DATE/TIME] - quick call to review your first day
- 72-hour check-in: [DATE/TIME] - review call quality and any adjustments
- Week 1 review: [DATE/TIME] - full performance review with call stats

**SUPPORT:**
- Email: rickclaw08@gmail.com
- Response time: Within 2 hours during business hours
- If your AI goes completely down (no calls being answered): [EMERGENCY CONTACT - 24/7, 15-min response]

**MONTHLY SERVICE:**
- $250/month starting [BILLING START DATE]
- Includes: unlimited calls, AI receptionist operation, GHL CRM, post-call SMS and email, monthly performance reports, prompt adjustments as needed
- Does NOT include: complete AI personality overhaul, additional phone numbers, custom integrations (quoted separately)

Your receptionist is going to start making you money immediately. Every call that used to go to voicemail now gets answered, the lead gets captured, and the follow-up happens automatically.

Let's make this week a great one.

Brand Lio
ClawOps

P.S. - If a customer mentions the AI to you ("I talked to your answering service"), that is totally normal. Most callers don't realize it's AI. If they do, they're usually impressed. Roll with it.

---

## 5. QUALITY ASSURANCE CHECKLIST

**Run this BEFORE any client goes live. Every item must pass. No exceptions.**

### 5A - VOICE QUALITY TESTS

| # | Test | Pass/Fail | Notes |
|---|------|-----------|-------|
| 1 | AI answers within 2 rings (under 6 seconds) | | |
| 2 | Greeting is clear, natural, correct business name | | |
| 3 | AI name matches what client approved | | |
| 4 | Voice (Elliot) sounds natural, not robotic | | |
| 5 | Speaking pace is conversational (not too fast, not too slow) | | |
| 6 | No audio glitches, static, or cutting out | | |
| 7 | AI waits for caller to finish before responding (no interrupting) | | |
| 8 | Background is clean (no weird artifacts or noise) | | |

### 5B - PROMPT ACCURACY TESTS

| # | Test | Pass/Fail | Notes |
|---|------|-----------|-------|
| 1 | AI correctly states business name in greeting | | |
| 2 | AI correctly describes services when asked | | |
| 3 | AI correctly states business hours when asked | | |
| 4 | AI correctly handles "what's your address/location?" | | |
| 5 | AI correctly handles pricing questions (quotes range or "free estimate") | | |
| 6 | AI correctly declines services not offered ("We don't do that, but...") | | |
| 7 | AI uses client-approved tone (casual, professional, etc.) | | |
| 8 | AI references correct staff names when appropriate | | |
| 9 | AI does NOT make up information not in the config | | |
| 10 | AI handles "Can I speak to [owner name]?" correctly | | |

### 5C - CALL SCREENING AND LEAD CAPTURE TESTS

| # | Test | Pass/Fail | Notes |
|---|------|-----------|-------|
| 1 | AI captures caller's full name | | |
| 2 | AI captures caller's phone number | | |
| 3 | AI captures caller's address/location (if applicable) | | |
| 4 | AI captures service requested | | |
| 5 | AI captures urgency level | | |
| 6 | AI attempts to schedule/book (soft close) | | |
| 7 | Captured data appears correctly in GHL contact record | | |
| 8 | GHL pipeline opportunity created in correct stage | | |
| 9 | Call recording is saved and accessible | | |
| 10 | Call transcript/summary is accurate | | |

### 5D - POST-CALL FOLLOW-UP TESTS

| # | Test | Pass/Fail | Notes |
|---|------|-----------|-------|
| 1 | Post-call SMS fires within 60 seconds | | |
| 2 | SMS content is correct (business name, caller name, service) | | |
| 3 | SMS is from correct sender number | | |
| 4 | Post-call email fires within 5 minutes | | |
| 5 | Email content is correct and professionally formatted | | |
| 6 | Email "from" name is client's business name | | |
| 7 | Client lead notification fires (email/SMS to owner) | | |
| 8 | Lead notification contains all captured data + recording link | | |

### 5E - EDGE CASE TESTS (Critical)

| # | Test | Pass/Fail | Notes |
|---|------|-----------|-------|
| 1 | **Hang up immediately** - AI handles gracefully, no errors in logs | | |
| 2 | **Silence (10+ seconds)** - AI prompts caller, doesn't loop/crash | | |
| 3 | **Wrong number** ("Is this Pizza Hut?") - AI redirects politely | | |
| 4 | **Angry caller** - AI stays calm, empathetic, de-escalates | | |
| 5 | **Solicitor/spam** - AI politely declines, ends call efficiently | | |
| 6 | **Spanish speaker** - AI responds appropriately (English-only disclosure or bilingual if configured) | | |
| 7 | **Emergency call** - Correct emergency protocol triggers | | |
| 8 | **Emergency transfer** - Call routes to dispatch number correctly | | |
| 9 | **Multiple questions rapid-fire** - AI handles without confusion | | |
| 10 | **Caller asks "Are you AI/a robot?"** - AI responds per client preference (disclose or deflect) | | |
| 11 | **Background noise/poor connection** - AI asks to repeat, doesn't hallucinate | | |
| 12 | **Caller wants to schedule but no availability given** - AI captures info for callback | | |
| 13 | **Repeat caller** - AI handles naturally (doesn't re-ask info if CRM has it) | | |
| 14 | **After-hours call** - Correct after-hours behavior (if different from daytime) | | |
| 15 | **Caller gives partial info then wants to hang up** - AI still captures what it got | | |

### 5F - SYSTEM HEALTH TESTS

| # | Test | Pass/Fail | Notes |
|---|------|-----------|-------|
| 1 | VAPI endpoint responds (health check) | | |
| 2 | Twilio number is active and routing correctly | | |
| 3 | GHL webhooks receiving data | | |
| 4 | GHL automations triggering correctly | | |
| 5 | Call forwarding from client's number reaches AI | | |
| 6 | Monitoring/alerting is configured for this client | | |
| 7 | Fallback behavior works if VAPI is down (voicemail or direct to client) | | |

### QA SIGN-OFF

```
QA Completed By: _______________
Date: _______________
Total Tests: 45
Passed: ___/45
Failed: ___/45
Blocked: ___/45

ALL TESTS MUST PASS BEFORE GO-LIVE.
If any test fails, fix the issue, re-run the specific test, and update this form.

Sign-off: [ ] APPROVED FOR GO-LIVE   [ ] NOT APPROVED - See notes
```

---

## 6. ESCALATION PROTOCOL

What happens when the AI fails on a live client call. Because it will happen eventually. We need to be ready.

### SEVERITY LEVELS FOR AI FAILURES

**LEVEL 1 - CRITICAL: AI is completely down (not answering calls at all)**
- Client impact: 100% of calls going unanswered
- Detection: Monitoring alert, client report, or manual check
- Response time: 15 minutes
- Who's paged: Ethan (CTO) + Brand (CEO) immediately

**LEVEL 2 - HIGH: AI is answering but broken (wrong info, crashing mid-call, not capturing data)**
- Client impact: Calls answered but quality is terrible
- Detection: Client report, QA spot-check, GHL data gaps
- Response time: 30 minutes
- Who's paged: Ethan (CTO) + Harper (COO)

**LEVEL 3 - MEDIUM: AI has minor issues (pronunciation, occasional wrong info, SMS delay)**
- Client impact: Functional but not perfect
- Detection: Client feedback, call recording review
- Response time: 2 hours (business hours)
- Who's paged: Harper (COO)

**LEVEL 4 - LOW: AI needs tweaks (client wants different greeting, add a FAQ, etc.)**
- Client impact: None, enhancement request
- Detection: Client request
- Response time: Same business day
- Who's paged: Harper (COO)

### ESCALATION RESPONSE PLAYBOOK

#### LEVEL 1: AI COMPLETELY DOWN

**Minute 0-5: Detection and Triage**
1. Confirm the AI is actually down (test call, check VAPI dashboard, check Twilio logs)
2. Identify the failure point:
   - Is Twilio down? Check status.twilio.com
   - Is VAPI down? Check VAPI dashboard/API
   - Is the integration broken? Check webhook logs
   - Is it a billing issue? Check Twilio/VAPI account status

**Minute 5-10: Activate Failover**
3. **IMMEDIATE FAILOVER:** Redirect client's calls away from the broken AI:
   - Option A: Update Twilio call forwarding to route directly to client's cell phone
   - Option B: Update Twilio to play a professional voicemail message
   - Option C: If VAPI-specific, switch to backup VAPI assistant (if available)
4. Failover command reference:
   ```
   # Emergency redirect to client's cell:
   # Update Twilio number webhook to forward directly
   # OR use Twilio TwiML bin with <Dial> to client's number
   ```

**Minute 10-15: Client Communication**
5. Call the client directly (phone, not email):
   ```
   "[Client Name], this is [Your Name] from ClawOps. I want to let you know 
   we detected an issue with your AI receptionist about [X] minutes ago. 
   We've already activated a backup so your calls are still being handled. 
   We're working on restoring full AI service now and I'll update you within 
   [30 minutes / 1 hour]. Your callers are not being missed."
   ```
6. If you can't reach them by phone, send immediate SMS + email with the same message.

**Minute 15-60: Fix**
7. Resolve the root cause
8. Restore AI service
9. Run 3 test calls to verify
10. Monitor for 30 minutes after restoration

**Post-Incident:**
11. Call client with resolution confirmation
12. Send incident report email within 24 hours:
    - What happened
    - When it happened
    - How long it lasted
    - What we did
    - What we're doing to prevent it
13. If downtime exceeded 1 hour: offer service credit (pro-rated day off next invoice)
14. Document in `clients/[client-name]/incidents/`
15. Update monitoring to catch this failure mode faster

#### LEVEL 2: AI ANSWERING BUT BROKEN

**Minute 0-15: Assessment**
1. Listen to recent call recordings to understand the failure
2. Check VAPI logs for errors
3. Check GHL for data integrity (are contacts being created? Are they accurate?)

**Minute 15-30: Decide: Failover or Fix in Place**
- If the AI is saying something actively harmful (wrong business, offensive content, giving out wrong number): **Activate failover immediately** (same as Level 1)
- If it's degraded but functional (some data missing, occasional error): **Fix in place**, don't disrupt service

**Minute 30-120: Fix and Verify**
4. Push prompt/config fix to VAPI
5. Run 3 test calls covering the specific failure scenarios
6. Monitor next 5 live calls

**Client Communication:**
- If failover was activated: Same as Level 1 protocol
- If fixed in place: Email/text client within 2 hours explaining what was adjusted
- If client reported it: Thank them, explain fix, offer to review call recordings together

#### LEVEL 3: MINOR ISSUES

1. Log the issue in client's folder
2. Schedule fix within 24 hours
3. Push fix, test, confirm
4. Notify client: "We made an adjustment based on [their feedback / our monitoring]. You should notice [specific improvement]."

#### LEVEL 4: ENHANCEMENT REQUESTS

1. Log request in client's folder
2. Evaluate scope: is it included in their plan or a custom add-on?
3. If included: implement within 48 hours, notify when done
4. If custom: quote the work, get approval, then implement

### MONITORING SETUP (Per Client)

Every live client gets:
- [ ] VAPI health check: Ping every 5 minutes, alert if no response for 2 consecutive checks
- [ ] Twilio number check: Automated test call every 6 hours (call, verify AI answers, hang up)
- [ ] GHL webhook check: Verify data is flowing after each call
- [ ] Daily call log review: Harper reviews call recordings and GHL data every morning
- [ ] Weekly stats pull: Total calls, leads captured, SMS/email delivery rate, average call duration

### CLIENT COMMUNICATION TEMPLATES FOR INCIDENTS

**Incident Detected (sent immediately):**
```
Hi [Client Name], this is [Your Name] from ClawOps. We detected a brief 
issue with your AI receptionist at [TIME]. We've activated a backup to 
ensure your calls are still being handled and are working on a full fix now. 
I'll update you within [TIMEFRAME]. No calls are being missed.
```

**Incident Resolved (sent on resolution):**
```
Hi [Client Name], your AI receptionist is back to full operation as of [TIME]. 
The issue was [brief, non-technical explanation]. We've put additional monitoring 
in place to prevent this from happening again. If you notice anything off, 
text me directly. - [Your Name]
```

**Incident Report (sent within 24 hours, email):**
```
Subject: Incident Report - [Date] - [Client Business Name]

Hi [Client Name],

Here's a summary of the service disruption on [date]:

WHAT HAPPENED: [Plain English explanation]
WHEN: Detected at [time], resolved at [time] ([duration])
IMPACT: [X calls during this window were handled by backup/voicemail]
ROOT CAUSE: [Brief technical cause]
WHAT WE DID: [Steps taken to resolve]
PREVENTION: [What we're doing so this doesn't happen again]

[If applicable: As a courtesy, we're crediting [amount] on your next invoice.]

We take uptime seriously. If you have any questions, I'm here.

Best,
[Your Name]
ClawOps
```

---

## APPENDIX A: FIRST CLIENT CHECKLIST (PROOF OF CONCEPT PRIORITIES)

Our first client is our case study. Extra care applies:

- [ ] Over-communicate: check in daily for the first week, not just at scheduled times
- [ ] Record everything: screenshots of GHL, call stats, lead counts - this becomes marketing material
- [ ] Ask for a video testimonial at the Week 2 mark (if they're happy)
- [ ] Ask permission to use their results as a case study (anonymized or named)
- [ ] Document every issue and how we resolved it - this builds our knowledge base
- [ ] Track ROI metrics: calls answered vs. previous baseline, leads captured, jobs booked
- [ ] Get a Google review and/or written testimonial by Week 4
- [ ] Offer referral incentive: "Know another contractor? Refer them and get a free month"

---

## APPENDIX B: MONTHLY RECURRING SERVICE CHECKLIST

What $250/month covers. Run this every month per client:

- [ ] Review all call recordings for quality (sample at least 20% or 10 calls, whichever is higher)
- [ ] Pull monthly stats report:
  - Total calls answered
  - Leads captured
  - SMS/email delivery rate
  - Emergency calls handled
  - Average call duration
  - Any failed/dropped calls
- [ ] Send monthly performance report to client (email)
- [ ] Prompt adjustments based on call recording review
- [ ] GHL pipeline audit: are leads being followed up on by client?
- [ ] Check-in call with client (15-30 minutes)
- [ ] Invoice $250 monthly fee
- [ ] Verify all systems healthy (VAPI, Twilio, GHL, forwarding)

---

## APPENDIX C: COST PER CLIENT (OUR MARGINS)

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Twilio phone number | ~$1.15/mo | Per number |
| Twilio inbound voice | ~$0.0085/min | Variable with volume |
| VAPI (or OpenAI Realtime) | ~$0.06/min | Variable with volume |
| GHL sub-account | ~$0-97/mo | Depends on GHL plan (agency unlimited vs per-sub) |
| Post-call SMS (Twilio) | ~$0.0079/msg | Per outbound SMS |
| Post-call email (GHL) | Included | GHL handles this |
| **Estimated total (200 calls/mo, 3 min avg)** | **~$55-150/mo** | Depends on call volume and GHL plan |
| **Client pays** | **$250/mo** | |
| **Margin** | **$100-195/mo** | ~40-78% gross margin on recurring |

Setup fee ($2,500) is almost entirely margin after initial labor (our time to set up).

---

*This playbook is a living document. Update it after every client onboarding. What broke? What could be faster? What did the client love? Feed it back in.*
