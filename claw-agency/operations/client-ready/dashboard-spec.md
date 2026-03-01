# Agency Dashboard Specification

## Purpose

Rick (CEO) needs a single view to:
1. Know the status of every client and project at a glance
2. Track revenue and pipeline
3. Monitor team performance and utilization
4. Identify problems before they become crises
5. Make data-driven decisions about growth

**Design principle:** Information density over beauty. Fast over fancy. Actionable over impressive.

---

## Dashboard Layout

### Overview Page (Landing Page)

**Purpose:** 60-second health check of the entire agency

**Layout:** Three-column responsive grid

#### Left Column: Client Status

**Active Clients Summary Card**
```
ACTIVE CLIENTS: [Number]

Status Breakdown:
🟢 Healthy: [X] clients
🟡 Watch: [Y] clients  
🔴 At Risk: [Z] clients

[See all clients →]
```

**Client List (Scrollable)**
```
[Client Name]
├─ Tier: [Starter/Growth/Enterprise]
├─ Status: 🟢/🟡/🔴
├─ Current Phase: [Onboarding/Active/Maintenance/Off-boarding]
├─ Next Milestone: [Name] - [Days until due]
├─ Last Contact: [X] days ago
├─ [Quick Actions: Update Status | View Project | Message Client]
```

**Status Color Logic:**
- 🟢 Green (Healthy): On schedule, client responsive, no blockers
- 🟡 Yellow (Watch): Minor delays, communication lag, scope questions
- 🔴 Red (At Risk): Major delays, client unresponsive, payment issues, unhappy

**Sort options:** Status (red first), Due date, Last contact, Client name

#### Middle Column: Revenue & Pipeline

**Revenue Card**
```
MONTHLY RECURRING REVENUE (MRR)
$[Amount]

This Month (MTD):
Revenue: $[Amount]
Projected: $[Amount]
Growth: [+/-]% vs last month

Breakdown:
├─ Starter: $[Amount] ([X] clients)
├─ Growth: $[Amount] ([Y] clients) 
├─ Enterprise: $[Amount] ([Z] clients)
└─ One-time: $[Amount] ([W] projects)
```

**Pipeline Card**
```
SALES PIPELINE

Prospects: [Number]
├─ Discovery: [X]
├─ Proposal Sent: [Y]
├─ Negotiation: [Z]
└─ Verbal Yes: [W]

Potential MRR: $[Amount]
Weighted Value: $[Amount] (based on stage)

[Manage Pipeline →]
```

**Cash Flow Card**
```
CASH FLOW

Unpaid Invoices: $[Amount] ([X] invoices)
├─ Current: $[Amount]
├─ 1-30 days overdue: $[Amount] 🟡
└─ 30+ days overdue: $[Amount] 🔴

Next 30 Days:
Expected: $[Amount]
Expenses: $[Amount]
Net: $[Amount]
```

#### Right Column: Team & Tasks

**Team Utilization Card**
```
TEAM CAPACITY

Total Hours This Week: [X] / [Y] available
Utilization: [Z]%

By Agent:
├─ Rick (CEO): [X]h (80%) - [Primary client/task]
├─ Harper (COO): [X]h (60%) - [Primary task]
├─ Dev Agent 1: [X]h (95%) - [Primary project]
├─ Dev Agent 2: [X]h (40%) - [Primary project]
└─ [Other agents]

[View Detailed Schedule →]
```

**Urgent Tasks Card**
```
REQUIRES ATTENTION

Overdue: [X] tasks 🔴
Due Today: [Y] tasks 🟡
Due This Week: [Z] tasks

Top 5 Urgent:
1. [Client] - [Task] - Due: [Date] 🔴
2. [Client] - [Task] - Due: [Date] 🔴
3. [Client] - [Task] - Due: [Date] 🟡
4. [Client] - [Task] - Due: [Date] 🟡
5. [Client] - [Task] - Due: [Date]

[View All Tasks →]
```

**Recent Activity Feed**
```
RECENT ACTIVITY (Last 24h)

[Timestamp] - [Client] milestone delivered ✅
[Timestamp] - [Client] payment received 💰
[Timestamp] - [Prospect] proposal sent 📧
[Timestamp] - [Client] blocker reported ⚠️
[Timestamp] - [New lead] inquiry received 🆕

[View Full Log →]
```

---

## Detailed Views

### Client Detail Page

**URL:** `/dashboard/clients/[client-id]`

**Header:**
```
[Client Name]                                    [Status: 🟢/🟡/🔴]
Tier: [Starter/Growth/Enterprise] | MRR: $[Amount] | Start Date: [Date]

[Quick Actions: Message | Schedule Call | View Contract | Update Status]
```

**Project Overview Section**
```
PROJECT STATUS

Current Phase: [Phase Name]
Progress: [█████████░] 85%

Timeline:
├─ Start Date: [Date]
├─ Current Milestone: [Name] - Due [Date] ([X] days)
├─ Next Milestone: [Name] - Due [Date]
└─ Project End: [Date] (if fixed scope)

Milestones:
✅ Milestone 1: [Name] - Delivered [Date]
✅ Milestone 2: [Name] - Delivered [Date]
🔄 Milestone 3: [Name] - In Progress - Due [Date]
⏳ Milestone 4: [Name] - Not Started - Due [Date]
```

**Communication Log**
```
RECENT COMMUNICATION

[Date] - Weekly update sent (Email) - [View]
[Date] - Demo video delivered (Slack) - [View]
[Date] - Client question answered (Slack) - [View]
[Date] - Kickoff call (Meeting) - [Notes]

Last Contact: [X] days ago
⚠️ [Alert if >5 days with no contact]

[Log New Communication]
```

**Financial Summary**
```
FINANCIALS

Contract Value: $[Amount]
Paid to Date: $[Amount]
Outstanding: $[Amount]

Payment History:
├─ [Date] - $[Amount] - [Method] - ✅ Received
├─ [Date] - $[Amount] - [Method] - 🟡 Pending
└─ [Date] - $[Amount] - [Method] - 🔴 Overdue

[View Invoices] [Send Invoice] [Record Payment]
```

**Team & Tasks**
```
ASSIGNED TEAM

Primary: [Agent Name] ([X]h this week)
Supporting: [Agent Names]

Active Tasks:
🔴 [Task Name] - Overdue by [X] days - [Assignee]
🟡 [Task Name] - Due today - [Assignee]
⏳ [Task Name] - Due [Date] - [Assignee]

Completed This Week: [X] tasks

[View All Tasks] [Create Task]
```

**Files & Deliverables**
```
RECENT FILES

[Date] - [Filename] - [Type] - [Uploaded by]
[Date] - [Filename] - [Type] - [Uploaded by]

Deliverables:
✅ [Deliverable Name] - [Date] - [Download]
✅ [Deliverable Name] - [Date] - [Download]
🔄 [Deliverable Name] - In Progress

[View All Files]
```

**Notes & Context**
```
PROJECT NOTES

[Free-form text area for important context]
- Client's primary goal: [X]
- Key stakeholders: [Names and roles]
- Communication preferences: [Email preferred, responds within 24h]
- Special considerations: [Works in EST timezone, prefers Friday demos]
- Risks: [Technical complexity with legacy system integration]

[Edit Notes]
```

---

### Revenue Dashboard

**URL:** `/dashboard/revenue`

**Revenue Trends Chart**
```
MONTHLY RECURRING REVENUE TREND

[Line graph showing MRR over last 12 months]
[Bar graph showing new MRR vs churned MRR per month]

Current MRR: $[Amount]
12-month growth: [X]%
Average monthly growth: [Y]%
```

**Revenue Breakdown**
```
REVENUE BY TIER

[Pie chart or bar chart]
Starter ($500): [X] clients = $[Amount] ([%]%)
Growth ($2K): [Y] clients = $[Amount] ([%]%)
Enterprise ($5-15K): [Z] clients = $[Amount] ([%]%)
One-time: [W] projects = $[Amount] ([%]%)

Client Lifetime Value (Average): $[Amount]
Average Project Length: [X] months
```

**Client Metrics**
```
CLIENT HEALTH METRICS

Total Active Clients: [X]
New Clients (This Month): [Y]
Churned Clients (This Month): [Z]
Retention Rate: [%]%

Average Time to First Revenue: [X] days
Average Onboarding Time: [Y] days
```

**Forecasting**
```
REVENUE FORECAST (Next 6 Months)

[Table with projected MRR based on current pipeline and churn]

Month | Projected MRR | New Clients | Churn | Net Growth
------|---------------|-------------|-------|------------
[Mo]  | $[Amount]     | [X]         | [Y]   | +[Z]%
[Mo]  | $[Amount]     | [X]         | [Y]   | +[Z]%
...

Assumptions:
- Pipeline conversion rate: [X]%
- Monthly churn rate: [Y]%
- Average deal size: $[Amount]
```

**Outstanding Invoices**
```
ACCOUNTS RECEIVABLE

Total Outstanding: $[Amount]

Aging Report:
├─ Current (0-30 days): $[Amount] ([X] invoices)
├─ 31-60 days: $[Amount] ([Y] invoices) 🟡
├─ 61-90 days: $[Amount] ([Z] invoices) 🔴
└─ 90+ days: $[Amount] ([W] invoices) 🔴

[View Details] [Send Reminders]
```

---

### Pipeline Dashboard

**URL:** `/dashboard/pipeline`

**Pipeline Funnel**
```
SALES PIPELINE

[Funnel visualization]

Lead: [X] prospects = $[Amount] potential
↓ ([%]% conversion)
Discovery: [Y] prospects = $[Amount] potential
↓ ([%]% conversion)
Proposal: [Z] prospects = $[Amount] potential
↓ ([%]% conversion)
Negotiation: [W] prospects = $[Amount] potential
↓ ([%]% conversion)
Closed/Won: [V] clients = $[Amount] actual
```

**Active Prospects List**
```
[Prospect Name]
├─ Stage: [Discovery/Proposal/Negotiation/Verbal Yes]
├─ Potential MRR: $[Amount]
├─ Tier: [Starter/Growth/Enterprise]
├─ Probability: [%]%
├─ Expected Close: [Date]
├─ Days in Stage: [X]
├─ Last Contact: [Date]
├─ Next Action: [Task]
└─ [Quick Actions: Send Proposal | Schedule Call | Move Stage]

Sort by: Close date | Potential value | Stage | Probability
Filter by: Tier | Source | Assigned to
```

**Pipeline Metrics**
```
SALES PERFORMANCE

Average Deal Size: $[Amount]
Average Sales Cycle: [X] days
Win Rate: [Y]%
Pipeline Velocity: $[Amount]/month

This Month:
Proposals Sent: [X]
Deals Closed: [Y]
Revenue Added: $[Amount]

Top Sources:
1. [Source] - [X] leads
2. [Source] - [Y] leads
3. [Source] - [Z] leads
```

**Actions Needed**
```
REQUIRES FOLLOW-UP

🔴 Stalled: [X] prospects (no activity >7 days)
🟡 Due: [Y] follow-ups needed this week
⏰ Upcoming: [Z] proposals need to be created

[Prospect Name] - Proposal sent [X] days ago, no response
[Prospect Name] - Call scheduled for [Date]
[Prospect Name] - Waiting on [specific item]
```

---

### Team Dashboard

**URL:** `/dashboard/team`

**Team Overview**
```
TEAM CAPACITY & UTILIZATION

Total Team Members: [X]
Available Hours This Week: [Y]h
Allocated Hours: [Z]h
Utilization Rate: [%]%

Capacity Status:
🟢 Healthy: [A] agents (60-85% utilized)
🟡 Watch: [B] agents (85-95% utilized)
🔴 Overloaded: [C] agents (>95% utilized)
🔵 Underutilized: [D] agents (<40% utilized)
```

**Individual Agent Views**
```
[Agent Name] - [Role]
This Week: [X]h / [Y]h available ([Z]% utilized)

Current Assignments:
├─ [Client A] ([X]h) - [Primary task]
├─ [Client B] ([Y]h) - [Primary task]
└─ [Internal] ([Z]h) - [Task]

Performance:
├─ Tasks completed (this week): [X]
├─ On-time delivery rate: [Y]%
├─ Client satisfaction: [Z]/5
└─ Code review score: [W]/5

Upcoming:
⏰ [Task] due [Date]
⏰ [Task] due [Date]

[View Details] [Adjust Workload] [Performance Review]
```

**Team Performance Metrics**
```
PERFORMANCE INDICATORS

Velocity (Story Points or Tasks/Week):
[Chart showing team velocity over time]
Current: [X] pts/week
Average: [Y] pts/week
Trend: [↑/↓/→]

Quality Metrics:
├─ Code review approval rate: [X]%
├─ Test coverage average: [Y]%
├─ Bugs per deployment: [Z]
└─ Client satisfaction: [W]/5

Delivery Metrics:
├─ On-time delivery rate: [X]%
├─ Average task completion time: [Y] days
├─ Sprint completion rate: [Z]%
└─ Overdue tasks: [W]
```

**Workload Distribution**
```
WORKLOAD BALANCE

[Visual chart showing hours per agent]

By Project:
[Client A]: [X]h across [Y] agents
[Client B]: [X]h across [Y] agents
[Internal]: [X]h across [Y] agents

By Role:
Development: [X]h ([Y]% of total)
QA: [X]h ([Y]% of total)
PM/Coordination: [X]h ([Y]% of total)
Sales/Business Dev: [X]h ([Y]% of total)
```

---

### Tasks Dashboard

**URL:** `/dashboard/tasks`

**Task Overview**
```
ALL TASKS

Total Active: [X]
Completed This Week: [Y]
Completion Rate: [Z]%

Status:
🔴 Overdue: [A] tasks
🟡 Due Today: [B] tasks
🟢 Due This Week: [C] tasks
⏳ Upcoming: [D] tasks
✅ Completed: [E] tasks (last 7 days)
```

**Priority Task List**
```
HIGH PRIORITY TASKS

[Task Name]
├─ Client: [Client Name]
├─ Assigned: [Agent Name]
├─ Due: [Date] ([X] days) 🔴/🟡/🟢
├─ Status: [Not Started/In Progress/Blocked/Review]
├─ Blocker: [Reason if blocked]
└─ [Quick Actions: Start | Update | Mark Done | Reassign]

Filter by:
- Client
- Assigned to
- Status
- Due date
- Priority

Sort by:
- Due date
- Priority
- Client
- Status
```

**Task Metrics**
```
TASK PERFORMANCE

Average Completion Time:
├─ All tasks: [X] days
├─ By priority: High [X]d, Medium [Y]d, Low [Z]d
└─ By type: Dev [X]d, QA [Y]d, Admin [Z]d

Blocked Tasks: [X]
Average Time Blocked: [Y] days

Task Sources:
├─ Client requests: [X]%
├─ Internal improvements: [Y]%
├─ Bug fixes: [Z]%
└─ Maintenance: [W]%
```

---

## Key Metrics & KPIs

### Business Health Metrics

**Client Metrics:**
- Total active clients
- New clients this month
- Churned clients this month
- Client retention rate (12-month rolling)
- Average client lifetime
- Client satisfaction (average rating)

**Financial Metrics:**
- Monthly Recurring Revenue (MRR)
- Month-over-month growth
- Revenue by tier
- Average deal size
- Customer Lifetime Value (CLV)
- Customer Acquisition Cost (CAC)
- CAC payback period
- Unpaid invoices (amount and age)

**Sales Metrics:**
- Pipeline value (total and weighted)
- Win rate
- Average sales cycle length
- Proposals sent vs closed
- Lead sources and conversion rates

### Operational Metrics

**Delivery Performance:**
- On-time delivery rate (% of milestones delivered on time)
- Average delivery time vs estimate
- Client-reported bugs per delivery
- Deliverable acceptance rate (first submission)

**Team Performance:**
- Team utilization rate
- Individual utilization rates
- Tasks completed per week (velocity)
- Average task completion time
- Overdue task count

**Quality Metrics:**
- Code review approval rate
- Test coverage (average across projects)
- Bugs per deployment
- Post-delivery bug rate
- Client satisfaction with quality

**Communication Metrics:**
- Average response time to client questions
- Days since last client contact (per client)
- Weekly update completion rate
- Meeting attendance rate

### Warning Thresholds

**🔴 Red Alerts (Urgent Action Required):**
- Client status marked red
- Invoice overdue >60 days
- Milestone overdue >3 days
- Client no contact >7 days
- Utilization >95% (overload)
- Critical bug in production

**🟡 Yellow Alerts (Monitor Closely):**
- Client status marked yellow
- Invoice overdue 30-60 days
- Milestone due within 24h
- Client no contact 5-7 days
- Utilization 85-95% (high)
- MRR declined 2 months in a row

**🟢 Green (Healthy):**
- Client status green
- Invoices paid on time
- Milestones on schedule
- Regular client contact
- Utilization 60-85%
- MRR growing

---

## Data Sources & Updates

### Where Data Comes From

**Client & Project Data:**
- Notion or Linear (project management)
- GitHub (code activity)
- CRM (if using one, or manual entry)
- Contracts (stored in client folders)

**Financial Data:**
- Stripe (payment processing)
- Invoice tracking (manual or QuickBooks/Wave)
- Contract database

**Communication Data:**
- Slack (parsed for last contact dates)
- Email (archived communications)
- Calendar (meeting logs)

**Task Data:**
- Project management tool
- GitHub issues
- Internal task tracking

### Update Frequency

**Real-time:**
- Task status changes
- New communications logged
- Payment received
- Status changes (red/yellow/green)

**Daily:**
- Team utilization calculations
- Overdue task counts
- Activity feed
- Client contact tracking

**Weekly:**
- Performance metrics
- Team velocity
- Delivery rates

**Monthly:**
- Revenue reports
- Retention calculations
- Client lifetime value
- Trend analysis

### Manual vs Automated

**Automated (via integrations):**
- GitHub commits and PR activity
- Slack messages (last contact)
- Stripe payments
- Calendar meeting logs
- Task completion from project tool

**Manual Entry (quick forms):**
- Client status changes (red/yellow/green)
- Project notes and context
- Prospect pipeline updates
- Invoice status if not using Stripe
- Demo and deliverable logging

**Agent-Updated:**
- Daily task updates
- Communication logs (email summaries)
- Deliverable creation
- Time tracking

---

## Dashboard Implementation Plan

### Phase 1: MVP (Week 1-2)

**Minimal viable dashboard for Rick:**

**Build:**
1. Overview page with client list
2. Basic client detail pages
3. Revenue summary (manual data entry)
4. Task list (from GitHub or Notion)
5. Simple pipeline tracking

**Skip for now:**
- Charts and visualizations
- Automated data sync
- Team utilization (manual estimate)

**Tool:** Notion database or Airtable with linked views

### Phase 2: Automation (Week 3-4)

**Add:**
1. Stripe integration for revenue
2. GitHub integration for task tracking
3. Slack integration for communication tracking
4. Automated status calculations
5. Alert system (email/Slack for red flags)

**Tool:** Same as Phase 1 + Zapier/Make for integrations

### Phase 3: Analytics (Week 5-6)

**Add:**
1. Charts and trend visualization
2. Performance metrics calculations
3. Forecasting models
4. Exportable reports
5. Mobile-friendly view

**Tool:** Consider building custom dashboard or using Retool/Metabase

### Phase 4: AI Assistant (Future)

**Add:**
1. Natural language query ("How is Project X doing?")
2. Proactive alerts (AI detects patterns)
3. Recommendations (AI suggests actions)
4. Automated reporting (weekly summary generated)

**Tool:** Custom AI agent with dashboard access

---

## Dashboard Usage Guidelines

### Rick's Daily Routine (5-10 minutes)

**Morning Check (5 min):**
1. Scan overview page for red/yellow alerts
2. Review "Requires Attention" tasks
3. Check today's schedule
4. Quick revenue check

**Actions:**
- Address any red alerts immediately
- Delegate yellow alerts to Harper
- Review critical tasks

### Rick's Weekly Review (30 minutes)

**Friday Review:**
1. Review each client's status in detail
2. Check revenue vs projections
3. Review team utilization and workload
4. Pipeline review and follow-ups
5. Identify next week's priorities

**Actions:**
- Update client statuses
- Adjust resource allocation
- Follow up on stalled deals
- Plan week ahead

### Rick's Monthly Review (2 hours)

**End of Month:**
1. Comprehensive revenue analysis
2. Client retention and churn review
3. Team performance reviews
4. Pipeline health and forecasting
5. Strategic planning for next month

**Actions:**
- Update financial projections
- Team 1-on-1s (if human teammates)
- Adjust pricing or offerings if needed
- Plan growth initiatives

---

## Technical Specifications

### Tech Stack Recommendation

**Option 1: No-Code (Fastest)**
- **Tool:** Notion or Airtable
- **Integrations:** Zapier/Make
- **Timeline:** 1-2 weeks
- **Cost:** $20-50/month
- **Pros:** Fast, flexible, no coding
- **Cons:** Limited customization, slower performance

**Option 2: Low-Code (Balanced)**
- **Tool:** Retool or Appsmith
- **Database:** PostgreSQL or Supabase
- **Timeline:** 2-4 weeks
- **Cost:** $50-100/month
- **Pros:** More customization, better performance
- **Cons:** Requires some technical setup

**Option 3: Custom Build (Most Powerful)**
- **Stack:** Next.js + PostgreSQL + Tailwind
- **Hosting:** Vercel + Supabase
- **Timeline:** 4-8 weeks
- **Cost:** $20-40/month hosting
- **Pros:** Full control, best performance, can sell to other agencies
- **Cons:** Takes longest, requires maintenance

**Recommendation for ClawOps:**
Start with **Option 1 (Notion/Airtable)** for MVP, then migrate to **Option 2 (Retool)** once we have 5+ clients.

### Data Schema (High-Level)

**Clients Table:**
- ID, Name, Tier, Status, MRR, Start Date, Contract Value, Primary Contact, Last Contact Date, Notes

**Projects Table:**
- ID, Client ID, Name, Status, Start Date, End Date, Current Phase, Budget, Spent

**Milestones Table:**
- ID, Project ID, Name, Due Date, Status, Deliverables, Approved Date

**Tasks Table:**
- ID, Project ID, Assignee, Name, Status, Priority, Due Date, Created Date, Completed Date

**Communications Table:**
- ID, Client ID, Date, Type (Email/Slack/Call), Summary, Link

**Invoices Table:**
- ID, Client ID, Amount, Due Date, Paid Date, Status

**Prospects Table:**
- ID, Name, Stage, Potential MRR, Tier, Probability, Expected Close, Source, Notes

---

## Innovative Ideas for CEO Review

### 1. AI Dashboard Assistant
**Concept:** Natural language interface to query the dashboard
- "How is Project X doing?"
- "Which clients need attention this week?"
- "What's our revenue forecast for Q2?"

**Value:** Faster insights without clicking through multiple views

### 2. Predictive Churn Alerts
**Concept:** AI analyzes patterns (communication frequency, satisfaction scores, scope requests) to predict which clients might churn
- Early warning system
- Suggests interventions

**Value:** Proactive retention, saves revenue

### 3. Automated Weekly CEO Report
**Concept:** AI generates a written summary every Friday
- Key wins this week
- Red flags
- Revenue update
- Next week priorities
- Sent via email or Slack

**Value:** Saves Rick 30 minutes, ensures nothing is missed

### 4. Client Health Score
**Concept:** Algorithmic score (0-100) based on:
- On-time delivery rate
- Communication frequency
- Scope creep incidents
- Payment history
- Satisfaction ratings

**Value:** Single number to assess client relationship

### 5. Resource Allocation Optimizer
**Concept:** AI suggests optimal team assignments based on:
- Skills required
- Current workload
- Project deadlines
- Agent performance history

**Value:** Better utilization, reduced burnout risk

### 6. Competitor Intelligence Dashboard
**Concept:** Track what other AI agencies are doing:
- Pricing changes
- New service offerings
- Marketing strategies
- Job postings (team growth signals)

**Value:** Stay ahead of market trends

### 7. Client Upsell Predictor
**Concept:** AI identifies clients ready to upgrade tiers based on:
- Feature requests beyond current tier
- Usage patterns
- Project success
- Relationship strength

**Value:** Increase MRR through timely upsells

### 8. Project Profitability Analysis
**Concept:** Track actual time spent vs revenue per project
- Identify which projects/clients are most profitable
- Which tier or project type is best ROI
- Adjust pricing or processes accordingly

**Value:** Maximize profit margins

### 9. Real-Time Collaboration View
**Concept:** See what every agent is working on right now
- Live activity feed
- Current tasks
- Blockers
- Like a real-time "office view" for a distributed AI team

**Value:** Immediate visibility for coordination

### 10. Client Portal (White-Label Dashboard)
**Concept:** Give clients a simplified view of their project
- Milestone progress
- Deliverables
- Upcoming meetings
- Submit requests
- Reduces "where are we?" questions

**Value:** Transparency builds trust, reduces support burden

---

**This dashboard is our mission control. It should make running ClawOps feel effortless, even at 50 clients.**
