# Day 1 Implementation Checklist - ClawOps

## ✅ Hour 1-2: Domain & Accounts
- [ ] Register clawops.com (or available variant)
- [ ] Create Stripe account
- [ ] Create Carrd account ($19/year)
- [ ] Create Tally account (free)
- [ ] Create Make.com account (free tier)
- [ ] Create Discord server

## ✅ Hour 2-4: Stripe Products
- [ ] Create product: DIY Kit ($97)
  - Description: "OpenClaw DIY Installation Kit"
  - Create payment link
- [ ] Create product: Done With You ($297)
  - Description: "OpenClaw Guided Setup Session"
  - Create payment link
- [ ] Create product: Done For You ($997)
  - Description: "OpenClaw Complete Installation Service"
  - Create payment link
- [ ] Create product: Monthly Care ($197/mo)
  - Description: "OpenClaw Maintenance & Support"
  - Set as subscription
  - Create payment link
- [ ] Set up webhook to Make.com

## ✅ Hour 4-6: Landing Page (Carrd)
- [ ] Create new site
- [ ] Copy in landing page content from `/landing-page-copy.md`
- [ ] Add Stripe payment buttons:
  - DIY Kit → Stripe link
  - Done With You → Stripe link  
  - Done For You → Stripe link
  - Monthly Care → Stripe link
- [ ] Add "Paste Your Error" form → Webhook to Make
- [ ] Set up custom domain
- [ ] Test all payment links

## ✅ Hour 6-7: Intake Form (Tally)
- [ ] Create new form: "ClawOps Intake"
- [ ] Add all fields from `/intake-form-structure.md`
- [ ] Set up conditional logic (SSH page for DFY only)
- [ ] Configure webhook to Make.com
- [ ] Style with ClawOps branding
- [ ] Test form submission

## ✅ Hour 7-8: Basic Automation (Make.com)
- [ ] Create webhook: Stripe purchases
- [ ] Create webhook: Tally form submissions
- [ ] Build basic flow:
  1. Stripe webhook triggers
  2. Identify product tier
  3. Send confirmation email
  4. Generate intake form link
  5. Wait for form submission
- [ ] Set up Gmail/SendGrid for emails
- [ ] Use email templates from `/email-templates.md`
- [ ] Test purchase → email flow

## 🎯 End of Day 1 Success Criteria:
- [ ] Can purchase all 4 products
- [ ] Receive confirmation email after purchase
- [ ] Email contains intake form link
- [ ] Form submission captures all data
- [ ] Test purchase works end-to-end

## 📝 Quick Wins to Add (If Time):
- [ ] Discord server basic setup (just categories)
- [ ] Fix library in Notion (import JSON)
- [ ] Redirect clawops.com → Carrd site

## 🚀 Ready for Day 2:
- Tomorrow: Discord setup, Fix Library, Triage Agent
- Day 3: Calendar booking, fulfillment docs

---

**Remember:** Done is better than perfect. Get the payment flow working first, polish later.

**Test Card:** 4242 4242 4242 4242 (any future date, any CVC)