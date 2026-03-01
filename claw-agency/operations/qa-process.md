# ClawOps - Quality Assurance Process

How we ensure every deliverable meets standards before it reaches the client.

---

## 1. Code Quality

### Standards
- All code follows project linting rules (ESLint / Ruff / Black)
- No hardcoded secrets, environment variables only
- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- PR required for every merge to `main`, no direct pushes

### PR Checklist (copy into every PR)
- [ ] Code runs locally without errors
- [ ] Linting passes
- [ ] No secrets or credentials in code
- [ ] New env vars documented in `.env.example`
- [ ] Functions/modules have docstrings or comments for non-obvious logic
- [ ] Edge cases handled (empty inputs, API failures, timeouts)

---

## 2. Testing Layers

| Layer | What | When |
|-------|------|------|
| **Unit tests** | Core business logic, utilities | Every PR |
| **Integration tests** | API endpoints, database operations | Every PR |
| **Manual QA** | Full walkthrough against acceptance criteria | Before each milestone demo |
| **Client UAT** | Client tests in staging/production | After final delivery (3 business days) |

### Manual QA Walkthrough
Before every milestone demo, run through:
1. **Happy path** - does the main flow work end to end?
2. **Error handling** - what happens with bad input, API down, timeout?
3. **Edge cases** - empty data, special characters, rate limits, concurrent users
4. **Performance** - response time acceptable? Any obvious bottlenecks?
5. **Security** - auth working? Can't access unauthorized data? API keys hidden?
6. **Mobile/responsive** - if applicable, test on mobile viewport

---

## 3. Pre-Delivery Checklist

Run this before every handoff:

### Functionality
- [ ] All acceptance criteria met
- [ ] All milestones delivered and approved
- [ ] Error handling and logging in place
- [ ] Monitoring/alerting configured

### Documentation
- [ ] README.md complete (setup, env vars, deployment)
- [ ] ARCHITECTURE.md (system design, data flow)
- [ ] USER_GUIDE.md (end-user instructions)
- [ ] Loom walkthrough recorded

### Infrastructure
- [ ] Production deployment working
- [ ] Environment variables set in production
- [ ] Domain/DNS configured (if applicable)
- [ ] SSL/HTTPS active
- [ ] Backups configured (if database)

### Security
- [ ] No secrets in codebase
- [ ] API keys rotated from dev keys to client's production keys
- [ ] Auth/access controls verified
- [ ] Rate limiting in place (if public API)

### Handoff
- [ ] Client has repo access
- [ ] Client has deployment access
- [ ] Client has all credentials
- [ ] Knowledge transfer call scheduled

---

## 4. Post-Delivery

- Monitor for 14 days (included support period)
- Track any bugs reported during UAT
- Fix bugs within 24-48 hours
- Document lessons learned in internal retro

---

## 5. Quality Metrics (Track Over Time)

- **Bug rate**: Bugs found during UAT / total features
- **Client satisfaction**: Post-project survey (1-10)
- **On-time delivery**: % of milestones delivered on schedule
- **Revision rounds**: Avg revisions per milestone

Target: fewer than 2 bugs per project, above 8/10 satisfaction, above 90% on-time.

---

ClawOps | https://rickclaw08.github.io/claw-systems/ | agentclaw08@icloud.com
