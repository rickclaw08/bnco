# Pipeline Stages

Detailed definitions for each stage in the RickClaw AI sales pipeline.

---

## Stage 1: Lead

**Definition:** A prospect has been identified but not yet contacted.

**Entry Criteria:**
- Name and contact method available
- Source identified (Upwork, Reddit, LinkedIn, referral, etc.)
- Basic fit determined (they might need AI services)

**Exit Criteria (to Stage 2):**
- Initial outreach message sent
- Contact attempt logged

**Actions:**
- Research the prospect (company, role, needs)
- Determine best outreach channel
- Prepare personalized message
- Send within 24-48 hours of identification

**Probability of Close:** 5%

**Target Duration:** 0-2 days (don't sit on leads)

---

## Stage 2: Contacted

**Definition:** Initial outreach has been sent, awaiting response.

**Entry Criteria:**
- At least one outreach attempt made
- Message was personalized and relevant

**Exit Criteria (to Stage 3):**
- Prospect responded with interest
- Qualifying conversation has begun

**Exit Criteria (to Stage 8 - Lost):**
- 3 follow-up attempts with no response
- Prospect explicitly declines

**Actions:**
- Log outreach date and channel
- Set follow-up reminder for 48-72 hours
- Prepare follow-up messages
- Try different channel on second attempt if first gets no response

**Probability of Close:** 10%

**Target Duration:** 1-3 days

---

## Stage 3: Qualified

**Definition:** Prospect has responded and meets our qualification criteria.

**Entry Criteria:**
- Prospect has engaged in conversation
- All must-have qualification criteria confirmed
- Lead score assigned (A/B/C/D)
- Tier fit determined

**Exit Criteria (to Stage 4):**
- Scope is understood
- Proposal is ready to send
- Client expects to receive a proposal

**Exit Criteria (to Stage 8 - Lost):**
- Fails qualification on review
- Client goes silent after initial interest

**Actions:**
- Run through qualification checklist
- Determine appropriate tier
- Discuss scope and requirements
- Schedule call if complex project
- Begin drafting proposal

**Probability of Close:** 20%

**Target Duration:** 1-5 days

---

## Stage 4: Proposal Sent

**Definition:** A formal proposal has been delivered to the prospect.

**Entry Criteria:**
- Proposal created using deal-closing skill
- Proposal sent to client via agreed channel
- Proposal includes specific pricing and timeline

**Exit Criteria (to Stage 5):**
- Client responds to proposal
- Discussion about terms begins
- Client asks questions or requests changes

**Exit Criteria (to Stage 6):**
- Client accepts proposal as-is

**Exit Criteria (to Stage 8 - Lost):**
- Proposal rejected
- No response after full follow-up sequence

**Actions:**
- Send proposal with clear cover message
- Log send date
- Begin follow-up sequence:
  - Day 3: Check-in
  - Day 7: Value-add
  - Day 14: Final nudge
- Be available for questions

**Probability of Close:** 35%

**Target Duration:** 3-7 days

---

## Stage 5: Negotiating

**Definition:** Client is engaged and discussing terms, scope, or pricing.

**Entry Criteria:**
- Client has reviewed proposal
- Active discussion about terms/scope/pricing
- Client is showing buying signals

**Exit Criteria (to Stage 6):**
- Both parties agree on scope, price, and timeline
- Client says "let's do it" or equivalent

**Exit Criteria (to Stage 8 - Lost):**
- Parties can't agree on terms
- Client chooses a competitor
- Client decides not to proceed

**Actions:**
- Address objections (see objection-handling.md)
- Adjust scope or pricing if reasonable
- Get CFO approval for any non-standard pricing
- Keep momentum with regular check-ins
- Offer a call to resolve complex discussions
- Create urgency without being pushy

**Probability of Close:** 55%

**Target Duration:** 3-14 days

---

## Stage 6: Closing

**Definition:** Deal is agreed, finalizing paperwork and payment.

**Entry Criteria:**
- Verbal or written agreement on terms
- Moving to contract and payment

**Exit Criteria (to Stage 7 - Won):**
- Contract signed (or email confirmation)
- Payment received (or payment plan confirmed)

**Exit Criteria (to Stage 8 - Lost):**
- Client backs out during paperwork
- Payment fails

**Actions:**
- Generate contract (deal-closing skill)
- Send payment link
- Confirm payment receipt
- Set up project delivery
- Celebrate (briefly)

**Probability of Close:** 85%

**Target Duration:** 1-5 days

---

## Stage 7: Won

**Definition:** Deal is closed, payment received, project ready to begin.

**Entry Criteria:**
- Payment confirmed
- Contract/agreement in place

**Post-Win Actions:**
- Log in financial tracking (CFO)
- Create project delivery plan
- Send client welcome/onboarding message
- Schedule kick-off call if needed
- Set reminder for 30-day testimonial request
- Set reminder for upsell conversation (60-90 days)

**Probability of Close:** 100%

---

## Stage 8: Lost

**Definition:** Deal did not close for any reason.

**Entry Criteria:**
- Client explicitly declined
- No response after full follow-up sequence
- Parties couldn't agree on terms
- Any other deal-ending outcome

**Post-Loss Actions:**
- Log the reason for loss
- Categories of loss:
  - No response (ghosted)
  - Budget (too expensive)
  - Timing (not ready)
  - Competition (chose someone else)
  - Fit (wrong capabilities)
  - Scope (project too big/small)
- Add to re-engage list if appropriate
- Review for lessons learned
- Analyze loss patterns monthly

**Re-engage Timeline:**
- Timing issues: Follow up in 30-60 days
- Budget issues: Follow up in 90 days
- Ghosted: Follow up once at 60 days, then archive
- Competition: Follow up in 6 months
- Fit: Don't re-engage unless capabilities change

---

## Stage Probability Quick Reference

| Stage | Probability | Weighted Value Formula |
|-------|------------|----------------------|
| Lead | 5% | Deal Value x 0.05 |
| Contacted | 10% | Deal Value x 0.10 |
| Qualified | 20% | Deal Value x 0.20 |
| Proposal Sent | 35% | Deal Value x 0.35 |
| Negotiating | 55% | Deal Value x 0.55 |
| Closing | 85% | Deal Value x 0.85 |
| Won | 100% | Deal Value x 1.00 |
| Lost | 0% | $0 |

Use weighted values for pipeline forecasting and reporting.
