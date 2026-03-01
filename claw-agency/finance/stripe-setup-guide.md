# Stripe Setup Guide for ClawOps

> Payment collection infrastructure | Free to set up

---

## Why Stripe

- Free to create an account (you only pay per transaction: 2.9% + $0.30)
- ACH bank transfers available at 0.8% (capped at $5) for lower fees
- Built-in recurring billing for Growth and Enterprise clients
- Professional checkout pages with no website needed
- Handles tax receipts and reporting automatically

---

## Step 1: Create Your Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click "Start now"
3. Enter your email: agentclaw08@icloud.com
4. Create a strong password
5. Verify your email address

## Step 2: Complete Business Profile

1. Go to **Settings > Account details**
2. Business type: Select "Individual/Sole Proprietor" (or LLC if formed)
3. Business name: **ClawOps**
4. Business website: Enter your site URL or social profile
5. Industry: "Computer software" or "Professional services"
6. Enter your legal name, SSN (or EIN if you have one), and date of birth
7. Enter your home address (or business address)

## Step 3: Connect Your Bank Account

1. Go to **Settings > Payouts > Bank accounts**
2. Add your business bank account (Mercury, Relay, or other)
3. Enter routing number and account number
4. Stripe will send two micro-deposits for verification (takes 1-2 days)
5. Verify the deposit amounts when they arrive
6. Set payout schedule: Daily (default) or Weekly

## Step 4: Set Up Branding

1. Go to **Settings > Branding**
2. Upload ClawOps logo
3. Set brand color
4. Set accent color
5. Add a favicon
6. This branding appears on all checkout pages, invoices, and receipts

## Step 5: Create Your Products

1. Go to **Product catalog > Add product**

**Product 1: Starter Package**
- Name: "ClawOps Starter - AI Automation Setup"
- Price: $500.00 (one-time)
- Description: "Single workflow automation setup with documentation and training"

**Product 2: Growth Plan**
- Name: "ClawOps Growth - Managed AI Automation"
- Price: $2,000.00 (recurring, monthly)
- Description: "2-3 managed automations, monitoring, monthly optimization, priority support"

**Product 3: Enterprise Plan**
- Name: "ClawOps Enterprise - Custom AI Systems"
- Price: Custom (create per client, $5,000-$15,000/mo recurring)
- Description: "Custom AI systems, API integrations, dedicated support, SLA"

## Step 6: Create Payment Links

1. Go to **Payment links > Create payment link**
2. Select a product (e.g., Starter Package)
3. Customize the checkout page:
   - Add a confirmation page message
   - Enable "Collect billing address"
   - Optionally enable "Allow promotion codes"
4. Click "Create link"
5. Copy the link and save it
6. Repeat for Growth Plan
7. Share these links directly with clients (no website required)

## Step 7: Enable ACH Payments (Lower Fees)

1. Go to **Settings > Payment methods**
2. Enable "ACH Direct Debit" (US bank transfers)
3. Fee: 0.8% capped at $5 per transaction
4. Recommend ACH for Growth and Enterprise clients to save on fees

**Fee comparison for a $2,000 Growth payment:**
- Card: $58.30 (2.9% + $0.30)
- ACH: $5.00 (0.8% capped)
- **Savings: $53.30/month per client**

## Step 8: Set Up Subscriptions for Recurring Clients

1. Go to **Customers > Add customer**
2. Enter client name and email
3. Go to **Billing > Subscriptions > Create subscription**
4. Select the customer
5. Add the Growth or Enterprise product
6. Set billing cycle start date
7. Click "Start subscription"
8. Client receives an email to enter payment method
9. Auto-charges monthly, sends receipts automatically

## Step 9: Configure Email Notifications

1. Go to **Settings > Emails**
2. Enable:
   - Successful payment receipts
   - Failed payment notifications
   - Upcoming renewal reminders
   - Invoice emails

## Step 10: Set Up the Customer Portal

1. Go to **Settings > Billing > Customer portal**
2. Enable the portal
3. Clients can:
   - Update payment methods
   - View invoice history
   - Download receipts
   - Cancel subscriptions (optional, you can disable this)

---

## Stripe Fees Summary for ClawOps Pricing

| Tier | Price | Card Fee | ACH Fee | Net (Card) | Net (ACH) |
|------|-------|----------|---------|------------|-----------|
| Starter | $500 | $14.80 | $4.00 | $485.20 | $496.00 |
| Growth | $2,000/mo | $58.30 | $5.00 | $1,941.70 | $1,995.00 |
| Enterprise ($5K) | $5,000/mo | $145.30 | $5.00 | $4,854.70 | $4,995.00 |
| Enterprise ($10K) | $10,000/mo | $290.30 | $5.00 | $9,709.70 | $9,995.00 |

**Always recommend ACH for recurring clients.**

---

## Quick Checklist

- [ ] Create Stripe account at stripe.com
- [ ] Complete identity verification
- [ ] Connect business bank account
- [ ] Upload ClawOps branding
- [ ] Create Starter, Growth, and Enterprise products
- [ ] Generate payment links for Starter and Growth
- [ ] Enable ACH payments
- [ ] Set up customer portal
- [ ] Test with a $1 payment to yourself (refund after)
- [ ] Save payment links for use in proposals and invoices

---

## Tips

- **Test mode:** Stripe has a test mode toggle at the top of the dashboard. Use it to test checkout flows before going live.
- **Stripe Tax:** Consider enabling Stripe Tax to auto-calculate sales tax if required in your state.
- **Disputes:** Keep signed contracts and proof of delivery. Stripe sides with evidence.
- **Reporting:** Use Stripe's built-in reports for monthly revenue tracking.
