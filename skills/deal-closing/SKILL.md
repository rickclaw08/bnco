# Deal Closing

**Version:** 0.1.0
**Owner:** Morgan (CFO)
**Description:** Generate proposals, contracts, and invoices to close deals. Handle the full paperwork flow from qualified lead to paying client.

## Trigger Keywords

- "send proposal"
- "create invoice"
- "draft contract"
- "close deal"
- "generate proposal"
- "payment link"
- "quote for"
- "pricing for client"

## When to Use

Use this skill when:
- A qualified lead is ready for a proposal
- A client has agreed to terms and needs a contract
- Work is completed and an invoice is needed
- A deal needs the final push to close (proposal + follow-up)

## Prerequisites

Before closing a deal, ensure:
1. Lead is qualified (Jordan/CRO has vetted them)
2. Scope is defined (what we're building/delivering)
3. Tier is selected (see `references/proposal-templates.md`)
4. Client contact info is available (name, email, company)

## Workflow

### Step 1: Determine Deal Stage

| Stage | Action Needed |
|-------|--------------|
| Qualified lead, no proposal yet | Generate proposal |
| Proposal sent, awaiting response | Follow up |
| Client said yes | Generate contract |
| Contract signed | Generate invoice + payment link |
| Payment received | Confirm and kick off delivery |

### Step 2: Select the Right Tier

Review the client's needs against our 4 tiers:

- **Starter ($500-$1,500):** Single automation, quick win, 1-3 days
- **Professional ($2,500-$7,500):** Multi-step system, 1-2 weeks
- **Enterprise ($10K-$25K/mo):** Ongoing retainer, dedicated support
- **Custom ($25K+):** Large build, strategic partnership

See `references/proposal-templates.md` for full proposal text per tier.

### Step 3: Generate the Proposal

1. Open the appropriate template from `references/proposal-templates.md`
2. Fill in client-specific details:
   - Client name and company
   - Specific problem they described
   - Our proposed solution (tailored to their use case)
   - Deliverables list
   - Timeline
   - Price (from tier, adjusted if needed)
   - Payment terms
3. Add any custom sections (case studies, testimonials if available)
4. Include next steps and call-to-action

#### Proposal Formatting Rules
- Keep it under 2 pages for Starter/Professional
- Use bullet points, not paragraphs
- Lead with their problem, then our solution
- End with clear pricing and next steps
- Never send without a specific price (no "starting at")

### Step 4: Attach Payment Method

For invoicing and payment:
1. Check `references/stripe-links.md` for existing payment links
2. If a new link is needed, note the amount and create one
3. Include payment link in the proposal or invoice
4. Specify payment terms clearly (Net 15 recommended for new clients)

### Step 5: Send the Proposal

Delivery methods (in order of preference):
1. **Email** - Professional, trackable, standard
2. **Direct message** - If relationship is informal (Upwork, Discord)
3. **PDF attachment** - For larger/enterprise proposals

When sending:
- Brief cover message (3-4 sentences max)
- Proposal as body text or attachment
- Clear call-to-action ("Reply to confirm and we'll get started")
- Deadline for proposal validity (7-14 days)

### Step 6: Generate Contract (After Acceptance)

1. Use template from `references/contract-template.md`
2. Fill in:
   - Both parties' details
   - Scope of work (from proposal)
   - Payment schedule
   - Timeline and milestones
   - IP ownership terms
   - Termination clause
3. Send for signature (or simple email confirmation for smaller deals)

#### Contract Requirements by Tier
- **Starter:** Email confirmation is sufficient
- **Professional:** Simple service agreement
- **Enterprise:** Full contract with SLA
- **Custom:** Full contract with IP terms, SLA, and detailed scope

### Step 7: Generate Invoice

1. Use template from `references/invoice-template.md`
2. Include:
   - Invoice number (format: RC-YYYY-NNN)
   - Date and due date
   - Client details
   - Line items with descriptions
   - Total amount
   - Payment instructions / Stripe link
3. Send to client
4. Log in financial tracking

### Step 8: Follow Up

If no response after sending:

| Days Since Sent | Action |
|----------------|--------|
| 2-3 days | Friendly check-in ("Just making sure you received this") |
| 5-7 days | Add value ("Thought of another way this could help...") |
| 10-14 days | Final nudge ("Proposal expires in X days") |
| 14+ days | Close as lost or revisit with new angle |

### Step 9: Log the Outcome

After deal closes (win or loss):
1. Update pipeline tracker
2. Log in `memory/YYYY-MM-DD.md`
3. If won: create project tracking file
4. If lost: note reason for future reference

## Quick Reference

### Proposal Checklist
- [ ] Client name and company filled in
- [ ] Problem statement customized
- [ ] Solution tailored to their specific needs
- [ ] Deliverables clearly listed
- [ ] Timeline specified
- [ ] Price is specific (not a range)
- [ ] Payment terms included
- [ ] Payment link or instructions included
- [ ] Next steps / CTA clear
- [ ] Proposal has expiration date

### Invoice Checklist
- [ ] Invoice number assigned
- [ ] Client details correct
- [ ] Line items match agreed scope
- [ ] Amount matches contract/proposal
- [ ] Due date specified
- [ ] Payment link working
- [ ] Sent to correct email

## Reference Files

- `references/proposal-templates.md` - Full proposal templates for all 4 tiers
- `references/contract-template.md` - Service agreement template
- `references/invoice-template.md` - Invoice format and numbering
- `references/stripe-links.md` - Payment links and setup
