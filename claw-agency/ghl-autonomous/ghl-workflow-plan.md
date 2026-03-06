# GHL Workflow & Configuration Plan

> Step-by-step GoHighLevel setup for ClawOps autonomous voice AI system
> Account: ClawOps (rickclaw08@gmail.com)
> Location ID: Ez2ADxydpjvWsW3suYiq
> Existing: "ClawOps AI Receptionist" (Jordan/Archer), "ClawOps Demo Call" calendar, "Voice AI Leads" pipeline

---

## Phase 1: Voice AI Agent Setup

### 1.1 Create Niche-Specific Voice AI Agents

**Path:** Settings > Phone Numbers > Voice AI (or Conversations > Voice AI)

Create 5 new Voice AI agents. If your plan allows only one agent, use the Dynamic Prompting approach in Section 1.2 instead.

| Agent Name | Niche Tag | Phone Number Strategy |
|------------|-----------|----------------------|
| ClawOps AI - HVAC Receptionist | niche:hvac | Assign dedicated tracking number OR use IVR routing |
| ClawOps AI - Plumbing Receptionist | niche:plumbing | Same |
| ClawOps AI - Electrical Receptionist | niche:electrical | Same |
| ClawOps AI - Roofing Receptionist | niche:roofing | Same |
| ClawOps AI - GC Receptionist | niche:general | Same |

**For each agent, configure:**
1. **Model:** GPT 5.1
2. **Voice:** Archer (British male)
3. **System Prompt:** Copy from `niche-voice-agents.md` (the full prompt for that niche)
4. **Greeting:** Use the opening line from the prompt ("Good morning/afternoon, thanks for calling...")
5. **Max Call Duration:** 10 minutes
6. **Call Recording:** ON
7. **Transcription:** ON
8. **Post-Call Webhook/Action:** Create contact + add to pipeline (see Workflow section)

### 1.2 Alternative: Single Agent with Dynamic Prompting

If GHL limits you to one Voice AI agent, use this approach:

1. Keep the existing "ClawOps AI Receptionist" as the base agent
2. Create a **pre-call workflow** that checks the incoming caller's contact tags
3. Based on the `niche:` tag, inject the appropriate system prompt via the workflow's "Set AI Agent Prompt" action
4. For unknown callers (no tag), default to the General Contractor prompt (broadest coverage)

**IVR Routing Option (Single Number):**
- Main number (+1 888-457-8980) answers with IVR:
  - "Press 1 for HVAC, 2 for Plumbing, 3 for Electrical, 4 for Roofing, 5 for General Contracting"
- Routes to the appropriate Voice AI agent
- Best for demo purposes where you want to show all niches from one number

### 1.3 Phone Number Strategy

**Option A: Dedicated Numbers (Recommended for production)**
- Purchase 5 additional local or toll-free numbers in GHL
- Each number routes to one niche Voice AI agent
- Outbound calls for each niche come FROM that niche's number
- Cost: ~$2-5/number/month

**Option B: Single Number + IVR**
- Use existing +1 888-457-8980
- IVR press-menu routes to the right agent
- Cheaper but less elegant for outbound (all calls come from same number)

**Option C: Single Number + Tag-Based Routing**
- For outbound: tag determines which prompt the AI uses
- For inbound: new callers get the general prompt; tagged contacts get their niche prompt
- Lowest cost, slightly less polished

**Recommendation:** Start with Option C for today's launch, upgrade to Option A when scaling.

---

## Phase 2: Pipeline Configuration

### 2.1 Update "Voice AI Leads" Pipeline

**Path:** Opportunities > Pipelines > Voice AI Leads

**Stages (in order):**

| Stage | Description | Auto-Actions |
|-------|-------------|--------------|
| **New Lead** | Lead imported from Google Sheets, not yet contacted | Trigger outbound call workflow |
| **Call Attempted** | At least one outbound call made, no answer | Schedule follow-up attempt |
| **Voicemail Left** | Voicemail delivered on attempt 2 or 3 | Wait 48h, then next attempt |
| **Connected - Interested** | Spoke to lead, showed interest | Trigger demo booking workflow |
| **Demo Booked** | ClawOps Demo Call scheduled | Send confirmation + reminder sequence |
| **Demo Completed** | Demo call happened | Trigger follow-up sequence |
| **Proposal Sent** | Founding Member offer sent | 48h follow-up if no response |
| **Won - Founding Member** | Paid $1,997 | Onboarding workflow triggers |
| **Lost - Not Interested** | Declined after conversation | Archive, add to nurture list |
| **Lost - No Contact** | 3 attempts, no response | Move to long-term drip |
| **Lost - Bad Fit** | Wrong niche, wrong size, etc. | Archive |

### 2.2 Pipeline Automation Rules

- **Auto-move to "Call Attempted"** when first outbound call completes (any outcome)
- **Auto-move to "Voicemail Left"** when voicemail is detected/left
- **Auto-move to "Connected - Interested"** when call tag `voice-ai:engaged` is applied
- **Auto-move to "Demo Booked"** when appointment on "ClawOps Demo Call" calendar is created
- **Auto-move to "Demo Completed"** when appointment status changes to "Showed"
- **Auto-move to "Won"** when Stripe payment of $1,997 is received (via Stripe integration)
- **Auto-move to "Lost - No Contact"** after 3 failed call attempts with no connection

---

## Phase 3: Contact Management

### 3.1 Import Leads from Google Sheets

**Path:** Contacts > Import

1. Export the 42-lead Google Sheet as CSV
2. Map columns:
   - Company Name > Company
   - Contact Name > First Name / Last Name
   - Phone > Phone
   - Email > Email (if available)
   - Niche/Trade > Custom Field: "Trade Niche" (dropdown)
   - City/State > Address fields
3. On import, auto-apply tags based on Trade Niche field:
   - HVAC > `niche:hvac`
   - Plumbing > `niche:plumbing`
   - Electrical > `niche:electrical`
   - Roofing > `niche:roofing`
   - General > `niche:general`
4. Apply tag `source:lead-sheet-import` to all
5. Add all 42 contacts to "Voice AI Leads" pipeline at "New Lead" stage

### 3.2 Custom Fields Setup

**Path:** Settings > Custom Fields

| Field Name | Type | Options |
|------------|------|---------|
| Trade Niche | Dropdown | HVAC, Plumbing, Electrical, Roofing, General Contractor |
| Company Size | Dropdown | Solo, 2-5 employees, 6-15, 16-50, 50+ |
| Call Attempt Count | Number | (auto-incremented by workflow) |
| Last Call Outcome | Dropdown | No Answer, Voicemail, Connected - Not Interested, Connected - Interested, Connected - Callback Requested |
| Preferred Callback Time | Date/Time | (set during call if they request callback) |
| Lead Temperature | Dropdown | Cold, Warm, Hot |
| Timezone | Dropdown | Eastern, Central, Mountain, Pacific |

### 3.3 Tag System

**Niche Tags:**
- `niche:hvac`
- `niche:plumbing`
- `niche:electrical`
- `niche:roofing`
- `niche:general`

**Source Tags:**
- `source:lead-sheet-import`
- `source:inbound-demo`
- `source:outbound-campaign`
- `source:referral`
- `source:website`

**Status Tags:**
- `voice-ai:engaged` (showed interest during call)
- `voice-ai:demo-requested` (explicitly asked for demo)
- `voice-ai:objection-price` (price was the concern)
- `voice-ai:objection-timing` (not the right time)
- `voice-ai:declined` (firm no)

**Campaign Tags:**
- `campaign:founding-member-wave1`
- `campaign:outbound-march2026`

---

## Phase 4: Workflow Automations

### 4.1 Workflow: Outbound Call Sequence

**Name:** `Auto-Outbound: Voice AI Lead Campaign`
**Trigger:** Contact enters "New Lead" stage in Voice AI Leads pipeline

```
TRIGGER: Pipeline Stage = "New Lead"
│
├─ WAIT: Until next business day, between 10 AM - 12 PM (contact's timezone)
│
├─ CONDITION: Check "Trade Niche" custom field
│   ├─ HVAC → Set internal variable: script = "hvac"
│   ├─ Plumbing → Set internal variable: script = "plumbing"
│   ├─ Electrical → Set internal variable: script = "electrical"
│   ├─ Roofing → Set internal variable: script = "roofing"
│   └─ General → Set internal variable: script = "general"
│
├─ ACTION: Make Voice AI Call (outbound)
│   - Use agent: ClawOps AI - [Niche] Receptionist
│   - OR: Use dynamic prompt based on niche tag
│   - Mode: Outbound
│   - Script: From outbound-call-scripts.md
│
├─ ACTION: Update custom field "Call Attempt Count" = +1
├─ ACTION: Move to "Call Attempted" stage
│
├─ CONDITION: Call outcome?
│   ├─ ANSWERED + INTERESTED:
│   │   ├─ Apply tag: voice-ai:engaged
│   │   ├─ Move to "Connected - Interested"
│   │   ├─ IF appointment booked → Move to "Demo Booked"
│   │   └─ IF no appointment → Trigger "Demo Booking Follow-up" workflow
│   │
│   ├─ ANSWERED + NOT INTERESTED:
│   │   ├─ Apply tag: voice-ai:declined
│   │   ├─ Move to "Lost - Not Interested"
│   │   └─ END
│   │
│   ├─ ANSWERED + CALLBACK REQUESTED:
│   │   ├─ Set "Preferred Callback Time" field
│   │   ├─ WAIT until callback time
│   │   └─ RE-ENTER workflow at call step
│   │
│   ├─ VOICEMAIL:
│   │   ├─ IF attempt count >= 2 → Leave voicemail (use voicemail script)
│   │   ├─ Move to "Voicemail Left"
│   │   ├─ WAIT: 2 business days
│   │   └─ CONDITION: attempt count < 3?
│   │       ├─ YES → Loop back to call step
│   │       └─ NO → Move to "Lost - No Contact", trigger SMS/email drip
│   │
│   └─ NO ANSWER (no voicemail):
│       ├─ WAIT: 2 business days
│       └─ CONDITION: attempt count < 3?
│           ├─ YES → Loop back to call step
│           └─ NO → Move to "Lost - No Contact", trigger SMS/email drip
```

### 4.2 Workflow: Demo Booking Follow-up

**Name:** `Follow-up: Book Demo After Interest`
**Trigger:** Tag `voice-ai:engaged` applied AND no appointment exists

```
TRIGGER: Tag added = "voice-ai:engaged" AND no appointment on "ClawOps Demo Call"
│
├─ WAIT: 1 hour
│
├─ ACTION: Send SMS
│   "Hey {{contact.first_name}}, this is Jordan from ClawOps. Great talking with you earlier!
│    Here's the link to book your free 30-min demo: {{calendars.clawops_demo_call.link}}
│    Talk soon! 🤙"
│
├─ WAIT: 24 hours
│
├─ CONDITION: Appointment booked?
│   ├─ YES → Move to "Demo Booked" → END
│   └─ NO → Continue
│
├─ ACTION: Send Email
│   Subject: "Quick follow-up from ClawOps, {{contact.first_name}}"
│   Body: (See email template below)
│
├─ WAIT: 48 hours
│
├─ CONDITION: Appointment booked?
│   ├─ YES → Move to "Demo Booked" → END
│   └─ NO → Continue
│
├─ ACTION: Voice AI Call (follow-up attempt)
│   "Hey {{contact.first_name}}, Jordan from ClawOps again. Just following up from our chat the other day.
│    Still want to get that demo set up for you. Got any time this week?"
│
└─ CONDITION: Appointment booked after call?
    ├─ YES → Move to "Demo Booked" → END
    └─ NO → Move to "Lost - Not Interested" → Add to long-term nurture
```

### 4.3 Workflow: Inbound Demo Call Handler

**Name:** `Inbound: Demo Call Router`
**Trigger:** Inbound call to any niche-specific number (or main number)

```
TRIGGER: Inbound call received
│
├─ CONDITION: Existing contact?
│   ├─ YES → Route to niche-specific agent based on contact's niche tag
│   └─ NO → Create contact, apply tag source:inbound-demo, route to default agent
│
├─ POST-CALL ACTIONS:
│   ├─ Update/create contact record with call transcript
│   ├─ Add to "Voice AI Leads" pipeline at appropriate stage
│   ├─ Apply relevant tags (niche, source, interest level)
│   └─ IF appointment booked → Create opportunity, move to "Demo Booked"
│
└─ NOTIFICATION: Send internal notification to Brand
    "New inbound demo call from {{contact.name}} ({{contact.custom.trade_niche}})
     Duration: {{call.duration}} | Outcome: {{call.outcome}}"
```

### 4.4 Workflow: Pre-Demo Reminder Sequence

**Name:** `Reminder: Demo Call Prep`
**Trigger:** Appointment created on "ClawOps Demo Call" calendar

```
TRIGGER: Appointment created on "ClawOps Demo Call"
│
├─ IMMEDIATE: Send SMS confirmation
│   "Confirmed! Your ClawOps demo is set for {{appointment.date}} at {{appointment.time}}.
│    You'll hear exactly how the AI receptionist sounds for {{contact.custom.trade_niche}} companies.
│    Talk soon! - Jordan"
│
├─ WAIT: 24 hours before appointment
│
├─ ACTION: Send SMS reminder
│   "Hey {{contact.first_name}}, just a heads up - your ClawOps demo is tomorrow at {{appointment.time}}.
│    Looking forward to showing you what this can do for {{contact.company}}!"
│
├─ WAIT: 1 hour before appointment
│
└─ ACTION: Send SMS
    "Your demo starts in an hour! Here's your meeting link: {{appointment.meeting_link}}
     See you soon!"
```

### 4.5 Workflow: Post-Demo Follow-up

**Name:** `Follow-up: Post Demo Sequence`
**Trigger:** Appointment status changed to "Showed" on ClawOps Demo Call

```
TRIGGER: Appointment status = "Showed"
│
├─ WAIT: 2 hours
│
├─ ACTION: Send SMS
│   "Hey {{contact.first_name}}, great chatting today! As discussed, the Founding Member deal
│    is $1,997 one-time. Here's the link to lock in your spot: {{stripe.founding_member_link}}
│    Any questions, just text back or call 888-457-8980."
│
├─ ACTION: Send Email
│   Subject: "Your ClawOps Founding Member Offer"
│   Body: Recap of demo, benefits, Stripe link, urgency (limited spots)
│
├─ ACTION: Move to "Proposal Sent"
│
├─ WAIT: 48 hours
│
├─ CONDITION: Payment received?
│   ├─ YES → Move to "Won - Founding Member" → Trigger onboarding → END
│   └─ NO → Continue
│
├─ ACTION: Send SMS
│   "Hey {{contact.first_name}}, just checking in. Any questions about the AI receptionist setup?
│    Happy to jump on a quick call if anything's unclear."
│
├─ WAIT: 72 hours
│
├─ CONDITION: Payment received?
│   ├─ YES → Move to "Won" → END
│   └─ NO → Continue
│
├─ ACTION: Voice AI Call (closing follow-up)
│   "Hey {{contact.first_name}}, Jordan from ClawOps. Just wanted to follow up on the demo.
│    The founding member spots are filling up. Wanted to see if you had any questions
│    or if you're ready to get started."
│
└─ CONDITION: Payment within 7 days?
    ├─ YES → "Won" → END
    └─ NO → Move to long-term nurture list
```

### 4.6 Workflow: No-Contact SMS/Email Drip

**Name:** `Drip: No Contact - Long Term`
**Trigger:** Contact moves to "Lost - No Contact"

```
TRIGGER: Pipeline stage = "Lost - No Contact"
│
├─ IMMEDIATE: Send SMS
│   "Hey {{contact.first_name}}, tried to reach you a few times from ClawOps.
│    We help {{contact.custom.trade_niche}} companies catch every call with AI.
│    When you have a sec, check out a quick demo: {{calendars.clawops_demo_call.link}}"
│
├─ WAIT: 7 days
│
├─ ACTION: Send Email
│   Subject: "Are you still missing calls, {{contact.first_name}}?"
│   Body: Pain point recap + demo booking link
│
├─ WAIT: 14 days
│
├─ ACTION: Send SMS
│   "Last note from ClawOps, {{contact.first_name}}. If your phone ever gets crazy
│    during busy season, we've got you covered. Link's always open: {{calendars.link}}"
│
└─ END (respect the 3-touch max for cold leads)
```

---

## Phase 5: Calendar Integration

### 5.1 "ClawOps Demo Call" Calendar Settings

**Path:** Settings > Calendars > ClawOps Demo Call

**Verify/update these settings:**
- **Availability:** Mon-Fri, 9:00 AM - 6:00 PM EST
- **Duration:** 30 minutes
- **Buffer:** 15 minutes between appointments
- **Max per day:** 6 (leaves time for actual work)
- **Booking window:** 1 day minimum, 14 days maximum
- **Confirmation:** Auto-send SMS + email on booking
- **Reminder:** 24 hours and 1 hour before
- **No-show:** If not marked "Showed" within 15 min of start, auto-send "Sorry we missed you" SMS with rebooking link

### 5.2 Voice AI Calendar Booking

When the Voice AI agent books an appointment during a call:
1. AI says: "I've got you down for [date] at [time]. You'll get a confirmation text in just a moment."
2. GHL creates the appointment on "ClawOps Demo Call"
3. Workflow 4.4 (Pre-Demo Reminder) triggers automatically
4. Contact moves to "Demo Booked" stage in pipeline

---

## Phase 6: Reporting & Notifications

### 6.1 Internal Notifications

Set up Slack/SMS notifications to Brand for:
- Every call that results in `voice-ai:engaged` tag
- Every demo booked
- Every payment received
- Daily summary: calls made, connections, demos booked, pipeline movement

### 6.2 Dashboard

**Path:** Reporting > Dashboard

Create a custom dashboard with:
- **Calls Today:** Total outbound + inbound
- **Connection Rate:** (Connected / Total Calls) * 100
- **Demo Booking Rate:** (Demos Booked / Connections) * 100
- **Pipeline Value:** Leads in each stage * $1,997
- **Revenue:** Won opportunities
- **By Niche:** Breakdown of all metrics by trade niche

---

## Phase 7: Compliance & Best Practices

### 7.1 TCPA Compliance

- All leads must have opted in or have a legitimate business relationship
- The 42 Google Sheets leads are business contacts being called at business numbers during business hours - this is compliant for B2B
- Always identify as calling from ClawOps at the start
- Honor "do not call" requests immediately and tag as `voice-ai:declined`
- Record all calls (with notice where required by state)

### 7.2 Call Recording Disclosure

- For one-party consent states: Recording is automatic, no disclosure needed
- For two-party consent states (CA, FL, etc.): Add to the opening: "This call may be recorded for quality purposes"
- **Recommendation:** Add recording disclosure to ALL calls to be safe

### 7.3 Rate Limiting

- Max 50 outbound calls per day per number (stay well under carrier limits)
- Max 3 attempts per lead
- Minimum 48 hours between attempts to same lead
- No calls on federal holidays
