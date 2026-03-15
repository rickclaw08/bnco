# ClawOps Full Revenue Pipeline - End to End
*From Cold Call to Client Live | Updated March 15, 2026*

---

## PHASE 0: PRE-CALL PREP (Rick handles, fully automated)

**What happens before Jordan even dials:**

1. Leads scraped from Google Business Profiles, scored by review count + rating + niche
2. Deduped, phone-verified against GBP listings
3. Imported into GHL CRM with tags (niche, source, campaign)
4. Added to Google Sheet for tracking
5. Batch files built per timezone window (8-10 AM local)
6. VAPI outbound batch fires at scheduled time

**Brand's involvement: Zero.**

---

## PHASE 1: THE CALL (Jordan AI via VAPI)

**What Jordan does on each call:**

1. Opens casual: "Hey, this is Jordan with ClawOps."
2. Identifies who picked up (owner, gatekeeper, receptionist)
3. Adapts approach per prospect type and niche
4. Runs the pain discovery: missed calls, after-hours gaps, overflow during peak
5. Delivers the reveal: "This call IS the demo. I'm the system."
6. Handles objections (price, skepticism, "send me info")
7. Pushes for the close or locks a callback time

**Possible outcomes per call:**

| Outcome | What happens next |
|---------|------------------|
| HOT LEAD (wants to buy now) | Jordan captures info, sends Stripe link via SMS |
| WARM (wants demo / callback) | Callback time logged, shadow demo link texted |
| SOFT NO (not now / send info) | Seasonal seed planted, follow-up scheduled |
| GATEKEEPER BLOCK | Owner name + callback time captured |
| HARD NO / DNC | Contact tagged, never called again |
| NO ANSWER / VOICEMAIL | 15-sec voicemail left, retry scheduled for next batch |
| IVR TRAP | Detected and hung up within 15 seconds |

**Brand's involvement: Zero. Everything fires automatically.**

---

## PHASE 2: POST-CALL AUTOMATION (Webhook + Workflows)

**Immediately after every call ends, the webhook fires:**

1. **Call transcript + recording saved** to GHL contact notes
2. **Post-call analyzer runs** - grades the call, extracts lessons, updates patterns
3. **Hot/warm lead alert** - Brand gets a Telegram notification with the prospect's name, niche, interest level, and recommended next action
4. **Follow-up SMS fires** (via Aurolly/Twilio toll-free number):

   - HOT LEAD gets:
     > "Hey [Name], this is Jordan from ClawOps. Great talking with you. Here's the founding member link - locks in the lowest rate we'll ever offer: [Stripe link]. Questions? Call me at 513-778-8336."

   - WARM gets:
     > "Hey [Name], Jordan from ClawOps. Like I mentioned, call this number and test it yourself: [demo line]. When you're ready, founding spots are filling up: [Stripe link]"

   - CALLBACK gets:
     > "Hey [Name], Jordan from ClawOps. Looking forward to connecting on [day/time]. Talk soon."

5. **GHL pipeline updated** - contact moves to appropriate stage
6. **Callback scheduled** in task queue for exact promised time

**Brand's involvement: Check Telegram alerts. Copy-paste texts Rick drafts for hot leads if SMS isn't automated yet.**

---

## PHASE 3: FOLLOW-UP SEQUENCE (Days 1-14)

**Automated multi-touch follow-up for warm leads:**

Day 0: Initial SMS (post-call)
Day 1: Second SMS with shadow demo link
Day 3: Email with case study / ROI breakdown
Day 5: SMS - "Hey [Name], those founding spots are moving. 3 left in [their city]. Want me to hold one?"
Day 7: Callback attempt (Jordan AI calls again)
Day 10: Final SMS - "Last check-in, [Name]. After this I won't bug you. But when [peak season] hits and voicemail fills up, my number is 513-778-8336."
Day 14: Contact marked "Nurture" - goes into monthly newsletter/seasonal re-engagement

**For callbacks specifically:**
- Jordan calls back at EXACTLY the promised time
- Opens with: "Hey [Name], it's Jordan from ClawOps. You asked me to call back around now."
- This follow-through alone converts, because nobody else does it

**Brand's involvement: Minimal. Review hot leads. Jump on a 15-min close call if prospect wants to talk to a human.**

---

## PHASE 4: THE CLOSE (Payment)

**How the sale actually happens:**

**Path A: Self-Service (no human needed)**
1. Prospect clicks Stripe link from SMS/email
2. Pays $2,500 setup + first month $550 = $3,050 charged
3. Stripe webhook fires: payment confirmed
4. Brand gets Telegram alert: "[Business Name] just paid. New client."
5. Automatic welcome email sends to client with intake form link
6. Onboarding kicks off immediately

**Path B: Close Call (15 min, Brand or Jordan AI)**
1. Prospect requests a call / has questions
2. Brand (or Jordan AI on inbound) takes a 15-minute call
3. Handles final objections, walks through what they get
4. Sends Stripe link during the call
5. Payment processed, same flow as Path A

**Path C: Shadow Demo Conversion**
1. Prospect called the demo number and was impressed
2. Texts back "I'm in" or "send me the link"
3. Stripe link sent, payment processed
4. Same onboarding flow

**Pricing:**
- Founding Member: $2,500 setup + $550/mo (locked forever)
- Regular (after 20 spots): $3,000 setup + $750/mo
- Stripe handles all billing, auto-charges monthly

**Brand's involvement: Path A = zero. Path B = 15 min call. Path C = zero.**

---

## PHASE 5: CLIENT ONBOARDING (Day 0-2 after payment)

### Day 0: Intake + Account Build

**Hour 0-1: Intake Form**
Client fills out the intake form (auto-sent after payment):
- Business name, address, phone, email, website
- Services offered + pricing ranges
- Service area (cities/zips)
- Business hours + after-hours policy
- Emergency protocol (transfer to cell? Book next day?)
- Current scheduling system (ServiceTitan, Jobber, Google Cal, pen & paper)
- Tone preference (professional, friendly, casual)
- Any specific instructions ("never quote prices over the phone," "always offer free estimates," etc.)

**Hour 1-4: GHL Sub-Account Build (Rick handles, fully automated)**

1. **Create sub-account** in ClawOps GHL agency
   - Client's business name, timezone, address
   - Admin access for client (email invite)

2. **Phone number setup**
   - Buy a local number in their area code ($1.15/mo)
   - OR start porting their existing number (2-4 weeks, local number as interim)
   - Assign to Voice AI agent
   - Configure caller ID / CNAM with their business name

3. **Calendar build**
   - "[Business Name] - Service Appointments"
   - Availability per their business hours
   - Slot duration based on their services (2-4 hour blocks typical)
   - Buffer time for travel (30-60 min)
   - Connect to their Google Calendar if they use one (OAuth)
   - appointmentsPerSlot: based on their crew size

4. **Pipeline build**
   - "Inbound Leads" pipeline
   - Stages: New Lead > Contacted > Appointment Booked > Job Completed > Follow-up
   - Automations on each stage transition

5. **Custom fields**
   - Service Needed (dropdown of their services)
   - Address/Location
   - Urgency (routine, same-day, emergency)
   - Source (AI call, website, referral)
   - Job Value (estimated)

### Day 0-1: Voice AI Agent Build

**Write custom prompt** using niche templates + client intake data:

The prompt gets built from our base templates (HVAC, Plumbing, Roofing, Electrical, GC) customized with:
- Their business name and persona name
- Their specific services and pricing rules
- Their service area
- Their business hours and emergency protocol
- Their scheduling rules
- Their tone and personality preferences
- Transfer rules (when to send to owner's cell vs. handle autonomously)

**Voice AI agent configured:**
- LLM: GPT-4.1
- Voice: Selected based on client preference (Archer, Jessica, or Elliot for professional; Mark for casual)
- Mode: Advanced
- Actions connected:
  - "Schedule Appointment" linked to their calendar
  - "Send SMS" for booking confirmations
  - "Transfer Call" to owner's cell for escalations
- Voicemail detection enabled
- Max call duration: 5 minutes (prevents cost runaway)

### Day 0-1: Workflow Automation Build

**5 core workflows, pre-built as GHL snapshot, deployed to their sub-account:**

**Workflow 1: New Inbound Call**
- Trigger: Inbound call to their AI number
- Creates/updates contact with call data
- Adds to pipeline (New Lead stage)
- Tags: source:ai-call, niche:[their trade]
- Sends internal notification to owner (SMS + email): "New lead: [Name], needs [service], booked for [time]"

**Workflow 2: Appointment Booked**
- Trigger: Calendar event created
- Confirmation SMS to customer: "Your appointment with [Business] is confirmed for [date/time]. Reply CHANGE to reschedule."
- Confirmation email with details + address
- Pipeline move to "Appointment Booked"
- Owner notification with full appointment details
- 24-hour reminder SMS to customer
- 1-hour reminder SMS to customer

**Workflow 3: Missed Call Recovery**
- Trigger: Missed call (no voicemail left)
- Wait 2 minutes
- Auto-SMS: "Hey [Name], this is [Business]. Sorry we missed you! How can we help? Reply here or we'll call you right back."
- Creates task for owner: "Follow up - missed call from [Name]"

**Workflow 4: Post-Job Follow-up + Review Generation**
- Trigger: Contact moved to "Job Completed" stage
- Wait 24 hours
- SMS: "Thanks for choosing [Business]! How'd everything go? We'd love a quick review: [Google Review Link]"
- Wait 3 days, if no review: reminder email
- This builds their Google reputation automatically

**Workflow 5: No-Show / Cancellation Recovery**
- Trigger: Appointment marked no-show or cancelled
- Wait 1 hour
- SMS: "Hey [Name], looks like we missed each other. Want to reschedule? Just reply with a time."
- If no reply in 48h: move to Follow-up stage

---

## PHASE 6: TESTING + QA (Day 1)

**Internal testing checklist (Rick runs all of this):**

- [ ] Call the number. AI answers with correct business name and greeting.
- [ ] Ask about each service. AI describes them accurately.
- [ ] Ask about pricing. AI follows their pricing policy (quotes range or says "free estimate").
- [ ] Book an appointment. Confirm it shows in calendar.
- [ ] Customer gets confirmation SMS after booking.
- [ ] Owner gets notification of new lead/booking.
- [ ] Ask to speak to someone. AI transfers to owner's cell.
- [ ] Call after hours. AI handles correctly (emergency protocol or books next day).
- [ ] Ask about service area. AI knows their coverage zone.
- [ ] Hang up without booking. Missed call text fires within 2 minutes.
- [ ] Test voicemail flow.
- [ ] Check CRM: contact created with all fields populated.
- [ ] Check pipeline: opportunity in correct stage.
- [ ] Send test appointment reminder sequence.
- [ ] Review generation workflow test.

**Every item must pass before client sees anything.**

**Brand's involvement: Zero. Rick handles all QA.**

---

## PHASE 7: CLIENT HANDOFF (Day 1-2)

### What the Client Gets Access To:

**Their GHL dashboard (simplified view):**
1. **Dashboard** - today's calls, upcoming appointments, new leads at a glance
2. **Contacts** - every caller with full history, call recordings, notes
3. **Calendar** - their appointment schedule, drag-and-drop rescheduling
4. **Conversations** - SMS/email threads with customers (they can reply directly)
5. **Pipeline** - visual board of where every lead stands
6. **Reputation** - Google review requests and responses
7. **Mobile app** - GHL app on their phone for on-the-go management

### Client Training (15 min, one-time)

Screen-share or Loom video covering:
1. "Here's your dashboard. This is command central."
2. "When someone calls, the AI handles it. Here's what it looks like in your CRM."
3. "Your calendar syncs automatically. Block off time here when you're booked."
4. "If a customer texts back, reply right from this screen."
5. "This pipeline shows where every lead stands. Drag to update."
6. "You'll get a text every time a new appointment books."
7. "Download the GHL app. Everything works from your phone."

### Phone Forwarding Setup

**How their existing number connects to the AI:**

Option A: Call forwarding (instant, recommended)
- Client dials *72 + [new AI number] from their business phone
- All calls now route through AI first
- If AI can't handle, transfers to their cell
- They can toggle forwarding on/off anytime

Option B: Number porting (2-4 weeks, permanent)
- Port their existing business number directly into GHL
- Their number becomes the AI number
- No forwarding needed, cleaner setup
- Use local number as interim during port

Option C: New number (simplest)
- Client uses the new local number we bought as their business line
- Updates Google Business Profile, cards, website, etc.
- Best for newer businesses without established numbers

**Brand's involvement: 15 minutes for the training call. That's it.**

---

## PHASE 8: GO LIVE (Day 2)

1. Phone forwarding activated (or new number published)
2. AI starts answering real customer calls
3. All workflows firing
4. Owner receiving notifications on every lead
5. Calendar filling up
6. Rick monitors first 48 hours for any prompt issues

**Day 7 check-in:**
- Review first week of data
- How many calls caught? How many appointments booked?
- Any questions the AI couldn't handle? (Adjust prompt)
- Client satisfaction check
- Show them the ROI: "You had [X] calls this week. [Y] booked. That's [Z] in potential revenue your voicemail would have lost."

---

## PHASE 9: ONGOING (Monthly)

### What We Do Every Month:
1. **Monthly review call** (15 min) - show call volume, booking rate, revenue captured
2. **Prompt optimization** - spot-check 5-10 calls, fix any recurring issues
3. **Workflow tuning** - adjust follow-up timing based on what's converting
4. **Seasonal adjustments** - ramp AI responses for peak season (summer HVAC, storm roofing, etc.)
5. **Google review monitoring** - how many reviews generated this month?

### What the Client Does:
- Answer the phone if AI transfers (rare)
- Check their dashboard / app periodically
- Show up to booked appointments
- Move jobs to "Completed" when done (triggers review request)
- That's literally it

### Our Margins Per Client:
| Item | Monthly Cost |
|------|-------------|
| GHL sub-account | ~$0 (included in agency) |
| Phone number | $1.15 |
| Voice AI minutes (~150 calls/mo) | ~$20-35 |
| SMS/Email | ~$5-10 |
| **Total COGS** | **$25-50/mo** |
| **Client pays** | **$550/mo** |
| **Gross profit** | **$500-525/mo** |
| **Margin** | **~91-95%** |

Setup: $2,500 collected, ~$50 in actual build costs (mostly our time). That's 98% margin on setup.

---

## FULL TIMELINE SUMMARY

| Day | What Happens | Who Does It |
|-----|-------------|-------------|
| Day -X | Lead scraped, scored, imported, called | Rick + Jordan AI |
| Day -X | Post-call follow-up sequence fires | Automated |
| Day 0 | Payment received via Stripe | Self-service or 15-min close call |
| Day 0 | Intake form auto-sent, client fills it | Client (10 min) |
| Day 0 | Sub-account created, phone number bought | Rick (automated) |
| Day 0-1 | Voice AI prompt written + deployed | Rick (templated) |
| Day 0-1 | Workflows + calendar + pipeline built | Rick (snapshot deploy) |
| Day 1 | Full QA testing (15-point checklist) | Rick |
| Day 1-2 | Client test call + 15-min training | Brand or Rick |
| Day 2 | Call forwarding set up, GO LIVE | Client (2 min) |
| Day 7 | First week check-in | Brand or Rick (15 min) |
| Day 30+ | Monthly review + optimization | Rick (15 min/mo) |

**Total Brand time per client: ~30 minutes (close call + training). Everything else is automated or Rick-handled.**

---

## THE PACKAGE (What They're Actually Buying)

When we say "$2,500 setup + $550/mo," here's the deliverable in plain English:

**Setup ($2,500 one-time):**
- Custom AI receptionist trained on their exact business
- CRM dashboard with contacts, pipeline, calendar
- 5 automated workflows (new lead, booking confirmation, missed call recovery, review generation, no-show recovery)
- Phone number (local to their area)
- Calendar integration with their existing system
- Full QA testing
- 15-minute training session
- Live within 48 hours

**Monthly ($550/mo, locked at founding rate):**
- AI answers every call, 24/7/365
- Unlimited simultaneous calls (no more overflow to voicemail)
- Automated booking + confirmations + reminders
- Missed call recovery texts
- Post-job Google review generation
- CRM access with full lead tracking
- Monthly optimization + prompt tuning
- Monthly review call (15 min)
- Priority support

**What they DON'T need to do:**
- Hire a receptionist ($2,500-3,500/mo)
- Pay for an answering service ($1-3 per call, adds up fast)
- Miss calls while on jobs
- Manually follow up with every lead
- Ask customers for reviews
- Think about any of this
