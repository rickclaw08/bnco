// ig-client.js - Shared Instagram client initialization
import { IgApiClient } from 'instagram-private-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_FILE = path.join(__dirname, 'data', '.ig-session.json');

/**
 * Creates and authenticates an Instagram API client.
 * Uses saved session if available, otherwise logs in fresh.
 *
 * Required env vars:
 *   IG_USERNAME - Instagram username
 *   IG_PASSWORD - Instagram password
 */
export async function getClient() {
  const username = process.env.IG_USERNAME;
  const password = process.env.IG_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Missing IG_USERNAME or IG_PASSWORD environment variables. ' +
      'Set them before running any Instagram scripts.'
    );
  }

  const ig = new IgApiClient();
  ig.state.generateDevice(username);

  // Try to restore session
  if (fs.existsSync(SESSION_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      await ig.state.deserialize(saved);
      // Validate session with a lightweight call
      await ig.account.currentUser();
      console.log(`[IG] Session restored for @${username}`);
      return ig;
    } catch (err) {
      console.log('[IG] Saved session invalid, logging in fresh...');
    }
  }

  // Fresh login
  await ig.simulate.preLoginFlow();
  const loggedInUser = await ig.account.login(username, password);
  console.log(`[IG] Logged in as @${loggedInUser.username} (ID: ${loggedInUser.pk})`);

  // Save session for reuse
  const serialized = await ig.state.serialize();
  // Remove large unnecessary keys to keep file small
  delete serialized.constants;
  delete serialized.supportedCapabilities;
  fs.writeFileSync(SESSION_FILE, JSON.stringify(serialized));

  await ig.simulate.postLoginFlow();
  return ig;
}

/**
 * Collects all items from a paginated Instagram feed.
 */
export async function collectAllFromFeed(feed) {
  const items = [];
  do {
    const batch = await feed.items();
    items.push(...batch);
    // Small delay between pages to be gentle on rate limits
    await sleep(1000 + Math.random() * 2000);
  } while (feed.isMoreAvailable());
  return items;
}

/**
 * Sleep helper
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random delay within a range (in seconds)
 */
export async function randomDelay(minSec, maxSec) {
  const ms = (minSec + Math.random() * (maxSec - minSec)) * 1000;
  const sec = (ms / 1000).toFixed(1);
  console.log(`[Delay] Waiting ${sec}s...`);
  await sleep(ms);
}

/**
 * Timestamp for logging
 */
export function timestamp() {
  return new Date().toISOString();
}
