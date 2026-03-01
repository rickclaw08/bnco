# Payment Terms Reference

**Version:** 0.1.0
**Last Updated:** 2026-02-21

Standard payment term structures for use in contracts and service agreements.

---

## Standard Payment Schedules

### Net Terms

| Term | Meaning | Best For |
|------|---------|----------|
| Net 15 | Payment due within 15 days of invoice | Small projects, trusted clients |
| Net 30 | Payment due within 30 days of invoice | Standard business terms |
| Net 45 | Payment due within 45 days of invoice | Enterprise clients, larger organizations |
| Net 60 | Payment due within 60 days of invoice | Government, large enterprise (avoid if possible) |
| Due on Receipt | Payment due immediately upon invoice | Retainers, small engagements |

**Recommendation:** Default to Net 30. Use Net 15 for new clients or smaller engagements. Avoid Net 60+ unless the client requires it and the relationship justifies the cash flow risk.

### Milestone-Based Payment

Structure payments around deliverables:

```
Example: $50,000 Project

- 25% ($12,500) -- Upon signing / project kickoff
- 25% ($12,500) -- Upon delivery of Phase 1 / first milestone
- 25% ($12,500) -- Upon delivery of Phase 2 / second milestone
- 25% ($12,500) -- Upon final delivery and acceptance
```

**Variations:**
- **Front-loaded:** 50% / 25% / 25% (reduces risk for provider)
- **Back-loaded:** 25% / 25% / 50% (reduces risk for client)
- **Even split:** Equal payments at each milestone (balanced)

**Recommendation:** Always collect at least 25% upfront. Never deliver 100% of work before receiving at least 50% of payment.

### Retainer Payment

```
Monthly retainer: $[AMOUNT]
Includes: Up to [HOURS] hours per month
Overage rate: $[RATE] per additional hour
Payment due: [1st/15th] of each month, in advance
Unused hours: [Do not roll over / Roll over up to X hours]
```

**Recommendation:** Retainers should be paid in advance. Do not start work for a month until that month's retainer is received.

### Recurring/Subscription Payment

```
[Monthly/Quarterly/Annual] fee: $[AMOUNT]
Billing date: [Specific date or anniversary of start date]
Payment method: [Credit card / ACH / Wire / Invoice]
Auto-renewal: [Yes, with X days notice to cancel / No]
```

---

## Late Payment Provisions

### Standard Late Payment Clause

```
Payments not received within [PAYMENT_DAYS] days of the invoice date
shall be subject to a late fee of [LATE_FEE_PERCENTAGE]% per month
(or the maximum rate permitted by applicable law, whichever is less)
on the outstanding balance. Provider reserves the right to suspend
Services upon [SUSPENSION_NOTICE_DAYS] days' written notice of
non-payment.
```

### Recommended Late Fee Rates

| Rate | Context |
|------|---------|
| 1.0% per month | Standard, reasonable |
| 1.5% per month | Slightly aggressive, still common |
| 2.0% per month | Upper range, may not be enforceable everywhere |

**Note:** Some jurisdictions cap interest rates on overdue invoices. Research applicable usury laws.

### Escalation Process

1. **Day 1 past due:** Send friendly payment reminder
2. **Day 15 past due:** Send formal past-due notice
3. **Day 30 past due:** Phone/video call to discuss, apply late fees
4. **Day 45 past due:** Written notice of potential service suspension
5. **Day 60 past due:** Suspend services, engage collections process
6. **Day 90+ past due:** Consider legal action, write-off, or settlement

---

## Payment Methods

| Method | Speed | Cost | Best For |
|--------|-------|------|----------|
| ACH/Bank Transfer | 1-3 business days | Low/Free | Recurring, domestic |
| Wire Transfer | Same day | $15-45 per transfer | Large amounts, international |
| Credit Card | Instant | 2.5-3.5% processing fee | Small amounts, convenience |
| Check | 5-10 business days | Stamp cost | Legacy clients, avoid if possible |
| PayPal/Venmo | Instant-1 day | 2.9% + $0.30 | Small projects, freelance |
| Cryptocurrency | Variable | Network fees | Specify accepted coins, conversion terms |

**Recommendation:** ACH for domestic recurring, wire for international or large amounts. If accepting credit cards, consider adding processing fee pass-through to contract.

---

## Currency and Tax Considerations

### Currency

- Always specify currency in the contract (USD, EUR, GBP, etc.)
- For international clients, specify which party bears exchange rate risk
- Consider a clause: "All payments shall be made in [CURRENCY]. Exchange rate fluctuations exceeding [X]% may trigger a fee adjustment discussion."

### Tax

Standard tax clause:

```
All fees are exclusive of applicable taxes, including but not limited to
sales tax, use tax, VAT, and GST. Client is responsible for all such
taxes, except for taxes based on Provider's income.
```

**Key considerations:**
- Know your nexus obligations (where you owe sales tax)
- International clients: clarify VAT/GST responsibility
- Withholding tax: address who bears the cost
- Provide tax ID/VAT number as required

---

## Contract Language Snippets

### Deposit/Upfront Payment

```
Client shall pay a non-refundable deposit of $[AMOUNT] (the "Deposit")
upon execution of this Agreement. The Deposit shall be credited toward
the final invoice. Work shall not commence until the Deposit is received.
```

### Kill Fee / Cancellation Fee

```
If Client terminates this Agreement prior to completion, Client shall
pay a cancellation fee equal to [X]% of the remaining contract value,
in addition to payment for all Services performed through the
termination date.
```

### Payment Contingency (Performance-Based)

```
In addition to the base fee, Client shall pay a performance bonus of
$[AMOUNT] if [SPECIFIC_MEASURABLE_CONDITION] is achieved within
[TIMEFRAME] of project completion.
```

### Right to Withhold Deliverables

```
Provider retains the right to withhold final Deliverables until all
outstanding invoices are paid in full. Intellectual property rights
shall transfer to Client only upon receipt of full payment.
```

---

## Quick Reference: Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| No upfront payment | Always require at least 25% deposit |
| Vague payment triggers | Tie payments to specific, verifiable milestones |
| No late payment terms | Include interest and suspension rights |
| Currency ambiguity | Specify currency and exchange rate terms |
| Tax confusion | State fees are exclusive of taxes |
| Scope creep without payment | Require written change orders for additional work |
| Delivering before paid | Withhold final deliverables until paid |
