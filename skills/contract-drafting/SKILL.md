# Contract Drafting

**Version:** 0.1.0
**Owner:** Quinn (CLO)
**Description:** Draft, review, and manage client contracts, NDAs, and service agreements. Covers template selection, client customization, risk review, and finalization.

## Trigger Keywords

- "draft contract"
- "NDA"
- "service agreement"
- "legal review"
- "terms"
- "contract template"
- "master services agreement"
- "statement of work"

## Overview

This skill handles the full lifecycle of contract creation: selecting the right template, customizing it for the specific client and scope, reviewing for legal risks, and producing a final document ready for signature.

## Workflow

### Step 1: Determine Contract Type

Ask or infer which type of contract is needed:

| Type | When to Use |
|------|-------------|
| Service Agreement | Client work, consulting, agency services |
| NDA (Mutual) | Before sharing confidential info with a potential partner or client |
| NDA (One-Way) | When only one party is disclosing confidential info |
| Statement of Work | Specific project scope under an existing MSA |
| Master Services Agreement | Long-term client relationship with multiple projects |

If unclear, ask: "What is the business relationship and what are we agreeing to?"

### Step 2: Gather Required Information

Collect these details before drafting:

**For all contracts:**
- [ ] Client/counterparty legal name
- [ ] Client contact person and title
- [ ] Effective date (or "upon signature")
- [ ] Governing law jurisdiction
- [ ] Term/duration

**For service agreements:**
- [ ] Scope of services (detailed)
- [ ] Deliverables and milestones
- [ ] Payment terms (rate, schedule, method)
- [ ] Revision/change order process
- [ ] Intellectual property ownership terms

**For NDAs:**
- [ ] Mutual or one-way
- [ ] Definition of confidential information
- [ ] Duration of confidentiality obligation
- [ ] Permitted disclosures/exceptions
- [ ] Return/destruction of materials clause

### Step 3: Select and Load Template

Templates are in `references/`:

- `service-agreement-template.md` -- Full service agreement
- `nda-template.md` -- NDA (mutual and one-way variants)
- `contract-checklist.md` -- Pre-send review checklist
- `payment-terms.md` -- Standard payment term options

Load the appropriate template and begin customization.

### Step 4: Customize for Client and Scope

Replace all placeholder fields (marked with `[BRACKET_NOTATION]`) with actual values.

**Customization rules:**
1. Never leave placeholder text in a final draft
2. Scope of work must be specific -- avoid vague language like "various services"
3. Payment terms must include: amount, schedule, method, and late payment consequences
4. IP ownership must be explicit -- who owns what, when does ownership transfer
5. Termination clause must specify notice period and what happens to work-in-progress
6. Liability caps should reflect the contract value (typically 1x-2x total contract value)

### Step 5: Risk Review

Before finalizing, run through these risk checks:

**Red Flags (must fix before sending):**
- [ ] Unlimited liability exposure
- [ ] No termination clause or unreasonable lock-in
- [ ] Ambiguous IP ownership
- [ ] Missing governing law
- [ ] Auto-renewal without notice requirements
- [ ] Non-compete that is overly broad
- [ ] Indemnification without caps

**Yellow Flags (review and decide):**
- [ ] Penalty clauses for late delivery
- [ ] Exclusive engagement requirements
- [ ] Right to audit clauses
- [ ] Assignment restrictions
- [ ] Force majeure scope

**For each flag found:**
1. Note the specific clause and section
2. Explain the risk in plain language
3. Suggest alternative language
4. Flag severity: HIGH / MEDIUM / LOW

### Step 6: Internal Review

Present the draft with:
1. Summary of key terms (one paragraph)
2. Risk flags identified and recommendations
3. Any open questions that need client input
4. The full draft document

### Step 7: Finalize

After review feedback:
1. Incorporate all requested changes
2. Run the checklist one final time (see `references/contract-checklist.md`)
3. Format for delivery (clean markdown or PDF-ready)
4. Note any items that need follow-up after signing

## Output Format

When presenting a contract draft, use this structure:

```
## Contract Summary
- Type: [contract type]
- Parties: [our entity] and [client entity]
- Term: [duration]
- Value: [total or rate]
- Key Terms: [2-3 bullet summary]

## Risk Assessment
- [RED/YELLOW] flags with explanations

## Draft Document
[Full contract text]

## Open Items
- [Any questions or decisions needed]
```

## Reference Files

| File | Purpose |
|------|---------|
| `references/service-agreement-template.md` | Full service agreement template with placeholders |
| `references/nda-template.md` | NDA template (mutual and one-way versions) |
| `references/contract-checklist.md` | Pre-send review checklist for all contract types |
| `references/payment-terms.md` | Standard payment term structures and language |

## Notes

- Always use plain language where possible. Legalese should serve clarity, not obscure it.
- When in doubt about a clause, flag it rather than guessing.
- Contracts should protect both parties, not just us. Fair deals make better long-term relationships.
- If a contract involves significant value (>$50k) or unusual terms, recommend external legal review.
