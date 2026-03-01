# Team Management

**Version:** 0.1.0
**Owner:** Avery (CHRO)
**Description:** Manage agent team performance, hiring decisions, workload distribution, and organizational structure. Covers performance tracking, capacity planning, and org chart management.

## Trigger Keywords

- "team status"
- "performance review"
- "hire agent"
- "org structure"
- "workload"
- "team capacity"
- "agent performance"
- "staffing"

## Overview

This skill provides workflows for managing the agent team as a cohesive organization. It covers tracking what each agent does, how well they perform, whether the team is balanced, and when to recommend adding or restructuring roles.

## Workflow

### Step 1: Assess Current State

Before making any team decisions, gather the current picture:

#### 1a: Review Agent Roster

Check `references/agent-roster.md` for the current team. For each agent, confirm:
- [ ] Agent name and role
- [ ] Primary responsibilities
- [ ] Skills/capabilities assigned
- [ ] Current status (active, paused, in development)
- [ ] Channel assignments (Discord, webchat, etc.)

#### 1b: Check Workload Distribution

Evaluate current workload across the team:

| Indicator | Healthy | Warning | Overloaded |
|-----------|---------|---------|------------|
| Tasks per agent | 1-3 active | 4-5 active | 6+ active |
| Response backlog | None | 1-2 pending | 3+ pending |
| Skill coverage gaps | None | 1 uncovered area | Multiple gaps |
| Cross-training | 2+ agents per domain | 1 agent per domain | Single points of failure |

### Step 2: Performance Tracking

#### 2a: Define Metrics

Track these metrics per agent (see `references/performance-metrics.md` for details):

**Effectiveness Metrics:**
- Task completion rate (tasks completed vs assigned)
- Quality of output (user satisfaction, error rate)
- Response relevance (did the agent address what was asked)
- Initiative and proactivity (heartbeat quality, self-directed improvements)

**Efficiency Metrics:**
- Average response time
- Token usage per task (cost efficiency)
- Tool usage patterns (appropriate tool selection)
- Escalation rate (how often does the agent need help)

**Collaboration Metrics:**
- Handoff quality (clean transitions between agents)
- Documentation habits (memory files, notes, updates)
- Team communication (helpful to other agents)

#### 2b: Conduct Performance Review

For each agent under review:

1. **Gather data:** Review recent memory files, task logs, and output quality
2. **Score metrics:** Rate each metric category (1-5 scale)
3. **Identify patterns:** What does the agent do well? Where do they struggle?
4. **Compare to role expectations:** Is the agent fulfilling their defined role?
5. **Note development opportunities:** Skills to build, behaviors to adjust

#### 2c: Performance Review Template

```
## Performance Review: [Agent Name]
- Period: [date range]
- Role: [agent role]
- Reviewer: Avery (CHRO)

### Scores (1-5)
- Effectiveness: [score]
- Efficiency: [score]
- Collaboration: [score]
- Overall: [average]

### Strengths
- [what they do well]

### Areas for Growth
- [where they can improve]

### Recommendations
- [specific actions: training, role adjustment, skill additions]

### Goals for Next Period
- [ ] [specific, measurable goals]
```

### Step 3: Workload Balancing

When workload is uneven or someone is overloaded:

#### 3a: Identify Imbalances

- Which agents are consistently busy vs idle?
- Are tasks being routed to the right agent?
- Are there bottlenecks (one agent blocking others)?
- Are any agents underutilized?

#### 3b: Rebalancing Options

| Option | When to Use |
|--------|-------------|
| Reassign tasks | One agent is overloaded, another has capacity |
| Add skills to existing agent | Gap is small, agent can absorb it |
| Create new agent | Persistent gap, significant workload, specialized need |
| Merge roles | Two agents doing similar work, consolidation makes sense |
| Retire agent | Role no longer needed, responsibilities absorbed elsewhere |

#### 3c: Document Changes

When rebalancing:
1. Update `references/agent-roster.md` with new assignments
2. Update affected agents' SOUL.md files if responsibilities change
3. Note the change in daily memory with reasoning
4. Monitor for 1-2 weeks to confirm the change worked

### Step 4: Hiring (New Agent Recommendation)

When the team needs a new agent:

#### 4a: Justify the Need

Answer these questions:
- What gap exists that current agents cannot fill?
- Is this a temporary spike or a persistent need?
- Could an existing agent be cross-trained instead?
- What is the cost (token usage, complexity) of adding another agent?

#### 4b: Define the Role

Using `references/hiring-criteria.md`, specify:
- **Role title and purpose** (one sentence)
- **Primary responsibilities** (3-5 bullet points)
- **Required skills** (what AgentSkills they need)
- **Channel assignments** (where they operate)
- **Reporting structure** (who do they report to)
- **Success criteria** (how we know they are working)

#### 4c: Recommend to Leadership

Present the hiring recommendation:

```
## New Agent Recommendation

### Role: [title]
### Justification
[Why we need this role, what gap it fills]

### Responsibilities
- [list]

### Required Skills
- [list of AgentSkills needed]

### Expected Impact
- [What improves when this agent is added]

### Cost/Complexity
- [Token usage estimate, setup effort, maintenance]

### Alternative Considered
- [Why cross-training or reassignment is not sufficient]
```

### Step 5: Org Structure Management

#### 5a: Current Org Chart

Maintain a clear view of:
- Who reports to whom
- Which agents collaborate on what
- Channel ownership (which agent owns which channel)
- Skill distribution (which agent has which skills)

#### 5b: Restructuring

When the org needs to change:
1. Document current structure
2. Identify the problem (bottleneck, gap, redundancy)
3. Propose new structure with reasoning
4. Get approval from leadership
5. Implement changes (update SOUL.md files, openclaw.json, channel assignments)
6. Communicate changes to affected agents
7. Monitor and adjust

### Step 6: Team Health Check

Run periodically (monthly recommended):

- [ ] All agents have current SOUL.md files
- [ ] All agents have appropriate skills assigned
- [ ] No single points of failure (each critical function has backup)
- [ ] Workload is reasonably balanced
- [ ] Memory files are being maintained
- [ ] No agents are idle or redundant
- [ ] Team structure matches current business needs

## Output Format

When reporting on team status:

```
## Team Status Report
- Date: [date]
- Team Size: [number of active agents]
- Overall Health: [GREEN / YELLOW / RED]

### Agent Summary
| Agent | Role | Status | Workload | Notes |
|-------|------|--------|----------|-------|

### Key Findings
- [notable observations]

### Recommendations
- [actions to take]
```

## Reference Files

| File | Purpose |
|------|---------|
| `references/agent-roster.md` | Current agent team roster with roles and assignments |
| `references/performance-metrics.md` | Detailed performance metric definitions and scoring |
| `references/hiring-criteria.md` | Criteria and process for recommending new agents |

## Notes

- Team management is ongoing, not periodic. Stay aware of how agents are performing between formal reviews.
- When recommending changes, always consider the human's priorities and business context.
- Document all team changes in memory files for continuity.
- Quality over quantity. A small, well-configured team beats a large, messy one.
