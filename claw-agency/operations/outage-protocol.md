# Outage Protocol: Voice Channel Down

**Last updated:** 2026-03-20
**Status:** Vonage is the ONLY active outbound voice channel

---

## If Vonage Goes Down

### Immediate (0-1 hour)
1. Confirm it's Vonage, not VAPI: check VAPI dashboard for error logs
2. Log the outage time in Daily Ops Log
3. Switch to **email-only outreach** immediately (do not wait for Vonage to come back)

### Fallback Channels (in order)
1. **Email blast** via Gmail (rickclaw08@gmail.com) - 500/day limit
2. **GHL A2P SMS** via (513) 854-4812 - text outreach to leads with mobile numbers
3. **Demo line still works** - (513) 995-3285 is VAPI inbound, independent of Vonage outbound

### What Does NOT Work
- Twilio Account 1 (702-728-4638): RESTRICTED, Trust Hub rejected
- Twilio Account 2 (877-331-7786): TF verification pending, not cleared for voice
- GHL toll-free (888-457-8980): Gone from phone system

### Recovery
- Check Vonage status page
- Contact VAPI support if Vonage-side
- If extended outage (>24h): accelerate Twilio Account 2 TF verification

---

## Preventive Monitoring
- Harper checks Vonage account standing daily (log in Daily Ops Log)
- Morgan tracks VAPI balance daily (flag at $20)
- Quinn follows up on Twilio Account 2 TF verification daily until approved
