# Privacy Checklist

**Version:** 0.1.0
**Last Updated:** 2026-02-21

Comprehensive checklist for reviewing data privacy compliance. Covers GDPR, CCPA, and general data protection best practices.

---

## 1. Data Inventory

Before assessing compliance, document what data you handle:

### What Data Is Collected?

| Data Category | Examples | Collected? | Lawful Basis |
|---------------|----------|------------|--------------|
| Identifiers | Name, email, phone, address | [ ] | |
| Account Data | Username, password hash, preferences | [ ] | |
| Financial | Payment info, billing address, purchase history | [ ] | |
| Technical | IP address, device info, browser type | [ ] | |
| Behavioral | Page views, clicks, session duration | [ ] | |
| Location | GPS, IP-based location, timezone | [ ] | |
| Communications | Emails, chat logs, support tickets | [ ] | |
| Biometric | Fingerprints, face data, voice prints | [ ] | |
| Health | Medical info, fitness data | [ ] | |
| Children's Data | Data from users under 13/16 | [ ] | |

### Data Flow Mapping

For each data category collected:
- [ ] Source identified (user input, automatic collection, third party)
- [ ] Storage location documented (which database, which cloud region)
- [ ] Access controls defined (who can access, under what conditions)
- [ ] Sharing documented (which third parties receive this data)
- [ ] Retention period defined (how long is it kept)
- [ ] Deletion process defined (how is it removed when no longer needed)

---

## 2. GDPR Compliance Checklist

Applies if you serve users in the EU/EEA, or process data of EU residents.

### Lawful Basis for Processing

- [ ] Lawful basis identified for each processing activity
  - Consent (freely given, specific, informed, unambiguous)
  - Contract (necessary for performing a contract)
  - Legal obligation (required by law)
  - Vital interests (protecting someone's life)
  - Public task (performing an official function)
  - Legitimate interests (balanced against data subject rights)
- [ ] Consent records maintained (when, how, what was consented to)
- [ ] Consent can be withdrawn as easily as it was given
- [ ] No pre-ticked consent boxes

### Data Subject Rights

- [ ] Right to access: Can users request a copy of their data?
- [ ] Right to rectification: Can users correct inaccurate data?
- [ ] Right to erasure ("right to be forgotten"): Can users request deletion?
- [ ] Right to restrict processing: Can users limit how data is used?
- [ ] Right to data portability: Can users export their data in a standard format?
- [ ] Right to object: Can users object to processing based on legitimate interests?
- [ ] Automated decision-making: Can users request human review of automated decisions?
- [ ] Response timeline: Can requests be fulfilled within 30 days?

### Privacy Policy

- [ ] Written in clear, plain language
- [ ] Identifies the data controller (name, contact info)
- [ ] Lists data categories collected
- [ ] States lawful basis for each type of processing
- [ ] Describes data sharing with third parties
- [ ] States retention periods
- [ ] Explains data subject rights and how to exercise them
- [ ] Provides contact for Data Protection Officer (if required)
- [ ] Describes international data transfers (if applicable)
- [ ] Includes date of last update
- [ ] Easily accessible from every page (footer link)

### Cookies and Tracking

- [ ] Cookie consent banner implemented
- [ ] No non-essential cookies set before consent
- [ ] Consent is granular (can accept/reject by category)
- [ ] No pre-checked boxes
- [ ] "Reject all" is as easy as "Accept all"
- [ ] Cookie policy lists all cookies, their purpose, and duration
- [ ] Third-party tracking scripts only load after consent

### Data Processing Agreements (DPAs)

- [ ] DPA in place with every third-party processor
- [ ] DPAs include required GDPR Article 28 provisions
- [ ] Sub-processors are disclosed and approved
- [ ] Processor security measures are documented

### Data Breach Response

- [ ] Breach detection process in place
- [ ] Breach notification to supervisory authority within 72 hours
- [ ] Breach notification to affected individuals (if high risk)
- [ ] Breach log maintained (even for non-reportable breaches)
- [ ] Post-breach review and remediation process

### International Transfers

- [ ] Transfers outside EEA identified
- [ ] Transfer mechanism in place (Standard Contractual Clauses, adequacy decision, etc.)
- [ ] Transfer Impact Assessment completed (if applicable)

---

## 3. CCPA/CPRA Compliance Checklist

Applies if you do business in California and meet revenue/data thresholds.

### Consumer Rights

- [ ] Right to know: Can consumers request what data is collected about them?
- [ ] Right to delete: Can consumers request deletion of their data?
- [ ] Right to opt out of sale/sharing: "Do Not Sell or Share My Personal Information" link
- [ ] Right to correct: Can consumers correct inaccurate data?
- [ ] Right to limit use of sensitive personal information
- [ ] Non-discrimination: Consumers not penalized for exercising rights

### Privacy Policy (CCPA Requirements)

- [ ] Categories of personal information collected in the past 12 months
- [ ] Categories of sources
- [ ] Business or commercial purpose for collection
- [ ] Categories of third parties with whom data is shared
- [ ] Specific pieces of personal information collected
- [ ] Whether personal information is sold or shared
- [ ] Retention periods for each category
- [ ] Updated at least annually

### Opt-Out Mechanism

- [ ] "Do Not Sell or Share My Personal Information" link on homepage
- [ ] Opt-out mechanism is functional and processes requests
- [ ] Global Privacy Control (GPC) signal honored
- [ ] No dark patterns in opt-out flow

---

## 4. General Data Protection Best Practices

### Data Minimization

- [ ] Only collect data that is necessary for the stated purpose
- [ ] Do not retain data longer than needed
- [ ] Regularly review and purge unnecessary data
- [ ] Default to collecting less, not more

### Security Measures

- [ ] Data encrypted in transit (TLS 1.2+)
- [ ] Data encrypted at rest
- [ ] Access controls enforce least privilege
- [ ] Multi-factor authentication for admin access
- [ ] Regular security audits and vulnerability assessments
- [ ] Logging and monitoring of data access
- [ ] Incident response plan documented and tested

### Third-Party Risk

- [ ] All third-party services that handle personal data are documented
- [ ] Third-party privacy policies reviewed
- [ ] Data processing agreements in place
- [ ] Regular review of third-party compliance
- [ ] Ability to remove data from third-party systems

### Employee/Agent Training

- [ ] Team understands data protection obligations
- [ ] Handling procedures for data subject requests documented
- [ ] Breach reporting procedures understood
- [ ] Regular refresher on privacy best practices

---

## 5. Quick Reference: Common Violations

| Violation | Risk Level | Fix |
|-----------|------------|-----|
| Cookies set before consent | HIGH | Implement proper consent management |
| No privacy policy | CRITICAL | Write and publish immediately |
| Collecting data without purpose | MEDIUM | Audit and remove unnecessary collection |
| No data deletion process | HIGH | Build deletion workflow |
| Sharing data without DPA | HIGH | Execute DPAs with all processors |
| Retaining data indefinitely | MEDIUM | Define and enforce retention periods |
| No breach response plan | HIGH | Document and test incident response |
| Pre-checked consent boxes | HIGH | Remove pre-checking, require affirmative action |
| No opt-out mechanism (CCPA) | CRITICAL | Add "Do Not Sell" link and functionality |
