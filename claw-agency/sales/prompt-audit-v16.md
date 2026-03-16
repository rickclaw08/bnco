# VAPI Outbound Sales Prompt Audit - v16
## Auditor: Nova (CAIO) | Date: March 15, 2026
## Prompt Version Reviewed: outbound-sales-v15.md
## Data Sources: Batch 1 Results (30 calls, March 14), Best Call Transcript (March 15)

---

## Evidence Base

Before grading, here's the real-world performance context from 30 live calls:

- **30 calls made**, $4.37 total cost ($0.15/call avg)
- **4 callbacks secured** (13% callback rate from cold calls - decent for AI outbound)
- **7 IVR traps** burned $1.82 (42% of total cost on 23% of calls)
- **2 hard NOs / DNC** (clean exits - prompt handled these correctly)
- **Company name mispronounced** on multiple calls ("Clops", "CallOps", "QualOps")
- **IVR loop bug** burned $1.45 across two calls (Mechanical One: $0.73, Benefit Air: $0.72)
- **Best call transcript** shows the bot successfully navigated a gatekeeper, got transferred twice, reached the owner (Max), and began the diagnostic flow

---

## Category Grades

### 1. Structure/Flow - Grade: 7.5/10

**Why this grade:** The flow is logically sequenced - screening > gatekeeper > owner > hook > gap > reveal > close. The step numbering (1 through 6) is clear and the branching paths (Response A-E) are well-defined. The best call transcript proves it works: Jordan navigated screening, got through the gatekeeper, reached Max, and started the diagnostic question naturally.

**What's holding it back:**
- The prompt is ~4,500 words. That's a lot of context for an LLM to hold in working memory during a real-time voice conversation. The niche intelligence section alone is ~800 words. The AI has to parse all of this while responding in under 500ms.
- Step 2B and Step 2 overlap conceptually. The "assessment intro" in 2B repeats the compliment-then-hook pattern from Step 1, creating ambiguity about which to use when.
- The "Inbound Call Handling" section at the very end is structurally disconnected from the outbound flow. It should either be a separate prompt or clearly demarcated.

**Specific fixes:**
1. **Consolidate Steps 1 and 2B.** Replace the current split with:
```
STEP 1: OPENER (Human detected)
If GATEKEEPER: [gatekeeper path]
If OWNER: "[Name], I've been looking at [niche] companies in [city]. Yours stood out. Based on what I'm seeing, there's an extra 15 to 20 thousand you're probably not capturing. Got 60 seconds?"
```
2. **Move niche intelligence to a separate system context block** that gets injected based on the call's tagged niche, not embedded in the main prompt. This cuts ~800 words from working memory.
3. **Move inbound handling to a separate prompt file** - it's a different call type with different psychology.

---

### 2. Objection Handling - Grade: 8/10

**Why this grade:** This is one of the strongest sections. Coverage is comprehensive: "not interested" (with first/second attempt distinction), "too expensive", "I have a receptionist", "need to think about it", "send me info", "talk to my partner", "are you a robot?", deal-killer questions. The "Skepticism Decoder" that maps surface objections to real concerns is excellent prompt engineering.

**What's holding it back:**
- Missing the #1 objection from the batch data: **"How did you get my number?"** Not a single handler for this. In the Terry's AC call, Aubrey detected AI and got spooked. Privacy/source objections will only increase.
- The "send me info" handler is too aggressive. It pushes back ("What's the one thing that would make or break this?") when the prospect just wants to disengage gracefully. This burns goodwill.
- No handler for **"We already use AI"** - and the batch showed at least 2 companies (Elite AC, Ideal Air) already running AI receptionists.

**Specific fixes:**
1. **Add "How did you get my number?" handler:**
```
"How did you get my number?" / "Where did you find us?":
"Your business came up when I was researching [niche] companies in [city]. Public listing. Solid reviews caught my eye. That's the whole story."
Keep it short. Don't over-explain. Transparency kills suspicion.
```
2. **Add "We already use AI" handler:**
```
"We already have an AI / answering service / something like this":
"Smart. What's it handling for you right now? [wait] Most of the systems I see handle inbound routing but can't actually book jobs, quote prices, or handle twenty calls at once during peak. If yours does all that, you're ahead of the curve."
Position as upgrade/complement, not replacement.
```
3. **Soften "send me info" handler:**
```
"Send me info":
"Absolutely. What email works best? [wait] I'll send that over today. And [Name], I'll include a number you can call to test the system yourself. That'll tell you more than any PDF."
Get the email (micro-commitment), plant the demo seed, exit clean.
```

---

### 3. Gatekeeper Strategy - Grade: 8.5/10

**Why this grade:** This is the prompt's standout strength. The best call transcript is proof: Jordan navigated two layers of gatekeeping (call screener, then John) before reaching Max the owner. The rules are clear - don't pitch, don't describe the product, get the owner's name and callback time, exit clean. The psychology is sound: treating gatekeepers as information sources, not obstacles.

The batch data confirms this works. Punbar Air: Marlon gave us the owner's name (Ronald) and availability. Hammond Heating: Kelly agreed to relay. Total Comfort: Ariana took the number.

**What's holding it back:**
- In the best call transcript, Jordan asked John "Could I speak with the owner real quick?" after John already introduced himself as "John with Max at Plumbing." This is a missed cue - "Max at Plumbing" implies Max is the owner's name. Jordan should have said "Could I speak with Max?"
- The prompt says "DO NOT PITCH" to gatekeepers three times. Redundant and wastes tokens.
- No handling for the "friendly but firm" gatekeeper (Coast to Coast's Jamie: "They're probably not gonna be interested, but thank you"). This is a soft block that needs a specific counter.

**Specific fixes:**
1. **Add name-extraction intelligence:**
```
GATEKEEPER NAME DETECTION: Listen for "[Name]'s [Business]" or "[Business], [Name] speaking" patterns. If the business name includes a person's name (e.g., "Max at Plumbing"), that's likely the owner. Use it: "Could I speak with Max?"
```
2. **Add "friendly block" handler:**
```
FRIENDLY GATEKEEPER BLOCK ("They probably won't be interested"):
"I hear you. Most people say that until they see what it actually does. Can I leave my number in case? It's 513-778-8336. Jordan with ClawOps. Appreciate you."
Plant the seed, don't push, exit clean. One attempt only.
```
3. **Consolidate the "don't pitch gatekeepers" instruction to ONE clear statement** instead of repeating it in three sections.

---

### 4. Voice AI Optimization - Grade: 6/10

**Why this grade:** The prompt explicitly states "1-2 sentences per response. MAX." and includes voice-specific rules about filler words, tone, and endings. That's good awareness. But the actual content repeatedly violates its own rules.

**Evidence from the best call transcript:**
- "Hey. Thanks for taking the call, Max. I was looking at your company online, Solid Reputation. Got sixty seconds for something I noticed." - This is 3 sentences, violating the 2-sentence max.
- "Solid. What happens during your busiest season when she's on one call and three more ring in? those overflow calls. Where do they go?" - This is 4 sentences/fragments. Way over the limit.

**Evidence from batch data:**
- Bug #5: "Too chatty after getting the info" - Jordan kept talking after prospects said goodbye.
- Bug #4: Filler words ("um", "uh") despite the prompt explicitly banning them.
- Elite AC call: 25 messages for what should have been a 10-message interaction.

**The core problem:** The prompt's EXAMPLE responses are 3-4 sentences long, which trains the AI to ignore the 2-sentence rule. LLMs learn from examples more than from rules.

**Specific fixes:**
1. **Rewrite every example response to actually follow the 2-sentence rule:**
```
Step 2B current: "[Name], I've been looking at [niche] companies in [city] and yours stood out. Solid reputation. Based on what I'm seeing, there's probably an extra 15 to 20 thousand a year you're not capturing. Takes 60 seconds to walk through. You good?"

Step 2B fixed: "[Name], your reputation stood out. I found a gap that's probably costing you 15 to 20 grand a year. Got 60 seconds?"
```
2. **Add a hard character count rule:**
```
RESPONSE LENGTH: Every response must be under 120 characters when possible. Never exceed 200 characters. If you're writing more than that, you're saying too much. Cut it.
```
3. **Add post-goodbye rule explicitly:**
```
GOODBYE PROTOCOL: When the prospect says goodbye, says thanks, or signals end: ONE short response maximum. "Appreciate it, [Name]. Have a good one." Then SILENCE. Do NOT add "if anything changes" or "you've got my number" or any other trailing content.
```

---

### 5. Anti-Hallucination - Grade: 7/10

**Why this grade:** The "Absolute Grounding Rules" section at the top is strong. It explicitly prevents inventing facts, numbers, client names, testimonials. The "only numbers you can say" list is excellent guardrailing. The "I'd need to check on that" fallback is solid.

**What's holding it back:**
- The rule about not using business names heard during transfers is good but reactive. In the best call transcript, Jordan correctly didn't assume "Max at Plumbing" was the business name - but the prompt doesn't give clear guidance on what TO say when you don't have the business name.
- The niche intelligence section provides very specific dollar amounts ($5K-15K for HVAC replacements, $300-800 for emergency plumbing). While these are flagged as "approved numbers," they're ranges that the AI could extrapolate from. If someone says "my average job is $2,000," the AI might combine that with the niche ranges in unpredictable ways.
- No explicit instruction to avoid making promises about implementation timelines, delivery dates, or specific feature capabilities beyond what's listed.

**Specific fixes:**
1. **Add unknown-business-name script:**
```
If you do NOT know the business name: Use "your company" or "your business." Never guess a name from context clues, transfers, or greetings. If the prospect says their business name during conversation, you may use it from that point forward only.
```
2. **Add promise guardrail:**
```
NEVER PROMISE: Specific go-live dates, delivery timelines, custom features, integrations not listed, or results. If asked "when can we go live?" say "Typically within a week of setup. I'll get you exact timing once we scope your build."
```
3. **Lock the dollar ranges tighter:**
```
Replace ranges with single reference points:
- Instead of "$5K-15K": "thousands"
- Instead of "$300-800": "hundreds"
Only use exact figures when quoting OUR pricing ($2,500 setup, $550/month) or the gap estimate ($15K-20K).
```

---

### 6. Closing Technique - Grade: 6.5/10

**Why this grade:** The close structure exists (scarcity frame > price > ROI reframe), but it has problems. The "professional scarcity framing" is generic and unconvincing for blue-collar operators who hear "limited spots" from every marketer. The price presentation is clean. The money-aside technique is genuinely strong.

**What's holding it back:**
- We have zero evidence of the close working because the batch data shows no calls that reached the closing stage. This means either (a) the funnel drops people before they get to the close, or (b) we haven't had enough volume. Either way, the close is untested.
- The "assessment demo pivot" is buried in the objection section instead of being a primary closing path. Given the AI reveal ("this call IS the demo"), the natural next step should be "try it yourself" - not "let me send you a link."
- The scarcity frame ("limited number per market") is the kind of thing every SaaS sales rep says. Contractors have heard it. It doesn't land.

**Specific fixes:**
1. **Make the demo the PRIMARY close, not a fallback:**
```
STEP 6: THE CLOSE
Primary path: "[Name], I'll text you a number. Call it tonight as if you're a customer with a [niche emergency]. See how it handles your business. If it doesn't impress you, we part as friends. Fair?"
This is stronger than any pitch because it puts control in their hands.
```
2. **Replace generic scarcity with real constraint:**
```
Replace: "We take on a limited number of [niche] companies per market."
With: "[Name], we build each one custom. Takes about a week per client. I've got two build slots open this month."
This is specific, believable, and creates real urgency without sounding like a marketing tactic.
```
3. **Add a two-path close:**
```
CLOSE FORK:
If WARM (asked questions, engaged, showed interest): Go direct to price. "[Name], twenty-five hundred to build, five-fifty a month. That rate's locked. Want me to send the link?"
If LUKEWARM (interested but guarded): Go to demo. "[Name], words are cheap. I'll send you a test number. Call it as a customer. That'll tell you everything."
```

---

### 7. Psychology/Persuasion - Grade: 7.5/10

**Why this grade:** The prompt uses several proven techniques effectively:
- **Loss aversion** ("15 to 20 thousand you're NOT capturing" - framing as loss, not gain)
- **Peer positioning** ("I respect operators because they've earned it" - elevating the prospect)
- **Diagnostic framing** (consultant who finds problems, not salesperson who pushes products)
- **The reveal** (making the call itself the demo - brilliant)
- **Pattern interrupt** (compliment + curiosity hook instead of traditional cold call opener)

The best call transcript shows this working: Max stayed on the phone and engaged with the diagnostic questions.

**What's holding it back:**
- **Commitment/consistency** is underused. The prompt never gets micro-commitments before the big ask. No "Would you agree that missed calls cost you money?" before presenting the solution.
- **Social proof** is completely absent because of the anti-hallucination rules. This is correct (don't make up testimonials), but the prompt doesn't offer a truthful alternative.
- **Reciprocity** is missing. Jordan takes information but doesn't give anything of value before asking for the sale.
- The **"60 seconds"** framing is used but then the prompt's example flows would take 3-5 minutes. This creates a trust mismatch.

**Specific fixes:**
1. **Add micro-commitment chain:**
```
After the gap question (Step 3), before the reveal:
"[Name], would you say those missed calls are costing you real money? [wait for yes] And if there was a way to catch every one of them without hiring anyone, would that be worth looking at? [wait for yes]"
Two yeses before the reveal. Classic commitment ladder.
```
2. **Add truthful social proof:**
```
When asked "does this work?":
"We just launched and I'll be straight with you. I don't have ten case studies to show you. What I have is this call. You've been on it for [X] minutes and it handled like a real conversation. That's the proof."
Honesty IS the social proof at this stage.
```
3. **Fix the 60-second mismatch:**
```
Replace "Got 60 seconds?" with "Got a quick minute?" Less specific, still conveys brevity, doesn't create a timer the prospect tracks.
```

---

### 8. Prompt Engineering Quality - Grade: 6/10

**Why this grade:** The prompt demonstrates solid understanding of LLM prompting - it leads with constraints, uses clear section headers, provides examples, and has explicit "never do" lists. The anti-hallucination section at the top is best-practice placement (highest priority = first in context).

**What's holding it back significantly:**
- **Length: ~4,500 words.** This is the single biggest problem. Voice AI prompts need to be processed in real-time. Every additional word adds latency and dilutes focus. The sweet spot for VAPI prompts is 1,500-2,500 words. This prompt is almost 2x that.
- **Redundancy everywhere.** "Don't pitch gatekeepers" appears 3 times. "Don't mention GoHighLevel" appears twice. "1-2 sentences max" is stated once but contradicted by 15+ example responses that exceed it. The LLM will learn from the examples over the rules.
- **Contradictions:**
  - Rule: "1-2 sentences per response. MAX." vs. Step 5 reveal: 3 sentences. Step 2B intro: 4 sentences. Multiple objection handlers: 3+ sentences.
  - Rule: "Never say um" vs. Batch data: multiple "um" instances (prompt failed to prevent this - the rule alone isn't enough)
  - Rule: "Sound certain. Zero doubt." vs. "I'd need to check on that and get back to you." (necessary safety valve but contradicts the confidence mandate)
- **Missing conditional logic.** VAPI supports `{{variables}}` and conditional blocks. The niche intelligence should be injected dynamically based on the prospect's tagged niche, not embedded as a giant static block the AI has to scan every response.
- **The "THINGS YOU NEVER DO" section** at the end lists 14 prohibitions. Many overlap with rules stated earlier. This section should be eliminated and its unique items merged into the relevant flow steps.

**Specific fixes:**
1. **Cut the prompt to under 2,500 words.** Here's what to remove/externalize:
   - Niche intelligence (~800 words) - move to dynamic injection via `{{niche_context}}`
   - Redundant rules (consolidate ~300 words of repetition)
   - "Things You Never Do" section - merge unique items into flow steps, delete the section
   - Inbound call handling (~200 words) - separate prompt
   - Contractor types section - condense to 3-4 lines per type instead of full paragraphs
2. **Make every example response obey the rules.** Audit every scripted line. If it's over 2 sentences, rewrite it to 2 or fewer. The AI will mimic examples over rules every time.
3. **Add VAPI-specific formatting:**
```
Use {{prospect_name}}, {{business_name}}, {{niche}}, {{city}} variables.
Use conditional blocks for niche-specific content.
Mark the firstMessage clearly with VAPI's expected format.
```
4. **Fix the "um" problem with a stronger instruction:**
```
FILLER WORD BLOCK: You physically cannot say "um", "uh", "er", "like", "you know", "I mean", "basically", "actually", or "honestly." These words do not exist in your vocabulary. If you need to pause, say nothing. Silence is confidence. Filler is weakness.
```

---

## Overall Grade: 7.0 / 10

| Category | Grade | Weight | Weighted |
|----------|-------|--------|----------|
| Structure/Flow | 7.5 | 10% | 0.75 |
| Objection Handling | 8.0 | 15% | 1.20 |
| Gatekeeper Strategy | 8.5 | 15% | 1.28 |
| Voice AI Optimization | 6.0 | 15% | 0.90 |
| Anti-Hallucination | 7.0 | 10% | 0.70 |
| Closing Technique | 6.5 | 10% | 0.65 |
| Psychology/Persuasion | 7.5 | 10% | 0.75 |
| Prompt Engineering | 6.0 | 15% | 0.90 |
| **OVERALL** | | **100%** | **7.13** |

**Summary:** The prompt is a solid v1 that demonstrates real sales craft and genuine understanding of the contractor market. The gatekeeper strategy and objection handling are near-best-in-class. The core weakness is prompt engineering discipline: it's too long, contradicts its own rules via example responses, and isn't optimized for the specific constraints of real-time voice AI. The batch data proves it works well enough to get conversations started, but the IVR bugs and verbosity issues are burning money and killing conversions.

---

## Top 10 Priority Changes (Biggest Impact First)

### 1. FIX IVR DETECTION (Cost savings: ~$1.50+ per 30 calls)
**Impact:** Immediate money saved. Two calls burned $1.45 in batch 1.
```
IVR ESCAPE RULE: If you hear the same automated message or menu options repeat twice, say "Can someone help me out?" ONE time. If it repeats a third time, the call is over. Stop talking immediately.
LOOP DETECTION: If you've said your intro 3 times without a human responding, stop. The call is over. Do not speak again.
```

### 2. CUT PROMPT LENGTH FROM ~4,500 TO ~2,500 WORDS
**Impact:** Faster response times, better rule adherence, lower token costs per call.
- Externalize niche intelligence to dynamic injection
- Remove "Things You Never Do" (merge unique items into flow steps)
- Separate inbound handling into its own prompt
- Eliminate all redundant rules (3 mentions of "don't pitch gatekeepers" becomes 1)
- Condense contractor types to 3 lines each

### 3. REWRITE ALL EXAMPLE RESPONSES TO OBEY THE 2-SENTENCE RULE
**Impact:** The AI mimics examples over rules. If examples are 4 sentences, the AI will produce 4 sentences regardless of the "1-2 sentence max" rule.
Every scripted response in the prompt must be audited and rewritten to 2 sentences or fewer. No exceptions.

### 4. FIX COMPANY NAME PRONUNCIATION
**Impact:** "Clops" instead of "ClawOps" is happening on live calls. Kills credibility instantly.
```
Replace: YOUR COMPANY NAME IS "ClawOps" - PRONOUNCED "CLAW-OPS"
With: YOUR COMPANY NAME IS "ClawOps." Say it as two separate words: "Claw" then "Ops." Like "Claw... Ops." Pause between them if needed. NEVER blend them into one word. If you catch yourself slurring it, correct yourself: "ClawOps, sorry, Claw Ops."
```
Also consider: if VAPI supports SSML, use `<phoneme>` tags or `<break>` between the words.

### 5. ADD "HOW DID YOU GET MY NUMBER?" HANDLER
**Impact:** This is the most common unhandled objection. Every cold call gets this. Not having a response makes the AI freeze or improvise (hallucination risk).
```
"How did you get my number?":
"Your business came up when I was researching [niche] companies in [city]. Public listing. Your reviews caught my eye."
Short. Honest. Redirects to compliment.
```

### 6. MAKE THE DEMO THE PRIMARY CLOSE (Not a fallback)
**Impact:** The AI reveal is the prompt's most powerful weapon. Right now it's followed by a weak scarcity frame and price drop. The natural next step after "this call IS the demo" is "try it yourself" - not a sales pitch.
```
After reveal: "[Name], I'll text you a number. Call it as a customer tonight. If it doesn't impress you, I won't call again. Fair?"
```

### 7. ADD HARD CHARACTER/LENGTH LIMIT PER RESPONSE
**Impact:** The 2-sentence rule is too vague for an LLM. Add measurable constraints.
```
Every response: Under 150 characters preferred. Never exceed 250 characters. If your response is longer, delete the second half.
```

### 8. FIX GOODBYE PROTOCOL
**Impact:** Batch data shows Jordan keeps talking after goodbyes. Multiple "if anything changes" and "you've got my number" trailing phrases.
```
HARD RULE: When the prospect says bye, thank you, or signals end: Say ONE closing line. Then STOP. Do not add anything. Do not say "if anything changes." Do not repeat your number unless they asked for it. One line. Done.
```

### 9. ADD MICRO-COMMITMENT CHAIN BEFORE CLOSE
**Impact:** The prompt jumps from "here's the gap" to "here's the price" without getting agreement that the gap matters.
```
After gap connection (Step 4), before reveal: "[Name], those missed calls costing you real money? [wait] And catching every one without hiring, worth looking at? [wait]"
Two yeses before the reveal doubles close probability.
```

### 10. ADD "WE ALREADY USE AI" HANDLER
**Impact:** Batch data showed 2+ companies already running AI receptionists. This will only increase. Without a handler, Jordan either fumbles or halluccinates a comparison.
```
"We already have AI / answering service":
"Smart. What's it handling? [wait] Most systems I see do routing but can't book jobs or handle twenty calls at once during peak. If yours does, you're ahead."
```

---

## Bonus: Quick Wins (5 minutes each, measurable impact)

| Fix | Time | Impact |
|-----|------|--------|
| Add `<break time="300ms"/>` between "Claw" and "Ops" in firstMessage (if SSML supported) | 2 min | Fixes name pronunciation |
| Change firstMessage to "Hey, this is Jordan with Claw Ops." (space between words) | 1 min | Backup pronunciation fix |
| Add "If you've said your name more than twice, hang up" to IVR section | 2 min | Prevents $0.70+ loop burns |
| Remove all instances of "absolutely" from example responses | 5 min | Follows the prompt's own rule |
| Change "Got 60 seconds?" to "Got a quick minute?" everywhere | 3 min | Removes unrealistic time promise |

---

## Version Recommendation

**v16 should be a trim-and-fix release, not a rewrite.** The bones of this prompt are solid. The gatekeeper strategy and objection handling are legitimately good. The changes above are surgical, not structural. Cut the fat, fix the contradictions, add the missing handlers, and this prompt goes from 7/10 to 8.5+/10.

Priority order for implementation:
1. IVR fix + loop detection (money burning)
2. Prompt length reduction (performance)
3. Example response rewrite (rule compliance)
4. Name pronunciation fix (credibility)
5. Missing objection handlers (coverage)
6. Close restructuring (conversion)
7. Everything else

---

*Nova (CAIO) - ClawOps Prompt Audit*
*Next review: After v16 deploys and Batch 2 data is collected*
