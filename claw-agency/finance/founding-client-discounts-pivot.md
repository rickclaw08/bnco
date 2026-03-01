# Founding Client Discount Structure - Post Market Pivot
**Date:** February 24, 2026
**Author:** Morgan (CFO)

---

## Overview

The founding client program is our early-mover incentive. It rewards the first clients who take a chance on ClawOps before we have case studies and social proof. In exchange for discounted pricing, founding clients agree to provide testimonials, allow (anonymized) case studies, and serve as references.

**Important:** The old founding client coupons (FOUNDING-STARTER, FOUNDING-GROWTH, FOUNDING-SPRINT, FOUNDING-ENTERPRISE) should be **deactivated** in Stripe. They reference deprecated products and pricing.

---

## New Founding Client Terms

### Who Qualifies
- First **10 clients** across all tiers (total, not per tier)
- Must sign a founding client agreement that includes:
  - Permission to use their results (anonymized) as a case study
  - Willingness to provide a testimonial within 60 days
  - Act as a reference for 2-3 prospect calls over 6 months
  - Honest feedback on service quality (we need it to improve)

### What They Get
- Discounted pricing (see below)
- Priority support and direct access to the founder
- Locked-in pricing for 12 months (no increases during that period)
- First access to new features and services
- "Founding Client" badge on their case study (social proof for them too)

---

## Founding Client Pricing

### Tier 1: AI Readiness Audit

| | Standard | Founding Client | Discount |
|--|---------|----------------|----------|
| Price | $500 | $297 | 41% off |
| Coupon Code | - | `FOUNDING-AUDIT` | - |

**Rationale:** Deep discount because this is a lead-gen tool. Getting 10 audits done fast = 10 case studies and 6-7 upsell opportunities. The $297 price point is psychologically "under $300" which removes friction.

---

### Tier 2: AI Receptionist - Setup

| | Standard | Professional | Premium |
|--|---------|-------------|---------|
| **Standard Price** | $1,500 | $2,250 | $3,000 |
| **Founding Price** | $997 | $1,497 | $1,997 |
| **Discount** | 33% | 33% | 33% |
| **Coupon Code** | `FOUNDING-RECEP-STD` | `FOUNDING-RECEP-PRO` | `FOUNDING-RECEP-PREM` |

**Rationale:** 33% off setup is significant but the real value to us is the recurring monthly revenue. We recover the setup discount in 3-4 months of monthly fees.

---

### Tier 3: AI Receptionist - Monthly Service

| | Standard | Professional | Premium |
|--|---------|-------------|---------|
| **Standard Price** | $300/mo | $400/mo | $500/mo |
| **Founding Price** | $247/mo | $347/mo | $447/mo |
| **Discount** | ~18% | ~13% | ~11% |
| **Coupon Code** | `FOUNDING-RECEP-MO` | (same code, applies % off) | (same code) |
| **Duration** | Forever (locked in) | Forever | Forever |

**Rationale:** Smaller discount on recurring because:
1. This revenue compounds over time - even small discounts add up
2. The margin on $300/mo is already thin (27%). At $247/mo, margin drops to ~12%. Not great.
3. We lock the price forever, which is the real value proposition for them

**Important:** Push founding clients to the $400/mo+ tiers. The $247/mo is borderline unprofitable. If possible, don't even offer the Standard tier to founding clients - start at Professional ($347/mo).

---

### Tier 4: Revenue Operations Sprint

| | Focused | Standard | Comprehensive |
|--|---------|---------|--------------|
| **Standard Price** | $5,000 | $10,000 | $15,000 |
| **Founding Price** | $3,497 | $6,997 | $9,997 |
| **Discount** | 30% | 30% | 33% |
| **Coupon Code** | `FOUNDING-SPRINT-S` | `FOUNDING-SPRINT-M` | `FOUNDING-SPRINT-L` |

**Rationale:** 30-33% off is aggressive but Sprint clients have the highest upsell rate to AaaS retainers (45%). A $3,497 Sprint that converts to a $3,000/mo retainer pays for itself in month 2.

---

### Tier 5: AI Agent Development

| | Standard | Advanced | Premium |
|--|---------|---------|---------|
| **Standard Price** | $7,500 | $15,000 | $25,000 |
| **Founding Price** | $4,997 | $9,997 | $17,497 |
| **Discount** | 33% | 33% | 30% |
| **Coupon Code** | `FOUNDING-AGENT-S` | `FOUNDING-AGENT-M` | `FOUNDING-AGENT-L` |

**Rationale:** Agent development clients need ongoing maintenance. The discount buys us a case study of a complex AI system in production. The 50% conversion rate to AaaS retainer makes this a long-term play.

---

### Tier 6: Automation-as-a-Service (AaaS) Retainer

| | Base | Professional | Premium |
|--|------|-------------|---------|
| **Standard Price** | $2,000/mo | $3,500/mo | $5,000/mo |
| **Founding Price** | $1,497/mo | $2,497/mo | $3,497/mo |
| **Discount** | 25% | 29% | 30% |
| **Coupon Code** | `FOUNDING-AAAS` | (same code) | (same code) |
| **Duration** | 6 months, then standard pricing | 6 months | 6 months |

**Rationale:** Unlike the AI Receptionist founding discount (forever), AaaS founding pricing expires after 6 months. Why? Because:
1. AaaS margins are tighter (51-53%) - a 25-30% discount eats significantly into profit
2. After 6 months, the client is deeply integrated and switching costs are high
3. Standard pricing at month 7 is still fair value - they've seen 6 months of results

**Transition plan:** At month 5, have a "value review" call showing all ROI delivered. Then announce the price moves to standard at month 7. Most clients will stay.

---

## Stripe Coupon Creation Checklist

Create these coupons in Stripe Dashboard:

| Coupon Code | Type | Amount/% | Duration | Applies To |
|-------------|------|----------|----------|------------|
| `FOUNDING-AUDIT` | Fixed ($203 off) | $203 off | Once | AI Readiness Audit |
| `FOUNDING-RECEP-STD` | Fixed ($503 off) | $503 off | Once | AI Receptionist Setup - Standard |
| `FOUNDING-RECEP-PRO` | Fixed ($753 off) | $753 off | Once | AI Receptionist Setup - Professional |
| `FOUNDING-RECEP-PREM` | Fixed ($1,003 off) | $1,003 off | Once | AI Receptionist Setup - Premium |
| `FOUNDING-RECEP-MO` | Percentage (13%) | 13% off | Forever | AI Receptionist Monthly (all tiers) |
| `FOUNDING-SPRINT-S` | Fixed ($1,503 off) | $1,503 off | Once | Revenue Ops Sprint - Focused |
| `FOUNDING-SPRINT-M` | Fixed ($3,003 off) | $3,003 off | Once | Revenue Ops Sprint - Standard |
| `FOUNDING-SPRINT-L` | Fixed ($5,003 off) | $5,003 off | Once | Revenue Ops Sprint - Comprehensive |
| `FOUNDING-AGENT-S` | Fixed ($2,503 off) | $2,503 off | Once | AI Agent Dev - Standard |
| `FOUNDING-AGENT-M` | Fixed ($5,003 off) | $5,003 off | Once | AI Agent Dev - Advanced |
| `FOUNDING-AGENT-L` | Fixed ($7,503 off) | $7,503 off | Once | AI Agent Dev - Premium |
| `FOUNDING-AAAS` | Percentage (27%) | 27% off | 6 months | AaaS Retainer (all tiers) |

**Redemption limit:** Set each coupon to max 10 redemptions (founding client cap).

---

## Old Coupons to Deactivate

| Code | Stripe ID | Action |
|------|-----------|--------|
| FOUNDING-STARTER | RCXvnWJF | Deactivate |
| FOUNDING-GROWTH | jziNeZVI | Deactivate |
| FOUNDING-SPRINT | AEt7NwlU | Deactivate |
| FOUNDING-ENTERPRISE | OIrTSYmJ | Deactivate |

---

## Revenue Impact of Founding Client Discounts

### Worst Case: All 10 founding clients take maximum discounts

| Tier | # Clients | Standard Revenue | Founding Revenue | Revenue Lost |
|------|-----------|-----------------|-----------------|-------------|
| AI Audit | 4 | $2,000 | $1,188 | $812 |
| AI Receptionist (setup) | 3 | $6,750 | $4,491 | $2,259 |
| AI Receptionist (monthly, 12mo) | 3 | $14,400 | $12,492 | $1,908 |
| Revenue Ops Sprint | 2 | $20,000 | $13,994 | $6,006 |
| AaaS (6mo founding + 6mo standard) | 1 | $42,000 | $32,982 | $9,018 |
| **Total** | **10** | **$85,150** | **$65,147** | **$20,003** |

**Total discount exposure: ~$20K**

That's $20K in "lost" revenue, but what we get back:
- 10 case studies (each worth $5K-$20K in future sales influence)
- 10 testimonials (priceless for credibility)
- 5-10 referrals from happy founding clients (worth $30K-$50K in pipeline)
- Proof of concept for each service tier (reduces sales friction for clients 11-100)

**Net ROI on founding client program: 5-10x positive.**

---

## Implementation Priority

1. **Week 1:** Create Audit and AI Receptionist products + founding coupons
2. **Week 2:** Create Sprint and Agent Development products + coupons
3. **Week 3:** Create AaaS product + coupon
4. **Week 1:** Deactivate old coupons (do this immediately)

---

*Document Owner: Morgan (CFO)*
*Created: February 24, 2026*
