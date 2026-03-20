# 3-Touch Outbound Sequence

## Why
Cognism data: 3 attempts per prospect covers 93% of conversions. We're doing 1 attempt and moving on. That's leaving ~63% of potential meetings on the table.

## The Sequence

### Touch 1: Cold Call (Day 1)
- VAPI outbound call using v20 prompt
- Timing: Tue/Wed, 10-11 AM or 4:30-5:30 PM local time
- Early morning (7-8 AM) for direct-to-owner attempts
- If owner reached: pitch and close for meeting
- If voicemail: leave vague callback message (already in v20)
- If gatekeeper blocks: note callback time if given

### Touch 2: Email Follow-Up (Day 2-3)
- Send 24-48 hours after Touch 1
- If voicemail left: "Hey [Name], I called yesterday. Quick question about your missed calls..."
- If gatekeeper blocked: "Hey [Name], tried reaching you at [Company]. Wanted to share something..."
- If owner spoke but didn't close: "Hey [Name], good talking yesterday. Here's the demo number: (513) 995-3285..."
- ALL emails include the demo number
- Template varies based on Touch 1 outcome

### Touch 3: Final Call (Day 5-7)
- Second call attempt, different time of day than Touch 1
- If Touch 1 was morning, Touch 3 is late afternoon (or vice versa)
- If they answered email or called demo: reference it in opener
- If no response to anything: one more attempt then mark as exhausted
- "Hey [Name], I sent you something earlier this week. Did it come through?"

## Dispositions After 3 Touches

| Result | Action |
|--------|--------|
| Meeting booked | Move to pipeline: Demo Scheduled |
| Interested but timing wrong | Schedule follow-up in 30 days |
| Said no twice | Mark DNC, remove from sequence |
| No contact after 3 touches | Mark "Exhausted - 3 touch", revisit in 60 days |
| Wrong number / out of business | Remove permanently |

## Batch Sizing
- 50 leads per batch (Touch 1)
- 3-5 days later: same 50 get Touch 2 (email)
- 5-7 days after Touch 1: same 50 get Touch 3 (call)
- New batch of 50 starts every week
- At any given time: ~150 leads in various stages of the sequence

## Implementation
Touch 1: VAPI batch call (existing)
Touch 2: Gmail send script (built today, adapt for multi-template)
Touch 3: VAPI batch call (same as Touch 1, different time slot)

Tracking: Add columns to enriched CSV - Touch1_Date, Touch1_Result, Touch2_Date, Touch2_Result, Touch3_Date, Touch3_Result, Disposition
