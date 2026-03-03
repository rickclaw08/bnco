// ============================================================================
// TokenTether - Dashboard Server
// ============================================================================
//
// A lightweight Express server that serves:
//   1. A real-time usage dashboard (HTML/JS, no build step)
//   2. A JSON API for programmatic access to usage data
//
// The dashboard shows:
//   - Current spend vs. limit (gauge)
//   - Per-session and per-model breakdowns
//   - Cost over time chart
//   - Alert history
//   - Quick actions (reset counters, change limit)
//
// Runs on a separate port (default 18790) so it doesn't interfere with
// the proxy or the OpenClaw gateway.
// ============================================================================

'use strict';

const express = require('express');
const path = require('path');
const { logger } = require('./logger');

class DashboardServer {
  constructor(config, tracker) {
    this.config = config;
    this.tracker = tracker;
    this.app = express();
    this.server = null;

    this._setupRoutes();
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.dashboardPort, () => {
        logger.info(`Dashboard running at http://localhost:${this.config.dashboardPort}`);
        resolve();
      });

      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          logger.warn(`Dashboard port ${this.config.dashboardPort} in use, dashboard disabled`);
          resolve(); // Don't fail the whole app
        } else {
          reject(err);
        }
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  _setupRoutes() {
    // Serve the dashboard HTML
    this.app.get('/', (req, res) => {
      res.send(this._getDashboardHtml());
    });

    // JSON API endpoints
    this.app.get('/api/snapshot', (req, res) => {
      res.json(this.tracker.getSnapshot());
    });

    // Reset endpoint requires confirmation header to prevent accidental triggers.
    // This is not full auth, but it guards against casual or CSRF-based resets.
    this.app.post('/api/reset', express.json(), (req, res) => {
      const confirm = req.headers['x-confirm-reset'] || (req.body && req.body.confirm);
      if (!confirm) {
        res.status(400).json({ ok: false, message: 'Missing confirmation. Send x-confirm-reset header or {"confirm": true} in body.' });
        return;
      }
      this.tracker.resetCounters();
      res.json({ ok: true, message: 'Counters reset' });
    });

    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        version: '1.0.0',
        uptime: process.uptime(),
      });
    });
  }

  _getDashboardHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TokenTether Dashboard</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #050810;
      --surface: #0a0f1a;
      --elevated: #111827;
      --green: #4ade80;
      --green-dark: #166534;
      --yellow: #facc15;
      --red: #ef4444;
      --text: #f0f4ff;
      --text-dim: #8892b0;
      --border: rgba(136, 146, 176, 0.15);
    }
    body {
      font-family: "Inter", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 24px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    .header h1 {
      font-family: "Space Grotesk", system-ui, sans-serif;
      font-size: 24px;
      font-weight: 700;
    }
    .header h1 span { color: var(--green); }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .status-badge.ok { background: rgba(74, 222, 128, 0.15); color: var(--green); }
    .status-badge.warn { background: rgba(250, 204, 21, 0.15); color: var(--yellow); }
    .status-badge.danger { background: rgba(239, 68, 68, 0.15); color: var(--red); }
    .status-badge::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
    }
    .card h3 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dim);
      margin-bottom: 8px;
    }
    .card .value {
      font-family: "JetBrains Mono", monospace;
      font-size: 32px;
      font-weight: 700;
    }
    .card .sub {
      font-size: 13px;
      color: var(--text-dim);
      margin-top: 4px;
    }
    .gauge-container {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
    }
    .gauge-bar {
      width: 100%;
      height: 24px;
      background: var(--elevated);
      border-radius: 12px;
      overflow: hidden;
      margin: 16px 0;
    }
    .gauge-fill {
      height: 100%;
      border-radius: 12px;
      transition: width 0.5s ease, background 0.5s ease;
    }
    .gauge-labels {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--text-dim);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
    }
    th {
      color: var(--text-dim);
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td { font-family: "JetBrains Mono", monospace; font-size: 13px; }
    .btn {
      padding: 8px 20px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--elevated);
      color: var(--text);
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn:hover { border-color: var(--green); color: var(--green); }
    .btn.danger:hover { border-color: var(--red); color: var(--red); }
    .actions { display: flex; gap: 12px; margin-top: 16px; }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .refresh-note {
      text-align: center;
      color: var(--text-dim);
      font-size: 12px;
      margin-top: 32px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1><span>Token</span>Tether</h1>
    <div id="statusBadge" class="status-badge ok">Protected</div>
  </div>

  <div class="gauge-container">
    <h3 class="section-title" id="gaugeTitle">Spending: Loading...</h3>
    <div class="gauge-bar">
      <div class="gauge-fill" id="gaugeFill" style="width: 0%; background: var(--green);"></div>
    </div>
    <div class="gauge-labels">
      <span>$0.00</span>
      <span id="gaugeLimit">$50.00</span>
    </div>
    <div class="actions">
      <button class="btn" onclick="resetCounters()">Reset Counters</button>
      <button class="btn" onclick="location.reload()">Refresh</button>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Total Spend</h3>
      <div class="value" id="totalSpend">$0.0000</div>
      <div class="sub" id="totalRequests">0 requests</div>
    </div>
    <div class="card">
      <h3>Active Sessions</h3>
      <div class="value" id="activeSessions">0</div>
      <div class="sub" id="periodDuration">-</div>
    </div>
    <div class="card">
      <h3>Input Tokens</h3>
      <div class="value" id="inputTokens">0</div>
      <div class="sub">prompt tokens consumed</div>
    </div>
    <div class="card">
      <h3>Output Tokens</h3>
      <div class="value" id="outputTokens">0</div>
      <div class="sub">completion tokens generated</div>
    </div>
  </div>

  <h3 class="section-title">Per-Model Breakdown</h3>
  <div class="card" style="margin-bottom: 32px; overflow-x: auto;">
    <table>
      <thead>
        <tr>
          <th>Model</th>
          <th>Requests</th>
          <th>Input Tokens</th>
          <th>Output Tokens</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody id="modelTable"></tbody>
    </table>
  </div>

  <h3 class="section-title">Sessions</h3>
  <div class="card" style="overflow-x: auto;">
    <table>
      <thead>
        <tr>
          <th>Session ID</th>
          <th>Model</th>
          <th>Requests</th>
          <th>Cost</th>
          <th>Started</th>
        </tr>
      </thead>
      <tbody id="sessionTable"></tbody>
    </table>
  </div>

  <p class="refresh-note">Auto-refreshes every 5 seconds</p>

  <script>
    // Escape HTML to prevent XSS from model/session names
    function esc(str) {
      var d = document.createElement('div');
      d.appendChild(document.createTextNode(str));
      return d.innerHTML;
    }

    function formatNumber(n) {
      return n.toLocaleString();
    }

    function formatDuration(ms) {
      const hours = Math.floor(ms / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      if (hours > 0) return hours + 'h ' + mins + 'm';
      return mins + 'm';
    }

    function timeAgo(ts) {
      const diff = Date.now() - ts;
      if (diff < 60000) return 'just now';
      if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
      return Math.floor(diff / 3600000) + 'h ago';
    }

    async function refresh() {
      try {
        const res = await fetch('/api/snapshot');
        const data = await res.json();

        // Status badge
        const badge = document.getElementById('statusBadge');
        if (data.limitReached) {
          badge.className = 'status-badge danger';
          badge.textContent = 'LIMIT REACHED';
        } else if (data.warningSent) {
          badge.className = 'status-badge warn';
          badge.textContent = 'Warning';
        } else {
          badge.className = 'status-badge ok';
          badge.textContent = 'Protected';
        }

        // Gauge
        const pct = Math.min(data.percentUsed * 100, 100);
        const fill = document.getElementById('gaugeFill');
        fill.style.width = pct + '%';
        if (pct >= 100) fill.style.background = 'var(--red)';
        else if (pct >= 80) fill.style.background = 'var(--yellow)';
        else fill.style.background = 'var(--green)';

        document.getElementById('gaugeTitle').textContent =
          'Spending: $' + data.totalCostUsd.toFixed(4) + ' / $' + data.hardLimitUsd.toFixed(2) +
          ' (' + pct.toFixed(1) + '%)';
        document.getElementById('gaugeLimit').textContent = '$' + data.hardLimitUsd.toFixed(2);

        // Cards
        document.getElementById('totalSpend').textContent = '$' + data.totalCostUsd.toFixed(4);
        document.getElementById('totalRequests').textContent = formatNumber(data.requestCount) + ' requests';
        document.getElementById('activeSessions').textContent = data.activeSessions;
        document.getElementById('periodDuration').textContent = 'Period: ' + formatDuration(data.periodDurationMs);
        document.getElementById('inputTokens').textContent = formatNumber(data.totalInputTokens);
        document.getElementById('outputTokens').textContent = formatNumber(data.totalOutputTokens);

        // Model table
        const modelBody = document.getElementById('modelTable');
        modelBody.innerHTML = data.models.map(function(m) {
          return '<tr><td>' + esc(m.name) + '</td><td>' + formatNumber(m.requestCount) +
            '</td><td>' + formatNumber(m.inputTokens) +
            '</td><td>' + formatNumber(m.outputTokens) +
            '</td><td>$' + m.costUsd.toFixed(4) + '</td></tr>';
        }).join('') || '<tr><td colspan="5" style="color:var(--text-dim)">No data yet</td></tr>';

        // Session table
        const sessBody = document.getElementById('sessionTable');
        sessBody.innerHTML = data.sessions.slice(0, 20).map(function(s) {
          return '<tr><td>' + esc(s.id.substring(0, 16)) + '...</td><td>' + esc(s.lastModel || s.model || '-') +
            '</td><td>' + formatNumber(s.requestCount) +
            '</td><td>$' + s.costUsd.toFixed(4) +
            '</td><td>' + timeAgo(s.startedAt) + '</td></tr>';
        }).join('') || '<tr><td colspan="5" style="color:var(--text-dim)">No sessions yet</td></tr>';

      } catch (err) {
        console.error('Refresh failed:', err);
      }
    }

    async function resetCounters() {
      if (!confirm('Reset all usage counters? This cannot be undone.')) return;
      await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-confirm-reset': 'true' },
        body: JSON.stringify({ confirm: true })
      });
      refresh();
    }

    // Initial load + auto-refresh
    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>`;
  }
}

module.exports = { DashboardServer };
