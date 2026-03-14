# Technical Unblock Plan - ClawOps Infrastructure
**Date:** 2026-03-13
**Author:** Ethan (CTO)
**Status:** ACTIVE - Execute in order
**Priority:** P0 - Revenue blocked

---

## Priority Order

| # | Blocker | Impact | ETA to Fix | Dependency |
|---|---------|--------|------------|------------|
| 1 | SMS Delivery (10DLC) | Zero follow-up texts arriving | 1-15 days (carrier review) | Twilio console + wait |
| 2 | Email Follow-Up (Bypass SMS) | Unblocked TODAY | 1 hour code change | Deploy to Fly.io |
| 3 | VAPI-to-GHL Integration | No CRM tracking of calls | 2-3 hours code | Deploy to Fly.io |
| 4 | Highground DNS | Website pointing to wrong IP | 10 minutes | Brand logs into GoDaddy |

**Critical insight:** SMS is blocked by carrier registration that takes 10-15 days. We CANNOT wait. Email follow-up (#2) is the immediate workaround and should be deployed first.

---

## BLOCKER 1: SMS Delivery (Twilio A2P 10DLC)

### Current State
- Twilio number: +17027284638
- Error 30034 = "Message blocked by A2P 10DLC policy"
- GHL shows A2P Brand: **Approved**, Campaign: **In Progress**
- Vonage number: silently drops (same 10DLC issue, unregistered traffic)
- Twilio Primary Customer Profile: previously deleted due to bad data, needs recreation

### Why SMS Doesn't Work
Every US carrier now requires 10DLC registration for application-to-person SMS on local numbers. Without an approved Campaign, messages are either blocked (Twilio error 30034) or silently dropped (Vonage). There is no workaround for local numbers.

### Can 10DLC Be Done Via API?

**Partially.** Here's what the API can and cannot do:

| Step | API? | Console? | Notes |
|------|------|----------|-------|
| Primary Customer Profile | NO | YES | Twilio blocks API creation. Returns 400: "Use Console instead." |
| Secondary Customer Profile (ISV) | YES | YES | Full API support for ISV customers |
| Brand Registration | YES | YES | POST to `/v1/Messaging/Brands/Registrations` |
| Campaign Registration | YES | YES | POST to `/v1/Messaging/Campaigns/Registrations` |
| Messaging Service creation | YES | YES | Standard API |
| Add phone to Messaging Service | YES | YES | Standard API |

**Bottom line:** The Primary Customer Profile MUST be done in the Twilio Console. Everything after that can be API-driven.

### Exact Steps to Fix SMS

#### Step 1: Recreate Primary Customer Profile (Console - Brand must do this)

1. Go to: https://console.twilio.com/us1/account/trust-hub/customer-profiles
2. Click "Create a Customer Profile"
3. Fill in:
   - **Business Name:** ClawOps
   - **Business Type:** Sole Proprietorship
   - **Business Registration ID Type:** Select from dropdown (try "EIN" first; if not available, use whatever matches - the dropdown shows valid values)
   - **Business Registration Number:** Your EIN or SSN-based identifier
   - **Business Identity:** ISV Reseller or Partner
   - **Industry:** Online/Technology
   - **Website:** https://theclawops.com
   - **Regions:** USA and Canada
4. **Authorized Representative #1:**
   - Name: Brandon Liao
   - Email: rickclaw08@gmail.com
   - Phone: +15138506496
   - Title: CEO
5. **Authorized Representative #2:**
   - Name: Rick Claw
   - Email: rickclaw08@gmail.com
   - Phone: +17027284638
   - Title: CTO
6. **Physical Business Address:** Enter a valid US business address
7. Click Submit

**Wait time:** 1-3 business days for Twilio review.

#### Step 2: Check A2P Brand Status

Since GHL says the A2P Brand is "Approved", check if this is visible in Twilio:

```bash
curl -X GET "https://messaging.twilio.com/v1/a2p/BrandRegistrations" \
  -u "[REDACTED-RICK-SID]:$TWILIO_AUTH_TOKEN"
```

If a brand exists and shows `status: approved`, skip to Step 3.

If no brand exists or it failed, create one via API after the Primary Customer Profile is approved:

```bash
curl -X POST "https://messaging.twilio.com/v1/a2p/BrandRegistrations" \
  -u "[REDACTED-RICK-SID]:$TWILIO_AUTH_TOKEN" \
  --data-urlencode "CustomerProfileBundleSid=<PRIMARY_PROFILE_SID>" \
  --data-urlencode "A2PProfileBundleSid=<A2P_TRUST_PRODUCT_SID>" \
  --data-urlencode "BrandType=STANDARD"
```

#### Step 3: Check/Create Campaign

Check existing campaigns:
```bash
curl -X GET "https://messaging.twilio.com/v1/a2p/BrandRegistrations/<BRAND_SID>/Campaigns" \
  -u "[REDACTED-RICK-SID]:$TWILIO_AUTH_TOKEN"
```

If Campaign status is "IN_PROGRESS" or "PENDING", this is normal. Campaign reviews currently take **10-15 days** per Twilio's own documentation. No action needed - just wait.

If no campaign exists, create one:
```bash
# First, ensure you have a Messaging Service
curl -X POST "https://messaging.twilio.com/v1/Services" \
  -u "[REDACTED-RICK-SID]:$TWILIO_AUTH_TOKEN" \
  --data-urlencode "FriendlyName=ClawOps A2P Messaging" \
  --data-urlencode "UseInboundWebhookOnNumber=true"

# Add your number to the Messaging Service
curl -X POST "https://messaging.twilio.com/v1/Services/<MESSAGING_SERVICE_SID>/PhoneNumbers" \
  -u "[REDACTED-RICK-SID]:$TWILIO_AUTH_TOKEN" \
  --data-urlencode "PhoneNumberSid=<PHONE_NUMBER_SID>"

# Create Campaign
curl -X POST "https://messaging.twilio.com/v1/a2p/BrandRegistrations/<BRAND_SID>/Campaigns" \
  -u "[REDACTED-RICK-SID]:$TWILIO_AUTH_TOKEN" \
  --data-urlencode "MessagingServiceSid=<MESSAGING_SERVICE_SID>" \
  --data-urlencode "UseCase=MIXED" \
  --data-urlencode "Description=Post-call follow-up messages for AI receptionist service prospects. Includes demo booking links and service information." \
  --data-urlencode "MessageSamples=[\"Thanks for chatting with ClawOps! Here's your demo booking link: theclawops.com/founding\",\"Hi {name}, following up on our call about AI receptionist service. Book your demo: theclawops.com/founding\"]" \
  --data-urlencode "HasEmbeddedLinks=true" \
  --data-urlencode "HasEmbeddedPhone=true"
```

#### Step 4: Alternative - Toll-Free Number (Faster Path)

Toll-free numbers are NOT subject to 10DLC. They have their own verification process (Toll-Free Verification) which is often faster.

```bash
# Buy a toll-free number
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/[REDACTED-RICK-SID]/IncomingPhoneNumbers/TollFree.json" \
  -u "[REDACTED-RICK-SID]:$TWILIO_AUTH_TOKEN" \
  --data-urlencode "AreaCode=888"
```

Then submit for Toll-Free Verification at:
https://console.twilio.com/us1/develop/phone-numbers/regulatory-compliance/toll-free

Toll-free verification typically takes 1-5 business days (faster than 10DLC campaign review).

### SMS Timeline Expectation
- **Best case:** GHL A2P campaign auto-approves in the next few days. SMS starts working.
- **Worst case:** 10-15 day campaign review. Use email follow-up in the meantime.
- **Fallback:** Buy a toll-free number and get toll-free verification (1-5 days).

---

## BLOCKER 2: Email Follow-Up System (IMMEDIATE FIX)

### Current State
- `vapi-webhook/server.js` already has `sendEmail()` function with nodemailer
- `GMAIL_APP_PASSWORD` env var exists on Fly.io
- The `end-of-call-report` handler only calls `sendSMS()`, never `sendEmail()`
- SMS fails, so follow-ups silently die

### What Needs to Change

The webhook server needs to:
1. Try SMS (in case 10DLC approves)
2. Always send email follow-up (guaranteed delivery)
3. Use the customer's email if available from VAPI call data
4. Fall back to a notification email to Brand if no customer email

### Exact Code Changes to `vapi-webhook/server.js`

Replace the existing `followUpText` and the `end-of-call-report` handler block. Here is the complete updated server.js:

```javascript
const http = require('http');
const https = require('https');

const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const VONAGE_FROM = process.env.VONAGE_FROM_NUMBER || '15137788336';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = 'Ez2ADxydpjvWsW3suYiq';
const GHL_PIPELINE_ID = 'MK59XHOAuRJU2IjgzHiq';
const PORT = process.env.PORT || 3000;

// ============================================================
// SMS (Vonage) - will work once 10DLC approves
// ============================================================
async function sendSMS(to, body) {
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

// ============================================================
// Email via Gmail SMTP
// ============================================================
async function sendEmail(to, subject, textBody, htmlBody) {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'rickclaw08@gmail.com', pass: GMAIL_APP_PASSWORD }
    });
    await transporter.sendMail({
      from: '"ClawOps" <rickclaw08@gmail.com>',
      to,
      subject,
      text: textBody,
      html: htmlBody || textBody.replace(/\n/g, '<br>')
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (e) {
    console.error(`Email failed: ${e.message}`);
    return false;
  }
}

// ============================================================
// GHL API: Create or Update Contact
// ============================================================
function ghlRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'services.leadconnectorhq.com',
      path: path,
      method: method,
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

async function upsertGHLContact(phone, name, email, callData) {
  // Search for existing contact by phone
  const searchResult = await ghlRequest('GET',
    `/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(phone)}`
  );

  let contactId;

  if (searchResult.status === 200 && searchResult.data.contacts && searchResult.data.contacts.length > 0) {
    // Update existing contact
    contactId = searchResult.data.contacts[0].id;
    await ghlRequest('PUT', `/contacts/${contactId}`, {
      name: name || undefined,
      email: email || undefined,
      tags: ['source:vapi-call', 'status:called'],
      customFields: [
        { id: 'F7txi11mIuhx3qbh1tKB', value: callData.trade || '' }
      ]
    });
    console.log(`GHL contact updated: ${contactId}`);
  } else {
    // Create new contact
    const createResult = await ghlRequest('POST', '/contacts/', {
      locationId: GHL_LOCATION_ID,
      phone: phone,
      name: name || 'VAPI Lead',
      email: email || undefined,
      source: 'VAPI AI Call',
      tags: ['source:vapi-call', 'status:called'],
      customFields: [
        { id: 'F7txi11mIuhx3qbh1tKB', value: callData.trade || '' }
      ]
    });

    if (createResult.status === 200 || createResult.status === 201) {
      contactId = createResult.data.contact?.id;
      console.log(`GHL contact created: ${contactId}`);
    } else {
      console.error(`GHL contact creation failed: ${JSON.stringify(createResult.data)}`);
      return null;
    }
  }

  return contactId;
}

async function createGHLOpportunity(contactId, name, callData) {
  // Pipeline: "Voice AI Leads" (MK59XHOAuRJU2IjgzHiq)
  // Stage: "New Lead" (first stage)
  const result = await ghlRequest('POST', '/opportunities/', {
    pipelineId: GHL_PIPELINE_ID,
    locationId: GHL_LOCATION_ID,
    name: `VAPI Call - ${name || 'Unknown'}`,
    pipelineStageId: '', // Will use first stage by default
    contactId: contactId,
    status: 'open',
    source: 'VAPI AI Call',
    monetaryValue: 1997 // Founding member deal value
  });

  if (result.status === 200 || result.status === 201) {
    console.log(`GHL opportunity created: ${result.data.opportunity?.id}`);
    return result.data.opportunity?.id;
  } else {
    console.error(`GHL opportunity creation failed: ${JSON.stringify(result.data)}`);
    return null;
  }
}

async function addGHLNote(contactId, callData) {
  const noteBody = [
    `VAPI Call - ${new Date().toISOString()}`,
    `Duration: ${callData.duration || 0}s`,
    `Ended Reason: ${callData.endedReason || 'unknown'}`,
    '',
    '--- Summary ---',
    callData.summary || 'No summary available',
    '',
    '--- Transcript ---',
    callData.transcript || 'No transcript available',
    '',
    callData.recordingUrl ? `Recording: ${callData.recordingUrl}` : ''
  ].join('\n');

  await ghlRequest('POST', `/contacts/${contactId}/notes`, {
    body: noteBody,
    userId: null // system note
  });
  console.log(`GHL note added to contact ${contactId}`);
}

// ============================================================
// Follow-up content
// ============================================================
const followUpTextSMS = `Hey! Thanks for chatting with Jordan from ClawOps.

Here's what we talked about:
- AI Receptionist that answers your calls 24/7
- Books jobs, captures leads, never misses a call
- Founding Member Deal: $2,500 setup + $550/mo (normally $3,000 + $750/mo) - only 12 spots left

Check out the details: theclawops.com/founding

Questions? Reply to this text or call us at (513) 995-3474.

- The ClawOps Team`;

const followUpEmailSubject = 'Thanks for chatting with ClawOps - Your AI Receptionist Demo';

function buildFollowUpEmailHTML(name) {
  const displayName = name || 'there';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h2 style="color: #1a1a2e;">Hey ${displayName}!</h2>

  <p>Thanks for taking the time to chat with Jordan from ClawOps. Here's a quick recap:</p>

  <div style="background: #f8f9fa; border-left: 4px solid #e94560; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1a1a2e;">What We Discussed</h3>
    <ul style="padding-left: 20px;">
      <li><strong>AI Receptionist</strong> that answers your calls 24/7</li>
      <li><strong>Never miss a lead</strong> - books jobs, captures info, routes emergencies</li>
      <li><strong>Founding Member Deal:</strong> $2,500 setup + $550/mo <span style="text-decoration: line-through; color: #999;">(normally $3,000 + $750/mo)</span></li>
      <li><strong>Only 12 founding spots left</strong></li>
    </ul>
  </div>

  <p>
    <a href="https://theclawops.com/founding" style="display: inline-block; background: #e94560; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
      Claim Your Founding Spot
    </a>
  </p>

  <p>Questions? Just reply to this email or call us at <strong>(513) 995-3474</strong>.</p>

  <p style="margin-top: 30px;">
    Best,<br>
    <strong>The ClawOps Team</strong><br>
    <a href="https://theclawops.com" style="color: #e94560;">theclawops.com</a>
  </p>
</body>
</html>`;
}

function buildFollowUpEmailText(name) {
  const displayName = name || 'there';
  return `Hey ${displayName}!

Thanks for chatting with Jordan from ClawOps. Here's a quick recap:

- AI Receptionist that answers your calls 24/7
- Never miss a lead - books jobs, captures info, routes emergencies
- Founding Member Deal: $2,500 setup + $550/mo (normally $3,000 + $750/mo)
- Only 12 founding spots left

Claim your spot: https://theclawops.com/founding

Questions? Reply to this email or call us at (513) 995-3474.

Best,
The ClawOps Team
https://theclawops.com`;
}

// ============================================================
// Internal notification - always email Brand
// ============================================================
async function notifyTeam(callData) {
  const subject = `[VAPI Call] ${callData.customerName || callData.customerPhone || 'Unknown'} - ${callData.duration || 0}s`;
  const body = [
    `New VAPI call completed:`,
    `Customer: ${callData.customerName || 'Unknown'} (${callData.customerPhone || 'no phone'})`,
    `Duration: ${callData.duration || 0}s`,
    `Ended: ${callData.endedReason || 'unknown'}`,
    '',
    `Summary: ${callData.summary || 'None'}`,
    '',
    callData.recordingUrl ? `Recording: ${callData.recordingUrl}` : '',
    callData.transcript ? `\nTranscript:\n${callData.transcript.substring(0, 2000)}` : ''
  ].join('\n');

  await sendEmail('rickclaw08@gmail.com', subject, body);
}

// ============================================================
// HTTP Server
// ============================================================
const server = http.createServer(async (req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', service: 'vapi-webhook' }));
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const event = JSON.parse(body);
        const messageType = event.message?.type;

        console.log(`[${new Date().toISOString()}] Event: ${messageType || 'unknown'}`);

        // =====================================================
        // Handle end-of-call report
        // =====================================================
        if (messageType === 'end-of-call-report') {
          const msg = event.message;
          const call = msg.call || msg;
          const artifact = msg.artifact || {};
          const customer = call.customer?.number;
          const customerName = call.customer?.name || '';
          const customerEmail = call.customer?.email || '';
          const summary = msg.analysis?.summary || call.analysis?.summary || msg.summary || '';
          const transcript = artifact.transcript || msg.transcript || '';
          const recordingUrl = artifact.recording?.url || artifact.recordingUrl || msg.recordingUrl || '';
          const duration = call.duration || call.durationSeconds || msg.durationSeconds || 0;
          const endedReason = msg.endedReason || call.endedReason || '';
          const trade = call.assistantOverrides?.variableValues?.trade || '';

          const callData = {
            customerPhone: customer,
            customerName,
            customerEmail,
            summary,
            transcript,
            recordingUrl,
            duration,
            endedReason,
            trade
          };

          console.log(`Call ended. Customer: ${customer}, Name: ${customerName}, Duration: ${duration}s`);
          console.log(`Summary: ${summary.substring(0, 200)}`);

          // --- 1. GHL Integration: Create/update contact + opportunity ---
          if (GHL_API_KEY && customer) {
            try {
              const contactId = await upsertGHLContact(customer, customerName, customerEmail, callData);
              if (contactId) {
                await addGHLNote(contactId, callData);
                await createGHLOpportunity(contactId, customerName, callData);
              }
            } catch (e) {
              console.error(`GHL integration error: ${e.message}`);
            }
          }

          // --- 2. Try SMS follow-up (will fail until 10DLC approves, that's OK) ---
          if (customer) {
            try {
              await sendSMS(customer, followUpTextSMS);
              console.log(`Follow-up SMS sent to ${customer}`);
            } catch (e) {
              console.error(`SMS failed to ${customer}: ${e.message} (expected until 10DLC approves)`);
            }
          }

          // --- 3. Email follow-up to customer (if we have their email) ---
          if (customerEmail) {
            await sendEmail(
              customerEmail,
              followUpEmailSubject,
              buildFollowUpEmailText(customerName),
              buildFollowUpEmailHTML(customerName)
            );
          }

          // --- 4. Always notify the team ---
          await notifyTeam(callData);

          // --- 5. Log ---
          console.log(`[CALL LOG] ${JSON.stringify({
            customer,
            customerName,
            duration,
            summary: summary.substring(0, 200),
            ghlSync: GHL_API_KEY ? 'attempted' : 'skipped',
            timestamp: new Date().toISOString()
          })}`);
        }

        // Handle function calls (for booking integration)
        if (messageType === 'function-call' || messageType === 'tool-calls') {
          const fn = event.message?.functionCall;
          const toolCalls = event.message?.toolCallList || event.message?.toolWithToolCallList || [];
          console.log(`Function/tool call received:`, JSON.stringify(fn || toolCalls));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ results: toolCalls.map(tc => ({
            name: tc.name || tc.toolCall?.name,
            toolCallId: tc.toolCall?.id || tc.id,
            result: '{"status": "acknowledged"}'
          })) }));
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
    res.end('ClawOps VAPI Webhook Server');
  }
});

server.listen(PORT, () => {
  console.log(`VAPI webhook server running on port ${PORT}`);
  console.log(`Vonage API Key: ${VONAGE_API_KEY ? VONAGE_API_KEY.substring(0, 6) + '...' : 'NOT SET'}`);
  console.log(`Gmail: ${GMAIL_APP_PASSWORD ? 'configured' : 'NOT SET'}`);
  console.log(`GHL API: ${GHL_API_KEY ? 'configured' : 'NOT SET'}`);
  console.log(`GHL Location: ${GHL_LOCATION_ID}`);
});
```

### Deployment

```bash
cd vapi-webhook

# Set the GHL API key on Fly.io (one-time)
fly secrets set GHL_API_KEY="<paste from env var GHL_API_KEY>" --app clawops-vapi-webhook

# Verify GMAIL_APP_PASSWORD is already set
fly secrets list --app clawops-vapi-webhook

# Deploy
fly deploy --app clawops-vapi-webhook

# Verify health
curl https://clawops-vapi-webhook.fly.dev/health
```

### What This Changes
- **SMS:** Still attempts it. Will succeed once 10DLC approves. Fails gracefully until then.
- **Email to prospect:** Sends HTML follow-up email IF the VAPI call data includes a customer email. (Depends on VAPI capturing email during the call via function call or variable.)
- **Email to team:** ALWAYS sends Brand a notification email with call summary, duration, transcript, and recording link. This means every call is tracked even if GHL integration fails.
- **GHL sync:** Creates/updates contact, adds call notes, creates pipeline opportunity. (See Blocker 3 below for details.)

---

## BLOCKER 3: VAPI-to-GHL Integration

### Architecture

```
VAPI Call Ends
    |
    v
POST end-of-call-report --> clawops-vapi-webhook.fly.dev
    |
    v
server.js processes call data:
    |
    +-- 1. Search GHL for existing contact by phone
    |      (GET /contacts/?query=+1XXXXXXXXXX)
    |
    +-- 2. Create or update contact
    |      - Phone, name, email, trade niche tag
    |      - Tags: source:vapi-call, status:called
    |
    +-- 3. Add note with full call data
    |      - Summary, transcript, recording URL, duration
    |
    +-- 4. Create opportunity in "Voice AI Leads" pipeline
    |      - Stage: New Lead
    |      - Value: $1,997
    |
    +-- 5. Send follow-up email + attempt SMS
    |
    +-- 6. Notify team via email
```

### GHL API Details

- **Base URL:** `https://services.leadconnectorhq.com`
- **Auth Header:** `Authorization: Bearer <GHL_API_KEY>`
- **Version Header:** `Version: 2021-07-28`
- **Location ID:** `Ez2ADxydpjvWsW3suYiq`
- **Pipeline ID:** `MK59XHOAuRJU2IjgzHiq` (Voice AI Leads)
- **Trade Niche Custom Field:** `F7txi11mIuhx3qbh1tKB`

### GHL API Endpoints Used

| Action | Method | Endpoint |
|--------|--------|----------|
| Search contacts | GET | `/contacts/?locationId=Ez2ADxydpjvWsW3suYiq&query={phone}` |
| Create contact | POST | `/contacts/` |
| Update contact | PUT | `/contacts/{contactId}` |
| Add note | POST | `/contacts/{contactId}/notes` |
| Create opportunity | POST | `/opportunities/` |

### What Data Flows Into GHL

For every VAPI call that completes:

| GHL Field | Source from VAPI |
|-----------|-----------------|
| Contact phone | `call.customer.number` |
| Contact name | `call.customer.name` |
| Contact email | `call.customer.email` (if captured) |
| Tag: source:vapi-call | Hardcoded |
| Tag: status:called | Hardcoded |
| Custom field: Trade Niche | `assistantOverrides.variableValues.trade` |
| Note: Summary | `message.analysis.summary` |
| Note: Transcript | `artifact.transcript` |
| Note: Recording | `artifact.recording.url` |
| Note: Duration | `call.duration` |
| Opportunity pipeline | Voice AI Leads |
| Opportunity value | $1,997 |
| Opportunity stage | New Lead (first stage) |

### Required Env Var on Fly.io

```bash
fly secrets set GHL_API_KEY="<value>" --app clawops-vapi-webhook
```

### Getting the Pipeline Stage ID

The `createGHLOpportunity` function needs the first stage ID. To get it:

```bash
curl -s -X GET "https://services.leadconnectorhq.com/opportunities/pipelines?locationId=Ez2ADxydpjvWsW3suYiq" \
  -H "Authorization: Bearer $GHL_API_KEY" \
  -H "Version: 2021-07-28" | jq '.pipelines[] | select(.id == "MK59XHOAuRJU2IjgzHiq") | .stages[0]'
```

Take the `.id` from the first stage and update the `pipelineStageId` in the `createGHLOpportunity` function. If left empty, GHL should default to the first stage, but explicitly setting it is more reliable.

---

## BLOCKER 4: Highground Website DNS (thehighgroundhq.com)

### Current State
- Domain: thehighgroundhq.com
- Registrar: GoDaddy
- Current DNS: Points to Cloudflare (162.159.140.166)
- Needed: Point to GitHub Pages (185.199.108-111.153)

### Exact Steps for Brand (GoDaddy DNS)

**Step 1: Log into GoDaddy**
1. Go to https://dcc.godaddy.com/domains
2. Sign in with the account that owns thehighgroundhq.com
3. Click on "thehighgroundhq.com" to open domain settings

**Step 2: Go to DNS Management**
1. Click the "DNS" tab (or "Manage DNS")
2. You'll see a list of DNS records

**Step 3: Delete old A records**
1. Find any existing A records (Type = A, Name = @)
2. Click the pencil/edit icon on each one
3. Delete them (there may be one pointing to 162.159.140.166 or similar Cloudflare IP)

**Step 4: Add GitHub Pages A records**
Add these 4 A records one by one:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |

For each one:
1. Click "Add New Record"
2. Type: A
3. Name: @ (or leave blank - GoDaddy may auto-fill @)
4. Value: paste the IP
5. TTL: 600 seconds (or "10 minutes" or "Custom" and enter 600)
6. Click Save

**Step 5: Add/verify CNAME for www**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | `<github-username>.github.io` | 600 |

Replace `<github-username>` with whatever GitHub account hosts the site (e.g., `thehighgroundhq.github.io` or `brandlio.github.io`).

**Step 6: Remove Cloudflare nameservers (if applicable)**
If GoDaddy is using Cloudflare nameservers instead of its own:
1. Go to the "Nameservers" section
2. Click "Change"
3. Select "I'll use my own nameservers" or "Default GoDaddy nameservers"
4. Set to GoDaddy defaults:
   - ns51.domaincontrol.com
   - ns52.domaincontrol.com
   (Exact names may vary - GoDaddy shows the correct default pair)

**Step 7: Configure GitHub Pages**
1. Go to the GitHub repo Settings > Pages
2. Under "Custom domain", enter: thehighgroundhq.com
3. Click Save
4. Wait for DNS check to pass (can take up to 24 hours, usually 10-30 minutes)
5. Check "Enforce HTTPS" once the certificate is provisioned

**Step 8: Verify**
After 10-30 minutes:
```bash
dig thehighgroundhq.com +short
# Should show:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153

curl -I https://thehighgroundhq.com
# Should return 200 OK from GitHub Pages
```

If Cloudflare IPs still show, DNS hasn't propagated yet. Wait up to 48 hours (usually much faster with TTL 600).

---

## Execution Checklist

| # | Task | Owner | Time | Status |
|---|------|-------|------|--------|
| 1 | Deploy updated server.js to Fly.io | Ethan/Rick | 30 min | NOT STARTED |
| 2 | Set GHL_API_KEY secret on Fly.io | Ethan/Rick | 5 min | NOT STARTED |
| 3 | Get pipeline stage ID, update code if needed | Ethan/Rick | 10 min | NOT STARTED |
| 4 | Test webhook with a VAPI test call | Ethan/Rick | 15 min | NOT STARTED |
| 5 | Verify GHL contact creation after test call | Ethan/Rick | 5 min | NOT STARTED |
| 6 | Verify email follow-up arrives | Ethan/Rick | 5 min | NOT STARTED |
| 7 | Highground DNS change | Brand | 10 min | NOT STARTED |
| 8 | Twilio Primary Customer Profile (console) | Brand | 15 min | NOT STARTED |
| 9 | Monitor A2P campaign status (check weekly) | Ethan | Ongoing | NOT STARTED |
| 10 | Consider toll-free number as SMS backup | Ethan | 30 min | NOT STARTED |

### Deploy Sequence (Tasks 1-6)

```bash
# 1. Copy the updated server.js (from the code block above)
cd /Users/agentclaw/.openclaw/workspace/vapi-webhook

# 2. Set GHL secret
fly secrets set GHL_API_KEY="$(echo $GHL_API_KEY)" --app clawops-vapi-webhook

# 3. Get pipeline stage ID
curl -s -X GET "https://services.leadconnectorhq.com/opportunities/pipelines?locationId=Ez2ADxydpjvWsW3suYiq" \
  -H "Authorization: Bearer $GHL_API_KEY" \
  -H "Version: 2021-07-28" | jq '.pipelines[] | select(.id == "MK59XHOAuRJU2IjgzHiq") | .stages[0].id'
# Update pipelineStageId in createGHLOpportunity() with the result

# 4. Deploy
fly deploy --app clawops-vapi-webhook

# 5. Test health
curl https://clawops-vapi-webhook.fly.dev/health

# 6. Make a test VAPI call and check:
#    - rickclaw08@gmail.com inbox for team notification email
#    - GHL contacts for new/updated contact
#    - GHL pipeline for new opportunity
```

---

## Summary of Immediate Actions (Do Today)

1. **Deploy updated server.js** with email follow-up + GHL integration (unblocks #2 and #3)
2. **Brand: Update GoDaddy DNS** for thehighgroundhq.com (unblocks #4)
3. **Brand: Create Twilio Primary Customer Profile** via console (starts clock on #1)
4. **Check A2P campaign status** - if "In Progress" in GHL, it may auto-approve soon

## What's Unblocked After Deploy

- Every VAPI call creates a GHL contact + opportunity (sales tracking works)
- Every VAPI call sends Brand an email notification (no calls go unnoticed)
- Customer email follow-ups work (if VAPI captures email)
- SMS will auto-start working once 10DLC campaign approves (no code change needed)
- Highground website will load from GitHub Pages after DNS propagation

---

*Plan written 2026-03-13 16:45 EDT. Execute immediately.*
