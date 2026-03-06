# GHL Zero-Latency Voice AI Configuration Guide
## ClawOps - Minimizing Response Delay in Voice AI Calls

**Last Updated:** March 5, 2026
**Authors:** Jordan (CRO) + Ethan (CTO)
**Status:** Research-backed, ready for implementation and testing

---

## Table of Contents

1. [Understanding Voice AI Latency](#1-understanding-voice-ai-latency)
2. [LLM Selection for Speed](#2-llm-selection-for-speed)
3. [Voice Provider Comparison](#3-voice-provider-comparison)
4. [Prompt Engineering for Speed](#4-prompt-engineering-for-speed)
5. [GHL Configuration Settings](#5-ghl-configuration-settings)
6. [Telephony Optimization](#6-telephony-optimization)
7. [Filler Strategies for Processing Time](#7-filler-strategies-for-processing-time)
8. [Advanced Latency Reduction](#8-advanced-latency-reduction)
9. [Benchmarking and Testing Protocol](#9-benchmarking-and-testing-protocol)

---

## 1. Understanding Voice AI Latency

### What Happens During a Voice AI Call

Every voice AI conversation follows this chain for each turn:

```
Caller speaks
    |
    v
Audio captured by telephony provider
    |
    v
Speech-to-Text (STT) converts audio to text (~200-500ms)
    |
    v
Text sent to LLM for processing (~300-2000ms depending on model + prompt size)
    |
    v
LLM response generated
    |
    v
Text-to-Speech (TTS) converts response to audio (~200-800ms)
    |
    v
Audio streamed back to caller
```

**Total round-trip latency:** Typically 700ms to 3+ seconds. Anything over 1.5 seconds feels noticeably slow to callers. Anything under 800ms feels like a real conversation.

### Why Latency Kills Conversion

From Reddit r/gohighlevel user reports:
- AI that takes 2-3 seconds to respond gets hung up on frequently
- One agency reported that reducing latency from ~2s to ~1s increased call completion rates by roughly 40%
- A poster who built a custom system (VAPI + N8N) specifically cited "near-zero latency" as the key differentiator over GHL's native voice

A commenter from r/Entrepreneur noted: "Keep round trip under about 300ms or the call feels sluggish." While 300ms is aspirational for a full voice AI pipeline, this sets the standard. Every millisecond counts.

### Current ClawOps Setup Analysis

- **LLM:** GPT 5.1 ($0.016/min LLM)
- **Voice:** Archer (ElevenLabs-class voice, British)
- **Estimated current latency:** Likely 1.5-2.5 seconds per turn (needs actual measurement)

**Potential improvement areas (ranked by impact):**
1. LLM choice (biggest lever)
2. Prompt size (second biggest lever)
3. Voice provider (third)
4. Filler strategies (masks remaining latency)

---

## 2. LLM Selection for Speed

### LLM Speed Comparison for Voice AI

| LLM | Typical Response Time (first token) | Full Response Time | Quality | Cost/Min | Best For |
|-----|-------------------------------------|-------------------|---------|----------|----------|
| GPT 4o-mini | ~200-400ms | ~500-800ms | Good for simple tasks | ~$0.004 | Simple routing, FAQ, basic booking |
| GPT 4o | ~300-600ms | ~600-1200ms | Very good | ~$0.008-0.012 | Best balance for voice AI |
| GPT 5.1 | ~400-800ms | ~800-1500ms | Excellent | $0.016 | Complex conversations |
| Claude Haiku (if available) | ~200-400ms | ~400-800ms | Good | Varies | Fast responses |
| Claude Sonnet (if available) | ~300-600ms | ~600-1200ms | Very good | Varies | Quality + speed balance |

**NOTE:** These are estimated ranges based on community reports and general model performance data. Actual latency depends on GHL's infrastructure, current server load, and streaming configuration. Always benchmark with real calls.

### Recommendation: Test GPT 4o First

GPT 5.1 is overkill for phone conversations where responses should be 1-2 sentences. The extra quality is imperceptible when spoken aloud, but the extra latency is very noticeable.

**Switching path:**
1. Go to your GHL Location > Conversations > Voice AI > Agent Settings
2. Find the LLM configuration section
3. Switch from GPT 5.1 to GPT 4o
4. Test with 5-10 calls
5. If quality is acceptable, leave it on GPT 4o
6. Monitor for 1 week before confirming

**Cost impact:** Switching from GPT 5.1 ($0.016/min LLM) to GPT 4o could save 25-50% on LLM costs while improving speed.

### When to Use Faster/Simpler Models

For calls that follow a very predictable pattern (missed call callback, simple appointment booking with no complex FAQ), GPT 4o-mini might be sufficient. Test on a per-use-case basis.

---

## 3. Voice Provider Comparison

### GHL Voice Provider Options

GHL uses text-to-speech (TTS) providers to convert LLM responses into spoken audio. The choice of provider directly affects:
- How natural the voice sounds
- How fast the audio is generated (TTS latency)
- Cost per minute

| Provider | Naturalness | Latency | Cost | Notes |
|----------|-------------|---------|------|-------|
| GHL Native/Default | Good | Fastest (built-in) | Included in base rate | Best latency, decent quality |
| ElevenLabs | Excellent | Moderate-High | Premium | Most natural, but adds latency |
| PlayHT | Good-Very Good | Moderate | Moderate | Decent middle ground |
| Amazon Polly (if available) | Decent | Fast | Low | Quick but less natural |

### Latency Impact by Provider

ElevenLabs voices sound the most human, but they add **200-600ms** of additional latency per response compared to faster providers. This is because:
- Audio generation is more compute-intensive for high-quality voices
- Streaming may have additional buffering
- Network round-trip to ElevenLabs servers adds overhead

**For latency-sensitive deployments:** Test GHL's native/fastest voice option first. If it sounds acceptable, the latency savings compound over every turn of the conversation.

### Recommendation for ClawOps

1. **Test switching from Archer to a native GHL American English voice** (addresses both the accent mismatch for home service and potential latency improvement)
2. **Measure the actual latency difference** between current setup and native voice
3. If the native voice is too robotic, try PlayHT as a middle ground before going back to ElevenLabs-quality voices
4. Pick the fastest voice that still sounds acceptably natural on phone audio (phone audio quality is lower than demo clips, so ultra-premium voices are less necessary)

---

## 4. Prompt Engineering for Speed

### How Prompt Size Affects Latency

The LLM must process your entire system prompt plus the conversation history on every single turn. A 5,000-token prompt takes measurably longer to process than a 500-token prompt.

**Impact estimation:**
- 500-token prompt: baseline
- 1,500-token prompt: +100-200ms per turn
- 5,000-token prompt: +300-500ms per turn
- 10,000+ token prompt: +500-1000ms per turn

These numbers vary by model and server load, but the principle is consistent: smaller prompts produce faster responses.

### Prompt Compression Techniques

**1. Use GHL's Knowledge Base / Custom Values instead of prompt stuffing**

Bad (in prompt):
```
Our business hours are Monday through Friday 8am to 5pm, Saturday 9am to 1pm, and we are closed on Sunday. We offer HVAC repair, HVAC installation, duct cleaning, thermostat installation, and maintenance plans. Our service area covers Cincinnati, Northern Kentucky, and Southeast Indiana within 30 miles of downtown.
```

Better (in prompt):
```
Check the business knowledge base for hours, services, and service area details.
```

Then store that information in GHL's custom values or knowledge base where the AI can retrieve it as needed without processing it every turn.

**2. Eliminate redundant instructions**

Bad:
```
You are a friendly receptionist. Be friendly when talking to callers. Make sure to maintain a friendly tone throughout the conversation. Your personality should be warm and friendly.
```

Good:
```
You are a friendly, warm receptionist.
```

**3. Use the shortest possible scenario descriptions**

Bad:
```
When a customer calls and tells you that they have an emergency situation such as a gas leak, a burst pipe, flooding in their home, or any other urgent issue that requires immediate attention, you should prioritize getting them connected with our emergency service team as quickly as possible.
```

Good:
```
Emergency (gas, flooding, burst pipe): Transfer immediately. Say "Let me get our emergency team right now."
```

**4. Remove instructions the AI already follows by default**

You do not need to tell the AI to "be polite" or "answer questions." It does that by default. Only add instructions that override default behavior or handle specific edge cases.

### Target: Under 800 Tokens

Strip your prompt to the absolute minimum that produces correct behavior. Every instruction should earn its place by preventing a specific failure mode you have actually observed in testing.

---

## 5. GHL Configuration Settings

### Settings That Affect Latency

**Path:** GHL Location > Conversations > Voice AI > Agent Configuration

**1. Streaming (if available)**
- Enable streaming/chunked responses if GHL offers this option
- Streaming sends audio to the caller as it is generated rather than waiting for the full response
- This can cut perceived latency by 30-50%

**2. Silence Detection / End-of-Speech Timeout**
- This controls how long the system waits after the caller stops talking before processing
- Too short: AI cuts off the caller mid-sentence
- Too long: Adds unnecessary delay
- **Recommended:** 500-800ms (test and adjust based on call recordings)

**3. Barge-In / Interruption Handling**
- Enable barge-in so callers can interrupt the AI
- This prevents the frustrating experience of waiting for a long AI response to finish
- When the caller speaks, the AI should stop and listen

**4. First Message / Greeting**
- Use a static greeting instead of an LLM-generated one
- The greeting is the first impression; generating it with the LLM adds unnecessary latency to the start of the call
- **Set the greeting as a fixed message:** "Hey, thanks for calling [Business Name], this is Jordan. How can I help you?"
- This delivers instantly without LLM processing

**5. Maximum Response Length**
- If available, cap response tokens at 100-150
- Forces the AI to be concise and reduces generation time

### Settings to Verify

- **Phone number configuration:** Make sure the phone number is properly configured with no unnecessary routing hops
- **Call recording:** Recording itself does not add latency, but verify
- **Webhook timeout:** If your workflow fires webhooks mid-call, ensure they have tight timeouts (3-5 seconds max)

---

## 6. Telephony Optimization

### GHL's Telephony Stack

GHL uses Twilio as its telephony backbone (or LC Phone, which is built on Twilio). This means:
- Call quality and latency are partially determined by Twilio's infrastructure
- SIP trunking optimization is handled at the GHL/Twilio level, not directly configurable
- Phone number reputation affects call connection rates but not voice AI latency

### What You Can Control

**1. Use a local number or recognized toll-free number**
- Your current number (+1 888-457-8980) is toll-free, which is good for legitimacy
- Some users report marginally faster connection times with local numbers
- For home service businesses, a local area code (e.g., 513 for Cincinnati) can also improve answer rates

**2. A2P 10DLC Registration (for SMS follow-ups)**
- Not directly related to voice latency but critical for the post-call workflow
- Unregistered numbers have SMS silently filtered by carriers
- Go to Settings > Phone Numbers > A2P and verify status

**3. Minimize Workflow Actions During Active Calls**
- Do not trigger complex workflow actions mid-call (e.g., webhook lookups, CRM queries)
- Perform all data lookups and integrations AFTER the call ends
- Mid-call actions add latency and risk the AI stalling

### SIP Trunking Considerations

If you ever outgrow GHL's native telephony or want more control:
- Direct Twilio SIP trunk with GHL can sometimes reduce overhead
- Custom VAPI or Retell integrations bypass GHL's voice pipeline entirely (as the Reddit user who built the custom system demonstrated)
- These are advanced options that make sense only if GHL's native latency is unacceptable after all other optimizations

---

## 7. Filler Strategies for Processing Time

### The Problem

Even with the fastest LLM and voice provider, there will be moments when the AI needs a beat to process. Dead silence during this time feels wrong to callers.

### Solution: Programmatic Fillers

Instruct the AI to use brief, natural-sounding filler phrases when it needs processing time:

```
FILLER RULES:
When you need to look something up or think about a response:
- Use brief fillers like "Let me check on that..." or "One sec..." or "Hmm, let me see..."
- Never sit in silence for more than 1 second
- After the filler, provide your actual answer
- Don't overuse the same filler; rotate between several
```

### Filler Phrases That Work for Home Service

| Situation | Filler Phrase |
|-----------|--------------|
| Looking up availability | "Let me check what we've got open..." |
| Complex question | "Good question, let me think about that..." |
| Need to process a long caller statement | "Got it, got it..." |
| Caller gave lots of details | "Okay, so let me make sure I've got this right..." |
| Anything else | "One sec..." / "Bear with me..." / "Alright..." |

### Why This Matters

Fillers serve two purposes:
1. **Mask latency:** The caller hears a response immediately, even if the substantive answer takes another second
2. **Sound human:** Real people say "um," "let me think," and "hang on" all the time. An AI that does this feels more natural.

### Implementation

Add filler phrases to your prompt's RULES section:
```
- If processing takes more than a moment, use a natural filler like "Let me check on that" before responding with your answer. Never leave more than 1 second of silence.
```

---

## 8. Advanced Latency Reduction

### Technique 1: Pre-Computed Responses

For the most common caller intents, provide exact responses in the prompt so the AI can return them almost instantly instead of generating from scratch:

```
QUICK RESPONSES (use these exact phrases when applicable):
- Hours question: "We're open Monday through Friday, 8 to 5, and Saturday mornings 9 to 1."
- Location question: "We're based in [City] and cover about a 30 mile radius."
- Emergency: "That sounds urgent. Let me get you to our emergency team right now."
- Pricing: "Every job's a little different. We do free estimates though, want me to set one up?"
```

These pre-baked responses bypass most of the LLM generation time because the AI recognizes the pattern and returns the cached phrase.

### Technique 2: Conversation Flow Optimization

Structure the conversation to minimize back-and-forth:

```
INFORMATION GATHERING:
When booking, collect all info in as few turns as possible:
1. "Can I get your name?" [wait]
2. "And a good phone number for you?" [wait]  
3. "What's the address where you need service?" [wait]
4. "And what's going on with your [system/plumbing/roof]?" [wait]
5. Confirm and book.

Do not ask one question, get an answer, then ask the next. If the caller volunteers multiple pieces of info at once, acknowledge them all and only ask for what's missing.
```

Fewer turns = fewer latency cycles = faster call completion.

### Technique 3: Avoid Complex Logic in Prompts

Every conditional or complex instruction in your prompt adds processing time:

Bad (complex logic):
```
If the caller is an existing customer AND they have an active service plan AND their issue falls under covered maintenance, inform them that the visit will be covered. If they are an existing customer but their plan has expired, mention the renewal option. If they are new, skip all plan-related discussion.
```

Good (simple fallback):
```
If the caller mentions a service plan, say: "Let me have our team verify your plan details and we'll make sure you're taken care of. For now, let's get the appointment on the books."
```

The simplified version is faster to process and handles 95% of cases correctly.

### Technique 4: Static Greeting

Never generate the greeting dynamically. Set it as a fixed, pre-recorded or pre-typed message:

```
GREETING (static, do not generate):
"Hey, thanks for calling [Business Name], this is Jordan. How can I help you today?"
```

This eliminates the initial LLM call for the greeting, giving the caller an instant first response and setting a fast pace for the conversation.

---

## 9. Benchmarking and Testing Protocol

### How to Measure Latency

**Method 1: Manual Timing**
1. Call your voice AI number
2. Ask a question
3. Time the gap between when you stop speaking and when the AI starts responding
4. Repeat for 10 different questions
5. Calculate average

**Method 2: Call Recording Analysis**
1. Record calls (GHL does this automatically)
2. Open the recording in an audio editor (Audacity or similar)
3. Measure the silence gap between caller speech end and AI speech start
4. This gives you precise millisecond measurements

### Benchmarking Process

**Phase 1: Baseline (Current Setup)**
1. Make 10 test calls with current GPT 5.1 + Archer voice
2. Record average latency per turn
3. Note call completion rate and subjective quality

**Phase 2: LLM Swap**
1. Switch to GPT 4o, keep everything else the same
2. Make 10 test calls
3. Compare latency and quality vs. baseline

**Phase 3: Voice Swap**
1. Keep GPT 4o, switch to fastest available American voice
2. Make 10 test calls
3. Compare against Phase 2

**Phase 4: Prompt Optimization**
1. Trim prompt to under 800 tokens
2. Add static greeting and pre-computed responses
3. Make 10 test calls
4. Compare against Phase 3

**Phase 5: Production Monitoring**
1. Deploy the winning configuration
2. Monitor first 50 real calls
3. Track: latency, completion rate, booking rate, customer complaints

### Target Latency Goals

| Metric | Current (est.) | Target | Stretch Goal |
|--------|---------------|--------|-------------|
| First response (greeting) | 1-2s | <0.5s (static) | Instant (pre-recorded) |
| Average turn latency | 1.5-2.5s | <1.2s | <0.8s |
| Complex question latency | 2-3s | <1.5s | <1.2s |
| Caller perception | "Talking to a bot" | "Pretty natural" | "Is that a real person?" |

---

## Quick Reference: Latency Reduction Checklist

- [ ] Switch LLM from GPT 5.1 to GPT 4o (or test 4o-mini for simple flows)
- [ ] Compress system prompt to under 800 tokens
- [ ] Set static greeting (not LLM-generated)
- [ ] Test fastest available American English voice
- [ ] Add filler phrases to prompt for processing moments
- [ ] Pre-compute responses for top 5 most common questions
- [ ] Cap response length to 100-150 tokens max
- [ ] Enable streaming if available in GHL settings
- [ ] Set silence detection to 500-800ms
- [ ] Enable barge-in / interruption support
- [ ] Remove all mid-call workflow actions
- [ ] Benchmark with 10+ test calls after each change
- [ ] Move FAQ content from prompt into GHL knowledge base

---

## Sources and References

- Reddit r/gohighlevel: "Built an AI voice calling system that actually works (unlike GHL's)" - User reported GHL native voice as "terrible" and "robotic," built custom VAPI system with "near-zero latency"
- Reddit r/gohighlevel: "Using 68k tokens for my voice AI prompt" - Community discussion on prompt size impact
- Reddit r/gohighlevel: "Just added an AI voice agent to a few GHL client accounts" - Agency reported "near-zero latency" with alternative provider, noted other AI dialers "take 2-3 seconds to respond, which kills conversion"
- Reddit r/gohighlevel: "10 GHL mistakes that cost me real money" - Workflow timing issues with Voice AI tags
- Reddit r/Entrepreneur: "Why is it so difficult to sell AI voice agent services" - Technical guidance: "treat latency like a budget and keep round trip under about 300ms"
- GHL Help Center: Voice AI Agent documentation and configuration guides
- Multiple agency owner reports on call quality vs. latency tradeoffs

---

*Latency values and provider options may change as GHL updates their platform. Always benchmark with real calls on your specific setup. Numbers cited here are estimates based on community reports and general model performance data, not official GHL benchmarks.*
