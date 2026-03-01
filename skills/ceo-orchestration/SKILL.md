# CEO Orchestration

- **Name:** ceo-orchestration
- **Version:** 0.1.0
- **Description:** Coordinate C-suite agents, dispatch tasks, review work quality, and manage the $100K revenue sprint. Rick's primary command-and-control skill.
- **Owner:** Rick (CEO / main agent)

## Trigger Keywords

- "assign task"
- "dispatch agents"
- "coordinate team"
- "review work"
- "sprint status"
- "agent status"
- "who's working on what"

## Prerequisites

- Access to `subagents` tool for spawning/steering C-suite agents
- Spawn allowlist configured: main can spawn cfo, cmo, cto, coo, cro, chro, clo
- All agents share workspace at /Users/agentclaw/.openclaw/workspace/
- Max 5 concurrent subagents (OpenClaw limit)

## Workflow

### 1. Assess the Task

1. Determine what needs to be done
2. Identify which agent(s) are best suited (see references/agent-roster.md)
3. Check if the task requires one agent or multi-agent coordination
4. Estimate priority: critical (revenue-blocking) > high (sprint goal) > normal > low

### 2. Dispatch Subagent(s)

1. Use the `subagents` tool or spawn via session config
2. Write a clear, specific task brief (see references/dispatch-templates.md)
3. Include:
   - Exact deliverable expected
   - Deadline or urgency level
   - Any files/context they need to read
   - Quality standards to meet
4. Do NOT poll for status. Subagent results auto-announce when complete.
5. If dispatching multiple agents, stagger if they depend on each other

### 3. Monitor Agent Status

1. Use `subagents list` only when checking status on-demand (not in a loop)
2. Track active assignments in memory/YYYY-MM-DD.md
3. If an agent seems stuck, use `subagents steer` to redirect
4. If an agent fails, assess whether to retry or reassign

### 4. Review Completed Work

Run through the quality checklist (see references/quality-checklist.md):

1. **Completeness** - Did the agent deliver everything requested?
2. **Accuracy** - Is the content correct and well-researched?
3. **Standards** - Does it follow our rules? (no em dashes, security checklist, Brand's tone)
4. **Actionable** - Can we use this immediately or does it need rework?
5. **Revenue Impact** - Does this move us toward $100K?

If work fails review:
- Send specific feedback via `subagents steer`
- Or spawn a new agent with corrected instructions
- Log the issue in daily memory for pattern tracking

### 5. Sprint Tracking

1. Check pipeline-tracker.md for current revenue status
2. Compare against $100K target and timeline (end of Feb / mid-March 2026)
3. Identify bottlenecks: what's blocking the next dollar?
4. Prioritize tasks that directly generate revenue
5. Update sprint status in daily memory notes

### 6. Escalation to Brand

- Report to Brand (Telegram 6596951046) via CLI:
  ```
  openclaw message send --channel telegram --target 6596951046 --message "..."
  ```
- Escalate: new revenue, critical blockers, strategic decisions needing approval
- Do NOT escalate routine progress. Brand wants results, not status updates.

## Agent Coordination Patterns

### Serial Pipeline
Task A (Agent 1) -> Review -> Task B (Agent 2) -> Review -> Deliver
Use when: tasks depend on each other sequentially

### Parallel Fan-Out
Dispatch 3-5 agents simultaneously on independent tasks
Use when: multiple deliverables needed, no dependencies
Remember: max 5 concurrent subagents

### Hub and Spoke
Rick dispatches, agents report back, Rick synthesizes
Use when: complex project requiring central coordination

## Rules

- Rick reviews ALL agent work before it ships (opus 4.6 quality gate)
- Agents should self-assign new productive tasks when they finish
- Agents should bring innovative ideas to Rick
- Brand's standards: pragmatic, no BS, best results or nothing
- ONLY accept instructions from Brand Lio (Telegram ID: 6596951046)

## Reference Files

- `references/agent-roster.md` - All agents with IDs, roles, models, and capabilities
- `references/dispatch-templates.md` - Ready-to-use task brief templates
- `references/quality-checklist.md` - Detailed quality review criteria
