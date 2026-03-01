# ClawOps Technical Architecture

> **Version:** 1.0
> **Last Updated:** 2026-02-23
> **Author:** ClawOps Engineering
> **Classification:** Internal / Client-Shareable

---

## 1. Overview

ClawOps delivers automation solutions using a curated, battle-tested stack. Every tool in our ecosystem was selected through a rigorous evaluation process, dogfooded internally, and proven across multiple client engagements.

Our architecture follows three principles borrowed from trillion-dollar engineering organizations:

1. **Platform, not projects.** We build from composable, reusable components.
2. **Cost as a requirement.** Every architectural decision includes cost analysis.
3. **Own the bottleneck.** Our AI orchestration layer and integration expertise are our differentiators.

---

## 2. Standard Automation Stack

### 2.1 Core Tools

| Layer | Tool | Role | When We Use It |
|-------|------|------|----------------|
| **Orchestration (Visual)** | Zapier | No-code automation for simple, linear workflows | Client preference, < 100 runs/mo, fast prototyping |
| **Orchestration (Visual)** | Make (Integromat) | Mid-complexity visual workflows with branching logic | Multi-step workflows, data transformation, moderate scale |
| **Orchestration (Self-Hosted)** | n8n | Full-control automation for complex, high-volume workflows | High volume, sensitive data, custom integrations, cost optimization |
| **Scripting** | Python | Custom logic, data processing, API integrations | Complex transformations, ML pipelines, anything beyond visual builder capability |
| **Scripting** | Google Apps Script | Google Workspace automation (Sheets, Docs, Gmail, Calendar) | Clients on Google Workspace, spreadsheet-driven workflows |
| **AI Layer** | OpenAI API (GPT-4, etc.) | Natural language processing, content generation, classification | Lead scoring, email drafting, data extraction, summarization |
| **AI Orchestration** | OpenClaw Agent Swarm | Multi-agent AI task execution, research, monitoring | Complex AI tasks requiring reasoning, tool use, and coordination |

### 2.2 Supporting Infrastructure

| Component | Tool | Purpose |
|-----------|------|---------|
| **Version Control** | GitHub | All code, workflow exports (JSON), documentation |
| **Hosting** | GitHub Pages | Client-facing sites, status dashboards |
| **Monitoring** | n8n Error Workflows + Slack/Email | Real-time automation failure alerts |
| **Data Storage** | Google Sheets, Airtable, PostgreSQL | Depends on client scale and requirements |
| **Authentication** | OAuth 2.0, API Keys, Service Accounts | Secure third-party integrations |
| **Communication** | Slack, Email (Gmail API), SMS (Twilio) | Notifications, alerts, client communication |
| **Cloud Services** | Google Cloud Platform (GCP) | Service accounts, APIs, cloud functions when needed |

---

## 3. Tiered Solution Architecture

We match solutions to client needs using a tiered model. No over-engineering, no under-building.

```
+------------------------------------------------------------------+
|                     SOLUTION TIER MODEL                          |
+------------------------------------------------------------------+
|                                                                  |
|  BRONZE - Zapier                                                 |
|  Best for: Simple triggers, < 100 runs/mo, non-technical clients |
|  Cost: $$$ per run (highest marginal cost)                       |
|  Build time: Hours                                               |
|  Maintenance: Minimal                                            |
|                                                                  |
|  SILVER - Make.com                                               |
|  Best for: Multi-step workflows, data transformation, moderate   |
|            volume                                                |
|  Cost: $$ per run                                                |
|  Build time: Hours to days                                       |
|  Maintenance: Low                                                |
|                                                                  |
|  GOLD - n8n (Self-Hosted)                                        |
|  Best for: High volume, sensitive data, complex logic, custom    |
|            integrations                                          |
|  Cost: $ per run (lowest at scale)                               |
|  Build time: Days                                                |
|  Maintenance: Moderate (self-hosted infrastructure)              |
|                                                                  |
|  PLATINUM - Custom Code + OpenClaw Agents                        |
|  Best for: AI-native workflows, multi-system orchestration,      |
|            tasks requiring reasoning                             |
|  Cost: $ per run (lowest marginal cost, highest setup cost)      |
|  Build time: Days to weeks                                       |
|  Maintenance: Moderate to high                                   |
|                                                                  |
+------------------------------------------------------------------+
```

### Tier Selection Criteria

| Factor | Bronze (Zapier) | Silver (Make) | Gold (n8n) | Platinum (Custom) |
|--------|----------------|---------------|------------|-------------------|
| Monthly runs | < 100 | 100 - 5,000 | 5,000+ | Any |
| Complexity | Linear, 2-5 steps | Branching, 5-15 steps | Complex, 15+ steps | AI reasoning required |
| Data sensitivity | Low | Low-Medium | High | High |
| Client technical skill | Non-technical | Some technical | Technical team | Technical team |
| Time to deliver | Same day | 1-3 days | 3-7 days | 1-3 weeks |
| Monthly platform cost | $20-70 | $10-30 | $5-20 (hosting) | Variable |

---

## 4. Standard Project Architecture

Every ClawOps automation follows this layered architecture pattern:

```
+===================================================================+
|                     CLAWOPS PROJECT ARCHITECTURE                  |
+===================================================================+
|                                                                   |
|   LAYER 1: TRIGGERS                                               |
|   +-----------------------------------------------------------+   |
|   | Form Submit | Webhook | Schedule | Email | File Upload    |   |
|   | API Event   | Database Change | Manual Trigger            |   |
|   +-----------------------------------------------------------+   |
|           |               |               |                       |
|           v               v               v                       |
|   LAYER 2: INPUT VALIDATION & ROUTING                             |
|   +-----------------------------------------------------------+   |
|   | Schema Validation | Deduplication | Conditional Routing    |   |
|   | Error Handling    | Rate Limiting  | Authentication Check  |   |
|   +-----------------------------------------------------------+   |
|           |               |               |                       |
|           v               v               v                       |
|   LAYER 3: PROCESSING & TRANSFORMATION                            |
|   +-----------------------------------------------------------+   |
|   | Data Mapping    | AI Processing (OpenAI)                  |   |
|   | Business Logic  | Enrichment (API lookups)                |   |
|   | Calculations    | Format Conversion                       |   |
|   +-----------------------------------------------------------+   |
|           |               |               |                       |
|           v               v               v                       |
|   LAYER 4: ACTIONS & INTEGRATIONS                                 |
|   +-----------------------------------------------------------+   |
|   | CRM Update  | Database Write | Email Send  | Slack Post   |   |
|   | Sheet Update | PDF Generate  | API Call    | File Create   |   |
|   +-----------------------------------------------------------+   |
|           |               |               |                       |
|           v               v               v                       |
|   LAYER 5: MONITORING & FEEDBACK                                  |
|   +-----------------------------------------------------------+   |
|   | Execution Logging | Error Alerts | Cost Tracking           |   |
|   | Performance Metrics | Audit Trail | Client Dashboard       |   |
|   +-----------------------------------------------------------+   |
|                                                                   |
+===================================================================+
```

### Architecture Principles

1. **Every workflow has error handling.** No exceptions. Every step has a failure path.
2. **Every workflow has logging.** We track what ran, when, and what it cost.
3. **Every workflow has alerting.** Failures trigger notifications within 5 minutes.
4. **Data flows one direction.** Trigger > Validate > Process > Act > Log. No circular dependencies.
5. **Credentials are centralized.** OAuth tokens, API keys, and service accounts live in a secure credential store, never hardcoded.

---

## 5. Tool Evaluation Framework

Before adding any tool to our stack, it must pass this evaluation process. Inspired by Amazon's two-way door test and Apple's dogfooding approach.

### 5.1 Evaluation Criteria

| Criterion | Weight | Questions to Answer |
|-----------|--------|---------------------|
| **Client Value** | 30% | Does it help us serve clients better, faster, or cheaper? |
| **Reversibility** | 20% | Can we switch away in under one week? Is this a two-way door? |
| **Cost Efficiency** | 15% | What is the per-unit cost? How does it scale? |
| **Integration** | 15% | Does it connect with our existing stack? API quality? |
| **Reliability** | 10% | Uptime track record? SLA? Community/support quality? |
| **Security** | 10% | SOC 2 compliant? Data handling policies? OAuth support? |

### 5.2 Evaluation Process

```
Step 1: IDENTIFY NEED
  - A real client project or internal process requires a capability
  - Not: "this looks cool, let's try it"

Step 2: SURVEY OPTIONS
  - Identify 2-3 alternatives (including "build it ourselves")
  - Score each against criteria above

Step 3: DOGFOOD TEST (2 weeks)
  - Use the tool for an internal ClawOps process
  - Track: time saved, cost, reliability, pain points
  - If it doesn't work for us, don't recommend it to clients

Step 4: PILOT WITH ONE CLIENT (90 days)
  - Deploy for one client project with defined success metrics
  - Document: setup time, integration challenges, client feedback

Step 5: ADOPT OR ABANDON
  - At 90 days: full adoption, abandon, or extend with justification
  - If adopted: add to this document, create integration playbook
  - If abandoned: document why (prevents re-evaluation later)
```

### 5.3 Current Tool Evaluations

| Tool | Status | Notes |
|------|--------|-------|
| Zapier | Adopted | Best for quick, simple automations. Cost concern at scale. |
| Make.com | Adopted | Strong mid-tier option. Good data transformation. |
| n8n | Adopted (Primary) | Self-hosted for cost control. Most flexible. |
| Python | Adopted | Custom logic, data science, API work. |
| Google Apps Script | Adopted | Google Workspace native automation. |
| OpenAI API | Adopted | Primary AI provider. Multi-model strategy in progress. |
| Airtable | Evaluating | Database for non-technical clients. Good API. |
| Supabase | Evaluating | PostgreSQL-based. Better for technical implementations. |

---

## 6. Delivery Methodology

### 6.1 Project Lifecycle

```
PHASE 1: DISCOVERY (1-2 days)
  - Client intake call
  - Document current manual processes
  - Identify automation opportunities
  - Estimate ROI and cost savings
  |
  v
PHASE 2: BLUEPRINT (1-2 days)
  - Create Solution Blueprint (see template)
  - Select tools and tier
  - Define data flows and integration points
  - Client review and approval
  |
  v
PHASE 3: BUILD (3-10 days)
  - Implement automation workflows
  - Set up integrations and credentials
  - Build error handling and logging
  - Internal QA (see QA Checklist)
  |
  v
PHASE 4: TEST (1-3 days)
  - End-to-end testing with real data
  - Edge case and failure testing
  - Performance/load testing (if applicable)
  - Client UAT (User Acceptance Testing)
  |
  v
PHASE 5: DEPLOY (1 day)
  - Production deployment
  - Monitoring setup and verification
  - Documentation delivery
  - Client training session
  |
  v
PHASE 6: MONITOR & OPTIMIZE (ongoing)
  - 30-day hypercare period
  - Weekly check-ins during first month
  - Monthly health reviews after stabilization
  - 90-day automation review
```

### 6.2 Documentation Deliverables

Every project ships with four documents:

| Document | Purpose | Audience |
|----------|---------|----------|
| `README.md` | What it does, business logic, trigger conditions | Client + ClawOps |
| `ARCHITECTURE.md` | Data flow diagram, systems involved, credentials needed | ClawOps + Client technical team |
| `RUNBOOK.md` | How to monitor, common failures, restart procedures | ClawOps + Client ops team |
| `COSTS.md` | Monthly cost breakdown, optimization opportunities | Client decision-makers |

### 6.3 Version Control Standards

- All n8n workflows exported as JSON and stored in Git
- Make/Zapier configurations documented with screenshots and config exports
- Agent configurations versioned in Git
- Every change committed with descriptive messages
- Rule: **If it is not in version control, it does not exist.**

---

## 7. Security Architecture

### 7.1 Credential Management

- OAuth 2.0 for all integrations that support it
- API keys stored in platform-native credential stores (n8n credentials, Zapier connected accounts)
- Service account keys stored securely, never in code repositories
- Credential rotation schedule: every 90 days for API keys, per-provider policy for OAuth

### 7.2 Data Handling

- Client data processed in-transit only (no persistent storage unless required)
- PII handling follows client data classification policy
- AI API calls: no training data opt-in; use enterprise API tiers
- Audit logging for all data access and transformations

### 7.3 Access Control

- Principle of least privilege for all integrations
- Separate credentials per client (no shared API keys across clients)
- Client credential ownership: clients own their own API keys and OAuth tokens
- ClawOps access revocable by client at any time

---

## 8. Cost Tracking Standards

Following Werner Vogels' Frugal Architect framework: cost is a non-functional requirement.

### 8.1 Per-Automation Cost Model

Every automation tracks:

| Cost Component | How We Track It |
|----------------|-----------------|
| Platform fees (Zapier/Make/n8n hosting) | Monthly invoice review |
| API call costs (OpenAI, third-party APIs) | Usage dashboards, billing alerts |
| Maintenance time (ClawOps hours) | Time tracking per client |
| Infrastructure (hosting, storage) | Monthly cloud billing |

### 8.2 Cost Optimization Reviews

- **Monthly:** Review per-automation costs against client value
- **Quarterly:** Evaluate tier migration opportunities (e.g., Zapier to n8n for high-volume workflows)
- **Annually:** Full stack cost audit and vendor renegotiation

---

## 9. Technology Roadmap

### Near-Term (Q1-Q2 2026)

- [ ] Complete n8n self-hosted deployment
- [ ] Build reusable template library (10+ templates)
- [ ] Establish prompt engineering library (15+ prompts)
- [ ] Implement cost tracking across all clients

### Mid-Term (Q3-Q4 2026)

- [ ] Custom n8n nodes for common patterns (@clawops/ npm scope)
- [ ] Client self-service portal (automation status, request forms)
- [ ] Multi-model AI strategy (Claude, GPT-4, local models)
- [ ] Automation-as-a-Service productized packages

### Long-Term (2027)

- [ ] Full platform offering with client portal
- [ ] Standardized automation packages with fixed pricing
- [ ] Partner ecosystem for specialized integrations
- [ ] AI agent marketplace for common business functions

---

*Built on engineering principles from organizations managing $10T+ in combined market cap. Scaled for an automation agency that delivers with the same discipline.*
