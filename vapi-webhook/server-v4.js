const http = require('http');
const https = require('https');
const nodemailer = require('nodemailer');

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
const PORT = process.env.PORT || 3000;

// ============================================================
// SMS PROVIDERS
// ============================================================

async function sendSMSTwilio(to, body) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) throw new Error('Twilio not configured');
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({ From: TWILIO_FROM_NUMBER, To: to, Body: body }).toString();
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const req = https.request({
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let respBody = '';
      res.on('data', (chunk) => respBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(respBody);
          if (parsed.sid && !parsed.error_code) resolve(parsed);
          else reject(new Error(`Twilio ${parsed.error_code}: ${parsed.message || respBody}`));
        } catch (e) { reject(new Error(`Twilio parse: ${respBody}`)); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function sendSMSVonage(to, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      from: VONAGE_FROM,
      to: to.replace('+', ''),
      text: body,
      api_key: VONAGE_API_KEY,
      api_secret: VONAGE_API_SECRET
    });
    const req = https.request({
      hostname: 'rest.nexmo.com', path: '/sms/json', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let respBody = '';
      res.on('data', (chunk) => respBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(respBody);
          if (parsed.messages?.[0]?.status === '0') resolve(parsed);
          else reject(new Error(`Vonage: ${respBody}`));
        } catch (e) { reject(new Error(`Vonage parse: ${respBody}`)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendSMS(to, body) {
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    try { const r = await sendSMSTwilio(to, body); console.log(`SMS via Twilio: ${r.sid}`); return r; }
    catch (e) { console.log(`Twilio failed: ${e.message}, trying Vonage...`); }
  }
  if (VONAGE_API_KEY && VONAGE_API_SECRET) {
    const r = await sendSMSVonage(to, body);
    console.log(`SMS via Vonage`);
    return r;
  }
  throw new Error('No SMS provider available');
}

// ============================================================
// EMAIL
// ============================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
});

async function sendEmail(to, subject, htmlBody, textBody) {
  try {
    await transporter.sendMail({
      from: '"Jordan at ClawOps" <rickclaw08@gmail.com>',
      to, subject,
      text: textBody || htmlBody.replace(/<[^>]*>/g, ''),
      html: htmlBody
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (e) {
    console.error(`Email failed to ${to}: ${e.message}`);
    return false;
  }
}

// ============================================================
// GHL CRM
// ============================================================

function ghlRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'services.leadconnectorhq.com', path, method,
      headers: { 'Authorization': `Bearer ${GHL_API_KEY}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' }
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(options, (res) => {
      let respBody = '';
      res.on('data', (chunk) => respBody += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(respBody) }); }
        catch (e) { resolve({ status: res.statusCode, data: respBody }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function findOrCreateGHLContact(phone, name, email, company) {
  try {
    const searchResult = await ghlRequest('POST', '/contacts/search', {
      locationId: GHL_LOCATION_ID,
      filters: [{ field: 'phone', operator: 'eq', value: phone }]
    });
    if (searchResult.data?.contacts?.length > 0) {
      const existing = searchResult.data.contacts[0];
      // Update email/company if we have new data
      if ((email || company) && existing.id) {
        const updates = {};
        if (email && !existing.email) updates.email = email;
        if (company && !existing.companyName) updates.companyName = company;
        if (Object.keys(updates).length > 0) {
          await ghlRequest('PUT', `/contacts/${existing.id}`, updates);
          console.log(`GHL: Updated contact ${existing.id} with ${JSON.stringify(updates)}`);
        }
      }
      return existing;
    }
    const createResult = await ghlRequest('POST', '/contacts/', {
      locationId: GHL_LOCATION_ID,
      phone, name: name || `Lead ${phone}`,
      email: email || undefined,
      companyName: company || undefined,
      tags: ['source:vapi-outbound'],
      source: 'VAPI Outbound'
    });
    if (createResult.data?.contact) {
      console.log(`GHL: Created contact ${createResult.data.contact.id}`);
      return createResult.data.contact;
    }
  } catch (e) { console.error(`GHL contact error: ${e.message}`); }
  return null;
}

async function addGHLNote(contactId, callData) {
  try {
    const { summary, transcript, duration, recordingUrl, endedReason, callType } = callData;
    const noteBody = [
      `**VAPI Outbound Call - ${new Date().toISOString()}**`,
      `Type: ${callType || 'unknown'} | Duration: ${duration}s | End: ${endedReason}`,
      recordingUrl ? `Recording: ${recordingUrl}` : '',
      summary ? `\nSummary: ${summary}` : '',
      transcript ? `\nTranscript:\n${transcript}` : ''
    ].filter(Boolean).join('\n');
    await ghlRequest('POST', `/contacts/${contactId}/notes`, { body: noteBody });
    console.log(`GHL: Note added to ${contactId}`);
  } catch (e) { console.error(`GHL note error: ${e.message}`); }
}

async function addGHLTag(contactId, tag) {
  try {
    await ghlRequest('POST', `/contacts/${contactId}/tags`, { tags: [tag] });
  } catch (e) { console.error(`GHL tag error: ${e.message}`); }
}

// ============================================================
// CALL CLASSIFICATION
// ============================================================

function classifyCall(endedReason, duration, transcript) {
  // Classify based on how the call ended
  if (endedReason === 'voicemail') return 'voicemail';
  if (endedReason === 'customer-did-not-answer' || endedReason === 'no-answer') return 'no-answer';
  if (endedReason === 'customer-busy' || endedReason === 'busy') return 'busy';
  if (endedReason === 'silence-timed-out' && duration < 15) return 'no-answer';
  if (endedReason === 'silence-timed-out') return 'gatekeeper-or-silence';
  
  // Short calls with customer-ended = probably gatekeeper
  if (endedReason === 'customer-ended-call' && duration < 30) return 'rejected';
  if (endedReason === 'customer-ended-call' && duration < 90) return 'gatekeeper';
  
  // Longer conversations
  if (duration >= 90) return 'conversation';
  if (endedReason === 'assistant-ended-call') return 'conversation';
  
  return 'unknown';
}

// ============================================================
// FOLLOW-UP EMAIL TEMPLATES (by call type)
// ============================================================

function getFollowUpEmail(name, company, callType) {
  const firstName = name ? name.split(' ')[0] : '';
  const greeting = firstName ? `Hi ${firstName}` : 'Hi there';
  
  if (callType === 'conversation') {
    // They actually talked - warm follow-up
    return {
      subject: `${firstName ? firstName + ', ' : ''}Your ClawOps AI Receptionist Details`,
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <p>${greeting},</p>
  <p>Great chatting with you today. As promised, here's a quick overview of what ClawOps can do for ${company || 'your business'}:</p>
  
  <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:16px 0;">
    <h3 style="color:#4ade80;margin-top:0;">ClawOps AI Receptionist</h3>
    <ul style="line-height:1.8;">
      <li>Answers every call 24/7 - no voicemail, no missed leads</li>
      <li>Books jobs and captures lead info automatically</li>
      <li>Handles unlimited simultaneous calls</li>
      <li>Custom-trained on YOUR business</li>
    </ul>
  </div>
  
  <p><strong>Founding Member Rate:</strong> $2,500 setup + $550/mo<br>
  <em>(Regular price will be $3,000 setup + $750/mo. Limited spots remaining.)</em></p>
  
  <p style="margin:24px 0;">
    <a href="https://theclawops.com/founding" style="background:#4ade80;color:#1a1a2e;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">See Full Details</a>
  </p>
  
  <p>Questions? Just reply to this email or call (513) 778-8336.</p>
  <p>Talk soon,<br><strong>Jordan</strong><br>ClawOps</p>
</div>`
    };
  }

  if (callType === 'gatekeeper' || callType === 'gatekeeper-or-silence') {
    // Left info with gatekeeper
    return {
      subject: `Quick follow-up from ClawOps${company ? ' for ' + company : ''}`,
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <p>${greeting},</p>
  <p>We called earlier and wanted to make sure this info got to you. We help businesses like ${company || 'yours'} never miss another call or lead.</p>
  
  <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:16px 0;">
    <p style="margin:0;font-size:16px;"><strong>What we do:</strong> AI-powered receptionist that answers your calls 24/7, books jobs, and captures every lead - so you never lose business to voicemail again.</p>
  </div>
  
  <p>We're offering founding member pricing right now - <strong>$550/mo</strong> (going up to $750/mo soon).</p>
  
  <p>Worth a 5-minute look: <a href="https://theclawops.com/founding">theclawops.com/founding</a></p>
  
  <p>If this isn't relevant, no worries at all. But if you're losing calls to voicemail, we should talk.</p>
  <p>Best,<br><strong>Jordan</strong><br>ClawOps | (513) 778-8336</p>
</div>`
    };
  }

  // Voicemail, no-answer, busy, rejected - light touch
  return {
    subject: `Missed call from ClawOps${company ? ' - for ' + company : ''}`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <p>${greeting},</p>
  <p>We tried reaching you today. We work with businesses like ${company || 'yours'} to make sure they never miss a customer call again.</p>
  
  <p><strong>60-second version:</strong> Our AI receptionist answers your phone 24/7, books appointments, and captures leads - while you focus on the work.</p>
  
  <p>Founding member spots are limited: <a href="https://theclawops.com/founding">theclawops.com/founding</a></p>
  
  <p>If you want to see a quick demo, just reply or call (513) 778-8336.</p>
  <p>- Jordan, ClawOps</p>
</div>`
  };
}

// Follow-up SMS by call type
function getFollowUpSMS(name, callType) {
  const firstName = name ? name.split(' ')[0] : '';
  
  if (callType === 'conversation') {
    return `${firstName ? firstName + ', g' : 'G'}reat chatting! Here's the ClawOps AI Receptionist details we discussed:

Founding Rate: $2,500 setup + $550/mo (limited spots)
theclawops.com/founding

Questions? Call (513) 778-8336
- Jordan, ClawOps`;
  }

  return `${firstName ? 'Hi ' + firstName + ', w' : 'W'}e tried reaching you from ClawOps. We help businesses never miss another call with AI.

Quick look: theclawops.com/founding
Questions? (513) 778-8336
- ClawOps`;
}

// ============================================================
// FOLLOW-UP ORCHESTRATOR
// ============================================================

// Delayed follow-up queue (5-min delay for non-conversations)
const followUpQueue = [];

async function scheduleFollowUp(data, delayMs) {
  if (delayMs <= 0) {
    await executeFollowUp(data);
  } else {
    console.log(`Scheduling follow-up for ${data.customer} in ${delayMs/1000}s`);
    setTimeout(() => executeFollowUp(data), delayMs);
  }
}

async function executeFollowUp(data) {
  const { customer, customerName, customerEmail, customerCompany, callType, 
          summary, transcript, duration, recordingUrl, endedReason } = data;
  
  console.log(`[FOLLOW-UP] Executing for ${customer} | type=${callType} | email=${customerEmail || 'none'}`);

  // 1. Always notify Brand
  await notifyBrand(data);

  // 2. SMS follow-up (every call that has a phone number)
  if (customer) {
    try {
      const smsText = getFollowUpSMS(customerName, callType);
      await sendSMS(customer, smsText);
    } catch (e) {
      console.log(`SMS follow-up failed: ${e.message}`);
    }
  }

  // 3. Email follow-up (if we have their email from batch data OR transcript)
  const emailTarget = customerEmail || extractEmailFromTranscript(transcript);
  if (emailTarget) {
    const emailContent = getFollowUpEmail(customerName, customerCompany, callType);
    await sendEmail(emailTarget, emailContent.subject, emailContent.html);
    console.log(`Follow-up email sent to ${emailTarget} (type: ${callType})`);
  } else {
    console.log(`No email for ${customer} - SMS only`);
  }

  // 4. GHL CRM logging + tagging
  if (customer && GHL_API_KEY) {
    const contact = await findOrCreateGHLContact(customer, customerName, emailTarget, customerCompany);
    if (contact) {
      await addGHLNote(contact.id, { summary, transcript, duration, recordingUrl, endedReason, callType });
      await addGHLTag(contact.id, `call-result:${callType}`);
      
      // Tag for follow-up priority
      if (callType === 'conversation') await addGHLTag(contact.id, 'priority:hot');
      else if (callType === 'gatekeeper') await addGHLTag(contact.id, 'priority:warm');
      else await addGHLTag(contact.id, 'priority:cold');
    }
  }

  console.log(`[FOLLOW-UP COMPLETE] ${customer} | type=${callType} | email=${emailTarget ? 'sent' : 'none'} | sms=attempted`);
}

function extractEmailFromTranscript(transcript) {
  if (!transcript) return null;
  const match = transcript.match(/[\w.-]+@[\w.-]+\.\w+/);
  return match ? match[0] : null;
}

async function notifyBrand(callData) {
  const { customer, customerName, customerCompany, duration, summary, 
          transcript, recordingUrl, endedReason, callType } = callData;
  
  const typeEmoji = {
    'conversation': '🔥', 'gatekeeper': '📋', 'voicemail': '📭',
    'no-answer': '❌', 'busy': '📞', 'rejected': '🚫', 'unknown': '❓'
  };

  const subject = `${typeEmoji[callType] || '📞'} ${callType.toUpperCase()}: ${customerName || customer || 'Unknown'}${customerCompany ? ' @ ' + customerCompany : ''} (${duration}s)`;
  const html = `
    <h3>${typeEmoji[callType] || '📞'} Call Report - ${callType.toUpperCase()}</h3>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Contact:</td><td>${customerName || 'Unknown'} ${customer || ''}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Company:</td><td>${customerCompany || 'Unknown'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Duration:</td><td>${duration}s</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">End Reason:</td><td>${endedReason}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Classification:</td><td><strong>${callType}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Recording:</td><td>${recordingUrl ? `<a href="${recordingUrl}">Listen</a>` : 'N/A'}</td></tr>
    </table>
    ${summary ? `<h4>Summary</h4><p>${summary}</p>` : ''}
    ${transcript ? `<h4>Transcript</h4><pre style="white-space:pre-wrap;font-size:13px;background:#f5f5f5;padding:12px;border-radius:4px;">${transcript}</pre>` : '<p><em>No transcript (voicemail/no-answer)</em></p>'}
  `;
  await sendEmail('jacksonroy152@gmail.com', subject, html);
}

// ============================================================
// HTTP SERVER
// ============================================================

const server = http.createServer(async (req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', service: 'vapi-webhook', version: 'v4-full-followup' }));
  }

  // Manual email follow-up endpoint (for batch retro-sending)
  if (req.method === 'POST' && req.url === '/send-followup') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { email, name, company, callType } = JSON.parse(body);
        if (!email) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'email required' }));
        }
        const content = getFollowUpEmail(name, company, callType || 'voicemail');
        const sent = await sendEmail(email, content.subject, content.html);
        res.writeHead(sent ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sent, email }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Batch follow-up endpoint (send to multiple contacts at once)
  if (req.method === 'POST' && req.url === '/batch-followup') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const contacts = JSON.parse(body); // [{email, name, company, callType}]
        if (!Array.isArray(contacts)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'expected array of contacts' }));
        }
        const results = [];
        for (const c of contacts) {
          if (!c.email) { results.push({ email: null, sent: false, error: 'no email' }); continue; }
          const content = getFollowUpEmail(c.name, c.company, c.callType || 'voicemail');
          const sent = await sendEmail(c.email, content.subject, content.html);
          results.push({ email: c.email, sent });
          // 1s delay between emails to avoid Gmail rate limits
          await new Promise(r => setTimeout(r, 1000));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ total: contacts.length, sent: results.filter(r => r.sent).length, results }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && (req.url === '/' || req.url === '/webhook')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const event = JSON.parse(body);
        const messageType = event.message?.type;
        console.log(`[${new Date().toISOString()}] Event: ${messageType || 'unknown'}`);

        if (messageType === 'end-of-call-report') {
          const call = event.message?.call || event.message;
          const customer = call?.customer?.number;
          const transcript = call?.transcript || event.message?.transcript || '';
          const summary = call?.analysis?.summary || event.message?.summary || '';
          const duration = call?.duration || call?.durationSeconds || 0;
          const recordingUrl = call?.recordingUrl || event.message?.recordingUrl || '';
          const endedReason = call?.endedReason || event.message?.endedReason || '';

          // Get name from customer object, variable values, or transcript
          const varValues = call?.assistantOverrides?.variableValues || {};
          let customerName = call?.customer?.name || varValues.customerName || '';
          if (!customerName) {
            const nameMatch = transcript.match(/my name is (\w+)/i) || transcript.match(/this is (\w+)/i);
            if (nameMatch) customerName = nameMatch[1];
          }
          
          // Get email and company from variable values (passed from batch script)
          const customerEmail = varValues.customerEmail || '';
          const customerCompany = varValues.customerCompany || '';

          const callType = classifyCall(endedReason, duration, transcript);
          
          console.log(`[CALL] ${customer} | name=${customerName} | company=${customerCompany} | email=${customerEmail} | type=${callType} | ${duration}s | ${endedReason}`);

          // Determine follow-up delay
          // Conversations: immediate (they're warm)
          // Everything else: 3 min delay (feels more natural, less robotic)
          const delayMs = callType === 'conversation' ? 0 : 180000;

          await scheduleFollowUp({
            customer, customerName, customerEmail, customerCompany,
            callType, summary, transcript, duration, recordingUrl, endedReason
          }, delayMs);
        }

        if (messageType === 'function-call') {
          const fn = event.message?.functionCall;
          console.log(`Function call: ${fn?.name}`, JSON.stringify(fn?.parameters));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ result: 'received' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error(`Error: ${e.message}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      }
    });
  } else if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ClawOps VAPI Webhook v4 - Full Follow-up System');
  } else {
    res.writeHead(405);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`VAPI Webhook v4 running on port ${PORT}`);
  console.log(`Twilio: ${TWILIO_ACCOUNT_SID ? 'YES' : 'NO'} | Vonage: ${VONAGE_API_KEY ? 'YES' : 'NO'} | Gmail: ${GMAIL_APP_PASSWORD ? 'YES' : 'NO'} | GHL: ${GHL_API_KEY ? 'YES' : 'NO'}`);
});
