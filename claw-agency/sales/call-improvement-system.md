# ClawOps Call Improvement System (CIS)

**Created:** March 20, 2026
**Purpose:** Structured, data-driven framework to improve after EVERY single call. No more blind blasting.

---

## The Problem We're Solving

141 calls on Mar 18. 55 calls on Mar 19. Zero sales. No real structure for learning from failures. We were operating like a slot machine - pull the lever, hope for a payout.

Real sales orgs (Gong, Orum, Cognism data) show:
- Industry cold call success rate: **2.3%** (booking a meeting from a cold call)
- Top teams with call analysis hit **6.7%** (3x the average)
- The difference? **Systematic post-call analysis and iterative prompt improvement.**

---

## PART 1: Call Scoring System

Every call gets scored on 5 dimensions. Score 1-5 each.

### Dimension 1: CONNECT (Did we reach a human?)
| Score | Meaning |
|-------|---------|
| 1 | No answer / voicemail / dead line |
| 2 | IVR dead end (automated system, never got past) |
| 3 | Reached a human but instant hangup (<5 turns) |
| 4 | Reached a gatekeeper, had a real exchange |
| 5 | Reached the decision maker / owner |

### Dimension 2: ENGAGE (Did the conversation go anywhere?)
| Score | Meaning |
|-------|---------|
| 1 | Zero engagement. "Not interested" click. |
| 2 | Brief exchange but no real dialogue (<10 turns) |
| 3 | Moderate conversation, some back and forth |
| 4 | Deep conversation, multiple exchanges, questions asked |
| 5 | Full pitch delivered, prospect actively participating |

### Dimension 3: PITCH (Did we actually present the value prop?)
| Score | Meaning |
|-------|---------|
| 1 | Never got to pitch at all |
| 2 | Started to pitch but got cut off |
| 3 | Delivered partial pitch |
| 4 | Delivered full pitch, prospect heard it |
| 5 | Pitched AND prospect asked follow-up questions about the service |

### Dimension 4: ADVANCE (Did we move toward a next step?)
| Score | Meaning |
|-------|---------|
| 1 | Dead end. No next step possible. |
| 2 | Left a message / "send me info" brush-off |
| 3 | Got a name, email, or callback time |
| 4 | Prospect agreed to a follow-up or demo |
| 5 | Meeting booked or verbal commitment to buy |

### Dimension 5: AI QUALITY (How did the AI perform?)
| Score | Meaning |
|-------|---------|
| 1 | AI broke character, got detected, or sounded robotic/confused |
| 2 | Filler words, stutters, or identity breaks |
| 3 | Passable but not natural. Some awkward moments. |
| 4 | Smooth conversation, natural-sounding, stayed in character |
| 5 | Indistinguishable from a human sales rep |

**Total Score: /25 per call**
- 5-8: Dead call (learn nothing, move on)
- 9-12: Analyze for connect/gatekeeper patterns
- 13-17: Analyze for pitch/engagement improvements
- 18-22: Strong call, analyze for closing technique
- 23-25: Model call. Extract as example for prompt training.

---

## PART 2: Post-Call Analysis Pipeline

### After EVERY batch (not after the whole day):

**Step 1: Auto-Score**
Pull transcripts via VAPI API. Run each through a scoring script that evaluates all 5 dimensions. Flag calls scoring 13+ for deep review.

**Step 2: Disposition Tagging**
Every call gets exactly ONE primary disposition:
- `NO_CONNECT` - never reached a human
- `QUICK_REJECT` - human answered, immediate brush-off
- `GATEKEEPER_WALL` - stuck at receptionist/office manager
- `GATEKEEPER_PASS` - got through to decision maker
- `PITCH_DELIVERED` - actually presented the service
- `INFO_EXTRACTED` - got owner name, email, or callback time
- `DEMO_BOOKED` - meeting scheduled
- `SALE` - closed deal

**Step 3: Failure Point Identification**
For every call that scored 9+, identify the EXACT TURN where the call failed:
- Which turn number did the conversation stall?
- What did the prospect say right before it went sideways?
- What did Jordan say that killed momentum?
- What SHOULD have been said instead?

**Step 4: Pattern Extraction**
After every batch, look for repeating patterns:
- Are we losing most calls at the same stage? (opener? gatekeeper? pitch?)
- What objections keep coming up? (not interested, send info, who are you, is this AI?)
- Which industries respond better? (HVAC vs plumbing vs electrical)
- What time of day produces better conversations?

---

## PART 3: The Improvement Loop

### A. Micro-Adjustments (After Every Batch)
- If 3+ calls fail at the same point, adjust that specific part of the prompt
- Test the adjustment in the NEXT batch (not in 3 days)
- Track: what changed, which batch, what result

### B. Weekly Deep Review
- Pull all calls scoring 15+
- Identify the 3 best calls of the week
- Extract exact phrasing that worked
- Inject those phrases into the prompt as examples (examples override rules in VAPI)
- Identify the 3 worst "should-have-been-good" calls (high score on connect/engage, low on pitch/advance)
- Figure out what went wrong in those specifically

### C. Prompt Versioning
Every prompt change gets:
- A version number (v18.1, v18.2, etc.)
- A changelog note (what changed and why)
- Performance tracking against the previous version
- Minimum 20 calls before judging a prompt change

---

## PART 4: Specific Problems to Fix (Based on Mar 18-19 Data)

### Problem 1: Gatekeeper Conversion is 22%
**Current behavior:** Jordan asks for the owner by name. Gatekeeper asks why. Jordan explains. Gatekeeper says "not interested" on behalf of owner.
**Fix:** 
- Never pitch the gatekeeper. Treat them as a routing mechanism.
- Belfort approach: Peer-level tone. "Hey, is [Owner] around? It's Jordan calling."
- If pressed: "Just following up on something we sent over." (vague on purpose)
- If walled: "Totally understand. When's the best time to catch him?"
- Get a callback time. That's the WIN with a gatekeeper.

### Problem 2: AI Getting Detected (8.6% of calls)
**Current behavior:** Long pauses, filler words, unnaturally perfect grammar.
**Fix:**
- Cut max response length. Under 30 words per turn.
- Add more conversational "bridging" phrases that sound human
- When accused of being AI: "Ha, I get that a lot. I promise I'm real, just calling a lot of folks today."
- Shorter calls overall. In and out in under 90 seconds for the first touch.

### Problem 3: Not Actually Pitching (only 1 owner conversation in 116 calls)
**Current behavior:** Jordan spends too long on discovery/rapport with gatekeepers instead of fighting to reach the owner.
**Fix:**
- The Gong data is clear: cold calls are NOT about discovery. They're about selling the meeting.
- Jordan should pitch FAST once past the gatekeeper. Under 15 seconds.
- Pitch template: "[Owner], quick question. If I could show you how to never miss another service call, even when your phones are slammed, would that be worth 5 minutes?"
- Then sell the MEETING, not the product.

### Problem 4: No Follow-Up System
**Current behavior:** We extract contacts but don't follow up.
**Fix:**
- Tier 1 (email extracted): Email within 2 hours of the call
- Tier 2 (owner name, no email): Call back at specified time
- Tier 3 (callback left): Follow-up call 48h later
- Every contact goes into GHL pipeline with proper stage tracking

---

## PART 5: Call Timing Optimization

Based on Cognism's 2026 data (204,000 cold calls analyzed):
- **Best day: Tuesday** (highest meeting booking rate)
- **Worst day: Friday** (good for rapport, bad for bookings)
- **Best time: 10-11 AM local time** (prospect's timezone)
- **Second best: 2-3 PM local time**
- **Avoid: 7-9 AM, 12 PM lunch, 5 PM commute**
- **3 attempts per prospect** (93% of conversations happen by attempt 3)
- **After 5 attempts, stop** (98%+ of conversations have happened, additional calls are wasted)

### Batch Timing Template
| Batch | Target TZ | Fire Time (ET) | Local Time |
|-------|-----------|----------------|------------|
| A | Eastern | 10:00 AM | 10:00 AM |
| B | Central | 11:00 AM | 10:00 AM |
| C | Mountain | 12:00 PM | 10:00 AM |
| D | Pacific | 1:00 PM | 10:00 AM |
| E | Eastern | 2:00 PM | 2:00 PM |
| F | Central | 3:00 PM | 2:00 PM |

---

## PART 6: The Analysis Script

After each batch, run the analysis pipeline:
1. `get-full-transcripts.py` - Pull all transcripts from VAPI
2. `score-calls.py` - Auto-score each call on 5 dimensions (NEW - needs to be built)
3. `analyze-patterns.py` - Extract failure points, objection patterns, timing data (NEW)
4. `generate-report.py` - Create batch report with specific prompt improvement recommendations (NEW)

### Output format per call:
```json
{
  "call_id": "xxx",
  "business": "Company Name",
  "disposition": "GATEKEEPER_WALL",
  "scores": {
    "connect": 4,
    "engage": 3,
    "pitch": 1,
    "advance": 2,
    "ai_quality": 3
  },
  "total_score": 13,
  "failure_turn": 8,
  "failure_reason": "Gatekeeper asked 'what is this about?' - Jordan over-explained instead of staying vague",
  "fix_suggestion": "Use Belfort peer-level tone: 'Just following up on something we discussed.'"
}
```

---

## PART 7: Success Metrics (What We're Tracking)

### Per-Batch Metrics
- Connect rate (% reaching any human)
- Gatekeeper pass rate (% getting to decision maker)
- Pitch delivery rate (% where we actually present value)
- Info extraction rate (% where we get name/email/callback)
- Meeting booking rate (% where demo is scheduled)
- AI quality average (mean score dimension 5)
- Cost per call, cost per lead, cost per meeting

### Trend Metrics (Track Over Time)
- Gatekeeper pass rate by prompt version
- Objection frequency by type
- Best-performing call times
- Best-performing industries
- Prompt version performance comparison

### Target Benchmarks
- Connect rate: 90%+ (we're at 91%, this is good)
- Gatekeeper pass rate: 35%+ (we're at 22%, needs work)
- Pitch delivery rate: 15%+ of total calls (we're under 1%)
- Meeting booking rate: 2-3% of total calls (industry: 2.3%, top teams: 6.7%)
- AI quality average: 4.0+ (estimated we're at ~3.0)

---

## Implementation Priority

1. **Build `score-calls.py`** - Automated scoring of transcripts using LLM evaluation
2. **Fix the gatekeeper handling** in prompt (biggest leak in the funnel)
3. **Add the pitch-fast protocol** for when we DO reach owners
4. **Set up email follow-up** for the 13 Tier 1 contacts we already have
5. **Build the batch report template** so every batch produces actionable data
6. **Implement call-back scheduling** for Tier 2 contacts at their preferred times

---

*This system replaces "blast and hope." Every call teaches us something. Every batch makes the next batch better. The goal is not 300 calls - it's 300 data points that compound into a conversion machine.*
