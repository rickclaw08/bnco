# Operations & Integration Optimization Report
**Author:** Harper (COO)
**Date:** March 13, 2026
**Status:** ACTIONABLE
**Audience:** Brand (CEO/Solo Operator)

---

## EXECUTIVE SUMMARY

ClawOps is running a 7-tool stack to deliver one product. That is too many moving parts for a solo operator at $0 revenue. This report audits every tool, identifies what to cut, what to keep, and what to automate so Brand can focus on closing the first sale instead of babysitting infrastructure.

Bottom line: **we can eliminate 2 tools immediately, consolidate to one Twilio account, set up monitoring in under 1 hour, and reduce the daily ops burden to a 5-minute checklist.**

---

## 1. STACK AUDIT

### Current Tool Inventory (What We Actually Use)

| Tool | Role | Monthly Cost | Status | Verdict |
|------|------|-------------|--------|---------|
| **VAPI** | Voice AI (brain + orchestration) | Pay-per-min (~$0.11/min) | ACTIVE, ~$5-6 credit left | KEEP - Core product |
| **Vonage** | SIP trunk for outbound calls | Pay-per-min, $10.35 balance | ACTIVE, intermittent 403s | KEEP (with failover) |
| **Twilio (rickclaw08)** | Was voice/SMS, now unused | $19.99 balance, upgraded | BROKEN - Trust Hub rejected, voice disabled | CONSOLIDATE |
| **Twilio (Aurolly)** | Toll-free SMS (pending verification) | $13.35 balance, trial | TF verification in progress | KEEP - SMS path |
| **GHL** | CRM, pipeline, contacts | $97-297/mo (agency plan) | ACTIVE, Trust Center rejected for voice | KEEP - CRM only |
| **Fly.io** | Webhook server (post-call actions) | Free tier (2 shared CPUs) | ACTIVE, v3 deployed | KEEP |
| **Gmail SMTP** | Email follow-ups + notifications | $0 | ACTIVE | KEEP |
| **Stripe** | Payment processing | 2.9% + $0.30/txn | ACTIVE, link needs price fix | KEEP |

### Tools Referenced But NOT Actually Used

| Tool | Listed In | Reality |
|------|-----------|---------|
| HubSpot CRM | tool-stack.md | Not used. GHL is the CRM. |
| Trello/Notion | tool-stack.md | Not used. Memory files are the project board. |
| n8n | tool-stack.md | Not used. Fly.io webhook handles automation. |
| Sentry | tool-stack.md | Not set up. No error tracking exists. |
| UptimeRobot | tool-stack.md | Not set up. No monitoring exists. |
| Pinecone/Chroma | tool-stack.md | Not used for this product. |

**The tool-stack.md is aspirational, not actual.** The real stack is: VAPI + Vonage + Twilio (Aurolly) + GHL + Fly.io + Gmail + Stripe.

---

## 2. CONSOLIDATION RECOMMENDATIONS

### Immediate Cuts (Do Today)

**1. Kill the rickclaw08 Twilio account for active use**
- Trust Hub was rejected because the profile had "MGO Data" (not matching EIN) and contact@aurolly.com (wrong domain)
- Voice is disabled, can't buy new numbers, can't send SMS
- The $19.99 balance is stranded unless the profile is fixed
- **Recommendation:** Don't waste time fixing it. The Aurolly account already has the toll-free number with verification in progress. Use Aurolly as the single Twilio account going forward. See Section 5 for full strategy.

**2. Remove phantom tools from tool-stack.md**
- HubSpot, Trello, Notion, n8n, Sentry, UptimeRobot are listed but unused
- Either set them up (Sentry + UptimeRobot - see Section 3) or remove the listing
- A tool-stack doc that lies is worse than no doc at all

### Near-Term Simplification (This Week)

**3. Collapse Vonage to backup-only once Twilio Aurolly is upgraded**
- Currently Vonage handles outbound voice via BYO SIP trunk
- Vonage also attempted SMS (silently fails due to 10DLC)
- Once Aurolly Twilio is upgraded from trial and TF verification approved:
  - SMS: Twilio toll-free +18773317786 (primary)
  - Voice: Continue using Vonage BYO SIP through VAPI (it works, quality confirmed)
  - Vonage SMS: remove from webhook entirely (it never delivered a message)
- Vonage stays for voice SIP only, Twilio handles all SMS

**4. GHL: Accept it as CRM-only, stop fighting Trust Center**
- SHAKEN/STIR, CNAM, Voice Integrity: all rejected. Support ticket filed. But even if approved, we don't need GHL for voice anymore since VAPI handles it.
- GHL's value: contact management, pipeline stages, sub-account per client (for future scale)
- Don't burn cycles on Trust Center unless GHL support responds with a simple fix
- A2P Campaign is "In Progress" - if it auto-approves, GHL SMS becomes available as a bonus, not a dependency

### Resulting Minimal Stack

| Function | Tool | Backup |
|----------|------|--------|
| Voice AI | VAPI | None needed (VAPI is the product) |
| Outbound calling | Vonage BYO SIP via VAPI | VAPI native number (13/day limit) |
| SMS follow-up | Twilio (Aurolly) toll-free | Email (Gmail SMTP) |
| Email follow-up | Gmail SMTP | None needed |
| CRM | GHL | None (it's fine for now) |
| Webhook automation | Fly.io | None (free tier is sufficient) |
| Payments | Stripe | None needed |

**From 7 active + 6 phantom tools down to 6 active tools with clear roles. No overlap.**

---

## 3. MONITORING & ALERTING PLAN

Currently Brand has zero monitoring. When Vonage SIP threw 403 errors today, the only way to know was manually checking VAPI call logs. That is unacceptable for a product that sells reliability.

### Tier 1: Set Up TODAY (30 minutes, $0)

**A. UptimeRobot for Fly.io Webhook**
1. Go to uptimerobot.com, create free account
2. Add HTTP monitor: `https://clawops-vapi-webhook.fly.dev/health`
3. Check interval: 5 minutes
4. Alert via email to jacksonroy152@gmail.com
5. **This catches:** webhook server down, Fly.io outage, deployment failures
6. Time: 5 minutes

**B. VAPI Call Failure Email Alerts (Already Partially Built)**
- Webhook v3 already sends Brand an email after every call with transcript + recording URL
- **Enhancement needed:** Add a failure-specific notification when call status is `error`, `failed`, or `no-answer` with the specific error code
- In `server.js`, check `call.endedReason` - if it contains `error` or `provider-fault`, send a HIGH PRIORITY email with red subject line
- Time: 15 minutes code change + deploy

**C. Daily VAPI Credit Balance Check**
- Add to the morning checklist (Section 7)
- VAPI dashboard: dashboard.vapi.ai > Billing
- If credit drops below $2, top up immediately or calls stop
- Time: 1 minute per day

### Tier 2: Set Up This Week (1 hour, $0)

**D. Sentry for Webhook Error Tracking**
1. Go to sentry.io, create free account (5K events/month)
2. Install `@sentry/node` in the webhook project
3. Wrap route handlers with Sentry error capture
4. **This catches:** unhandled exceptions, timeout errors, API failures (Vonage, Twilio, GHL, Gmail)
5. Alerts via email when errors spike
6. Time: 30 minutes

**E. Fly.io Built-In Metrics**
- `fly logs` already captures all console output
- `fly status` shows machine health
- Set up a simple cron (OpenClaw cron) to run `fly logs --app clawops-vapi-webhook | tail -50` every 6 hours and flag any errors
- Time: 15 minutes

### Tier 3: Set Up When Revenue Exists

**F. Grafana Cloud Free Tier**
- 10K metrics, 50GB logs, 50GB traces free
- Overkill at $0 revenue. Save for when you have 3+ clients.

**G. PagerDuty/Opsgenie**
- On-call rotation makes no sense for a solo operator
- UptimeRobot email alerts are sufficient until there's a team

### What Each Monitor Catches

| Failure Mode | How We Detect It | Alert Method |
|-------------|-----------------|--------------|
| Webhook server down | UptimeRobot HTTP check | Email |
| VAPI call error (SIP 403, provider fault) | Webhook server.js error handler | Email to Brand |
| SMS delivery failure | Twilio status callback + webhook logging | Webhook log (Sentry) |
| VAPI credit exhausted | Daily manual check (morning checklist) | Self-check |
| Vonage balance low | Daily manual check (morning checklist) | Self-check |
| GHL API error | Sentry capture in webhook | Email |
| Fly.io deployment failure | Fly.io deploy output + health check | UptimeRobot |

---

## 4. CLIENT ONBOARDING PLAYBOOK (Condensed)

The existing `client-delivery-playbook.md` is 748 lines. That is a great reference doc but too long for a solo operator closing their first deal. Here is the compressed version: what actually needs to happen.

### THE 48-HOUR ONBOARDING (Solo Operator Edition)

**Precondition:** Stripe payment of $2,500 received.

#### Hour 0-1: Welcome + Intake
1. Send welcome email from rickclaw08@gmail.com (template exists in playbook)
2. Include intake form link (Google Form or simple email questionnaire):
   - Business name, trade, service area
   - Current phone number (the one they forward to)
   - Business hours
   - Emergency handling preferences (always forward, voicemail, etc.)
   - 3-5 common call types they get (estimate request, emergency, scheduling, etc.)
   - Any phrases/tone preferences ("professional", "friendly Southern", etc.)
3. Create `clients/[name]/` folder in workspace

#### Hour 1-8: Build Their AI Assistant
4. Clone the master VAPI assistant (Jordan/Elliot base)
5. Customize the system prompt:
   - Replace business name, trade, service area
   - Adjust greeting: "Hey, thanks for calling [Business Name], this is [AI Name], how can I help?"
   - Add their specific service types to the FAQ section
   - Set business hours for transfer vs. voicemail logic
6. Provision a phone number:
   - Option A: Buy a local number on VAPI ($1-2/month, fast)
   - Option B: If client has Twilio, import their number to VAPI
   - Option C: Use client's existing number with call forwarding to VAPI number
7. Link number to their customized assistant
8. Set up post-call webhook (clone webhook config, point to client-specific GHL sub-account)

#### Hour 8-24: Test + QA
9. Run 3 internal test calls:
   - Basic inquiry ("I need my AC fixed")
   - Emergency ("My pipe burst, I need someone now")
   - Edge case ("What are your prices?" / "Can I talk to a real person?")
10. Record test results, note any prompt fixes needed
11. Fix prompt issues, re-test
12. Send client a test call invite: "Call [number], test it out, tell us what you think"

#### Hour 24-48: Go Live
13. Client confirms test sounds good (or we iterate)
14. Set up call forwarding from their existing business number to the VAPI number
15. Verify first real call comes through correctly
16. Send go-live confirmation email with:
    - Their AI phone number
    - Link to GHL dashboard (if applicable)
    - Support contact (Brand's email/phone)
    - What to expect in the first week

**Total Brand time required:** ~2-3 hours hands-on, rest is waiting for client responses

### What This Requires Before First Sale
- [ ] Master VAPI assistant prompt is finalized (v10.2 is close)
- [ ] Webhook v3 is deployed and tested (done)
- [ ] Stripe payment link price is correct (STILL BROKEN - shows $550/mo, should be $550/mo if that's final)
- [ ] Welcome email template drafted (exists in playbook)
- [ ] Google Form or intake questionnaire created (not done)
- [ ] GHL sub-account creation process documented (not done - but can do via browser)

---

## 5. TWILIO ACCOUNT STRATEGY

### Current State

| Account | Email | SID | Balance | Numbers | Status |
|---------|-------|-----|---------|---------|--------|
| Primary | rickclaw08@gmail.com | AC1acbbbd... | $19.99 | +17027284638 | Upgraded, Trust Hub REJECTED, restricted |
| Secondary | contact@aurolly.com | AC563648c... | $13.35 | +18773317786 | Trial, TF verification in progress |

### Recommendation: Consolidate to Aurolly Account

**Reasoning:**
1. The rickclaw08 account has a rejected Trust Hub profile. Resubmitting means fixing the business name (was "MGO Data", needs to be the EIN-matching legal name), fixing the rep email (was contact@aurolly.com, wrong domain), then waiting 1-3 business days. The account is also restricted from buying new numbers.
2. The Aurolly account has a clean slate. Toll-free number already provisioned. TF verification already submitted. Once upgraded ($20 one-time), it's production-ready.
3. Running two accounts creates confusion (which SID? which auth token? which webhook?). The webhook already has Aurolly credentials deployed.

**Action Plan:**
1. **Upgrade Aurolly account** - $20 credit card charge, removes trial restrictions (5 minutes)
2. **Wait for TF verification** - Already submitted, takes 1-5 business days
3. **Once TF approved:** SMS is live immediately. No 10DLC required for toll-free.
4. **Deprecate rickclaw08 account** - Don't delete (keep the $19.99 balance in case we need it), but stop using it for anything. Remove its credentials from all systems.
5. **Update webhook Fly.io secrets** to only reference Aurolly credentials (already done in v3)

**Risk: Toll-free verification rejected?**
- Unlikely for a legitimate business, but if it happens:
- Fallback: Fix the rickclaw08 Trust Hub profile and resubmit
- Fallback 2: Register for A2P 10DLC on Aurolly account (takes longer, ~$14/mo)

**Cost comparison:**
- One account: ~$2/mo (toll-free number) + per-message costs (~$0.0079/segment)
- Two accounts: Same costs but doubled complexity
- No-brainer. One account.

---

## 6. GHL TRUST CENTER FIX STEPS

### Current Status
- **A2P SMS Brand:** Approved
- **A2P SMS Campaign:** In Progress
- **SHAKEN/STIR:** Rejected
- **CNAM:** Rejected
- **Voice Integrity:** Rejected
- **Business Profile SID:** BUe5a41e8c14285ed041aa85925bb0c1ae
- **Support ticket filed:** Yes (Freshworks + email to support@gohighlevel.com)
- **GHL phone:** +1 (513) 854-4812

### Why It's Rejected (Probable Causes)

GHL Trust Center registrations go through Twilio's backend (GHL uses Twilio for telephony). The rejections are likely because:

1. **Business name mismatch** - If the name submitted doesn't exactly match what's on the EIN/state registration, Twilio auto-rejects. "ClawOps" vs "ClawOps LLC" vs "MGO Data LLC" matters.
2. **Business type mismatch** - Sole proprietorship vs LLC vs corporation must match state records.
3. **EIN issues** - If the EIN belongs to "MGO Data LLC" but you submitted "ClawOps", it's a mismatch.
4. **Low employee count + low call volume** - You submitted 5 employees, 50 calls. Small operations with generic use cases sometimes get flagged.

### Fix Steps (In Order)

**Step 1: Wait for GHL Support Response**
- Two support channels are active (Freshworks ticket + email)
- GHL support can see the exact rejection reason from Twilio's backend
- Ask them specifically: "What field caused the rejection? Can you provide the TCR rejection code?"
- Expected response time: 1-3 business days

**Step 2: If GHL Support Gives a Specific Fix**
- Re-register with corrected information via GHL Trust Center UI
- Most common fixes in the GHL community:
  - Use the EXACT legal business name from your EIN letter (not a DBA)
  - Match address to what's on your state registration
  - Use a business email domain (not gmail) - this is a big one
  - Increase stated call volume (say 500+, not 50)
  - Change use case to something specific ("AI-powered receptionist for HVAC contractors") not generic ("customer support")

**Step 3: If GHL Support Is Useless**
- Call GHL phone support directly: +1(888)732-4197
- Ask for the Trust Center team specifically
- Have Location ID (Ez2ADxydpjvWsW3suYiq) and Business Profile SID ready

**Step 4: Nuclear Option - Re-register from scratch**
- Create a new GHL sub-account with fresh phone number
- Re-submit Trust Center with:
  - Legal business name matching EIN exactly
  - Business email (not @gmail.com) - e.g., contact@theclawops.com
  - Higher call volume estimate (500-1000/month)
  - Specific use case description
  - Matching address to state records

### Critical Context
**None of this blocks revenue.** VAPI + Vonage BYO SIP handles all voice. Twilio Aurolly handles SMS. GHL Trust Center is only needed if we want to make outbound calls or send SMS directly from GHL's built-in phone system. We don't need that. GHL is CRM-only.

**If GHL A2P Campaign approves**, that gives us a bonus SMS channel from GHL's number. Nice to have, not a dependency.

---

## 7. SIP FAILOVER PLAN

### Current Problem
Vonage BYO SIP trunk threw `403 Forbidden` errors today. When that happened, calls simply failed. No automatic fallback.

### How VAPI SIP Failover Works

VAPI does not have native multi-trunk failover built in. When you configure a BYO SIP credential in VAPI, it uses that single trunk. If the trunk returns 403, the call fails.

### Workaround: Webhook-Based Failover

**Architecture:**
```
Outbound Call Request
        |
        v
  Try Vonage BYO SIP (primary)
        |
   [Success?] --YES--> Call proceeds
        |
       NO (403/5xx/timeout)
        |
        v
  Webhook receives end-of-call error
        |
        v
  Auto-retry via VAPI native number
```

**Implementation:**
1. In the webhook `server.js`, detect calls with `endedReason` containing `provider-fault` or `sip-403`
2. If detected, immediately fire a new outbound call via VAPI API using the native number (+15139953474) instead of BYO SIP
3. Log the failover event and send Brand a notification email
4. This adds ~5-10 seconds of delay (the failed call + API call for retry) but the prospect just sees a second ring

**Code sketch for server.js:**
```javascript
// In the end-of-call-report handler:
if (call.endedReason && call.endedReason.includes('providerfault')) {
  // Failover: retry with VAPI native number
  const retryResponse = await fetch('https://api.vapi.ai/call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistantId: call.assistantId,
      customer: { number: call.customer.number },
      phoneNumberId: process.env.VAPI_NATIVE_PHONE_ID // d462440c
    })
  });
  console.log(`[FAILOVER] Retried call to ${call.customer.number} via VAPI native`);
}
```

**Limitations:**
- VAPI native has a 13/day limit - failover eats into that
- If both Vonage AND VAPI native are down, there's no third option (unless we add Telnyx or another SIP provider)
- There's no mid-call failover - if SIP drops mid-conversation, the call is lost

### Recommended Priority

| # | Action | When |
|---|--------|------|
| 1 | Add failover retry logic to webhook | This week (1 hour) |
| 2 | Monitor Vonage SIP health via call error rates | This week (part of monitoring plan) |
| 3 | Add Telnyx as secondary SIP trunk | When revenue exists ($2/mo for trunk) |
| 4 | Request VAPI native limit increase | When revenue exists (contact VAPI support) |

---

## 8. DAILY OPERATIONS CHECKLIST

Brand (or the AI via heartbeat) should run through this every morning. Target: 5 minutes.

### MORNING CHECK (9:00 AM ET)

**Balances (1 minute)**
- [ ] VAPI credit > $2? (dashboard.vapi.ai > Billing)
- [ ] Vonage balance > $5? (dashboard.vonage.com)
- [ ] If either is low, top up immediately

**System Health (2 minutes)**
- [ ] Webhook alive? Hit `https://clawops-vapi-webhook.fly.dev/health` - should return `{"status":"ok"}`
- [ ] Any UptimeRobot alerts overnight? (check email)
- [ ] Any Sentry alerts? (check email, once set up)

**Calls & Leads (2 minutes)**
- [ ] Check VAPI call logs (dashboard.vapi.ai > Calls): any calls overnight? Any errors?
- [ ] Check email (jacksonroy152@gmail.com) for Brand notification emails from webhook
- [ ] Any new leads in GHL pipeline? Move appropriately.
- [ ] Any demo requests / inbound interest?

### MIDDAY CHECK (1:00 PM ET) - Optional

- [ ] If outbound batch was running: check results in VAPI call logs
- [ ] Any callback requests from morning calls?
- [ ] SMS delivery status (once Twilio TF is live): check Twilio console for message status

### EVENING WRAP (6:00 PM ET) - 3 minutes

- [ ] Count today's calls: how many fired, how many connected, how many interested?
- [ ] Update memory file with key events
- [ ] Any follow-ups needed tomorrow?
- [ ] Any pricing/prompt changes Brand wants for tomorrow's calls?

### WEEKLY (Sunday Evening)

- [ ] Total calls this week
- [ ] Total leads generated
- [ ] Pipeline movement (any deals progressing?)
- [ ] VAPI spend this week (stay under budget)
- [ ] Any recurring errors to fix?
- [ ] Prompt version - any improvements needed?

---

## 9. OPEN BLOCKERS & ESCALATION QUEUE

These need Brand's direct action. The team cannot resolve them autonomously.

| # | Blocker | Who | Action | Impact |
|---|---------|-----|--------|--------|
| 1 | **Stripe payment link wrong price** | Brand | Fix in Stripe dashboard - verify $2,500 + $550/mo is correct (or $250/mo?) | Cannot send payment link to prospects |
| 2 | **Twilio Aurolly upgrade** | Brand | Go to console.twilio.com (Aurolly account), upgrade from trial ($20) | SMS blocked until upgraded + TF approved |
| 3 | **Highground DNS** | Brand | Update GoDaddy A records to GitHub Pages IPs (185.199.108-111.153) | Website unreachable on domain |
| 4 | **Pricing clarity** | Brand | Is founding rate $2,500 + $250/mo or $2,500 + $550/mo? Prompt v10.2 says $550, webhook v3 says $550, but Jordan's sprint plan says $250. Need ONE answer. | Everything downstream is wrong if price is wrong |
| 5 | **GHL Trust Center** | GHL Support | Waiting for response on rejection reasons | Low priority - not blocking revenue |

---

## 10. PRIORITY MATRIX (Next 48 Hours)

| Priority | Task | Owner | Time | Revenue Impact |
|----------|------|-------|------|----------------|
| **P0** | Fix Stripe payment link pricing | Brand | 10 min | BLOCKS ALL SALES |
| **P0** | Upgrade Aurolly Twilio account | Brand | 5 min + $20 | Unblocks SMS |
| **P0** | Confirm final pricing ($250 or $550/mo) | Brand | 2 min | Everything depends on this |
| **P1** | Set up UptimeRobot for webhook | Rick/AI | 5 min | Prevents silent failures |
| **P1** | Add SIP failover retry to webhook | Ethan/AI | 1 hour | Prevents lost calls |
| **P1** | Add call failure email alerts to webhook | Ethan/AI | 15 min | Early warning system |
| **P2** | Set up Sentry for webhook | Ethan/AI | 30 min | Better debugging |
| **P2** | Create client intake Google Form | Harper/AI | 20 min | Ready for first client |
| **P2** | Fix Highground DNS | Brand | 10 min | Website works |
| **P3** | Update tool-stack.md to match reality | Any | 10 min | Housekeeping |
| **P3** | GHL Trust Center follow-up | GHL Support | Waiting | Nice to have |

---

## LEVEL UP NOTE

Harper (COO) gained XP in: stack consolidation, SIP failover architecture, monitoring design for solo operators, Twilio account strategy, operational checklist design. Updated `claw-agency/operations/ops-integration-optimization-report-2026-03-13.md` with full operational optimization report.
