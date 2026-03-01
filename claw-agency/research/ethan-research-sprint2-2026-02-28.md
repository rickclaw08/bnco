# Ethan Research Sprint #2 - Saturday Feb 28, 2026
**CTO Intelligence Report for ClawOps AI Receptionist**
**Date:** 2026-02-28 20:30 EST
**Stack:** Express + Twilio Media Streams + OpenAI Realtime API (gpt-4o-realtime-preview-2025-06-03) on Fly.io

---

## Table of Contents
1. [OpenAI Realtime API - Latest Intelligence](#1-openai-realtime-api---latest-intelligence)
2. [Twilio + OpenAI Integration Patterns](#2-twilio--openai-integration-patterns)
3. [Multi-Tenant Voice AI Architecture Patterns](#3-multi-tenant-voice-ai-architecture-patterns)
4. [Pipecat vs LiveKit vs Raw Twilio Media Streams](#4-pipecat-vs-livekit-vs-raw-twilio-media-streams)
5. [Voice AI Demo Techniques That Convert](#5-voice-ai-demo-techniques-that-convert)
6. [Cost Optimization at Scale](#6-cost-optimization-at-scale)
7. [New Voice AI Frameworks & Tools This Week](#7-new-voice-ai-frameworks--tools-this-week)
8. [Strategic Recommendations](#8-strategic-recommendations)

---

## 1. OpenAI Realtime API - Latest Intelligence

### Major Update: SIP Support is GA
OpenAI has launched **native SIP support** for the Realtime API. This is a game-changer for our architecture:

- **Direct SIP endpoint:** `sip:$PROJECT_ID@sip.api.openai.com;transport=tls`
- **Webhook-based call handling:** Set up `realtime.call.incoming` webhook, then accept/reject calls via REST API
- **No more Media Streams proxying needed:** Calls route directly from Twilio SIP Trunk to OpenAI
- **Call control APIs:** Accept, reject, refer (transfer), and hang up calls programmatically
- **WebSocket monitoring:** Connect to `wss://api.openai.com/v1/realtime?call_id={call_id}` to monitor/control active sessions

**Code pattern from official docs (Python):**
```python
@app.route("/", methods=["POST"])
def webhook():
    event = client.webhooks.unwrap(request.data, request.headers)
    if event.type == "realtime.call.incoming":
        requests.post(
            f"https://api.openai.com/v1/realtime/calls/{event.data.call_id}/accept",
            headers={**AUTH_HEADER, "Content-Type": "application/json"},
            json={
                "type": "realtime",
                "instructions": "You are a support agent.",
                "model": "gpt-realtime",
            },
        )
        # Spawn WebSocket listener for the session
        threading.Thread(
            target=lambda: asyncio.run(websocket_task(event.data.call_id)),
            daemon=True,
        ).start()
```

### Latest Model: `gpt-realtime` (GA)
- The `gpt-realtime` model alias is now the recommended production model (replaces preview models)
- Also available: `gpt-realtime-mini` for cheaper workloads
- **New `gpt-realtime-1.5`** variant spotted on Artificial Analysis benchmarks
- Improvements in: complex instruction following, tool calling, natural/expressive speech

### New Features
- **Stored Prompts:** Server-side prompt management with versioning and variables
  ```json
  {
    "prompt": {
      "id": "pmpt_123",
      "version": "89",
      "variables": { "city": "Paris" }
    }
  }
  ```
- **Mid-call prompt swapping:** Update instructions, prompt version, or variables mid-session via `session.update`
- **Semantic VAD:** New `"turn_detection": {"type": "semantic_vad"}` - understands conversational intent, not just silence
- **Truncation controls:** `retention_ratio` setting to manage context window and costs
  ```json
  {
    "truncation": {
      "type": "retention_ratio",
      "retention_ratio": 0.8,
      "token_limits": { "post_instructions": 8000 }
    }
  }
  ```
- **Multiple voices available:** Including "marin" and others
- **Call transfer (REFER):** Transfer active calls to another SIP endpoint or phone number

### Known Issues & Gotchas
- **Context accumulation:** Entire conversation sent to model each turn. Later turns in long sessions get progressively more expensive
- **Cache busting:** Modifying instructions or removing conversation items mid-session kills prompt caching
- **32k context limit:** With 4,096 max output tokens, only 28,224 tokens available for context before auto-truncation kicks in
- **Audio token asymmetry:** Input audio = 1 token/100ms, Output audio = 1 token/50ms (output costs 2x per second)
- **Latency from n8n/webhook chains:** Community reports that chaining OpenAI Realtime through external tools (like n8n) adds unacceptable latency - need to keep tool calls lightweight
- **Language drift:** Model can unexpectedly switch languages; needs explicit pinning in prompts

### Prompting Best Practices (from official guide)
1. **Bullets > paragraphs** - short bullet points outperform long paragraphs
2. **Use ALL CAPS for critical rules** - model pays more attention
3. **Provide sample phrases** for each conversation stage (greeting, discovery, resolve, close)
4. **Add explicit "unclear audio" handling** section
5. **Pin language explicitly** to prevent drift
6. **Add variety instructions** to prevent robotic repetition
7. **Structure prompts with labeled sections:** Role, Personality, Context, Pronunciations, Tools, Instructions, Flow, Safety
8. **Convert non-text rules to text:** Write "IF MORE THAN THREE FAILURES THEN ESCALATE" not "IF x > 3 THEN ESCALATE"

---

## 2. Twilio + OpenAI Integration Patterns

### Architecture Evolution: Three Generations

**Gen 1 (Our Current): Twilio Media Streams + WebSocket Proxy**
- Twilio -> Your Server (Media Streams WS) -> OpenAI Realtime API (WS)
- You proxy audio between Twilio and OpenAI
- Full control but added latency from the proxy hop
- More complex infrastructure to maintain

**Gen 2: Twilio Elastic SIP Trunking + OpenAI SIP Connector (NEW - RECOMMENDED)**
- Twilio SIP Trunk -> OpenAI SIP endpoint directly
- Your server only handles webhook for call accept/reject/config
- **Eliminates the audio proxy entirely** - audio flows directly from Twilio to OpenAI
- Lower latency, simpler infrastructure, less bandwidth on your servers
- Official tutorial: https://www.twilio.com/en-us/blog/developers/tutorials/product/openai-realtime-api-elastic-sip-trunking

**Gen 3: WebRTC Direct (for web/app clients)**
- Browser/app connects directly to OpenAI via WebRTC
- Lowest latency for non-phone use cases

### Twilio SIP Integration Setup (from official tutorial)
1. Buy Twilio phone number with Voice capabilities
2. Create SIP Trunk in Twilio Console
3. Set Origination URI: `sip:PROJECT_ID@sip.api.openai.com;transport=tls`
4. Connect phone number to SIP Trunk
5. Create OpenAI webhook for `realtime.call.incoming`
6. Build webhook handler (Node.js/TypeScript) to accept calls and configure sessions

**Key code pattern (TypeScript):**
```typescript
import express from "express";
import WebSocket from "ws";
import OpenAI from "openai";

const client = new OpenAI({
  webhookSecret: process.env.OPENAI_WEBHOOK_SECRET
});

app.post("/", (req, res) => {
  const event = client.webhooks.unwrap(req.body, req.headers);
  if (event.type === "realtime.call.incoming") {
    // Accept call with tenant-specific config
    await fetch(`https://api.openai.com/v1/realtime/calls/${event.data.call_id}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        type: "realtime",
        model: "gpt-realtime",
        instructions: tenantConfig.instructions,
        voice: tenantConfig.voice
      })
    });
    // Open monitoring WebSocket
    const ws = new WebSocket(`wss://api.openai.com/v1/realtime?call_id=${event.data.call_id}`, {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    });
  }
});
```

### Multi-Tenant Implications
With SIP integration, multi-tenancy becomes much cleaner:
- Look up tenant from the `To` SIP header (incoming phone number)
- Pass tenant-specific instructions/voice/tools in the `accept` call
- Monitor sessions via WebSocket per call
- **No need to proxy audio through your infrastructure**

---

## 3. Multi-Tenant Voice AI Architecture Patterns

### Pattern A: Phone Number per Tenant (Recommended)
Each tenant gets their own Twilio phone number:
- **Routing:** Incoming call -> Twilio SIP Trunk -> OpenAI SIP -> your webhook
- **Tenant lookup:** Extract `To` number from SIP headers, map to tenant config
- **Config injection:** Pass tenant-specific instructions, voice, tools in accept call
- **Isolation:** Clean separation, easy to track per-tenant usage/billing

### Pattern B: IVR/DTMF Prefix Routing
Single number with "Press 1 for Acme, Press 2 for..." - works but poor UX for AI receptionist

### Pattern C: Stored Prompts per Tenant (New OpenAI Feature)
- Create a Stored Prompt per tenant with variables
- Swap `prompt.id` and `prompt.variables` at accept time
- Version your prompts independently per tenant

### Real-World Case Study: Premier Eye Center Miami
From r/AI_Agents - a voice AI agency running for an eye clinic:
- **Setup cost:** $2,000 one-time
- **Stack:** n8n + Retell AI Voice Agent + WhatsApp API + Email + CRM
- **Results:** Conversion jumped from 15% to 40%, $15k extra monthly revenue
- **Key feature:** AI calls leads within 2 minutes of Meta ad submission
- **Multi-channel:** Simultaneous WhatsApp + email welcome sequences
- **Staff can drop leads in Telegram for instant AI calls**

### Architecture Recommendations for ClawOps
```
Tenant Config DB (tenant-manager.js)
         |
         v
[Twilio SIP Trunk] --> [OpenAI SIP Connector]
         |
    webhook fires
         |
         v
[ClawOps Webhook Server on Fly.io]
  - Lookup tenant by phone number
  - Accept call with tenant config
  - Open monitoring WebSocket
  - Log events, track usage
  - Handle tool calls (booking, CRM, etc.)
```

Key decisions:
- **One SIP trunk, multiple phone numbers** - simpler management
- **Stored Prompts** for version-controlled tenant configs
- **WebSocket monitoring** for real-time dashboards and logging
- **Tool definitions per tenant** for custom integrations (calendars, CRMs)

---

## 4. Pipecat vs LiveKit vs Raw Twilio Media Streams

### Comparison Matrix

| Feature | Raw Twilio Media Streams | Pipecat | LiveKit Agents | Bolna |
|---------|-------------------------|---------|---------------|-------|
| **Language** | Any (Node.js ideal) | Python | Python + Node.js | Python |
| **Architecture** | WebSocket proxy | Pipeline-based | Room-based participants | Pipeline + Telephony |
| **Telephony** | Native (Twilio) | Plugin-based | SIP/PSTN support | Twilio, Plivo built-in |
| **STT/TTS Flexibility** | Manual | Multi-provider plugins | Multi-provider plugins | Multi-provider |
| **Latency Control** | Full (you own the pipe) | Good (pipeline optimized) | Good (WebRTC native) | Good |
| **Multi-tenant** | DIY | DIY | Built-in rooms | JSON config per agent |
| **Production Ready** | DIY | Growing | Yes (Cloud offering) | Growing |
| **Open Source** | N/A (your code) | Yes (BSD) | Yes (Apache 2.0) | Yes |
| **Scaling** | Manual | Manual | Auto (K8s, Cloud) | Docker-based |

### NEW: OpenAI SIP Connector Changes Everything
With SIP support, the comparison shifts dramatically:
- **Raw Media Streams is now obsolete** for OpenAI Realtime use cases
- SIP connector eliminates the need for audio proxying
- Pipecat/LiveKit still valuable if you need multi-provider STT/LLM/TTS pipelines
- For pure OpenAI Realtime, SIP direct is the lowest-latency, simplest option

### LiveKit Agents (Detailed)
- **Framework:** Full agent lifecycle management with dispatch, jobs, rooms
- **Key selling point:** Production-ready scaling with load balancing and K8s support
- **Custom turn detection model** for better conversation flow
- **Multi-agent handoff** for complex workflows
- **LiveKit Cloud** for managed deployment
- **Best for:** Apps that need video + voice + text, multi-agent scenarios, WebRTC-first apps

### Pipecat (Detailed)
- **Framework:** Pipeline-based voice AI framework
- **Extensible:** Wide plugin ecosystem for STT, LLM, TTS providers
- **Best for:** Custom pipelines where you want to mix/match providers (e.g., Deepgram STT + Claude LLM + ElevenLabs TTS)
- **Daily.co integration** for WebRTC transport

### Bolna (Detailed)
- **Framework:** End-to-end voice agent platform with JSON-based agent config
- **Built-in telephony:** Twilio and Plivo integration out of the box
- **Docker-compose setup** with Redis for agent persistence
- **Hosted API + No-code playground** available
- **Best for:** Rapid prototyping, teams wanting turnkey telephony + agent orchestration
- **Looking for maintainers** - community concern about long-term support

### Recommendation for ClawOps
**Short term (now):** Migrate from Media Streams to SIP connector. Our server becomes a thin webhook handler + monitoring layer. Massive simplification.

**Medium term:** If we need multi-provider flexibility (fallback to Deepgram STT + different TTS when OpenAI is down), consider wrapping in Pipecat or LiveKit.

**Long term:** LiveKit Agents if we expand beyond telephony to video consultations, multi-agent workflows, or need enterprise scaling.

---

## 5. Voice AI Demo Techniques That Convert

### The "Wow Factor" Hierarchy
Based on research across r/AI_Agents, r/VoiceAutomationAI, and industry patterns:

#### 1. Live Call Demo (Highest Impact)
- **Call their phone in the meeting.** Have the AI receptionist actually call the prospect's cell phone while screen-sharing your dashboard
- Show real-time transcription, sentiment, and intent detection alongside the call
- Have it handle a complex scenario (reschedule, multi-step booking, handle objection)
- **Why it works:** Eliminates "that's just a recording" skepticism instantly

#### 2. The "Within 2 Minutes" Speed Demo
- Submit a fake lead through their actual lead form
- Watch the AI call back within 2 minutes
- From the Premier Eye Center case study: this alone drove conversion from 15% to 40%
- **Script:** "We just submitted a lead through your website. Watch your phone."

#### 3. Multi-Channel Orchestration
- Show the AI simultaneously:
  - Making the call
  - Sending WhatsApp confirmation
  - Updating CRM in real-time
  - Triggering email sequence
- **Why it works:** Shows the full value proposition beyond just the voice call

#### 4. Edge Case Handling
- Demo interruptions (talk over the AI - show it handles gracefully)
- Demo unclear audio / background noise handling
- Demo language switching (if applicable)
- Demo call transfer to human when AI is unsure
- **Why it works:** Prospects test edge cases mentally - show you've already solved them

#### 5. ROI Calculator in Real-Time
- During demo, calculate: "You get 50 calls/day, 20% are missed. At $X average ticket, that's $Y/month in lost revenue. Our AI answers 100% of calls for $Z/month."
- **From the case study:** $2,000 setup fee, $15k/month in additional revenue = immediate ROI

### Demo Anti-Patterns to Avoid
- Don't show a pre-recorded demo (kills trust)
- Don't demo over laptop speakers (poor audio = poor impression)
- Don't use long, complex prompts in the demo - keep interactions short and punchy
- Don't skip the "what if it gets confused" scenario - address it proactively

---

## 6. Cost Optimization at Scale (100+ Concurrent Calls)

### OpenAI Realtime API Pricing (Current)

| Model | Audio Input ($/hr) | Audio Output ($/hr) | Text Input | Text Output |
|-------|-------------------|---------------------|------------|-------------|
| GPT Realtime (full) | $1.15 | $4.61 | Standard | Standard |
| GPT Realtime 1.5 | $1.15 | $4.61 | Standard | Standard |
| GPT-4o mini Realtime | $0.36 | $1.44 | Standard | Standard |
| GPT Realtime Mini (Oct 25) | $0.36 | $1.44 | Standard | Standard |

**Comparison with competitors:**
| Provider | Input $/hr | Output $/hr | Notes |
|----------|-----------|-------------|-------|
| Grok Voice Agent | $3.00 | $3.00 | Flat rate $0.05/min, top reasoning |
| Gemini 2.5 Flash Native Audio | $0.35 | $1.38 | Cheapest, good latency |
| Nova 2.0 Sonic (Amazon) | $0.27 | $1.08 | Cheapest overall |
| Step-Audio R1.1 | $0.06 | $1.69 | Cheapest input by far |
| Qwen3 Omni 30B | $0.65 | $0.99 | Cheapest output |

### Cost Per Call Estimates (3-minute average call)

**GPT Realtime (full model):**
- Audio input: $1.15/hr * 0.05hr = $0.058
- Audio output: $4.61/hr * 0.05hr = $0.231
- **Total per call: ~$0.29 (optimistic, first few turns)**
- With context accumulation over longer calls: $0.40-0.60/call

**GPT Realtime Mini:**
- Audio input: $0.36/hr * 0.05hr = $0.018
- Audio output: $1.44/hr * 0.05hr = $0.072
- **Total per call: ~$0.09**
- With context accumulation: $0.12-0.20/call

### At Scale (100 concurrent, ~3000 calls/day)

| Model | Daily Cost | Monthly Cost |
|-------|-----------|-------------|
| GPT Realtime (full) | $870-$1,800 | $26k-$54k |
| GPT Realtime Mini | $270-$600 | $8k-$18k |
| Gemini 2.5 Flash | ~$150-$350 | $4.5k-$10.5k |

### Cost Optimization Strategies

#### 1. Use `gpt-realtime-mini` for Most Calls
- Test with full model, then try mini
- Mini is 70% cheaper, often sufficient for receptionist tasks
- Use full model only for complex interactions (multi-step bookings, complaints)

#### 2. Aggressive Truncation
```json
{
  "truncation": {
    "type": "retention_ratio",
    "retention_ratio": 0.8,
    "token_limits": {
      "post_instructions": 8000
    }
  }
}
```
- Keep `post_instructions` limit at 8000 tokens
- Use `retention_ratio: 0.8` to drop extra context on truncation
- This maximizes prompt caching and reduces per-turn costs

#### 3. Maximize Prompt Caching
- **Keep instructions static** across the session (don't modify mid-call)
- Tool definitions are at the beginning of context - don't change mid-session
- Cached tokens are significantly cheaper than uncached
- Track `cached_tokens` in `response.done` events to verify caching is working

#### 4. Manual Conversation Management
- Delete old conversation items when no longer needed
- Replace old items with a short summary
- Keep active context small and relevant

#### 5. Short, Focused Conversations
- Design conversation flows to resolve quickly
- Have clear exit criteria ("Is there anything else I can help with?")
- Transfer to human for extended interactions rather than burning tokens

#### 6. Consider Multi-Model Strategy
- **Route simple calls** (hours inquiry, directions) to mini model
- **Route complex calls** (complaints, multi-step booking) to full model
- **Use intent detection** in the first few seconds to route

#### 7. SIP Eliminates Server Bandwidth Costs
- With SIP, no audio flows through your servers
- Eliminates Fly.io bandwidth costs for audio streaming
- Only webhook + WebSocket monitoring traffic on your infra

### Twilio Costs (Additive)
- Twilio phone number: $1.15/month per number
- Incoming voice: $0.0085/min
- At 3000 calls/day * 3 min average: ~$765/month Twilio costs
- SIP Trunking may have different rates - check current pricing

---

## 7. New Voice AI Frameworks & Tools This Week

### Utterance - Open Source Client-Side Semantic VAD
- **Repo:** github.com/nizh0/Utterance
- **Website:** utterance.dev
- **What it does:** Lightweight ML model (~3-5MB, ONNX) that runs in browser/on-device
- **Detects 4 states:** speaking, thinking pause, turn complete, interrupt intent
- **No cloud, no API keys, no per-minute pricing**
- **MIT licensed**
- **Why it matters:** Could dramatically improve turn detection for WebRTC-based demos. No server-side dependency. Better than Silero VAD which only detects sound/silence.
- **Status:** Looking for contributors, early stage

### Grok Voice Agent API (xAI)
- **Just launched publicly**
- **Benchmark leader:** 92.3% on Big Bench Audio (beat Gemini 2.5 Flash)
- **Latency:** 0.78 seconds time-to-first-audio (3rd fastest)
- **Pricing:** Flat $0.05/min ($3/hr) - roughly half of OpenAI Realtime
- **Features:** 100+ languages, 5 expressive voices, tool calling, SIP support (Twilio/Vonage)
- **Tesla partnership:** Powers in-vehicle Grok for millions of cars
- **Competitive threat:** Could be a cost-effective alternative or fallback provider

### Step-Audio R1.1 (StepFun)
- **96% on Big Bench Audio** - highest reasoning score
- **Time to first audio:** 1.51 seconds
- **Pricing:** $0.06/hr input, $1.69/hr output - extremely competitive
- **Best reasoning model available** for audio-native tasks

### Qwen3 Omni 30B (Alibaba Cloud)
- Available in both standard and Realtime modes
- Very competitive on price ($0.65 input, $0.99 output per hour)
- Moderate latency (~0.88 seconds)
- Open-weight model - can self-host

### Nova 2.0 Sonic (Amazon Bedrock)
- **87% reasoning, $0.27/hr input, $1.08/hr output**
- 1.39s latency
- Integrated with AWS Bedrock ecosystem
- Good option if already on AWS

### OpenAI Realtime Model Refresh
- **GPT-Realtime-1.5** appeared on benchmarks (81% reasoning, 0.82s latency)
- Sits between full GPT Realtime (83%) and mini (68-69%) in capability
- Same pricing as full model ($1.15/$4.61 per hour)
- May offer a better latency/quality tradeoff

---

## 8. Strategic Recommendations

### IMMEDIATE (This Week)

#### 1. Migrate to SIP Connector Architecture
**Priority: CRITICAL**
Our Media Streams proxy architecture is now obsolete. The SIP connector:
- Eliminates the audio proxy (lower latency, simpler infra)
- Reduces Fly.io bandwidth/compute requirements
- Gives us call transfer, monitoring, and better control
- Official Twilio tutorial exists for this exact setup

**Migration path:**
1. Set up OpenAI webhook for `realtime.call.incoming`
2. Create Twilio SIP Trunk with OpenAI origination URI
3. Rewrite server as webhook handler (much simpler than current Media Streams code)
4. Test with existing phone numbers
5. Keep Media Streams as fallback during transition

#### 2. Implement Stored Prompts
Use OpenAI's new Stored Prompts feature for tenant configuration:
- Create one prompt per tenant with variables
- Version control prompts server-side
- Swap easily at accept time
- Cleaner than passing full instructions in every session

#### 3. Add Semantic VAD
Switch from default VAD to `semantic_vad` - it understands conversational intent, not just silence. Should reduce interruption issues and improve natural conversation flow.

### SHORT TERM (Next 2 Weeks)

#### 4. Build Live Demo Capability
For prospect conversion:
- "Call your phone" feature during sales meetings
- Real-time dashboard showing transcription, sentiment, intent
- Edge case handling demonstration script
- ROI calculator integration

#### 5. Cost Controls
- Implement truncation with `retention_ratio: 0.8` and `post_instructions: 8000`
- Track per-tenant cost via `response.done` usage events
- Test `gpt-realtime-mini` for simple receptionist tasks
- Set up usage alerts for high-cost tenants

#### 6. Multi-Provider Strategy Planning
- Monitor Grok Voice Agent API (cheaper, potentially better)
- Evaluate Gemini 2.5 Flash Native Audio (cheapest Google option)
- Build abstraction layer so we can swap providers without tenant impact

### MEDIUM TERM (Next Month)

#### 7. Evaluate Utterance for WebRTC Demos
If we add web-based demo capability, Utterance's client-side semantic VAD could make demos dramatically smoother without any server-side dependency.

#### 8. Consider LiveKit for Scale
If we need:
- Multi-agent handoff (transfer between specialized AI agents)
- Video capabilities (telemedicine, visual inspections)
- Enterprise-grade scaling with K8s
- LiveKit Agents framework is the most production-ready option

---

## Sources
- OpenAI Realtime API Docs: https://developers.openai.com/api/docs/guides/realtime-sip
- OpenAI Cost Management: https://developers.openai.com/api/docs/guides/realtime-costs
- OpenAI Prompting Guide: https://developers.openai.com/api/docs/guides/realtime-models-prompting
- Twilio SIP Tutorial: https://www.twilio.com/en-us/blog/developers/tutorials/product/openai-realtime-api-elastic-sip-trunking
- Artificial Analysis S2S Leaderboard: https://artificialanalysis.ai/models/speech-to-speech
- LiveKit Agents: https://docs.livekit.io/agents/
- Bolna Framework: https://github.com/bolna-ai/bolna
- Utterance (Semantic VAD): https://github.com/nizh0/Utterance
- r/AI_Agents - Premier Eye Center case study
- r/MachineLearning - Utterance announcement
- r/singularity - Grok Voice Agent API launch
- r/n8n - OpenAI Realtime latency issues with external tool chains

---

*Generated by Ethan (CTO) - Research Sprint #2*
*Next research sprint: TBD based on SIP migration progress*
