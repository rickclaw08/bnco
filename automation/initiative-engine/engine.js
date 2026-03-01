#!/usr/bin/env node

/**
 * Initiative Engine - Autonomous Improvement System
 * 
 * Scans the workspace for improvement opportunities, classifies them
 * as SAFE or RISKY, executes safe changes automatically, and queues
 * risky changes for human approval.
 * 
 * Run: node engine.js
 * Schedule: every 4 hours via cron
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
const PENDING_FILE = path.join(WORKSPACE, config.logging.pendingFile);
const BACKUPS_DIR = path.join(__dirname, 'backups');

// Ensure directories exist
[LOGS_DIR, BACKUPS_DIR, path.join(LOGS_DIR, 'daily')].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============================================================
// Logging
// ============================================================

const runId = new Date().toISOString().replace(/[:.]/g, '-');
const runLogPath = path.join(LOGS_DIR, `run-${runId}.json`);

const runLog = {
  runId,
  startTime: new Date().toISOString(),
  endTime: null,
  safeChanges: [],
  riskyChanges: [],
  opportunities: [],
  errors: [],
  stats: {
    filesScanned: 0,
    opportunitiesFound: 0,
    safeExecuted: 0,
    riskyQueued: 0,
    errorsEncountered: 0
  }
};

function logError(context, error) {
  const entry = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message || String(error),
    stack: error.stack || null
  };
  runLog.errors.push(entry);
  runLog.stats.errorsEncountered++;
  console.error(`[ERROR] ${context}: ${entry.message}`);
}

function saveRunLog() {
  runLog.endTime = new Date().toISOString();
  try {
    fs.writeFileSync(runLogPath, JSON.stringify(runLog, null, 2));
  } catch (err) {
    console.error(`[FATAL] Cannot save run log: ${err.message}`);
  }
}

// ============================================================
// Safety: Path validation
// ============================================================

function isInsideWorkspace(filePath) {
  const resolved = path.resolve(filePath);
  return resolved.startsWith(WORKSPACE);
}

function shouldIgnore(filePath) {
  const relative = path.relative(WORKSPACE, filePath);
  return config.ignorePatterns.some(pattern => {
    if (pattern.startsWith('*')) {
      return relative.endsWith(pattern.slice(1));
    }
    return relative.includes(pattern);
  });
}

// ============================================================
// Backup
// ============================================================

function createBackup(filePath) {
  if (!config.backupBeforeModify) return null;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash('md5').update(filePath).digest('hex').slice(0, 8);
    const backupName = `${path.basename(filePath)}.${hash}.${Date.now()}.bak`;
    const backupPath = path.join(BACKUPS_DIR, backupName);
    fs.writeFileSync(backupPath, content);
    return backupPath;
  } catch (err) {
    logError(`backup:${filePath}`, err);
    return null;
  }
}

// ============================================================
// File Scanner
// ============================================================

function scanDirectory(dirPath, files = []) {
  if (!isInsideWorkspace(dirPath)) return files;
  
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    logError(`scan:${dirPath}`, err);
    return files;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (shouldIgnore(fullPath)) continue;

    if (entry.isDirectory()) {
      scanDirectory(fullPath, files);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (config.safePatterns.fileExtensions.includes(ext)) {
        try {
          const stat = fs.statSync(fullPath);
          if (stat.size <= config.maxFileSizeBytes) {
            files.push(fullPath);
          }
        } catch (err) {
          logError(`stat:${fullPath}`, err);
        }
      }
    }
  }
  return files;
}

function getAllFiles() {
  const allFiles = [];
  for (const dir of config.scanDirectories) {
    const fullDir = path.join(WORKSPACE, dir);
    if (fs.existsSync(fullDir)) {
      scanDirectory(fullDir, allFiles);
    }
  }
  return allFiles;
}

// ============================================================
// Analyzers - Each returns an array of opportunities
// ============================================================

function analyzeFile(filePath) {
  const opportunities = [];
  let content;
  
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    logError(`read:${filePath}`, err);
    return opportunities;
  }

  const ext = path.extname(filePath).toLowerCase();
  const relativePath = path.relative(WORKSPACE, filePath);

  // 1. Check for trailing whitespace
  const lines = content.split('\n');
  let trailingWhitespaceLines = [];
  lines.forEach((line, i) => {
    if (line !== line.trimEnd() && line.trim().length > 0) {
      trailingWhitespaceLines.push(i + 1);
    }
  });
  if (trailingWhitespaceLines.length > 3) {
    opportunities.push({
      type: 'fix-whitespace',
      file: relativePath,
      description: `Found trailing whitespace on ${trailingWhitespaceLines.length} lines`,
      classification: 'SAFE',
      details: { lineCount: trailingWhitespaceLines.length },
      fix: () => {
        const fixed = lines.map(line => line.trimEnd()).join('\n');
        return { before: content, after: fixed };
      }
    });
  }

  // 2. Check for missing final newline
  if (content.length > 0 && !content.endsWith('\n')) {
    opportunities.push({
      type: 'add-missing-newline',
      file: relativePath,
      description: 'File is missing a final newline',
      classification: 'SAFE',
      fix: () => ({
        before: content.slice(-50),
        after: content + '\n'
      })
    });
  }

  // 3. Markdown-specific checks
  if (ext === '.md') {
    // Duplicate consecutive blank lines (more than 2)
    if (/\n{4,}/.test(content)) {
      opportunities.push({
        type: 'fix-whitespace',
        file: relativePath,
        description: 'Excessive blank lines (3+ consecutive)',
        classification: 'SAFE',
        fix: () => {
          const fixed = content.replace(/\n{4,}/g, '\n\n\n');
          return { before: content, after: fixed };
        }
      });
    }

    // Broken internal links (references to .md files that don't exist)
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
    let match;
    while ((match = mdLinkRegex.exec(content)) !== null) {
      const linkTarget = match[2];
      // Skip external links
      if (linkTarget.startsWith('http')) continue;
      const resolvedLink = path.resolve(path.dirname(filePath), linkTarget);
      if (!fs.existsSync(resolvedLink)) {
        opportunities.push({
          type: 'fix-broken-internal-link',
          file: relativePath,
          description: `Broken internal link: [${match[1]}](${linkTarget})`,
          classification: isRiskyPath(relativePath) ? 'RISKY' : 'SAFE',
          details: { linkText: match[1], linkTarget, resolvedPath: resolvedLink }
        });
      }
    }

    // Missing document title (no H1)
    if (!content.match(/^#\s+.+/m) && content.trim().length > 50) {
      opportunities.push({
        type: 'add-missing-meta',
        file: relativePath,
        description: 'Markdown file has no H1 heading',
        classification: isRiskyPath(relativePath) ? 'RISKY' : 'SAFE',
        details: { suggestion: `Add a title based on filename: ${path.basename(filePath, '.md')}` }
      });
    }

    // Outdated year references (check for years before current year - 1 in date-like patterns)
    const currentYear = new Date().getFullYear();
    const oldYearRegex = new RegExp(`(20[0-1][0-9]|202[0-${Math.max(0, currentYear - 2 - 2020)}])(?=[-/])`, 'g');
    const oldYears = [];
    let yearMatch;
    while ((yearMatch = oldYearRegex.exec(content)) !== null) {
      const year = parseInt(yearMatch[1]);
      if (year < currentYear - 1) {
        oldYears.push({ year, index: yearMatch.index });
      }
    }
    if (oldYears.length > 0) {
      opportunities.push({
        type: 'update-date',
        file: relativePath,
        description: `Found ${oldYears.length} potentially outdated date reference(s) (years: ${[...new Set(oldYears.map(y => y.year))].join(', ')})`,
        classification: 'RISKY',
        details: { years: oldYears }
      });
    }
  }

  // 4. JSON validation
  if (ext === '.json') {
    try {
      JSON.parse(content);
    } catch (parseErr) {
      opportunities.push({
        type: 'fix-typo',
        file: relativePath,
        description: `Invalid JSON: ${parseErr.message}`,
        classification: 'RISKY',
        details: { error: parseErr.message }
      });
    }
  }

  // 5. HTML-specific checks
  if (ext === '.html') {
    // Missing meta viewport
    if (!content.includes('viewport') && content.includes('<head')) {
      opportunities.push({
        type: 'add-missing-meta',
        file: relativePath,
        description: 'HTML file missing viewport meta tag',
        classification: isRiskyPath(relativePath) ? 'RISKY' : 'SAFE',
        details: { suggestion: '<meta name="viewport" content="width=device-width, initial-scale=1.0">' }
      });
    }

    // Missing charset
    if (!content.includes('charset') && content.includes('<head')) {
      opportunities.push({
        type: 'add-missing-meta',
        file: relativePath,
        description: 'HTML file missing charset declaration',
        classification: isRiskyPath(relativePath) ? 'RISKY' : 'SAFE',
        details: { suggestion: '<meta charset="UTF-8">' }
      });
    }
  }

  // 6. Check if path is in a risky zone - override classification
  opportunities.forEach(opp => {
    if (opp.classification === 'SAFE' && isRiskyPath(relativePath)) {
      opp.classification = 'RISKY';
      opp.reclassifyReason = 'File is in a risky path zone';
    }
  });

  return opportunities;
}

function isRiskyPath(relativePath) {
  return config.riskyPatterns.pathPatterns.some(pattern =>
    relativePath.toLowerCase().includes(pattern.toLowerCase())
  );
}

// ============================================================
// Execution
// ============================================================

function executeSafeChange(opportunity) {
  if (!opportunity.fix) {
    // Opportunity noted but no auto-fix available
    return { executed: false, reason: 'No automatic fix available' };
  }

  const fullPath = path.join(WORKSPACE, opportunity.file);
  if (!isInsideWorkspace(fullPath)) {
    return { executed: false, reason: 'Path outside workspace' };
  }

  try {
    const { before, after } = opportunity.fix();
    
    // Create backup
    const backupPath = createBackup(fullPath);
    
    // Write the fixed content
    fs.writeFileSync(fullPath, after);
    
    return {
      executed: true,
      backupPath,
      beforeSnippet: typeof before === 'string' ? before.slice(0, 200) : null,
      afterSnippet: typeof after === 'string' ? after.slice(0, 200) : null
    };
  } catch (err) {
    logError(`execute:${opportunity.file}`, err);
    return { executed: false, reason: err.message };
  }
}

function queueRiskyChange(opportunity) {
  let pending = [];
  try {
    if (fs.existsSync(PENDING_FILE)) {
      pending = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
    }
  } catch (err) {
    logError('read-pending', err);
    pending = [];
  }

  // De-duplicate: don't queue the same opportunity twice
  const isDuplicate = pending.some(p =>
    p.type === opportunity.type &&
    p.file === opportunity.file &&
    p.description === opportunity.description &&
    p.status === 'pending'
  );

  if (isDuplicate) {
    return { queued: false, reason: 'Already in pending queue' };
  }

  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type: opportunity.type,
    file: opportunity.file,
    description: opportunity.description,
    details: opportunity.details || {},
    reclassifyReason: opportunity.reclassifyReason || null,
    status: 'pending'
  };

  pending.push(entry);

  try {
    fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));
    return { queued: true, id: entry.id };
  } catch (err) {
    logError('write-pending', err);
    return { queued: false, reason: err.message };
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log(`[Initiative Engine] Starting run ${runId}`);
  console.log(`[Initiative Engine] Workspace: ${WORKSPACE}`);
  console.log(`[Initiative Engine] Max changes per run: ${config.maxChangesPerRun}`);

  // Collect all files
  const files = getAllFiles();
  runLog.stats.filesScanned = files.length;
  console.log(`[Initiative Engine] Found ${files.length} files to scan`);

  // Analyze each file
  let allOpportunities = [];
  for (const file of files) {
    try {
      const opps = analyzeFile(file);
      allOpportunities = allOpportunities.concat(opps);
    } catch (err) {
      logError(`analyze:${file}`, err);
    }
  }

  runLog.stats.opportunitiesFound = allOpportunities.length;
  console.log(`[Initiative Engine] Found ${allOpportunities.length} opportunities`);

  // Separate safe and risky
  const safeOpps = allOpportunities.filter(o => o.classification === 'SAFE');
  const riskyOpps = allOpportunities.filter(o => o.classification === 'RISKY');

  // Execute safe changes (up to the limit)
  let changesApplied = 0;
  for (const opp of safeOpps) {
    if (changesApplied >= config.maxChangesPerRun) {
      runLog.opportunities.push({
        type: opp.type,
        file: opp.file,
        description: opp.description,
        classification: 'SAFE',
        status: 'skipped-limit-reached'
      });
      continue;
    }

    const result = executeSafeChange(opp);
    const logEntry = {
      type: opp.type,
      file: opp.file,
      description: opp.description,
      classification: 'SAFE',
      result
    };
    
    if (result.executed) {
      changesApplied++;
      runLog.stats.safeExecuted++;
      runLog.safeChanges.push(logEntry);
      console.log(`[SAFE] Executed: ${opp.type} on ${opp.file}`);
    } else {
      runLog.opportunities.push({ ...logEntry, status: 'noted' });
      console.log(`[SAFE] Noted (no auto-fix): ${opp.type} on ${opp.file}`);
    }
  }

  // Queue risky changes
  for (const opp of riskyOpps) {
    const result = queueRiskyChange(opp);
    const logEntry = {
      type: opp.type,
      file: opp.file,
      description: opp.description,
      classification: 'RISKY',
      details: opp.details || {},
      result
    };
    
    if (result.queued) {
      runLog.stats.riskyQueued++;
      runLog.riskyChanges.push(logEntry);
      console.log(`[RISKY] Queued: ${opp.type} on ${opp.file}`);
    } else {
      runLog.riskyChanges.push({ ...logEntry, status: 'skipped', reason: result.reason });
      console.log(`[RISKY] Skipped (${result.reason}): ${opp.type} on ${opp.file}`);
    }
  }

  // Save run log
  saveRunLog();

  // Summary
  console.log('\n--- Run Summary ---');
  console.log(`Files scanned: ${runLog.stats.filesScanned}`);
  console.log(`Opportunities found: ${runLog.stats.opportunitiesFound}`);
  console.log(`Safe changes executed: ${runLog.stats.safeExecuted}`);
  console.log(`Risky changes queued: ${runLog.stats.riskyQueued}`);
  console.log(`Errors: ${runLog.stats.errorsEncountered}`);
  console.log(`Log saved to: ${runLogPath}`);
}

main().catch(err => {
  logError('main', err);
  saveRunLog();
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
});
