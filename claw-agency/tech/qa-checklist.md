# ClawOps Quality Assurance Checklist

> **Version:** 1.0
> **Last Updated:** 2026-02-23
> **Classification:** Internal Only
> **Purpose:** Every automation we deliver must pass this checklist before going to production. No exceptions.

---

## How to Use This Checklist

1. Start the QA process after the build phase is complete.
2. Work through each section in order.
3. Mark each item: PASS, FAIL, or N/A (with justification).
4. All FAIL items must be resolved before deployment.
5. The completed checklist is saved with project documentation.
6. Both ClawOps lead and client sign off before go-live.

---

## Project Information

| Field | Value |
|-------|-------|
| **Project Name** | |
| **Client** | |
| **Project Code** | CLW-YYYY-NNN |
| **QA Date** | |
| **QA Performed By** | |
| **Build Completed By** | |
| **Solution Tier** | Bronze / Silver / Gold / Platinum |
| **Automation Platform** | Zapier / Make / n8n / Custom |

---

## 1. Functional Testing

> Does the automation do what it is supposed to do?

### 1.1 Happy Path Testing

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1.1.1 | Trigger fires correctly when expected event occurs | [ ] | |
| 1.1.2 | All data fields are captured and mapped correctly | [ ] | |
| 1.1.3 | Data transformations produce expected output | [ ] | |
| 1.1.4 | All destination systems receive correct data | [ ] | |
| 1.1.5 | Notifications are sent to the right recipients | [ ] | |
| 1.1.6 | Email/message content is accurate and properly formatted | [ ] | |
| 1.1.7 | Conditional logic (if/else branches) routes correctly | [ ] | |
| 1.1.8 | AI components (if any) return expected quality of output | [ ] | |
| 1.1.9 | End-to-end workflow completes within expected time (< 2 min for real-time, within schedule for batch) | [ ] | |
| 1.1.10 | Output matches client-approved specification | [ ] | |

### 1.2 Edge Case Testing

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1.2.1 | Empty/null fields handled gracefully (no crashes, sensible defaults) | [ ] | |
| 1.2.2 | Extra-long text input handled (no truncation without warning) | [ ] | |
| 1.2.3 | Special characters handled (Unicode, accented letters, emojis) | [ ] | |
| 1.2.4 | Numeric edge cases handled (zero, negative, very large numbers) | [ ] | |
| 1.2.5 | Date/time edge cases handled (time zones, DST transitions, end of month) | [ ] | |
| 1.2.6 | Duplicate submissions handled (dedup, update, or flag) | [ ] | |
| 1.2.7 | Rapid successive triggers handled (no race conditions) | [ ] | |
| 1.2.8 | HTML/script injection in text fields handled safely | [ ] | |

### 1.3 Negative Testing

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1.3.1 | Invalid input is rejected with appropriate error handling | [ ] | |
| 1.3.2 | Missing required fields trigger validation error (not silent failure) | [ ] | |
| 1.3.3 | Authentication failure is handled (expired token, revoked access) | [ ] | |
| 1.3.4 | API rate limit is handled (queue, retry, or alert) | [ ] | |
| 1.3.5 | Downstream service unavailable is handled (retry, alert, no data loss) | [ ] | |
| 1.3.6 | Malformed API response is handled (schema change, unexpected format) | [ ] | |

---

## 2. Error Handling and Recovery

> When things go wrong, does the automation fail safely?

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.1 | Every workflow step has an error path defined | [ ] | |
| 2.2 | Errors are logged with sufficient detail for debugging (timestamp, step, input, error message) | [ ] | |
| 2.3 | Error notifications are sent within 5 minutes of failure | [ ] | |
| 2.4 | Error notifications go to the right person (ClawOps during hypercare, client after handoff) | [ ] | |
| 2.5 | Retry logic is implemented for transient failures (3 attempts, exponential backoff) | [ ] | |
| 2.6 | Partial failures do not leave data in an inconsistent state | [ ] | |
| 2.7 | Failed items are queued for manual review (not silently dropped) | [ ] | |
| 2.8 | The automation can be restarted without causing duplicates | [ ] | |
| 2.9 | A "circuit breaker" exists: after N consecutive failures, automation pauses and alerts (prevents runaway errors) | [ ] | |

---

## 3. Security Review

> Is client data handled securely and responsibly?

### 3.1 Authentication and Credentials

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.1.1 | All API keys and tokens are stored in the platform's credential store (never hardcoded in workflows) | [ ] | |
| 3.1.2 | OAuth 2.0 is used where available (preferred over API keys) | [ ] | |
| 3.1.3 | Credentials use minimum required permissions (principle of least privilege) | [ ] | |
| 3.1.4 | Each client has separate credentials (no shared keys across clients) | [ ] | |
| 3.1.5 | Client owns their credentials and can revoke ClawOps access at any time | [ ] | |
| 3.1.6 | Credential rotation schedule is documented (90 days for API keys) | [ ] | |
| 3.1.7 | No credentials appear in logs, error messages, or notifications | [ ] | |

### 3.2 Data Protection

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.2.1 | PII is identified and handled per client's data classification policy | [ ] | |
| 3.2.2 | Data is not stored in intermediate locations without purpose and documentation | [ ] | |
| 3.2.3 | AI API calls do not opt in to training data usage (enterprise API tiers) | [ ] | |
| 3.2.4 | Data retention periods are defined and documented | [ ] | |
| 3.2.5 | No client data is exposed in URLs, webhook endpoints, or public-facing surfaces | [ ] | |
| 3.2.6 | HTTPS is used for all data transmission (no HTTP endpoints) | [ ] | |

### 3.3 Compliance

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.3.1 | Email automation includes unsubscribe mechanism (CAN-SPAM, GDPR) | [ ] | |
| 3.3.2 | Data processing complies with client's stated privacy requirements | [ ] | |
| 3.3.3 | Cross-border data transfer is identified and addressed (if applicable) | [ ] | |

---

## 4. Performance and Reliability

> Will this automation hold up under real-world conditions?

### 4.1 Performance Benchmarks

| # | Check | Target | Actual | Status |
|---|-------|--------|--------|--------|
| 4.1.1 | Trigger-to-completion time (real-time workflows) | < 2 minutes | | [ ] |
| 4.1.2 | Trigger-to-completion time (batch/scheduled) | Within scheduled window | | [ ] |
| 4.1.3 | API call count per execution | Minimized (no redundant calls) | | [ ] |
| 4.1.4 | Handles expected daily volume without queuing | [X events/day] | | [ ] |
| 4.1.5 | Handles 3x expected volume (burst capacity) | [3X events/day] | | [ ] |

### 4.2 Reliability

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.2.1 | Automation has been tested over 24+ hours without intervention | [ ] | |
| 4.2.2 | Scheduled automations fire at the correct time in the correct time zone | [ ] | |
| 4.2.3 | Webhook endpoints are validated (correct URL, authentication working) | [ ] | |
| 4.2.4 | Platform uptime is adequate for client needs (check provider SLA) | [ ] | |
| 4.2.5 | No single point of failure that would cause total data loss | [ ] | |

---

## 5. Monitoring and Observability

> Can we see what is happening after deployment?

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 5.1 | Execution logging is enabled (every run recorded with timestamp and status) | [ ] | |
| 5.2 | Error alerts are configured and tested (confirmed delivery to correct recipient) | [ ] | |
| 5.3 | Success metrics are trackable (how many runs, how many successes, how many failures) | [ ] | |
| 5.4 | Cost tracking is in place (API usage, platform execution counts) | [ ] | |
| 5.5 | A "heartbeat" check exists: if the automation should run daily, alert if it has not run in 36 hours | [ ] | |
| 5.6 | Log retention period is defined (recommendation: 90 days minimum) | [ ] | |
| 5.7 | Dashboard or summary view exists for at-a-glance health check | [ ] | |

---

## 6. Documentation

> If someone else needs to maintain this, can they?

### 6.1 Delivered Documents

| # | Document | Complete | Location |
|---|----------|----------|----------|
| 6.1.1 | **README.md** - What it does, business logic, trigger conditions | [ ] | |
| 6.1.2 | **ARCHITECTURE.md** - Data flow diagram, systems, credential inventory | [ ] | |
| 6.1.3 | **RUNBOOK.md** - Monitoring, common failures, restart procedures | [ ] | |
| 6.1.4 | **COSTS.md** - Monthly cost breakdown, optimization opportunities | [ ] | |

### 6.2 Documentation Quality

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 6.2.1 | Documentation is accurate (matches the actual implementation) | [ ] | |
| 6.2.2 | All third-party services and APIs are listed with version/endpoint info | [ ] | |
| 6.2.3 | Credential inventory lists every credential, its type, its owner, and rotation schedule | [ ] | |
| 6.2.4 | Common failure scenarios are documented with resolution steps | [ ] | |
| 6.2.5 | Contact information for support escalation is included | [ ] | |
| 6.2.6 | Screenshots or diagrams are included where they aid understanding | [ ] | |

### 6.3 Version Control

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 6.3.1 | Workflow is exported and stored in Git (n8n JSON, Make blueprint, or equivalent) | [ ] | |
| 6.3.2 | Documentation is stored alongside the workflow export | [ ] | |
| 6.3.3 | Commit message describes what the automation does and its current version | [ ] | |
| 6.3.4 | Agent configurations (if any) are versioned and documented | [ ] | |

---

## 7. Client Acceptance Criteria

> Does the client agree this is ready for production?

### 7.1 Pre-UAT Checklist (ClawOps Internal)

| # | Check | Status |
|---|-------|--------|
| 7.1.1 | All items in Sections 1-6 are PASS or N/A (justified) | [ ] |
| 7.1.2 | Internal demo completed successfully | [ ] |
| 7.1.3 | Test data results reviewed and verified | [ ] |
| 7.1.4 | Documentation package is complete and reviewed | [ ] |

### 7.2 Client UAT

| # | Check | Status | Client Notes |
|---|-------|--------|-------------|
| 7.2.1 | Client submits 3+ test entries through the normal workflow | [ ] | |
| 7.2.2 | Client verifies data appears correctly in all destination systems | [ ] | |
| 7.2.3 | Client confirms notification content, formatting, and recipients are correct | [ ] | |
| 7.2.4 | Client tests at least one error scenario (e.g., missing required field) | [ ] | |
| 7.2.5 | Client confirms processing speed meets expectations | [ ] | |
| 7.2.6 | Client reviews and accepts documentation package | [ ] | |
| 7.2.7 | Client confirms no changes needed before go-live | [ ] | |

### 7.3 Go-Live Approval

| # | Check | Status |
|---|-------|--------|
| 7.3.1 | All UAT items passed | [ ] |
| 7.3.2 | Client has admin access to all relevant platforms | [ ] |
| 7.3.3 | Error alerts are pointed to client's chosen recipient | [ ] |
| 7.3.4 | 30-day hypercare plan is communicated | [ ] |
| 7.3.5 | 90-day review is scheduled on client's calendar | [ ] |
| 7.3.6 | Client and ClawOps sign off below | [ ] |

---

## 8. Sign-Off

### ClawOps Approval

| | |
|---|---|
| **Name:** | |
| **Role:** | QA Reviewer |
| **Date:** | |
| **Notes:** | |

### Client Approval

| | |
|---|---|
| **Name:** | |
| **Role:** | |
| **Date:** | |
| **Notes:** | |

---

## 9. Post-Deployment Checklist

> First 48 hours after go-live.

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 9.1 | First real production execution completed successfully | [ ] | |
| 9.2 | Monitoring confirms no errors in first 24 hours | [ ] | |
| 9.3 | Client confirms production results look correct | [ ] | |
| 9.4 | No unexpected costs or usage spikes | [ ] | |
| 9.5 | Hypercare daily check-in completed (Day 1) | [ ] | |

---

## 10. 90-Day Review Template

> Schedule this at deployment. Review at Day 90.

| # | Review Item | Status | Action Needed |
|---|------------|--------|---------------|
| 10.1 | Automation is still running and producing value | [ ] | |
| 10.2 | Error rate is acceptable (< 2% of runs) | [ ] | |
| 10.3 | Costs are within expected range | [ ] | |
| 10.4 | No deprecated APIs or tools requiring migration | [ ] | |
| 10.5 | Client satisfaction confirmed | [ ] | |
| 10.6 | Optimization opportunities identified | [ ] | |
| 10.7 | Documentation is still accurate | [ ] | |
| 10.8 | Credential rotation completed (if due) | [ ] | |

---

*This QA checklist is based on engineering standards from organizations managing trillions in market cap, adapted for automation delivery. Discipline at this level is what separates professional automation services from "guy who set up a Zapier."*
