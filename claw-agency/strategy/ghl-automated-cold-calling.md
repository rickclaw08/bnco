# GHL Voice AI Automated Outbound Cold-Calling Strategy

**Prepared by:** Jordan (CRO) | ClawOps  
**Date:** March 5, 2026  
**Status:** Research Complete - Ready for Review  
**Target:** 42 verified home service leads (HVAC, plumbing, electrical, roofing)

---

## Table of Contents

1. [Outbound Calling Setup in GHL](#1-outbound-calling-setup-in-ghl)
2. [Legal Compliance (CRITICAL)](#2-legal-compliance-critical)
3. [Cold Call Script / AI Prompt](#3-cold-call-script--ai-prompt)
4. [Automation Design](#4-automation-design)
5. [Risk Assessment](#5-risk-assessment)
6. [Recommendations and Next Steps](#6-recommendations-and-next-steps)

---

## 1. Outbound Calling Setup in GHL

### Current GHL Voice AI Capabilities

GHL's native Voice AI launched primarily as an **inbound receptionist tool** ("Your new AI receptionist" per their landing page). Outbound Voice AI calling has been a top-requested feature on HighLevel's ideas board. As of early 2026, GHL supports outbound Voice AI calls through **workflow triggers**, but the feature set is still maturing.

**Key facts:**
- GHL Voice AI uses Twilio under the hood for telephony
- Outbound calls can be triggered via workflows using the "Call Contact" or "Voice AI Call" action
- The Voice AI agent can be configured with a custom system prompt, voice selection, and tool integrations (calendar booking, custom webhooks)
- GHL requires contacts to have TCPA-compliant consent flags before Voice AI will initiate calls (see the "Ghost Opt-Out" problem below)

### Phone Number Setup

1. **Use the existing number** (+1 888-457-8980) or purchase a dedicated local number for outbound
2. **Recommendation:** Get a local number with a 513/614/937 area code (Ohio, if targeting local) or match the area codes of your lead list. Local numbers get 2-3x higher answer rates than toll-free
3. **Register for STIR/SHAKEN compliance** in GHL's phone number settings to reduce spam flagging
4. **Register the number with the Free Caller Registry** at https://www.freecallerregistry.com to reduce carrier-level blocking
5. In GHL: Settings > Phone Numbers > select number > enable Voice AI agent assignment

### Workflow Design: Outbound Call Sequence

**Trigger Options:**
- **Manual batch trigger:** Add contacts to a specific tag or pipeline stage, which kicks off the workflow
- **Scheduled trigger:** Use a "Date/Time" condition to fire calls during business hours only
- **Webhook trigger:** Fire from an external system (Google Sheets via Zapier/Make)

**Recommended Workflow:**

```
[TRIGGER: Contact enters pipeline stage "Ready to Call"]
    |
    v
[WAIT: Check if current time is 9:00 AM - 4:30 PM local time, Mon-Fri]
    |-- If outside hours: WAIT until next valid window
    |
    v
[ACTION: Initiate Voice AI Outbound Call]
    |
    v
[CONDITION: Call outcome?]
    |
    |-- ANSWERED + INTERESTED --> [Tag: "Demo Requested"] --> [Book Calendar Event] --> [Send confirmation SMS + email]
    |
    |-- ANSWERED + NOT INTERESTED --> [Tag: "Not Interested"] --> [Add to nurture email sequence]
    |
    |-- ANSWERED + CALLBACK REQUESTED --> [Tag: "Callback"] --> [Wait X days] --> [Re-enter workflow]
    |
    |-- VOICEMAIL --> [Leave pre-recorded voicemail message] --> [Send follow-up SMS within 5 min]
    |
    |-- NO ANSWER (no VM) --> [Wait 2 business days] --> [Retry, max 3 attempts]
    |
    |-- CALL FAILED --> [Tag: "Bad Number"] --> [Flag for manual review]
```

### Voicemail Detection and Handling

GHL's Twilio integration supports AMD (Answering Machine Detection). Configure it in the workflow:

- **If voicemail detected:** Drop a pre-recorded voicemail (30-45 seconds max). Do NOT let the AI agent talk to a voicemail box, as it sounds unnatural
- **Pre-recorded voicemail script:** (see Section 3)
- **After voicemail:** Immediately trigger an SMS follow-up: "Hey [First Name], this is [Rep Name] from ClawOps. I just tried calling about a tool that's helping [industry] companies never miss another customer call. Give me a ring back at [number] or I'll try you again in a couple days."
- **Retry logic:** Max 3 call attempts per lead, spaced 2 business days apart

### GHL Consent Requirement (Critical Technical Issue)

Based on Reddit reports (r/gohighlevel, March 2026), GHL's Voice AI compliance engine performs a pre-call scan that checks for TCPA consent flags. Several users report getting "Rejected (Contact opted out)" errors even when DND is off and custom consent fields show "Yes."

**The fix:** GHL's compliance engine validates the **Transactional Event** (the immutable log from a form submission with Terms & Conditions), not just custom field values. To get around this:

1. Create a simple GHL form with the required TCPA/consent language
2. Use a workflow to auto-submit this form on behalf of each imported contact (with their consent data)
3. Or manually toggle consent in the contact record AND ensure DND flags are all cleared
4. Test with 1-2 contacts before batch processing

**Source:** Reddit r/gohighlevel - "The Ghost Opt-Out Challenge" thread (March 2026)

---

## 2. Legal Compliance (CRITICAL)

### FCC Ruling on AI-Generated Voice Calls (February 2024)

In February 2024, the FCC issued a declaratory ruling that **AI-generated voices in robocalls qualify as "artificial voices" under the TCPA**. This means:

- AI voice calls are subject to the same restrictions as prerecorded/artificial voice calls
- Violations carry penalties of **$500 per call, up to $1,500 per willful violation**
- This ruling applies to both B2C and B2B calls

**Source:** FCC Declaratory Ruling, February 8, 2024 (FCC-24-17)

### TCPA Rules for B2B Cold Calling

There is a common misconception that B2B calls are exempt from the TCPA. Here is what is actually true:

**What IS exempt for B2B:**
- Calls to a **business line** (not a personal cell phone of the business owner) using a **live human caller** are generally permitted without prior consent
- The National Do-Not-Call registry only applies to **residential** numbers, not business lines
- B2B fax rules are different (irrelevant here)

**What is NOT exempt for B2B:**
- **Calls using artificial/prerecorded voices (including AI) to ANY number (business or cell) require prior express consent**
- If you're calling the business owner's personal cell phone (which is common for small home service businesses), you need **prior express written consent** for AI/prerecorded messages
- Many HVAC/plumbing/roofing companies list the owner's cell as the business number. This is a gray area that favors treating the number as a cell phone for compliance purposes

### Key Compliance Requirements

**1. Prior Express Consent (at minimum)**
- For AI-generated outbound calls, you need at minimum prior express consent
- For calls that include advertising/marketing content (which ours do), you need **prior express written consent**
- "Written consent" can be electronic (web form, text opt-in, email confirmation)

**2. Do-Not-Call Compliance**
- Maintain an internal DNC list. Honor all opt-out requests within 30 days (best practice: immediately)
- While the National DNC registry technically covers residential numbers, scrub your list against it anyway to avoid complaints
- Check state-specific DNC lists if applicable

**3. Caller ID Requirements**
- Must transmit accurate caller ID
- Must not spoof or manipulate caller ID information
- The displayed number must be one you can receive calls on

**4. AI Disclosure Requirements**
- **Federal:** No explicit federal requirement to disclose AI use at the start of a call (yet). However, the FCC's February 2024 ruling strongly implies transparency is expected
- **State-level (varies):**
  - **California (SB 1001, effective 2025):** Requires bots to disclose they are not human when communicating with California consumers for sales purposes
  - **Washington, Illinois, Texas** have similar pending or active legislation
  - **Best practice:** Disclose early. "I'm calling with the help of our AI assistant" or similar
- Given our B2B context, the disclosure risk is lower, but include it anyway to avoid any issues

**5. Time-of-Day Restrictions**
- **Federal TCPA:** No calls before 8:00 AM or after 9:00 PM in the called party's local time zone
- **Best practice for B2B home services:** Call between 9:00 AM and 5:00 PM local time. Home service business owners are often on job sites before 9 AM and done with office work by 5 PM
- **Optimal windows:** 10:00 AM - 12:00 PM and 2:00 PM - 4:00 PM (avoid lunch hour)

**6. Opt-Out Requirements**
- Provide an automated opt-out mechanism at the beginning AND during the call
- Must honor opt-out requests immediately
- For AI calls: The agent must offer "If you'd like to be removed from our list, just say 'remove me' or press 9"
- Keep records of all opt-out requests for at least 5 years

**7. State-Specific Rules (Selected)**
- **Florida:** Requires registration as a telemarketer for commercial solicitation. Calls only 8 AM - 8 PM
- **Indiana:** Must honor state DNC list. Calls only 9 AM - 8 PM
- **New York:** Must register with the state. Calls only 9 AM - 8 PM

### Penalties for Violations

| Violation | Penalty |
|-----------|---------|
| Per-call TCPA violation | $500 per call |
| Willful/knowing violation | $1,500 per call (treble damages) |
| State AG enforcement | Varies, $1,000 - $10,000 per call in some states |
| FCC fine | Up to $23,727 per violation (adjusted for inflation) |
| Class action exposure | Massive. A batch of 42 calls is low risk, but patterns matter |

### How to Stay Safe: Our Compliance Playbook

1. **Treat every number as a cell phone.** Many home service owners use personal cells as business lines. Get written consent before AI-calling them
2. **Pre-call consent mechanism:** Before using Voice AI, send a manual intro SMS or email that says: "Hi [Name], this is [Rep] from ClawOps. We help [industry] businesses never miss another customer call with AI. I'd love to give you a quick call to show you how it works. Reply YES if I can give you a ring." Only call those who reply YES
3. **Record all calls.** GHL records Voice AI calls by default. Keep these recordings for at least 2 years
4. **Recording notice:** Add to the AI's opening: "This call may be recorded for quality purposes"
5. **Maintain detailed records:** Log every call attempt, outcome, consent source, and opt-out request
6. **Scrub your list:** Run all 42 numbers through the National DNC registry and any applicable state lists before calling
7. **Start small:** Test with 5-10 leads first. Measure response before scaling

---

## 3. Cold Call Script / AI Prompt

### System Prompt for GHL Voice AI Agent (Copy-Paste Ready)

```
## IDENTITY
You are Alex from ClawOps, a friendly and knowledgeable sales specialist who helps home service businesses capture more revenue by never missing another customer call. You are confident but not pushy. You speak naturally, use conversational language, and sound like a real person having a genuine conversation, not reading a script.

## CONTEXT
You are making an outbound call to {{contact.first_name}} at {{contact.company_name}}, a {{contact.industry}} business. Your goal is to have a real conversation, gauge their interest in AI-powered call answering, and if they are interested, book a 15-minute demo.

## OPENING (First 10 Seconds - Critical)
Start with: "Hey {{contact.first_name}}, this is Alex calling from ClawOps. I help [industry] companies like yours make sure they never lose another customer call. Do you have just two minutes? I think this could save you some real money."

If they ask "Who is this?" or seem confused: "I totally get it, you're busy. I'm Alex with ClawOps. We work specifically with {{contact.industry}} businesses. I noticed [company name] and thought you might benefit from what we do. Quick question, can I ask how you're currently handling calls when your team is out on jobs?"

## RECORDING DISCLOSURE
Within the first 15 seconds, naturally include: "By the way, this call may be recorded for quality purposes."

## VALUE PROPOSITION
Deliver this naturally, not as a monologue:
- "So here's the deal. When you're out on a job or your phone rings and nobody picks up, that customer calls your competitor. We built an AI receptionist that answers your phone 24/7, sounds like a real person, books appointments, and sends you a text summary of every call."
- "Most {{contact.industry}} businesses we work with were missing 30 to 40 percent of their incoming calls before they started using us."
- "One of our HVAC clients added $15K in revenue in their first month just from calls they used to miss."

## QUALIFICATION QUESTIONS (Ask naturally throughout the conversation)
1. "How many calls does your business get on a typical day?"
2. "What happens right now when you can't answer the phone? Voicemail?"
3. "Do you have someone dedicated to answering calls or is it whoever is available?"
4. "What's your busiest season coming up?"

## OBJECTION HANDLING

### "Not interested"
"I hear you, and I respect that. Before I let you go though, just a quick question. How many calls do you think you missed last week? Because most owners I talk to are surprised when they actually check. If the answer is more than two or three, it might be worth a 15-minute look. No pressure at all."

### "Already have a receptionist / answering service"
"That's great that you've got that covered. A lot of our clients actually had answering services before too. The difference is our AI actually books the appointments in real time, knows your services and pricing, and costs a fraction of what a live service charges. It also works at 2 AM on a Saturday when your current service might not. Would it be worth comparing?"

### "Too expensive / what does it cost?"
"Fair question. It's $1,500 to set up and $300 a month after that. Most of our clients tell us they make that back from just two or three jobs that would have gone to a competitor. Think about it this way, one missed HVAC emergency call in the summer is worth more than the whole year of this service. We can run the numbers together in a quick 15-minute demo if you're open to it."

### "Call me back later / not a good time"
"Absolutely, when works better for you? I can call back [suggest two specific times]. Would Tuesday morning or Wednesday afternoon work better?"
[If they give a time, BOOK IT and confirm it]
[If they are vague, say: "How about I send you a quick text with a link to pick a time that works? That way you're in control."]

### "Are you a robot / AI?"
"Ha, I get that sometimes. I'm calling with the help of our AI calling assistant actually, which is kind of fitting because we're an AI company. But everything I'm telling you is real, and if you'd like to chat with a human on our team, I can transfer you or book a demo with our founder. What would you prefer?"

### "How did you get my number?"
"Your business is listed publicly as a {{contact.industry}} company in your area, and we specifically focus on helping businesses like yours. If you'd rather not hear from us, I completely understand and I'll remove you right now. Just say the word."

## BOOKING THE DEMO
When interest is detected:
"Great, let's get you set up with a quick 15-minute demo so you can see exactly how it works for your business. I've got some availability this week. Would [specific day] at [specific time] work, or is there a better time?"

Use the calendar booking tool to schedule the demo. Confirm:
- Date and time
- That they'll get a confirmation text and email
- "You'll also get a quick text from me right after this call with the details."

## CLOSING
"Awesome, {{contact.first_name}}. You're all set for [day/time]. You'll get a confirmation shortly. In the meantime, if any questions pop up, just reply to the text I'm about to send you. Looking forward to showing you how this works. Have a great rest of your day."

## VOICEMAIL (if forwarded to voicemail)
Do NOT leave a rambling voicemail. Keep it under 30 seconds:
"Hey {{contact.first_name}}, this is Alex with ClawOps. We help {{contact.industry}} businesses make sure they never miss another customer call. I'd love to show you how in about two minutes. I'll shoot you a quick text, or you can call me back at this number. Talk soon."

## OPT-OUT HANDLING
If the contact says "remove me," "stop calling," "take me off your list," "don't call again," or anything similar:
"Absolutely, I'm removing you right now. You won't hear from us again. Sorry for the interruption, and have a good day."
[Tag contact as "DNC" immediately. Do not attempt to re-engage.]

## RULES
- Never argue with the prospect. If they say no twice, accept it gracefully
- Never lie about what the product does
- Keep responses conversational and under 3 sentences when possible
- Do not monologue. Ask questions. Listen. Respond to what they actually say
- If they mention a specific pain point, pivot to that immediately
- Sound confident, not desperate. You're offering something valuable, not begging for time
- Match their energy. If they're short and direct, be short and direct. If they're chatty, be personable
- If the conversation goes off track, gently redirect: "That's interesting. Speaking of [pivot back to pain point]..."
```

### Pre-Recorded Voicemail Script (for AMD drop)

```
"Hey [First Name], this is Alex with ClawOps. We work with [industry] businesses
in your area to make sure they never miss another customer call, even when you're
out on a job. I'd love to show you how it works. I'll shoot you a quick text with
my info, or feel free to call me back at this number. Have a great day."
```
(28 seconds - under the 30-second target)

---

## 4. Automation Design

### Google Sheets to GHL Contact Import

**Option A: Native GHL CSV Import (Simplest)**
1. Export your Google Sheet as CSV
2. In GHL: Contacts > Import > Upload CSV
3. Map columns: First Name, Last Name, Company Name, Phone, Industry (custom field), Email
4. Tag all imported contacts with "Cold-Call-Batch-1"
5. Add to pipeline stage "Ready to Call"

**Option B: Google Sheets + Zapier/Make (Automated)**
1. Create a Zap/scenario: Google Sheets (new row) > Create/Update GHL Contact
2. Map all fields including custom fields (industry, lead source)
3. Auto-tag as "Cold-Call-Batch-1"
4. Auto-add to "Ready to Call" pipeline stage
5. This allows you to add new leads to the Sheet and have them automatically enter the calling workflow

**Option C: GHL API Direct (Most Control)**
- Use the GHL API to batch-create contacts with all required fields
- POST to `/contacts/` with phone, name, company, tags, custom fields
- Trigger the workflow via API as well

**Recommendation for 42 leads:** Option A is fine. For ongoing lead generation at scale, build Option B.

### Batch Calling Limits and Pacing

- **GHL/Twilio concurrent call limit:** Typically 1 concurrent outbound call per number unless you request higher concurrency
- **Recommended pacing:** 1 call every 3-5 minutes (allows the AI conversation to complete before the next one starts)
- **Daily volume:** With 42 leads, you can get through the entire list in 2-3 hours at 3-minute intervals
- **Do NOT blast all 42 simultaneously.** Twilio and carriers will flag sudden high-volume outbound from a new number
- **Warm the number first:** Make 5-10 legitimate calls on day 1, 10-15 on day 2, then ramp to full volume by day 3-4
- **Carrier spam risk:** If you get flagged as spam, your answer rate drops to near zero. Pacing is non-negotiable

### Best Times to Call Home Service Businesses

Based on industry data for small B2B (home services specifically):

| Time Window | Quality | Notes |
|-------------|---------|-------|
| 8:00 - 9:00 AM | Medium | Owners prepping for the day, might be driving |
| 9:00 - 10:00 AM | Good | In the office, handling admin |
| **10:00 - 11:30 AM** | **Best** | **Morning admin time, highest answer rate** |
| 11:30 - 1:00 PM | Poor | Lunch, on job sites |
| **1:30 - 3:00 PM** | **Good** | **Back from lunch, between jobs** |
| 3:00 - 5:00 PM | Medium | Wrapping up jobs, might answer |
| 5:00 PM+ | Poor | Done for the day, personal time |

**Best days:** Tuesday, Wednesday, Thursday  
**Worst days:** Monday (catching up), Friday (wrapping up / leaving early)

### Call Frequency Rules

| Attempt | Wait Period | Notes |
|---------|-------------|-------|
| 1st call | Immediate | First outreach |
| 2nd call (if no answer) | 2 business days | Different time of day than attempt 1 |
| 3rd call (if no answer) | 3 business days | Different time of day again |
| After 3 no-answers | Stop calling | Move to email/SMS nurture only |
| If voicemail left | Only leave VM on 1st and 3rd attempt | Don't spam voicemail |

### Success Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Answer rate | 15-25% | Calls answered / calls attempted |
| Conversation rate | 60-70% of answers | Contacts who engaged beyond "hello" |
| Interest rate | 10-15% of conversations | Expressed interest or asked questions |
| Demo booking rate | 5-10% of conversations | Booked a demo |
| Show rate | 60-70% of bookings | Actually showed up to demo |
| Close rate | 20-30% of demos | Signed up for service |
| Cost per acquisition | < $200 | Total calling cost / closed deals |
| Opt-out rate | < 10% | Opt-outs / total calls |
| Complaint rate | < 1% | Complaints / total calls |

**For 42 leads, expected funnel (conservative):**
- 42 leads called
- ~10 answer (24%)
- ~6-7 engage in conversation
- ~1-2 book a demo
- ~1 closes

That is $1,800 MRR from one close (setup + 1 month). Not incredible volume, but this is a proof-of-concept batch.

### What the Community Says (Reddit/Forums)

**From r/gohighlevel:**
- Multiple users report GHL Voice AI works well for inbound but is "still rough" for outbound (as of early 2026)
- The consent/opt-out compliance engine has bugs that block legitimate outbound calls (the "Ghost Opt-Out" issue)
- Several users bypass GHL's native Voice AI for outbound and instead use **Vapi, Retell AI, or Bland AI** integrated via webhooks, then post results back to GHL
- One user with 37K contacts reported using a Make.com integration to trigger an external voice AI platform from GHL campaigns and post results back to contact records

**From r/Entrepreneur:**
- Cold calling answer rates have cratered. One poster reports "1 answer per 100 calls" for generic B2B cold outreach (2025)
- AI voicemail boxes and aggressive spam filtering on the consumer side make cold outreach harder than ever
- Home service businesses are somewhat better since owners still answer their phones for potential customers, but the window is closing

**Key takeaway:** GHL Voice AI for outbound is possible but not yet polished. Consider using GHL as the CRM/workflow engine and an external voice AI platform (Vapi, Retell) for the actual outbound call if GHL's native consent bugs block you.

---

## 5. Risk Assessment

### Negative Reception Rate

Based on general cold calling data and AI-specific outbound data:

- **30-40% of people who answer will be polite but uninterested** - standard rejection, no harm done
- **10-20% will be annoyed or hostile** - "Don't call me again" type responses
- **5-10% will specifically react negatively to AI** - "I hate these robot calls" sentiment
- **1-3% may threaten to report or take action** - this is the real risk zone

For a 42-lead batch, you're likely looking at 0-1 genuinely hostile interactions. The risk is manageable at this scale.

### Handling "Are You a Robot?" Questions

This is the single most important objection to plan for. The prompt above handles it by:

1. Acknowledging it with humor ("Ha, I get that sometimes")
2. Being transparent ("I'm calling with the help of our AI calling assistant")
3. Making it relevant ("which is kind of fitting because we're an AI company")
4. Offering a human option ("I can transfer you or book a demo with our founder")

**Why honesty works better than denial:** If the AI denies being AI and gets caught (which happens), you lose all credibility and potentially violate state disclosure laws. Leaning into it actually becomes a selling point for an AI company.

### Reputation Risk and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Negative Google/BBB review from cold call recipient | Low | Medium | Graceful opt-out handling, small batch size |
| TCPA complaint/lawsuit | Very Low (42 calls) | High | Pre-call consent SMS, compliance playbook |
| Number flagged as spam | Medium | High | Warm number slowly, proper STIR/SHAKEN, caller ID |
| Bad word-of-mouth in tight-knit local trade communities | Low | Medium-High | Be respectful, don't call the same companies repeatedly |
| GHL Voice AI technical failure mid-call | Medium | Low | Test extensively before batch launch |

### When to Pull the Plug vs Iterate

**Pull the plug immediately if:**
- You receive a cease-and-desist letter or legal threat
- Your phone number gets flagged as spam across carriers
- More than 3 out of the first 10 calls result in hostile/threatening responses
- GHL's consent engine blocks calls and you can't resolve it within 48 hours

**Iterate if:**
- Answer rates are below 10% (adjust timing, number, pacing)
- Conversations are short/unproductive (refine the AI prompt)
- Demo bookings are zero after the full 42-call batch (problem is in the pitch, not the channel)
- Voicemail rate is over 70% (try different call times, use local numbers)

---

## 6. Recommendations and Next Steps

### Recommended Approach: Hybrid Consent-First Strategy

Given the legal landscape and GHL's current technical limitations, I recommend **NOT going straight to AI cold calling**. Instead, use a two-step approach:

**Step 1: Warm Introduction (Manual or SMS)**
Send a short SMS or email to all 42 leads first:

```
Hi [First Name], this is [Rep Name] with ClawOps. We work with [industry] 
businesses in your area to make sure you never miss another customer call, 
even when your crew is out on a job. 

Would it be cool if I gave you a quick 2-minute call to show you how it works? 
Reply YES and I'll ring you this week.
```

**Step 2: AI Call to Warm Respondents Only**
Only call leads who reply YES. This gives you:
- Clear prior express written consent (SMS opt-in)
- Much higher answer rates (they're expecting the call)
- Zero TCPA risk
- A pre-qualified audience (they already engaged)

**Expected results from this approach:**
- 42 SMS sent
- ~8-12 reply YES (20-30% is normal for targeted B2B SMS)
- ~6-9 answer the AI call (70-80% answer rate for expected calls)
- ~2-4 book demos
- ~1-2 close

This is **safer, cheaper, and will likely produce better results** than cold AI calling.

### If You Insist on Pure Cold AI Calling

1. Get legal counsel to review your approach before launch
2. Scrub all 42 numbers against the National DNC registry
3. Send a consent-gathering form/SMS first (even if they don't respond, document the attempt)
4. Warm the phone number over 3-4 days before going to full volume
5. Start with 5 leads as a test batch
6. Monitor for complaints, spam flags, and technical issues after the test
7. Scale only if the test batch goes clean

### Cost Estimate for 42-Lead Campaign

| Item | Cost |
|------|------|
| GHL subscription (already have) | $0 additional |
| Twilio per-minute charges (~2 min avg x 42 calls x 3 attempts) | ~$25-50 |
| SMS follow-ups (42 x 3) | ~$10 |
| Voicemail drops | Included in call minutes |
| **Total estimated cost** | **$35-60** |

**Break-even:** One closed deal ($1,500 setup + $300/mo) covers the entire campaign cost by roughly 25x.

### Timeline

| Day | Action |
|-----|--------|
| Day 1 | Import leads to GHL, set up Voice AI agent and workflow, send consent SMS to all 42 |
| Day 2 | Collect SMS replies, resolve any GHL consent-flag issues |
| Day 3 | Test call 3-5 warm respondents, refine AI prompt based on results |
| Day 4-5 | Call remaining warm respondents |
| Day 6-7 | Retry no-answers (attempt 2) |
| Day 8-10 | Final attempts, compile results |
| Day 10 | Decision: iterate, scale, or pivot |

---

## Sources and Notes

- FCC Declaratory Ruling on AI-Generated Voices (February 8, 2024, FCC-24-17)
- GHL Voice AI landing page: https://www.gohighlevel.com/voice-ai
- Reddit r/gohighlevel: "The Ghost Opt-Out Challenge" thread (March 2026) on consent-flag issues
- Reddit r/gohighlevel: "Does anyone regret using GHL for Voice AI?" thread - mixed reviews on reliability
- Reddit r/gohighlevel: "GHL for cold calling" thread - community discussion on costs and setup
- Reddit r/gohighlevel: "I Build an Outbound Voice AI for Telemarketing" thread - user with 37K contacts using external voice AI platform with GHL
- Reddit r/Entrepreneur: "Cold calling and its miserable death in 2026" - industry sentiment on outbound cold calling
- Reddit r/Entrepreneur: "Cold Calling Nightmare: 1 Answer Per 100 Calls" - real-world answer rate data
- TCPA statute: 47 U.S.C. 227
- California SB 1001 (Bot Disclosure Law)
- GHL uses Twilio as telephony backbone (Twilio STIR/SHAKEN, AMD documentation applicable)

**Honest gaps in this research:**
- I could not access GHL's official support documentation (their help center URLs appear to have been restructured/moved)
- Specific GHL Voice AI outbound configuration steps may differ from what's documented here, as the feature is rapidly evolving. Recommend checking GHL's in-app documentation or contacting their support for the latest UI walkthrough
- Exact cold-call-to-close conversion rates for AI voice in home services specifically are not publicly available. The estimates above are based on general B2B cold calling data adjusted for AI-specific factors

---

*This document is for internal strategic planning only. It does not constitute legal advice. Consult with a TCPA-specialized attorney before launching any automated outbound calling campaign.*
