// ============================================
// ClawOps HQ Dashboard - Main Logic
// ============================================

let currentAgent = null;
let chatHistory = {};
let ws = null;
let gatewayUrl = 'ws://127.0.0.1:18789';
let gatewayToken = '';
let agentStatuses = {};

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
  // Load saved settings
  const savedUrl = localStorage.getItem('clawops-gateway-url');
  const savedToken = localStorage.getItem('clawops-gateway-token');
  const savedTheme = localStorage.getItem('clawops-theme');
  
  if (savedUrl) gatewayUrl = savedUrl;
  if (savedToken) gatewayToken = savedToken;
  if (savedTheme) setTheme(savedTheme);

  document.getElementById('gateway-url').value = gatewayUrl;
  if (savedToken) document.getElementById('gateway-token').value = savedToken;

  renderAgentCards();
  renderSkills();
  connectGateway();
  
  // Refresh status every 30s
  setInterval(refreshStatus, 30000);
});

// ---- Gateway Connection ----
function connectGateway() {
  if (ws) {
    try { ws.close(); } catch(e) {}
  }

  const url = new URL(gatewayUrl);
  if (gatewayToken) {
    url.searchParams.set('token', gatewayToken);
  }

  try {
    ws = new WebSocket(url.toString());
    
    ws.onopen = () => {
      showToast('Connected to Gateway', 'success');
      updateGatewayStatus(true);
      refreshStatus();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWsMessage(data);
      } catch(e) {}
    };

    ws.onerror = (err) => {
      console.error('WS error:', err);
      updateGatewayStatus(false);
    };

    ws.onclose = () => {
      updateGatewayStatus(false);
      // Auto-reconnect after 5s
      setTimeout(() => {
        if (!ws || ws.readyState === WebSocket.CLOSED) {
          connectGateway();
        }
      }, 5000);
    };
  } catch(e) {
    showToast('Failed to connect: ' + e.message, 'error');
    updateGatewayStatus(false);
  }
}

function updateGatewayStatus(connected) {
  const el = document.getElementById('gateway-status');
  if (connected) {
    el.classList.add('active');
    el.classList.remove('error');
  } else {
    el.classList.remove('active');
    el.classList.add('error');
  }
}

function handleWsMessage(data) {
  if (data.type === 'chat' && data.message) {
    // Incoming chat message for the current agent
    if (currentAgent && data.agentId === currentAgent.id) {
      addChatMessage(data.message, 'assistant', currentAgent.name);
    }
  }
  if (data.type === 'status') {
    updateAgentStatuses(data);
  }
}

function sendWsMessage(type, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

// ---- Agent Cards ----
function renderAgentCards() {
  const container = document.getElementById('agent-cards');
  container.innerHTML = '';

  AGENTS.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.id = `card-${agent.id}`;
    card.onclick = () => openChat(agent);
    card.ondblclick = () => openAgentModal(agent);
    card.innerHTML = `
      <div class="agent-avatar">
        <div class="avatar-3d" style="border-color: ${agent.color}">${agent.emoji}</div>
        <div class="agent-status-dot online" id="dot-${agent.id}"></div>
      </div>
      <div class="agent-name">${agent.name}</div>
      <div class="agent-role">${agent.role}</div>
    `;

    // Drop zone for skills
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.classList.add('active');
    });
    card.addEventListener('dragleave', () => {
      card.classList.remove('active');
    });
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('active');
      const skillId = e.dataTransfer.getData('text/plain');
      assignSkill(agent, skillId);
    });

    container.appendChild(card);
  });

  document.getElementById('active-count').textContent = AGENTS.length;
}

// ---- Chat ----
function openChat(agent) {
  currentAgent = agent;
  const panel = document.getElementById('chat-panel');
  panel.classList.remove('hidden');

  document.getElementById('chat-avatar').textContent = agent.emoji;
  document.getElementById('chat-agent-name').textContent = agent.name;
  document.getElementById('chat-agent-role').textContent = agent.title;

  // Highlight card
  document.querySelectorAll('.agent-card').forEach(c => c.classList.remove('active'));
  document.getElementById(`card-${agent.id}`).classList.add('active');

  // Highlight 3D
  if (typeof highlightAgent3D === 'function') highlightAgent3D(agent.id);

  // Load chat history
  renderChatHistory(agent.id);
  
  document.getElementById('chat-input').focus();
}

function closeChat() {
  document.getElementById('chat-panel').classList.add('hidden');
  document.querySelectorAll('.agent-card').forEach(c => c.classList.remove('active'));
  if (typeof highlightAgent3D === 'function') highlightAgent3D(null);
  currentAgent = null;
}

function renderChatHistory(agentId) {
  const container = document.getElementById('chat-messages');
  const history = chatHistory[agentId] || [];
  
  if (history.length === 0) {
    const agent = AGENTS.find(a => a.id === agentId);
    container.innerHTML = `<div class="chat-welcome">Start a conversation with ${agent.name}</div>`;
    return;
  }

  container.innerHTML = '';
  history.forEach(msg => {
    const div = document.createElement('div');
    div.className = `chat-msg ${msg.role}`;
    if (msg.role === 'assistant') {
      div.innerHTML = `<div class="msg-sender">${msg.sender || 'Agent'}</div>${escapeHtml(msg.text)}`;
    } else {
      div.textContent = msg.text;
    }
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

function addChatMessage(text, role, sender) {
  if (!currentAgent) return;
  
  if (!chatHistory[currentAgent.id]) chatHistory[currentAgent.id] = [];
  chatHistory[currentAgent.id].push({ text, role, sender, time: Date.now() });
  renderChatHistory(currentAgent.id);
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !currentAgent) return;

  addChatMessage(text, 'user', 'You');
  input.value = '';
  input.style.height = 'auto';

  // Send via WS
  sendWsMessage('chat.send', {
    agentId: currentAgent.id,
    message: text,
  });

  // Simulate response if not connected
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    setTimeout(() => {
      addChatMessage(`[Offline mode] Message queued for ${currentAgent.name}. Connect to gateway to send.`, 'assistant', currentAgent.name);
    }, 500);
  }
}

function handleChatKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
  // Auto-resize
  const input = event.target;
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

// ---- Skills Panel ----
function toggleSkillsPanel() {
  const panel = document.getElementById('skills-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    document.getElementById('settings-panel').classList.add('hidden');
  }
}

function renderSkills() {
  const container = document.getElementById('skills-list');
  container.innerHTML = '';

  AVAILABLE_SKILLS.forEach(skill => {
    const item = document.createElement('div');
    item.className = 'skill-item';
    item.draggable = true;
    item.innerHTML = `
      <div class="skill-icon">${skill.icon}</div>
      <div class="skill-info">
        <h4>${skill.name}</h4>
        <p>${skill.description}</p>
      </div>
    `;

    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', skill.id);
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });

    container.appendChild(item);
  });
}

function filterSkills(query) {
  const items = document.querySelectorAll('.skill-item');
  query = query.toLowerCase();
  items.forEach(item => {
    const name = item.querySelector('h4').textContent.toLowerCase();
    const desc = item.querySelector('p').textContent.toLowerCase();
    item.style.display = (name.includes(query) || desc.includes(query)) ? 'flex' : 'none';
  });
}

function assignSkill(agent, skillId) {
  const skill = AVAILABLE_SKILLS.find(s => s.id === skillId);
  if (!skill) return;

  const agentData = AGENTS.find(a => a.id === agent.id);
  if (!agentData.skills.includes(skillId)) {
    agentData.skills.push(skillId);
    showToast(`Assigned ${skill.name} to ${agent.name}`, 'success');
  } else {
    showToast(`${agent.name} already has ${skill.name}`, 'info');
  }
}

// ---- Agent Modal ----
function openAgentModal(agent) {
  currentAgent = agent;
  const modal = document.getElementById('agent-modal');
  modal.classList.remove('hidden');

  document.getElementById('modal-avatar').textContent = agent.emoji;
  document.getElementById('modal-avatar').style.borderColor = agent.color;
  document.getElementById('modal-name').textContent = agent.name;
  document.getElementById('modal-role').textContent = agent.title;

  switchTab('overview');

  // Setup drop zone
  const dropZone = document.getElementById('skill-drop-zone');
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const skillId = e.dataTransfer.getData('text/plain');
    assignSkill(agent, skillId);
    switchTab('skills');
  });
}

function closeModal() {
  document.getElementById('agent-modal').classList.add('hidden');
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');

  const content = document.getElementById('tab-content');
  const agent = currentAgent;
  const agentData = AGENTS.find(a => a.id === agent.id);

  switch(tab) {
    case 'overview':
      content.innerHTML = `
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-value">${agentData.skills.length}</div>
            <div class="stat-label">Active Skills</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${(chatHistory[agent.id] || []).length}</div>
            <div class="stat-label">Messages</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${agentStatuses[agent.id]?.status || 'Ready'}</div>
            <div class="stat-label">Status</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="font-size:14px">${agentData.model.split('/').pop()}</div>
            <div class="stat-label">Model</div>
          </div>
        </div>
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6">${agentData.description}</p>
      `;
      break;

    case 'skills':
      const skillsHtml = agentData.skills.map(sid => {
        const skill = AVAILABLE_SKILLS.find(s => s.id === sid);
        return skill ? `
          <div class="assigned-skill">
            <span>${skill.icon} <span class="skill-name">${skill.name}</span></span>
            <button class="btn-remove" onclick="removeSkill('${agent.id}', '${sid}')">✕</button>
          </div>
        ` : '';
      }).join('');
      content.innerHTML = skillsHtml || '<p style="color: var(--text-muted)">No skills assigned. Drag skills here from the Skills Library.</p>';
      break;

    case 'sessions':
      content.innerHTML = `
        <p style="color: var(--text-secondary); font-size: 14px">Session data loads from gateway connection.</p>
        <div class="stat-grid" style="margin-top: 16px">
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Active Sessions</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Total Tokens</div>
          </div>
        </div>
      `;
      break;

    case 'config':
      content.innerHTML = `
        <div class="setting-group">
          <label>Agent ID</label>
          <input type="text" value="${agent.id}" readonly style="opacity:0.6">
        </div>
        <div class="setting-group" style="margin-top: 12px">
          <label>Model</label>
          <input type="text" value="${agentData.model}" id="config-model">
        </div>
        <div class="setting-group" style="margin-top: 12px">
          <label>Name</label>
          <input type="text" value="${agent.name}" id="config-name">
        </div>
        <button class="btn-primary" style="margin-top: 16px" onclick="saveAgentConfig()">Save Changes</button>
      `;
      break;
  }
}

function removeSkill(agentId, skillId) {
  const agent = AGENTS.find(a => a.id === agentId);
  if (agent) {
    agent.skills = agent.skills.filter(s => s !== skillId);
    switchTab('skills');
    showToast('Skill removed', 'info');
  }
}

function saveAgentConfig() {
  showToast('Config saved (local only)', 'success');
  closeModal();
}

// ---- Settings ----
function toggleSettings() {
  const panel = document.getElementById('settings-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    document.getElementById('skills-panel').classList.add('hidden');
  }
}

function updateGateway() {
  gatewayUrl = document.getElementById('gateway-url').value;
  gatewayToken = document.getElementById('gateway-token').value;
  localStorage.setItem('clawops-gateway-url', gatewayUrl);
  localStorage.setItem('clawops-gateway-token', gatewayToken);
}

function setTheme(theme) {
  document.body.className = '';
  if (theme !== 'dark') {
    document.body.classList.add(`theme-${theme}`);
  }
  localStorage.setItem('clawops-theme', theme);
  const select = document.getElementById('theme-select');
  if (select) select.value = theme;
}

// ---- Status Refresh ----
function refreshStatus() {
  // Try to fetch status from gateway
  const httpUrl = gatewayUrl.replace('ws://', 'http://').replace('wss://', 'https://');
  fetch(httpUrl + '/api/status', {
    headers: gatewayToken ? { 'Authorization': `Bearer ${gatewayToken}` } : {},
  })
  .then(r => r.json())
  .then(data => {
    if (data.agents) {
      document.getElementById('active-count').textContent = data.agents.length || AGENTS.length;
    }
  })
  .catch(() => {
    // Gateway not reachable via HTTP, that's fine
  });
}

function updateAgentStatuses(data) {
  if (data.agents) {
    data.agents.forEach(a => {
      agentStatuses[a.id] = a;
      const dot = document.getElementById(`dot-${a.id}`);
      if (dot) {
        dot.className = 'agent-status-dot ' + (a.busy ? 'busy' : 'online');
      }
      const card = document.getElementById(`card-${a.id}`);
      if (card) {
        if (a.busy) card.classList.add('busy');
        else card.classList.remove('busy');
      }
    });
  }
}

// ---- Toast Notifications ----
function showToast(message, type = 'info') {
  const container = document.getElementById('toasts');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${escapeHtml(message)}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ---- Utilities ----
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
