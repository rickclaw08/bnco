// enrichment.js - Fetches follower counts for accounts we follow
//
// Runs hourly. Updates SQLite database with current follower counts
// and records history for trend tracking.

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getClient, sleep, randomDelay, timestamp } from './ig-client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const DB_PATH = path.join(__dirname, config.database);
const LOG_DIR = path.join(__dirname, config.logDir);
const LOG_FILE = path.join(LOG_DIR, `enrichment-${new Date().toISOString().slice(0, 10)}.log`);

fs.mkdirSync(LOG_DIR, { recursive: true });

function log(message) {
  const line = `[${timestamp()}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// How many accounts to enrich per run (avoid rate limits)
const BATCH_SIZE = 50;
// Delay between API calls in seconds
const DELAY_MIN = 2;
const DELAY_MAX = 5;

async function main() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  const runInsert = db.prepare('INSERT INTO run_log (run_type) VALUES (?)');
  const runResult = runInsert.run('enrichment');
  const runId = runResult.lastInsertRowid;

  try {
    log('=== Enrichment Starting ===');

    const ig = await getClient();

    // Get accounts we follow that need enrichment
    // Priority: never enriched, then oldest updated
    const accounts = db.prepare(`
      SELECT user_id, username FROM accounts
      WHERE we_follow_them = 1
      ORDER BY
        CASE WHEN follower_count = 0 THEN 0 ELSE 1 END,
        last_updated ASC
      LIMIT ?
    `).all(BATCH_SIZE);

    if (accounts.length === 0) {
      log('No accounts to enrich. Run unfollow-manager first to populate the database.');
      db.prepare(
        'UPDATE run_log SET finished_at = datetime(\'now\'), accounts_processed = 0, status = ? WHERE id = ?'
      ).run('completed', runId);
      db.close();
      return;
    }

    log(`Enriching ${accounts.length} accounts...`);

    const updateAccount = db.prepare(`
      UPDATE accounts SET
        follower_count = ?,
        following_count = ?,
        is_protected = CASE WHEN ? >= ${config.protectedFollowerThreshold} THEN 1 ELSE 0 END,
        last_updated = datetime('now')
      WHERE user_id = ?
    `);

    const insertHistory = db.prepare(`
      INSERT INTO follower_history (user_id, follower_count) VALUES (?, ?)
    `);

    let processed = 0;
    let errors = 0;

    for (const account of accounts) {
      try {
        const userInfo = await ig.user.info(account.user_id);

        updateAccount.run(
          userInfo.follower_count,
          userInfo.following_count,
          userInfo.follower_count,
          account.user_id
        );

        insertHistory.run(account.user_id, userInfo.follower_count);

        processed++;
        const protectedLabel = userInfo.follower_count >= config.protectedFollowerThreshold ? ' [PROTECTED]' : '';
        log(`Enriched @${account.username}: ${userInfo.follower_count} followers, ${userInfo.following_count} following${protectedLabel}`);

        // Delay between requests
        if (processed < accounts.length) {
          await randomDelay(DELAY_MIN, DELAY_MAX);
        }
      } catch (err) {
        errors++;
        log(`ERROR enriching @${account.username}: ${err.message}`);

        // Stop on rate limit or challenge
        if (err.message.includes('challenge') || err.message.includes('rate') ||
            err.message.includes('login_required') || err.message.includes('checkpoint')) {
          log('CRITICAL: Rate limit or challenge detected. Stopping enrichment.');
          break;
        }

        // Brief pause after errors
        await sleep(5000);
      }
    }

    db.prepare(
      'UPDATE run_log SET finished_at = datetime(\'now\'), accounts_processed = ?, status = ? WHERE id = ?'
    ).run(processed, errors > 0 ? 'partial' : 'completed', runId);

    log(`=== Enrichment Complete: ${processed} enriched, ${errors} errors ===`);

    // Log some stats
    const protectedCount = db.prepare(
      'SELECT COUNT(*) as cnt FROM accounts WHERE is_protected = 1'
    ).get();
    const totalFollowing = db.prepare(
      'SELECT COUNT(*) as cnt FROM accounts WHERE we_follow_them = 1'
    ).get();

    log(`Protected accounts (${config.protectedFollowerThreshold}+ followers): ${protectedCount.cnt}`);
    log(`Total accounts we follow (in DB): ${totalFollowing.cnt}`);

  } catch (err) {
    log(`FATAL ERROR: ${err.message}`);
    db.prepare(
      'UPDATE run_log SET finished_at = datetime(\'now\'), status = ?, error_message = ? WHERE id = ?'
    ).run('error', err.message, runId);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

main();
