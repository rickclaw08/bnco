#!/usr/bin/env node

/**
 * Daily Summary Generator
 * 
 * Compiles all Initiative Engine activity from today into a clean
 * HTML email and sends it to the configured recipient.
 * 
 * Run: node daily-summary.js
 * Schedule: daily at 10 PM EST via cron
 */

const fs = require('fs');
const path = require('path');

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch {
  // nodemailer is optional - summary will be saved to file if unavailable
  nodemailer = null;
}

// ============================================================
// Configuration
// ============================================================

const CONFIG_PATH = path.join(__dirname, 'config.json');
const WORKSPACE = path.resolve(__dirname, '../../');

let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (err) {
  console.error(`[FATAL] Cannot read config: ${err.message}`);
  process.exit(1);
}

const LOGS_DIR = path.join(WORKSPACE, config.logging.logDir);
const DAILY_DIR = path.join(LOGS_DIR, 'daily');
const PENDING_FILE = path.join(WORKSPACE, config.logging.pendingFile);

// Ensure daily dir exists
if (!fs.existsSync(DAILY_DIR)) {
  fs.mkdirSync(DAILY_DIR, { recursive: true });
}

// ============================================================
// Collect today's run logs
// ============================================================

function getTodayRunLogs() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  let logFiles;
  try {
    logFiles = fs.readdirSync(LOGS_DIR)
      .filter(f => f.startsWith('run-') && f.endsWith('.json'))
      .filter(f => f.includes(todayStr));
  } catch (err) {
    console.error(`[ERROR] Cannot read logs dir: ${err.message}`);
    return [];
  }

  const logs = [];
  for (const file of logFiles) {
    try {
      const content = fs.readFileSync(path.join(LOGS_DIR, file), 'utf8');
      logs.push(JSON.parse(content));
    } catch (err) {
      console.error(`[WARN] Cannot parse ${file}: ${err.message}`);
    }
  }

  return logs;
}

// ============================================================
// Get pending approvals
// ============================================================

function getPendingApprovals() {
  try {
    if (fs.existsSync(PENDING_FILE)) {
      const data = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
      return data.filter(item => item.status === 'pending');
    }
  } catch (err) {
    console.error(`[WARN] Cannot read pending file: ${err.message}`);
  }
  return [];
}

// ============================================================
// Build HTML summary
// ============================================================

function buildHtmlSummary(runLogs, pendingApprovals) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York'
  });

  // Aggregate stats
  let totalFilesScanned = 0;
  let totalOpportunities = 0;
  let totalSafeExecuted = 0;
  let totalRiskyQueued = 0;
  let totalErrors = 0;
  const allSafeChanges = [];
  const allRiskyChanges = [];
  const allOpportunities = [];

  for (const log of runLogs) {
    totalFilesScanned += log.stats?.filesScanned || 0;
    totalOpportunities += log.stats?.opportunitiesFound || 0;
    totalSafeExecuted += log.stats?.safeExecuted || 0;
    totalRiskyQueued += log.stats?.riskyQueued || 0;
    totalErrors += log.stats?.errorsEncountered || 0;
    if (log.safeChanges) allSafeChanges.push(...log.safeChanges);
    if (log.riskyChanges) allRiskyChanges.push(...log.riskyChanges);
    if (log.opportunities) allOpportunities.push(...log.opportunities);
  }

  const runsCount = runLogs.length;

  // Build HTML
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; color: #333; background: #f7f7f7; }
    .container { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #1a1a2e; font-size: 22px; margin-bottom: 5px; }
    .date { color: #666; font-size: 14px; margin-bottom: 25px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0; }
    .stat-box { background: #f0f4ff; border-radius: 6px; padding: 15px; text-align: center; }
    .stat-number { font-size: 28px; font-weight: bold; color: #1a1a2e; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .section { margin: 25px 0; }
    .section-title { font-size: 16px; font-weight: 600; color: #1a1a2e; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; margin-bottom: 12px; }
    .change-item { background: #f9f9f9; border-left: 3px solid #4CAF50; padding: 10px 15px; margin: 8px 0; border-radius: 0 4px 4px 0; font-size: 14px; }
    .change-item.risky { border-left-color: #FF9800; }
    .change-item.pending { border-left-color: #f44336; }
    .change-type { font-weight: 600; color: #333; }
    .change-file { color: #666; font-size: 13px; font-family: monospace; }
    .change-desc { color: #555; margin-top: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-safe { background: #e8f5e9; color: #2e7d32; }
    .badge-risky { background: #fff3e0; color: #e65100; }
    .badge-pending { background: #fce4ec; color: #c62828; }
    .no-items { color: #999; font-style: italic; font-size: 14px; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Initiative Engine - Daily Report</h1>
    <div class="date">${today}</div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-number">${runsCount}</div>
        <div class="stat-label">Engine Runs</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${totalFilesScanned}</div>
        <div class="stat-label">Files Scanned</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${totalSafeExecuted}</div>
        <div class="stat-label">Safe Changes Made</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${totalRiskyQueued}</div>
        <div class="stat-label">Risky - Needs Review</div>
      </div>
    </div>`;

  // Safe changes section
  html += `
    <div class="section">
      <div class="section-title">Safe Changes Executed</div>`;

  if (allSafeChanges.length === 0) {
    html += `<div class="no-items">No safe changes were made today.</div>`;
  } else {
    for (const change of allSafeChanges) {
      html += `
      <div class="change-item">
        <span class="badge badge-safe">SAFE</span>
        <span class="change-type">${escapeHtml(change.type)}</span>
        <div class="change-file">${escapeHtml(change.file)}</div>
        <div class="change-desc">${escapeHtml(change.description)}</div>
      </div>`;
    }
  }
  html += `</div>`;

  // Risky changes section
  html += `
    <div class="section">
      <div class="section-title">Risky Changes (Queued for Approval)</div>`;

  if (allRiskyChanges.length === 0) {
    html += `<div class="no-items">No risky changes were detected today.</div>`;
  } else {
    for (const change of allRiskyChanges) {
      html += `
      <div class="change-item risky">
        <span class="badge badge-risky">RISKY</span>
        <span class="change-type">${escapeHtml(change.type)}</span>
        <div class="change-file">${escapeHtml(change.file)}</div>
        <div class="change-desc">${escapeHtml(change.description)}</div>
      </div>`;
    }
  }
  html += `</div>`;

  // Pending approvals (cumulative)
  html += `
    <div class="section">
      <div class="section-title">Pending Approvals (Total Backlog)</div>`;

  if (pendingApprovals.length === 0) {
    html += `<div class="no-items">No pending approvals. All clear!</div>`;
  } else {
    for (const item of pendingApprovals) {
      html += `
      <div class="change-item pending">
        <span class="badge badge-pending">PENDING</span>
        <span class="change-type">${escapeHtml(item.type)}</span>
        <div class="change-file">${escapeHtml(item.file)}</div>
        <div class="change-desc">${escapeHtml(item.description)}</div>
      </div>`;
    }
    html += `
      <p style="font-size: 13px; color: #666;">
        Run <code>node automation/initiative-engine/approve.js</code> to review these.
      </p>`;
  }
  html += `</div>`;

  // Opportunities noted but not acted on
  if (allOpportunities.length > 0) {
    html += `
    <div class="section">
      <div class="section-title">Opportunities Spotted (Not Acted On)</div>`;
    for (const opp of allOpportunities.slice(0, 15)) {
      html += `
      <div class="change-item" style="border-left-color: #9e9e9e;">
        <span class="change-type">${escapeHtml(opp.type)}</span>
        <div class="change-file">${escapeHtml(opp.file)}</div>
        <div class="change-desc">${escapeHtml(opp.description)}${opp.status ? ' (' + escapeHtml(opp.status) + ')' : ''}</div>
      </div>`;
    }
    if (allOpportunities.length > 15) {
      html += `<div class="no-items">...and ${allOpportunities.length - 15} more.</div>`;
    }
    html += `</div>`;
  }

  // Errors
  if (totalErrors > 0) {
    html += `
    <div class="section">
      <div class="section-title">Errors Encountered</div>
      <p style="color: #c62828; font-size: 14px;">${totalErrors} error(s) occurred during today's runs. Check the run logs for details.</p>
    </div>`;
  }

  html += `
    <div class="footer">
      Initiative Engine by ClawOps<br>
      Automated report generated at ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })} EST
    </div>
  </div>
</body>
</html>`;

  return html;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// Email sender
// ============================================================

async function sendEmail(html) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  if (!nodemailer || !smtpHost || !smtpUser || !smtpPass) {
    const reason = !nodemailer ? 'nodemailer not installed' : 'SMTP not configured';
    console.log(`[WARN] ${reason}. Saving summary to file instead.`);
    const today = new Date().toISOString().slice(0, 10);
    const summaryPath = path.join(DAILY_DIR, `summary-${today}.html`);
    fs.writeFileSync(summaryPath, html);
    console.log(`[INFO] Summary saved to: ${summaryPath}`);
    return { sent: false, savedTo: summaryPath };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: parseInt(smtpPort, 10) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York'
  });

  const mailOptions = {
    from: smtpFrom || smtpUser,
    to: config.emailRecipient,
    subject: `Initiative Engine Report - ${today}`,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[INFO] Email sent: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[ERROR] Failed to send email: ${err.message}`);
    // Fall back to file
    const todayStr = new Date().toISOString().slice(0, 10);
    const summaryPath = path.join(DAILY_DIR, `summary-${todayStr}.html`);
    fs.writeFileSync(summaryPath, html);
    console.log(`[INFO] Summary saved to: ${summaryPath}`);
    return { sent: false, error: err.message, savedTo: summaryPath };
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('[Daily Summary] Generating daily summary...');

  const runLogs = getTodayRunLogs();
  const pendingApprovals = getPendingApprovals();

  console.log(`[Daily Summary] Found ${runLogs.length} runs today`);
  console.log(`[Daily Summary] ${pendingApprovals.length} pending approvals in backlog`);

  const html = buildHtmlSummary(runLogs, pendingApprovals);
  const result = await sendEmail(html);

  // Also always save a local copy
  const todayStr = new Date().toISOString().slice(0, 10);
  const localPath = path.join(DAILY_DIR, `summary-${todayStr}.html`);
  fs.writeFileSync(localPath, html);

  console.log('[Daily Summary] Done.');
  if (result.sent) {
    console.log(`[Daily Summary] Email sent to ${config.emailRecipient}`);
  } else {
    console.log(`[Daily Summary] Email not sent (SMTP not configured or error). Saved locally.`);
  }
}

main().catch(err => {
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
});
