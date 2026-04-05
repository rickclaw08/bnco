# VAPI Voicemail Drop: William Holthause
## Target: (513) 365-0778 | Drop Time: 11:45 AM ET, March 25, 2026

### VAPI Agent Config Override for Voicemail Drop
- Agent ID: 094c420d-e27f-484e-895a-399d2dfb5592
- firstMessageMode: assistant-speaks-first
- voicemailDetection: ENABLED (critical - must detect voicemail)
- Voice: burt (11labs)
- maxDurationSeconds: 45 (voicemail, keep it tight)

### First Message (Voicemail Script - Casual Neighbor)

"Hey William, this is Brand. I'm a local guy here in Cincinnati, and I was doing some research on properties over in the West Price Hill area. Your name came up on a place on Saint Martins. I know situations like these can be a lot to deal with, so I'm not trying to add to anything on your plate. I just wanted to reach out and see if I could help. I buy houses for cash, and I can move fast if that's something you'd want to explore. No pressure at all. Give me a call back at 513-854-4812. That's Brand, 513-854-4812. Hope you're having a good one."

### Rules
- DO NOT mention foreclosure, sheriff's sale, auction, or court
- DO NOT reference case numbers
- If a HUMAN answers (not voicemail): "Hey, is this William? ... Hey William, this is Brand. I'm a local investor here in Cincinnati. I was looking at some properties in your area and your name came up. Do you have a minute to chat?" Then follow straight-line script.
- If human answers and says wrong number or not interested: "No worries at all. Sorry to bother you. Have a great day." Then hang up.

### Execution Command (VAPI API)
```
POST https://api.vapi.ai/call/phone
{
  "assistantId": "094c420d-e27f-484e-895a-399d2dfb5592",
  "customer": {
    "number": "+15133650778",
    "name": "William Holthause"
  },
  "assistantOverrides": {
    "firstMessage": "Hey William, this is Brand. I'm a local guy here in Cincinnati, and I was doing some research on properties over in the West Price Hill area. Your name came up on a place on Saint Martins. I know situations like these can be a lot to deal with, so I'm not trying to add to anything on your plate. I just wanted to reach out and see if I could help. I buy houses for cash, and I can move fast if that's something you'd want to explore. No pressure at all. Give me a call back at 513-854-4812. That's Brand, 513-854-4812. Hope you're having a good one.",
    "model": {
      "messages": [
        {
          "role": "system",
          "content": "You are Brand, a local real estate investor in Cincinnati. You are calling William Holthause about his property at 4309 St Martins Pl. DO NOT mention foreclosure, sheriff's sale, auction, or court. Keep it casual and friendly. You buy houses for cash and can close fast. If he's interested, try to schedule a time to look at the property. If he asks how you got his number, say 'public records research'. Your callback number is 513-854-4812. If this goes to voicemail, leave the first message and hang up."
        }
      ]
    },
    "maxDurationSeconds": 120
  }
}
```

### Post-Call Actions
1. Log call result to memory/2026-03-25.md
2. If voicemail: Wait 48 hours, then text follow-up
3. If human answered + interested: Update GHL contact, schedule Brand callback
4. If human answered + not interested: Mark lead as COLD, move on

### APPROVAL REQUIRED
Brand must approve VAPI call before execution. Budget impact: ~$0.08-0.15 per call attempt.
