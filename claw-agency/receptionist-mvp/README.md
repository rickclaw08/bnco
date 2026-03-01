# ClawOps AI Receptionist MVP

AI-powered phone receptionist built on OpenAI's Realtime API and Twilio. Answers calls, qualifies leads, captures caller info, handles emergencies, and logs everything.

## Architecture

```
Caller -> PSTN -> Twilio -> POST /voice/incoming (TwiML)
                         -> WSS /media-stream (bidirectional audio)
                                    |
                          OpenAI Realtime API (gpt-4o-realtime)
                                    |
                          Tool calls: capture_caller_info,
                                      schedule_callback,
                                      flag_emergency
                                    |
                          Logs: /logs/ (transcripts, leads, emergencies)
```

## Quick Start

### 1. Install dependencies

```bash
cd receptionist-mvp
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual keys:
#   OPENAI_API_KEY - your OpenAI API key
#   TWILIO_ACCOUNT_SID - your Twilio account SID
#   TWILIO_AUTH_TOKEN - your Twilio auth token
```

### 3. Start the server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 4. Expose to the internet

For Twilio to reach your local server, use ngrok:

```bash
ngrok http 3000
```

Copy the `https://xxxx.ngrok-free.app` URL.

### 5. Configure Twilio

1. Get a Twilio phone number (Console > Phone Numbers > Buy a Number)
2. Configure the number's voice webhook:
   - **When a call comes in:** `https://your-url.ngrok-free.app/voice/incoming` (HTTP POST)
   - **Status callback URL:** `https://your-url.ngrok-free.app/voice/status` (HTTP POST)
3. Make a test call to your Twilio number

### 6. Run the test suite

With the server running:

```bash
npm run test-call
```

## Configuration

### Business Config

The receptionist adapts to any business by loading a JSON config file. The active config is set via the `BUSINESS_CONFIG_PATH` environment variable in `.env`.

**Included configs:**

| File | Business | AI Name | Voice |
|------|----------|---------|-------|
| `config/default-business.json` | Comfort Zone HVAC | Sarah | coral |
| `config/restaurant-demo.json` | The Grand Table (Irish restaurant) | Emma | shimmer |

**Switching between configs:**

1. Open `.env`
2. Set `BUSINESS_CONFIG_PATH` to the config file you want:
   ```
   BUSINESS_CONFIG_PATH=./config/restaurant-demo.json
   ```
3. Restart the server (`npm start` or `npm run dev`)

That's it. The server picks up the business name, AI personality, greeting, services, FAQs, hours, and voice from whichever config is loaded. If the config includes a `recommendedVoice` field and `OPENAI_VOICE` is not explicitly set, that voice is used automatically.

**Creating your own config:**

Copy `config/default-business.json` or `config/restaurant-demo.json` and edit the fields for your client's business. Point `BUSINESS_CONFIG_PATH` at your new file and restart.

Edit `config/default-business.json` to customize for any business:

- **businessName** - Company name used in greeting
- **aiName** - What the AI receptionist calls itself
- **businessHours** - Per-day open/close times
- **services** - List of services with descriptions and pricing
- **faqs** - Common questions and answers
- **emergencyRules** - Triggers and dispatch number
- **personality** - Tone and style instructions
- **greeting** - Opening line for every call

### Voice Options

Set `OPENAI_VOICE` in `.env`. Available voices:
- `coral` (default) - Warm, natural female
- `alloy` - Neutral
- `echo` - Male
- `fable` - Expressive
- `onyx` - Deep male
- `nova` - Bright female
- `shimmer` - Gentle female

### Realtime Model

Set `OPENAI_REALTIME_MODEL` in `.env`:
- `gpt-4o-realtime-preview-2025-06-03` (default)

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check - returns server status and business name |
| POST | `/voice/incoming` | Twilio voice webhook - returns TwiML to start media stream |
| POST | `/voice/status` | Twilio status callback - logs call status changes |
| WSS | `/media-stream` | Bidirectional audio stream between Twilio and OpenAI |

## Logs

All logs are written to the `/logs` directory:

- `call-{callSid}.json` - Full transcript for each call
- `leads.jsonl` - All captured leads (one JSON object per line)
- `callbacks.jsonl` - Scheduled callback requests
- `emergencies.jsonl` - Emergency flags
- `daily-{date}.jsonl` - Daily call summary

## Tool Functions

The AI receptionist can invoke these tools during calls:

1. **capture_caller_info** - Saves caller name, phone, address, service needed, urgency
2. **schedule_callback** - Logs a callback request with preferred time
3. **flag_emergency** - Flags the call as emergency and (in production) alerts dispatch

## Production Deployment

For production, you'll want to:

1. Deploy to a server with a stable public URL (Fly.io, Railway, AWS, etc.)
2. Use a real `.env` file with production keys
3. Set up proper logging (structured JSON to a log aggregator)
4. Add Twilio signature validation for webhook security
5. Connect tool functions to a real CRM (GoHighLevel, HubSpot, etc.)
6. Add SMS/email notifications on lead capture and emergencies
7. Set up monitoring and alerting

## Cost Estimate (per call)

| Component | Cost |
|-----------|------|
| Twilio inbound | ~$0.0085/min |
| OpenAI Realtime | ~$0.06/min |
| Total | ~$0.07/min (~$0.21 for a 3-min call) |

At 200 calls/month averaging 3 minutes: ~$42/month in API costs.

## File Structure

```
receptionist-mvp/
  server.js                    # Main server
  test-call.js                 # Test script
  package.json                 # Dependencies
  .env.example                 # Env template
  README.md                    # This file
  config/
    default-business.json      # HVAC business configuration (default)
    restaurant-demo.json       # Restaurant business configuration (demo)
  logs/                        # Call logs (gitignored)
```
