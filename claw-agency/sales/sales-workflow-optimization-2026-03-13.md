# Sales Workflow Optimization Report
**ClawOps AI Receptionist | March 13, 2026**
**Author: Jordan (CRO)**
**Status: URGENT - $0 Revenue, First Sale Needed This Week**

---

## 1. Current Gaps - What's Broken Right Now

Let's be brutally honest about where we stand. We have a product, a dialer, and 172 contacts. That's it. Everything between "first call" and "money in Stripe" is held together with duct tape and hope.

### Critical Gaps

| Gap | Impact | Severity |
|-----|--------|----------|
| **No pipeline automation in GHL** | Leads sit in limbo after calls. No one knows who's hot, warm, or dead. | 🔴 Critical |
| **No automated follow-up after first call** | We dial once and then... nothing. 80% of sales happen between touches 5-12. We stop at 1. | 🔴 Critical |
| **No lead scoring** | All 172 contacts treated equally. We're burning VAPI minutes on landscapers and tire-kickers instead of $500K/yr HVAC companies. | 🔴 Critical |
| **SMS blocked** | Toll-free verification pending (1-5 days). Our highest-response channel is offline. Contractors live on their phones - text is king. | 🟡 Blocked (external) |
| **No call recording review** | We have no idea what's working in the Jordan Belfort v10.2 prompt. No objection tracking, no conversion analysis. Flying blind. | 🟡 High |
| **No inbound speed-to-lead** | When 915-268-9089 called and asked about pricing, what happened automatically? Nothing. That's a leak. | 🔴 Critical |
| **GHL is read-only for automation** | No API writes means every pipeline move, tag update, and stage change is manual browser work. Brutal bottleneck. | 🟡 High |
| **No clear close mechanism** | How does a "yes" on a call become money in Stripe? There's no payment link flow, no proposal template, no contract process. | 🔴 Critical |
| **Over-contact risk** | Aaron (warm lead, founding deal interest) has been over-contacted. We burned goodwill. No contact protocols exist. | 🟡 High |

### The Core Problem

We built a calling machine but not a selling machine. VAPI dials. The webhook fires an email. Then silence. That's not a sales workflow - that's a notification system.

---

## 2. Optimal Call-to-Close Workflow

Here's the full journey map from first touch to payment. Every step, every automation, every handoff.

### Stage 0: Pre-Qualification (Before First Dial)

```
Contact enters GHL (manual add, inbound call, web form)
    ↓
Lead Scoring Algorithm runs (see Section 4)
    ↓
Score >= 70 → Priority Queue (Top 30)
Score 40-69 → Standard Queue
Score < 40  → Nurture Only (no calls)
    ↓
Assign Pipeline Stage: "New Lead"
```

### Stage 1: First Touch (VAPI AI Call)

```
VAPI dials from +15137788336
    ↓
Jordan Belfort v10.2 prompt executes
    ↓
Call Outcomes (webhook fires):
    ├── ANSWERED + INTERESTED → Stage: "Engaged" 
    │   ├── Email follow-up fires (Gmail SMTP) ✅ WORKING
    │   ├── Brand gets Slack/email notification ✅ WORKING
    │   ├── GHL contact updated ✅ WORKING
    │   ├── GHL task created: "Send proposal within 2 hours"
    │   └── Follow-up sequence triggered (see Section 5)
    │
    ├── ANSWERED + OBJECTION → Stage: "Objection Handling"
    │   ├── Tag with specific objection (price, timing, already have solution)
    │   ├── Objection-specific email fires
    │   └── Follow-up call scheduled Day 3
    │
    ├── ANSWERED + NOT INTERESTED → Stage: "Closed - Lost"
    │   ├── Tag reason
    │   ├── Remove from active sequences
    │   └── 90-day re-engagement nurture
    │
    ├── VOICEMAIL → Stage: "Voicemail Left"
    │   ├── Voicemail-specific email fires
    │   ├── Retry call Day 2 (different time)
    │   └── Max 3 voicemails, then email-only
    │
    └── NO ANSWER → Stage: "No Contact"
        ├── Retry call Day 1 (different time of day)
        ├── Max 5 attempts across 10 days
        └── Then move to email-only nurture
```

### Stage 2: Engagement → Demo/Proof

```
"Engaged" leads get:
    ↓
Brand sends personalized video or live demo link (within 2 hours)
    ↓
Demo happens (Brand runs this live OR sends pre-recorded walkthrough)
    ↓
Outcomes:
    ├── WANTS TO PROCEED → Stage: "Proposal Sent"
    │   ├── Send proposal email with pricing (founding vs. regular)
    │   ├── Include Stripe payment link
    │   ├── Include case study / ROI calculator
    │   └── Task: "Follow up if no response in 24h"
    │
    └── NEEDS MORE INFO → Stage: "Info Requested"
        ├── Send specific materials requested
        ├── Schedule callback in 48h
        └── Continue email sequence
```

### Stage 3: Proposal → Close

```
Proposal sent with Stripe link
    ↓
24h no response → Brand calls personally (NOT AI - this is a human close)
    ↓
48h no response → "Limited founding spots" urgency email
    ↓
72h no response → Final email: "Holding your spot until Friday"
    ↓
Outcomes:
    ├── PAYMENT RECEIVED → Stage: "Won - Onboarding"
    │   ├── Welcome email + onboarding checklist
    │   ├── Schedule kickoff call
    │   ├── Stripe subscription confirmed
    │   └── 🎉 Revenue on the board
    │
    ├── PRICE OBJECTION → Offer founding deal ($2,500 + $550/mo)
    │   └── "Only 5 founding spots left" (scarcity)
    │
    └── GHOSTED → Stage: "Stalled"
        ├── Move to long-term nurture
        └── Re-engage in 30 days
```

### Stage 4: Post-Close

```
Won deal → Onboarding
    ↓
Week 1: Setup call, configure AI receptionist
Week 2: Go live, monitor performance
Week 4: Check-in call, gather testimonial
    ↓
Referral ask: "Know any other contractors who'd want this?"
```

---

## 3. GHL Automations to Build

Since GHL has no API writes, all of these are built in GHL's native Workflow Builder (browser UI). Brand needs to build these manually, but they're one-time setups.

### Pipeline Stages to Create

Create one pipeline called **"AI Receptionist Sales"** with these stages:

1. **New Lead** - Just entered CRM
2. **Contacted - No Answer** - Called, no pickup
3. **Contacted - Voicemail** - Left voicemail
4. **Engaged** - Spoke with them, showed interest
5. **Objection Handling** - Interest but has concerns
6. **Demo Scheduled** - Booked a demo/walkthrough
7. **Proposal Sent** - Pricing and payment link sent
8. **Negotiating** - Discussing terms
9. **Won** - Payment received
10. **Lost** - Not buying (tag with reason)
11. **Stalled** - Went dark after engagement
12. **Nurture** - Long-term, not ready now

### Workflow 1: Post-Call Auto-Tagger

**Trigger:** Contact tag added (via webhook from VAPI call)
- If tag = "call-interested" → Move to "Engaged" stage → Create task "Send proposal in 2h" for Brand
- If tag = "call-objection" → Move to "Objection Handling" → Create task "Review objection and follow up Day 3"
- If tag = "call-voicemail" → Move to "Contacted - Voicemail" → Add to voicemail follow-up sequence
- If tag = "call-no-answer" → Move to "Contacted - No Answer" → Schedule retry

### Workflow 2: Engaged Lead Follow-Up Sequence

**Trigger:** Opportunity moves to "Engaged" stage
- **Immediately:** Email 1 - "Great talking with you" + value prop recap + demo link
- **+24h:** Internal notification to Brand if no demo booked
- **+48h:** Email 2 - Case study / ROI breakdown for their trade
- **+72h:** Email 3 - "Quick question" - soft touch, ask if they have questions
- **+5 days:** Email 4 - Testimonial + founding offer reminder

### Workflow 3: Proposal Follow-Up

**Trigger:** Opportunity moves to "Proposal Sent" stage
- **+24h:** Task created for Brand: "Call [contact] - proposal follow-up"
- **+48h:** Email - "Founding spots update" (scarcity)
- **+72h:** Email - "Holding your spot until [date]" (deadline)
- **+5 days:** If no payment → Move to "Stalled" → Task: "Last attempt call"

### Workflow 4: Speed-to-Lead (Inbound)

**Trigger:** Inbound call received OR form submitted
- **Immediately:** Brand notification (push + email)
- **Within 1 min:** Auto-tag "inbound-hot"
- **Within 5 min:** Task created: "Call back [contact] ASAP"
- **If no callback in 30 min:** Alert escalation to Brand
- **+2h if still no contact:** Email fires with booking link

### Workflow 5: Stalled Lead Re-Engagement

**Trigger:** Opportunity in "Stalled" for 30 days
- Email: "We've improved since we last talked" + new feature/testimonial
- If email opened → Task: "Re-engage [contact] - showed interest"
- If no open → Wait 60 more days → One final email → If nothing, move to "Lost"

### Workflow 6: Lost Lead Tagging

**Trigger:** Opportunity moves to "Lost"
- Require reason tag (price, timing, competitor, not interested, bad fit)
- Remove from all active sequences
- Add to 90-day win-back sequence (quarterly check-in email)

### Task Templates for Brand

Every task should include:
- Contact name and phone number
- What stage they're in
- What happened on last touch
- Suggested action and script notes
- Due date/time

---

## 4. Lead Scoring Model

### Scoring Criteria (100-Point Scale)

We need to rank all 172 contacts and identify the Top 30 to prioritize this week.

#### Company Signals (40 points max)

| Signal | Points | Rationale |
|--------|--------|-----------|
| Trade: HVAC | +15 | Highest ticket jobs, most calls, biggest pain point |
| Trade: Plumbing | +12 | High call volume, emergency-driven |
| Trade: Electrical | +10 | Steady work, good margins |
| Trade: Roofing | +8 | Seasonal but high-ticket |
| Other trade | +3 | May still benefit |
| Revenue $500K+/yr (estimated) | +10 | Can afford $550/mo without blinking |
| Revenue $250-500K/yr | +7 | Good fit, founding deal sweet spot |
| Revenue $100-250K/yr | +4 | Tight budget, harder close |
| Revenue <$100K/yr | +1 | Probably can't afford it |
| Team size 5+ employees | +5 | More calls, more need for receptionist |
| Team size 2-4 | +3 | Growing, feeling the pain |
| Solo operator | +1 | Least likely to pay for AI receptionist |

#### Engagement Signals (35 points max)

| Signal | Points | Rationale |
|--------|--------|-----------|
| Inbound inquiry (they called us) | +15 | Highest intent possible |
| Responded to outreach positively | +10 | Showed interest |
| Opened email(s) | +5 | Some awareness |
| Visited website | +5 | Active research mode |
| Asked about pricing | +10 | Buying signal |
| Requested demo | +10 | Very high intent |
| Previous conversation with Brand | +5 | Warm relationship |

#### Timing Signals (15 points max)

| Signal | Points | Rationale |
|--------|--------|-----------|
| Currently in busy season | +10 | Feeling the pain of missed calls RIGHT NOW |
| Recently posted job listing (growth) | +5 | Scaling, needs systems |
| Recently got bad Google review about phone responsiveness | +10 | Acute pain point |
| Off-season | +2 | Less urgency |

#### Negative Signals (Deductions)

| Signal | Points | Rationale |
|--------|--------|-----------|
| Already has answering service | -10 | Harder to displace |
| Told us "not interested" explicitly | -20 | Respect the no |
| Over-contacted (like Aaron) | -15 | Back off, let them come to us |
| Bad phone number / unreachable | -25 | Can't sell to ghosts |
| Out of service area | -15 | Geographic mismatch |

### Top 30 Selection Process

1. Score all 172 contacts using the model above
2. Sort descending by score
3. Top 30 = this week's call list
4. Prioritize by score within the Top 30
5. Re-score weekly as new engagement data comes in

### Immediate Priority Leads (Known)

| Lead | Score (est.) | Status | Action |
|------|-------------|--------|--------|
| Unknown caller (915-268-9089) | 85+ | Asked about pricing, positive on deal | **CALL BACK IMMEDIATELY** - Brand should personally call, not AI. This is a warm close. |
| Aaron (509-521-8668) | 75 | Interested in founding deal | **DO NOT CONTACT** - Over-contacted. Wait for him to reach out. Have response ready. |

---

## 5. Multi-Touch Follow-Up Sequence

After the first AI call, here's what happens based on outcome. Every touch has a purpose. No "just checking in" garbage.

### Sequence A: Interested (Engaged Stage)

| Day | Channel | Action | Content Strategy |
|-----|---------|--------|-----------------|
| Day 0 (immediately) | Email | Value recap | "Here's what [AI Receptionist] would look like for [their trade]" - personalized to their business |
| Day 0 (+2h) | Brand call | Personal outreach | Brand calls to introduce himself. Human touch. "I'm the founder, wanted to connect personally." |
| Day 1 | Email | ROI calculator | "You're probably missing 30% of calls. Here's what that costs you in [their trade]." Numbers. |
| Day 3 | Email | Case study | Show a contractor like them winning. If no case studies yet, use industry data. |
| Day 3 | SMS* | Soft touch | "Hey [name], Brand from ClawOps. Wanted to make sure you got the info I sent. Any questions?" |
| Day 5 | Email | Scarcity | "We have [X] founding spots left at $550/mo. Regular price is $750/mo." |
| Day 7 | Brand call | Close attempt | Direct ask: "Ready to lock in the founding rate?" |
| Day 10 | Email | Last call | "Closing founding enrollment Friday. Wanted to give you first shot." |
| Day 14 | Email | Long-term nurture | Move to monthly touchpoint. Value-add content only. |

*SMS activates once toll-free verification clears.

### Sequence B: Voicemail Left

| Day | Channel | Action |
|-----|---------|--------|
| Day 0 | Email | "Sorry I missed you" + brief value prop |
| Day 1 | VAPI call | Retry (different time of day - if AM first, try PM) |
| Day 2 | Email | "Quick question about your missed calls" (curiosity hook) |
| Day 3 | VAPI call | Final call attempt |
| Day 5 | Email | ROI breakdown - "contractors lose $X/mo from missed calls" |
| Day 7 | Email | "Not sure if phone's the best way - reply here if easier" |
| Day 10+ | Monthly email | Long-term nurture only |

### Sequence C: Objection Received

Tailor follow-up to the specific objection:

**Price objection:**
- Day 1: Email - ROI math. "At $550/mo, you only need to catch ONE missed $3,000 job to 5x your investment."
- Day 3: Email - Founding deal comparison vs. regular pricing. Show savings over 12 months.
- Day 5: Brand call - "What if we structured it differently?" (explore options)

**Timing objection ("not right now"):**
- Day 1: Email - "Totally understand. When's your busy season?" (gather intel)
- Day 30: Re-engage with seasonal angle
- Day 60: "Your busy season is coming - want to be set up before it hits?"

**Already have a solution:**
- Day 1: Email - Feature comparison. What we do that Ruby/Smith.ai doesn't.
- Day 7: Email - Cost comparison. Show savings.
- Day 30: "How's your current solution working?" (dig for pain)

**"I need to think about it":**
- This is a soft no. Treat as price + timing combined.
- Day 2: Email - Address the unspoken objection. "Most contractors wonder if AI sounds robotic. Here's a sample call."
- Day 4: Brand call - "What would make this a no-brainer for you?"

---

## 6. Speed-to-Lead Protocol

When someone calls us inbound or fills out a form, every second counts. Studies show responding within 5 minutes makes you **21x more likely to close** compared to 30 minutes.

### Inbound Call Flow

```
Inbound call hits VAPI on +15137788336
    ↓
VAPI handles the call (AI Receptionist demo in real-time)
    ↓
Webhook fires:
    ├── Brand gets INSTANT push notification (phone + email + GHL)
    │   Include: caller name, number, what they asked about, call duration
    ├── GHL contact created/updated
    │   Tags: "inbound", "hot-lead", date
    ├── GHL task created: "URGENT - Call back [name] within 5 minutes"
    ├── Pipeline: Move to "Engaged" immediately
    └── Email fires to caller: "Thanks for calling ClawOps" + calendar booking link
    
    ↓
Brand calls back personally within 5 minutes
    ↓
If Brand doesn't call within 15 min → Second alert fires
    ↓
If Brand doesn't call within 30 min → Email sequence starts automatically
    ↓
If Brand doesn't call within 2h → SMS fires (when available)
```

### Why Brand Must Call (Not AI)

Inbound leads have the highest intent. They sought US out. This is not the time for AI. This is the time for:
- Human connection
- Founder story ("I built this because...")
- Live demo tailored to their questions
- Same-call close attempt

### Inbound Response Checklist for Brand

1. ✅ Call within 5 minutes
2. ✅ Reference what they asked about on the inbound call
3. ✅ Offer live demo right then ("Want me to show you in 2 minutes?")
4. ✅ If they're interested, send Stripe link WHILE ON THE CALL
5. ✅ If they need time, book a specific callback ("Tuesday at 2pm work?")
6. ✅ Never end without a next step locked in

### Immediate Action: 915-268-9089

This person called, asked about pricing, and was positive. This is the highest-priority action in this entire report.

**Brand should call 915-268-9089 TOMORROW MORNING between 9-10am their time (Mountain Time = 11am-12pm ET).** Script:

> "Hey, this is Brand from ClawOps. You called us about our AI receptionist service. I wanted to follow up personally - did you have a chance to look at the info we sent? ... Great, what kind of contracting work do you do? ... [Listen, then tailor the pitch]"

---

## 7. Metrics Dashboard

### Weekly KPIs (Track in GHL + Spreadsheet)

#### Activity Metrics

| Metric | Target | Current | How to Track |
|--------|--------|---------|-------------|
| Outbound calls made (VAPI) | 50/week | Unknown | VAPI dashboard |
| Connect rate (answered/dialed) | >25% | Unknown | VAPI logs |
| Conversations (30s+ calls) | 15/week | Unknown | VAPI logs |
| Emails sent (follow-up) | Match calls 1:1 | Unknown | Gmail sent folder |
| SMS sent | TBD (blocked) | 0 | Twilio dashboard |
| Inbound calls received | Track all | Unknown | VAPI logs |

#### Pipeline Metrics

| Metric | Target | Current | How to Track |
|--------|--------|---------|-------------|
| New leads added/week | 20+ | 0 | GHL pipeline |
| Leads in "Engaged" | 10+ | ~2 | GHL pipeline |
| Demos completed/week | 5+ | 0 | GHL tasks |
| Proposals sent/week | 3+ | 0 | GHL pipeline |
| Pipeline value | $15K+ | $0 | GHL pipeline |
| Deals closed/week | 1+ | 0 | Stripe |

#### Conversion Metrics

| Metric | Target | Current | How to Track |
|--------|--------|---------|-------------|
| Call → Engaged rate | >15% | Unknown | GHL pipeline |
| Engaged → Demo rate | >50% | Unknown | GHL pipeline |
| Demo → Proposal rate | >60% | Unknown | GHL pipeline |
| Proposal → Close rate | >30% | Unknown | Stripe |
| Overall call → close | >3% | 0% | Calculate |
| Average days to close | <14 | N/A | GHL pipeline |
| Revenue (MRR) | $550+ | $0 | Stripe |
| Revenue (setup fees) | $2,500+ | $0 | Stripe |

#### Quality Metrics

| Metric | Target | How to Track |
|--------|--------|-------------|
| Average call duration | >90s | VAPI logs |
| Objection frequency by type | Track weekly | Call review |
| Email open rate | >40% | GHL or Gmail tracking |
| Email reply rate | >10% | Gmail |
| Response time (inbound) | <5 min | GHL tasks |

### Weekly Review Agenda (Every Monday, 15 min)

1. How many calls did we make? How many connected?
2. How many moved to "Engaged"? What did they say?
3. How many proposals out? Any close?
4. What objections came up? Do we need to adjust the prompt?
5. Is the 915 lead closed? What happened with Aaron?
6. Pipeline value: are we on track for $10K MRR in 30 days?
7. What's the bottleneck this week?

---

## 8. Competitor Intelligence

### Pricing Comparison

| Competitor | Setup/Onboarding | Monthly | Per-Minute/Call | Target Market | AI or Human |
|-----------|-----------------|---------|----------------|--------------|-------------|
| **ClawOps (us)** | $2,500 (founding) / $3,000 | $550 (founding) / $750 | Included | Contractors | AI |
| **Smith.ai** | $0 | $292.50-$1,200+ | $9.74-$13/call (tiered) | SMBs, law firms | Human + AI |
| **Ruby Receptionists** | $0 | $235-$1,640+ | ~$3.50-$5.90/min (tiered) | SMBs, professional services | Human |
| **Bland AI** | $0-custom | Pay-as-you-go | $0.07-$0.09/min | Developers, enterprises | AI |
| **Air AI** | Custom | Custom | ~$0.11/min reported | Sales teams, enterprises | AI |
| **Synthflow** | $0 | $29-$450+ | Minutes-based tiers | SMBs, agencies | AI |

### Competitor Breakdown

#### Smith.ai
- **How they sell:** Content marketing, SEO, free consultations. No cold outreach - all inbound.
- **Strengths:** Established brand, human receptionists backed by AI, 14-day money-back guarantee.
- **Weakness:** Expensive per-call. A contractor getting 200+ calls/month pays $2,000+. We're flat-rate.
- **What we steal:** Their money-back guarantee model. Contractors are risk-averse. "Try it for 14 days, full refund if it doesn't catch more calls than your current setup."

#### Ruby Receptionists
- **How they sell:** Partnerships with trade associations, SEO, referrals. Strong in legal and home services.
- **Strengths:** Human touch, great reputation, integrations.
- **Weakness:** Per-minute pricing punishes high-volume contractors. A busy HVAC company in summer? $1,500+/month easy.
- **What we steal:** Their trade association partnership model. Get into HVAC and plumbing associations as a vendor/sponsor.

#### Bland AI
- **How they sell:** Developer-first. API docs, GitHub, technical content. Enterprise sales team for big deals.
- **Strengths:** Cheapest per-minute, developer-friendly, scalable.
- **Weakness:** Zero contractor-specific anything. No white-glove setup. A plumber isn't reading API docs.
- **What we steal:** Nothing directly. But their pricing proves AI calls are commoditizing. Our value is the contractor-specific setup, not the AI itself.

#### Air AI
- **How they sell:** Demo-driven. Big claims about "24/7 AI employees." Enterprise focus.
- **Strengths:** Good marketing, strong demo experience.
- **Weakness:** Pricing is opaque, onboarding is slow, reviews mention reliability issues.
- **What we steal:** Their "AI employee" positioning. Don't sell "AI receptionist" - sell "your 24/7 front desk person who never calls in sick."

#### Synthflow
- **How they sell:** Product-led growth. Free tier, self-serve, agency reseller program.
- **Strengths:** Low price point, agency-friendly, easy setup.
- **Weakness:** Generic. No vertical specialization. Support is thin.
- **What we steal:** Their agency model. Once we have 5 contractor clients, build a "ClawOps for Agencies" tier where marketing agencies can white-label us for their contractor clients.

### Our Competitive Positioning

**Why a contractor picks us over all of them:**

1. **Built for contractors.** Not lawyers, not dentists, not "SMBs." HVAC, plumbing, electrical, roofing. We speak their language.
2. **Flat-rate pricing.** No per-minute surprise bills. $550/mo founding. Done. Budget it and forget it.
3. **We set it up for you.** $2,500 gets you a fully configured AI receptionist. No API docs. No DIY. No "figure it out."
4. **Speed.** Live in days, not weeks. Competitors take 2-4 weeks for enterprise onboarding.
5. **Founding rate locks.** First 10 clients get $550/mo locked in forever. That's $200/mo less than regular. Over a year, that's $2,400 saved.

### Competitive Battle Cards (Quick Reference)

**When they say "Smith.ai is cheaper":**
> "Smith.ai starts cheaper but charges per call. How many calls do you get a month? At 100 calls, you're paying $975/mo with them. We're $550 flat, no matter if you get 100 or 1,000 calls."

**When they say "I'll just use Bland AI myself":**
> "You could. Do you want to write the AI prompts, set up the webhooks, configure call routing, and maintain it yourself? That's what we do for you. Our $2,500 setup is your time back."

**When they say "Ruby has real humans":**
> "Ruby's great if you want to pay $4/minute for someone reading a script. Our AI is trained specifically on [their trade] terminology, can book appointments, and costs a fraction. And it works at 2am when the emergency calls come in."

**When they say "I don't trust AI on the phone":**
> "Let me play you a sample call. [Play demo.] That's our AI handling a real plumbing inquiry. Most callers can't tell the difference. And unlike a human receptionist, it never has a bad day."

---

## Priority Actions - This Week

Ranked by revenue impact:

| # | Action | Owner | Deadline | Expected Impact |
|---|--------|-------|----------|----------------|
| 1 | **Call 915-268-9089 back** | Brand | Tomorrow AM | Potential first sale ($2,500 + $550 MRR) |
| 2 | Build GHL pipeline stages (12 stages above) | Brand | Tomorrow | Foundation for all automation |
| 3 | Build Workflow 2 (Engaged Lead Follow-Up) | Brand | Friday | Automated nurture for every warm lead |
| 4 | Build Workflow 4 (Speed-to-Lead) | Brand | Friday | Never miss an inbound again |
| 5 | Score all 172 contacts, identify Top 30 | Jordan/Rick | Thursday | Focus VAPI calls on highest-value targets |
| 6 | Create proposal email template + Stripe payment link | Brand | Thursday | Close mechanism ready |
| 7 | Run VAPI campaign on Top 30 | Jordan | Friday-Saturday | 7-10 conversations, 2-3 engaged leads |
| 8 | Build Workflow 1 (Post-Call Auto-Tagger) | Brand | Next Monday | Automate pipeline movement |
| 9 | Set up call recording review (weekly) | Jordan | Next Monday | Prompt optimization, objection tracking |
| 10 | Prep Aaron response (when he reaches out) | Brand | Ready now | Founding deal, ready to close on his terms |

### Revenue Target

- **This week:** 1 closed deal = $2,500 setup + $550 MRR
- **Next 2 weeks:** 3 more deals = $7,500 setup + $1,650 MRR
- **30-day target:** 5 clients = $12,500 setup + $2,750 MRR
- **On that trajectory:** $33K ARR within 30 days. Not $100K. But it's a start with proof of concept, and every closed deal is a case study and referral source.

---

*This report is a living document. Update weekly with actual numbers against targets. Every gap identified here has a fix. Execute in priority order. The 915 lead is the most important thing in the company right now.*

**Jordan (CRO) | ClawOps | March 13, 2026**
