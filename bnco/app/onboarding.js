/* ===================================================================
   BNCO - Onboarding Module
   Role-based step-by-step onboarding flow for new users
   Supports both athlete and studio owner paths
   =================================================================== */

import { getStudios, completeOnboarding, connectWhoop as apiConnectWhoop } from './api.js';

const PLACES_API_KEY = import.meta.env?.VITE_PLACES_API_KEY || 'AIzaSyDp8gHtmxcJ5tnsmUz7YDm8wwpR3qJXBgs';

// ---- State -------------------------------------------------------

let currentStep = 0; // 0 = role selection, 1-N = flow steps
let selectedRole = null; // 'athlete' | 'studio_admin'
let totalSteps = 3; // will be 4 for athlete, 3 for studio
let onboardingData = {
  role: null,
  // Athlete fields
  studio_id: null,
  studio_name: null,
  frequency: null,
  devices: { whoop: false, apple_watch: false },
  birthday: null,
  gender: null,
  // Studio owner fields
  studio_register_name: null,
  studio_location: null,
  studio_location_data: null,
  studio_types: [],
  leaderboard_public: true,
  leaderboard_anonymous: false,
  invite_code: null,
};
let onCompleteCallback = null;
let locationDebounceTimer = null;
let studioNameDebounceTimer = null;

// ---- Onboarding HTML -----------------------------------------------

function generateOnboardingHTML() {
  // Build year options for birthday
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 13;
  let yearOptions = '<option value="">Year</option>';
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions += '<option value="' + y + '">' + y + '</option>';
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let monthOptions = '<option value="">Month</option>';
  months.forEach((m, i) => {
    const val = String(i + 1).padStart(2, '0');
    monthOptions += '<option value="' + val + '">' + m + '</option>';
  });

  let dayOptions = '<option value="">Day</option>';
  for (let d = 1; d <= 31; d++) {
    const val = String(d).padStart(2, '0');
    dayOptions += '<option value="' + val + '">' + d + '</option>';
  }

  return '<div class="onboarding" id="onboardingOverlay">' +
  '<div class="onboarding__backdrop"></div>' +
  '<div class="onboarding__container">' +

  // Role Selector (Step 0)
  '<div class="role-selector role-selector--visible" id="roleSelector">' +
    '<h2 class="role-selector__title">Welcome to BNCO</h2>' +
    '<p class="role-selector__desc">How will you use BNCO?</p>' +
    '<div class="role-selector__cards">' +
      '<div class="role-selector__card" id="roleAthlete" data-role="athlete">' +
        '<div class="role-selector__card-icon">&#127947;&#65039;</div>' +
        '<div class="role-selector__card-title">I\'m an Athlete</div>' +
        '<div class="role-selector__card-desc">Track workouts, compete on leaderboards, join your studio</div>' +
      '</div>' +
      '<div class="role-selector__card" id="roleStudio" data-role="studio_admin">' +
        '<div class="role-selector__card-icon">&#127970;</div>' +
        '<div class="role-selector__card-title">I\'m a Studio Owner</div>' +
        '<div class="role-selector__card-desc">Manage your studio, create challenges, grow your community</div>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="btn btn--primary btn--full" id="roleContinue" disabled>Continue</button>' +
  '</div>' +

  // Progress Bar
  '<div class="onboarding__progress" id="onboardingProgressWrap" style="display:none;">' +
    '<div class="onboarding__progress-track">' +
      '<div class="onboarding__progress-fill" id="onboardingProgress" style="width: 25%"></div>' +
    '</div>' +
    '<div class="onboarding__steps-indicator" id="onboardingStepDots">' +
      '<span class="onboarding__step-dot onboarding__step-dot--active" data-step="1">1</span>' +
      '<span class="onboarding__step-dot" data-step="2">2</span>' +
      '<span class="onboarding__step-dot" data-step="3">3</span>' +
    '</div>' +
  '</div>' +

  // ===== ATHLETE FLOW =====

  // Athlete Step 1: Studio Selection
  '<div class="onboarding__step" id="athleteStep1">' +
    '<div class="onboarding__step-icon">&#127968;</div>' +
    '<h2 class="onboarding__step-title">Which studio do you train at?</h2>' +
    '<p class="onboarding__step-desc">Find your home studio to join their leaderboard and challenges.</p>' +
    '<div class="onboarding__search">' +
      '<input type="text" class="form-input onboarding__search-input" id="studioSearch" placeholder="Search studios by name or city..." autocomplete="off" />' +
      '<button type="button" class="btn btn--outline onboarding__detect-btn" id="detectStudioBtn">&#128205; Detect My Studio</button>' +
      '<div class="onboarding__search-results" id="studioResults"></div>' +
    '</div>' +
    '<div class="onboarding__selected" id="studioSelected" style="display:none;">' +
      '<div class="onboarding__selected-card">' +
        '<span class="onboarding__selected-icon">&#128205;</span>' +
        '<span class="onboarding__selected-name" id="selectedStudioName"></span>' +
        '<button type="button" class="onboarding__selected-remove" id="removeStudio">&times;</button>' +
      '</div>' +
    '</div>' +
    '<div class="onboarding__actions">' +
      '<button type="button" class="btn btn--outline" id="athleteStep1Back">Back</button>' +
      '<button type="button" class="btn btn--primary" id="athleteStep1Next" disabled>Next</button>' +
    '</div>' +
    '<button type="button" class="onboarding__skip" id="athleteStep1Skip">Skip for now</button>' +
  '</div>' +

  // Athlete Step 2: Connect Wearable
  '<div class="onboarding__step" id="athleteStep2">' +
    '<div class="onboarding__step-icon">&#9004;</div>' +
    '<h2 class="onboarding__step-title">Connect your wearable</h2>' +
    '<p class="onboarding__step-desc">Link your device to power your Vibe Score and leaderboard rank.</p>' +
    '<div class="onboarding__devices">' +
      '<div class="onboarding__device" id="deviceWhoop">' +
        '<div class="onboarding__device-info">' +
          '<div class="onboarding__device-logo">WHOOP</div>' +
          '<div class="onboarding__device-desc">Full biometric data: strain, recovery, HRV</div>' +
        '</div>' +
        '<button type="button" class="btn btn--outline onboarding__device-btn" id="connectWhoop">&#128279; Connect via OAuth</button>' +
      '</div>' +
      '<div class="onboarding__device" id="deviceApple">' +
        '<div class="onboarding__device-info">' +
          '<div class="onboarding__device-logo">&#9004; Apple Watch</div>' +
          '<div class="onboarding__device-desc">Requires the BNCO iOS app + Apple Health permissions</div>' +
        '</div>' +
        '<button type="button" class="btn btn--outline onboarding__device-btn onboarding__device-btn--apple" id="appleWatchInfo">&#128241; iOS App Required</button>' +
      '</div>' +
    '</div>' +
    '<div class="onboarding__actions">' +
      '<button type="button" class="btn btn--outline" id="athleteStep2Back">Back</button>' +
      '<button type="button" class="btn btn--primary" id="athleteStep2Next" disabled>Next</button>' +
    '</div>' +
    '<button type="button" class="onboarding__skip" id="athleteStep2Skip">Skip for now</button>' +
  '</div>' +

  // Athlete Step 3: Birthday + Gender
  '<div class="onboarding__step" id="athleteStep3">' +
    '<div class="onboarding__step-icon">&#127874;</div>' +
    '<h2 class="onboarding__step-title">A little about you</h2>' +
    '<p class="onboarding__step-desc">Helps us personalize your experience and keep things fair.</p>' +
    '<div class="onboarding__personal-fields">' +
      '<div class="onboarding__field-group">' +
        '<label class="form-label">When\'s your birthday?</label>' +
        '<div class="onboarding__birthday-row">' +
          '<select class="form-select onboarding__birthday-select" id="bdayMonth">' + monthOptions + '</select>' +
          '<select class="form-select onboarding__birthday-select" id="bdayDay">' + dayOptions + '</select>' +
          '<select class="form-select onboarding__birthday-select" id="bdayYear">' + yearOptions + '</select>' +
        '</div>' +
      '</div>' +
      '<div class="onboarding__field-group">' +
        '<label class="form-label">How do you identify?</label>' +
        '<select class="form-select onboarding__gender-select" id="genderSelect">' +
          '<option value="">Select...</option>' +
          '<option value="female">Female</option>' +
          '<option value="male">Male</option>' +
          '<option value="non-binary">Non-binary</option>' +
          '<option value="prefer-not-to-say">Prefer not to say</option>' +
        '</select>' +
      '</div>' +
    '</div>' +
    '<div class="onboarding__actions">' +
      '<button type="button" class="btn btn--outline" id="athleteStep3Back">Back</button>' +
      '<button type="button" class="btn btn--primary" id="athleteStep3Next" disabled>Next</button>' +
    '</div>' +
    '<button type="button" class="onboarding__skip" id="athleteStep3Skip">Skip for now</button>' +
  '</div>' +

  // Athlete Step 4: Frequency
  '<div class="onboarding__step" id="athleteStep4">' +
    '<div class="onboarding__step-icon">&#128197;</div>' +
    '<h2 class="onboarding__step-title">How often do you train?</h2>' +
    '<p class="onboarding__step-desc">Helps us set realistic goals and match you with the right challenges.</p>' +
    '<div class="onboarding__frequency" id="frequencyOptions">' +
      '<button type="button" class="onboarding__freq-btn" data-freq="1-2">' +
        '<span class="onboarding__freq-num">1-2</span>' +
        '<span class="onboarding__freq-label">times/week</span>' +
        '<span class="onboarding__freq-tag">Just starting</span>' +
      '</button>' +
      '<button type="button" class="onboarding__freq-btn" data-freq="3-4">' +
        '<span class="onboarding__freq-num">3-4</span>' +
        '<span class="onboarding__freq-label">times/week</span>' +
        '<span class="onboarding__freq-tag">Regular</span>' +
      '</button>' +
      '<button type="button" class="onboarding__freq-btn" data-freq="5-6">' +
        '<span class="onboarding__freq-num">5-6</span>' +
        '<span class="onboarding__freq-label">times/week</span>' +
        '<span class="onboarding__freq-tag">Dedicated</span>' +
      '</button>' +
      '<button type="button" class="onboarding__freq-btn" data-freq="7+">' +
        '<span class="onboarding__freq-num">7+</span>' +
        '<span class="onboarding__freq-label">times/week</span>' +
        '<span class="onboarding__freq-tag">Obsessed</span>' +
      '</button>' +
    '</div>' +
    '<div class="onboarding__actions">' +
      '<button type="button" class="btn btn--outline" id="athleteStep4Back">Back</button>' +
      '<button type="button" class="btn btn--primary" id="athleteStep4Finish" disabled>' +
        '<span class="auth-modal__btn-text">Let\'s Go!</span>' +
        '<span class="auth-modal__spinner" style="display:none;"></span>' +
      '</button>' +
    '</div>' +
    '<button type="button" class="onboarding__skip" id="athleteStep4Skip">Skip and explore</button>' +
  '</div>' +

  // ===== STUDIO OWNER FLOW =====

  // Studio Step 1: Register Studio
  '<div class="onboarding__step" id="studioStep1">' +
    '<div class="onboarding__step-icon">&#127970;</div>' +
    '<h2 class="onboarding__step-title">Register your studio</h2>' +
    '<p class="onboarding__step-desc">Tell us about your studio so athletes can find you.</p>' +
    '<div class="studio-onboarding__field">' +
      '<label class="form-label" for="studioRegName">Studio Name</label>' +
      '<div class="onboarding__autocomplete-wrap">' +
        '<input type="text" class="form-input" id="studioRegName" placeholder="e.g., CorePower Pilates" autocomplete="off" />' +
        '<div class="onboarding__autocomplete-results" id="studioNameResults"></div>' +
      '</div>' +
    '</div>' +
    '<div class="studio-onboarding__field">' +
      '<label class="form-label" for="studioRegLocation">Location</label>' +
      '<div class="onboarding__autocomplete-wrap">' +
        '<input type="text" class="form-input" id="studioRegLocation" placeholder="City, State or Address" autocomplete="off" />' +
        '<div class="onboarding__autocomplete-results" id="locationResults"></div>' +
      '</div>' +
    '</div>' +
    '<div class="studio-onboarding__field">' +
      '<label class="form-label">Studio Type <span class="form-label-hint">(Select all that apply)</span></label>' +
      '<div class="studio-onboarding__type-grid" id="studioTypeGrid">' +
        '<button type="button" class="studio-onboarding__type-btn" data-type="classical">' +
          '<span class="studio-onboarding__type-icon">&#127919;</span> Classical Pilates' +
        '</button>' +
        '<button type="button" class="studio-onboarding__type-btn" data-type="contemporary">' +
          '<span class="studio-onboarding__type-icon">&#10024;</span> Contemporary Pilates' +
        '</button>' +
        '<button type="button" class="studio-onboarding__type-btn" data-type="reformer">' +
          '<span class="studio-onboarding__type-icon">&#128170;</span> Reformer Pilates' +
        '</button>' +
        '<button type="button" class="studio-onboarding__type-btn" data-type="mat">' +
          '<span class="studio-onboarding__type-icon">&#129495;</span> Mat Pilates' +
        '</button>' +
        '<button type="button" class="studio-onboarding__type-btn" data-type="club">' +
          '<span class="studio-onboarding__type-icon">&#127970;</span> Club Pilates' +
        '</button>' +
        '<button type="button" class="studio-onboarding__type-btn" data-type="lagree">' +
          '<span class="studio-onboarding__type-icon">&#9889;</span> Lagree / Megaformer' +
        '</button>' +
        '<button type="button" class="studio-onboarding__type-btn" data-type="barre">' +
          '<span class="studio-onboarding__type-icon">&#129652;</span> Barre' +
        '</button>' +
        '<button type="button" class="studio-onboarding__type-btn" data-type="hot">' +
          '<span class="studio-onboarding__type-icon">&#128293;</span> Hot Pilates' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="onboarding__actions">' +
      '<button type="button" class="btn btn--outline" id="studioStep1Back">Back</button>' +
      '<button type="button" class="btn btn--primary" id="studioStep1Next" disabled>Next</button>' +
    '</div>' +
  '</div>' +

  // Studio Step 2: Leaderboard Settings
  '<div class="onboarding__step" id="studioStep2">' +
    '<div class="onboarding__step-icon">&#128202;</div>' +
    '<h2 class="onboarding__step-title">Studio settings</h2>' +
    '<p class="onboarding__step-desc">Configure how your leaderboard works for your community.</p>' +
    '<div class="studio-onboarding__leaderboard-option">' +
      '<div>' +
        '<div class="studio-onboarding__leaderboard-label">Public leaderboard</div>' +
        '<div class="studio-onboarding__leaderboard-desc">Anyone can view your studio leaderboard</div>' +
      '</div>' +
      '<label class="toggle">' +
        '<input type="checkbox" id="lbPublicToggle" checked />' +
        '<span class="toggle__slider"></span>' +
      '</label>' +
    '</div>' +
    '<div class="studio-onboarding__leaderboard-option">' +
      '<div>' +
        '<div class="studio-onboarding__leaderboard-label">Anonymous mode</div>' +
        '<div class="studio-onboarding__leaderboard-desc">Show initials only (no full names)</div>' +
      '</div>' +
      '<label class="toggle">' +
        '<input type="checkbox" id="lbAnonToggle" />' +
        '<span class="toggle__slider"></span>' +
      '</label>' +
    '</div>' +
    '<div class="onboarding__actions" style="margin-top: 28px;">' +
      '<button type="button" class="btn btn--outline" id="studioStep2Back">Back</button>' +
      '<button type="button" class="btn btn--primary" id="studioStep2Next">Next</button>' +
    '</div>' +
  '</div>' +

  // Studio Step 3: Invite Members
  '<div class="onboarding__step" id="studioStep3">' +
    '<div class="onboarding__step-icon">&#128279;</div>' +
    '<h2 class="onboarding__step-title">Invite your members</h2>' +
    '<p class="onboarding__step-desc">Share this code or link so athletes can join your studio.</p>' +
    '<div class="studio-onboarding__invite-code">' +
      '<span class="studio-onboarding__invite-value" id="inviteCodeValue">BNCO-XXXX</span>' +
      '<button type="button" class="studio-onboarding__invite-copy" id="inviteCopyBtn">Copy</button>' +
    '</div>' +
    '<p class="onboarding__step-desc">Athletes can search for your studio by name, or enter this code directly.</p>' +
    '<div class="onboarding__actions">' +
      '<button type="button" class="btn btn--outline" id="studioStep3Back">Back</button>' +
      '<button type="button" class="btn btn--primary" id="studioStep3Finish">' +
        '<span class="auth-modal__btn-text">Launch Studio</span>' +
        '<span class="auth-modal__spinner" style="display:none;"></span>' +
      '</button>' +
    '</div>' +
    '<button type="button" class="onboarding__skip" id="studioStep3Skip">Skip and explore</button>' +
  '</div>' +

  '</div></div>';
}

// ---- Public API --------------------------------------------------

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
    birthday: null,
    gender: null,
    studio_register_name: null,
    studio_location: null,
    studio_location_data: null,
    studio_types: [],
    leaderboard_public: true,
    leaderboard_anonymous: false,
    invite_code: null,
  };

  injectOnboarding();

  if (presetRole) {
    selectedRole = presetRole;
    onboardingData.role = presetRole;
    totalSteps = presetRole === 'studio_admin' ? 3 : 4;
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
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 450);
    document.body.style.overflow = '';
  }
}

// ---- Inject & Bind -----------------------------------------------

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

function updateStepDots() {
  const dotsContainer = document.getElementById('onboardingStepDots');
  if (!dotsContainer) return;
  let html = '';
  for (let i = 1; i <= totalSteps; i++) {
    html += '<span class="onboarding__step-dot" data-step="' + i + '">' + i + '</span>';
  }
  dotsContainer.innerHTML = html;
}

function bindOnboardingEvents() {
  // ---- Role Selector ----
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
    totalSteps = selectedRole === 'studio_admin' ? 3 : 4;
    updateStepDots();
    showFlowSteps();
    goToStep(1);
  });

  // ---- Athlete Flow ----

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
  document.getElementById('connectWhoop')?.addEventListener('click', async () => {
    const btn = document.getElementById('connectWhoop');
    const device = document.getElementById('deviceWhoop');

    if (onboardingData.devices.whoop) {
      onboardingData.devices.whoop = false;
      btn.textContent = 'Connect via OAuth';
      btn.classList.remove('btn--connected');
      device?.classList.remove('onboarding__device--connected');
      validateAthleteStep2();
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Connecting...';
    try {
      const result = await apiConnectWhoop();
      if (result.ok && result.data?.auth_url) {
        window.open(result.data.auth_url, 'whoop_oauth', 'width=600,height=700');
        onboardingData.devices.whoop = true;
        btn.textContent = 'WHOOP Connected';
        btn.classList.add('btn--connected');
        device?.classList.add('onboarding__device--connected');
        validateAthleteStep2();
      } else {
        const confirmed = confirm(
          'Connect to WHOOP\n\n' +
          'This will redirect you to WHOOP to authorize BNCO to access your:\n' +
          '- Muscular Load (Control Score)\n' +
          '- Heart Rate Variability\n' +
          '- Recovery Data\n' +
          '- Workout Strain\n\n' +
          'Continue to WHOOP?'
        );
        if (confirmed) {
          onboardingData.devices.whoop = true;
          btn.textContent = 'WHOOP Connected';
          btn.classList.add('btn--connected');
          device?.classList.add('onboarding__device--connected');
          validateAthleteStep2();
        } else {
          btn.textContent = 'Connect via OAuth';
        }
      }
    } catch {
      btn.textContent = 'Connect via OAuth';
    }
    btn.disabled = false;
  });

  document.getElementById('appleWatchInfo')?.addEventListener('click', () => {
    alert(
      'Apple Watch requires the BNCO iOS app.\n\n' +
      'Download the iOS app from the App Store to sync:\n' +
      '- Wrist Motion (Stillness Index)\n' +
      '- Heart Rate and HRV\n' +
      '- Respiratory Rate\n' +
      '- Active Energy Burned\n\n' +
      'Data stays on-device until synced via the app.'
    );
  });

  // Studio Detection
  document.getElementById('detectStudioBtn')?.addEventListener('click', () => {
    detectNearbyStudios();
  });

  document.getElementById('athleteStep2Back')?.addEventListener('click', () => goToStep(1));
  document.getElementById('athleteStep2Next')?.addEventListener('click', () => goToStep(3));
  document.getElementById('athleteStep2Skip')?.addEventListener('click', () => goToStep(3));

  // Validate step 2: enable Next when at least one device connected
  function validateAthleteStep2() {
    const hasDevice = onboardingData.devices.whoop || onboardingData.devices.apple_watch;
    const nextBtn = document.getElementById('athleteStep2Next');
    if (nextBtn) nextBtn.disabled = !hasDevice;
  }
  validateAthleteStep2();

  // Step 3: Birthday + Gender (mandatory unless skip)
  function validateAthleteStep3() {
    const month = document.getElementById('bdayMonth')?.value;
    const day = document.getElementById('bdayDay')?.value;
    const year = document.getElementById('bdayYear')?.value;
    const gender = document.getElementById('genderSelect')?.value;
    const hasBday = month && day && year;
    const hasGender = !!gender;
    const nextBtn = document.getElementById('athleteStep3Next');
    if (nextBtn) nextBtn.disabled = !(hasBday && hasGender);
  }
  document.getElementById('bdayMonth')?.addEventListener('change', validateAthleteStep3);
  document.getElementById('bdayDay')?.addEventListener('change', validateAthleteStep3);
  document.getElementById('bdayYear')?.addEventListener('change', validateAthleteStep3);
  document.getElementById('genderSelect')?.addEventListener('change', validateAthleteStep3);
  validateAthleteStep3();

  document.getElementById('athleteStep3Back')?.addEventListener('click', () => goToStep(2));
  document.getElementById('athleteStep3Next')?.addEventListener('click', () => {
    collectBirthdayGender();
    goToStep(4);
  });
  document.getElementById('athleteStep3Skip')?.addEventListener('click', () => goToStep(4));

  // Step 4: Frequency
  document.getElementById('frequencyOptions')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.onboarding__freq-btn');
    if (!btn) return;
    document.querySelectorAll('.onboarding__freq-btn').forEach(b => b.classList.remove('onboarding__freq-btn--active'));
    btn.classList.add('onboarding__freq-btn--active');
    onboardingData.frequency = btn.dataset.freq;
    const finishBtn = document.getElementById('athleteStep4Finish');
    if (finishBtn) finishBtn.disabled = false;
  });

  document.getElementById('athleteStep4Back')?.addEventListener('click', () => goToStep(3));
  document.getElementById('athleteStep4Finish')?.addEventListener('click', () => finishOnboarding());
  document.getElementById('athleteStep4Skip')?.addEventListener('click', () => finishOnboarding(true));

  // ---- Studio Owner Flow ----

  // Step 1: Register studio
  const studioNameInput = document.getElementById('studioRegName');
  const studioLocInput = document.getElementById('studioRegLocation');
  const studioStep1Next = document.getElementById('studioStep1Next');

  function validateStudioStep1() {
    const hasName = studioNameInput?.value.trim().length > 0;
    const hasLoc = studioLocInput?.value.trim().length > 0;
    const hasType = onboardingData.studio_types.length > 0;
    if (studioStep1Next) studioStep1Next.disabled = !(hasName && hasLoc && hasType);
  }

  // Studio name autocomplete with Google Places
  studioNameInput?.addEventListener('input', () => {
    onboardingData.studio_register_name = studioNameInput.value.trim();
    validateStudioStep1();
    clearTimeout(studioNameDebounceTimer);
    const query = studioNameInput.value.trim();
    if (query.length < 2) {
      document.getElementById('studioNameResults').innerHTML = '';
      return;
    }
    studioNameDebounceTimer = setTimeout(() => studioNameAutocomplete(query), 300);
  });

  // Location autocomplete with Google Places
  studioLocInput?.addEventListener('input', () => {
    onboardingData.studio_location = studioLocInput.value.trim();
    validateStudioStep1();
    clearTimeout(locationDebounceTimer);
    const query = studioLocInput.value.trim();
    if (query.length < 2) {
      document.getElementById('locationResults').innerHTML = '';
      return;
    }
    locationDebounceTimer = setTimeout(() => locationAutocomplete(query), 300);
  });

  // Studio type: multi-select (toggle)
  document.getElementById('studioTypeGrid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.studio-onboarding__type-btn');
    if (!btn) return;
    btn.classList.toggle('studio-onboarding__type-btn--active');
    // Build array of selected types
    const selected = [];
    document.querySelectorAll('.studio-onboarding__type-btn--active').forEach(b => {
      selected.push(b.dataset.type);
    });
    onboardingData.studio_types = selected;
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

// ---- Birthday + Gender collection --------------------------------

function collectBirthdayGender() {
  const month = document.getElementById('bdayMonth')?.value;
  const day = document.getElementById('bdayDay')?.value;
  const year = document.getElementById('bdayYear')?.value;
  if (month && day && year) {
    onboardingData.birthday = year + '-' + month + '-' + day;
  }
  const gender = document.getElementById('genderSelect')?.value;
  if (gender) {
    onboardingData.gender = gender;
  }
}

// ---- Location Autocomplete (Google Places) -----------------------

async function locationAutocomplete(query) {
  if (!PLACES_API_KEY) return;
  const resultsEl = document.getElementById('locationResults');
  if (!resultsEl) return;

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
      },
      body: JSON.stringify({
        input: query,
        includedPrimaryTypes: ['locality', 'administrative_area_level_1', 'country'],
      }),
    });
    const data = await response.json();
    const suggestions = data.suggestions || [];

    if (suggestions.length === 0) {
      resultsEl.innerHTML = '';
      return;
    }

    resultsEl.innerHTML = suggestions.map(s => {
      const place = s.placePrediction;
      if (!place) return '';
      const text = place.text?.text || place.structuredFormat?.mainText?.text || '';
      const secondary = place.structuredFormat?.secondaryText?.text || '';
      const display = secondary ? text + ', ' + secondary : text;
      const placeId = place.placeId || '';
      return '<button type="button" class="onboarding__autocomplete-item" data-place-id="' + placeId + '" data-text="' + display.replace(/"/g, '&quot;') + '">' +
        '<span class="onboarding__autocomplete-main">' + text + '</span>' +
        (secondary ? '<span class="onboarding__autocomplete-secondary">' + secondary + '</span>' : '') +
        '</button>';
    }).join('');

    resultsEl.querySelectorAll('.onboarding__autocomplete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const locInput = document.getElementById('studioRegLocation');
        if (locInput) locInput.value = btn.dataset.text;
        onboardingData.studio_location = btn.dataset.text;
        onboardingData.studio_location_data = { placeId: btn.dataset.placeId, text: btn.dataset.text };
        resultsEl.innerHTML = '';
        // Re-validate
        const studioStep1Next = document.getElementById('studioStep1Next');
        const hasName = document.getElementById('studioRegName')?.value.trim().length > 0;
        const hasType = onboardingData.studio_types.length > 0;
        if (studioStep1Next) studioStep1Next.disabled = !(hasName && onboardingData.studio_location && hasType);
      });
    });
  } catch {
    resultsEl.innerHTML = '';
  }
}

// ---- Studio Name Autocomplete (Google Places) --------------------

async function studioNameAutocomplete(query) {
  if (!PLACES_API_KEY) return;
  const resultsEl = document.getElementById('studioNameResults');
  if (!resultsEl) return;

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
      },
      body: JSON.stringify({
        textQuery: 'pilates studio ' + query,
        maxResultCount: 5,
      }),
    });
    if (!response.ok) { resultsEl.innerHTML = ''; return; }
    const data = await response.json();
    const places = data.places || [];

    let html = places.map(p => {
      const name = p.displayName?.text || '';
      const addr = p.formattedAddress || '';
      return '<button type="button" class="onboarding__autocomplete-item" data-name="' + name.replace(/"/g, '&quot;') + '" data-addr="' + addr.replace(/"/g, '&quot;') + '">' +
        '<span class="onboarding__autocomplete-main">' + name + '</span>' +
        '<span class="onboarding__autocomplete-secondary">' + addr + '</span>' +
        '</button>';
    }).join('');

    // "Not listed" option
    html += '<button type="button" class="onboarding__autocomplete-item onboarding__autocomplete-item--manual">' +
      '<span class="onboarding__autocomplete-main">Studio not listed?</span>' +
      '<span class="onboarding__autocomplete-secondary">Register manually</span>' +
      '</button>';

    resultsEl.innerHTML = html;

    resultsEl.querySelectorAll('.onboarding__autocomplete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('onboarding__autocomplete-item--manual')) {
          // Just close the dropdown, keep what user typed
          resultsEl.innerHTML = '';
          return;
        }
        const nameInput = document.getElementById('studioRegName');
        const locInput = document.getElementById('studioRegLocation');
        if (nameInput) nameInput.value = btn.dataset.name;
        onboardingData.studio_register_name = btn.dataset.name;
        if (btn.dataset.addr && locInput && !locInput.value.trim()) {
          locInput.value = btn.dataset.addr;
          onboardingData.studio_location = btn.dataset.addr;
        }
        resultsEl.innerHTML = '';
        // Re-validate
        const studioStep1Next = document.getElementById('studioStep1Next');
        const hasName = onboardingData.studio_register_name?.length > 0;
        const hasLoc = locInput?.value.trim().length > 0;
        const hasType = onboardingData.studio_types.length > 0;
        if (studioStep1Next) studioStep1Next.disabled = !(hasName && hasLoc && hasType);
      });
    });
  } catch {
    resultsEl.innerHTML = '';
  }
}

// ---- View Toggle -------------------------------------------------

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
  updateStepDots();
}

function hideFlowSteps() {
  const progressWrap = document.getElementById('onboardingProgressWrap');
  if (progressWrap) progressWrap.style.display = 'none';
  hideAllSteps();
}

function hideAllSteps() {
  const steps = ['athleteStep1', 'athleteStep2', 'athleteStep3', 'athleteStep4', 'studioStep1', 'studioStep2', 'studioStep3'];
  steps.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('onboarding__step--active');
  });
}

// ---- Step Navigation ---------------------------------------------

function goToStep(step) {
  currentStep = step;

  // Update progress
  const progress = document.getElementById('onboardingProgress');
  if (progress) {
    progress.style.width = (step / totalSteps) * 100 + '%';
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
  const stepEl = document.getElementById(prefix + step);
  if (stepEl) stepEl.classList.add('onboarding__step--active');
}

// ---- Studio Search -----------------------------------------------

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
    const distText = s.distance != null ? ' - ' + s.distance.toFixed(1) + ' mi away' : '';
    return '<button type="button" class="onboarding__search-result" data-id="' + s.id + '" data-name="' + (s.name || '').replace(/"/g, '&quot;') + '">' +
      '<span class="onboarding__result-name">' + s.name + '</span>' +
      '<span class="onboarding__result-location">' + location + distText + '</span>' +
      '</button>';
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

// ---- Finish Onboarding -------------------------------------------

async function finishOnboarding(skipped = false) {
  const finishBtnId = selectedRole === 'studio_admin' ? 'studioStep3Finish' : 'athleteStep4Finish';
  const finishBtn = document.getElementById(finishBtnId);

  // Collect birthday/gender if on athlete flow
  if (selectedRole !== 'studio_admin') {
    collectBirthdayGender();
  }

  if (finishBtn) {
    finishBtn.disabled = true;
    const text = finishBtn.querySelector('.auth-modal__btn-text');
    const spinner = finishBtn.querySelector('.auth-modal__spinner');
    if (text) text.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
  }

  // Persist role to localStorage immediately
  if (selectedRole) {
    localStorage.setItem('bnco_user_role', selectedRole);
    localStorage.setItem('bnco_current_view', selectedRole === 'studio_admin' ? 'studio' : 'athlete');
  }

  if (!skipped) {
    const payload = selectedRole === 'studio_admin'
      ? {
          role: 'studio_admin',
          studio_name: onboardingData.studio_register_name,
          studio_location: onboardingData.studio_location,
          studio_types: onboardingData.studio_types,
          leaderboard_public: onboardingData.leaderboard_public,
          leaderboard_anonymous: onboardingData.leaderboard_anonymous,
          invite_code: onboardingData.invite_code,
        }
      : {
          role: 'athlete',
          studio_id: onboardingData.studio_id,
          frequency: onboardingData.frequency,
          devices: onboardingData.devices,
          birthday: onboardingData.birthday || null,
          gender: onboardingData.gender || null,
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

// ---- Studio Detection (Geolocation) ----------------------------

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
    detectBtn.textContent = 'Detecting...';
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const places = await searchNearbyPlaces(userLat, userLng);
        if (places && places.length > 0) {
          showNearbyStudiosFromPlaces(places, userLat, userLng);
        } else {
          showNearbyStudios(userLat, userLng);
        }

        if (detectBtn) {
          detectBtn.disabled = false;
          detectBtn.textContent = 'Detect My Studio';
        }
      },
      () => {
        showNearbyStudios(39.1031, -84.5120);
        if (detectBtn) {
          detectBtn.disabled = false;
          detectBtn.textContent = 'Location denied - showing Cincinnati area';
          setTimeout(() => { if (detectBtn) detectBtn.textContent = 'Detect My Studio'; }, 3000);
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  } else {
    showNearbyStudios(39.1031, -84.5120);
    if (detectBtn) {
      detectBtn.disabled = false;
      detectBtn.textContent = 'Detect My Studio';
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
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
