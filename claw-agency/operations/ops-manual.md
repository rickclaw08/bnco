# ClawOps - Operations Manual

## 1. Client Onboarding

### 1.1 Intake
1. Client fills out **Intake Form** (Google Form or Notion form):
   - Business name, industry, size
   - Problem statement / what they want automated
   - Current tools and tech stack
   - Budget range (tier: Starter $500 / Growth $2K/mo / Enterprise Custom)
   - Timeline expectations
   - Decision-maker contact info
2. We review within **24 hours** and score lead (Hot / Warm / Cold)
3. Add lead to HubSpot CRM pipeline (see crm-setup-guide.md)

### 1.2 Discovery Call (30 min)
- Confirm scope and pain points
- Demo relevant past work
- Discuss timeline and deliverables
- Agree on pricing model (fixed / milestone-based)
- Send **proposal** within 48 hours (see templates.md)

### 1.3 Contract and Access Setup
- Send contract via DocuSign / PandaDoc (template per service type)
- Collect deposit (Stripe invoice)
- Create shared workspace:
  - Trello board (or Notion project page)
  - GitHub repo (private)
  - Slack/Discord channel (client-facing)
- Request all necessary credentials/API keys via **1Password shared vault** or secure form
- Schedule kickoff call

### 1.4 Kickoff Call (45 min)
- Introduce workflow and communication norms
- Walk through project board and milestones
- Confirm point of contact and response expectations
- Set first milestone check-in date

---

## 2. Project Management Workflow

### 2.1 Tools
| Purpose | Tool | Tier |
|---------|------|------|
| CRM | HubSpot (free) | Free |
| Project board | Trello (free) or Notion (free) | Free |
| Code | GitHub (free private repos) | Free |
| Communication | Slack or Discord | Free |
| Deployment | Vercel / Railway | Free tier |
| Docs | Notion / Google Docs | Free |
| Time tracking | Toggl (free) | Free |

### 2.2 Board Structure (Trello)
Columns: `Backlog` > `This Week` > `In Progress` > `Review` > `Done`

Every card includes:
- Clear title and description
- Acceptance criteria
- Due date
- Labels: `feature` / `bug` / `infra` / `docs`

### 2.3 Status Updates
- **Async update** every Monday and Thursday in client Slack/Discord channel
- Format:
  ```
  Status Update - [Date]
  Completed: ...
  In Progress: ...
  Blockers: ...
  Next milestone: [date] - [description]
  ```
- **Milestone demo call** at each major deliverable (screen share, walkthrough)

### 2.4 Milestones
Every project has 3-5 milestones defined at kickoff. Each milestone:
- Has clear deliverables and acceptance criteria
- Triggers a review/demo call
- May trigger a payment tranche (for milestone-based pricing)

---

## 3. Delivery Process

### 3.1 Development
- All code in GitHub with branch protection on `main`
- Feature branches: `feature/description`, PRs required
- Commit messages: conventional commits (`feat:`, `fix:`, `docs:`)
- Environment variables via `.env` (never committed)

### 3.2 Testing
- Unit tests for core logic (pytest / Jest depending on stack)
- Integration test for API endpoints
- Manual QA walkthrough against acceptance criteria
- Client UAT (User Acceptance Testing) period: **3 business days**

### 3.3 Handoff
1. Deploy to production (client's infra or our managed)
2. Deliver **Handoff Package**:
   - Technical documentation (architecture, API docs)
   - User guide / SOP for end users
   - Admin guide (how to manage, update, troubleshoot)
   - Recorded Loom walkthrough (5-15 min)
3. Transfer repo ownership (if client-owned) or grant access
4. Knowledge transfer call (30 min)

### 3.4 Documentation Standards
Every project ships with:
- `README.md` - setup, env vars, deployment
- `ARCHITECTURE.md` - system design, data flow
- `USER_GUIDE.md` - end-user instructions
- Inline code comments for non-obvious logic

---

## 4. Support and Maintenance SLAs

### 4.1 Post-Delivery Support (Included)
- **14 days** of bug-fix support after handoff (included in project price)
- Response time: 24 hours (business days)
- Scope: bugs only, not new features

### 4.2 Maintenance Retainer (Optional)
| Tier | Hours/mo | Response Time | Price |
|------|----------|---------------|-------|
| Basic | 5 hrs | 48h | $500/mo |
| Standard | 10 hrs | 24h | $1,000/mo |
| Premium | 20 hrs | 4h (business) | $2,000/mo |

Includes: bug fixes, minor updates, monitoring, uptime checks.

### 4.3 Escalation Path
1. Client messages Slack/Discord channel
2. Acknowledged within SLA response time
3. If critical (system down): immediate response, fix within 4 hours
4. Post-mortem for any critical incident (shared with client)

---

## 5. Internal Processes

### 5.1 Weekly Rhythm
- **Monday**: Review all active projects, update boards, send status updates
- **Wednesday**: Internal retro (what's working, what's not), 15 min
- **Friday**: Invoice/billing check, update pipeline, content/marketing tasks

### 5.2 Client Communication Norms
- Respond within 24 hours on business days
- Be proactive: flag risks early, don't wait to be asked
- Over-communicate progress, under-promise timelines
- Always confirm understanding before building

### 5.3 Pricing Guidelines

#### ClawOps Tiers
| Tier | Price |
|------|-------|
| Starter | $500 |
| Growth | $2,000/mo |
| Enterprise | Custom |

#### Service-Specific Ranges
| Service | Starting Price | Typical Range |
|---------|---------------|---------------|
| AI Chatbot | $2,000 | $2K-$5K |
| Workflow Automation | $1,000 | $1K-$3K |
| Data Pipeline | $3,000 | $3K-$8K |
| Custom AI Agent | $5,000 | $5K-$15K |

Adjust based on complexity, integrations, and client budget.

---

ClawOps | https://rickclaw08.github.io/claw-systems/ | agentclaw08@icloud.com
