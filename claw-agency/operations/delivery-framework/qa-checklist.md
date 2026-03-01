# QA Checklist

**Project:** [Project Name]
**Client:** [Client Name]
**QA Performed By:** [Name]
**Date:** [Date]

---

## Instructions

Go through every section. Check each item. If it fails, log the issue in the "Issues Found" section at the bottom. Nothing ships until every critical item passes.

---

## 1. Functional Testing

Does it do what it's supposed to do?

- [ ] Each automation/workflow runs successfully from start to finish
- [ ] Output matches the expected results defined in the requirements doc
- [ ] All integrations connect and transfer data correctly
- [ ] Triggers fire at the right time/condition
- [ ] Conditional logic (if/then/else) works for all branches
- [ ] Data flows correctly between all connected systems
- [ ] Scheduled tasks run on the correct schedule

---

## 2. Data Integrity

Is the data correct and complete?

- [ ] No data loss between steps (input records = output records)
- [ ] Data formatting is preserved (dates, currencies, names, etc.)
- [ ] No duplicate records created
- [ ] Correct fields mapped to correct destinations
- [ ] Special characters handled properly (accents, symbols, emoji)
- [ ] Empty/null values handled gracefully (no crashes, no garbage data)

---

## 3. Error Handling

What happens when things go wrong?

- [ ] Invalid input produces a clear error message (not a crash)
- [ ] Network/API failures trigger a retry or alert (not a silent failure)
- [ ] Rate limits are handled (backoff, queuing, or alerting)
- [ ] Authentication failures produce a clear notification
- [ ] Error notifications go to the right person (client or ClawOps, depending on agreement)
- [ ] Failed runs are logged with enough detail to diagnose

---

## 4. Edge Cases

Does it handle the weird stuff?

- [ ] Empty dataset (zero records to process)
- [ ] Single record
- [ ] Large dataset (10x normal volume)
- [ ] Duplicate inputs
- [ ] Missing required fields
- [ ] Unexpected data types (text in a number field, etc.)
- [ ] Timezone handling (if applicable)
- [ ] Concurrent execution (if applicable, does it handle two runs at once?)

---

## 5. Performance

Is it fast enough?

- [ ] Processing time is acceptable for the expected volume
- [ ] No timeouts on API calls or webhooks
- [ ] Memory/resource usage is within acceptable limits
- [ ] No unnecessary API calls or redundant operations

---

## 6. Security and Access

Is it locked down properly?

- [ ] API keys and credentials are stored securely (not hardcoded)
- [ ] Access permissions are set correctly (least privilege)
- [ ] Sensitive data is encrypted in transit and at rest (if required)
- [ ] No sensitive data exposed in logs or error messages
- [ ] Authentication tokens expire and refresh properly

---

## 7. Documentation

Can someone else understand and maintain this?

- [ ] All automations/workflows are documented (what they do, how they work)
- [ ] Setup instructions are clear (how to replicate the environment)
- [ ] Known limitations are documented
- [ ] Troubleshooting steps for common issues are included
- [ ] Contact info for support is included

---

## 8. Client-Specific

Does it meet this client's particular needs?

- [ ] All deliverables from the requirements doc are present and working
- [ ] Matches any design/branding requirements (if applicable)
- [ ] Complies with client's regulatory requirements (if applicable)
- [ ] Client's team can access and use the system
- [ ] Client's feedback from demos has been incorporated

---

## Issues Found

| # | Description | Severity (Critical/High/Medium/Low) | Status (Open/Fixed/Won't Fix) | Notes |
|---|-------------|-------------------------------------|-------------------------------|-------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Critical:** Blocks delivery. Must fix.
**High:** Significant issue, should fix before handoff.
**Medium:** Minor issue, can fix post-handoff during support period.
**Low:** Nice to have, not required for delivery.

---

## QA Verdict

- [ ] **PASS** - All critical and high items pass. Ready for handoff.
- [ ] **CONDITIONAL PASS** - Minor issues remain, documented and communicated to client. Fixes planned for support period.
- [ ] **FAIL** - Critical or high issues remain. Do not deliver. Fix and re-test.

**QA Sign-off:** _________________________ Date: _________
