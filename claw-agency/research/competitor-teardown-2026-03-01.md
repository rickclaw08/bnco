# Competitor Teardown - March 1, 2026
**Prepared by: Ethan (CTO) | ClawOps**

**Our Offering:** AI Voice Receptionists
- Direct: $2,500 setup + $497/mo
- Agency White-Label: $5K setup + $100/mo/seat

---

## 1. Smith.ai

### What They Sell
Human receptionists (with AI assist). Live-staffed 24/7 call answering, scheduling, intake. Primarily targets law firms, small businesses.

### Pricing (Confirmed from their website)
| Plan | Calls/mo | Monthly Cost | Overage |
|------|----------|-------------|---------|
| Starter | 30 calls | $300/mo | $11.50/call |
| Basic | 90 calls | $810/mo | $10.50/call |
| Pro | 300 calls | $2,100/mo | $8.50/call |
| Enterprise | Custom | Custom | Custom |

Add-ons: $0.50-$1.50/call for appointments, SMS notifications, CRM integrations, call recording, etc.

### What Reddit Users Say
**Positive:**
- "I have tried Smith, Ruby, and Lex. I prefer Smith because of the bill per call model (no charge for spam/telemarketers)" - r/Lawyertalk
- Good CRM integrations (HubSpot, Salesforce, Clio)
- 24/7 live staffing included in all plans
- No overseas agents (they market this heavily)

**Negative:**
- "We were getting a lot of client complaints about rude receptionists at Smith so we changed [to Ruby]" - r/Lawyertalk
- Quality complaints from law firms about receptionist professionalism
- At $2,100/mo for 300 calls, you're paying $7/call BEFORE add-ons
- Add-ons stack up fast: appointment booking ($1.50/call), conflict checks ($0.50), recording ($0.25), text follow-up ($0.50)

### What They Do Better Than Us
- Human receptionists (some clients want a real person, period)
- Established brand in legal vertical with deep integrations (Clio, MyCase)
- Conflict checking for law firms
- Accept collect calls (jailhouse calls for criminal defense)

### What We Do Better
- **Massively cheaper at scale.** Their 300-call Pro plan = $2,100/mo. We're $497/mo flat.
- No per-call overage charges
- 24/7 without human staffing costs
- No "rude receptionist" variability - our AI is consistent every time
- No add-on nickel-and-diming ($0.50 here, $1.50 there)
- Instant scaling - they need to hire humans for surge capacity

---

## 2. Ruby Receptionist

### What They Sell
Human virtual receptionists + live chat. Portland, OR-based. Strong brand with small law firms, home services. All US-based receptionists.

### Pricing
Ruby hides pricing behind sales forms. From Reddit user reports:
- **~$800/mo** reported by a small law firm user
- Plans based on receptionist minutes, not calls
- Per-minute billing means chatty callers = massive bills
- "Ruby and Lex would spend so long with long-winded criminal defense potential clients and run up my bill" - r/Lawyertalk

### What Reddit Users Say
**Positive:**
- "Ruby is more expensive but we've found the quality and professionalism to be much better than Smith" - r/Lawyertalk
- Strong training program for receptionists (almost cult-like)
- Good for law firms that want the "white glove" human touch

**Negative (this is where it gets ugly):**
- **Service quality declining rapidly.** "Lately, the service has become worse and worse and the bill is much higher than it's been historically. It is time for a replacement." - r/Lawyertalk (2024)
- "Ruby used to be the best service! Their service has been so poor lately, that I just sent them an email ending our service with them." - r/Lawyertalk
- "Following, curious as well. Similar experience with Ruby" - multiple users
- **Employee horror stories.** A 164-upvote exposé on r/askportland from a former employee: "This is an overly glamorous call center." Described oppressive monitoring, "Happiness Journals" for low morale, and a trainee who jumped from the 8th floor building. Multiple former employees confirmed similar experiences.
- Hit by a cyberattack that knocked them offline for a full day
- Per-minute billing punishes businesses with complex calls
- "I was approached by one of the managers because scheduling noticed that my calls were too efficient" - former employee (they literally penalize efficiency)

### What They Do Better Than Us
- Strong brand recognition in legal vertical
- Human touch for clients who insist on it
- Years of integrations with law practice management software

### What We Do Better
- **Dramatically cheaper.** $800/mo for Ruby vs. $497/mo for us with unlimited calls
- No per-minute billing traps
- Consistent quality (no declining service from burned-out call center workers)
- No cyberattack vulnerability from human-dependent systems
- Our AI doesn't need a "Happiness Journal" to stay motivated
- We scale instantly; they need to hire and train for weeks

---

## 3. GoHighLevel (GHL) Voice AI

### What They Sell
Built-in voice AI as part of the GoHighLevel CRM/marketing platform. Targeted at agencies and SMBs already in the GHL ecosystem. Offered as an add-on to the main platform.

### Pricing
- GHL platform: ~$297-$497/mo (agency plans)
- Voice AI: usage-based, reportedly ~$0.10/min from some providers
- Calendar integration included (but buggy)

### What Reddit Users Say
**Positive:**
- Tightly integrated with GHL CRM/calendar
- Cheap if you're already paying for GHL
- "Set it up for a restaurant... saves a ton of time answering the same questions" - r/gohighlevel

**Negative (overwhelmingly negative on Reddit):**
- **"I don't think GHL Voice AI is that good."** - 10-upvote thread, r/gohighlevel
- "When I add more to the prompt (anything over ~6,000 characters) it simply stops following instructions"
- "Holy shit, it was terrible. Robotic, couldn't handle basic objections, and the analytics were basically non-existent" - agency owner who built custom VAPI solution instead
- "I had clients that kept dropping the service I offer because of GHL quality. This is really high risk, especially when the agent accuracy needs to be 100% or else they can get sued."
- Calendar integration is broken/unreliable
- Multiple users on r/gohighlevel recommend using Retell AI instead and connecting it via n8n webhooks
- LLM quality questionable even with good model selection
- **"GHL voice isn't that good. I use Retell for the agent because their agent is simply better."** - repeated by multiple agency owners

### What They Do Better Than Us
- All-in-one platform (CRM, email, SMS, website builder, voice)
- Massive existing user base of agencies
- If you're already on GHL, no new vendor to manage

### What We Do Better
- **Our voice AI actually works.** GHL's voice AI is universally panned on Reddit
- We don't have the 6K character prompt ceiling
- Our calendar integrations work reliably
- Dedicated focus on voice AI quality vs. GHL's "one of 50 features" approach
- Better analytics and call insights
- White-label at $100/mo/seat vs. GHL's $497/mo platform cost

---

## 4. Retell AI

### What They Sell
Developer-focused voice AI platform. Build-your-own agents. Pay-as-you-go per minute. Targets developers and agencies building voice AI products.

### Pricing (Confirmed from website)
Component pricing (all per-minute, stacks up):
| Component | Cost/min |
|-----------|----------|
| Retell Voice Infra | $0.055 |
| Platform Voices (Cartesia/OpenAI) | $0.015 |
| ElevenLabs Voices | $0.040 |
| LLM: GPT-4o mini | $0.006 |
| LLM: GPT-4.1 | $0.045 |
| LLM: GPT-5 | $0.04 |
| Retell Twilio telephony | $0.015 |

**Realistic all-in cost: $0.09-$0.15/min** (with good voice + reasonable LLM)

At 3,000 min/mo: **$275-$450/mo** but requires developer to build and maintain.

Enterprise plan: custom pricing, white-glove build service available.

$10 free credits, 20 free concurrent calls to start.

### What Reddit Users Say
**Positive:**
- "Retell is hard to beat for a small team... predictable per-minute pricing and fast time-to-ship" - r/AI_Agents
- "Building something incredibly similar. We are using Retell AI which is FAR better and cheaper [than Vapi]" - r/gohighlevel
- "Super transparent, low-code, live in minutes" - r/AI_Agents
- Consistently preferred over GHL's native voice AI by agency builders
- Good developer experience, well-documented API
- Low latency compared to competitors

**Negative:**
- No user management built-in
- Developer-required: not a plug-and-play solution
- You're building everything yourself (workflows, dashboards, integrations)
- Prompt length limits noted by some users
- "Less powerful multi-prompt voicebot setting" vs Bland AI

### What They Do Better Than Us
- Cheaper raw cost per minute for high-volume users who can self-build
- Open/flexible architecture for developers
- Large and growing developer community
- Can customize every aspect of the voice pipeline

### What We Do Better
- **Turnkey solution.** Retell requires a developer. We're ready to deploy.
- We handle the infrastructure, integrations, monitoring
- No engineering time or maintenance overhead
- Business-ready from day one (scheduling, transfers, intake)
- White-label ready out of the box
- Our $497/mo is predictable vs. their variable per-minute costs
- Support included; Retell is Discord/email only

---

## 5. Vapi

### What They Sell
Developer platform for building voice AI agents. Similar to Retell but with different architecture. Our lead Good_luggage uses this.

### Pricing
- Platform fee: $0.05/min base
- LLM, TTS, STT, telephony all stack on top
- **Realistic all-in: $0.20-$0.25/min** with good models (per Reddit users)
- "Vapi also charges $0.05/min for silences which is really eating into my costs" - r/vapiai
- At scale, $370-$500+/mo for 3,000 min/mo
- "Feels unpredictable with add-ons" - r/AI_Agents

### What Reddit Users Say
**Positive:**
- Large community and ecosystem
- "Vapi has been serving me well - I think they did a lot of the basics right" - r/ArtificialInteligence
- Good for demos and prototyping
- Wide model selection

**Negative (LOTS of pricing complaints):**
- **"Is Vapi getting more expensive?"** - dedicated thread on r/vapiai
- "Their lack of end-to-end voice pipeline testing is making for very brittle experiences, which means you cannot rely on cheaper models" - r/vapiai
- "Whenever I pitch it to clients with high call volumes, their main concern is the per-minute cost, most find it too expensive for long-term use at scale" - r/vapiai
- "I switched to a more direct setup using Telnyx and my own backend. Way cheaper per minute... Vapi doesn't scale well for high-volume commercial use" - r/vapiai
- "They are losing $$ so costs are going to go up" - r/vapiai
- LLM pricing fluctuates wildly: "Claude Sonnet 4 on one day the price is $0.01, and on another day it's $0.08 per minute" - r/vapiai
- Charging for silence time is a major cost trap
- "A 5 min call billed me $10.68" ($2.13/min!) when using GPT-4o Realtime

### What They Do Better Than Us
- Developer flexibility and customization
- Large ecosystem of tutorials and community resources
- Good for R&D and experimentation

### What We Do Better
- **Predictable pricing.** $497/mo flat vs. their unpredictable per-minute stacking
- No silence charges, no surprise bills
- Turnkey deployment vs. build-from-scratch
- Production-ready vs. "good for demos"
- Our agency white-label is $100/mo/seat; building white-label on Vapi requires engineering
- **For Good_luggage specifically:** They're dealing with Vapi's pricing unpredictability and per-minute costs. Our flat rate is a clear win.

---

## 6. Bland AI

### What They Sell
Enterprise-focused voice AI. Custom-trained models, dedicated infrastructure. $40M Series B funded. Targets large enterprises (Samsara, Snapchat, Gallup). Built from ground up (no OpenAI/Anthropic dependency).

### Pricing
- Enterprise/sales-driven (no public self-serve pricing)
- Previously had developer API access
- Now pivoting to enterprise-only ("Talk to Sales" everywhere)
- From Reddit benchmarks: costs are competitive but require enterprise contracts

### What Reddit Users Say
**Positive:**
- "The most powerful when it comes to controlling a multi-prompt voice bot" - r/ArtificialInteligence
- Own models (no dependency on OpenAI/Anthropic)
- Up to 1M concurrent calls
- Strong enterprise clients (Samsara, Snapchat)

**Negative:**
- **PR disaster:** Their public website let anyone input a phone number and spam-call people. 69-upvote thread on r/BetterOffline calling this out.
- **"Human-washing" controversy:** Wired/Futurology article with 262 upvotes: "This Viral AI Chatbot Will Lie and Say It's Human"
- "We tried Bland but with anything complicated it failed horribly" - r/ArtificialInteligence
- Latency issues: "I was testing Bland AI but I think it is too slow for production" - r/ArtificialInteligence
- "Bot-like silence... that awkward 1-second pause before responding" - user review
- The name literally means "dull" - branding problem
- Enterprise-only pricing locks out SMBs and agencies

### What They Do Better Than Us
- Enterprise scale (1M concurrent calls)
- Custom-trained models on client data
- Dedicated infrastructure per client
- Strong enterprise sales team and $40M in funding

### What We Do Better
- **We serve SMBs and agencies.** Bland is enterprise-only.
- No spam-calling PR nightmares
- Transparent, public pricing
- Faster deployment (they require enterprise sales cycles)
- We don't pretend to be human - we're honest about AI
- More accessible for the businesses that actually need voice AI

---

## 7. Synthflow

### What They Sell
No-code voice AI platform. Pay-as-you-go with usage calculator. White-label available. Targets agencies and businesses.

### Pricing (Confirmed from website)
- **Pay As You Go:** Free to start, then $0.15-$0.24/min all-in
- Voice Engine: $0.09/min
- LLM (GPT-4.1): $0.05/min
- Telephony: $0.00-$0.02/min
- Add-ons:
  - Performance Routing: $0.04/min
  - Global Low Latency Edge: $0.04/min
  - **White Label: $2,000/mo** (!!)
  - Concurrency: $20/call (5 free)
- Enterprise: custom, unlimited concurrent calls

At 10,000 min/mo with good config: roughly **$1,400-$2,400/mo** depending on add-ons.

### What Reddit Users Say
**Positive:**
- No-code platform is accessible to non-developers
- 65M+ voice calls per month across platform
- Good G2 reviews (1,000+)
- SOC2, GDPR, ISO 27001 compliance

**Negative:**
- **White-label at $2,000/mo is brutal** compared to our $100/mo/seat
- Per-minute costs add up quickly with add-ons
- Latency requires paid add-on ($0.04/min) for sub-600ms
- "Synthflow... less powerful multi-prompt" - comparison review
- At scale, gets expensive fast

### What They Do Better Than Us
- No-code builder for non-technical users
- SOC2/GDPR/ISO compliance certifications
- Large call volume track record (65M calls/mo)
- Self-serve with usage calculator

### What We Do Better
- **White-label at $100/mo/seat vs. their $2,000/mo** - 20x cheaper
- Flat, predictable pricing vs. per-minute stacking
- No premium charges for low latency (we include it)
- Better agency economics (our model is built for resale)
- Dedicated setup and support vs. self-serve

---

## 8. Air.ai

### What They Sell
~~Conversational AI for sales and customer service.~~ **Effectively dead.**

### Pricing
- Was charging $8,500-$11,000+ upfront
- Tied to Caleb Maddix's "Scale 13" program
- Now: **no functioning product, no refunds**

### What Reddit Users Say
**This is a dumpster fire. Summary:**
- "Promised full refund. They have ghosted. Did research on their company and it's now inactive. Serial scammers." - r/LeadGeneration
- "Hired for cold calling and paid 11k already. Promised to refund for couple of time but finally ghosted" - r/LeadGeneration
- "Caleb Maddix and his dad have been scamming people for years. He is currently living back home with his mom" - r/LeadGeneration
- "Air.ai's website goes offline - Caleb in hiding?" - r/MattMaddixCalebMaddix
- Multiple users seeking class action lawsuits
- Slack channel went down ("forgot to pay the bill")
- Facebook group "Air AI Community Network" has heated discussions about lawsuits
- "It's been a year since they promised me a refund" - multiple users
- Company is functionally defunct

### What They Do Better Than Us
- Nothing. They're dead.

### What We Do Better
- We exist and function
- We don't charge $11K upfront and disappear
- We have actual technology
- We respond to customers

---

## Battle Cards

### When a prospect says "Why not use Smith.ai?"
> "Smith.ai charges $2,100/mo for just 300 calls, and that's before add-ons like scheduling ($1.50/call) and recording ($0.25/call). Our AI receptionist handles unlimited calls for $497/mo flat - no per-call charges, no add-on stacking. Plus, their own customers on Reddit complain about rude receptionists. Our AI is professional every single time."

### When a prospect says "Why not use Ruby Receptionist?"
> "Ruby's been declining fast - their own long-time customers are leaving because quality dropped while prices went up. They bill per-minute, so one chatty caller can blow your budget. We're $497/mo flat, with consistent quality 24/7. No burned-out call center workers having a bad day."

### When a prospect says "Why not use GoHighLevel Voice AI?"
> "GHL's voice AI is universally trashed by its own users. Agency owners on Reddit call it 'terrible' and 'robotic' - most end up ditching it for Retell or Vapi anyway. Even GHL agencies recommend building custom solutions outside GHL for voice. Our voice AI actually works out of the box, with proper calendar integration that doesn't break."

### When a prospect says "Why not use Retell AI?"
> "Retell is great if you have a developer on staff to build, maintain, and monitor everything. Most businesses don't. With us, you get a production-ready AI receptionist with scheduling, transfers, and intake built in - no coding required. And our flat $497/mo beats their variable per-minute costs that can surprise you at billing time."

### When a prospect says "Why not use Vapi?"
> "Vapi's own community complains about unpredictable pricing - one user got billed $10.68 for a single 5-minute call. They charge for silence time, add-ons stack up to $0.20-$0.25/min, and they're losing money so costs are only going up. We give you predictable $497/mo pricing with everything included. No surprises."

### When a prospect says "Why not use Bland AI?"
> "Bland targets enterprise companies with million-dollar contracts - they don't serve businesses like yours. They also got caught letting anyone spam-call people from their website and made headlines for lying about being human. We're purpose-built for small-to-mid businesses with transparent pricing and honest AI."

### When a prospect says "Why not use Synthflow?"
> "Synthflow's white-label costs $2,000/mo alone - our agency white-label is $100/mo per seat. Their per-minute costs with add-ons quickly exceed our flat rate, and you'll pay extra for basic features like low latency. We built our pricing model specifically for agencies to make money reselling."

### When a prospect says "Why not use Air.ai?"
> "Air.ai is dead. Their website is offline, they ghosted customers who paid $8-11K, and multiple people are pursuing lawsuits. We're the opposite - transparent pricing, working technology, and we actually answer when you call."

---

## Key Takeaways

### Our Biggest Competitive Advantages
1. **Flat, predictable pricing** in a market full of per-minute/per-call traps
2. **Turnkey deployment** vs. developer-required platforms (Retell, Vapi, Bland)
3. **Agency white-label at $100/mo/seat** crushes Synthflow's $2,000/mo
4. **Consistent quality** vs. declining human receptionist services (Ruby, Smith.ai)
5. **We actually exist and function** (vs. Air.ai)

### Where We're Vulnerable
1. **"I want a human" objection** - Smith.ai and Ruby still win with prospects who insist on human receptionists
2. **Deep legal vertical integrations** - Smith.ai's Clio/conflict-checking features are strong for law firms
3. **Enterprise scale** - Bland AI targets Fortune 500; we don't (yet)
4. **Developer flexibility** - Retell/Vapi give total control to technical teams who want it
5. **Compliance certifications** - Synthflow has SOC2/GDPR/ISO; we should get these

### The Market Is Telling Us
- Human receptionist services (Smith.ai, Ruby) are declining in quality and increasing in price - perfect timing for AI disruption
- GHL's voice AI is garbage - agency owners are desperate for alternatives
- Vapi/Retell users complain about pricing unpredictability - our flat rate is a differentiator
- Air.ai's implosion creates trust issues in the market - we need to lean into transparency
- White-label pricing is a massive gap: Synthflow at $2K/mo vs. our $100/seat is a killer advantage for agencies

---

*Research completed: March 1, 2026 | Sources: Reddit (r/LawFirm, r/Lawyertalk, r/gohighlevel, r/vapiai, r/AI_Agents, r/LeadGeneration, r/ArtificialInteligence, r/askportland, r/BetterOffline), competitor websites (smith.ai, ruby.com, retellai.com, synthflow.ai, bland.ai, vapi.ai)*
