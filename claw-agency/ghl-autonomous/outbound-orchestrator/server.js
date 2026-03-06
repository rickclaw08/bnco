/**
 * ClawOps Outbound Lead Orchestrator
 * 
 * SMS-first outreach to trade contractor leads, routing warm callbacks
 * to niche-specific Voice AI agents on +1 888-457-8980.
 * 
 * Flow:
 * 1. Send personalized SMS to lead (niche-aware, value-first)
 * 2. Lead calls back -> Voice AI answers with niche-specific script
 * 3. Voice AI books demo on ClawOps calendar
 * 4. Post-call workflow sends follow-up email + creates opportunity
 * 5. If no response after 24h, send follow-up SMS
 * 6. After 3 attempts, mark as cold
 * 
 * Endpoints:
 *   POST /start          - Start the SMS campaign
 *   POST /stop           - Pause the campaign
 *   POST /webhook/reply  - GHL webhook for SMS replies
 *   GET  /status         - Campaign dashboard data
 *   GET  /health         - Health check
 *   GET  /               - Dashboard UI
 */

const http = require('http');
const https = require('https');

// ---- Config ----
const PORT = process.env.PORT || 3000;
const GHL_API_KEY = process.env.GHL_API_KEY;
const LOCATION_ID = process.env.GHL_LOCATION_ID || 'Ez2ADxydpjvWsW3suYiq';
const SMS_INTERVAL_MS = parseInt(process.env.SMS_INTERVAL_MS) || 60000; // 1 min between SMS
const MAX_SMS_ATTEMPTS = parseInt(process.env.MAX_SMS_ATTEMPTS) || 3;
const FOLLOWUP_DELAY_MS = parseInt(process.env.FOLLOWUP_DELAY_MS) || 86400000; // 24 hours
const CALLING_HOURS_START = 9;
const CALLING_HOURS_END = 18;
const CLAWOPS_PHONE = '+18884578980';

// Niche-specific SMS templates - short, human, conversational
const SMS_TEMPLATES = {
  'HVAC': {
    initial: `Hey {{firstName}}, this is Jordan with ClawOps. We help HVAC companies stop losing calls when the crew is out on jobs. Built an AI that answers your phone, books appointments, handles emergencies. Give it a call if you want to hear it: ${CLAWOPS_PHONE}`,
    followup1: `Hey {{firstName}}, just circling back. If {{companyName}} is missing calls during the day, our AI receptionist picks up every one and books jobs straight to your calendar. Happy to do a quick demo, just call ${CLAWOPS_PHONE}`,
    followup2: `Last one from me {{firstName}}. If you ever want to check it out, the number is ${CLAWOPS_PHONE}. Takes 2 minutes to hear how it works. No pressure either way.`,
  },
  'Plumbing': {
    initial: `Hey {{firstName}}, this is Jordan with ClawOps. We built an AI receptionist for plumbing companies. It answers every call 24/7, handles emergency triage, books service calls. If you want to hear it in action, give us a ring: ${CLAWOPS_PHONE}`,
    followup1: `Hey {{firstName}}, following up. Plumbing emergencies don't wait, and neither does our AI. It answers every call, day or night, and gets jobs on your schedule. Quick demo at ${CLAWOPS_PHONE} if you're curious.`,
    followup2: `Last note {{firstName}}. If {{companyName}} is losing calls to voicemail, happy to show you how we fix that. ${CLAWOPS_PHONE} whenever you have a sec.`,
  },
  'Electrical': {
    initial: `Hey {{firstName}}, this is Jordan with ClawOps. When your electricians are on a job site, who's picking up the phone? We built an AI that answers every call, handles emergencies, and books estimates. Hear it live: ${CLAWOPS_PHONE}`,
    followup1: `Hey {{firstName}}, just following up. Our AI receptionist is built for electrical contractors. Answers every call, knows the difference between an emergency and a routine job, books on your calendar. ${CLAWOPS_PHONE} for a quick demo.`,
    followup2: `Last one from me {{firstName}}. If missed calls are costing {{companyName}} jobs, we can fix that today. ${CLAWOPS_PHONE} whenever you're free.`,
  },
  'Roofing': {
    initial: `Hey {{firstName}}, this is Jordan with ClawOps. After a storm hits, how many calls can {{companyName}} actually keep up with? We built an AI receptionist for roofers that catches every call and books inspections. Hear it: ${CLAWOPS_PHONE}`,
    followup1: `Hey {{firstName}}, following up. When call volume spikes, our AI handles the overflow. Books inspections, collects damage info, never drops a lead. Quick demo at ${CLAWOPS_PHONE} if you want to hear it.`,
    followup2: `Last note {{firstName}}. Missed storm calls are missed revenue. If you ever want to see how we handle that, ${CLAWOPS_PHONE}. No pressure.`,
  },
  'General Contractor': {
    initial: `Hey {{firstName}}, this is Jordan with ClawOps. We built an AI receptionist for contractors. It answers your phone when you're on site, qualifies leads, and books consultations. Give it a call to hear it: ${CLAWOPS_PHONE}`,
    followup1: `Hey {{firstName}}, circling back. If {{companyName}} is missing calls while you're on jobs, our AI picks up every one and books meetings on your calendar. ${CLAWOPS_PHONE} for a quick demo.`,
    followup2: `Last one {{firstName}}. If calls are going to voicemail, that's jobs walking away. Happy to show you how we fix it. ${CLAWOPS_PHONE} whenever.`,
  },
};

// ---- State ----
let campaign = {
  running: false,
  startedAt: null,
  stats: { sent: 0, delivered: 0, replied: 0, called: 0, demoBooked: 0, failed: 0 },
  queue: [],
  sentLog: [],
  currentContact: null,
  lastSendTime: null,
};

let sendTimer = null;

// ---- GHL API ----

function ghlRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://services.leadconnectorhq.com${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getNewLeads() {
  const res = await ghlRequest('GET', `/contacts/?locationId=${LOCATION_ID}&limit=100`);
  if (res.status !== 200) throw new Error(`Failed: ${res.status}`);
  return (res.data.contacts || []).filter(c => {
    const tags = c.tags || [];
    return tags.includes('source:lead-sheet') &&
           tags.includes('status:new-lead') &&
           !tags.includes('sms:sent') &&
           !tags.includes('sms:dnd-blocked') &&
           !tags.includes('call:do-not-call');
  });
}

async function getFollowUpLeads() {
  const res = await ghlRequest('GET', `/contacts/?locationId=${LOCATION_ID}&limit=100`);
  if (res.status !== 200) return [];
  return (res.data.contacts || []).filter(c => {
    const tags = c.tags || [];
    return tags.includes('source:lead-sheet') &&
           tags.includes('sms:sent') &&
           !tags.includes('sms:replied') &&
           !tags.includes('status:demo-booked') &&
           !tags.includes('status:closed-won') &&
           !tags.includes('call:do-not-call');
  });
}

async function sendSMS(contactId, message) {
  return ghlRequest('POST', '/conversations/messages', {
    type: 'SMS',
    contactId,
    message,
  });
}

async function addTag(contactId, tag) {
  return ghlRequest('POST', `/contacts/${contactId}/tags`, { tags: [tag] });
}

async function removeTag(contactId, tag) {
  return ghlRequest('DELETE', `/contacts/${contactId}/tags`, { tags: [tag] });
}

function getContactNiche(contact) {
  for (const tag of (contact.tags || [])) {
    if (tag.startsWith('niche:')) {
      const map = { 'hvac': 'HVAC', 'plumbing': 'Plumbing', 'electrical': 'Electrical', 'roofing': 'Roofing', 'general-contractor': 'General Contractor' };
      return map[tag.replace('niche:', '')] || 'General Contractor';
    }
  }
  return 'General Contractor';
}

function personalizeMessage(template, contact) {
  const firstName = contact.firstName || 'there';
  const company = contact.companyName || 'your company';
  const state = contact.state || '';
  return template
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{companyName\}\}/g, company)
    .replace(/\{\{state\}\}/g, state);
}

function getSMSAttempt(contact) {
  const tags = contact.tags || [];
  if (tags.includes('sms:attempt3')) return 3;
  if (tags.includes('sms:attempt2')) return 2;
  if (tags.includes('sms:attempt1')) return 1;
  return 0;
}

function isWithinCallingHours() {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const hour = et.getHours();
  const day = et.getDay();
  return day >= 1 && day <= 5 && hour >= CALLING_HOURS_START && hour < CALLING_HOURS_END;
}

// ---- Core Logic ----

async function processNextLead() {
  if (!campaign.running) return;
  
  if (!isWithinCallingHours()) {
    console.log('[CAMPAIGN] Outside business hours - waiting');
    scheduleNext(300000);
    return;
  }
  
  // Refresh queue if empty
  if (campaign.queue.length === 0) {
    try {
      const newLeads = await getNewLeads();
      campaign.queue = newLeads;
      console.log(`[CAMPAIGN] Queue refreshed: ${newLeads.length} new leads`);
    } catch (err) {
      console.error('[CAMPAIGN] Queue refresh failed:', err.message);
      scheduleNext(60000);
      return;
    }
  }
  
  if (campaign.queue.length === 0) {
    console.log('[CAMPAIGN] No more new leads. Checking follow-ups...');
    // Could add follow-up logic here
    campaign.running = false;
    return;
  }
  
  const contact = campaign.queue.shift();
  const niche = getContactNiche(contact);
  const templates = SMS_TEMPLATES[niche] || SMS_TEMPLATES['General Contractor'];
  const attempt = getSMSAttempt(contact);
  
  let template;
  if (attempt === 0) template = templates.initial;
  else if (attempt === 1) template = templates.followup1;
  else if (attempt === 2) template = templates.followup2;
  else {
    console.log(`[SKIP] ${contact.companyName} - max attempts reached`);
    campaign.stats.failed++;
    scheduleNext(SMS_INTERVAL_MS);
    return;
  }
  
  const message = personalizeMessage(template, contact);
  
  console.log(`[SMS] Sending to ${contact.firstName} at ${contact.companyName} (${niche}, attempt ${attempt + 1})`);
  
  try {
    const result = await sendSMS(contact.id, message);
    
    if (result.status === 200 || result.status === 201) {
      campaign.stats.sent++;
      const attemptTag = `sms:attempt${attempt + 1}`;
      await addTag(contact.id, 'sms:sent');
      await addTag(contact.id, attemptTag);
      if (attempt === 0) {
        await addTag(contact.id, 'status:called');
        await removeTag(contact.id, 'status:new-lead');
      }
      
      campaign.sentLog.push({
        contactId: contact.id,
        company: contact.companyName,
        phone: contact.phone,
        niche,
        attempt: attempt + 1,
        sentAt: new Date().toISOString(),
        status: 'sent',
      });
      
      console.log(`[SMS] Sent successfully to ${contact.companyName}`);
    } else {
      // DND or other send failure - skip contact, don't block queue
      const errMsg = typeof result.data === 'object' ? (result.data.message || '') : String(result.data);
      const isDND = errMsg.includes('DND');
      campaign.stats.failed++;
      if (isDND) {
        await addTag(contact.id, 'sms:dnd-blocked');
        console.log(`[SMS] DND active for ${contact.companyName} - skipping`);
      } else {
        console.error(`[SMS] Failed for ${contact.companyName}: ${errMsg.substring(0, 100)}`);
      }
      campaign.sentLog.push({
        contactId: contact.id,
        company: contact.companyName,
        phone: contact.phone,
        niche,
        attempt: attempt + 1,
        sentAt: new Date().toISOString(),
        status: isDND ? 'dnd' : 'failed',
      });
    }
  } catch (err) {
    campaign.stats.failed++;
    console.error(`[SMS] Error: ${err.message}`);
  }
  
  campaign.lastSendTime = new Date().toISOString();
  scheduleNext(SMS_INTERVAL_MS);
}

function scheduleNext(delay) {
  if (sendTimer) clearTimeout(sendTimer);
  sendTimer = setTimeout(processNextLead, delay);
}

// ---- Webhook Handler ----

async function handleReplyWebhook(body) {
  console.log('[WEBHOOK] Reply received:', JSON.stringify(body).substring(0, 200));
  const contactId = body.contact_id || body.contactId;
  if (contactId) {
    await addTag(contactId, 'sms:replied');
    campaign.stats.replied++;
  }
}

// ---- HTTP Server ----

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve(body); }
    });
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const path = new URL(req.url, `http://${req.headers.host}`).pathname;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  try {
    if (path === '/health') return json(res, 200, { status: 'ok', uptime: process.uptime() });
    
    if (path === '/status') return json(res, 200, {
      ...campaign,
      queue: campaign.queue.length,
      sentLog: campaign.sentLog.slice(-30),
    });
    
    if (path === '/start' && req.method === 'POST') {
      if (campaign.running) return json(res, 400, { error: 'Already running' });
      campaign.running = true;
      campaign.startedAt = new Date().toISOString();
      campaign.stats = { sent: 0, delivered: 0, replied: 0, called: 0, demoBooked: 0, failed: 0 };
      campaign.queue = [];
      campaign.sentLog = [];
      processNextLead();
      return json(res, 200, { status: 'started', message: 'SMS campaign started' });
    }
    
    if (path === '/stop' && req.method === 'POST') {
      campaign.running = false;
      if (sendTimer) clearTimeout(sendTimer);
      return json(res, 200, { status: 'stopped', stats: campaign.stats });
    }
    
    if (path === '/webhook/reply' && req.method === 'POST') {
      const body = await parseBody(req);
      await handleReplyWebhook(body);
      return json(res, 200, { received: true });
    }
    
    if (path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(dashboardHTML());
      return;
    }
    
    json(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error('[SERVER]', err);
    json(res, 500, { error: err.message });
  }
});

function dashboardHTML() {
  return `<!DOCTYPE html>
<html><head><title>ClawOps Outbound</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#050810;color:#e0e0e0;padding:1.5rem}
h1{color:#4ade80;margin-bottom:.5rem;font-size:1.5rem}
p.sub{color:#888;margin-bottom:1.5rem;font-size:.9rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;margin-bottom:1.5rem}
.card{background:#0f1724;border:1px solid #1a2540;border-radius:12px;padding:1.25rem}
.val{font-size:2rem;font-weight:700;color:#4ade80}
.label{font-size:.75rem;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-top:.25rem}
.actions{margin-bottom:1.5rem}
button{padding:.65rem 1.75rem;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;margin-right:.75rem}
.btn-go{background:#4ade80;color:#050810}
.btn-stop{background:#ef4444;color:#fff}
.btn-go:hover{background:#22c55e}.btn-stop:hover{background:#dc2626}
.log-card{background:#0f1724;border:1px solid #1a2540;border-radius:12px;padding:1.25rem}
h3{font-size:1rem;margin-bottom:.75rem;color:#9ca3af}
.log{font-family:'JetBrains Mono',monospace;font-size:.8rem;max-height:400px;overflow-y:auto}
.entry{padding:.4rem 0;border-bottom:1px solid #111827;display:flex;gap:.75rem;align-items:center}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:600}
.b-sent{background:#3b82f622;color:#60a5fa}
.b-replied{background:#22c55e22;color:#4ade80}
.b-failed{background:#ef444422;color:#f87171}
.status-dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:.5rem}
.dot-on{background:#4ade80;box-shadow:0 0 8px #4ade80}
.dot-off{background:#6b7280}
</style></head><body>
<h1>ClawOps Outbound Lead System</h1>
<p class="sub"><span class="status-dot" id="dot"></span><span id="state">Loading...</span></p>
<div class="grid">
<div class="card"><div class="val" id="sent">-</div><div class="label">SMS Sent</div></div>
<div class="card"><div class="val" id="replied">-</div><div class="label">Replied</div></div>
<div class="card"><div class="val" id="called">-</div><div class="label">Called Back</div></div>
<div class="card"><div class="val" id="demoBooked">-</div><div class="label">Demos</div></div>
<div class="card"><div class="val" id="failed">-</div><div class="label">Failed</div></div>
<div class="card"><div class="val" id="queue">-</div><div class="label">In Queue</div></div>
</div>
<div class="actions">
<button class="btn-go" onclick="act('start')">Start Campaign</button>
<button class="btn-stop" onclick="act('stop')">Stop</button>
</div>
<div class="log-card"><h3>Activity Log</h3><div class="log" id="log"></div></div>
<script>
async function act(a){const r=await fetch('/'+a,{method:'POST'});const d=await r.json();alert(d.message||d.status||JSON.stringify(d))}
async function refresh(){try{const r=await fetch('/status');const d=await r.json();
document.getElementById('sent').textContent=d.stats.sent;
document.getElementById('replied').textContent=d.stats.replied;
document.getElementById('called').textContent=d.stats.called;
document.getElementById('demoBooked').textContent=d.stats.demoBooked;
document.getElementById('failed').textContent=d.stats.failed;
document.getElementById('queue').textContent=d.queue;
const dot=document.getElementById('dot');
const state=document.getElementById('state');
if(d.running){dot.className='status-dot dot-on';state.textContent='Running since '+new Date(d.startedAt).toLocaleTimeString();}
else{dot.className='status-dot dot-off';state.textContent='Stopped';}
const log=(d.sentLog||[]).reverse().map(l=>'<div class="entry"><span>'+
(l.sentAt||'').substring(11,19)+'</span><span>'+l.company+'</span><span class="badge b-sent">'+
l.niche+'</span><span>#'+l.attempt+'</span><span class="badge '+(l.status==='sent'?'b-sent':'b-failed')+'">'+l.status+'</span></div>').join('');
document.getElementById('log').innerHTML=log;
}catch(e){console.error(e)}}
refresh();setInterval(refresh,5000);
</script></body></html>`;
}

server.listen(PORT, () => {
  console.log(`\\nClawOps Outbound Lead Orchestrator`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`Location: ${LOCATION_ID}`);
  console.log(`SMS interval: ${SMS_INTERVAL_MS / 1000}s`);
  console.log(`Business hours: ${CALLING_HOURS_START}:00 - ${CALLING_HOURS_END}:00 ET`);
  console.log(`Max SMS attempts: ${MAX_SMS_ATTEMPTS}`);
  console.log(`\\nAuto-starting campaign...\\n`);
  
  // Auto-start campaign on boot
  campaign.running = true;
  campaign.startedAt = new Date().toISOString();
  processNextLead();
});
