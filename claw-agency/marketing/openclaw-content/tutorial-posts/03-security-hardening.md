# The Complete Guide to OpenClaw Security Hardening

You're wiring a frontier AI model into real messaging surfaces and real tools. There's no "perfectly secure" setup, but there's a massive difference between deliberate security and hoping nothing goes wrong.

## Start With the Security Audit

OpenClaw ships a built-in audit tool. Run it regularly:

```bash
openclaw security audit
openclaw security audit --deep   # live gateway probe
openclaw security audit --fix    # auto-fix safe defaults
```

This flags exposed gateway auth, overly permissive tools, filesystem permissions, browser control exposure, and policy drift. Run it now before reading further.

## The Hardened Baseline

Start here. Selectively re-enable what you need:

```json5
{
  gateway: {
    mode: "local",
    bind: "loopback",
    auth: { mode: "token", token: "replace-with-long-random-token" },
  },
  session: { dmScope: "per-channel-peer" },
  tools: {
    profile: "messaging",
    deny: ["group:automation", "group:runtime", "group:fs"],
    fs: { workspaceOnly: true },
    exec: { security: "deny", ask: "always" },
    elevated: { enabled: false },
  },
}
```

## Lock Down Inbound Access

Every channel needs an explicit DM policy. Safest default is `"pairing"` (one-time approval before anyone can chat):

```json5
channels: {
  telegram: { dmPolicy: "pairing" },
  discord: {
    dmPolicy: "pairing",
    groups: { "*": { requireMention: true } }
  },
}
```

Never combine open DM policies with broad tool access. That's the fastest path to prompt injection exploits.

## Sandbox Untrusted Sessions

```json5
agents: {
  defaults: {
    sandbox: {
      mode: "non-main",
      scope: "session",
      workspaceAccess: "none",
    }
  }
}
```

- `non-main`: sandboxes everything except your personal session
- `session` scope: each session gets its own container
- `none` workspace access: sandboxed sessions can't read your files

## Credential Hygiene

Know where secrets live: WhatsApp creds in `~/.openclaw/credentials/`, Telegram/Discord tokens in config or env. Use `tokenFile` paths instead of inline tokens. Set `chmod 600` on credential files.

## Multi-Agent Security

Auth profiles are per-agent. Main agent creds are NOT shared automatically. Each agent should have only the credentials it needs. For untrusted multi-party setups, use separate gateways or OS users.

## Stay on Top of It

Run `openclaw security audit` after every config change. Review tool policies when adding skills. Monitor for policy drift when per-agent profiles override global settings.

Security at this level takes experience. At ClawOps, we build and audit hardened OpenClaw deployments for teams that need production-grade security. Details at theclawops.com.
