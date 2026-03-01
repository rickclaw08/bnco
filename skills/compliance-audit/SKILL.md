# Compliance Audit

**Version:** 0.1.0
**Owner:** Quinn (CLO)
**Description:** Review projects, content, and operations for legal compliance and intellectual property protection. Covers GDPR/privacy, trademark, content licensing, and regulatory compliance.

## Trigger Keywords

- "compliance check"
- "legal risk"
- "IP review"
- "privacy audit"
- "trademark"
- "GDPR"
- "copyright"
- "content compliance"
- "data protection"

## Overview

This skill provides structured workflows for checking legal compliance across three domains: privacy/data protection, intellectual property (trademarks and copyrights), and content/operational compliance. Use it before launching products, publishing content, or entering new markets.

## Workflow

### Step 1: Determine Audit Scope

Identify what is being reviewed and which compliance domains apply:

| Audit Type | When to Use | Primary Reference |
|------------|-------------|-------------------|
| Privacy/Data Protection | Collecting, storing, or processing personal data | `references/privacy-checklist.md` |
| Trademark/IP | Using names, logos, brand elements, or third-party content | `references/trademark-search-guide.md` |
| Content Compliance | Publishing content, marketing materials, social media | `references/compliance-standards.md` |
| Full Audit | New product launch, new market entry, major pivot | All references |

Ask: "What are we reviewing, and what is the context?"

### Step 2: Privacy and Data Protection Review

**When applicable:** Any project that collects, stores, processes, or shares personal data.

#### 2a: Data Inventory

Document what data is involved:
- [ ] What personal data is collected (names, emails, IPs, cookies, etc.)
- [ ] How is it collected (forms, cookies, APIs, third parties)
- [ ] Where is it stored (cloud provider, region, encryption status)
- [ ] Who has access (internal team, third-party processors)
- [ ] How long is it retained
- [ ] How can users request deletion

#### 2b: GDPR Compliance (if serving EU users)

- [ ] Lawful basis for processing identified (consent, contract, legitimate interest)
- [ ] Privacy policy is current and accessible
- [ ] Cookie consent banner implemented (not pre-checked)
- [ ] Data Processing Agreements (DPAs) in place with all processors
- [ ] Right to access, rectification, and erasure processes exist
- [ ] Data breach notification process documented (72-hour requirement)
- [ ] Data Protection Impact Assessment (DPIA) completed if high-risk processing

#### 2c: CCPA Compliance (if serving California residents)

- [ ] "Do Not Sell My Personal Information" link present (if applicable)
- [ ] Privacy policy includes CCPA-required disclosures
- [ ] Opt-out mechanism functional
- [ ] Data categories and business purposes documented

#### 2d: General Data Protection

- [ ] Data encrypted in transit (TLS/HTTPS)
- [ ] Data encrypted at rest
- [ ] Access controls and authentication in place
- [ ] Backup and recovery procedures documented
- [ ] Third-party data sharing agreements current

See `references/privacy-checklist.md` for the full detailed checklist.

### Step 3: Trademark and IP Review

**When applicable:** Using brand names, logos, slogans, or third-party creative assets.

#### 3a: Trademark Search

Before adopting a new name, logo, or slogan:

1. **Preliminary search:** Check obvious conflicts
   - Search USPTO TESS database (US trademarks)
   - Search EUIPO (EU trademarks)
   - Google the name + industry keywords
   - Check domain availability
   - Search social media handles

2. **Analyze results:**
   - Identical marks in same/similar class = STOP, do not use
   - Similar marks in same class = HIGH RISK, get legal opinion
   - Similar marks in different class = MEDIUM RISK, proceed with caution
   - No conflicts found = LOW RISK, consider filing

3. **Document findings:**
   - List all potentially conflicting marks
   - Note registration status, class, and owner
   - Provide risk rating and recommendation

See `references/trademark-search-guide.md` for detailed search procedures.

#### 3b: Content IP Review

For any content being published or used:

- [ ] All images are licensed or original (check license type: commercial use allowed?)
- [ ] Stock photo licenses cover intended use (social, web, print, etc.)
- [ ] Font licenses cover intended use (desktop, web, app, etc.)
- [ ] Music/audio properly licensed (sync license, royalty-free, etc.)
- [ ] No unauthorized use of third-party trademarks
- [ ] User-generated content has proper rights/releases
- [ ] Open source components comply with their licenses (GPL, MIT, Apache, etc.)
- [ ] AI-generated content reviewed for potential IP issues

### Step 4: Content and Operational Compliance

**When applicable:** Publishing marketing materials, website content, product claims.

#### 4a: Advertising and Marketing

- [ ] Claims are truthful and substantiated
- [ ] Testimonials/endorsements comply with FTC guidelines
- [ ] Affiliate/sponsored content properly disclosed
- [ ] Comparison claims are fair and accurate
- [ ] "Free" offers have clear terms
- [ ] Email marketing complies with CAN-SPAM (unsubscribe, physical address, no deceptive subjects)
- [ ] SMS marketing has proper consent (TCPA compliance)

#### 4b: Website Compliance

- [ ] Terms of Service published and accessible
- [ ] Privacy Policy published and accessible
- [ ] Cookie policy and consent mechanism
- [ ] Accessibility standards met (WCAG 2.1 AA minimum)
- [ ] Age verification if needed (COPPA for under-13)
- [ ] Clear refund/cancellation policy for e-commerce

#### 4c: Industry-Specific

Flag if any of these apply and recommend specialist review:
- Healthcare (HIPAA)
- Financial services (SEC, FINRA, PCI-DSS)
- Education (FERPA)
- Children's products/services (COPPA)
- International trade (export controls, sanctions)

See `references/compliance-standards.md` for detailed standards by category.

### Step 5: Risk Rating and Report

For each finding, assign:

| Rating | Meaning | Action Required |
|--------|---------|-----------------|
| CRITICAL | Legal exposure, potential lawsuit or fine | Must fix before launch |
| HIGH | Significant risk, likely violation | Fix before launch, or accept with documented reasoning |
| MEDIUM | Potential issue, best practice violation | Plan to address, document decision |
| LOW | Minor concern, improvement opportunity | Address when convenient |
| PASS | Compliant, no issues found | No action needed |

### Step 6: Deliver Audit Report

Structure the report as:

```
## Compliance Audit Report
- Subject: [what was reviewed]
- Date: [audit date]
- Scope: [privacy / IP / content / full]
- Overall Rating: [PASS / ISSUES FOUND / CRITICAL ISSUES]

## Findings Summary
| # | Domain | Finding | Rating | Recommendation |
|---|--------|---------|--------|----------------|

## Detailed Findings
[For each finding: description, evidence, risk, recommendation]

## Action Items
- [ ] [Prioritized list of required actions]

## Next Review
- Recommended follow-up date and scope
```

## Reference Files

| File | Purpose |
|------|---------|
| `references/privacy-checklist.md` | Detailed GDPR, CCPA, and general data protection checklist |
| `references/trademark-search-guide.md` | Step-by-step trademark search procedures and databases |
| `references/compliance-standards.md` | Compliance standards organized by domain and industry |

## Notes

- Compliance is not a one-time event. Recommend periodic reviews (quarterly for active projects).
- When findings are CRITICAL or HIGH, recommend pausing the launch or activity until resolved.
- This skill provides guidance, not legal advice. For complex or high-stakes situations, recommend consulting a licensed attorney.
- Keep audit reports on file. They demonstrate good faith compliance efforts.
- Regulations change. Periodically review and update the reference checklists.
