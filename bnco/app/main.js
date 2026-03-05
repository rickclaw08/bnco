/* ═══════════════════════════════════════════════════════════
   BNCO - Main Application Logic
   Production-ready with API integration + demo fallback
   ═══════════════════════════════════════════════════════════ */

import './style.css';
import { runBTLDemo, normalizePilatesScore } from './btl.js';
import {
  getProfile,
  getMyStats,
  getLeaderboard,
  getGoal,
  getMyWorkouts,
  getToken,
  getCachedUser,
  setCachedUser,
} from './api.js';
import {
  checkAuthState,
  showAuthModal,
  getCurrentUser,
  isLoggedIn,
  logout,
} from './auth.js';
import { showOnboarding } from './onboarding.js';
import { initSettings, getWearableState } from './settings.js';
import { initWidgetSystem, exitEditMode } from './widgets.js';

// ── Exports for settings.js ──────────────────────────────
// Allow settings to trigger studio onboarding
export function triggerStudioUpgrade() {
  showOnboarding(handleStudioUpgradeComplete, 'studio_admin');
}

// Expose appState getter for settings
export function getAppState() {
  return appState;
}

// ── Constants ─────────────────────────────────────────────
const LEVELS = [
  { level: 1, title: 'Recruit', xp: 0 },
  { level: 2, title: 'Starter', xp: 100 },
  { level: 3, title: 'Mover', xp: 250 },
  { level: 4, title: 'Hustler', xp: 450 },
  { level: 5, title: 'Grinder', xp: 720 },
  { level: 6, title: 'Contender', xp: 1050 },
  { level: 7, title: 'Warrior', xp: 1450 },
  { level: 8, title: 'Challenger', xp: 1920 },
  { level: 9, title: 'Striker', xp: 2480 },
  { level: 10, title: 'Gladiator', xp: 3100 },
  { level: 11, title: 'Enforcer', xp: 3800 },
  { level: 12, title: 'Vanguard', xp: 4600 },
  { level: 13, title: 'Titan', xp: 5500 },
  { level: 14, title: 'Champion', xp: 6500 },
  { level: 15, title: 'Apex', xp: 7650 },
  { level: 16, title: 'Elite', xp: 8950 },
  { level: 17, title: 'Phenom', xp: 10400 },
  { level: 18, title: 'Prodigy', xp: 12050 },
  { level: 19, title: 'Master', xp: 13900 },
  { level: 20, title: 'Grandmaster', xp: 16000 },
  { level: 25, title: 'Mythic', xp: 25000 },
  { level: 30, title: 'Immortal', xp: 38000 },
  { level: 35, title: 'Ascendant', xp: 55000 },
  { level: 40, title: 'Sovereign', xp: 78000 },
  { level: 45, title: 'Deity', xp: 110000 },
  { level: 50, title: 'Legend', xp: 150000 },
];

const ACHIEVEMENTS = [
  { id: 'bronze_streak', icon: '🔥', name: 'Bronze Streak', desc: 'Top 50% for 3 days', earned: true },
  { id: 'silver_streak', icon: '🔥', name: 'Silver Streak', desc: 'Top 25% for 7 days', earned: true },
  { id: 'gold_streak', icon: '🔥', name: 'Gold Streak', desc: 'Top 10% for 14 days', earned: false },
  { id: 'diamond_streak', icon: '💎', name: 'Diamond Streak', desc: 'Top 5% for 30 days', earned: false },
  { id: 'ghost_slayer', icon: '👻', name: 'Ghost Slayer', desc: 'Collect 5 ghost fragments', earned: true },
  { id: 'city_boss', icon: '👑', name: 'City Boss', desc: 'Crowned #1 in your city', earned: false },
  { id: 'beat_city', icon: '🏙️', name: 'Beat the City', desc: 'Exceed city average RES', earned: true },
  { id: 'perfect_week', icon: '⭐', name: 'Perfect Week', desc: 'Sync workouts 7 days', earned: true },
  { id: 'first_class', icon: '🏋️', name: 'First Class', desc: 'Complete your first class', earned: true },
  { id: 'studio_reg', icon: '📍', name: 'Home Studio', desc: 'Check into a studio', earned: true },
  { id: 'top_ten', icon: '🏆', name: 'Top 10', desc: 'Rank top 10 in any board', earned: true },
  { id: 'century', icon: '💯', name: 'Century Club', desc: 'Reach RES 100+', earned: false },
];

// ── App State ─────────────────────────────────────────────
const ROLE_KEY = 'bnco_user_role';
const VIEW_KEY = 'bnco_current_view';

let appState = {
  user: null,
  studioId: null,
  stats: null,
  usingDemoData: true,
  userRole: localStorage.getItem(ROLE_KEY) || 'athlete',    // 'athlete' | 'studio_admin'
  studioSubscribed: false, // true if studio owner has active $549/mo subscription
};

// ── Simulated Data (Demo Fallback) ────────────────────────
function generateLeaderboardData(scope) {
  const names = [
    { name: 'Jake R.', initials: 'JR' },
    { name: 'Maya K.', initials: 'MK' },
    { name: 'Alex L.', initials: 'AL' },
    { name: 'Sarah M.', initials: 'SM' },
    { name: 'Chris P.', initials: 'CP' },
    { name: 'Jordan T.', initials: 'JT' },
    { name: 'Taylor W.', initials: 'TW' },
    { name: 'Morgan D.', initials: 'MD' },
    { name: 'Riley F.', initials: 'RF' },
    { name: 'Casey B.', initials: 'CB' },
    { name: 'Drew H.', initials: 'DH' },
    { name: 'Quinn S.', initials: 'QS' },
    { name: 'Avery N.', initials: 'AN' },
    { name: 'Jamie G.', initials: 'JG' },
    { name: 'Reese V.', initials: 'RV' },
  ];

  const seedOffsets = { class: 0, studio: 17, city: 43, state: 71, global: 97 };
  const offset = seedOffsets[scope] || 0;

  const data = names.map((n, i) => {
    const pseudoRandom = ((i + offset) * 7 + 13) % 30;
    const score = parseFloat((95 - i * 2.8 - pseudoRandom * 0.3).toFixed(1));
    const changes = ['+2', '+1', '-1', '+3', '-', '-2', '+1', '+4', '-', '-1', '+2', '-3', '+1', '-', '+2'];
    return {
      ...n,
      score: Math.max(score, 40),
      change: changes[(i + offset) % changes.length],
      isYou: n.initials === 'SM',
    };
  });

  data.sort((a, b) => b.score - a.score);
  return data.map((d, i) => ({ ...d, rank: i + 1 }));
}

const DEMO_MISSIONS = [
  { name: 'February Burn Challenge', metric: 'Calories', target: 5000, current: 3420, startDate: '2026-02-01', endDate: '2026-02-28' },
  { name: 'Step It Up', metric: 'Steps', target: 100000, current: 72400, startDate: '2026-02-15', endDate: '2026-03-15' },
  { name: 'Recovery Warriors', metric: 'Recovery Avg', target: 85, current: 78, startDate: '2026-02-20', endDate: '2026-03-20' },
  { name: 'Class Streak Sprint', metric: 'Classes', target: 20, current: 14, startDate: '2026-02-01', endDate: '2026-02-28' },
  { name: 'Strain Domain', metric: 'Strain Total', target: 200, current: 145, startDate: '2026-02-10', endDate: '2026-03-10' },
];

const STUDIO_RANKINGS = [
  { name: 'Burn Pilates Studio', score: 78.4, isYou: false },
  { name: 'FlexCore Cincinnati', score: 74.1, isYou: false },
  { name: 'CorePower Pilates', score: 71.8, isYou: true },
  { name: 'Pure Barre Hyde Park', score: 68.2, isYou: false },
  { name: 'SoulCycle OTR', score: 65.9, isYou: false },
  { name: 'Club Pilates Mason', score: 62.3, isYou: false },
  { name: 'Orangetheory Kenwood', score: 59.7, isYou: false },
];

// ── Mutable missions list for demo form ───────────────────
let MISSIONS = [...DEMO_MISSIONS];

// ── Personal Goals (demo) ─────────────────────────────────
let PERSONAL_GOALS = [
  { type: 'weekly_classes', label: 'Weekly Classes', target: 5, current: 4, icon: '📅' },
  { type: 'target_bnco', label: 'Target bnco Score', target: 80, current: 72, icon: '🎯' },
  { type: 'streak', label: 'Day Streak', target: 7, current: 5, icon: '🔥' },
];

// ── Demo bnco Score Data ──────────────────────────────────
const DEMO_BNCO_SCORE = {
  controlScore: 76,
  stillnessIndex: 68,
  respiratoryEfficiency: 81,
};

// ── Demo Studio Challenge Data ────────────────────────────
const DEMO_STUDIO_CHALLENGES = [
  { home: 'BNCO Cincinnati', away: 'BNCO Miami', homeScore: 74.2, awayScore: 71.8, status: 'live' },
  { home: 'BNCO Cincinnati', away: 'BNCO Austin', homeScore: 68.5, awayScore: 72.1, status: 'live' },
  { home: 'BNCO Cincinnati', away: 'BNCO NYC', homeScore: 69.9, awayScore: 69.3, status: 'completed' },
];

// ── Demo Studio Wars (Studio View) ───────────────────────
const DEMO_STUDIO_WARS = [
  { opponent: 'Burn Pilates Miami', yourAvg: 74.2, theirAvg: 71.8, status: 'winning', endsIn: '3 days' },
  { opponent: 'FlexCore Austin', yourAvg: 68.5, theirAvg: 72.1, status: 'losing', endsIn: '5 days' },
];

// ── Demo At Risk Members ─────────────────────────────────
const DEMO_AT_RISK = [
  { name: 'Casey B.', initials: 'CB', reason: 'Recovery below 40% for 3 days', recovery: 35, severity: 'high' },
  { name: 'Drew H.', initials: 'DH', reason: 'Strain above 18 two sessions in a row', recovery: 52, severity: 'medium' },
  { name: 'Quinn S.', initials: 'QS', reason: 'No check-in for 8 days', recovery: null, severity: 'low' },
];

// ── Landing / App Toggle ──────────────────────────────────
function showLanding() {
  const landing = document.getElementById('landing');
  const app = document.getElementById('app');
  if (landing) landing.style.display = 'block';
  if (app) app.style.display = 'none';
}

function showApp() {
  const landing = document.getElementById('landing');
  const app = document.getElementById('app');
  if (landing) landing.style.display = 'none';
  if (app) app.style.display = 'block';
}

function initLandingParticles() {
  const container = document.getElementById('landingParticles');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (6 + Math.random() * 6) + 's';
    particle.style.width = (2 + Math.random() * 3) + 'px';
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

function initLandingCountUp() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        animateCount(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('#landing [data-count]').forEach(el => observer.observe(el));
}

function initLandingButtons() {
  const getStartedBtn = document.getElementById('landingGetStarted');
  const signInBtn = document.getElementById('landingSignIn');
  const bottomCtaBtn = document.getElementById('landingBottomCta');

  const openAuth = () => showAuthModal();

  getStartedBtn?.addEventListener('click', openAuth);
  signInBtn?.addEventListener('click', openAuth);
  bottomCtaBtn?.addEventListener('click', openAuth);
}

// ── DOM Ready ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// ── Main App Initialization ───────────────────────────────
async function initApp() {
  // Initialize landing page UI immediately
  initLandingParticles();
  initLandingButtons();
  initLandingCountUp();
  initLandingScrollReveal();
  initCardRipple();

  // Check auth state FIRST to decide what to show
  const authState = await checkAuthState();

  if (authState.authenticated) {
    // Skip landing, show app directly
    showApp();

    appState.user = authState.user;
    appState.studioId = authState.user?.studio_id || null;
    appState.userRole = authState.user?.role || getCachedUser()?.role || localStorage.getItem(ROLE_KEY) || 'athlete';
    appState.studioSubscribed = authState.user?.studio_subscribed || false;
    // Persist role to localStorage
    localStorage.setItem(ROLE_KEY, appState.userRole);
    appState.usingDemoData = false;

    // Initialize app UI
    initAppUI();
    applyRoleAccess();

    if (authState.needsOnboarding) {
      showOnboarding(handleOnboardingComplete);
    }

    await loadAppData();
  } else {
    // Show landing, hide app
    showLanding();
    appState.usingDemoData = true;
  }

  // Listen for auth events
  window.addEventListener('bnco:auth-success', async (e) => {
    const { user, needsOnboarding } = e.detail;
    appState.user = user;
    appState.studioId = user?.studio_id || null;
    appState.userRole = user?.role || localStorage.getItem(ROLE_KEY) || 'athlete';
    appState.studioSubscribed = user?.studio_subscribed || false;
    // Persist role to localStorage
    localStorage.setItem(ROLE_KEY, appState.userRole);
    appState.usingDemoData = false;

    // Hide landing, show app
    showApp();

    // Reset initAppUI guard so it re-runs after auth
    appUIInitialized = false;
    initAppUI();
    applyRoleAccess();

    if (needsOnboarding) {
      showOnboarding(handleOnboardingComplete);
    } else {
      await loadAppData();
    }
  });

  window.addEventListener('bnco:auth-required', () => {
    appState.user = null;
    appState.usingDemoData = true;
    appState.userRole = 'athlete';
    appState.studioSubscribed = false;
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(VIEW_KEY);
    showLanding();
  });
}

// ── Initialize App UI (called after auth) ─────────────────
let appUIInitialized = false;
function initAppUI() {
  if (appUIInitialized) return;
  appUIInitialized = true;

  initHeroParticles();
  initCountUpAnimations();
  initNavToggle();
  initViewSwitching();
  initGhostRacing();
  initAchievements();
  initScrollReveal();
  initMissionForm();
  initSystemControls();
  initSettings();
  initBncoScore();
  initGoals();
  initStudioChallenges();
  initStudioWarRoom();

  // Initialize widget system for current view
  const widgetView = appState.userRole === 'studio_admin' ? 'studio' : 'athlete';
  initWidgetSystem(widgetView);
}

// ── Onboarding Complete Handler ───────────────────────────
async function handleOnboardingComplete(data) {
  if (data.studio_id) {
    appState.studioId = data.studio_id;
  }
  if (data.role) {
    appState.userRole = data.role;
    // Persist role to localStorage
    localStorage.setItem(ROLE_KEY, data.role);
    const cached = getCachedUser() || {};
    cached.role = data.role;
    setCachedUser(cached);
  }

  // Try to refresh profile from API
  const profileResult = await getProfile();
  if (profileResult.ok) {
    appState.user = profileResult.data;
    appState.studioId = profileResult.data?.studio_id || appState.studioId;
    appState.studioSubscribed = profileResult.data?.studio_subscribed || false;
    appState.usingDemoData = false;
  } else {
    // API unavailable - use demo data, that's fine
    appState.usingDemoData = true;
  }

  await loadAppData();

  // Apply role-based access AFTER data loads
  applyRoleAccess();

  // After onboarding, switch to the correct view based on role
  if (data.role === 'studio_admin') {
    switchView('studio');
  } else {
    switchView('athlete');
  }
}

// ── Load Real Data from API ───────────────────────────────
async function loadAppData() {
  updateProfileUI();
  showLoadingStates();

  // Try to load from API, fall back to demo data on any failure
  try {
    const results = await Promise.allSettled([
      loadProfileData(),
      loadLeaderboardData('class'),
      loadMissionsData(),
    ]);

    // Check if ALL data loads failed - if so, force full demo mode
    const allFailed = results.every(r =>
      r.status === 'rejected' || (r.status === 'fulfilled' && r.value === false)
    );

    if (allFailed) {
      appState.usingDemoData = true;
      loadDemoData();
    }
  } catch {
    // If anything throws, go full demo
    appState.usingDemoData = true;
    loadDemoData();
  }

  // Always initialize these (they use demo data as fallback internally)
  initBTL();
  initLeaderboard();
  initStudioAnalytics();
  initMissions();

  // Trigger entrance animations after content is loaded
  triggerAppAnimations();

  hideLoadingStates();
}

async function loadProfileData() {
  const [statsResult, profileResult] = await Promise.allSettled([
    getMyStats(),
    getProfile(),
  ]);

  const stats = statsResult.status === 'fulfilled' && statsResult.value.ok
    ? statsResult.value.data
    : null;

  const profile = profileResult.status === 'fulfilled' && profileResult.value.ok
    ? profileResult.value.data
    : appState.user;

  if (profile) {
    appState.user = profile;
    updateProfileCard(profile, stats);
    updateRESCard(stats);
    updateNavUser(profile);
    // Even with a valid profile, if stats failed, show demo stats
    if (!stats) {
      loadDemoStats();
    }
    return true;
  } else {
    // Full demo fallback
    loadDemoProfile();
    return false;
  }
}

async function loadLeaderboardData(scope) {
  if (!appState.studioId || appState.usingDemoData) {
    // No studio or demo mode - use demo data
    renderLeaderboard(scope, generateLeaderboardData(scope));
    return true;
  }

  try {
    const result = await getLeaderboard(appState.studioId, { scope });

    if (result.ok && result.data) {
      const entries = (result.data.entries || result.data || []).map((e, i) => ({
        name: e.display_name || e.name || 'Anonymous',
        initials: getInitials(e.display_name || e.name || '??'),
        score: e.score || e.res_score || 0,
        change: e.change || '-',
        isYou: e.is_current_user || false,
        rank: e.rank || i + 1,
      }));
      if (entries.length > 0) {
        renderLeaderboard(scope, entries);
        return true;
      }
    }
  } catch {
    // API error - fall through to demo
  }

  // Fallback to demo
  renderLeaderboard(scope, generateLeaderboardData(scope));
  return true;
}

async function loadMissionsData() {
  if (!appState.studioId) {
    MISSIONS = [...DEMO_MISSIONS];
    const list = document.getElementById('missionsList');
    if (list) renderMissions(list);
    return;
  }

  const result = await getGoal(appState.studioId);

  if (result.ok && result.data) {
    const goals = Array.isArray(result.data) ? result.data : [result.data];
    MISSIONS = goals.map(g => ({
      name: g.name || g.title,
      metric: g.metric,
      target: g.target,
      current: g.current || g.progress || 0,
      startDate: g.start_date,
      endDate: g.end_date,
    }));
  } else {
    MISSIONS = [...DEMO_MISSIONS];
  }

  const list = document.getElementById('missionsList');
  if (list) renderMissions(list);
}

// ── Load Demo Data (Fallback) ─────────────────────────────
function loadDemoData() {
  loadDemoProfile();
  renderLeaderboard('class', generateLeaderboardData('class'));
  MISSIONS = [...DEMO_MISSIONS];
  const list = document.getElementById('missionsList');
  if (list) renderMissions(list);
  initStudioAnalytics();
  initBTL();
}

function loadDemoStats() {
  // Populate RES card with demo data
  const scoreEl = document.getElementById('resScore');
  const trendEl = document.getElementById('resTrend');
  if (scoreEl) scoreEl.textContent = '71.4';
  if (trendEl) { trendEl.textContent = '+2.3'; trendEl.className = 'res__trend res__trend--up'; }

  // Streaks
  const streakCount = document.querySelector('#vibeStreak .profile__streak-count');
  const weekCount = document.querySelector('#perfectWeek .profile__streak-count');
  if (streakCount) streakCount.textContent = '5 Days';
  if (weekCount) weekCount.textContent = '4/7';
}

function loadDemoProfile() {
  // Populate profile card with demo data
  const nameEl = document.querySelector('.profile__name');
  const avatarEl = document.querySelector('.profile__avatar');
  const levelBadge = document.getElementById('levelBadge');
  const levelNum = document.querySelector('.profile__level-num');
  const xpFill = document.getElementById('xpBarFill');
  const xpCurrent = document.getElementById('xpCurrent');
  const xpNext = document.getElementById('xpNext');

  if (nameEl) nameEl.textContent = appState.user?.display_name || appState.user?.name || 'Athlete';
  setAvatar(avatarEl, appState.user);
  if (levelBadge) levelBadge.textContent = 'INTERMEDIATE';
  if (levelNum) levelNum.textContent = 'Level 12';
  if (xpFill) xpFill.style.width = '65%';
  if (xpCurrent) xpCurrent.textContent = '1,240';
  if (xpNext) xpNext.textContent = '2,000';

  // Nav user
  const navLevel = document.getElementById('navLevel');
  const navAvatar = document.getElementById('navAvatar');
  if (navLevel) navLevel.textContent = 'Lv. 12';
  setAvatar(navAvatar, appState.user);

  // Streaks
  const streakCount = document.querySelector('#vibeStreak .profile__streak-count');
  const weekCount = document.querySelector('#perfectWeek .profile__streak-count');
  if (streakCount) streakCount.textContent = '5 Days';
  if (weekCount) weekCount.textContent = '4/7';

  // RES card
  const scoreEl = document.getElementById('resScore');
  const trendEl = document.getElementById('resTrend');
  if (scoreEl) scoreEl.textContent = '71.4';
  if (trendEl) { trendEl.textContent = '+2.3'; trendEl.className = 'res__trend res__trend--up'; }

  // Render demo missions
  MISSIONS = [...DEMO_MISSIONS];
  const list = document.getElementById('missionsList');
  if (list) renderMissions(list);

  // Render demo leaderboard
  renderLeaderboard('class', generateLeaderboardData('class'));
}

// ── UI Update Functions ───────────────────────────────────

function updateProfileUI() {
  const user = appState.user;
  if (!user) return;
  updateNavUser(user);
}

function updateNavUser(user) {
  const navLevel = document.getElementById('navLevel');
  const navAvatar = document.getElementById('navAvatar');

  if (user) {
    const level = getLevelForXP(user.xp || 0);
    if (navLevel) navLevel.textContent = `Lv. ${level.level}`;
    setAvatar(navAvatar, user);
  }
}

function updateProfileCard(user, stats) {
  if (!user) return;

  const nameEl = document.querySelector('.profile__name');
  const avatarEl = document.querySelector('.profile__avatar');
  const levelBadge = document.getElementById('levelBadge');
  const levelNum = document.querySelector('.profile__level-num');

  const level = getLevelForXP(user.xp || 0);
  const nextLevel = LEVELS.find(l => l.xp > (user.xp || 0)) || LEVELS[LEVELS.length - 1];

  if (nameEl) nameEl.textContent = user.display_name || user.name || 'Athlete';
  setAvatar(avatarEl, user);
  if (levelBadge) levelBadge.textContent = level.title.toUpperCase();
  if (levelNum) levelNum.textContent = `Level ${level.level}`;

  // XP bar
  const xpFill = document.getElementById('xpBarFill');
  const xpCurrent = document.getElementById('xpCurrent');
  const xpNext = document.getElementById('xpNext');

  if (xpFill && xpCurrent && xpNext) {
    const currentXP = user.xp || 0;
    const prevLevelXP = level.xp;
    const nextLevelXP = nextLevel.xp;
    const progress = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

    xpFill.style.width = `${Math.min(progress, 100)}%`;
    xpCurrent.textContent = currentXP.toLocaleString();
    xpNext.textContent = nextLevelXP.toLocaleString();
  }

  // Streaks
  if (stats) {
    const streakCount = document.querySelector('#vibeStreak .profile__streak-count');
    const weekCount = document.querySelector('#perfectWeek .profile__streak-count');

    if (streakCount && stats.streak_days != null) {
      streakCount.textContent = `${stats.streak_days} Days`;
    }
    if (weekCount && stats.weekly_workouts != null) {
      weekCount.textContent = `${stats.weekly_workouts}/7`;
    }
  }
}

function updateRESCard(stats) {
  if (!stats) return;

  const scoreEl = document.getElementById('resScore');
  const trendEl = document.getElementById('resTrend');

  if (scoreEl && stats.res_score != null) {
    scoreEl.textContent = stats.res_score.toFixed(1);
  }

  if (trendEl && stats.res_trend != null) {
    trendEl.textContent = stats.res_trend >= 0
      ? `+${stats.res_trend.toFixed(1)}`
      : stats.res_trend.toFixed(1);
    trendEl.className = `res__trend res__trend--${stats.res_trend >= 0 ? 'up' : 'down'}`;
  }

  // Update breakdown bars
  const metrics = ['strain', 'hr', 'steps', 'recovery'];
  metrics.forEach(m => {
    const val = stats[`${m}_score`] || stats[m];
    if (val != null) {
      const fill = document.querySelector(`.res__metric-fill[data-color="${m}"]`);
      const valEl = fill?.closest('.res__metric')?.querySelector('.res__metric-val');
      if (fill) fill.style.width = `${Math.min(val, 100)}%`;
      if (valEl) valEl.textContent = val.toFixed(1);
    }
  });
}

// ── Loading States ────────────────────────────────────────

function showLoadingStates() {
  // Add skeleton class to cards being loaded
  const cards = ['profileCard', 'resCard', 'btlCard'];
  cards.forEach(id => {
    const card = document.getElementById(id);
    if (card) card.classList.add('card--loading');
  });
}

function hideLoadingStates() {
  document.querySelectorAll('.card--loading').forEach(card => {
    card.classList.remove('card--loading');
  });
}

// ── Helper Functions ──────────────────────────────────────

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function getLevelForXP(xp) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xp) current = level;
    else break;
  }
  return current;
}

// ── Hero Particles ────────────────────────────────────────
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (6 + Math.random() * 6) + 's';
    particle.style.width = (2 + Math.random() * 3) + 'px';
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

// ── Count-Up Animation ────────────────────────────────────
function initCountUpAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        animateCount(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

function animateCount(el, target) {
  const duration = 2000;
  const start = performance.now();
  const initial = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(initial + (target - initial) * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── Navigation Toggle ─────────────────────────────────────
function initNavToggle() {
  const athleteBtn = document.getElementById('navAthlete');
  const studioBtn = document.getElementById('navStudio');

  athleteBtn?.addEventListener('click', () => switchView('athlete'));
  studioBtn?.addEventListener('click', () => switchView('studio'));

  // Mobile bottom tab bar
  document.getElementById('mobileAthlete')?.addEventListener('click', () => switchView('athlete'));
  document.getElementById('mobileStudio')?.addEventListener('click', () => switchView('studio'));

  // Hero CTA buttons
  document.getElementById('ctaAthlete')?.addEventListener('click', () => {
    if (!isLoggedIn()) {
      showAuthModal();
      return;
    }
    switchView('athlete');
    document.getElementById('mainNav')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('ctaStudio')?.addEventListener('click', () => {
    if (!isLoggedIn()) {
      showAuthModal();
      return;
    }
    switchView('studio');
    document.getElementById('mainNav')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Add logout handler to avatar click
  const navAvatar = document.getElementById('navAvatar');
  navAvatar?.addEventListener('click', () => {
    if (isLoggedIn()) {
      if (confirm('Log out?')) {
        logout();
      }
    } else {
      showAuthModal();
    }
  });
}

function switchView(view) {
  const athleteView = document.getElementById('athleteView');
  const studioView = document.getElementById('studioView');
  const athleteBtn = document.getElementById('navAthlete');
  const studioBtn = document.getElementById('navStudio');
  const toggle = document.querySelector('.nav__toggle');
  const mobileAthleteBtn = document.getElementById('mobileAthlete');
  const mobileStudioBtn = document.getElementById('mobileStudio');

  // Athletes cannot access studio view
  if (view === 'studio' && appState.userRole !== 'studio_admin') {
    return;
  }

  // Save current view to localStorage
  localStorage.setItem(VIEW_KEY, view);

  if (view === 'athlete') {
    athleteView?.classList.add('view--active');
    studioView?.classList.remove('view--active');
    athleteBtn?.classList.add('nav__toggle-btn--active');
    studioBtn?.classList.remove('nav__toggle-btn--active');
    toggle?.classList.remove('nav__toggle--studio');
    mobileAthleteBtn?.classList.add('mobile-tab-bar__btn--active');
    mobileStudioBtn?.classList.remove('mobile-tab-bar__btn--active');
  } else {
    studioView?.classList.add('view--active');
    athleteView?.classList.remove('view--active');
    studioBtn?.classList.add('nav__toggle-btn--active');
    athleteBtn?.classList.remove('nav__toggle-btn--active');
    toggle?.classList.add('nav__toggle--studio');
    mobileStudioBtn?.classList.add('mobile-tab-bar__btn--active');
    mobileAthleteBtn?.classList.remove('mobile-tab-bar__btn--active');
    setTimeout(() => {
      document.querySelectorAll('#studioView [data-count]').forEach(el => {
        animateCount(el, parseInt(el.dataset.count, 10));
      });
      initStudioAnalytics();
    }, 100);

    // Show upgrade popup for unpaid studio owners (only once per session)
    if (!appState.studioSubscribed && !appState._upgradePopupShown) {
      appState._upgradePopupShown = true;
      setTimeout(() => showStudioUpgradePopup(), 400);
    }
  }
  if (window.innerWidth <= 768) {
    document.getElementById('mainNav')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Exit edit mode if active, then re-init widget system for the new view
  exitEditMode();
  initWidgetSystem(view === 'studio' ? 'studio' : 'athlete');
}

function initViewSwitching() {
  // Placeholder for future tab extensions
}

// ── STRIPE CONFIG ─────────────────────────────────────────
const STRIPE_STUDIO_LINK = 'https://buy.stripe.com/dRm5kD2Tb1LbdBa7uc3oA0j'; // $549/mo
const STRIPE_LIFETIME_LINK = ''; // $2,000 one-time - needs Stripe link

function getStripeMonthlyLink() {
  const email = appState.user?.email || '';
  const base = STRIPE_STUDIO_LINK;
  return email ? base + '?prefilled_email=' + encodeURIComponent(email) : base;
}

function getStripeLifetimeLink() {
  const email = appState.user?.email || '';
  const base = STRIPE_LIFETIME_LINK;
  if (!base) return '#';
  return email ? base + '?prefilled_email=' + encodeURIComponent(email) : base;
}

// ── Avatar Helper ─────────────────────────────────────────
function setAvatar(el, user) {
  const pfp = user?.picture || user?.avatar_url || localStorage.getItem('bnco_pfp');
  if (pfp && el) {
    el.innerHTML = '<img src="' + pfp + '" alt="pfp" class="profile__avatar-img" referrerpolicy="no-referrer" />';
  } else if (el) {
    el.textContent = getInitials(user?.display_name || user?.name || '??');
  }
}

// ── Studio Pricing Modal ──────────────────────────────────
export function showStudioPricing() {
  document.getElementById('studioPricingModal')?.remove();

  const monthlyLink = getStripeMonthlyLink();
  const lifetimeLink = getStripeLifetimeLink();

  const modal = document.createElement('div');
  modal.id = 'studioPricingModal';
  modal.className = 'pricing-modal';
  modal.innerHTML = '<div class="pricing-modal__backdrop"></div>' +
    '<div class="pricing-modal__content">' +
    '<button class="pricing-modal__close" id="pricingClose">&times;</button>' +
    '<div class="pricing-modal__header">' +
    '<h2 class="pricing-modal__title">Unlock Your Studio Dashboard</h2>' +
    '<p class="pricing-modal__subtitle">Choose the plan that works for your studio</p>' +
    '</div>' +
    '<div class="pricing-modal__cards">' +
    '<div class="pricing-card">' +
    '<div class="pricing-card__badge">Popular</div>' +
    '<h3 class="pricing-card__name">Monthly</h3>' +
    '<div class="pricing-card__price">' +
    '<span class="pricing-card__amount">$549</span>' +
    '<span class="pricing-card__period">/month</span>' +
    '</div>' +
    '<ul class="pricing-card__features">' +
    '<li>Full Studio Dashboard access</li>' +
    '<li>Real-time member analytics</li>' +
    '<li>Studio Wars competitions</li>' +
    '<li>At-risk member alerts</li>' +
    '<li>Custom missions and challenges</li>' +
    '<li>Cancel anytime</li>' +
    '</ul>' +
    '<a href="' + monthlyLink + '" target="_blank" rel="noopener" class="btn btn--primary btn--full pricing-card__cta">Start Monthly</a>' +
    '</div>' +
    '<div class="pricing-card pricing-card--lifetime">' +
    '<div class="pricing-card__badge pricing-card__badge--save">Best Value</div>' +
    '<h3 class="pricing-card__name">Lifetime</h3>' +
    '<div class="pricing-card__price">' +
    '<span class="pricing-card__amount">$2,000</span>' +
    '<span class="pricing-card__period">one-time</span>' +
    '</div>' +
    '<div class="pricing-card__savings">Save $4,588+ vs. monthly over 12 months</div>' +
    '<ul class="pricing-card__features">' +
    '<li>Everything in Monthly</li>' +
    '<li>Pay once, access forever</li>' +
    '<li>Priority support</li>' +
    '<li>Early access to new features</li>' +
    '<li>Founding studio badge</li>' +
    '<li>No recurring charges ever</li>' +
    '</ul>' +
    '<a href="' + (lifetimeLink || '#') + '" target="_blank" rel="noopener" class="btn btn--primary btn--full pricing-card__cta" id="lifetimePurchaseBtn">' + (STRIPE_LIFETIME_LINK ? 'Get Lifetime Access' : 'Coming Soon') + '</a>' +
    '</div>' +
    '</div>' +
    '<p class="pricing-modal__note">All plans include a 7-day free trial. Cancel or switch anytime.</p>' +
    '</div>';

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('pricing-modal--visible'));

  document.getElementById('pricingClose')?.addEventListener('click', closePricingModal);
  modal.querySelector('.pricing-modal__backdrop')?.addEventListener('click', closePricingModal);
}

function closePricingModal() {
  const modal = document.getElementById('studioPricingModal');
  if (modal) {
    modal.classList.remove('pricing-modal--visible');
    setTimeout(() => modal.remove(), 400);
  }
}

// ── Role-Based Access Control ─────────────────────────────
function applyRoleAccess() {
  const role = appState.userRole;
  const navStudioBtn = document.getElementById('navStudio');
  const mobileStudioBtn = document.getElementById('mobileStudio');
  const studioView = document.getElementById('studioView');

  // Remove old CTA if present (re-inject fresh)
  document.getElementById('becomeStudioCta')?.remove();

  if (role === 'athlete') {
    // Athletes: hide studio toggle entirely
    navStudioBtn?.parentElement?.classList.add('toggle--athlete-only');
    mobileStudioBtn?.classList.add('mobile-tab--hidden');
    studioView?.classList.remove('view--active');
    // Make sure athlete view is showing
    document.getElementById('athleteView')?.classList.add('view--active');

    // "Become Studio Owner" CTA moved to Settings page
  } else if (role === 'studio_admin') {
    // Studio owners: show toggle, apply demo overlay if not subscribed
    navStudioBtn?.parentElement?.classList.remove('toggle--athlete-only');
    mobileStudioBtn?.classList.remove('mobile-tab--hidden');

    if (!appState.studioSubscribed) {
      injectDemoBanner();
      applyDemoOverlay();
    } else {
      removeDemoBanner();
      removeDemoOverlay();
    }

    // Restore saved view preference for studio admins
    const savedView = localStorage.getItem(VIEW_KEY);
    if (savedView === 'athlete' || savedView === 'studio') {
      switchView(savedView);
    } else {
      // Default studio owners to studio view
      switchView('studio');
    }
  }
}

// ── "Become a Studio Owner" CTA Injection ─────────────────
function injectBecomeStudioCTA() {
  if (document.getElementById('becomeStudioCta')) return;

  // Try to place it after the goals section
  const goalsSection = document.getElementById('goalsSection') || document.getElementById('goalsGrid')?.parentElement;
  const target = goalsSection || document.getElementById('athleteView');
  if (!target) return;

  const cta = document.createElement('div');
  cta.className = 'become-studio-cta';
  cta.id = 'becomeStudioCta';
  cta.innerHTML = `
    <div class="become-studio-cta__icon">🏢</div>
    <div class="become-studio-cta__text">
      <div class="become-studio-cta__title">Own a studio?</div>
      <div class="become-studio-cta__desc">Unlock the Studio Dashboard to manage your community</div>
    </div>
    <button class="btn btn--outline btn--sm" id="becomeStudioBtn">Get Started</button>
  `;

  // Append inside the goals section area or athlete view
  if (goalsSection) {
    goalsSection.appendChild(cta);
  } else {
    target.appendChild(cta);
  }

  // Bind click handler
  document.getElementById('becomeStudioBtn')?.addEventListener('click', () => {
    showOnboarding(handleStudioUpgradeComplete, 'studio_admin');
  });
}

async function handleStudioUpgradeComplete(data) {
  // Upgrade role from athlete to studio_admin
  appState.userRole = 'studio_admin';
  localStorage.setItem(ROLE_KEY, 'studio_admin');
  const cached = getCachedUser() || {};
  cached.role = 'studio_admin';
  setCachedUser(cached);

  // They're a real athlete too now with both roles - no more demo data
  appState.usingDemoData = false;

  // Refresh profile
  const profileResult = await getProfile();
  if (profileResult.ok) {
    appState.user = profileResult.data;
    appState.studioSubscribed = profileResult.data?.studio_subscribed || false;
  }

  // Reload all data with real tracking
  await loadAppData();

  // Apply new role access and switch to studio view
  applyRoleAccess();
  switchView('studio');
}

// ── Studio Demo Banner (persistent top bar in studio view) ──
function injectDemoBanner() {
  if (document.getElementById('studioDemoBanner')) return;

  const banner = document.createElement('div');
  banner.id = 'studioDemoBanner';
  banner.className = 'studio-demo-banner';
  banner.innerHTML = `
    <div class="studio-demo-banner__content">
      <span class="studio-demo-banner__icon">&#128274;</span>
      <span class="studio-demo-banner__text">You're viewing a demo of the Studio Dashboard</span>
      <button class="btn btn--primary btn--sm studio-demo-banner__cta" id="demoBannerBuyBtn">
        View Pricing
      </button>
    </div>
  `;

  const studioView = document.getElementById('studioView');
  if (studioView) {
    studioView.insertBefore(banner, studioView.firstChild);
  }

  document.getElementById('demoBannerBuyBtn')?.addEventListener('click', () => showStudioPricing());
}

function removeDemoBanner() {
  document.getElementById('studioDemoBanner')?.remove();
}

// ── Demo Overlay (blocks editing on studio view) ──────────
function applyDemoOverlay() {
  const studioView = document.getElementById('studioView');
  if (!studioView) return;

  studioView.classList.add('studio-view--demo');

  // Disable all form inputs, buttons (except buy buttons), selects, toggles
  studioView.querySelectorAll('input, select, textarea').forEach(el => {
    el.disabled = true;
    el.style.opacity = '0.6';
    el.style.pointerEvents = 'none';
  });

  studioView.querySelectorAll('button[type="submit"], .btn--primary:not(.studio-demo-banner__cta)').forEach(el => {
    if (el.closest('.studio-demo-banner')) return;
    el.disabled = true;
    el.style.opacity = '0.5';
    el.style.pointerEvents = 'none';
  });

  // Add "DEMO" watermark to each card
  studioView.querySelectorAll('.card').forEach(card => {
    if (card.querySelector('.demo-watermark')) return;
    const watermark = document.createElement('div');
    watermark.className = 'demo-watermark';
    watermark.textContent = 'DEMO';
    card.style.position = 'relative';
    card.appendChild(watermark);
  });
}

function removeDemoOverlay() {
  const studioView = document.getElementById('studioView');
  if (!studioView) return;

  studioView.classList.remove('studio-view--demo');

  studioView.querySelectorAll('input, select, textarea').forEach(el => {
    el.disabled = false;
    el.style.opacity = '';
    el.style.pointerEvents = '';
  });

  studioView.querySelectorAll('button[type="submit"], .btn--primary').forEach(el => {
    el.disabled = false;
    el.style.opacity = '';
    el.style.pointerEvents = '';
  });

  studioView.querySelectorAll('.demo-watermark').forEach(w => w.remove());
}

// ── Studio Upgrade Popup ──────────────────────────────────
function showStudioUpgradePopup() {
  if (document.getElementById('studioUpgradePopup')) return;

  const popup = document.createElement('div');
  popup.id = 'studioUpgradePopup';
  popup.className = 'studio-upgrade-popup';
  popup.innerHTML = `
    <div class="studio-upgrade-popup__backdrop"></div>
    <div class="studio-upgrade-popup__card">
      <button class="studio-upgrade-popup__close" id="upgradePopupClose" aria-label="Close">&times;</button>
      <div class="studio-upgrade-popup__icon">🏢</div>
      <h2 class="studio-upgrade-popup__title">Unlock Your Studio Dashboard</h2>
      <p class="studio-upgrade-popup__desc">
        Get full access to real-time member analytics, studio challenges,
        at-risk member alerts, mission creator, leaderboard controls, and city rankings.
      </p>
      <ul class="studio-upgrade-popup__features">
        <li>📊 Real-time member analytics and bnco scores</li>
        <li>🏟️ Studio vs Studio precision wars</li>
        <li>⚠️ At-risk member detection and alerts</li>
        <li>🎯 Custom studio missions and challenges</li>
        <li>🏆 City and regional studio rankings</li>
        <li>🔧 Leaderboard weighting controls</li>
      </ul>
      <a href="#" class="btn btn--primary btn--full studio-upgrade-popup__buy" id="upgradePopupBuy">
        View Pricing Options
      </a>
      <p class="studio-upgrade-popup__note">Cancel anytime. No setup fees.</p>
    </div>
  `;

  document.body.appendChild(popup);

  // Animate in
  requestAnimationFrame(() => popup.classList.add('studio-upgrade-popup--visible'));

  // Close handlers
  document.getElementById('upgradePopupClose')?.addEventListener('click', closeStudioUpgradePopup);
  popup.querySelector('.studio-upgrade-popup__backdrop')?.addEventListener('click', closeStudioUpgradePopup);

  // Buy button opens pricing modal
  document.getElementById('upgradePopupBuy')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeStudioUpgradePopup();
    setTimeout(() => showStudioPricing(), 300);
  });
}

function closeStudioUpgradePopup() {
  const popup = document.getElementById('studioUpgradePopup');
  if (!popup) return;
  popup.classList.remove('studio-upgrade-popup--visible');
  setTimeout(() => popup.remove(), 400);
}

// ── Leaderboard ───────────────────────────────────────────
function initLeaderboard() {
  const tabs = document.querySelectorAll('.lb-tab');
  const liveIndicator = document.getElementById('lbLive');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('lb-tab--active'));
      tab.classList.add('lb-tab--active');
      const scope = tab.dataset.scope;

      if (appState.usingDemoData) {
        renderLeaderboard(scope, generateLeaderboardData(scope));
      } else {
        loadLeaderboardData(scope);
      }

      if (liveIndicator) {
        liveIndicator.style.display = scope === 'class' ? 'flex' : 'none';
      }
    });
  });

  if (appState.usingDemoData) {
    renderLeaderboard('class', generateLeaderboardData('class'));
  }
}

function renderLeaderboard(scope, data) {
  const podium = document.getElementById('lbPodium');
  const table = document.getElementById('lbTable');

  hideLoadingStates();

  // Update podium
  if (podium && data.length >= 3) {
    const top3 = data.slice(0, 3);
    const podiumItems = podium.querySelectorAll('.lb__podium-item');
    const podiumOrder = [1, 0, 2];
    podiumItems.forEach((item, i) => {
      const d = top3[podiumOrder[i]];
      if (!d) return;
      item.querySelector('.lb__podium-avatar').textContent = d.initials;
      item.querySelector('.lb__podium-name').textContent = d.name;
      item.querySelector('.lb__podium-score').textContent = d.score;
    });
  }

  // Render table rows (ranks 4+)
  if (table) {
    const rows = data.slice(3).map(d => {
      const changeClass = (d.change + '').startsWith('+') ? 'lb__change--up'
        : (d.change + '').startsWith('-') ? 'lb__change--down'
          : 'lb__change--same';
      const changeIcon = (d.change + '').startsWith('+') ? '↑' : (d.change + '').startsWith('-') ? '↓' : '';

      return `
        <div class="lb__row ${d.isYou ? 'lb__row--you' : ''}">
          <div class="lb__rank">${d.rank}</div>
          <div class="lb__avatar">${d.initials}</div>
          <div class="lb__name">${d.name}${d.isYou ? ' (You)' : ''}</div>
          <div class="lb__score">${d.score}</div>
          <div class="lb__change ${changeClass}">${changeIcon} ${d.change}</div>
        </div>
      `;
    }).join('');
    table.innerHTML = rows;
  }
}

// ── Ghost Racing ──────────────────────────────────────────
function initGhostRacing() {
  const ghostBar = document.getElementById('ghostBar');
  const youBar = document.getElementById('youBar');
  const minutesContainer = document.getElementById('ghostMinutes');

  if (ghostBar) ghostBar.setAttribute('data-label', 'Ghost - 68.2 RES');
  if (youBar) youBar.setAttribute('data-label', 'You - 71.4 RES');

  if (minutesContainer) {
    const minutes = [0, 5, 10, 15, 20, 25, 30];
    minutesContainer.innerHTML = minutes.map(m => `<span>${m} min</span>`).join('');
  }

  let frame = 0;
  function animateGhost() {
    frame++;
    const youWidth = 72 + Math.sin(frame * 0.03) * 2;
    const ghostWidth = 66 + Math.sin(frame * 0.025 + 1) * 1.5;
    if (youBar) youBar.style.width = youWidth + '%';
    if (ghostBar) ghostBar.style.width = ghostWidth + '%';
    requestAnimationFrame(animateGhost);
  }
  animateGhost();
}

// ── Achievements ──────────────────────────────────────────
function initAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;

  grid.innerHTML = ACHIEVEMENTS.map(a => `
    <div class="achievement ${a.earned ? 'achievement--earned' : 'achievement--locked'}">
      <div class="achievement__icon">${a.icon}</div>
      <div class="achievement__name">${a.name}</div>
      <div class="achievement__desc">${a.desc}</div>
    </div>
  `).join('');
}

// ── Studio Missions ───────────────────────────────────────
function initMissions() {
  const list = document.getElementById('missionsList');
  if (!list) return;
  renderMissions(list);
}

function renderMissions(list) {
  list.innerHTML = MISSIONS.map(m => {
    const pct = Math.min((m.current / m.target) * 100, 100).toFixed(0);
    return `
      <div class="mission-item">
        <div class="mission-item__header">
          <div class="mission-item__name">${m.name}</div>
          <div class="mission-item__badge mission-item__badge--active">Active</div>
        </div>
        <div class="mission-item__progress-track">
          <div class="mission-item__progress-fill" style="width: ${pct}%"></div>
        </div>
        <div class="mission-item__meta">
          <span>${m.current.toLocaleString()} / ${m.target.toLocaleString()} ${m.metric}</span>
          <span>${pct}%</span>
        </div>
      </div>
    `;
  }).join('');
}

// ── Studio Analytics ──────────────────────────────────────
function initStudioAnalytics() {
  const chart = document.getElementById('analyticsChart');
  if (!chart) return;

  const maxScore = Math.max(...STUDIO_RANKINGS.map(s => s.score));

  chart.innerHTML = STUDIO_RANKINGS.map((s, i) => {
    const width = (s.score / maxScore * 100).toFixed(1);
    const fillClass = s.isYou ? 'analytics-bar__fill--you'
      : i === 0 ? 'analytics-bar__fill--1st'
        : i === 1 ? 'analytics-bar__fill--2nd'
          : 'analytics-bar__fill--3rd';

    return `
      <div class="analytics-bar">
        <div class="analytics-bar__rank">#${i + 1}</div>
        <div class="analytics-bar__label">${s.name}${s.isYou ? ' ★' : ''}</div>
        <div class="analytics-bar__track">
          <div class="analytics-bar__fill ${fillClass}" style="width: ${width}%">${s.score}</div>
        </div>
      </div>
    `;
  }).join('');

  setTimeout(() => {
    chart.querySelectorAll('.analytics-bar__fill').forEach(bar => {
      bar.style.width = bar.style.width;
    });
  }, 200);
}

// ── System Controls ───────────────────────────────────────
function initSystemControls() {
  const controls = document.querySelectorAll('.control-item input[type="checkbox"]');

  controls.forEach(ctrl => {
    ctrl.addEventListener('change', () => {
      recalculateWeights();
    });
  });
}

function recalculateWeights() {
  const controls = document.querySelectorAll('.control-item input[type="checkbox"]');
  const active = [];
  controls.forEach(c => {
    if (c.checked) active.push(c.dataset.metric);
  });

  if (active.length === 0) {
    controls.forEach(c => { c.checked = true; });
    recalculateWeights();
    return;
  }

  const defaultWeights = { strain: 35, hr: 25, steps: 20, recovery: 20 };
  const totalDefault = active.reduce((s, m) => s + defaultWeights[m], 0);

  const ids = { strain: 'weightStrain', hr: 'weightHR', steps: 'weightSteps', recovery: 'weightRecovery' };

  Object.entries(ids).forEach(([metric, elId]) => {
    const el = document.getElementById(elId);
    if (el) {
      if (active.includes(metric)) {
        el.textContent = Math.round(defaultWeights[metric] / totalDefault * 100) + '%';
      } else {
        el.textContent = '0%';
      }
    }
  });
}

// ── Mission Form ──────────────────────────────────────────
function initMissionForm() {
  const form = document.getElementById('missionForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('missionName')?.value;
    const metric = document.getElementById('missionMetric')?.value;
    const target = parseInt(document.getElementById('missionTarget')?.value, 10);
    const start = document.getElementById('missionStart')?.value;
    const end = document.getElementById('missionEnd')?.value;

    if (!name || !target) return;

    MISSIONS.unshift({
      name,
      metric: metric.charAt(0).toUpperCase() + metric.slice(1),
      target,
      current: 0,
      startDate: start || '2026-02-26',
      endDate: end || '2026-03-26',
    });

    const list = document.getElementById('missionsList');
    if (list) renderMissions(list);

    form.reset();

    setTimeout(() => {
      const firstMission = list?.querySelector('.mission-item');
      if (firstMission) {
        firstMission.style.boxShadow = '0 0 20px rgba(201,168,124,0.3)';
        setTimeout(() => { firstMission.style.boxShadow = ''; }, 1500);
      }
    }, 50);
  });
}

// ── BTL Integration ───────────────────────────────────────
function initBTL() {
  const demo = runBTLDemo(32);
  const result = demo.whoop;

  const vibeEl = document.getElementById('btlVibeScore');
  if (vibeEl && result.vibeScore != null) {
    vibeEl.textContent = result.vibeScore.toFixed(1);
  }

  const providerNameEl = document.getElementById('btlProviderName');
  if (providerNameEl) {
    providerNameEl.textContent = (result.provider || 'WHOOP').toUpperCase();
  }

  const badgeEl = document.getElementById('btlActivityBadge');
  if (badgeEl && result.activityType) {
    badgeEl.textContent = result.activityType.isPilates
      ? result.activityType.label
      : result.activityType.label + ' (0.8x)';
    badgeEl.className = 'btl__badge' + (result.activityType.isGeneric ? ' btl__badge--generic' : '');
  }

  const cats = [
    { key: 'power', barId: 'btlPowerBar', valId: 'btlPower' },
    { key: 'flow', barId: 'btlFlowBar', valId: 'btlFlow' },
    { key: 'grit', barId: 'btlGritBar', valId: 'btlGrit' },
    { key: 'zen', barId: 'btlZenBar', valId: 'btlZen' },
  ];

  cats.forEach(({ key, barId, valId }) => {
    const val = result[key];
    const barEl = document.getElementById(barId);
    const valEl = document.getElementById(valId);

    if (val != null) {
      if (valEl) valEl.textContent = val.toFixed(1);
      if (barEl) {
        barEl.style.width = '0%';
        setTimeout(() => { barEl.style.width = Math.round(val) + '%'; }, 100);
      }
    } else {
      if (valEl) valEl.textContent = '-';
      if (barEl) barEl.style.width = '0%';
    }
  });

  const bonusesEl = document.getElementById('btlBonuses');
  if (bonusesEl && result.bonuses.length > 0) {
    bonusesEl.innerHTML = result.bonuses.map(b => {
      const cls = b.type === 'precision_power' ? 'btl__bonus-tag--positive' : 'btl__bonus-tag--penalty';
      const prefix = b.bonus ? `+${b.bonus}` : `${b.multiplier}x`;
      return `<span class="btl__bonus-tag ${cls}">${prefix} ${b.reason}</span>`;
    }).join('');
  }

  hideLoadingStates();
}

// ── Scroll Reveal ─────────────────────────────────────────
function initScrollReveal() {
  // Only add reveal animations to landing page sections
  // App sections use app-animate class triggered after data loads
  const allRevealElements = document.querySelectorAll('#landing .reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
      }
    });
  }, { threshold: 0.1 });

  allRevealElements.forEach(s => observer.observe(s));
}

// ── App Entrance Animations ──────────────────────────────
function triggerAppAnimations() {
  // Add app-animate class to nav
  const nav = document.querySelector('.app-nav');
  if (nav) nav.classList.add('app-animate');

  // Add to profile section (immediate)
  const profileSection = document.getElementById('profileSection');
  if (profileSection) profileSection.classList.add('app-animate');

  // Add to remaining sections with a slight cascade
  const sections = [
    'leaderboardSection',
    'ghostSection',
    'achievementsSection',
    'goalsSection',
    'settingsSection',
  ];

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('app-animate');
  });

  // Animate bnco Score gauge stroke
  requestAnimationFrame(() => {
    const gaugeCircle = document.querySelector('.bnco-score__gauge-circle');
    if (gaugeCircle) {
      const circumference = parseFloat(gaugeCircle.getAttribute('stroke-dasharray')) || 282;
      gaugeCircle.style.setProperty('--gauge-circumference', circumference);
    }
  });
}

// ── Landing Scroll Reveal (for landing page sections) ─────
function initLandingScrollReveal() {
  const landingRevealElements = document.querySelectorAll('#landing .reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
      }
    });
  }, { threshold: 0.1 });

  landingRevealElements.forEach(el => observer.observe(el));
}

// ── Card Ripple Hover Effect ──────────────────────────────
function initCardRipple() {
  const cards = document.querySelectorAll('.landing__value-card, .landing__testimonial-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
    });
  });
}

// ── bnco Score Section ────────────────────────────────────
function initBncoScore() {
  // Try to load REAL data from the API first
  loadRealBncoScore().then(loaded => {
    if (!loaded) {
      // Fall back to demo data
      renderBncoScoreGauge(
        DEMO_BNCO_SCORE.controlScore,
        DEMO_BNCO_SCORE.stillnessIndex,
        DEMO_BNCO_SCORE.respiratoryEfficiency
      );
    }
  });
}

async function loadRealBncoScore() {
  try {
    const statsResult = await getMyStats();
    if (!statsResult.ok || !statsResult.data?.stats) return false;

    const stats = statsResult.data.stats;
    const workoutsResult = await getMyWorkouts({ limit: 1 });

    // We need at least an avg_bnco_score to show real data
    if (stats.avg_bnco_score == null && stats.total_workouts == 0) return false;

    const controlVal = parseInt(stats.avg_control) || 0;
    const stillnessVal = parseInt(stats.avg_stillness) || 0;
    const respiratoryVal = parseInt(stats.avg_respiratory) || 0;

    renderBncoScoreGauge(controlVal, stillnessVal, respiratoryVal);

    // Update "Last workout" display if we have workout data
    if (workoutsResult.ok && workoutsResult.data?.workouts?.length > 0) {
      const lastWorkout = workoutsResult.data.workouts[0];
      const lastWorkoutEl = document.getElementById('lastWorkoutInfo');
      if (lastWorkoutEl && lastWorkout.recorded_at) {
        const date = new Date(lastWorkout.recorded_at);
        const sourceIcon = lastWorkout.source === 'whoop' ? '🟢' : lastWorkout.source === 'apple_watch' ? '⌚' : '📱';
        lastWorkoutEl.innerHTML = `${sourceIcon} Last workout: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - Score: <strong>${lastWorkout.bnco_score || '--'}</strong>`;
        lastWorkoutEl.style.display = '';
      }
    }

    appState.usingDemoData = false;
    return true;
  } catch {
    return false;
  }
}

function renderBncoScoreGauge(controlVal, stillnessVal, respiratoryVal) {
  const composite = Math.round(controlVal * 0.4 + stillnessVal * 0.35 + respiratoryVal * 0.25);

  // Animate gauge
  const gaugeEl = document.getElementById('bncoGaugeFill');
  const scoreValueEl = document.getElementById('bncoScoreValue');
  if (gaugeEl) {
    const circumference = 2 * Math.PI * 58;
    gaugeEl.style.strokeDasharray = circumference;
    gaugeEl.style.strokeDashoffset = circumference;
    setTimeout(() => {
      const offset = circumference - (composite / 100) * circumference;
      gaugeEl.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
      gaugeEl.style.strokeDashoffset = offset;
    }, 300);
  }

  // Animate score number
  if (scoreValueEl) {
    animateCountTo(scoreValueEl, composite, 1500);
  }

  // Breakdown bars
  const metrics = [
    { id: 'bncoControl', barId: 'bncoControlBar', val: controlVal },
    { id: 'bncoStillness', barId: 'bncoStillnessBar', val: stillnessVal },
    { id: 'bncoRespiratory', barId: 'bncoRespiratoryBar', val: respiratoryVal },
  ];

  metrics.forEach(m => {
    const valEl = document.getElementById(m.id);
    const barEl = document.getElementById(m.barId);
    if (valEl) valEl.textContent = m.val;
    if (barEl) {
      setTimeout(() => { barEl.style.width = m.val + '%'; }, 400);
    }
  });
}

function animateCountTo(el, target, duration) {
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── Goals Section ─────────────────────────────────────────
function initGoals() {
  renderGoals();
  initGoalForm();
}

function renderGoals() {
  const grid = document.getElementById('goalsGrid');
  if (!grid) return;

  grid.innerHTML = PERSONAL_GOALS.map(g => {
    const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
    return `
      <div class="card card--goal">
        <div class="goal__header">
          <span class="goal__icon">${g.icon}</span>
          <span class="goal__label">${g.label}</span>
          <span class="goal__pct">${pct}%</span>
        </div>
        <div class="goal__progress-track">
          <div class="goal__progress-fill" style="width: ${pct}%"></div>
        </div>
        <div class="goal__meta">
          <span>${g.current} / ${g.target}</span>
        </div>
      </div>
    `;
  }).join('');
}

function initGoalForm() {
  const form = document.getElementById('personalGoalForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('goalType')?.value;
    const target = parseInt(document.getElementById('goalTarget')?.value, 10);
    if (!type || !target || target <= 0) return;

    const labels = {
      weekly_classes: 'Weekly Classes',
      target_bnco: 'Target bnco Score',
      streak: 'Day Streak',
    };
    const icons = {
      weekly_classes: '📅',
      target_bnco: '🎯',
      streak: '🔥',
    };

    PERSONAL_GOALS.push({
      type,
      label: labels[type] || type,
      target,
      current: 0,
      icon: icons[type] || '⭐',
    });

    renderGoals();
    form.reset();
  });
}

// ── Studio Challenges (Athlete Leaderboard) ───────────────
function initStudioChallenges() {
  const container = document.getElementById('studioChallengeMatchups');
  if (!container) return;

  container.innerHTML = DEMO_STUDIO_CHALLENGES.map(ch => {
    const homeWinning = ch.homeScore > ch.awayScore;
    return `
      <div class="studio-challenge__matchup">
        <div class="studio-challenge__team ${homeWinning ? 'studio-challenge__team--winning' : ''}">
          <span class="studio-challenge__team-name">${ch.home}</span>
          <span class="studio-challenge__team-score">${ch.homeScore}</span>
        </div>
        <div class="studio-challenge__vs">vs</div>
        <div class="studio-challenge__team ${!homeWinning ? 'studio-challenge__team--winning' : ''}">
          <span class="studio-challenge__team-name">${ch.away}</span>
          <span class="studio-challenge__team-score">${ch.awayScore}</span>
        </div>
        <div class="studio-challenge__status studio-challenge__status--${ch.status}">${ch.status === 'live' ? '🔴 Live' : '✓ Completed'}</div>
      </div>
    `;
  }).join('');
}

// ── Studio War Room ───────────────────────────────────────
function initStudioWarRoom() {
  renderStudioWars();
  renderAtRiskMembers();
  bindCreateChallenge();
}

function renderStudioWars() {
  const list = document.getElementById('studioWarsList');
  if (!list) return;

  list.innerHTML = DEMO_STUDIO_WARS.map(w => {
    const winning = w.status === 'winning';
    return `
      <div class="studio-war__item">
        <div class="studio-war__header">
          <span class="studio-war__opponent">${w.opponent}</span>
          <span class="studio-war__badge studio-war__badge--${w.status}">${winning ? '✓ Winning' : '⚠ Behind'}</span>
        </div>
        <div class="studio-war__scores">
          <div class="studio-war__score">
            <span class="studio-war__score-label">Your Avg</span>
            <span class="studio-war__score-value ${winning ? 'studio-war__score-value--winning' : ''}">${w.yourAvg}</span>
          </div>
          <span class="studio-war__vs">vs</span>
          <div class="studio-war__score">
            <span class="studio-war__score-label">Their Avg</span>
            <span class="studio-war__score-value ${!winning ? 'studio-war__score-value--winning' : ''}">${w.theirAvg}</span>
          </div>
        </div>
        <div class="studio-war__ends">Ends in ${w.endsIn}</div>
      </div>
    `;
  }).join('');
}

function renderAtRiskMembers() {
  const list = document.getElementById('atRiskList');
  if (!list) return;

  list.innerHTML = DEMO_AT_RISK.map(m => `
    <div class="at-risk__item at-risk__item--${m.severity}">
      <div class="at-risk__avatar">${m.initials}</div>
      <div class="at-risk__info">
        <div class="at-risk__name">${m.name}</div>
        <div class="at-risk__reason">${m.reason}</div>
      </div>
      ${m.recovery != null ? `<div class="at-risk__recovery">${m.recovery}% recovery</div>` : ''}
      <button type="button" class="btn btn--outline btn--sm at-risk__action" data-member="${m.name}">Check In</button>
    </div>
  `).join('');

  list.querySelectorAll('.at-risk__action').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = '✓ Sent';
      btn.disabled = true;
      btn.classList.add('btn--connected');
    });
  });
}

function bindCreateChallenge() {
  const btn = document.getElementById('createChallengeBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const opponent = prompt('Enter opponent studio name:');
    if (!opponent || !opponent.trim()) return;

    DEMO_STUDIO_WARS.unshift({
      opponent: opponent.trim(),
      yourAvg: parseFloat((65 + Math.random() * 15).toFixed(1)),
      theirAvg: parseFloat((65 + Math.random() * 15).toFixed(1)),
      status: 'winning',
      endsIn: '7 days',
    });

    renderStudioWars();
  });
}
