#!/usr/bin/env node
/**
 * Cron Job Logging Dashboard
 * 
 * A simple Node.js HTTP server (port 4200) that serves a web dashboard.
 * Reads log files from all automation systems and displays status info.
 * Color-coded: green (success), red (failure), yellow (warnings).
 * Auto-refreshes every 60 seconds.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.DASHBOARD_PORT || 4200;
const WORKSPACE = process.env.WORKSPACE_DIR || path.resolve(__dirname, '../..');
const AUTOMATION_DIR = path.join(WORKSPACE, 'automation');

// Automation systems to monitor
const SYSTEMS = [
  { id: 'lead-gen', name: 'Lead Generation', dir: 'lead-gen' },
  { id: 'instagram', name: 'Instagram Automation', dir: 'instagram' },
  { id: 'seo', name: 'SEO Automation', dir: 'seo' },
  { id: 'initiative-engine', name: 'Initiative Engine', dir: 'initiative-engine' },
  { id: 'utilities', name: 'Utilities Suite', dir: 'utilities' },
];

/**
 * Parse a log file and extract status information
 */
function parseLogFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return null;

    const lastLines = lines.slice(-50);
    const lastLine = lines[lines.length - 1];

    // Try to extract timestamp from last line
    const timestampMatch = lastLine.match(/\[(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^\]]*)\]/);
    const lastRunTime = timestampMatch ? timestampMatch[1] : null;

    // Determine status based on content
    let status = 'unknown';
    const lowerContent = lastLines.join('\n').toLowerCase();
    if (lowerContent.includes('error') || lowerContent.includes('failed') || lowerContent.includes('fatal')) {
      status = 'error';
    } else if (lowerContent.includes('warning') || lowerContent.includes('warn') || lowerContent.includes('skipped')) {
      status = 'warning';
    } else if (lowerContent.includes('success') || lowerContent.includes('complete') || lowerContent.includes('done') || lowerContent.includes('finished')) {
      status = 'success';
    } else if (lines.length > 0) {
      status = 'success'; // Has content but no explicit status markers
    }

    // Get summary (last 5 meaningful lines)
    const summary = lastLines
      .slice(-5)
      .map(l => l.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
      .join('\n');

    return {
      lastRunTime: lastRunTime || getFileMtime(filePath),
      status,
      summary,
      totalLines: lines.length,
      fileName: path.basename(filePath),
    };
  } catch (err) {
    return {
      lastRunTime: null,
      status: 'error',
      summary: `Error reading log: ${err.message}`,
      totalLines: 0,
      fileName: path.basename(filePath),
    };
  }
}

/**
 * Get file modification time as fallback
 */
function getFileMtime(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString().replace('T', ' ').slice(0, 19);
  } catch {
    return 'Unknown';
  }
}

/**
 * Discover log files for a system
 */
function discoverLogs(systemDir) {
  const logsDir = path.join(AUTOMATION_DIR, systemDir, 'logs');
  const results = [];

  try {
    if (!fs.existsSync(logsDir)) {
      return results;
    }

    const files = fs.readdirSync(logsDir)
      .filter(f => f.endsWith('.log') || f.endsWith('.txt') || f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, 10); // Latest 10 log files

    for (const file of files) {
      const parsed = parseLogFile(path.join(logsDir, file));
      if (parsed) {
        results.push(parsed);
      }
    }
  } catch (err) {
    results.push({
      lastRunTime: null,
      status: 'error',
      summary: `Cannot read logs directory: ${err.message}`,
      totalLines: 0,
      fileName: 'N/A',
    });
  }

  return results;
}

/**
 * Get status color class
 */
function statusColor(status) {
  switch (status) {
    case 'success': return '#22c55e';
    case 'error': return '#ef4444';
    case 'warning': return '#eab308';
    default: return '#6b7280';
  }
}

/**
 * Get status icon
 */
function statusIcon(status) {
  switch (status) {
    case 'success': return '&#10004;';
    case 'error': return '&#10008;';
    case 'warning': return '&#9888;';
    default: return '&#8226;';
  }
}

/**
 * Build the dashboard HTML page
 */
function buildDashboard() {
  const systemsData = SYSTEMS.map(sys => {
    const logs = discoverLogs(sys.dir);
    const latestLog = logs[0] || null;
    return { ...sys, logs, latestLog };
  });

  const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const systemCards = systemsData.map(sys => {
    const statusDot = sys.latestLog
      ? `<span style="color: ${statusColor(sys.latestLog.status)}; font-size: 24px;">${statusIcon(sys.latestLog.status)}</span>`
      : '<span style="color: #6b7280; font-size: 24px;">&#8226;</span>';

    const lastRun = sys.latestLog
      ? sys.latestLog.lastRunTime || 'Unknown'
      : 'No logs found';

    const statusLabel = sys.latestLog
      ? sys.latestLog.status.toUpperCase()
      : 'NO DATA';

    const summary = sys.latestLog
      ? sys.latestLog.summary
      : 'No log files detected in logs/ directory.';

    const borderColor = sys.latestLog
      ? statusColor(sys.latestLog.status)
      : '#374151';

    const logFiles = sys.logs.map(log => {
      return `<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid #1f2937;">
        <span style="color: ${statusColor(log.status)};">${statusIcon(log.status)}</span>
        <span style="color: #9ca3af; font-size: 12px;">${log.fileName}</span>
        <span style="color: #6b7280; font-size: 11px; margin-left: auto;">${log.totalLines} lines</span>
      </div>`;
    }).join('');

    return `
    <div style="background: #111827; border: 1px solid ${borderColor}; border-left: 4px solid ${borderColor}; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${statusDot}
          <h2 style="margin: 0; color: #f9fafb; font-size: 18px;">${sys.name}</h2>
        </div>
        <span style="background: ${borderColor}20; color: ${borderColor}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${statusLabel}</span>
      </div>
      <div style="color: #9ca3af; font-size: 13px; margin-bottom: 12px;">
        <strong>Last Run:</strong> ${lastRun}
      </div>
      <div style="background: #0d1117; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
        <pre style="margin: 0; color: #d1d5db; font-size: 12px; white-space: pre-wrap; word-break: break-word; font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;">${summary}</pre>
      </div>
      ${sys.logs.length > 1 ? `
      <details style="margin-top: 8px;">
        <summary style="color: #6b7280; cursor: pointer; font-size: 13px;">All log files (${sys.logs.length})</summary>
        <div style="margin-top: 8px; padding: 8px; background: #0d1117; border-radius: 6px;">
          ${logFiles}
        </div>
      </details>` : ''}
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="60">
  <title>ClawOps - Cron Dashboard</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #030712;
      color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 20px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 1px solid #1f2937;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header .timestamp {
      color: #6b7280;
      font-size: 13px;
    }
    .status-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ClawOps Cron Dashboard</h1>
      <div class="timestamp">Last refreshed: ${now} EST</div>
    </div>
    <div class="status-bar">
      <div class="status-pill" style="background: #22c55e20; color: #22c55e;">
        <span>&#10004;</span> Success
      </div>
      <div class="status-pill" style="background: #eab30820; color: #eab308;">
        <span>&#9888;</span> Warning
      </div>
      <div class="status-pill" style="background: #ef444420; color: #ef4444;">
        <span>&#10008;</span> Error
      </div>
      <div class="status-pill" style="background: #6b728020; color: #6b7280;">
        <span>&#8226;</span> No Data
      </div>
    </div>
    ${systemCards}
    <div style="text-align: center; color: #374151; font-size: 12px; margin-top: 40px; padding-top: 16px; border-top: 1px solid #111827;">
      ClawOps Utilities Suite - Auto-refreshes every 60 seconds
    </div>
  </div>
</body>
</html>`;
}

/**
 * JSON API endpoint for programmatic access
 */
function buildApiResponse() {
  const systemsData = SYSTEMS.map(sys => {
    const logs = discoverLogs(sys.dir);
    return {
      id: sys.id,
      name: sys.name,
      logs: logs.map(l => ({
        fileName: l.fileName,
        lastRunTime: l.lastRunTime,
        status: l.status,
        totalLines: l.totalLines,
      })),
    };
  });
  return JSON.stringify({ systems: systemsData, timestamp: new Date().toISOString() }, null, 2);
}

// Create HTTP server
const server = http.createServer((req, res) => {
  try {
    if (req.url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(buildApiResponse());
    } else if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(buildDashboard());
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Request error:`, err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[ERROR] Port ${PORT} is already in use. Set DASHBOARD_PORT env var to use a different port.`);
    process.exit(1);
  }
  console.error(`[ERROR] Server error:`, err.message);
});

server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] ClawOps Cron Dashboard running at http://localhost:${PORT}`);
  console.log(`[${new Date().toISOString()}] API endpoint: http://localhost:${PORT}/api/status`);
  console.log(`[${new Date().toISOString()}] Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[INFO] Received SIGTERM, shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[INFO] Received SIGINT, shutting down gracefully...');
  server.close(() => process.exit(0));
});
