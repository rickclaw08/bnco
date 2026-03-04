/* ═══════════════════════════════════════════════════════════
   BNCO - Onboarding Module
   Role-based step-by-step onboarding flow for new users
   Supports both athlete and studio owner paths
   ═══════════════════════════════════════════════════════════ */

import { getStudios, completeOnboarding } from './api.js';

const PLACES_API_KEY = import.meta.env?.VITE_PLACES_API_KEY || 'AIzaSyDp8gHtmxcJ5tnsmUz7YDm8wwpR3qJXBgs';

// ── State ─────────────────────────────────────────────────

let currentStep = 0; // 0 = role selection, 1-3 = flow steps
let selectedRole = null; // 'athlete' | 'studio_admin'
let totalSteps = 3;
let onboardingData = {
  role: null,
  // Athlete fields
  studio_id: null,
  studio_name: null,
  frequency: null,
  devices: { whoop: false, apple_watch: false },
  // Studio owner fields
  studio_register_name: null,
  studio_location: null,
  studio_type: null,
  leaderboard_public: true,
  leaderboard_anonymous: false,
  invite_code: null,
};
let onCompleteCallback = null;

// ── Onboarding HTML ───────────────────────────────────────

function generateOnboardingHTML() {
  return `
<div class="onboarding" id="onboardingOverlay">
  <div class="onboarding__backdrop"></div>
  <div class="onboarding__container">

    <!-- Role Selector (Step 0) -->
    <div class="role-selector role-selector--visible" id="roleSelector">
      <h2 class="role-selector__title">Welcome to BNCO</h2>
      <p class="role-selector__desc">How will you use BNCO?</p>
      <div class="role-selector__cards">
        <div class="role-selector__card" id="roleAthlete" data-role="athlete">
          <div class="role-selector__card-icon">🏋️</div>
          <div class="role-selector__card-title">I'm an Athlete</div>
          <div class="role-selector__card-desc">Track workouts, compete on leaderboards, join your studio</div>
        </div>
        <div class="role-selector__card" id="roleStudio" data-role="studio_admin">
          <div class="role-selector__card-icon">🏢</div>
          <div class="role-selector__card-title">I'm a Studio Owner</div>
          <div class="role-selector__card-desc">Manage your studio, create challenges, grow your community</div>
        </div>
      </div>
      <button type="button" class="btn btn--primary btn--full" id="roleContinue" disabled>Continue</button>
    </div>

    <!-- Progress Bar (visible during steps 1-3) -->
    <div class="onboarding__progress" id="onboardingProgressWrap" style="display:none;">
      <div class="onboarding__progress-track">
        <div class="onboarding__progress-fill" id="onboardingProgress" style="width: 33%"></div>
      </div>
      <div class="onboarding__steps-indicator">
        <span class="onboarding__step-dot onboarding__step-dot--active" data-step="1">1</span>
        <span class="onboarding__step-dot" data-step="2">2</span>
        <span class="onboarding__step-dot" data-step="3">3</span>
      </div>
    </div>

    <!-- ═══ ATHLETE FLOW ═══ -->

    <!-- Athlete Step 1: Studio Selection -->
    <div class="onboarding__step" id="athleteStep1">
      <div class="onboarding__step-icon">🏠</div>
      <h2 class="onboarding__step-title">Which studio do you train at?</h2>
      <p class="onboarding__step-desc">Find your home studio to join their leaderboard and challenges.</p>

      <div class="onboarding__search">
        <input type="text" class="form-input onboarding__search-input" id="studioSearch"
          placeholder="Search studios by name or city..." autocomplete="off" />
        <button type="button" class="btn btn--outline onboarding__detect-btn" id="detectStudioBtn">📍 Detect My Studio</button>
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
        <button type="button" class="btn btn--outline" id="athleteStep1Back">Back</button>
        <button type="button" class="btn btn--primary" id="athleteStep1Next" disabled>Next</button>
      </div>
      <button type="button" class="onboarding__skip" id="athleteStep1Skip">Skip for now</button>
    </div>

    <!-- Athlete Step 2: Connect Wearable -->
    <div class="onboarding__step" id="athleteStep2">
      <div class="onboarding__step-icon">⌚</div>
      <h2 class="onboarding__step-title">Connect your wearable</h2>
      <p class="onboarding__step-desc">Link your device to power your Vibe Score and leaderboard rank.</p>

      <div class="onboarding__devices">
        <div class="onboarding__device" id="deviceWhoop">
          <div class="onboarding__device-info">
            <div class="onboarding__device-logo">WHOOP</div>
            <div class="onboarding__device-desc">Full biometric data: strain, recovery, HRV</div>
          </div>
          <button type="button" class="btn btn--outline onboarding__device-btn" id="connectWhoop">🔗 Connect via OAuth</button>
        </div>
        <div class="onboarding__device" id="deviceApple">
          <div class="onboarding__device-info">
            <div class="onboarding__device-logo">⌚ Apple Watch</div>
            <div class="onboarding__device-desc">Requires the BNCO iOS app + Apple Health permissions</div>
          </div>
          <button type="button" class="btn btn--outline onboarding__device-btn onboarding__device-btn--apple" id="appleWatchInfo">📱 iOS App Required</button>
        </div>
      </div>

      <div class="onboarding__actions">
        <button type="button" class="btn btn--outline" id="athleteStep2Back">Back</button>
        <button type="button" class="btn btn--primary" id="athleteStep2Next">Next</button>
      </div>
      <button type="button" class="onboarding__skip" id="athleteStep2Skip">Skip for now</button>
    </div>

    <!-- Athlete Step 3: Frequency -->
    <div class="onboarding__step" id="athleteStep3">
      <div class="onboarding__step-icon">📅</div>
      <h2 class="onboarding__step-title">How often do you train?</h2>
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
        <button type="button" class="btn btn--outline" id="athleteStep3Back">Back</button>
        <button type="button" class="btn btn--primary" id="athleteStep3Finish" disabled>
          <span class="auth-modal__btn-text">Let's Go!</span>
          <span class="auth-modal__spinner" style="display:none;"></span>
        </button>
      </div>
      <button type="button" class="onboarding__skip" id="athleteStep3Skip">Skip and explore</button>
    </div>

    <!-- ═══ STUDIO OWNER FLOW ═══ -->

    <!-- Studio Step 1: Register Studio -->
    <div class="onboarding__step" id="studioStep1">
      <div class="onboarding__step-icon">🏢</div>
      <h2 class="onboarding__step-title">Register your studio</h2>
      <p class="onboarding__step-desc">Tell us about your studio so athletes can find you.</p>

      <div class="studio-onboarding__field">
        <label class="form-label" for="studioRegName">Studio Name</label>
        <input type="text" class="form-input" id="studioRegName" placeholder="e.g., CorePower Pilates" />
      </div>
      <div class="studio-onboarding__field">
        <label class="form-label" for="studioRegLocation">Location</label>
        <input type="text" class="form-input" id="studioRegLocation" placeholder="City, State" />
      </div>
      <div class="studio-onboarding__field">
        <label class="form-label">Studio Type</label>
        <div class="studio-onboarding__type-grid" id="studioTypeGrid">
          <button type="button" class="studio-onboarding__type-btn" data-type="pilates">
            <span class="studio-onboarding__type-icon">🧘</span>
            Pilates
          </button>
          <button type="button" class="studio-onboarding__type-btn" data-type="reformer">
            <span class="studio-onboarding__type-icon">💪</span>
            Reformer
          </button>
          <button type="button" class="studio-onboarding__type-btn" data-type="barre">
            <span class="studio-onboarding__type-icon">🩰</span>
            Barre
          </button>
          <button type="button" class="studio-onboarding__type-btn" data-type="hiit">
            <span class="studio-onboarding__type-icon">🔥</span>
            HIIT
          </button>
          <button type="button" class="studio-onboarding__type-btn" data-type="yoga">
            <span class="studio-onboarding__type-icon">🕉️</span>
            Yoga
          </button>
          <button type="button" class="studio-onboarding__type-btn" data-type="hybrid">
            <span class="studio-onboarding__type-icon">⚡</span>
            Hybrid
          </button>
        </div>
      </div>

      <div class="onboarding__actions">
        <button type="button" class="btn btn--outline" id="studioStep1Back">Back</button>
        <button type="button" class="btn btn--primary" id="studioStep1Next" disabled>Next</button>
      </div>
    </div>

    <!-- Studio Step 2: Leaderboard Settings -->
    <div class="onboarding__step" id="studioStep2">
      <div class="onboarding__step-icon">📊</div>
      <h2 class="onboarding__step-title">Studio settings</h2>
      <p class="onboarding__step-desc">Configure how your leaderboard works for your community.</p>

      <div class="studio-onboarding__leaderboard-option">
        <div>
          <div class="studio-onboarding__leaderboard-label">Public leaderboard</div>
          <div class="studio-onboarding__leaderboard-desc">Anyone can view your studio leaderboard</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="lbPublicToggle" checked />
          <span class="toggle__slider"></span>
        </label>
      </div>
      <div class="studio-onboarding__leaderboard-option">
        <div>
          <div class="studio-onboarding__leaderboard-label">Anonymous mode</div>
          <div class="studio-onboarding__leaderboard-desc">Show initials only (no full names)</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="lbAnonToggle" />
          <span class="toggle__slider"></span>
        </label>
      </div>

      <div class="onboarding__actions" style="margin-top: 28px;">
        <button type="button" class="btn btn--outline" id="studioStep2Back">Back</button>
        <button type="button" class="btn btn--primary" id="studioStep2Next">Next</button>
      </div>
    </div>

    <!-- Studio Step 3: Invite Members -->
    <div class="onboarding__step" id="studioStep3">
      <div class="onboarding__step-icon">🔗</div>
      <h2 class="onboarding__step-title">Invite your members</h2>
      <p class="onboarding__step-desc">Share this code or link so athletes can join your studio.</p>

      <div class="studio-onboarding__invite-code">
        <span class="studio-onboarding__invite-value" id="inviteCodeValue">BNCO-XXXX</span>
        <button type="button" class="studio-onboarding__invite-copy" id="inviteCopyBtn">Copy</button>
      </div>

      <p class="onboarding__step-desc">Athletes can search for your studio by name, or enter this code directly.</p>

      <div class="onboarding__actions">
        <button type="button" class="btn btn--outline" id="studioStep3Back">Back</button>
        <button type="button" class="btn btn--primary" id="studioStep3Finish">
          <span class="auth-modal__btn-text">Launch Studio</span>
          <span class="auth-modal__spinner" style="display:none;"></span>
        </button>
      </div>
      <button type="button" class="onboarding__skip" id="studioStep3Skip">Skip and explore</button>
    </div>

  </div>
</div>
`;
}

// ── Public API ────────────────────────────────────────────

/**
 * Show the onboarding flow.
 * @param {Function} onComplete - called when onboarding finishes
 * @param {string} [presetRole] - if provided, skip role selection
 */
export function showOnboarding(onComplete, presetRole) {
  onCompleteCallback = onComplete;
  currentStep = 0;
  selectedRole = presetRole || null;
  onboardingData = {
    role: presetRole || null,
    studio_id: null,
    studio_name: null,
    frequency: null,
    devices: { whoop: false, apple_watch: false },
    studio_register_name: null,
    studio_location: null,
    studio_type: null,
    leaderboard_public: true,
    leaderboard_anonymous: false,
    invite_code: null,
  };

  injectOnboarding();

  if (presetRole) {
    selectedRole = presetRole;
    onboardingData.role = presetRole;
    showFlowSteps();
    goToStep(1);
  } else {
    showRoleSelector();
  }

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
  const existing = document.getElementById('onboardingOverlay');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', generateOnboardingHTML());
  generateInviteCode();
  bindOnboardingEvents();
}

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BNCO-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  onboardingData.invite_code = code;
  const el = document.getElementById('inviteCodeValue');
  if (el) el.textContent = code;
}

function bindOnboardingEvents() {
  // ── Role Selector ─────────────────────────────────────
  const roleCards = document.querySelectorAll('.role-selector__card');
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      roleCards.forEach(c => c.classList.remove('role-selector__card--active'));
      card.classList.add('role-selector__card--active');
      selectedRole = card.dataset.role;
      onboardingData.role = selectedRole;
      document.getElementById('roleContinue').disabled = false;
    });
  });

  document.getElementById('roleContinue')?.addEventListener('click', () => {
    if (!selectedRole) return;
    showFlowSteps();
    goToStep(1);
  });

  // ── Athlete Flow ──────────────────────────────────────

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
    document.getElementById('athleteStep1Next').disabled = true;
  });

  document.getElementById('athleteStep1Back')?.addEventListener('click', () => {
    hideFlowSteps();
    showRoleSelector();
  });
  document.getElementById('athleteStep1Next')?.addEventListener('click', () => goToStep(2));
  document.getElementById('athleteStep1Skip')?.addEventListener('click', () => goToStep(2));

  // Step 2: Devices
  document.getElementById('connectWhoop')?.addEventListener('click', () => {
    const btn = document.getElementById('connectWhoop');
    const device = document.getElementById('deviceWhoop');

    // In real flow, this would redirect to WHOOP OAuth
    // For now, simulate the OAuth flow with a confirmation
    if (!onboardingData.devices.whoop) {
      const confirmed = confirm(
        'Connect to WHOOP\n\n' +
        'This will redirect you to WHOOP to authorize BNCO to access your:\n' +
        '- Muscular Load (Control Score)\n' +
        '- Heart Rate Variability\n' +
        '- Recovery Data\n' +
        '- Workout Strain\n\n' +
        'Continue to WHOOP?'
      );
      if (!confirmed) return;
    }

    onboardingData.devices.whoop = !onboardingData.devices.whoop;
    if (onboardingData.devices.whoop) {
      btn.textContent = '✓ WHOOP Connected';
      btn.classList.add('btn--connected');
      device?.classList.add('onboarding__device--connected');
    } else {
      btn.textContent = '🔗 Connect via WHOOP';
      btn.classList.remove('btn--connected');
      device?.classList.remove('onboarding__device--connected');
    }
  });

  document.getElementById('appleWatchInfo')?.addEventListener('click', () => {
    const device = document.getElementById('deviceApple');
    const btn = document.getElementById('appleWatchInfo');

    if (!onboardingData.devices.apple_watch) {
      const confirmed = confirm(
        'Apple Watch + Apple Health\n\n' +
        'To connect Apple Watch, you need the BNCO iOS app.\n\n' +
        'The iOS app will request access to:\n' +
        '- Wrist Motion (Stillness Index)\n' +
        '- Heart Rate & HRV\n' +
        '- Respiratory Rate\n' +
        '- Active Energy Burned\n\n' +
        'Data stays on-device until synced.\n\n' +
        'Mark Apple Watch as your device? (Full connection requires the iOS app)'
      );
      if (!confirmed) return;
    }

    onboardingData.devices.apple_watch = !onboardingData.devices.apple_watch;
    if (onboardingData.devices.apple_watch) {
      btn.textContent = '✓ Will connect via iOS app';
      btn.classList.add('btn--connected');
      device?.classList.add('onboarding__device--connected');
    } else {
      btn.textContent = '📱 iOS App Required';
      btn.classList.remove('btn--connected');
      device?.classList.remove('onboarding__device--connected');
    }
  });

  // Studio Detection
  document.getElementById('detectStudioBtn')?.addEventListener('click', () => {
    detectNearbyStudios();
  });

  document.getElementById('athleteStep2Back')?.addEventListener('click', () => goToStep(1));
  document.getElementById('athleteStep2Next')?.addEventListener('click', () => goToStep(3));
  document.getElementById('athleteStep2Skip')?.addEventListener('click', () => goToStep(3));

  // Step 3: Frequency
  document.getElementById('frequencyOptions')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.onboarding__freq-btn');
    if (!btn) return;
    document.querySelectorAll('.onboarding__freq-btn').forEach(b => b.classList.remove('onboarding__freq-btn--active'));
    btn.classList.add('onboarding__freq-btn--active');
    onboardingData.frequency = btn.dataset.freq;
    document.getElementById('athleteStep3Finish').disabled = false;
  });

  document.getElementById('athleteStep3Back')?.addEventListener('click', () => goToStep(2));
  document.getElementById('athleteStep3Finish')?.addEventListener('click', () => finishOnboarding());
  document.getElementById('athleteStep3Skip')?.addEventListener('click', () => finishOnboarding(true));

  // ── Studio Owner Flow ─────────────────────────────────

  // Step 1: Register studio
  const studioNameInput = document.getElementById('studioRegName');
  const studioLocInput = document.getElementById('studioRegLocation');
  const studioStep1Next = document.getElementById('studioStep1Next');

  function validateStudioStep1() {
    const hasName = studioNameInput?.value.trim().length > 0;
    const hasLoc = studioLocInput?.value.trim().length > 0;
    const hasType = onboardingData.studio_type !== null;
    if (studioStep1Next) studioStep1Next.disabled = !(hasName && hasLoc && hasType);
  }

  studioNameInput?.addEventListener('input', () => {
    onboardingData.studio_register_name = studioNameInput.value.trim();
    validateStudioStep1();
  });
  studioLocInput?.addEventListener('input', () => {
    onboardingData.studio_location = studioLocInput.value.trim();
    validateStudioStep1();
  });

  document.getElementById('studioTypeGrid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.studio-onboarding__type-btn');
    if (!btn) return;
    document.querySelectorAll('.studio-onboarding__type-btn').forEach(b => b.classList.remove('studio-onboarding__type-btn--active'));
    btn.classList.add('studio-onboarding__type-btn--active');
    onboardingData.studio_type = btn.dataset.type;
    validateStudioStep1();
  });

  document.getElementById('studioStep1Back')?.addEventListener('click', () => {
    hideFlowSteps();
    showRoleSelector();
  });
  document.getElementById('studioStep1Next')?.addEventListener('click', () => goToStep(2));

  // Step 2: Leaderboard settings
  document.getElementById('lbPublicToggle')?.addEventListener('change', (e) => {
    onboardingData.leaderboard_public = e.target.checked;
  });
  document.getElementById('lbAnonToggle')?.addEventListener('change', (e) => {
    onboardingData.leaderboard_anonymous = e.target.checked;
  });

  document.getElementById('studioStep2Back')?.addEventListener('click', () => goToStep(1));
  document.getElementById('studioStep2Next')?.addEventListener('click', () => goToStep(3));

  // Step 3: Invite
  document.getElementById('inviteCopyBtn')?.addEventListener('click', () => {
    const code = onboardingData.invite_code;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('inviteCopyBtn');
        if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); }
      });
    }
  });

  document.getElementById('studioStep3Back')?.addEventListener('click', () => goToStep(2));
  document.getElementById('studioStep3Finish')?.addEventListener('click', () => finishOnboarding());
  document.getElementById('studioStep3Skip')?.addEventListener('click', () => finishOnboarding(true));
}

// ── View Toggle ───────────────────────────────────────────

function showRoleSelector() {
  currentStep = 0;
  const roleSelector = document.getElementById('roleSelector');
  const progressWrap = document.getElementById('onboardingProgressWrap');
  if (roleSelector) { roleSelector.classList.add('role-selector--visible'); roleSelector.style.display = ''; }
  if (progressWrap) progressWrap.style.display = 'none';
  hideAllSteps();
}

function showFlowSteps() {
  const roleSelector = document.getElementById('roleSelector');
  const progressWrap = document.getElementById('onboardingProgressWrap');
  if (roleSelector) { roleSelector.classList.remove('role-selector--visible'); roleSelector.style.display = 'none'; }
  if (progressWrap) progressWrap.style.display = '';
}

function hideFlowSteps() {
  const progressWrap = document.getElementById('onboardingProgressWrap');
  if (progressWrap) progressWrap.style.display = 'none';
  hideAllSteps();
}

function hideAllSteps() {
  const steps = ['athleteStep1', 'athleteStep2', 'athleteStep3', 'studioStep1', 'studioStep2', 'studioStep3'];
  steps.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('onboarding__step--active');
  });
}

// ── Step Navigation ───────────────────────────────────────

function goToStep(step) {
  currentStep = step;

  // Update progress
  const progress = document.getElementById('onboardingProgress');
  if (progress) {
    progress.style.width = `${(step / totalSteps) * 100}%`;
  }

  // Update step dots
  document.querySelectorAll('.onboarding__step-dot').forEach(dot => {
    const dotStep = parseInt(dot.dataset.step);
    dot.classList.toggle('onboarding__step-dot--active', dotStep <= step);
    dot.classList.toggle('onboarding__step-dot--current', dotStep === step);
  });

  // Hide all steps first
  hideAllSteps();

  // Show the correct step based on role
  const prefix = selectedRole === 'studio_admin' ? 'studioStep' : 'athleteStep';
  const stepEl = document.getElementById(`${prefix}${step}`);
  if (stepEl) stepEl.classList.add('onboarding__step--active');
}

// ── Studio Search ─────────────────────────────────────────

async function searchStudios(query) {
  const resultsEl = document.getElementById('studioResults');
  if (!resultsEl) return;

  resultsEl.innerHTML = '<div class="onboarding__search-loading">Searching...</div>';

  // Try Google Places API (New) first for real studio data
  const placesResults = await searchPlacesAPI(query + ' pilates');

  if (placesResults && placesResults.length > 0) {
    renderStudioResults(resultsEl, placesResults);
    return;
  }

  // Fallback: try our backend
  const result = await getStudios({ q: query, limit: 5 });

  if (result.ok) {
    const studios = result.data?.studios || result.data || [];
    if (studios.length > 0) {
      renderStudioResults(resultsEl, studios.map(s => ({
        id: s.id,
        name: s.name,
        city: s.city || '',
        state: s.state || '',
        address: s.address || '',
      })));
      return;
    }
  }

  // Final fallback: demo data filtered by query
  const q = query.toLowerCase();
  const filtered = DEMO_NEARBY_STUDIOS.filter(s =>
    s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
  );
  if (filtered.length > 0) {
    renderStudioResults(resultsEl, filtered);
  } else {
    resultsEl.innerHTML = '<div class="onboarding__search-empty">No studios found. Try a different search or use "Detect My Studio."</div>';
  }
}

function renderStudioResults(container, studios) {
  container.innerHTML = studios.map(s => {
    const location = s.address || [s.city, s.state].filter(Boolean).join(', ');
    const distText = s.distance != null ? ` - ${s.distance.toFixed(1)} mi away` : '';
    return `
      <button type="button" class="onboarding__search-result" data-id="${s.id}" data-name="${s.name}">
        <span class="onboarding__result-name">${s.name}</span>
        <span class="onboarding__result-location">${location}${distText}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.onboarding__search-result').forEach(btn => {
    btn.addEventListener('click', () => {
      selectStudio(btn.dataset.id, btn.dataset.name);
    });
  });
}

async function searchPlacesAPI(query) {
  if (!PLACES_API_KEY) return null;
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 8,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.places || data.places.length === 0) return null;
    return data.places.map(p => ({
      id: p.id,
      name: p.displayName?.text || 'Unknown Studio',
      address: p.formattedAddress || '',
      city: '',
      state: '',
      lat: p.location?.latitude,
      lng: p.location?.longitude,
    }));
  } catch {
    return null;
  }
}

function selectStudio(id, name) {
  onboardingData.studio_id = id;
  onboardingData.studio_name = name;

  document.getElementById('studioSearch').style.display = 'none';
  document.getElementById('studioResults').innerHTML = '';
  document.getElementById('selectedStudioName').textContent = name;
  document.getElementById('studioSelected').style.display = '';
  document.getElementById('athleteStep1Next').disabled = false;
}

// ── Finish Onboarding ─────────────────────────────────────

async function finishOnboarding(skipped = false) {
  const finishBtnId = selectedRole === 'studio_admin' ? 'studioStep3Finish' : 'athleteStep3Finish';
  const finishBtn = document.getElementById(finishBtnId);

  if (finishBtn) {
    finishBtn.disabled = true;
    const text = finishBtn.querySelector('.auth-modal__btn-text');
    const spinner = finishBtn.querySelector('.auth-modal__spinner');
    if (text) text.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
  }

  if (!skipped) {
    const payload = selectedRole === 'studio_admin'
      ? {
          role: 'studio_admin',
          studio_name: onboardingData.studio_register_name,
          studio_location: onboardingData.studio_location,
          studio_type: onboardingData.studio_type,
          leaderboard_public: onboardingData.leaderboard_public,
          leaderboard_anonymous: onboardingData.leaderboard_anonymous,
          invite_code: onboardingData.invite_code,
        }
      : {
          role: 'athlete',
          studio_id: onboardingData.studio_id,
          frequency: onboardingData.frequency,
          devices: onboardingData.devices,
        };

    const result = await completeOnboarding(payload);
    if (!result.ok) {
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

// ── Studio Detection (Geolocation) ───────────────────────

const DEMO_NEARBY_STUDIOS = [
  { id: 'demo-1', name: 'Body Alive Pilates', city: 'Cincinnati', state: 'OH', lat: 39.1132, lng: -84.5155 },
  { id: 'demo-2', name: 'CorePower Pilates', city: 'Cincinnati', state: 'OH', lat: 39.1031, lng: -84.5120 },
  { id: 'demo-3', name: '[solidcore] Hyde Park', city: 'Cincinnati', state: 'OH', lat: 39.1395, lng: -84.4468 },
  { id: 'demo-4', name: 'Club Pilates Mason', city: 'Mason', state: 'OH', lat: 39.3600, lng: -84.3101 },
  { id: 'demo-5', name: 'Pure Barre Kenwood', city: 'Cincinnati', state: 'OH', lat: 39.2075, lng: -84.3828 },
  { id: 'demo-6', name: 'FlexCore Cincinnati', city: 'Cincinnati', state: 'OH', lat: 39.1100, lng: -84.5200 },
  { id: 'demo-7', name: 'Lagree Studio OTR', city: 'Cincinnati', state: 'OH', lat: 39.1098, lng: -84.5175 },
  { id: 'demo-8', name: 'Club Pilates West Chester', city: 'West Chester', state: 'OH', lat: 39.3331, lng: -84.4013 },
];

function detectNearbyStudios() {
  const resultsEl = document.getElementById('studioResults');
  const detectBtn = document.getElementById('detectStudioBtn');
  if (!resultsEl) return;

  if (detectBtn) {
    detectBtn.disabled = true;
    detectBtn.textContent = '📍 Detecting...';
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Try Google Places first
        const places = await searchNearbyPlaces(userLat, userLng);
        if (places && places.length > 0) {
          showNearbyStudiosFromPlaces(places, userLat, userLng);
        } else {
          showNearbyStudios(userLat, userLng);
        }

        if (detectBtn) {
          detectBtn.disabled = false;
          detectBtn.textContent = '📍 Detect My Studio';
        }
      },
      () => {
        // Geolocation denied or failed - show demo studios (Cincinnati)
        showNearbyStudios(39.1031, -84.5120);
        if (detectBtn) {
          detectBtn.disabled = false;
          detectBtn.textContent = '📍 Location denied - showing Cincinnati area';
          setTimeout(() => { if (detectBtn) detectBtn.textContent = '📍 Detect My Studio'; }, 3000);
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  } else {
    showNearbyStudios(39.1031, -84.5120);
    if (detectBtn) {
      detectBtn.disabled = false;
      detectBtn.textContent = '📍 Detect My Studio';
    }
  }
}

async function searchNearbyPlaces(lat, lng) {
  if (!PLACES_API_KEY) return null;
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
      },
      body: JSON.stringify({
        textQuery: 'pilates studio',
        maxResultCount: 10,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 16000,
          },
        },
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.places || null;
  } catch {
    return null;
  }
}

function showNearbyStudiosFromPlaces(places, userLat, userLng) {
  const resultsEl = document.getElementById('studioResults');
  if (!resultsEl) return;

  const studios = places.map(p => {
    const lat = p.location?.latitude;
    const lng = p.location?.longitude;
    const dist = (lat && lng) ? haversineDistance(userLat, userLng, lat, lng) : null;
    return {
      id: p.id,
      name: p.displayName?.text || 'Unknown Studio',
      address: p.formattedAddress || '',
      city: '',
      state: '',
      distance: dist,
    };
  }).sort((a, b) => (a.distance || 999) - (b.distance || 999));

  renderStudioResults(resultsEl, studios);
}

function showNearbyStudios(userLat, userLng) {
  const resultsEl = document.getElementById('studioResults');
  if (!resultsEl) return;

  const studiosWithDist = DEMO_NEARBY_STUDIOS.map(s => {
    const dist = haversineDistance(userLat, userLng, s.lat, s.lng);
    return { ...s, distance: dist };
  }).sort((a, b) => a.distance - b.distance);

  renderStudioResults(resultsEl, studiosWithDist);
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
