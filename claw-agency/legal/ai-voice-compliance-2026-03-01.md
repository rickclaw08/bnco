# AI Voice Receptionist - Regulatory Compliance Guide

**Prepared by:** Quinn (CLO) | ClawOps Legal  
**Date:** March 1, 2026  
**Product:** ClawOps AI Voice Receptionist (inbound calls only)  
**Status:** WORKING DOCUMENT - Not legal advice. Engage outside counsel before launch.

---

## Table of Contents

1. [State-by-State AI Voice Disclosure Requirements](#1-state-by-state-ai-voice-disclosure-requirements)
2. [Universal Disclosure Script](#2-universal-disclosure-script)
3. [TCPA Implications for AI-Answered Inbound Calls](#3-tcpa-implications-for-ai-answered-inbound-calls)
4. [Legal Shield Onboarding Checklist](#4-legal-shield-onboarding-checklist)
5. [Terms of Service Gap Analysis](#5-terms-of-service-gap-analysis)

---

## 1. State-by-State AI Voice Disclosure Requirements

### Federal Status

**FCC Declaratory Ruling (February 8, 2024):** The FCC ruled that calls using AI-generated voices qualify as "artificial" voices under the TCPA. This means AI voice calls are subject to the same restrictions as robocalls when placed WITHOUT prior consent. Key details:

- AI-generated or cloned voices = "artificial" under 47 U.S.C. Section 227(a)(1)
- Applies to outbound calls primarily, but establishes the legal characterization of AI voice as "artificial"
- Does NOT specifically mandate disclosure that the caller is speaking with AI
- DOES mean that if ClawOps ever initiates outbound calls (callbacks, follow-ups), those are automatically subject to full TCPA consent requirements

**No Federal AI Disclosure Mandate (as of March 2026):** There is no federal law specifically requiring businesses to disclose that a caller is interacting with AI on inbound calls. However, the FTC Act Section 5 (unfair or deceptive acts) could apply if an AI system actively misrepresents itself as human to a consumer in a commercial context. Best practice: always disclose.

**Pending Federal Legislation to Watch:**
- AI Labeling Act (reintroduced in multiple sessions) - Would require labeling of AI-generated content
- AI Transparency Act - Would require notice when interacting with AI systems
- No bills have passed as of March 2026, but momentum is building

### States with ENACTED AI Disclosure Laws

| State | Law/Code | Effective | Requirement | Applies to Voice Calls? |
|-------|----------|-----------|-------------|------------------------|
| **California** | SB 1001 (B&P Code 17941-17943) | July 1, 2019 | Bots communicating with persons in California for commercial transactions or to influence a vote must disclose they are not human. "Clear, conspicuous, and reasonably designed to inform." | **YES** - Covers any automated system communicating with CA persons for commercial purposes. AI receptionists qualifying leads or booking appointments = commercial transaction. |
| **Utah** | AI Policy Act (SB 149, amended 2024) | May 1, 2024 | Generative AI users must clearly and conspicuously disclose AI use when interacting with consumers. Applies when AI is used in "regulated" contexts (healthcare, financial, legal services). | **YES (for regulated industries)** - If client is a healthcare provider, attorney, or financial advisor in Utah, disclosure is mandatory. For general businesses, best practice but not strictly required for inbound. |
| **Colorado** | SB 24-205 (AI Act) | Feb 1, 2026 | Deployers of "high-risk AI systems" must notify consumers that AI is being used. "High-risk" includes systems making consequential decisions about consumers (insurance, employment, lending, housing, education, healthcare, legal). | **CONDITIONAL** - Applies if the AI receptionist is making or assisting in consequential decisions (e.g., insurance eligibility screening, lending pre-qualification). Routine call answering/scheduling likely not "high-risk" unless in covered categories. |
| **Illinois** | AI Video Interview Act (820 ILCS 42) | Jan 1, 2020 | Employers using AI in video interviews must disclose. Narrow scope. | **NO** - Employment interviews only. Not applicable to AI receptionists. |
| **New York City** | Local Law 144 | Jul 5, 2023 | Automated employment decision tools require notice and bias audit. | **NO** - Employment context only. |
| **Washington** | HB 1116 (proposed 2025) | Pending | Would require disclosure for AI systems interacting with consumers. | **WATCH** - Not yet enacted. |

### States with PENDING Legislation (Active as of Early 2026)

| State | Bill | Status | What It Would Require |
|-------|------|--------|----------------------|
| **Washington** | HB 1116 / SB 5356 | Pending (2025 session, likely reintroduced 2026) | Mandatory disclosure when AI is used in consumer-facing interactions |
| **New Jersey** | S3780 (and prior versions) | Pending | AI transparency requirements for consumer interactions |
| **Massachusetts** | H.70 / S.31 (AI Bill of Rights) | Pending | Broad AI disclosure and impact assessment requirements |
| **New York** (State) | S7543 / A8195 | Pending | AI regulation including disclosure for automated decision systems |
| **Texas** | HB 2060 | Pending | AI disclosure in commercial contexts |
| **Connecticut** | SB 2 / HB 6607 | Passed 2024, vetoed, reintroduced 2025-2026 | High-risk AI disclosure and impact assessment |
| **Virginia** | HB 2094 | Pending (2025-2026) | AI transparency and disclosure requirements |
| **Minnesota** | HF 1234 | Pending | Consumer-facing AI disclosure mandate |

### States with GENERAL Consumer Protection Applicability

Even without specific AI laws, state consumer protection statutes (UDAP - Unfair and Deceptive Acts and Practices) in ALL 50 states could be used to challenge an AI system that misleads consumers into believing they are speaking with a human. State AGs have enforcement authority. States with aggressive consumer protection enforcement:

- **California** (strong UDAP + SB 1001)
- **New York** (AG has broad enforcement powers)
- **Illinois** (aggressive consumer protection history + BIPA implications for voice data)
- **Florida** (active AG enforcement)
- **Texas** (DTPA provides strong consumer protections)
- **Washington** (Consumer Protection Act is broadly applied)
- **Oregon** (strong Unlicensed Practice of Law statutes - AI cannot represent itself with licensed titles per 2025 law)

### Two-Party Consent States (Call Recording)

These states require ALL parties to consent to recording. Since we record calls, this is critical:

| State | Citation |
|-------|----------|
| California | Cal. Penal Code 632 |
| Connecticut | Conn. Gen. Stat. 52-570d |
| Florida | Fla. Stat. 934.03 |
| Illinois | 720 ILCS 5/14-2 |
| Maryland | Md. Code, Cts. & Jud. Proc. 10-402 |
| Massachusetts | Mass. Gen. Laws ch. 272, 99 |
| Michigan | MCL 750.539c (one-party for criminal, all-party for civil) |
| Montana | Mont. Code Ann. 45-8-213 |
| Nevada | NRS 200.620 |
| New Hampshire | RSA 570-A:2 |
| Oregon | ORS 165.540 |
| Pennsylvania | 18 Pa.C.S. 5704 |
| Washington | RCW 9.73.030 |

**Action Required:** Recording consent announcement must be included in every call, not just in two-party states (to maintain uniform compliance and avoid geo-tracking complexity).

---

## 2. Universal Disclosure Script

### Recommended Opening Disclosure (Satisfies All Current Requirements)

This script is designed to satisfy California SB 1001, Colorado SB 24-205, Utah AI Policy Act, FTC deceptive practices standards, two-party recording consent, and general UDAP/consumer protection across all 50 states.

#### Primary Script (Recommended - Natural and Compliant)

> "Hi, thank you for calling [Business Name]. You're speaking with an AI-powered virtual assistant. This call may be recorded for quality purposes. How can I help you today?"

**Word count:** ~27 words  
**Duration:** ~5-6 seconds  
**Elements covered:**
- AI identification (California SB 1001, Colorado, Utah, FTC)
- Recording disclosure (two-party consent states)
- Natural conversational flow (doesn't feel like a legal disclaimer)

#### Alternative Script (Maximum Legal Coverage)

> "Thank you for calling [Business Name]. Just so you know, I'm an AI assistant, not a human, and this call is being recorded. I'm here to help you with scheduling, questions, or connecting you with our team. What can I do for you?"

**Word count:** ~42 words  
**Duration:** ~8-9 seconds  
**Elements covered:**
- Explicit "not a human" statement (strongest SB 1001 compliance)
- Recording disclosure
- Scope limitation (sets expectations, reduces liability)

#### Compact Script (For Speed-Sensitive Businesses)

> "Hi, you've reached [Business Name]'s AI assistant. This call is recorded. How can I help?"

**Word count:** ~16 words  
**Duration:** ~3-4 seconds  
**Minimum viable compliance:** Yes, but less warm

### Script Implementation Requirements

1. **Disclosure must be at the START of the call** - before any substantive interaction
2. **Disclosure must be in the SAME LANGUAGE** as the conversation (configure for multi-language support)
3. **Cannot be skippable or buried** - must be clearly audible before proceeding
4. **Must be consistent** - every single call, no exceptions
5. **Log that disclosure was delivered** - timestamp in call metadata for audit trail
6. **If caller asks "Am I speaking to a real person?"** - AI must truthfully confirm it is an AI and offer to transfer to a human

### Transfer-to-Human Protocol

The AI must always offer and execute transfer to a human when:
- Caller explicitly requests a human
- Conversation involves sensitive personal information (health, legal, financial details)
- Caller expresses frustration or distress
- Topic exceeds AI's configured knowledge base

**Recommended transfer phrase:**
> "I'd be happy to connect you with a member of our team. Let me transfer you now."

---

## 3. TCPA Implications for AI-Answered Inbound Calls

### The Good News: Inbound-Only Is the Safest Position

The TCPA (47 U.S.C. 227) primarily regulates **outbound** automated calls and texts. Since ClawOps AI Voice Receptionist ONLY answers inbound calls (the caller initiates), the core TCPA consent requirements are significantly less burdensome.

### Key TCPA Analysis for Inbound AI Answering

#### 3.1 FCC February 2024 Ruling Impact

The FCC's declaratory ruling that AI-generated voices are "artificial" under the TCPA matters for us in two ways:

**Favorable:** The ruling targets outbound robocalls. A business answering its own phone with AI is fundamentally different from an unsolicited robocall. The caller chose to call the business.

**Cautionary:** The ruling establishes that AI voice IS "artificial voice" under the TCPA. If our system EVER makes outbound calls (callbacks, appointment reminders, follow-ups), those calls are automatically subject to TCPA consent requirements as calls using an "artificial or prerecorded voice."

#### 3.2 Inbound Call Answering - TCPA Exposure Is Low But Not Zero

**Low Risk Areas:**
- Answering inbound calls with AI: NOT a TCPA violation (caller initiated the contact)
- Routing and transferring calls: Standard business practice, no TCPA issue
- Providing business information to callers: No TCPA issue
- Scheduling appointments during the inbound call: No TCPA issue

**Medium Risk Areas:**
- **Outbound callbacks:** If the AI calls back a missed call, that IS an outbound call using artificial voice. Requires prior express consent. The missed call itself may constitute implied consent for a return call, but this is legally gray. **Recommendation: Do not auto-callback without explicit consent.**
- **Appointment reminder calls/texts:** These are outbound and require prior express consent. If the AI schedules an appointment and then sends a reminder, the reminder needs consent.
- **Follow-up texts/calls:** Any post-call outbound communication requires consent. SMS requires prior express written consent for marketing messages.

**Higher Risk Areas:**
- **Lead qualification followed by outbound sales contact:** If the AI qualifies a lead and a human salesperson calls back, the TCPA implications depend on whether the caller provided consent for follow-up during the inbound call.

#### 3.3 Consent Architecture for Inbound Calls

Even though inbound calls have low TCPA risk, build consent collection into the call flow:

**During the inbound call, the AI should capture:**
1. Verbal consent for recording (already in disclosure script)
2. Verbal consent for follow-up contact (if applicable): "Would it be okay if we follow up with you about this?"
3. Text/SMS opt-in (if offering text confirmations): "Can I send you a text confirmation at this number?"

**Log these consent events** with timestamps for audit purposes.

#### 3.4 State Mini-TCPA Laws

Several states have their own telemarketing/automated call laws that may apply:

| State | Law | Relevance |
|-------|-----|-----------|
| Florida | FTSA (Florida Telephone Solicitation Act) | Stricter than federal TCPA. Written consent required for automated texts. |
| Oklahoma | OTPA | Requires registration for automated calling systems. |
| Washington | RCW 80.36.390 | Automated call restrictions. |
| Maryland | CL 14-3201 | Robocall restrictions. |

**Key Point:** These state laws mostly target outbound calls. Inbound answering is generally safe, but any outbound feature (callbacks, reminders) triggers state-by-state analysis.

#### 3.5 TCPA Recommendations for ClawOps

1. **NEVER enable auto-callback without explicit client configuration and consent documentation**
2. **Appointment reminders via text**: Require written opt-in (text message confirmation: "Reply YES to confirm")
3. **Log all consent events** with timestamps, phone numbers, and method of consent
4. **Maintain a suppression/DNC list** per client account
5. **Build a "consent mode" toggle** per client: conservative (no outbound ever) vs. standard (outbound with consent) vs. full (all features with full consent chain)
6. **Include TCPA indemnification** in every client agreement (already in TOS - good)

---

## 4. Legal Shield Onboarding Checklist

### Pre-Go-Live Requirements for Each Client

Every client MUST complete ALL items before their AI Voice Receptionist goes live.

#### A. Executed Agreements (Required)

- [ ] **Master Service Agreement (MSA)** - Signed by authorized representative
- [ ] **AI Voice Receptionist SOW** - Specific scope, pricing, and service terms
- [ ] **Data Processing Agreement (DPA)** - Required if client handles EU data (GDPR), health data (HIPAA), or operates in states with comprehensive privacy laws (CA, CO, CT, VA, UT, TX, OR, MT, DE, IA, NE, NJ, NH, MN, MD)
- [ ] **Business Associate Agreement (BAA)** - Required if client is a healthcare provider or handles PHI
- [ ] **NDA** - If client is sharing proprietary business processes or trade secrets

#### B. Indemnification and Liability (In MSA/SOW)

- [ ] **Mutual indemnification clause** covering:
  - Client indemnifies ClawOps for: TCPA violations from client's instructions, content accuracy, client's failure to obtain required consents, misuse of AI outputs
  - ClawOps indemnifies Client for: IP infringement by ClawOps technology, data breaches caused by ClawOps negligence
- [ ] **Liability cap** specified: Lesser of (a) fees paid in prior 12 months or (b) $50,000
- [ ] **Consequential damages exclusion** for both parties
- [ ] **Carve-outs from liability cap** for: willful misconduct, confidentiality breaches, indemnification obligations, IP infringement

#### C. Data Protection Requirements

- [ ] **Data processing inventory**: Document what data is collected (call recordings, transcripts, caller PII, appointment data)
- [ ] **Sub-processor disclosure**: Inform client of third-party processors (Twilio, OpenAI, cloud hosting)
- [ ] **Data retention schedule**: Confirm default retention (90 days audio, 12 months transcripts, 24 months metadata) or negotiate custom schedule
- [ ] **Data deletion process**: Document how client can request deletion
- [ ] **Breach notification commitment**: 72-hour notification commitment (aligns with GDPR, state privacy laws)
- [ ] **Encryption standards**: Confirm at-rest and in-transit encryption for all call data

#### D. Compliance Configuration

- [ ] **AI disclosure script approved** by client (from Section 2 above)
- [ ] **Recording consent announcement** configured for client's jurisdiction(s)
- [ ] **State-specific compliance** reviewed for client's operating states
- [ ] **Two-party consent state check**: If client operates in any two-party consent state, recording notification must be enabled
- [ ] **Industry-specific compliance** reviewed:
  - Healthcare: HIPAA BAA executed, PHI handling procedures documented
  - Legal: Confirm AI will not provide legal advice, add disclaimers
  - Financial: Confirm AI will not provide financial advice, add disclaimers
  - Real Estate: Fair Housing Act compliance (AI cannot discriminate in housing inquiries)
  - Insurance: State insurance commission requirements reviewed

#### E. Operational Requirements

- [ ] **Human escalation path** defined: Who gets transferred calls? What number? What hours?
- [ ] **After-hours protocol** defined: Voicemail? Emergency transfer? Message only?
- [ ] **Business information accuracy** verified: Hours, services, pricing, team directory
- [ ] **Prohibited topics list** configured: What should the AI NOT discuss?
- [ ] **Emergency protocol** defined: How does AI handle 911/emergency situations?
- [ ] **Testing period** completed: At least 48 hours of test calls before live

#### F. Insurance Verification

- [ ] **ClawOps E&O insurance** current and covering AI services
- [ ] **ClawOps cyber liability insurance** current
- [ ] **Client's own business insurance** confirmed (not ClawOps' responsibility, but good practice to verify client has general liability)

#### G. Documentation Provided to Client

- [ ] **Compliance guide** specific to client's state(s) and industry
- [ ] **Data handling fact sheet** (what we collect, how we store, how long, who has access)
- [ ] **AI limitations disclosure** (what the AI can and cannot do)
- [ ] **Emergency contact information** for ClawOps support
- [ ] **SLA terms** documented and acknowledged

---

## 5. Terms of Service Gap Analysis

### Review of theclawops.com/terms/ (Last Updated: March 1, 2026)

The TOS is solid. It already includes AI disclosure requirements (Section 5), TCPA compliance (Section 6), data processing (Section 9), and AI content disclaimers (Section 10). Below are identified gaps and recommended additions.

### STRENGTHS (Already Covered)

- AI disclosure mandate in Section 5.1 (clients cannot disable it)
- Call recording consent responsibility in Section 5.2
- Data retention schedule in Section 5.3
- TCPA shared responsibility model in Section 6
- Client indemnification for TCPA violations in Section 6.4
- Third-party processor disclosure (Twilio, OpenAI) in Section 9.2
- DPA and BAA availability in Section 9.3
- AI output disclaimers in Section 10
- Strong liability cap in Section 11.3
- Class action waiver in Section 14.4

### GAPS AND RECOMMENDED ADDITIONS

#### Gap 1: No State-Specific Compliance Responsibility Clause
**Risk:** Medium  
**Issue:** Section 5 mentions compliance generally but doesn't explicitly allocate responsibility for state-specific AI disclosure laws (e.g., California SB 1001).  
**Recommendation:** Add a subsection 5.4:
> "5.4 State and Local Compliance. While ClawOps provides a baseline AI disclosure in all calls, Client is responsible for identifying and communicating any additional state or local disclosure requirements applicable to Client's business or the jurisdictions in which Client's callers are located. ClawOps will make reasonable efforts to implement jurisdiction-specific compliance features upon Client's written request."

#### Gap 2: No Explicit Prohibition on AI Providing Professional Advice
**Risk:** High  
**Issue:** Section 10.1 says AI "does not provide legal, medical, financial, or other professional advice" but doesn't prohibit clients from CONFIGURING it to do so.  
**Recommendation:** Add to Section 4.2:
> "- Configure or instruct the AI to provide legal, medical, financial, tax, insurance, or other professional advice or recommendations. The AI Voice Receptionist is an informational and scheduling tool, not a licensed professional."

#### Gap 3: No Voice Data / Biometric Data Provisions
**Risk:** High (especially for Illinois BIPA)  
**Issue:** AI voice interactions may capture voice prints or biometric identifiers. Illinois BIPA (Biometric Information Privacy Act) imposes strict requirements and allows private right of action with statutory damages ($1,000-$5,000 per violation).  
**Recommendation:** Add a Section 5.5:
> "5.5 Voice and Biometric Data. ClawOps does not use call recordings to create, collect, or store biometric identifiers or biometric information (as defined under applicable state biometric privacy laws, including the Illinois Biometric Information Privacy Act). Voice recordings are used solely for service delivery, quality assurance, and AI training as described in our Privacy Policy. Client must not configure the Services to collect biometric data without first executing a supplemental agreement addressing biometric privacy requirements."

#### Gap 4: No AI Training / Model Improvement Disclosure
**Risk:** Medium  
**Issue:** Section 9.2 mentions processing through OpenAI but doesn't address whether call data is used to train/improve AI models (either ClawOps' or third-party).  
**Recommendation:** Add to Section 9:
> "9.5 AI Model Training. ClawOps may use anonymized, aggregated call data and interaction patterns to improve its AI systems and service quality. Client-identifiable call recordings and transcripts are NOT shared with third-party AI providers for model training purposes. ClawOps configures its third-party AI providers (including OpenAI) to disable training on Client Data where such options are available."

#### Gap 5: No Right to Opt Out of AI / Human Fallback Guarantee
**Risk:** Medium  
**Issue:** No commitment to provide callers a way to reach a human. Some emerging regulations and consumer protection standards are moving toward requiring a human fallback option.  
**Recommendation:** Add to Section 5.1:
> "ClawOps AI Voice Receptionist is configured to offer callers the ability to be transferred to a human representative when one is available. Client must maintain an active human escalation path during business hours."

#### Gap 6: No Incident Response / Breach Notification Timeline
**Risk:** Medium  
**Issue:** Section 9 covers data processing but lacks specific breach notification commitments. Many state privacy laws require notification within 30-72 hours.  
**Recommendation:** Add a Section 9.6:
> "9.6 Security Incident Response. In the event of a confirmed data breach affecting Client Data, ClawOps will: (a) notify Client within 72 hours of confirmation, (b) provide a description of the data affected, (c) describe remedial actions taken, and (d) cooperate with Client's breach notification obligations. This does not alter any obligations under applicable breach notification laws."

#### Gap 7: No Explicit HIPAA Limitation
**Risk:** High (for healthcare clients)  
**Issue:** Section 9.3 mentions BAA availability but doesn't explicitly state the service is NOT HIPAA-compliant by default. A healthcare client could assume compliance.  
**Recommendation:** Add to Section 2.1:
> "The AI Voice Receptionist is not HIPAA-compliant by default. Healthcare providers and other covered entities must execute a Business Associate Agreement (BAA) with ClawOps and enable HIPAA-compliant configurations before using the Service to handle Protected Health Information (PHI). Using the standard Service to process PHI without a BAA is a violation of these Terms."

#### Gap 8: No Multi-Jurisdiction Conflict Resolution
**Risk:** Low-Medium  
**Issue:** TOS is governed by Delaware law (Section 14.1) but doesn't address how state-specific consumer protection laws interact with the choice-of-law clause. Some state consumer protection statutes cannot be waived by choice-of-law.  
**Recommendation:** Add to Section 14.1:
> "This choice of law does not deprive any consumer of the protection of mandatory consumer protection laws of their state of residence."

#### Gap 9: No Express SLA in TOS
**Risk:** Low  
**Issue:** Section 2.4 says "we target high availability" but the SOW has a specific 99.5% SLA. The TOS should reference that SLAs are defined per-product.  
**Recommendation:** Add to Section 2.4:
> "Specific uptime commitments and service level agreements (SLAs), if any, are defined in the applicable SOW or product-specific terms."

#### Gap 10: Pricing Not Reflected in TOS
**Risk:** Low  
**Issue:** Section 7.1 references pricing on the product page. The new $2,500 setup + $497/month pricing should be reflected there (website, not TOS - TOS correctly points to the pricing page).  
**Recommendation:** Ensure theclawops.com/#pricing reflects the current $2,500 + $497/month structure. The TOS approach of referencing the pricing page rather than embedding prices is correct and flexible.

### Priority Action Items for TOS Update

| Priority | Gap | Risk | Effort |
|----------|-----|------|--------|
| **P0** | Gap 3 (Voice/Biometric Data - BIPA) | HIGH | Medium |
| **P0** | Gap 2 (Professional Advice Prohibition) | HIGH | Low |
| **P0** | Gap 7 (HIPAA Default Limitation) | HIGH | Low |
| **P1** | Gap 4 (AI Training Disclosure) | MEDIUM | Low |
| **P1** | Gap 5 (Human Fallback) | MEDIUM | Low |
| **P1** | Gap 6 (Breach Notification) | MEDIUM | Medium |
| **P1** | Gap 1 (State-Specific Compliance) | MEDIUM | Low |
| **P2** | Gap 8 (Multi-Jurisdiction) | LOW-MED | Low |
| **P2** | Gap 9 (SLA Reference) | LOW | Low |
| **P2** | Gap 10 (Pricing Page Update) | LOW | Low |

---

## Appendix A: Quick Reference - Compliance by State (Top 15 Target Markets)

| State | AI Disclosure | Recording Consent | Special Requirements |
|-------|--------------|-------------------|---------------------|
| California | **REQUIRED** (SB 1001) | Two-party | CCPA/CPRA data rights |
| Texas | Best practice | One-party | DTPA consumer protection |
| Florida | Best practice | Two-party | FTSA for any outbound |
| New York | Best practice | One-party | Strong AG enforcement |
| Illinois | Best practice | Two-party | **BIPA** - voice biometrics risk |
| Pennsylvania | Best practice | Two-party | Wiretap Act strict |
| Ohio | Best practice | One-party | Standard |
| Georgia | Best practice | One-party | Standard |
| North Carolina | Best practice | One-party | Standard |
| Michigan | Best practice | One-party (criminal) | All-party for civil suits |
| New Jersey | Best practice | One-party | Pending AI legislation |
| Virginia | Best practice | One-party | VCDPA privacy law |
| Colorado | **REQUIRED** (high-risk) | One-party | CPA + AI Act |
| Utah | **REQUIRED** (regulated) | One-party | UCPA privacy law |
| Washington | Best practice | Two-party | Strong CPA |

## Appendix B: Compliance Monitoring Calendar

| Month | Action |
|-------|--------|
| Monthly | Review NCSL AI legislation tracker for new state laws |
| Quarterly | Audit disclosure scripts, update for new requirements |
| Semi-annually | Review TOS and contracts against new legislation |
| Annually | Full compliance audit, engage outside counsel |
| Ongoing | Monitor FCC, FTC enforcement actions related to AI voice |

**Key Resources:**
- NCSL AI Legislation Tracker: ncsl.org/technology-and-communication/artificial-intelligence-2025-legislation
- FCC TCPA Updates: fcc.gov/general/telemarketing-and-robocalls
- FTC AI Guidance: ftc.gov/business-guidance/blog/tags/artificial-intelligence
- State AG Enforcement: Follow AG offices in CA, NY, IL, TX, FL

---

**DISCLAIMER:** This document is for internal planning purposes only. It is not legal advice. Laws and regulations change frequently, especially in the AI space. Before launching in any state, have qualified legal counsel in that jurisdiction review the specific compliance requirements. This guide reflects research conducted as of March 1, 2026.
