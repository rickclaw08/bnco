# How to Set Up Mission-Critical Monitoring for Your OpenClaw Agents

If your agents go down and you don't notice for six hours, you don't have a production system. You have a hobby project. Here's how to build real monitoring.

## Gateway Health Checks

OpenClaw exposes a health endpoint. Use it as your foundation:

```bash
openclaw health
openclaw gateway probe   # full reachability + discovery + health
```

Set up an external monitor to check every 60 seconds. Anything other than clean status = alert.

## Doctor for Deep Diagnostics

```bash
openclaw doctor
openclaw doctor --fix --yes
```

Run this after config changes. A broken config prevents gateway startup entirely, so catching issues early saves downtime.

## Log Monitoring

```bash
openclaw logs
```

Pipe to your log aggregation system and alert on:
- Auth failures (unauthorized connection attempts)
- Channel disconnects (WhatsApp/Telegram/Discord losing connection)
- Model errors (API failures, rate limits, timeouts)
- Sandbox failures (Docker container crashes)
- Config validation errors (hot reload rejections)

## Channel Status Probing

Each channel can fail independently:

```bash
openclaw channels status --probe
```

Run this on a schedule. Alert when any channel drops.

## Token and Cost Tracking

Model costs spike without warning. Monitor:
- Tokens per session (runaway conversations burn budget fast)
- Heartbeat token usage (misconfigured heartbeats waste tokens doing nothing)
- System prompt size (bloated `SOUL.md` inflates every turn)

Set budget alerts with your model provider as a safety net.

## Process Monitoring

The gateway runs as a service. Make sure it:
1. Auto-restarts on crash (default if installed via `openclaw gateway install`)
2. Alerts on repeated restarts (crash loops mean something is fundamentally broken)
3. Logs restart events for correlation

## Your Monitoring Dashboard

At minimum, track:
- Gateway uptime and health
- Channel connection state per provider
- Active session count
- Token usage trends
- Error rate and types
- Last successful heartbeat per agent

## Alert Tiers

- **Critical (page):** Gateway down, all channels disconnected, auth breach
- **Warning (Slack/email):** Single channel down, token spike, sandbox failures
- **Info (daily digest):** Session counts, cost trends, config changes

The difference between reliable and unreliable is almost always monitoring. The agents work great. It's the infrastructure around them that people neglect.

We set up full monitoring stacks as part of every ClawOps deployment. If you'd rather have this done right from day one, visit theclawops.com.
