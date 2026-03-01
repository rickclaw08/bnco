#!/usr/bin/env node

/**
 * Approval Handler - Review and act on pending risky changes
 * 
 * CLI tool to approve, reject, or defer risky changes that the
 * Initiative Engine flagged for human review.
 * 
 * Usage:
 *   node approve.js              - Interactive review of all pending items
 *   node approve.js --list       - List all pending items
 *   node approve.js --approve ID - Approve a specific item by ID
 *   node approve.js --reject ID  - Reject a specific item by ID
 *   node approve.js --defer ID   - Defer a specific item (keep pending)
 *   node approve.js --clear      - Remove all resolved (approved/rejected) items
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

const PENDING_FILE = path.join(WORKSPACE, config.logging.pendingFile);
const LOGS_DIR = path.join(WORKSPACE, config.logging.logDir);

// ============================================================
// Pending file management
// ============================================================

function loadPending() {
  try {
    if (fs.existsSync(PENDING_FILE)) {
      return JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
    }
  } catch (err) {
    console.error(`[ERROR] Cannot read pending file: ${err.message}`);
  }
  return [];
}

function savePending(items) {
  try {
    fs.writeFileSync(PENDING_FILE, JSON.stringify(items, null, 2));
  } catch (err) {
    console.error(`[ERROR] Cannot save pending file: ${err.message}`);
    process.exit(1);
  }
}

function logApprovalAction(item, action, note) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    itemId: item.id,
    type: item.type,
    file: item.file,
    description: item.description,
    note: note || null
  };

  const logFile = path.join(LOGS_DIR, 'approval-log.jsonl');
  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (err) {
    console.error(`[WARN] Cannot write approval log: ${err.message}`);
  }
}

// ============================================================
// Display helpers
// ============================================================

function displayItem(item, index) {
  const statusColor = {
    pending: '\x1b[33m',    // yellow
    approved: '\x1b[32m',  // green
    rejected: '\x1b[31m',  // red
    deferred: '\x1b[36m'   // cyan
  };
  const reset = '\x1b[0m';
  const color = statusColor[item.status] || '';

  console.log(`\n  ${index !== undefined ? `[${index + 1}] ` : ''}${color}${item.status.toUpperCase()}${reset}`);
  console.log(`  ID:          ${item.id}`);
  console.log(`  Type:        ${item.type}`);
  console.log(`  File:        ${item.file}`);
  console.log(`  Description: ${item.description}`);
  if (item.reclassifyReason) {
    console.log(`  Reason:      ${item.reclassifyReason}`);
  }
  if (item.details && Object.keys(item.details).length > 0) {
    console.log(`  Details:     ${JSON.stringify(item.details)}`);
  }
  console.log(`  Queued:      ${item.timestamp}`);
}

function listPending(items) {
  const pending = items.filter(i => i.status === 'pending');
  if (pending.length === 0) {
    console.log('\n  No pending items. All clear!\n');
    return;
  }
  console.log(`\n  === ${pending.length} Pending Item(s) ===`);
  pending.forEach((item, i) => displayItem(item, i));
  console.log('');
}

// ============================================================
// Actions
// ============================================================

function approveItem(items, id) {
  const item = items.find(i => i.id === id);
  if (!item) {
    console.error(`[ERROR] Item not found: ${id}`);
    return items;
  }
  if (item.status !== 'pending') {
    console.log(`[INFO] Item already ${item.status}`);
    return items;
  }

  item.status = 'approved';
  item.approvedAt = new Date().toISOString();
  logApprovalAction(item, 'approved');
  console.log(`[APPROVED] ${item.type} on ${item.file}`);
  return items;
}

function rejectItem(items, id) {
  const item = items.find(i => i.id === id);
  if (!item) {
    console.error(`[ERROR] Item not found: ${id}`);
    return items;
  }
  if (item.status !== 'pending') {
    console.log(`[INFO] Item already ${item.status}`);
    return items;
  }

  item.status = 'rejected';
  item.rejectedAt = new Date().toISOString();
  logApprovalAction(item, 'rejected');
  console.log(`[REJECTED] ${item.type} on ${item.file}`);
  return items;
}

function deferItem(items, id) {
  const item = items.find(i => i.id === id);
  if (!item) {
    console.error(`[ERROR] Item not found: ${id}`);
    return items;
  }

  item.status = 'pending'; // Keep as pending
  item.deferredAt = new Date().toISOString();
  item.deferCount = (item.deferCount || 0) + 1;
  logApprovalAction(item, 'deferred');
  console.log(`[DEFERRED] ${item.type} on ${item.file} (deferred ${item.deferCount} time(s))`);
  return items;
}

function clearResolved(items) {
  const resolved = items.filter(i => i.status === 'approved' || i.status === 'rejected');
  const remaining = items.filter(i => i.status !== 'approved' && i.status !== 'rejected');
  console.log(`[INFO] Cleared ${resolved.length} resolved item(s). ${remaining.length} remaining.`);
  return remaining;
}

// ============================================================
// Interactive mode
// ============================================================

async function interactiveReview(items) {
  const pending = items.filter(i => i.status === 'pending');
  if (pending.length === 0) {
    console.log('\n  No pending items to review. All clear!\n');
    return items;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (question) => new Promise(resolve => rl.question(question, resolve));

  console.log(`\n  === Interactive Review: ${pending.length} Pending Item(s) ===`);

  for (let i = 0; i < pending.length; i++) {
    displayItem(pending[i], i);
    
    let validAnswer = false;
    while (!validAnswer) {
      const answer = await ask('\n  Action? (a)pprove / (r)eject / (d)efer / (s)kip / (q)uit: ');
      const choice = answer.trim().toLowerCase();

      switch (choice) {
        case 'a':
        case 'approve':
          items = approveItem(items, pending[i].id);
          validAnswer = true;
          break;
        case 'r':
        case 'reject':
          items = rejectItem(items, pending[i].id);
          validAnswer = true;
          break;
        case 'd':
        case 'defer':
          items = deferItem(items, pending[i].id);
          validAnswer = true;
          break;
        case 's':
        case 'skip':
          console.log('  Skipped.');
          validAnswer = true;
          break;
        case 'q':
        case 'quit':
          console.log('  Quitting review.');
          rl.close();
          return items;
        default:
          console.log('  Invalid choice. Use: a, r, d, s, or q');
      }
    }
  }

  rl.close();
  console.log('\n  Review complete.\n');
  return items;
}

// ============================================================
// CLI argument parsing
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  let items = loadPending();

  if (args.length === 0) {
    // Interactive mode
    items = await interactiveReview(items);
    savePending(items);
    return;
  }

  const flag = args[0];
  const value = args[1];

  switch (flag) {
    case '--list':
    case '-l':
      listPending(items);
      break;

    case '--approve':
    case '-a':
      if (!value) {
        console.error('Usage: node approve.js --approve <ID>');
        process.exit(1);
      }
      items = approveItem(items, value);
      savePending(items);
      break;

    case '--reject':
    case '-r':
      if (!value) {
        console.error('Usage: node approve.js --reject <ID>');
        process.exit(1);
      }
      items = rejectItem(items, value);
      savePending(items);
      break;

    case '--defer':
    case '-d':
      if (!value) {
        console.error('Usage: node approve.js --defer <ID>');
        process.exit(1);
      }
      items = deferItem(items, value);
      savePending(items);
      break;

    case '--clear':
    case '-c':
      items = clearResolved(items);
      savePending(items);
      break;

    case '--help':
    case '-h':
      console.log(`
Initiative Engine - Approval Handler

Usage:
  node approve.js              Interactive review of pending items
  node approve.js --list       List all pending items
  node approve.js --approve ID Approve a specific item
  node approve.js --reject ID  Reject a specific item
  node approve.js --defer ID   Defer a specific item
  node approve.js --clear      Remove resolved items
  node approve.js --help       Show this help
`);
      break;

    default:
      console.error(`Unknown flag: ${flag}. Use --help for usage.`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
});
