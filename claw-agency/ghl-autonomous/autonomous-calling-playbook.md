# Autonomous Lead Calling Playbook

> Complete operational playbook for the ClawOps autonomous calling system.
> From lead import to closed deal - every step, every rule, every scenario.

---

## Overview

This playbook governs how the Voice AI system autonomously contacts, qualifies, and converts leads from the Google Sheets lead list (42 leads, 40 with verified phones) into Founding Member customers at $1,997 each.

**Revenue Potential:**
- 40 callable leads
- Target connection rate: 25% = 10 conversations
- Target demo booking rate: 30% of connections = 3 demos
- Target close rate: 40% of demos = 1-2 founding members
- Revenue: $1,997 - $3,994 from first wave
- **With optimized follow-up and multi-touch:** 4-6 founding members realistic = $7,988 - $11,982

---

## Step 1: Lead Preparation

### 1.1 Lead Import Checklist

- [ ] Export Google Sheets to CSV
- [ ] Verify all 40 phone numbers are formatted correctly (E.164: +1XXXXXXXXXX)
- [ ] Confirm niche classification for each lead (HVAC/plumbing/electrical/roofing/general)
- [ ] Identify timezone for each lead (based on area code or address)
- [ ] Import to GHL Contacts with proper field mapping
- [ ] Apply niche tags to all contacts
- [ ] Apply `campaign:founding-member-wave1` tag to all
- [ ] Add all contacts to "Voice AI Leads" pipeline at "New Lead" stage
- [ ] Verify no duplicate contacts

### 1.2 Lead Prioritization

**Call order (highest priority first):**

1. **Hot leads** - Anyone who's previously interacted with ClawOps (website visit, email open, prior contact)
2. **Seasonal urgency niche** - Whichever niche is entering peak season NOW:
   - March: Roofing (storm season starting), HVAC (spring tune-up season)
   - Summer: HVAC (peak AC), Roofing (replacement season)
   - Fall: HVAC (furnace season), General (pre-holiday renovations)
   - Winter: Plumbing (frozen pipes), Electrical (storm/generator demand)
3. **Larger companies first** - More employees = more missed calls = bigger pain point
4. **Local/regional** - Closer proximity to ClawOps base = easier follow-up

### 1.3 Lead Distribution by Niche

Based on typical contractor lead lists, expect roughly:
- HVAC: ~8-10 leads
- Plumbing: ~8-10 leads
- Electrical: ~6-8 leads
- Roofing: ~6-8 leads
- General: ~8-10 leads

---

## Step 2: Call Scheduling

### 2.1 Optimal Call Windows

| Day | Window 1 (Best) | Window 2 (Good) | Avoid |
|-----|-----------------|------------------|-------|
| Monday | 10:00-11:30 AM | 2:00-4:00 PM | Before 10 AM (catching up from weekend) |
| Tuesday | 10:00-12:00 PM | 2:00-4:30 PM | - |
| Wednesday | 10:00-12:00 PM | 2:00-4:30 PM | - |
| Thursday | 10:00-12:00 PM | 2:00-4:30 PM | After 4:30 (winding down) |
| Friday | 10:00-11:30 AM | - | After 12 PM (mental checkout) |
| Sat-Sun | DO NOT CALL | - | Entire day |

**All times in the lead's local timezone.**

### 2.2 Daily Call Volume

- **Day 1 (Today):** 10-12 calls (prioritized leads)
- **Day 2:** 8-10 calls (remaining fresh leads + first follow-ups)
- **Day 3:** 6-8 calls (follow-ups + remaining)
- **Day 4-6:** Follow-up calls only (attempts 2 and 3)
- **Day 7+:** SMS/email drip for non-contacts

**Max calls per hour:** 6 (allows time between calls for processing)
**Max calls per day:** 15 (prevents number flagging)

### 2.3 Time Zone Management

| Lead's Timezone | Call Window (Their Time) | Your Time (EST) |
|----------------|--------------------------|------------------|
| Eastern (ET) | 10 AM - 12 PM ET | 10 AM - 12 PM |
| Central (CT) | 10 AM - 12 PM CT | 11 AM - 1 PM ET |
| Mountain (MT) | 10 AM - 12 PM MT | 12 PM - 2 PM ET |
| Pacific (PT) | 10 AM - 12 PM PT | 1 PM - 3 PM ET |

**Call order each day:** Start with Eastern leads at 10 AM ET, move west through the day.

---

## Step 3: The Call Execution

### 3.1 Pre-Call Automation

Before each outbound call, the GHL workflow:
1. Checks lead's timezone - is it within calling window?
2. Checks call attempt count - is this attempt 1, 2, or 3?
3. Selects the correct niche outbound script
4. Sets the Voice AI agent to outbound mode
5. Initiates the call

### 3.2 Call Outcomes & Handling

#### Outcome A: Connected - Interested
**What happens:**
- Lead answers, engages in conversation, shows interest in ClawOps
- AI delivers the "aha reveal" moment
- AI attempts to book a demo call

**Post-call actions:**
1. Apply tag: `voice-ai:engaged`
2. Move pipeline to: "Connected - Interested"
3. If demo booked: Move to "Demo Booked"
4. If no demo booked: Trigger "Demo Booking Follow-up" workflow
5. Update custom field: Last Call Outcome = "Connected - Interested"
6. Increment call attempt count

#### Outcome B: Connected - Not Interested
**What happens:**
- Lead answers, hears the pitch, declines

**Post-call actions:**
1. Apply tag: `voice-ai:declined`
2. Move pipeline to: "Lost - Not Interested"
3. Update custom field: Last Call Outcome = "Connected - Not Interested"
4. **Do not call again.** Respect the no.
5. Add to long-term nurture email list (monthly newsletter, not calls)

#### Outcome C: Connected - Callback Requested
**What happens:**
- Lead answers but says "Not a good time, call me back at [time]"

**Post-call actions:**
1. Set custom field: Preferred Callback Time = [their requested time]
2. Keep in "Call Attempted" stage
3. Schedule callback at requested time
4. Note: Callback counts as a new attempt but gets priority scheduling

#### Outcome D: Voicemail Reached
**What happens:**
- Call goes to voicemail

**Post-call actions (attempt 1):**
1. Do NOT leave voicemail on first attempt (callback from unknown number is more intriguing)
2. Update: Call Attempt Count +1
3. Schedule attempt 2 for 2 business days later

**Post-call actions (attempt 2+):**
1. Leave niche-specific voicemail (from outbound-call-scripts.md)
2. Move to "Voicemail Left"
3. Update: Call Attempt Count +1
4. Schedule next attempt (if under 3 total)

#### Outcome E: No Answer, No Voicemail
**What happens:**
- Phone rings, no answer, no voicemail box

**Post-call actions:**
1. Update: Call Attempt Count +1
2. Schedule next attempt for 2 business days later
3. After 3 attempts: Move to "Lost - No Contact", trigger SMS drip

#### Outcome F: Wrong Number / Disconnected
**What happens:**
- Number is invalid, disconnected, or wrong person

**Post-call actions:**
1. Apply tag: `bad-number`
2. Move to "Lost - Bad Fit"
3. Do not reattempt calling
4. Try email outreach if email is available

---

## Step 4: Follow-Up Sequences

### 4.1 After Successful Connection (Interested, No Demo Booked)

**Timing: T+0 = end of call**

| Time | Channel | Message |
|------|---------|---------|
| T+1 hour | SMS | Booking link + "Great talking with you" |
| T+24 hours | Email | Recap + booking link + "what contractors in your niche are doing" |
| T+48 hours | SMS | "Quick follow-up" + booking link |
| T+72 hours | Voice AI Call | Follow-up call, lighter script |
| T+7 days | Email | Case study / social proof for their niche |
| T+14 days | SMS | "Last check-in" + direct offer |

### 4.2 After Demo Booked (Pre-Demo)

| Time | Channel | Message |
|------|---------|---------|
| Immediately | SMS | Confirmation with date/time |
| T-24 hours | SMS | Reminder |
| T-1 hour | SMS | "Starting soon" + meeting link |

### 4.3 After Demo Completed (Post-Demo)

| Time | Channel | Message |
|------|---------|---------|
| T+2 hours | SMS + Email | Stripe link + founding member offer |
| T+48 hours | SMS | "Any questions?" check-in |
| T+5 days | Voice AI Call | Closing call |
| T+7 days | Email | "Spots filling up" urgency |
| T+14 days | Final SMS | Last chance message, then archive |

### 4.4 After No Contact (3 Failed Attempts)

| Time | Channel | Message |
|------|---------|---------|
| Immediately | SMS | "Tried to reach you" + booking link |
| T+7 days | Email | Value proposition + booking link |
| T+21 days | SMS | Final touch, seasonal angle |
| Then | Monthly email | Newsletter / nurture only |

---

## Step 5: Handoff Protocol

### 5.1 When AI Hands Off to Human

The AI should hand off to Brand or Ember when:

1. **Lead wants to buy NOW** - "I want to sign up" during the call
   - AI: "Fantastic. Let me connect you with our team right now." > Transfer to Brand's cell or Ember's line
   
2. **Lead has deep technical questions** the AI can't answer
   - AI: "Great question - let me have our tech specialist call you right back. What's the best number?"
   - Create task for Brand/Ember with the specific question

3. **Lead is a HIGH-VALUE target** (multi-location, franchise, large company)
   - AI detects signals: mentions multiple locations, many employees, corporate decision-making
   - AI: "Sounds like you've got a bigger operation. Let me have our enterprise team give you a call - they handle multi-location setups."

4. **Lead gets emotional/frustrated**
   - AI can't fully handle emotional complexity
   - AI: "I understand your frustration. Let me have someone from our team reach out personally."

### 5.2 Handoff Execution

When handing off:
1. AI creates an **urgent task** in GHL assigned to Brand
2. Task includes: Contact name, company, niche, what was discussed, why they're being handed off
3. SMS notification sent to Brand: "Hot lead handoff: [Name] from [Company] wants to [buy/talk tech/etc]. Call ASAP."
4. Lead receives: "Someone from our team will be reaching out within the hour."
5. Timer starts: If no human contact within 2 hours, AI sends follow-up to lead: "Our team is working on getting back to you. In the meantime, here's our booking link: [link]"

---

## Step 6: Lead Status Tracking

### 6.1 CRM Dashboard View

At any point, the GHL pipeline should show:

```
NEW LEAD (X) → CALL ATTEMPTED (X) → VOICEMAIL LEFT (X) → CONNECTED-INTERESTED (X) → DEMO BOOKED (X) → DEMO COMPLETED (X) → PROPOSAL SENT (X) → WON (X)
                                                                                                                                                          ↘ LOST: NOT INTERESTED (X)
                                                                                                                                                          ↘ LOST: NO CONTACT (X)
                                                                                                                                                          ↘ LOST: BAD FIT (X)
```

### 6.2 Daily Status Report (Automated)

Every day at 6 PM EST, GHL sends Brand a summary:

```
📊 ClawOps Daily Calling Report - [Date]

CALLS TODAY:
- Outbound attempts: XX
- Connected: XX (XX%)
- Voicemails left: XX
- No answer: XX

PIPELINE STATUS:
- New leads remaining: XX
- Call attempted: XX
- Connected - Interested: XX
- Demo booked: XX
- Won: XX ($X,XXX)

NICHE BREAKDOWN:
- HVAC: XX calls, XX connected, XX interested
- Plumbing: XX calls, XX connected, XX interested
- Electrical: XX calls, XX connected, XX interested
- Roofing: XX calls, XX connected, XX interested
- General: XX calls, XX connected, XX interested

ACTION ITEMS:
- [Any hot leads needing human follow-up]
- [Any handoff requests pending]
```

---

## Step 7: Optimization Loop

### 7.1 Weekly Review (Every Friday)

Review these metrics and adjust:

| Metric | Below Target? | Action |
|--------|--------------|--------|
| Connection rate < 20% | Yes | Change calling windows, try different days |
| Reveal-to-interest rate < 50% | Yes | Refine the "aha moment" delivery in scripts |
| Demo booking rate < 25% | Yes | Improve CTA, offer more flexible times |
| Demo show rate < 60% | Yes | Add more reminders, call 30 min before |
| Close rate < 30% | Yes | Refine demo presentation, address objections |

### 7.2 Script A/B Testing

After the first 20 calls, compare:
- Which niche has the highest connection rate?
- Which opening hook gets the most engagement?
- Does the early reveal or late reveal work better?
- Do morning or afternoon calls convert better?

Adjust scripts based on data, not assumptions.

### 7.3 Number Reputation Management

- Monitor call completion rates - if they drop, the number may be getting flagged
- Rotate numbers if answer rates decline below 15%
- Keep call duration long (connected calls average 2-3 min+) to signal legitimacy to carriers
- Register numbers with STIR/SHAKEN if available through GHL

---

## Emergency Protocols

### If a lead threatens legal action:
1. AI immediately apologizes and says "I've removed you from our list"
2. Tag contact as `do-not-contact`
3. Remove from all workflows
4. Notify Brand immediately
5. Document everything

### If the phone number gets flagged as spam:
1. Pause all outbound calling from that number
2. Purchase a new number
3. Register the new number with free caller registry
4. Resume calling at lower daily volume (5-8/day) for first week
5. Gradually increase to normal volume

### If GHL Voice AI goes down:
1. Route all inbound to Brand's cell
2. Pause outbound workflows
3. Check GHL status page
4. Resume when service is restored
5. Re-queue any leads that were in mid-sequence
