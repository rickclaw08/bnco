# Client Onboarding SOP - ClawOps Voice AI

**Target:** Every new client goes from intake form to live AI receptionist in 48 hours or less.

**Owner:** Operations Lead
**Last Updated:** 2026-02-28

---

## Batch Work Schedule (Weekly Cadence)

| Day        | Focus                          | Details                                            |
|------------|--------------------------------|----------------------------------------------------|
| Monday     | Discovery & Intake             | Sales handoffs, intake forms sent/collected, initial client calls |
| Tuesday    | Config & Build                 | System prompts, Twilio setup, voice config         |
| Wednesday  | Config & Build (overflow)      | Complex builds, integrations, multi-location setups |
| Thursday   | QA & Client Review             | Internal testing, client demo calls, revisions     |
| Friday     | Launch Day                     | Go-live, monitoring, client confirmation            |

For urgent/premium clients, compress the full cycle into 48 hours regardless of day.

---

## Phase 1: Intake & Initial Setup (Day 1, Hours 0-4)

### Step 1.1: Intake Form Received (Hour 0)

- [ ] Intake form arrives (from sales handoff or direct submission)
- [ ] Verify all required fields are complete:
  - Business name, industry, phone number
  - Business hours for every day
  - At least 5 common caller questions with answers
  - Escalation contacts (name + phone + email)
  - Brand voice preference selected
  - Transfer/emergency rules defined
- [ ] If incomplete: send follow-up within 1 hour requesting missing fields
- [ ] Assign Client ID (format: CL-YYYY-NNN, e.g., CL-2026-001)
- [ ] Create client folder in project management system
- [ ] Log in Client Health Dashboard

### Step 1.2: Config Generation (Hours 1-2)

- [ ] Provision Twilio phone number (local area code matching client)
- [ ] Configure call forwarding from client's existing number (if applicable)
- [ ] Set up voicemail fallback recording
- [ ] Generate system prompt from intake form data:
  - Business context and hours
  - FAQ responses (from common caller questions)
  - Booking flow (if scheduling system provided)
  - Transfer rules and escalation triggers
  - Brand voice tone and personality
  - Emergency protocols
  - Prohibited topics/phrases
- [ ] Configure after-hours behavior per client preference
- [ ] Set up call logging and recording

### Step 1.3: Account & Integrations (Hours 2-4)

- [ ] Create client account in dashboard (white-label if applicable)
- [ ] Apply branding (logo, colors) to client-facing portal
- [ ] Connect scheduling integration (if client uses Calendly, ServiceTitan, etc.)
- [ ] Set up daily/weekly report email delivery
- [ ] Configure SMS notifications for escalation contacts
- [ ] Document all credentials and config in client file (internal only)

---

## Phase 2: Voice AI Configuration & Testing (Day 1, Hours 4-8)

### Step 2.1: Voice AI Setup (Hours 4-5)

- [ ] Select voice model matching brand preference (formal, friendly, casual, etc.)
- [ ] Load system prompt into voice AI platform
- [ ] Configure speech-to-text sensitivity settings
- [ ] Set conversation timeout and max call duration
- [ ] Enable sentiment detection (for angry caller transfer triggers)
- [ ] Configure language support (English, Spanish, bilingual if requested)

### Step 2.2: System Prompt Refinement (Hours 5-6)

- [ ] Run 3 internal test calls covering:
  - Basic FAQ (hours, location, services)
  - Booking request flow
  - Transfer trigger scenario
- [ ] Refine prompt based on test results:
  - Fix any incorrect responses to FAQ
  - Adjust conversation flow if AI sounds robotic or off-brand
  - Verify transfer triggers fire correctly
  - Confirm after-hours message plays properly
- [ ] Document prompt version (v1.0, v1.1, etc.)

### Step 2.3: Internal Test Calls (Hours 6-8)

- [ ] Run full test call suite (minimum 5 scenarios):
  1. New customer asking about services and pricing
  2. Existing customer scheduling an appointment
  3. Angry/frustrated caller (test sentiment transfer)
  4. After-hours call
  5. Emergency scenario (industry-specific)
- [ ] Record all test calls for QA review
- [ ] Log results in QA checklist (see below)
- [ ] Fix any issues found, re-test failed scenarios

---

## Phase 3: QA Testing & Client Review (Day 2, Hours 0-4)

### Step 3.1: Mandatory QA Checklist

**Every client must pass ALL items before go-live. No exceptions.**

#### Call Quality (test as a real caller)

- [ ] **Mobile test (cellular):** Call from a real mobile phone on cellular network. Verify:
  - AI answers within 2 rings
  - Voice is clear, no audio artifacts or lag
  - Conversation flows naturally
  - Caller can interrupt the AI mid-sentence (barge-in works)
  - Call ends cleanly

- [ ] **Mobile test (Wi-Fi):** Repeat from mobile on Wi-Fi connection
  - Same checks as above

- [ ] **Landline/desktop test:** Call from a desk phone or desktop softphone
  - Same checks as above
  - Verify DTMF tones work if menu options are configured

#### Functionality

- [ ] Greeting matches approved script
- [ ] All FAQ answers are accurate (test each one from intake form)
- [ ] Business hours are stated correctly for each day
- [ ] Booking flow collects all required information
- [ ] Transfer to human works (rings correct escalation number)
- [ ] Transfer timeout falls back to voicemail gracefully
- [ ] After-hours message is appropriate
- [ ] Emergency protocol triggers correctly
- [ ] AI stays in scope (does not answer questions outside its domain)
- [ ] AI identifies itself correctly (name, business)

#### Edge Cases

- [ ] Caller says nothing for 10 seconds (AI prompts or gracefully ends)
- [ ] Caller speaks a different language (AI handles per config)
- [ ] Background noise test (AI still understands caller)
- [ ] Rapid-fire questions (AI handles without breaking)
- [ ] Caller asks to speak to a manager/human (transfer triggers)

#### Compliance & Safety

- [ ] AI does not share confidential business information
- [ ] AI does not provide medical, legal, or financial advice (unless specifically scoped)
- [ ] AI does not make promises outside its authority
- [ ] Call recording disclosure plays where legally required
- [ ] HIPAA/PCI compliance verified (if applicable)

### Step 3.2: Client Review Call (Hours 2-4)

- [ ] Schedule 30-minute review call with client
- [ ] Walk client through:
  - How the AI sounds (play recorded test call)
  - Dashboard access and call reports
  - How to reach us for changes
  - What to expect in the first week
- [ ] Collect client feedback and make final adjustments
- [ ] Get verbal or written go-live approval
- [ ] If revisions needed: loop back to Phase 2, re-test changed items only

---

## Phase 4: Go-Live & Monitoring (Day 2, Hours 4-8)

### Step 4.1: Activation (Hour 4-5)

- [ ] Switch call routing to live (activate Twilio forwarding)
- [ ] Verify first live call connects properly (place test call yourself)
- [ ] Confirm call logs are recording
- [ ] Confirm escalation SMS/email notifications fire
- [ ] Send go-live confirmation to client:
  - "Your AI receptionist is now live on [phone number]"
  - Include dashboard login link
  - Include support contact info
  - Include first-week expectations

### Step 4.2: Day-One Monitoring (Hours 5-8)

- [ ] Monitor first 5-10 live calls in real-time (or review recordings within 1 hour)
- [ ] Watch for:
  - Unexpected questions the AI can't handle
  - Audio quality issues on live calls
  - Transfer failures
  - Caller confusion or frustration
- [ ] Hotfix any issues immediately
- [ ] Send end-of-day summary to client (even if everything went smoothly)

---

## Phase 5: Activation Sequence (14-Day Check-In Cadence)

Post-launch retention is everything. Follow this sequence for every client, no exceptions.

### Day 1 (Go-Live Day)

- [ ] Go-live confirmation sent (see Phase 4)
- [ ] Monitor all calls, fix issues in real-time
- [ ] End-of-day summary to client

### Day 3 (First Check-In)

- [ ] Review all call logs from first 72 hours
- [ ] Identify top 3 areas for prompt improvement
- [ ] Send client a quick update:
  - Total calls handled
  - Any issues found and fixed
  - "How's it going on your end?"
- [ ] Make prompt adjustments based on real call data

### Day 7 (One-Week Review)

- [ ] Pull weekly call report
- [ ] Schedule 15-minute check-in call with client
- [ ] Review:
  - Call volume and handling rate
  - Any missed or failed calls
  - Client satisfaction so far
  - Additional FAQ or scenarios to add
- [ ] Update system prompt with new learnings (version bump)
- [ ] Re-test any changed functionality

### Day 14 (Two-Week Milestone)

- [ ] Pull full two-week performance report
- [ ] Calculate key metrics:
  - Total calls handled
  - Successful resolution rate
  - Transfer rate (lower is better, unless expected)
  - Average call duration
  - Client satisfaction (ask directly)
- [ ] Send formal report to client
- [ ] Ask for testimonial/review if client is happy
- [ ] Identify upsell opportunities:
  - Additional locations
  - Higher plan tier
  - Add-on integrations
  - SMS/chat expansion
- [ ] Transition client from "onboarding" to "active" in dashboard
- [ ] Set renewal reminder in calendar

### Ongoing (Monthly)

- [ ] Monthly performance report sent automatically
- [ ] NPS survey sent (simple 1-10 score + one open question)
- [ ] Quarterly business review for Pro/Enterprise clients
- [ ] Monitor churn risk indicators (see Client Health Dashboard)

---

## Troubleshooting Quick Reference

| Issue                         | Fix                                                        |
|-------------------------------|-----------------------------------------------------------|
| AI not answering              | Check Twilio routing, verify number is active              |
| Poor audio quality            | Check voice model settings, test different codec           |
| AI giving wrong answers       | Update system prompt FAQ section, re-test                  |
| Transfers not working         | Verify escalation number, check transfer config            |
| Client unhappy with voice     | Swap voice model, adjust tone in prompt                    |
| High transfer rate            | Add more FAQ content, expand AI's knowledge base           |
| Calls dropping                | Check Twilio account balance, review error logs            |
| After-hours not triggering    | Verify timezone settings, check business hours config      |

---

## Escalation Path

1. **Operations Lead** handles routine onboarding issues
2. **Technical Lead** for integration failures, Twilio issues, voice model problems
3. **Brand (Founder)** for client relationship issues, refund requests, custom deals

---

*SOP version 1.0 | ClawOps | Updated 2026-02-28*
