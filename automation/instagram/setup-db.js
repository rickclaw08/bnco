// setup-db.js - Initialize SQLite database schema
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'accounts.db');

// Ensure data directory exists
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    is_following_us INTEGER DEFAULT 0,
    we_follow_them INTEGER DEFAULT 0,
    is_protected INTEGER DEFAULT 0,
    first_seen TEXT DEFAULT (datetime('now')),
    last_updated TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS follower_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    follower_count INTEGER NOT NULL,
    recorded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES accounts(user_id)
  );

  CREATE TABLE IF NOT EXISTS unfollow_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    follower_count INTEGER DEFAULT 0,
    reason TEXT DEFAULT 'non_follower',
    unfollowed_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS run_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_type TEXT NOT NULL,
    started_at TEXT DEFAULT (datetime('now')),
    finished_at TEXT,
    accounts_processed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'running',
    error_message TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);
  CREATE INDEX IF NOT EXISTS idx_accounts_we_follow ON accounts(we_follow_them);
  CREATE INDEX IF NOT EXISTS idx_accounts_follows_us ON accounts(is_following_us);
  CREATE INDEX IF NOT EXISTS idx_history_user ON follower_history(user_id);
  CREATE INDEX IF NOT EXISTS idx_history_date ON follower_history(recorded_at);
  CREATE INDEX IF NOT EXISTS idx_unfollow_date ON unfollow_log(unfollowed_at);
`);

console.log('Database initialized at:', dbPath);
db.close();
