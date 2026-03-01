# Stripe Products & Payment Links - Post Market Pivot
**Date:** February 24, 2026
**Author:** Morgan (CFO)
**Status:** PENDING CREATION (Stripe CLI not configured - create via Stripe Dashboard)

---

## Overview

The old product/pricing structure is deprecated. All four previous products should be archived in Stripe (NOT deleted - keep for historical records). New products below replace them.

### Old Products (ARCHIVE THESE)

| Product | Status |
|---------|--------|
| Starter Sprint ($600) | ARCHIVE |
| Growth Retainer ($2,000/mo) | ARCHIVE |
| Automation Sprint ($7,500) | ARCHIVE |
| Enterprise - Fractional CTO ($5,000/mo) | ARCHIVE |

Old payment links can remain active temporarily for any in-progress deals, but should be deactivated within 30 days.

---

## New Products to Create in Stripe

### Product 1: AI Readiness Audit

**Stripe Product Settings:**
- Product name: `AI Readiness Audit`
- Description: `Comprehensive audit of your business operations to identify AI automation opportunities. Includes written report with prioritized recommendations and ROI projections.`
- Price: $500 (one-time)
- Tax behavior: Taxable (auto)
- Category: Professional Services

**Payment Link Settings:**
- Payment methods: Card, Apple Pay, Link, Cash App Pay
- Collect: billing address, phone number, email
- Custom field: "Business name and industry"
- Allow promotion codes: Yes
- Confirmation page: Custom (redirect to booking page for audit call)

---

### Product 2: AI Receptionist - Setup

**Stripe Product Settings:**
- Product name: `AI Receptionist - Setup`
- Description: `24/7 AI-powered phone and text system that answers calls, qualifies leads, books appointments, and never misses a customer. Includes voice agent, SMS auto-responder, CRM integration, and 30-day optimization.`

**Prices (create 3 price tiers):**
| Tier | Price | Notes |
|------|-------|-------|
| Standard | $1,500 | Single channel (phone OR text) |
| Professional | $2,250 | Multi-channel (phone + text + web chat) |
| Premium | $3,000 | Full suite (phone + text + web chat + CRM + review requests) |

- All prices: one-time
- Tax behavior: Taxable
- Payment methods: Card, Apple Pay, Link, ACH (encourage ACH for lower fees)

---

### Product 3: AI Receptionist - Monthly Service

**Stripe Product Settings:**
- Product name: `AI Receptionist - Monthly`
- Description: `Ongoing AI receptionist service including unlimited calls/texts, real-time monitoring, monthly performance reports, and continuous optimization.`

**Prices (create 3 subscription tiers):**
| Tier | Price | Billing |
|------|-------|---------|
| Standard | $300/mo | Monthly recurring |
| Professional | $400/mo | Monthly recurring |
| Premium | $500/mo | Monthly recurring |

- Billing cycle: Monthly
- Tax behavior: Taxable
- Collection method: Charge automatically
- Free trial: None (require 3-month minimum via terms)

---

### Product 4: Revenue Operations Sprint

**Stripe Product Settings:**
- Product name: `Revenue Operations Sprint`
- Description: `2-4 week intensive sprint to automate your lead-to-close-to-fulfill pipeline. Vertical-specific automation built for your industry.`

**Prices:**
| Tier | Price | Notes |
|------|-------|-------|
| Focused Sprint | $5,000 | 1 workflow/department, 2-week timeline |
| Standard Sprint | $10,000 | 2-3 workflows, 3-week timeline |
| Comprehensive Sprint | $15,000 | Full revenue pipeline, 4-week timeline |

- All prices: one-time
- Payment terms: 50% deposit upfront, 50% on delivery
- For deposit handling: Create $2,500 / $5,000 / $7,500 deposit prices AND full prices

**Deposit Prices (separate):**
| Tier | Deposit Price | Balance Price |
|------|-------------|---------------|
| Focused Sprint Deposit | $2,500 | $2,500 (invoiced on delivery) |
| Standard Sprint Deposit | $5,000 | $5,000 (invoiced on delivery) |
| Comprehensive Sprint Deposit | $7,500 | $7,500 (invoiced on delivery) |

---

### Product 5: AI Agent Development

**Stripe Product Settings:**
- Product name: `AI Agent Development`
- Description: `Custom AI agent built for your specific business needs. Includes chatbots, voice agents, internal tools, and complex workflow automation using n8n, Make, and LLM integrations.`

**Prices:**
| Tier | Price | Notes |
|------|-------|-------|
| Standard Agent | $7,500 | Single-purpose agent, 2-3 week build |
| Advanced Agent | $15,000 | Multi-capability agent, 3-4 week build |
| Enterprise Agent | $25,000 | Complex multi-agent system, 4-6 week build |

- All prices: one-time
- Payment terms: 50% deposit, 50% on delivery
- For high-value deals ($15K+): Use Stripe Invoicing for custom terms

**Deposit Prices:**
| Tier | Deposit | Balance |
|------|---------|---------|
| Standard Deposit | $3,750 | $3,750 |
| Advanced Deposit | $7,500 | $7,500 |
| Enterprise Deposit | $12,500 | $12,500 |

---

### Product 6: Automation-as-a-Service (AaaS)

**Stripe Product Settings:**
- Product name: `Automation-as-a-Service`
- Description: `Managed automation retainer. Ongoing monitoring, optimization, and expansion of your AI and automation stack. Includes dedicated hours for new builds, 24/7 system monitoring, and monthly strategy reviews.`

**Prices:**
| Tier | Price | Included Hours | Billing |
|------|-------|---------------|---------|
| Base | $2,000/mo | 10 hrs/mo | Monthly recurring |
| Professional | $3,500/mo | 18 hrs/mo | Monthly recurring |
| Premium | $5,000/mo | 28 hrs/mo | Monthly recurring |

- Billing cycle: Monthly, auto-charge
- Minimum commitment: 3 months (enforce via contract, not Stripe)
- Overage rate: $150/hr (bill via invoice)

---

## Payment Link Creation Checklist

Once products/prices are created in Stripe Dashboard:

- [ ] Create payment link for AI Readiness Audit ($500)
- [ ] Create payment link for AI Receptionist Setup - Standard ($1,500)
- [ ] Create payment link for AI Receptionist Setup - Professional ($2,250)
- [ ] Create payment link for AI Receptionist Setup - Premium ($3,000)
- [ ] Create payment link for AI Receptionist Monthly - Standard ($300/mo)
- [ ] Create payment link for AI Receptionist Monthly - Professional ($400/mo)
- [ ] Create payment link for AI Receptionist Monthly - Premium ($500/mo)
- [ ] Create payment link for Revenue Ops Sprint Deposit - Focused ($2,500)
- [ ] Create payment link for Revenue Ops Sprint Deposit - Standard ($5,000)
- [ ] Create payment link for Revenue Ops Sprint Deposit - Comprehensive ($7,500)
- [ ] Create payment link for AI Agent Development Deposit - Standard ($3,750)
- [ ] Create payment link for AI Agent Development Deposit - Advanced ($7,500)
- [ ] Create payment link for AaaS - Base ($2,000/mo)
- [ ] Create payment link for AaaS - Professional ($3,500/mo)
- [ ] Create payment link for AaaS - Premium ($5,000/mo)

**Total new payment links needed: 15**

---

## Payment Methods

Enable on all payment links:
- Card (Visa, Mastercard, Amex, Discover)
- Apple Pay
- Google Pay
- Link (Stripe's one-click checkout)
- Cash App Pay
- ACH Bank Transfer (for deals >$2,500 - saves 2.9% in card fees)

**Do NOT enable:**
- Klarna/Affirm for recurring products (creates complexity)
- Amazon Pay for recurring (limited subscription support)

---

## Tax Configuration

- Enable Stripe Tax on all products
- Tax category: "Software as a Service" or "Professional Services" (check with accountant)
- Auto-collect based on buyer location
- Tax reporting: Enable for 1099 compliance

---

## Notes

1. **Stripe CLI is not configured.** All products must be created via the Stripe Dashboard at https://dashboard.stripe.com
2. **Login:** contact@aurolly.com (ClawOps Stripe account)
3. **Archive old products** before creating new ones to avoid confusion
4. **Test mode first:** Create all products in test mode, verify payment flows, then switch to live mode
5. **Update this document** with actual payment link URLs and product IDs once created

---

*Document Owner: Morgan (CFO)*
*Created: February 24, 2026*
