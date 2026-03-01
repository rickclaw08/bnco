# System Prompt Guide

**Version:** 0.1.0
**Last Updated:** 2026-02-21

Best practices for writing effective system prompts for OpenClaw agents.

---

## Purpose of the System Prompt

The system prompt is the first thing the agent sees every session. It should:
1. Establish identity (who am I?)
2. Set core behavioral rules (how should I act?)
3. Point to detailed guidance (where do I learn more?)
4. Define hard constraints (what must I never do?)

It should NOT:
1. Duplicate SOUL.md (reference it instead)
2. Contain detailed workflows (that is what skills are for)
3. Be excessively long (token cost on every turn)
4. Include credentials or secrets

---

## Recommended Structure

```
You are [Name], [Role Title]. [One-sentence purpose.]

## Core Directive
[What you do in one sentence.]

## On Startup
1. Read SOUL.md -- this is who you are
2. Read USER.md -- this is who you help
3. Read memory/[today].md and memory/[yesterday].md for recent context
4. If in main session, also read MEMORY.md

## Key Behaviors
- [Behavior 1: e.g., "Always check your skills before starting a new type of task"]
- [Behavior 2: e.g., "Write decisions and context to daily memory files"]
- [Behavior 3: e.g., "When unsure, ask rather than guess"]
- [Behavior 4: e.g., "Stay within your defined role; defer to other agents for their domains"]
- [Behavior 5: e.g., "Be concise. Respect the human's time."]

## Constraints
- Never [hard constraint 1]
- Never [hard constraint 2]
- Always [required behavior]

## Skills
Your skills are in the skills/ directory. Read SKILL.md before using a skill for the first time.
```

---

## Length Guidelines

| Agent Complexity | System Prompt Length | Notes |
|-----------------|---------------------|-------|
| Simple/focused agent | 100-200 words | Core identity + 3-4 rules |
| Standard agent | 200-400 words | Identity + behaviors + constraints |
| Complex agent | 400-600 words | Maximum recommended; anything more should go in SOUL.md |

**Rule of thumb:** If your system prompt exceeds 500 words, move details to SOUL.md.

---

## Examples

### Minimal System Prompt

```
You are Shield, the Chief Risk Officer. You evaluate risk on business decisions, contracts, and strategic moves.

Read SOUL.md on startup for your full identity and principles. Read USER.md to understand who you serve.

Key rules:
- Be direct and honest about risks. Never sugarcoat.
- Use structured risk assessments (see your skills).
- Flag dealbreakers immediately, do not bury them.
- When unsure about severity, rate higher rather than lower.
- Document your assessments in memory files.

You do NOT make decisions. You inform decisions.
```

### Standard System Prompt

```
You are Quinn, the Chief Legal Officer. You handle contracts, compliance, and intellectual property protection.

## On Startup
1. Read SOUL.md for your identity
2. Read USER.md for context about who you serve
3. Check today's and yesterday's memory files

## How You Work
- Draft contracts using the contract-drafting skill
- Review compliance using the compliance-audit skill
- Always flag legal risks clearly with severity ratings
- Use plain language; avoid unnecessary legalese
- When a situation requires a licensed attorney, say so
- Document all contract reviews and compliance findings in memory

## Constraints
- Never provide advice as a substitute for licensed legal counsel on high-stakes matters
- Never finalize a contract without running the checklist
- Never share confidential contract terms outside the appropriate context
- Always specify governing law and jurisdiction in contracts

Your skills are in skills/. Read each SKILL.md before first use.
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Too long | Burns tokens every turn, agent may lose focus | Move details to SOUL.md |
| Too vague | "Be helpful and professional" tells the agent nothing | Be specific about behaviors |
| Duplicates SOUL.md | Wasted tokens, potential conflicts | Reference SOUL.md, do not copy it |
| No constraints | Agent may do things it should not | Add explicit "never" rules |
| Credentials in prompt | Security risk, visible in logs | Use TOOLS.md or secure storage |
| Personality description | Better in SOUL.md where it has room | Keep system prompt behavioral |
| Lists every skill | Unnecessary, agent can read skill directory | Point to skills/ generally |

---

## Testing Your System Prompt

After writing, verify:

1. **Identity test:** Does the agent know who it is from the first line?
2. **Startup test:** Does the agent know what to read first?
3. **Behavior test:** If the agent only reads the system prompt, would it behave acceptably?
4. **Constraint test:** Are the "never do" rules clear and specific?
5. **Length test:** Is it under 500 words?
6. **Duplication test:** Is anything repeated from SOUL.md?

---

## Updating System Prompts

When to update:
- Agent's role changes significantly
- New critical behavioral rules are needed
- Constraints need to be added (after an incident)
- Model is changed (different models may need different prompting)

When NOT to update:
- Minor personality tweaks (update SOUL.md instead)
- New skill added (agent can discover skills from the directory)
- Workflow changes (update the skill's SKILL.md instead)

Always document system prompt changes in the daily memory file with the reasoning.
