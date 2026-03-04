/* ═══════════════════════════════════════════════════════════
   BNCO - Settings Module
   Wearable connection management, sync controls, and biometric data feed
   ═══════════════════════════════════════════════════════════ */

import {
  getDevices,
  connectWhoop,
  disconnectWhoop,
  syncWhoop,
  getWhoopStatus,
  getAppleHealthStatus,
  getMyWorkouts,
} from './api.js';

// ── State ─────────────────────────────────────────────────

let devicesState = {
  whoop: { connected: false, username: null, lastSync: null, syncing: false },
  apple_watch: { connected: false, lastSync: null },
};

// ── Init ──────────────────────────────────────────────────

/**
 * Initialize the settings section.
 * Binds events and loads device status.
 */
export function initSettings() {
  bindSettingsEvents();
  loadDeviceStatus();
  handleWhoopCallback();
}

// ── Event Bindings ────────────────────────────────────────

function bindSettingsEvents() {
  // Gear icon scrolls to settings
  const settingsBtn = document.getElementById('navSettingsBtn');
  settingsBtn?.addEventListener('click', () => {
    const section = document.getElementById('settingsSection');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // WHOOP connect/disconnect
  const whoopBtn = document.getElementById('whoopConnectBtn');
  whoopBtn?.addEventListener('click', handleWhoopAction);

  // WHOOP sync button
  const whoopSyncBtn = document.getElementById('whoopSyncBtn');
  whoopSyncBtn?.addEventListener('click', handleWhoopSync);

  // Leaderboard privacy toggle
  const leaderboardToggle = document.getElementById('leaderboardToggle');
  leaderboardToggle?.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    localStorage.setItem('bnco_leaderboard_visible', enabled ? 'true' : 'false');
  });

  // Restore toggle state
  const saved = localStorage.getItem('bnco_leaderboard_visible');
  if (saved === 'false' && leaderboardToggle) {
    leaderboardToggle.checked = false;
  }
}

// ── Load Device Status ────────────────────────────────────

async function loadDeviceStatus() {
  const result = await getDevices();

  if (result.ok && result.data) {
    const devices = Array.isArray(result.data) ? result.data : result.data.devices || [];
    devices.forEach(d => {
      if (d.provider === 'whoop' || d.type === 'whoop') {
        devicesState.whoop = {
          connected: true,
          username: d.username || d.name || 'Connected',
          lastSync: d.last_sync || null,
          syncing: false,
        };
      }
      if (d.provider === 'apple_watch' || d.type === 'apple_watch') {
        devicesState.apple_watch = {
          connected: true,
          lastSync: d.last_sync || null,
        };
      }
    });
  }

  // Load sync status details
  await loadSyncStatuses();

  renderDeviceStatus();
  renderWearableDataFeed();
}

async function loadSyncStatuses() {
  // WHOOP status
  if (devicesState.whoop.connected) {
    const whoopStatus = await getWhoopStatus();
    if (whoopStatus.ok && whoopStatus.data) {
      devicesState.whoop.lastSync = whoopStatus.data.last_sync;
    }
  }

  // Apple Health status
  if (devicesState.apple_watch.connected) {
    const appleStatus = await getAppleHealthStatus();
    if (appleStatus.ok && appleStatus.data) {
      devicesState.apple_watch.lastSync = appleStatus.data.last_sync;
    }
  }
}

// ── Render Device Status ──────────────────────────────────

function renderDeviceStatus() {
  // WHOOP
  const whoopDot = document.getElementById('whoopStatusDot');
  const whoopDetail = document.getElementById('whoopDetail');
  const whoopBtn = document.getElementById('whoopConnectBtn');
  const whoopDevice = document.getElementById('settingsWhoop');
  const whoopSyncBtn = document.getElementById('whoopSyncBtn');
  const whoopSyncInfo = document.getElementById('whoopSyncInfo');

  if (devicesState.whoop.connected) {
    whoopDot?.classList.remove('settings__device-status--disconnected');
    whoopDot?.classList.add('settings__device-status--connected');
    whoopDevice?.classList.add('settings__device--connected');
    if (whoopDetail) whoopDetail.textContent = devicesState.whoop.username || 'Connected';
    if (whoopBtn) {
      whoopBtn.textContent = 'Disconnect';
      whoopBtn.classList.add('settings__device-action--disconnect');
    }
    // Show sync button
    if (whoopSyncBtn) {
      whoopSyncBtn.style.display = '';
      whoopSyncBtn.disabled = devicesState.whoop.syncing;
      whoopSyncBtn.textContent = devicesState.whoop.syncing ? '⏳ Syncing...' : '🔄 Sync Now';
    }
    // Show last sync info
    if (whoopSyncInfo) {
      if (devicesState.whoop.lastSync) {
        const syncDate = new Date(devicesState.whoop.lastSync);
        whoopSyncInfo.textContent = `Last sync: ${formatRelativeTime(syncDate)}`;
        whoopSyncInfo.style.display = '';
      } else {
        whoopSyncInfo.textContent = 'Not synced yet';
        whoopSyncInfo.style.display = '';
      }
    }
  } else {
    whoopDot?.classList.remove('settings__device-status--connected');
    whoopDot?.classList.add('settings__device-status--disconnected');
    whoopDevice?.classList.remove('settings__device--connected');
    if (whoopDetail) whoopDetail.textContent = 'Not connected';
    if (whoopBtn) {
      whoopBtn.textContent = '🔗 Connect via WHOOP OAuth';
      whoopBtn.classList.remove('settings__device-action--disconnect');
    }
    if (whoopSyncBtn) whoopSyncBtn.style.display = 'none';
    if (whoopSyncInfo) whoopSyncInfo.style.display = 'none';
  }

  // Apple Watch
  const appleDot = document.getElementById('appleStatusDot');
  const appleDevice = document.getElementById('settingsApple');
  const appleBadge = document.getElementById('appleStoreBadge');

  if (devicesState.apple_watch.connected) {
    appleDot?.classList.remove('settings__device-status--disconnected');
    appleDot?.classList.add('settings__device-status--connected');
    appleDevice?.classList.add('settings__device--connected');
    const appleDetail = document.getElementById('appleDetail');
    if (appleDetail) {
      if (devicesState.apple_watch.lastSync) {
        const syncDate = new Date(devicesState.apple_watch.lastSync);
        appleDetail.textContent = `Syncing via iOS app (last: ${formatRelativeTime(syncDate)})`;
      } else {
        appleDetail.textContent = 'Syncing via iOS app';
      }
    }
    if (appleBadge) {
      const badgeText = appleBadge.querySelector('.settings__appstore-text');
      if (badgeText) badgeText.textContent = 'Connected';
    }
  } else {
    if (appleBadge) {
      appleBadge.style.cursor = 'pointer';
      appleBadge.addEventListener('click', () => {
        alert('Apple Watch requires the BNCO iOS app with Apple Health permissions enabled. Download it from the App Store to sync your Core Motion and heart rate data.');
      });
    }
  }

  // Bind data info toggle
  const dataInfoToggle = document.getElementById('dataInfoToggle');
  const dataInfoContent = document.getElementById('dataInfoContent');
  const dataInfoChevron = document.getElementById('dataInfoChevron');
  if (dataInfoToggle && dataInfoContent) {
    dataInfoToggle.addEventListener('click', () => {
      const isHidden = dataInfoContent.style.display === 'none';
      dataInfoContent.style.display = isHidden ? '' : 'none';
      if (dataInfoChevron) dataInfoChevron.textContent = isHidden ? '▲' : '▼';
    });
  }

  // Devices list summary
  renderDevicesList();
}

function renderDevicesList() {
  const container = document.getElementById('devicesListContainer');
  if (!container) return;

  const connected = [];
  if (devicesState.whoop.connected) connected.push({ name: 'WHOOP', status: 'syncing', lastSync: devicesState.whoop.lastSync });
  if (devicesState.apple_watch.connected) connected.push({ name: 'Apple Watch', status: 'syncing', lastSync: devicesState.apple_watch.lastSync });

  if (connected.length === 0) {
    container.innerHTML = `
      <div class="settings__devices-empty">No devices connected yet. Connect a wearable to power your Vibe Score.</div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="settings__devices-list-title">Active Connections</div>
    ${connected.map(d => `
      <div class="settings__device settings__device--connected" style="margin-bottom: 8px;">
        <div class="settings__device-left">
          <div class="settings__device-status settings__device-status--connected"></div>
          <div class="settings__device-info">
            <div class="settings__device-name">${d.name}</div>
            <div class="settings__device-detail">${d.lastSync ? `Last sync: ${formatRelativeTime(new Date(d.lastSync))}` : 'Syncing'}</div>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}

// ── WHOOP Actions ─────────────────────────────────────────

async function handleWhoopAction() {
  if (devicesState.whoop.connected) {
    // Disconnect
    const confirmed = confirm('Disconnect WHOOP? Your biometric data will no longer sync.');
    if (!confirmed) return;

    const btn = document.getElementById('whoopConnectBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Disconnecting...'; }

    const result = await disconnectWhoop();

    if (result.ok) {
      devicesState.whoop = { connected: false, username: null, lastSync: null, syncing: false };
      renderDeviceStatus();
      renderWearableDataFeed();
    } else {
      alert('Failed to disconnect. Please try again.');
    }

    if (btn) btn.disabled = false;
  } else {
    // Connect - initiate OAuth
    const btn = document.getElementById('whoopConnectBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Connecting...'; }

    const result = await connectWhoop();

    if (result.ok && result.data?.auth_url) {
      // Open WHOOP OAuth in new window
      window.open(result.data.auth_url, 'whoop_oauth', 'width=600,height=700');
    } else {
      alert('Could not start WHOOP connection. Please try again.');
    }

    if (btn) { btn.disabled = false; btn.textContent = 'Connect'; }
  }
}

// ── WHOOP Manual Sync ─────────────────────────────────────

async function handleWhoopSync() {
  if (devicesState.whoop.syncing) return;

  devicesState.whoop.syncing = true;
  const btn = document.getElementById('whoopSyncBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Syncing...'; }

  const result = await syncWhoop();

  devicesState.whoop.syncing = false;

  if (result.ok && result.data) {
    const { synced, skipped, total } = result.data;
    devicesState.whoop.lastSync = new Date().toISOString();
    renderDeviceStatus();
    renderWearableDataFeed();

    // Show brief success feedback
    if (btn) {
      btn.textContent = `✅ ${synced} synced`;
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = '🔄 Sync Now';
      }, 3000);
    }
  } else {
    if (btn) {
      btn.textContent = '❌ Sync failed';
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = '🔄 Sync Now';
      }, 3000);
    }
  }
}

// ── Handle WHOOP OAuth Callback ───────────────────────────

function handleWhoopCallback() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('whoop') === 'connected') {
    devicesState.whoop = { connected: true, username: 'WHOOP User', lastSync: null, syncing: false };
    renderDeviceStatus();

    // Auto-trigger initial sync after connection
    setTimeout(() => handleWhoopSync(), 1000);

    // Clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete('whoop');
    window.history.replaceState({}, '', url.toString());
  }
}

// ── Wearable Data Feed ────────────────────────────────────

async function renderWearableDataFeed() {
  const container = document.getElementById('wearableDataFeed');
  if (!container) return;

  // Load recent workouts
  const result = await getMyWorkouts({ limit: 10 });

  if (!result.ok || !result.data?.workouts || result.data.workouts.length === 0) {
    container.innerHTML = `
      <div class="wearable-feed__empty">
        <div class="wearable-feed__empty-icon">📊</div>
        <div class="wearable-feed__empty-text">No biometric data yet</div>
        <div class="wearable-feed__empty-sub">Connect a wearable and sync to see your data here</div>
      </div>
    `;
    return;
  }

  const workouts = result.data.workouts;

  container.innerHTML = `
    <div class="wearable-feed__title">Recent Biometric Data</div>
    <div class="wearable-feed__list">
      ${workouts.map(w => {
        const date = new Date(w.recorded_at);
        const sourceIcon = w.source === 'whoop' ? '🟢' : w.source === 'apple_watch' ? '⌚' : '📱';
        const sourceName = w.source === 'whoop' ? 'WHOOP' : w.source === 'apple_watch' ? 'Apple Watch' : w.source;
        const score = w.bnco_score != null ? w.bnco_score : '--';
        const scoreClass = w.bnco_score >= 80 ? 'high' : w.bnco_score >= 60 ? 'mid' : 'low';

        return `
          <div class="wearable-feed__item">
            <div class="wearable-feed__item-left">
              <div class="wearable-feed__source">${sourceIcon}</div>
              <div class="wearable-feed__info">
                <div class="wearable-feed__date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                <div class="wearable-feed__meta">${sourceName} - ${w.duration_minutes || 0}min</div>
              </div>
            </div>
            <div class="wearable-feed__score wearable-feed__score--${scoreClass}">${score}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ── Utilities ─────────────────────────────────────────────

function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.round(diffMs / 60000);
  const diffHr = Math.round(diffMs / 3600000);
  const diffDay = Math.round(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Expose state for main.js to check wearable status.
 */
export function getWearableState() {
  return devicesState;
}
