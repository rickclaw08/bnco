# ClawOps Technical Stack Optimization Report

**Author:** Ethan (CTO)
**Date:** 2026-03-13
**Version:** 1.0
**Status:** REVIEW

---

## Executive Summary

Our stack is functional but brittle. We're running a voice AI outbound engine on ~$29 in combined platform credits, a SIP trunk throwing 403s, and a webhook with no retry logic on free-tier infrastructure. The good news: the architecture is sound. VAPI + BYO SIP + webhook + GHL pipeline is the right topology. We just need to harden every link in the chain and unlock the features we're paying for but not using.

This report covers seven areas. The TL;DR: enable VAPI voicemail detection and analytics today (zero cost, massive signal gain), kill the rickclaw08 Twilio account, get SMS live through Aurolly's toll-free number this week, and add retry logic to the webhook before we scale past 10 calls/day.

---

## 1. VAPI Optimization

### Current State
- Assistant `a036984d`, GPT-4.1, temp 0.5, voice Elliot
- Using: outbound calling, custom prompts, BYO SIP, native numbers
- NOT using: voicemail detection, analytics API, knowledge base, custom tools/functions, squad mode, recording storage

### Recommendations

#### 1.1 Voicemail Detection — ENABLE NOW (Priority: Critical)
**Why:** Without voicemail detection, every answering machine eats ~$0.11/min of VAPI credit while the AI talks to a recording. At scale, this is a money incinerator.

**Action:**
- Enable `voicemailDetection` in the assistant config with `provider: "twilio"` or VAPI's built-in AMD
- Set `voicemailDetectionTimeoutSeconds: 30`
- Configure the `voicemailMessage` field with a short callback prompt (15 seconds max)
- On machine detection → leave message → hang up → log as "voicemail" in GHL

**Impact:** Saves 30-60 seconds per voicemail hit. At 30% voicemail rate on 50 calls/day, that's ~$8-16/day saved.

#### 1.2 Analytics API — ENABLE NOW (Priority: High)
**Why:** We're flying blind. No visibility into call duration distributions, success rates, cost breakdown, or conversation quality metrics.

**Action:**
- Start pulling `/call` endpoint data after each call via the webhook
- Track: duration, cost, endedReason, transcript length, sentiment (derived)
- Store in a lightweight analytics table (even a JSON file on Fly.io to start)
- Build a daily digest that hits Brand's Telegram

**Impact:** Data-driven optimization. Know which prompts convert, which times of day work, which leads pick up.

#### 1.3 Knowledge Base — ENABLE (Priority: Medium)
**Why:** Right now the assistant's knowledge is baked into the system prompt. That works for simple pitches but doesn't scale.

**Action:**
- Upload ClawOps service descriptions, pricing, FAQ, and objection-handling docs to VAPI's knowledge base
- Reference via `knowledgeBaseId` in assistant config
- Keeps the system prompt lean while giving the AI deeper retrieval capability

**Impact:** Better objection handling, more accurate service descriptions, ability to update knowledge without redeploying prompts.

#### 1.4 Custom Tools/Functions During Calls — ENABLE (Priority: Medium-High)
**Why:** This is where the real magic happens. Mid-call actions like checking calendar availability, confirming pricing, or scheduling a callback.

**Action (phased):**
- Phase 1: Add a `checkAvailability` tool that hits a calendar API mid-call
- Phase 2: Add a `scheduleCallback` tool for prospects who say "call me later"
- Phase 3: Add a `transferToHuman` tool for hot leads who want to talk to Brand now

**Impact:** Turns the AI from a script-reader into an actual sales agent that can take action.

#### 1.5 Squad Mode — DO NOT ENABLE (Priority: None)
**Why:** Squad mode is for multi-agent handoffs during a single call. We have one assistant doing one job. Introducing squad mode adds latency (agent switching), complexity (state management between agents), and cost (multiple model invocations per call). 

**Revisit when:** We have distinct call flows that need specialist handling (e.g., qualification agent → technical deep-dive agent → closing agent). Not before 100+ calls/day.

#### 1.6 Recording Management — ENABLE (Priority: Medium)
**Why:** Recordings are gold for QA, training, and compliance. VAPI stores them temporarily but we're not persisting or organizing them.

**Action:**
- Enable `recordingEnabled: true` in assistant config (if not already)
- In the webhook post-call handler, download the recording URL and store in a GCS bucket or S3 (GCP already set up, use the service account)
- Tag recordings with: call ID, phone number, outcome, duration
- Set 90-day retention policy to manage storage costs

**Impact:** QA loop. Listen to calls, improve prompts, train the model.

---

## 2. Twilio Strategy

### Current State
- **Aurolly account (AC563648...):** Trial, $13.35 balance. Toll-free +18773317786, TF verification in progress. This is our SMS path.
- **rickclaw08 account:** Trust Hub rejected, $19.99 balance, dead.

### Recommendations

#### 2.1 Consolidate to Aurolly — NOW (Priority: Critical)
**Action:**
- Abandon the rickclaw08 account entirely. Trust Hub rejection is a death sentence for that account's messaging capability. Don't waste time appealing.
- The $19.99 balance is sunk cost. If Twilio support can transfer the credit to Aurolly, great. If not, move on.
- All development, all API calls, all configuration goes through Aurolly ([REDACTED-AUROLLY-SID]) from this point forward.

#### 2.2 Fastest Path to SMS — THIS WEEK (Priority: Critical)
**Current blocker:** Toll-free verification in progress for +18773317786.

**Action:**
- Monitor TF verification status daily. Typical approval: 3-7 business days.
- While waiting: SMS via unverified toll-free WILL work for low volume (<50/day) but risks filtering. Test with known numbers.
- In the webhook, the SMS path is already stubbed (`v3-twilio-tf+email+ghl`). Wire it up:
  ```
  POST /2010-04-01/Accounts/{AC563648...}/Messages.json
  From: +18773317786
  To: {prospect_phone}
  Body: {post_call_follow_up}
  ```
- Send SMS as a post-call follow-up within 60 seconds of call end. Content: "Hey {name}, thanks for chatting with us. Here's the link we mentioned: {stripe_link}"
- Implement delivery status webhooks (`StatusCallback`) to track sent/delivered/failed/undelivered.

#### 2.3 Features We're Missing
- **Twilio Lookup API:** Before every outbound call, run a $0.005 lookup to verify the number is valid, get carrier type (mobile vs landline), and check if it's a real number. Saves VAPI credit on dead numbers.
- **Messaging Insights:** Track delivery rates, opt-out rates, carrier filtering events.
- **Opt-out handling:** Twilio Advanced Opt-Out handles STOP/START automatically on toll-free. Make sure it's enabled.
- **Conversation API:** Not needed now, but when we do two-way SMS, this manages state better than raw Messages API.

#### 2.4 Upgrade from Trial
**When:** Before we hit 50 calls/day. Trial has limitations (verified numbers only for SMS, Twilio branding on calls).
**Cost:** Pay-as-you-go. SMS: $0.0079/segment outbound. Toll-free: $2/mo + $0.0079/segment. Minimal.

---

## 3. GHL Integration

### Current State
- CRM only. Location Ez2ADxydpjvWsW3suYiq. 172 contacts.
- Pipeline: "Voice AI Leads"
- Trust Center: all rejected (SHAKEN/STIR, CNAM, Voice Integrity)
- A2P Campaign: in progress
- NOT used for calling or SMS (correct decision - GHL's telephony is inferior to VAPI + BYO SIP)

### Recommendations

#### 3.1 Pipeline Automation — BUILD NOW (Priority: High)

**Stage-based triggers in "Voice AI Leads" pipeline:**

| Stage | Trigger | Action |
|-------|---------|--------|
| New Lead | Contact created via webhook | Auto-tag with source, assign to pipeline |
| Call Scheduled | Moved to stage | VAPI outbound call triggered via API |
| Called - No Answer | Post-call webhook (no pickup) | Schedule retry in 4h, then 24h, then 48h |
| Called - Voicemail | Post-call webhook (AMD detected) | Schedule callback in 2h, different time-of-day |
| Called - Interested | Post-call webhook (positive sentiment) | Create task for Brand: "Hot lead - follow up", send SMS + email |
| Called - Not Interested | Post-call webhook (negative) | Tag as "not interested", remove from call queue, add to nurture |
| Booked | Calendar link clicked | Send confirmation email, create prep task for Brand |
| Closed Won | Stripe payment received | Send onboarding email sequence, move to client pipeline |

#### 3.2 GHL Workflows WITH VAPI (Not Replacing It)

**The architecture:** GHL is the brain (CRM, pipeline, triggers). VAPI is the mouth (calls). The webhook is the nervous system (connecting them).

**Workflow 1: Speed-to-Lead**
- Trigger: New contact created in GHL (via form, import, or API)
- Wait: 2 minutes (let the lead settle)
- HTTP request to VAPI API → create outbound call to the contact
- Wait for webhook callback with call result
- Update GHL contact with call outcome, transcript summary, next action

**Workflow 2: No-Show Nurture**
- Trigger: Appointment status = "no show"
- Immediately: Send SMS ("Hey {name}, we missed you. Want to reschedule? {calendar_link}")
- Wait 1h: Send email with value prop reinforcement
- Wait 24h: VAPI outbound call (softer re-engagement script)
- Wait 72h: If still no response, move to long-term nurture

**Workflow 3: Post-Call Follow-Up Sequence**
- Trigger: Webhook updates contact with "called - interested"
- Immediately: SMS with Stripe payment link
- Wait 30min: Email with case study / social proof
- Wait 24h: If no payment, second email with urgency
- Wait 48h: VAPI follow-up call with closing script
- Wait 7d: If still no conversion, move to monthly nurture drip

#### 3.3 Task Creation for Brand
- Every "hot lead" creates a GHL task assigned to Brand
- Task includes: contact name, phone, call transcript summary, recommended next step
- Due date: same day for hot leads, next day for warm leads

#### 3.4 GHL Trust Center
- SHAKEN/STIR, CNAM, Voice Integrity all rejected - this confirms our decision to NOT use GHL for calling
- A2P Campaign in progress - this is for GHL's native SMS which we're also not using
- Keep GHL as CRM only. Don't fight their telephony restrictions.

---

## 4. Webhook Improvements

### Current State
- Fly.io, free tier, 2 machines
- server.js handling: email follow-up, Brand notification, GHL contact creation, SMS (pending)
- No retry logic, no queue, no error handling beyond basic try/catch

### What's Missing (and What to Build)

#### 4.1 Retry Logic — BUILD NOW (Priority: Critical)
**Problem:** If GHL API is slow, or Gmail SMTP hiccups, or Twilio returns a 429, the entire post-call flow fails silently.

**Solution:**
```
Retry strategy:
- Attempt 1: Immediate
- Attempt 2: 2 second delay
- Attempt 3: 10 second delay
- Attempt 4: 60 second delay
- After 4 failures: Log to error queue, notify Brand via Telegram
```

Each external call (GHL, Twilio, Gmail) gets its own retry wrapper. One failure shouldn't block the others.

#### 4.2 Queue Management — BUILD SOON (Priority: High)
**Problem:** If 10 calls end simultaneously, the webhook gets 10 concurrent POST requests. Free-tier Fly.io with 256MB RAM will choke.

**Solution:**
- Implement an in-memory queue (Bull or even a simple array with setTimeout processing)
- Process post-call actions sequentially with 500ms spacing
- If queue depth > 20, start dropping low-priority actions (analytics) and preserving high-priority (GHL update, SMS)
- Long-term: move to a proper queue (Redis on Fly.io, or Upstash Redis free tier)

#### 4.3 Error Handling — BUILD NOW (Priority: Critical)
**Current:** Basic try/catch. Errors disappear into the void.

**Build:**
- Structured error logging with: timestamp, call ID, action that failed, error message, attempt number
- Error categories: RETRYABLE (network timeout, 429, 503) vs FATAL (auth failure, invalid payload, 400)
- On FATAL: immediate Telegram notification to Brand with call ID and error
- Daily error digest: count of failures by type, sent to Telegram at 9am

#### 4.4 Rate Limiting — BUILD (Priority: Medium)
- GHL API: 100 requests/min per location. We're nowhere near this now, but at 100 calls/day with multiple API calls per post-call flow, we could hit it.
- Twilio: 1 message/second on trial. Queue SMS with 1.5s spacing.
- Gmail SMTP: 500 emails/day limit. Track daily count, alert at 400.

#### 4.5 Analytics — BUILD (Priority: Medium)
**Add to the post-call flow:**
- Log every call to a JSON-lines file: `{timestamp, callId, duration, cost, outcome, smsStatus, emailStatus, ghlStatus}`
- Endpoint: `GET /stats` returns today's metrics (call count, total cost, conversion rate, average duration)
- Weekly roll-up to a summary file

#### 4.6 Missing from Post-Call Flow
- **Transcript storage:** VAPI provides transcripts. We're not saving them. Store in GHL contact notes AND locally.
- **Sentiment analysis:** Quick keyword scan of transcript for buying signals ("interested", "how much", "when can we start") vs rejection signals ("not interested", "remove me", "stop calling"). Tag the contact accordingly.
- **Do-Not-Call list:** If a prospect says "don't call me again", automatically add to a DNC list and exclude from future campaigns. Legal requirement.
- **Call outcome classification:** Beyond binary success/fail. Categories: no_answer, voicemail, interested, not_interested, callback_requested, wrong_number, dnc_requested.

---

## 5. Cost Analysis

### Current Burn Rate (as of today)

| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| VAPI | ~$5-6 remaining (prepaid credits) | $0.11/min outbound |
| Vonage SIP | ~$10.35 remaining (prepaid) | $0.01/min US outbound |
| Twilio (Aurolly) | $0 (trial, $13.35 credit) | SMS not yet active |
| GHL | Included in existing plan | CRM only |
| Fly.io | $0 | Free tier |
| Gmail SMTP | $0 | App password |
| Stripe | 2.9% + $0.30 per transaction | On revenue only |
| **Total fixed monthly** | **~$0** | Everything is credit/free-tier |

### Cost Per Call

**Components of a single outbound call:**

| Item | Cost | Assumption |
|------|------|------------|
| VAPI (AI + voice) | $0.33 | 3-min average call |
| Vonage SIP (telephony) | $0.03 | 3-min average |
| Twilio Lookup | $0.005 | Pre-call validation |
| Twilio SMS (follow-up) | $0.0079 | 1 segment |
| Gmail (follow-up email) | $0.00 | Free |
| GHL API calls | $0.00 | Included |
| **Total per call** | **~$0.37** | Assuming 3-min avg duration |

### Cost Per Lead

Assuming a 15% "interested" rate from outbound calls:
- **Cost per interested lead:** ~$2.47 (6.67 calls to get one interested lead)
- **Cost per booked meeting:** ~$7.40 (assuming 1 in 3 interested leads book)
- **Cost per close:** ~$37.00 (assuming 1 in 5 meetings close)

At $2,500 + $550/mo deal value: **CAC of $37 on a $2,500 initial + $6,600/yr recurring deal = insane ROI.**

### Projected Costs at Scale

| Metric | 10 calls/day | 50 calls/day | 100 calls/day |
|--------|-------------|-------------|--------------|
| Daily call cost | $3.70 | $18.50 | $37.00 |
| Monthly call cost | $111 | $555 | $1,110 |
| VAPI credit burn/day | $3.30 | $16.50 | $33.00 |
| VAPI monthly | $99 | $495 | $990 |
| Vonage monthly | $9 | $45 | $90 |
| Twilio SMS monthly | $2.37 | $11.85 | $23.70 |
| Twilio Lookup monthly | $1.50 | $7.50 | $15.00 |
| **Total monthly** | **~$112** | **~$559** | **~$1,119** |
| Expected interested leads/mo | 45 | 225 | 450 |
| Expected closes/mo (at 5%) | 15 | 75 | 150 |
| **Expected monthly revenue** | **$37,500 initial** | **$187,500 initial** | **$375,000 initial** |
| **Plus recurring** | **$8,250/mo** | **$41,250/mo** | **$82,500/mo** |

**The math is absurd.** Even at conservative conversion rates, the cost-to-revenue ratio is 100:1+. The bottleneck is not cost - it's lead quality, call volume capacity, and Brand's ability to close the meetings that get booked.

### Credit Runway
- VAPI: ~$5.50 remaining ÷ $0.11/min = ~50 minutes of calls = ~17 calls at 3-min avg
- Vonage: $10.35 ÷ $0.01/min = 1,035 minutes = plenty
- Twilio: $13.35 in trial credit = ~1,689 SMS messages

**VAPI is the bottleneck.** We need to top up VAPI credit before any serious calling campaign. Recommend $50 minimum to cover a week of 50 calls/day.

---

## 6. Reliability & Failover

### Current Single Points of Failure

| Component | What Happens When It Fails | Current Mitigation | Impact |
|-----------|---------------------------|-------------------|--------|
| VAPI | No calls go out | None | Total outage |
| Vonage SIP | 403 errors, calls fail to connect | None (we're seeing this TODAY) | Call failure |
| Twilio | SMS doesn't send | None | Follow-up gap |
| Fly.io webhook | Post-call actions don't fire | 2 machines (basic HA) | Silent data loss |
| Gmail SMTP | Emails don't send | None | Follow-up gap |
| GHL API | Contact not created/updated | None | CRM gap |

### SIP Failover Plan — BUILD NOW (Priority: Critical)

**The Vonage 403 problem is happening right now.** We need a failover path.

**Option A: VAPI Native Numbers (Recommended)**
- VAPI offers its own phone numbers. Cost: ~$1-2/mo per number + per-minute usage
- Configure as primary SIP, keep Vonage as secondary
- In VAPI assistant config, set `fallbackDestination` to route through VAPI native if BYO SIP fails
- Advantage: eliminates Vonage as a dependency entirely

**Option B: Twilio SIP Trunk**
- Create a Twilio Elastic SIP Trunk on the Aurolly account
- Point VAPI's BYO SIP to Twilio's SIP domain as fallback
- Cost: $0.013/min (slightly more than Vonage but rock-solid reliability)
- Advantage: consolidates more infrastructure under Twilio

**Option C: Dual SIP Configuration**
- Configure VAPI with Vonage as primary, Twilio SIP as secondary
- On SIP failure (403, 408, 503), auto-failover to secondary trunk
- Requires VAPI's failover SIP configuration (check if supported via `sipTrunkId` array)

**Recommendation:** Option A for simplicity. Option C for robustness. Start with A, build toward C.

### Webhook Redundancy

**Current:** 2 Fly.io machines. If one goes down, the other handles requests. This is decent.

**Improvements:**
- Add health check endpoint (`GET /health`) that verifies connectivity to all downstream services (GHL, Twilio, Gmail)
- Fly.io auto-restart on health check failure
- If both machines die: VAPI calls still work, but post-call actions are lost. Implement a dead letter queue - VAPI retries webhooks 3 times. On our end, log received webhook payloads to persistent storage FIRST, then process. If processing fails, the payload survives for retry.

### Component Failure Matrix

| If This Fails... | Calls Still Work? | SMS Still Works? | Email Still Works? | CRM Updated? | Action |
|-------------------|:-:|:-:|:-:|:-:|---------|
| VAPI | ❌ | N/A | N/A | N/A | No automated mitigation. Manual calling only. |
| Vonage SIP | ❌ (currently) | ✅ | ✅ | ✅ | Failover to VAPI native or Twilio SIP |
| Twilio | ✅ | ❌ | ✅ | ✅ | SMS queued for retry when Twilio recovers |
| Fly.io webhook | ✅ | ❌ | ❌ | ❌ | Calls happen but no follow-up. Dead letter queue needed. |
| Gmail SMTP | ✅ | ✅ | ❌ | ✅ | Queue emails, retry. Consider SendGrid as backup. |
| GHL API | ✅ | ✅ | ✅ | ❌ | Queue CRM updates, retry. Manual update if persistent. |
| Stripe | ✅ | ✅ | ✅ | ✅ | Payment links don't work. Send alternative payment method. |

---

## 7. Quick Wins vs Strategic

### Immediate (This Week) — Do These First

| # | Action | Effort | Impact | Owner |
|---|--------|--------|--------|-------|
| 1 | Enable VAPI voicemail detection | 30 min | Saves $8-16/day at scale | Ethan |
| 2 | Enable VAPI analytics API pull in webhook | 2h | Visibility into all call metrics | Ethan |
| 3 | Add retry logic to webhook (3 attempts per external call) | 3h | Prevents silent failures | Ethan |
| 4 | Wire up Twilio SMS in webhook | 2h | Post-call SMS follow-up live | Ethan |
| 5 | Add structured error logging + Telegram alerts | 2h | Know when things break | Ethan |
| 6 | Top up VAPI credit ($50 minimum) | 5 min | Runway for real calling volume | Brand |
| 7 | Implement DNC list in webhook | 1h | Legal compliance | Ethan |

**Total effort: ~1.5 days. Total impact: Transforms us from "prototype" to "production-ready."**

### Short-Term (Next 2 Weeks)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 8 | SIP failover (VAPI native numbers as backup) | 2h | Eliminates Vonage 403 problem |
| 9 | GHL pipeline automation (stage-based triggers) | 4h | Automated lead progression |
| 10 | Twilio Lookup API pre-call validation | 2h | Stop wasting VAPI credit on dead numbers |
| 11 | VAPI Knowledge Base setup | 3h | Better objection handling |
| 12 | Recording storage to GCS | 2h | QA and training loop |
| 13 | Webhook queue management | 3h | Handle concurrent call volume |
| 14 | Post-call transcript storage in GHL | 1h | Full context in CRM |

### Medium-Term (Month 2)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 15 | Custom tools during VAPI calls (calendar check) | 8h | AI can schedule meetings mid-call |
| 16 | GHL workflow: speed-to-lead automation | 4h | New leads called within 2 minutes |
| 17 | GHL workflow: no-show nurture sequence | 3h | Recover missed appointments |
| 18 | Analytics dashboard (daily metrics to Telegram) | 4h | Data-driven optimization |
| 19 | Upgrade Twilio from trial | 30 min | Remove SMS limitations |
| 20 | SendGrid as Gmail SMTP backup | 2h | Email reliability |

### Strategic (Month 3+)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 21 | Custom VAPI tool: live transfer to Brand | 8h | Hot leads talk to Brand immediately |
| 22 | Multi-campaign support (different scripts per vertical) | 12h | Scale beyond one pitch |
| 23 | Redis queue on Fly.io | 4h | Production-grade webhook reliability |
| 24 | A/B testing framework for VAPI prompts | 8h | Systematic conversion optimization |
| 25 | Webhook migration from Fly.io to dedicated infra | 8h | If scale demands it |

---

## Summary

**The stack is architecturally correct.** VAPI for voice AI, BYO SIP for cost, webhook for orchestration, GHL for CRM, Twilio for SMS, Stripe for payments. Every component is in the right place.

**The stack is operationally immature.** No retries, no failover, no analytics, no voicemail detection, no SMS yet. We're one Vonage 403 away from zero calls and one Fly.io hiccup away from zero follow-ups.

**The fix is 1.5 days of focused engineering.** Items 1-7 from the Quick Wins list transform this from a demo into a revenue engine. Everything after that is optimization on a solid foundation.

**The economics are proven.** At $0.37/call and $2,500+ deal value, we can afford to be aggressive with volume. The constraint is not cost - it's lead list quality and call volume throughput.

**Biggest risk right now:** VAPI credit running out mid-campaign. Top up to $50 immediately. Everything else is engineering work that's scoped and ready to build.

---

*Report generated 2026-03-13 21:54 EDT*
*Next review: 2026-03-20*
*Ethan (CTO) gained XP in: infrastructure reliability planning, cost modeling, SIP failover architecture. Updated claw-agency/tech/stack-optimization-report-2026-03-13.md.*
