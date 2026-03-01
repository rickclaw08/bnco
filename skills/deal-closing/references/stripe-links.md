# Stripe Payment Links

Payment link configuration and management for RickClaw AI.

---

## Current Links

> **Note:** Create payment links as deals close. Update this file with each new link.

### Standard Payment Links

| Tier | Amount | Link | Status |
|------|--------|------|--------|
| Starter Basic | $500 | [TBD - create when needed] | Not created |
| Starter Standard | $1,000 | [TBD - create when needed] | Not created |
| Starter Premium | $1,500 | [TBD - create when needed] | Not created |
| Professional | Custom | Create per-deal | As needed |
| Enterprise | Custom | Create per-deal | As needed |
| Custom | Custom | Create per-deal | As needed |

### Custom Links Created

| Date | Client | Amount | Link | Status |
|------|--------|--------|------|--------|
| | | | | |

---

## Stripe Setup

### Account Details
- Account: [TBD - set up when ready]
- Dashboard: https://dashboard.stripe.com
- Mode: [Test / Live]

### Creating Payment Links

#### Via Stripe Dashboard
1. Go to https://dashboard.stripe.com/payment-links
2. Click "New" or "+ Create payment link"
3. Add product or enter custom amount
4. Set payment options:
   - One-time or recurring
   - Currency: USD
   - Allow customer to adjust quantity: No
5. Copy the link
6. Update this file with the new link

#### Link Naming Convention
- Product name format: "RickClaw AI - [Tier] - [Client/Description]"
- Examples:
  - "RickClaw AI - Starter - Chatbot Setup"
  - "RickClaw AI - Professional - Lead Gen Pipeline"
  - "RickClaw AI - Enterprise Retainer - March 2026"

### Payment Settings
- Default currency: USD
- Receipt emails: Automatic via Stripe
- Success page: Default Stripe confirmation

---

## Payment Terms by Tier

| Tier | Payment Structure | Terms |
|------|------------------|-------|
| Starter | 100% upfront | Due immediately |
| Professional | 50% upfront, 50% on delivery | Net 15 each |
| Enterprise | Monthly on the 1st | Net 7 |
| Custom | 30/30/30/10 milestone-based | Net 15 each |

---

## Refund Policy

- **Before work starts:** Full refund within 48 hours
- **Work in progress:** Pro-rated based on completion
- **After delivery:** No refunds (revision rounds available)
- **Enterprise retainer:** Cancel with 30-day notice, no refund for current month

---

## TODO

- [ ] Set up Stripe account (if not done)
- [ ] Create standard Starter payment links ($500, $1,000, $1,500)
- [ ] Configure automatic receipts
- [ ] Set up webhook notifications (optional)
