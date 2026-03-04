/* ═══════════════════════════════════════════════════════════
   BNCO — Onboarding Module
   Step-by-step onboarding flow for new users
   ═══════════════════════════════════════════════════════════ */

import { getStudios, completeOnboarding } from './api.js';

// ── State ─────────────────────────────────────────────────

let currentStep = 1;
let onboardingData = {
  studio_id: null,
  studio_name: null,
  frequency: null,
  devices: { whoop: false, apple_watch: false },
};
let onCompleteCallback = null;

// ── Onboarding HTML ───────────────────────────────────────

const ONBOARDING_HTML = `
<div class="onboarding" id="onboardingOverlay">
  <div class="onboarding__backdrop"></div>
  <div class="onboarding__container">

    <!-- Progress Bar -->
    <div class="onboarding__progress">
      <div class="onboarding__progress-track">
        <div class="onboarding__progress-fill" id="onboardingProgress" style="width: 33%"></div>
      </div>
      <div class="onboarding__steps-indicator">
        <span class="onboarding__step-dot onboarding__step-dot--active" data-step="1">1</span>
        <span class="onboarding__step-dot" data-step="2">2</span>
        <span class="onboarding__step-dot" data-step="3">3</span>
      </div>
    </div>

    <!-- Step 1: Studio Selection -->
    <div class="onboarding__step onboarding__step--active" id="onboardingStep1">
      <div class="onboarding__step-icon">🏠</div>
      <h2 class="onboarding__step-title">Which studio do you go to?</h2>
      <p class="onboarding__step-desc">Find your home studio to join their leaderboard and challenges.</p>

      <div class="onboarding__search">
        <input type="text" class="form-input onboarding__search-input" id="studioSearch"
          placeholder="Search studios by name or city..." autocomplete="off" />
        <div class="onboarding__search-results" id="studioResults"></div>
      </div>

      <div class="onboarding__selected" id="studioSelected" style="display:none;">
        <div class="onboarding__selected-card">
          <span class="onboarding__selected-icon">📍</span>
          <span class="onboarding__selected-name" id="selectedStudioName"></span>
          <button type="button" class="onboarding__selected-remove" id="removeStudio">&times;</button>
        </div>
      </div>

      <div class="onboarding__actions">
        <button type="button" class="btn btn--primary btn--full" id="step1Next" disabled>Next</button>
        <button type="button" class="onboarding__skip" id="step1Skip">Skip for now</button>
      </div>
    </div>

    <!-- Step 2: Frequency -->
    <div class="onboarding__step" id="onboardingStep2">
      <div class="onboarding__step-icon">📅</div>
      <h2 class="onboarding__step-title">How often do you hit Pilates?</h2>
      <p class="onboarding__step-desc">Helps us set realistic goals and match you with the right challenges.</p>

      <div class="onboarding__frequency" id="frequencyOptions">
        <button type="button" class="onboarding__freq-btn" data-freq="1-2">
          <span class="onboarding__freq-num">1-2</span>
          <span class="onboarding__freq-label">times/week</span>
          <span class="onboarding__freq-tag">Just starting</span>
        </button>
        <button type="button" class="onboarding__freq-btn" data-freq="3-4">
          <span class="onboarding__freq-num">3-4</span>
          <span class="onboarding__freq-label">times/week</span>
          <span class="onboarding__freq-tag">Regular</span>
        </button>
        <button type="button" class="onboarding__freq-btn" data-freq="5-6">
          <span class="onboarding__freq-num">5-6</span>
          <span class="onboarding__freq-label">times/week</span>
          <span class="onboarding__freq-tag">Dedicated</span>
        </button>
        <button type="button" class="onboarding__freq-btn" data-freq="7+">
          <span class="onboarding__freq-num">7+</span>
          <span class="onboarding__freq-label">times/week</span>
          <span class="onboarding__freq-tag">Obsessed</span>
        </button>
      </div>

      <div class="onboarding__actions">
        <button type="button" class="btn btn--outline" id="step2Back">Back</button>
        <button type="button" class="btn btn--primary" id="step2Next" disabled>Next</button>
      </div>
    </div>

    <!-- Step 3: Devices -->
    <div class="onboarding__step" id="onboardingStep3">
      <div class="onboarding__step-icon">⌚</div>
      <h2 class="onboarding__step-title">Connect your devices</h2>
      <p class="onboarding__step-desc">Link your wearable to power your Vibe Score and leaderboard rank.</p>

      <div class="onboarding__devices">
        <div class="onboarding__device" id="deviceWhoop">
          <div class="onboarding__device-info">
            <div class="onboarding__device-logo">WHOOP</div>
            <div class="onboarding__device-desc">Full biometric data: strain, recovery, HRV</div>
          </div>
          <button type="button" class="btn btn--outline onboarding__device-btn" id="connectWhoop">Connect</button>
        </div>
        <div class="onboarding__device" id="deviceApple">
          <div class="onboarding__device-info">
            <div class="onboarding__device-logo">⌚ Apple Watch</div>
            <div class="onboarding__device-desc">Heart rate, calories, workout duration</div>
          </div>
          <label class="toggle onboarding__device-toggle">
            <input type="checkbox" id="appleWatchToggle" />
            <span class="toggle__slider"></span>
          </label>
        </div>
      </div>

      <div class="onboarding__actions">
        <button type="button" class="btn btn--outline" id="step3Back">Back</button>
        <button type="button" class="btn btn--primary" id="step3Finish">
          <span class="auth-modal__btn-text">Let's Go!</span>
          <span class="auth-modal__spinner" style="display:none;"></span>
        </button>
      </div>
      <button type="button" class="onboarding__skip" id="step3Skip">Skip and explore</button>
    </div>

  </div>
</div>
`;

// ── Public API ────────────────────────────────────────────

/**
 * Show the onboarding flow.
 * @param {Function} onComplete - called when onboarding finishes
 */
export function showOnboarding(onComplete) {
  onCompleteCallback = onComplete;
  currentStep = 1;
  onboardingData = {
    studio_id: null,
    studio_name: null,
    frequency: null,
    devices: { whoop: false, apple_watch: false },
  };

  injectOnboarding();
  goToStep(1);

  const overlay = document.getElementById('onboardingOverlay');
  if (overlay) {
    overlay.classList.add('onboarding--visible');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Hide onboarding.
 */
export function hideOnboarding() {
  const overlay = document.getElementById('onboardingOverlay');
  if (overlay) {
    overlay.classList.remove('onboarding--visible');
    document.body.style.overflow = '';
  }
}

// ── Inject & Bind ─────────────────────────────────────────

function injectOnboarding() {
  if (document.getElementById('onboardingOverlay')) return;
  document.body.insertAdjacentHTML('beforeend', ONBOARDING_HTML);
  bindOnboardingEvents();
}

function bindOnboardingEvents() {
  // Step 1: Studio search
  const searchInput = document.getElementById('studioSearch');
  let searchTimeout = null;

  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    if (query.length < 2) {
      document.getElementById('studioResults').innerHTML = '';
      return;
    }
    searchTimeout = setTimeout(() => searchStudios(query), 300);
  });

  document.getElementById('removeStudio')?.addEventListener('click', () => {
    onboardingData.studio_id = null;
    onboardingData.studio_name = null;
    document.getElementById('studioSelected').style.display = 'none';
    document.getElementById('studioSearch').style.display = '';
    document.getElementById('step1Next').disabled = true;
  });

  document.getElementById('step1Next')?.addEventListener('click', () => goToStep(2));
  document.getElementById('step1Skip')?.addEventListener('click', () => goToStep(2));

  // Step 2: Frequency
  document.getElementById('frequencyOptions')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.onboarding__freq-btn');
    if (!btn) return;

    document.querySelectorAll('.onboarding__freq-btn').forEach(b => b.classList.remove('onboarding__freq-btn--active'));
    btn.classList.add('onboarding__freq-btn--active');
    onboardingData.frequency = btn.dataset.freq;
    document.getElementById('step2Next').disabled = false;
  });

  document.getElementById('step2Back')?.addEventListener('click', () => goToStep(1));
  document.getElementById('step2Next')?.addEventListener('click', () => goToStep(3));

  // Step 3: Devices
  document.getElementById('connectWhoop')?.addEventListener('click', () => {
    // In production, this would redirect to WHOOP OAuth
    // For now, toggle the connected state
    const btn = document.getElementById('connectWhoop');
    const device = document.getElementById('deviceWhoop');
    onboardingData.devices.whoop = !onboardingData.devices.whoop;

    if (onboardingData.devices.whoop) {
      btn.textContent = 'Connected ✓';
      btn.classList.add('btn--connected');
      device?.classList.add('onboarding__device--connected');
    } else {
      btn.textContent = 'Connect';
      btn.classList.remove('btn--connected');
      device?.classList.remove('onboarding__device--connected');
    }
  });

  document.getElementById('appleWatchToggle')?.addEventListener('change', (e) => {
    onboardingData.devices.apple_watch = e.target.checked;
    const device = document.getElementById('deviceApple');
    if (e.target.checked) {
      device?.classList.add('onboarding__device--connected');
    } else {
      device?.classList.remove('onboarding__device--connected');
    }
  });

  document.getElementById('step3Back')?.addEventListener('click', () => goToStep(2));
  document.getElementById('step3Finish')?.addEventListener('click', () => finishOnboarding());
  document.getElementById('step3Skip')?.addEventListener('click', () => finishOnboarding(true));
}

// ── Step Navigation ───────────────────────────────────────

function goToStep(step) {
  currentStep = step;

  // Update progress
  const progress = document.getElementById('onboardingProgress');
  if (progress) {
    progress.style.width = `${(step / 3) * 100}%`;
  }

  // Update step dots
  document.querySelectorAll('.onboarding__step-dot').forEach(dot => {
    const dotStep = parseInt(dot.dataset.step);
    dot.classList.toggle('onboarding__step-dot--active', dotStep <= step);
    dot.classList.toggle('onboarding__step-dot--current', dotStep === step);
  });

  // Show/hide steps
  for (let i = 1; i <= 3; i++) {
    const stepEl = document.getElementById(`onboardingStep${i}`);
    if (stepEl) {
      stepEl.classList.toggle('onboarding__step--active', i === step);
    }
  }
}

// ── Studio Search ─────────────────────────────────────────

async function searchStudios(query) {
  const resultsEl = document.getElementById('studioResults');
  if (!resultsEl) return;

  resultsEl.innerHTML = '<div class="onboarding__search-loading">Searching...</div>';

  const result = await getStudios({ q: query, limit: 5 });

  if (!result.ok) {
    resultsEl.innerHTML = '<div class="onboarding__search-empty">Could not search studios. Try again.</div>';
    return;
  }

  const studios = result.data?.studios || result.data || [];

  if (studios.length === 0) {
    resultsEl.innerHTML = '<div class="onboarding__search-empty">No studios found. Try a different search.</div>';
    return;
  }

  resultsEl.innerHTML = studios.map(s => `
    <button type="button" class="onboarding__search-result" data-id="${s.id}" data-name="${s.name}">
      <span class="onboarding__result-name">${s.name}</span>
      <span class="onboarding__result-location">${s.city || ''}${s.city && s.state ? ', ' : ''}${s.state || ''}</span>
    </button>
  `).join('');

  // Bind click
  resultsEl.querySelectorAll('.onboarding__search-result').forEach(btn => {
    btn.addEventListener('click', () => {
      selectStudio(btn.dataset.id, btn.dataset.name);
    });
  });
}

function selectStudio(id, name) {
  onboardingData.studio_id = id;
  onboardingData.studio_name = name;

  document.getElementById('studioSearch').style.display = 'none';
  document.getElementById('studioResults').innerHTML = '';
  document.getElementById('selectedStudioName').textContent = name;
  document.getElementById('studioSelected').style.display = '';
  document.getElementById('step1Next').disabled = false;
}

// ── Finish Onboarding ─────────────────────────────────────

async function finishOnboarding(skipped = false) {
  const finishBtn = document.getElementById('step3Finish');
  if (finishBtn) {
    finishBtn.disabled = true;
    const text = finishBtn.querySelector('.auth-modal__btn-text');
    const spinner = finishBtn.querySelector('.auth-modal__spinner');
    if (text) text.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
  }

  if (!skipped) {
    // Submit onboarding data to server
    const result = await completeOnboarding({
      studio_id: onboardingData.studio_id,
      frequency: onboardingData.frequency,
      devices: onboardingData.devices,
    });

    if (!result.ok) {
      // Still proceed - onboarding isn't critical enough to block
      console.warn('Onboarding submit failed:', result.message);
    }
  }

  // Re-enable button
  if (finishBtn) {
    finishBtn.disabled = false;
    const text = finishBtn.querySelector('.auth-modal__btn-text');
    const spinner = finishBtn.querySelector('.auth-modal__spinner');
    if (text) text.style.display = '';
    if (spinner) spinner.style.display = 'none';
  }

  hideOnboarding();

  if (onCompleteCallback) {
    onCompleteCallback(onboardingData);
  }
}
