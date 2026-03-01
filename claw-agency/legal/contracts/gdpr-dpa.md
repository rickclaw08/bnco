# DATA PROCESSING AGREEMENT

**Under the EU General Data Protection Regulation (GDPR)**

| | |
|---|---|
| **Data Controller:** | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ ("Controller" / "Client") |
| **Data Processor:** | ClawOps LLC ("Processor" / "ClawOps") |
| **Effective Date:** | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Related Agreement:** | Service Agreement or Pilot Agreement dated \_\_\_\_\_\_\_\_\_\_\_ |

This Data Processing Agreement ("DPA") supplements the related Service Agreement or Pilot Agreement between the parties and governs how ClawOps processes personal data on behalf of the Client.

---

## 1. Definitions

**Personal Data** -- any information relating to an identified or identifiable person, as defined in GDPR Article 4(1).

**Processing** -- any operation performed on personal data, including collection, recording, storage, retrieval, use, transmission, and deletion.

**Data Subjects** -- individuals whose personal data is processed under this DPA (primarily callers to Client's business).

**Sub-processor** -- any third party engaged by ClawOps to process personal data on behalf of the Client.

---

## 2. Scope and Purpose of Processing

| Detail | Description |
|---|---|
| **Nature of processing** | Receiving, recording, transcribing, and routing inbound voice calls via AI |
| **Purpose** | Delivering the AI Voice Receptionist service as described in the Service Agreement |
| **Categories of data subjects** | Callers to the Client's business phone lines |
| **Types of personal data** | Phone numbers, voice recordings, call transcripts, names (when provided by caller), appointment details, messages left by callers |
| **Duration** | For the term of the related Service Agreement, plus retention periods below |

---

## 3. Lawful Basis

The Controller is responsible for establishing and documenting a lawful basis for processing under GDPR Article 6. ClawOps recommends:

- **Legitimate interest** (Article 6(1)(f)) -- for general business call handling
- **Consent** -- where required by local law for call recording

ClawOps supports the Controller's compliance by providing caller transparency features (see Section 5).

---

## 4. ClawOps Obligations

ClawOps will:

1. Process personal data only on documented instructions from the Controller, unless required by law
2. Ensure all personnel with access to personal data are bound by confidentiality obligations
3. Implement appropriate technical and organizational security measures (encryption in transit and at rest, access controls, regular security reviews)
4. Assist the Controller with data subject rights requests (access, rectification, erasure, portability) within 10 business days
5. Assist the Controller with Data Protection Impact Assessments where required
6. Delete or return all personal data at the end of the service, at the Controller's choice
7. Make available all information necessary to demonstrate compliance and allow for audits (see Section 9)

---

## 5. Caller Transparency

All calls handled by the AI Voice Receptionist will begin with a clear disclosure that the caller is speaking with an AI system. The standard disclosure is:

> "Thank you for calling [Business Name]. You are speaking with an AI assistant. This call may be recorded for quality and service purposes."

The Controller may customize this disclosure, provided it remains clear and truthful. ClawOps will implement the approved disclosure before the service goes live.

---

## 6. Sub-processors

ClawOps uses the following sub-processors as of the Effective Date:

| Sub-processor | Purpose | Location |
|---|---|---|
| **Twilio Inc.** | Telephony infrastructure, call routing, phone numbers | United States |
| **OpenAI, Inc.** | AI language model for conversation processing | United States |
| **Hosting Provider** (AWS / Vercel / Railway -- as applicable) | Application hosting, data storage | United States |

**Changes.** ClawOps will notify the Controller at least 30 days before adding or replacing a sub-processor. The Controller may object in writing within 15 days. If the objection cannot be reasonably resolved, the Controller may terminate the related Service Agreement without penalty.

**Sub-processor obligations.** ClawOps will ensure each sub-processor is bound by data protection obligations no less protective than those in this DPA.

---

## 7. Data Retention

| Data Type | Retention Period | After Retention |
|---|---|---|
| Voice recordings | 90 days from date of call | Automatically deleted |
| Call transcripts | 12 months from date of call | Automatically deleted |
| Call metadata (phone number, duration, timestamp) | 12 months from date of call | Automatically deleted |
| Aggregated/anonymized analytics | Indefinite (no personal data) | N/A |

The Controller may request early deletion of specific records at any time. ClawOps will process such requests within 30 days.

---

## 8. Security Breach Notification

In the event of a personal data breach:

1. ClawOps will notify the Controller **within 72 hours** of becoming aware of the breach
2. Notification will include: nature of the breach, categories and approximate number of data subjects affected, likely consequences, and measures taken or proposed to address the breach
3. ClawOps will cooperate fully with the Controller's breach response and any supervisory authority investigation
4. ClawOps will document all breaches, including facts, effects, and remedial action taken

---

## 9. Audits

The Controller has the right to audit ClawOps' compliance with this DPA:

- **Frequency:** Once per 12-month period, or following a security incident
- **Notice:** At least 30 days written notice
- **Scope:** Processing activities, security measures, sub-processor compliance
- **Method:** On-site inspection, remote review of documentation, or engagement of a mutually agreed independent auditor
- **Cost:** Controller bears audit costs, except where the audit reveals material non-compliance (in which case ClawOps bears costs)

ClawOps will provide reasonable cooperation and access to relevant records, systems, and personnel.

---

## 10. International Data Transfers

Personal data processed under this DPA may be transferred from the EEA/UK to the United States, where ClawOps and its sub-processors are located.

These transfers are governed by:

- **EU Standard Contractual Clauses (SCCs)** -- Commission Implementing Decision (EU) 2021/914, Module Two (Controller to Processor). The SCCs are incorporated by reference into this DPA.
- **UK International Data Transfer Addendum** -- where the Controller is subject to UK GDPR, the UK Addendum to the EU SCCs applies.

ClawOps will implement supplementary measures as needed, including encryption and access controls, to ensure an adequate level of data protection.

---

## 11. Data Subject Rights

When ClawOps receives a request directly from a data subject, it will:

1. Promptly redirect the data subject to the Controller
2. Notify the Controller within 5 business days
3. Assist the Controller in fulfilling the request within the GDPR's required timeframes

ClawOps will not independently respond to data subject requests unless instructed by the Controller.

---

## 12. Term and Termination

This DPA remains in effect for the duration of the related Service Agreement. Upon termination:

- ClawOps will, at the Controller's written election, either return or delete all personal data within 60 days
- If no election is made, ClawOps will delete all personal data within 90 days of termination
- Obligations related to confidentiality, security, and breach notification survive termination

---

## 13. Governing Law

This DPA is governed by the laws of Ireland for matters relating to GDPR compliance, and the laws of Delaware for all other matters. Where conflict exists, GDPR requirements prevail.

---

## 14. Signatures

| | **Controller (Client)** | **Processor (ClawOps)** |
|---|---|---|
| Signature | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Name | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Title | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Date | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |

---

**Appendix: Standard Contractual Clauses**

The EU Standard Contractual Clauses (Module Two: Controller to Processor) adopted under Commission Implementing Decision (EU) 2021/914 are incorporated by reference. A full copy is available at:

https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj

The following selections apply:

- **Clause 7:** Optional docking clause -- included
- **Clause 9(a):** General written authorization for sub-processors (with notification and objection rights per Section 6)
- **Clause 11:** Independent dispute resolution body -- not included
- **Clause 17:** Governing law -- Ireland
- **Clause 18:** Forum -- Courts of Ireland

---

*ClawOps LLC | theclawops.com | hello@theclawops.com*
