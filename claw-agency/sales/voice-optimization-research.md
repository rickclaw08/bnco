# VAPI Voice Optimization Research - Cold Calling Blue-Collar Contractors

**Last Updated:** 2026-03-20
**Target Audience:** HVAC, Plumbing, Electrical, Roofing contractors (owners, office managers)
**Current Voice:** Elliot (VAPI native provider) on all 3 assistants

---

## Table of Contents

1. [Current Setup Analysis](#current-setup-analysis)
2. [Voice Psychology for Blue-Collar B2B Sales](#voice-psychology-for-blue-collar-b2b-sales)
3. [VAPI Voice Providers - Complete Inventory](#vapi-voice-providers---complete-inventory)
4. [Top 5 Recommended Voices](#top-5-recommended-voices)
5. [Recommended Voice Settings](#recommended-voice-settings)
6. [A/B Testing Framework](#ab-testing-framework)
7. [Implementation Guide](#implementation-guide)

---

## Current Setup Analysis

### Current Configuration

All 3 assistants use identical voice config:

| Assistant | Provider | Voice ID | Speed |
|-----------|----------|----------|-------|
| ClawOps Demo - HVAC Receptionist | vapi | Elliot | default |
| ClawOps AI Receptionist | vapi | Elliot | default |
| Riley | vapi | Elliot | default |

### Elliot - Pros

- **Low latency:** VAPI native voices have the lowest latency since they don't call external TTS APIs
- **No extra cost:** No additional per-character charges from ElevenLabs/PlayHT/etc.
- **Decent clarity:** Clean articulation, professional tone
- **Consistent:** No voice instability or artifacts

### Elliot - Cons

- **Too polished/corporate:** Sounds like a tech company assistant, not a contractor's office
- **Lacks warmth:** Doesn't build rapport quickly - blue-collar owners can smell "corporate robot" instantly
- **No regional character:** Completely neutral accent feels impersonal for trades audiences
- **Mid-range pitch:** Not deep enough to project authority/trust with male contractor audiences (70%+ of decision-makers in trades)
- **Default speed may be too slow:** Contractors are busy, moving between jobs - they want quick, direct communication
- **Generic:** Every VAPI user who doesn't change defaults uses Elliot - prospects may have already been burned by other AI callers using the same voice

---

## Voice Psychology for Blue-Collar B2B Sales

### What Research Says

**The 7-38-55 Rule (Mehrabian):** Only 7% of communication impact comes from words. 38% comes from tone of voice. 55% from body language. On phone calls where body language is absent, voice tone accounts for roughly 84% of the impression.

**Key findings relevant to cold calling contractors:**

1. **Deeper voices signal competence and authority.** Multiple studies (Journal of Experimental Psychology, 2012; Puts et al., 2007) show lower-pitched voices are perceived as more trustworthy, dominant, and competent. In a B2B context where you're selling to business owners who value no-BS directness, a deeper male voice outperforms mid-range or high-pitched alternatives.

2. **Slightly faster than average pace converts better.** Per Close.com's cold calling research and Gong.io call analytics: speaking at a pace slightly above average (roughly 10-15% faster) signals confidence, competence, and respect for the listener's time. Slow talkers get hung up on. But too fast sounds desperate or scammy.

3. **Warmth beats polish.** Tradespeople build relationships on trust and follow-through, not slick presentations. A voice that sounds like "a guy who's been around" beats one that sounds like "a call center." Slight warmth, conversational tone, and natural cadence matter more than perfect diction.

4. **Regional familiarity reduces resistance.** A slight Southern or neutral American accent performs better for trades in the Southeast/Midwest than a perfectly neutral corporate voice. However, going too heavy on regional accents risks sounding unprofessional. Aim for "neutral American with a touch of warmth."

5. **Confidence without aggression.** Contractors are alpha personalities. They respect directness and confidence but instantly resist being "sold to." The voice needs to sound like a peer, not a subordinate and not a pushy salesperson.

### Blue-Collar Contractor Voice Profile (Ideal)

- **Gender:** Male (matches 70%+ of contractor decision-makers - mirror/match principle)
- **Pitch:** Low-to-mid baritone range
- **Pace:** Slightly above average (1.05-1.15x)
- **Warmth:** High - conversational, not robotic
- **Formality:** Low-to-mid - "professional friendly," not corporate
- **Energy:** Confident and direct without being aggressive
- **Accent:** Neutral American with slight warmth (think: local news anchor, not NPR)

---

## VAPI Voice Providers - Complete Inventory

VAPI supports **18 voice providers** as of March 2026:

| # | Provider | Notable Male Voices for Sales | Latency | Cost Impact |
|---|----------|-------------------------------|---------|-------------|
| 1 | **VAPI (native)** | Elliot, Cole, Harry, Spencer, Nico, Dan, Leo, Zac, Rohan, Godfrey, Kai, Neil, Sagar | Lowest | Included |
| 2 | **ElevenLabs** | steve, phillip, joseph, ryan, drew, paul, mark, burt, mrb | Low-Med | $$$ |
| 3 | **Cartesia** | Any voice ID (Sonic 3 model) | Low | $$ |
| 4 | **Deepgram** | orion, arcas, perseus, angus, orpheus, helios, zeus, apollo, atlas, hermes, hyperion, mars, neptune, odysseus, janus, jupiter, pluto, saturn, draco, nestor, sirio, alvaro, javier | Low | $$ |
| 5 | **PlayHT** | will, chris, matt, jack, davis, michael | Med | $$ |
| 6 | **OpenAI** | echo, onyx, cedar, alloy, fable | Med | $$ |
| 7 | **RimeAI** | elliot, armon, colin, geoff, gerald, hank, joe, juan, kendrick, kenneth, kevin, nicholas, nyles, phil, rex, rick, rob, rodney, rohan, rosco, seth, stan, tj, tyler | Low | $$ |
| 8 | **LMNT** | ansel, brandon, caleb, cassian, dalton, daniel, dustin, evander, huxley, james, lucas, magnus, miles, nathan, noah, oliver, ryan, terrence, tyler, warrick, zain, zeke | Med | $$ |
| 9 | **Hume** | Custom via Octave/Octave2 model | Med | $$ |
| 10 | **Azure** | andrew, brian | Med | $ |
| 11 | **WellSaid** | Custom voice IDs (Caruso model) | Med | $$ |
| 12 | **SmallestAI** | arman, james, william, raj, raman, aarav, raghav, saurabh | Low | $ |
| 13 | **Neuphonic** | Custom voice IDs | Med | $$ |
| 14 | **Sesame** | Custom (csm-1b model) | Med | $$ |
| 15 | **Inworld** | Alex, Craig, Dennis, Edward, Mark, Ronald, Shaun, Theodore, Timothy, Clive, Carter, Blake | Med | $$ |
| 16 | **Minimax** | Custom voice IDs | Med | $ |
| 17 | **Tavus** | Video-focused, less relevant | High | $$$ |
| 18 | **Custom** | BYO via server endpoint | Varies | Varies |

### Provider Selection Criteria for Cold Calling

For outbound cold calling, we care about:

1. **Latency first** - any delay and the contractor hangs up thinking it's a robocall
2. **Naturalness** - must pass the "human test" for at least the first 10-15 seconds
3. **Cost** - calling 100+ prospects/day adds up fast
4. **Tunability** - can we adjust speed, warmth, stability?

**Priority order for evaluation:** VAPI native > Cartesia > Deepgram Aura-2 > ElevenLabs > OpenAI > PlayHT

---

## Top 5 Recommended Voices

### #1: VAPI Native - "Cole"

**Why:** Deep, confident male voice. More authoritative than Elliot. Sounds like a guy who runs an office, not a tech product. Low latency since it's VAPI native - critical for cold calling where any pause = hang-up.

- Provider: `vapi`
- Voice ID: `Cole`
- Recommended speed: `1.1`
- Cost: Included (no extra TTS charges)
- Latency: Lowest possible

**Best for:** Primary cold calling voice. Test immediately.

### #2: VAPI Native - "Dan"

**Why:** Casual, warm, direct. Shorter name suggests a more "everyman" feel. Dan sounds like the kind of name a contractor would trust - it's not fancy. Good for the "hey, I'm just a regular guy helping your business" approach.

- Provider: `vapi`
- Voice ID: `Dan`
- Recommended speed: `1.05`
- Cost: Included
- Latency: Lowest

**Best for:** Softer approach, warmer opener. Good for follow-up calls.

### #3: Deepgram Aura-2 - "Orion"

**Why:** Deepgram's Aura-2 is the fastest external TTS on the market. Orion is a deep, authoritative male voice. The name won't matter (prospects don't see it), but the voice quality is excellent for phone calls. Very natural-sounding with minimal latency overhead.

- Provider: `deepgram`
- Voice ID: `orion`
- Model: `aura-2`
- Cost: Moderate (Deepgram pricing)
- Latency: Low (Deepgram is optimized for real-time)

**Best for:** If VAPI native voices don't cut it on naturalness, this is the next stop.

### #4: ElevenLabs - "steve" or "drew"

**Why:** ElevenLabs has the most natural-sounding voices in the industry. "Steve" is a warm, confident male voice. "Drew" is direct and slightly deeper. Both sound extremely human. The trade-off is higher latency and cost, but if conversion rate jumps 20%+, the ROI is there.

- Provider: `elevenlabs`
- Voice ID: `steve` or `drew`
- Model: `eleven_flash_v2_5` (lowest latency ElevenLabs model)
- Stability: `0.6` (slightly less stable = more natural variation)
- Similarity Boost: `0.75`
- Speed: `1.1`
- Cost: Higher ($$$)
- Latency: Medium (use flash model to minimize)

**Best for:** Premium quality when budget allows. Best for high-value prospects where conversion matters more than cost-per-call.

### #5: OpenAI - "onyx"

**Why:** Onyx is OpenAI's deepest male voice. Authoritative, clear, and professional. The `gpt-4o-mini-tts` model is their newest and fastest. Unique advantage: OpenAI TTS supports `instructions` parameter, so you can guide the voice style with text like "speak in a warm, confident, conversational tone."

- Provider: `openai`
- Voice ID: `onyx`
- Model: `gpt-4o-mini-tts`
- Instructions: `"Speak in a warm, confident, direct tone. You are calling a busy contractor. Be respectful of their time. Sound like a knowledgeable professional, not a salesperson."`
- Speed: `1.1`
- Cost: Moderate
- Latency: Medium

**Best for:** The `instructions` parameter is a unique differentiator. If the voice style can be tuned via text prompt, this opens up powerful customization without switching voices.

---

## Recommended Voice Settings

### Speed

| Context | Speed Setting | Rationale |
|---------|--------------|-----------|
| Cold call opener | 1.1 - 1.15 | Fast enough to sound confident, not so fast it sounds rushed |
| Pitch/value prop | 1.05 - 1.1 | Slightly slower for emphasis on key points |
| Scheduling/closing | 1.0 | Natural pace when handling logistics |

**On VAPI, speed is set in the voice config:** `"speed": 1.1`

### ElevenLabs-Specific Settings

If using ElevenLabs:

| Parameter | Recommended | Why |
|-----------|-------------|-----|
| stability | 0.55 - 0.65 | Lower stability = more natural variation. Too high sounds robotic. |
| similarityBoost | 0.70 - 0.80 | Keep it close to the target voice without being too rigid |
| style | 0.3 - 0.5 | Moderate style exaggeration adds warmth |
| useSpeakerBoost | true | Improves clarity on phone lines |
| model | eleven_flash_v2_5 | Fastest model - critical for cold calling |

### OpenAI-Specific Settings

| Parameter | Recommended | Why |
|-----------|-------------|-----|
| model | gpt-4o-mini-tts | Lowest latency OpenAI model |
| instructions | See #5 above | Unique ability to style-guide the voice |
| speed | 1.1 | Slightly above natural |

### PlayHT-Specific Settings

If testing PlayHT:

| Parameter | Recommended | Why |
|-----------|-------------|-----|
| emotion | male_happy | Warm, approachable - not angry or sad |
| temperature | 0.7 | Some variation keeps it natural |
| model | Play3.0-mini | Latest, lowest latency |

---

## A/B Testing Framework

### Phase 1: Quick Screen (Week 1)

Run 20-30 calls per voice to get directional data.

**Test Group A (Control):** Elliot (current) - VAPI native
**Test Group B:** Cole - VAPI native
**Test Group C:** Dan - VAPI native

**Why start with VAPI native:** No cost difference, no latency difference. Pure voice comparison.

**Metrics to track:**

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Pick-up rate | Calls answered / calls dialed | Baseline (voice doesn't affect this) |
| First 10-second survival | % who don't hang up in first 10s | > 60% |
| 30-second engagement | % still on call at 30s | > 40% |
| Appointment set rate | Meetings booked / calls answered | > 5% |
| Call duration (average) | Total talk time | > 45 seconds |
| "Are you a robot?" rate | Times prospect asks if AI | < 15% |

### Phase 2: Provider Test (Week 2)

Take the best VAPI native voice from Phase 1, then test against external providers.

**Test Group D:** Winner from Phase 1
**Test Group E:** Deepgram Aura-2 "orion"
**Test Group F:** ElevenLabs "steve" (flash model)

### Phase 3: Settings Optimization (Week 3)

Take the winning voice/provider and optimize settings.

- Test speed: 1.0 vs 1.1 vs 1.15
- Test ElevenLabs stability: 0.5 vs 0.65 vs 0.8 (if ElevenLabs won)
- Test OpenAI instructions variations (if OpenAI won)

### How to A/B Test on VAPI

**Method 1: Multiple Assistants**

Create duplicate assistants with different voice configs. Route calls to different assistants based on a round-robin or random selection in your campaign logic.

```json
// Assistant A - Control (Elliot)
{
  "voice": {
    "provider": "vapi",
    "voiceId": "Elliot"
  }
}

// Assistant B - Test (Cole)
{
  "voice": {
    "provider": "vapi",
    "voiceId": "Cole",
    "speed": 1.1
  }
}
```

**Method 2: Campaign-Level Split**

If using VAPI Campaigns, create separate campaigns per voice variant. Split your contact list evenly.

**Method 3: Assistant Overrides on Call Creation**

Use the `assistantOverrides` parameter when creating calls via API to override the voice on a per-call basis:

```json
POST https://api.vapi.ai/call
{
  "assistantId": "your-assistant-id",
  "assistantOverrides": {
    "voice": {
      "provider": "vapi",
      "voiceId": "Cole",
      "speed": 1.1
    }
  },
  "customer": {
    "number": "+1234567890"
  }
}
```

This is the cleanest approach - same assistant, same prompt, same tools, just different voice per call. Tag calls with metadata to track which voice variant was used.

### Tracking Results

Use VAPI's Analytics API or pull call data to compare:

```bash
# Get all calls and analyze by voice variant
curl -s "https://api.vapi.ai/call?limit=100" \
  -H "Authorization: Bearer $VAPI_API_KEY" | \
  python3 -c "
import json, sys
calls = json.load(sys.stdin)
for c in calls:
    voice = c.get('assistant',{}).get('voice',{}).get('voiceId','unknown')
    duration = c.get('duration', 0)
    ended = c.get('endedReason','unknown')
    print(f'{voice} | {duration}s | {ended}')
"
```

---

## Implementation Guide

### Quick Start - Immediate Action

1. **Update Riley (cold caller) to Cole with speed 1.1:**

```bash
curl -X PATCH "https://api.vapi.ai/assistant/ac3421e6-7c34-4bbe-b4d5-e76803b0d679" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "voice": {
      "provider": "vapi",
      "voiceId": "Cole",
      "speed": 1.1
    }
  }'
```

2. **Keep the receptionist assistants on Elliot** (different use case - inbound calls where warmth matters less than professionalism).

3. **Start tracking call metrics** before and after the voice change.

### Voices NOT to Use for Cold Calling Contractors

- **Female voices:** Not for this specific audience. Mirror/match principle says match the decision-maker demographic.
- **High-pitched male voices:** Signals youth/inexperience. Contractors want to talk to someone who sounds established.
- **Overly smooth/polished voices:** "Radio DJ" voices trigger sales resistance instantly.
- **Accented voices (non-American):** For US contractors, any non-American accent adds friction.
- **Default Elliot:** Everyone uses it. It's the "Hello, I'm an AI" voice at this point.

### Cost Comparison (Estimated per 1,000 calls, ~2 min avg)

| Provider | Approx. Cost per 1K Calls | Notes |
|----------|---------------------------|-------|
| VAPI Native | $0 extra (included in VAPI plan) | Best ROI if quality is sufficient |
| Deepgram Aura-2 | ~$2-5 | Very competitive |
| Cartesia Sonic 3 | ~$3-8 | Good quality/cost ratio |
| OpenAI gpt-4o-mini-tts | ~$5-15 | Mid-range |
| ElevenLabs Flash | ~$10-30 | Premium pricing |
| PlayHT Play3.0-mini | ~$5-15 | Mid-range |

*Costs are approximate and depend on plan tier and character count.*

---

## Summary - Action Items

1. **Immediate:** Switch Riley to "Cole" at speed 1.1 (zero cost, zero risk)
2. **This week:** Run 30 calls with Cole, 30 with Dan, compare to Elliot baseline
3. **Next week:** Test Deepgram "orion" and ElevenLabs "steve" against the VAPI winner
4. **Week 3:** Optimize speed/settings on the winning voice
5. **Ongoing:** Track "robot detection rate" and first-10-second survival as primary KPIs

The single biggest improvement will be moving off Elliot. It's the "default AI voice" that every VAPI user starts with. Contractors who've been called by other AI dialers have already heard it. Fresh voice = fresh chance.
