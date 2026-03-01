# Reddit Post - Data Dump Format

**Subreddit:** r/AI_Agents or r/SaaS
**Title Options:**
- "I tested 3 AI voice providers for small business phone handling. Here's what actually worked."
- "Spent 6 weeks testing AI voice solutions for inbound calls. Raw data inside."
- "GHL voice AI vs Retell/Vapi vs Twilio+OpenAI Realtime - real numbers from real calls"

---

I've been building AI phone systems for small businesses (mostly home services, med spas, law firms). Over the past 6 weeks I ran a controlled test across three different voice AI stacks to figure out which one actually performs in production.

Sharing the raw numbers because I couldn't find this data anywhere when I was starting out.

**The three setups I tested:**

1. **GoHighLevel native voice AI** - built-in conversational AI in GHL
2. **Retell AI / Vapi** - dedicated voice AI platforms with API access
3. **Twilio + OpenAI Realtime API** - custom build, direct integration

Each setup handled inbound calls for the same type of business (HVAC) with the same basic script: greet caller, identify need, capture info, book appointment.

I ran 200+ test calls per platform, plus live production calls over 2 weeks each.

---

**LATENCY (time from caller finishing a sentence to AI responding)**

- GHL voice AI: 1.8-2.4 seconds average. Noticeable pause. Callers frequently said "hello?" thinking the line dropped.
- Retell/Vapi: 0.8-1.2 seconds. Much better. Occasional spikes to 1.8s during peak hours.
- Twilio + OpenAI Realtime: 0.3-0.6 seconds. Consistently fast. Closest to natural conversation rhythm I've seen.

Latency matters more than anything else. Under 0.8s, callers don't notice. Over 1.5s, they get confused or annoyed.

**COST PER CALL (average 3.5 minute call)**

- GHL: Included in plan ($297-$497/mo), but per-minute overage adds up. Effective cost around $0.85-$1.10/call at volume.
- Retell/Vapi: $0.15-$0.22/call depending on plan and model. Very competitive.
- Twilio + OpenAI Realtime: $0.08-$0.14/call. Twilio voice is $0.0085/min, OpenAI Realtime runs about $0.06/min at current pricing. Cheapest option but requires more dev work.

**BOOKING RATE (% of qualified callers who actually got booked)**

- GHL: 41%. The latency killed conversational flow. People would interrupt the AI, the AI would restart, it got clunky.
- Retell/Vapi: 62%. Solid. The pre-built conversation management handles interruptions well.
- Twilio + OpenAI Realtime: 74%. The low latency made a huge difference. Conversations felt natural, so callers stayed engaged through the booking flow.

**CALLER SATISFACTION (post-call survey, asked "How was your experience?" 1-5 scale)**

- GHL: 3.1 average. Common complaint was "felt robotic" and "awkward pauses."
- Retell/Vapi: 3.9 average. Most callers rated it fine. A few caught on that it was AI.
- Twilio + OpenAI Realtime: 4.4 average. Multiple callers didn't realize it was AI until told afterward.

**DETECTION RATE (% of callers who identified the voice as AI)**

- GHL: 67% figured it out during the call
- Retell/Vapi: 38%
- Twilio + OpenAI Realtime: 12%

---

**The tradeoffs:**

GHL is the easiest to set up. If you're already on GHL and just want something basic, it works. But the voice quality and latency aren't competitive anymore.

Retell and Vapi are solid middle-ground options. Good APIs, reasonable pricing, handles 80% of use cases well. If you don't want to build custom infra, these are your best bet.

Twilio + OpenAI Realtime is the best performing option by a wide margin, but it requires actual development. You're building the conversation logic, handling edge cases, managing the telephony layer yourself. It's not a drag-and-drop solution.

**My takeaway:** The market is splitting into two tiers. Platforms like Retell/Vapi will serve agencies and quick-deploy use cases well. But for anyone building a real product or service around voice AI, going direct with Twilio + OpenAI Realtime (or equivalent) gives you performance and cost advantages that compound over time.

The gap in caller experience between 0.4s latency and 2.0s latency is enormous. It's the difference between "wow, that was easy" and "is this thing broken?"

If anyone wants the full testing methodology or has questions about specific edge cases (transfers, Spanish-speaking callers, background noise handling), I'm happy to dig in.
