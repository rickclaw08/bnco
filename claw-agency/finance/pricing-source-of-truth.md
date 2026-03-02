# ClawOps Pricing - Single Source of Truth
**Last updated:** March 2, 2026
**Owner:** Morgan (CFO)
**Rule:** If pricing appears anywhere else and contradicts this document, THIS document wins. Update this file first, then propagate changes everywhere else.

---

## 1. FOUNDING MEMBER PRICING (Limited to 20 Spots)

| Product | Price | Type | Stripe Link |
|---------|-------|------|-------------|
| AI Receptionist - Founding Member | **$1,997** | One-time, no monthly fees, ever | [Pay Now](https://buy.stripe.com/cNi7sLalDfC140A7uc3oA0h) |

**What's included:**
- Done-for-you AI receptionist setup (live in 48 hours)
- 24/7 call answering, lead qualification, appointment booking
- SMS auto-responder for missed calls
- CRM integration
- Ongoing updates and maintenance at no additional cost
- Direct access to the team for changes
- No monthly fees, ever (founding members only)

**Spots remaining:** 17 of 20 (as shown on founding page)

**Where this price appears:**
- Founding page: theclawops.com/founding/ (correct, $1,997 one-time)
- MEMORY.md (correct)
- Outreach DMs (correct)
- Blog post: why-contractors-lose-12k-missed-calls.html (references founding offer)

---

## 2. STANDARD PRICING (Post-Founding / General Public)

| Product | Price | Type | Stripe Link |
|---------|-------|------|-------------|
| AI Receptionist - Setup | **$2,500** | One-time setup fee | Combo link below |
| AI Receptionist - Monthly | **$497/mo** | Recurring after setup | Combo link below |
| AI Receptionist - Combo | **$2,500 + $497/mo** | Setup + first month | [Pay Now](https://buy.stripe.com/eVq6oH1P7dtT0Oo8yg3oA0g) |
| AI Readiness Audit | **$500** | One-time | [Pay Now](https://buy.stripe.com/eVqbJ1ctLgG5eFe9Ck3oA04) |
| Custom AI Agent Development | **$7,500+** | One-time (project-based) | [Pay Now](https://buy.stripe.com/7sYfZh51jahH40AdSA3oA09) |
| Revenue Operations Sprint | **$5,000** | One-time | [Pay Now](https://buy.stripe.com/7sYfZh51jahH40AdSA3oA09) |
| Automation-as-a-Service | **$2,000/mo** | Recurring retainer | [Pay Now](https://buy.stripe.com/bJeeVdctL61r8gQcOw3oA0a) |

**Note:** Custom AI Agent Dev and Revenue Operations Sprint share the same Stripe link. The link currently points to a $7,500/$5,000 product. If these need separate checkout experiences, create a second Stripe product.

**Where standard pricing appears:**
- Main website (theclawops.com): $2,500 setup + $497/mo for AI Receptionist (correct)
- Founding page comparison: "Normally ~~$2,500 setup + $497/mo~~" (correct)
- MEMORY.md (correct)
- Stripe dashboard products (correct, updated Feb 28)

---

## 3. SHIELD SCANNER PRICING

| Product | Price | Type | Stripe Link |
|---------|-------|------|-------------|
| Shield Starter | **$5.99/mo** | Recurring (10 scans/mo) | [Pay Now](https://buy.stripe.com/9B6eVd0L3blL54E9Ck3oA0d) |
| Shield Pro | **$9.99/mo** | Recurring (unlimited scans) | [Pay Now](https://buy.stripe.com/4gM8wP3Xf2Pfbt229S3oA0e) |
| Shield Enterprise | **$14.99/mo** | Recurring (bulk + API + teams + PDF) | [Pay Now](https://buy.stripe.com/4gM8wPctLexXgNm8yg3oA0f) |

**Note:** Free for all existing ClawOps service clients. Shield is not a primary revenue driver per the Mar 2 stop list.

---

## 4. LEGACY/ARCHIVED STRIPE LINKS (Do NOT Use for New Sales)

These are from old pricing structures. They still resolve but should not be sent to new prospects.

| Product | Old Price | Stripe Link | Status |
|---------|-----------|-------------|--------|
| Starter Sprint | $600 one-time | https://buy.stripe.com/28E00j1P7cpPgNm5m43oA00 | ARCHIVED |
| Growth Retainer | $2,000/mo | https://buy.stripe.com/7sYeVd9hz75v7cM01K3oA01 | ARCHIVED |
| Automation Sprint | $7,500 one-time | https://buy.stripe.com/aFa28r79r2Pf1Ss7uc3oA02 | ARCHIVED |
| Enterprise - Fractional CTO | $5,000/mo | https://buy.stripe.com/8x2eVdalD89z54Eg0I3oA03 | ARCHIVED |
| AI Receptionist $300/mo (old monthly) | $300/mo | https://buy.stripe.com/28E8wP79r1LbfJidSA3oA05 | ARCHIVED (replaced by $497/mo) |
| AI Receptionist $1,500 setup (old) | $1,500 one-time | https://buy.stripe.com/8x28wPeBTahH68IaGo3oA0b | ARCHIVED (replaced by $2,500 setup) |
| Revenue Ops Sprint $5,000 (old standalone) | $5,000 | https://buy.stripe.com/7sY14n9hz75v1SscOw3oA06 | ARCHIVED |

**Founding client coupon codes (still active on archived links):**

| Tier | Standard Price | Founding Price | Code |
|------|---------------|---------------|------|
| Starter Sprint | $600 | $397 | FOUNDING-STARTER (RCXvnWJF) |
| Growth Retainer | $2,000/mo | $1,497/mo | FOUNDING-GROWTH (jziNeZVI) |
| Automation Sprint | $7,500 | $4,997 | FOUNDING-SPRINT (AEt7NwlU) |
| Enterprise | $5,000/mo | $3,497/mo | FOUNDING-ENTERPRISE (OIrTSYmJ) |

These coupons apply to the old product structure. They are not relevant to the current founding member deal ($1,997 one-time).

---

## 5. INCONSISTENCIES FLAGGED

### CRITICAL

1. **Demo page (receptionist-v2) shows wrong pricing:** $2,000 setup + $300/mo
   - Location: theclawops.com/demo/receptionist-v2/ (lines 929-935 of index.html)
   - Should be: $2,500 setup + $497/mo
   - **Action required:** Update the demo page HTML immediately.

2. **Outreach DMs used $297/mo and $1,250+$99/mo:** Several DM scripts and outreach templates reference $297/mo, $497/mo, and $99/mo in different contexts. The white-label pitch to agencies uses "$297-497/mo" as what agencies charge their clients, which is fine as a reseller price recommendation. But the Good_luggage prospect was quoted "$1,250 + $99/mo" which doesn't match any current pricing tier.
   - **Action required:** All direct ClawOps pricing in outreach must use $1,997 founding OR $2,500 + $497/mo standard. Custom agency/white-label quotes are separate and should be documented here when finalized.

3. **Old pricing docs still exist:** pricing-packages-v2.md ($600/$2,000/$7,500/$5,000 structure), stripe-products-pivot.md ($1,500 setup / $300 monthly tiers), payment-links.md (old $600-$5,000 structure). These files have not been updated or marked as superseded.
   - **Action required:** Add "SUPERSEDED" header to each, pointing to this document.

### MINOR

4. **Stripe Pricing IDs in MEMORY.md are accurate:** Setup price_1T5xSwGVy0YtRkxZaAAlnXLw ($2,500) and monthly price_1T5xSnGVy0YtRkxZMZseIqvW ($497/mo) are the current active price objects. No conflict.

5. **Financial reality check doc (Mar 2) references correct pricing** throughout. No inconsistency.

---

## 6. COMPETITOR COMPARISON

### AI Receptionist Monthly Pricing (Competitors)

| Competitor | Pricing Model | Monthly Cost |
|------------|---------------|-------------|
| Smith.ai | Monthly recurring | $300 - $2,100/mo |
| Ruby Receptionists | Monthly recurring | $235 - $1,640/mo |
| Goodcall | Monthly recurring | $79 - $249/mo |
| My AI Front Desk | Monthly recurring | $99 - $149/mo |
| Podium AI | Monthly recurring | $399 - $599/mo |
| Synthflow | Monthly recurring + per-minute | $29/mo + usage |
| Vapi | Per-minute usage + platform fee | $0.05/min + usage |
| Air.ai | Monthly recurring | $0.11/min (~$300-600/mo at volume) |

### ClawOps Founding Member Advantage

| | Competitors (typical) | ClawOps Founding |
|-|----------------------|-----------------|
| Payment model | Monthly forever | **One-time $1,997** |
| Year 1 cost | $2,388 - $25,200 | **$1,997** |
| Year 2 total cost | $4,776 - $50,400 | **$1,997 (still)** |
| Year 3 total cost | $7,164 - $75,600 | **$1,997 (still)** |
| Ongoing fees | Yes, forever | **None** |

**Key selling point:** At $199/mo (industry average low-end), a competitor costs $2,388/year. Our founding member deal saves money in year ONE and compounds savings every year after. By year 3, a founding member has saved $5,167+ compared to even the cheapest monthly competitor.

### ClawOps Standard vs Competitors

ClawOps standard ($2,500 setup + $497/mo) is mid-market. Year 1 total = $8,464. Competitive with Smith.ai mid-tier and Ruby mid-tier. The differentiator is custom setup and AI-native architecture vs human-assisted models.

---

## 7. MARGIN ANALYSIS - FOUNDING MEMBER DEAL

### Per-Client Costs (Monthly Recurring)

| Cost Item | Monthly Amount | Notes |
|-----------|---------------|-------|
| GoHighLevel sub-account | $97/mo | Per location, required for CRM/phone/workflows |
| Twilio usage (voice + SMS) | $5 - $15/mo | ~200 calls/mo estimate, varies by volume |
| OpenAI API (Realtime/GPT-4o) | $5 - $20/mo | Depends on call duration and complexity |
| Domain/hosting overhead (amortized) | ~$2/mo | Negligible at scale |
| **Total monthly COGS per client** | **$109 - $134/mo** | Conservative estimate |

### Using midpoint COGS of $120/mo:

| Metric | Value |
|--------|-------|
| One-time revenue per founding client | $1,997 |
| Monthly cost per client | ~$120 |
| Months until revenue consumed by costs | **16.6 months** |
| Break-even point | ~16-17 months after signup |
| After 17 months | **Every month is a net loss of $120** |

### Profitability Timeline

| Month | Cumulative Revenue | Cumulative Cost | Net Position |
|-------|-------------------|-----------------|-------------|
| 0 (signup) | $1,997 | $0 | +$1,997 |
| 3 | $1,997 | $360 | +$1,637 |
| 6 | $1,997 | $720 | +$1,277 |
| 12 | $1,997 | $1,440 | +$557 |
| 16 | $1,997 | $1,920 | +$77 |
| **17** | **$1,997** | **$2,040** | **-$43 (BREAK-EVEN CROSSED)** |
| 24 | $1,997 | $2,880 | -$883 |
| 36 | $1,997 | $4,320 | -$2,323 |

### Sensitivity Analysis

| Scenario | Monthly COGS | Break-even Month | Year 3 Net |
|----------|-------------|-----------------|-----------|
| Best case (low usage) | $107/mo | Month 18-19 | -$1,855 |
| Base case | $120/mo | Month 16-17 | -$2,323 |
| Worst case (heavy usage) | $140/mo | Month 14-15 | -$3,043 |

### When Does This Become Unprofitable?

**The founding member deal becomes a net loss at month 17.** After that, every month the client stays active costs ClawOps ~$120 with zero offsetting revenue.

### Strategic Justification (Why It's Still Worth It)

1. **Cash now vs cash later:** $1,997 upfront x 20 clients = $39,940 immediate cash. That funds operations and proves product-market fit.

2. **Customer acquisition cost (CAC):** We're spending $0 on ads. The $120/mo ongoing cost is effectively our CAC amortized. Compare to paid acquisition at $400-800 CPA plus the same ongoing costs.

3. **Social proof multiplier:** 20 paying clients generating testimonials, reviews, and referrals. Each founding member who refers one standard client ($2,500 + $497/mo) more than covers the long-term loss.

4. **Upsell path:** Founding members get receptionist only. Additional services (CRM setup, automation workflows, reporting dashboards) can be sold separately.

5. **Churn reality:** Industry churn for B2B SaaS is 5-7% monthly. Not all 20 founding members will stay forever. Natural churn reduces the long-term liability. If a founding member leaves after month 12, we kept $1,997 and only spent $1,440. Still profitable.

6. **GHL cost reduction:** If we move to a white-label GHL plan ($497/mo for unlimited sub-accounts), the per-client GHL cost drops from $97 to effectively $25-30 per client at 20 clients. That pushes break-even to month 25-30.

### Mitigation Strategies

- **Cap founding member benefits at 24 months**, then transition to a reduced maintenance fee ($97/mo). Requires clear terms upfront.
- **Move to white-label GHL** once we hit 5+ clients to reduce per-client SaaS costs.
- **Negotiate Twilio volume discounts** at 10+ active numbers.
- **Use self-hosted LLM inference** for simple call routing (reduces OpenAI costs by 60-80%).

---

## 8. PRICING GOVERNANCE

### Rules

1. **This document is the single source of truth.** All pricing across website, Stripe, outreach, DMs, and internal docs must match this document.
2. **Any pricing change must be updated here FIRST**, then propagated to all surfaces.
3. **Custom quotes** (white-label, agency deals, bulk) must be logged in a separate section below with the prospect name, date, and terms.
4. **No one-off discounts** without updating the founding client coupon structure or getting Brand's approval.

### Custom Quotes Log

| Date | Prospect | Quote | Status | Notes |
|------|----------|-------|--------|-------|
| 2026-03-01 | Good_luggage (Reddit) | $1,250 setup + $99/mo | Sent, no reply | Non-standard, was a custom agency deal. Does not reflect current pricing. |

---

*Morgan (CFO) - ClawOps*
*"One price list. One truth. No surprises."*
