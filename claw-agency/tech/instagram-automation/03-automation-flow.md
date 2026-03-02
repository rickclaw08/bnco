# Instagram DM Automation Flow - Visual Map

## Full Conversation Flow for "DEMO" Keyword

```
USER DMs "DEMO" to @theclawops
         |
         v
+----------------------------------+
| INSTANT REPLY (0 seconds)        |
| "Hey! Thanks for reaching out... |
| Call our demo: (888) 457-8980    |
| Let me know how it went!"        |
+----------------------------------+
    |                    |
    v                    v
[I just called!]    [I'll call later]
    |                    |
    v                    |
+-------------------+    |        +------------------------+
| "Awesome! What    |    +------->| "No worries! Demo is   |
|  did you think?"  |             | live 24/7. DM me       |
+-------------------+             | 'called' when ready."  |
  |        |        |             +------------------------+
  v        v        v                       |
[Impressive] [Questions] [Not for me]       |
  |          |          |                   |
  v          v          v                   |
+--------+ +--------+ +--------+            |
| SEND   | | ANSWER | | "No    |            |
| BOOKING| | FAQ +  | | worries|            |
| LINK   | | BOOKING| | Thanks!|            |
|        | | LINK   | | "      |            |
+--------+ +--------+ +--------+            |
                                            |
                                            |
         NO RESPONSE FROM USER              |
         (either path)                      |
                |                           |
                v                           v
         +---------------------------+
         | WAIT 24 HOURS             |
         | (Smart Delay)             |
         | Condition: User has NOT   |
         | replied since last msg    |
         +---------------------------+
                |
                v
         +---------------------------+
         | NUDGE #1                  |
         | "Did you get a chance to  |
         |  try the demo?"           |
         | (888) 457-8980            |
         +---------------------------+
           |                |
           v                v
     [Just called!]  [Remind me tomorrow]
           |                |
           v                v
     (Re-enters         WAIT 24 HOURS
      main flow)            |
                            v
                   +---------------------------+
                   | NUDGE #2 (FINAL)          |
                   | "Friendly last nudge..."  |
                   | (888) 457-8980            |
                   +---------------------------+
                            |
                            v
                   END OF SEQUENCE
                   (No more auto-messages)
```

---

## Keyword Trigger Map

| Keyword | Trigger Type | Action |
|---------|-------------|--------|
| DEMO | DM keyword (contains) | Full demo funnel flow |
| DEMO | Comment keyword (contains) | Auto-DM with demo funnel |
| called | DM keyword (contains) | Re-enter flow at "What did you think?" |
| pricing | DM keyword (contains) | Future: pricing info flow |
| book | DM keyword (contains) | Future: direct booking link |
| help | DM keyword (contains) | Future: FAQ/support flow |

---

## Message Copy (Final Versions)

### MSG-1: Initial Reply
```
Hey! Thanks for reaching out to ClawOps.

Want to see our AI receptionist in action? Call our live demo line right now:

(888) 457-8980

It picks up 24/7. Try asking it about pricing, booking an appointment, or anything you'd throw at a real receptionist.

After you call, let me know how it went! I'd love to hear your thoughts.
```

### MSG-2A: Post-Call Follow-Up
```
Awesome! What did you think?

Was the AI receptionist what you expected? Any questions about how it would work for your business?
```

### MSG-2B: Call Later Acknowledgment
```
No worries! The demo line is live 24/7:

(888) 457-8980

Just DM me "called" when you've tried it and I'll follow up.
```

### MSG-3A: Positive Response -> Booking
```
Glad you liked it! Here's how we can get you set up.

Book a quick call with our team and we'll walk you through exactly how ClawOps plugs into your business:

https://theclawops.com/book/

No pressure, no hard sell. Just a straight conversation about whether it's a fit.
```

### MSG-3B: Has Questions
```
Of course! What would you like to know?

Some common ones:
- How does it integrate with my phone system?
- What does pricing look like?
- How long does setup take?

Or you can book a call and we'll walk through everything live:

https://theclawops.com/book/
```

### MSG-3C: Not Interested (Graceful Exit)
```
No worries at all! Thanks for checking it out. If you ever want to revisit, the demo line is always live at (888) 457-8980.

Have a good one!
```

### MSG-4: 24-Hour Nudge
```
Hey! Just checking in. Did you get a chance to try our AI receptionist demo?

(888) 457-8980

Give it a ring when you get a minute. It only takes 30 seconds and you'll see exactly why businesses are switching to AI receptionists.
```

### MSG-5: Final Nudge (48 hours)
```
Hey! Friendly last nudge. Our demo line is still live:

(888) 457-8980

Try it out and let me know what you think. If it's not your thing, no worries at all.
```

---

## Metrics to Track

| Metric | What It Tells Us | Target |
|--------|-----------------|--------|
| DEMO triggers/day | Funnel top - how many people enter | 10+/day |
| Reply rate after initial DM | Engagement quality | 40%+ |
| "I just called" clicks | Demo line usage | 30%+ of triggers |
| Booking link clicks | Bottom of funnel interest | 15%+ of callers |
| Bookings from IG DM | Revenue attribution | Track in CRM |
| Nudge reply rate | Effectiveness of follow-ups | 10-20% |
| Comment-to-DM conversion | Content funnel effectiveness | Track per post |

---

## Instagram Content Strategy to Drive "DEMO" DMs

### Reel CTAs (End every reel with one of these)
- "Comment DEMO to try our AI receptionist live"
- "Want to hear it yourself? Comment DEMO below"
- "DM me DEMO and I'll send you the number"

### Story CTAs
- Poll: "Would you trust AI to answer your business calls?" -> Follow up with "DM DEMO to try it"
- "We built an AI that answers phones better than humans. DM DEMO to test it yourself."

### Post Pinned Comments
- "Comment DEMO and I'll DM you the live demo number"

### Bio
- Include CTA: "DM 'DEMO' for a free AI receptionist demo"
