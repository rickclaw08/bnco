# QA Checklist

## Version: 0.1.0

## Pre-Delivery Quality Assurance Checklist

Complete this checklist before delivering any sprint output or final deliverable to the client.

---

**Project:** [Project Name]
**Sprint/Deliverable:** [Sprint number or deliverable name]
**QA Date:** [Date]
**QA By:** [Name]

---

## 1. Functional Testing

- [ ] All acceptance criteria from requirements document are met
- [ ] Each feature works as described in the user stories
- [ ] Input validation works correctly (rejects bad input, accepts good input)
- [ ] Output format matches specifications
- [ ] All integrations connect and exchange data correctly
- [ ] Workflows complete end-to-end without manual intervention
- [ ] Data is saved, retrieved, and displayed correctly

## 2. Edge Case Testing

- [ ] System handles empty or missing data gracefully
- [ ] System handles unexpected input formats
- [ ] System handles API failures or timeouts (retry logic works)
- [ ] System handles rate limits from external services
- [ ] System handles concurrent requests without conflicts
- [ ] System handles large data volumes without crashing
- [ ] Error messages are clear and actionable

## 3. Performance

- [ ] Response times are within acceptable limits
- [ ] No memory leaks during extended operation
- [ ] System performs under expected load
- [ ] No unnecessary API calls or database queries
- [ ] Caching works correctly where implemented

## 4. Security

- [ ] No credentials or API keys in source code
- [ ] All secrets stored in environment variables or secret manager
- [ ] Access controls work correctly (right people, right permissions)
- [ ] Data in transit is encrypted (HTTPS/TLS)
- [ ] Data at rest is encrypted where required
- [ ] No SQL injection, XSS, or other common vulnerabilities
- [ ] Logging does not capture sensitive data (passwords, tokens)

## 5. Reliability

- [ ] Error handling catches and logs all failure modes
- [ ] System recovers gracefully from crashes or restarts
- [ ] Retry logic works correctly with exponential backoff
- [ ] Monitoring and alerting is configured
- [ ] Health check endpoint works (if applicable)

## 6. Documentation

- [ ] Code has inline comments for complex logic
- [ ] README or setup guide is accurate and complete
- [ ] API documentation matches actual behavior
- [ ] Configuration options are documented
- [ ] Known issues are listed with severity and workarounds
- [ ] Changelog is updated

## 7. User Experience (If Applicable)

- [ ] User-facing elements match brand guidelines
- [ ] Text is free of typos and grammatical errors
- [ ] No em dashes in any user-facing text
- [ ] Error messages help users fix the problem
- [ ] Loading states and feedback are present where needed

## 8. Deployment

- [ ] Deployment process is documented and repeatable
- [ ] Environment variables are set correctly
- [ ] Database migrations run successfully (if applicable)
- [ ] Rollback plan exists and has been tested
- [ ] Monitoring is active post-deployment

---

## QA Results

| Category | Pass | Fail | N/A | Notes |
|----------|------|------|-----|-------|
| Functional | | | | |
| Edge Cases | | | | |
| Performance | | | | |
| Security | | | | |
| Reliability | | | | |
| Documentation | | | | |
| User Experience | | | | |
| Deployment | | | | |

## Issues Found

| # | Severity | Description | Status |
|---|----------|-------------|--------|
| 1 | Critical / High / Medium / Low | [Description] | Open / Fixed |
| 2 | | | |

**Severity Definitions:**
- **Critical:** System does not work. Blocks delivery
- **High:** Major feature broken. Must fix before delivery
- **Medium:** Feature works but with issues. Fix within next sprint
- **Low:** Minor issue or polish item. Fix when convenient

---

## QA Verdict

- [ ] **PASS:** All critical and high items resolved. Ready for delivery
- [ ] **CONDITIONAL PASS:** Delivery with known issues documented and communicated
- [ ] **FAIL:** Critical or high issues remain. Must fix before delivery

**QA Sign-Off:** [Name] - [Date]
