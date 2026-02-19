# Invoicing Setup Guide

> Claw Agency | Payment Infrastructure

---

## Recommended Stack (Free Tier)

| Tool | Purpose | Cost |
|------|---------|------|
| **Stripe** | Payment processing | 2.9% + $0.30 per transaction |
| **Wave** | Free invoicing + accounting | Free |
| **PayPal Business** | Alternative payments | 2.89% + $0.49 per transaction |
| **Wise** | International payments | Low FX fees |

### Primary Recommendation: **Stripe + Wave**
- Stripe handles payments, Wave handles invoicing and bookkeeping — both free to start.

---

## Stripe Setup

### Step 1: Create Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up with business email
3. Select "Individual/Sole Proprietor" (or LLC if formed)
4. Enter SSN/EIN for tax reporting
5. Connect bank account for payouts

### Step 2: Configure for Agency Use
1. **Dashboard → Settings → Branding** — Add logo, brand color
2. **Settings → Payment Methods** — Enable cards, ACH bank transfer (lower fees: 0.8%)
3. **Settings → Customer Portal** — Enable so clients can manage subscriptions
4. **Billing → Products** — Create your tiers:
   - "Starter Automation Package" — $500 one-time
   - "Growth Plan" — $2,000/mo recurring
   - "Enterprise Plan" — Custom (create per-client)

### Step 3: Create Payment Links
1. **Payment Links** → Create link for each product
2. Share links directly — no website needed
3. Stripe hosts the checkout page

### Step 4: Subscriptions for Recurring Clients
1. **Billing → Subscriptions** → Create subscription
2. Attach to customer, set billing cycle
3. Auto-charges monthly, sends receipts

### Stripe Fees on Our Pricing
| Tier | Price | Stripe Fee | Net |
|------|-------|-----------|-----|
| Starter | $500 | $14.80 | $485.20 |
| Growth/mo | $2,000 | $58.30 | $1,941.70 |
| Enterprise | $5,000 | $145.30 | $4,854.70 |

**Tip:** For Growth/Enterprise, offer ACH payments — fee drops to 0.8% capped at $5.

---

## Wave Setup (Free Invoicing)

### Step 1: Create Account
1. Go to [waveapps.com](https://www.waveapps.com)
2. Sign up, create business profile
3. Add business name, address, logo

### Step 2: Create Invoice Template
1. **Sales → Invoices → Create Invoice**
2. Set payment terms: Net 15 (due in 15 days)
3. Add line items matching your service tiers
4. Enable online payments (connects to Stripe or Wave Payments)

### Step 3: Automate
- Set up recurring invoices for Growth/Enterprise clients
- Enable automatic payment reminders (3 days before, day of, 3 days after)

---

## Invoice Template

```
┌─────────────────────────────────────────────┐
│  CLAW AGENCY                                │
│  AI Automation Services                     │
│  [Your Address]                             │
│  [Email] | [Phone]                          │
├─────────────────────────────────────────────┤
│  INVOICE                                    │
│                                             │
│  Invoice #: CLA-2026-001                    │
│  Date: February 19, 2026                    │
│  Due Date: March 5, 2026                    │
│                                             │
│  Bill To:                                   │
│  [Client Name]                              │
│  [Client Company]                           │
│  [Client Address]                           │
│  [Client Email]                             │
├─────────────────────────────────────────────┤
│  Description              Qty    Amount     │
│  ─────────────────────────────────────────  │
│  Growth Plan - Monthly       1   $2,000.00  │
│  AI Automation Management                   │
│  (March 2026)                               │
│                                             │
│  Additional: Custom chatbot  1     $500.00  │
│  integration (one-time)                     │
│  ─────────────────────────────────────────  │
│                    Subtotal:    $2,500.00    │
│                    Tax (0%):        $0.00    │
│                    ─────────────────────     │
│                    TOTAL:       $2,500.00    │
├─────────────────────────────────────────────┤
│  Payment Methods:                           │
│  • Stripe: [payment link]                   │
│  • ACH Transfer: [bank details]             │
│  • PayPal: [email]                          │
│                                             │
│  Terms: Net 15 | Late fee: 1.5%/month       │
└─────────────────────────────────────────────┘
```

---

## Invoice Numbering Convention
- Format: `CLA-YYYY-###`
- Sequential per year: CLA-2026-001, CLA-2026-002, etc.

## Payment Terms
- **Starter:** Due on receipt (payment link before work starts)
- **Growth:** Net 15, auto-billed via Stripe subscription preferred
- **Enterprise:** Net 30, custom invoicing

## Late Payment Policy
- Reminder at due date
- 1.5% monthly late fee after 15 days
- Pause services after 30 days overdue
