# Hiring Criteria

**Version:** 0.1.0
**Last Updated:** 2026-02-21

Criteria and process for recommending new agents to the team. Used with the team-management skill.

---

## When to Recommend a New Agent

### Valid Reasons

| Reason | Example |
|--------|---------|
| Persistent workload gap | An area consistently needs attention but no agent covers it |
| Specialized expertise needed | A new project requires domain knowledge no current agent has |
| Scalability | Current agent is overloaded and the workload will not decrease |
| Strategic initiative | A new business direction requires dedicated attention |
| Single point of failure | Only one agent covers a critical function |

### Invalid Reasons (Do Not Hire)

| Reason | What to Do Instead |
|--------|-------------------|
| Temporary spike | Redistribute workload temporarily |
| Agent is "bored" | Assign new responsibilities or skills |
| "Nice to have" | Document it but wait for a real need |
| Duplicating existing coverage | Cross-train or add skills to existing agent |

---

## New Agent Justification Template

Before recommending a new agent, complete this template:

```
## New Agent Justification

### Proposed Role
- Title: [role title]
- Purpose: [one sentence: why this agent exists]

### Gap Analysis
- What work is not getting done today?
- Which agent(s) are currently handling this (if any)?
- How much time/effort does this work require?
- Is this temporary or ongoing?

### Alternatives Considered
- Could an existing agent absorb this? Why or why not?
- Could this be handled with a new skill rather than a new agent?
- Could workload be redistributed?

### Cost Assessment
- Model recommendation: [model name]
- Estimated token usage: [low / medium / high]
- Setup effort: [hours to configure]
- Maintenance effort: [ongoing maintenance needs]

### Impact Assessment
- What improves when this agent exists?
- What are the risks of NOT adding this agent?
- How does this affect the existing team dynamic?

### Recommendation
- [HIRE / DO NOT HIRE / DEFER]
- Priority: [HIGH / MEDIUM / LOW]
```

---

## Agent Configuration Checklist

When a new hire is approved, use the agent-onboarding skill. This checklist ensures nothing is missed:

### Pre-Creation
- [ ] Role is clearly defined with specific responsibilities
- [ ] Model is selected (appropriate for complexity and cost)
- [ ] Skills are identified (existing skills or new ones needed)
- [ ] Channel assignments are decided
- [ ] Reporting structure is clear

### Identity Design
- [ ] Name is chosen (short, memorable, distinct from other agents)
- [ ] Personality is defined (not generic; specific communication style)
- [ ] Pronouns are set
- [ ] Voice/tone is differentiated from other agents
- [ ] Boundaries are explicit (what this agent does NOT do)

### Configuration
- [ ] Agent added to openclaw.json
- [ ] SOUL.md written
- [ ] System prompt configured
- [ ] Skills assigned
- [ ] Channels configured

### Post-Creation
- [ ] Agent responds correctly to test queries
- [ ] Agent reads and follows its SOUL.md
- [ ] Agent accesses skills properly
- [ ] Agent roster updated
- [ ] Team notified of new agent

---

## Model Selection Guide

| Workload Type | Recommended Model Tier | Reasoning |
|---------------|----------------------|-----------|
| Simple responses, routing, triage | Fast/cheap model | Low complexity, high volume |
| Standard tasks, conversations | Mid-tier model | Balance of quality and cost |
| Complex analysis, writing, strategy | High-tier model | Quality matters more than speed |
| Code generation, technical review | Code-specialized model | Domain expertise |

**Factors to consider:**
- Task complexity (simple lookup vs deep analysis)
- Volume (how often will this agent be used)
- Quality requirements (can we tolerate occasional errors)
- Cost sensitivity (budget constraints)
- Latency requirements (does speed matter)

---

## Team Size Guidelines

| Team Size | Considerations |
|-----------|---------------|
| 1-3 agents | Agents should be generalists with broad skills |
| 4-6 agents | Begin specializing; each agent should have a clear lane |
| 7-10 agents | Need clear org structure; coordination overhead increases |
| 10+ agents | Consider sub-teams; management agents may be needed |

**General principle:** Fewer well-configured agents beat many poorly-configured ones. Every agent adds coordination overhead. Add agents only when there is a clear, persistent need.

---

## Naming Conventions

| Convention | Rule |
|------------|------|
| Agent name | Short, 1-2 syllables, easy to say and type |
| Agent ID | lowercase-hyphenated (e.g., "chief-legal-officer") |
| Skill names | lowercase-hyphenated (e.g., "contract-drafting") |
| File names | lowercase-hyphenated with .md extension |

**Avoid:**
- Names that sound too similar to existing agents
- Names that are hard to spell or pronounce
- Generic names (e.g., "Assistant", "Helper", "Bot")
- Names that imply capabilities the agent does not have
