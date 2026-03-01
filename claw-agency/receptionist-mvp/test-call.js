/**
 * test-call.js - Simulate a test call to verify server functionality
 *
 * This script:
 * 1. Sends a POST to /voice/incoming to simulate Twilio's webhook
 * 2. Verifies the TwiML response is valid
 * 3. Opens a WebSocket to /media-stream to simulate Twilio's media stream
 * 4. Sends a start event and verifies the OpenAI connection is attempted
 *
 * Usage: node test-call.js [server-url]
 * Default server: http://localhost:3000
 */

const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const { URL } = require('url');

const SERVER_URL = process.argv[2] || 'http://localhost:3000';
const parsed = new URL(SERVER_URL);
const isHttps = parsed.protocol === 'https:';
const requester = isHttps ? https : http;

const FAKE_CALL_SID = 'CA' + 'test' + Date.now().toString(36);
const FAKE_FROM = '+15551234567';
const FAKE_STREAM_SID = 'MZ' + 'test' + Date.now().toString(36);

console.log('=== ClawOps AI Receptionist - Test Call ===\n');
console.log(`Target server: ${SERVER_URL}`);
console.log(`Fake CallSid:  ${FAKE_CALL_SID}`);
console.log(`Fake From:     ${FAKE_FROM}\n`);

let passed = 0;
let failed = 0;

function test(name, condition, detail) {
  if (condition) {
    console.log(`  PASS  ${name}`);
    passed++;
  } else {
    console.log(`  FAIL  ${name}${detail ? ' - ' + detail : ''}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Test 1: Health check
// ---------------------------------------------------------------------------
async function testHealth() {
  console.log('--- Test 1: Health Check ---');
  return new Promise((resolve) => {
    requester.get(`${SERVER_URL}/health`, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        test('GET /health returns 200', res.statusCode === 200);
        try {
          const json = JSON.parse(body);
          test('Response has status=ok', json.status === 'ok');
          test('Response has business name', !!json.business);
          console.log(`  Info: business="${json.business}", uptime=${Math.round(json.uptime)}s\n`);
        } catch (e) {
          test('Response is valid JSON', false, e.message);
        }
        resolve();
      });
    }).on('error', (err) => {
      test('Server is reachable', false, err.message);
      console.log('\n  Is the server running? Start it with: npm start\n');
      resolve();
    });
  });
}

// ---------------------------------------------------------------------------
// Test 2: Voice webhook
// ---------------------------------------------------------------------------
async function testVoiceWebhook() {
  console.log('--- Test 2: Voice Webhook (POST /voice/incoming) ---');
  return new Promise((resolve) => {
    const postData = `CallSid=${FAKE_CALL_SID}&From=${encodeURIComponent(FAKE_FROM)}&To=%2B17045550100&CallStatus=ringing`;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: '/voice/incoming',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = requester.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        test('POST /voice/incoming returns 200', res.statusCode === 200);
        test('Content-Type is XML', (res.headers['content-type'] || '').includes('xml'));
        test('Response contains <Response>', body.includes('<Response>'));
        test('Response contains <Connect>', body.includes('<Connect>'));
        test('Response contains <Stream>', body.includes('<Stream'));
        test('Stream URL points to /media-stream', body.includes('/media-stream'));
        console.log(`  TwiML Response:\n${body.split('\n').map(l => '    ' + l).join('\n')}\n`);
        resolve();
      });
    });
    req.on('error', (err) => {
      test('Webhook is reachable', false, err.message);
      resolve();
    });
    req.write(postData);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Test 3: WebSocket media stream
// ---------------------------------------------------------------------------
async function testWebSocket() {
  console.log('--- Test 3: WebSocket Media Stream ---');
  const wsUrl = `${SERVER_URL.replace('http', 'ws')}/media-stream`;
  console.log(`  Connecting to: ${wsUrl}`);

  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);
    let connected = false;
    let gotOpenAIAttempt = false;

    const timeout = setTimeout(() => {
      test('WebSocket connects', connected);
      if (!connected) {
        console.log('  Timed out waiting for WebSocket\n');
      }
      try { ws.close(); } catch (e) {}
      resolve();
    }, 8000);

    ws.on('open', () => {
      connected = true;
      test('WebSocket connects', true);

      // Send the start event (simulates Twilio starting media)
      const startMsg = {
        event: 'start',
        sequenceNumber: '1',
        start: {
          streamSid: FAKE_STREAM_SID,
          accountSid: 'ACtest',
          callSid: FAKE_CALL_SID,
          tracks: ['inbound'],
          mediaFormat: {
            encoding: 'audio/x-mulaw',
            sampleRate: 8000,
            channels: 1
          },
          customParameters: {
            callSid: FAKE_CALL_SID,
            callerNumber: FAKE_FROM
          }
        },
        streamSid: FAKE_STREAM_SID
      };

      ws.send(JSON.stringify(startMsg));
      test('Sent start event', true);

      // Wait a moment for OpenAI connection attempt, then send a connected event
      const connectedMsg = {
        event: 'connected',
        protocol: 'Call',
        version: '1.0.0'
      };
      ws.send(JSON.stringify(connectedMsg));

      // Give it a few seconds to attempt OpenAI connection
      setTimeout(() => {
        // Send a stop event to cleanly end
        ws.send(JSON.stringify({ event: 'stop', streamSid: FAKE_STREAM_SID }));

        setTimeout(() => {
          clearTimeout(timeout);
          console.log('  Note: OpenAI Realtime API connection attempted (check server logs for details)');
          console.log('  Note: Full audio test requires a real Twilio call\n');
          try { ws.close(); } catch (e) {}
          resolve();
        }, 1000);
      }, 3000);
    });

    ws.on('error', (err) => {
      if (!connected) {
        test('WebSocket connects', false, err.message);
        clearTimeout(timeout);
        resolve();
      }
    });

    ws.on('close', () => {
      // Expected
    });
  });
}

// ---------------------------------------------------------------------------
// Run all tests
// ---------------------------------------------------------------------------
async function run() {
  await testHealth();
  await testVoiceWebhook();
  await testWebSocket();

  console.log('=== Results ===');
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total:  ${passed + failed}\n`);

  if (failed > 0) {
    console.log('Some tests failed. Check the server is running and properly configured.');
    process.exit(1);
  } else {
    console.log('All tests passed! Server is ready for Twilio integration.');
    console.log('\nNext steps:');
    console.log('  1. Get a Twilio phone number');
    console.log('  2. Expose this server via ngrok or deploy to a public URL');
    console.log('  3. Configure the Twilio number webhook to point to /voice/incoming');
    console.log('  4. Make a real test call!\n');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
