# Client Build Checklist - GHL Sub-Account Setup
*Internal Operations Doc | Est. Total: 3-4 hours*

---

## PRE-BUILD (15 min)

- [ ] Payment confirmed in Stripe
- [ ] Intake form received and reviewed
- [ ] Client info sheet created (name, business, phone, email, services, hours, area, preferences)
- [ ] Niche template identified (HVAC / Plumbing / Electrical / Roofing / GC)

---

## PHASE 1: SUB-ACCOUNT CREATION (20 min)

- [ ] Log into ClawOps GHL agency (rickclaw08@gmail.com)
- [ ] Create new sub-account/location
  - Business name: [exact client business name]
  - Business type: Service / Home Services
  - Timezone: [client's timezone]
  - Address: [client's address]
  - Phone: [client's business phone]
  - Email: [client's email]
  - Website: [client's website if any]
- [ ] Note location ID for reference

---

## PHASE 2: PHONE NUMBER (10 min)

- [ ] Purchase local number in client's area code ($1.15/mo)
  - GHL > Phone System > Buy Number > search by area code
- [ ] Label the number: "[Business Name] - AI Line"
- [ ] If client wants to port existing number: initiate port request (2-4 weeks), use local number as interim
- [ ] Document number in client file

---

## PHASE 3: CALENDAR (20 min)

- [ ] Create calendar: "[Business Name] - Service Appointments"
- [ ] Set team member: client's name/email
- [ ] Availability:
  - Days: per intake form (typically Mon-Fri, maybe Sat morning)
  - Hours: per intake form (typically 7/8 AM - 5/6 PM)
  - Slot duration: 2-hour blocks (default for service calls, adjust per niche)
  - Buffer: 30 min between appointments (travel time)
- [ ] Set appointmentsPerSlot based on crew size (default: 2)
- [ ] Connect to client's Google Calendar if they use one (OAuth)
- [ ] Set booking confirmation settings (auto-confirm)
- [ ] Note calendar ID for Voice AI connection

---

## PHASE 4: PIPELINE (15 min)

- [ ] Create pipeline: "Inbound Leads"
- [ ] Add stages (in order):
  1. New Lead
  2. Contacted
  3. Appointment Booked
  4. Job Completed
  5. Follow-up
- [ ] Set default stage: New Lead

---

## PHASE 5: CUSTOM FIELDS (10 min)

- [ ] Service Needed (dropdown - populate from client's service list)
- [ ] Property Address (single line text)
- [ ] Urgency (dropdown: Routine, Same-Day, Emergency)
- [ ] Source (dropdown: AI Call, Website, Referral, Walk-in)
- [ ] Estimated Job Value (dropdown: Under $500, $500-2K, $2K-5K, $5K-10K, $10K+)

---

## PHASE 6: TAGS (5 min)

- [ ] source:ai-call
- [ ] source:website
- [ ] source:referral
- [ ] status:new-lead
- [ ] status:booked
- [ ] status:completed
- [ ] niche:[client's trade]

---

## PHASE 7: VOICE AI AGENT (45 min)

- [ ] Create Voice AI agent: "[Business Name] AI Receptionist"
- [ ] Settings:
  - LLM: GPT-4.1 (or GPT 5.1 if available in sub-account)
  - Voice: Client preference (default: Archer for professional, Mark for casual)
  - Mode: Advanced
  - Max call duration: 300 seconds (5 min)
- [ ] Write custom prompt from niche template + intake data:
  - Business name, owner name
  - Services offered with pricing rules
  - Service area (cities/zips)
  - Business hours + after-hours protocol
  - Emergency transfer number (owner's cell)
  - Scheduling rules
  - Tone/personality preference
  - Guardrails (what NOT to say, price limits, competitor mentions)
- [ ] Connect actions:
  - "Schedule Appointment" linked to calendar
  - "Send SMS" for booking confirmation
  - "Transfer Call" to owner's cell (with conditions)
- [ ] Assign phone number to agent
- [ ] Set voicemail behavior

---

## PHASE 8: WORKFLOWS (60 min)

### Workflow 1: New Inbound Call (15 min)
- [ ] Trigger: Contact replies / inbound call
- [ ] Actions:
  - Create/Update contact
  - Add to pipeline (New Lead stage)
  - Tag: source:ai-call
  - Send internal SMS notification to owner
  - Send internal email notification to owner
- [ ] Test trigger

### Workflow 2: Appointment Booked (15 min)
- [ ] Trigger: Appointment created
- [ ] Actions:
  - Send confirmation SMS to customer
  - Send confirmation email to customer
  - Move to "Appointment Booked" stage
  - Send owner notification with appointment details
  - Wait 24h > send reminder SMS to customer
  - Wait until 1h before > send reminder SMS to customer
- [ ] Test trigger

### Workflow 3: Missed Call Recovery (10 min)
- [ ] Trigger: Missed call (no voicemail)
- [ ] Actions:
  - Wait 2 minutes
  - Send SMS: "Hey [Name], this is [Business]. Sorry we missed your call! How can we help? Reply here or we'll call you back shortly."
  - Create task for owner: "Follow up - missed call"
- [ ] Test trigger

### Workflow 4: Post-Job Review Generation (10 min)
- [ ] Trigger: Opportunity moved to "Job Completed"
- [ ] Actions:
  - Wait 24 hours
  - Send SMS: "Thanks for choosing [Business]! How'd everything go? We'd love a quick review: [Google Review Link]"
  - Wait 3 days > if no review > send reminder email
- [ ] Requires: Client's Google Review link (get from intake or Google Business Profile)
- [ ] Test trigger

### Workflow 5: No-Show Recovery (10 min)
- [ ] Trigger: Appointment status = no-show or cancelled
- [ ] Actions:
  - Wait 1 hour
  - Send SMS: "Hey [Name], looks like we missed each other. Want to reschedule? Reply with a time."
  - Wait 48h > if no reply > move to Follow-up stage
- [ ] Test trigger

---

## PHASE 9: DASHBOARD & ACCESS (15 min)

- [ ] Customize dashboard widgets (today's calls, upcoming appointments, new leads)
- [ ] Hide unnecessary menu items (keep: Dashboard, Contacts, Calendar, Conversations, Opportunities, Reputation)
- [ ] Create client user account (their email, Admin role)
- [ ] Send invite email

---

## PHASE 10: TESTING (30 min)

### Internal QA (before client sees anything)
- [ ] Call the AI number - answers with correct business name?
- [ ] Ask about each service - handles correctly?
- [ ] Ask about pricing - follows pricing policy?
- [ ] Book an appointment - shows in calendar?
- [ ] Customer gets confirmation SMS?
- [ ] Owner gets notification of new lead?
- [ ] Ask to speak to someone - transfers to owner's cell?
- [ ] Call after hours - handles correctly?
- [ ] Ask about service area - knows coverage?
- [ ] Hang up without booking - missed call text fires?
- [ ] Test voicemail flow
- [ ] Check CRM - contact created with all fields?
- [ ] Check pipeline - opportunity in correct stage?
- [ ] Test appointment reminder sequence
- [ ] Test review generation workflow

**All 15 items must PASS before client handoff.**

---

## PHASE 11: CLIENT HANDOFF (30 min)

- [ ] Schedule 15-min screen-share with client
- [ ] Walk through:
  1. Dashboard overview
  2. What happens when someone calls (show CRM entry from test call)
  3. Calendar management (blocking time, rescheduling)
  4. Conversations tab (replying to customer texts)
  5. Pipeline board (drag to update stages)
  6. Notifications (show them the texts/emails they'll get)
  7. Mobile app download + setup
- [ ] Set up call forwarding:
  - Most carriers: *72 + [AI number]
  - Or conditional forwarding (busy/no answer only)
  - Or through carrier portal
  - Test forwarding works
- [ ] Confirm client can see dashboard on mobile
- [ ] Schedule Day 7 check-in call

---

## POST-LAUNCH

- [ ] Monitor first 48 hours for prompt issues
- [ ] Spot-check 5 call recordings on Day 2
- [ ] Day 7 check-in: review data, adjust prompt if needed
- [ ] Day 30 first monthly review
- [ ] Set up monthly review calendar event (recurring)

---

## TIME ESTIMATE

| Phase | Time |
|-------|------|
| Pre-build | 15 min |
| Sub-account | 20 min |
| Phone number | 10 min |
| Calendar | 20 min |
| Pipeline | 15 min |
| Custom fields | 10 min |
| Tags | 5 min |
| Voice AI agent | 45 min |
| Workflows (5) | 60 min |
| Dashboard + access | 15 min |
| Testing | 30 min |
| Client handoff | 30 min |
| **TOTAL** | **~4.5 hours** |

With a pre-built snapshot template, this drops to ~2 hours (skip phases 4-8, just customize prompt + calendar).
