# Solutions Architect Study: Multi-Tenant Voice AI Deployment
**Date:** 2026-02-28
**Scope:** Technical architecture research for ClawOps voice AI agency platform

---

## 1. Multi-Tenant SaaS Architecture for Voice AI

### Insight: Per-Tenant Config Isolation via Feature Flags + JSON Schema

**Source:** r/ExperiencedDevs thread "How to Handle Per-Tenant Custom Logic Without Fragmenting a SaaS Core" (2026, 29 comments, 91% upvote ratio). Developer with Next.js/Laravel multi-tenant system asked about per-client customizations. Top consensus: avoid separate codebases per client. Instead, use feature flags and a config-driven approach where per-tenant behavior lives in data, not code.

One commenter (Fullstack, 8 yrs experience): "We had a bunch of legacy stuff that was truly one-off functionality made for a specific customer and it was a mess. More recently we were getting better at making them into generic configurations that could potentially be enabled by other customers if needed."

**Architecture Recommendation for ClawOps:**
Use a single codebase with a `tenant_config` JSON document per client stored in Postgres. Each config holds: voice provider settings, system prompt template, business hours, booking integration type (SevenRooms/OpenTable/Resy/none), greeting script, transfer numbers, and feature flags. The voice AI agent reads this config at call start via the `assistant-request` webhook (see Section 2). Never fork the codebase per restaurant. All customization lives in config rows.

Schema approach:
```
tenants table:
  id, slug, name, created_at
  
tenant_configs table:
  tenant_id (FK), config_version, config_json (JSONB), active (bool)
```

This lets you version configs, A/B test prompt changes per tenant, and roll back without code deploys.

### Insight: Row-Level Security for Tenant Data Isolation

**Source:** r/SaaS and r/node discussions on multi-tenant database design. Consensus for early-stage SaaS: shared database with row-level security (RLS) beats separate databases. Separate schemas per tenant only make sense above ~500 tenants with heavy data.

**Architecture Recommendation for ClawOps:**
Use Postgres with RLS policies enforcing `tenant_id` on every query. Supabase provides this out of the box if you want managed infra. At ClawOps scale (dozens to low hundreds of restaurant clients), shared-database-with-RLS is the right call. Move to schema-per-tenant only if a client demands dedicated data residency.

---

## 2. Deploying Personalized Voice AI Demos in Under 15 Minutes

### Insight: Vapi's `assistant-request` Webhook Enables Dynamic, Per-Call Configuration

**Source:** Vapi official docs (docs.vapi.ai/server-url/events). When an inbound call hits a Vapi phone number without a hardcoded `assistantId`, Vapi sends an `assistant-request` POST to your server URL. You have 7.5 seconds to respond with a full transient assistant definition (system prompt, voice, model, tools) or an existing `assistantId`.

This is the key architectural primitive for multi-tenant voice AI. One Vapi account, one server URL, and the server decides which personality/config to load based on the calling number or called number.

**Architecture Recommendation for ClawOps:**
Build a "Demo Provisioner" flow:
1. Sales rep enters prospect name, restaurant type, menu highlights, and booking platform into a ClawOps admin form.
2. System generates a tenant_config JSON from a template (e.g., "fine-dining-italian" or "casual-breakfast").
3. System provisions a Vapi phone number via API, maps it to the new tenant_id.
4. On inbound calls, the `assistant-request` webhook looks up tenant_id by called number, loads the config, and returns a transient assistant with the restaurant's specific greeting, personality, menu knowledge, and booking tool.

Target: form submission to working demo phone number in under 5 minutes (API calls are sub-second; the bottleneck is the human filling in the form).

### Insight: Template-Based Prompt Engineering Cuts Setup Time

**Source:** r/AiBuilders thread "Am I dumb to build Voice AI agent solution?" (2025). Developer building restaurant voice AI noted that Vapi/Retell/VoiceFlow don't provide backend UI for restaurant staff to manage orders. This confirms that the agency layer (ClawOps) must own the admin UI and templating.

**Architecture Recommendation for ClawOps:**
Maintain 5-10 "vertical templates" for restaurant types. Each template includes: system prompt skeleton with {{placeholders}}, default voice selection, default booking integration, and suggested tool definitions. The demo provisioner fills the placeholders from the intake form. This keeps demo quality high while minimizing per-prospect engineering time.

---

## 3. Restaurant-Specific Booking Integrations

### SevenRooms API

**Source:** SevenRooms developer documentation (api-docs.sevenrooms.com). SevenRooms provides a REST API for reservation management. Key endpoints: create/update/cancel reservations, guest profile lookup, availability check. Access requires a partner agreement; the API is not self-serve. They support webhooks for reservation status changes.

**Architecture Recommendation for ClawOps:**
Apply for SevenRooms API partner access now. Build a generic `BookingAdapter` interface with methods: `checkAvailability(date, time, partySize)`, `createReservation(guestInfo, slot)`, `cancelReservation(confirmationId)`. SevenRooms becomes one implementation. This adapter is called by the Vapi tool-call webhook when the AI agent triggers a "book_table" function.

### OpenTable API

**Source:** OpenTable developer documentation (platform.opentable.com). OpenTable's Connect API provides restaurant availability and reservation creation. Access is gated behind a partner program. They offer a widget-based approach for web, but the REST API is available for approved partners. OpenTable's API returns availability slots for a given restaurant, date, time, and party size.

**Architecture Recommendation for ClawOps:**
OpenTable integration follows the same `BookingAdapter` pattern. Note: OpenTable is stricter about API access than SevenRooms. For early ClawOps clients, consider a fallback: the voice AI collects booking details and pushes them to the restaurant's email/SMS for manual confirmation. This "soft booking" approach works while API partnerships are being established.

### Resy API

**Source:** Resy does not offer a public developer API. Resy (owned by American Express) has no documented REST API for third-party reservation creation. Some developers have reverse-engineered their internal API, but this is fragile and against TOS.

**Architecture Recommendation for ClawOps:**
For Resy venues, use the "soft booking" fallback: the AI agent collects guest name, party size, preferred date/time, and phone number, then sends a structured webhook to the restaurant's staff dashboard (or email/SMS). Alternatively, explore Resy's partnership program through AmEx business contacts. Do not build against undocumented endpoints.

### Universal Fallback Pattern

**Architecture Recommendation for ClawOps:**
Every tenant config should specify a `booking_integration` field: `sevenrooms`, `opentable`, `manual`, or `none`. The `manual` mode sends collected reservation data to a configurable webhook URL (the restaurant's own system, a Google Sheet, email, etc.). This ensures every demo works regardless of which booking platform the restaurant uses.

---

## 4. White-Label Voice AI Infrastructure

### Insight: Vapi Supports Programmatic Multi-Tenant via API-First Design

**Source:** Vapi docs (server-url, squads, call-features). Vapi's architecture is inherently API-first. You can: create assistants programmatically, provision phone numbers via API, use the `assistant-request` webhook to dynamically route calls, and use Squads to chain specialized assistants. There is no concept of "sub-accounts" in Vapi itself, but the entire assistant/phone-number lifecycle is API-driven.

**Architecture Recommendation for ClawOps:**
ClawOps owns a single Vapi organization. The white-label layer lives entirely in ClawOps:
- Each agency owner gets a ClawOps dashboard login scoped to their tenants.
- Agency owners can create/edit tenant configs, provision demo numbers, view call logs.
- ClawOps maps agency_owner -> tenants -> configs -> phone_numbers.
- Vapi never knows about agencies; it just sees assistants and phone numbers.

Data model:
```
agencies table:
  id, owner_name, owner_email, plan_tier, created_at

tenants table:
  id, agency_id (FK), restaurant_name, slug

tenant_configs table:
  tenant_id (FK), config_json (JSONB), active

phone_numbers table:
  tenant_id (FK), vapi_phone_number_id, number, status
```

### Insight: GoHighLevel Sub-Account Pattern is the Model

**Source:** r/GoHighLevel community discussions on white-label AI voice. GHL's sub-account architecture is the dominant pattern in the agency space: one SaaS instance, each agency client gets an isolated sub-account with their own branding, automations, and contacts. Agency owners manage their own sub-accounts.

**Architecture Recommendation for ClawOps:**
Mirror GHL's sub-account UX. Each agency owner sees only their restaurants. They can: add a new restaurant client (creates tenant + config from template), customize the voice agent's persona, set business hours, configure booking integration, and view call analytics. The agency owner never touches Vapi directly. ClawOps is the control plane.

---

## 5. Webhook Reliability for Real-Time Booking During Calls

### Insight: Vapi Tool-Call Webhooks Must Respond Fast

**Source:** Vapi docs (server-url/events). When Vapi triggers a `tool-calls` webhook (e.g., the AI agent decides to book a table), your server receives a POST with the function name and parameters. You must respond with the result. There is no documented timeout for tool-call responses, but the `assistant-request` webhook has a hard 7.5-second limit. Tool calls should target sub-3-second response times to avoid awkward silence on the call.

**Architecture Recommendation for ClawOps:**
Design the booking webhook handler with these reliability patterns:

1. **Optimistic response with async confirmation:** When the AI triggers `book_table`, immediately check availability via a cached slot index (refreshed every 60s from SevenRooms/OpenTable). If a slot looks available, respond to Vapi with "I've reserved that for you, you'll get a confirmation text shortly." Then fire the actual booking API call asynchronously. If the real booking fails, send an SMS to the guest with alternatives.

2. **Circuit breaker on booking APIs:** If SevenRooms/OpenTable is down, flip to manual mode automatically. The AI says "I've noted your reservation request and the restaurant will confirm within 10 minutes." Push the details to the restaurant's fallback channel.

3. **Idempotency keys:** Every booking attempt gets a UUID. If the webhook fires twice (Vapi retry or network hiccup), the booking service deduplicates using the `toolCall.id` from Vapi's payload.

4. **Timeout budget:** Allocate 2s max for the booking API call within the webhook handler. If it doesn't return in 2s, fall back to the async confirmation pattern.

### Insight: Webhook Retry and Dead Letter Queues

**Source:** r/devops discussions on webhook reliability patterns. Consensus: implement exponential backoff with jitter (100ms, 200ms, 400ms, 800ms, capped at 5s) for outbound webhooks to booking APIs. Use a dead letter queue (Redis or SQS) for failed booking attempts that need human review.

**Architecture Recommendation for ClawOps:**
Use a job queue (BullMQ on Redis or AWS SQS) for all booking API calls. The webhook handler enqueues the booking job and returns an optimistic response to Vapi. The job worker handles retries with exponential backoff. Failed jobs after 3 attempts go to a dead letter queue that triggers a Slack/email alert to the ClawOps ops team.

---

## 6. Cost-Per-Call Benchmarks from Production Deployments

### Vapi Pricing (Current as of 2026)

**Source:** Vapi pricing page and docs. Vapi charges per-minute with a component-based model:
- **Vapi platform fee:** ~$0.05/min
- **STT (Deepgram):** ~$0.01/min
- **LLM (GPT-4o):** ~$0.03-0.05/min (depends on token usage)
- **TTS (ElevenLabs):** ~$0.03-0.05/min (depends on provider/voice)
- **Telephony (Twilio):** ~$0.01-0.02/min

**Estimated all-in cost:** $0.13-0.18/min per call.

For a typical restaurant call (2-3 minutes for a reservation): **$0.26-0.54 per call.**

### Retell.ai Pricing

**Source:** Retell.ai website. Retell charges an all-inclusive per-minute rate:
- **Pay-as-you-go:** ~$0.07-0.15/min (varies by plan and model choice)
- **Enterprise:** custom pricing with volume discounts

For a typical 2.5-minute call: **$0.18-0.38 per call.**

### Bland.ai Pricing

**Source:** Bland.ai website. Bland charges:
- **Connected call rate:** ~$0.07-0.09/min (includes STT, LLM, TTS, telephony)
- Enterprise tiers with lower rates at volume

For a typical 2.5-minute call: **$0.18-0.23 per call.**

### r/AiBuilders Real-World Report

**Source:** r/AiBuilders thread "Am I dumb to build Voice AI agent solution?" (2025). Developer building restaurant voice AI with ElevenLabs + Twilio reported "the price from Twilio is bleeding my pockets." Switched to evaluating Vapi/Retell/VoiceFlow. Community consensus: self-hosting STT/TTS models (e.g., local Whisper + a TTS model) dramatically cuts costs but adds infra complexity. Managed platforms (Vapi, Retell, Bland) are 3-5x more expensive but ship faster.

**Architecture Recommendation for ClawOps:**

**Phase 1 (Now):** Use Vapi as the voice AI backbone. All-in cost of ~$0.15/min is acceptable at agency pricing of $300-500/month per restaurant client. A restaurant receiving 200 calls/month at 2.5 min average = 500 minutes = ~$75/month in Vapi costs. Healthy margin.

**Phase 2 (Scale, 50+ clients):** Evaluate Retell or Bland for lower per-minute rates. Or negotiate Vapi enterprise pricing. The `BookingAdapter` and `assistant-request` patterns are provider-agnostic, so switching voice platforms requires changing the transport layer, not the business logic.

**Phase 3 (100+ clients):** Consider self-hosting the STT/TTS stack (Whisper + an open TTS model) behind your own telephony (Twilio SIP trunks). This drops per-minute costs to ~$0.03-0.05 but requires significant DevOps investment. Only pursue this if cost pressure demands it.

### Pricing Model for Agency Clients

| Tier | Monthly Fee | Included Minutes | Overage Rate | Estimated COGS |
|------|------------|-----------------|--------------|----------------|
| Starter | $297/mo | 300 min | $0.30/min | ~$45 |
| Growth | $497/mo | 700 min | $0.25/min | ~$105 |
| Enterprise | $997/mo | 2000 min | $0.20/min | ~$300 |

Margins: 65-85% gross margin at these tiers, assuming Vapi at ~$0.15/min.

---

## 7. Key Architecture Decisions Summary

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Voice AI Platform | Vapi (Phase 1) | API-first, `assistant-request` webhook enables true multi-tenancy, Squads for complex flows |
| Database | Postgres with RLS | Shared DB, row-level security per tenant, JSONB configs |
| Multi-tenancy | Config-driven, single codebase | Feature flags + JSON tenant configs, no code forks |
| Booking Integration | Adapter pattern with manual fallback | SevenRooms/OpenTable via API, Resy via manual, universal fallback |
| White-label | ClawOps owns the control plane | Agency owners get scoped dashboards, Vapi is invisible |
| Webhook Reliability | Optimistic response + async job queue | BullMQ/SQS for retries, circuit breaker for booking API failures |
| Demo Provisioning | Template-based + API-provisioned phone numbers | 5-minute setup from form to working demo call |
| Cost Management | Vapi at ~$0.15/min, $297-997/mo client tiers | 65-85% gross margins, switch providers at scale |

---

## 8. Vapi-Specific Technical Notes

### Dynamic Assistant Routing (Critical Pattern)
When a call comes in on a Vapi phone number without a hardcoded assistant, Vapi POSTs to your server URL with `type: "assistant-request"`. Your server has 7.5 seconds to respond with:
- `{ "assistantId": "existing-id" }` for a saved assistant
- `{ "assistant": { ... } }` for a fully transient assistant definition
- `{ "destination": { "type": "number", "number": "+1..." } }` to skip AI and transfer immediately

This is how ClawOps serves hundreds of restaurants from one Vapi account. The called phone number maps to a tenant, the tenant config becomes the transient assistant.

### Squads for Complex Restaurant Flows
Vapi Squads let you chain specialized assistants. Example: a greeting assistant qualifies whether the caller wants reservations, takeout, or general info, then hands off to a booking specialist or an FAQ specialist. Each assistant has focused prompts and tools, reducing hallucination and latency.

### Live Call Control
Vapi provides a `controlUrl` per call that accepts POST requests during the call. You can inject messages ("Your table is confirmed!"), transfer the call, or end it. This is useful for the async booking confirmation pattern: after the booking API responds, push a confirmation message into the live call via the control URL.

### Tool Calls for Booking
Define a `book_table` function in the assistant config. When the AI decides to book, Vapi POSTs to your server URL with `type: "tool-calls"` containing the function name and extracted parameters (date, time, party_size, guest_name). Your server executes the booking and responds with the result.

---

*End of architect study. All recommendations target the ClawOps multi-tenant restaurant voice AI platform.*
