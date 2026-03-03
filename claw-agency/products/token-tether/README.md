# TokenTether v1.0.0

## Hard-Stop Billing Controller for OpenClaw

**You just bought peace of mind.** TokenTether is a transparent WebSocket proxy that sits between your clients and the OpenClaw gateway, monitoring every API call, tracking token costs in real time, and enforcing hard spending limits before you blow your budget.

No more waking up to a surprise $500 API bill because an agent went into an infinite loop at 3 AM.

---

## Architecture

```
                         TokenTether
                    (Proxy + Monitor)
                    +-----------------+
                    |                 |
  Clients -------->| :18788 (proxy)  |--------> OpenClaw Gateway :18789
  (OpenClaw CLI,   |                 |          (your existing setup)
   Telegram bot,   | Tracks tokens   |
   browser, etc.)  | Enforces limits |
                    | Sends alerts    |
                    |                 |
                    | :18790 (dash)   |--------> Your Browser (dashboard)
                    +-----------------+
                           |
                    +------+------+
                    |      |      |
                 Webhook  Email  File
                 alerts  alerts  alerts
```

**How it works:**

1. Clients connect to TokenTether (port 18788) instead of directly to the OpenClaw gateway (18789)
2. TokenTether forwards all traffic transparently - zero changes to functionality
3. API responses flowing back through the proxy are inspected for token usage data
4. Costs are calculated using a built-in model pricing table (all major models included)
5. When spending crosses your warning threshold, alerts fire
6. When spending hits your hard limit, new sessions are blocked and active sessions can be killed

**If TokenTether crashes, OpenClaw keeps running.** It is a safety layer, not a dependency. Your setup works with or without it.

---

## Quickstart (Under 5 Minutes)

### Option A: Run directly with Node.js

```bash
# 1. Unzip to wherever you want
unzip token-tether-v1.0.0.zip
cd token-tether

# 2. Run the interactive setup
chmod +x install.sh
./install.sh

# That's it. The setup script handles everything:
#   - Checks Node.js 18+ is installed
#   - Installs dependencies
#   - Walks you through configuration
#   - Starts TokenTether
#   - Validates the connection
```

### Option B: Run with Docker

```bash
# 1. Unzip and enter the directory
unzip token-tether-v1.0.0.zip
cd token-tether

# 2. Copy and edit the config
cp .env.example .env
nano .env  # Set your limits

# 3. Launch
docker compose up -d

# 4. Check it's running
curl http://localhost:18788/health
```

### After Setup

1. **Point your clients to port 18788** instead of connecting directly to the OpenClaw gateway on 18789
2. **Open the dashboard** at http://localhost:18790 to see spending in real time
3. **Set up alerts** (webhook and/or email) for production use

---

## Configuration Reference

All configuration is done through environment variables (in the `.env` file).

### Network

| Variable | Default | Description |
|----------|---------|-------------|
| `TT_PROXY_PORT` | `18788` | Port TokenTether listens on. Clients connect here. |
| `TT_GATEWAY_HOST` | `127.0.0.1` | OpenClaw gateway hostname. |
| `TT_GATEWAY_PORT` | `18789` | OpenClaw gateway port. |

### Spending Limits

| Variable | Default | Description |
|----------|---------|-------------|
| `TT_HARD_LIMIT_USD` | `50.00` | Maximum spend before blocking new sessions. |
| `TT_SESSION_LIMIT_USD` | `10.00` | Maximum spend per individual session. |
| `TT_MODEL_LIMIT_USD` | `0` (disabled) | Maximum spend per model. |
| `TT_WARN_THRESHOLD_PCT` | `0.80` | Alert at this percentage of the hard limit. |

### Reset

| Variable | Default | Description |
|----------|---------|-------------|
| `TT_RESET_INTERVAL` | `24h` | Auto-reset counters: `1h`, `24h`, `7d`, `30d`, or `never`. |

### Alerts

| Variable | Default | Description |
|----------|---------|-------------|
| `TT_WEBHOOK_URL` | (empty) | Slack, Discord, or generic webhook URL. |
| `TT_SMTP_HOST` | (empty) | SMTP server for email alerts. |
| `TT_SMTP_PORT` | `587` | SMTP port. |
| `TT_SMTP_USER` | (empty) | SMTP username. |
| `TT_SMTP_PASS` | (empty) | SMTP password. |
| `TT_ALERT_EMAIL` | (empty) | Email to send alerts to. |
| `TT_ALERT_DIR` | (empty) | Directory for file-based alert JSON. |

### Dashboard

| Variable | Default | Description |
|----------|---------|-------------|
| `TT_DASHBOARD_ENABLED` | `true` | Enable the web dashboard. |
| `TT_DASHBOARD_PORT` | `18790` | Dashboard port. |

### Behavior

| Variable | Default | Description |
|----------|---------|-------------|
| `TT_LIMIT_ACTION` | `block` | What to do at limit: `block` or `warn`. |
| `TT_LOG_LEVEL` | `info` | Logging: `debug`, `info`, `warn`, `error`. |
| `TT_PASSTHROUGH` | `false` | Monitor only, never block (for testing). |
| `TT_STATE_FILE` | `./data/usage-state.json` | Path to persist state. |

### Model Pricing

TokenTether ships with pricing for all major models (OpenAI, Anthropic, Google, DeepSeek). To add custom models:

```bash
MODEL_PRICING_JSON='{"my-custom-model": {"input": 0.01, "output": 0.03}}'
```

---

## API Endpoints

TokenTether exposes HTTP endpoints on the proxy port for health checks and monitoring:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check with basic stats. |
| `/stats` | GET | Full usage snapshot (JSON). |

The dashboard (port 18790) has additional API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/snapshot` | GET | Full usage data for the dashboard. |
| `/api/reset` | POST | Reset all counters. |
| `/api/health` | GET | Dashboard health check. |

---

## Supported Models

TokenTether includes built-in pricing for:

**OpenAI:** gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, gpt-3.5-turbo, o1, o1-mini, o1-pro, o3-mini

**Anthropic:** claude-opus-4, claude-sonnet-4, claude-3-opus, claude-3.5-sonnet, claude-3.5-haiku, claude-3-haiku

**Google:** gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash

**DeepSeek:** deepseek-chat, deepseek-reasoner

Unknown models use a conservative default pricing ($0.005/$0.015 per 1K tokens). You can override any model's pricing using the `MODEL_PRICING_JSON` environment variable.

---

## Troubleshooting

### "Port 18788 is already in use"

Another process is using that port. Either stop it or change `TT_PROXY_PORT` in your `.env` file.

```bash
# Find what's using the port
lsof -i :18788
# Or change the port
echo "TT_PROXY_PORT=18786" >> .env
```

### "Gateway connection failed"

TokenTether cannot reach the OpenClaw gateway. Verify:

1. OpenClaw gateway is running: `curl http://localhost:18789`
2. The host/port in your `.env` matches your gateway config
3. If using Docker, ensure `host.docker.internal` resolves (Linux may need `extra_hosts` in docker-compose)

### "State file permission denied"

The `data/` directory needs to be writable. Create it manually:

```bash
mkdir -p data
chmod 755 data
```

### TokenTether stops tracking after restart

Check that `TT_STATE_FILE` points to a persistent location. The default (`./data/usage-state.json`) works if the `data/` directory persists. In Docker, make sure the volume is mounted.

### Clients cannot connect through the proxy

1. Verify TokenTether is running: `curl http://localhost:18788/health`
2. Make sure your clients are connecting to the proxy port (18788), not the gateway port (18789) directly
3. Check firewall rules if running on a remote server

### Alert emails not sending

Verify all four SMTP variables are set: `TT_SMTP_HOST`, `TT_SMTP_PORT`, `TT_SMTP_USER`, `TT_SMTP_PASS`, and that `TT_ALERT_EMAIL` has a valid recipient address.

### Dashboard shows $0.00 but agents are running

This likely means your clients are connecting to the gateway directly (port 18789) instead of through TokenTether (port 18788). Update your client configuration to point to the proxy port.

---

## File Structure

```
token-tether/
  src/
    index.js        Main entry point
    config.js       Configuration loader and validator
    proxy.js        WebSocket proxy server (the core engine)
    tracker.js      Usage tracking and limit enforcement
    alerts.js       Alert manager (webhook, email, file)
    dashboard.js    Dashboard web server and UI
    logger.js       Structured logging
  data/             Persisted state (auto-created)
  .env.example      Configuration template
  .env              Your configuration (created during setup)
  docker-compose.yml  Docker deployment config
  Dockerfile        Container build config
  install.sh        Interactive setup script
  package.json      Node.js dependencies
  LICENSE.md        License terms
  README.md         This file
```

---

## Support

- Email: support@theclawops.com
- Documentation: https://theclawops.com/products/token-tether
- Issues: Include your TokenTether version, Node.js version, and relevant logs.

---

Built by [ClawOps](https://theclawops.com) - Protecting your AI infrastructure so you can focus on building.
