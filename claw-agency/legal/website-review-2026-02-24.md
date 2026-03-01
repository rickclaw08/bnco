# ClawOps Website Legal & Security Review
**Date:** February 24, 2026
**Reviewer:** Rick (AI Legal/Security Subagent)
**Scope:** /privacy/, /terms/, /acceptable-use/, vertical landing pages, intake forms, demo page, homepage

---

## Executive Summary

All three legal pages exist and are structurally solid. However, they were written for the pre-pivot generic "AI automation agency" positioning and do not reflect the current service offerings (AI Readiness Audit, AI Receptionist, Revenue Ops Sprint, AI Agent Development, Automation-as-a-Service) or the vertical-specific pages targeting home services, legal, and healthcare. Several gaps create real legal liability, especially around the AI Receptionist product and healthcare/legal vertical claims. Security posture is strong overall, with a few fixable issues.

---

## 1. Legal Pages - Existence & Accuracy

### 1.1 /privacy/ - EXISTS
- **Status:** Present, well-structured, covers GDPR and CCPA
- **Issues:**
  - **No mention of phone numbers, call data, or SMS/text message data.** The AI Receptionist product collects phone numbers, call metadata, text message content, and potentially call recordings. The privacy policy only lists "Name, Email, Company name, Company information." This is a significant gap.
  - **No mention of healthcare data (PHI/ePHI).** The healthcare vertical page claims HIPAA compliance and BAA-compatible platforms, but the privacy policy says nothing about protected health information, how it is handled, or the safeguards in place.
  - **No mention of legal intake data.** The legal vertical promises document collection (IDs, police reports, medical records, contracts). None of this sensitive data handling is addressed.
  - **No TCPA disclosure.** The AI Receptionist sends automated text messages. TCPA (Telephone Consumer Protection Act) requires specific consent disclosures for automated texts and calls.
  - **Third-party AI processors incomplete.** Only lists OpenAI and Anthropic. The AI Receptionist likely uses telephony providers (Twilio, Vapi, etc.), CRM platforms (ServiceTitan, Clio, etc.), and SMS gateways. These need to be disclosed.
  - **Contact email is agentclaw08@icloud.com.** For a professional operation handling healthcare and legal data, an iCloud email as the sole data protection contact is a credibility risk. Consider privacy@theclawops.com.

### 1.2 /terms/ - EXISTS
- **Status:** Present, comprehensive
- **Issues:**
  - **Service description is generic.** Lists "AI-driven workflow automation" and "Business process optimization." Does not mention AI Receptionist, missed-call text-back, appointment scheduling, lead qualification, document collection, or any of the five named service tiers.
  - **No SLA or uptime language.** The AI Receptionist is marketed as "24/7" coverage. If the system goes down, there is no language about uptime guarantees, response time, or remedies. "24/7" is a strong promise.
  - **No call recording or monitoring disclosure.** If the AI Receptionist records or transcribes calls, terms need to address this explicitly. Many states require two-party consent for call recording.
  - **No healthcare-specific terms.** No Business Associate Agreement (BAA) reference. No acknowledgment that healthcare clients may require special data handling terms.
  - **No legal-specific terms.** No acknowledgment of attorney-client privilege implications. No disclaimer that ClawOps AI is not practicing law.
  - **Governing law is vague.** Says "laws of the jurisdiction in which ClawOps operates" without naming the state. Should specify a state (likely New York based on timezone).

### 1.3 /acceptable-use/ - EXISTS
- **Status:** Present, thorough, well-structured
- **Issues:**
  - **Section 3.8 is good but could create tension.** It says users cannot "Provide legal advice (without licensed attorney oversight)" or "Generate medical diagnoses... (without licensed medical professional oversight)." This is correct, but the legal and healthcare vertical pages promise AI systems that handle intake, qualification, and routing, which could be interpreted as bordering on legal/medical advice. The AUP should clarify that ClawOps' own products for these verticals are designed with appropriate human oversight built in.
  - **Minor:** No specific guidance on TCPA compliance for customers using the AI Receptionist product.

---

## 2. Service Offerings Mismatch

The legal pages were written February 20, 2026, before the vertical pivot. Current service tiers on the homepage:

| Service | On Homepage | In Terms | In Privacy |
|---------|-------------|----------|------------|
| AI Readiness Audit | Yes | No | No |
| AI Receptionist | Yes | No | No |
| Revenue Ops Sprint | Yes | No | No |
| Custom AI Agent Development | Yes | No | No |
| Automation-as-a-Service | Yes | No | No |

The Terms section 2 ("Description of Services") needs to list these five offerings explicitly.

---

## 3. Vertical-Specific Legal Risks

### 3.1 Healthcare Vertical (/healthcare/)
- **HIPAA Claim:** The page states "All ClawOps healthcare solutions use encrypted communications, BAA-compatible platforms, and follow healthcare data handling best practices."
  - **Risk:** Claiming HIPAA compliance without actually having BAAs signed with all subprocessors (AI providers, telephony, hosting) is a serious liability. If a breach occurs, ClawOps could face HIPAA penalties as a Business Associate.
  - **Recommendation:** Add a disclaimer that HIPAA compliance is a shared responsibility and that ClawOps will execute BAAs with qualifying healthcare clients. Do not claim blanket HIPAA compliance on the marketing page. Change to: "ClawOps works with healthcare clients to meet HIPAA requirements, including executing Business Associate Agreements and using BAA-compatible platforms."
- **"Reduce No-Shows by 40%":** This specific claim needs a source or disclaimer ("results may vary"). Without substantiation, it could be considered deceptive advertising under FTC guidelines.

### 3.2 Legal Vertical (/legal/)
- **"AI answers calls, texts, WhatsApp messages, and web form submissions instantly":** This is accurate for what the product does, but needs a disclaimer that the AI is not providing legal advice and that all intake information is preliminary.
  - **Risk:** If the AI gives incorrect information during intake (e.g., tells someone their case has merit when it does not, or vice versa), there could be unauthorized practice of law (UPL) liability.
  - **Recommendation:** Add a disclaimer on the legal page: "ClawOps AI systems collect and organize information for attorney review. They do not provide legal advice, case evaluations, or legal opinions. All intake information is preliminary and subject to attorney review."
- **Document Collection:** The page promises AI will "request, collect, and organize" IDs, police reports, medical records, and contracts. This implicates sensitive data handling with no corresponding privacy policy coverage.

### 3.3 Contractors Vertical (/contractors/)
- **Lower risk** than healthcare and legal. Main concern is the AI Receptionist claims around call handling.
- **"AI That Answers, Qualifies, and Books. 24/7.":** Clear language, but should note somewhere that the AI is an automated system, not a human receptionist. Some states require disclosure that the caller is interacting with an automated system.

---

## 4. AI Receptionist Liability Flags

This is the highest-risk product from a legal perspective:

1. **"AI answers calls"** - If this means a voice AI answers live phone calls, many states require disclosure that the caller is speaking with an automated system (e.g., California Bot Disclosure Law, SB 1001). The demo page and vertical pages do not mention this requirement.

2. **"Never miss a lead"** - Absolute claims like "never" are risky. If the system has downtime, a client could argue breach of contract or false advertising.

3. **Call recording/transcription** - If the AI Receptionist records or transcribes calls (likely needed for CRM sync and quality), two-party consent states (California, Florida, Illinois, etc.) require explicit consent from callers. No disclosure exists anywhere on the site.

4. **SMS/text-back without consent** - TCPA requires prior express consent for automated text messages. The "missed-call text-back" feature sends automated texts to people who called but did not explicitly opt in to receive texts. This is a TCPA gray area that needs legal counsel, but at minimum the site should disclose this in the privacy policy and terms.

5. **No AI Receptionist-specific terms** - There should be a service addendum or separate section in the Terms covering the AI Receptionist, including: what data is collected, how calls are handled, uptime expectations, and the client's responsibility to comply with recording/consent laws in their state.

---

## 5. OWASP Security Compliance

### 5.1 Hardcoded API Keys / Secrets
- **PASS:** No hardcoded API keys, tokens, passwords, or secrets found in the codebase.
- **Note:** Forms use FormSubmit.co, which embeds the destination email (agentclaw08@icloud.com) in the form action URL. This is standard for FormSubmit but does expose the email address. Not a security vulnerability per se, but worth noting.

### 5.2 Content Security Policy (CSP)
- **PASS (with notes):** All pages include CSP headers via meta tags. Policies are well-configured:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline'` - The `unsafe-inline` is needed for inline scripts but is an OWASP concern. Consider extracting inline scripts to external files and using nonces or hashes.
  - `frame-src 'none'` - Good, prevents clickjacking via frames
  - `object-src 'none'` - Good
  - `base-uri 'self'` - Good
  - `form-action 'self' https://formsubmit.co` - Good, restricts form submissions
- **Issue:** `unsafe-inline` in script-src on every page. This weakens XSS protection. All pages use inline `<script>` blocks (starfield animation, form validation). Moving these to external .js files with CSP nonces would be stronger.

### 5.3 Security Headers
- **PASS:** Present on all pages:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Note:** These are meta-tag based. For production, these should also be set as HTTP headers on the server/CDN for stronger enforcement. Meta tags can be stripped by certain proxies.

### 5.4 Input Validation on Forms
- **PASS (mostly):**
  - Intake form (`/intake/`): Excellent validation with `required`, `minlength`, `maxlength`, `pattern` attributes on all fields. Email validation via `type="email"`. Phone pattern validated.
  - Homepage contact form: Good validation with `required`, `minlength`, `maxlength`, `pattern` on name. Email validated. Select required.
  - **Gap:** No server-side validation visible (forms go to FormSubmit.co which provides basic filtering). Client-side validation alone is insufficient per OWASP, but since this is a static site using a third-party form handler, server-side validation is FormSubmit's responsibility.

### 5.5 XSS Vulnerabilities
- **MEDIUM RISK:** The demo page (`/demo/`) uses `innerHTML` to render chat messages:
  ```js
  el.innerHTML = '<div class="msg-label">AI Receptionist</div>' + msg.text;
  ```
  The `msg.text` values come from hardcoded scenario data, not user input, so this is not currently exploitable. However, if scenarios were ever loaded dynamically or from user input, this would be an XSS vector. Recommend switching to `textContent` + DOM element creation, or sanitizing input.

### 5.6 Secure Data Handling
- **PASS:** No user data is stored client-side beyond the session. No localStorage/sessionStorage usage for sensitive data. Forms submit via POST to FormSubmit.co over HTTPS.
- **Note:** No cookie consent banner despite claiming cookie usage in the privacy policy. If serving EU users (and GDPR section suggests this is anticipated), a cookie consent mechanism is required.

### 5.7 Google Analytics Placeholder
- **INFO:** `G-XXXXXXXXXX` placeholder in index.html and 404.html for Google Analytics. Not a security issue, but the gtag script is loading from googletagmanager.com with a placeholder ID, which means it is making unnecessary external requests for no functional purpose.

---

## 6. Additional Findings

### 6.1 Homepage Contact Form - Service Options Outdated
The contact form dropdown on the homepage still lists old generic options:
- AI Chatbots
- Workflow Automation
- Data Pipelines
- Custom AI Agents
- AI Integration
- Consulting
- Other

These should be updated to match the five service tiers: AI Readiness Audit, AI Receptionist, Revenue Ops Sprint, Custom AI Agent Development, Automation-as-a-Service.

### 6.2 Missing Legal Links on Vertical Pages
The contractors page (`/contractors/`) footer does not link to Privacy Policy, Terms, or Acceptable Use. The healthcare and legal pages do not link to them either. All pages should include legal footer links. Only the homepage and the legal pages themselves have these links.

### 6.3 No Cookie Consent Banner
The privacy policy describes cookie usage and tracking. GDPR requires active consent before non-essential cookies. No consent mechanism exists on the site.

### 6.4 Email Address Consistency
Legal pages use agentclaw08@icloud.com. For a business targeting healthcare and legal clients, a branded email (e.g., legal@theclawops.com or privacy@theclawops.com) would be more credible and professional.

---

## 7. Priority Actions

### Critical (Do Now)
1. **Update Privacy Policy** to cover phone numbers, call data, SMS data, healthcare data, legal intake data, TCPA disclosures, and additional third-party processors
2. **Update Terms of Service** section 2 to list the five current service offerings
3. **Add AI Receptionist disclaimers** about automated system disclosure, call recording consent, and TCPA
4. **Add legal vertical disclaimer** about UPL (unauthorized practice of law) and that AI does not provide legal advice
5. **Soften HIPAA claim** on healthcare page from blanket compliance to "works with clients to meet requirements"

### High (This Week)
6. **Add legal footer links** (Privacy, Terms, AUP) to all vertical pages (contractors, healthcare, legal, demo)
7. **Update contact form service options** on homepage to match current offerings
8. **Specify governing law state** in Terms of Service
9. **Add source/disclaimer for statistical claims** ("Reduce No-Shows by 40%", "62% of calls missed by contractors")

### Medium (This Month)
10. **Add cookie consent banner** for GDPR compliance
11. **Move inline scripts to external files** and implement CSP nonces (removes `unsafe-inline`)
12. **Replace innerHTML with textContent/DOM methods** in demo page
13. **Replace G-XXXXXXXXXX placeholder** or remove GA script entirely until ready
14. **Consider branded email** for legal contact point
15. **Add AI Receptionist service addendum** to Terms covering call handling, data collection, uptime, and client compliance responsibilities

---

## 8. Updated Legal Pages

Updated versions of the three legal pages follow in separate files. Key changes:

### Privacy Policy Updates:
- Added phone number, call data, SMS/text data to collected information
- Added section on AI Receptionist data processing (call handling, text-back, call recording)
- Added healthcare data handling section (PHI, BAA references)
- Added legal intake data handling section
- Added TCPA compliance disclosure
- Expanded third-party processors list
- Added cookie consent language

### Terms of Service Updates:
- Updated section 2 to list all five service tiers
- Added AI Receptionist-specific terms (automated system disclosure, call handling, uptime)
- Added healthcare and legal vertical disclaimers
- Specified New York as governing law state
- Added call recording consent acknowledgment

### Acceptable Use Policy Updates:
- Added guidance on TCPA compliance for AI Receptionist customers
- Clarified that ClawOps' own vertical products include appropriate human oversight guardrails
- Added note about state-specific call recording consent requirements

---

*Report complete. Updated legal pages saved alongside this report.*
