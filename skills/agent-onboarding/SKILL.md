# Agent Onboarding

**Version:** 0.1.0
**Owner:** Avery (CHRO)
**Description:** Set up new agents with proper configuration files, system prompts, identity documents, and channel assignments. Covers the full process from creation to operational readiness.

## Trigger Keywords

- "new agent"
- "set up agent"
- "configure agent"
- "agent onboarding"
- "create agent"
- "add agent"
- "spin up agent"

## Overview

This skill walks through every step of creating a new agent in the OpenClaw system: defining identity, writing configuration files, setting up channels, and verifying the agent is operational. A properly onboarded agent should be ready to work independently within its defined role.

## Prerequisites

Before starting, confirm:
- [ ] The new agent role has been approved (see team-management skill)
- [ ] The role purpose, responsibilities, and skills are defined
- [ ] The model and channel assignments are decided
- [ ] Access to `openclaw.json` for configuration

## Workflow

### Step 1: Define Agent Identity

Every agent needs a clear identity. Decide:

| Element | Description | Example |
|---------|-------------|---------|
| Name | Short, memorable name | "Quinn" |
| Role Title | Functional title | "Chief Legal Officer" |
| Personality | How they communicate | "Precise, thorough, plain-spoken" |
| Voice | Tone and style | "Professional but approachable" |
| Pronouns | Agent pronouns | "they/them" |

Use `references/agent-template.md` for the standard identity framework.

### Step 2: Create SOUL.md

The SOUL.md file defines who the agent IS. This is the most important file.

Location: The agent's workspace or a shared location accessible to the agent.

**Required sections:**

1. **Identity** - Name, role, one-line description
2. **Purpose** - Why this agent exists (2-3 sentences)
3. **Personality** - How they communicate, their style
4. **Responsibilities** - What they own (bullet list)
5. **Boundaries** - What they do NOT do
6. **Relationships** - How they relate to other agents
7. **Operating Principles** - Core rules they follow

See `references/soul-template.md` for the full template.

**SOUL.md rules:**
- Keep it under 200 lines
- Write in second person ("You are...")
- Be specific about personality, not generic
- Boundaries are as important as responsibilities
- Include how to handle ambiguity and edge cases

### Step 3: Create USER.md

The USER.md file tells the agent about the human they serve.

**Include:**
- Human's name and preferences
- Communication style preferences
- Business context
- Key projects and priorities
- Things to be aware of
- Do's and don'ts

**USER.md rules:**
- No sensitive credentials (those go in TOOLS.md or secure storage)
- Focus on working relationship, not personal details
- Update as preferences change

### Step 4: Create AGENTS.md

Use the standard workspace AGENTS.md or create agent-specific guidance.

This file tells the agent how to operate within the workspace:
- How to use memory files
- Safety rules
- External communication rules
- Heartbeat behavior
- Tool usage guidance

Typically, agents share the workspace AGENTS.md. Only create a custom one if the agent has significantly different operational needs.

### Step 5: Write System Prompt

The system prompt goes in `openclaw.json` under the agent's configuration.

See `references/system-prompt-guide.md` for best practices.

**System prompt structure:**
1. **Identity line** - "You are [Name], [Role]."
2. **Core directive** - What they do in one sentence
3. **Key behaviors** - 3-5 critical behavioral rules
4. **Skill references** - Point to SOUL.md and skills
5. **Constraints** - What they must not do

**System prompt rules:**
- Keep it concise (under 500 words ideal)
- Do not duplicate SOUL.md content; reference it instead
- Focus on behavioral guardrails and core identity
- Include instruction to read SOUL.md and USER.md on startup
- Avoid over-constraining; let skills handle specific workflows

### Step 6: Configure in openclaw.json

Add the agent to the OpenClaw configuration:

```json
{
  "agents": {
    "agent-id": {
      "name": "Agent Name",
      "model": "model-name",
      "systemPrompt": "System prompt text or file reference",
      "skills": ["skill-1", "skill-2"],
      "channels": {
        "channel-name": {
          "enabled": true
        }
      }
    }
  }
}
```

**Configuration checklist:**
- [ ] Agent ID is lowercase, hyphenated (e.g., "chief-legal-officer")
- [ ] Model is appropriate for the agent's complexity
- [ ] Skills list matches the agent's responsibilities
- [ ] Channels are assigned correctly
- [ ] System prompt is set

### Step 7: Assign Skills

Map the agent's responsibilities to AgentSkills:

1. List the agent's key responsibilities
2. Match each to an existing skill or flag the need for a new one
3. Add skill names to the agent's config
4. Verify skill files exist and are current

### Step 8: Channel Setup

Configure where the agent operates:

- **Webchat** - Direct conversation with the human
- **Discord** - Server channels (specify which ones)
- **Slack** - Workspace channels
- **Other** - API, scheduled tasks, etc.

For each channel:
- [ ] Channel is created/exists
- [ ] Agent has appropriate permissions
- [ ] Agent knows its role in that channel (via SOUL.md or system prompt)
- [ ] Test message sent and received

### Step 9: Verification Checklist

Before declaring the agent operational:

**Files exist and are complete:**
- [ ] SOUL.md written and reviewed
- [ ] USER.md in place
- [ ] AGENTS.md accessible
- [ ] System prompt configured
- [ ] Skills assigned and skill files exist

**Configuration is correct:**
- [ ] Agent appears in openclaw.json
- [ ] Model assignment is appropriate
- [ ] Channels are configured
- [ ] No typos in agent ID or skill names

**Operational test:**
- [ ] Agent responds to a basic greeting
- [ ] Agent can read its SOUL.md
- [ ] Agent can access its skills
- [ ] Agent writes to memory files correctly
- [ ] Agent respects its boundaries (test an out-of-scope request)

### Step 10: Documentation and Announcement

After successful onboarding:

1. Update `references/agent-roster.md` (in team-management skill)
2. Log the new agent in daily memory file
3. Notify the team (if applicable) about the new agent's role
4. Schedule a follow-up review (1-2 weeks) to assess performance

## Output Format

When reporting onboarding status:

```
## Agent Onboarding Report

### Agent: [Name]
- Role: [title]
- Status: [COMPLETE / IN PROGRESS / BLOCKED]
- Date: [date]

### Files Created
- [x] SOUL.md
- [x] USER.md
- [ ] AGENTS.md (using shared)
- [x] System prompt

### Configuration
- Model: [model]
- Skills: [list]
- Channels: [list]

### Verification
- [x] Responds to greeting
- [x] Reads SOUL.md
- [x] Accesses skills
- [ ] Memory file test (pending)

### Notes
- [Any issues, decisions, or follow-ups]
```

## Reference Files

| File | Purpose |
|------|---------|
| `references/agent-template.md` | Standard agent identity and configuration template |
| `references/soul-template.md` | SOUL.md template with all required sections |
| `references/system-prompt-guide.md` | Best practices for writing effective system prompts |

## Notes

- A well-written SOUL.md is the single most important factor in agent quality. Spend time on it.
- System prompts should be lean. Put detailed guidance in SOUL.md and skills.
- Test the agent in a low-stakes channel before giving it access to important ones.
- Every agent should know its boundaries. An agent that says "that is not my area" is better than one that guesses badly.
- Document the onboarding in memory so future onboarding can reference past decisions.
