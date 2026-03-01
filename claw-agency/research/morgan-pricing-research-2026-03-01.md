# Morgan's Pricing Research - March 1, 2026
## ClawOps CFO Intelligence Report
### Target: $0 → $100K by March 31, 2026

---

*Research in progress - findings added incrementally as discovered*

---

## 1. ACTUAL PRICING: What AI Receptionist / Voice AI Companies Charge

### From r/Entrepreneur - "AI Receptionist for Doctors" Thread
- **Setup fee:** $500-$1,000 (covers website scraping, customization, initial testing)
- **Monthly - Overflow only** (after-hours/busy lines): $200-$300/mo
- **Monthly - 24/7 coverage:** $500-$800/mo
- **Context:** Doctor's offices pay receptionists $15-$20/hr, so AI at $500-$800/mo replaces a full-time person at a fraction of cost
- **Warning from thread:** "Pricing too high early on can scare off smaller practices" - competitor Rosie AI is positioned as cheaper/simpler
- **Tiered approach recommended:** Build usage-based table (free trial up to 100 calls, then tiers up to unlimited)

### From r/gohighlevel - "You're Pitching AI Wrong" ($6K/mo profit)
- Poster makes **$6K/month profit** selling AI automations
- Key insight: "Clients don't care about GPT or Claude. They care about money in, money not wasted, time saved, and less risk"
- Charges **$1K/month retainers** to start
- Sales channels: Cold emails, LinkedIn, Upwork
- Close rate jumped dramatically when stopped talking tech and started selling outcomes
- "I used to explain parameters for 15 minutes... bad times"

### From r/gohighlevel - "91 Sub-accounts" Thread (18 months, ~100 clients)
- 91 sub-accounts in 18 months
- Critical lesson: "Your first 10 clients should all be the same type of business"
- Wasted 8 months trying to serve everyone (chiropractors, gyms, real estate, consultants)
- Each business type needed completely different setup

### From r/gohighlevel - Voice AI Agent Businesses
- Custom AI voice system doing **100+ calls/day with 3% booking rate** for reactivation campaigns
- GHL's native voice agent described as "slow" and limited by multiple users
- Legal client using voice AI: **signed $3,500 retainers in 90 days** with just 4 support staff
- Tools used: Vapi, Retell AI, OmniHive - NOT GHL native voice
- Cost/execution bottleneck: n8n breaks above 5 businesses

## 1a. UNDERLYING PLATFORM COSTS (What It Actually Costs Us Per Minute)

### Retell AI (Current Market Leader for Agencies)
- **Infra fee:** $0.055/min
- **Voice:** $0.015/min (Retell/OpenAI voices) to $0.04/min (ElevenLabs)
- **LLM:** $0.003/min (GPT-5 nano) to $0.08/min (Claude 4.5 sonnet)
- **Telephony:** $0.015/min (Retell Twilio), $0 for SIP trunking
- **TOTAL cheapest config:** ~$0.088/min (GPT-5 nano + Retell voice + Twilio)
- **TOTAL mid-tier config:** ~$0.13/min (GPT-4.1 mini + Retell voice + Twilio)
- **TOTAL premium config:** ~$0.19/min (GPT-5.1 + ElevenLabs + Twilio)
- 20 free concurrent calls, $10 free credits

### Synthflow AI (White-Label Focused)
- **Pay-as-you-go:** $0.15-$0.24/min (all-in depending on LLM + telephony)
- **Voice engine:** $0.09/min
- **LLM:** $0.05/min (GPT-4.1)
- **Twilio telephony:** $0.02/min (Synthflow-managed) or $0 (bring your own)
- **White-label add-on:** $2,000/month
- **Concurrency:** 5 free, then $20/unit/month
- **Enterprise:** Custom pricing, unlimited concurrency, 99.99% SLA

### MARGIN ANALYSIS
- **Our cost per minute (optimized):** ~$0.09-$0.15/min
- **If charging $500/mo for ~500 min of calls:** effective rate = $1.00/min. **Margin: 85-91%**
- **If charging $300/mo for ~300 min:** effective rate = $1.00/min. **Margin: 85-91%**
- **Average call duration:** 2-3 minutes for appointment booking
- **500 minutes = ~170-250 calls/month per client**

## 1b. COMPETITOR PRICING (What Established Companies Charge End Users)

### Goodcall.com (AI Phone Agent - Flat Rate)
- **Starter:** $79/mo per agent - 100 unique customers, unlimited minutes
- **Growth:** $129/mo per agent - 250 unique customers, unlimited minutes
- **Scale:** $249/mo per agent - 500 unique customers, unlimited minutes
- **Overage:** $0.50 per customer after limit
- **Model:** Per-unique-customer, NOT per-minute or per-call
- **Key insight:** "Raw call volume or minutes spent are limited indicators of value... can create misaligned incentives"
- **Annual pricing:** ~17% discount (Starter $66/mo, Growth $108/mo, Scale $208/mo)
- **No setup fees, no per-minute charges, no token charges**

### Smith.ai (Human + AI Hybrid - Premium)
- **Starter:** $300/mo - 30 calls ($10/call effective)
- **Basic:** $810/mo - 90 calls ($9/call effective)
- **Pro:** $2,100/mo - 300 calls ($7/call effective)
- **Overage:** $8.50-$11.50 per call depending on plan
- **Add-ons:** Appointment booking $1.50/call, recording $0.25/call, SMS notifications $0.50/call
- **30-day money-back guarantee, month-to-month, no contracts**
- **They're human-staffed 24/7 with AI assist - the premium option**

### Synthflow (Direct to Business)
- $0.15-$0.24/min all-in

### Rosie AI (Budget Option)
- Positioned as the cheap/simple option vs custom builds
- Referenced in Reddit as alternative for small practices

### PRICING POSITIONING MAP:
| Tier | Monthly | Target |
|------|---------|--------|
| Budget AI (Rosie, Goodcall) | $79-$249/mo | Solo/small businesses wanting plug-and-play |
| Mid-Market AI (Our target) | $300-$800/mo | Service businesses wanting customization + results |
| Premium Human+AI (Smith.ai) | $810-$2,100/mo | Established businesses, law firms, medical |
| Custom Enterprise | $1,000-$5,000+/mo | Multi-location, high-volume |

