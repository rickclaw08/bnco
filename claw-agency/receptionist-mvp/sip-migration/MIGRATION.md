# SIP Connector Migration Guide

## Overview

This guide migrates the ClawOps AI Receptionist from **Twilio Media Streams proxy** to **OpenAI SIP Connector** architecture.

### What Changes

| Aspect | Before (Media Streams) | After (SIP Connector) |
|--------|----------------------|----------------------|
| Audio path | Twilio -> Our Server -> OpenAI | Twilio -> OpenAI (direct) |
| Server role | Audio proxy + logic | Webhook handler + monitoring |
| Latency | Higher (extra hop) | Lower (direct SIP) |
| Bandwidth | High (all audio through us) | Minimal (JSON webhooks only) |
| Server memory | 1GB (audio buffering) | 512MB (no audio) |
| Complexity | WebSocket proxy + TwiML | Simple POST webhook |
| Model | gpt-4o-realtime-preview | gpt-realtime (GA) |
| VAD | server_vad | semantic_vad (understands intent) |

### What Stays the Same
- Tenant config files (config/tenants/*.json)
- Tenant manager (lib/tenant-manager.js)
- Tool definitions (capture_caller_info, schedule_callback, flag_emergency)
- Log format and output
- Twilio phone numbers

---

## Prerequisites

1. **OpenAI API key** with Realtime API access
2. **OpenAI Project ID** (find in OpenAI Dashboard -> Settings -> General)
3. **Twilio account** with at least one phone number with Voice capability
4. **Fly.io account** (or any server with a public HTTPS endpoint)

---

## Step 1: Get Your OpenAI Project ID

1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to **Settings** -> **General**
3. Copy your **Project ID** (looks like `proj_xxxxxxxxxxxx`)
4. Save it - you'll need it for the Twilio SIP Trunk configuration

---

## Step 2: Configure the OpenAI Webhook

The webhook tells OpenAI where to send `realtime.call.incoming` events when someone calls.

1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to **Settings** -> **Webhooks**
3. Click **Create webhook**
4. Set the URL to your server's webhook endpoint:
   ```
   https://clawops-receptionist.fly.dev/webhook
   ```
   (Replace with your actual domain)
5. Subscribe to the event: `realtime.call.incoming`
6. Copy the **Webhook Secret** (starts with `whsec_`) - you'll need this for the server

---

## Step 3: Create a Twilio SIP Trunk

This routes phone calls from your Twilio number through to OpenAI's SIP endpoint.

### 3a. Create the SIP Trunk

1. Log into [Twilio Console](https://console.twilio.com/)
2. Go to **Elastic SIP Trunking** -> **Trunks**
3. Click **Create new SIP Trunk**
4. Name it: `ClawOps OpenAI SIP`
5. Click **Create**

### 3b. Set the Origination URI

1. In the trunk settings, go to the **Origination** tab
2. Click **Add new Origination URI**
3. Set the URI to:
   ```
   sip:YOUR_PROJECT_ID@sip.api.openai.com;transport=tls
   ```
   Replace `YOUR_PROJECT_ID` with the OpenAI Project ID from Step 1.
4. Priority: 10, Weight: 10
5. Click **Add**

### 3c. Connect Your Phone Number

1. Go to **Phone Numbers** -> **Manage** -> **Active Numbers**
2. Click on the phone number you want to use
3. Under **Voice Configuration**:
   - Set **Configure with**: `SIP Trunk`
   - Set **SIP Trunk**: Select `ClawOps OpenAI SIP`
4. Click **Save configuration**

Repeat for each phone number that should route to the AI receptionist.

---

## Step 4: Deploy the Server

### Option A: Fly.io Deployment

```bash
cd receptionist-mvp

# Set secrets on Fly.io
fly secrets set OPENAI_API_KEY=sk-your-key
fly secrets set OPENAI_WEBHOOK_SECRET=whsec_your-secret

# Deploy using the SIP Dockerfile
fly deploy --config sip-migration/fly.toml --dockerfile sip-migration/Dockerfile.sip
```

### Option B: Local Development

```bash
cd receptionist-mvp/sip-migration

# Copy and fill in env vars
cp .env.example .env
# Edit .env with your actual values

# Run the server
node server-sip.js

# Expose via ngrok for webhook testing
ngrok http 8080
# Update the OpenAI webhook URL with the ngrok URL
```

---

## Step 5: Map Phone Numbers to Tenants

The server maps incoming calls to tenant configs using the `phone` field in each tenant's JSON config:

```
config/tenants/tenant-green-table.json  ->  phone: "+353 1 555 0123"
config/tenants/tenant-default.json      ->  fallback for unmatched numbers
```

When a call comes in to `+353 1 555 0123`, the server:
1. Receives the webhook from OpenAI with `to: +35315550123`
2. Looks up that number in the phone->tenant map
3. Loads the Green Table config
4. Accepts the call with Sophie's instructions, personality, and tools

To add a new tenant:
1. Create `config/tenants/tenant-your-client.json` with the correct `phone` field
2. Buy a Twilio number and connect it to the SIP Trunk (Step 3c)
3. The server hot-reloads tenant configs automatically

---

## Step 6: Verify Everything Works

### Health check
```bash
curl https://clawops-receptionist.fly.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "architecture": "sip-connector",
  "activeCalls": 0,
  "tenants": ["default", "green-table"],
  "uptime": 123.45
}
```

### Test call
1. Call your Twilio phone number from any phone
2. The call should route: Phone -> Twilio -> SIP Trunk -> OpenAI -> Webhook fires -> Server accepts
3. Check server logs for webhook receipt and call acceptance
4. Check `/calls` endpoint for active call monitoring

### Monitor active calls
```bash
curl https://clawops-receptionist.fly.dev/calls
```

---

## Rollback Plan

The old Media Streams code is untouched. To roll back:

1. Switch the Twilio phone number back from SIP Trunk to the original webhook:
   - Voice Configuration -> Configure with: `Webhook`
   - URL: `https://clawops-receptionist.fly.dev/voice/incoming`
2. Redeploy with the original Dockerfile and fly.toml:
   ```bash
   fly deploy --dockerfile Dockerfile --config fly.toml
   ```

---

## Architecture Diagram

```
BEFORE (Media Streams):
  Caller -> Twilio -> TwiML WebSocket -> [Our Server] -> OpenAI Realtime WS
                                         (audio proxy)

AFTER (SIP Connector):
  Caller -> Twilio -> SIP Trunk -> OpenAI SIP Endpoint
                                         |
                                    (webhook fires)
                                         |
                                    [Our Server]
                                    - Accept/reject call
                                    - Monitoring WebSocket
                                    - Tool execution
                                    - Logging & analytics
```

---

## New Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key with Realtime access |
| `OPENAI_WEBHOOK_SECRET` | Recommended | Webhook signing secret from OpenAI dashboard |
| `OPENAI_REALTIME_MODEL` | No | Model to use (default: `gpt-realtime`) |
| `OPENAI_VOICE` | No | Default voice (default: `coral`) |
| `PORT` | No | Server port (default: `8080`) |

**Removed variables** (no longer needed):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

---

## Cost Impact

### Server costs (Fly.io)
- **Before:** 1GB shared VM + bandwidth for all audio traffic
- **After:** 512MB shared VM + minimal webhook/JSON traffic
- **Savings:** ~50% on compute, significant on bandwidth

### OpenAI costs
- **Model upgrade:** `gpt-realtime` (GA) may have different pricing than preview models
- **New feature:** Truncation with `retention_ratio: 0.8` reduces token costs on longer calls
- **Semantic VAD:** Better turn detection means fewer unnecessary AI responses

### Twilio costs
- SIP Trunking may have different per-minute rates vs standard Voice
- Check current Twilio Elastic SIP Trunking pricing for your region

---

## Troubleshooting

### Webhook not receiving events
1. Verify the webhook URL in OpenAI Dashboard is correct and reachable
2. Check that the server is running and `/health` returns OK
3. Ensure you subscribed to `realtime.call.incoming` event type
4. Check Fly.io logs: `fly logs`

### Call not connecting
1. Verify the SIP Trunk Origination URI has the correct Project ID
2. Check that `transport=tls` is included in the URI
3. Verify the phone number is connected to the SIP Trunk (not a webhook)
4. Check OpenAI Dashboard for any API errors

### Signature verification failing
1. Ensure `OPENAI_WEBHOOK_SECRET` matches the secret from the OpenAI Dashboard
2. For local dev, you can set `OPENAI_WEBHOOK_SECRET=` (empty) to skip verification
3. Check that the raw request body is being passed correctly (not parsed as JSON before verification)

### Tool calls not executing
1. The monitoring WebSocket must be connected for tool execution
2. Check that the WebSocket connects successfully after accepting the call
3. Verify tool definitions in `buildTools()` match expected schema

---

## Files in This Directory

```
sip-migration/
  server-sip.js      - The new webhook handler server
  fly.toml            - Fly.io config for SIP architecture
  Dockerfile.sip      - Docker build file (references parent dir files)
  .env.example        - Environment variable template
  MIGRATION.md        - This file
```
