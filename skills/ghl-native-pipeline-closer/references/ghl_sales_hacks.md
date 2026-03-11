# GHL Sales Hacks Reference

Proven native GHL tactics for maximizing conversion rates at every pipeline stage. Each hack includes the workflow logic, timing, and messaging framework.

## Hack 1: The 5-Minute Rule

**Goal:** Contact every new lead within 5 minutes of creation.

**Why it works:** Leads contacted within 5 minutes are 100x more likely to be reached and 21x more likely to convert than leads contacted after 30 minutes (InsideSales.com data). Most competitors take 24-48 hours to follow up.

**Implementation:**
```
Trigger: Opportunity Created
1. [Immediate] Send SMS: 
   "Hey {{first_name}}, this is Jordan from ClawOps. Saw you 
   came through - got 2 minutes for a quick chat about automating 
   your phones? If not, grab a time here: [calendar link]"
2. [Immediate] Send Email:
   Subject: "{{first_name}}, quick question"
   Body: Short value prop + calendar link
3. [Wait 3 min] Voice AI Outbound Call
4. [Wait 2 min] If no answer, Send SMS:
   "Just tried calling - no worries if now's not good. 
   This link works 24/7: [calendar link]"
5. Add Tag: "5min-rule-complete"
```

**Key rules:**
- SMS fires FIRST (highest open rate, lowest friction)
- Call within 3-5 min (not immediately, give them time to read SMS)
- Always include calendar link as fallback
- Total sequence completes in under 10 minutes

## Hack 2: Double-Dial Strategy

**Goal:** Increase phone pickup rate by 40-60%.

**Why it works:** First call gets screened. Second call from the same number within minutes signals urgency and legitimacy (spam callers don't call back).

**Implementation:**
```
Trigger: Tag Added "needs-double-dial"
1. Voice AI Outbound Call (Agent 1)
2. Wait: 3 minutes
3. If/Else: Call connected for 60+ seconds?
   YES -> End (they answered)
   NO  -> Continue
4. Voice AI Outbound Call (Agent 2 - different voice/persona)
5. Wait: 2 minutes
6. If/Else: Call connected?
   YES -> End
   NO  -> Voicemail Drop + SMS combo (see Hack 3)
7. Remove Tag: "needs-double-dial"
```

**Key rules:**
- 3-minute gap between calls (not immediate, not too long)
- Use different Voice AI agent for second call if possible (different voice sounds like a different person trying to reach them)
- Cap at 2 calls per session, never 3+
- Only use during prime calling hours (10 AM - 2 PM local)

## Hack 3: Ringless Voicemail + SMS One-Two Punch

**Goal:** Get your message in front of the lead without interrupting their day, then follow up with actionable SMS.

**Why it works:** Voicemail gets listened to at 80%+ rate. SMS sent 2 minutes after the VM notification creates a "they're really trying to reach me" effect.

**Implementation:**
```
Trigger: Tag Added "vm-sms-punch"
1. Voicemail Drop: 
   "Hey {{first_name}}, this is Jordan from ClawOps. I'm 
   reaching out because we help [niche] businesses like yours 
   never miss another customer call with AI receptionists. 
   I'll shoot you a text with more info. Talk soon."
2. Wait: 2 minutes
3. Send SMS:
   "Hey {{first_name}} - just left you a quick voicemail. 
   Here's what I mentioned: we set up AI receptionists that 
   answer your phones 24/7. Want to see a quick demo? 
   [calendar link]"
4. Remove Tag: "vm-sms-punch"
```

**Key rules:**
- VM should be 15-20 seconds max (any longer gets skipped)
- Reference the VM in the SMS ("just left you a voicemail")
- SMS arrives 2 min after VM notification (creates urgency)
- Include clear CTA in SMS (calendar link)

## Hack 4: No-Show Nurture Sequence

**Goal:** Recover 30-50% of no-shows within 48 hours.

**Why it works:** Most no-shows aren't rejections. They forgot, got busy, or felt awkward about missing. Give them an easy out and a new booking path.

**Implementation:**
```
Trigger: Appointment Status Changed to "No-Showed"
Phase 1 - Immediate (10 min post no-show):
1. Wait: 10 minutes
2. Send SMS:
   "Hey {{first_name}}, no worries about missing our call - 
   things come up! Here's my calendar to rebook whenever 
   works: [calendar link]"
   (ZERO guilt, ZERO pressure)

Phase 2 - Follow-up (4 hours later):
3. Wait: 4 hours
4. If/Else: Rescheduled?
   YES -> End
   NO  -> Send SMS:
   "Hey {{first_name}}, just circling back. I've got a couple 
   spots open this week if you still want to chat about 
   automating your phones. [calendar link]"

Phase 3 - Final attempt (next day):
5. Wait: 20 hours
6. If/Else: Rescheduled?
   YES -> End
   NO  -> Voice AI Outbound Call
7. Wait: 2 hours
8. If/Else: Rescheduled?
   YES -> End
   NO  -> Send SMS:
   "Last check-in - if the timing isn't right, totally get it. 
   Just reply 'later' and I'll follow up next month, or grab 
   a spot here: [calendar link]"
9. Add Tag: "no-show-nurture-complete"
```

**Key rules:**
- NEVER guilt-trip in the first message. "No worries" is the magic phrase.
- Space messages out. Don't send 3 texts in 2 hours.
- Give them an out ("reply 'later'") so they feel in control.
- Voice AI call on day 2 catches people who ignore texts.
- After 3 touches, stop. Move to monthly nurture drip, not daily harassment.

## Hack 5: Fast-Track Pipeline Jumping

**Goal:** Skip pipeline stages for high-intent leads who are ready to book NOW.

**Why it works:** Not every lead needs a 5-day nurture. Someone who replies "yes, let's book a call" should be in "Demo Booked" within minutes, not stuck in "Contacted" waiting for the next workflow step.

**Implementation:**
```
Trigger: Contact Replied (any channel)
1. If/Else: Message contains booking intent keywords?
   ("book", "schedule", "call", "demo", "interested", "yes", "let's do it")
   YES -> Continue
   NO  -> End (let normal workflow handle)
2. Add Tag: "hot-lead"
3. Update Opportunity: Stage -> "Engaged"
4. Send SMS:
   "Love it! Here's my calendar - grab whatever works: 
   [calendar link]"
5. Wait: 15 minutes
6. If/Else: Appointment Scheduled?
   YES -> Update Opp to "Demo Booked", End
   NO  -> Send SMS: "Still there? Just 30 seconds to book: [calendar link]"
7. Wait: 1 hour
8. If/Else: Appointment Scheduled?
   YES -> Update Opp to "Demo Booked", End
   NO  -> Voice AI Outbound Call (strike while iron is hot)
```

**Key rules:**
- Intent detection uses If/Else with "message contains" conditions
- Override any existing workflow (remove from other workflows first)
- Respond within SECONDS of a hot reply, not hours
- Tag "hot-lead" for reporting (what % of leads are high-intent?)
- Voice AI call is the nuclear option if they expressed intent but didn't book

## Hack 6: Breakup Sequence (Loss Aversion)

**Goal:** Force a response from leads who've gone silent by threatening to close their file.

**Why it works:** Loss aversion. People are more motivated by losing something than gaining something. "I'm closing your file" triggers an urgency response even from cold leads.

**Implementation:**
```
Trigger: Tag Added "breakup-sequence"
(Applied after all other follow-up fails)

1. Send SMS:
   "Hey {{first_name}}, I've been trying to reach you about 
   setting up AI receptionists for your business. I don't want 
   to keep bugging you - should I close your file? 
   Reply 'yes' to keep the conversation open or I'll assume 
   you're all set."

2. Wait: 24 hours
3. If/Else: Contact Replied?
   YES -> Remove tag "breakup-sequence", 
          Update Opp to "Engaged", trigger booking sequence
   NO  -> Continue

4. Send SMS:
   "Last message from me, {{first_name}}. Closing your file 
   today. If you change your mind down the road, you know 
   where to find us. All the best! 🤙"

5. Wait: 24 hours
6. If/Else: Contact Replied?
   YES -> Remove tag, Update Opp to "Engaged"
   NO  -> Update Opportunity Status to "Lost"
         Update Opportunity Stage to "Dead Lead"
         Add Tag: "breakup-closed"
         Remove from all workflows
```

**Key rules:**
- Only use AFTER at least 3 other contact attempts have failed
- Never aggressive or rude. Professional and respectful.
- "Close your file" language works better than "unsubscribe"
- Give them a simple action: "reply yes to keep going"
- 20-30% of breakup recipients respond (proven across industries)
- Move non-responders to long-term nurture (monthly email), not permanent dead

## Hack 7: SMS Booking Bot (Conversational Booking)

**Goal:** Convert SMS conversations into booked calls without human intervention.

**Why it works:** Some leads won't click a calendar link. They'll reply to texts though. An If/Else workflow chain can handle common replies and push toward booking.

**Implementation:**
```
Trigger: Contact Replied + Opportunity in "Engaged"

Branch 1 - Positive reply detection:
1. If/Else: Message contains positive keywords?
   ("yes", "sure", "interested", "tell me more", "sounds good")
   YES -> Send SMS: "Here's my calendar: [link]. Pick any time 
   that works for you - takes 30 seconds."
   NO  -> Branch 2

Branch 2 - Question detection:
2. If/Else: Message contains question keywords?
   ("how much", "price", "cost", "what do you", "how does")
   YES -> Send SMS: "Great question! Our AI receptionists 
   start at $1,997 one-time (founding member deal). Best 
   explained on a quick call though - here's my calendar: [link]"
   NO  -> Branch 3

Branch 3 - Negative/objection detection:
3. If/Else: Message contains negative keywords?
   ("no thanks", "not interested", "stop", "remove")
   YES -> Send SMS: "No problem at all, {{first_name}}. 
   I'll close your file. All the best!"
   Update Opportunity: Status -> Lost
   NO  -> Branch 4

Branch 4 - Default (unclear reply):
4. Send SMS: "Thanks for getting back to me! Want to hop 
   on a quick 15-min call? Here's my calendar: [link]"
```

**Key rules:**
- This is a SUPPLEMENT to Voice AI, not a replacement
- Works best for text-heavy demographics (under 40)
- Always push toward calendar booking as the end goal
- If conversation goes 3+ back-and-forth texts, trigger Voice AI call instead
- GHL Conversation AI (beta) can handle more complex conversations natively

## Hack 8: Time-of-Day Optimization

**Goal:** Send messages and make calls when leads are most likely to respond.

**Why it works:** Same message sent at 10 AM Tuesday vs 8 PM Friday has wildly different response rates.

**Implementation:**
- **SMS sweet spots:** Tue-Thu, 10 AM - 12 PM and 2 PM - 5 PM local
- **Call sweet spots:** Tue-Thu, 10 AM - 12 PM local (highest connect rate)
- **Email:** Tue-Wed, 8 AM - 10 AM local (pre-inbox-flood)
- **Avoid:** Monday mornings (overwhelmed), Friday afternoons (checked out), weekends (annoyed)

Use GHL's "Wait until time of day" condition in workflows:
```
Trigger: [any]
1. Wait: Until next Tuesday-Thursday, 10:00 AM contact timezone
2. Send SMS / Make Call
```

**For trade/contractor leads specifically:**
- Early morning (6-7 AM) SMS works surprisingly well (they check phones before jobs)
- Lunch break (12-1 PM) has high pickup rates
- Avoid 8-11 AM (they're on job sites, won't answer)
- Best day: Wednesday (mid-week, not yet thinking about weekend)

## Conversion Benchmarks

Track these to know if your system is working:

| Metric | Good | Great | Elite |
|--------|------|-------|-------|
| Speed to first contact | <5 min | <2 min | <30 sec |
| SMS reply rate | 15% | 25% | 35%+ |
| Call connect rate | 20% | 35% | 50%+ |
| Lead to booking rate | 10% | 20% | 30%+ |
| No-show recovery rate | 20% | 35% | 50%+ |
| Breakup response rate | 15% | 25% | 35%+ |
| Overall pipeline close rate | 5% | 10% | 15%+ |
