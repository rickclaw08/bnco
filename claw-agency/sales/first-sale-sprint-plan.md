# FIRST SALE SPRINT PLAN: $0 TO CLOSED IN 7 DAYS
**Author:** Jordan (CRO)
**Date:** March 13, 2026
**Status:** EXECUTE IMMEDIATELY
**Owner:** Brand (human actions) + Rick (automation + coordination)
**Revenue Target:** 1 closed deal ($2,500 setup + $250/mo) by March 20, 2026

---

## SITUATION REPORT (No BS)

**What we have:**
- Product: AI Receptionist for contractors (HVAC, plumbing, electrical, roofing)
- Working demo: VAPI voice AI (Jordan persona, Belfort-style sales, Elliot voice)
- 2 HOT leads who already called, engaged on pricing, and said positive things
- 172 contacts in GHL CRM
- Website: theclawops.com
- Founding page + Stripe payment link ($2,500 setup + $250/mo)
- VAPI phone number: +15139953474 (daily limit ~13 calls)
- Vonage BYO SIP: +15137788336 (unlimited but lower quality)

**What's broken:**
- Outbound calling from GHL: DEAD (Trust Center rejections across the board - CNAM, SHAKEN/STIR, Voice Integrity all rejected)
- SMS follow-up: DEAD (10DLC not registered on any provider - Twilio, Vonage both blocked by carriers)
- Twilio voice: DISABLED (Trust Hub not approved since March 1)
- Reddit engagement crons: DEAD (Perplexity quota exhausted)
- Cold email: DEAD (sender reputation damaged, explicitly off the table)
- GHL API: BANNED by Brand's order (browser-only for GHL)

**What happened with our 2 hot leads:**
1. **Aaron** - (509) 521-8668, aaron@mdo.net, Reddit: LargeLanguageModelo
   - Called demo March 1-2, said "Sounds great" to founding deal
   - Follow-up email sent March 3 (4:20 AM) with founding member pitch
   - Aaron replied March 3 (10:17 AM): "Wasn't bad, but I didn't see nearly enough to take a $2000 bite. Romance me more :) Do you have any more to show off?"
   - Detailed follow-up email sent March 3 (8:21 PM) with full breakdown + custom demo offer
   - Aaron replied on Reddit: "You've replied 3x to the one comment (and in an email). We're good." = we over-contacted him
   - **Last contact: March 3-4. TEN DAYS of silence.** Ball was in his court.
   - NOTE: Pricing has changed since his interaction. He saw $1,997 one-time (no monthly). Current: $2,500 + $250/mo.

2. **Unknown caller** - (915) 268-9089
   - Called demo March 1-2, asked about pricing, positive on deal
   - NO follow-up ever sent (SMS blocked, no email captured)
   - **ZERO contact since the original call. 11 days gone.**

**The hard truth:** We had two people ready to buy and we fumbled both. Aaron got over-contacted, then ghosted for 10 days. The 915 caller got ZERO follow-up. Both leads are now cold-to-lukewarm at best. This sprint is about resurrecting them and finding new paths to revenue simultaneously.

---

## THE MATH

We need ONE closed deal. That's it. One contractor who pays $2,500 setup + $250/mo.

**Path A - Resurrect Aaron:** ~25% chance of closing (he was interested, we annoyed him, 10-day gap is bad but not fatal)
**Path B - Resurrect 915 caller:** ~15% chance (positive call but zero follow-up for 11 days, no name or email)
**Path C - New inbound from Reddit/website:** ~20% chance if we post 3-4 value threads this week
**Path D - Personal network/referral:** ~30% chance if Brand knows ANY contractor personally
**Path E - VAPI outbound to GHL contacts:** ~10% per batch of 13 calls (daily VAPI limit)

Combined probability of at least 1 close across all paths: ~70% if we execute everything. Good odds. Not guaranteed.

---

## PATH A: RE-ENGAGE AARON

### Context
- Aaron is a Reddit user (LargeLanguageModelo) who found us organically
- He called the demo, liked it, gave his email voluntarily
- He wanted to see more proof before buying at $1,997 (no monthly)
- We then triple-contacted him (3 Reddit replies + email) and he told us to stop
- 10 days of radio silence since March 3-4
- He may have: (a) moved on, (b) bought from a competitor, (c) still be thinking about it, (d) forgotten about us

### Strategy: The "Something Changed" Re-Engagement

DO NOT send a "just checking in" or "following up" message. That screams desperation and reminds him we were clingy. Instead, give him a REASON to re-engage by offering something new that didn't exist when we last talked.

### The Move

**Email to aaron@mdo.net**
- Owner: Brand (sends from rickclaw08@gmail.com, signs as Rick)
- Deadline: March 14 (tomorrow, before noon)
- Subject line: "Built something based on your feedback"

**Draft:**

> Hey Aaron,
>
> Remember when you said you wanted to see more before pulling the trigger? Took that seriously.
>
> Since we last talked, we completely rebuilt the voice engine. New voice model, tighter conversation flow, and honestly it sounds nothing like the demo you heard. Night and day.
>
> I went ahead and built a custom demo using a contractor business so you can hear what the production version actually sounds like. Give it a call: +15139953474
>
> Also dropped the pricing structure to make it easier to get started - $2,500 setup + $250/month instead of a bigger upfront. No contract, cancel the monthly anytime.
>
> If you're still interested, happy to build one specifically for your business in 24 hours. If not, no sweat at all.
>
> Rick
> ClawOps

**Why this works:**
1. "Based on your feedback" - he feels heard, not sold to
2. "Completely rebuilt" - new information, not a repeat pitch
3. The demo number is real and live - he can verify immediately
4. Pricing is genuinely different (lower monthly, different structure)
5. "If not, no sweat" - no pressure, no desperation, matches the "back off" rule
6. Short. Under 120 words. Respects his time.

### If He Responds
- If he calls the demo: Wait 2 hours, then email asking what he thought
- If he says he's interested: Offer the custom demo build within 24 hours
- If he wants the custom demo: Build it in VAPI with his business specifics, send him the number
- If he asks about pricing: Explain the new $2,500 + $250/mo structure, founding deal (limited spots)
- If he buys: Send Stripe link immediately (https://buy.stripe.com/8x2bJ179rblL8gQ6q83oA0m) - NOTE: This link is the OLD $2,500 + $550/mo link. **Need to create a NEW Stripe link for $2,500 + $250/mo before sending.**

### If He Doesn't Respond Within 72 Hours
- He's gone. Don't follow up again. Mark as cold. Move on.

### Measurable Outcome
- Email sent by March 14 noon: YES/NO
- Aaron responds within 72 hours: YES/NO
- If responds, demo call completed: YES/NO
- If demo, proposal sent: YES/NO
- Deal closed: YES/NO

---

## PATH B: RE-ENGAGE THE 915 CALLER

### Context
- Called the demo line March 1-2
- Asked about call transfer and pricing
- AI pitched $2,500 setup + $497/mo (old pricing) and founding deal at $1,997
- Said "Sounds great" - genuine positive engagement
- 2:15 minute call - substantial conversation
- We have ONLY their phone number: (915) 268-9089
- NO follow-up was ever sent - SMS is blocked (10DLC), no email captured
- 915 area code = El Paso, Texas area

### Strategy: Direct VAPI Outbound Call

This person already had a positive conversation with our AI. They liked what they heard. The only reason they didn't close is because nobody followed up. Eleven days is bad, but a warm callback from an AI they already talked to is less weird than a human cold call.

### The Move

**Option 1 (Preferred): Brand calls personally from his phone**
- Owner: Brand
- Deadline: March 14 (tomorrow, 10 AM Central / 9 AM Mountain)
- Script: "Hey, this is Rick from ClawOps. You called our demo line a couple weeks ago and I realized we never followed up. That's on us. You sounded interested in the AI receptionist for your business. Still something you're looking into?"

**Option 2 (Backup): VAPI outbound call from Jordan AI**
- Owner: Rick (fires the API call)
- Deadline: March 14, 10 AM Central
- Use VAPI native number (+15139953474) for best quality
- Jordan's prompt already handles re-engagement naturally
- Risk: They may not remember the first call, or may be put off by getting another AI call

**Option 3 (If phone doesn't work): Reverse lookup the number**
- Owner: Rick
- Deadline: March 14
- Use web search to identify who owns (915) 268-9089
- 915 = El Paso, TX area - search for contractors with this number
- If we find a business name, we can look up their email and send a personalized message
- Tools: Google search "(915) 268-9089", WhitePages, TrueCaller, Google Maps business search in El Paso

### Recommended Approach
Do Option 3 FIRST (reverse lookup), then Option 1 (Brand calls with personalized context).

If we know their business name: "Hey, this is Rick from ClawOps. You called our AI receptionist demo a couple weeks back. I looked you up and saw you run [business name]. Wanted to follow up personally because what we built is perfect for [their trade] companies."

### Measurable Outcome
- Reverse lookup completed by March 14 morning: YES/NO
- Call placed by March 14 noon: YES/NO
- Conversation had: YES/NO
- Interest level: HOT/WARM/COLD
- Demo scheduled or payment link sent: YES/NO

---

## PATH C: NEW INBOUND FROM REDDIT

### Context
- Reddit was generating leads before (Aaron came from Reddit)
- Engagement crons are dead (Perplexity quota), but manual posting still works
- Our Reddit account (RickClaw_Dev) has post history, some karma
- r/sweatystartup is BURNED (permanent ban)
- Last Reddit activity: unknown (crons died, manual posting stopped)

### Strategy: 3-4 High-Value Posts This Week

No spray-and-pray. No low-effort comments. Write 3 genuinely valuable posts that solve real problems for contractors. Each post should take 30-60 minutes to write and be the kind of thing that gets saved and shared.

### Post Schedule

**Post 1: March 14 (Friday)**
- Owner: Rick (writes and posts)
- Subreddit: r/smallbusiness
- Title: "I tracked what happens when contractors miss calls. The data is brutal."
- Content: Use real data from our mystery shopper research and call stats. Include specific numbers (% who don't answer, % who never call back, average response time). End with: "If anyone wants me to mystery-shop your business for free, DM me. I'll call you as a fake customer and tell you exactly what happened."
- CTA: Free mystery shop offer drives DMs
- Measurable outcome: Post published YES/NO, DMs received (count), conversations started (count)

**Post 2: March 16 (Sunday)**
- Owner: Rick (writes and posts)
- Subreddit: r/Entrepreneur
- Title: "I sell AI phone answering to contractors. $0 revenue, 2 months in. Here's what I've learned."
- Content: Transparent startup story. What worked (Reddit, demo line), what failed (cold email, outbound calling, trust center), what surprised us (contractors who called back at 2 AM). Honest numbers. No pitch.
- CTA: "If you're in a similar boat or want to hear the AI in action, DM me"
- This type of transparency post performs extremely well on r/Entrepreneur

**Post 3: March 18 (Tuesday)**
- Owner: Rick (writes and posts)
- Subreddit: r/HVAC or r/Plumbing
- Title: "How many calls do you miss when you're on a job? Honest question."
- Content: Not a pitch. A genuine question that starts a conversation. Add context: "I've been researching this for a product I'm building. The industry data says 60-80% of calls to contractors go unanswered during business hours. Is that accurate for you guys?"
- CTA: None in the post. Engage in comments. DM the most engaged commenters with the free mystery shop offer.

**Post 4 (bonus): March 19 (Wednesday)**
- Owner: Rick (writes and posts)
- Subreddit: r/GoHighLevel
- Title: "Built a white-label AI receptionist that plugs into GHL. Here's how it works."
- Content: Technical walkthrough of the VAPI + GHL integration. What it does, how calls flow, what the client dashboard looks like. Include screenshots if possible.
- CTA: "DM if you want to test it for your agency"

### Measurable Outcomes
- Posts published: target 3-4 / actual ___
- Total DMs received by March 20: target 5-10
- Conversations that reach demo stage: target 2-3
- Deals in pipeline: target 1

---

## PATH D: PERSONAL NETWORK / REFERRAL

### Context
This is statistically the fastest path to a first sale for any service business. One warm introduction converts 10x better than any cold outreach.

### The Move

**Brand's homework (March 14):**
1. Think of every contractor you know personally (HVAC, plumber, electrician, roofer, landscaper, general contractor)
2. Think of everyone you know who KNOWS a contractor (real estate agents, property managers, insurance agents, other business owners)
3. Text 5 people: "Hey, weird question. Do you know any contractors who miss a lot of phone calls? I built an AI that answers their phone 24/7 and I'm looking for my first beta user."

**Why "beta user" works:**
- Removes the sales pressure entirely
- People WANT to help friends with their new business
- "Beta user" implies they'd be doing YOU a favor
- It's honest (they would be our first real client)

**Sweetener:** For anyone referred, offer a reduced trial: $1,500 setup (40% off) + first month free. This is NOT public pricing. This is a friend-of-friend deal to get the first testimonial and case study.

### Measurable Outcome
- Owner: Brand
- Deadline: March 14, end of day
- Texts sent: target 5 / actual ___
- Referrals received: target 1-2
- Conversations started: target 1

---

## PATH E: VAPI OUTBOUND TO GHL CONTACTS

### Context
- 172 contacts in GHL, all consented via calendar widget
- GHL outbound is DEAD (Trust Center)
- BUT we can call them directly via VAPI API (bypasses GHL entirely)
- VAPI native number: ~13 calls/day limit
- Vonage BYO SIP: unlimited but lower quality
- Previous batch of 6 Eastern calls: 0 real conversations (hangups, IVRs, no-answers)
- Prompt has been heavily iterated (now v7 Belfort-style, with IVR handling, brevity rules, etc.)

### Strategy: Selective Outbound, Not Bulk

Don't blast all 172. Cherry-pick the best 30 and call 13/day over 3 days.

### Selection Criteria (Best 30)
1. Has a real business name (not "Owner Contact" entries)
2. HVAC or Plumbing (highest urgency services, biggest missed-call pain)
3. Located in hot climate states (TX, FL, AZ, GA) - AC season is approaching = pain is real
4. Has a phone number that isn't a toll-free or IVR-heavy line

### Execution Plan
- Owner: Rick (selects contacts, fires VAPI API calls)
- Day 1 (March 15): 13 calls via VAPI native number, 10 AM local time
- Day 2 (March 16): 13 calls via VAPI native number
- Day 3 (March 17): 4 remaining calls + any callbacks/follow-ups
- After each batch: Review transcripts, score leads (HOT/WARM/COLD)
- HOT leads: Brand calls back personally within 2 hours
- WARM leads: Send Stripe payment link if VAPI captured email/interest

### Call Quality Improvement
- Use VAPI native number (+15139953474) for all outbound (better quality than Vonage SIP)
- Temperature 0.5 (firm, decisive)
- Prompt v7 with Belfort energy, brevity rules, IVR detection, "ClawOps" pronunciation fix
- First message: "Hey, it's Jordan. Just giving a quick call." (not a pitch, sounds natural)

### What "Success" Looks Like
- 30 calls placed over 3 days
- 8-10 actually connect (pick up the phone)
- 3-4 have a real conversation (>30 seconds)
- 1-2 express genuine interest
- Brand follows up personally on hot ones
- 1 closes within the week

### Measurable Outcome
- Calls placed: target 30 / actual ___
- Conversations (>30 sec): target 3-4 / actual ___
- Hot leads generated: target 1-2 / actual ___
- Deals closed: target 1

---

## MINIMUM VIABLE SALES STACK

What MUST be working to close a deal:

| Component | Status | Fix Needed | Owner | Deadline |
|-----------|--------|------------|-------|----------|
| VAPI voice AI (demo line) | WORKING | None | Rick | Done |
| Stripe payment link ($2,500 + $250/mo) | NEEDS UPDATE | Old link is $2,500 + $550/mo. Create new link at $2,500 + $250/mo | Rick | March 14 |
| Founding page (theclawops.com/founding) | NEEDS UPDATE | Must reflect current $2,500 + $250/mo pricing | Rick | March 14 |
| Website (theclawops.com) | WORKING | Verify it loads properly | Rick | March 14 |
| Email (rickclaw08@gmail.com) | WORKING | None | - | Done |
| VAPI outbound calling | WORKING (limited) | 13/day limit on native number | Rick | Ongoing |
| Post-call SMS | BROKEN | 10DLC registration needed. Workaround: email follow-up instead | Rick | March 15 |
| GHL CRM (contact management) | WORKING (browser only) | No API usage per Brand's order | Rick | Done |

### Critical Fix: Stripe Payment Link

The current Stripe link (buy.stripe.com/8x2bJ179rblL8gQ6q83oA0m) charges $2,500 + $550/mo. Current pricing is $2,500 + $250/mo. If a lead clicks this link, they'll see the wrong price.

**Action:**
- Owner: Rick
- Deadline: March 14 morning
- Create new Stripe product/price for $2,500 setup + $250/mo recurring
- Update founding page HTML with new link
- Commit and push to GitHub
- Verify the page loads with correct pricing

### Workaround for Broken SMS

Since 10DLC registration is blocking ALL SMS delivery from every provider:

**Immediate workaround:** After any VAPI call where the prospect shows interest, send a follow-up EMAIL instead of SMS.
- Modify the VAPI webhook server to attempt email instead of SMS
- Or: Rick monitors VAPI call logs and manually sends email follow-ups to interested prospects
- Long-term: Get 10DLC registered (this is a multi-week process)

---

## DAILY ACTION CHECKLIST: MARCH 14-20

### DAY 1 - FRIDAY MARCH 14: "Reactivation Day"

**Morning (before 10 AM ET):**
- [ ] Rick: Create new Stripe payment link ($2,500 + $250/mo) - **OWNER: Rick, DEADLINE: 9 AM**
- [ ] Rick: Update founding page with new pricing and Stripe link - **OWNER: Rick, DEADLINE: 10 AM**
- [ ] Rick: Reverse lookup (915) 268-9089 to identify the caller - **OWNER: Rick, DEADLINE: 9 AM**
- [ ] Rick: Verify theclawops.com loads properly - **OWNER: Rick, DEADLINE: 9 AM**
- [ ] Rick: Verify VAPI demo line (+15139953474) is working - **OWNER: Rick, DEADLINE: 9 AM**

**Midday (10 AM - 2 PM ET):**
- [ ] Brand: Send re-engagement email to Aaron (aaron@mdo.net) - **OWNER: Brand, DEADLINE: 12 PM**
- [ ] Brand: Call (915) 268-9089 personally (use reverse lookup info if available) - **OWNER: Brand, DEADLINE: 12 PM**
- [ ] Brand: Text 5 people in personal network asking for contractor referrals - **OWNER: Brand, DEADLINE: 2 PM**

**Afternoon (2-6 PM ET):**
- [ ] Rick: Write and publish Reddit Post 1 (r/smallbusiness - missed calls data) - **OWNER: Rick, DEADLINE: 5 PM**
- [ ] Rick: Select best 30 contacts from GHL for VAPI outbound (cherry-pick, don't bulk) - **OWNER: Rick, DEADLINE: 4 PM**

**Evening:**
- [ ] Rick: Monitor Reddit post engagement, respond to all comments within 1 hour
- [ ] Rick: Check for Aaron's email reply
- [ ] Brand: Report back on network texts and 915 call result

**Day 1 Success Metrics:**
- Aaron email sent: YES/NO
- 915 caller contacted: YES/NO
- Stripe link updated: YES/NO
- Reddit post published: YES/NO
- Network texts sent: 0/5
- New conversations started: target 1-2

---

### DAY 2 - SATURDAY MARCH 15: "Outbound Day 1"

**Morning:**
- [ ] Rick: Fire VAPI outbound batch 1 (13 calls, 10 AM local time) - **OWNER: Rick, DEADLINE: varies by timezone**
- [ ] Rick: Monitor all Reddit DMs and comments from Post 1
- [ ] Rick: Check email for Aaron reply

**Midday:**
- [ ] Rick: Review VAPI call transcripts from batch 1, score leads
- [ ] Brand: Follow up personally on any HOT leads from VAPI batch
- [ ] Rick: Respond to any Reddit DMs with mystery shop offer

**Afternoon/Evening:**
- [ ] Rick: Send email follow-ups to any VAPI prospects who showed interest (workaround for broken SMS)
- [ ] Rick: Begin writing Reddit Post 2 (r/Entrepreneur transparency post)
- [ ] Brand: Follow up on any personal network referrals

**Day 2 Success Metrics:**
- VAPI calls placed: 0/13
- Conversations (>30 sec): target 3
- Hot leads from calls: target 1
- Reddit DMs received: target 2-3
- Aaron responded: YES/NO

---

### DAY 3 - SUNDAY MARCH 16: "Content + Outbound Day 2"

**Morning:**
- [ ] Rick: Fire VAPI outbound batch 2 (13 calls) - **OWNER: Rick**
- [ ] Rick: Publish Reddit Post 2 (r/Entrepreneur) - **OWNER: Rick, DEADLINE: 12 PM**

**Midday:**
- [ ] Rick: Review batch 2 transcripts, score leads
- [ ] Brand: Call back any HOT leads from batches 1 and 2
- [ ] Rick: Engage with Reddit Post 2 comments

**Evening:**
- [ ] Rick: Compile all leads so far, update pipeline status
- [ ] Rick: Draft custom demo for any prospect who's shown interest

**Day 3 Success Metrics:**
- VAPI calls placed: 0/13 (26 cumulative)
- Reddit posts published: 2 cumulative
- Active conversations across all channels: target 3-5
- Proposals or Stripe links sent: target 1

---

### DAY 4 - MONDAY MARCH 17: "Close Pressure Day"

**Morning:**
- [ ] Rick: Fire VAPI outbound batch 3 (remaining 4 calls + any re-dials) - **OWNER: Rick**
- [ ] Rick: Follow up on ALL open conversations (email, not SMS) - **OWNER: Rick, DEADLINE: 11 AM**
- [ ] Brand: Call back every warm/hot lead that hasn't closed yet - **OWNER: Brand**

**Midday:**
- [ ] Rick: If Aaron hasn't responded, he's gone. Mark cold. Move on. - **OWNER: Rick**
- [ ] Rick: Monitor all Reddit DMs, respond instantly
- [ ] Rick: If anyone expressed interest in custom demo, BUILD IT and send number within 4 hours

**Afternoon:**
- [ ] Rick: Begin writing Reddit Post 3 (r/HVAC or r/Plumbing) - **OWNER: Rick**
- [ ] Brand: Follow up on personal network referrals (2nd touch if no response)

**Day 4 Success Metrics:**
- All 30 VAPI calls completed: YES/NO
- Custom demos built: target 1-2
- Stripe links sent to qualified leads: target 1-2
- Revenue: still likely $0, but pipeline should be warm

---

### DAY 5 - TUESDAY MARCH 18: "Demo Day"

**Morning:**
- [ ] Rick: Publish Reddit Post 3 (r/HVAC or r/Plumbing) - **OWNER: Rick, DEADLINE: 11 AM**
- [ ] Rick: Build and test any custom demos requested
- [ ] Rick: Follow up with any prospects who received custom demos 24+ hours ago

**Midday:**
- [ ] Brand: Live call any prospect who's listened to their custom demo - **OWNER: Brand**
- [ ] Rick: Monitor Reddit, respond to all engagement
- [ ] Rick: Send "revenue leak calculation" to any contractor who engaged on Reddit or calls

**Afternoon:**
- [ ] Rick: Begin writing Reddit Post 4 (r/GoHighLevel) if previous posts got traction
- [ ] Rick: Update pipeline tracker with all activity

**Day 5 Success Metrics:**
- Custom demos delivered: target 1-2
- Prospects who listened to custom demo: target 1
- Stripe payment link clicks: target 1
- Revenue: target $0-$2,500 (if any conversion happens, likely today or tomorrow)

---

### DAY 6 - WEDNESDAY MARCH 19: "Follow-Up Day"

**Morning:**
- [ ] Rick: Publish Reddit Post 4 (r/GoHighLevel) - **OWNER: Rick**
- [ ] Rick: Follow up on EVERY open conversation that's 48+ hours old
- [ ] Brand: Make final follow-up calls to hottest leads

**Midday:**
- [ ] Rick: If we have a prospect on the edge, offer the reduced trial ($1,500 setup + first month free) to close - **OWNER: Rick (draft offer), Brand (approves)**
- [ ] Rick: Review all Reddit post performance, double down on best-performing subreddit

**Afternoon:**
- [ ] Rick: Comprehensive pipeline review - where is every lead?
- [ ] Rick: Identify any leads that need one more touch vs. leads that are dead
- [ ] Brand: Send Stripe link to anyone who said "yes" or "let's do it" and hasn't paid

**Day 6 Success Metrics:**
- All follow-ups sent: YES/NO
- Active deals in negotiation: target 1-2
- Revenue: target $0-$2,500

---

### DAY 7 - THURSDAY MARCH 20: "Close Day"

**Morning:**
- [ ] Brand: Call every warm lead one final time with urgency: "We're closing our founding pricing this week. Wanted to give you a heads up before it goes up." - **OWNER: Brand**
- [ ] Rick: Send final email to all warm leads with the same urgency message
- [ ] Rick: Process any pending Stripe payments

**Midday:**
- [ ] Sprint retrospective: What worked? What didn't? What do we do next week?
- [ ] Rick: Write sprint results to `claw-agency/sales/first-sale-sprint-results.md`

**Day 7 Success Metrics:**
- CLOSED DEAL: YES/NO
- If yes: Revenue amount, customer name, service level
- If no: Pipeline status, next steps, what's the closest lead

---

## ALTERNATIVE CHANNELS TO ACTIVATE NOW

### 1. Reddit Manual Posting (ACTIVE NOW)
- Status: CAN DO IMMEDIATELY
- No API dependency, no Perplexity needed
- Just write good posts and engage in comments
- Expected yield: 5-10 DMs per quality post

### 2. Website Inbound (PASSIVE, ALREADY LIVE)
- theclawops.com is live with contact form
- Demo phone number is public
- Anyone who finds us can call the demo and self-qualify
- Improvement: Add a "Try our AI - call now" CTA more prominently on homepage

### 3. Google My Business / Local SEO (FREE, 1-2 WEEK SETUP)
- Create a Google Business Profile for ClawOps
- Categorize as "IT Service" or "Business Service"
- Service area: nationwide (or focus on TX, FL, AZ, GA)
- Takes 1-2 weeks to verify but then drives organic local traffic
- Owner: Rick (setup), Brand (verification if mail is needed)
- Deadline: Start March 14

### 4. YouTube Shorts / TikTok (FREE, BRAND'S JOB)
- Record 30-60 second videos showing the AI receptionist in action
- "Watch an AI answer a contractor's phone" - record a live demo call
- Zero cost, massive reach potential
- Owner: Brand
- Deadline: First video by March 17

### 5. Facebook Groups for Contractors (FREE, MANUAL)
- Join: "HVAC Technicians", "Plumber Life", "Contractor Business Tips", etc.
- Same strategy as Reddit: value-first posts, then DM engaged commenters
- Owner: Rick (can post from Brand's FB if given access) or Brand
- Deadline: Join 3 groups by March 15

### 6. Nextdoor Business Posts (FREE, LOCAL)
- Nextdoor has "Local Deals" and business recommendation features
- Post as a local business offering AI receptionist services
- Targets SMBs in specific geographic areas
- Owner: Brand (needs personal Nextdoor account)

### 7. Upwork Quick Proposals (IF IDENTITY ISSUE RESOLVED)
- Currently blocked by identity verification
- If resolved: post a gig offering "AI Phone Receptionist Setup for Contractors"
- Not a priority given the blocker

### 8. Partner with a GHL Agency (HIGH LEVERAGE)
- Find ONE GHL agency owner who serves contractors
- Offer them a white-label deal: they sell it, we build it, they keep the markup
- One agency partner = multiple clients
- Find them on: r/GoHighLevel, GHL Facebook communities, LinkedIn
- Owner: Rick (identifies partners), Brand (closes the deal)
- Deadline: Start outreach March 16

---

## WHAT NOT TO DO THIS WEEK

1. **DO NOT send cold emails.** Sender reputation is shot. It won't work.
2. **DO NOT mass-blast all 172 GHL contacts.** Cherry-pick the best 30.
3. **DO NOT contact Aaron more than once.** One email. That's it.
4. **DO NOT try to fix SMS/10DLC this week.** It's a multi-week process. Use email as workaround.
5. **DO NOT write more playbooks or strategies.** This is the plan. Execute it.
6. **DO NOT try to fix GHL Trust Center this week.** It's rejected and waiting on GHL support. Focus on VAPI direct.
7. **DO NOT discount below $2,500 + $250/mo for standard prospects.** The $1,500 trial is ONLY for personal network referrals, and only if Brand approves.
8. **DO NOT post more than 1 Reddit thread per day.** Quality over quantity. One great post beats five mediocre ones.
9. **DO NOT triple-contact anyone.** One touch per channel, then wait. Brand's explicit rule.

---

## ESCALATION TRIGGERS

If any of these happen, stop the sprint and reassess:

1. **Aaron buys** - Sprint is WON. Shift to delivery and getting a testimonial.
2. **915 caller buys** - Sprint is WON. Same shift.
3. **A Reddit lead goes HOT** - Drop everything and focus on closing them. Speed wins.
4. **Brand gets a referral who's interested** - Highest priority lead. Custom demo within 4 hours.
5. **All paths fail by Day 5** - Reassess pricing (consider $997 one-time setup as a "get started" tier), reassess channel strategy, consider paid ads ($50/day on Facebook targeting contractors).
6. **VAPI credit runs out** - Currently ~$9.50 remaining. At ~$0.10/min, that's ~95 minutes or ~60-70 calls. Should be enough for the sprint but monitor closely. Add funds if below $3.

---

## SPRINT SCORECARD

| Metric | Target | Actual (update daily) |
|--------|--------|-----------------------|
| Aaron re-engagement email sent | 1 | |
| 915 caller contacted | 1 | |
| Network referral texts sent | 5 | |
| Reddit posts published | 3-4 | |
| Reddit DMs received | 5-10 | |
| VAPI outbound calls placed | 30 | |
| VAPI conversations (>30 sec) | 3-4 | |
| Custom demos built | 1-2 | |
| Proposals/Stripe links sent | 2-3 | |
| Deals closed | 1 | |
| Revenue collected | $2,750+ | |

---

## IMMEDIATE ACTIONS (DO RIGHT NOW - March 13-14)

### Rick (Tonight/Tomorrow Morning):
1. Create new Stripe payment link for $2,500 + $250/mo
2. Update founding page pricing and link
3. Reverse lookup (915) 268-9089
4. Select best 30 contacts from GHL for VAPI outbound
5. Draft Aaron re-engagement email for Brand's review/send
6. Write Reddit Post 1 draft

### Brand (Tomorrow):
1. Review and send Aaron email
2. Call (915) 268-9089 personally
3. Text 5 people in personal network
4. Approve/reject reduced trial pricing for referrals

---

*This plan has 5 concurrent paths to close. We don't need all of them to work. We need ONE. Execute all five and the math says we close something this week.*

*Next review: March 17, 2026 (Day 4 - midpoint check)*
*Sprint ends: March 20, 2026*
