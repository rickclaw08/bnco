require('dotenv').config();

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2025-06-03';
// Voice: env var takes priority, then config's recommendedVoice, then default 'coral'
let OPENAI_VOICE = process.env.OPENAI_VOICE || null; // resolved after config loads
const BUSINESS_CONFIG_PATH = process.env.BUSINESS_CONFIG_PATH || path.join(__dirname, 'config', 'default-business.json');
const LOG_DIR = path.join(__dirname, 'logs');

if (!OPENAI_API_KEY) {
  console.error('FATAL: OPENAI_API_KEY is not set. Exiting.');
  process.exit(1);
}

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

// Load business config
let businessConfig;
try {
  businessConfig = JSON.parse(fs.readFileSync(BUSINESS_CONFIG_PATH, 'utf8'));
  console.log(`Loaded business config for: ${businessConfig.businessName}`);

  // Resolve voice: env var > config's recommendedVoice > default 'coral'
  OPENAI_VOICE = OPENAI_VOICE || businessConfig.recommendedVoice || 'coral';
} catch (err) {
  console.error(`FATAL: Cannot load business config from ${BUSINESS_CONFIG_PATH}`, err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Build the system prompt from business config
// ---------------------------------------------------------------------------
function buildSystemPrompt(config) {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()];
  const hours = config.businessHours[today];
  const isOpen = hours !== null; // simplified check

  const servicesBlock = config.services
    .map(s => `- **${s.name}**: ${s.description} (${s.priceRange})`)
    .join('\n');

  const faqBlock = config.faqs
    .map(f => `Q: ${f.question}\nA: ${f.answer}`)
    .join('\n\n');

  const emergencyTriggers = config.emergencyRules.triggers.join(', ');

  return `You are ${config.aiName}, a friendly and professional virtual receptionist for ${config.businessName}.

## Your Role
You answer phone calls for ${config.businessName}. Your job is to help callers with questions, schedule service, capture their information, and handle emergencies.

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
- Service Area: ${config.faqs.find(f => f.question.includes('areas'))?.answer || 'Local area'}

## Business Hours
- Monday-Friday: ${config.businessHours.monday?.open || 'Closed'} - ${config.businessHours.monday?.close || ''}
- Saturday: ${config.businessHours.saturday?.open || 'Closed'} - ${config.businessHours.saturday?.close || ''}
- Sunday: ${config.businessHours.sunday ? config.businessHours.sunday.open + ' - ' + config.businessHours.sunday.close : 'Closed (emergency service available)'}

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
3. Determine the caller's need (repair, installation, maintenance, billing, question, other).
4. For service requests: collect their name, phone number, address, and a description of the issue.
5. For scheduling: offer available time slots and book the appointment.
6. For pricing questions: share known pricing from your services list. For anything not listed, say "We provide free estimates" and offer to schedule one.
7. For emergencies: express empathy, collect name and address, then tell them you will connect them with the emergency dispatch team.
8. If you cannot help with something, take a detailed message and assure the caller someone will return their call within 1 hour.
9. Before ending the call, confirm you have the caller's phone number.
10. End every call with: "${config.personality.signOff}"

## Important Rules
- NEVER invent pricing for services not listed above.
- NEVER give medical, legal, or safety advice beyond connecting them with the appropriate resource.
- Keep each response to 2-3 sentences maximum. Be conversational, not robotic.
- If the caller is upset, acknowledge their frustration before problem-solving.
- ${config.callbackPolicy}`;
}

const SYSTEM_PROMPT = buildSystemPrompt(businessConfig);

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    business: businessConfig.businessName,
    uptime: process.uptime()
  });
});

// Twilio webhook: incoming voice call
// Returns TwiML that starts a bidirectional media stream
app.post('/voice/incoming', (req, res) => {
  const callSid = req.body.CallSid || 'unknown';
  const from = req.body.From || 'unknown';
  console.log(`\n========== INCOMING CALL ==========`);
  console.log(`CallSid: ${callSid}`);
  console.log(`From: ${from}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`===================================\n`);

  // Build TwiML response
  // <Connect><Stream> opens a bidirectional WebSocket for audio
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${req.headers.host}/media-stream">
      <Parameter name="callSid" value="${callSid}" />
      <Parameter name="callerNumber" value="${from}" />
    </Stream>
  </Connect>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// Twilio status callback (optional, for logging)
app.post('/voice/status', (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  console.log(`Call ${CallSid}: status=${CallStatus}, duration=${CallDuration || 'n/a'}s`);
  res.sendStatus(200);
});

// ---------------------------------------------------------------------------
// HTTP + WebSocket server
// ---------------------------------------------------------------------------
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Active call sessions: streamSid -> session data
const activeSessions = new Map();

wss.on('connection', (twilioWs, req) => {
  console.log('Twilio WebSocket connected');

  let session = {
    streamSid: null,
    callSid: null,
    callerNumber: null,
    openaiWs: null,
    transcript: [],
    callStart: new Date(),
    audioBuffered: false
  };

  // -------------------------------------------------------------------------
  // Handle messages from Twilio
  // -------------------------------------------------------------------------
  twilioWs.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (e) {
      console.error('Invalid JSON from Twilio:', e.message);
      return;
    }

    switch (msg.event) {
      case 'connected':
        console.log('Twilio media stream connected');
        break;

      case 'start':
        session.streamSid = msg.start.streamSid;
        session.callSid = msg.start.callSid;

        // Extract custom parameters
        if (msg.start.customParameters) {
          session.callerNumber = msg.start.customParameters.callerNumber || null;
        }

        console.log(`Stream started: ${session.streamSid} (Call: ${session.callSid})`);
        activeSessions.set(session.streamSid, session);

        // Connect to OpenAI Realtime API
        connectToOpenAI(session, twilioWs);
        break;

      case 'media':
        // Forward audio from Twilio to OpenAI
        if (session.openaiWs && session.openaiWs.readyState === WebSocket.OPEN) {
          // Twilio sends mulaw 8kHz audio base64-encoded
          const audioAppend = {
            type: 'input_audio_buffer.append',
            audio: msg.media.payload // base64 audio
          };
          session.openaiWs.send(JSON.stringify(audioAppend));
        }
        break;

      case 'stop':
        console.log(`Stream stopped: ${session.streamSid}`);
        endSession(session);
        break;

      default:
        // mark, dtmf, etc. - ignore for now
        break;
    }
  });

  twilioWs.on('close', () => {
    console.log('Twilio WebSocket closed');
    endSession(session);
  });

  twilioWs.on('error', (err) => {
    console.error('Twilio WebSocket error:', err.message);
    endSession(session);
  });
});

// ---------------------------------------------------------------------------
// Connect to OpenAI Realtime API
// ---------------------------------------------------------------------------
function connectToOpenAI(session, twilioWs) {
  const url = `wss://api.openai.com/v1/realtime?model=${OPENAI_REALTIME_MODEL}`;

  const openaiWs = new WebSocket(url, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1'
    }
  });

  session.openaiWs = openaiWs;

  openaiWs.on('open', () => {
    console.log('Connected to OpenAI Realtime API');

    // Configure the session
    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: SYSTEM_PROMPT,
        voice: OPENAI_VOICE,
        input_audio_format: 'g711_ulaw',
        output_audio_format: 'g711_ulaw',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        },
        tools: buildTools(),
        tool_choice: 'auto',
        temperature: 0.7
      }
    };

    openaiWs.send(JSON.stringify(sessionConfig));
    console.log('Sent session config to OpenAI');
  });

  openaiWs.on('message', (data) => {
    let event;
    try {
      event = JSON.parse(data.toString());
    } catch (e) {
      console.error('Invalid JSON from OpenAI:', e.message);
      return;
    }

    handleOpenAIEvent(event, session, twilioWs);
  });

  openaiWs.on('close', (code, reason) => {
    console.log(`OpenAI WebSocket closed: ${code} ${reason}`);
    session.openaiWs = null;
  });

  openaiWs.on('error', (err) => {
    console.error('OpenAI WebSocket error:', err.message);
  });
}

// ---------------------------------------------------------------------------
// Handle events from OpenAI Realtime API
// ---------------------------------------------------------------------------
function handleOpenAIEvent(event, session, twilioWs) {
  switch (event.type) {
    case 'session.created':
      console.log('OpenAI session created:', event.session?.id);
      break;

    case 'session.updated':
      console.log('OpenAI session configured successfully');
      break;

    case 'response.audio.delta':
      // Stream audio back to Twilio
      if (twilioWs.readyState === WebSocket.OPEN && session.streamSid) {
        const audioMsg = {
          event: 'media',
          streamSid: session.streamSid,
          media: {
            payload: event.delta // base64 audio
          }
        };
        twilioWs.send(JSON.stringify(audioMsg));
      }
      break;

    case 'response.audio_transcript.delta':
      // AI is speaking - accumulate transcript
      // (delta comes in chunks, full text comes in .done)
      break;

    case 'response.audio_transcript.done':
      // Full AI response transcript
      if (event.transcript) {
        console.log(`AI: ${event.transcript}`);
        session.transcript.push({
          role: 'assistant',
          text: event.transcript,
          timestamp: new Date().toISOString()
        });
      }
      break;

    case 'conversation.item.input_audio_transcription.completed':
      // Caller's speech transcribed
      if (event.transcript) {
        console.log(`Caller: ${event.transcript}`);
        session.transcript.push({
          role: 'caller',
          text: event.transcript,
          timestamp: new Date().toISOString()
        });
      }
      break;

    case 'response.function_call_arguments.done':
      // Tool call from AI - execute it
      handleToolCall(event, session);
      break;

    case 'input_audio_buffer.speech_started':
      // Caller started speaking - interrupt AI if it's talking
      if (twilioWs.readyState === WebSocket.OPEN && session.streamSid) {
        // Clear Twilio's audio buffer to stop current playback
        twilioWs.send(JSON.stringify({
          event: 'clear',
          streamSid: session.streamSid
        }));
        // Tell OpenAI to cancel the current response
        if (session.openaiWs && session.openaiWs.readyState === WebSocket.OPEN) {
          session.openaiWs.send(JSON.stringify({ type: 'response.cancel' }));
        }
      }
      break;

    case 'error':
      console.error('OpenAI error:', JSON.stringify(event.error, null, 2));
      break;

    case 'response.done':
      // Response fully sent
      break;

    default:
      // Many events we don't need to handle: rate_limits.updated, etc.
      break;
  }
}

// ---------------------------------------------------------------------------
// Tool definitions for function calling
// ---------------------------------------------------------------------------
function buildTools() {
  return [
    {
      type: 'function',
      name: 'capture_caller_info',
      description: 'Save the caller\'s contact information and what they need. Call this whenever you have collected enough info about the caller (name, phone, what they need).',
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
          notes: { type: 'string', description: 'Any additional details about their request' }
        },
        required: ['caller_name', 'service_needed', 'urgency']
      }
    },
    {
      type: 'function',
      name: 'schedule_callback',
      description: 'Schedule a callback for the caller. Use when the caller wants to be called back by a technician or manager.',
      parameters: {
        type: 'object',
        properties: {
          caller_name: { type: 'string', description: 'Caller\'s name' },
          phone_number: { type: 'string', description: 'Number to call back' },
          preferred_time: { type: 'string', description: 'When they prefer the callback (e.g. "tomorrow morning", "this afternoon")' },
          reason: { type: 'string', description: 'What the callback is about' }
        },
        required: ['caller_name', 'phone_number', 'reason']
      }
    },
    {
      type: 'function',
      name: 'flag_emergency',
      description: 'Flag this call as an emergency. Use when the caller describes an emergency situation like no heat, no AC, gas smell, carbon monoxide, or water leak.',
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
// Handle tool calls from OpenAI
// ---------------------------------------------------------------------------
function handleToolCall(event, session) {
  const { name, call_id, arguments: argsStr } = event;

  let args;
  try {
    args = JSON.parse(argsStr);
  } catch (e) {
    console.error(`Failed to parse tool args for ${name}:`, e.message);
    sendToolResult(session, call_id, { success: false, error: 'Invalid arguments' });
    return;
  }

  console.log(`\nTool call: ${name}`);
  console.log('Args:', JSON.stringify(args, null, 2));

  switch (name) {
    case 'capture_caller_info': {
      // Log lead info
      const lead = {
        ...args,
        callSid: session.callSid,
        capturedAt: new Date().toISOString()
      };

      // Write lead to log file
      const leadFile = path.join(LOG_DIR, 'leads.jsonl');
      fs.appendFileSync(leadFile, JSON.stringify(lead) + '\n');
      console.log('Lead captured:', lead.caller_name, '-', lead.service_needed);

      sendToolResult(session, call_id, {
        success: true,
        message: `Contact information for ${args.caller_name} has been saved. Their request for ${args.service_needed} has been logged.`
      });
      break;
    }

    case 'schedule_callback': {
      const callback = {
        ...args,
        callSid: session.callSid,
        scheduledAt: new Date().toISOString()
      };

      const cbFile = path.join(LOG_DIR, 'callbacks.jsonl');
      fs.appendFileSync(cbFile, JSON.stringify(callback) + '\n');
      console.log('Callback scheduled for:', callback.caller_name);

      sendToolResult(session, call_id, {
        success: true,
        message: `Callback has been scheduled for ${args.caller_name} at ${args.phone_number}. They prefer: ${args.preferred_time || 'as soon as possible'}.`
      });
      break;
    }

    case 'flag_emergency': {
      const emergency = {
        ...args,
        callSid: session.callSid,
        flaggedAt: new Date().toISOString()
      };

      const emFile = path.join(LOG_DIR, 'emergencies.jsonl');
      fs.appendFileSync(emFile, JSON.stringify(emergency) + '\n');
      console.log('EMERGENCY flagged:', emergency.emergency_type);

      // In production, this would trigger an SMS/call to the dispatch number
      sendToolResult(session, call_id, {
        success: true,
        message: `Emergency has been flagged. The dispatch team at ${businessConfig.emergencyRules.dispatchNumber} has been notified. You should tell the caller that help is on the way and someone will contact them shortly.`
      });
      break;
    }

    default:
      console.warn(`Unknown tool: ${name}`);
      sendToolResult(session, call_id, { success: false, error: `Unknown tool: ${name}` });
  }
}

// Send tool result back to OpenAI
function sendToolResult(session, callId, result) {
  if (!session.openaiWs || session.openaiWs.readyState !== WebSocket.OPEN) return;

  // Submit the tool output
  session.openaiWs.send(JSON.stringify({
    type: 'conversation.item.create',
    item: {
      type: 'function_call_output',
      call_id: callId,
      output: JSON.stringify(result)
    }
  }));

  // Trigger a new response from the AI
  session.openaiWs.send(JSON.stringify({
    type: 'response.create'
  }));
}

// ---------------------------------------------------------------------------
// End session: save transcript, close connections
// ---------------------------------------------------------------------------
function endSession(session) {
  if (!session.streamSid && !session.callSid) return;

  const sid = session.streamSid || session.callSid || 'unknown';

  // Save transcript
  if (session.transcript.length > 0) {
    const callLog = {
      callSid: session.callSid,
      streamSid: session.streamSid,
      callerNumber: session.callerNumber,
      startTime: session.callStart.toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: Math.round((Date.now() - session.callStart.getTime()) / 1000),
      transcript: session.transcript
    };

    const logFile = path.join(LOG_DIR, `call-${session.callSid || Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(callLog, null, 2));
    console.log(`Transcript saved: ${logFile}`);

    // Also append summary to daily log
    const today = new Date().toISOString().split('T')[0];
    const dailyLog = path.join(LOG_DIR, `daily-${today}.jsonl`);
    fs.appendFileSync(dailyLog, JSON.stringify({
      callSid: session.callSid,
      caller: session.callerNumber,
      duration: callLog.durationSeconds,
      turns: session.transcript.length,
      time: callLog.endTime
    }) + '\n');
  }

  // Close OpenAI connection
  if (session.openaiWs) {
    try { session.openaiWs.close(); } catch (e) {}
    session.openaiWs = null;
  }

  // Remove from active sessions
  if (session.streamSid) {
    activeSessions.delete(session.streamSid);
  }

  console.log(`Session ended: ${sid}`);
}

// ---------------------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------------------
server.listen(PORT, () => {
  console.log(`\n================================================`);
  console.log(`  ClawOps AI Receptionist MVP`);
  console.log(`  Business: ${businessConfig.businessName}`);
  console.log(`  AI Name:  ${businessConfig.aiName}`);
  console.log(`  Voice:    ${OPENAI_VOICE}`);
  console.log(`  Model:    ${OPENAI_REALTIME_MODEL}`);
  console.log(`  Port:     ${PORT}`);
  console.log(`================================================`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health          - Health check`);
  console.log(`  POST /voice/incoming  - Twilio voice webhook`);
  console.log(`  POST /voice/status    - Twilio status callback`);
  console.log(`  WSS  /media-stream    - Twilio media stream (auto)`);
  console.log(`\nWaiting for calls...\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  activeSessions.forEach((session) => endSession(session));
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  activeSessions.forEach((session) => endSession(session));
  server.close(() => process.exit(0));
});
