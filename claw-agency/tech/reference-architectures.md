# ClawOps Reference Architectures

> **Version:** 1.0
> **Last Updated:** 2026-02-23
> **Classification:** Internal / Client-Shareable
> **Purpose:** Proven architecture patterns for our three most common project types. Use these as starting points, not rigid blueprints.

---

## Table of Contents

1. [Data Entry Automation](#1-data-entry-automation)
2. [Email/CRM Automation](#2-emailcrm-automation)
3. [Reporting Automation](#3-reporting-automation)

---

# 1. Data Entry Automation

**Pattern:** Form -> Database -> Notification
**Frequency:** Our most common project type. ~40% of engagements follow this pattern.

---

## 1.1 Architecture Diagram

```
+===================================================================+
|              DATA ENTRY AUTOMATION - REFERENCE ARCHITECTURE        |
+===================================================================+
|                                                                   |
|   INTAKE LAYER                                                    |
|   +-----------------------------------------------------------+   |
|   |  Web Form   |  Google Form  |  Typeform  |  JotForm       |   |
|   |  (Webhook)     (API Poll)    (Webhook)    (Webhook)        |   |
|   +----------------------------+------------------------------+   |
|                                |                                  |
|                                v                                  |
|   VALIDATION LAYER                                                |
|   +-----------------------------------------------------------+   |
|   |  Required Fields Check                                     |   |
|   |  Email Format Validation                                   |   |
|   |  Duplicate Detection (lookup existing records)             |   |
|   |  Data Sanitization (trim whitespace, normalize casing)     |   |
|   +----------------------------+------------------------------+   |
|                                |                                  |
|                    +-----------+-----------+                       |
|                    |                       |                       |
|                    v                       v                       |
|              VALID DATA              INVALID DATA                  |
|                    |                       |                       |
|                    v                       v                       |
|   PROCESSING LAYER                 ERROR HANDLING                  |
|   +------------------------+   +----------------------------+     |
|   | Data Transformation    |   | Log Error Details          |     |
|   | - Field Mapping        |   | Notify Admin (Slack/Email) |     |
|   | - Calculated Fields    |   | Queue for Manual Review    |     |
|   | - Category Assignment  |   +----------------------------+     |
|   | - AI Enrichment (opt.) |                                      |
|   +-----------+------------+                                      |
|               |                                                   |
|       +-------+-------+-------+                                   |
|       |       |       |       |                                   |
|       v       v       v       v                                   |
|   DESTINATION LAYER                                               |
|   +-----------------------------------------------------------+   |
|   | Google     | Airtable  | Database  | CRM         | Other  |   |
|   | Sheets     | (API)     | (SQL)     | (API)       | (API)  |   |
|   +-----------------------------------------------------------+   |
|               |                                                   |
|               v                                                   |
|   NOTIFICATION LAYER                                              |
|   +-----------------------------------------------------------+   |
|   | Confirmation | Slack/Teams | Email to    | SMS Alert      |   |
|   | to Submitter | Channel Post| Assignee    | (optional)     |   |
|   +-----------------------------------------------------------+   |
|               |                                                   |
|               v                                                   |
|   MONITORING LAYER                                                |
|   +-----------------------------------------------------------+   |
|   | Execution Log | Error Alerts | Daily Summary | Cost Track  |   |
|   +-----------------------------------------------------------+   |
|                                                                   |
+===================================================================+
```

## 1.2 Tool Selection Rationale

| Component | Recommended Tool | Why | Alternative |
|-----------|-----------------|-----|-------------|
| **Form Platform** | Client's existing form tool | Minimize disruption; most tools have webhook support | Google Forms (free), Typeform (better UX) |
| **Automation Engine** | n8n (self-hosted) | Best for volume, lowest cost, custom validation logic | Make.com for simpler setups, Zapier for fastest build |
| **Database** | Google Sheets (small), Airtable (medium), PostgreSQL (large) | Match to client's technical comfort and data volume | Notion databases, Supabase |
| **Notification** | Slack API or Gmail API | Most clients already use one or both | Microsoft Teams, Twilio SMS |
| **AI Enrichment** | OpenAI API (GPT-4) | Category classification, lead scoring, data extraction | Skip if not needed; adds cost and complexity |

### Decision Tree: Choosing the Database

```
How many records per month?
  |
  +-- < 500 records/mo
  |     |
  |     +-- Client uses Google Workspace? --> Google Sheets
  |     +-- Client wants relational views? --> Airtable
  |
  +-- 500 - 5,000 records/mo
  |     |
  |     +-- Non-technical client? --> Airtable
  |     +-- Technical client? --> Supabase / PostgreSQL
  |
  +-- > 5,000 records/mo
        |
        +-- Always --> PostgreSQL (Supabase, Railway, or self-hosted)
```

## 1.3 Estimated Build Time

| Complexity | Description | Build Time | Total with QA |
|-----------|-------------|-----------|---------------|
| **Simple** | Single form, single sheet, email notification | 2-4 hours | 1 day |
| **Standard** | Form + validation + database + 2-3 notifications | 4-8 hours | 2-3 days |
| **Complex** | Multiple forms, AI enrichment, conditional routing, multiple databases | 2-3 days | 5-7 days |

## 1.4 Common Pitfalls

### Pitfall 1: No Duplicate Detection
**What happens:** Same person submits twice, creating duplicate records and double notifications.
**Solution:** Always implement deduplication. Check for existing records by email (or another unique identifier) before creating new ones. Decide: reject duplicates, update existing, or flag for review.

### Pitfall 2: Form Field Changes Break the Workflow
**What happens:** Client adds/removes a form field. The automation breaks because field mapping is hard-coded.
**Solution:** Use field mapping by name (not position). Add a validation step that checks for expected fields and alerts if the schema changes. Document which fields are required for the automation.

### Pitfall 3: No Error Handling on API Failures
**What happens:** Google Sheets API is temporarily down. Submissions are lost silently.
**Solution:** Always implement retry logic (3 attempts with exponential backoff). On final failure, queue the submission for manual processing and alert the admin immediately.

### Pitfall 4: Notification Fatigue
**What happens:** Client gets an alert for every single submission. They start ignoring all notifications.
**Solution:** Offer configurable notification rules. Batch notifications (hourly digest instead of per-event). Use different channels for different urgency levels (Slack for routine, SMS for critical).

### Pitfall 5: Google Sheets Row Limits
**What happens:** Client hits the 10 million cell limit in Google Sheets after 6-12 months.
**Solution:** Plan for data lifecycle from day one. Archive old records monthly. If volume is high, start with Airtable or a database instead. Set up a monitoring alert when the sheet approaches 50,000 rows.

---

# 2. Email/CRM Automation

**Pattern:** Lead Capture -> CRM Entry -> Follow-Up Sequences
**Frequency:** ~35% of engagements. Essential for any client with a sales process.

---

## 2.1 Architecture Diagram

```
+===================================================================+
|            EMAIL/CRM AUTOMATION - REFERENCE ARCHITECTURE           |
+===================================================================+
|                                                                   |
|   LEAD CAPTURE LAYER                                              |
|   +-----------------------------------------------------------+   |
|   | Website    | Landing   | Social   | Referral | Manual     |   |
|   | Contact    | Page      | Media    | Form     | Entry      |   |
|   | Form       | (Opt-in)  | Lead Ad  |          | (CRM)      |   |
|   +----------------------------+------------------------------+   |
|                                |                                  |
|                                v                                  |
|   ENRICHMENT LAYER                                                |
|   +-----------------------------------------------------------+   |
|   |  Deduplication (email match against CRM)                   |   |
|   |  Company Lookup (Clearbit, Apollo, or AI research)         |   |
|   |  Lead Scoring (AI-based or rule-based)                     |   |
|   |  Source Attribution (UTM params, referral tracking)        |   |
|   +----------------------------+------------------------------+   |
|                                |                                  |
|                                v                                  |
|   CRM LAYER                                                       |
|   +-----------------------------------------------------------+   |
|   |  Create/Update Contact Record                              |   |
|   |  Assign to Sales Rep (round-robin or territory-based)      |   |
|   |  Set Pipeline Stage (New Lead)                             |   |
|   |  Apply Tags (source, score, category)                      |   |
|   +----------------------------+------------------------------+   |
|                                |                                  |
|                    +-----------+-----------+                       |
|                    |           |           |                       |
|                    v           v           v                       |
|              HOT LEAD    WARM LEAD    COLD LEAD                    |
|              (Score 8+)  (Score 4-7)  (Score 1-3)                  |
|                    |           |           |                       |
|                    v           v           v                       |
|   FOLLOW-UP SEQUENCES                                             |
|   +-----------------------------------------------------------+   |
|   |                                                           |   |
|   |  HOT: Immediate alert to sales rep (Slack + Email)        |   |
|   |        -> Sales rep calls within 5 minutes                |   |
|   |        -> If no response in 24h: auto follow-up email     |   |
|   |                                                           |   |
|   |  WARM: Welcome email (immediate)                          |   |
|   |        -> Value email #1 (Day 2)                          |   |
|   |        -> Case study email (Day 5)                        |   |
|   |        -> Soft CTA email (Day 8)                          |   |
|   |        -> Final follow-up (Day 14)                        |   |
|   |                                                           |   |
|   |  COLD: Welcome email (immediate)                          |   |
|   |        -> Newsletter addition (ongoing)                   |   |
|   |        -> Re-engagement email (Day 30)                    |   |
|   |                                                           |   |
|   +-----------------------------------------------------------+   |
|                                                                   |
|   TRACKING LAYER                                                  |
|   +-----------------------------------------------------------+   |
|   | Email Opens | Link Clicks | Reply Detection | Unsubscribe |   |
|   | -> Update CRM record and lead score dynamically            |   |
|   +-----------------------------------------------------------+   |
|                                                                   |
|   REPORTING LAYER                                                 |
|   +-----------------------------------------------------------+   |
|   | Lead Volume | Conversion Rate | Response Time | Revenue    |   |
|   | Per-source breakdown | Sequence performance                |   |
|   +-----------------------------------------------------------+   |
|                                                                   |
+===================================================================+
```

## 2.2 Tool Selection Rationale

| Component | Recommended Tool | Why | Alternative |
|-----------|-----------------|-----|-------------|
| **CRM** | HubSpot Free/Starter | Best free tier, excellent API, built-in email sequences | Pipedrive (simpler), Salesforce (enterprise), Google Sheets (budget) |
| **Automation Engine** | n8n or Make.com | Orchestration between lead sources and CRM | Zapier (simpler), native CRM automation (limited) |
| **Email Sequences** | CRM-native (HubSpot Sequences) | Better deliverability, built-in tracking | Mailchimp, ConvertKit, custom via Gmail API |
| **Lead Enrichment** | OpenAI API for AI research | Cost-effective for small volumes; no per-lookup fees | Clearbit ($), Apollo ($), manual research |
| **Notifications** | Slack API | Real-time alerts for hot leads | Email, SMS (Twilio), Microsoft Teams |
| **Landing Pages** | Client's existing website, or Carrd | Simple lead capture without full website rebuild | HubSpot landing pages, Unbounce |

### Decision Tree: Choosing the CRM

```
Client's situation?
  |
  +-- No CRM, budget-conscious
  |     |
  |     +-- < 1,000 contacts? --> HubSpot Free
  |     +-- Just need a spreadsheet? --> Google Sheets + automation layer
  |
  +-- No CRM, willing to invest
  |     |
  |     +-- Sales-focused? --> Pipedrive or HubSpot Starter
  |     +-- Marketing-focused? --> HubSpot (best marketing tools)
  |
  +-- Has CRM already
        |
        +-- Integrate with existing --> Build automation around it
```

## 2.3 Estimated Build Time

| Complexity | Description | Build Time | Total with QA |
|-----------|-------------|-----------|---------------|
| **Simple** | Single lead source, CRM entry, welcome email | 3-5 hours | 1-2 days |
| **Standard** | Multiple sources, lead scoring, 3-email sequence, Slack alerts | 1-2 days | 3-5 days |
| **Complex** | AI enrichment, dynamic scoring, multi-branch sequences, reporting dashboard | 3-5 days | 7-10 days |

## 2.4 Common Pitfalls

### Pitfall 1: Email Deliverability Problems
**What happens:** Automated emails land in spam. Open rates are below 10%.
**Solution:** Use the CRM's native email sending (not a generic Gmail API). Set up SPF, DKIM, and DMARC records for the client's domain. Warm up sending gradually. Never send from a brand-new domain without warming.

### Pitfall 2: No Unsubscribe Mechanism
**What happens:** Recipients have no way to opt out. This violates CAN-SPAM and GDPR, risking fines and domain blacklisting.
**Solution:** Every automated email must have an unsubscribe link. Use the CRM's built-in compliance features. Maintain a suppression list. Check it before every send.

### Pitfall 3: Lead Scoring Without Feedback Loops
**What happens:** AI scores leads, but nobody validates whether high-scored leads actually convert. The model drifts.
**Solution:** Track conversion outcomes back to lead scores. Review quarterly: are high-score leads actually closing? Adjust scoring criteria based on real data, not assumptions.

### Pitfall 4: Over-Automated Follow-Ups
**What happens:** A prospect replies to the sales rep, but the automated sequence continues sending pre-written emails. The prospect feels ignored.
**Solution:** Implement reply detection. When a lead replies, pause the automated sequence immediately and hand off to the human. Most CRMs handle this natively in their sequence tools.

### Pitfall 5: No Source Attribution
**What happens:** Client gets leads but cannot tell which channel (website, social, referral) produces the best ones. Marketing budget decisions are based on guesswork.
**Solution:** Capture UTM parameters and lead source on every form. Store in CRM as a required field. Build a source-attribution report showing volume and conversion by channel.

### Pitfall 6: Round-Robin Assignment Breaks
**What happens:** Sales rep leaves or goes on vacation. Leads continue routing to them and go unworked.
**Solution:** Build the assignment logic to be configurable. Maintain an active sales rep list that the client can update without touching the automation. Add an alert if an assigned lead has no activity within 24 hours.

---

# 3. Reporting Automation

**Pattern:** Data Sources -> Aggregation -> Dashboard / PDF Report
**Frequency:** ~25% of engagements. High retention value because clients depend on these weekly/monthly.

---

## 3.1 Architecture Diagram

```
+===================================================================+
|           REPORTING AUTOMATION - REFERENCE ARCHITECTURE             |
+===================================================================+
|                                                                   |
|   DATA SOURCE LAYER                                               |
|   +-----------------------------------------------------------+   |
|   | Google     | CRM       | Ad        | Finance  | Custom    |   |
|   | Analytics  | (HubSpot, | Platforms  | (Stripe, | APIs      |   |
|   |            | Pipedrive)| (Meta,    | QBO,     |           |   |
|   |            |           | Google)   | Xero)    |           |   |
|   +----------------------------+------------------------------+   |
|                                |                                  |
|                                v                                  |
|   EXTRACTION LAYER                                                |
|   +-----------------------------------------------------------+   |
|   |  Scheduled Data Pull (daily, weekly, monthly)              |   |
|   |  API Authentication (OAuth, API keys)                      |   |
|   |  Rate Limit Management (staggered pulls)                   |   |
|   |  Error Handling (retry on failure, alert on persistent)    |   |
|   +----------------------------+------------------------------+   |
|                                |                                  |
|                                v                                  |
|   TRANSFORMATION LAYER                                            |
|   +-----------------------------------------------------------+   |
|   |  Data Cleaning (nulls, format normalization)               |   |
|   |  Aggregation (sum, average, count by period)               |   |
|   |  Calculations (YoY change, MoM growth, percentages)        |   |
|   |  KPI Computation (CAC, LTV, conversion rate, ROAS)         |   |
|   |  AI Analysis (optional: trend narrative, anomaly detection) |   |
|   +----------------------------+------------------------------+   |
|                                |                                  |
|                    +-----------+-----------+                       |
|                    |                       |                       |
|                    v                       v                       |
|   DASHBOARD OUTPUT                 PDF/EMAIL OUTPUT                |
|   +------------------------+   +----------------------------+     |
|   | Google Sheets          |   | Google Docs (template)     |     |
|   | (live, auto-updating)  |   | -> Export to PDF           |     |
|   |                        |   | -> Email to stakeholders   |     |
|   | Google Data Studio /   |   |                            |     |
|   | Looker Studio          |   | OR:                        |     |
|   | (interactive charts)   |   | HTML email with inline     |     |
|   |                        |   | metrics and charts         |     |
|   +------------------------+   +----------------------------+     |
|                                                                   |
|   DELIVERY LAYER                                                  |
|   +-----------------------------------------------------------+   |
|   | Scheduled Email   | Slack Post     | Client Portal Update  |   |
|   | (Mon 8 AM)        | (#reports)     | (GitHub Pages)        |   |
|   +-----------------------------------------------------------+   |
|                                                                   |
|   MONITORING LAYER                                                |
|   +-----------------------------------------------------------+   |
|   | Data Freshness  | Extraction     | Report Delivery        |   |
|   | Check           | Error Alerts   | Confirmation           |   |
|   +-----------------------------------------------------------+   |
|                                                                   |
+===================================================================+
```

## 3.2 Tool Selection Rationale

| Component | Recommended Tool | Why | Alternative |
|-----------|-----------------|-----|-------------|
| **Automation Engine** | n8n (self-hosted) | Scheduled triggers, complex data transformation, multiple API calls | Make.com (simpler), Python script (most flexible) |
| **Data Aggregation** | Google Sheets + Google Apps Script | Clients can view and understand the data layer; easy to customize | Airtable, PostgreSQL (for larger datasets) |
| **Dashboard** | Google Sheets (simple) or Looker Studio (advanced) | Free, shareable, auto-refreshing with connected data | Retool (internal tools), Metabase (open-source) |
| **PDF Generation** | Google Docs template + PDF export | Professional-looking, template-driven, no extra tools | Puppeteer/Playwright for HTML-to-PDF, Carbone |
| **Email Delivery** | Gmail API via Google Apps Script or n8n | Client's existing email; no additional tools needed | SendGrid (higher volume), Mailgun |
| **AI Analysis** | OpenAI API (GPT-4) | Generate narrative summaries of data trends | Skip if client prefers raw numbers only |
| **Scheduling** | n8n Cron trigger or Google Apps Script time trigger | Reliable, configurable, no additional tools | cron job on VPS, cloud scheduler |

### Decision Tree: Choosing the Report Format

```
Who reads the report?
  |
  +-- Executive / Non-technical
  |     |
  |     +-- Wants it in their inbox? --> PDF via email (weekly/monthly)
  |     +-- Wants to explore data? --> Looker Studio dashboard
  |
  +-- Operations / Manager
  |     |
  |     +-- Needs real-time data? --> Google Sheets (live dashboard)
  |     +-- Needs periodic snapshot? --> PDF or Slack summary
  |
  +-- Technical / Data team
        |
        +-- Wants raw data access? --> Google Sheets or database export
        +-- Wants visualization? --> Looker Studio with drill-down
```

## 3.3 Estimated Build Time

| Complexity | Description | Build Time | Total with QA |
|-----------|-------------|-----------|---------------|
| **Simple** | Single data source, summary table, email delivery | 3-6 hours | 1-2 days |
| **Standard** | 2-3 data sources, KPI calculations, formatted PDF, scheduled email | 1-2 days | 3-5 days |
| **Complex** | 4+ data sources, AI narrative, interactive dashboard, multi-recipient delivery | 3-5 days | 7-10 days |

## 3.4 Common Pitfalls

### Pitfall 1: API Rate Limits During Data Extraction
**What happens:** Pulling data from multiple APIs simultaneously hits rate limits. Some data is missing from the report.
**Solution:** Stagger API calls with delays between them. Implement retry logic with exponential backoff. Pull data in off-peak hours (early morning). Cache data locally to reduce redundant calls.

### Pitfall 2: Stale Data Without Anyone Noticing
**What happens:** An API credential expires or a data source changes its schema. The report continues to generate with old data, and nobody realizes it is outdated.
**Solution:** Add a "data freshness" check to every report. Include a "Last Updated" timestamp per data source. Alert the admin if any source has not refreshed in the expected window. Follows Vogels' Law: "Unobserved systems lead to unknown costs."

### Pitfall 3: Report Template Breaks with Data Changes
**What happens:** A new product line is added, or a metric name changes. The report template cannot accommodate the new data structure.
**Solution:** Design templates to be data-driven, not hardcoded. Use dynamic ranges in Google Sheets. Build the template to handle variable numbers of rows/categories. Document which data fields the template depends on.

### Pitfall 4: Over-Designed Dashboards Nobody Uses
**What happens:** We build a beautiful 10-tab dashboard with 30 charts. The client only ever looks at 3 numbers.
**Solution:** Start with the 3-5 KPIs the client actually uses for decisions. Build the simplest possible report first. Add complexity only when the client requests it. Ask: "What decision do you make with this data?" If they cannot answer, the metric does not belong in the report.

### Pitfall 5: PDF Formatting Issues
**What happens:** Data with variable lengths (long names, large numbers) breaks the PDF layout. Tables overflow, text gets clipped.
**Solution:** Test with real data that includes edge cases (longest names, largest numbers, empty fields). Use Google Docs templates with auto-sizing tables. Set maximum character limits for variable fields. Always generate a test PDF before the first scheduled send.

### Pitfall 6: Time Zone Confusion in Scheduled Reports
**What happens:** Report is scheduled for "Monday 8 AM" but runs in UTC instead of the client's time zone. Data for "this week" is shifted by several hours.
**Solution:** Explicitly set time zones in the scheduling tool and in data queries. Document the time zone in the report header. Test by verifying that date boundaries match the client's expectations.

### Pitfall 7: No Historical Comparison
**What happens:** Client receives this week's numbers but has no context for whether they are good or bad.
**Solution:** Always include period-over-period comparison (week-over-week, month-over-month, year-over-year). Add trend indicators (up/down arrows, percentage change). If possible, include a 4-12 week trendline.

---

## Cross-Reference: Choosing the Right Architecture

| Client Need | Primary Pattern | Combine With |
|------------|-----------------|-------------|
| "We manually enter form data into spreadsheets" | Data Entry (#1) | Reporting (#3) for weekly summaries |
| "We lose track of leads from our website" | Email/CRM (#2) | Data Entry (#1) if data goes to multiple systems |
| "We spend 4 hours every Monday making reports" | Reporting (#3) | Data Entry (#1) if source data is manually entered |
| "We need a complete sales pipeline system" | Email/CRM (#2) | Reporting (#3) for pipeline reports |
| "We get form submissions and need to follow up" | Data Entry (#1) + Email/CRM (#2) | Combined pattern |

---

*These reference architectures are starting points. Every client engagement is unique, but the patterns repeat. Start here, customize for the client's specific needs, tools, and budget.*
