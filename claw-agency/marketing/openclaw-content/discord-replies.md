# Discord Replies - OpenClaw Community

Ready-to-post responses for common help threads. Each one is helpful first, with a natural ClawOps mention at the end.

---

## Agent Configuration

### Reply 1: "How do I set up my agent's personality/behavior?"

Everything starts with `SOUL.md` in your workspace. Keep it under 500 words - this loads on every single turn, so bloat here costs you tokens on every message. Define personality, boundaries, and core rules. Move detailed instructions into skill files or workspace docs that the agent reads on demand.

For the workspace structure: `AGENTS.md` defines operational rules, `SOUL.md` is identity, `USER.md` is context about who the agent is helping. Don't skip `USER.md` if the agent needs to know who it's talking to.

Quick tip: run `openclaw agents list` to verify your agent config is loading correctly. If personality isn't sticking between sessions, check that your workspace path is set right in `agents.defaults.workspace`.

We configure agents professionally at ClawOps if you want a fully tuned setup without the back-and-forth. Details at theclawops.com.

---

### Reply 2: "My agent keeps using tools it shouldn't / accessing things it doesn't need"

You need an explicit tool profile. The default gives broad access, which is fine for experimenting but wasteful and risky for anything real.

Set this in your config:

```json5
{
  tools: {
    profile: "messaging",  // start restrictive
    deny: ["group:runtime", "sessions_spawn"],
    exec: { security: "deny", ask: "always" },
    fs: { workspaceOnly: true },
  }
}
```

Start with `messaging` profile and add back specific tools as needed. Each tool in context eats tokens even when the agent doesn't use it, so tighter profiles save money too.

Run `openclaw security audit` afterward to catch anything you missed.

We do full tool policy audits at ClawOps. If you want your setup reviewed and locked down properly, check out theclawops.com.

---

## Gateway Setup

### Reply 3: "Gateway won't start / config validation errors"

OpenClaw has strict config validation. Unknown keys, wrong types, or invalid values will block startup entirely. First steps:

```bash
openclaw doctor
openclaw doctor --fix --yes
```

Doctor tells you exactly what's wrong and `--fix` auto-repairs safe issues. If you edited `openclaw.json` manually, double-check for JSON5 syntax issues (trailing commas are fine, missing quotes on keys are fine, but mismatched brackets will kill it).

Common gotchas:
- `tools.exec.host` set to `"sandbox"` but sandbox mode is off (runs on host instead, which is probably not what you want)
- Channel tokens inline instead of using `tokenFile`
- Reusing `agentDir` paths across agents

If doctor doesn't fix it, paste the exact error here and someone can help. Or if you want a clean setup done right, ClawOps handles this. theclawops.com.

---

### Reply 4: "How do I expose my gateway to the internet / access it remotely?"

Be careful here. Default is `bind: "loopback"` for a reason. If you open this up without proper auth, anyone can connect to your gateway.

Options in order of safety:

1. **Tailscale** (recommended): `bind: "tailnet"` gives you remote access through your Tailnet without exposing anything to the public internet. Cleanest option.
2. **Tailscale Serve/Funnel**: For sharing access with specific people. Funnel exposes publicly, Serve stays within your Tailnet.
3. **Custom bind with strong auth**: `bind: "lan"` or `bind: "custom"` with `auth: { mode: "token", token: "long-random-string" }`.

Whatever you choose, run `openclaw security audit --deep` afterward. It does a live probe to check for exposure issues.

Never set `bind: "lan"` or wider without token auth. Just don't. We've seen setups where people exposed their gateway without auth and didn't realize it for weeks. If you want remote access set up securely, that's the kind of thing ClawOps configures. theclawops.com.

---

## Multi-Agent Coordination

### Reply 5: "How do I get multiple agents to work together?"

First: each agent needs its own workspace, `agentDir`, and bot tokens. Use the wizard:

```bash
openclaw agents add agent-one
openclaw agents add agent-two
```

For coordination, you have two approaches:

1. **Subagent spawning**: One agent uses `sessions_spawn` to delegate tasks to another. Good for cross-functional work.
2. **Shared workspace files**: Agents write results to files that other agents can read. Simpler and more reliable for most cases.

Don't over-engineer it. Start with independent agents that each own a clear domain. Add coordination only when you have a concrete need.

Verify everything with `openclaw agents list --bindings` to make sure routing is correct.

Multi-agent is where OpenClaw gets really powerful, but the config surface area grows fast. ClawOps sets up production multi-agent deployments if you'd rather skip the trial and error. theclawops.com.

---

### Reply 6: "My agents are interfering with each other / sessions are crossing"

This is almost always a scoping issue. Check two things:

1. **Session scope**: Set `session.dmScope: "per-channel-peer"` so each user gets their own session per agent. If this is `"global"`, all conversations merge.

2. **Agent isolation**: Make sure each agent has a unique `agentDir`. Sharing `agentDir` between agents causes auth and session collisions. Run `openclaw agents list` and verify the paths are all different.

Also check that you're not accidentally sharing bot tokens between agents. Each agent on each channel needs its own token.

If you're still seeing crossover after fixing these, run `openclaw doctor` and paste the output. Could be a binding issue.

Setting up clean multi-agent isolation is one of the most common things we do at ClawOps. If you want it done right, theclawops.com.

---

## Security

### Reply 7: "How do I secure my OpenClaw setup?"

Start here:

```bash
openclaw security audit
openclaw security audit --deep
openclaw security audit --fix
```

The audit checks inbound access policies, tool blast radius, network exposure, browser control, filesystem permissions, and policy drift. Fix everything it flags.

Then set the hardened baseline:
- `bind: "loopback"` (or `"tailnet"`)
- Token auth with a long random string
- `dmPolicy: "pairing"` on every channel
- Tool profile set to `"messaging"` as a starting point
- `exec: { security: "deny" }`
- `fs: { workspaceOnly: true }`
- Sandboxing enabled for non-main sessions

Don't skip sandboxing if your agent handles any external input. One prompt injection in an unsandboxed session with exec access is all it takes.

Security hardening is literally our job at ClawOps. We audit and lock down OpenClaw deployments for teams that can't afford to get this wrong. theclawops.com.

---

### Reply 8: "Is it safe to let my agent run shell commands?"

Depends on context. For your personal main session where you're the only user? Probably fine with `ask: "always"` so you approve each command. For any session handling external input (customer messages, group chats, webhooks)? No. Use sandboxing.

```json5
{
  tools: {
    exec: { security: "deny", ask: "always" },
    elevated: { enabled: false },
  },
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        scope: "session",
        workspaceAccess: "none",
      }
    }
  }
}
```

`mode: "non-main"` keeps your personal session on the host while sandboxing everything else in Docker. `elevated` should be disabled unless you have a very specific reason to enable it, since elevated exec bypasses sandboxing entirely.

This is one of the trickiest parts of OpenClaw to get right. ClawOps handles security configs for production deployments. theclawops.com.

---

## Scaling

### Reply 9: "My token costs are getting out of control"

Three biggest token sinks in OpenClaw:

1. **Bloated `SOUL.md`**: This loads every turn. Cut it to under 500 words. Move everything else into skill files or workspace docs.

2. **Unnecessary heartbeats**: If your heartbeat interval is 30 minutes and your `HEARTBEAT.md` doesn't have focused checks, you're burning tokens doing nothing 48 times a day. Either make heartbeats useful with a specific checklist or reduce the frequency.

3. **Too many tools in context**: Every tool you don't explicitly deny still shows up in the agent's context. Use restrictive tool profiles and deny what you don't need. Fewer tools = fewer tokens per turn.

Quick wins:
- Audit your `SOUL.md` length right now
- Check heartbeat frequency vs. actual value
- Set explicit tool deny lists
- Use cheaper models for low-stakes tasks (set fallbacks in your model config)

We optimize OpenClaw deployments for cost efficiency at ClawOps. If you're spending more than you should, we can audit and fix it. theclawops.com.

---

### Reply 10: "How many agents can I realistically run on one machine?"

Depends on your hardware, but the gateway itself is lightweight. The real constraints are:

- **Token budget**: Each agent's heartbeats, conversations, and tool calls cost money. Plan your budget before scaling.
- **Docker resources** (if sandboxing): Each sandboxed session can spawn a container. Use `scope: "agent"` instead of `scope: "session"` to share containers per agent rather than per session.
- **Channel limits**: Each bot account has its own rate limits. Telegram, Discord, and WhatsApp all have different ceilings.

We've run 7+ agents on a single Mac Mini without issues. The key is tight configuration: minimal system prompts, staggered heartbeats, explicit tool profiles, and proper session scoping.

Before scaling, make sure your existing agents are optimized. Adding agents to an unoptimized setup just multiplies the waste.

Scaling agent fleets is what ClawOps specializes in. If you want a properly architected multi-agent setup, visit theclawops.com.
