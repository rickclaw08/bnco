# Payment Processing Options — ClawOps Comparison

*Prepared: Feb 2026 | Review quarterly for rate changes*

---

## Summary Matrix

| Provider | Transaction Fee | Monthly Fee | Payout Speed | Recurring Billing | Invoicing | Best For |
|----------|----------------|-------------|--------------|-------------------|-----------|----------|
| **Stripe** | 2.9% + $0.30 | $0 | 2 business days (Instant avail for 1%) | ✅ Excellent | ✅ Built-in | Developer-first SaaS, API flexibility |
| **Square** | 2.6% + $0.10 (in-person) / 2.9% + $0.30 (online) | $0 (Plus: $29/mo) | 1-2 business days (Instant for 1.75%) | ✅ Good | ✅ Built-in | Hybrid in-person + online |
| **PayPal** | 2.99% + $0.49 (standard) / 2.59% + $0.49 (advanced) | $0 / $5 (advanced checkout) | Instant to PayPal balance, 1-3 days to bank | ✅ Via subscriptions | ✅ Built-in | Client trust/recognition, international |
| **Paddle** | 5% + $0.50 | $0 | Net 1-7 days | ✅ Excellent | ✅ Built-in | SaaS — acts as Merchant of Record (handles tax) |
| **Wise Business** | 0.4-1.5% (varies by method) | $0 | 1-2 days domestic, fast intl | ❌ No | ❌ No | Low-fee international transfers |
| **Helcim** | Interchange + 0.3% + $0.08 (online) | $0 | 2 business days | ✅ Good | ✅ Built-in | Volume discount, transparent pricing |
| **Authorize.net** | 2.9% + $0.30 | $25/mo | 2-3 business days | ✅ Via CIM/ARB | ❌ Limited | Legacy integrations, enterprise |
| **Braintree** | 2.59% + $0.49 | $0 | 2-3 business days | ✅ Good | ❌ Limited | PayPal/Venmo integration, marketplace |
| **LemonSqueezy** | 5% + $0.50 | $0 | Weekly/bi-weekly | ✅ Excellent | ✅ Built-in | Digital products, MoR (handles tax globally) |

---

## Deep Dive: Top Contenders for ClawOps

### 1. Stripe (Current/Default)
- **Pros:** Best API, excellent docs, Stripe Billing for subscriptions, Connect for marketplace, Tax for compliance, Revenue Recognition
- **Cons:** 2.9% + 30¢ adds up; dispute fees ($15); support can be slow
- **ClawOps fit:** Strong. Handles recurring, invoicing, tax. Most SaaS agencies use it.
- **Monthly cost on $10K revenue:** ~$320

### 2. Paddle / LemonSqueezy (Merchant of Record)
- **Pros:** They handle ALL sales tax, VAT, compliance globally. You never file tax in 50 states. One 1099. Drastically reduces accounting overhead.
- **Cons:** 5% + 50¢ is expensive. Less control. Weekly payouts.
- **ClawOps fit:** Very compelling if selling to international clients. Tax compliance alone saves $2-5K/yr in accounting.
- **Monthly cost on $10K revenue:** ~$550
- **Tax savings:** $200-400/mo in accounting/compliance

### 3. Helcim (Lowest Fees at Scale)
- **Pros:** Interchange-plus pricing = lowest actual fees at volume. No monthly fees. Good invoicing. Volume discounts kick in automatically.
- **Cons:** Less polished developer experience. Fewer integrations.
- **ClawOps fit:** Best pure cost play once revenue exceeds $15-20K/mo
- **Monthly cost on $10K revenue:** ~$200-250 (varies by card mix)

### 4. Square (Hybrid)
- **Pros:** Great if ever doing in-person consulting. Clean invoicing. Fast deposits. Good ecosystem.
- **Cons:** Less SaaS-oriented. Can freeze accounts.
- **ClawOps fit:** Decent. Better if doing any in-person work.

### 5. Wise Business (International Wire Alternative)
- **Pros:** Multi-currency accounts, near-zero FX fees, very cheap international transfers
- **Cons:** Not a payment processor — clients must initiate transfers
- **ClawOps fit:** Use alongside primary processor for international enterprise clients paying via wire/ACH

---

## Recommendation

**Phase 1 (0-$10K MRR):** Stripe — ecosystem, flexibility, fast setup
**Phase 2 ($10K-$30K MRR):** Evaluate Paddle/LemonSqueezy if international tax is painful, or Helcim if margins matter more
**Phase 3 ($30K+ MRR):** Helcim for domestic + Wise for international wires. Consider Stripe volume discounts (negotiable at scale).

**Hybrid approach:** Stripe for subscriptions + Wise for enterprise wire transfers = optimal cost structure for an agency.

---

## Fee Comparison on ClawOps Tiers

| Tier | Monthly Price | Stripe Fee | Paddle Fee | Helcim Fee |
|------|--------------|------------|------------|------------|
| Starter | $497 | $14.71 | $25.35 | ~$10.50 |
| Growth | $1,997 | $58.21 | $100.35 | ~$38.00 |
| Enterprise | $4,997 | $145.21 | $250.35 | ~$93.00 |

*Annual savings switching from Stripe to Helcim on 20 Growth clients: ~$4,850/yr*
