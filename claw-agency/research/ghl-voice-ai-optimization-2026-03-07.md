# GHL Voice AI Agent Optimization - Research Report
**Date:** March 7, 2026
**Lead Agent:** Ethan (CTO) + Jordan (CRO)
**Supporting:** Victoria (CMO), Kai (R&D)

---

## PART 1: MAKING OUR AGENTS BEST-OF-THE-BEST

### 1. Knowledge Base (CRITICAL - Not Yet Created)
Our 5 niche agents and main agent have NO knowledge base attached. This is the single biggest gap.

**What to build per niche agent:**
- FAQ document (15-25 questions) specific to that trade
- Common objections and rebuttals
- Service area details, pricing ranges (industry averages)
- Seasonal urgency triggers (e.g., "AC goes out in July" for HVAC, "pipe burst in winter" for plumbing)
- Competitor comparison talking points (why AI receptionist beats hiring a person)

**GHL Knowledge Base best practices (from community):**
- Keep documents under 6,000 characters per chunk. Longer prompts degrade quality
- Use Q&A format, not paragraphs. The AI retrieves better from structured pairs
- Test with real calls, not just reading the prompt. Voice behavior differs from text
- Update monthly based on actual call recordings

### 2. Prompt Engineering Improvements

**Current state:** Our agents use a basic persona + greeting + booking flow.

**Upgrades needed:**
- **Objection handling loops**: When caller says "I'm just getting quotes" or "let me think about it," the agent should NOT just say "okay." It should acknowledge, reframe value, and attempt a soft close: "Totally understand. Most of our clients started the same way. Would it help if I set you up with a quick 10-minute demo so you can see exactly what you'd get?"
- **Urgency injection**: "We only have 3 founding spots left this month" / "Your competitors in [city] are already using this"
- **Mirror + validate**: Repeat back the caller's pain before offering the solution. "So you're missing calls when you're on the job site, and those are turning into lost jobs. That's exactly what we fix."
- **Warm transfer protocol**: Instead of "let me transfer you," use "I'm going to connect you with Jordan who handles our founding member accounts. He'll take great care of you."
- **After-hours handling**: Different prompt behavior for evenings/weekends. Collect info, promise callback within X hours, don't try to close

### 3. Voice & Delivery Optimization

**Current:** Archer voice (British male)

**Research findings:**
- British accent tested well for "premium/trust" positioning (good choice for agency selling)
- Speaking speed: GHL default is sometimes too fast. If there's a speed control, drop to 0.9x
- Pause timing: The AI should pause 1-2 seconds after the caller finishes speaking before responding. Reduces interruption, feels more human
- Filler words: Some agencies add "hmm," "right," "got it" to make the AI sound more natural
- Background noise: Some platforms let you add light office ambiance. GHL doesn't natively, but it's worth watching for updates

### 4. Call Flow Architecture

**Current:** Linear (greet -> ask questions -> book)

**Optimized flow:**
1. **Hook** (first 8 seconds): Business name + value prop. "Thanks for calling ClawOps, where we help contractors never miss another call. This is Jordan."
2. **Qualify** (30 seconds): "What kind of business do you run?" / "How many calls are you missing per week?"
3. **Agitate** (15 seconds): "Yeah, every missed call is probably $500-2,000 in lost revenue. That adds up fast."
4. **Present** (30 seconds): "We set up an AI receptionist that answers every call 24/7, books jobs for you, and costs less than $3/day."
5. **Close** (15 seconds): "Want me to set up a quick demo with your business name on it? Takes about 10 minutes."
6. **Fallback**: If they hesitate, offer the demo call booking instead of pushing for a sale

### 5. Post-Call Automation

**Not yet configured. Needs:**
- Instant SMS summary to Brand after every call (caller name, number, what they asked, outcome)
- Auto-tag contacts in GHL based on call outcome (interested, booked, not interested, wrong number)
- Follow-up SMS to caller 1 hour after call: "Hey [name], this is Jordan from ClawOps. Great talking with you. Here's that demo link if you want to check it out: [link]"
- Missed call text-back within 60 seconds (biggest ROI automation per Reddit: +23% close rate)

### 6. Demo Experience Upgrade

**Current:** Prospect calls the 888 number and talks to our main agent.

**Better approach:**
- Create a DEDICATED demo line or demo agent that's built to impress
- Demo agent should say the prospect's BUSINESS NAME (personalized)
- Have 2-3 pre-built scenarios: "Press 1 to hear how we handle a new customer call. Press 2 to hear how we handle an emergency call. Press 3 to try booking an appointment."
- After demo, auto-SMS: "Pretty cool, right? Here's what that would look like running 24/7 for [business name]. Book your setup call: [link]"

---

## PART 2: MONDAY SALES STRATEGY - GET THE NEXT SALE

### Priority 1: Warm Leads Already in Pipeline

**Aaron (509-521-8668)**
- Called our demo line, gave email aaron@mdo.net, interested in founding deal
- STATUS: No follow-up since initial call (Mar 1-2)
- ACTION: Monday 9 AM - Personal SMS from the 888 line: "Hey Aaron, Jordan from ClawOps. You checked out our demo last week and seemed interested in the founding member deal. Still got a couple spots at $1,997. Want to grab 15 min this week to get you set up?"
- If no reply by Tuesday noon, follow up with a short Loom video showing a custom demo with his business info

**(915) 268-9089**
- Called demo, asked about pricing, positive on $1,997 founding deal
- STATUS: No follow-up
- ACTION: Same playbook as Aaron. Monday 9 AM SMS.

### Priority 2: GHL Lead Database (42 Verified Contacts)

**51 verified-match contacts** ready to go. Focus on these first (correct phone numbers).

**Monday SMS Blast (Business Hours Only, 9 AM - 5 PM local time):**
- Send to the 51 verified contacts in batches of 10-15 per hour
- Template: "Hey [first_name], this is Jordan from ClawOps. We help [trade] companies answer every call 24/7 with AI - so you never miss a job when you're on-site. Costs less than a part-timer. Worth a 2-min call? Our demo line: 888-457-8980"
- Personalize by niche (HVAC, plumbing, electrical, roofing, GC)

**For the 42 mismatched numbers:**
- Do NOT SMS until Brand manually verifies or we update to the correct numbers from the verification results
- We have the corrected GBP numbers ready to apply

### Priority 3: Reddit Buyer-Intent Leads (Tier 1)

From the March 1 lead list, these are STILL active and haven't been contacted:

1. **FarmToEdmonton** - Service biz owner, wallet out, asking for AI phone answering
2. **Chemical_Being_** - 5 founders need a dedicated line
3. **egfs18** - Admin for landscaping company, owner always in field
4. **ToshPointNo** - 50 upvotes on "Why are people allergic to voicemail?" post
5. **Rude_Maintenance1708** - Agency owner comparing white-label voice AI platforms

**Monday Reddit DM Strategy:**
- 3 max DMs on Monday (spread across morning, noon, afternoon)
- Use the Loom-permission approach: short value message, then "Mind if I send you a 3-min video showing how this works for [their business]?"
- Don't pitch price in DM. Get them to the demo line or a video call.

### Priority 4: Cold Outreach via Outbound App

**clawops-outbound on Fly.io is deployed and ready.**
- 42 contacts loaded, SMS templates built, niche-specific
- Needs Brand's GO to activate
- Can run alongside manual warm outreach

### Priority 5: The Scanner as Lead Gen

**MEO/GEO/SEO Scanner** was being built on Mar 6.
- If it's live by Monday, push it on Reddit/social: "Free scan - see how visible your business is to AI and Google Maps"
- Every scan = a lead with their business info
- Follow up scans with: "Your [trade] business scores X/100. Here's how to fix it. Want help?"

---

## MONDAY BATTLE PLAN (Hour by Hour)

| Time | Action | Owner |
|------|--------|-------|
| 8:00 AM | Review/update 5 niche agent prompts with objection handling | Ethan (CTO) |
| 8:30 AM | Create knowledge base docs for HVAC + Plumbing agents | Kai (R&D) |
| 9:00 AM | SMS to Aaron (warm lead) | Jordan (CRO) |
| 9:05 AM | SMS to 915 caller (warm lead) | Jordan (CRO) |
| 9:15 AM | First batch of 10 SMS to verified GHL contacts (HVAC niche) | Outbound App |
| 10:00 AM | Reddit DM #1 (FarmToEdmonton - hottest lead) | Victoria (CMO) |
| 10:30 AM | Second batch of 10 SMS (Plumbing niche) | Outbound App |
| 12:00 PM | Reddit DM #2 (ToshPointNo - high engagement post) | Victoria (CMO) |
| 1:00 PM | Third batch of 10 SMS (Electrical/Roofing/GC) | Outbound App |
| 2:00 PM | Follow up on any morning SMS replies | Jordan (CRO) |
| 3:00 PM | Reddit DM #3 (Rude_Maintenance1708 - agency partner) | Victoria (CMO) |
| 4:00 PM | Review all responses, update pipeline, plan Tuesday | Harper (COO) |

---

## WHAT BRAND NEEDS TO DO (Blockers Only We Can't Solve)

1. **Connect booking actions on 5 niche agents in GHL UI** (can't be done via API - 422 error)
2. **Approve outbound SMS blast GO** (app is deployed, just needs the green light)
3. **Verify/update 42 mismatched phone numbers** (or approve us using the GBP-found numbers)
4. **Review and approve the Reddit DM targets** before we send

---

*This research synthesizes findings from r/gohighlevel, r/SaaS, r/Entrepreneur, r/smallbusiness, r/AI_Agents, and direct GHL platform experience. Sources cross-referenced for accuracy.*
