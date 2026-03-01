# ClawOps Pricing Tiers v2

**Effective Date:** 2026-02-28
**Owner:** CFO (Morgan)
**Status:** Finalized from research consensus

---

## Pricing Summary

| Tier | Setup Fee | Monthly Fee | Payment Model |
|------|-----------|-------------|---------------|
| Direct Client | $2,500 | $497/mo | Monthly or Quarterly |
| Agency White-Label | $5,000 | $100/mo per active seat | Monthly or Quarterly |
| Enterprise/Custom | $7,500 - $15,000 | $1,500 - $2,500/mo | Negotiated |
| Pilot Program | $1,250 | $249/mo | 30-day, auto-converts |
| Case Study Deal | Negotiable | At or near cost | Custom terms |

**Quarterly Prepay Incentive:** 10% discount on the monthly rate for clients who commit to quarterly billing (3 months upfront). Applies to all tiers except Case Study.

---

## Tier 1: Direct Client

### Target Customer
Small to mid-size businesses (SMBs) that need AI-powered voice, chat, or automation solutions but lack the internal team to build or manage them. Typical profiles: local service businesses, e-commerce brands, professional services firms, clinics, real estate teams. Revenue range: $500K - $10M. They want a turnkey solution and direct support.

### What's Included
- Full onboarding and setup of one AI agent (voice, chat, or hybrid)
- Custom workflow configuration tailored to the client's use case
- Integration with their existing CRM, scheduling, or communication tools
- Twilio phone number provisioning and configuration
- 30 days of active tuning and optimization post-launch
- Ongoing monitoring, maintenance, and prompt updates
- Monthly performance report
- Email/chat support (response within 4 business hours)
- Up to 2 workflow adjustments per month included

### COGS Estimate
| Cost Component | Monthly Estimate |
|----------------|-----------------|
| Twilio (calls/SMS) | $20 - $40 |
| OpenAI API usage | $40 - $80 |
| Fly.io hosting (incremental) | $15 - $25 |
| Support/maintenance labor | $30 - $50 (amortized) |
| **Total COGS** | **$105 - $195** |

### Gross Margin
- Revenue: $497/mo
- COGS midpoint: ~$150/mo
- **Gross margin: ~$347/mo (roughly 70%)**
- With quarterly discount ($447.30/mo): ~$297/mo (roughly 66%)

### Annual Value Per Client
- Monthly billing: $2,500 setup + ($497 x 12) = **$8,464 first-year value**
- Quarterly billing: $2,500 setup + ($447.30 x 12) = **$7,867.60 first-year value**
- Ongoing annual value (no setup): $5,964 (monthly) / $5,367.60 (quarterly)

---

## Tier 2: Agency White-Label

### Target Customer
Marketing agencies, consultancies, and managed service providers that want to resell AI agent capabilities under their own brand. They have existing client rosters and want to add AI as a service line without building the tech. Typical profiles: digital marketing agencies, BPO firms, IT consultancies, vertical SaaS companies exploring AI add-ons.

### What's Included
- White-label platform access (no ClawOps branding visible to end clients)
- Agency admin dashboard for managing multiple client deployments
- Per-seat pricing: each "seat" is one active end-client deployment
- Onboarding and training for agency team (up to 3 sessions)
- Template library of pre-built agent configurations by vertical
- API access for custom integrations
- Dedicated Slack or Discord channel for agency support
- Priority support (response within 2 business hours)
- Agency partner documentation and sales collateral
- Quarterly business review with ClawOps team

### COGS Estimate (Per Seat)
| Cost Component | Monthly Estimate Per Seat |
|----------------|--------------------------|
| Twilio (calls/SMS) | $15 - $30 |
| OpenAI API usage | $20 - $50 |
| Fly.io hosting (incremental) | $8 - $15 |
| Platform/infrastructure overhead | $5 - $10 |
| **Total COGS per seat** | **$48 - $105** |

### Gross Margin
- Revenue per seat: $100/mo
- COGS midpoint per seat: ~$75/mo
- **Gross margin per seat: ~$25/mo (roughly 25%)**
- Margin improves at scale: infrastructure costs amortize as seat count grows
- At 10+ seats, COGS per seat drops to ~$55-$65, pushing margin to 35-45%
- With quarterly discount ($90/seat/mo): margin thinner at low volume, compensated by commitment and predictability

**Note:** The lower per-seat margin is by design. This tier drives volume and platform stickiness. Agencies with 20+ seats generate $2,000+/mo recurring with strong retention since switching costs are high once their clients are live.

### Annual Value Per Client (Agency)
Assumes average agency runs 10 active seats:
- Monthly billing: $5,000 setup + ($100 x 10 seats x 12) = **$17,000 first-year value**
- Quarterly billing: $5,000 setup + ($90 x 10 seats x 12) = **$15,800 first-year value**
- Ongoing annual value (no setup, 10 seats): $12,000 (monthly) / $10,800 (quarterly)

Assumes average agency runs 5 active seats (conservative):
- Monthly billing: $5,000 setup + ($100 x 5 seats x 12) = **$11,000 first-year value**
- Quarterly billing: $5,000 setup + ($90 x 5 seats x 12) = **$10,400 first-year value**

---

## Tier 3: Enterprise/Custom

### Target Customer
Mid-market to large organizations with complex requirements: multi-department rollouts, custom integrations, compliance needs, dedicated infrastructure, or high-volume deployments. Typical profiles: healthcare systems, financial services firms, large property management companies, franchise networks, companies with 50+ locations. Revenue range: $10M+.

### What's Included
- Dedicated project manager for onboarding (4-8 week implementation)
- Custom AI agent development beyond standard templates
- Multi-agent orchestration (multiple bots working together)
- Enterprise integrations (Salesforce, HubSpot, Epic, custom ERPs)
- Dedicated or isolated infrastructure (not shared-tenant)
- SSO/SAML authentication support
- Custom SLA with uptime guarantees (99.9%+)
- Compliance documentation support (HIPAA, SOC 2 readiness as applicable)
- Quarterly business reviews with executive stakeholders
- Dedicated support channel with 1-hour response SLA during business hours
- Custom reporting and analytics dashboards
- Volume-based pricing for high call/message throughput

### COGS Estimate
| Cost Component | Monthly Estimate |
|----------------|-----------------|
| Twilio (high volume) | $100 - $400 |
| OpenAI API (high volume) | $200 - $600 |
| Fly.io dedicated hosting | $75 - $200 |
| Engineering/support labor (amortized) | $200 - $500 |
| Compliance/security overhead | $50 - $100 |
| **Total COGS** | **$625 - $1,800** |

### Gross Margin
- Revenue range: $1,500 - $2,500/mo
- COGS range: $625 - $1,800/mo
- **Gross margin: $700 - $1,875/mo (roughly 40-75%)**
- Margin varies significantly by deal. Lower-end enterprise deals ($1,500/mo) with heavy usage can be tight.
- Higher-end deals ($2,500/mo) with standard usage yield strong margins.
- Setup fees ($7,500-$15,000) cover implementation costs and provide margin buffer.

### Annual Value Per Client
- Low end: $7,500 setup + ($1,500 x 12) = **$25,500 first-year value**
- Mid range: $10,000 setup + ($2,000 x 12) = **$34,000 first-year value**
- High end: $15,000 setup + ($2,500 x 12) = **$45,000 first-year value**
- Ongoing annual value (no setup): $18,000 - $30,000

---

## Pilot Program

### Target Customer
Prospects who are interested but need to see results before committing to a full engagement. Often decision-makers who have budget authority but need internal validation, or businesses that have been burned by vendors before and want proof of value. Also useful for entering new verticals where case studies don't yet exist.

### What's Included
- Reduced setup: streamlined onboarding (1-2 week implementation vs. standard 3-4 weeks)
- Single use-case deployment (one agent, one workflow)
- 30-day pilot period with full functionality
- Weekly check-in calls during pilot
- Performance report at day 15 and day 30
- Auto-converts to Tier 1 (Direct Client) pricing at day 31 unless canceled
- Setup fee difference ($1,250 paid during pilot; $1,250 balance due upon conversion, totaling $2,500)
- If client does not convert, no further obligation

### COGS Estimate
| Cost Component | Monthly Estimate |
|----------------|-----------------|
| Twilio | $15 - $30 |
| OpenAI API | $30 - $60 |
| Fly.io hosting | $10 - $20 |
| Onboarding labor (amortized over pilot) | $50 - $100 |
| **Total COGS** | **$105 - $210** |

### Gross Margin
- Revenue: $249/mo (during 30-day pilot)
- COGS midpoint: ~$155/mo
- **Gross margin during pilot: ~$94/mo (roughly 38%)**
- Margin is intentionally lower. This is a customer acquisition tool, not a profit center.
- The real value is conversion: if 60%+ of pilots convert to full Direct Client pricing, the blended economics are strong.

### Annual Value Per Client
- If converts at day 31: $1,250 (pilot setup) + $249 (pilot month) + $1,250 (conversion balance) + ($497 x 11 remaining months) = **$8,216 first-year value**
- If does not convert: $1,250 setup + $249 = **$1,499 total** (covers costs, slight margin)

---

## Case Study Deal

### Target Customer
The first 1-3 clients in a new vertical or use case where ClawOps needs proven results and testimonials. These are strategic, not revenue-maximizing. Target: businesses willing to provide detailed feedback, participate in a case study write-up, and allow their results to be shared publicly (with approval). Ideal candidates are well-known in their niche or have metrics-driven operations that produce compelling before/after data.

### What's Included
- Full Direct Client tier service and support
- Negotiated pricing (as low as cost, i.e., COGS only)
- Setup fee negotiable or waived entirely
- In exchange, client agrees to:
  - Participate in a written case study (name, logo, results)
  - Provide a video or written testimonial
  - Allow ClawOps to reference them in marketing materials
  - Be available for 1-2 reference calls with future prospects
- 90-day minimum commitment at case study pricing
- After 90 days, transitions to standard Direct Client pricing or negotiated long-term rate

### COGS Estimate
Same as Direct Client tier: $105 - $195/mo

### Gross Margin
- Revenue: at or near cost (could be $0 margin, could be slight margin depending on negotiation)
- **Gross margin: 0% to 20% during case study period**
- This is a marketing investment, not a revenue play
- Value is measured in pipeline impact: one strong case study can justify 5-10 new client conversions

### Annual Value Per Client
- Case study period (3 months at ~cost): ~$450 - $600 total revenue
- If converts to standard pricing after 90 days: remaining 9 months at $497/mo = $4,473
- **Blended first-year value: ~$5,000 - $5,100** (assuming conversion)
- True ROI is the downstream revenue influenced by the case study, not the client's own spend

---

## Quarterly Prepay Incentive

**Applies to:** Tier 1 (Direct Client), Tier 2 (Agency White-Label), Tier 3 (Enterprise/Custom)
**Does not apply to:** Pilot Program (too short), Case Study Deal (already discounted)

### Terms
- Client commits to 3 months of service, paid upfront
- Receives a 10% discount on the monthly recurring fee
- Payment is non-refundable for the committed quarter
- Auto-renews quarterly unless client provides 15 days written notice before quarter end

### Discounted Rates

| Tier | Standard Monthly | Quarterly Monthly (10% off) | Quarterly Payment |
|------|-----------------|----------------------------|-------------------|
| Direct Client | $497 | $447.30 | $1,341.90 |
| Agency White-Label (per seat) | $100 | $90.00 | $270.00 per seat |
| Enterprise (low) | $1,500 | $1,350 | $4,050 |
| Enterprise (high) | $2,500 | $2,250 | $6,750 |

### Why Offer It
- Improves cash flow predictability (3 months guaranteed vs. month-to-month risk)
- Reduces churn: prepaid clients are 40-60% less likely to cancel mid-quarter
- Slight margin compression is offset by reduced payment processing overhead and lower churn cost
- Creates a natural upsell conversation every 3 months at renewal

---

## Revenue Modeling Summary

### Per-Tier Annual Value (First Year, Monthly Billing)

| Tier | Setup | Annual Recurring | First-Year Total |
|------|-------|-----------------|-----------------|
| Direct Client | $2,500 | $5,964 | $8,464 |
| Agency White-Label (10 seats) | $5,000 | $12,000 | $17,000 |
| Enterprise (mid) | $10,000 | $24,000 | $34,000 |
| Pilot (converts to Direct) | $2,500 total | $5,716 | $8,216 |
| Case Study (converts to Direct) | ~$0 | ~$5,000 | ~$5,000 |

### Path to $100K Revenue (Illustrative Mix)

| Client Type | Count | First-Year Revenue |
|-------------|-------|-------------------|
| Direct Client | 5 | $42,320 |
| Agency White-Label (avg 8 seats) | 2 | $24,200 |
| Enterprise (mid) | 1 | $34,000 |
| Pilot (converts) | 2 | $16,432 |
| **Total** | **10 clients** | **$116,952** |

This mix is illustrative. Actual composition will depend on pipeline development and market response. The key insight: 10 clients across tiers gets to six figures in year one.
