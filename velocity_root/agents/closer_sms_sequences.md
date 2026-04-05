# The Closer - SMS Outreach Sequences
# Pre-Foreclosure Distressed Homeowner Outreach

## Tone: Empathetic but Urgent
These people are about to lose their homes. We're offering a lifeline, not running a scam.
Be human. Be direct. Be helpful.

## SMS Sequence (3-Touch)

### Touch 1: Initial Outreach (Day 0)
```
Hi {{owner_name}}, I noticed a public notice on {{address}}. I buy properties with cash and can close fast - often in under a week. If you're open to a quick conversation, I'd love to see if I can help before {{auction_date}}. No pressure at all. - Brand, MGO Data LLC
```

### Touch 2: Follow-Up (Day 2, if no response)
```
Hey {{owner_name}}, just following up on my message about {{address}}. I understand this might be a stressful time. My goal is simple: make you a fair cash offer, cover your mortgage payoff, and close before the auction date. Would a quick 5-minute call work? - Brand
```

### Touch 3: Final Touch (Day 5, if no response)
```
{{owner_name}}, last message from me. I know the {{auction_date}} date is coming up and I wanted to make sure you had options on the table. If you change your mind, my number is (513) 850-6496. I'm local (Cincinnati/Mason area) and can move fast. Wishing you the best either way. - Brand
```

## Response Handling

### If they reply "How much?" or show interest:
```
Great question. Based on what I'm seeing, I can make an offer around ${{mao_offer}} cash, closing in {{closing_timeline}}. That would cover your payoff and you'd walk away clean - no auction, no credit hit. Want me to put the numbers in writing so you can look them over?
```

### If they reply "Stop" or "No":
- Immediately cease all contact
- Move lead status to "OPT_OUT" in database
- Do NOT contact again under any circumstances

### If they ask a complex question:
- Flag for human escalation
- Ping Brand at +1 (513) 850-6496 via GHL app notification
- Template: "VELOCITY LEAD: {{owner_name}} at {{address}} is asking: [their question]. Respond within 1 hour."

### If they say "I have an attorney" or "I'm working with someone":
```
Totally understand, {{owner_name}}. Just wanted to make sure you knew there was a cash option on the table. If anything changes, you have my number. Good luck with everything.
```
Move to "HAS_REPRESENTATION" status. Do not follow up.

## Compliance Notes
- All messages must identify sender (Brand, MGO Data LLC)
- Must honor "Stop" requests immediately (TCPA compliance)
- Pre-foreclosure outreach is legal in Ohio but must not be deceptive
- Never misrepresent the situation or create false urgency beyond the actual auction date
- Ohio R.C. 1349.62: Equity purchasers must provide homeowner with written notice of rights
- Keep records of all communications for minimum 2 years

## Escalation Triggers (ping Brand immediately)
1. Homeowner says yes or asks for contract
2. Homeowner mentions an amount they need
3. Homeowner asks about their rights
4. Any mention of an attorney or legal action against us
5. Homeowner appears confused or vulnerable (extra care needed)
