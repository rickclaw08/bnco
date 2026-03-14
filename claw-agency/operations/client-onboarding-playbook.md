# ClawOps Client Onboarding & Delivery Playbook
## "Sold to Live in Under 48 Hours"

---

## OVERVIEW

When a contractor pays ($2,500 setup + $550/mo), here's exactly what gets built for them and how they interact with it day-to-day.

### What They Get:
1. **AI Receptionist** - answers every call 24/7, trained on THEIR business
2. **CRM Dashboard** - they can see every lead, call, and booking
3. **Automated Follow-ups** - missed calls get texted, emails sent, opportunities tracked
4. **Booking Calendar** - AI books appointments directly into their schedule
5. **Phone Number** - dedicated business line or forwarding from their existing number

---

## PHASE 1: INTAKE (Day 0 - Sale Closed)

### What We Need From the Client (Intake Form)
Collect this on the close call or via a form immediately after payment:

```
BUSINESS INFO
- Business name (exact, for caller ID)
- Owner name
- Business address
- Business phone (existing number they want forwarded)
- Business email
- Website URL (if any)
- Trade/niche (HVAC, Plumbing, Electrical, Roofing, GC, etc.)

SERVICES & PRICING
- List of services offered (e.g., "AC repair, AC install, duct cleaning, maintenance plans")
- Service area (cities/zip codes they cover)
- Average job value
- Emergency/after-hours services? (yes/no, pricing if different)
- Do they offer free estimates? (yes/no)

SCHEDULING
- Business hours (e.g., Mon-Fri 7AM-6PM, Sat 8AM-2PM)
- How they currently schedule (pen & paper, ServiceTitan, Housecall Pro, Google Calendar, etc.)
- How far out can they book? (same day, next day, 1 week?)
- Typical job duration (for calendar slot sizing)

CALL HANDLING PREFERENCES
- What should AI say when asked about pricing? (give ranges, or "we'll provide a quote on-site")
- Transfer protocol: when should AI transfer to a live person vs. book?
- Emergency protocol: after-hours emergency number or just book next available?
- Any competitors they don't want mentioned?
- Tone preference (professional, friendly, casual - most contractors want friendly)
```

---

## PHASE 2: GHL SUB-ACCOUNT BUILD (Day 0-1)

### Step 1: Create Client Sub-Account in GHL

Using our ClawOps GHL agency account (rickclaw08@gmail.com):

1. **Create new sub-account/location**
   - Business name: [Client's business name]
   - Business type: Service/Home Services
   - Timezone: [Client's timezone]
   - Address: [Client's address]

2. **Phone number setup**
   - Option A: Buy a local number in GHL for them ($1.15/mo) - they forward their existing number to it
   - Option B: Port their existing number into GHL (takes 2-4 weeks, use Option A as interim)
   - Assign number to Voice AI agent

3. **Calendar setup**
   - Create calendar: "[Business Name] - Service Appointments"
   - Set availability based on their business hours
   - Slot duration: based on their typical job (usually 2-4 hour blocks)
   - Buffer time between appointments (30-60 min for travel)
   - Connect to their Google Calendar if they use one (OAuth sync)

4. **Pipeline setup**
   - Pipeline: "Inbound Leads"
   - Stages: New Lead -> Contacted -> Appointment Booked -> Job Completed -> Follow-up
   - Automations trigger on stage changes

5. **Contact fields**
   - Service Needed (dropdown of their services)
   - Address/Location (for dispatch)
   - Urgency (routine, same-day, emergency)
   - Source (AI call, website, referral)

### Step 2: Build Their AI Receptionist (Voice AI Agent)

1. **Create Voice AI agent in their sub-account**
   - Name: "[Business Name] AI Receptionist"
   - LLM: GPT-4.1 (best quality/cost ratio)
   - Voice: Based on their preference (recommend Archer or Jessica for professional tone)
   - Mode: Advanced

2. **Write custom prompt** based on intake info:
   ```
   You are [Name], the receptionist at [Business Name]. You answer every call professionally 
   and warmly. Your job is to:
   1. Greet the caller and get their name
   2. Find out what service they need
   3. Get their address/location
   4. Determine urgency (emergency vs. routine)
   5. Book an appointment or take a message
   
   SERVICES OFFERED:
   [List from intake]
   
   SERVICE AREA:
   [Cities/zips from intake]
   
   PRICING POLICY:
   [From intake - usually "We provide free estimates on-site" or specific ranges]
   
   BUSINESS HOURS:
   [From intake]
   
   EMERGENCY PROTOCOL:
   [From intake]
   
   BOOKING RULES:
   - Book into the [Calendar Name] calendar
   - [Slot rules from intake]
   - Always confirm: name, phone, address, service needed, preferred time
   
   TRANSFER RULES:
   - Transfer to [owner's cell] if: caller insists on speaking to someone, 
     emergency situation, existing customer with complaint
   - Otherwise: book the appointment, AI handles it
   ```

3. **Connect actions:**
   - "Schedule Appointment" -> linked to their GHL calendar
   - "Send SMS" -> confirmation text after booking
   - "Transfer Call" -> to owner's cell for escalations

4. **Set voicemail/missed call behavior:**
   - If AI can't handle it -> voicemail with callback promise
   - Missed call -> automatic text: "Sorry we missed your call! We'll call you back within 15 minutes."

### Step 3: Automation Workflows

Build these in GHL Workflows:

**Workflow 1: New Inbound Call**
```
Trigger: Contact replies / inbound call
-> Create/Update Contact
-> Add to Pipeline ("New Lead" stage)
-> Tag: source:ai-call
-> Send internal notification to owner (email + SMS)
```

**Workflow 2: Appointment Booked**
```
Trigger: Appointment created
-> Send confirmation SMS to customer
-> Send confirmation email to customer
-> Move opportunity to "Appointment Booked" stage
-> Send notification to owner with appointment details
-> 24-hour reminder SMS to customer
-> 1-hour reminder SMS to customer
```

**Workflow 3: Missed Call Follow-up**
```
Trigger: Missed call (no voicemail)
-> Wait 2 minutes
-> Send SMS: "Hey [Name], this is [Business]. Sorry we missed your call! 
   How can we help you today? Reply here or we'll call you back shortly."
-> Create task for owner: "Follow up with [Name] - missed call"
```

**Workflow 4: Post-Job Follow-up**
```
Trigger: Opportunity moved to "Job Completed"
-> Wait 24 hours
-> Send SMS: "Thanks for choosing [Business]! How'd everything go? 
   We'd love a quick review: [Google Review Link]"
-> Wait 3 days
-> If no review: Send reminder email
```

**Workflow 5: Re-engagement (No-shows / Cancellations)**
```
Trigger: Appointment status = no-show or cancelled
-> Wait 1 hour
-> Send SMS: "Hey [Name], we noticed you couldn't make it today. 
   Want to reschedule? Just reply with a time that works."
-> If no reply in 48h: Move to "Follow-up" stage
```

---

## PHASE 3: TESTING (Day 1)

### Internal Test Checklist
Before giving the client access:

- [ ] Call the number - does AI answer correctly with business name?
- [ ] Ask about each service - does AI handle all correctly?
- [ ] Ask about pricing - does AI follow the pricing policy?
- [ ] Try to book appointment - does it show up in calendar?
- [ ] Customer gets confirmation SMS after booking?
- [ ] Owner gets notification of new lead?
- [ ] Ask to speak to someone - does it transfer to owner's cell?
- [ ] Call after hours - does AI handle it correctly?
- [ ] Ask about service area - does AI know the coverage area?
- [ ] Hang up without booking - does missed-call text fire?
- [ ] Test voicemail flow
- [ ] Check CRM - is contact created with all info?
- [ ] Check pipeline - is opportunity in correct stage?

### Client Test Call
- Have the client call their new number
- Walk them through what just happened on the backend
- Show them the CRM dashboard, the contact that was created, the booking

---

## PHASE 4: CLIENT HANDOFF (Day 1-2)

### What the Client Sees (Their Dashboard)

GHL sub-account with simplified view:

1. **Dashboard** - Today's calls, upcoming appointments, new leads
2. **Contacts** - All callers, with call history and notes
3. **Calendar** - Their appointment schedule
4. **Conversations** - SMS/email threads with customers
5. **Pipeline** - Visual board of lead stages
6. **Reputation** - Google review requests and responses (if enabled)

### Client Training (15-min walkthrough)
Cover these in a quick screen-share or Loom video:

1. "Here's your dashboard - this is where you see everything"
2. "When someone calls, the AI handles it. Here's what it looks like in your CRM"
3. "Your calendar syncs automatically. Here's where to block off time"
4. "If someone texts back, you can reply right here"
5. "This pipeline shows you where every lead is"
6. "You'll get a text/email every time a new appointment books"

### Forwarding Setup
- Client forwards their existing business number to the new GHL number
- Instructions vary by carrier:
  - Most: Dial *72 + [new GHL number] from their business line
  - Or set up in their phone provider's portal
  - Or conditional forwarding (only when busy/no answer)

---

## PHASE 5: ONGOING MANAGEMENT

### Monthly Check-in (15 min)
- Review call volume and booking rate
- Any missed calls or issues?
- Adjust AI prompt based on common questions
- Review and update services/pricing if changed
- Check Google review generation rate

### What We Monitor
- Call answer rate (target: 100%)
- Booking conversion rate (target: 40-60% of answered calls)
- Customer satisfaction (via review scores)
- AI accuracy (spot-check 5 calls per week)
- Workflow trigger rates (are automations firing?)

### Cost Per Client (Our Margins)
| Item | Monthly Cost | Notes |
|------|-------------|-------|
| GHL sub-account | ~$0 | Included in our agency plan |
| Phone number | $1.15 | Local number |
| Voice AI minutes | ~$15-40 | Depends on call volume (est. 100-200 calls/mo) |
| SMS/Email | ~$5-10 | Twilio pass-through |
| **Total COGS** | **~$20-50/mo** | |
| **Client pays** | **$550/mo** | |
| **Gross margin** | **$500-530/mo** | **~91-95% margin** |

---

## AGENT ASSIGNMENTS

| Task | Lead Agent | Supporting |
|------|-----------|------------|
| Intake form + client comms | Jordan (CRO) | Ember |
| GHL sub-account build | Kai (Dev Lead) | Circuit |
| Voice AI prompt writing | Rick (orchestrator) | Quill |
| Workflow automation | Relay (Systems Architect) | Kai |
| Testing & QA | Harper (COO) | Cadence |
| Client training video | Victoria (CMO) | Quill |
| Ongoing monitoring | Harper (COO) | Cadence |
| Billing & invoicing | Morgan (CFO) | Ledger |

---

## TEMPLATES TO PRE-BUILD

These can be built NOW so deployment is instant when a client signs:

1. **Snapshot template** - Pre-built GHL snapshot with all workflows, pipelines, custom fields, and calendar. One-click deploy to new sub-account.
2. **Prompt templates by niche** - HVAC, Plumbing, Electrical, Roofing, GC base prompts ready to customize.
3. **Intake form** - GHL form or Typeform to collect all client info.
4. **Welcome email sequence** - Automated emails after signup with next steps.
5. **Training video** - Loom walkthrough of the client dashboard.
6. **Review request templates** - SMS/email templates for Google review generation.

---

## TIMELINE: SOLD TO LIVE

| Day | What Happens |
|-----|-------------|
| Day 0 | Payment received. Intake form sent. Start sub-account build. |
| Day 0-1 | Sub-account created. Phone number purchased. AI prompt written. Calendar configured. Workflows built. |
| Day 1 | Internal testing (full checklist). Fix any issues. |
| Day 1-2 | Client test call. Dashboard walkthrough. Call forwarding setup. |
| Day 2 | LIVE. Client's phone starts routing through AI. |
| Day 7 | Check-in call. Review first week of data. Adjust prompt if needed. |
| Day 30 | First monthly review. Show ROI (calls caught, appointments booked, revenue generated). |
