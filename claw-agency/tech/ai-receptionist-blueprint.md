# ClawOps AI Receptionist — Technical Blueprint

**Version:** 1.0  
**Date:** 2026-02-28  
**Status:** Architecture Draft — Ready for Engineering Review  
**Author:** Circuit (Solutions Architect)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Integration Map](#3-integration-map)
4. [White-Label Architecture](#4-white-label-architecture)
5. [Deployment Specs](#5-deployment-specs)
6. [Competitive Analysis](#6-competitive-analysis)
7. [Security & Compliance](#7-security--compliance)
8. [Cost Model](#8-cost-model)
9. [Roadmap](#9-roadmap)

---

## 1. Executive Summary

ClawOps AI Receptionist is a white-label AI-powered phone answering system targeting small businesses in home services (HVAC, plumbing, electrical, roofing). It answers inbound calls 24/7 using conversational AI, qualifies leads, books appointments, updates the business CRM, and notifies the business owner—all without human intervention.

**Target Customer:** Marketing agencies serving home services businesses who want to resell AI receptionist as a managed service.

**Revenue Model:** Per-seat SaaS sold through agency partners (white-labeled) or direct to SMBs.

**Core Value Proposition vs. Competitors:**
- 80-95% cheaper than human receptionist services (Smith.ai, Ruby)
- More configurable than turnkey AI competitors (Goodcall, Dialzara)
- White-label native — built for agency resale from day one
- Home-services domain expertise baked into prompts and workflows

---

## 2. System Architecture

### 2.1 High-Level Call Flow

```
┌─────────────┐     ┌──────────────┐     ┌────────────────────────┐
│  Caller      │────▶│  PSTN / SIP  │────▶│  Twilio Programmable   │
│  (Customer)  │     │  Network     │     │  Voice                 │
└─────────────┘     └──────────────┘     └───────────┬────────────┘
                                                      │
                                          TwiML webhook / Media Stream
                                                      │
                                                      ▼
                                         ┌────────────────────────┐
                                         │  ClawOps Call Router    │
                                         │  (Node.js / FastAPI)    │
                                         │                        │
                                         │  • Tenant lookup        │
                                         │  • Business hours check │
                                         │  • Call recording init  │
                                         └───────────┬────────────┘
                                                      │
                                        Bidirectional WebSocket
                                        (Twilio Media Streams)
                                                      │
                                                      ▼
                                         ┌────────────────────────┐
                                         │  Conversation Engine    │
                                         │                        │
                                         │  Option A: OpenAI      │
                                         │  Realtime API (SIP)    │
                                         │                        │
                                         │  Option B: STT → LLM → │
                                         │  TTS pipeline           │
                                         └───────────┬────────────┘
                                                      │
                                          Tool calls / function results
                                                      │
                                                      ▼
                                         ┌────────────────────────┐
                                         │  Action Layer           │
                                         │                        │
                                         │  • CRM write           │
                                         │  • Calendar booking    │
                                         │  • SMS/email notify    │
                                         │  • Call transfer       │
                                         │  • Escalation logic    │
                                         └────────────────────────┘
```

### 2.2 Two Architecture Options

We support **two runtime architectures** depending on latency/cost tradeoffs:

#### Option A: OpenAI Realtime API via SIP (Recommended for v1)

This is the fastest path to production with the best voice quality.

```
Twilio SIP Trunk  ──▶  OpenAI SIP endpoint (sip:$PROJECT_ID@sip.api.openai.com)
                           │
                    Webhook: realtime.call.incoming
                           │
                    ClawOps Server accepts call via REST:
                    POST /v1/realtime/calls/$CALL_ID/accept
                    { model: "gpt-realtime", instructions: "...", tools: [...] }
                           │
                    WebSocket for monitoring + tool execution:
                    GET wss://api.openai.com/v1/realtime?call_id={call_id}
```

**How it works:**
1. Twilio routes inbound call via SIP trunk to OpenAI's SIP endpoint
2. OpenAI fires `realtime.call.incoming` webhook to ClawOps server
3. ClawOps looks up tenant config (instructions, voice, tools) from database
4. ClawOps accepts the call via REST API with tenant-specific configuration
5. ClawOps connects via WebSocket to monitor the session and handle tool calls
6. OpenAI handles all audio I/O natively — no STT/TTS pipeline needed
7. When the model invokes tools (book_appointment, create_lead, etc.), ClawOps executes them and returns results

**Pros:** Sub-300ms latency, native speech-to-speech, simplest architecture  
**Cons:** Vendor lock-in to OpenAI, per-minute audio costs, less control over voice

#### Option B: STT → LLM → TTS Pipeline (Maximum Control)

```
Twilio <Connect><Stream>  ──▶  ClawOps WebSocket Server
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                   Inbound Audio           Outbound Audio
                        │                       ▲
                        ▼                       │
                   ┌─────────┐            ┌──────────┐
                   │  STT    │            │  TTS     │
                   │ Deepgram│            │ ElevenLabs│
                   │ or      │            │ or       │
                   │ Whisper │            │ PlayHT   │
                   └────┬────┘            └─────▲────┘
                        │                       │
                        ▼                       │
                   ┌─────────────────────────────┐
                   │  LLM Conversation Engine     │
                   │  (Claude / GPT-4o / GPT-4.1) │
                   │                               │
                   │  System prompt per tenant     │
                   │  Conversation history          │
                   │  Tool definitions              │
                   └───────────────────────────────┘
```

**How it works:**
1. Twilio streams raw audio (μ-law 8kHz) via bidirectional WebSocket
2. Audio chunks are forwarded to Deepgram streaming STT (or Whisper)
3. Transcribed text is sent to LLM with tenant-specific system prompt + conversation history
4. LLM response text is streamed to TTS engine (ElevenLabs / PlayHT / OpenAI TTS)
5. TTS audio chunks are sent back through WebSocket to Twilio → caller
6. Tool calls are intercepted and executed between LLM turns

**Pros:** Model-agnostic, voice-agnostic, full control, can use Claude  
**Cons:** Higher latency (600-1200ms), more infrastructure, more failure points

### 2.3 Recommendation

**Start with Option A (OpenAI Realtime SIP)** for v1 launch. It dramatically reduces engineering complexity and delivers the best caller experience. Build Option B as a fallback/premium tier for clients who need custom voices or non-OpenAI models.

### 2.4 Core Services Breakdown

| Service | Responsibility | Technology |
|---------|---------------|------------|
| **Call Router** | Tenant resolution, call recording, business hours routing | Node.js/Express or FastAPI |
| **Conversation Engine** | Real-time voice conversation with caller | OpenAI Realtime API (Option A) or STT→LLM→TTS (Option B) |
| **Tool Executor** | Executes function calls from the LLM (CRM writes, bookings, etc.) | Node.js workers |
| **Tenant Config Service** | Stores and serves per-client prompts, voices, business rules | PostgreSQL + Redis cache |
| **Notification Service** | Sends SMS/email/Slack/webhook notifications to business owners | Twilio SMS, SendGrid, Slack API |
| **Recording & Transcription** | Stores call recordings, generates transcripts | Twilio Recording + Deepgram/Whisper |
| **Analytics Engine** | Call metrics, lead conversion tracking, usage metering | ClickHouse or TimescaleDB |
| **Agency Dashboard** | Multi-tenant management UI for agencies | Next.js |
| **Client Dashboard** | Per-business view of calls, leads, settings | Next.js (same app, role-scoped) |

### 2.5 Data Flow — Complete Call Lifecycle

```
1. INBOUND CALL
   └─ Twilio receives call on tenant's phone number
   └─ Twilio triggers webhook → ClawOps Call Router
   └─ Call Router queries tenant config (DB lookup by phone number)
   └─ Call Router initiates recording (Twilio Recording API)

2. CONVERSATION
   └─ Audio stream connected to Conversation Engine
   └─ System prompt loaded: business name, services, hours, personality
   └─ AI greets caller: "Thanks for calling [Business], this is [Name]..."
   └─ Conversational loop:
       ├─ Caller speaks → AI understands intent
       ├─ AI responds naturally, asks qualifying questions
       ├─ If scheduling needed → tool call: check_availability()
       ├─ If lead capture → tool call: create_lead()
       └─ If transfer needed → tool call: transfer_call()

3. POST-CALL PROCESSING
   └─ Call summary generated (LLM summarization)
   └─ CRM record created/updated
   └─ Notification sent to business owner (SMS + email + optional Slack)
   └─ Recording + transcript stored
   └─ Analytics event logged
   └─ If lead is hot → urgent notification with callback prompt
```

---

## 3. Integration Map

### 3.1 Phone System

| Component | Primary | Alternative | Notes |
|-----------|---------|-------------|-------|
| **Phone Numbers** | Twilio | Telnyx, Vonage | Twilio for widest carrier coverage |
| **SIP Trunking** | Twilio Elastic SIP | Telnyx SIP, Bandwidth | For Option A: routes to OpenAI SIP endpoint |
| **Call Recording** | Twilio built-in | Post-call from audio stream | Dual-channel recording for QA |
| **SMS (notifications)** | Twilio Messaging | — | Same account, simplifies billing |
| **Number Porting** | Twilio Number Porting | — | Clients can port existing number |

**Twilio Configuration per Tenant:**
```xml
<!-- TwiML for Option A (SIP to OpenAI) -->
<Response>
  <Connect>
    <Sip>sip:${OPENAI_PROJECT_ID}@sip.api.openai.com;transport=tls</Sip>
  </Connect>
</Response>
```

```xml
<!-- TwiML for Option B (Media Streams) -->
<Response>
  <Connect>
    <Stream url="wss://api.clawops.com/conversation/${tenantId}" />
  </Connect>
</Response>
```

**Number Assignment Strategy:**
- Each client gets a dedicated local or toll-free number
- Client can port their existing business number to Twilio
- Overflow/after-hours forwarding from client's existing line via conditional call forwarding

### 3.2 LLM Backend

| Provider | Use Case | Model | Notes |
|----------|----------|-------|-------|
| **OpenAI Realtime** | Primary voice conversation (Option A) | gpt-realtime / gpt-4o-realtime | Native speech-to-speech |
| **OpenAI** | Post-call summarization, fallback text | gpt-4.1 / gpt-4o | Structured outputs for CRM data |
| **Anthropic** | Alternative conversation engine (Option B) | claude-sonnet-4 | Better instruction following for complex scripts |
| **Deepgram** | STT (Option B) | nova-3 | Streaming transcription, <300ms |
| **ElevenLabs** | TTS (Option B) | turbo-v2.5 | Custom voice cloning, lowest latency |
| **OpenAI TTS** | TTS fallback | tts-1 / tts-1-hd | Good quality, simpler integration |

**System Prompt Architecture:**

Every tenant gets a composed system prompt built from structured data:

```
SYSTEM PROMPT = [
  base_receptionist_prompt       // Universal receptionist behavior
  + industry_prompt              // Home services specific (HVAC, plumbing, etc.)
  + business_specific_prompt     // Generated from client onboarding data
  + personality_prompt           // Voice/tone customization
  + tool_definitions             // Available function calls
  + current_context              // Business hours status, today's schedule
]
```

**Tool Definitions (Function Calling):**

```json
{
  "tools": [
    {
      "name": "create_lead",
      "description": "Create a new lead/contact in the business CRM",
      "parameters": {
        "caller_name": "string",
        "phone": "string",
        "email": "string (optional)",
        "service_needed": "string",
        "urgency": "enum: emergency|urgent|routine|inquiry",
        "address": "string (optional)",
        "notes": "string"
      }
    },
    {
      "name": "check_availability",
      "description": "Check available appointment slots",
      "parameters": {
        "service_type": "string",
        "preferred_date": "string (optional)",
        "preferred_time": "string (optional)"
      }
    },
    {
      "name": "book_appointment",
      "description": "Book a service appointment",
      "parameters": {
        "lead_id": "string",
        "datetime": "ISO 8601",
        "service_type": "string",
        "estimated_duration": "integer (minutes)",
        "notes": "string"
      }
    },
    {
      "name": "transfer_call",
      "description": "Transfer the call to a specific person or department",
      "parameters": {
        "destination": "string (phone number or extension)",
        "reason": "string",
        "warm_transfer": "boolean"
      }
    },
    {
      "name": "send_notification",
      "description": "Send an urgent notification to the business owner",
      "parameters": {
        "urgency": "enum: normal|urgent|emergency",
        "message": "string",
        "channel": "enum: sms|email|slack|all"
      }
    },
    {
      "name": "lookup_pricing",
      "description": "Look up service pricing information",
      "parameters": {
        "service_type": "string"
      }
    },
    {
      "name": "get_business_hours",
      "description": "Get current business hours and availability",
      "parameters": {}
    }
  ]
}
```

### 3.3 CRM Connectors

| CRM | Integration Method | Priority | Notes |
|-----|-------------------|----------|-------|
| **GoHighLevel (GHL)** | REST API v2 + Webhooks | P0 — Primary | Most agencies use GHL; native sub-account model maps to our multi-tenancy |
| **HubSpot** | REST API + OAuth | P1 | Strong in SMB market |
| **Salesforce** | REST API + OAuth | P2 | Enterprise clients |
| **ServiceTitan** | REST API | P1 | #1 in home services vertical |
| **Housecall Pro** | REST API / Zapier | P2 | Popular with smaller contractors |
| **Jobber** | REST API / Zapier | P2 | Strong in field services |
| **Zapier/Make** | Webhook trigger | P0 — Universal fallback | Covers any CRM we don't natively support |

**GoHighLevel Integration Detail (Primary):**

```
ClawOps                          GoHighLevel
   │                                  │
   ├─ POST /contacts/ ───────────────▶│  Create/update contact
   ├─ POST /opportunities/ ──────────▶│  Create pipeline opportunity  
   ├─ POST /calendars/events/ ───────▶│  Book appointment
   ├─ POST /conversations/messages/ ─▶│  Log call notes in conversation
   │                                  │
   │◀── Webhook: contact.updated ─────┤  Sync back changes
   │◀── Webhook: appointment.* ───────┤  Calendar sync
```

**CRM Abstraction Layer:**

```typescript
interface CRMAdapter {
  createContact(data: ContactData): Promise<ContactResult>;
  updateContact(id: string, data: Partial<ContactData>): Promise<ContactResult>;
  createOpportunity(data: OpportunityData): Promise<OpportunityResult>;
  getAvailability(calendarId: string, range: DateRange): Promise<TimeSlot[]>;
  bookAppointment(data: AppointmentData): Promise<AppointmentResult>;
  logActivity(contactId: string, activity: ActivityData): Promise<void>;
}

// Implementations:
class GoHighLevelAdapter implements CRMAdapter { ... }
class HubSpotAdapter implements CRMAdapter { ... }
class ServiceTitanAdapter implements CRMAdapter { ... }
class ZapierWebhookAdapter implements CRMAdapter { ... }  // Universal fallback
```

### 3.4 Notification System

| Channel | Provider | Trigger | Content |
|---------|----------|---------|---------|
| **SMS** | Twilio | Every call | "New call from [Name] re: [Service]. [Urgency]. [Summary]." |
| **Email** | SendGrid / SES | Every call | Full call summary + transcript + recording link |
| **Slack** | Slack Incoming Webhooks | Configurable | Call card with action buttons |
| **Webhook** | Generic HTTP POST | Every call | Full JSON payload for custom integrations |
| **Push (mobile)** | Firebase / OneSignal | Emergency calls | Real-time alert for urgent service requests |

**Notification Priority Logic:**
```
IF urgency == "emergency":
  → SMS + Push immediately (within 15 seconds)
  → Email within 1 minute
  → Attempt live transfer to owner's cell

IF urgency == "urgent":
  → SMS immediately
  → Email within 5 minutes

IF urgency == "routine":
  → Email within 15 minutes
  → SMS digest every 2 hours (configurable)

IF urgency == "inquiry":
  → Email only, batched daily
```

### 3.5 Calendar / Scheduling Integration

| Provider | Method | Notes |
|----------|--------|-------|
| **Google Calendar** | Google Calendar API (OAuth) | Most common for SMBs |
| **Microsoft 365 / Outlook** | Microsoft Graph API | For businesses on M365 |
| **Calendly** | REST API | Embeddable scheduling |
| **GoHighLevel Calendar** | GHL API | Native for GHL users |
| **ServiceTitan Scheduling** | ServiceTitan API | Dispatch-aware scheduling |
| **iCal feed** | CalDAV / iCal URL | Universal read-only fallback |

**Scheduling Logic:**
```
1. AI determines caller wants to schedule
2. Tool call: check_availability(service_type, preferred_date)
3. System queries tenant's calendar API for open slots
4. Considers: business hours, service duration, travel time (if field service)
5. AI presents 2-3 options: "I have Tuesday at 10 AM or Wednesday at 2 PM"
6. Caller selects → tool call: book_appointment(...)
7. Calendar event created + confirmation SMS to caller + notification to owner
```

### 3.6 Call Recording & Transcription

| Component | Provider | Details |
|-----------|----------|---------|
| **Recording** | Twilio (dual-channel) | Stored in S3-compatible storage |
| **Transcription** | Deepgram / Whisper | Speaker-diarized, timestamped |
| **Summarization** | GPT-4o / Claude | Structured: caller info, intent, outcome, follow-ups |
| **Storage** | AWS S3 / Cloudflare R2 | 90-day retention default, configurable |
| **Compliance** | Recording disclosure | AI announces "This call may be recorded" per state law |

**Post-Call Processing Pipeline:**
```
Call Ends
  │
  ├─▶ Twilio recording webhook fires
  │     └─ Download recording from Twilio
  │     └─ Store in R2/S3 (tenant-isolated bucket prefix)
  │
  ├─▶ Send audio to Deepgram for transcription
  │     └─ Speaker diarization (agent vs caller)
  │     └─ Store transcript JSON
  │
  ├─▶ Send transcript to LLM for summarization
  │     └─ Structured output: { caller_name, phone, intent, services_discussed,
  │     │    urgency, appointment_booked, follow_up_needed, summary }
  │     └─ Store summary
  │
  ├─▶ Update CRM with call record
  │
  └─▶ Send notification to business owner
```

---

## 4. White-Label Architecture

### 4.1 Multi-Tenancy Model

```
┌─────────────────────────────────────────────┐
│                 ClawOps Platform             │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  Agency Tier (Partner Account)       │   │
│  │                                      │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐   │   │
│  │  │Client A│ │Client B│ │Client C│   │   │
│  │  │(HVAC)  │ │(Plumb.)│ │(Electr)│   │   │
│  │  └────────┘ └────────┘ └────────┘   │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  Agency Tier (Another Partner)       │   │
│  │                                      │   │
│  │  ┌────────┐ ┌────────┐              │   │
│  │  │Client D│ │Client E│              │   │
│  │  │(Roofing│ │(HVAC)  │              │   │
│  │  └────────┘ └────────┘              │   │
│  └──────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

**Hierarchy:**
```
Platform (ClawOps)
  └─ Agency (marketing agency / reseller)
       └─ Client (end business — the HVAC company, plumber, etc.)
            └─ Receptionist (AI agent with specific config)
                 └─ Phone Number(s)
```

### 4.2 Data Isolation

| Data Type | Isolation Method | Details |
|-----------|-----------------|---------|
| **Database** | Row-level security (RLS) via tenant_id | PostgreSQL RLS policies; every table has agency_id + client_id |
| **Call Recordings** | S3 prefix: /{agency_id}/{client_id}/recordings/ | Separate IAM policies per agency |
| **API Keys** | Scoped per agency | Agency keys can only access their clients |
| **Conversation Logs** | Partitioned by client_id | 90-day default retention |
| **Analytics** | Filtered by tenant hierarchy | Agency sees all their clients; client sees only their data |

**Database Schema (core):**

```sql
-- Agencies (resellers / partners)
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,           -- for white-label subdomain
  branding JSONB DEFAULT '{}',         -- logo_url, colors, custom_domain
  billing_plan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clients (end businesses)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id),
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,              -- hvac, plumbing, electrical, roofing, general
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  business_hours JSONB NOT NULL,       -- { mon: {open: "08:00", close: "17:00"}, ... }
  services JSONB NOT NULL,             -- [{ name, description, duration_min, price_range }]
  faqs JSONB DEFAULT '[]',
  notification_config JSONB NOT NULL,  -- { sms: "+1...", email: "...", slack_webhook: "..." }
  crm_config JSONB,                    -- { provider, api_key, ... }
  calendar_config JSONB,               -- { provider, calendar_id, ... }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Receptionists (AI agents)
CREATE TABLE receptionists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL DEFAULT 'Alex',   -- AI personality name
  voice_id TEXT,                        -- ElevenLabs voice ID or OpenAI voice
  personality TEXT,                     -- warm, professional, friendly, etc.
  system_prompt_override TEXT,          -- optional full override
  greeting TEXT,                        -- custom greeting template
  phone_numbers TEXT[] NOT NULL,        -- Twilio phone numbers assigned
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Calls
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  receptionist_id UUID REFERENCES receptionists(id),
  twilio_call_sid TEXT UNIQUE,
  caller_phone TEXT NOT NULL,
  caller_name TEXT,
  direction TEXT DEFAULT 'inbound',
  status TEXT NOT NULL,                -- ringing, in-progress, completed, failed
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript JSONB,
  summary JSONB,                       -- structured: intent, urgency, outcome, etc.
  lead_created BOOLEAN DEFAULT false,
  appointment_booked BOOLEAN DEFAULT false,
  transferred BOOLEAN DEFAULT false,
  cost_cents INTEGER,                  -- our cost for this call
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  call_id UUID REFERENCES calls(id),
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  service_needed TEXT,
  urgency TEXT,
  address TEXT,
  notes TEXT,
  crm_synced BOOLEAN DEFAULT false,
  crm_contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 Custom Voice & Personality

| Customization | How It Works | Options |
|---------------|-------------|---------|
| **AI Name** | Injected into system prompt + greeting | Any name (default: "Alex") |
| **Voice** | Option A: OpenAI voice selection; Option B: ElevenLabs voice ID | OpenAI: alloy, echo, fable, onyx, nova, shimmer; ElevenLabs: 50+ voices or custom clone |
| **Personality** | Adjectives mapped to prompt modifiers | Warm, Professional, Friendly, Energetic, Calm |
| **Greeting** | Template with variables | "Thanks for calling {business_name}, this is {ai_name}. How can I help you today?" |
| **Industry Knowledge** | Pre-built prompt modules | HVAC, Plumbing, Electrical, Roofing, General Contractor |
| **Language** | Primary + secondary language | English (default), Spanish (bilingual mode) |
| **Call Handling Rules** | Business logic configuration | Transfer rules, escalation triggers, after-hours behavior |

**Example Greeting Template:**
```
Thanks for calling {business_name}! This is {ai_name}.
{if after_hours}We're currently closed, but I can absolutely help you.{/if}
{if emergency_line}If this is an emergency, I can connect you with someone right away.{/if}
How can I help you today?
```

### 4.4 Agency Dashboard vs Client Dashboard

**Agency Dashboard (agency.clawops.com or custom domain):**
- Manage all client accounts
- Global analytics across clients
- Billing and subscription management
- White-label branding settings
- Bulk client onboarding tools
- Prompt template library
- Voice selection and preview
- API key management

**Client Dashboard (client view within agency dashboard):**
- Call log with recordings + transcripts
- Lead list with CRM sync status
- Appointment calendar view
- Real-time call monitoring (listen-in)
- Basic settings (business hours, services, FAQs)
- Notification preferences
- Performance metrics (calls answered, leads captured, appointments booked)

**Access Control Matrix:**

| Capability | Platform Admin | Agency Admin | Agency Staff | Client Owner | Client Staff |
|-----------|---------------|-------------|-------------|-------------|-------------|
| Manage agencies | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create clients | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit client config | ✅ | ✅ | ✅ | Limited | ❌ |
| View calls/leads | ✅ | All clients | Assigned | Own only | Own only |
| Edit system prompt | ✅ | ✅ | ❌ | ❌ | ❌ |
| View analytics | ✅ | All clients | Assigned | Own only | Own only |
| Manage billing | ✅ | Own agency | ❌ | ❌ | ❌ |
| Listen to recordings | ✅ | All clients | Assigned | Own only | Own only |

### 4.5 Branding Customization Points

| Element | Customizable | Method |
|---------|-------------|--------|
| **Dashboard URL** | Yes | Custom domain (CNAME) or subdomain |
| **Logo** | Yes | Upload in agency settings |
| **Color scheme** | Yes | Primary, secondary, accent colors |
| **Favicon** | Yes | Upload |
| **Email sender** | Yes | Custom from address via SendGrid domain auth |
| **SMS sender name** | Partial | Twilio alphanumeric sender ID (where supported) |
| **Login page** | Yes | Agency branding applied |
| **Call summary emails** | Yes | Agency-branded email templates |
| **Mobile app** | Future | Branded wrapper app |
| **"Powered by" footer** | Configurable | Can be hidden on higher tiers |

---

## 5. Deployment Specs

### 5.1 Per-Client Setup Process

**Estimated Setup Time: 30-60 minutes** (agency-side, no engineering needed)

```
Step 1: Create Client Account (2 min)
  └─ Business name, industry, timezone
  └─ Owner contact info (phone, email)

Step 2: Business Information (15-20 min)
  └─ Services offered (name, description, typical price range)
  └─ Business hours (by day of week + holidays)
  └─ Service area (zip codes or radius)
  └─ Emergency/after-hours policy
  └─ FAQs (10-20 common questions + answers)
  └─ Pricing info (ranges, "call for quote" items)
  └─ Staff directory (who handles what, transfer numbers)

Step 3: AI Personality (5 min)
  └─ Select voice
  └─ Set AI name
  └─ Choose personality type
  └─ Customize greeting
  └─ Review/edit generated system prompt

Step 4: Integrations (5-10 min)
  └─ Connect CRM (OAuth flow or API key)
  └─ Connect calendar
  └─ Set notification channels (SMS number, email, Slack webhook)

Step 5: Phone Number (3 min)
  └─ Provision new local/toll-free number
  └─ OR initiate number port
  └─ OR set up call forwarding from existing number

Step 6: Testing (5-10 min)
  └─ Make test calls
  └─ Review AI responses
  └─ Adjust prompt/FAQs as needed
  └─ Go live
```

### 5.2 Required Client Information Checklist

```
## Required (Must Have)
- [ ] Business name (legal + DBA)
- [ ] Business phone number (existing)
- [ ] Business address
- [ ] Owner name + cell phone + email
- [ ] Business hours (each day of week)
- [ ] Services offered (at least top 5)
- [ ] Service area
- [ ] What to do with emergency calls

## Strongly Recommended
- [ ] Pricing info (ranges or "free estimate" policy)
- [ ] Top 10 FAQs with answers
- [ ] Staff names + roles + direct numbers (for transfers)
- [ ] Scheduling preferences (earliest/latest, buffer time)
- [ ] Competitor differentiators ("why choose us")
- [ ] Current CRM credentials
- [ ] Current calendar system

## Nice to Have
- [ ] Recent call recordings (for prompt tuning)
- [ ] Website URL (for auto-extraction of business info)
- [ ] Google Business Profile (for reviews/hours auto-sync)
- [ ] Branding guidelines (for client dashboard)
- [ ] Special instructions (seasonal hours, holiday schedule)
```

### 5.3 Infrastructure Costs Per Seat

**Monthly Cost Per Active Client (estimated at 200 calls/month, avg 3 min):**

| Component | Cost | Notes |
|-----------|------|-------|
| **Twilio Phone Number** | $1.15/mo | Local number |
| **Twilio Voice (inbound)** | $0.0085/min × 600 min = $5.10 | Per-minute inbound |
| **OpenAI Realtime API** | ~$0.06/min × 600 min = $36.00 | Audio input + output tokens |
| **Post-call LLM (summarization)** | ~$2.00 | GPT-4o for summaries |
| **Twilio SMS (notifications)** | $0.0079/msg × 200 = $1.58 | Per-call SMS to owner |
| **SendGrid (email)** | ~$0.50 | Allocated from bulk plan |
| **Call Recording Storage** | ~$1.00 | R2/S3, 90-day retention |
| **Transcription (Deepgram)** | $0.0043/min × 600 = $2.58 | If using separate transcription |
| **Infrastructure (allocated)** | ~$5.00 | Compute, DB, Redis share |
| **Total COGS per client** | **~$55/month** | At 200 calls, 3 min avg |

**Pricing Recommendation:**
- Agency wholesale: $149-199/month per client
- Direct to business: $199-299/month per client  
- **Gross margin: 60-75%**

**Cost Scaling:**
- 100 calls/month: ~$30 COGS → sell at $99-149
- 200 calls/month: ~$55 COGS → sell at $149-249
- 500 calls/month: ~$120 COGS → sell at $299-449
- 1000 calls/month: ~$220 COGS → sell at $499-749

### 5.4 Infrastructure Architecture

```
┌──────────────────────────────────────────────────┐
│  Cloud Provider: AWS / Vercel / Fly.io           │
│                                                  │
│  ┌────────────────┐  ┌────────────────────────┐  │
│  │  API Server     │  │  WebSocket Server      │  │
│  │  (Next.js API   │  │  (Node.js, dedicated)  │  │
│  │   or FastAPI)   │  │  Handles Media Streams  │  │
│  │                 │  │  + OpenAI Realtime WS   │  │
│  │  Horizontally   │  │                        │  │
│  │  scalable       │  │  Sticky sessions via   │  │
│  │                 │  │  call_id routing        │  │
│  └────────┬───────┘  └───────────┬────────────┘  │
│           │                      │                │
│  ┌────────┴──────────────────────┴────────────┐  │
│  │  Shared Services                            │  │
│  │                                             │  │
│  │  PostgreSQL (Neon / RDS)                    │  │
│  │  Redis (Upstash / ElastiCache)              │  │
│  │  S3 / R2 (recordings, assets)               │  │
│  │  BullMQ (job queue for post-call processing)│  │
│  └─────────────────────────────────────────────┘  │
│                                                  │
│  ┌─────────────────────────────────────────────┐  │
│  │  Worker Pool (post-call processing)         │  │
│  │  • Transcription jobs                       │  │
│  │  • Summarization jobs                       │  │
│  │  • CRM sync jobs                            │  │
│  │  • Notification jobs                        │  │
│  └─────────────────────────────────────────────┘  │
│                                                  │
│  ┌─────────────────────────────────────────────┐  │
│  │  Dashboard (Next.js on Vercel)              │  │
│  │  • Agency portal                            │  │
│  │  • Client portal                            │  │
│  │  • Platform admin                           │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 5.5 Scaling Considerations

| Scale Point | Challenge | Solution |
|-------------|-----------|----------|
| **0-50 clients** | Single server sufficient | Monolith on Fly.io or Railway |
| **50-500 clients** | WebSocket connection limits | Horizontal scaling with sticky sessions; separate WS servers |
| **500-2000 clients** | Database load, concurrent calls | Read replicas, connection pooling (PgBouncer), Redis caching |
| **2000+ clients** | Cost optimization, latency | Regional deployment, negotiate volume pricing with Twilio/OpenAI |
| **Concurrent calls** | ~5% of clients on call at any time | 100 clients ≈ 5 concurrent; 1000 clients ≈ 50 concurrent |
| **Peak hours** | 9-11 AM and 1-3 PM local time | Auto-scaling based on WebSocket connection count |

**Capacity Planning Formula:**
```
Peak concurrent calls ≈ total_clients × 0.08 (8% during peak hour)
WebSocket connections  = peak_concurrent × 2 (Twilio + OpenAI per call)
Memory per connection  ≈ 5 MB (audio buffers + conversation state)
Server capacity        ≈ 200 concurrent calls per 4GB server
```

---

## 6. Competitive Analysis

### 6.1 Market Map

| Competitor | Type | Pricing | AI-First | White-Label | Home Services Focus |
|-----------|------|---------|----------|-------------|-------------------|
| **Smith.ai** | Human + AI hybrid | $300-2100/mo (30-300 calls) | No (human primary) | No | No (legal-focused) |
| **Ruby** | Human receptionists | ~$400+/mo | No | No | No (general) |
| **Dialzara** | Pure AI | $29-199/mo (by minutes) | Yes | No | No (general) |
| **Goodcall** | Pure AI | $79-249/mo (by unique customers) | Yes | Partial (agency view) | Partial |
| **ClawOps** | Pure AI | $149-299/mo (target) | Yes | Yes (native) | Yes (primary) |

### 6.2 Detailed Competitor Breakdown

#### Smith.ai
- **What they do well:** Human + AI hybrid (AI handles simple, humans handle complex); 24/7 live staffing; strong CRM integration (HubSpot, Salesforce, Clio); lead qualification and intake
- **Pricing:** $300/mo for 30 calls (~$10/call); $810/mo for 90 calls (~$9/call); $2100/mo for 300 calls (~$7/call); plus per-call add-ons
- **Weaknesses we exploit:** Extremely expensive per-call; not white-labelable; no agency model; heavily legal-industry focused; no custom voice; relies on human labor (scaling constraint)
- **What to match:** CRM integration breadth; lead qualification workflows; call transfer capabilities
- **Our advantage:** 10-20x cheaper per call; fully customizable; scales without hiring

#### Ruby
- **What they do well:** Premium human receptionist experience; very high customer satisfaction; excellent call handling quality; strong brand in legal/professional services
- **Pricing:** Not publicly listed, estimated $400-800+/mo; per-minute billing
- **Weaknesses we exploit:** All-human model is expensive and doesn't scale; no AI capabilities; no white-label; not home-services focused
- **Our advantage:** Fraction of the cost; 24/7 without staffing constraints; AI improves over time

#### Dialzara
- **What they do well:** Dead simple setup (15 min claim); affordable entry ($29/mo); 50+ voice options; auto-generates prompt from website; Zapier/Make integrations; supports warm + blind transfers
- **Pricing:** $29/mo (60 min); $99/mo (220 min); $199/mo (500 min); $0.48/min overage
- **Weaknesses we exploit:** No native CRM integrations (Zapier only); no white-label/agency model; no industry-specific intelligence; limited scheduling (Google/Outlook calendar only on Pro+); basic analytics
- **What to match:** Quick setup; affordable entry tier; 50+ voices; call recordings included
- **Our advantage:** Native CRM integrations; white-label architecture; home services domain expertise; agency dashboard

#### Goodcall
- **What they do well:** Strong form/logic flow builder; 97% caller interaction rate; ServiceTitan + GoHighLevel integrations; per-unique-customer pricing (predictable costs); 42K+ agents launched; unlimited minutes
- **Pricing:** $79/mo (100 unique customers); $129/mo (250 customers); $249/mo (500 customers); $0.50/customer overage; unlimited minutes (big differentiator)
- **Weaknesses we exploit:** Agency features are limited (performance viewer only, no full white-label); no custom voice cloning; setup requires manual skill/flow configuration; no white-label branding; analytics dashboard is basic
- **What to match:** Unlimited minutes model (consider for pricing); ServiceTitan integration; logic flow builder; custom skill/flow system
- **Our advantage:** Full white-label from day one; agency-native architecture; deeper home services prompt engineering; custom voice per client

### 6.3 Competitive Positioning Matrix

```
                    Low Price ◄───────────────────────► High Price
                        │                                   │
  Full AI ─────  Dialzara │──── ClawOps ─── Goodcall       │
                        │         ▲                         │
                        │         │                         │
                        │    White-label                    │
                        │    + Home Services                │
                        │    + Agency model                 │
                        │                                   │
  Human ──────          │                    Smith.ai ──── Ruby
                        │                                   │
```

### 6.4 Key Differentiators (Why ClawOps Wins)

1. **White-Label Native:** Only solution built from the ground up for agency resale. Goodcall has a "performance viewer" for agencies; we have a full branded dashboard.

2. **Home Services Domain Expertise:** Pre-built prompt modules for HVAC, plumbing, electrical, roofing. Understands service urgency (frozen pipe = emergency, annual inspection = routine).

3. **Agency Economics:** Agencies buy at wholesale ($99-149), sell at $249-399. 40-60% margin for agencies. No other competitor offers this.

4. **CRM-First Architecture:** Native GoHighLevel + ServiceTitan integration (the two CRMs home services actually use), not just Zapier.

5. **Cost Structure:** Pure AI with no human labor costs. At scale, our COGS decrease; Smith.ai's increase.

---

## 7. Security & Compliance

### 7.1 Compliance Requirements

| Requirement | Status | Implementation |
|-------------|--------|---------------|
| **Call Recording Disclosure** | Required | AI announces recording at call start (configurable per state: one-party vs two-party consent) |
| **TCPA** | Required | No outbound autodialing without consent; inbound-only for v1 |
| **PCI DSS** | Future | No payment processing in v1; when added, use tokenized payment via Stripe/Square |
| **HIPAA** | Future (P1) | For medical-adjacent home services; BAA with Twilio + OpenAI; encrypted storage |
| **SOC 2 Type II** | Target Year 2 | Required for enterprise agency contracts |
| **GDPR** | If serving EU | Data residency options, deletion APIs |
| **State Privacy Laws** | Varies | CCPA/CPRA compliance for California businesses |

### 7.2 Data Security

| Layer | Protection |
|-------|-----------|
| **In Transit** | TLS 1.3 everywhere (API, WebSocket, SIP-TLS) |
| **At Rest** | AES-256 encryption for recordings and transcripts |
| **Database** | PostgreSQL with RLS; encrypted connections; automated backups |
| **API Authentication** | JWT + API keys; OAuth for CRM integrations |
| **Secrets** | AWS Secrets Manager or Vault; never in code |
| **Access Logging** | Full audit trail for all data access |
| **Data Retention** | Configurable per tenant; default 90 days for recordings, 1 year for metadata |

---

## 8. Cost Model

### 8.1 Platform Fixed Costs (Monthly)

| Item | Cost | Notes |
|------|------|-------|
| **Compute (API + WS servers)** | $200-500 | Fly.io or Railway; scales with clients |
| **Database (PostgreSQL)** | $50-100 | Neon or Supabase Pro |
| **Redis** | $20-50 | Upstash or ElastiCache |
| **Object Storage** | $10-50 | Cloudflare R2 (no egress fees) |
| **Monitoring** | $50-100 | Datadog or Grafana Cloud |
| **SendGrid** | $20-50 | Email notifications |
| **Domain / SSL** | $20 | Wildcard cert for white-label subdomains |
| **Total Fixed** | **$370-870/month** | Amortized across all clients |

### 8.2 Unit Economics

| Metric | Value |
|--------|-------|
| **COGS per client (200 calls/mo)** | ~$55 |
| **Wholesale price to agency** | $149 |
| **Agency gross margin** | 63% |
| **Agency sells to client at** | $249-399 |
| **Agency's margin** | 40-63% |
| **Break-even** | ~8-15 clients covers fixed costs |
| **Target Year 1** | 100 clients → ~$10K/mo revenue, ~$5K/mo profit |

---

## 9. Roadmap

### Phase 1 — MVP (Weeks 1-6)
- [ ] OpenAI Realtime SIP integration (Option A)
- [ ] Twilio phone number provisioning
- [ ] Basic tenant config (DB + admin panel)
- [ ] Core tool functions: create_lead, book_appointment, send_notification
- [ ] GoHighLevel CRM integration
- [ ] SMS + email notifications
- [ ] Call recording + storage
- [ ] Minimal agency dashboard (client list, call logs)
- [ ] 5 pilot clients with one agency partner

### Phase 2 — Production (Weeks 7-12)
- [ ] Full agency dashboard with white-label branding
- [ ] Client-facing dashboard
- [ ] HubSpot + ServiceTitan CRM integrations
- [ ] Google Calendar + Outlook scheduling
- [ ] Post-call transcription + summarization pipeline
- [ ] Analytics dashboard (calls, leads, conversion)
- [ ] Zapier/Make webhook integration (universal CRM fallback)
- [ ] Call transfer (warm + blind)
- [ ] Multi-voice support

### Phase 3 — Scale (Weeks 13-20)
- [ ] Option B pipeline (STT→LLM→TTS) for custom voice clients
- [ ] ElevenLabs custom voice cloning
- [ ] Bilingual support (English/Spanish)
- [ ] Advanced call routing (time-of-day, round-robin)
- [ ] Slack integration for notifications
- [ ] Mobile push notifications
- [ ] Client self-service onboarding wizard
- [ ] Usage-based billing system
- [ ] Prompt template marketplace for agencies

### Phase 4 — Enterprise (Months 6+)
- [ ] HIPAA compliance certification
- [ ] Outbound calling (appointment reminders, follow-ups)
- [ ] SMS/text conversation mode
- [ ] AI quality scoring + auto-improvement
- [ ] SOC 2 Type II audit
- [ ] Multi-region deployment
- [ ] Branded mobile app for agencies
- [ ] Voice analytics (sentiment, tone detection)

---

## Appendix A: Technology Stack Summary

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Runtime** | Node.js 22 (TypeScript) | WebSocket native, Twilio SDK support, team familiarity |
| **Web Framework** | Next.js 15 (App Router) | Dashboard + API in one; Vercel deployment |
| **Database** | PostgreSQL 16 (Neon) | RLS for multi-tenancy; JSONB for flexible config |
| **Cache** | Redis (Upstash) | Tenant config cache, rate limiting, session state |
| **Queue** | BullMQ on Redis | Post-call processing jobs |
| **Object Storage** | Cloudflare R2 | Zero egress cost for recordings |
| **Phone** | Twilio Voice + SIP | Market leader, best docs, SIP to OpenAI |
| **AI (Voice)** | OpenAI Realtime API | Native speech-to-speech, lowest latency |
| **AI (Text)** | OpenAI GPT-4o / Anthropic Claude | Summarization, structured extraction |
| **TTS (fallback)** | ElevenLabs Turbo v2.5 | Custom voices, low latency |
| **STT (fallback)** | Deepgram Nova-3 | Best streaming accuracy at price |
| **Email** | SendGrid | Deliverability, template engine |
| **Monitoring** | Sentry + Datadog | Error tracking + metrics |
| **Auth** | Clerk or NextAuth | Multi-tenant auth with org support |
| **Deployment** | Vercel (dashboard) + Fly.io (WS server) | Edge + persistent connections |

---

## Appendix B: Example System Prompt (HVAC Business)

```
You are Sarah, a friendly and professional virtual receptionist for Comfort Zone HVAC.

## Your Role
You answer phone calls for Comfort Zone HVAC, a family-owned heating and cooling company
serving the greater Charlotte, NC area since 2005.

## Personality
- Warm, helpful, and professional
- Speak naturally — use contractions, brief acknowledgments ("Sure thing", "Absolutely")
- Keep responses concise (2-3 sentences max per turn)
- Mirror the caller's energy level
- If they sound stressed about a broken AC in summer, show empathy

## Services Offered
- AC repair and installation
- Heating/furnace repair and installation
- Ductwork repair and cleaning
- Thermostat installation (including smart thermostats)
- Seasonal tune-ups and maintenance plans
- Indoor air quality solutions
- 24/7 emergency service for no heat/no AC

## Business Hours
- Monday-Friday: 7:00 AM - 6:00 PM
- Saturday: 8:00 AM - 2:00 PM
- Sunday: Closed (emergency service available)
- After hours: Take message, flag as urgent if no heat/AC

## Pricing
- Service call: $89 (waived if repair is approved)
- Seasonal tune-up: $79 per system
- Maintenance plan: $149/year per system
- For installations and major repairs: "We provide free estimates"

## Emergency Triggers
If the caller mentions ANY of these, flag as EMERGENCY and attempt to transfer:
- No heat when it's cold outside
- No AC when it's hot outside
- Gas smell
- Carbon monoxide alarm
- Water leaking from HVAC unit
- Electrical burning smell

## Call Handling Rules
1. Always greet warmly and identify yourself
2. Determine the caller's need (repair, install, maintenance, billing, other)
3. For service requests: get name, phone, address, and description of issue
4. For scheduling: check availability and book the appointment
5. For pricing questions: share what you know, offer free estimate for unknowns
6. For emergencies: attempt immediate transfer to dispatch at (704) 555-0199
7. If you can't help, take a detailed message and promise a callback within 1 hour
8. End every call with: "Is there anything else I can help you with today?"

## Important Notes
- NEVER make up pricing for services not listed above
- ALWAYS confirm the phone number before ending the call
- License #: NC-12345-HC (mention only if asked)
- Service area: Charlotte, Concord, Huntersville, Matthews, Mint Hill, Indian Trail

## Recording Disclosure
At the start of every call, after your greeting, say:
"Just so you know, this call may be recorded for quality purposes."
```

---

## Appendix C: API Endpoint Design (Draft)

```
# Agency Management
POST   /api/v1/agencies                     # Create agency
GET    /api/v1/agencies/:id                  # Get agency
PATCH  /api/v1/agencies/:id                  # Update agency
GET    /api/v1/agencies/:id/clients          # List agency's clients
GET    /api/v1/agencies/:id/analytics        # Agency-wide analytics

# Client Management
POST   /api/v1/clients                       # Create client
GET    /api/v1/clients/:id                   # Get client
PATCH  /api/v1/clients/:id                   # Update client
DELETE /api/v1/clients/:id                   # Deactivate client

# Receptionist Configuration
POST   /api/v1/clients/:id/receptionists     # Create receptionist
GET    /api/v1/clients/:id/receptionists/:rid # Get config
PATCH  /api/v1/clients/:id/receptionists/:rid # Update config
POST   /api/v1/clients/:id/receptionists/:rid/test-call  # Trigger test call

# Calls
GET    /api/v1/clients/:id/calls             # List calls (paginated)
GET    /api/v1/clients/:id/calls/:cid        # Call detail + transcript
GET    /api/v1/clients/:id/calls/:cid/recording  # Stream recording

# Leads
GET    /api/v1/clients/:id/leads             # List leads
GET    /api/v1/clients/:id/leads/:lid        # Lead detail
PATCH  /api/v1/clients/:id/leads/:lid        # Update lead status

# Analytics
GET    /api/v1/clients/:id/analytics         # Client analytics
GET    /api/v1/analytics/overview             # Platform-wide (admin only)

# Webhooks (Twilio callbacks)
POST   /webhooks/twilio/voice                # Inbound call handler
POST   /webhooks/twilio/status               # Call status updates
POST   /webhooks/twilio/recording            # Recording ready
POST   /webhooks/openai/realtime             # OpenAI SIP call incoming
```

---

*This document is the single source of truth for ClawOps AI Receptionist architecture.
Any developer should be able to build from this. Update this document as decisions are
made and architecture evolves.*
