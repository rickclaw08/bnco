#!/usr/bin/env node
/**
 * Draft Approval Tool - ClawOps Lead Generation
 * 
 * Interactive CLI for reviewing, approving, and rejecting lead outreach drafts.
 * 
 * Usage:
 *   node approve-drafts.js              - Interactive mode: list and review all pending
 *   node approve-drafts.js list         - List all pending drafts
 *   node approve-drafts.js approve <id> - Approve a specific draft
 *   node approve-drafts.js reject <id>  - Reject a specific draft
 *   node approve-drafts.js approve-all  - Approve all pending drafts
 *   node approve-drafts.js stats        - Show draft statistics
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DRAFT_DIR = process.env.LEAD_GEN_DRAFT_DIR || path.join(__dirname, 'drafts');
const APPROVED_DIR = path.join(__dirname, 'approved');
const LOG_DIR = process.env.LEAD_GEN_LOG_DIR || path.join(__dirname, 'logs');

// Ensure directories exist
[DRAFT_DIR, APPROVED_DIR, LOG_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ============================================================
// Draft Management
// ============================================================

function loadDrafts(statusFilter = null) {
  const files = fs.readdirSync(DRAFT_DIR).filter(f => f.endsWith('.json'));
  const drafts = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(DRAFT_DIR, file), 'utf-8');
      const draft = JSON.parse(content);
      if (!statusFilter || draft.status === statusFilter) {
        drafts.push(draft);
      }
    } catch (err) {
      console.error(`Error reading ${file}: ${err.message}`);
    }
  }

  // Sort by creation time, newest first
  drafts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return drafts;
}

function updateDraft(id, updates) {
  const filePath = path.join(DRAFT_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Draft not found: ${id}`);
    return false;
  }

  const draft = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  Object.assign(draft, updates, { updatedAt: new Date().toISOString() });
  fs.writeFileSync(filePath, JSON.stringify(draft, null, 2));

  // If approved, also copy to approved directory
  if (updates.status === 'approved') {
    fs.writeFileSync(path.join(APPROVED_DIR, `${id}.json`), JSON.stringify(draft, null, 2));
  }

  return true;
}

function approveDraft(id) {
  const success = updateDraft(id, { status: 'approved', approvedAt: new Date().toISOString() });
  if (success) {
    console.log(`Approved: ${id}`);
    logAction('approve', id);
  }
  return success;
}

function rejectDraft(id, reason = '') {
  const success = updateDraft(id, {
    status: 'rejected',
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
  });
  if (success) {
    console.log(`Rejected: ${id}${reason ? ` (${reason})` : ''}`);
    logAction('reject', id, reason);
  }
  return success;
}

function logAction(action, draftId, detail = '') {
  const logFile = path.join(LOG_DIR, 'approvals.log');
  const entry = `[${new Date().toISOString()}] ${action.toUpperCase()} ${draftId}${detail ? ' | ' + detail : ''}\n`;
  fs.appendFileSync(logFile, entry);
}

// ============================================================
// Display
// ============================================================

function displayDraftSummary(draft, index) {
  const emailStatus = draft.to ? draft.to : '(no email found)';
  console.log(`\n  [${index + 1}] ${draft.businessName} (${draft.industry})`);
  console.log(`      ID:    ${draft.id}`);
  console.log(`      Score: ${draft.qualificationScore}/100`);
  console.log(`      Email: ${emailStatus}`);
  console.log(`      City:  ${draft.city || 'unknown'}`);
  console.log(`      Site:  ${draft.website}`);
}

function displayDraftFull(draft) {
  console.log('\n' + '='.repeat(70));
  console.log(`Business:  ${draft.businessName}`);
  console.log(`Industry:  ${draft.industry}`);
  console.log(`City:      ${draft.city || 'unknown'}`);
  console.log(`Website:   ${draft.website}`);
  console.log(`Email:     ${draft.to || '(none found)'}`);
  console.log(`Phone:     ${draft.phone || '(none found)'}`);
  console.log(`Score:     ${draft.qualificationScore}/100`);
  console.log(`Service:   ${draft.bestService}`);
  console.log(`Status:    ${draft.status}`);
  console.log(`Created:   ${draft.createdAt}`);

  if (draft.painPoints && draft.painPoints.length > 0) {
    console.log(`Pain pts:  ${draft.painPoints.join(', ')}`);
  }

  if (draft.qualificationSignals && draft.qualificationSignals.length > 0) {
    console.log(`Signals:`);
    draft.qualificationSignals.forEach(s => console.log(`  - ${s}`));
  }

  console.log('\n--- SUBJECT ---');
  console.log(draft.subject);
  console.log('\n--- EMAIL BODY ---');
  console.log(draft.body);
  console.log('='.repeat(70));
}

function displayStats() {
  const all = loadDrafts();
  const byStatus = {};
  const byService = {};
  const byIndustry = {};
  let totalScore = 0;
  let withEmail = 0;

  for (const d of all) {
    byStatus[d.status] = (byStatus[d.status] || 0) + 1;
    byService[d.bestService] = (byService[d.bestService] || 0) + 1;
    byIndustry[d.industry] = (byIndustry[d.industry] || 0) + 1;
    totalScore += d.qualificationScore || 0;
    if (d.to) withEmail++;
  }

  console.log('\n--- DRAFT STATISTICS ---');
  console.log(`Total drafts: ${all.length}`);
  console.log(`With email:   ${withEmail}`);
  console.log(`Avg score:    ${all.length > 0 ? Math.round(totalScore / all.length) : 0}`);
  console.log('\nBy status:');
  Object.entries(byStatus).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log('\nBy service:');
  Object.entries(byService).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log('\nBy industry:');
  Object.entries(byIndustry).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log('------------------------\n');
}

// ============================================================
// Interactive Mode
// ============================================================

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function interactiveMode() {
  const rl = createInterface();

  console.log('\n=== ClawOps Lead Draft Review ===\n');

  const pending = loadDrafts('pending');

  if (pending.length === 0) {
    console.log('No pending drafts to review.');
    rl.close();
    return;
  }

  console.log(`Found ${pending.length} pending draft(s):\n`);

  pending.forEach((d, i) => displayDraftSummary(d, i));

  console.log('\n\nCommands:');
  console.log('  <number>  - View full draft');
  console.log('  a <num>   - Approve draft');
  console.log('  r <num>   - Reject draft');
  console.log('  aa        - Approve all');
  console.log('  ra        - Reject all');
  console.log('  s         - Show stats');
  console.log('  q         - Quit\n');

  let running = true;
  while (running) {
    const input = (await ask(rl, '\n> ')).trim().toLowerCase();

    if (input === 'q' || input === 'quit' || input === 'exit') {
      running = false;
    } else if (input === 'aa') {
      for (const d of pending) {
        approveDraft(d.id);
      }
      console.log(`Approved all ${pending.length} drafts.`);
    } else if (input === 'ra') {
      const reason = await ask(rl, 'Rejection reason (optional): ');
      for (const d of pending) {
        rejectDraft(d.id, reason);
      }
      console.log(`Rejected all ${pending.length} drafts.`);
    } else if (input === 's' || input === 'stats') {
      displayStats();
    } else if (input.startsWith('a ')) {
      const idx = parseInt(input.slice(2), 10) - 1;
      if (idx >= 0 && idx < pending.length) {
        approveDraft(pending[idx].id);
      } else {
        console.log('Invalid draft number.');
      }
    } else if (input.startsWith('r ')) {
      const idx = parseInt(input.slice(2), 10) - 1;
      if (idx >= 0 && idx < pending.length) {
        const reason = await ask(rl, 'Rejection reason (optional): ');
        rejectDraft(pending[idx].id, reason);
      } else {
        console.log('Invalid draft number.');
      }
    } else {
      const idx = parseInt(input, 10) - 1;
      if (idx >= 0 && idx < pending.length) {
        displayDraftFull(pending[idx]);
      } else {
        console.log('Unknown command. Type "q" to quit.');
      }
    }
  }

  rl.close();
  console.log('Done.');
}

// ============================================================
// CLI Entry
// ============================================================

const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'list':
    const statusFilter = arg || 'pending';
    const drafts = loadDrafts(statusFilter);
    console.log(`\n${drafts.length} ${statusFilter} draft(s):\n`);
    drafts.forEach((d, i) => displayDraftSummary(d, i));
    if (drafts.length === 0) console.log('  (none)');
    console.log();
    break;

  case 'approve':
    if (!arg) {
      console.error('Usage: approve-drafts.js approve <draft-id>');
      process.exit(1);
    }
    if (!approveDraft(arg)) process.exit(1);
    break;

  case 'reject':
    if (!arg) {
      console.error('Usage: approve-drafts.js reject <draft-id>');
      process.exit(1);
    }
    const reason = process.argv[4] || '';
    if (!rejectDraft(arg, reason)) process.exit(1);
    break;

  case 'approve-all': {
    const pending = loadDrafts('pending');
    if (pending.length === 0) {
      console.log('No pending drafts.');
    } else {
      pending.forEach(d => approveDraft(d.id));
      console.log(`\nApproved ${pending.length} draft(s).`);
    }
    break;
  }

  case 'stats':
    displayStats();
    break;

  default:
    // Interactive mode
    interactiveMode().catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
    break;
}
