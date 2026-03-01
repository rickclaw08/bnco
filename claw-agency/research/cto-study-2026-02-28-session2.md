# CTO Study Session 2: Voice AI Production Architecture Deep Dive
**Date:** 2026-02-28
**Sources:** Reddit (r/LocalLLaMA, r/AI_Agents, r/SaaS, r/webdev, r/node), Hacker News, official docs (Pipecat, LiveKit, ElevenLabs, Cartesia, Fly.io, Railway, Render), SevenRooms API docs
**Purpose:** Production-grade technical intelligence for our voice AI receptionist stack

---

## 1. Production Voice AI Architectures People Are Actually Running

### The Dominant Production Stack (2025-2026)

The clear production winner across all forums is a streaming pipeline architecture, NOT a monolithic speech-to-speech model. Real deployments break down into discrete, swappable stages:

```
Twilio/Vonage (Telephony)
  -> WebSocket audio stream
    -> STT (streaming, partial results)
      -> LLM (streaming completion)
        -> TTS (streaming audio chunks)
          -> WebSocket audio back
            -> Twilio/Vonage (to caller)
```

**Key insight from r/LocalLLaMA and r/AI_Agents:** Production builders universally report that the STT-LLM-TTS pipeline approach (not OpenAI Realtime API) is what scales. The Realtime API is too expensive for volume and too opaque for debugging.

### Two Open-Source Frameworks Dominate

**Pipecat (by Daily.co)** - 15.5k GitHub stars
- Python framework, production-tested
- Supports every major STT, TTS, and LLM provider through plugins
- Has native Twilio, Plivo, Telnyx, Vonage serializers for telephony
- Transport: WebSocket, WebRTC (via Daily), or custom
- Pipeline architecture with composable processors
- "Pipecat Flows" for structured conversation state machines (critical for booking flows)
- Client SDKs: JS, React, React Native, Swift, Kotlin, C++
- Round-trip latency target: 500-800ms per the docs
- Active Discord community, backed by Daily.co engineering

**LiveKit Agents** - Apache 2.0 open source
- Python and Node.js SDKs
- WebRTC-native transport (better for unreliable networks)
- Built-in turn detection model, interruption handling
- Agent server orchestration with load balancing and Kubernetes support
- Managed cloud option (LiveKit Cloud) for deployment
- "Agent Builder" for prototyping without code
- Plugin system for all major AI providers

**Recommendation for our stack:** Pipecat is the stronger choice. Here is why:
1. Native Twilio serializer means we plug directly into our existing Twilio setup
2. Pipecat Flows gives us structured conversation state management (needed for booking)
3. Python ecosystem gives us the widest provider plugin support
4. Daily.co backing means the WebRTC transport layer is battle-tested
5. Composable pipeline means we can swap STT/TTS/LLM providers per client (multi-tenant flexibility)

---

## 2. Deepgram vs Whisper vs Google STT for Real-Time Voice in Production

### Deepgram Nova-2 (and Nova-3)

**Production consensus on r/LocalLLaMA:** Deepgram is the default choice for production real-time STT. Near-universal recommendation across threads.

- **Latency:** Streaming partial results in 100-300ms. This is the critical differentiator. You get words as they are spoken, not after a pause.
- **Accuracy:** Nova-2 consistently rated as matching or beating Whisper large-v3 on English, with far lower latency. Nova-3 reportedly even better.
- **Pricing:** $0.0043/min (Pay-as-you-go). Growth plan at $0.0036/min. At scale, negotiable.
- **Key feature for voice agents:** Endpointing detection (knowing when the speaker stopped) is built in and tunable. This directly affects conversation feel.
- **Interim/partial results:** Streams partial transcriptions, which lets the LLM start processing before the caller finishes speaking (huge for perceived latency).
- **Multi-language:** Supports 30+ languages with auto-detection.

### OpenAI Whisper (hosted or self-hosted)

- **Latency:** NOT suitable for real-time streaming in its standard form. Whisper is a batch transcription model. Even with Groq hosting (Whisper-large-v3-turbo), you still need to buffer audio chunks and send them, adding 300-800ms+ minimum.
- **Self-hosted Whisper:** Faster-whisper or whisper.cpp can reduce latency to ~200-500ms per chunk, but requires GPU infrastructure and adds operational complexity.
- **Accuracy:** Best-in-class for long-form transcription. But for short, real-time voice agent turns, Deepgram matches or beats it.
- **Cost (self-hosted):** Near-zero marginal cost on your own GPU, but GPU cost is $0.50-2.00/hr depending on provider.
- **Cost (Groq-hosted):** $0.111/hr ($0.00185/min), cheapest hosted option.

### Google Cloud Speech-to-Text (v2)

- **Latency:** Streaming API is competitive with Deepgram at 200-400ms for partial results.
- **Accuracy:** Good but not best-in-class for conversational English. Better for formal/structured speech.
- **Pricing:** $0.016/min (standard), $0.009/min (enhanced). More expensive than Deepgram.
- **Pain points from r/webdev:** More complex SDK setup. IAM/auth overhead. Less developer-friendly than Deepgram's WebSocket API.

### Cartesia Ink-Whisper (New Entrant)

- Claims "fastest streaming STT" at $0.13/hr on Scale plan (~$0.0022/min).
- Worth evaluating, but less production track record than Deepgram.

**Recommendation:** Deepgram Nova-2 (or Nova-3) as primary STT. Non-negotiable for production voice. The streaming partial results and sub-300ms latency are what make conversations feel natural. Self-hosted Whisper only makes sense if we are running 10,000+ concurrent calls and want to cut marginal STT cost to near-zero.

---

## 3. ElevenLabs vs PlayHT vs XTTS for TTS in Production

### ElevenLabs

**The r/LocalLLaMA and r/SaaS consensus:** Best overall voice quality, but pricing is the challenge at scale.

- **Quality:** Consistently rated #1 for natural-sounding voices. "Flash" model is lower quality but faster. "Multilingual v2/v3" is highest quality.
- **Latency:**
  - Flash model: ~150-250ms time-to-first-audio (TTFA)
  - Multilingual v2/v3: ~300-500ms TTFA
  - Turbo v2.5 (deprecated, but reference): ~200ms TTFA
- **Pricing (from official pricing page):**
  - Flash: ~$0.06/min at Business tier, ~$0.15/min at Creator tier
  - Multilingual v2/v3: ~$0.12/min at Business tier, ~$0.30/min at Creator tier
  - Scale tier ($330/mo): 2M credits, ~4,000 Flash minutes or ~2,000 v2/v3 minutes
  - Business tier ($1,320/mo): 11M credits, ~22,000 Flash minutes. "Low-latency TTS as low as 5c/minute"
- **Voice cloning:** Instant clone (5 sec sample) and Professional clone (30+ min sample). Professional clone is dramatically better.
- **Key for multi-tenant:** Each client can have a custom voice clone. API supports specifying voice_id per request.
- **Startup Grant:** 12 months free, 33M characters. Worth applying for.

### PlayHT

- **Quality:** Good but not ElevenLabs-tier. PlayHT 2.0 voices are decent for American English.
- **Latency:** Claims 300ms TTFA. In practice, r/LocalLLaMA reports 400-600ms, which is notably slower.
- **Pricing:** Harder to pin down (pricing page was unresponsive). Historically $0.02-0.05/min range on higher tiers.
- **Key weakness:** API reliability issues reported on Reddit. Multiple threads cite dropped connections and inconsistent latency.

### XTTS (Coqui TTS, self-hosted)

- **Quality:** Impressive for an open-source model, especially with fine-tuning. Not ElevenLabs quality out of the box.
- **Latency:** Depends entirely on your GPU. On an A10G: ~200-400ms TTFA. On consumer GPU: 500ms+.
- **Cost:** Near-zero marginal cost. GPU hosting is the expense ($0.50-2.00/hr).
- **Key weakness:** Requires ML ops to run. Model serving, scaling, fallback handling. Not a drop-in API.
- **Pipecat integration:** Has a native XTTS plugin, so it is viable in the pipeline.

### Cartesia Sonic (Strong Contender)

**Emerging as the production alternative to ElevenLabs based on r/LocalLLaMA discussion.**

- **Quality:** Very close to ElevenLabs. Users report it is hard to distinguish in blind tests.
- **Latency:** 90ms time-to-first-audio (TTFA) on Sonic-3. This is best-in-class.
- **Pricing:** Startup plan $39/mo for 1.25M credits. Scale plan $239/mo for 8M credits. Significantly cheaper than ElevenLabs at comparable tiers.
- **Voice cloning:** Instant and Pro cloning available.
- **Key advantage:** The 90ms TTFA is a game-changer for perceived conversation speed. Combined with Deepgram's fast STT, total pipeline latency drops substantially.

**Recommendation:** Start with ElevenLabs Flash for best quality/latency balance. Apply for the Startup Grant (12 months free). Simultaneously evaluate Cartesia Sonic-3 for production. If Cartesia's quality meets our bar, migrate to it for cost savings and that 90ms TTFA. XTTS is a future optimization for high-volume cost reduction, not a launch choice.

---

## 4. Real-Time Booking System Integration During a Voice Call

### The Architecture Pattern

From r/AI_Agents and r/SaaS builders running restaurant/service booking bots:

```
Caller: "I'd like to book a table for 4 on Friday at 7pm"
  -> STT transcription
    -> LLM extracts: {party_size: 4, date: "Friday", time: "19:00"}
      -> LLM triggers function call: check_availability(params)
        -> API call to booking system (while TTS says "Let me check that for you")
          -> Response: available/unavailable
            -> LLM generates confirmation/alternative
              -> TTS speaks result
```

**Critical pattern:** The LLM must be configured with function calling (tool use) to invoke booking APIs mid-conversation. Pipecat Flows supports this natively through its structured conversation nodes.

### SevenRooms API

- **Status:** API docs exist at api-docs.sevenrooms.com but require provisioned account access (changed Feb 2026).
- **Access:** Must fill out a form and get individually provisioned. Not self-service.
- **Integration approach:** We need to become a SevenRooms integration partner or work through a restaurant that already has API access.
- **Key endpoints (from prior docs):** Reservation create, availability check, guest profile lookup.
- **Latency concern:** API response times vary. Budget 500-1000ms for a booking API round-trip. The LLM should generate a filler phrase ("Let me check that for you, one moment") to mask this latency.

### OpenTable API

- **Status:** OpenTable does NOT have a public developer API for creating reservations. Seriously.
- **Integration path:** OpenTable offers a "Partner API" only for approved POS/restaurant management platforms. Getting access requires a business relationship.
- **Workaround in production:** Some builders scrape the OpenTable widget or use the booking URL redirect. Fragile and not recommended.
- **Better approach:** Target restaurants using SevenRooms, Resy, or direct booking systems that have APIs. OpenTable is a walled garden.

### Calendly API

- **Status:** Full REST API available. Well-documented. Much easier than restaurant booking systems.
- **Key endpoints:** List available times, create a scheduled event, cancel/reschedule.
- **Latency:** Fast, typically 200-400ms response times.
- **Auth:** OAuth2 with personal access tokens for server-to-server.
- **Good for:** Service businesses (salons, spas, consultants, medical offices). NOT for restaurant table booking.

### Resy API (via AirTable/Custom)

- **No public API.** Resy (owned by AmEx) has no developer program. Same walled-garden problem as OpenTable.

### Practical Recommendation for Booking Integration

1. **For restaurants:** Target SevenRooms-using venues. Apply for API partner access immediately. Build a generic "booking adapter" interface so we can plug in other systems later.
2. **For service businesses:** Calendly API is ready to go. Also evaluate Cal.com (open source, self-hostable, full API).
3. **For salons/spas:** Many use Vagaro, Fresha, or Square Appointments. Square has a decent API. Vagaro has a partner API.
4. **Architecture pattern:** Build a "BookingAdapter" abstraction with implementations for each system. The LLM's function calling points to our adapter, not directly to the booking API. This lets us add new booking systems without changing the voice pipeline.
5. **Latency masking:** Train the LLM to produce a filler phrase before the function call completes. "Let me check availability for you, one moment please." This buys 1-2 seconds without awkward silence.

---

## 5. Multi-Tenant Voice AI: Serving 10-50 Clients from One Codebase

### Architecture Pattern from r/SaaS Builders

The production pattern for multi-tenant voice AI:

```
Single Deployment
  -> Tenant Router (by phone number or SIP header)
    -> Tenant Config Loader (from DB)
      -> Instantiate Pipeline with tenant-specific:
        - System prompt
        - Voice ID (TTS)
        - Business hours
        - Booking system credentials
        - Greeting script
        - Escalation rules
```

### Key Design Decisions

**1. Tenant isolation model:**
- **Shared infrastructure, separate config.** One server pool handles all tenants. Each inbound call looks up the tenant by the "To" phone number (Twilio provides this in the webhook).
- DO NOT run separate deployments per tenant. That is an ops nightmare at 50 clients and does not scale to 500.

**2. Phone number management:**
- Each client gets a dedicated Twilio phone number.
- Twilio number -> webhook to our server -> server looks up tenant config by number -> pipeline starts with that config.
- Twilio number provisioning: automate via Twilio API. ~$1.15/mo per number.

**3. Config storage:**
- PostgreSQL for tenant configs: system prompt, voice_id, business hours, booking system creds, escalation number, greeting text.
- Redis for hot config caching (avoid DB hit on every call).
- Admin dashboard for clients to edit their own config (future feature, not MVP).

**4. LLM context per tenant:**
- System prompt is the primary customization lever. Each tenant gets a custom system prompt with their business name, services, hours, FAQ, booking rules.
- Few-shot examples per tenant (optional but helpful for accuracy).
- No fine-tuning per tenant needed. Prompt engineering covers 95% of customization.

**5. Scaling model:**
- Each active call consumes one WebSocket connection + one pipeline instance.
- At 10 clients: peak concurrent calls might be 5-15. One server handles this.
- At 50 clients: peak concurrent calls might be 20-60. Need 2-4 servers with load balancing.
- Pipecat runs in Python async. Each pipeline is a coroutine. One server can handle 50-100 concurrent calls depending on CPU.

**6. Per-tenant billing/metering:**
- Log every API call (STT, LLM, TTS) with tenant ID and duration.
- Aggregate for monthly billing.
- This is critical for margin tracking. Know exactly what each client costs you.

**Recommendation:** Build the multi-tenant layer into the architecture from day one. Tenant config in Postgres, cached in Redis, keyed by Twilio phone number. Single deployment, shared infrastructure. This is the standard SaaS pattern and it works.

---

## 6. Fly.io vs Railway vs Render for WebSocket-Heavy Voice AI Servers

### Fly.io

**Strengths for voice AI:**
- **Global edge deployment.** Machines run close to users, reducing network latency. Critical for voice where every 50ms matters.
- **WebSocket support:** Native, no special config. Long-lived connections work.
- **Machines API:** Start/stop VMs on demand. Pay only when calls are active. This is huge for cost optimization.
- **Pricing:**
  - shared-cpu-1x, 1GB RAM: $5.70/mo (always-on)
  - performance-1x, 2GB RAM: $31/mo (always-on)
  - Stopped machines: $0.15/GB/mo for rootfs only
  - Egress: $0.02/GB (North America/Europe)
- **Fly.io Machines model:** Start a machine when a call comes in, stop it when the call ends. Per-second billing. This maps perfectly to voice call workloads.
- **Multi-region:** Deploy in multiple regions to reduce latency based on caller location.

**Weaknesses:**
- Steeper learning curve than Railway.
- Volume/storage management is manual.
- No built-in CI/CD. Need GitHub Actions or similar.
- Community reports occasional networking issues in some regions.

### Railway

**Strengths for voice AI:**
- **Simplest DX.** Git push to deploy. Excellent for rapid iteration.
- **WebSocket support:** Full support, including long-lived connections.
- **Usage-based pricing:**
  - CPU: $0.000278/vCPU/min (~$0.40/vCPU/hr)
  - RAM: $0.000139/GB/min (~$0.20/GB/hr)
  - Egress: $0.05/GB
  - Pro plan: $20/mo minimum, includes $20 credit
- **Scaling:** Up to 50 replicas on Pro plan. Horizontal scaling.
- **Private networking:** Free between services.

**Weaknesses:**
- **No edge deployment.** Your server runs in one region. For voice, this means callers far from the server region get higher latency.
- **More expensive at scale** compared to Fly.io due to usage-based model with no reservation discounts.
- **No machine start/stop model.** You pay for always-on instances.

### Render

**Strengths:**
- **WebSocket support:** Yes, supported.
- **Simple pricing:**
  - Starter: $7/mo (0.5 CPU, 512MB)
  - Standard: $25/mo (1 CPU, 2GB)
  - Pro: $85/mo (2 CPU, 4GB)
- **Zero-downtime deploys, health checks, rollbacks.**

**Weaknesses:**
- **Cold starts on free tier.** Spins down after inactivity. Unacceptable for voice.
- **No per-second billing.** Fixed monthly pricing means you pay even when idle.
- **Limited scaling.** Horizontal autoscaling on Professional plan only ($19/user/mo).
- **Single region.** Same problem as Railway.
- **No machine orchestration.** Cannot start/stop instances dynamically.

### The Verdict

**For our use case (WebSocket-heavy voice AI with bursty call patterns):**

| Factor | Fly.io | Railway | Render |
|--------|--------|---------|--------|
| WebSocket support | Excellent | Good | Good |
| Latency optimization | Best (edge) | Single region | Single region |
| Cost at low volume | Best (stop when idle) | Good ($20/mo min) | Fixed cost |
| Cost at high volume | Best (reservations) | Expensive | Expensive |
| Scale-to-zero | Yes (Machines) | No | No (paid tiers) |
| Multi-region | Yes | No | No |
| DX simplicity | Medium | Best | Good |
| Production readiness | High | High | Medium |

**Recommendation:** Fly.io is the clear winner for voice AI deployment. The Machines model (start on call, stop when done) with per-second billing and global edge deployment directly maps to our workload pattern. We can start a machine in us-east-1 for East Coast callers and another in us-west-1 for West Coast callers, reducing latency by 30-60ms. At 50 clients, the cost savings from scale-to-zero alone pay for the steeper learning curve.

**Migration path:** Start on Railway for the first 5 clients (fastest to ship). Migrate to Fly.io when we hit 10+ clients or when latency optimization becomes the priority.

---

## 7. Cost Optimization: Cheapest Production-Ready Voice AI Stack Per Minute

### Cost Breakdown Per Minute of Conversation

Assuming a typical voice AI call minute: ~15 seconds of caller speech, ~30 seconds of agent speech, ~15 seconds of silence/processing.

**Budget Stack (Production-Ready):**

| Component | Provider | Cost/min |
|-----------|----------|----------|
| STT | Deepgram Nova-2 | $0.0043 |
| LLM | GPT-4o-mini | ~$0.002-0.005 (varies by token usage) |
| TTS | ElevenLabs Flash (Scale tier) | $0.09 |
| Telephony | Twilio Voice | $0.014/min inbound |
| Infra | Fly.io (shared-cpu-1x) | ~$0.003 (prorated per call) |
| **Total** | | **~$0.11-0.12/min** |

**Mid-Tier Stack:**

| Component | Provider | Cost/min |
|-----------|----------|----------|
| STT | Deepgram Nova-2 | $0.0043 |
| LLM | GPT-4o (full) | ~$0.01-0.02 |
| TTS | ElevenLabs v2/v3 (Scale tier) | $0.18 |
| Telephony | Twilio Voice | $0.014/min |
| Infra | Fly.io (performance-1x) | ~$0.005 |
| **Total** | | **~$0.21-0.22/min** |

**Cheapest Possible (Still Production-Grade):**

| Component | Provider | Cost/min |
|-----------|----------|----------|
| STT | Deepgram Nova-2 | $0.0043 |
| LLM | Groq Llama 3.1 70B | ~$0.001 |
| TTS | Cartesia Sonic Flash | ~$0.03-0.05 (estimated from pricing tiers) |
| Telephony | Twilio Voice | $0.014/min |
| Infra | Fly.io (shared-cpu-1x) | ~$0.003 |
| **Total** | | **~$0.05-0.07/min** |

### Key Cost Levers

1. **TTS is the biggest cost.** It dominates 60-80% of the per-minute cost. ElevenLabs quality costs money. Cartesia is the best cost-quality tradeoff emerging.

2. **LLM choice matters less than you think.** GPT-4o-mini at $0.15/1M input tokens is so cheap that even verbose conversations cost fractions of a cent. The LLM is NOT the bottleneck.

3. **STT is basically free.** Deepgram at $0.0043/min is negligible.

4. **Twilio is a fixed cost.** $0.014/min inbound, $0.014/min outbound. Cannot optimize this.

5. **Infrastructure is negligible per call.** Even a $31/mo Fly.io performance machine handling 50 concurrent calls costs less than $0.01/min per call.

6. **Volume discounts are real.** ElevenLabs Business tier ($1,320/mo) drops TTS to $0.05-0.06/min for Flash. Deepgram Enterprise pricing goes below $0.003/min.

### Revenue vs Cost Modeling

| Scenario | Our Cost/min | Charge Client/min | Margin |
|----------|-------------|-------------------|--------|
| Budget stack, Budget price | $0.07 | $0.15 | 53% |
| Budget stack, Market price | $0.07 | $0.25 | 72% |
| Mid stack, Premium price | $0.22 | $0.50 | 56% |
| Budget stack, Flat monthly | $0.07 | $299/mo (est 1000 min) | 77% |

**The flat monthly model is most profitable.** Charge $199-$399/mo for "unlimited" (with a soft cap at, say, 2000 min/mo). Most small restaurants get 300-800 minutes/month. Our cost for 800 min at $0.07/min = $56/mo. Massive margin.

### Cost Optimization Strategies

1. **Cache common responses.** If 30% of calls ask about hours/location, pre-generate the TTS audio for these responses. Skip the LLM + TTS pipeline entirely for FAQ answers. This cuts cost by 30% on those calls.

2. **Use GPT-4o-mini, not GPT-4o.** For receptionist tasks (booking, FAQ, routing), mini is more than sufficient. Save the full model for complex conversations.

3. **Stream TTS in chunks.** Start playing TTS audio as soon as the first chunk arrives. Do not wait for the full response. This reduces perceived latency and also reduces wasted generation if the caller interrupts.

4. **Implement silence detection aggressively.** Stop STT processing during agent speech. No point transcribing silence or your own agent's voice (echo).

5. **Scale-to-zero on Fly.io.** Stop machines when no calls are active. For a restaurant that gets calls only during business hours (say 10am-10pm), this saves 50% of infra costs.

---

## Summary: Recommended Production Stack

### MVP Stack (Launch with 5-10 clients)

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Pipecat | Best pipeline orchestration, native Twilio, Python ecosystem |
| Telephony | Twilio | We already have the account, reliable, well-documented |
| STT | Deepgram Nova-2 | Fastest streaming, best accuracy, cheapest |
| LLM | GPT-4o-mini | Sufficient for receptionist tasks, cheap, fast |
| TTS | ElevenLabs Flash | Best quality at acceptable latency. Apply for Startup Grant. |
| Hosting | Railway | Ship fast, worry about optimization later |
| Database | PostgreSQL (Railway) | Tenant configs, call logs |
| Cache | Redis (Railway) | Hot tenant config cache |

**Estimated cost per minute:** ~$0.10-0.12

### Scale Stack (20-50 clients)

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Pipecat | Same, proven at this point |
| Telephony | Twilio | Same |
| STT | Deepgram Nova-2 | Same, negotiate volume pricing |
| LLM | GPT-4o-mini + GPT-4o fallback | Mini for standard calls, full model for complex |
| TTS | Cartesia Sonic-3 | 90ms TTFA, much cheaper than ElevenLabs at volume |
| Hosting | Fly.io (multi-region) | Edge deployment, scale-to-zero, per-second billing |
| Database | PostgreSQL (Fly.io or Supabase) | Same schema, better hosting |
| Cache | Redis (Upstash or Fly.io) | Serverless Redis for scale-to-zero compatibility |

**Estimated cost per minute:** ~$0.06-0.08

### Key Technical Risks and Mitigations

1. **Risk:** Deepgram outage kills all calls.
   **Mitigation:** Implement STT fallback to Google Cloud Speech or AssemblyAI. Pipecat supports hot-swapping.

2. **Risk:** ElevenLabs/Cartesia latency spike makes conversation awkward.
   **Mitigation:** Set aggressive TTS timeout (2 seconds). Fall back to a cached "I'm sorry, can you repeat that?" response.

3. **Risk:** LLM hallucinates booking confirmation.
   **Mitigation:** NEVER let the LLM claim a booking is confirmed without a successful API response from the booking system. Use structured tool calling with explicit success/failure handling.

4. **Risk:** WebSocket drops mid-call.
   **Mitigation:** Build reconnection logic. Use Twilio's call status webhook to detect dropped connections and attempt re-establishment.

5. **Risk:** Multi-tenant config leak (one client hears another client's greeting).
   **Mitigation:** Tenant isolation is by phone number lookup, which is deterministic. Add explicit tenant_id validation at every pipeline stage. Log tenant_id with every action for audit trail.

---

## Action Items for Build Phase

1. **Immediate:** Set up Pipecat with Twilio serializer. Build hello-world voice agent that answers a call and responds to "What are your hours?"
2. **Week 1:** Integrate Deepgram Nova-2 STT + GPT-4o-mini + ElevenLabs Flash TTS into the pipeline. Measure end-to-end latency.
3. **Week 1:** Apply for ElevenLabs Startup Grant (12 months free, 33M characters).
4. **Week 2:** Build multi-tenant config system (Postgres + Redis). Test with 3 different "restaurant" configs on 3 different Twilio numbers.
5. **Week 2:** Implement Pipecat Flows for a booking conversation: greeting -> ask for details -> check availability (mock API) -> confirm/suggest alternative.
6. **Week 3:** Apply for SevenRooms API access. Build BookingAdapter abstraction with Calendly as first real integration.
7. **Week 3:** Evaluate Cartesia Sonic-3 as TTS alternative. A/B test quality against ElevenLabs Flash.
8. **Week 4:** Deploy to Railway for initial clients. Plan Fly.io migration for month 2.
