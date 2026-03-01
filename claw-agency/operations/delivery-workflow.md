# ClawOps - Project Delivery Workflow

End-to-end workflow from signed deal to delivered product.

---

## Workflow Overview

```
Signed Deal
  -> Workspace Setup (Day 0)
  -> Kickoff Call (Day 1-2)
  -> Architecture and Planning (Day 2-3)
  -> Build Phase (per project template)
  -> Internal QA (before each milestone)
  -> Client Demo and Review (at each milestone)
  -> Final QA and UAT (3 business days)
  -> Handoff and Deployment
  -> Post-Delivery Support (14 days)
  -> Close and Archive
```

---

## Stage 1: Workspace Setup (Day 0)

Trigger: Contract signed and deposit received.

| Task | Tool | Time |
|------|------|------|
| Create project board from template | Trello/Notion | 15 min |
| Create GitHub repo, set branch protection | GitHub | 10 min |
| Create client communication channel | Slack/Discord | 5 min |
| Provision deployment environment | Vercel/Railway | 15 min |
| Collect client credentials securely | 1Password | 10 min |
| Initialize project folder structure | Git | 10 min |
| Send welcome email | Email | 5 min |

Total: ~1 hour

---

## Stage 2: Kickoff Call (Day 1-2)

See client-onboarding.md for full agenda.

Key outputs:
- Confirmed scope, milestones, and timeline
- Confirmed point of contact and communication norms
- All access and credentials verified
- First milestone target date set

---

## Stage 3: Architecture and Planning (Day 2-3)

- [ ] Document system architecture (ARCHITECTURE.md)
- [ ] Define data flow and integrations
- [ ] Choose tech stack, confirm with client if needed
- [ ] Break milestones into tasks on project board
- [ ] Identify risks and dependencies
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Create `.env.example` with all required variables

---

## Stage 4: Build Phase

Follow project-specific templates (see project-templates.md):
- AI Chatbot: 2 weeks
- Workflow Automation: 1 week
- Data Pipeline: 3 weeks
- Custom AI Agent: 4 weeks

### Development Standards
- Feature branches: `feature/description`
- PRs required for all merges to `main`
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- No secrets in code, environment variables only
- Linting enforced (ESLint / Ruff / Black)

### Daily Development Rhythm
1. Pull latest `main`
2. Work on current milestone tasks
3. Commit and push feature branch
4. Create PR when feature complete
5. Self-review or peer review
6. Merge to `main`

---

## Stage 5: Internal QA (Before Each Milestone)

See qa-process.md for full checklist. Summary:

- [ ] Happy path works end to end
- [ ] Error handling tested (bad input, API failures, timeouts)
- [ ] Edge cases covered (empty data, special characters, rate limits)
- [ ] Performance acceptable
- [ ] Security verified (auth, access controls, no exposed keys)
- [ ] Mobile/responsive tested (if applicable)
- [ ] Code linting passes
- [ ] Documentation updated

---

## Stage 6: Client Demo and Review (At Each Milestone)

1. Schedule 30-min demo call
2. Walk through deliverables via screen share
3. Compare against acceptance criteria
4. Collect feedback, document action items
5. Get milestone sign-off (written confirmation in Slack/Discord or email)
6. Invoice payment tranche if milestone-based billing
7. Update project board and CRM

---

## Stage 7: Final QA and Client UAT

### Final QA (Internal)
Run the full pre-delivery checklist from qa-process.md:
- Functionality, documentation, infrastructure, security, handoff readiness

### Client UAT (3 Business Days)
1. Deploy to staging or production
2. Send UAT instructions to client with test scenarios
3. Client tests and reports issues
4. Fix reported bugs within 24-48 hours
5. Get final sign-off

---

## Stage 8: Handoff and Deployment

### Handoff Package
- [ ] README.md (setup, env vars, deployment steps)
- [ ] ARCHITECTURE.md (system design, data flow diagram)
- [ ] USER_GUIDE.md (end-user instructions)
- [ ] Admin guide (management, updates, troubleshooting)
- [ ] Loom walkthrough video (5-15 min)

### Deployment
- [ ] Production deployment verified and stable
- [ ] Environment variables configured in production
- [ ] Domain/DNS set up (if applicable)
- [ ] SSL/HTTPS active
- [ ] Backups configured (if database involved)
- [ ] Monitoring and alerting set up (UptimeRobot, Sentry)

### Access Transfer
- [ ] Client granted repo access (or ownership transferred)
- [ ] Client granted deployment access
- [ ] All credentials documented and shared securely

### Knowledge Transfer Call (30 min)
- Walk through architecture and codebase
- Demonstrate admin tasks
- Answer technical questions
- Confirm client is comfortable maintaining the system

---

## Stage 9: Post-Delivery Support (14 Days)

- Included in project price
- Scope: bug fixes only, not new features
- Response time: 24 hours on business days
- Critical issues (system down): immediate response, fix within 4 hours
- Track all support requests in project board
- Post-mortem for any critical incidents

---

## Stage 10: Close and Archive

- [ ] Final invoice sent (remaining balance)
- [ ] Final payment received
- [ ] 14-day support period completed
- [ ] Maintenance retainer offered
- [ ] Client testimonial or review requested
- [ ] Project board archived (moved to Done)
- [ ] GitHub repo tagged with final version
- [ ] CRM deal finalized with notes and outcome
- [ ] Lessons learned documented (internal retro)
- [ ] Case study drafted (if client approves)

---

## Escalation Path

1. Client messages Slack/Discord channel
2. Acknowledged within SLA response time
3. If critical (system down): immediate response, fix within 4 hours
4. Post-mortem shared with client after resolution

## ClawOps Pricing Reference

| Tier | Price |
|------|-------|
| Starter | $500 |
| Growth | $2,000/mo |
| Enterprise | Custom |
