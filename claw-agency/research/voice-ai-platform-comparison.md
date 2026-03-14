# Voice AI Platform Comparison: Bypassing GHL Consent Gatekeeping

**Date:** March 12, 2026
**Purpose:** Find the fastest path to outbound Voice AI calling for 172 GHL contacts

---

## The Problem

GHL's built-in Voice AI has two blockers:
1. **Trust Center rejections** (CNAM, SHAKEN/STIR, Voice Integrity all rejected) - calls show "Scam Likely"
2. **Consent gatekeeping** - requires calendar widget submission before outbound calls

We have 171 contacts consented via calendar widget, but Trust Center rejections block at the carrier level. Even with consent, calls aren't connecting.

---

## Platform Comparison

### 1. VAPI (vapi.ai) - RECOMMENDED

**What it is:** Developer-first Voice AI platform. Has a **native GHL workflow integration** ("Create a Call" action).

**Pricing (Pay-as-you-go, no monthly fee):**
- Free $10 credit to start
- Per-minute pricing, components stack:
  - VAPI platform fee (not clearly listed on public pricing page)
  - LLM cost varies by model
  - Telephony cost varies by provider
- Estimated total: $0.05-0.15/min depending on LLM + voice choices
- Free VAPI phone number available (US only, no international)
- Can import Twilio numbers

**Key Features:**
- Outbound calling via simple API: POST to `/call` with assistantId, phoneNumberId, customer number
- **Batch calling** - pass array of customers in one API call
- **Scheduled calls** - set `earliestAt` / `latestAt` for future calls
- Dynamic variables ({{name}}, {{customer.number}}, etc.) for personalization
- Function calling for real-time actions (booking, CRM updates)
- 10 concurrent calls default, scalable
- LiquidJS template support for advanced date/time formatting

**GHL Integration:**
- Native "VAPI" action in GHL workflows
- "Create a Call" workflow action
- Uses VAPI's own phone numbers (not GHL/LC numbers)
- No mention of GHL's consent requirement for VAPI calls
- Triggers from any GHL workflow event

**Outbound Calling Requirements:**
- VAPI account + configured assistant
- Phone number (free VAPI number OR imported Twilio/Vonage/etc.)
- Customer phone number
- That's it. No separate consent gateway.

**Trust/Caller ID (Important):**
- VAPI docs explicitly cover STIR/SHAKEN, CNAM, caller reputation
- They recommend Twilio Trust Hub verification for best answer rates
- Also recommend First Orion + Hiya registration for branded calling
- IPQualityScore + Nomorobo for spam monitoring
- Bottom line: same carrier-level trust issues apply, BUT VAPI doesn't add its own consent layer on top

**Verdict:** VAPI removes GHL's consent gatekeeping, gives full API control over outbound. Still need carrier trust (STIR/SHAKEN) for best answer rates, but calls will at least GO OUT. Starting with a fresh VAPI number might have cleaner reputation than our flagged GHL numbers.

---

### 2. Retell AI (retellai.com) - STRONG ALTERNATIVE

**What it is:** Enterprise-focused Voice AI platform, claims lowest latency (~600ms).

**Pricing (Pay-as-you-go, $0 to start):**
- $10 free credits
- Voice AI: $0.07-0.31/min total depending on config
- Component breakdown:
  - Retell Voice Infra: $0.055/min
  - Voice (platform voices): $0.015/min (ElevenLabs: $0.04/min)
  - LLM: GPT 5.1 = $0.04/min, GPT 4.1 mini = $0.016/min, Claude 4.5 Sonnet = $0.08/min
  - Telephony (Retell Twilio): $0.015/min, SIP = free
- Phone numbers: $2/mo each
- 20 free concurrent calls
- Batch calling: +$0.005/dial
- **Branded Call (caller ID display): +$0.10/outbound call**
- Verified Phone Number: $10/mo per number

**Key Features:**
- Drag-and-drop agentic framework for call flows
- Real-time function calling with preset functions
- Streaming RAG with auto-sync knowledge base
- Simulation testing before launch
- Analytics dashboard
- Batch calling with no concurrency limit
- SIP trunking (connect any telephony)
- **Branded Call feature** - shows business name/logo on recipient's phone
- HIPAA, SOC2 Type II, GDPR compliant

**GHL Integration:**
- Listed as supported integration (alongside HubSpot, Twilio, Vonage, n8n)
- Likely via webhook/API rather than native GHL workflow action

**Outbound:**
- Full API for outbound calls
- Batch campaigns
- No platform-level consent gate

**Verdict:** More polished enterprise product. Slightly higher base cost but includes branded calling. Better for long-term if we're selling this to clients. No native GHL workflow action like VAPI has.

---

### 3. Synthflow (synthflow.ai) - BUDGET OPTION

**What it is:** Voice AI platform focused on agencies and resellers.

**Pricing (Pay-as-you-go):**
- $0 to start, usage-based after launch
- Estimated $0.15-0.24/min depending on LLM + telephony
- LLM options: GPT 5.1 ($0.05/min), GPT 4.1 mini (cheaper), Bring Your Own LLM
- Telephony: Synthflow Native (free?), Synthflow Twilio ($0.02/min), BYOT (free)
- 5 concurrent calls default, $20/extra concurrency
- White Label: $2,000/mo add-on
- SOC2, GDPR, ISO 27001 compliant
- Billed per second (not rounded up to minutes)
- Failed calls = no charge

**Key Features:**
- Unlimited agents on pay-as-you-go
- API + integrations included
- Performance routing add-on ($0.04/min) for faster responses
- Global low latency edge ($0.04/min) for <600ms
- White label and reseller toolkit available

**Verdict:** Good if we want to white-label voice AI under ClawOps brand for clients. Per-second billing is nice. But less mature than VAPI/Retell for our immediate outbound needs.

---

### 4. Bland AI (bland.ai) - ENTERPRISE ONLY

**What it is:** Enterprise conversational AI, custom-trained models.

**Pricing:** Not public. "Talk to Sales" for everything. Enterprise-focused.

**Key Features:**
- Custom fine-tuned models (no OpenAI/Anthropic dependency)
- Dedicated infrastructure + GPUs
- Custom voice actors
- Up to 1M concurrent calls
- Omni-channel (calls, SMS, chat)
- Multi-regional, multi-lingual

**Verdict:** Overkill for our current scale. No self-serve. Need sales call to even get started. Skip for now.

---

## Recommendation: VAPI First, Retell as Backup

### Why VAPI wins for us right now:

1. **Native GHL workflow integration** - can trigger calls from existing GHL workflows without custom code
2. **$10 free credit** - test without spending anything
3. **No consent gate** - VAPI handles its own calling, bypasses GHL's consent system entirely
4. **Batch calling API** - can blast through our 172 contacts programmatically
5. **Dynamic variables** - personalize each call with contact name, trade niche, etc.
6. **Scheduled calls** - set business hours without manual timing
7. **Quick setup** - create assistant, buy/import number, fire API calls

### Implementation Plan:

**Step 1: Sign up for VAPI** (free, 5 min)
- Create account at vapi.ai
- Get API key

**Step 2: Create Voice AI Assistant** (30 min)
- Port existing GHL Voice AI prompt to VAPI assistant
- Configure voice (VAPI has multiple providers: ElevenLabs, Deepgram, etc.)
- Set up function calling for calendar booking

**Step 3: Get Phone Number** (5 min)
- Option A: Use free VAPI number for testing
- Option B: Buy a fresh local number in VAPI ($2-3/mo)
- Option C: Import existing Twilio number (513-854-4812)

**Step 4: Test Outbound** (15 min)
- Make a few test calls via API
- Verify voice quality, latency, booking flow

**Step 5: Batch Campaign** (1 hour)
- Export 172 contacts from GHL
- Run batch outbound via VAPI API
- OR trigger via GHL workflow using native VAPI integration

### Cost Estimate (172 contacts):
- Average call: 3-5 min (if answered), 30 sec (if voicemail)
- Assume 35% answer rate = ~60 answered calls x 4 min avg = 240 min
- Unanswered: ~112 calls x 0.5 min = 56 min
- Total: ~296 minutes
- At $0.10/min estimate: **~$30 total**
- $10 free credit covers first ~100 minutes

### Trust/Reputation Strategy:
- Fresh VAPI number = clean reputation (no "Scam Likely" history)
- Register with Hiya (free) for caller ID display
- Register with First Orion for branded calling
- If using Twilio import: still need Twilio Trust Hub approval
- Consider IPQualityScore to monitor number health

---

## Retell AI - When to Switch

Move to Retell if:
- VAPI voice quality doesn't meet our standard
- We need branded calling (shows business name on caller ID) - Retell has this built in
- We're selling voice AI as a product to clients (Retell's enterprise features are stronger)
- We need HIPAA compliance for healthcare contractor clients

---

## What This Means for GHL

- Keep GHL for CRM, pipeline, contacts, workflows, SMS
- Use VAPI (or Retell) for the actual voice calling
- GHL's native Voice AI becomes our inbound-only system
- Outbound goes through VAPI's infrastructure
- This is actually how most serious agencies do it - GHL for CRM, external platform for voice

---

## Action Items for Brand

1. **Decide: VAPI or Retell?** (I recommend VAPI for speed)
2. **Sign up for chosen platform** (need your email/payment)
3. **I'll handle**: assistant creation, prompt porting, number setup, batch calling script
4. Estimated time to first outbound call: **under 2 hours** from sign-up
