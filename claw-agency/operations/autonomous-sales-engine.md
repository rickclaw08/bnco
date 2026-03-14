# ClawOps Autonomous Sales Engine
## "From Cold Call to Cash - Zero Babysitting Required"

---

## VERIFIED STATUS (As of March 14, 5:10 PM ET)

### Working RIGHT NOW:
- [x] VAPI assistant (prompt v13.2, 14,881 chars)
- [x] Webhook on Fly.io (v3) receiving end-of-call events
- [x] Email notifications to Brand after EVERY call (jacksonroy152@gmail.com) - TESTED
- [x] Email follow-up to prospects (when email captured in call) - TESTED
- [x] GHL contact auto-creation + call notes after every call - TESTED
- [x] Vonage SMS fallback (sends after every call) - TESTED
- [x] Post-call analyzer (learns from every call, extracts lessons, recommends prompt fixes)
- [x] Outbound calling via VAPI + Vonage BYO SIP (+15137788336)
- [x] Inbound handler ("ClawOps, this is Jordan. How can I help you?")
- [x] serverMessages now set on assistant (was missing - fixed today)

### Broken / Not Working:
- [ ] Twilio SMS: toll-free +18773317786 verification pending (1-5 business days from Mar 13)
- [ ] VAPI wallet: -$1.77 (no calls until topped up)
- [ ] GHL Trust Center: ALL rejected (CNAM, SHAKEN/STIR, Voice Integrity, A2P Campaign)
- [ ] Outbound caller ID shows "Scam Likely" on T-Mobile

### What Brand Needs to Do (ONE-TIME, before Monday):
1. **Add $50 to VAPI** -> https://dashboard.vapi.ai/billing
2. That's it. Everything else is autonomous.

---

## THE AUTONOMOUS PIPELINE

### PHASE 1: PRE-CALL PREP (Sunday night, automated by Rick)

**Lead Scraping + Scoring:**
- Pull 50 fresh leads from Google Business Profiles (South Florida, Atlanta, Dallas, Phoenix)
- Score each: owner-reachable (direct line vs call center), business size, review count, hours
- Filter OUT: businesses with IVR/phone trees (learned from batch 1: 23% wasted), chains, businesses with <10 reviews
- Sort by score, top 30 go into the call queue
- Load into GHL with tags: campaign:wave2, status:new-lead

**Call Queue Setup:**
- Build batch JSON files with staggered timing
- Timezone-aware scheduling: calls fire at 8:30 AM LOCAL time for each lead
- East Coast leads fire first (8:30 AM ET), Central at 8:30 AM CT, Mountain/Pacific after

### PHASE 2: CALL EXECUTION (Monday-Friday, 8:30-10:30 AM local)

**Autonomous Call Flow:**
```
Rick fires batch via VAPI API
  -> Jordan (AI) calls prospect
    -> Call ends
      -> Webhook receives end-of-call-report
        -> Email notification to Brand (with transcript + recording)
        -> SMS follow-up to prospect (via Vonage, Twilio when verified)
        -> GHL contact created/updated + call notes logged
        -> Post-call analyzer grades outcome + extracts lessons
```

**After Each Batch:**
- Rick runs post-call-analyzer.py --latest
- Analyzer grades every call, extracts wins/failures
- If a pattern appears 3+ times -> Rick patches the prompt automatically
- Brand gets a batch summary via Telegram (outcomes, hot leads, lessons learned)

**Batch Sizes:**
- Monday: 5 test calls (validate v13.2 prompt, confirm all systems work)
- Tuesday: 15 calls if Monday shows improvement
- Wednesday-Friday: 20-30 calls per day (budget: ~$3-5/batch at $0.15/call avg)

### PHASE 3: HOT LEAD FOLLOW-UP (Same day, automated + Brand assist)

**When a call scores HOT_LEAD (score 90+):**
1. Rick sends Brand an IMMEDIATE Telegram alert with:
   - Prospect name, business, phone number
   - What they were interested in
   - Exact text message for Brand to send from personal phone
2. Email auto-fires to prospect (founding member details + link)
3. GHL opportunity moves to "Hot Lead" stage
4. If prospect gave their email -> follow-up email sends automatically

**When a call scores WARM_CALLBACK (score 50-89):**
1. Rick queues a callback for next day morning (same time slot)
2. Brand gets a Telegram summary at end of day with ALL warm leads
3. Brand can text any of them from personal phone (Rick provides exact copy-paste messages)

**When a call scores GATEKEEPER_DEFLECT (score 20):**
1. If we got the owner's name -> callback queued asking for owner by name
2. If no name -> try calling at 7:30 AM before office staff arrives

**When a call is a SOFT_NO or HARD_NO:**
- Mark in GHL, do not call again for 30 days
- Move to nurture email sequence (monthly value email, not sales)

### PHASE 4: THE CLOSE (When prospect is ready)

**Closing Sequence (Rick orchestrates, Brand involved for payment):**

Step 1: Prospect says they're interested on the call
- Jordan says: "I'll text you the link right now."
- Webhook auto-fires SMS with founding member Stripe link
- Email fires with full details + Stripe link

Step 2: If no payment within 2 hours
- Rick drafts a follow-up text for Brand to send:
  "Hey [Name], Jordan from ClawOps here. Just wanted to make sure you got everything. Any questions before you lock in the founding rate? That price goes up once spots fill."

Step 3: If no payment within 24 hours
- Rick drafts another Brand text:
  "[Name], quick heads up. We had another contractor sign up today, spots are moving. Want to jump on a quick 5-min call so I can show you exactly what your setup would look like? (513) 778-8336"

Step 4: If payment comes through (Stripe webhook or manual check)
- Rick notifies Brand immediately via Telegram
- Client onboarding kicks off (see PHASE 5)

### PHASE 5: CLIENT DELIVERY (48 hours from payment)

**Day 0 (Payment received):**
- Rick sends intake form to client (via email or GHL form)
- Starts building GHL sub-account
- Picks niche prompt template (HVAC/Plumbing/Electrical/Roofing/GC)

**Day 0-1:**
- GHL sub-account created with: calendar, pipeline, workflows, custom fields
- Voice AI agent built with customized prompt (business name, services, pricing, area)
- Phone number purchased and assigned
- 5 automation workflows activated (new call, appointment booked, missed call, post-job, re-engagement)

**Day 1:**
- Rick runs full test checklist (13 items: call the number, test every service question, book appointment, check notifications, etc.)
- Fix any issues

**Day 1-2:**
- Client test call + dashboard walkthrough (Brand does a 15-min screen share or Loom video)
- Call forwarding setup (client forwards their business number to new GHL number)

**Day 2: LIVE**
- AI starts answering their calls
- Rick monitors first 48 hours of calls, spot-checks transcripts
- Adjusts prompt based on real call data

---

## DAILY SCHEDULE (Autonomous)

| Time (ET) | What Happens | Who |
|-----------|-------------|-----|
| 7:00 AM | Rick checks VAPI balance, confirms systems ready | Rick (auto) |
| 7:30 AM | Priority callbacks (Elite AC, any urgent callbacks) | VAPI (auto) |
| 8:30 AM | Main batch fires (15-30 calls, timezone-staggered) | VAPI (auto) |
| 9:30 AM | Post-call analysis runs, lessons extracted | Rick (auto) |
| 10:00 AM | Brand gets Telegram summary: results, hot leads, action items | Rick -> Brand |
| 10:30 AM | Second batch if needed (remaining leads) | VAPI (auto) |
| 12:00 PM | Follow-up texts drafted for Brand (hot/warm leads) | Rick -> Brand |
| 3:00 PM | End-of-day report: total calls, outcomes, prompt changes, revenue pipeline | Rick -> Brand |
| 8:00 PM | Next-day prep: score leads, build batch files, queue callbacks | Rick (auto) |

---

## WHAT BRAND DOES (Minimal)

1. **Top up VAPI** ($50 once, then as needed ~$10-15/week)
2. **Send texts Rick drafts** (copy-paste to hot leads from personal phone)
3. **Do the 15-min client onboarding call** when we close a deal (Rick preps everything, Brand just screen-shares)
4. **Check Telegram** morning + afternoon for updates

That's it. Everything else is automated.

---

## BUDGET MATH

| Item | Weekly Cost | Notes |
|------|-----------|-------|
| VAPI calls (100 calls/week) | ~$15 | At $0.15/call avg |
| Vonage SMS | ~$2 | $0.02/msg |
| Fly.io webhook | $0 | Within free tier |
| GHL | $0 | Within existing plan |
| **Total weekly burn** | **~$17** | |
| **Break-even** | **1 sale** | $2,500 setup + $550/mo = covers 10+ weeks |

---

## WHAT RICK PREPARES BEFORE MONDAY

1. [x] Prompt v13.2 deployed (revenue protection framing, gatekeeper pushback, deal-killers, compliment, identity protection)
2. [x] Post-call analyzer built and tested
3. [x] serverMessages fixed (webhook now receives events)
4. [x] Webhook verified (email, SMS, GHL all working)
5. [x] Client onboarding playbook written
6. [x] 5 niche prompt templates ready
7. [ ] Scrape 50 fresh leads (Sunday night)
8. [ ] Score and rank leads, build Monday batch
9. [ ] Pre-screen for IVR (filter call-center numbers)
10. [ ] Set up Telegram notification for hot lead alerts
11. [ ] Create follow-up text templates for Brand

---

## SUCCESS METRICS (Week of March 17)

| Metric | Target | How We Know |
|--------|--------|-------------|
| Calls made | 100+ | VAPI dashboard |
| Human conversations | 30+ (30%) | Post-call analyzer |
| Warm+ leads | 8-10 (8-10%) | Score >= 50 |
| Demo interest | 3-5 | Score >= 70 |
| Closes | 1-2 | Stripe payment |
| Revenue | $2,500-5,000 | First founding member(s) |
