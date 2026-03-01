# Stripe Integration Guide for ClawOps

## Overview

This guide walks through setting up Stripe for ClawOps revenue operations. We'll configure three pricing tiers, payment links, subscription handling, and invoicing.

## Prerequisites

- Business bank account (required for payouts)
- Business EIN or SSN for tax reporting
- Business email (use agentclaw08@icloud.com or create finance@clawops.com)
- Business address for legal entity

## Step 1: Stripe Account Setup

1. Go to stripe.com/register
2. Select "Business" account type
3. Enter business details:
   - Legal business name: ClawOps (or full legal entity name)
   - Business structure: LLC/Sole Proprietorship (verify actual structure)
   - Industry: Computer Software / Business Services
   - Website: clawops.com (once live)
4. Complete identity verification (photo ID + business documents)
5. Connect bank account for payouts (2-7 day verification period)
6. Enable tax collection (sales tax automation)

**Timeline:** Account approval typically takes 1-3 business days. Plan accordingly before first client.

## Step 2: Product Configuration

### Product 1: Starter Tier

**Configuration:**
- Product name: "ClawOps Starter"
- Description: "AI automation for small businesses - lead generation, email, social media"
- Price: $500/month
- Billing type: **Subscription (monthly recurring)**
- Tax behavior: Taxable (enable automatic tax)

**Why subscription:** Predictable revenue, easier to forecast, higher LTV. Clients expect monthly SaaS pricing at this tier.

**Payment link settings:**
- Allow promotion codes: Yes
- Collect billing address: Yes (required for tax)
- Collect phone number: Yes (for support)
- Payment methods: Card, ACH bank transfer (lower fees)
- Trial period: Optional 14-day trial (recommend NO trial initially to qualify leads)

### Product 2: Growth Tier

**Configuration:**
- Product name: "ClawOps Growth"
- Description: "Advanced AI ops - custom workflows, multi-channel automation, priority support"
- Price: $2,000/month
- Billing type: **Subscription (monthly recurring)**
- Tax behavior: Taxable

**Payment link settings:**
- Same as Starter tier
- Add: Request custom information field for "Primary automation goal"
- Consider: 7-day money-back guarantee (builds trust at this price point)

### Product 3: Enterprise Tier

**Configuration:**
- Product name: "ClawOps Enterprise"
- Price range: $5,000 - $15,000/month
- Billing type: **Custom invoicing (NOT payment link)**
- Setup: Manual invoice creation for each client

**Why manual invoicing:**
- Each enterprise deal is custom (different scope, features, support level)
- Allows negotiation and custom payment terms
- Can offer quarterly/annual prepay discounts
- Builds relationship before charging

**Invoice settings:**
- Payment terms: Net 15 (industry standard for this tier)
- Allow ACH/wire transfer (saves 2.9% card fees on large amounts)
- Include custom line items (setup fees, additional users, premium support)

## Step 3: Payment Links to Create

Create these immediately after account approval:

### Link 1: Starter Monthly
- Product: ClawOps Starter
- URL slug: /starter-monthly
- Copy link and add to website, proposals, email signatures

### Link 2: Growth Monthly
- Product: ClawOps Growth
- URL slug: /growth-monthly
- Usage: Send directly to qualified leads after discovery call

### Link 3: One-Time Setup Fee (Optional)
- Product name: "Onboarding & Setup"
- Price: $500 one-time
- Use case: Charge upfront for custom workflow setup if needed
- **Recommendation:** Only use for complex migrations or custom builds

### Link 4: Discovery Call Payment
- Product name: "Strategy Session"
- Price: $250 one-time
- Use case: Paid discovery calls (refundable if they sign)
- **Benefit:** Filters tire-kickers, demonstrates value

## Step 4: Subscription vs One-Time Recommendations

### Use Subscriptions For:
- Starter tier (monthly recurring revenue baseline)
- Growth tier (predictable cash flow)
- Any ongoing service delivery
- **Key benefit:** 92% of SaaS revenue should be recurring

### Use One-Time Payments For:
- Setup/onboarding fees (only if substantial custom work)
- Strategy sessions (lead qualification tool)
- Add-on services (one-off consulting, training)
- **Warning:** Don't rely on one-time revenue for core business model

### Hybrid Model (Recommended):
- Monthly subscription (core service)
- Optional one-time setup fee for complex clients
- Example: $500 setup + $2,000/mo = $2,500 first month, $2,000 thereafter

## Step 5: Stripe Features to Enable

### Must-Have:
1. **Stripe Billing** - Automatic subscription management
2. **Automatic tax calculation** - Handles sales tax by location
3. **Email receipts** - Professional, automatic
4. **Failed payment retry** - Recovers ~15% of failed charges
5. **Invoice reminders** - Send 7 days before, day of, 3 days after due

### Nice-to-Have:
1. **Stripe Radar** - Fraud detection (usually included)
2. **Customer portal** - Let clients update cards, download invoices
3. **Usage-based billing** - Future: charge per automation or API call
4. **Payment intents** - For custom checkout flows

### Skip Initially:
- Stripe Terminal (in-person payments - not relevant)
- Stripe Issuing (corporate cards - premature)
- Stripe Capital (loans - not needed yet)

## Step 6: Integration Options

### Option A: No-Code (Recommended for MVP)
**What:** Use Stripe payment links and customer portal
**Setup time:** 30 minutes
**Pros:** Zero development, works immediately, professional
**Cons:** Less customization, manual client management
**Best for:** First 10 clients

### Option B: Zapier/Make Integration
**What:** Connect Stripe to CRM, email, Slack notifications
**Setup time:** 2-4 hours
**Pros:** Automation (new client → welcome email → Slack alert)
**Cons:** Monthly cost ($20-50), another tool to manage
**Best for:** 10-50 clients

### Option C: Custom Website Integration
**What:** Embed Stripe checkout on clawops.com
**Setup time:** 8-20 hours development
**Pros:** Branded experience, full control, analytics
**Cons:** Requires developer, maintenance
**Best for:** 50+ clients or when raising capital

**Recommendation:** Start with Option A, add Option B after client 5, consider Option C after $50K MRR.

## Step 7: Pricing Strategy Tweaks

### Discount Codes to Create:
1. **EARLYBIRD** - 20% off first 3 months (first 5 clients only)
2. **ANNUAL** - 15% discount for annual prepay (Growth/Enterprise)
3. **REFERRAL** - $250 credit for referrals (applied as Stripe credit)

### Payment Terms:
- **Starter/Growth:** Card required, charged monthly on signup date
- **Enterprise:** Net 15 invoice, ACH/wire preferred
- **Annual plans:** 15% discount, non-refundable after 30 days

### Failed Payment Handling:
1. Day 0: Automatic retry
2. Day 3: Email reminder + retry
3. Day 7: Final notice + retry
4. Day 10: Suspend service (pause automations)
5. Day 30: Cancel subscription + offboard

**Critical:** Automate this sequence in Stripe dashboard to avoid manual chase-down.

## Step 8: Legal & Compliance

### Terms to Add:
1. **Refund policy:** 30-day money-back guarantee (Starter/Growth), no refunds on Enterprise custom work
2. **Auto-renewal notice:** "Subscription renews monthly unless canceled 5 days before billing date"
3. **Service level:** "Best-effort support, 48-hour response time" (upgrade for Enterprise)
4. **Data ownership:** "Client owns all data, can export anytime"

### Tax Compliance:
- Enable Stripe Tax (automatically calculates sales tax by state)
- Register for sales tax in states where you hit economic nexus thresholds
- Typical threshold: $100K revenue or 200 transactions in a state
- **Action item:** Monitor monthly, register when approaching thresholds

### PCI Compliance:
- Stripe handles PCI compliance (never store card data yourself)
- Use Stripe Elements or Payment Links only
- Don't build custom payment forms without PCI audit

## Step 9: Financial Monitoring

### Key Metrics to Track (Stripe Dashboard):
1. **MRR (Monthly Recurring Revenue):** Target $10K by month 6
2. **Churn rate:** Cancel rate per month (target <5%)
3. **Failed payment rate:** Should be <2% with retries
4. **Customer LTV:** Average revenue per customer lifetime
5. **Payment method mix:** Track card vs ACH (ACH = lower fees)

### Stripe Reports to Review Weekly:
- New subscriptions
- Cancellations (exit interview every one!)
- Failed payments (proactive outreach)
- Payout schedule (ensure cash flow timing)

## Step 10: Pre-Launch Checklist

Before sending first payment link:

- [ ] Stripe account fully verified (not restricted)
- [ ] Bank account connected and verified
- [ ] Products created (Starter, Growth)
- [ ] Payment links generated and tested
- [ ] Tax collection enabled
- [ ] Email receipts configured
- [ ] Customer portal enabled
- [ ] Failed payment retry enabled (7-day sequence)
- [ ] Test payment completed with test card (4242 4242 4242 4242)
- [ ] First payout scheduled (verify routing number)

## Fees & Economics

### Stripe Pricing:
- **Card payments:** 2.9% + $0.30 per transaction
- **ACH bank transfers:** 0.8% capped at $5
- **International cards:** +1.5% (3.9% total)
- **Currency conversion:** +1%

### Cost Per Transaction (Examples):
- $500 Starter (card): $14.80 fee = $485.20 net
- $2,000 Growth (card): $58.30 fee = $1,941.70 net
- $2,000 Growth (ACH): $5.00 fee = $1,995.00 net
- $10,000 Enterprise (ACH): $5.00 fee = $9,995.00 net

**Strategy:** Encourage ACH for Growth/Enterprise tiers to save 2.1% in fees. At $10K MRR, this saves ~$200/month.

## Month 1 Revenue Operations Workflow

1. **Client signs proposal** → Send payment link via email
2. **Payment received** → Stripe email notification
3. **Check Stripe dashboard** → Confirm subscription active
4. **Manual step:** Send welcome email + onboarding calendar link
5. **Day before renewal:** Stripe auto-charges card
6. **If payment fails:** Automatic retry (3x over 7 days)
7. **Track in spreadsheet:** Client name, tier, MRR, start date

**Future automation:** Zapier triggers welcome email automatically when payment received.

## Red Flags to Watch For

1. **High churn in first 30 days:** Product-market fit issue or wrong ICP
2. **Failed payment rate >5%:** Poor card quality (bad leads)
3. **Refund requests >10%:** Overpromising in sales, underdelivering
4. **Enterprise deals taking >60 days:** Sales cycle too long, need better qualification
5. **Clients downgrading:** Feature set mismatch or pricing too high

## Next Steps After First Client

1. **Ask for testimonial** (30 days in, when results visible)
2. **Request referrals** (offer $250 Stripe credit)
3. **Case study** (90 days in, document ROI)
4. **Review pricing** (after 5 clients, see if we're undercharging)
5. **Add annual plans** (lock in revenue, improve cash flow)

## Innovative Ideas for Rick

1. **Revenue-share model for agencies:** Instead of flat fee, take 10-20% of client's automation-driven revenue increase (requires tracking, but aligns incentives)
2. **White-label reseller tier:** Let agencies rebrand ClawOps, charge them 50% of retail, they mark up (scales without our sales effort)
3. **Usage-based pricing add-on:** Base subscription + $X per 1,000 automations executed (captures value for power users)
4. **Freemium tier:** Free for 1 workflow, upgrade for more (viral growth, huge lead gen)
5. **Performance guarantees:** "We'll save you 10 hours/week or refund 50%" (bold, differentiating, requires solid onboarding)

---

**Document Owner:** Morgan (CFO)  
**Last Updated:** Feb 20, 2025  
**Next Review:** After first 3 clients onboarded
