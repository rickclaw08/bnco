/* ═══════════════════════════════════════════════════════════
   BNCO — Lobby Display Script
   Full-screen display for studio TVs with SSE real-time updates
   ═══════════════════════════════════════════════════════════ */

import './style.css';
import { getLobbyFeed, createLobbyStream, API_BASE } from './api.js';

// ── State ─────────────────────────────────────────────────
let studioSlug = null;
let sseConnection = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000;

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Get studio slug from URL
  const params = new URLSearchParams(window.location.search);
  studioSlug = params.get('studio');

  if (!studioSlug) {
    showError('No studio specified. Use ?studio=<slug>');
    return;
  }

  // Start clock
  updateClock();
  setInterval(updateClock, 1000);

  // Load initial data
  loadInitialData();

  // Connect to SSE stream
  connectSSE();

  // Auto-refresh every 60s as fallback
  setInterval(() => loadInitialData(), 60000);
});

// ── Load Initial Data ─────────────────────────────────────
async function loadInitialData() {
  const result = await getLobbyFeed(studioSlug);

  if (!result.ok) {
    // Try demo data on failure
    loadDemoLobbyData();
    return;
  }

  updateLobbyUI(result.data);
}

function updateLobbyUI(data) {
  // Studio name
  const nameEl = document.getElementById('lobbyStudioName');
  if (nameEl && data.studio_name) {
    nameEl.textContent = data.studio_name;
  }

  // Weekly goal
  if (data.goal) {
    updateGoal(data.goal);
  }

  // Athlete of the week
  if (data.athlete_of_week) {
    updateAthlete(data.athlete_of_week);
  }

  // Leaderboard
  if (data.leaderboard) {
    updateLeaderboard(data.leaderboard);
  }

  // Challenges
  if (data.challenges) {
    updateChallenges(data.challenges);
  }
}

// ── Update Sections ───────────────────────────────────────

function updateGoal(goal) {
  const nameEl = document.getElementById('lobbyGoalName');
  const fillEl = document.getElementById('lobbyGoalFill');
  const currentEl = document.getElementById('lobbyGoalCurrent');
  const targetEl = document.getElementById('lobbyGoalTarget');
  const pctEl = document.getElementById('lobbyGoalPct');

  if (!goal) return;

  const pct = Math.min(((goal.current || 0) / (goal.target || 1)) * 100, 100);

  if (nameEl) nameEl.textContent = goal.name || 'Weekly Goal';
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (currentEl) currentEl.textContent = (goal.current || 0).toLocaleString();
  if (targetEl) targetEl.textContent = (goal.target || 0).toLocaleString();
  if (pctEl) pctEl.textContent = `${Math.round(pct)}%`;
}

function updateAthlete(athlete) {
  const avatarEl = document.getElementById('lobbyAthleteAvatar');
  const nameEl = document.getElementById('lobbyAthleteName');
  const scoreEl = document.getElementById('lobbyAthleteScore');

  if (!athlete) return;

  if (avatarEl) avatarEl.textContent = getInitials(athlete.name || '??');
  if (nameEl) nameEl.textContent = athlete.name || 'Unknown';
  if (scoreEl) scoreEl.textContent = `RES ${(athlete.score || 0).toFixed(1)}`;
}

function updateLeaderboard(entries) {
  const list = document.getElementById('lobbyLBList');
  if (!list) return;

  if (!entries || entries.length === 0) {
    list.innerHTML = '<div class="lobby__lb-empty">No entries yet this week</div>';
    return;
  }

  const top5 = entries.slice(0, 5);

  list.innerHTML = top5.map((e, i) => `
    <div class="lobby__lb-row ${i === 0 ? 'lobby__lb-row--first' : ''}">
      <div class="lobby__lb-rank">${i + 1}</div>
      <div class="lobby__lb-avatar">${getInitials(e.name || e.display_name || '??')}</div>
      <div class="lobby__lb-name">${e.name || e.display_name || 'Anonymous'}</div>
      <div class="lobby__lb-score">${(e.score || e.res_score || 0).toFixed(1)}</div>
    </div>
  `).join('');
}

function updateChallenges(challenges) {
  const list = document.getElementById('lobbyChallengesList');
  if (!list) return;

  if (!challenges || challenges.length === 0) {
    list.innerHTML = '<div class="lobby__lb-empty">No active challenges</div>';
    return;
  }

  list.innerHTML = challenges.map(c => {
    const pct = Math.min(((c.current || 0) / (c.target || 1)) * 100, 100);
    return `
      <div class="lobby__challenge">
        <div class="lobby__challenge-name">${c.name || 'Challenge'}</div>
        <div class="lobby__challenge-bar">
          <div class="lobby__challenge-fill" style="width: ${pct}%"></div>
        </div>
        <div class="lobby__challenge-meta">
          <span>${(c.current || 0).toLocaleString()} / ${(c.target || 0).toLocaleString()}</span>
          <span>${Math.round(pct)}%</span>
        </div>
      </div>
    `;
  }).join('');
}

// ── SSE Connection ────────────────────────────────────────

function connectSSE() {
  if (sseConnection) {
    sseConnection.close();
  }

  hideConnectionStatus();

  try {
    sseConnection = createLobbyStream(studioSlug);

    sseConnection.onopen = () => {
      reconnectAttempts = 0;
      hideConnectionStatus();
    };

    sseConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSSEUpdate(data);
      } catch {
        // Ignore malformed messages
      }
    };

    sseConnection.addEventListener('goal', (event) => {
      try {
        updateGoal(JSON.parse(event.data));
      } catch { /* skip */ }
    });

    sseConnection.addEventListener('leaderboard', (event) => {
      try {
        updateLeaderboard(JSON.parse(event.data));
      } catch { /* skip */ }
    });

    sseConnection.addEventListener('athlete', (event) => {
      try {
        updateAthlete(JSON.parse(event.data));
      } catch { /* skip */ }
    });

    sseConnection.addEventListener('challenges', (event) => {
      try {
        updateChallenges(JSON.parse(event.data));
      } catch { /* skip */ }
    });

    sseConnection.onerror = () => {
      showConnectionStatus();
      scheduleReconnect();
    };

  } catch {
    showConnectionStatus();
    scheduleReconnect();
  }
}

function handleSSEUpdate(data) {
  if (data.type === 'full') {
    updateLobbyUI(data);
  } else if (data.type === 'goal') {
    updateGoal(data.goal || data);
  } else if (data.type === 'leaderboard') {
    updateLeaderboard(data.leaderboard || data.entries);
  } else if (data.type === 'athlete') {
    updateAthlete(data.athlete_of_week || data);
  } else if (data.type === 'challenges') {
    updateChallenges(data.challenges || data);
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;

  reconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectSSE();
  }, delay);
}

function showConnectionStatus() {
  const el = document.getElementById('lobbyConnection');
  if (el) el.style.display = 'flex';
}

function hideConnectionStatus() {
  const el = document.getElementById('lobbyConnection');
  if (el) el.style.display = 'none';
}

// ── Demo Data Fallback ────────────────────────────────────

function loadDemoLobbyData() {
  const nameEl = document.getElementById('lobbyStudioName');
  if (nameEl) nameEl.textContent = 'CorePower Pilates';

  updateGoal({
    name: 'March Burn Challenge',
    current: 3420,
    target: 5000,
  });

  updateAthlete({
    name: 'Jake Rodriguez',
    score: 91.4,
  });

  updateLeaderboard([
    { name: 'Jake R.', score: 91.4 },
    { name: 'Maya K.', score: 87.2 },
    { name: 'Alex L.', score: 84.9 },
    { name: 'Sarah M.', score: 79.8 },
    { name: 'Chris P.', score: 76.1 },
  ]);

  updateChallenges([
    { name: 'February Burn Challenge', current: 3420, target: 5000 },
    { name: 'Step It Up', current: 72400, target: 100000 },
    { name: 'Recovery Warriors', current: 78, target: 85 },
  ]);
}

// ── Utilities ─────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function updateClock() {
  const el = document.getElementById('lobbyTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function showError(message) {
  const lobby = document.getElementById('lobby');
  if (lobby) {
    lobby.innerHTML = `
      <div class="lobby__error">
        <div class="lobby__error-icon">⚠️</div>
        <div class="lobby__error-message">${message}</div>
      </div>
    `;
  }
}
