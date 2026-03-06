# GHL Voice AI Prompt Engineering Playbook
## ClawOps AI Receptionist - Home Service Businesses

**Last Updated:** March 5, 2026
**Authors:** Jordan (CRO) + Ethan (CTO)
**Status:** Research-backed, ready for implementation

---

## Table of Contents

1. [Prompt Architecture Fundamentals](#1-prompt-architecture-fundamentals)
2. [System Prompt Structure](#2-system-prompt-structure)
3. [Making the AI Sound Human](#3-making-the-ai-sound-human)
4. [Voice Selection Guide](#4-voice-selection-guide)
5. [LLM Settings That Matter](#5-llm-settings-that-matter)
6. [Home Service Industry Prompt Templates](#6-home-service-industry-prompt-templates)
7. [Handling Common Scenarios](#7-handling-common-scenarios)
8. [Workflow Integration Tips](#8-workflow-integration-tips)
9. [Testing and Iteration Protocol](#9-testing-and-iteration-protocol)

---

## 1. Prompt Architecture Fundamentals

### Keep Prompts Short and Focused

The single biggest mistake people make with GHL Voice AI is writing massive prompts. A Reddit user reported using **68K tokens** for their voice AI prompt and asked the community if it was too much. The consensus: absolutely yes.

**Why shorter prompts win for voice:**

- Every extra token adds processing time before the AI responds, directly increasing latency
- Voice AI does not need the same depth as a chatbot; callers ask one thing at a time
- The LLM processes the entire system prompt on every turn of conversation
- Shorter prompts produce shorter, more natural-sounding responses

**Target prompt length:** 500-1,500 tokens max for the system prompt. If you are over 2,000 tokens, you are hurting performance.

**How to get there:** Strip out every instruction that does not directly affect what the AI says on a phone call. Move FAQ data into GHL's knowledge base/custom values instead of stuffing it all in the prompt.

### Prompt Structure: The Voice-First Framework

Voice prompts need a fundamentally different structure than chatbot prompts. Callers cannot scroll back, re-read, or click links. Everything must be optimized for spoken delivery.

```
[IDENTITY] - Who you are (1-2 sentences)
[RULES] - How you behave (bullet points, max 8)
[GOALS] - What you are trying to accomplish (max 3)
[SCENARIOS] - How to handle specific situations (if/then format)
[FALLBACK] - What to do when you don't know something
```

---

## 2. System Prompt Structure

### Copy-Paste Template: HVAC Receptionist

```
You are Jordan, the receptionist at [BUSINESS_NAME]. You answer calls professionally but warmly, like a real person who has worked at this company for years.

RULES:
- Keep every response under 2 sentences when possible
- Never list more than 3 options at once
- If you don't know something, say "Let me get that information for you" and offer to have someone call back
- Always confirm the caller's name and phone number before booking
- Never discuss pricing specifics; say "Pricing depends on the specific situation, but we can get you a free estimate"
- If the caller seems upset or has an emergency, prioritize getting them to a live person fast
- Speak naturally; use contractions (don't, we'll, that's)
- If asked about competitor pricing or why your company is better, keep it brief and positive

GOALS:
1. Book an appointment or service call
2. Collect caller name, phone, address, and service needed
3. If you cannot help, transfer to a live team member

SCENARIOS:
- Emergency (no heat, gas smell, flooding): "That sounds urgent. Let me get you connected with our emergency team right away." [Transfer to live agent]
- Booking request: Collect name, phone, address, and best time. Confirm details back to them before booking.
- Pricing question: "Every job is a little different, so pricing depends on what we find. The good news is we offer free estimates. Want me to get one scheduled for you?"
- Existing customer with issue: "I'm sorry you're dealing with that. Let me pull up your information and get this sorted out."

FALLBACK:
If you are unsure about any technical question, say: "That's a great question. I want to make sure I give you the right answer, so let me have one of our technicians follow up with you. Can I grab your number?"
```

### Key Principles in This Template

**Short identity.** One sentence. The AI knows who it is and does not ramble about it.

**Rules as constraints.** Each rule prevents a specific failure mode. "Never list more than 3 options" stops the AI from reading a menu. "Keep responses under 2 sentences" prevents monologues that feel robotic.

**Goals ranked by priority.** The AI knows what matters most and optimizes for it.

**Scenarios with exact phrasing.** When the AI encounters a known situation, it has pre-written language that sounds natural. This is faster than generating from scratch.

**Fallback as safety net.** The AI always has an exit path that does not frustrate the caller.

---

## 3. Making the AI Sound Human

### What Actually Works (From Real Deployments)

Based on research across Reddit r/gohighlevel, community forums, and agency owner reports:

**1. Use contractions everywhere.**

Bad: "I would be happy to schedule that for you."
Good: "I'd love to get that scheduled for you."

Bad: "We do not have availability on Friday."
Good: "We don't have anything open Friday, but Thursday looks great."

**2. Add brief acknowledgment phrases before responding.**

Instead of immediately answering, the AI should acknowledge what the caller said:

- "Sure thing."
- "Got it."
- "Absolutely."
- "Yeah, we can definitely help with that."
- "Oh, I hear you."

Add this to your prompt:
```
Before answering a question, briefly acknowledge what the caller said with a short phrase like "Sure thing," "Got it," or "Absolutely." Then give your answer.
```

**3. Use conversational transitions, not robotic connectors.**

Bad: "Additionally, we offer financing options."
Good: "Oh, and just so you know, we've got financing too if that helps."

**4. Allow the AI to express mild personality.**

```
You have a friendly, slightly upbeat personality. You genuinely care about helping callers solve their problems. If something sounds frustrating, acknowledge it. If something is good news, sound a little excited about it.
```

**5. Keep response length SHORT for voice.**

This is the number one differentiator between AI that sounds human and AI that sounds robotic. Long responses are the enemy.

```
CRITICAL RULE: Keep every response to 1-2 sentences maximum. If you need to give more information, pause and ask if they want to hear more. Callers on the phone lose patience fast.
```

**6. Handle interruptions gracefully.**

GHL Voice AI supports barge-in (the caller can speak while the AI is talking). Your prompt should account for this:

```
If the caller interrupts you, stop immediately and listen. Do not try to finish your sentence. Respond to whatever they said.
```

**7. Use filler phrases when "thinking."**

```
If you need a moment to process something, use a brief filler like "Let me check on that..." or "One sec..." before responding. This sounds more natural than silence.
```

### What Makes Voice AI Sound Robotic (Avoid These)

- Responding with bullet points or numbered lists (callers hear "Number one... number two..." and zone out)
- Starting every response with the caller's name ("John, we can definitely help with that. John, let me check...")
- Using formal language ("I would like to inform you that...")
- Giving long explanations when a simple answer works
- Not varying tone between casual questions and urgent situations
- Repeating the same phrases ("Great question!" after every question)

---

## 4. Voice Selection Guide

### GHL Native Voices

GHL offers voices through multiple providers. As of early 2026, the available options include:

| Voice | Accent | Gender | Best For | Notes |
|-------|--------|--------|----------|-------|
| Archer | British English | Male | Professional services | Currently used by ClawOps. Sounds polished but may feel formal for blue-collar trades. |
| Various ElevenLabs voices | Multiple | Multiple | High naturalness | Most natural-sounding but add latency |
| PlayHT voices | Multiple | Multiple | Fast response | Generally faster than ElevenLabs |
| GHL Native/Default voices | American | Multiple | Balance of speed and quality | Best latency, decent quality |

### Recommendations for Home Service Businesses

**For HVAC/Plumbing/Electrical (blue-collar trades):**

Consider switching from Archer (British, male) to an **American English voice** that sounds warm and approachable. Home service customers calling about a broken AC or leaky pipe want someone who sounds like the person next door, not a British concierge.

**Voices to test:**
- A female American voice tends to test well for receptionist roles (based on multiple agency reports on Reddit)
- Male American voices work well if the business brand is more "rugged" or "guy's guy"
- Avoid overly polished or corporate-sounding voices

**NOTE:** GHL regularly updates its voice library. Test the current options by calling your own number and having a full conversation. The voice that reads well in a demo clip may sound different in a real phone call with background noise and interruptions.

**Action item:** Switch to an American English voice and A/B test call completion rates vs. the current Archer voice.

---

## 5. LLM Settings That Matter

### Current Setup Analysis

- **LLM:** GPT 5.1 ($0.016/min LLM, $0.076/min total)
- **Total cost per minute:** $0.076

### LLM Comparison for Voice AI

| LLM | Speed | Quality | Cost/Min (LLM) | Recommended For |
|-----|-------|---------|-----------------|-----------------|
| GPT 4o | Fast | Good | ~$0.008-0.012 | Best balance of speed and quality for most voice use cases |
| GPT 5.1 | Moderate | Excellent | $0.016 | Complex conversations, nuanced responses |
| GPT 4o-mini | Very Fast | Decent | ~$0.004 | Simple call routing, basic FAQ |

**Key insight from community:** GPT 4o is the sweet spot for voice AI. It is faster than GPT 5.1 and the quality difference is negligible for phone conversations where responses should be short anyway. Multiple Reddit users report that faster LLMs produce noticeably better call experiences because reduced latency matters more than marginally better language quality.

**Recommendation:** Test GPT 4o for 1 week and compare call completion rates and customer satisfaction against GPT 5.1. The cost savings and speed improvement may be significant.

### Temperature Setting

- **For receptionist/booking:** 0.3-0.5 (low randomness, consistent responses)
- **For conversational/sales:** 0.5-0.7 (slightly more natural variation)
- **Avoid:** Anything above 0.8 for voice (responses become unpredictable)

**Where to set:** Settings > Voice AI > Agent Configuration > Advanced Settings (or LLM Configuration section depending on your GHL version)

### Response Length Limits

If GHL exposes a max response tokens setting:
- Set it to **100-150 tokens max** for voice responses
- This forces the AI to be concise
- Long responses on the phone are the #1 killer of natural conversation

---

## 6. Home Service Industry Prompt Templates

### Template: Plumbing Company

```
You are [NAME], the receptionist at [BUSINESS_NAME]. You're friendly, efficient, and know the basics about plumbing services.

RULES:
- Keep responses to 1-2 sentences max
- Use contractions and casual language
- If it sounds like an emergency (burst pipe, flooding, sewage backup, no hot water in winter), treat it urgently
- Never quote prices; always offer a free estimate instead
- Collect: name, phone, address, and what's going on

EMERGENCY HANDLING:
If the caller describes any of these: flooding, burst pipe, sewage backup, gas smell near water heater, or no water at all, say: "Okay, that sounds like it needs immediate attention. Let me get our emergency team on the line for you right away." Then transfer.

BOOKING:
"What day works best for you? We've got [available slots]. I'll get you locked in."

PRICING REDIRECT:
"Honestly, every job's a little different once we get eyes on it. But the estimate is free, so there's no risk in having us come take a look. Want me to set that up?"
```

### Template: Electrical Company

```
You are [NAME], the receptionist at [BUSINESS_NAME]. You're knowledgeable, calm, and professional. Electrical issues can be scary for homeowners, so you reassure them.

RULES:
- Keep responses short and clear
- Electrical emergencies (sparking, burning smell, exposed wires, total power loss) get transferred immediately
- Never give DIY electrical advice; always recommend a professional visit
- Collect: name, phone, address, and description of the issue

EMERGENCY HANDLING:
If the caller mentions sparking, burning smells, exposed wires, or anything that sounds dangerous: "I want to make sure you're safe. Don't touch anything near the issue, and let me get our emergency electrician connected with you right now." Then transfer.

BOOKING:
"Let's get one of our electricians out to take a look. What day works best for your schedule?"

WHEN UNSURE:
"I want to make sure our guys come prepared, so let me have a technician give you a quick call back. They can ask the right questions and get you scheduled. Sound good?"
```

### Template: Roofing Company

```
You are [NAME], the receptionist at [BUSINESS_NAME]. You're friendly and straightforward. Roofing customers often call after storms or when they notice a leak, so they might be stressed.

RULES:
- Keep it brief
- If there's an active leak, treat it as urgent
- Storm damage calls should be prioritized and mention insurance if relevant
- Collect: name, phone, address, type of roof issue, and when it started
- Never give estimates over the phone; always schedule an inspection

STORM DAMAGE:
"After a storm like that, it's really smart to get an inspection done. We can come out, check everything, and if there's damage, we'll help you through the insurance process too. Want me to get that scheduled?"

ACTIVE LEAK:
"An active leak is something we want to get on top of quick. Let me see what we've got available this week to get someone out there."

GENERAL INQUIRY:
"The best thing is to have one of our guys come out and take a look. The inspection is free, and they'll be able to tell you exactly what's going on. When works for you?"
```

---

## 7. Handling Common Scenarios

### Hold Requests

```
If the caller asks you to hold or says "hang on a second":
- Say "Sure, take your time" and wait silently
- Do not keep talking or ask questions while they are away
- When they come back, say "Welcome back" or "I'm here" and continue
```

### Transfer Requests

```
If the caller asks to speak to a real person or a manager:
- Do not argue or try to convince them to stay with you
- Say "Of course, let me get you connected" and transfer immediately
- Never make a caller feel bad for wanting a human
```

### Objection Handling (When Caller is Hesitant to Book)

```
OBJECTION: "I'm just calling around for prices"
RESPONSE: "Totally get it. The nice thing is our estimate is completely free, so you can compare us against anyone else with real numbers. Want me to get one on the books?"

OBJECTION: "I need to talk to my spouse first"
RESPONSE: "Makes total sense. Want me to send you a text with our info so you have it handy when you chat with them?"

OBJECTION: "Can you just tell me roughly what it costs?"
RESPONSE: "I wish I could give you a solid number, but it really depends on what we find. Our guys won't charge you just to come look, though. Want to set up a quick visit?"
```

### FAQ Responses

Keep FAQ answers short for voice. Use GHL's custom fields or knowledge base to store answers, and instruct the AI:

```
When answering FAQ questions, give the shortest accurate answer possible. If the caller needs more detail, they'll ask follow-up questions. Do not dump all information at once.
```

### After-Hours Handling

```
If calling outside business hours (defined in your GHL calendar):
"Hey, thanks for calling [BUSINESS_NAME]. We're closed for the day, but I can take down your info and have someone reach out first thing tomorrow. If this is an emergency, I can connect you with our on-call team. What's going on?"
```

---

## 8. Workflow Integration Tips

### Critical: Tag Timing Issues

From a highly upvoted Reddit post about GHL mistakes:

> **"Add a Wait step before every If/Else branch that checks tags."** Voice AI tags write POST-CALL. The tag does not exist until the call fully ends and the system processes it. Use a **60-second minimum Wait** after a Voice AI call before any If/Else that checks for tags set by the voice agent.

### Recommended Post-Call Workflow

```
Trigger: Voice AI Call Ended
  |
  v
Wait 60 seconds (let tags write)
  |
  v
If/Else: Check "appointment_booked" tag
  |
  YES --> Send confirmation SMS + add to pipeline "Booked"
  NO --> Check "wants_callback" tag
          |
          YES --> Add to pipeline "Callback Needed" + notify team
          NO --> Add to pipeline "Follow Up" + send nurture SMS in 2 hours
```

### Voice AI Goals (Tag Configuration)

In the GHL Voice AI agent settings, define clear goals that write tags:

```
Goal 1: Book appointment --> Tag: "appointment_booked"
Goal 2: Caller wants callback --> Tag: "wants_callback"  
Goal 3: Emergency transfer --> Tag: "emergency_transferred"
Goal 4: Just gathering info --> Tag: "info_gathering"
```

**Where to configure:** Go to your GHL Location > Conversations > Voice AI > Agent > Goals section

### A2P 10DLC Registration

From the same Reddit mistakes post: **Check your A2P 10DLC registration status.** If your number is not registered, SMS follow-ups after calls will silently fail. They show as "sent" in GHL but never arrive. Go to Settings > Phone Numbers > A2P and verify registration status before running any campaigns.

---

## 9. Testing and Iteration Protocol

### Before Going Live

1. **Call yourself.** Every time you change the prompt, call the number and have a full conversation. What looks perfect on paper can sound wrong when spoken aloud (confirmed by multiple Reddit users).

2. **Test edge cases:**
   - Interrupt the AI mid-sentence
   - Ask something completely off-topic
   - Pretend to be angry
   - Ask for pricing repeatedly
   - Say "hang on" and come back after 30 seconds
   - Ask to speak to a person

3. **Listen to recordings.** After the first 10 live calls, listen to every single one. Note where the AI stumbled, where it sounded robotic, and where callers seemed confused or frustrated.

### Ongoing Optimization

- **Weekly:** Listen to 5-10 call recordings and identify patterns
- **Bi-weekly:** Update prompt based on findings
- **Monthly:** Review booking conversion rate from AI-handled calls vs. human-handled calls
- **Quarterly:** Test different voices and LLM models

### Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Call completion rate | >85% | Calls where AI completes conversation vs. caller hangs up early |
| Booking conversion | >25% of eligible calls | Appointments booked / total non-emergency calls |
| Transfer rate | <20% | Calls requiring human transfer / total calls |
| Average call duration | 1-3 minutes | GHL call analytics |
| Customer satisfaction | No complaints | Client feedback and review monitoring |

---

## Quick Reference: The 10 Rules That Matter Most

1. Keep responses to 1-2 sentences
2. Use contractions and casual language
3. Acknowledge before answering ("Got it," "Sure thing")
4. Never list more than 3 options at once
5. When unsure, offer a callback instead of guessing
6. Test by calling yourself after every prompt change
7. Use American English voices for home service businesses
8. Set temperature to 0.3-0.5 for receptionist use
9. Add 60-second Wait before tag-checking If/Else branches
10. Keep your system prompt under 1,500 tokens

---

## Sources and References

- Reddit r/gohighlevel: "Using 68k tokens for my voice AI prompt - is it too much?"
- Reddit r/gohighlevel: "What I learned building a voice AI booking agent"
- Reddit r/gohighlevel: "10 GHL mistakes that cost me real money"
- Reddit r/gohighlevel: "If you're trying to learn GoHighLevel AI"
- Reddit r/gohighlevel: "Built an AI voice calling system that actually works"
- Reddit r/gohighlevel: "Does anyone regret using GHL for voice AI?"
- Reddit r/gohighlevel: "GHL resellers burning home service businesses"
- Reddit r/gohighlevel: "Just added an AI voice agent to a few GHL client accounts"
- Reddit r/Entrepreneur: "Why is it so difficult to sell AI voice agent services"
- GHL Help Center: Voice AI Agent documentation
- Multiple agency owner reports from GHL community forums

---

*This playbook is based on real-world reports from GHL users and agencies. Some specific settings or menu paths may change as GHL updates their platform. Always verify current UI paths against the latest GHL documentation.*
