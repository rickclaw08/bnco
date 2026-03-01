#!/usr/bin/env node
/**
 * Email Sender - ClawOps Lead Generation
 * 
 * Sends approved outreach emails with rate limiting to avoid spam flags.
 * Uses Nodemailer with SMTP (iCloud Mail, Gmail, or custom SMTP).
 * 
 * Usage:
 *   node send-approved.js              - Send all approved drafts
 *   node send-approved.js --dry-run    - Preview what would be sent
 *   node send-approved.js --limit 5    - Send max 5 emails this run
 * 
 * Environment Variables:
 *   SMTP_HOST       - SMTP server (default: smtp.mail.me.com for iCloud)
 *   SMTP_PORT       - SMTP port (default: 587)
 *   SMTP_USER       - SMTP username / email
 *   SMTP_PASS       - SMTP password or app-specific password
 *   SENDER_EMAIL    - From address
 *   SENDER_NAME     - From name
 *   SEND_RATE_LIMIT - Max emails per hour (default: 10)
 *   SEND_DELAY_MS   - Delay between sends in ms (default: 30000 = 30s)
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const APPROVED_DIR = path.join(__dirname, 'approved');
const DRAFT_DIR = path.join(__dirname, 'drafts');
const SENT_DIR = path.join(__dirname, 'sent');
const LOG_DIR = process.env.LEAD_GEN_LOG_DIR || path.join(__dirname, 'logs');

// Ensure directories exist
[APPROVED_DIR, SENT_DIR, LOG_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ============================================================
// Configuration
// ============================================================

const CONFIG = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  senderEmail: process.env.SENDER_EMAIL || process.env.SMTP_USER || '',
  senderName: process.env.SENDER_NAME || 'Rick Claw',
  rateLimit: parseInt(process.env.SEND_RATE_LIMIT || '10', 10), // per hour
  delayMs: parseInt(process.env.SEND_DELAY_MS || '90000', 10),   // between sends (90s default, randomized in send loop)
  maxPerRun: 20,
  dryRun: false,
};

// ============================================================
// Logging
// ============================================================

function logSend(action, draftId, detail = '') {
  const logFile = path.join(LOG_DIR, 'sends.log');
  const entry = `[${new Date().toISOString()}] ${action.toUpperCase()} ${draftId}${detail ? ' | ' + detail : ''}\n`;
  fs.appendFileSync(logFile, entry);
  console.log(entry.trim());
}

// ============================================================
// Rate Limiting
// ============================================================

function getRateLimitState() {
  const stateFile = path.join(LOG_DIR, 'rate-limit-state.json');
  if (fs.existsSync(stateFile)) {
    try {
      return JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    } catch {
      return { sends: [] };
    }
  }
  return { sends: [] };
}

function saveRateLimitState(state) {
  const stateFile = path.join(LOG_DIR, 'rate-limit-state.json');
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function checkRateLimit() {
  const state = getRateLimitState();
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  // Clean old entries
  state.sends = state.sends.filter(ts => ts > oneHourAgo);
  saveRateLimitState(state);

  return {
    allowed: state.sends.length < CONFIG.rateLimit,
    sentThisHour: state.sends.length,
    remaining: CONFIG.rateLimit - state.sends.length,
  };
}

function recordSend() {
  const state = getRateLimitState();
  state.sends.push(Date.now());
  saveRateLimitState(state);
}

// ============================================================
// Email Sending
// ============================================================

function createTransporter() {
  if (!CONFIG.smtp.auth.user || !CONFIG.smtp.auth.pass) {
    throw new Error(
      'SMTP credentials not configured. Set SMTP_USER and SMTP_PASS environment variables.\n' +
      'For iCloud Mail: use an app-specific password from appleid.apple.com\n' +
      'For Gmail: use an app password from myaccount.google.com/apppasswords'
    );
  }

  return nodemailer.createTransport({
    host: CONFIG.smtp.host,
    port: CONFIG.smtp.port,
    secure: CONFIG.smtp.secure,
    auth: CONFIG.smtp.auth,
    tls: {
      rejectUnauthorized: true,
    },
  });
}

async function verifyTransporter(transporter) {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully.');
    return true;
  } catch (err) {
    console.error('SMTP connection failed:', err.message);
    return false;
  }
}

async function sendEmail(transporter, draft) {
  const mailOptions = {
    from: `"${CONFIG.senderName}" <${CONFIG.senderEmail}>`,
    to: draft.to,
    subject: draft.subject,
    text: draft.body,
    // Add some headers to improve deliverability
    headers: {
      'X-Priority': '3', // Normal priority
      'X-Mailer': 'ClawOps Lead Pipeline',
    },
  };

  if (CONFIG.dryRun) {
    console.log('\n[DRY RUN] Would send:');
    console.log(`  To:      ${draft.to}`);
    console.log(`  Subject: ${draft.subject}`);
    console.log(`  Body:    ${draft.body.substring(0, 100)}...`);
    return { messageId: 'dry-run', accepted: [draft.to] };
  }

  const result = await transporter.sendMail(mailOptions);
  return result;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// Main
// ============================================================

async function sendApproved() {
  console.log('\n=== ClawOps Email Sender ===\n');

  // Load approved drafts from both approved/ and drafts/ directories
  const approvedFiles = fs.readdirSync(APPROVED_DIR).filter(f => f.endsWith('.json'));
  const draftFiles = fs.readdirSync(DRAFT_DIR).filter(f => f.endsWith('.json'));
  const files = [...approvedFiles.map(f => ({ dir: APPROVED_DIR, file: f })), ...draftFiles.map(f => ({ dir: DRAFT_DIR, file: f }))];
  const approved = [];

  for (const { dir, file } of files) {
    try {
      const draft = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
      draft._sourceDir = dir;
      draft._sourceFile = file;
      if (draft.status === 'approved' && draft.to) {
        approved.push(draft);
      } else if (!draft.to) {
        console.log(`Skipping ${draft.businessName}: no email address`);
        logSend('SKIP', draft.id, 'No email address');
      }
    } catch (err) {
      console.error(`Error reading ${file}: ${err.message}`);
    }
  }

  if (approved.length === 0) {
    console.log('No approved drafts with email addresses to send.');
    return;
  }

  console.log(`Found ${approved.length} approved draft(s) ready to send.`);

  // Check rate limit
  const rateStatus = checkRateLimit();
  console.log(`Rate limit: ${rateStatus.sentThisHour}/${CONFIG.rateLimit} sent this hour (${rateStatus.remaining} remaining)`);

  if (!rateStatus.allowed) {
    console.log('Rate limit reached. Try again later.');
    return;
  }

  const maxToSend = Math.min(approved.length, rateStatus.remaining, CONFIG.maxPerRun);
  console.log(`Will send up to ${maxToSend} email(s) this run.`);

  // Set up transporter (skip for dry run)
  let transporter = null;
  if (!CONFIG.dryRun) {
    try {
      transporter = createTransporter();
      const verified = await verifyTransporter(transporter);
      if (!verified) {
        console.error('Cannot proceed without valid SMTP connection.');
        process.exit(1);
      }
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  // Send emails
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < maxToSend; i++) {
    const draft = approved[i];

    // Re-check rate limit before each send
    if (!CONFIG.dryRun) {
      const check = checkRateLimit();
      if (!check.allowed) {
        console.log('Rate limit reached mid-run. Stopping.');
        break;
      }
    }

    console.log(`\n[${i + 1}/${maxToSend}] Sending to ${draft.to} (${draft.businessName})...`);

    try {
      const result = await sendEmail(transporter, draft);

      // Mark as sent
      draft.status = 'sent';
      draft.sentAt = new Date().toISOString();
      draft.messageId = result.messageId;

      // Update draft file (in its source directory)
      const sourcePath = path.join(draft._sourceDir, draft._sourceFile);
      if (fs.existsSync(sourcePath)) {
        const cleanDraft = { ...draft };
        delete cleanDraft._sourceDir;
        delete cleanDraft._sourceFile;
        fs.writeFileSync(sourcePath, JSON.stringify(cleanDraft, null, 2));
      }

      // Move to sent directory
      fs.writeFileSync(path.join(SENT_DIR, `${draft.id}.json`), JSON.stringify(draft, null, 2));

      // Remove from approved directory
      const approvedPath = path.join(APPROVED_DIR, `${draft.id}.json`);
      if (fs.existsSync(approvedPath)) {
        fs.unlinkSync(approvedPath);
      }

      // Record for rate limiting
      if (!CONFIG.dryRun) {
        recordSend();
      }

      logSend('SENT', draft.id, `to=${draft.to} messageId=${result.messageId}`);
      sent++;

      // Delay between sends (randomized 60-120 seconds)
      if (i < maxToSend - 1) {
        const randomDelay = 60000 + Math.floor(Math.random() * 60000);
        console.log(`  Waiting ${Math.round(randomDelay / 1000)}s before next send...`);
        await sleep(randomDelay);
      }
    } catch (err) {
      console.error(`  Failed to send to ${draft.to}: ${err.message}`);
      logSend('FAIL', draft.id, `to=${draft.to} error=${err.message}`);
      failed++;

      // Still wait to avoid hammering
      await sleep(5000);
    }
  }

  // Summary
  console.log('\n--- SEND SUMMARY ---');
  console.log(`Sent:     ${sent}`);
  console.log(`Failed:   ${failed}`);
  console.log(`Skipped:  ${approved.length - sent - failed}`);
  console.log('--------------------\n');
}

// ============================================================
// CLI
// ============================================================

if (require.main === module) {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') {
      CONFIG.dryRun = true;
    } else if (args[i] === '--limit' && args[i + 1]) {
      CONFIG.maxPerRun = parseInt(args[i + 1], 10);
      i++;
    }
  }

  if (CONFIG.dryRun) {
    console.log('*** DRY RUN MODE - No emails will actually be sent ***');
  }

  sendApproved()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Sender failed:', err);
      process.exit(1);
    });
}

module.exports = { sendApproved, CONFIG };
