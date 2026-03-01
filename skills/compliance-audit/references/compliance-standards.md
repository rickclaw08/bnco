# Compliance Standards Reference

**Version:** 0.1.0
**Last Updated:** 2026-02-21

Compliance standards organized by domain and industry. Use as a reference when conducting compliance audits.

---

## 1. Digital Marketing and Advertising

### FTC Guidelines (United States)

**Endorsements and Testimonials:**
- Sponsored content must be clearly disclosed ("Ad", "Sponsored", "#ad")
- Disclosure must be clear and conspicuous (not hidden in hashtags or small print)
- Endorsers must have actually used the product
- Claims must reflect typical experience, or atypical results must be disclosed
- Material connections between endorser and brand must be disclosed

**Email Marketing (CAN-SPAM):**
- [ ] Include physical mailing address in every email
- [ ] Include clear unsubscribe mechanism
- [ ] Honor opt-out requests within 10 business days
- [ ] Do not use deceptive subject lines
- [ ] Identify the message as an advertisement (if applicable)
- [ ] Do not use harvested or purchased email lists without consent

**SMS Marketing (TCPA):**
- [ ] Obtain prior express written consent before sending marketing texts
- [ ] Provide clear opt-out instructions in every message
- [ ] Honor opt-out requests immediately
- [ ] Do not send messages before 8 AM or after 9 PM (recipient's time zone)
- [ ] Maintain consent records

**Advertising Claims:**
- [ ] All claims are truthful and not misleading
- [ ] Claims are substantiated with evidence
- [ ] Comparative advertising is fair and accurate
- [ ] "Free" offers clearly state terms and conditions
- [ ] Price claims are accurate and current
- [ ] Testimonials reflect genuine experiences

### Social Media Compliance

- [ ] Paid partnerships disclosed per platform guidelines
- [ ] Employee advocacy programs have clear guidelines
- [ ] User-generated content used with permission
- [ ] Contest/giveaway rules comply with platform terms and local law
- [ ] Social media policies documented for team

---

## 2. Website and App Compliance

### Accessibility (WCAG 2.1 AA)

- [ ] All images have descriptive alt text
- [ ] Color is not the only means of conveying information
- [ ] Sufficient color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- [ ] All functionality accessible via keyboard
- [ ] Focus indicators visible
- [ ] Form inputs have associated labels
- [ ] Error messages are descriptive and helpful
- [ ] Video content has captions
- [ ] Audio content has transcripts
- [ ] Page structure uses proper heading hierarchy
- [ ] ARIA roles used correctly where needed
- [ ] Site works with screen readers

### Cookie Compliance

See `privacy-checklist.md` for detailed cookie requirements.

### Terms of Service

- [ ] Written in understandable language
- [ ] Covers acceptable use
- [ ] Addresses user-generated content (if applicable)
- [ ] Includes dispute resolution mechanism
- [ ] Specifies governing law
- [ ] Addresses account termination
- [ ] Includes limitation of liability
- [ ] Addresses intellectual property rights
- [ ] Updated regularly and dated

### E-Commerce Specific

- [ ] Clear pricing (including taxes, shipping, handling)
- [ ] Refund and return policy clearly stated
- [ ] Order confirmation sent after purchase
- [ ] Delivery timeframes stated
- [ ] Payment security (PCI-DSS compliance if handling card data)
- [ ] Consumer rights honored (cooling-off period where required)

---

## 3. Content and Intellectual Property

### Copyright Compliance

- [ ] All content is original or properly licensed
- [ ] Stock media licenses cover intended use
- [ ] Attribution provided where required
- [ ] Fair use claims are defensible (educational, commentary, parody)
- [ ] DMCA takedown process established (if hosting user content)
- [ ] Content scraped from other sites has proper authorization

### Open Source Compliance

| License Type | Requirements |
|-------------|-------------|
| MIT | Include copyright notice and license text |
| Apache 2.0 | Include license, state changes, include NOTICE file |
| GPL v2/v3 | Derivative works must also be GPL; source code must be available |
| LGPL | Can link without GPL obligation; modifications to library must be shared |
| BSD | Include copyright notice |
| CC BY | Provide attribution, indicate changes |
| CC BY-SA | Attribution + share-alike (derivatives use same license) |
| CC BY-NC | Attribution + non-commercial use only |

- [ ] All open source dependencies have identified licenses
- [ ] License obligations are being met
- [ ] No GPL code in proprietary products (unless intentional)
- [ ] License inventory is maintained
- [ ] NOTICE files are included where required

### AI-Generated Content

- [ ] AI-generated content reviewed for accuracy
- [ ] AI-generated content checked for potential IP issues
- [ ] Disclosure of AI involvement where required or appropriate
- [ ] AI training data does not include unauthorized copyrighted material
- [ ] AI outputs do not replicate protected works

---

## 4. Industry-Specific Compliance

### Healthcare (HIPAA)

Applies if handling Protected Health Information (PHI).

- [ ] Business Associate Agreement (BAA) in place with all vendors handling PHI
- [ ] PHI encrypted in transit and at rest
- [ ] Access controls enforce minimum necessary standard
- [ ] Audit logs for PHI access
- [ ] Employee training on HIPAA requirements
- [ ] Breach notification procedures (60-day requirement)
- [ ] Risk assessment performed annually
- [ ] Physical safeguards for PHI

**Recommendation:** If HIPAA may apply, engage a compliance specialist. The penalties are severe (up to $1.5M per violation category per year).

### Financial Services (PCI-DSS)

Applies if handling payment card data.

- [ ] Cardholder data environment identified and scoped
- [ ] Network segmentation in place
- [ ] Encryption of cardholder data in transit and at rest
- [ ] Access restricted to need-to-know
- [ ] Regular vulnerability scans
- [ ] Annual penetration testing
- [ ] Security policies documented and maintained
- [ ] Incident response plan for card data breaches

**Recommendation:** Use a PCI-compliant payment processor (Stripe, Square, etc.) to minimize your PCI scope. Avoid storing card data directly.

### Children's Data (COPPA)

Applies if collecting data from children under 13 (US) or under 16 (EU/GDPR).

- [ ] Verifiable parental consent obtained before collecting data
- [ ] Privacy policy specifically addresses children's data
- [ ] Data collection minimized for children
- [ ] No behavioral advertising targeted at children
- [ ] Data deletion upon parental request
- [ ] Third-party services also COPPA-compliant

### Education (FERPA)

Applies if handling student education records.

- [ ] Student consent (or parent consent if under 18) before disclosing records
- [ ] Directory information policies established
- [ ] Access limited to legitimate educational interest
- [ ] Annual notification of rights provided

---

## 5. International Considerations

### Key Jurisdictions

| Jurisdiction | Key Law | Focus |
|-------------|---------|-------|
| EU/EEA | GDPR | Data protection, privacy |
| California | CCPA/CPRA | Consumer privacy rights |
| Canada | PIPEDA | Personal information protection |
| Brazil | LGPD | Data protection (similar to GDPR) |
| Australia | Privacy Act 1988 | Australian Privacy Principles |
| UK | UK GDPR + DPA 2018 | Post-Brexit data protection |
| China | PIPL | Personal information protection |

### Cross-Border Data Transfers

- [ ] Data transfer mechanisms identified (SCCs, adequacy, BCRs)
- [ ] Transfer Impact Assessments completed
- [ ] Data localization requirements met (where applicable)
- [ ] Government access risks assessed

---

## 6. Quick Decision Tree

```
Is this a compliance concern?

1. Does it involve personal data? --> Privacy checklist
2. Does it involve a name/logo/brand? --> Trademark search guide
3. Does it involve content creation? --> Copyright and IP section
4. Does it involve advertising? --> FTC and marketing section
5. Does it involve healthcare data? --> HIPAA (get specialist)
6. Does it involve payment data? --> PCI-DSS
7. Does it involve children? --> COPPA/age-gating
8. Does it involve international users? --> International section
9. None of the above? --> General website compliance
```
