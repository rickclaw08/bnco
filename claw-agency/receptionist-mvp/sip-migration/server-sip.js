/**
 * ClawOps AI Receptionist - SIP Connector Architecture
 *
 * This server is a thin webhook handler for OpenAI's native SIP Connector.
 * Instead of proxying audio through Twilio Media Streams, calls route directly
 * from Twilio SIP Trunk -> OpenAI SIP endpoint. Our server only:
 *
 *   1. Receives `realtime.call.incoming` webhooks from OpenAI
 *   2. Looks up tenant config by the incoming phone number
 *   3. Accepts the call via OpenAI REST API with tenant-specific config
 *   4. Opens a monitoring WebSocket for logging, tool calls, and analytics
 *
 * No audio ever flows through this server. Latency drops, infra simplifies.
 */

'use strict';

require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_WEBHOOK_SECRET = process.env.OPENAI_WEBHOOK_SECRET || '';
const OPENAI_MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime';
const OPENAI_VOICE = process.env.OPENAI_VOICE || 'coral';
const LOG_DIR = path.join(__dirname, 'logs');

if (!OPENAI_API_KEY) {
  console.error('FATAL: OPENAI_API_KEY is not set. Exiting.');
  process.exit(1);
}

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Tenant Manager (reuse from parent project)
// When running locally from sip-migration/ dir: ../lib/tenant-manager
// When running in Docker (copied to /app/): ./lib/tenant-manager
// ---------------------------------------------------------------------------
let tenantManagerPath;
try {
  tenantManagerPath = require.resolve('../lib/tenant-manager');
} catch {
  tenantManagerPath = require.resolve('./lib/tenant-manager');
}
const { getTenantConfig, listTenants } = require(tenantManagerPath);

// Phone number -> tenant ID mapping
// In production this would be a database lookup. For MVP, we map from config.
const phoneToTenant = new Map();

function buildPhoneMap() {
  phoneToTenant.clear();
  const tenants = listTenants();
  for (const tenantId of tenants) {
    const config = getTenantConfig(tenantId);
    if (config && config.phone) {
      // Normalize: strip everything except digits and leading +
      const normalized = config.phone.replace(/[^+\d]/g, '');
      phoneToTenant.set(normalized, tenantId);
      console.log(`  Phone ${normalized} -> tenant "${tenantId}"`);
    }
  }
  console.log(`[phone-map] Mapped ${phoneToTenant.size} phone number(s)`);
}

buildPhoneMap();

// ---------------------------------------------------------------------------
// System prompt builder (shared with original server)
// ---------------------------------------------------------------------------
function buildSystemPrompt(config) {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()];
  const hours = config.businessHours[today];
  const isOpen = hours !== null;

  const servicesBlock = config.services
    .map(s => `- ${s.name}: ${s.description} (${s.priceRange})`)
    .join('\n');

  const faqBlock = config.faqs
    .map(f => `Q: ${f.question}\nA: ${f.answer}`)
    .join('\n\n');

  const emergencyTriggers = config.emergencyRules.triggers.join(', ');

  return `You are ${config.aiName}, a friendly and professional virtual receptionist for ${config.businessName}.

## Your Role
You answer phone calls for ${config.businessName}. Help callers with questions, schedule service, capture their information, and handle emergencies.

## Personality
- ${config.personality.tone}
- ${config.personality.style}

## Current Status
- Today is ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
- The business is currently ${isOpen ? 'OPEN' : 'CLOSED'}${isOpen ? ` (hours: ${hours.open} - ${hours.close})` : ''}

## Greeting
When you first answer, say: "${config.greeting}"
Then say: "${config.recordingDisclosure}"

## Business Information
- Name: ${config.businessName}
- Phone: ${config.phone}
- Address: ${config.address}

## Business Hours
- Monday-Friday: ${config.businessHours.monday?.open || 'Closed'} - ${config.businessHours.monday?.close || ''}
- Saturday: ${config.businessHours.saturday?.open || 'Closed'} - ${config.businessHours.saturday?.close || ''}
- Sunday: ${config.businessHours.sunday ? config.businessHours.sunday.open + ' - ' + config.businessHours.sunday.close : 'Closed'}

## Services Offered
${servicesBlock}

## Frequently Asked Questions
${faqBlock}

## Emergency Handling
If the caller mentions ANY of these situations, treat it as an EMERGENCY: ${emergencyTriggers}
Emergency procedure: ${config.emergencyRules.instructions}
Emergency dispatch number: ${config.emergencyRules.dispatchNumber}

## Call Handling Rules
1. Greet the caller warmly and identify yourself.
2. State the recording disclosure after your greeting.
3. Determine the caller's need.
4. For service requests: collect name, phone number, address, and description of the issue.
5. For scheduling: offer available time slots and book the appointment.
6. For pricing: share known pricing. For unlisted items, say "We provide free estimates" and offer to schedule one.
7. For emergencies: express empathy, collect name and address, tell them you will connect them with emergency dispatch.
8. If you cannot help, take a detailed message and assure the caller someone will call back within 1 hour.
9. Before ending, confirm you have the caller's phone number.
10. End every call with: "${config.personality.signOff}"

## IMPORTANT RULES
- NEVER invent pricing for services not listed above
- NEVER give medical, legal, or safety advice
- Keep responses to 2-3 sentences max - be conversational, not robotic
- If the caller is upset, acknowledge their frustration before problem-solving
- ${config.callbackPolicy}`;
}

// ---------------------------------------------------------------------------
// Tool definitions (same as original server)
// ---------------------------------------------------------------------------
function buildTools() {
  return [
    {
      type: 'function',
      name: 'capture_caller_info',
      description: 'Save the caller\'s contact information and what they need. Call this whenever you have collected enough info about the caller.',
      parameters: {
        type: 'object',
        properties: {
          caller_name: { type: 'string', description: 'Caller\'s full name' },
          phone_number: { type: 'string', description: 'Caller\'s phone number' },
          email: { type: 'string', description: 'Caller\'s email (if provided)' },
          service_needed: { type: 'string', description: 'What service the caller needs' },
          urgency: {
            type: 'string',
            enum: ['emergency', 'urgent', 'routine', 'inquiry'],
            description: 'How urgent the request is'
          },
          address: { type: 'string', description: 'Caller\'s service address' },
          notes: { type: 'string', description: 'Any additional details' }
        },
        required: ['caller_name', 'service_needed', 'urgency']
      }
    },
    {
      type: 'function',
      name: 'schedule_callback',
      description: 'Schedule a callback for the caller when they want to be called back.',
      parameters: {
        type: 'object',
        properties: {
          caller_name: { type: 'string', description: 'Caller\'s name' },
          phone_number: { type: 'string', description: 'Number to call back' },
          preferred_time: { type: 'string', description: 'When they prefer the callback' },
          reason: { type: 'string', description: 'What the callback is about' }
        },
        required: ['caller_name', 'phone_number', 'reason']
      }
    },
    {
      type: 'function',
      name: 'flag_emergency',
      description: 'Flag this call as an emergency.',
      parameters: {
        type: 'object',
        properties: {
          caller_name: { type: 'string', description: 'Caller\'s name' },
          phone_number: { type: 'string', description: 'Caller\'s phone number' },
          address: { type: 'string', description: 'Service address' },
          emergency_type: { type: 'string', description: 'Type of emergency' },
          details: { type: 'string', description: 'Description of the emergency' }
        },
        required: ['emergency_type', 'details']
      }
    }
  ];
}

// ---------------------------------------------------------------------------
// Webhook signature verification
// ---------------------------------------------------------------------------
function verifyWebhookSignature(rawBody, headers) {
  if (!OPENAI_WEBHOOK_SECRET) {
    // If no secret configured, skip verification (dev mode)
    console.warn('[webhook] No OPENAI_WEBHOOK_SECRET set - skipping signature verification');
    return true;
  }

  const signature = headers['openai-signature'] || headers['x-openai-signature'];
  const timestamp = headers['openai-timestamp'] || headers['x-openai-timestamp'];

  if (!signature || !timestamp) {
    console.error('[webhook] Missing signature or timestamp headers');
    return false;
  }

  // Prevent replay attacks - reject if timestamp is older than 5 minutes
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (age > 300) {
    console.error(`[webhook] Timestamp too old: ${age}s`);
    return false;
  }

  const payload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', OPENAI_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  const sig = signature.replace(/^v1=/, '');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// ---------------------------------------------------------------------------
// Accept a call via OpenAI REST API
// ---------------------------------------------------------------------------
async function acceptCall(callId, tenantConfig) {
  const instructions = buildSystemPrompt(tenantConfig);
  const voice = tenantConfig.recommendedVoice || OPENAI_VOICE;

  const body = {
    type: 'realtime',
    model: OPENAI_MODEL,
    instructions: instructions,
    voice: voice,
    input_audio_transcription: {
      model: 'whisper-1'
    },
    turn_detection: {
      type: 'semantic_vad'
    },
    tools: buildTools(),
    tool_choice: 'auto',
    temperature: 0.7,
    // Cost optimization: aggressive truncation
    truncation: {
      type: 'retention_ratio',
      retention_ratio: 0.8,
      token_limits: {
        post_instructions: 8000
      }
    }
  };

  const response = await fetch(
    `https://api.openai.com/v1/realtime/calls/${callId}/accept`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to accept call ${callId}: ${response.status} ${errText}`);
  }

  const result = await response.json();
  console.log(`[call] Accepted call ${callId} for "${tenantConfig.businessName}" (voice: ${voice})`);
  return result;
}

// ---------------------------------------------------------------------------
// Monitoring WebSocket - connect to active call for logging + tool execution
// ---------------------------------------------------------------------------
const activeCalls = new Map(); // callId -> { ws, tenant, transcript, startTime }

function connectMonitoringWebSocket(callId, tenantConfig) {
  const url = `wss://api.openai.com/v1/realtime?call_id=${callId}`;
  const ws = new WebSocket(url, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1'
    }
  });

  const callSession = {
    ws,
    tenantId: null,
    tenantName: tenantConfig.businessName,
    transcript: [],
    startTime: new Date(),
    callId
  };

  activeCalls.set(callId, callSession);

  ws.on('open', () => {
    console.log(`[monitor] WebSocket connected for call ${callId}`);
  });

  ws.on('message', (data) => {
    let event;
    try {
      event = JSON.parse(data.toString());
    } catch (e) {
      console.error(`[monitor] Invalid JSON from OpenAI: ${e.message}`);
      return;
    }
    handleMonitorEvent(event, callSession);
  });

  ws.on('close', (code, reason) => {
    console.log(`[monitor] WebSocket closed for call ${callId}: ${code} ${reason}`);
    finalizeCall(callSession);
  });

  ws.on('error', (err) => {
    console.error(`[monitor] WebSocket error for call ${callId}: ${err.message}`);
  });

  return callSession;
}

// ---------------------------------------------------------------------------
// Handle events from the monitoring WebSocket
// ---------------------------------------------------------------------------
function handleMonitorEvent(event, callSession) {
  switch (event.type) {
    case 'session.created':
      console.log(`[monitor] Session created: ${event.session?.id}`);
      break;

    case 'response.audio_transcript.done':
      if (event.transcript) {
        console.log(`[${callSession.callId}] AI: ${event.transcript}`);
        callSession.transcript.push({
          role: 'assistant',
          text: event.transcript,
          timestamp: new Date().toISOString()
        });
      }
      break;

    case 'conversation.item.input_audio_transcription.completed':
      if (event.transcript) {
        console.log(`[${callSession.callId}] Caller: ${event.transcript}`);
        callSession.transcript.push({
          role: 'caller',
          text: event.transcript,
          timestamp: new Date().toISOString()
        });
      }
      break;

    case 'response.function_call_arguments.done':
      handleToolCall(event, callSession);
      break;

    case 'response.done':
      // Track usage for cost analytics
      if (event.response?.usage) {
        const usage = event.response.usage;
        console.log(`[${callSession.callId}] Usage - input: ${usage.input_tokens || 0}, output: ${usage.output_tokens || 0}, cached: ${usage.input_tokens_details?.cached_tokens || 0}`);
      }
      break;

    case 'error':
      console.error(`[${callSession.callId}] OpenAI error:`, JSON.stringify(event.error, null, 2));
      break;

    case 'realtime.call.completed':
      console.log(`[${callSession.callId}] Call completed`);
      break;

    default:
      // rate_limits.updated, session.updated, input_audio_buffer.*, etc.
      break;
  }
}

// ---------------------------------------------------------------------------
// Tool call handler (executes via monitoring WebSocket)
// ---------------------------------------------------------------------------
function handleToolCall(event, callSession) {
  const { name, call_id, arguments: argsStr } = event;

  let args;
  try {
    args = JSON.parse(argsStr);
  } catch (e) {
    console.error(`[tools] Failed to parse args for ${name}: ${e.message}`);
    sendToolResult(callSession, call_id, { success: false, error: 'Invalid arguments' });
    return;
  }

  console.log(`[tools] ${callSession.callId} -> ${name}:`, JSON.stringify(args));

  switch (name) {
    case 'capture_caller_info': {
      const lead = {
        ...args,
        callId: callSession.callId,
        tenant: callSession.tenantName,
        capturedAt: new Date().toISOString()
      };
      const leadFile = path.join(LOG_DIR, 'leads.jsonl');
      fs.appendFileSync(leadFile, JSON.stringify(lead) + '\n');
      console.log(`[tools] Lead captured: ${lead.caller_name} - ${lead.service_needed}`);

      sendToolResult(callSession, call_id, {
        success: true,
        message: `Contact information for ${args.caller_name} has been saved. Their request for ${args.service_needed} has been logged.`
      });
      break;
    }

    case 'schedule_callback': {
      const callback = {
        ...args,
        callId: callSession.callId,
        tenant: callSession.tenantName,
        scheduledAt: new Date().toISOString()
      };
      const cbFile = path.join(LOG_DIR, 'callbacks.jsonl');
      fs.appendFileSync(cbFile, JSON.stringify(callback) + '\n');
      console.log(`[tools] Callback scheduled for: ${callback.caller_name}`);

      sendToolResult(callSession, call_id, {
        success: true,
        message: `Callback scheduled for ${args.caller_name} at ${args.phone_number}. Preferred time: ${args.preferred_time || 'as soon as possible'}.`
      });
      break;
    }

    case 'flag_emergency': {
      const emergency = {
        ...args,
        callId: callSession.callId,
        tenant: callSession.tenantName,
        flaggedAt: new Date().toISOString()
      };
      const emFile = path.join(LOG_DIR, 'emergencies.jsonl');
      fs.appendFileSync(emFile, JSON.stringify(emergency) + '\n');
      console.log(`[tools] EMERGENCY flagged: ${emergency.emergency_type}`);

      // TODO: In production, trigger SMS/call to dispatch number
      sendToolResult(callSession, call_id, {
        success: true,
        message: `Emergency has been flagged. The dispatch team has been notified. Tell the caller that help is on the way.`
      });
      break;
    }

    default:
      console.warn(`[tools] Unknown tool: ${name}`);
      sendToolResult(callSession, call_id, { success: false, error: `Unknown tool: ${name}` });
  }
}

function sendToolResult(callSession, callId, result) {
  const ws = callSession.ws;
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    type: 'conversation.item.create',
    item: {
      type: 'function_call_output',
      call_id: callId,
      output: JSON.stringify(result)
    }
  }));

  ws.send(JSON.stringify({ type: 'response.create' }));
}

// ---------------------------------------------------------------------------
// Finalize call: save transcript, clean up
// ---------------------------------------------------------------------------
function finalizeCall(callSession) {
  if (callSession.transcript.length > 0) {
    const callLog = {
      callId: callSession.callId,
      tenant: callSession.tenantName,
      startTime: callSession.startTime.toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: Math.round((Date.now() - callSession.startTime.getTime()) / 1000),
      transcript: callSession.transcript
    };

    const logFile = path.join(LOG_DIR, `call-${callSession.callId || Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(callLog, null, 2));
    console.log(`[log] Transcript saved: ${logFile}`);

    // Append to daily summary
    const today = new Date().toISOString().split('T')[0];
    const dailyLog = path.join(LOG_DIR, `daily-${today}.jsonl`);
    fs.appendFileSync(dailyLog, JSON.stringify({
      callId: callSession.callId,
      tenant: callSession.tenantName,
      duration: callLog.durationSeconds,
      turns: callSession.transcript.length,
      time: callLog.endTime
    }) + '\n');
  }

  activeCalls.delete(callSession.callId);
  console.log(`[call] Session ended: ${callSession.callId}`);
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

// Raw body needed for webhook signature verification
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    architecture: 'sip-connector',
    activeCalls: activeCalls.size,
    tenants: listTenants(),
    uptime: process.uptime()
  });
});

// ---------------------------------------------------------------------------
// OpenAI Webhook endpoint - receives realtime.call.incoming events
// ---------------------------------------------------------------------------
app.post('/webhook', async (req, res) => {
  const rawBody = req.body.toString('utf8');

  // Verify webhook signature
  if (!verifyWebhookSignature(rawBody, req.headers)) {
    console.error('[webhook] Signature verification failed');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    console.error('[webhook] Invalid JSON:', e.message);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  console.log(`\n========== WEBHOOK EVENT ==========`);
  console.log(`Type: ${event.type}`);
  console.log(`Time: ${new Date().toISOString()}`);

  if (event.type === 'realtime.call.incoming') {
    const callId = event.data?.call_id;
    const toNumber = event.data?.to;   // The Twilio number that was called
    const fromNumber = event.data?.from; // Caller's number

    console.log(`Call ID: ${callId}`);
    console.log(`From: ${fromNumber}`);
    console.log(`To: ${toNumber}`);
    console.log(`===================================\n`);

    // Look up tenant by the called number
    const normalizedTo = (toNumber || '').replace(/[^+\d]/g, '');
    let tenantId = null;
    let tenantConfig = null;

    // Try direct phone number match
    for (const [phone, tid] of phoneToTenant) {
      if (normalizedTo.endsWith(phone.replace(/^\+/, '')) || phone.endsWith(normalizedTo.replace(/^\+/, ''))) {
        tenantId = tid;
        break;
      }
    }

    tenantConfig = tenantId ? getTenantConfig(tenantId) : getTenantConfig('default');

    if (!tenantConfig) {
      console.error(`[webhook] No tenant config found for number ${toNumber}, rejecting call`);
      // Could call reject endpoint here - for now just 200 with no accept
      return res.status(200).json({ status: 'rejected', reason: 'no tenant config' });
    }

    console.log(`[webhook] Matched tenant: ${tenantConfig.businessName} (${tenantId || 'default'})`);

    try {
      // Accept the call with tenant-specific configuration
      await acceptCall(callId, tenantConfig);

      // Open monitoring WebSocket for tool calls, transcription, analytics
      connectMonitoringWebSocket(callId, tenantConfig);

      res.status(200).json({ status: 'accepted', callId });
    } catch (err) {
      console.error(`[webhook] Failed to accept call: ${err.message}`);
      res.status(500).json({ error: 'Failed to accept call', detail: err.message });
    }
  } else {
    console.log(`[webhook] Unhandled event type: ${event.type}`);
    console.log(`===================================\n`);
    res.status(200).json({ status: 'ignored' });
  }
});

// ---------------------------------------------------------------------------
// Active calls dashboard (simple JSON endpoint)
// ---------------------------------------------------------------------------
app.get('/calls', (req, res) => {
  const calls = [];
  for (const [callId, session] of activeCalls) {
    calls.push({
      callId,
      tenant: session.tenantName,
      startTime: session.startTime.toISOString(),
      durationSeconds: Math.round((Date.now() - session.startTime.getTime()) / 1000),
      turns: session.transcript.length,
      wsState: session.ws ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][session.ws.readyState] : 'NONE'
    });
  }
  res.json({ activeCalls: calls.length, calls });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`\n================================================`);
  console.log(`  ClawOps AI Receptionist - SIP Connector`);
  console.log(`  Architecture: OpenAI SIP Direct (no audio proxy)`);
  console.log(`  Model:    ${OPENAI_MODEL}`);
  console.log(`  Voice:    ${OPENAI_VOICE}`);
  console.log(`  Port:     ${PORT}`);
  console.log(`  Tenants:  ${listTenants().join(', ')}`);
  console.log(`================================================`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health    - Health check`);
  console.log(`  POST /webhook   - OpenAI incoming call webhook`);
  console.log(`  GET  /calls     - Active calls dashboard`);
  console.log(`\nWaiting for calls via SIP...\n`);
});

// Graceful shutdown
function shutdown() {
  console.log('\nShutting down...');
  for (const [callId, session] of activeCalls) {
    if (session.ws) {
      try { session.ws.close(); } catch (e) {}
    }
    finalizeCall(session);
  }
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
