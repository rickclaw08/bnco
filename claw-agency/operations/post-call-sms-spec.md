# Post-Call SMS Automation Spec

**Status:** NOT BUILT YET - needs GHL browser setup
**Owner:** Harper (COO)
**Prerequisite:** VAPI end-of-call webhook configured to hit GHL

---

## Workflow 1: Interested Prospect SMS

**Trigger:** VAPI end-of-call webhook fires
**Condition:** Call outcome tag = "Interested" OR call duration > 90 seconds
**Delay:** 0 seconds (immediate)
**Action:** Send SMS from (513) 778-8336

**Message:**
```
Hey {{contact.first_name}}, Jordan from Claw Ops. Wanted to send you that number I mentioned.

Call (513) 995-3285 pretending you're a customer. See for yourself.

One spot left in {{contact.city}} this week. - Jordan
```

---

## Workflow 2: Voicemail Follow-up SMS

**Trigger:** VAPI end-of-call webhook, endedReason = "voicemail"
**Delay:** 5 minutes
**Action:** Send SMS from (513) 778-8336

**Message:**
```
Hey {{contact.first_name}}, left you a voicemail - Jordan from Claw Ops.
Had a quick question about your call setup. Worth 2 minutes: https://link.gohighlevel.com/widget/bookings/clawops-demo-call
```

---

## Setup Steps (GHL Browser)
1. Create Workflow 1 in GHL Automation
2. Create Workflow 2 in GHL Automation
3. Configure VAPI webhook to fire to GHL on call end
4. Map VAPI call data to GHL contact fields (duration, outcome, endedReason)
5. Test with a manual call to verify SMS fires

## VAPI Webhook Config Needed
- Endpoint: GHL webhook URL (get from workflow trigger)
- Events: call.completed
- Payload includes: assistantId, duration, endedReason, transcript, customer.number

## Notes
- SMS from (513) 778-8336 = callback number, consistent with voicemail
- Calendar link for voicemail workflow: https://link.gohighlevel.com/widget/bookings/clawops-demo-call
- Demo line for interested workflow: (513) 995-3285
- Jordan stays as the persona name in SMS (matches VAPI caller)
