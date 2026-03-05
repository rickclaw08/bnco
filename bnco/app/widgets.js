/* ═══════════════════════════════════════════════════════════
   BNCO - Apple-Style Widget System
   Long-press to edit, drag to reorder, add/remove widgets
   ═══════════════════════════════════════════════════════════ */

import './widgets.css';

// ── Widget Registries ─────────────────────────────────────
const ATHLETE_WIDGETS = [
  { id: 'profile',       name: 'Profile & Score',   icon: '👤', selector: '#profileSection' },
  { id: 'leaderboard',   name: 'Leaderboards',      icon: '🏆', selector: '#leaderboardSection' },
  { id: 'ghost-racing',  name: 'Ghost Racing',      icon: '👻', selector: '#ghostSection' },
  { id: 'achievements',  name: 'Achievements',       icon: '🏅', selector: '#achievementsSection' },
  { id: 'goals',         name: 'My Goals',           icon: '🎯', selector: '#goalsSection' },
  { id: 'settings',      name: 'Settings',           icon: '⚙️', selector: '#settingsSection', permanent: true },
];

const STUDIO_WIDGETS = [
  { id: 'studio-analytics', name: 'Studio Dashboard',  icon: '📊', selector: '#studioAnalyticsSection' },
  { id: 'missions',         name: 'Missions',          icon: '🚀', selector: '#missionsSection' },
  { id: 'studio-wars',      name: 'Wars & At-Risk',    icon: '🏟️', selector: '#studioWarsSection' },
  { id: 'system-controls',  name: 'Controls & Rankings',icon: '🔧', selector: '#systemControlsSection' },
];

// ── State ─────────────────────────────────────────────────
let _editMode = false;
let _currentViewType = null;
let _pressTimer = null;
let _touchDragState = null;
let _editBar = null;
let _pickerEl = null;

const STORAGE_KEYS = {
  athlete: 'bnco_athlete_layout',
  studio: 'bnco_studio_layout',
};

// ── Public API ────────────────────────────────────────────

export function initWidgetSystem(viewType) {
  _currentViewType = viewType;
  const widgets = getRegistry(viewType);
  const container = getViewContainer(viewType);
  if (!container) return;

  // Apply saved layout (order + hidden)
  const layout = loadLayout(viewType);
  applyLayout(container, widgets, layout);

  // Setup long-press listeners
  setupLongPress(container, viewType);

  // Inject UI elements if not already present
  ensureEditBar();
  ensurePicker();
}

export function enterEditMode(viewType) {
  if (_editMode) return;
  _editMode = true;
  _currentViewType = viewType;

  document.body.classList.add('widget-editing');

  const container = getViewContainer(viewType);
  if (!container) return;

  const sections = container.querySelectorAll('.widget-section:not(.widget-section--hidden)');
  sections.forEach(section => {
    section.classList.add('widget-section--editing');
    injectDeleteButton(section);
    setupDesktopDrag(section);
    setupTouchDrag(section);
  });

  // Show edit bar
  if (_editBar) {
    _editBar.classList.add('widget-edit-bar--visible');
  }

  // Haptic feedback
  if (navigator.vibrate) navigator.vibrate(50);
}

export function exitEditMode() {
  if (!_editMode) return;
  _editMode = false;

  document.body.classList.remove('widget-editing');

  // Save layout before exiting
  if (_currentViewType) {
    saveCurrentLayout(_currentViewType);
  }

  // Clean up editing state
  document.querySelectorAll('.widget-section--editing').forEach(section => {
    section.classList.remove('widget-section--editing');
    section.removeAttribute('draggable');
  });

  // Remove delete buttons
  document.querySelectorAll('.widget-delete-btn').forEach(btn => btn.remove());

  // Remove drop indicators
  document.querySelectorAll('.widget-drop-indicator').forEach(ind => ind.remove());

  // Hide edit bar
  if (_editBar) {
    _editBar.classList.remove('widget-edit-bar--visible');
  }

  // Hide picker if open
  hidePicker();
}

// ── Registry Helpers ──────────────────────────────────────

function getRegistry(viewType) {
  return viewType === 'studio' ? STUDIO_WIDGETS : ATHLETE_WIDGETS;
}

function getViewContainer(viewType) {
  return viewType === 'studio'
    ? document.getElementById('studioView')
    : document.getElementById('athleteView');
}

// ── Layout Persistence ────────────────────────────────────

function loadLayout(viewType) {
  const key = STORAGE_KEYS[viewType];
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.order)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveLayout(viewType, layout) {
  const key = STORAGE_KEYS[viewType];
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(layout));
  } catch {
    // localStorage full or unavailable
  }
}

function saveCurrentLayout(viewType) {
  const container = getViewContainer(viewType);
  if (!container) return;

  const widgets = getRegistry(viewType);
  const sections = container.querySelectorAll('.widget-section');
  const order = [];
  const hidden = [];

  sections.forEach(section => {
    const widgetId = section.dataset.widgetId;
    if (!widgetId) return;
    order.push(widgetId);
    if (section.classList.contains('widget-section--hidden')) {
      hidden.push(widgetId);
    }
  });

  // Add any widgets not in DOM (newly added to registry)
  widgets.forEach(w => {
    if (!order.includes(w.id)) {
      order.push(w.id);
    }
  });

  saveLayout(viewType, { order, hidden });
}

function applyLayout(container, widgets, layout) {
  if (!layout) return;

  const { order, hidden } = layout;
  if (!Array.isArray(order)) return;

  // Collect all widget sections
  const sectionMap = {};
  container.querySelectorAll('.widget-section').forEach(section => {
    const wid = section.dataset.widgetId;
    if (wid) sectionMap[wid] = section;
  });

  // Reorder: append in layout order
  const orderedIds = [...order];
  // Add any widgets not in saved layout at the end
  widgets.forEach(w => {
    if (!orderedIds.includes(w.id)) {
      orderedIds.push(w.id);
    }
  });

  orderedIds.forEach(id => {
    const section = sectionMap[id];
    if (section) {
      container.appendChild(section);
    }
  });

  // Apply hidden state
  if (Array.isArray(hidden)) {
    hidden.forEach(id => {
      const section = sectionMap[id];
      if (section) {
        // Settings widget cannot be hidden
        const widget = widgets.find(w => w.id === id);
        if (widget && widget.permanent) return;
        section.classList.add('widget-section--hidden');
      }
    });
  }
}

// ── Long-Press Detection ──────────────────────────────────

function setupLongPress(container, viewType) {
  // Touch events (mobile)
  container.addEventListener('touchstart', (e) => {
    if (_editMode) return;
    // Only trigger on widget sections
    const section = e.target.closest('.widget-section');
    if (!section) return;

    _pressTimer = setTimeout(() => {
      enterEditMode(viewType);
    }, 600);
  }, { passive: true });

  container.addEventListener('touchend', () => {
    clearTimeout(_pressTimer);
    _pressTimer = null;
  }, { passive: true });

  container.addEventListener('touchmove', () => {
    clearTimeout(_pressTimer);
    _pressTimer = null;
  }, { passive: true });

  // Mouse events (desktop)
  container.addEventListener('mousedown', (e) => {
    if (_editMode) return;
    const section = e.target.closest('.widget-section');
    if (!section) return;
    // Ignore clicks on interactive elements
    if (e.target.closest('button, a, input, select, textarea, label, .toggle')) return;

    _pressTimer = setTimeout(() => {
      enterEditMode(viewType);
    }, 600);
  });

  container.addEventListener('mouseup', () => {
    clearTimeout(_pressTimer);
    _pressTimer = null;
  });

  container.addEventListener('mouseleave', () => {
    clearTimeout(_pressTimer);
    _pressTimer = null;
  });
}

// ── Delete Button ─────────────────────────────────────────

function injectDeleteButton(section) {
  if (section.querySelector('.widget-delete-btn')) return;

  const widgetId = section.dataset.widgetId;
  const widgets = getRegistry(_currentViewType);
  const widget = widgets.find(w => w.id === widgetId);

  // Don't show delete on permanent widgets
  if (widget && widget.permanent) return;

  const btn = document.createElement('button');
  btn.className = 'widget-delete-btn';
  btn.innerHTML = '&minus;';
  btn.setAttribute('aria-label', 'Remove widget');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeWidget(widgetId);
  });

  section.appendChild(btn);
}

function removeWidget(widgetId) {
  const container = getViewContainer(_currentViewType);
  if (!container) return;

  const section = container.querySelector(`.widget-section[data-widget-id="${widgetId}"]`);
  if (!section) return;

  // Animate out
  section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  section.style.opacity = '0';
  section.style.transform = 'scale(0.9)';

  setTimeout(() => {
    section.classList.add('widget-section--hidden');
    section.classList.remove('widget-section--editing');
    section.style.opacity = '';
    section.style.transform = '';
    section.style.transition = '';

    // Remove the delete button
    const btn = section.querySelector('.widget-delete-btn');
    if (btn) btn.remove();

    saveCurrentLayout(_currentViewType);
  }, 300);
}

function addWidget(widgetId) {
  const container = getViewContainer(_currentViewType);
  if (!container) return;

  const section = container.querySelector(`.widget-section[data-widget-id="${widgetId}"]`);
  if (!section) return;

  section.classList.remove('widget-section--hidden');

  // If still in edit mode, add editing state
  if (_editMode) {
    section.classList.add('widget-section--editing');
    injectDeleteButton(section);
    setupDesktopDrag(section);
    setupTouchDrag(section);
  }

  saveCurrentLayout(_currentViewType);
  hidePicker();
}

// ── Desktop Drag and Drop (HTML5) ─────────────────────────

function setupDesktopDrag(section) {
  section.setAttribute('draggable', 'true');

  section.addEventListener('dragstart', (e) => {
    if (!_editMode) { e.preventDefault(); return; }
    section.classList.add('widget-section--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', section.dataset.widgetId);
  });

  section.addEventListener('dragend', () => {
    section.classList.remove('widget-section--dragging');
    document.querySelectorAll('.widget-section--drag-over').forEach(el => {
      el.classList.remove('widget-section--drag-over');
    });
  });

  section.addEventListener('dragover', (e) => {
    if (!_editMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Clear all drag-over states
    document.querySelectorAll('.widget-section--drag-over').forEach(el => {
      el.classList.remove('widget-section--drag-over');
    });

    section.classList.add('widget-section--drag-over');
  });

  section.addEventListener('dragleave', () => {
    section.classList.remove('widget-section--drag-over');
  });

  section.addEventListener('drop', (e) => {
    e.preventDefault();
    section.classList.remove('widget-section--drag-over');

    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    const container = getViewContainer(_currentViewType);
    if (!container) return;

    const draggedEl = container.querySelector(`.widget-section[data-widget-id="${draggedId}"]`);
    if (!draggedEl || draggedEl === section) return;

    // Determine insert position
    const rect = section.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertBefore = e.clientY < midY;

    if (insertBefore) {
      container.insertBefore(draggedEl, section);
    } else {
      const next = section.nextElementSibling;
      if (next) {
        container.insertBefore(draggedEl, next);
      } else {
        container.appendChild(draggedEl);
      }
    }

    saveCurrentLayout(_currentViewType);
  });
}

// ── Mobile Touch Drag ─────────────────────────────────────

function setupTouchDrag(section) {
  let touchTimer = null;
  let isDragging = false;

  section.addEventListener('touchstart', (e) => {
    if (!_editMode) return;

    // Ignore touches on buttons/interactive elements
    if (e.target.closest('.widget-delete-btn, button, a, input, select, textarea, label')) return;

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    touchTimer = setTimeout(() => {
      isDragging = true;
      startTouchDrag(section, startX, startY);
    }, 200);

    const onTouchMove = (moveEvent) => {
      const mt = moveEvent.touches[0];
      const dx = Math.abs(mt.clientX - startX);
      const dy = Math.abs(mt.clientY - startY);

      // If moved too much before drag starts, cancel
      if (!isDragging && (dx > 10 || dy > 10)) {
        clearTimeout(touchTimer);
        touchTimer = null;
        return;
      }

      if (isDragging) {
        moveEvent.preventDefault();
        moveTouchDrag(mt.clientX, mt.clientY);
      }
    };

    const onTouchEnd = () => {
      clearTimeout(touchTimer);
      touchTimer = null;

      if (isDragging) {
        endTouchDrag();
        isDragging = false;
      }

      section.removeEventListener('touchmove', onTouchMove);
      section.removeEventListener('touchend', onTouchEnd);
    };

    section.addEventListener('touchmove', onTouchMove, { passive: false });
    section.addEventListener('touchend', onTouchEnd, { passive: true });
  }, { passive: true });
}

function startTouchDrag(section, x, y) {
  const rect = section.getBoundingClientRect();

  // Create clone
  const clone = section.cloneNode(true);
  clone.className = 'widget-drag-clone';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.left = rect.left + 'px';
  clone.style.top = rect.top + 'px';
  document.body.appendChild(clone);

  section.classList.add('widget-section--dragging');

  _touchDragState = {
    section,
    clone,
    offsetX: x - rect.left,
    offsetY: y - rect.top,
    container: getViewContainer(_currentViewType),
  };

  if (navigator.vibrate) navigator.vibrate(30);
}

function moveTouchDrag(x, y) {
  if (!_touchDragState) return;

  const { clone, offsetX, offsetY, container, section } = _touchDragState;

  // Move clone
  clone.style.left = (x - offsetX) + 'px';
  clone.style.top = (y - offsetY) + 'px';

  // Find drop target
  clone.style.display = 'none';
  const target = document.elementFromPoint(x, y);
  clone.style.display = '';

  if (!target) return;

  const targetSection = target.closest('.widget-section');
  if (!targetSection || targetSection === section || !container.contains(targetSection)) return;

  // Clear existing drag-over states
  container.querySelectorAll('.widget-section--drag-over').forEach(el => {
    el.classList.remove('widget-section--drag-over');
  });

  targetSection.classList.add('widget-section--drag-over');
  _touchDragState.dropTarget = targetSection;
  _touchDragState.dropY = y;
}

function endTouchDrag() {
  if (!_touchDragState) return;

  const { section, clone, container, dropTarget, dropY } = _touchDragState;

  // Remove clone
  if (clone && clone.parentNode) {
    clone.parentNode.removeChild(clone);
  }

  section.classList.remove('widget-section--dragging');

  // Perform reorder
  if (dropTarget && container) {
    const rect = dropTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertBefore = (dropY || 0) < midY;

    if (insertBefore) {
      container.insertBefore(section, dropTarget);
    } else {
      const next = dropTarget.nextElementSibling;
      if (next) {
        container.insertBefore(section, next);
      } else {
        container.appendChild(section);
      }
    }

    saveCurrentLayout(_currentViewType);
  }

  // Clear drag-over
  container?.querySelectorAll('.widget-section--drag-over').forEach(el => {
    el.classList.remove('widget-section--drag-over');
  });

  _touchDragState = null;
}

// ── Edit Bar ──────────────────────────────────────────────

function ensureEditBar() {
  if (_editBar) return;

  _editBar = document.createElement('div');
  _editBar.className = 'widget-edit-bar';
  _editBar.innerHTML = `
    <button class="widget-edit-bar__btn widget-edit-bar__btn--add" id="widgetAddBtn">
      + Add Widget
    </button>
    <button class="widget-edit-bar__btn widget-edit-bar__btn--done" id="widgetDoneBtn">
      Done
    </button>
  `;

  document.body.appendChild(_editBar);

  _editBar.querySelector('#widgetAddBtn').addEventListener('click', () => {
    showPicker(_currentViewType);
  });

  _editBar.querySelector('#widgetDoneBtn').addEventListener('click', () => {
    exitEditMode();
  });
}

// ── Widget Picker ─────────────────────────────────────────

function ensurePicker() {
  if (_pickerEl) return;

  _pickerEl = document.createElement('div');
  _pickerEl.className = 'widget-picker';
  _pickerEl.innerHTML = `
    <div class="widget-picker__sheet">
      <div class="widget-picker__handle"></div>
      <div class="widget-picker__title">Add Widget</div>
      <div class="widget-picker__grid" id="widgetPickerGrid"></div>
    </div>
  `;

  document.body.appendChild(_pickerEl);

  // Close on backdrop click
  _pickerEl.addEventListener('click', (e) => {
    if (e.target === _pickerEl) {
      hidePicker();
    }
  });
}

function showPicker(viewType) {
  if (!_pickerEl) return;

  const widgets = getRegistry(viewType);
  const container = getViewContainer(viewType);
  if (!container) return;

  // Find hidden widgets
  const hiddenWidgets = widgets.filter(w => {
    if (w.permanent) return false;
    const section = container.querySelector(`.widget-section[data-widget-id="${w.id}"]`);
    return section && section.classList.contains('widget-section--hidden');
  });

  const grid = _pickerEl.querySelector('#widgetPickerGrid');
  if (!grid) return;

  if (hiddenWidgets.length === 0) {
    grid.innerHTML = '<div class="widget-picker__empty">All widgets are visible</div>';
  } else {
    grid.innerHTML = hiddenWidgets.map(w => `
      <button class="widget-picker__item" data-widget-id="${w.id}">
        <span class="widget-picker__item-icon">${w.icon}</span>
        <span class="widget-picker__item-name">${w.name}</span>
      </button>
    `).join('');

    grid.querySelectorAll('.widget-picker__item').forEach(btn => {
      btn.addEventListener('click', () => {
        addWidget(btn.dataset.widgetId);
      });
    });
  }

  _pickerEl.classList.add('widget-picker--visible');
}

function hidePicker() {
  if (_pickerEl) {
    _pickerEl.classList.remove('widget-picker--visible');
  }
}
