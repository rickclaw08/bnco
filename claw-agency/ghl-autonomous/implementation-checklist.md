# Implementation Checklist - Get Live TODAY

> Ordered, actionable checklist. Work top to bottom. Each item has an estimated time.
> Total estimated time: 4-6 hours for core system, +2 hours for polish.
> Prerequisites: GHL account access, Google Sheets access, phone.

---

## Phase 1: Foundation (45 min)

### GHL Custom Fields & Tags

- [ ] **(5 min)** Log into GHL: https://app.gohighlevel.com → ClawOps location
- [ ] **(10 min)** Create custom fields (Settings > Custom Fields):
  - [ ] Trade Niche (Dropdown): HVAC, Plumbing, Electrical, Roofing, General Contractor
  - [ ] Company Size (Dropdown): Solo, 2-5, 6-15, 16-50, 50+
  - [ ] Call Attempt Count (Number)
  - [ ] Last Call Outcome (Dropdown): No Answer, Voicemail, Connected - Not Interested, Connected - Interested, Callback Requested
  - [ ] Preferred Callback Time (Date/Time)
  - [ ] Lead Temperature (Dropdown): Cold, Warm, Hot
  - [ ] Timezone (Dropdown): Eastern, Central, Mountain, Pacific
- [ ] **(10 min)** Create tags:
  - [ ] Niche: `niche:hvac`, `niche:plumbing`, `niche:electrical`, `niche:roofing`, `niche:general`
  - [ ] Source: `source:lead-sheet-import`, `source:inbound-demo`, `source:outbound-campaign`
  - [ ] Status: `voice-ai:engaged`, `voice-ai:demo-requested`, `voice-ai:declined`
  - [ ] Campaign: `campaign:founding-member-wave1`, `campaign:outbound-march2026`
  - [ ] System: `bad-number`, `do-not-contact`
- [ ] **(10 min)** Update "Voice AI Leads" pipeline stages:
  - [ ] New Lead
  - [ ] Call Attempted
  - [ ] Voicemail Left
  - [ ] Connected - Interested
  - [ ] Demo Booked
  - [ ] Demo Completed
  - [ ] Proposal Sent
  - [ ] Won - Founding Member
  - [ ] Lost - Not Interested
  - [ ] Lost - No Contact
  - [ ] Lost - Bad Fit

---

## Phase 2: Lead Import (30 min)

- [ ] **(5 min)** Open Google Sheets with 42 leads
- [ ] **(5 min)** Add columns if missing: Trade Niche, Timezone (based on area code/address)
- [ ] **(5 min)** Export as CSV
- [ ] **(10 min)** Import to GHL (Contacts > Import):
  - [ ] Map: Company Name, Contact First Name, Last Name, Phone, Email, Trade Niche, City, State
  - [ ] Verify phone format (E.164)
- [ ] **(5 min)** Post-import:
  - [ ] Bulk-apply niche tags based on Trade Niche field
  - [ ] Apply `source:lead-sheet-import` to all
  - [ ] Apply `campaign:founding-member-wave1` to all
  - [ ] Add all to "Voice AI Leads" pipeline > "New Lead" stage

---

## Phase 3: Voice AI Agent Configuration (60 min)

### Option A: Multiple Agents (if plan allows)

- [ ] **(10 min each, 50 min total)** Create 5 Voice AI agents:
  - [ ] **HVAC Agent:**
    - Name: ClawOps AI - HVAC Receptionist
    - Model: GPT 5.1
    - Voice: Archer
    - System Prompt: Copy from `niche-voice-agents.md` > HVAC section
    - Enable call recording + transcription
  - [ ] **Plumbing Agent:**
    - Same settings, plumbing prompt
  - [ ] **Electrical Agent:**
    - Same settings, electrical prompt
  - [ ] **Roofing Agent:**
    - Same settings, roofing prompt
  - [ ] **General Contractor Agent:**
    - Same settings, GC prompt
- [ ] **(10 min)** Test each agent with a manual call - verify it sounds right

### Option B: Single Agent with Tag-Based Routing

- [ ] **(15 min)** Update existing "ClawOps AI Receptionist" with dynamic prompting:
  - Use the General Contractor prompt as default
  - Set up workflow to swap prompt based on contact's niche tag before call
- [ ] **(5 min)** Test with a tagged contact

---

## Phase 4: Phone Number Setup (15 min)

### Minimum Viable (Single Number)
- [ ] **(5 min)** Verify +1 888-457-8980 is active and routed to Voice AI
- [ ] **(5 min)** Enable outbound calling on this number
- [ ] **(5 min)** Test outbound: manually trigger a call to your own phone

### Upgraded (Multiple Numbers) - Do later if needed
- [ ] Purchase 5 additional numbers (Settings > Phone Numbers)
- [ ] Assign each to a niche Voice AI agent
- [ ] Register all numbers with CNAM/caller ID

---

## Phase 5: Calendar Verification (10 min)

- [ ] **(5 min)** Verify "ClawOps Demo Call" calendar settings:
  - [ ] Availability: Mon-Fri, 9 AM - 6 PM EST
  - [ ] Duration: 30 minutes
  - [ ] Buffer: 15 minutes
  - [ ] Max per day: 6
  - [ ] Booking window: 1-14 days
  - [ ] Confirmation emails/SMS: ON
  - [ ] Reminder: 24h + 1h before
- [ ] **(5 min)** Get the booking link URL - you'll need this for SMS follow-ups
  - Save URL: ____________________________

---

## Phase 6: Workflow Automations (90 min)

### 6.1 Outbound Call Sequence (30 min)

- [ ] **(30 min)** Build workflow: `Auto-Outbound: Voice AI Lead Campaign`
  - [ ] Trigger: Contact enters "New Lead" stage
  - [ ] Wait condition: Next business day, 10 AM - 12 PM in contact's timezone
  - [ ] Branch: Check Trade Niche field > route to appropriate agent/prompt
  - [ ] Action: Initiate Voice AI outbound call
  - [ ] Post-call: Update Call Attempt Count +1
  - [ ] Branch: Call outcome
    - [ ] Answered + Interested > Tag + move stage
    - [ ] Answered + Not Interested > Tag + move to Lost
    - [ ] Voicemail > Move stage + schedule retry in 2 days
    - [ ] No Answer > Schedule retry in 2 days
  - [ ] Loop condition: Attempt count < 3
  - [ ] Exit: After 3 attempts, move to "Lost - No Contact"

### 6.2 Demo Booking Follow-up (20 min)

- [ ] **(20 min)** Build workflow: `Follow-up: Book Demo After Interest`
  - [ ] Trigger: Tag `voice-ai:engaged` added AND no appointment
  - [ ] Wait 1 hour > Send SMS with booking link
  - [ ] Wait 24 hours > Check if booked > If not, send email
  - [ ] Wait 48 hours > Check if booked > If not, make follow-up call
  - [ ] Move to Demo Booked or Lost based on outcome

### 6.3 Pre-Demo Reminders (15 min)

- [ ] **(15 min)** Build workflow: `Reminder: Demo Call Prep`
  - [ ] Trigger: Appointment created on ClawOps Demo Call
  - [ ] Immediate: SMS confirmation
  - [ ] T-24h: SMS reminder
  - [ ] T-1h: SMS with meeting link

### 6.4 Post-Demo Follow-up (15 min)

- [ ] **(15 min)** Build workflow: `Follow-up: Post Demo Sequence`
  - [ ] Trigger: Appointment status = "Showed"
  - [ ] T+2h: SMS + Email with Stripe link ($1,997)
  - [ ] T+48h: SMS check-in
  - [ ] T+5d: Follow-up Voice AI call
  - [ ] T+7d: Urgency email
  - [ ] Move to Won or archive based on outcome

### 6.5 No-Contact Drip (10 min)

- [ ] **(10 min)** Build workflow: `Drip: No Contact - Long Term`
  - [ ] Trigger: Pipeline stage = "Lost - No Contact"
  - [ ] Immediate: SMS with booking link
  - [ ] T+7d: Email
  - [ ] T+21d: Final SMS
  - [ ] End sequence

---

## Phase 7: SMS/Email Templates (30 min)

- [ ] **(5 min)** Create SMS template: Post-call booking link
  ```
  Hey {{contact.first_name}}, this is Jordan from ClawOps. Great talking with you!
  Here's the link to book your free demo: [BOOKING_LINK]
  Talk soon! 🤙
  ```
- [ ] **(5 min)** Create SMS template: Demo confirmation
- [ ] **(5 min)** Create SMS template: Demo reminder (24h)
- [ ] **(5 min)** Create SMS template: Post-demo Stripe link
- [ ] **(5 min)** Create email template: Follow-up after interest
- [ ] **(5 min)** Create email template: Post-demo founding member offer

---

## Phase 8: Stripe Integration (15 min)

- [ ] **(5 min)** Verify Stripe is connected in GHL (Settings > Integrations > Stripe)
- [ ] **(5 min)** Create/verify Founding Member product: $1,997 one-time payment
- [ ] **(5 min)** Get the Stripe checkout link - embed in SMS/email templates

---

## Phase 9: Testing (30 min)

### End-to-End Test

- [ ] **(5 min)** Create a test contact with your own phone number, tagged as `niche:hvac`
- [ ] **(5 min)** Add test contact to pipeline at "New Lead" stage
- [ ] **(5 min)** Verify outbound call workflow triggers
- [ ] **(5 min)** Answer the call - verify HVAC script plays correctly
- [ ] **(5 min)** Verify post-call actions: tags applied, pipeline moved, follow-up triggered
- [ ] **(5 min)** Book a demo via the SMS link - verify calendar and reminder workflow

### Inbound Test

- [ ] **(5 min)** Call +1 888-457-8980 from your personal phone
- [ ] **(5 min)** Verify Voice AI answers with correct niche prompt
- [ ] **(5 min)** Ask it to book an appointment - verify it works

---

## Phase 10: GO LIVE (5 min)

- [ ] **(1 min)** Final review: All workflows active?
- [ ] **(1 min)** All 40 callable leads in "New Lead" stage?
- [ ] **(1 min)** Calling window check: Is it currently within optimal hours?
- [ ] **(1 min)** Activate the outbound workflow
- [ ] **(1 min)** Monitor first 2-3 calls in real-time via GHL

---

## Post-Launch Monitoring (Ongoing)

### Day 1 (Today)
- [ ] Monitor first 10-12 calls
- [ ] Listen to at least 3 call recordings
- [ ] Verify pipeline is updating correctly
- [ ] Check for any error notifications
- [ ] Note which scripts/niches perform best

### Day 2
- [ ] Review Day 1 metrics: calls made, connected, interested, demos booked
- [ ] Adjust calling windows if connection rate < 20%
- [ ] Follow up on any handoff requests
- [ ] Review and adjust scripts based on call recordings

### Day 3-5
- [ ] Complete all follow-up sequences
- [ ] Close any demos from Day 1-2 connections
- [ ] Prepare second wave (if applicable)

### Week 1 Review
- [ ] Full metrics report (see autonomous-calling-playbook.md > Daily Status Report)
- [ ] Script optimization based on data
- [ ] Plan Wave 2 outreach (new leads, different angles)

---

## Quick Reference: Key Links & IDs

| Item | Value |
|------|-------|
| GHL Location ID | Ez2ADxydpjvWsW3suYiq |
| GHL Login | rickclaw08@gmail.com |
| Main Phone | +1 888-457-8980 |
| Calendar | ClawOps Demo Call |
| Pipeline | Voice AI Leads |
| Stripe Product | Founding Member - $1,997 |
| Booking Link | [INSERT AFTER SETUP] |
| Stripe Link | [INSERT AFTER SETUP] |

---

## Time Estimate Summary

| Phase | Time |
|-------|------|
| Foundation (fields, tags, pipeline) | 45 min |
| Lead Import | 30 min |
| Voice AI Agents | 60 min |
| Phone Numbers | 15 min |
| Calendar | 10 min |
| Workflows | 90 min |
| Templates | 30 min |
| Stripe | 15 min |
| Testing | 30 min |
| Go Live | 5 min |
| **TOTAL** | **~5.5 hours** |

**Critical path for minimum viable launch (2 hours):**
1. Custom fields + tags (15 min)
2. Import leads (15 min)
3. Configure 1 Voice AI agent with general prompt (15 min)
4. Build outbound call workflow (30 min)
5. Build demo booking follow-up (15 min)
6. Test (15 min)
7. Go live (5 min)

Then build the remaining workflows and niche-specific agents while the system is already calling leads.
