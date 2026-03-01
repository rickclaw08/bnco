# Invoice Template

Standard invoice format for RickClaw AI.

---

## Invoice Numbering

Format: **RC-YYYY-NNN**
- RC = RickClaw
- YYYY = Year
- NNN = Sequential number (start at 001 each year)

Examples: RC-2026-001, RC-2026-002, etc.

Track the latest invoice number in the pipeline or memory files to avoid duplicates.

---

## Invoice Template

```
INVOICE

Invoice #: RC-[YYYY]-[NNN]
Date: [Issue Date]
Due Date: [Due Date - typically Net 15]

FROM:
RickClaw AI
[Email address]
[Any additional business details]

TO:
[Client Name]
[Client Company]
[Client Email]
[Client Address - if known]

---

DESCRIPTION OF SERVICES

| # | Description                          | Qty | Rate      | Amount    |
|---|--------------------------------------|-----|-----------|-----------|
| 1 | [Service description]                | 1   | $[X]      | $[X]      |
| 2 | [Additional service if applicable]   | 1   | $[X]      | $[X]      |
| 3 | [Additional service if applicable]   | 1   | $[X]      | $[X]      |

                                              Subtotal:    $[X]
                                              Discount:    -$[X] (if any)
                                              TOTAL DUE:   $[X]

---

PAYMENT DETAILS

Payment method: Stripe
Payment link: [Stripe URL]

Or contact us for alternative payment arrangements.

TERMS
- Payment due within 15 days of invoice date
- Late payments incur 1.5% monthly interest
- Questions about this invoice? Reply to this email

---

Thank you for your business!
RickClaw AI
```

---

## Invoice Types

### Upfront Payment Invoice
- Full amount due before work begins
- Used for: Starter tier, small projects
- Due: Immediately / Net 7

### Milestone Invoice
- Partial payment at project milestone
- Used for: Professional and Custom tiers
- Common splits: 50/50, 30/30/30/10
- Due: Net 15

### Monthly Retainer Invoice
- Recurring monthly payment
- Used for: Enterprise tier
- Due: 1st of each month
- Send 3-5 days before due date

### Final Payment Invoice
- Remaining balance after delivery
- Used for: Milestone-based projects
- Due: Net 15 from delivery date

---

## Service Descriptions by Tier

Use these standard descriptions on invoices:

### Starter
- "AI automation setup and configuration"
- "Custom [chatbot/workflow/pipeline] development"
- "AI integration and deployment"

### Professional
- "AI automation system design and development"
- "Multi-platform integration and configuration"
- "Custom AI solution development and deployment"
- "Training and documentation"

### Enterprise
- "Monthly AI services retainer - [Month Year]"
- "AI strategy and development services"
- "Priority support and maintenance"

### Custom
- "Custom AI platform development - Phase [X]"
- "AI product architecture and build"
- "Strategic AI development services"

---

## Process After Invoicing

1. Send invoice via email with brief message
2. Log invoice in memory/financial tracking
3. Set reminder for due date
4. If unpaid at due date +3 days: Friendly reminder
5. If unpaid at due date +7 days: Follow-up with urgency
6. If unpaid at due date +15 days: Escalate to CEO
