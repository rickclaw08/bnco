# VAPI Prompt Engineering Research

**Author:** Kai (R&D / Tech Lead) - ClawOps  
**Date:** March 15, 2026  
**Version:** 1.0  
**Purpose:** Internal reference for building high-performance VAPI voice AI agents. Covers architecture, prompt design patterns, latency optimization, hallucination prevention, and production-ready structural techniques.

---

## 1. VAPI Platform Architecture

### How VAPI Processes System Prompts

VAPI operates as an orchestration layer sitting between four components: the **telephony provider** (Twilio, Vonage, or VAPI's own numbers), the **STT engine** (Deepgram, Whisper, etc.), the **LLM** (OpenAI, Anthropic, Groq, custom), and the **TTS engine** (ElevenLabs, PlayHT, Deepgram, RIME, Azure).

When a call connects, VAPI assembles the conversation payload for the LLM. The system prompt is injected as the `system` role message at position zero in the messages array. Every subsequent user/assistant turn appends to this array. The LLM sees the full conversation history on every turn, which means your system prompt is re-processed with every single response generation.

This is the single most important architectural fact for prompt engineering: **your system prompt's token count is a fixed tax on every response in the call.** A 3,000-token system prompt means 3,000 tokens of input processing on turn 1, but by turn 10 with accumulated conversation history, you might be sending 6,000-8,000 tokens per inference call.

### firstMessage Behavior

The `firstMessage` parameter fires **immediately on call connect**, before the caller says anything. VAPI sends this string directly to the TTS engine - it does NOT go through the LLM. This is critical to understand:

- `firstMessage` bypasses the LLM entirely. It is a static (or template-interpolated) string.
- It fires as soon as the WebSocket/SIP connection is established.
- The caller hears it within ~200-500ms of pickup, depending on TTS provider latency.
- If you use dynamic variables like `{{name}}`, VAPI interpolates them before sending to TTS.
- The `firstMessage` is then injected into the conversation history as an `assistant` message, so the LLM has context that this greeting was already delivered.

**Practical implication:** Never rely on the LLM to generate your greeting. Use `firstMessage` for instant pickup. The LLM's first actual generation happens after the caller responds to the greeting.

### Context Window Accumulation

Each conversational turn adds to the messages array:

```
Turn 0: [system prompt] + [assistant: firstMessage]
Turn 1: + [user: caller's first utterance] + [assistant: LLM response]
Turn 2: + [user: caller's second utterance] + [assistant: LLM response]
...
Turn N: system prompt + 2N messages
```

By turn 15-20 in a typical sales or support call, you can easily hit 4,000-6,000 tokens of accumulated context. Combined with a long system prompt, you are approaching the territory where latency becomes noticeable. VAPI does not currently implement automatic conversation summarization or sliding window truncation - the full history is sent every time.

### Temperature and maxTokens Effects

**Temperature** (0.0 - 2.0, default varies by model):
- **0.0-0.3:** Highly deterministic. The agent repeats similar phrasings, stays extremely on-script. Good for compliance-heavy use cases. Sounds robotic over multiple turns.
- **0.3-0.7:** The production sweet spot for most voice agents. Enough variation to sound natural, enough constraint to stay on-topic.
- **0.7-1.0:** More creative, more natural-sounding, but increased hallucination risk. Suitable for casual/entertainment bots.
- **Above 1.0:** Almost never appropriate for voice AI. Responses become unpredictable and hallucination-prone.

**maxTokens** (controls response length ceiling):
- Directly affects latency. The LLM generates tokens sequentially; more tokens = longer generation time.
- For voice AI, you rarely want responses longer than 80-150 tokens (roughly 2-4 spoken sentences).
- Setting `maxTokens` to 150-250 provides a hard ceiling that prevents rambling.
- Lower `maxTokens` also reduces hallucination surface area - the model has fewer tokens in which to drift off-topic.
- Be cautious setting it too low (<50). The model may cut off mid-sentence, which sounds terrible through TTS.

---

## 2. Voice AI vs Chat Prompt Engineering

Voice AI prompt engineering is a fundamentally different discipline from chat prompt engineering. The constraints are not just different in degree - they are different in kind.

### Real-Time Processing Pressure

In chat, the user types a message, waits, reads a response. Latency of 2-5 seconds is acceptable. In voice, the caller expects a response within 500-1500ms of finishing their sentence. Every millisecond of LLM inference time is felt as awkward silence. This means:

- The LLM cannot "think step by step" - chain-of-thought reasoning adds latency.
- You cannot use complex multi-step instructions that require the model to plan before responding.
- The prompt must make the correct response pattern immediately obvious to the model.

### STT Transcription Errors

The caller's words pass through speech-to-text before reaching the LLM. STT engines introduce errors, especially with:

- Proper nouns ("ClawOps" might transcribe as "claw ops", "claw opps", or "Claude ops")
- Numbers and addresses
- Heavy accents or background noise
- Industry jargon

Your prompt must account for this. Include likely misspellings/mistranscriptions of key terms. Example:

```
The company name is ClawOps (may be transcribed as "claw ops", "claw opps", "Claude ops", or "claw office"). Recognize all of these as referring to ClawOps.
```

### TTS Pronunciation Issues

The reverse problem: the LLM outputs text that TTS must speak. Issues include:

- Acronyms: "API" might be read as "appy" instead of "A-P-I"
- URLs and emails: TTS will try to read "https://clawops.com" literally
- Numbers: "1,500" might come out as "one comma five hundred"
- Brand names: "ClawOps" will likely be read as one word with wrong emphasis

### Turn-Taking and Interruption

Voice conversations have complex turn-taking dynamics that don't exist in chat:

- The caller might start talking before the agent finishes (interruption/barge-in)
- VAPI handles interruption at the platform level, but your prompt affects how the agent recovers
- There is no "typing indicator" - the caller has zero visual feedback about whether the agent is thinking
- Silence longer than ~1.5 seconds feels like a dropped call

### No Visual Feedback

In chat, you can use formatting: bold, bullet points, links, code blocks. In voice, everything is linear audio. This means:

- Lists of more than 3 items are hard to follow aurally
- Complex information must be broken into smaller pieces across turns
- You cannot say "see the link below" - everything must be self-contained in speech

### The Summary Difference

| Dimension | Chat Prompts | Voice Prompts |
|-----------|-------------|---------------|
| Length tolerance | 3,000-10,000+ words fine | 1,500-2,500 words ideal |
| Response time | 2-10 seconds acceptable | 500-1,500ms target |
| Formatting | Rich markdown | Linear speech only |
| Error source | User typos | STT transcription errors |
| Output format | Text on screen | Audio through TTS |
| Complexity | Multi-step reasoning OK | Simple, direct responses |
| Context | Scrollable history | Memory-only for caller |

---

## 3. Prompt Length and Performance

### The Length-Latency Relationship

Every token in the system prompt adds to the input token count for every LLM inference call. The relationship is roughly linear:

- **Input processing:** ~0.5-2ms per token depending on model and provider
- **A 1,000-token prompt** adds ~1-2 seconds of base processing per turn
- **A 3,000-token prompt** adds ~3-6 seconds of base processing per turn

These numbers vary significantly by model (GPT-4o is faster than GPT-4, Claude 3.5 Haiku is faster than Opus, Groq-hosted models are fastest for raw speed).

### The Sweet Spot

Based on community reports and production deployments, the optimal system prompt length for VAPI is **1,500-2,500 words** (roughly 2,000-3,500 tokens). This provides:

- Enough space for persona, rules, knowledge, and examples
- Acceptable base latency (~1-2 seconds for first response)
- Room for 15-20 conversational turns before context window pressure becomes severe

### Context Window Fill-Up During a Call

Here is a realistic model of context growth during a 5-minute call:

```
Start:     System prompt (2,500 tokens) + firstMessage (30 tokens) = 2,530 tokens
Turn 3:    2,530 + ~600 tokens conversation = 3,130 tokens
Turn 7:    2,530 + ~1,400 tokens conversation = 3,930 tokens
Turn 12:   2,530 + ~2,400 tokens conversation = 4,930 tokens
Turn 20:   2,530 + ~4,000 tokens conversation = 6,530 tokens
```

At turn 20, you are processing 6,500+ tokens per inference call. With a slower model, this means 3-5 second response times - unacceptable for voice.

### Mitigation Strategies

1. **Keep the system prompt lean.** Every word must earn its place.
2. **Use `maxTokens` to constrain response length** - shorter responses mean less conversation history accumulation.
3. **Design calls to be shorter.** A 20-turn sales call is a design problem, not a prompt problem.
4. **Consider using faster models** (GPT-4o-mini, Claude Haiku, Groq-hosted Llama) for high-turn-count use cases.
5. **Use VAPI's `endCallMessage` and function calling** to gracefully terminate calls before context bloat.

---

## 4. Pronunciation Control Techniques

### Phonetic Spelling

The most reliable technique. Write words the way you want them spoken:

- "ClawOps" in the prompt becomes "Claw Ops" (two words) for TTS
- "API" becomes "A P I" (spaced letters)
- "HVAC" becomes "H vac" or "heating and cooling" depending on preference
- "SQL" becomes "sequel" or "S Q L" depending on your preference

The key insight: the LLM outputs text, and TTS reads that text. If you want correct pronunciation, you need the LLM to output phonetically correct text.

**In your system prompt:**
```
When you say the company name, always write it as "Claw Ops" (two separate words) so it is pronounced correctly.
```

### SSML Support

SSML (Speech Synthesis Markup Language) support varies by TTS provider in VAPI:

- **ElevenLabs:** Limited SSML support. Supports `<break>` tags for pauses and some prosody control. Does NOT support full SSML spec. Their pronunciation is generally good enough that SSML is rarely needed.
- **Azure TTS:** Full SSML support including `<phoneme>`, `<break>`, `<prosody>`, `<say-as>`. If pronunciation control is critical, Azure is the most controllable option.
- **PlayHT:** Partial SSML support. Supports basic tags.
- **Deepgram TTS:** Minimal SSML.
- **RIME:** Basic pause/break support.

**The practical reality:** Most VAPI deployments use ElevenLabs for voice quality. SSML is not the primary pronunciation control mechanism in practice. Phonetic spelling in the prompt is more reliable and provider-agnostic.

### Spacing and Hyphenation Tricks

- "clawops.com" - TTS will try to read the domain. Instruct: "When saying the website, say 'claw ops dot com'"
- Numbers: "Call us at 5 1 3, 8 5 0, 6 4 9 6" (spaced) vs "Call us at 5138506496" (will be mangled)
- Hyphens can help: "re-engage" vs "reengage" - the hyphen hints at syllable breaks

### The "Say It As Two Words" Pattern

This is the simplest and most effective pattern for brand names and jargon:

```
Pronunciation Guide:
- "ClawOps" = always say "Claw Ops" (two words)
- "GoHighLevel" = always say "Go High Level" (three words)  
- "CRM" = always say "C R M" (spell it out)
- "ROI" = always say "R O I" (spell it out)
```

Place this in a dedicated section of your prompt. The model will consistently follow these substitutions.

---

## 5. Hallucination Prevention for Voice AI

### Why Voice AI Hallucinates More

Voice AI operates under conditions that maximize hallucination risk:

1. **Speed pressure:** The model must respond quickly, reducing the effectiveness of internal "reasoning"
2. **Lower maxTokens:** Shorter responses mean the model must commit to an answer immediately without hedging
3. **Conversational momentum:** In voice, there is social pressure to keep the conversation flowing - silence feels like failure
4. **No correction loop:** In chat, the user can re-read and challenge a hallucination. In voice, false information flows past and is accepted

### Temperature as a Hallucination Lever

Lower temperature reduces hallucination but introduces trade-offs:

| Temperature | Hallucination Risk | Voice Quality | Use Case |
|-------------|-------------------|---------------|----------|
| 0.1-0.2 | Very low | Robotic, repetitive | Medical, legal, compliance |
| 0.3-0.5 | Low | Slightly stiff but reliable | Sales, support (recommended) |
| 0.5-0.7 | Moderate | Natural, varied | General conversation |
| 0.7+ | High | Very natural but risky | Entertainment only |

For ClawOps sales agents, **0.3-0.5 is the recommended range**.

### The Grounding Rules Pattern

This is the most effective anti-hallucination technique for voice AI:

```
## Grounding Rules (HIGHEST PRIORITY)

You ONLY have knowledge of the following facts. If a question falls outside these facts, say "That's a great question - I want to make sure I get you the right answer. Let me have someone from our team follow up on that specifically."

APPROVED FACTS:
- ClawOps provides AI voice agent solutions for businesses
- Pricing starts at $497/month for the base package
- Setup takes 5-7 business days
- We integrate with GoHighLevel, HubSpot, and Salesforce
[... complete fact list ...]

FORBIDDEN TOPICS (redirect to human):
- Specific legal claims or guarantees
- Competitor pricing
- Technical implementation details beyond the basics
- Custom enterprise pricing
```

The critical element is the **explicit fallback phrase.** Without it, the model will attempt to answer anyway. The fallback must be a natural-sounding sentence that redirects without sounding like a broken bot.

### maxTokens as a Hallucination Limiter

Setting `maxTokens` to 100-200 constrains the model's ability to hallucinate. Hallucination tends to increase with response length - the model starts confident, then drifts. By capping response length:

- The model stays in "high confidence" territory for its entire response
- There is no room for the "let me also add..." drift that introduces false information
- Responses stay focused on the most relevant point

---

## 6. Filler Word Prevention

### Why "Don't Say Um" Doesn't Work

LLMs are trained on human conversational data that includes filler words. When you write "Do not say um, uh, or like," you are using a **negative instruction** - telling the model what NOT to do. Negative instructions are inherently weak in neural networks because:

1. The model must first activate the concept of "um" to understand the prohibition
2. Activation of the concept increases the probability of generating it
3. Under time pressure (low maxTokens, fast inference), the model falls back to high-frequency patterns from training data
4. Filler words are extremely high-frequency in conversational training data

### What Actually Works

**The vocabulary exclusion framing:**

```
Your vocabulary does not contain filler words. The sounds "um", "uh", "er", "like" (as filler), "you know", "so yeah", and "basically" do not exist in your speech patterns. You speak with clean, confident delivery.
```

This reframes the constraint as an identity statement rather than a prohibition. The model is not being told to suppress something - it is being told these tokens are not part of its character's vocabulary. This is measurably more effective.

**The silence-over-filler pattern:**

```
If you need a moment to formulate your response, use a brief natural pause. Never fill silence with filler sounds. A clean pause is always better than a filler word.
```

Note: In practice, the model does not actually "pause" - it either generates tokens or does not. But this instruction reinforces the pattern of starting responses with substantive content rather than filler.

### Temperature's Role

Lower temperature (0.2-0.4) significantly reduces filler words because:

- Filler words are moderate-probability tokens that get suppressed when temperature is low
- The model selects higher-confidence tokens, which tend to be substantive words
- Trade-off: Very low temperature can make the agent sound flat and repetitive

The recommended approach is **temperature 0.3-0.5 combined with vocabulary exclusion framing.**

---

## 7. Turn-Taking and Response Length

### Preventing the AI from Talking Over People

VAPI handles barge-in (interruption) at the platform level with `silenceTimeoutSeconds` and related parameters. But prompt design also matters:

- **Short responses** naturally create more conversational turns, giving the caller more opportunities to speak
- **Question-ending responses** signal to the platform (and the caller) that it is their turn
- **Avoid monologues** - any response longer than 3 sentences increases the chance of overlap

### silenceTimeoutSeconds

This parameter controls how long VAPI waits after detecting silence before assuming the caller is done speaking:

- **Default (~1.5-2.0s):** Works for most cases
- **Lower (0.5-1.0s):** More responsive but may cut off slow speakers or people who pause mid-thought
- **Higher (2.5-3.0s):** Better for complex topics where callers think before responding, but feels sluggish for simple Q&A

For sales calls, **1.0-1.5 seconds** is recommended. It keeps the conversation flowing without cutting off prospects who are thinking about their pain points.

### Why "Keep Responses to 1-2 Sentences" Gets Ignored

This is one of the most common complaints in the VAPI community, and it has a clear explanation:

LLMs are instruction-following systems, but they are **also pattern-completion systems.** If your prompt contains examples, long explanations, or multi-paragraph sections, the model learns from those patterns. If your prompt says "keep responses to 1-2 sentences" but your prompt itself contains 50-word example responses, the model will follow the example over the rule.

### The Character-Count Constraint Technique

Instead of vague length instructions, use specific constraints:

```
RESPONSE LENGTH: Every response must be under 40 words. This is a hard limit, not a suggestion. If you cannot answer in under 40 words, give the most important point first and ask if they want more detail.
```

Why this works better than "1-2 sentences":
- "40 words" is concrete and measurable
- "Hard limit" signals priority
- The fallback instruction gives the model a way to comply even for complex questions

Even more effective: **provide only short examples throughout the entire prompt.** If every example response in your prompt is 15-30 words, the model learns the pattern implicitly.

### Post-Goodbye Protocol

One of the most awkward voice AI failures is the agent continuing to talk after the caller says goodbye. This requires explicit handling:

```
## Call Ending Protocol
When the caller says goodbye, thank you, or indicates they are done:
1. Deliver ONE brief closing line (under 15 words)
2. Do NOT ask follow-up questions
3. Do NOT add "Is there anything else I can help with?"
4. Do NOT continue speaking after your closing line
5. Example closing: "Thanks for your time, [name]. We'll be in touch. Have a great day."
```

The "do NOT ask follow-up questions" rule is critical. The model's default behavior is to keep the conversation going. You must explicitly override this at call-end.

---

## 8. Structural Best Practices for VAPI Prompts

### Priority Ordering

LLMs weight instructions at the beginning of the system prompt more heavily. Structure accordingly:

```
1. Identity + Anti-hallucination rules (HIGHEST PRIORITY)
2. Response format rules (length, tone, filler prevention)
3. Core knowledge / approved facts
4. Conversation flow / objection handling
5. Call ending protocol
6. Edge cases
```

### The Persona Block Pattern

Lead your prompt with a tight identity block:

```
## Identity
You are Sarah, a senior solutions consultant at Claw Ops. You have 8 years of experience helping businesses automate their customer communications. Your tone is warm, confident, and professional. You speak in short, clear sentences. You never rush the caller.

Voice characteristics: Calm, measured pace. Slight enthusiasm when discussing solutions. Never pushy or aggressive.
```

This "persona block" does heavy lifting: it sets tone, pace, vocabulary level, and conversational style in a compact format. The model references this implicitly throughout the conversation.

### Section Headers as Anchors

Use clear markdown headers (##) as section dividers. While LLMs do not parse markdown structurally, the headers serve as semantic anchors that help the model locate and weight relevant instructions:

```
## RULES (Never Violate)
## KNOWLEDGE BASE
## CONVERSATION FLOW
## OBJECTION RESPONSES
## CALL ENDING
```

The model can effectively "scan" for relevant sections based on conversational context.

### Example Compliance

Every example in your prompt must comply with your own rules. This is the most common prompt engineering mistake:

**Bad:**
```
Rule: Keep responses under 30 words.
Example: "That's a fantastic question! So what we do at ClawOps is provide a comprehensive suite of AI-powered voice agent solutions that help businesses automate their inbound and outbound calling processes while maintaining a personal touch that customers love."
(This example is 42 words and violates the rule.)
```

**Good:**
```
Rule: Keep responses under 30 words.
Example: "Great question. We build AI voice agents that handle your calls automatically. Saves your team 20+ hours a week. Want to hear how it works?"
(28 words. Rule-compliant.)
```

**The model will copy example patterns even when they contradict explicit rules.** Always audit examples against rules.

### Dynamic Variable Injection

VAPI supports template variables in system prompts and firstMessage:

```
firstMessage: "Hi {{name}}, this is Sarah from Claw Ops. Thanks for booking time with us today."

System prompt: "You are calling {{name}} from {{company}}. They signed up for a demo on {{signup_date}}. Their main interest is {{interest_area}}."
```

These variables are interpolated before the prompt reaches the LLM. Use them to:

- Personalize every call without maintaining separate prompts
- Inject CRM data (name, company, deal stage, previous interactions)
- Customize the knowledge base per caller segment

### Conditional Logic for Niche-Specific Content

For agencies serving multiple verticals, use conditional blocks:

```
{{#if industry === "dental"}}
## Industry Knowledge: Dental
- Average patient lifetime value: $10,000-15,000
- Key pain points: no-shows, new patient acquisition, insurance billing
- Competitors they may mention: Weave, RevenueWell, Dentrix
{{/if}}

{{#if industry === "hvac"}}
## Industry Knowledge: HVAC
- Average job value: $3,000-8,000
- Key pain points: missed calls during peak season, after-hours service requests
- Competitors they may mention: ServiceTitan, Housecall Pro
{{/if}}
```

Note: VAPI's native templating supports basic interpolation. For complex conditional logic, use the server-side `assistant-request` webhook to dynamically construct the prompt before VAPI receives it. This is the recommended pattern for multi-niche agencies.

### The Complete Structural Template

```
## Identity
[Persona block: name, company, role, tone, voice characteristics]

## Rules (HIGHEST PRIORITY - Never Violate)
[Anti-hallucination grounding rules]
[Response length constraints]
[Filler word vocabulary exclusion]
[Pronunciation guide]

## Knowledge Base
[Approved facts only - structured as bullet points]

## Conversation Flow
[Stage 1: Greeting → Discovery]
[Stage 2: Discovery → Pitch]  
[Stage 3: Pitch → Close/Book]
[Stage 4: Objection handling]

## Call Ending Protocol
[Goodbye detection → single closing line → stop]

## Edge Cases
[What to do when asked about competitors]
[What to do when asked about pricing outside approved ranges]
[What to do when caller is angry/confused]
```

---

## Summary: The ClawOps VAPI Prompt Engineering Checklist

Before deploying any voice agent, verify:

- [ ] System prompt is under 2,500 words
- [ ] `firstMessage` is set (not generated by LLM)
- [ ] Temperature is 0.3-0.5
- [ ] `maxTokens` is 150-250
- [ ] `silenceTimeoutSeconds` is 1.0-1.5 for sales calls
- [ ] All brand names have pronunciation guides
- [ ] Grounding rules section exists with explicit fallback phrases
- [ ] Filler words addressed via vocabulary exclusion (not prohibition)
- [ ] All examples in the prompt comply with the prompt's own rules
- [ ] Response length constraint is specific (word count, not "short")
- [ ] Post-goodbye protocol prevents follow-up questions
- [ ] Dynamic variables are used for personalization
- [ ] Priority ordering: identity > rules > knowledge > flow > edge cases

---

*This document is a living reference. Update it as VAPI's platform evolves and as we accumulate production data from deployed agents.*
