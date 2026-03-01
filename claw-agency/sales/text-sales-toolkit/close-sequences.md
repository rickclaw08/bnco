# Close Sequences - From Interest to Payment

> These are exact message sequences with timing, triggers, and copy-paste text.
> Every sequence has a clear entry point, escalation triggers, and exit conditions.
> If a prospect goes silent at any step, use the "Gone Dark" recovery at the bottom.

---

## Sequence 1: The 48-Hour Close

**Target:** Small business owner who expressed interest (replied to a DM, filled out a form, engaged in conversation).
**Goal:** Go from first real conversation to payment in 48 hours or less.
**Entry trigger:** Prospect responds to any outreach and shows interest.

### Hour 0 - Qualification Message

**Send when:** Prospect first responds to your outreach.

```
Awesome - glad you're interested. Before I put anything together, I need to understand your situation so I don't waste your time.

Quick questions:
1. What type of business are you running? (Industry + rough size)
2. How many inbound calls do you get per week, roughly?
3. How are those calls handled right now? (You personally? Receptionist? Voicemail? Answering service?)
4. What's an average new customer worth to you in revenue?

Don't need exact numbers - ballpark is fine. This helps me figure out if we're actually a good fit or not.
```

**Trigger to next step:** They answer the questions (any level of detail).
**If no response in 12 hours:** Send a nudge:

```
Hey [NAME] - just following up on my questions above. Need those answers to put together your revenue analysis. Takes 2 minutes to reply. 👆
```

---

### Hour 2-6 - Revenue Leak Calculation

**Send when:** You have their answers. Do the math before sending.

**The Math:**
- Monthly calls = weekly calls x 4
- Missed calls = monthly calls x 0.25 (conservative 25% miss rate)
- Revenue leak = missed calls x average customer value
- Annual leak = monthly leak x 12

```
OK [NAME], I ran your numbers. Here's what I'm seeing:

📞 Estimated monthly calls: [NUMBER]
❌ Estimated missed calls (at 25%, industry average): [NUMBER]
💰 Average customer value: $[AMOUNT]
🔥 Monthly revenue leak: $[MONTHLY_LEAK]
📅 Annual revenue leak: $[ANNUAL_LEAK]

That's $[ANNUAL_LEAK] a year walking out your door to competitors who pick up the phone faster.

Here's the fix: our AI phone system answers every call in under 2 rings, 24/7. It qualifies leads, books appointments into your calendar, answers FAQs, and sends you a summary of every conversation.

For [THEIR_INDUSTRY] businesses your size, we typically set this up for a one-time $2,500 setup fee plus $497/month. That means you'd be spending $497 to recover $[MONTHLY_LEAK] - a [X]x return.

Want me to put together a custom proposal for [COMPANY_NAME]? I can have it ready in a couple hours.
```

**Trigger to next step:** They say yes, ask more questions, or show continued interest.
**If they object:** Go to objection-handlers.md and handle it.

---

### Hour 6-12 - The Proposal

**Send when:** They greenlight the proposal (or even just don't say no).

```
Here's your custom setup for [COMPANY_NAME]:

🏢 Business: [COMPANY_NAME] ([THEIR_INDUSTRY])
📞 System: AI Voice Agent - Inbound Call Handling
✅ Includes:
   - 24/7 call answering (every call, every time)
   - Custom-trained on your services, pricing, and FAQs
   - Real-time appointment booking (synced to [THEIR_CALENDAR_TOOL])
   - Lead qualification and scoring
   - Call summaries sent via [EMAIL/SMS/BOTH]
   - [ANY_ADDITIONAL_FEATURES_RELEVANT_TO_THEM]

💰 Investment:
   - Setup: $2,500 one-time
   - Monthly: $497/mo
🚀 Setup time: 48 hours from payment
🔒 No long-term contract - cancel anytime

What you get back: based on your numbers, this recovers approximately $[MONTHLY_LEAK]/month in currently missed revenue. Pays for itself in the first [NUMBER] days.

Ready to get started? Here's the link to lock in your spot:
[STRIPE_PAYMENT_LINK]

Setup starts the moment payment processes. I'll have your system live within 48 hours.
```

**Trigger to next step:** They pay (sequence complete) or they hesitate.

---

### Hour 12-24 - The Nudge (If They Haven't Paid)

```
Hey [NAME] - just checking in on the proposal. Any questions I can clear up?

I'm blocking off setup time for new clients this week and want to make sure [COMPANY_NAME] gets in. Once you're in, I start building your custom system immediately.

[STRIPE_PAYMENT_LINK]

If something's not right about the proposal, just tell me straight - I'd rather adjust it than have you sitting on the fence.
```

---

### Hour 36-48 - The Final Push

```
[NAME] - last follow-up on this.

I've got [NUMBER] setup slots left this week and I want to give [COMPANY_NAME] priority since we already did the full analysis.

Quick recap: $2,500 setup + $497/month to recover $[MONTHLY_LEAK]/month in missed call revenue. 48-hour setup. Cancel anytime.

[STRIPE_PAYMENT_LINK]

After this week, I'm moving on to the next batch of businesses. No pressure, but I wanted to give you first shot since we've already done the work.

Let me know either way - a "no" is totally fine too. I'd rather know than guess.
```

**Exit conditions:**
- They pay → Begin onboarding (see email-templates.md)
- They say no → Thank them, add to long-term nurture list
- No response after 48 hours → Move to "Gone Dark" recovery below

---

## Sequence 2: The "Fix This For Me" Close

**Target:** Business owner who used your website scanner or received a free audit. They've seen their problems and want someone to solve them.
**Goal:** Convert scan/audit results into a paid fix.
**Entry trigger:** Scanner results delivered or audit completed.

### Step 1 - Deliver the Results (Hour 0)

```
[NAME] - just finished your scan for [WEBSITE/BUSINESS]. Here's what I found:

🔴 Critical Issues:
[ISSUE_1 - e.g., "No SSL certificate - customers see a 'Not Secure' warning"]
[ISSUE_2 - e.g., "Call-to-action phone number goes to voicemail after 5pm"]
[ISSUE_3 - e.g., "Google Business listing has incorrect hours"]

🟡 Performance Issues:
[ISSUE_4 - e.g., "Website loads in 4.2 seconds (should be under 2)"]
[ISSUE_5 - e.g., "No online booking option - competitors in your area all have one"]

🟢 What's Working:
[POSITIVE_1 - always include something positive]
[POSITIVE_2]

The critical issues are costing you customers right now. The performance issues are costing you rankings. Combined, I'd estimate this is a $[MONTHLY_LOSS]/month revenue impact.

Want me to fix all of this for you?
```

**Trigger to next step:** They respond with interest, ask questions, or say "yes."

---

### Step 2 - The Fix Offer (Within 2 Hours of Response)

```
Here's what the fix looks like for [COMPANY_NAME]:

I'll handle everything:
✅ [FIX_1 matching ISSUE_1]
✅ [FIX_2 matching ISSUE_2]
✅ [FIX_3 matching ISSUE_3]
✅ [FIX_4 matching ISSUE_4]
✅ [FIX_5 matching ISSUE_5]
✅ AI phone system setup (so you never miss another call)
✅ Monthly monitoring to catch new issues before they cost you money

Two options:

Option A - One-Time Fix: $[ONE_TIME_PRICE]
I fix everything listed above. Done in [TIMEFRAME]. You're on your own for monitoring after that.

Option B - Fix + Protect (Recommended): $2,500 setup + $497/month
Everything in Option A, plus ongoing AI phone coverage, monthly scans, and priority support. Cancel anytime.

Most of my clients go with Option B because the problems come back if nobody's watching. But either option gets you fixed up.

Which one makes sense for you?

Option A: [STRIPE_LINK_A]
Option B: [STRIPE_LINK_B]
```

**Trigger to next step:** They choose an option or ask questions.

---

### Step 3 - Urgency Nudge (24 Hours If No Decision)

```
[NAME] - quick update on your scan results.

I just re-ran a couple of the checks and [SPECIFIC_ISSUE] is still active. Every day it stays unfixed, you're losing [SPECIFIC_IMPACT - e.g., "potential customers who see the 'Not Secure' warning and bounce"].

I've got availability to start on [COMPANY_NAME] this week. After that, my next opening is [DATE - push it out 2+ weeks].

Ready to get this handled?

Option A (One-Time Fix): [STRIPE_LINK_A]
Option B (Fix + Protect): [STRIPE_LINK_B]

Or if you have questions, just reply here. Happy to jump on a quick call too.
```

---

## Sequence 3: The Agency-in-a-Box Close

**Target:** Marketing agency owner, freelancer, or entrepreneur who wants to resell AI services under their own brand.
**Goal:** Sell white-label agency access or partnership deal.
**Entry trigger:** Someone asks about reselling, white-labeling, or starting an AI agency.

### Step 1 - Qualification (Hour 0)

```
Hey [NAME] - glad you're looking at the agency side of this. Before I get into details, let me understand where you're at:

1. Do you currently run an agency or are you starting one?
2. If existing, how many clients do you have right now?
3. What services are you currently offering?
4. What's your target market? (Industry/size/location)
5. Have you sold AI or automation services before?

No wrong answers here - I work with everyone from solo freelancers to 50-person agencies. Just need to know where you're starting so I can show you the right path.
```

---

### Step 2 - Custom Demo (2-6 Hours After Qualification)

```
[NAME] - based on what you told me, here's how the agency model works for someone in your position:

**The Setup:**
You sell AI phone systems and website optimization to [THEIR_TARGET_MARKET] businesses under YOUR brand. We build and maintain the tech behind the scenes. Your clients never know we exist.

**The Math:**
- You charge your clients $[RETAIL_PRICE]/month per business
- Your cost to us: $[WHOLESALE_PRICE]/month per business
- Your margin: $[MARGIN]/month per client
- 10 clients = $[10x_MARGIN]/month in recurring revenue
- 25 clients = $[25x_MARGIN]/month in recurring revenue
- 50 clients = $[50x_MARGIN]/month in recurring revenue

**What You Get:**
✅ White-labeled AI phone system (your brand, your pricing)
✅ Client dashboard you can customize
✅ Sales materials and scripts (so you know exactly how to sell it)
✅ Website scanner tool under your domain
✅ Setup and tech support - we handle the hard stuff
✅ Training on how to pitch and close [THEIR_TARGET_MARKET] businesses

**What You Do:**
📞 Find the clients and close the deals
🤝 Be the face of the business
📈 Collect recurring monthly revenue

Want to see a live demo of what your clients would get? I can walk you through it in 20 minutes. When's a good time?

[CALENDAR_LINK]
```

---

### Step 3 - Post-Demo Close (Within 2 Hours of Demo)

```
[NAME] - great demo today. Here's the recap and next steps:

**Agency Partnership - [THEIR_NAME/AGENCY_NAME]:**

Setup fee: $5,000 (one-time, covers your branded portal + first 3 client slots + training)
Monthly platform fee: $[PLATFORM_FEE]/month (covers infrastructure, updates, support)
Per-client cost: $100/month per active client

**Your path to $[TARGET_REVENUE]/month:**
Month 1-2: Close [NUMBER] clients at $[RETAIL]/month = $[REVENUE] revenue, $[PROFIT] profit
Month 3-4: Scale to [NUMBER] clients = $[REVENUE] revenue, $[PROFIT] profit  
Month 6+: [NUMBER] clients = $[REVENUE] revenue, $[PROFIT] profit

**ROI on your setup fee:** Paid back with your first [NUMBER] clients.

Ready to get started? Here's the link:
[STRIPE_PAYMENT_LINK]

Once payment is in, I schedule your onboarding call for this week and we get your branded portal up within [TIMEFRAME]. You could be pitching your first clients by [DATE].
```

---

### Step 4 - Follow-Up (24-48 Hours If No Payment)

```
[NAME] - following up on the agency partnership.

I should mention - I only take on [NUMBER] new agency partners per month. This isn't fake scarcity, it's a real capacity limit since I personally oversee every onboarding.

I have [NUMBER] spots left for [MONTH]. After that, the next opening is [NEXT_MONTH].

If you're in, lock it in here: [STRIPE_PAYMENT_LINK]

If you have questions or concerns, let me know. I'd rather talk through them than lose you to overthinking.
```

---

## Sequence 4: The MSP Bulk Close

**Target:** Managed Service Provider (MSP), IT company, or business consultant who manages multiple small businesses and could deploy your solution across their entire client base.
**Goal:** Land a multi-seat annual deal.
**Entry trigger:** MSP or consultant expresses interest in offering AI services to their existing client base.

### Step 1 - Discovery (Hour 0)

```
[NAME] - this is exciting because MSPs/consultants are our highest-ROI partners. You already have the trust and the client relationships, we just add a new revenue stream on top.

Help me understand your setup:
1. How many active business clients do you manage?
2. What services do you currently provide them?
3. Have any of them asked about AI, automation, or better phone systems?
4. What's your average monthly revenue per client right now?
5. Would you want to resell this under your brand or refer them to us?

The approach is different depending on your answers, so I want to get this right.
```

---

### Step 2 - Free Trial Offer (2-6 Hours After Discovery)

```
Here's what I want to do, [NAME]:

Let me set up a free pilot with [NUMBER] of your clients. No cost to you or them. I'll deploy the AI phone system for [TRIAL_LENGTH] days so you can see the real-world results before committing to anything.

I need from you:
- [NUMBER] client businesses to pilot (ideally ones who've complained about missed calls or phone issues)
- Basic info: business name, industry, phone number, hours, services offered
- An intro to the business owner (warm handoff works best)

What I'll deliver:
- Fully functional AI phone system for each pilot client
- Weekly performance reports (calls handled, appointments booked, revenue captured)
- Client feedback summary at end of trial

After [TRIAL_LENGTH] days, you'll have hard data on exactly what this adds to your service offering. If the numbers don't make sense, we shake hands and move on. If they do, we talk about a bulk deal for your full client base.

Sound fair? Which [NUMBER] clients should we start with?
```

---

### Step 3 - Value Demo Presentation (End of Trial Period)

```
[NAME] - the pilot results are in. Here's the report for your [NUMBER] test clients:

📊 **[CLIENT_1_NAME]:**
- Calls handled by AI: [NUMBER]
- Appointments booked: [NUMBER]  
- Estimated revenue captured: $[AMOUNT]
- Client feedback: [QUOTE_OR_SUMMARY]

📊 **[CLIENT_2_NAME]:**
- Calls handled by AI: [NUMBER]
- Appointments booked: [NUMBER]
- Estimated revenue captured: $[AMOUNT]
- Client feedback: [QUOTE_OR_SUMMARY]

📊 **[CLIENT_3_NAME]:**
- Calls handled by AI: [NUMBER]
- Appointments booked: [NUMBER]
- Estimated revenue captured: $[AMOUNT]
- Client feedback: [QUOTE_OR_SUMMARY]

**Combined pilot results:**
- Total new revenue captured: $[TOTAL]
- Average per client: $[AVERAGE]/month
- Your potential recurring revenue from [TOTAL_CLIENT_COUNT] clients: $[BIG_NUMBER]/month

These aren't projections. These are actual results from the past [TRIAL_LENGTH] days with YOUR clients.

Want to jump on a call to discuss the bulk deal for your full client base? I have time [DAY] at [TIME] or [DAY] at [TIME].
```

---

### Step 4 - Annual Bulk Deal (During or After the Call)

```
[NAME] - based on our conversation, here's the MSP bulk deal for [COMPANY_NAME]:

**Bulk Annual Agreement:**

Clients covered: up to [NUMBER] businesses
Per-client rate: $[BULK_PRICE]/month (vs. $[RETAIL_PRICE] retail - you save $[SAVINGS] per client)
Your suggested resale price: $[RESALE_PRICE]/month per client
Your monthly margin per client: $[MARGIN]
Total annual value at [NUMBER] clients: $[ANNUAL_REVENUE] revenue / $[ANNUAL_PROFIT] profit

**Annual commitment bonus (pay annually, save more):**
Annual payment: $[ANNUAL_BULK_PRICE] (saves $[ANNUAL_SAVINGS] vs. monthly)
Includes: priority support, dedicated account manager, quarterly business reviews

**Included for all MSP partners:**
✅ White-labeled client dashboard
✅ Bulk onboarding support (we help you roll out to all clients)
✅ Co-branded marketing materials
✅ MSP partner portal with client analytics
✅ Priority feature requests

Ready to lock this in?

Monthly billing: [STRIPE_LINK_MONTHLY]
Annual billing (save $[SAVINGS]): [STRIPE_LINK_ANNUAL]

The sooner we start, the sooner your clients stop missing calls and the sooner you start collecting that recurring revenue.
```

---

## "Gone Dark" Recovery Sequence

**Use when:** Prospect goes silent at any stage of any sequence. Wait 48 hours after your last message before starting this.

### Recovery Message 1 (48 Hours After Last Message)

```
Hey [NAME] - bumping this up in case it got buried. I know things get crazy.

Still interested in [BRIEF_REMINDER_OF_WHAT_YOU_DISCUSSED]? If so, I'm here. If the timing isn't right, no worries - just let me know so I'm not bugging you.
```

### Recovery Message 2 (5 Days After Last Message)

```
[NAME] - last check-in on this.

I'm guessing one of three things happened:
1. You got busy (totally get it)
2. You decided it's not for you right now (also fine)  
3. You're stuck on something specific and aren't sure how to bring it up

If it's #1, just reply "busy" and I'll follow up next week.
If it's #2, just reply "pass" and I'll stop reaching out.
If it's #3, just tell me what's holding you back.

Any of those answers is fine. The only bad answer is no answer, because I don't want to keep bothering you if you're not interested.
```

### Recovery Message 3 - The Breakup (10 Days After Last Message)

```
[NAME] - going to assume this isn't the right time for [COMPANY_NAME]. Totally respect that.

I'm closing out your file on my end, but I'm leaving the door open. If you ever want to revisit the [BRIEF_DESCRIPTION - e.g., "AI phone system"], just reply to this message and I'll pick up right where we left off.

In the meantime, those [MISSED_CALLS/ISSUES] aren't going to fix themselves. When you're ready, I'll be here.

Wishing you all the best - [YOUR_NAME]
```

**Note on the Breakup Message:** This works because it triggers loss aversion. They feel the "file being closed" and the implied "you're on your own now." About 15-20% of dead leads respond to this message.

---

## Universal Timing Rules

| Situation | Response Time |
|-----------|---------------|
| Hot lead (form submission, "yes" response) | Under 5 minutes |
| Warm lead (DM reply, question asked) | Under 1 hour |
| Post-demo follow-up | Within 2 hours |
| Proposal delivery | Within 6 hours of qualification |
| First nudge after no response | 12-24 hours |
| Second nudge | 48 hours |
| Breakup message | 7-10 days |
| Re-engagement (long-term nurture) | 30 days |

## Conversion Benchmarks

Track these to know if your sequences are working:

| Metric | Target |
|--------|--------|
| DM response rate | 15-25% |
| Qualification to proposal | 60-70% |
| Proposal to payment | 25-35% |
| Overall DM to close | 5-10% |
| Gone Dark recovery rate | 10-20% |
| Trial to annual deal (MSP) | 40-60% |

If you're below these numbers, the problem is usually in your targeting (wrong people) or your speed (too slow to respond).

---

*Last updated: 2026-02-27*
*Part of the ClawOps Sales Toolkit*
