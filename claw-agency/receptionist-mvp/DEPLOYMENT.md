# AI Receptionist MVP - Deployment Details

**Status:** LIVE (as of 2026-02-28)
**Business:** Comfort Zone HVAC
**AI Name:** Sarah
**Voice:** coral (OpenAI)
**Model:** gpt-4o-realtime-preview-2025-06-03

---

## Phone Number

- **Number:** +1 (702) 728-4638
- **Twilio SID:** PN588e165d4cdc0349998a1e8aa5925f3e
- **Account SID:** AC1acbbbd70b5ece292c7ff1a67acb18e5
- **Trial account** - can only call/receive from verified numbers
- **Verified caller:** +1 (513) 850-6496 (Brand)

---

## Tunnel

- **Provider:** Cloudflare Quick Tunnel (cloudflared)
- **Public URL:** https://page-makers-dem-farm.trycloudflare.com
- **Note:** Quick tunnels get a new URL each time cloudflared restarts. You must update the Twilio webhook when the URL changes.

---

## Webhook Configuration

- **Voice URL:** https://page-makers-dem-farm.trycloudflare.com/voice/incoming (POST)
- **Status Callback:** https://page-makers-dem-farm.trycloudflare.com/voice/status (POST)
- **WebSocket (media stream):** wss://page-makers-dem-farm.trycloudflare.com/media-stream (auto-connected by Twilio)

---

## Endpoints

| Path | Method | Purpose |
|------|--------|---------|
| `/health` | GET | Health check - returns JSON with status and uptime |
| `/voice/incoming` | POST | Twilio voice webhook - returns TwiML to start media stream |
| `/voice/status` | POST | Twilio call status callback |
| `/media-stream` | WSS | Bidirectional audio stream (Twilio <-> OpenAI Realtime) |

---

## How to Start

### 1. Start the server

```bash
cd /Users/agentclaw/.openclaw/workspace/claw-agency/receptionist-mvp
node server.js
```

Server runs on port 3000 by default (configurable via PORT in .env).

### 2. Start the tunnel

```bash
cloudflared tunnel --url http://localhost:3000
```

Grab the public URL from the output (looks like `https://something.trycloudflare.com`).

### 3. Update Twilio webhook (if tunnel URL changed)

```bash
curl -s -X POST "https://api.twilio.com/2010-04-01/Accounts/AC1acbbbd70b5ece292c7ff1a67acb18e5/IncomingPhoneNumbers/PN588e165d4cdc0349998a1e8aa5925f3e.json" \
  -u "AC1acbbbd70b5ece292c7ff1a67acb18e5:67a1db113efa1c78d5e32589c6676f23" \
  --data-urlencode "VoiceUrl=https://NEW_URL_HERE/voice/incoming" \
  --data-urlencode "VoiceMethod=POST" \
  --data-urlencode "StatusCallback=https://NEW_URL_HERE/voice/status" \
  --data-urlencode "StatusCallbackMethod=POST"
```

---

## How to Stop

1. Kill the server process (Ctrl+C or kill the PID)
2. Kill the cloudflared tunnel process (Ctrl+C or kill the PID)

---

## How to Test

### Quick health check
```bash
curl http://localhost:3000/health
```

### Simulate incoming call (returns TwiML)
```bash
curl -X POST http://localhost:3000/voice/incoming \
  -d "CallSid=TEST123&From=+15138506496&To=+17027284638"
```

### Actual phone test
Call +1 (702) 728-4638 from Brand's verified number (+1 513-850-6496). The AI receptionist (Sarah) should answer and greet the caller as Comfort Zone HVAC's virtual assistant.

### Check Twilio webhook config
```bash
curl -s "https://api.twilio.com/2010-04-01/Accounts/AC1acbbbd70b5ece292c7ff1a67acb18e5/IncomingPhoneNumbers/PN588e165d4cdc0349998a1e8aa5925f3e.json" \
  -u "AC1acbbbd70b5ece292c7ff1a67acb18e5:67a1db113efa1c78d5e32589c6676f23" | python3 -m json.tool
```

---

## Logs

All logs are written to `./logs/`:
- `leads.jsonl` - captured caller info
- `callbacks.jsonl` - scheduled callbacks
- `emergencies.jsonl` - flagged emergencies
- `call-{CallSid}.json` - full call transcripts
- `daily-{date}.jsonl` - daily call summaries

---

## Important Notes

- **Trial account limitation:** Only verified numbers can call in. Brand's number (+15138506496) is verified.
- **Cloudflare Quick Tunnel URLs are ephemeral.** Every restart of cloudflared generates a new URL. You MUST update the Twilio webhook each time.
- **For production:** Set up a named Cloudflare tunnel or deploy to a server with a static domain.
- **OpenAI Realtime API costs:** Each call uses the realtime API, which bills per minute of audio. Monitor usage.
