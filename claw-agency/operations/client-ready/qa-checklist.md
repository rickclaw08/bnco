# Quality Assurance Checklist

## QA Philosophy

**Nothing goes to the client until it passes these checks.**

We're an AI agency, which means:
- We can move fast, but fast doesn't mean sloppy
- We can automate testing, so we do
- We document obsessively to catch mistakes
- We have human oversight at critical gates

**Quality is non-negotiable. Speed is a feature, but reliability is the product.**

---

## Pre-Delivery Checklist (Universal)

Use this for EVERY deliverable before client sees it.

### Phase 1: Functionality Check (Developer)

**Responsible:** Primary dev agent who built it

- [ ] **Core feature works as specified**
  - Tested happy path manually
  - Tested with realistic data (not just "test test")
  - Verified against original requirements

- [ ] **Edge cases handled**
  - Empty states (no data yet)
  - Error states (API fails, network issues)
  - Boundary conditions (max length, zero values, etc.)
  - Invalid inputs (wrong format, out of range)

- [ ] **User experience basics**
  - Loading states for anything >1 second
  - Error messages are helpful (not "Error 500")
  - Success feedback (user knows action completed)
  - No console errors or warnings

- [ ] **Cross-browser/platform testing** (if applicable)
  - Chrome (primary)
  - Safari (if target audience uses Mac/iOS)
  - Mobile responsive (if web app)
  - Target device if specified

- [ ] **No placeholder content**
  - No "lorem ipsum" text
  - No "TODO" comments visible to user
  - No debug logs in production
  - No test data unless specifically for demo

### Phase 2: Code Quality Check (Peer Review)

**Responsible:** Second dev agent or Rick (for complex code)

- [ ] **Code review completed**
  - Pull request reviewed and approved
  - No obvious bugs or security issues
  - Follows project conventions
  - Comments explain "why" not "what"

- [ ] **Tests exist and pass**
  - Unit tests for complex logic
  - Integration tests for critical paths
  - Test coverage >70% for critical code
  - All tests passing in CI/CD

- [ ] **No code smells**
  - No copy-paste duplication
  - Functions are reasonably sized
  - Variable names are clear
  - No overly complex logic without comments

- [ ] **Dependencies checked**
  - No unnecessary libraries added
  - Vulnerable dependencies flagged and addressed
  - License compatibility verified

- [ ] **Performance considerations**
  - No obvious performance bottlenecks
  - Database queries optimized
  - Large lists paginated
  - Images optimized

### Phase 3: Security Check

**Responsible:** Rick or designated security-focused agent

- [ ] **Authentication/Authorization**
  - Users can only access what they should
  - Sessions expire appropriately
  - Passwords/secrets not exposed

- [ ] **Input validation**
  - User input is sanitized
  - SQL injection prevented
  - XSS (cross-site scripting) prevented
  - CSRF protection if applicable

- [ ] **Data handling**
  - Sensitive data encrypted at rest (if applicable)
  - HTTPS enforced
  - No API keys in code
  - Environment variables used for secrets

- [ ] **Third-party integrations**
  - API keys have minimal necessary permissions
  - Error handling doesn't leak sensitive info
  - Rate limiting considered

- [ ] **Compliance** (if applicable)
  - GDPR considerations (data privacy)
  - Cookie consent (if EU users)
  - Terms of service linked
  - Privacy policy linked

### Phase 4: Documentation Check

**Responsible:** Harper (COO) or primary dev agent

- [ ] **README updated**
  - Setup instructions accurate
  - Dependencies listed
  - Environment variables documented
  - How to run locally

- [ ] **Code documented**
  - Complex functions have comments
  - API endpoints documented (if applicable)
  - Configuration options explained

- [ ] **User-facing documentation** (if applicable)
  - How to use the feature
  - Screenshots or video walkthrough
  - Known limitations mentioned

- [ ] **Deployment notes**
  - How to deploy
  - Environment-specific configs
  - Rollback procedure

- [ ] **Changelog updated**
  - What's new in this delivery
  - What's fixed
  - What's changed (breaking changes flagged)

### Phase 5: Demo Preparation

**Responsible:** Harper or primary dev agent

- [ ] **Demo video recorded**
  - 3-10 minutes depending on complexity
  - Shows key features
  - Uses realistic scenarios
  - Voiceover explains what's happening
  - Captions added (auto-generate is fine)

- [ ] **Demo environment prepared**
  - Staging environment deployed
  - Test data seeded
  - Demo accounts created (if needed)
  - URLs/credentials ready to share

- [ ] **Demo script tested**
  - Walkthrough performed start to finish
  - No errors during demo run
  - Timing feels natural (not rushed)

- [ ] **Supporting materials ready**
  - Screenshots of key screens
  - Links to GitHub PR or branch
  - List of completed tasks
  - Next steps outlined

### Phase 6: Final Review Gate (Rick)

**Responsible:** Rick (CEO) - Final sign-off before client delivery

**Rick reviews:**
- [ ] **Does it meet client expectations?**
  - Matches what was promised
  - Solves the stated problem
  - Quality reflects our brand

- [ ] **Is it actually done?**
  - No half-finished features
  - No obvious bugs Rick can spot in 5 min test
  - Feels polished, not rushed

- [ ] **Communication ready?**
  - Delivery email drafted
  - Demo video watched and approved
  - Context for client is clear

- [ ] **Risk assessment**
  - Any concerns about client reaction?
  - Any known issues client should be aware of?
  - Contingency plan if something goes wrong?

**Rick's approval triggers delivery to client.**

---

## Tier-Specific QA Standards

### Starter Tier ($500)

**Minimum viable quality:**
- Core feature works reliably
- No critical bugs
- Basic error handling
- README with setup instructions
- Demo video

**Can skip:**
- Extensive testing (manual testing is sufficient)
- Perfect edge case handling (document known limitations)
- Performance optimization (unless specified)
- Advanced monitoring

**Delivery threshold:** Good enough to hand off and have client use successfully.

### Growth Tier ($2K/month)

**Professional quality:**
- All starter requirements
- Automated testing for critical paths
- Better error handling and edge cases
- Code review for all changes
- Weekly demos

**Added expectations:**
- Test coverage >50%
- Performance considered
- Security basics verified
- Documentation kept updated

**Delivery threshold:** Ready for production use with minimal support needed.

### Enterprise Tier ($5-15K/month)

**Production-grade quality:**
- All growth requirements
- Comprehensive testing (unit + integration)
- Security review for every release
- Performance testing
- Monitoring and alerting
- Detailed documentation

**Added expectations:**
- Test coverage >70%
- Load testing completed
- Security scan with no high-severity issues
- Deployment runbook
- Rollback plan tested

**Delivery threshold:** Could hand to any developer and they could maintain it.

---

## Specialized QA Checklists

### Frontend/Web Application Checklist

- [ ] **Responsive design**
  - Mobile (320px width minimum)
  - Tablet (768px)
  - Desktop (1440px+)

- [ ] **Accessibility basics**
  - Keyboard navigation works
  - Alt text on images
  - Color contrast sufficient
  - Form labels present

- [ ] **Performance**
  - Page load <3 seconds on 3G
  - Images lazy-loaded if many
  - Bundle size reasonable
  - Lighthouse score >80 (if applicable)

- [ ] **Browser testing**
  - Chrome (latest)
  - Safari (latest)
  - Firefox (latest if audience uses it)
  - Mobile Safari (iOS)

### Backend/API Checklist

- [ ] **API design**
  - RESTful or follows agreed convention
  - Versioned if public API
  - Documented (OpenAPI/Swagger)
  - Consistent response formats

- [ ] **Error handling**
  - Proper HTTP status codes
  - Helpful error messages
  - Stack traces not exposed in production
  - Validation errors descriptive

- [ ] **Database**
  - Migrations tested
  - Indexes on frequently queried fields
  - N+1 queries avoided
  - Backup strategy in place

- [ ] **Performance**
  - Response times <200ms for simple queries
  - Pagination for large datasets
  - Caching where appropriate
  - Rate limiting on public endpoints

- [ ] **Monitoring**
  - Error tracking (Sentry or similar)
  - Performance monitoring
  - Database query monitoring
  - Alerts configured for critical issues

### AI/ML Feature Checklist

- [ ] **Model quality**
  - Accuracy acceptable for use case
  - Tested with diverse inputs
  - Edge cases identified
  - Failure modes documented

- [ ] **Data handling**
  - Training data quality verified
  - Bias considered and mitigated where possible
  - Data privacy maintained
  - PII scrubbed if needed

- [ ] **User experience**
  - Latency acceptable (<2s for most use cases)
  - Confidence scores shown if applicable
  - User can override AI decision
  - Clear when AI is being used

- [ ] **Monitoring**
  - Model performance tracked
  - Drift detection (if long-running)
  - Fallback for model failures
  - Logs for debugging

### Integration/Third-Party Service Checklist

- [ ] **Error handling**
  - API failures handled gracefully
  - Retry logic with exponential backoff
  - Timeout settings configured
  - Fallback behavior defined

- [ ] **Security**
  - API keys stored securely
  - Minimal permissions requested
  - SSL/TLS enforced
  - Rate limits respected

- [ ] **Data flow**
  - Data mapping verified
  - Webhooks tested (if applicable)
  - Sync vs async behavior clear
  - Idempotency for critical operations

- [ ] **Documentation**
  - Integration flow documented
  - Required credentials listed
  - Setup instructions clear
  - Troubleshooting guide

---

## Bug Severity & Response Times

### Critical (P0)
**Definition:** Production down, data loss, security breach
**Response:** Immediate (within 1 hour, 24/7)
**Fix timeline:** ASAP, hours not days
**Communication:** Update client every hour until resolved

### High (P1)
**Definition:** Major feature broken, significant user impact
**Response:** <4 hours during business hours
**Fix timeline:** <24 hours
**Communication:** Update client twice daily

### Medium (P2)
**Definition:** Feature partially broken, workaround exists
**Response:** <24 hours
**Fix timeline:** <1 week
**Communication:** Daily update

### Low (P3)
**Definition:** Minor bug, cosmetic issue, nice-to-have
**Response:** <48 hours
**Fix timeline:** Next sprint or as capacity allows
**Communication:** Weekly update

### Enhancement (P4)
**Definition:** New feature request, improvement
**Response:** <3 days
**Fix timeline:** Backlog, prioritized with client
**Communication:** Acknowledged, added to roadmap

---

## Testing Strategy by Project Type

### New Product Build
**Testing focus:**
- Core user flows work end-to-end
- Authentication and data persistence
- Critical business logic
- Basic performance

**Test coverage target:** 60-70%

**Manual testing:** Extensive for first version

### Feature Addition
**Testing focus:**
- New feature works as specified
- Doesn't break existing features (regression)
- Integrates smoothly with current system

**Test coverage target:** 70%+ for new code

**Manual testing:** New feature + spot check existing

### Bug Fix
**Testing focus:**
- Bug is actually fixed
- Fix doesn't introduce new bugs
- Related functionality still works

**Test coverage target:** Test added for the bug

**Manual testing:** Reproduce original bug, verify fix

### Refactor/Tech Debt
**Testing focus:**
- Functionality unchanged (behavior tests)
- Performance same or better
- No new bugs introduced

**Test coverage target:** Maintain or improve existing coverage

**Manual testing:** Minimal (rely on automated tests)

---

## Common QA Failures & Prevention

### Failure: "It works on my machine"
**Prevention:**
- Test in staging environment that mirrors production
- Use Docker or similar for consistent environments
- Have second person test before delivery

### Failure: Missing edge cases
**Prevention:**
- Checklist of common edge cases (empty, error, max, zero)
- Ask "what could go wrong?"
- Test with realistic, messy data

### Failure: Poor error messages
**Prevention:**
- Test error scenarios intentionally
- Errors should tell user what to do next
- No technical jargon in user-facing errors

### Failure: Performance issues
**Prevention:**
- Test with production-sized data
- Monitor response times
- Set performance budgets

### Failure: Documentation out of date
**Prevention:**
- Update docs as part of feature development (not after)
- Docs reviewed in code review
- Test setup instructions with fresh environment

### Failure: Demo breaks during client call
**Prevention:**
- Test demo script before call
- Have backup recording
- Test in environment client will see

---

## QA Tools & Automation

### Automated Testing
**Use:**
- Jest/Vitest for JavaScript
- Pytest for Python
- RSpec for Ruby
- Built-in testing for other languages

**Run:**
- On every commit (CI/CD)
- Before deployment
- Before delivery to client

### Code Quality
**Use:**
- ESLint/Prettier for code formatting
- SonarQube or similar for code analysis
- GitHub code scanning

**Run:**
- On every PR
- Weekly full codebase scan

### Security Scanning
**Use:**
- Snyk or Dependabot for dependency vulnerabilities
- OWASP ZAP for web security scanning
- Git-secrets for preventing secret leaks

**Run:**
- Daily on main branch
- Before every production deployment

### Performance Monitoring
**Use:**
- Lighthouse for web performance
- k6 or similar for load testing
- New Relic/Datadog for production monitoring

**Run:**
- Lighthouse on every deployment
- Load test before major launches
- Continuous production monitoring

### Error Tracking
**Use:**
- Sentry or Rollbar
- CloudWatch/StackDriver for infrastructure

**Run:**
- Always in production
- Review errors weekly minimum

---

## Quality Metrics We Track

### Code Quality Metrics
- Test coverage percentage
- Code review completion rate
- Time from PR creation to merge
- Number of hotfixes post-deployment

**Targets:**
- Test coverage >70% (enterprise), >50% (growth)
- 100% code review before merge
- PR merge <24 hours average
- <1 hotfix per 10 deployments

### Bug Metrics
- Bugs found pre-delivery vs post-delivery
- Bug resolution time by severity
- Repeat bugs (same issue twice)

**Targets:**
- 90% of bugs caught before client sees
- Critical bugs fixed <4 hours
- Zero repeat bugs

### Client Satisfaction
- Deliverable acceptance rate (first submission)
- Client-reported bugs per milestone
- Quality rating in feedback surveys

**Targets:**
- >80% first-time acceptance
- <3 bugs per milestone
- >4.5/5 quality rating

---

## Pre-Delivery Checklist Template (Copy for Each Deliverable)

```
PROJECT: [Client Name] - [Feature/Milestone]
DUE DATE: [Date]
TIER: [Starter/Growth/Enterprise]

PHASE 1: FUNCTIONALITY ✓
[ ] Core feature works
[ ] Edge cases handled
[ ] UX basics complete
[ ] Cross-platform tested
[ ] No placeholder content

PHASE 2: CODE QUALITY ✓
[ ] Code reviewed and approved
[ ] Tests pass (coverage: __%)
[ ] No code smells
[ ] Dependencies checked
[ ] Performance acceptable

PHASE 3: SECURITY ✓
[ ] Auth/authorization verified
[ ] Input validation complete
[ ] Data handling secure
[ ] Third-party integrations safe
[ ] Compliance checked (if applicable)

PHASE 4: DOCUMENTATION ✓
[ ] README updated
[ ] Code documented
[ ] User docs (if needed)
[ ] Deployment notes
[ ] Changelog updated

PHASE 5: DEMO PREP ✓
[ ] Demo video recorded (link: ___)
[ ] Demo environment ready
[ ] Demo script tested
[ ] Supporting materials prepared

PHASE 6: RICK SIGN-OFF ✓
[ ] Meets expectations
[ ] Actually done
[ ] Communication ready
[ ] Risk assessed

TIER-SPECIFIC CHECKS:
[Starter: Basic quality threshold met]
[Growth: Professional quality, automated tests]
[Enterprise: Production-grade, comprehensive testing]

NOTES:
[Any special considerations or known issues]

APPROVED BY: _______________  DATE: ___________

DELIVERED TO CLIENT: ___________
```

---

## The Golden Rule

**If you wouldn't be proud to show it to a developer you respect, don't send it to a client.**

Quality is how we build trust. Trust is how we build a business.

---

*This checklist evolves. When we find new failure modes or better processes, we update it. Quality is a practice, not a destination.*
