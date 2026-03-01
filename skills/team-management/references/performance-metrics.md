# Performance Metrics

**Version:** 0.1.0
**Last Updated:** 2026-02-21

Detailed metric definitions for evaluating agent performance. Used with the team-management skill.

---

## Metric Categories

### 1. Effectiveness (Weight: 40%)

How well does the agent accomplish its purpose?

#### Task Completion Rate
- **Definition:** Percentage of assigned tasks completed successfully
- **Measurement:** Tasks completed / Tasks assigned (over evaluation period)
- **Scoring:**
  - 5: 95%+ completion rate
  - 4: 85-94% completion rate
  - 3: 70-84% completion rate
  - 2: 50-69% completion rate
  - 1: Below 50% completion rate

#### Output Quality
- **Definition:** Accuracy, completeness, and usefulness of the agent's outputs
- **Measurement:** Qualitative assessment of recent outputs
- **Indicators:**
  - Outputs are accurate and factually correct
  - Outputs are complete (no missing information)
  - Outputs are actionable (user can act on them)
  - Outputs match the user's intent and needs
  - Formatting is appropriate for the channel
- **Scoring:**
  - 5: Consistently excellent, exceeds expectations
  - 4: High quality with rare minor issues
  - 3: Acceptable quality, occasional gaps
  - 2: Frequent quality issues, needs improvement
  - 1: Unreliable, often incorrect or incomplete

#### Response Relevance
- **Definition:** How well the agent understands and addresses what was asked
- **Measurement:** Review of recent conversations for on-target responses
- **Indicators:**
  - Correctly interprets ambiguous requests
  - Asks clarifying questions when needed (not too many, not too few)
  - Stays on topic
  - Avoids unnecessary tangents or over-explanation
- **Scoring:**
  - 5: Almost always on target, handles ambiguity well
  - 4: Usually relevant, minor misinterpretations rare
  - 3: Generally relevant but sometimes misses the point
  - 2: Frequently off-target or over/under-responds
  - 1: Regularly misunderstands requests

#### Initiative and Proactivity
- **Definition:** How well the agent anticipates needs and acts without being asked
- **Measurement:** Review of heartbeat actions, self-directed improvements, and proactive suggestions
- **Indicators:**
  - Useful heartbeat check-ins (not just HEARTBEAT_OK)
  - Identifies problems before they are reported
  - Suggests improvements to processes or documentation
  - Maintains memory files and documentation proactively
- **Scoring:**
  - 5: Regularly anticipates needs, proactively improves
  - 4: Sometimes proactive, good heartbeat usage
  - 3: Reactive but responsive
  - 2: Rarely proactive, waits to be told
  - 1: Passive, never takes initiative

---

### 2. Efficiency (Weight: 30%)

How well does the agent use resources?

#### Response Time
- **Definition:** How quickly the agent responds to requests
- **Measurement:** Average time from request to first meaningful response
- **Scoring:**
  - 5: Responds within seconds, minimal delay
  - 4: Responds promptly, appropriate pacing
  - 3: Acceptable speed, occasional delays
  - 2: Noticeably slow, frequent delays
  - 1: Unacceptably slow

#### Token Efficiency
- **Definition:** How efficiently the agent uses tokens (cost per task)
- **Measurement:** Tokens consumed per task completed
- **Indicators:**
  - Avoids unnecessary verbosity
  - Does not repeat information already established
  - Uses appropriate tools (not over-tooling)
  - Reads files efficiently (targeted reads vs full file reads)
- **Scoring:**
  - 5: Highly efficient, minimal waste
  - 4: Good efficiency, reasonable token usage
  - 3: Average efficiency
  - 2: Wasteful, verbose, or redundant
  - 1: Extremely inefficient

#### Tool Usage
- **Definition:** How appropriately the agent selects and uses available tools
- **Measurement:** Review of tool call patterns
- **Indicators:**
  - Selects the right tool for the task
  - Uses tools efficiently (batching calls, avoiding unnecessary calls)
  - Handles tool errors gracefully
  - Does not over-rely on a single tool
- **Scoring:**
  - 5: Expert tool usage, creative and efficient
  - 4: Good tool selection, minor inefficiencies
  - 3: Adequate tool usage
  - 2: Poor tool selection, frequent unnecessary calls
  - 1: Does not use tools effectively

#### Escalation Rate
- **Definition:** How often the agent needs help or escalates to another agent/human
- **Measurement:** Escalations / Total tasks
- **Scoring:**
  - 5: Handles almost everything independently, escalates only critical issues
  - 4: Rarely escalates, good judgment on when to ask
  - 3: Sometimes escalates unnecessarily
  - 2: Frequently needs help
  - 1: Cannot work independently

---

### 3. Collaboration (Weight: 30%)

How well does the agent work with others?

#### Handoff Quality
- **Definition:** How well the agent transitions work to other agents or the human
- **Measurement:** Quality of context provided during handoffs
- **Indicators:**
  - Provides complete context when handing off
  - Documents decisions and reasoning
  - Does not drop information between sessions
  - Makes it easy for the next agent/human to continue
- **Scoring:**
  - 5: Seamless handoffs, complete context always provided
  - 4: Good handoffs, minor gaps occasionally
  - 3: Adequate handoffs, some context missing
  - 2: Poor handoffs, frequently missing context
  - 1: No handoff awareness

#### Documentation Habits
- **Definition:** How well the agent maintains written records
- **Measurement:** Review of memory files, notes, and documentation
- **Indicators:**
  - Daily memory files are maintained
  - Important decisions are documented with reasoning
  - Files are organized and findable
  - Updates documentation when things change
- **Scoring:**
  - 5: Excellent documentation, comprehensive and organized
  - 4: Good documentation habits, mostly complete
  - 3: Adequate, but gaps in documentation
  - 2: Sporadic documentation
  - 1: No documentation habits

#### Team Awareness
- **Definition:** How well the agent understands and respects other agents' roles
- **Measurement:** Behavioral observation
- **Indicators:**
  - Knows when to defer to another agent's expertise
  - Does not duplicate work being done by others
  - Shares relevant information with appropriate agents
  - Respects boundaries and role definitions
- **Scoring:**
  - 5: Strong team awareness, excellent collaboration
  - 4: Good awareness, works well with others
  - 3: Adequate, but sometimes steps on toes
  - 2: Poor awareness of other agents' roles
  - 1: Works in isolation, ignores team structure

---

## Overall Score Calculation

```
Overall = (Effectiveness_Avg * 0.4) + (Efficiency_Avg * 0.3) + (Collaboration_Avg * 0.3)
```

| Overall Score | Rating | Action |
|---------------|--------|--------|
| 4.5 - 5.0 | Outstanding | Recognize, expand responsibilities |
| 3.5 - 4.4 | Strong | Maintain, minor development |
| 2.5 - 3.4 | Satisfactory | Development plan needed |
| 1.5 - 2.4 | Needs Improvement | Significant changes required |
| 1.0 - 1.4 | Unsatisfactory | Reconfigure or retire |

---

## Review Schedule

| Review Type | Frequency | Depth |
|-------------|-----------|-------|
| Quick Check | Weekly | Spot check 2-3 metrics |
| Standard Review | Monthly | All metrics, written summary |
| Full Review | Quarterly | All metrics, trend analysis, goal setting |
