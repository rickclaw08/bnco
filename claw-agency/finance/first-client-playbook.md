# First Client Playbook - Lead to Paid Invoice

**Owner:** Morgan (CFO, ClawOps)
**Version:** 2.0
**Purpose:** Step-by-step process from first contact to money in the bank. Follow this exactly.

---

## Overview

Total time from lead to first payment: 3-10 business days (Starter/Growth) or 7-21 business days (Sprint/Enterprise)

**The 7 stages:**
1. Lead Capture
2. Qualification
3. Discovery Call
4. Proposal and Pricing
5. Contract Signing
6. Payment Collection
7. Onboarding and Kickoff

---

## Stage 1: Lead Capture

**Goal:** Get the prospect's name, company, email, and what they need.

**Inbound leads (they came to you):**
- Respond within 2 hours during business hours
- Use this template:

> Hi [Name], thanks for reaching out. I'd love to learn more about what you're working on. Do you have 20 minutes this week for a quick call? Here are some times that work: [link to Calendly or 2-3 specific times].

**Outbound leads (you found them):**
- Personalize every message. Reference something specific about their company or product.
- Keep it under 100 words. One clear ask: get on a call.
- Use this template:

> Hi [Name], I saw [specific thing about their company/product]. We help companies like yours [specific outcome]. Would you be open to a 20-minute call to see if there's a fit? No pressure either way.

**Where to track:** Add every lead to the pipeline tracker immediately. Fields: Name, Company, Source, Date, Package Interest (if known), Stage (set to "Lead").

---

## Stage 2: Qualification

**Goal:** Determine if this prospect is worth a discovery call. Not every lead is a fit.

**Qualify on these criteria:**

| Criteria | Green Light | Red Flag |
|----------|-------------|----------|
| Budget | Can afford at least Starter ($600) | "We have no budget right now" |
| Timeline | Needs something in the next 30 days | "Maybe in 6 months" |
| Decision maker | You're talking to the person who can sign | "I need to check with my boss's boss" |
| Technical fit | We can actually deliver what they need | Needs hardware, physical products, regulated industries we lack expertise in |
| Communication | Responsive, clear about what they want | Disappears for days, can't articulate the problem |

**If qualified:** Move to Discovery Call (Stage 3)
**If not qualified:** Send a polite "not a fit right now" message. Keep them on a nurture list for future outreach.

---

## Stage 3: Discovery Call

**Goal:** Understand the problem, determine the right package, build trust.

**Duration:** 20-30 minutes

**Before the call:**
- Research the prospect's company (website, LinkedIn, product)
- Review any messages exchanged
- Have the pricing packages doc open for reference

**Call Structure:**

1. **Opening (2 min):** Introductions, confirm the agenda. "I want to understand what you're trying to build and see if we can help."

2. **Their story (10 min):** Ask these questions:
   - "What's the project or problem you're trying to solve?"
   - "What have you tried so far?"
   - "What does success look like for you?"
   - "What's your timeline for getting this done?"
   - "Is there a budget range you're working within?"

3. **Our fit (5 min):** Based on what they shared, explain which package fits and why. Be specific:
   - "Based on what you've described, our Sprint package at $10K would cover [specific deliverables]. Here's what that looks like..."

4. **Next steps (3 min):** Always end with a clear next step:
   - "I'll send you a proposal by [date]. Once you review it, we can hop on a quick call to discuss, or if it looks good, I'll send the contract."

**After the call:**
- Send a follow-up email within 2 hours summarizing what was discussed and the proposed next step
- Update the pipeline tracker: Stage = "Discovery Complete," add notes
- Draft the proposal

---

## Stage 4: Proposal and Pricing

**Goal:** Send a clear, professional proposal that makes it easy to say yes.

**Proposal contents:**
1. Summary of their problem (shows you listened)
2. Proposed solution (what we'll build/do)
3. Package and pricing (link to relevant tier)
4. Timeline (when they'll have it)
5. What we need from them (access, content, decisions)
6. Next steps (sign contract, pay deposit)

**Proposal format:** Google Doc, Notion page, or clean PDF. Keep it under 2 pages.

**Sending the proposal:**
- Email subject: "ClawOps Proposal - [Project Name]"
- Brief email body: "Here's the proposal we discussed. Happy to jump on a call if you have questions, or if everything looks good, I can send the contract today."
- Attach or link the proposal

**Follow-up cadence:**
- Day 2: "Just checking if you had a chance to review the proposal"
- Day 5: "Wanted to circle back on this. Any questions I can answer?"
- Day 10: "I want to make sure this doesn't fall through the cracks. Are you still interested in moving forward?"
- Day 14: Final follow-up. "I'll close this out on my end, but feel free to reach out anytime if the timing is better later."

**Pipeline update:** Stage = "Proposal Sent"

---

## Stage 5: Contract Signing

**Goal:** Get a signed agreement before any work begins.

**Contract essentials (every contract must include):**
1. Scope of work (specific deliverables from the relevant package)
2. Timeline (start date, milestones, delivery date)
3. Pricing and payment terms (per package terms in payment-terms.md)
4. Intellectual property (client owns all deliverables upon full payment)
5. Confidentiality (mutual NDA terms)
6. Termination clause (per package terms)
7. Limitation of liability (capped at total contract value)
8. Signatures from both parties

**Signing tools (in order of preference):**
1. **DocuSign** - Professional, legally binding, audit trail
2. **HelloSign** (Dropbox Sign) - Free tier available, clean UX
3. **PandaDoc** - Includes proposal and contract in one flow
4. **Email agreement** - For Starter packages only. Client replies "I agree to the terms" to a clearly stated scope and price email. Screenshot and save.

**Process:**
1. Fill in the contract template with project-specific details
2. Send via signing tool with a clear subject line
3. Set a 3-day expiration on the signing request
4. Follow up same day if not signed within 24 hours

**Pipeline update:** Stage = "Contract Sent" then "Contract Signed"

---

## Stage 6: Payment Collection

**Goal:** Money in the bank before work starts (or per payment terms).

### Stripe Payment Link Setup

**One-time setup (do this once):**

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Activate your account (verify identity, add bank account for payouts)
3. Go to Settings > Business > Public Details. Set business name to "ClawOps"

**Creating a payment link for each package:**

1. Go to Stripe Dashboard > Payment Links (or Products > Payment Links)
2. Click "+ Create payment link"
3. For the product:
   - **Name:** "ClawOps Starter Package" (or Growth, Sprint, Enterprise)
   - **Price:** $600 (or relevant amount)
   - For retainers: Set as "Recurring" with monthly billing
   - For one-time: Set as "One time"
4. Under "After payment," set the confirmation page message: "Thank you! We'll be in touch within 24 hours to kick off your project."
5. Click "Create link"
6. Copy the link and save it in your payment links reference doc

**Payment links to create:**

| Package | Type | Amount | Link Name |
|---------|------|--------|-----------|
| Starter | One-time | $600 | clawops-starter |
| Growth | Recurring/monthly | $2,000 | clawops-growth |
| Sprint Standard (deposit) | One-time | $3,750 | clawops-sprint-std-deposit |
| Sprint Standard (final) | One-time | $3,750 | clawops-sprint-std-final |
| Sprint Complex (deposit) | One-time | $5,000 | clawops-sprint-complex-deposit |
| Sprint Complex (final) | One-time | $5,000 | clawops-sprint-complex-final |
| Sprint Premium (deposit) | One-time | $7,500 | clawops-sprint-premium-deposit |
| Sprint Premium (final) | One-time | $7,500 | clawops-sprint-premium-final |
| Enterprise | Recurring/monthly | $5,000 | clawops-enterprise |

**Sending the payment request:**

1. Generate the invoice using the invoice template (see invoicing/invoice-template.md)
2. Include the Stripe payment link in the invoice
3. Email the invoice with subject: "ClawOps Invoice CLW-YYYY-NNNN"
4. Body: "Attached is your invoice for [description]. You can pay securely online using the link in the invoice, or via ACH/wire per the instructions provided. Let me know if you have any questions."

**Confirming payment:**
- Stripe sends automatic email confirmations
- Check Stripe dashboard daily for new payments
- Once payment is confirmed, send a personal thank-you email within same business day
- Update pipeline: Stage = "Paid"

---

## Stage 7: Onboarding and Kickoff

**Goal:** Start delivering value immediately. The faster they see results, the better.

### Onboarding Checklist

Complete within 24-48 hours of payment:

**For ALL packages:**
- [ ] Send welcome email with onboarding details
- [ ] Add client to project management board (Linear, Trello, or GitHub Projects)
- [ ] Create dedicated Slack/Discord channel (or establish communication channel)
- [ ] Share relevant documentation and process overview
- [ ] Schedule kickoff call

**Additional for Growth/Enterprise:**
- [ ] Set up recurring calendar events (weekly syncs)
- [ ] Request access to client's codebase, staging environments, and relevant tools
- [ ] Create shared document for running notes and decisions
- [ ] Send "Week 1 Plan" outlining what gets done first

**Additional for Sprint:**
- [ ] Finalize and share the scoping document
- [ ] Set milestone dates and share the project timeline
- [ ] Identify any blockers or dependencies and flag immediately
- [ ] Schedule mid-project check-in call

**Additional for Enterprise:**
- [ ] Schedule 2x weekly sync calls
- [ ] Request introductions to key team members
- [ ] Begin technology assessment (first deliverable)
- [ ] Draft initial 90-day roadmap outline

### Welcome Email Template

Subject: "Welcome to ClawOps - Let's get started"

> Hi [Name],
>
> Welcome aboard! We're excited to work with you.
>
> Here's what happens next:
>
> 1. **Kickoff Call:** [Date/Time] - [Calendar link]
> 2. **Communication:** I've set up [Slack channel/Discord/email thread] for ongoing communication
> 3. **Project Board:** You can track progress here: [link]
>
> Before our kickoff call, it would be helpful if you could:
> - [Share access to relevant accounts/repos]
> - [Provide any existing documentation or designs]
> - [Confirm key stakeholders and their roles]
>
> Looking forward to building something great together.
>
> Best,
> [Your Name]
> ClawOps

### Kickoff Call Agenda (30-60 minutes)

1. Introductions and working style preferences (5 min)
2. Review scope and deliverables (10 min)
3. Walk through timeline and milestones (10 min)
4. Discuss communication preferences and cadence (5 min)
5. Identify immediate priorities and first tasks (10 min)
6. Q&A and next steps (5 min)

---

## Quick Reference: Lead to Cash Timeline

### Starter ($600)
| Day | Action |
|-----|--------|
| Day 0 | Lead captured |
| Day 0-1 | Qualification |
| Day 1-2 | Discovery call |
| Day 2-3 | Proposal sent (or verbal agreement for Starter) |
| Day 3-4 | Contract signed (email agreement OK) |
| Day 3-4 | Payment collected (full, via Stripe) |
| Day 4-5 | Kickoff and work begins |
| Day 7-9 | Delivery |

### Growth ($2,000/mo)
| Day | Action |
|-----|--------|
| Day 0 | Lead captured |
| Day 0-1 | Qualification |
| Day 1-3 | Discovery call |
| Day 3-5 | Proposal sent |
| Day 5-7 | Contract signed |
| Day 5-7 | First month payment collected |
| Day 7-8 | Onboarding and kickoff |
| Day 8+ | Work begins |

### Sprint ($7.5K-$15K)
| Day | Action |
|-----|--------|
| Day 0 | Lead captured |
| Day 0-1 | Qualification |
| Day 1-5 | Discovery call |
| Day 5-7 | Proposal sent |
| Day 7-14 | Contract signed |
| Day 7-14 | 50% deposit collected |
| Day 14-15 | Kickoff |
| Day 15-45 | Build and deliver |
| Day 45 | Final 50% collected |

### Enterprise ($5K/mo)
| Day | Action |
|-----|--------|
| Day 0 | Lead captured |
| Day 0-1 | Qualification |
| Day 1-7 | Discovery call(s), possibly multiple stakeholders |
| Day 7-10 | Proposal sent |
| Day 10-21 | Contract signed |
| Day 10-21 | First month payment collected |
| Day 21-22 | Onboarding and kickoff |
| Day 22+ | Engagement begins |

---

## Common Mistakes to Avoid

1. **Starting work before payment.** Never. Not even "just a little bit." Payment first, work second.
2. **Vague scope.** If the client can't describe what they want in concrete terms, you're not ready for a contract. Go back to discovery.
3. **Skipping the contract.** Even for $600 Starter packages, get written agreement on scope, price, and terms.
4. **Slow follow-up.** Every day you wait to respond is a day the prospect's enthusiasm cools. Respond same day.
5. **Discounting on the first ask.** Hold pricing. Offer value adds instead (extra revision round, extended warranty, priority scheduling).
6. **Not asking for referrals.** After every successful delivery, ask: "Do you know anyone else who might benefit from what we do?"

---

## Revenue Impact Tracker

After each client closes, log:

| Field | Value |
|-------|-------|
| Client name | |
| Package | |
| Revenue | |
| Source (how they found us) | |
| Days from lead to payment | |
| Referral potential (1-5) | |
| Upsell potential (which tier) | |

This data feeds back into the sprint plan for forecasting and pipeline optimization.

---

*Follow this playbook exactly for the first 10 clients. After that, refine based on what you learn. But for now, follow the process.*

*Reviewed and approved by Morgan, CFO - ClawOps*
