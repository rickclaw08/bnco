// daily-report.js - Sends a daily email summary of Instagram management activity
//
// Runs once daily at 9 PM EST. Sends clean HTML email with stats.
//
// Required env vars:
//   SMTP_HOST     - SMTP server hostname
//   SMTP_PORT     - SMTP port (default: 587)
//   SMTP_USER     - SMTP username/email
//   SMTP_PASS     - SMTP password or app password
//   SMTP_FROM     - Sender email address (defaults to SMTP_USER)

import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { timestamp } from './ig-client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const DB_PATH = path.join(__dirname, config.database);
const LOG_DIR = path.join(__dirname, config.logDir);
const LOG_FILE = path.join(LOG_DIR, `report-${new Date().toISOString().slice(0, 10)}.log`);

fs.mkdirSync(LOG_DIR, { recursive: true });

function log(message) {
  const line = `[${timestamp()}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function getStats(db) {
  const today = new Date().toISOString().slice(0, 10);

  // Unfollows today
  const unfollowedToday = db.prepare(`
    SELECT COUNT(*) as cnt FROM unfollow_log
    WHERE date(unfollowed_at) = ?
  `).get(today);

  // Recent unfollows with details
  const recentUnfollows = db.prepare(`
    SELECT username, follower_count, unfollowed_at
    FROM unfollow_log
    WHERE date(unfollowed_at) = ?
    ORDER BY unfollowed_at DESC
    LIMIT 25
  `).all(today);

  // Current counts
  const totalFollowing = db.prepare(
    'SELECT COUNT(*) as cnt FROM accounts WHERE we_follow_them = 1'
  ).get();

  const totalFollowers = db.prepare(
    'SELECT COUNT(*) as cnt FROM accounts WHERE is_following_us = 1'
  ).get();

  // Protected accounts
  const protectedAccounts = db.prepare(
    'SELECT COUNT(*) as cnt FROM accounts WHERE is_protected = 1'
  ).get();

  // Non-followers remaining
  const nonFollowers = db.prepare(
    'SELECT COUNT(*) as cnt FROM accounts WHERE we_follow_them = 1 AND is_following_us = 0 AND is_protected = 0'
  ).get();

  // Follower growth (compare earliest and latest records from today)
  const followerGrowth = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM accounts WHERE is_following_us = 1) -
      COALESCE((SELECT accounts_processed FROM run_log
        WHERE run_type = 'unfollow' AND date(started_at) = ?
        ORDER BY started_at ASC LIMIT 1), 0) as net_change
  `).get(today);

  // Run history today
  const runsToday = db.prepare(`
    SELECT run_type, status, accounts_processed, started_at
    FROM run_log
    WHERE date(started_at) = ?
    ORDER BY started_at DESC
  `).all(today);

  // Unfollows over last 7 days
  const weeklyUnfollows = db.prepare(`
    SELECT date(unfollowed_at) as day, COUNT(*) as cnt
    FROM unfollow_log
    WHERE unfollowed_at >= datetime('now', '-7 days')
    GROUP BY date(unfollowed_at)
    ORDER BY day DESC
  `).all();

  // Top protected accounts
  const topProtected = db.prepare(`
    SELECT username, follower_count
    FROM accounts
    WHERE is_protected = 1
    ORDER BY follower_count DESC
    LIMIT 10
  `).all();

  return {
    date: today,
    unfollowedToday: unfollowedToday.cnt,
    recentUnfollows,
    following: totalFollowing.cnt,
    followers: totalFollowers.cnt,
    ratio: totalFollowers.cnt > 0
      ? (totalFollowing.cnt / totalFollowers.cnt).toFixed(2)
      : 'N/A',
    protectedCount: protectedAccounts.cnt,
    nonFollowersRemaining: nonFollowers.cnt,
    runsToday,
    weeklyUnfollows,
    topProtected
  };
}

function buildHtml(stats) {
  const unfollowRows = stats.recentUnfollows.map(u =>
    `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;">@${u.username}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${u.follower_count.toLocaleString()}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;">${new Date(u.unfollowed_at).toLocaleTimeString()}</td>
    </tr>`
  ).join('');

  const weeklyRows = stats.weeklyUnfollows.map(w =>
    `<tr>
      <td style="padding:4px 12px;border-bottom:1px solid #eee;">${w.day}</td>
      <td style="padding:4px 12px;border-bottom:1px solid #eee;text-align:right;">${w.cnt}</td>
    </tr>`
  ).join('');

  const protectedRows = stats.topProtected.map(p =>
    `<tr>
      <td style="padding:4px 12px;border-bottom:1px solid #eee;">@${p.username}</td>
      <td style="padding:4px 12px;border-bottom:1px solid #eee;text-align:right;">${p.follower_count.toLocaleString()}</td>
    </tr>`
  ).join('');

  const runRows = stats.runsToday.map(r =>
    `<tr>
      <td style="padding:4px 8px;border-bottom:1px solid #eee;">${r.run_type}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #eee;">${r.status}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;">${r.accounts_processed}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #eee;">${new Date(r.started_at).toLocaleTimeString()}</td>
    </tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">

  <div style="background:linear-gradient(135deg,#405DE6,#5851DB,#833AB4,#C13584,#E1306C,#FD1D1D);padding:20px 24px;border-radius:12px;margin-bottom:24px;">
    <h1 style="color:white;margin:0;font-size:22px;">Instagram Daily Report</h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">${stats.date}</p>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
    <div style="background:#f8f9fa;padding:16px;border-radius:8px;text-align:center;">
      <div style="font-size:28px;font-weight:bold;color:#E1306C;">${stats.unfollowedToday}</div>
      <div style="font-size:13px;color:#666;margin-top:4px;">Unfollowed Today</div>
    </div>
    <div style="background:#f8f9fa;padding:16px;border-radius:8px;text-align:center;">
      <div style="font-size:28px;font-weight:bold;color:#405DE6;">${stats.ratio}</div>
      <div style="font-size:13px;color:#666;margin-top:4px;">Following/Follower Ratio</div>
    </div>
    <div style="background:#f8f9fa;padding:16px;border-radius:8px;text-align:center;">
      <div style="font-size:28px;font-weight:bold;color:#833AB4;">${stats.followers.toLocaleString()}</div>
      <div style="font-size:13px;color:#666;margin-top:4px;">Followers (in DB)</div>
    </div>
    <div style="background:#f8f9fa;padding:16px;border-radius:8px;text-align:center;">
      <div style="font-size:28px;font-weight:bold;color:#5851DB;">${stats.following.toLocaleString()}</div>
      <div style="font-size:13px;color:#666;margin-top:4px;">Following (in DB)</div>
    </div>
  </div>

  <div style="background:#fff3cd;padding:12px 16px;border-radius:8px;margin-bottom:24px;border-left:4px solid #ffc107;">
    <strong>Remaining non-followers (unprotected):</strong> ${stats.nonFollowersRemaining}
    &nbsp;|&nbsp;
    <strong>Protected accounts:</strong> ${stats.protectedCount}
  </div>

  ${stats.recentUnfollows.length > 0 ? `
  <h2 style="font-size:16px;margin-bottom:8px;">Today's Unfollows</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#f0f0f0;">
        <th style="padding:8px 12px;text-align:left;">Account</th>
        <th style="padding:8px 12px;text-align:right;">Followers</th>
        <th style="padding:8px 12px;text-align:left;">Time</th>
      </tr>
    </thead>
    <tbody>${unfollowRows}</tbody>
  </table>` : '<p style="color:#666;">No unfollows today.</p>'}

  ${stats.weeklyUnfollows.length > 0 ? `
  <h2 style="font-size:16px;margin-bottom:8px;">Weekly Unfollow Trend</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#f0f0f0;">
        <th style="padding:6px 12px;text-align:left;">Date</th>
        <th style="padding:6px 12px;text-align:right;">Unfollowed</th>
      </tr>
    </thead>
    <tbody>${weeklyRows}</tbody>
  </table>` : ''}

  ${stats.topProtected.length > 0 ? `
  <h2 style="font-size:16px;margin-bottom:8px;">Top Protected Accounts</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#f0f0f0;">
        <th style="padding:6px 12px;text-align:left;">Account</th>
        <th style="padding:6px 12px;text-align:right;">Followers</th>
      </tr>
    </thead>
    <tbody>${protectedRows}</tbody>
  </table>` : ''}

  <h2 style="font-size:16px;margin-bottom:8px;">Run History (Today)</h2>
  ${stats.runsToday.length > 0 ? `
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#f0f0f0;">
        <th style="padding:6px 8px;text-align:left;">Type</th>
        <th style="padding:6px 8px;text-align:left;">Status</th>
        <th style="padding:6px 8px;text-align:right;">Processed</th>
        <th style="padding:6px 8px;text-align:left;">Started</th>
      </tr>
    </thead>
    <tbody>${runRows}</tbody>
  </table>` : '<p style="color:#666;">No runs recorded today.</p>'}

  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;color:#999;font-size:12px;">
    Generated by ClawOps Instagram Manager | ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST
  </div>

</body>
</html>`;
}

async function main() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  try {
    log('=== Daily Report Starting ===');

    // Validate SMTP config
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error(
        'Missing SMTP configuration. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.'
      );
    }

    // Gather stats
    const stats = getStats(db);
    log(`Stats gathered: ${stats.unfollowedToday} unfollowed, ratio ${stats.ratio}`);

    // Build email
    const html = buildHtml(stats);

    // Configure transport
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"ClawOps Instagram Manager" <${smtpFrom}>`,
      to: config.emailRecipient,
      subject: `Instagram Report - ${stats.date} | ${stats.unfollowedToday} unfollowed, ratio ${stats.ratio}`,
      html: html
    });

    log(`Email sent to ${config.emailRecipient} (ID: ${info.messageId})`);
    log('=== Daily Report Complete ===');

  } catch (err) {
    log(`FATAL ERROR: ${err.message}`);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

main();
