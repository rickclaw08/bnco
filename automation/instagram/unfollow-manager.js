// unfollow-manager.js - Identifies non-followers and unfollows them safely
//
// Protects accounts with 1,500+ followers (configurable threshold).
// Unfollows up to 25 accounts per run with random delays (30-90s).
// Designed to run 6 times daily via cron.

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getClient, collectAllFromFeed, randomDelay, timestamp } from './ig-client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const DB_PATH = path.join(__dirname, config.database);
const LOG_DIR = path.join(__dirname, config.logDir);
const LOG_FILE = path.join(LOG_DIR, `unfollow-${new Date().toISOString().slice(0, 10)}.log`);

// Ensure log directory exists
fs.mkdirSync(LOG_DIR, { recursive: true });

function log(message) {
  const line = `[${timestamp()}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

async function main() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Record this run
  const runInsert = db.prepare(
    'INSERT INTO run_log (run_type) VALUES (?)'
  );
  const runResult = runInsert.run('unfollow');
  const runId = runResult.lastInsertRowid;

  try {
    log('=== Unfollow Manager Starting ===');

    const ig = await getClient();
    const userId = await ig.user.getIdByUsername(process.env.IG_USERNAME);

    // Fetch followers (people who follow us)
    log('Fetching followers list...');
    const followersFeed = ig.feed.accountFollowers(userId);
    const followers = await collectAllFromFeed(followersFeed);
    const followerIds = new Set(followers.map(f => String(f.pk)));
    log(`Found ${followers.length} followers`);

    // Fetch following (people we follow)
    log('Fetching following list...');
    const followingFeed = ig.feed.accountFollowing(userId);
    const following = await collectAllFromFeed(followingFeed);
    log(`Found ${following.length} following`);

    // Update database with current state
    const upsertAccount = db.prepare(`
      INSERT INTO accounts (user_id, username, full_name, is_following_us, we_follow_them, last_updated)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        username = excluded.username,
        full_name = excluded.full_name,
        is_following_us = excluded.is_following_us,
        we_follow_them = excluded.we_follow_them,
        last_updated = datetime('now')
    `);

    const updateFollowing = db.transaction(() => {
      // Mark all as not following us and we don't follow them (reset)
      db.prepare('UPDATE accounts SET is_following_us = 0, we_follow_them = 0').run();

      // Mark followers
      for (const f of followers) {
        upsertAccount.run(String(f.pk), f.username, f.full_name || '', 1, 0);
      }
      // Mark following (may overlap with followers)
      for (const f of following) {
        const existing = db.prepare('SELECT is_following_us FROM accounts WHERE user_id = ?').get(String(f.pk));
        const isFollowingUs = existing ? existing.is_following_us : 0;
        upsertAccount.run(String(f.pk), f.username, f.full_name || '', isFollowingUs, 1);
      }
    });
    updateFollowing();

    // Find non-followers we follow, excluding protected accounts
    const nonFollowers = following.filter(f => !followerIds.has(String(f.pk)));
    log(`Found ${nonFollowers.length} non-followers out of ${following.length} following`);

    // Check protection status from DB (accounts with known high follower counts)
    const getProtected = db.prepare(
      'SELECT user_id FROM accounts WHERE follower_count >= ? AND user_id = ?'
    );

    // Filter out protected accounts
    const candidates = [];
    const protectedSkipped = [];

    for (const user of nonFollowers) {
      const row = getProtected.get(config.protectedFollowerThreshold, String(user.pk));
      if (row) {
        protectedSkipped.push(user);
        db.prepare('UPDATE accounts SET is_protected = 1 WHERE user_id = ?').run(String(user.pk));
      } else {
        candidates.push(user);
      }
    }

    log(`Protected accounts skipped: ${protectedSkipped.length}`);
    log(`Unfollow candidates: ${candidates.length}`);

    // Limit to configured unfollows per run
    const toUnfollow = candidates.slice(0, config.unfollowsPerRun);
    log(`Will unfollow ${toUnfollow.length} accounts this run (limit: ${config.unfollowsPerRun})`);

    const logUnfollow = db.prepare(
      'INSERT INTO unfollow_log (user_id, username, follower_count, reason) VALUES (?, ?, ?, ?)'
    );
    const markUnfollowed = db.prepare(
      'UPDATE accounts SET we_follow_them = 0 WHERE user_id = ?'
    );

    let unfollowedCount = 0;

    for (const user of toUnfollow) {
      try {
        // Get follower count if available in DB
        const acct = db.prepare('SELECT follower_count FROM accounts WHERE user_id = ?').get(String(user.pk));
        const followerCount = acct ? acct.follower_count : 0;

        // Double-check protection threshold with fresh data if available
        if (followerCount >= config.protectedFollowerThreshold) {
          log(`SKIP @${user.username} - ${followerCount} followers (protected)`);
          db.prepare('UPDATE accounts SET is_protected = 1 WHERE user_id = ?').run(String(user.pk));
          continue;
        }

        log(`Unfollowing @${user.username} (followers: ${followerCount})...`);
        await ig.friendship.destroy(user.pk);

        logUnfollow.run(String(user.pk), user.username, followerCount, 'non_follower');
        markUnfollowed.run(String(user.pk));
        unfollowedCount++;

        log(`Unfollowed @${user.username} (${unfollowedCount}/${toUnfollow.length})`);

        // Random delay between unfollows
        if (unfollowedCount < toUnfollow.length) {
          await randomDelay(config.delayRange.minSeconds, config.delayRange.maxSeconds);
        }
      } catch (err) {
        log(`ERROR unfollowing @${user.username}: ${err.message}`);
        // If we hit a rate limit or challenge, stop early
        if (err.message.includes('challenge') || err.message.includes('rate') ||
            err.message.includes('login_required') || err.message.includes('checkpoint')) {
          log('CRITICAL: Rate limit or challenge detected. Stopping early.');
          break;
        }
      }
    }

    // Update run log
    db.prepare(
      'UPDATE run_log SET finished_at = datetime(\'now\'), accounts_processed = ?, status = ? WHERE id = ?'
    ).run(unfollowedCount, 'completed', runId);

    log(`=== Run Complete: Unfollowed ${unfollowedCount} accounts ===`);
    log(`Remaining non-followers (unprotected): ${candidates.length - unfollowedCount}`);

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
