# 5 Common OpenClaw Mistakes That Are Costing You Tokens and Time

After setting up dozens of OpenClaw deployments, these are the patterns we see burning through budgets. Every single one is avoidable.

## 1. Running Without a Tool Profile

The default tool configuration gives your agent access to everything. That sounds great until your agent starts making exec calls or spawning processes it has no business touching. Beyond the security risk, every unnecessary tool in context eats tokens.

**Fix it:** Set an explicit tool profile. Start restrictive and open up from there:

```json5
{
  tools: {
    profile: "messaging",
    exec: { security: "deny", ask: "always" },
  }
}
```

## 2. Ignoring Session Scope

If `session.dmScope` is `"global"` and multiple people DM your bot, everyone shares the same conversation history. Person A's messages bleed into Person B's context. Privacy problem and token problem in one.

**Fix it:** Set `session.dmScope: "per-channel-peer"`. Each person gets their own isolated session.

## 3. No Heartbeat Strategy

Your agent wakes up every 30 minutes, reads the heartbeat prompt, finds nothing to do, replies `HEARTBEAT_OK`, and burns tokens for zero value.

**Fix it:** Create a focused `HEARTBEAT.md` with a short checklist of specific, actionable items. Track state in `memory/heartbeat-state.json` to avoid redundant checks. If you don't need heartbeats, turn them off entirely.

## 4. Bloated SOUL.md

`SOUL.md` loads on every single turn. If it's 3,000 words, you're burning hundreds of tokens per message just on identity context. Multiply that across a day of active conversations and it adds up fast.

**Fix it:** Keep `SOUL.md` under 500 words. Move detailed instructions into skill files that only load when relevant. Move reference material into workspace files the agent reads on demand.

## 5. Not Using Sandboxing When You Should

Handling external input (customer messages, group chats, webhooks) without sandboxing means you're one prompt injection away from someone running commands on your machine.

**Fix it:** Enable Docker sandboxing for untrusted sessions:

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        scope: "session",
        workspaceAccess: "ro"
      }
    }
  }
}
```

`mode: "non-main"` keeps your personal session on the host while sandboxing everything else.

## The Compound Effect

Stack these mistakes and you get an agent that's expensive, leaks context between users, wastes heartbeat cycles, carries dead weight in every prompt, and runs unsandboxed against untrusted input. That's not an AI assistant. That's a liability.

These are the exact problems we audit and fix at ClawOps. If you want a professional review with concrete recommendations, visit theclawops.com.
