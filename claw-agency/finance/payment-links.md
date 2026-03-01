# ClawOps Payment Links and Invoice Templates

## Overview

This document contains exact Stripe product configurations, payment link setups, and invoice templates for all ClawOps service tiers.

## Stripe Products to Create

### Product 1: ClawOps Starter Plan

**Setup in Stripe:**
1. Go to Products > Add product (in Live mode)
2. Fill in:
   - **Name:** ClawOps Starter Plan
   - **Description:** Monthly AI automation service. Includes custom AI agent, workflow automation, and basic support.
   - **Pricing model:** Recurring
   - **Price:** $600.00 USD
   - **Billing period:** Monthly
   - **Currency:** USD
3. Click "Add pricing" if you want annual option:
   - **Price:** $6,000.00 USD ($500/month, save $1,200/year)
   - **Billing period:** Yearly
4. Click "Save product"

**Product ID:** Copy the product ID (starts with `prod_`) for your records

### Product 2: ClawOps Growth Plan

**Setup in Stripe:**
1. Go to Products > Add product
2. Fill in:
   - **Name:** ClawOps Growth Plan
   - **Description:** Advanced AI automation for growing businesses. Includes multiple agents, advanced integrations, CRM setup, and priority support.
   - **Pricing model:** Recurring
   - **Price:** $2,000.00 USD
   - **Billing period:** Monthly
   - **Currency:** USD
3. Add annual pricing:
   - **Price:** $20,000.00 USD ($1,667/month, save $4,000/year)
   - **Billing period:** Yearly
4. Click "Save product"

### Product 3: ClawOps Enterprise Plan

**Setup in Stripe:**
1. Go to Products > Add product
2. Fill in:
   - **Name:** ClawOps Enterprise Plan
   - **Description:** Custom AI infrastructure for established businesses. Fully tailored solution with dedicated support, custom integrations, and white-glove service.
   - **Pricing model:** Recurring (you'll adjust price per client)
   - **Price:** $5,000.00 USD (starting price)
   - **Billing period:** Monthly
   - **Currency:** USD
3. Click "Save product"

**Note:** For Enterprise, you'll create custom quotes per client. Use this as a template and adjust pricing during checkout or invoice creation.

### Product 4: One-Time Setup Fee (Optional)

**Setup in Stripe:**
1. Go to Products > Add product
2. Fill in:
   - **Name:** ClawOps Setup & Onboarding
   - **Description:** One-time setup fee for initial system configuration, agent training, and workflow implementation.
   - **Pricing model:** One-time
   - **Price:** $500.00 USD (adjust as needed)
   - **Currency:** USD
3. Click "Save product"

**Use case:** Charge this separately for clients who need heavy initial setup.

## Payment Links

Payment links let clients pay without you building a checkout page. Perfect for fast deals.

### Creating Payment Links

**Starter Plan Payment Link:**
1. Go to Payment links > New
2. Select product: "ClawOps Starter Plan"
3. Choose pricing: $600/month
4. Configure:
   - **Collect customer addresses:** No (unless you need it for tax)
   - **Collect phone numbers:** Yes (good for support)
   - **Allow promotion codes:** Yes (for discounts)
   - **Require billing address:** No
5. Click "Create link"
6. Copy the link (looks like: `https://buy.stripe.com/...`)
7. Save it: **Starter Link:** [paste here]

**Growth Plan Payment Link:**
1. Go to Payment links > New
2. Select product: "ClawOps Growth Plan"
3. Choose pricing: $2,000/month
4. Same settings as Starter
5. Click "Create link"
6. Save it: **Growth Link:** [paste here]

**Enterprise Plan Payment Link:**
1. For Enterprise, use custom invoices instead (see below)
2. Or create a payment link with adjustable quantity:
   - Go to Payment links > New
   - Select "ClawOps Enterprise Plan"
   - Enable "Customer chooses quantity" > set to price per unit $1,000
   - Set quantity limits: 5 min, 15 max
   - This lets you send a link like: buy.stripe.com/...?quantity=8 ($8,000)

### Customizing Payment Links

**Add your branding:**
1. Go to Settings > Branding
2. Upload logo
3. Choose brand colors
4. Save

Payment links will now show your branding at checkout.

## Invoice Templates

Invoices are better for Enterprise clients, contract work, and when you need to send before payment.

### Invoice Template: Starter Plan

**Create in Stripe:**
1. Go to Invoices > Create invoice
2. Fill in:
   - **Customer:** Add new customer (email required)
   - **Items:**
     - ClawOps Starter Plan: $600.00 (recurring monthly)
   - **Memo:** "Thank you for choosing ClawOps! Your Starter Plan includes a custom AI agent, workflow automation, and email support. Billing cycle begins on [date]."
3. Set payment terms:
   - **Due date:** Net 15 (or Due on receipt for immediate payment)
4. Enable "Automatically charge" if customer saved a payment method
5. Click "Review invoice" > "Send invoice"

**Invoice will include:**
- Auto-generated invoice number
- Your business details (from Stripe settings)
- Itemized charges
- Payment link (customer clicks to pay)
- PDF attachment

### Invoice Template: Growth Plan

**Create in Stripe:**
1. Go to Invoices > Create invoice
2. Fill in:
   - **Customer:** Add new customer
   - **Items:**
     - ClawOps Growth Plan: $2,000.00 (recurring monthly)
     - (Optional) ClawOps Setup & Onboarding: $500.00 (one-time)
   - **Memo:** "Welcome to ClawOps Growth Plan! Your package includes multiple AI agents, advanced integrations, CRM setup, and priority support. Setup begins immediately upon payment."
3. Set payment terms: Net 15 or Due on receipt
4. Click "Review invoice" > "Send invoice"

### Invoice Template: Enterprise Plan (Custom Quote)

**Create in Stripe:**
1. Go to Invoices > Create invoice
2. Fill in:
   - **Customer:** Add new customer
   - **Items:** (Customize per client)
     - ClawOps Enterprise Base Service: $5,000.00
     - Additional AI Agents (x2): $1,500.00
     - Custom Integration (Salesforce): $1,000.00
     - Dedicated Support: $500.00
     - **Total:** $8,000.00/month
   - **Memo:** "Custom Enterprise solution for [Client Name]. Includes [specific deliverables]. Dedicated account manager: [your name/email]. Billing begins [date]."
3. Add notes:
   - "This is a month-to-month agreement. Either party may cancel with 30 days written notice."
   - "Setup and onboarding included in first month."
4. Set payment terms: Net 30 (Enterprise clients often need longer terms)
5. Click "Review invoice" > "Send invoice"

### Recurring Invoice Automation

**Set up automatic recurring invoices:**
1. Go to Customers > Select customer
2. Click "Add subscription"
3. Choose product (Starter, Growth, or Enterprise)
4. Set billing cycle: Monthly, starting [date]
5. Enable "Automatically charge" (if card on file)
6. Click "Start subscription"

Stripe will automatically:
- Generate invoices each month
- Charge the customer
- Send receipts
- Handle payment failures (retry logic + email notifications)

## Discount Codes (Promotion Codes)

**Create a discount for early customers:**
1. Go to Coupons > New
2. Fill in:
   - **Name:** EARLYADOPTER
   - **Type:** Percentage discount
   - **Discount:** 20% off
   - **Duration:** 3 months (or forever)
3. Click "Save"
4. Go to Promotion codes > New
5. Link to coupon "EARLYADOPTER"
6. Code: EARLYADOPTER (or auto-generate)
7. Restrictions:
   - Max redemptions: 10 (limit to first 10 customers)
   - Expiration: Set date if needed
8. Click "Save"

**Share the code:** Customers enter it at checkout on payment links or invoices.

## Payment Link + Invoice Quick Reference

| Tier | Monthly Price | Annual Price | Payment Link | Use Case |
|------|---------------|--------------|--------------|----------|
| Starter | $600 | $6,000 ($500/mo) | [Create in Stripe] | Fast self-service signup |
| Growth | $2,000 | $20,000 ($1,667/mo) | [Create in Stripe] | Mid-market clients |
| Enterprise | $5,000-$15,000 | Custom | Custom invoice | Large accounts, custom terms |

## Email Templates for Sending Payment Links

### Starter Plan Email

**Subject:** Your ClawOps Starter Plan - Ready to Go!

Hi [Client Name],

Welcome to ClawOps! I'm excited to get your AI automation up and running.

Here's your payment link to activate your Starter Plan ($600/month):
[Insert Stripe payment link]

What's included:
- Custom AI agent built for your workflow
- Email + calendar automation
- Basic integrations
- Email support (24-hour response time)

Once you complete payment, I'll send your onboarding calendar link to schedule our kickoff call.

Questions? Just reply to this email.

Looking forward to working together!

Brand
ClawOps
[your email]

---

### Growth Plan Email

**Subject:** ClawOps Growth Plan - Let's Scale Your Business

Hi [Client Name],

Thrilled to have you joining ClawOps Growth Plan!

Here's your payment link to get started ($2,000/month):
[Insert Stripe payment link]

Your Growth Plan includes:
- 3 custom AI agents (assistant, sales, support)
- CRM integration + setup (HubSpot, Pipedrive, or your choice)
- Advanced workflow automation
- Priority support (4-hour response time)
- Monthly strategy call

Setup fee: Waived for you (normally $500).

After payment, I'll reach out within 24 hours to schedule your onboarding session.

Ready to grow!

Brand
ClawOps

---

### Enterprise Plan Email (Custom Quote)

**Subject:** ClawOps Enterprise Proposal - Custom AI Infrastructure

Hi [Client Name],

Thank you for the detailed conversation about your needs. I've put together a custom Enterprise solution for [Company Name].

**Your Custom Package:**
- 5 specialized AI agents (sales, support, operations, data, executive assistant)
- Full Salesforce integration + custom workflows
- Dedicated Slack channel with your team
- White-glove onboarding (2-week intensive setup)
- Dedicated account manager (me!)
- Monthly business review calls

**Investment:** $8,000/month (month-to-month, 30-day cancellation notice)

Here's your invoice to review and approve:
[Insert Stripe invoice link]

Payment terms: Net 30 from invoice date.

We'll begin setup immediately upon payment, with a target go-live date of [date].

I'm confident this will transform how your team operates. Let me know if you have any questions or want to adjust the scope.

Best,
Brand
ClawOps
[your email]
[calendar link]

---

## Post-Payment Automation

**Set up automatic emails after payment:**
1. Use Stripe webhook to trigger email (requires Zapier or custom code)
2. Or manually: Check Stripe dashboard daily for new payments, send onboarding email

**Recommended onboarding email:**
- Thank customer
- Confirm what they purchased
- Send calendar link for kickoff call
- Provide next steps
- Give them your contact info

## Testing Your Setup

**Before going live:**
1. Switch to Test mode in Stripe
2. Create a test payment link
3. Use test card: 4242 4242 4242 4242, any future date, any CVC
4. Complete a test purchase
5. Verify you received:
   - Payment confirmation in Stripe
   - Email receipt (if enabled)
6. Check that funds appear in your balance

**Then switch to Live mode and create real products/links.**

## Quick Action Checklist

- [ ] Create all 4 products in Stripe (Starter, Growth, Enterprise, Setup Fee)
- [ ] Generate payment links for Starter and Growth
- [ ] Create invoice templates for all tiers
- [ ] Set up at least one discount code (EARLYADOPTER or similar)
- [ ] Enable automatic receipts (Settings > Emails > Receipts)
- [ ] Write and save email templates for sending payment links
- [ ] Test the full payment flow in Test mode
- [ ] Add payment links to your website or proposals

---

**Pro tip:** Save your payment links in a note or document you can quickly access. When a client says "I'm ready," you can send the link immediately. Speed = more closed deals.

**Stripe Dashboard:** https://dashboard.stripe.com
