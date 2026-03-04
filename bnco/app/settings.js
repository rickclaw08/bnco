/* ═══════════════════════════════════════════════════════════
   BNCO - Settings Module
   Wearable connection management and privacy preferences
   ═══════════════════════════════════════════════════════════ */

import { getDevices, connectWhoop, disconnectWhoop } from './api.js';

// ── State ─────────────────────────────────────────────────

let devicesState = {
  whoop: { connected: false, username: null },
  apple_watch: { connected: false },
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
        devicesState.whoop = { connected: true, username: d.username || d.name || 'Connected' };
      }
      if (d.provider === 'apple_watch' || d.type === 'apple_watch') {
        devicesState.apple_watch = { connected: true };
      }
    });
  }

  renderDeviceStatus();
}

// ── Render Device Status ──────────────────────────────────

function renderDeviceStatus() {
  // WHOOP
  const whoopDot = document.getElementById('whoopStatusDot');
  const whoopDetail = document.getElementById('whoopDetail');
  const whoopBtn = document.getElementById('whoopConnectBtn');
  const whoopDevice = document.getElementById('settingsWhoop');

  if (devicesState.whoop.connected) {
    whoopDot?.classList.remove('settings__device-status--disconnected');
    whoopDot?.classList.add('settings__device-status--connected');
    whoopDevice?.classList.add('settings__device--connected');
    if (whoopDetail) whoopDetail.textContent = devicesState.whoop.username || 'Connected';
    if (whoopBtn) {
      whoopBtn.textContent = 'Disconnect';
      whoopBtn.classList.add('settings__device-action--disconnect');
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
    if (appleDetail) appleDetail.textContent = 'Syncing via iOS app';
    if (appleBadge) {
      appleBadge.querySelector('.settings__appstore-text').textContent = 'Connected';
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
  if (devicesState.whoop.connected) connected.push({ name: 'WHOOP', status: 'syncing' });
  if (devicesState.apple_watch.connected) connected.push({ name: 'Apple Watch', status: 'syncing' });

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
            <div class="settings__device-detail">Syncing</div>
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
      devicesState.whoop = { connected: false, username: null };
      renderDeviceStatus();
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

// ── Handle WHOOP OAuth Callback ───────────────────────────

function handleWhoopCallback() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('whoop') === 'connected') {
    devicesState.whoop = { connected: true, username: 'WHOOP User' };
    renderDeviceStatus();

    // Clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete('whoop');
    window.history.replaceState({}, '', url.toString());
  }
}
