# ClawOps Shared Responsibility Matrix

**Version 1.0 - February 23, 2026**

> This one-page matrix defines who owns what in every ClawOps engagement. Review with every new client during onboarding.

---

## Responsibility Key

| Symbol | Meaning |
|--------|---------|
| **C** | **ClawOps** - We own this |
| **X** | **Client** - You own this |
| **S** | **Shared** - We both contribute |

---

## Security and Access

| Responsibility | ClawOps | Client |
|---------------|---------|--------|
| Secure storage of credentials provided to us | **C** | |
| API key management during engagement | **C** | |
| Access control to Client's own systems | | **X** |
| Multi-factor authentication on Client accounts | | **X** |
| Encryption of data in transit (our systems) | **C** | |
| Encryption of data at rest (our systems) | **C** | |
| Security of Client's own infrastructure | | **X** |
| Reporting security incidents | **S** | **S** |

---

## Data and Privacy

| Responsibility | ClawOps | Client |
|---------------|---------|--------|
| Data encryption within our systems | **C** | |
| Lawful basis for data processing | | **X** |
| Obtaining end-user/data subject consents | | **X** |
| Sub-processor due diligence | **C** | |
| Data retention and deletion (per schedule) | **C** | |
| Accuracy and legality of data provided to us | | **X** |
| Compliance with HIPAA, SOX, PCI-DSS, etc. | | **X** |
| Data backup (Client's own data) | | **X** |
| Privacy impact assessments (if required) | **S** | **S** |

---

## Automation Delivery

| Responsibility | ClawOps | Client |
|---------------|---------|--------|
| Automation design and logic | **C** | |
| Accuracy of automation (as documented in SOW) | **C** | |
| Providing required data and access | | **X** |
| Timely feedback and approvals | | **X** |
| Documentation of delivered automations | **C** | |
| Review and testing before production | | **X** |
| Production deployment decision | | **X** |
| Monitoring automations in production | | **X** |
| Bug fixes during support period | **C** | |

---

## AI Outputs

| Responsibility | ClawOps | Client |
|---------------|---------|--------|
| Selecting appropriate AI models | **C** | |
| Prompt engineering and optimization | **C** | |
| Reviewing AI outputs before business use | | **X** |
| Business decisions based on AI outputs | | **X** |
| Compliance when using AI-generated content | | **X** |
| Disclosing AI use to end users (if required) | | **X** |

---

## Intellectual Property

| Responsibility | ClawOps | Client |
|---------------|---------|--------|
| Ownership of Pre-Existing IP (templates, tools) | **C** | |
| Ownership of Client Materials | | **X** |
| Ownership of Deliverables (upon full payment) | | **X** |
| License for Pre-Existing IP in Deliverables | **C** | |
| Third-party IP clearance for Client Materials | | **X** |

---

## Communication and Project Management

| Responsibility | ClawOps | Client |
|---------------|---------|--------|
| Regular project updates | **C** | |
| Designated point of contact | **S** | **S** |
| Scope change requests (written change orders) | **S** | **S** |
| Timely responses (within 5 business days) | **S** | **S** |

---

## Visual Summary

```
+------------------------------------------------------------------+
|                     CLIENT RESPONSIBILITY                         |
|                                                                   |
|  - Data accuracy and legality                                     |
|  - End-user consents                                              |
|  - Business decisions from AI outputs                             |
|  - Access control to your own systems                             |
|  - Industry-specific compliance (HIPAA, SOX, etc.)                |
|  - Review and test before production                              |
|  - Monitor automations in production                              |
|  - Maintain your own data backups                                 |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|                     SHARED RESPONSIBILITY                         |
|                                                                   |
|  - Scope change communication                                    |
|  - Security incident reporting (within 24 hours)                  |
|  - Timely responses and feedback                                  |
|  - Confidentiality of shared information                          |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|                    CLAWOPS RESPONSIBILITY                         |
|                                                                   |
|  - Secure credential handling                                     |
|  - API key management                                             |
|  - Automation logic accuracy (per SOW)                            |
|  - Sub-processor due diligence                                    |
|  - Data encryption (transit and at rest)                          |
|  - Data deletion per retention schedule                           |
|  - Automation documentation                                       |
+------------------------------------------------------------------+
```

---

**Questions?** Contact rickclaw08@gmail.com

*ClawOps Shared Responsibility Matrix v1.0 - February 23, 2026*
*Rick Claw | ClawOps*
