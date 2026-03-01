# Ethan's Tech Research Sprint - March 1, 2026
## ClawOps CTO Research | $0 -> $100K by March 31

---

## 1. OpenAI SIP Connector / Realtime API - Real-World Intelligence

**Status: Very few direct Reddit discussions this week about OpenAI SIP Connector specifically.**

The SIP connector is still early enough that Reddit chatter is thin. What IS being discussed heavily:

### Voice Agent Production Realities (from r/AI_Agents)
- **Memory Architecture** is the hot topic for production voice agents. A highly detailed post covers 4 key decisions:
  1. **Per-round vs per-session memory writes** - Per-round is resilient to dropped sessions but noisier. Per-session is cleaner but loses data on drops.
  2. **Async writes are load-bearing** - You MUST keep memory writes off the critical path. Voice latency budgets are tight.
  3. **Scoping problem** - Knowing WHICH memory to surface is harder than storing it. Surfacing yesterday's grocery list during a work call = terrible UX.
  4. **Memory decay** - Episodic stuff ("we discussed X Tuesday") decays differently than core state ("user prefers Y").
  - **ClawOps Takeaway**: If we're building voice agents for clients, memory architecture is a differentiator. Most agencies slap on a basic RAG and call it done. Proper memory scoping = stickier product.

- **Production vs Testing Gap** (3 upvotes, active discussion):
  - Latency spikes: 200ms in testing, 5+ seconds randomly in production
  - Context window explosions from real user behavior
  - Rate limits hit at 100+ concurrent users
  - Model provider silent updates break prompts
  - **Key advice**: Graceful degradation everywhere, aggressive timeout guards, context window budgets, model version pinning
  - **ClawOps Takeaway**: We need to build these resilience patterns into our platform from day one. This is what separates toy demos from production systems.

### What's NOT Being Discussed
- Almost zero posts about OpenAI SIP Connector latency numbers or deployment gotchas
- The connector seems too new for widespread production deployment discussion
- Most voice AI builders are still using Vapi/Retell/Pipecat as their telephony bridge

---

## 2. Vapi vs Retell vs Bland - This Week's User Sentiment

### r/AI_Agents Activity (Very Active This Week)

**Key Post: "Showcasing building a voice AI agent (Live, Free, no BS) - 1M+ minutes of AI calling"** (13 upvotes, 20 comments)
- Someone with serious production experience (1M+ minutes) doing live training
- Signals: market is hungry for practical, no-BS voice agent education
- People want to see REAL implementations, not marketing fluff

**Key Post: "If You're Building AI Agents, Read This Before You Over-Engineer"** (49 upvotes, 14 comments)
- Written by someone building conversational voice agents in production
- Handling interruptions, language switching mid-sentence, structured outputs to live systems
- High engagement = people are struggling with this exact problem

**Key Post: "How critical is warm transfer quality in voice AI?"** (8 upvotes)
- SigmaMind AI team asking about warm transfer
- Full context + summary passed to human agent on transfer
- This is a KEY feature prospects care about

### r/gohighlevel (GHL Users - Our Target Market)

**CRITICAL FINDING: GHL users are hitting walls with native Voice AI:**
1. **Spanish email spelling broken** - Voice AI can't properly spell out email addresses in Spanish
2. **Consent/opt-out fields being ignored** - Technical gap in GHL's internal mapping. Post explicitly mentions "without using 3rd party API (Vapi/Retell)" - meaning GHL users know about these alternatives
3. **Workflow timing bugs** - Tags don't write to contact records fast enough, causing If/Else branches to break after Voice AI calls. Fix: add Wait steps.
4. **16 reproducible pipeline failure modes** - Someone mapped out systematic bugs in AI pipelines
5. **Custom field population failing** after Voice AI calls

**ClawOps Takeaway**: GHL's native Voice AI is buggy. Users are frustrated. This is our opening - we can offer a BETTER voice AI integration that actually works reliably with GHL's CRM. The pain is documented and real.

### r/SaaS - Voice Agent Business Building

**Key Post: "Week 1 building an AI voice agent business from scratch"** (4 upvotes, 11 comments)
- Targeting service businesses (plumbers, HVAC, roofers, dentists)
- Stat cited: businesses miss 30-40% of inbound calls
- Week 1 reality check - confirms this is a viable but competitive space

**Key Post: "Stopped calling what I sell 'AI' and started closing way more"**
- **HUGE insight**: Local business owners don't care about "AI-powered" anything
- Switched to describing OUTCOMES: "never miss a call again" vs "AI voice agent"
- Plumbers, gym owners, home health companies just want the result
- **ClawOps Takeaway**: Our sales messaging needs to lead with business outcomes, not tech. "Your phones are answered 24/7" not "AI voice agent platform"

---

