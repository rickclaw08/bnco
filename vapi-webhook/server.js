const http = require('http');
const https = require('https');

const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const VONAGE_FROM = process.env.VONAGE_FROM_NUMBER || '15137788336';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '+18773317786';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const GMAIL_USER = 'rickclaw08@gmail.com';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = 'Ez2ADxydpjvWsW3suYiq';
const GHL_PIPELINE_ID = 'MK59XHOAuRJU2IjgzHiq';
const GHL_WORKFLOW_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/Ez2ADxydpjvWsW3suYiq/webhook-trigger/qvy5tyjLHhTalTQGEmy5';
const PORT = process.env.PORT || 3000;

// Send SMS via Twilio (toll-free number - primary path)
async function sendSMSTwilio(to, body) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      From: TWILIO_FROM_NUMBER,
      To: to,
      Body: body
    }).toString();

    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const options = {
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let respBody = '';
      res.on('data', (chunk) => respBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(respBody);
          if (parsed.sid && !parsed.error_code) {
            resolve(parsed);
          } else {
            reject(new Error(`Twilio SMS error ${parsed.error_code}: ${parsed.message || respBody}`));
          }
        } catch (e) {
          reject(new Error(`Twilio parse error: ${respBody}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Send SMS via Vonage (fallback)
async function sendSMSVonage(to, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      from: VONAGE_FROM,
      to: to.replace('+', ''),
      text: body,
      api_key: VONAGE_API_KEY,
      api_secret: VONAGE_API_SECRET
    });

    const options = {
      hostname: 'rest.nexmo.com',
      path: '/sms/json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let respBody = '';
      res.on('data', (chunk) => respBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(respBody);
          if (parsed.messages && parsed.messages[0] && parsed.messages[0].status === '0') {
            resolve(parsed);
          } else {
            reject(new Error(`Vonage SMS error: ${respBody}`));
          }
        } catch (e) {
          reject(new Error(`Vonage parse error: ${respBody}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Unified SMS: try Twilio toll-free first, fall back to Vonage
async function sendSMS(to, body) {
  // Try Twilio (toll-free, not subject to 10DLC)
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    try {
      const result = await sendSMSTwilio(to, body);
      console.log(`SMS sent via Twilio TF: ${result.sid}`);
      return result;
    } catch (e) {
      console.log(`Twilio SMS failed: ${e.message}, trying Vonage...`);
    }
  }
  // Fall back to Vonage
  if (VONAGE_API_KEY && VONAGE_API_SECRET) {
    const result = await sendSMSVonage(to, body);
    console.log(`SMS sent via Vonage`);
    return result;
  }
  throw new Error('No SMS provider configured');
}

// Send email via Gmail SMTP
async function sendEmail(to, subject, htmlBody, textBody) {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
    });
    await transporter.sendMail({
      from: '"Jordan at ClawOps" <rickclaw08@gmail.com>',
      to,
      subject,
      text: textBody || htmlBody.replace(/<[^>]*>/g, ''),
      html: htmlBody
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (e) {
    console.error(`Email failed: ${e.message}`);
    return false;
  }
}

// Notify Brand via Telegram about every call
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '6596951046';

async function notifyBrandTelegram(callData) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('Telegram: not configured (no bot token)');
    return;
  }
  const { customer, duration, summary, transcript, recordingUrl, endedReason } = callData;
  const durMin = Math.floor(duration / 60);
  const durSec = duration % 60;
  const durStr = durMin > 0 ? `${durMin}m ${durSec}s` : `${duration}s`;
  
  // Truncate transcript for Telegram (4096 char limit)
  const shortTranscript = transcript ? transcript.substring(0, 2000) : 'No transcript';
  
  let emoji = '📞';
  if (duration > 60) emoji = '🔥';
  if (endedReason === 'customer-did-not-answer') emoji = '📵';
  if (endedReason === 'voicemail') emoji = '📬';
  
  const msg = `${emoji} *VAPI Call Report*\n\n📱 ${customer || 'Unknown'}\n⏱ ${durStr}\n📋 ${endedReason || 'unknown'}\n${recordingUrl ? `🎧 [Recording](${recordingUrl})\n` : ''}\n${summary ? `*Summary:* ${summary}\n\n` : ''}*Transcript:*\n\`\`\`\n${shortTranscript}\n\`\`\``;

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: msg,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`Telegram notification sent for ${customer}`);
          resolve();
        } else {
          console.log(`Telegram failed: ${body}`);
          reject(new Error(body));
        }
      });
    });
    req.on('error', (e) => { console.log(`Telegram error: ${e.message}`); reject(e); });
    req.write(postData);
    req.end();
  });
}

// Notify Brand via email about every call (fallback)
async function notifyBrand(callData) {
  const { customer, duration, summary, transcript, recordingUrl, endedReason } = callData;
  const subject = `Call Report: ${customer || 'Unknown'} (${duration}s)`;
  const html = `
    <h3>VAPI Call Report</h3>
    <p><strong>Customer:</strong> ${customer || 'Unknown'}</p>
    <p><strong>Duration:</strong> ${duration}s</p>
    <p><strong>End Reason:</strong> ${endedReason || 'unknown'}</p>
    <p><strong>Recording:</strong> ${recordingUrl ? `<a href="${recordingUrl}">Listen</a>` : 'Not available'}</p>
    <h4>Summary</h4>
    <p>${summary || 'No summary'}</p>
    <h4>Transcript</h4>
    <pre style="white-space:pre-wrap;font-size:13px;background:#f5f5f5;padding:12px;border-radius:4px;">${transcript || 'No transcript'}</pre>
  `;
  await sendEmail('jacksonroy152@gmail.com', subject, html);
}

// GHL API helper
function ghlRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'services.leadconnectorhq.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

    const req = https.request(options, (res) => {
      let respBody = '';
      res.on('data', (chunk) => respBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(respBody) });
        } catch (e) {
          resolve({ status: res.statusCode, data: respBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Search GHL contact by phone
async function findOrCreateGHLContact(phone, name) {
  try {
    // Search by phone
    const searchResult = await ghlRequest('POST', '/contacts/search', {
      locationId: GHL_LOCATION_ID,
      filters: [{
        field: 'phone',
        operator: 'eq',
        value: phone
      }]
    });

    if (searchResult.data?.contacts?.length > 0) {
      return searchResult.data.contacts[0];
    }

    // Create new contact if not found
    const createResult = await ghlRequest('POST', '/contacts/', {
      locationId: GHL_LOCATION_ID,
      phone,
      name: name || `VAPI Lead ${phone}`,
      tags: ['source:vapi-call'],
      source: 'VAPI Outbound'
    });

    if (createResult.data?.contact) {
      console.log(`GHL: Created contact ${createResult.data.contact.id}`);
      return createResult.data.contact;
    }
  } catch (e) {
    console.error(`GHL contact error: ${e.message}`);
  }
  return null;
}

// Add note to GHL contact
async function addGHLNote(contactId, callData) {
  try {
    const { summary, transcript, duration, recordingUrl } = callData;
    const noteBody = [
      `**VAPI Call - ${new Date().toISOString()}**`,
      `Duration: ${duration}s`,
      recordingUrl ? `Recording: ${recordingUrl}` : '',
      `\nSummary: ${summary || 'No summary'}`,
      `\nTranscript:\n${transcript || 'No transcript'}`
    ].filter(Boolean).join('\n');

    await ghlRequest('POST', `/contacts/${contactId}/notes`, {
      body: noteBody
    });
    console.log(`GHL: Note added to contact ${contactId}`);
  } catch (e) {
    console.error(`GHL note error: ${e.message}`);
  }
}

// Fire GHL workflow webhook (triggers post-call follow-up workflow)
async function fireGHLWorkflow(callData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(callData);
    const url = new URL(GHL_WORKFLOW_WEBHOOK);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, (res) => {
      let respBody = '';
      res.on('data', (chunk) => respBody += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: respBody }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Follow-up SMS text (with correct pricing)
const followUpSMS = `Thanks for chatting with Jordan from ClawOps!

AI Receptionist that answers your calls 24/7, books jobs, never misses a lead.

Founding Rate: $2,500 setup + $550/mo (limited spots)

Details: theclawops.com/founding
Questions? Call (513) 778-8336

- ClawOps Team`;

// Follow-up email HTML
function getFollowUpEmail(name) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#1a1a2e;">Hey${name ? ' ' + name : ''},</h2>
  <p>Great talking with you. Here's a quick recap:</p>
  
  <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:16px 0;">
    <h3 style="color:#4ade80;margin-top:0;">ClawOps AI Receptionist</h3>
    <ul style="line-height:1.8;">
      <li>Answers every call, 24/7. No voicemail. No missed leads.</li>
      <li>Books jobs and captures lead info automatically</li>
      <li>Handles unlimited calls at once</li>
      <li>Custom-trained on YOUR business</li>
    </ul>
  </div>
  
  <p><strong>Founding Member Rate:</strong> $2,500 setup + $550/mo<br>
  <em>(Regular price: $3,000 setup + $750/mo. Limited spots.)</em></p>
  
  <p style="margin:24px 0;">
    <a href="https://theclawops.com/founding" style="background:#4ade80;color:#1a1a2e;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">See the Details</a>
  </p>
  
  <p>Questions? Reply to this email or call us at <strong>(513) 778-8336</strong>.</p>
  
  <p>Talk soon,<br><strong>Jordan</strong><br>ClawOps</p>
</div>`;
}

const server = http.createServer(async (req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', service: 'vapi-webhook', version: 'v3-twilio-tf+email+ghl' }));
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const event = JSON.parse(body);
        const messageType = event.message?.type;
        
        console.log(`[${new Date().toISOString()}] Event: ${messageType || 'unknown'}`);

        // Handle end-of-call report
        if (messageType === 'end-of-call-report') {
          const call = event.message?.call || event.message;
          const customer = call?.customer?.number;
          const summary = call?.analysis?.summary || event.message?.summary || '';
          const transcript = call?.transcript || event.message?.transcript || '';
          const duration = call?.duration || call?.durationSeconds || 0;
          const recordingUrl = call?.recordingUrl || event.message?.recordingUrl || '';
          const endedReason = call?.endedReason || event.message?.endedReason || '';
          
          // Extract name from transcript if possible
          let customerName = '';
          const nameMatch = transcript.match(/my name is (\w+)/i) || transcript.match(/this is (\w+)/i);
          if (nameMatch) customerName = nameMatch[1];

          console.log(`Call ended. Customer: ${customer}, Name: ${customerName}, Duration: ${duration}s`);

          // 1. Notify Brand about every call
          // Telegram first (primary), then email (fallback)
          try { await notifyBrandTelegram({ customer, duration, summary, transcript, recordingUrl, endedReason }); } catch(e) {}
          try { await notifyBrand({ customer, duration, summary, transcript, recordingUrl, endedReason }); } catch(e) {}

          // 2. Try SMS (will silently fail until 10DLC approved, that's fine)
          if (customer) {
            try {
              await sendSMS(customer, followUpSMS);
              console.log(`SMS sent to ${customer}`);
            } catch (e) {
              console.log(`SMS failed (expected - 10DLC pending): ${e.message}`);
            }
          }

          // 3. Send follow-up email if we captured one during the call
          const emailMatch = transcript.match(/[\w.-]+@[\w.-]+\.\w+/);
          if (emailMatch) {
            const prospectEmail = emailMatch[0];
            await sendEmail(
              prospectEmail,
              `${customerName ? customerName + ', ' : ''}Your ClawOps AI Receptionist Details`,
              getFollowUpEmail(customerName),
            );
            console.log(`Follow-up email sent to ${prospectEmail}`);
          }

          // 4. Log to GHL CRM
          if (customer && GHL_API_KEY) {
            const contact = await findOrCreateGHLContact(customer, customerName);
            if (contact) {
              await addGHLNote(contact.id, { summary, transcript, duration, recordingUrl });
              console.log(`GHL: Call logged for contact ${contact.id}`);
            }
          }

          // 5. Fire GHL workflow webhook for post-call automation
          try {
            const workflowPayload = {
              call_id: call?.id || 'unknown',
              phone_number: customer || '',
              call_status: 'completed',
              call_duration: duration,
              call_outcome: endedReason,
              transcript_summary: summary.substring(0, 500),
              contact_name: customerName || '',
              business_name: '',
              timestamp: new Date().toISOString()
            };
            const wfResult = await fireGHLWorkflow(workflowPayload);
            console.log(`GHL workflow webhook fired: ${wfResult.status}`);
          } catch (e) {
            console.log(`GHL workflow webhook failed: ${e.message}`);
          }

          console.log(`[CALL LOG] ${JSON.stringify({
            customer,
            customerName,
            duration,
            endedReason,
            summary: summary.substring(0, 200),
            timestamp: new Date().toISOString()
          })}`);
        }

        // Handle function calls
        if (messageType === 'function-call') {
          const fn = event.message?.functionCall;
          console.log(`Function call: ${fn?.name}`, JSON.stringify(fn?.parameters));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ result: 'Function received' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error(`Parse error: ${e.message}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ClawOps VAPI Webhook Server v2');
  }
});

server.listen(PORT, () => {
  console.log(`VAPI webhook server v2 running on port ${PORT}`);
  console.log(`Twilio: ${TWILIO_ACCOUNT_SID ? 'configured' : 'NOT SET'} (TF: ${TWILIO_FROM_NUMBER})`);
  console.log(`Vonage: ${VONAGE_API_KEY ? 'configured' : 'NOT SET'} (fallback)`);
  console.log(`Gmail: ${GMAIL_APP_PASSWORD ? 'configured' : 'NOT SET'}`);
  console.log(`GHL API: ${GHL_API_KEY ? 'configured' : 'NOT SET'}`);
});
