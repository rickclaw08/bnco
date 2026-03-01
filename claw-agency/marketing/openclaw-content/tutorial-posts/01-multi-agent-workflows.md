# How to Properly Configure Multi-Agent Workflows in OpenClaw

Running one agent is straightforward. Running five that don't step on each other? That's where most people get stuck. Here's how to set up multi-agent workflows in OpenClaw the right way.

## Understand What "One Agent" Actually Means

Every agent in OpenClaw is fully isolated: its own workspace, its own state directory (`agentDir`), its own session store, and its own auth profiles. This isolation is intentional. If you're trying to share workspaces or reuse `agentDir` paths across agents, stop. That causes auth and session collisions that will waste hours of your time.

## Use the Agent Wizard

Don't manually create directory structures. Use the built-in wizard:

```bash
openclaw agents add operations
openclaw agents add research
openclaw agents add customer-support
```

Each command scaffolds a workspace with `SOUL.md`, `AGENTS.md`, and a dedicated `agentDir` under `~/.openclaw/agents/<agentId>`. Verify everything with:

```bash
openclaw agents list --bindings
```

## Set Up Bindings Correctly

Bindings are how OpenClaw routes inbound messages to the right agent. If you're running a customer support agent on Telegram and a research agent on Discord, each needs its own channel account and explicit binding. One bot token per agent. No sharing.

For multi-account channels like WhatsApp, use `openclaw channels login --channel whatsapp --account <name>` for each agent's phone number, then bind accordingly.

## Share Skills Wisely

Skills in `<workspace>/skills` are per-agent. Skills in `~/.openclaw/skills` are shared across all agents on the machine. Use shared skills for common utilities (web search, file operations) and per-agent skills for specialized tools. Workspace skills override shared ones if there's a name conflict, so you can customize behavior per agent without touching the shared set.

## Give Each Agent a Clear Identity

This is where most multi-agent setups go from "working" to "powerful." Each agent's `SOUL.md` should define a distinct personality, scope, and set of responsibilities. A research agent that tries to do customer support (or vice versa) creates confusion and burns tokens on irrelevant context.

Set clear boundaries:
- What this agent does (and doesn't do)
- What tools it has access to
- What channels it operates on
- How it escalates issues it can't handle

## Monitor and Verify

After setup, restart the gateway and probe:

```bash
openclaw gateway restart
openclaw agents list --bindings
openclaw channels status --probe
```

Check that each agent responds only on its assigned channels and that sessions are properly scoped.

## Common Pitfalls

- Sharing `agentDir` between agents (causes auth collisions)
- Forgetting to create separate bot tokens per agent
- Using `session.dmScope: "global"` with multiple agents (cross-contamination risk)
- Not setting `SOUL.md` boundaries, leading to scope creep and wasted tokens

Multi-agent setups are where OpenClaw really shines, but the configuration surface area is real. If you want a full multi-agent deployment configured, tested, and production-ready without the trial and error, that's exactly what we do at ClawOps. Check out theclawops.com for details.
