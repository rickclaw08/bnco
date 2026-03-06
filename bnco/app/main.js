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
  updateUserProfile,
  createStudio,
  getJoinCode,
  joinByCode,
  getStudioMembers,
  getTeamGoalsAPI,
  createTeamGoal,
  deleteTeamGoal,
  completeOnboarding,
  setMood,
  getStudioMoods,
  likeMood,
  unlikeMood,
  createPost,
  getFeed,
  getPost,
  likePost,
  unlikePost,
  commentOnPost,
  deletePost,
  uploadImage,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
  getMyFriends,
  getUserFriends,
  getNotifications,
  markNotificationsRead,
  searchUsers,
  getUserProfile,
  updatePrivacy,
  connectSSE,
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

// ── HTML Sanitization ─────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
  { id: 'first_class', icon: '🏋️', name: 'First Class', desc: 'Complete your first tracked class', earned: false },
  { id: 'three_day_streak', icon: '🔥', name: '3-Day Streak', desc: 'Attend 3 days in a row', earned: false },
  { id: 'week_streak', icon: '🔥', name: 'Week Warrior', desc: '7-day attendance streak', earned: false },
  { id: 'month_streak', icon: '💎', name: 'Monthly Grind', desc: '30-day attendance streak', earned: false },
  { id: 'beat_yourself', icon: '👻', name: 'Beat Your Best', desc: 'Improve on your previous bnco score', earned: false },
  { id: 'perfect_week', icon: '⭐', name: 'Perfect Week', desc: 'Track workouts 7 days straight', earned: false },
  { id: 'studio_joined', icon: '📍', name: 'Home Studio', desc: 'Join a studio community', earned: false },
  { id: 'wearable_linked', icon: '⌚', name: 'Connected', desc: 'Link a WHOOP or Apple Watch', earned: false },
  { id: 'team_goal', icon: '🎯', name: 'Team Player', desc: 'Contribute to a studio team goal', earned: false },
  { id: 'century', icon: '💯', name: 'Century Club', desc: 'Reach a bnco score of 100', earned: false },
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
  // No fake data. Return empty or just the current user with zero score.
  const user = appState.user;
  if (user) {
    return [{
      name: user.display_name || user.name || 'You',
      initials: getInitials(user.display_name || user.name || 'You'),
      score: 0,
      change: '-',
      isYou: true,
      rank: 1,
    }];
  }
  return [];
}

const DEMO_MISSIONS = [];

const STUDIO_RANKINGS = [];

// ── Mutable missions list for demo form ───────────────────
let MISSIONS = [];

// ── Personal Goals ────────────────────────────────────────
// ── Personal Goals (persisted to localStorage) ────────────
const PERSONAL_GOALS_KEY = 'bnco_personal_goals';

function getPersonalGoals() {
  try {
    return JSON.parse(localStorage.getItem(PERSONAL_GOALS_KEY) || '[]');
  } catch { return []; }
}

function savePersonalGoals(goals) {
  localStorage.setItem(PERSONAL_GOALS_KEY, JSON.stringify(goals));
}

// ── bnco Score Data ───────────────────────────────────────
// Real scoring based on WHOOP + Apple Watch APIs:
// Effort Score (40%): WHOOP workout strain (0-21 mapped to 0-100) + HR zone distribution
// Consistency Score (35%): Attendance streak * frequency multiplier
// Recovery Score (25%): WHOOP recovery_score (0-100%)
const DEMO_BNCO_SCORE = {
  controlScore: 0,   // Effort Score (from WHOOP strain + zones)
  stillnessIndex: 0,  // Consistency Score (from attendance tracking)
  respiratoryEfficiency: 0,  // Recovery Score (from WHOOP recovery)
};

// ── Studio Challenge Data ─────────────────────────────────
const DEMO_STUDIO_CHALLENGES = [];

// ── Studio Wars ───────────────────────────────────────────
const DEMO_STUDIO_WARS = [];

// ── At Risk Members ───────────────────────────────────────
const DEMO_AT_RISK = [];

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
    appState.studioSubscribed = authState.user?.studio_subscribed || localStorage.getItem('bnco_studio_subscribed') === 'true';
    // Always trust server role if available
    if (authState.user?.role) {
      appState.userRole = authState.user.role;
    }
    // Persist role to localStorage
    localStorage.setItem(ROLE_KEY, appState.userRole);
    appState.usingDemoData = false;
    hideDemoBanner();

    // Initialize app UI
    initAppUI();
    applyRoleAccess();

    if (authState.needsOnboarding) {
      // Check if returning user already has a role set
      const savedRole = localStorage.getItem(ROLE_KEY);
      const serverRole = authState.user?.role;
      if (serverRole && serverRole !== 'athlete') {
        // Server knows their role, silently complete onboarding
        completeOnboarding({ role: serverRole }).catch(() => {});
        appState.userRole = serverRole;
        localStorage.setItem(ROLE_KEY, serverRole);
        await loadAppData();
      } else if (savedRole && savedRole !== 'athlete') {
        // Returning user with saved role, silently complete onboarding
        completeOnboarding({ role: savedRole }).catch(() => {});
        appState.userRole = savedRole;
        localStorage.setItem(ROLE_KEY, savedRole);
        await loadAppData();
      } else {
        showOnboarding(handleOnboardingComplete);
      }
    } else {
      await loadAppData();
    }
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
    appState.studioSubscribed = user?.studio_subscribed || localStorage.getItem('bnco_studio_subscribed') === 'true';
    // Always trust server role
    if (user?.role) {
      appState.userRole = user.role;
    }
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
      const savedRole = localStorage.getItem(ROLE_KEY);
      const serverRole = user?.role;
      if (serverRole && serverRole !== 'athlete') {
        // Server knows their role, skip onboarding
        completeOnboarding({ role: serverRole }).catch(() => {});
        appState.userRole = serverRole;
        localStorage.setItem(ROLE_KEY, serverRole);
        await loadAppData();
      } else if (savedRole && savedRole !== 'athlete') {
        // Returning user with saved role
        completeOnboarding({ role: savedRole }).catch(() => {});
        appState.userRole = savedRole;
        localStorage.setItem(ROLE_KEY, savedRole);
        await loadAppData();
      } else {
        showOnboarding(handleOnboardingComplete);
      }
    } else {
      await loadAppData();
    }
  });

  window.addEventListener('bnco:auth-required', () => {
    appState.user = null;
    appState.usingDemoData = true;
    appState.studioSubscribed = false;
    // Clear ALL BNCO-related localStorage keys on logout
    const bncoKeys = [
      'bnco_user_role', 'bnco_current_view', 'bnco_pfp',
      'bnco_studio_subscribed', 'bnco_auth_token', 'bnco_refresh_token',
      'bnco_user', 'bnco_athlete_layout', 'bnco_studio_layout',
      'bnco_theme', 'bnco_leaderboard_visible',
    ];
    bncoKeys.forEach(k => localStorage.removeItem(k));
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
  initCommunity();
  initMobileTabBar();
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
  initSocialFeatures();

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
    // Persist role to backend API
    updateUserProfile({ role: data.role }).catch(() => {});
  }

  // Try to refresh profile from API
  const profileResult = await getProfile();
  if (profileResult.ok) {
    appState.user = profileResult.data;
    appState.studioId = profileResult.data?.studio_id || appState.studioId;
    appState.studioSubscribed = profileResult.data?.studio_subscribed || localStorage.getItem('bnco_studio_subscribed') === 'true';
    if (profileResult.data?.studio_subscribed) localStorage.setItem('bnco_studio_subscribed', 'true');
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

// ── Demo Data Indicator Banner ────────────────────────────
function showDemoBanner() {
  if (document.getElementById('demoDataBanner')) return;
  const app = document.getElementById('app');
  if (!app) return;
  const banner = document.createElement('div');
  banner.id = 'demoDataBanner';
  banner.style.cssText = 'background:#7C9082;color:#fff;text-align:center;padding:8px 16px;font-size:0.85rem;font-family:DM Sans,sans-serif;position:sticky;top:0;z-index:9999;';
  banner.textContent = 'Demo Data - Sign in for your real stats';
  app.insertBefore(banner, app.firstChild);
}

function hideDemoBanner() {
  document.getElementById('demoDataBanner')?.remove();
}

// ── Load Demo Data (Fallback) ─────────────────────────────
function loadDemoData() {
  loadDemoProfile();
  renderLeaderboard('class', generateLeaderboardData('class'));
  MISSIONS = [];
  const list = document.getElementById('missionsList');
  if (list) list.innerHTML = '<div style="color: var(--text-muted, #888); text-align: center; padding: 20px;">No data yet. Connect a wearable to start tracking.</div>';
  initStudioAnalytics();
  initBTL();
}

function loadDemoStats() {
  // Zero state - no data tracked yet
  const scoreEl = document.getElementById('resScore');
  const trendEl = document.getElementById('resTrend');
  if (scoreEl) scoreEl.textContent = '--';
  if (trendEl) { trendEl.textContent = ''; trendEl.className = 'res__trend'; }

  const streakCount = document.querySelector('#vibeStreak .profile__streak-count');
  const weekCount = document.querySelector('#perfectWeek .profile__streak-count');
  if (streakCount) streakCount.textContent = '0 Days';
  if (weekCount) weekCount.textContent = '0/7';
}

function loadDemoProfile() {
  // Show demo data indicator
  showDemoBanner();

  // Zero state profile
  const nameEl = document.querySelector('.profile__name');
  const avatarEl = document.querySelector('.profile__avatar');
  const levelBadge = document.getElementById('levelBadge');
  const levelNum = document.querySelector('.profile__level-num');
  const xpFill = document.getElementById('xpBarFill');
  const xpCurrent = document.getElementById('xpCurrent');
  const xpNext = document.getElementById('xpNext');

  if (nameEl) nameEl.textContent = appState.user?.display_name || appState.user?.name || 'Athlete';
  setAvatar(avatarEl, appState.user);
  if (levelBadge) levelBadge.textContent = 'RECRUIT';
  if (levelNum) levelNum.textContent = 'Level 1';
  if (xpFill) xpFill.style.width = '0%';
  if (xpCurrent) xpCurrent.textContent = '0';
  if (xpNext) xpNext.textContent = '100';

  // Nav user
  const navLevel = document.getElementById('navLevel');
  const navAvatar = document.getElementById('navAvatar');
  if (navLevel) navLevel.textContent = 'Lv. 1';
  setAvatar(navAvatar, appState.user);

  // Streaks - zero
  const streakCount = document.querySelector('#vibeStreak .profile__streak-count');
  const weekCount = document.querySelector('#perfectWeek .profile__streak-count');
  if (streakCount) streakCount.textContent = '0 Days';
  if (weekCount) weekCount.textContent = '0/7';

  // RES card - zero
  const scoreEl = document.getElementById('resScore');
  const trendEl = document.getElementById('resTrend');
  if (scoreEl) scoreEl.textContent = '--';
  if (trendEl) { trendEl.textContent = ''; trendEl.className = 'res__trend'; }

  // Render empty missions
  MISSIONS = [];
  const list = document.getElementById('missionsList');
  if (list) list.innerHTML = '<div style="color: var(--text-muted, #888); text-align: center; padding: 20px;">No data yet. Connect a wearable to start tracking.</div>';

  // Render empty leaderboard
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

  // Profile dropdown menu (avatar click)
  const navProfileBtn = document.getElementById('navProfileBtn');
  const navProfileDropdown = document.getElementById('navProfileDropdown');
  const navDropdownSettings = document.getElementById('navDropdownSettings');
  const navDropdownStudio = document.getElementById('navDropdownStudio');
  const navDropdownSignout = document.getElementById('navDropdownSignout');

  // Toggle dropdown on avatar click
  navProfileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) {
      showAuthModal();
      return;
    }
    const dd = navProfileDropdown;
    if (dd) {
      dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
      if (dd.style.display === 'block') updateDropdownStudioLabel();
    }
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    if (navProfileDropdown) navProfileDropdown.style.display = 'none';
  });

  // Settings
  navDropdownSettings?.addEventListener('click', () => {
    navProfileDropdown.style.display = 'none';
    showSettingsView();
  });

  // Studio Dashboard (context-aware)
  navDropdownStudio?.addEventListener('click', () => {
    navProfileDropdown.style.display = 'none';
    const currentView = localStorage.getItem(VIEW_KEY) || 'athlete';
    if (appState.userRole === 'studio_admin') {
      // Toggle between athlete and studio
      if (currentView === 'studio') {
        switchView('athlete');
      } else {
        switchView('studio');
      }
    } else {
      // Athletes: show studio dashboard with "Select Your Studio" prompt
      switchView('studio');
    }
  });

  // Sign out
  navDropdownSignout?.addEventListener('click', () => {
    navProfileDropdown.style.display = 'none';
    logout();
  });

  // Settings back button
  const settingsBackBtn = document.getElementById('settingsBackBtn');
  settingsBackBtn?.addEventListener('click', () => {
    hideSettingsView();
  });
}

function switchView(view) {
  const athleteView = document.getElementById('athleteView');
  const studioView = document.getElementById('studioView');
  const settingsView = document.getElementById('settingsView');
  const exploreView = document.getElementById('exploreView');
  const friendsView = document.getElementById('friendsView');

  // Athletes cannot access studio view
  // (Removed gate - athletes CAN view studio dashboard now)

  // Save current view to localStorage
  localStorage.setItem(VIEW_KEY, view);

  // Hide all views first
  if (settingsView) settingsView.style.display = 'none';
  if (exploreView) exploreView.style.display = 'none';
  if (friendsView) friendsView.style.display = 'none';
  athleteView?.classList.remove('view--active');
  studioView?.classList.remove('view--active');

  if (view === 'athlete') {
    athleteView?.classList.add('view--active');
  } else if (view === 'studio') {
    studioView?.classList.add('view--active');
    setTimeout(() => {
      document.querySelectorAll('#studioView [data-count]').forEach(el => {
        animateCount(el, parseInt(el.dataset.count, 10));
      });
      initStudioAnalytics();
    }, 100);

    // Check if athlete (not studio admin) - show "Select Your Studio" prompt
    if (appState.userRole !== 'studio_admin') {
      injectAthleteStudioPrompt();
    } else {
      // Studio admin: check if this is the test account (bypass pricing)
      const isTestAccount = appState.user?.email === 'brandonliao0@gmail.com';
      if (!isTestAccount && !appState.studioSubscribed && !appState._upgradePopupShown) {
        appState._upgradePopupShown = true;
        setTimeout(() => showStudioUpgradePopup(), 400);
      }
    }
  } else if (view === 'explore') {
    // Hide athlete/studio content, show explore as standalone view
    if (athleteView) athleteView.style.display = 'none';
    if (studioView) studioView.style.display = 'none';
    if (exploreView) exploreView.style.display = '';
    loadExploreFeed();
  } else if (view === 'friends') {
    if (athleteView) athleteView.style.display = 'none';
    if (studioView) studioView.style.display = 'none';
    if (friendsView) friendsView.style.display = '';
    loadFriendsData();
  }

  // Restore athlete/studio display when going back to those views
  if (view === 'athlete' || view === 'studio') {
    if (athleteView) athleteView.style.display = '';
    if (studioView) studioView.style.display = '';
    if (exploreView) exploreView.style.display = 'none';
    if (friendsView) friendsView.style.display = 'none';
  }

  if (window.innerWidth <= 768) {
    document.getElementById('mainNav')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Exit edit mode if active, then re-init widget system for the new view
  exitEditMode();
  if (view === 'athlete' || view === 'explore' || view === 'friends') {
    initWidgetSystem('athlete');
  } else {
    initWidgetSystem('studio');
  }
}

// ── Settings View Toggle ──────────────────────────────────

// Update the dropdown "Studio Dashboard" label based on context
function updateDropdownStudioLabel() {
  const item = document.getElementById('navDropdownStudio');
  if (!item) return;
  const labelEl = item.querySelector('span:last-child');
  if (!labelEl) return;
  const currentView = localStorage.getItem(VIEW_KEY) || 'athlete';
  if (appState.userRole === 'studio_admin' && currentView === 'studio') {
    labelEl.textContent = 'Switch to Athlete';
    const iconEl = item.querySelector('.nav__dropdown-icon');
    if (iconEl) iconEl.textContent = '🏋️';
  } else {
    labelEl.textContent = 'Studio Dashboard';
    const iconEl = item.querySelector('.nav__dropdown-icon');
    if (iconEl) iconEl.textContent = '📊';
  }
}

// Prompt for non-studio-owners clicking "Studio Dashboard"
function showStudioOwnerPrompt() {
  document.getElementById('studioOwnerPromptModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'studioOwnerPromptModal';
  modal.className = 'pricing-modal';
  modal.innerHTML = '<div class="pricing-modal__backdrop"></div>' +
    '<div class="pricing-modal__content" style="max-width: 400px; text-align: center; padding: 40px 30px;">' +
    '<button class="pricing-modal__close" id="studioPromptClose">&times;</button>' +
    '<div style="font-size: 2.5rem; margin-bottom: 16px;">🏢</div>' +
    '<h2 class="pricing-modal__title" style="font-size: 1.3rem;">Do you own a Pilates studio?</h2>' +
    '<p style="color: var(--text-muted, #888); margin: 12px 0 24px; font-size: 0.9rem;">Get access to the Studio Dashboard to manage your community, track member progress, and create challenges.</p>' +
    '<div style="display: flex; gap: 12px; justify-content: center;">' +
    '<button class="btn btn--outline" id="studioPromptNo" style="min-width: 100px;">No</button>' +
    '<button class="btn btn--primary" id="studioPromptYes" style="min-width: 100px;">Yes, I do!</button>' +
    '</div>' +
    '</div>';

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('pricing-modal--visible'));

  const closeModal = () => {
    modal.classList.remove('pricing-modal--visible');
    setTimeout(() => modal.remove(), 400);
  };

  document.getElementById('studioPromptClose')?.addEventListener('click', closeModal);
  modal.querySelector('.pricing-modal__backdrop')?.addEventListener('click', closeModal);
  document.getElementById('studioPromptNo')?.addEventListener('click', closeModal);
  document.getElementById('studioPromptYes')?.addEventListener('click', () => {
    closeModal();
    setTimeout(() => {
      showOnboarding(handleStudioUpgradeComplete, 'studio_admin');
    }, 400);
  });
}
function showSettingsView() {
  const athleteView = document.getElementById('athleteView');
  const studioView = document.getElementById('studioView');
  const settingsView = document.getElementById('settingsView');
  athleteView?.classList.remove('view--active');
  studioView?.classList.remove('view--active');
  if (settingsView) settingsView.style.display = '';
  settingsView?.classList.add('view--active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideSettingsView() {
  const settingsView = document.getElementById('settingsView');
  if (settingsView) {
    settingsView.style.display = 'none';
    settingsView.classList.remove('view--active');
  }
  // Restore previous view
  const saved = localStorage.getItem(VIEW_KEY) || 'athlete';
  switchView(saved);
}

function initViewSwitching() {
  // Placeholder for future tab extensions
}

// ── STRIPE CONFIG ─────────────────────────────────────────
const STRIPE_STUDIO_LINK = 'https://buy.stripe.com/dRm5kD2Tb1LbdBa7uc3oA0j'; // $549/mo
const STRIPE_LIFETIME_LINK = 'https://buy.stripe.com/fZu4gzeBT89zeFe7uc3oA0k'; // $2,000 one-time lifetime

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
    el.innerHTML = '<img src="' + escapeHtml(pfp) + '" alt="pfp" class="profile__avatar-img" referrerpolicy="no-referrer" />';
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
    '<li>Team goals and member management</li>' +
    '<li>At-risk member alerts</li>' +
    '<li>Scoring focus and visibility controls</li>' +
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
    '<p class="pricing-modal__note">Secure checkout powered by Stripe</p>' +
    '<p class="pricing-modal__restore">Already purchased? <button class="pricing-modal__restore-btn" id="restorePurchaseBtn">Restore access</button></p>' +
    '</div>';

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('pricing-modal--visible'));

  document.getElementById('pricingClose')?.addEventListener('click', closePricingModal);
  modal.querySelector('.pricing-modal__backdrop')?.addEventListener('click', closePricingModal);

  // Restore purchase button
  document.getElementById('restorePurchaseBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('restorePurchaseBtn');
    if (btn) btn.textContent = 'Checking...';
    try {
      const profile = await getProfile();
      if (profile.ok && profile.data?.studio_subscribed) {
        localStorage.setItem('bnco_studio_subscribed', 'true');
        appState.studioSubscribed = true;
        closePricingModal();
        applyRoleAccess();
        switchView('studio');
      } else {
        if (btn) btn.textContent = 'No active subscription found';
        setTimeout(() => { if (btn) btn.textContent = 'Restore access'; }, 3000);
      }
    } catch {
      if (btn) btn.textContent = 'Error checking. Try again.';
      setTimeout(() => { if (btn) btn.textContent = 'Restore access'; }, 3000);
    }
  });
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
    // Athletes: still show studio option in dropdown, hide dedicated toggle
    navStudioBtn?.parentElement?.classList.add('toggle--athlete-only');
    mobileStudioBtn?.classList.add('mobile-tab--hidden');
    // Make sure athlete view is showing by default
    document.getElementById('athleteView')?.classList.add('view--active');
  } else if (role === 'studio_admin') {
    // Studio owners: show toggle, apply demo overlay if not subscribed
    navStudioBtn?.parentElement?.classList.remove('toggle--athlete-only');
    mobileStudioBtn?.classList.remove('mobile-tab--hidden');

    const isTestAccount = appState.user?.email === 'brandonliao0@gmail.com';
    if (!isTestAccount && !appState.studioSubscribed) {
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

  // Only show for pure athletes, NOT for studio owners
  if (appState.userRole === 'studio_admin') return;

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

// ── Athlete Studio Dashboard Prompt ───────────────────────
function injectAthleteStudioPrompt() {
  // Replace the join code card area with a "Select Your Studio" prompt
  const joinCodeCard = document.getElementById('studioJoinCodeCard');
  if (!joinCodeCard) return;

  // Check if already injected
  if (document.getElementById('athleteStudioPrompt')) {
    joinCodeCard.style.display = 'none';
    return;
  }

  joinCodeCard.style.display = 'none';

  const prompt = document.createElement('div');
  prompt.id = 'athleteStudioPrompt';
  prompt.className = 'card';
  prompt.style.cssText = 'text-align: center; padding: 40px 24px;';
  prompt.innerHTML =
    '<div style="font-size: 2.5rem; margin-bottom: 16px;">🏢</div>' +
    '<h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 8px;">Want to manage a studio?</h3>' +
    '<p style="color: var(--text-muted, #888); font-size: 0.9rem; margin-bottom: 24px;">' +
    'Register your Pilates studio to unlock member management, analytics, challenges, and more.' +
    '</p>' +
    '<button class="btn btn--primary" id="athleteSelectStudioBtn" style="min-width: 200px;">Register Your Studio</button>';

  joinCodeCard.parentNode.insertBefore(prompt, joinCodeCard.nextSibling);

  document.getElementById('athleteSelectStudioBtn')?.addEventListener('click', () => {
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
  // Persist role to backend API
  updateUserProfile({ role: 'studio_admin' }).catch(() => {});

  // They're a real athlete too now with both roles - no more demo data
  appState.usingDemoData = false;

  // Refresh profile
  const profileResult = await getProfile();
  if (profileResult.ok) {
    appState.user = profileResult.data;
    appState.studioSubscribed = profileResult.data?.studio_subscribed || localStorage.getItem('bnco_studio_subscribed') === 'true';
    if (profileResult.data?.studio_subscribed) localStorage.setItem('bnco_studio_subscribed', 'true');
  }

  // Reload all data with real tracking
  await loadAppData();

  // Apply new role access and switch to studio view
  applyRoleAccess();
  switchView('studio');
}

// ── Studio Registration Modal ─────────────────────────────
function showStudioRegistrationModal(isAdditional = false) {
  document.getElementById('studioRegModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'studioRegModal';
  modal.className = 'studio-reg-modal';
  modal.innerHTML = `
    <div class="studio-reg-modal__backdrop"></div>
    <div class="studio-reg-modal__content">
      <button class="studio-reg-modal__close" id="studioRegClose">&times;</button>
      <h2 class="studio-reg-modal__title">${isAdditional ? 'Add Another Studio' : 'Register Your Studio'}</h2>
      <p class="studio-reg-modal__subtitle">${isAdditional ? 'Manage multiple studios under one account' : 'Set up your studio dashboard and start tracking your athletes'}</p>
      <form class="studio-reg-modal__form" id="studioRegForm">
        <div class="form-field">
          <label class="form-label">Studio Name</label>
          <input type="text" class="form-input" id="studioRegModalName" placeholder="Enter your studio name" required />
        </div>
        <div class="form-field">
          <label class="form-label">City</label>
          <input type="text" class="form-input" id="studioRegModalCity" placeholder="City" />
        </div>
        <div class="form-field">
          <label class="form-label">State</label>
          <input type="text" class="form-input" id="studioRegModalState" placeholder="State" />
        </div>
        <button type="submit" class="btn btn--primary btn--full">Register Studio</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('studio-reg-modal--visible'));

  // Close handlers
  document.getElementById('studioRegClose')?.addEventListener('click', closeStudioRegModal);
  modal.querySelector('.studio-reg-modal__backdrop')?.addEventListener('click', closeStudioRegModal);

  // Form submit
  document.getElementById('studioRegForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('studioRegModalName')?.value?.trim();
    const city = document.getElementById('studioRegModalCity')?.value?.trim();
    const state = document.getElementById('studioRegModalState')?.value?.trim();
    if (!name) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const result = await createStudio({ name, slug, city, state });
      if (result.ok) {
        appState.studioId = result.data.id;
        appState.userRole = 'studio_admin';
        localStorage.setItem('bnco_user_role', 'studio_admin');
        closeStudioRegModal();
        applyRoleAccess();
        switchView('studio');
        // Generate join code for the new studio
        fetchJoinCode(result.data.id);
      } else {
        alert(result.message || 'Failed to create studio');
      }
    } catch (err) {
      alert('Error creating studio');
    }
  });
}

function closeStudioRegModal() {
  const modal = document.getElementById('studioRegModal');
  if (modal) {
    modal.classList.remove('studio-reg-modal--visible');
    setTimeout(() => modal.remove(), 400);
  }
}

async function fetchJoinCode(studioId) {
  try {
    const result = await getJoinCode(studioId);
    if (result.ok && result.data?.join_code) {
      console.log('Studio join code:', result.data.join_code);
    }
  } catch (err) {
    console.warn('Could not fetch join code:', err);
  }
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
        <li>🔗 Studio join code to onboard your athletes</li>
        <li>🎯 Create weekly team goals for collective progress</li>
        <li>👥 Member management and engagement tracking</li>
        <li>⚠️ At-risk member detection and alerts</li>
        <li>📊 Scoring focus controls (weight Effort, Consistency, Recovery)</li>
        <li>👁️ Community visibility settings</li>
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

// ── Community Section ─────────────────────────────────────

function initCommunity() {
  // Restore "don't show" preference
  const dontShowCb = document.getElementById('communityDontShow');
  const savedDontShow = localStorage.getItem('bnco_community_hidden') === 'true';
  if (dontShowCb) dontShowCb.checked = savedDontShow;

  dontShowCb?.addEventListener('change', (e) => {
    localStorage.setItem('bnco_community_hidden', e.target.checked ? 'true' : 'false');
    renderCommunityList();
  });

  // Mood picker - delegate event to handle clicks even after re-render
  const moodPicker = document.getElementById('moodPicker');
  if (moodPicker) {
    moodPicker.addEventListener('click', async (e) => {
      const btn = e.target.closest('.community__mood-option');
      if (!btn) return;
      const mood = btn.dataset.mood;
      if (!mood) return;
      const studioId = appState.activeStudioId || appState.studioId;
      localStorage.setItem('bnco_my_mood', mood);
      localStorage.setItem('bnco_my_mood_time', new Date().toISOString());
      moodPicker.style.display = 'none';
      renderCommunityList();

      // Save to backend
      if (studioId) {
        const result = await setMood(mood, studioId);
        if (result.ok && result.data?.mood) {
          localStorage.setItem('bnco_my_mood_id', result.data.mood.id);
        }
      }
    });
  }

  // Add studio button (join code modal)
  document.getElementById('addStudioBtn')?.addEventListener('click', showJoinCodeModal);

  // Render studios and community
  renderStudioSwitcher();
  renderCommunityList();
}

function renderStudioSwitcher() {
  const listEl = document.getElementById('studioSwitcherList');
  if (!listEl) return;

  // Merge studios from appState, API, and localStorage
  let studios = appState.user?.studios ? [...appState.user.studios] : [];
  const studioId = appState.studioId;

  // Add from localStorage user studios
  const localStudios = JSON.parse(localStorage.getItem('bnco_user_studios') || '[]');
  localStudios.forEach(ls => {
    if (!studios.find(s => s.id === ls.id)) {
      studios.push(ls);
    }
  });

  // If user has a single studio from studioId but no studios array
  if (studios.length === 0 && studioId) {
    const studioName = appState.user?.studio_name || localStorage.getItem('bnco_studio_name') || 'My Studio';
    studios.push({ id: studioId, name: studioName });
  }

  if (studios.length === 0) {
    listEl.innerHTML = '<button class="studio-switcher__bubble studio-switcher__bubble--active" id="joinFirstStudioBtn">' +
      '<span class="studio-switcher__bubble-icon">🏠</span>' +
      '<span class="studio-switcher__bubble-name">Join a Studio</span>' +
      '</button>';
    document.getElementById('joinFirstStudioBtn')?.addEventListener('click', showJoinCodeModal);
    return;
  }

  const activeStudioId = appState.activeStudioId || studios[0]?.id;
  if (!appState.activeStudioId) appState.activeStudioId = activeStudioId;

  listEl.innerHTML = studios.map((s, i) => {
    const isActive = s.id === activeStudioId;
    return '<button class="studio-switcher__bubble' + (isActive ? ' studio-switcher__bubble--active' : '') + '" data-studio-id="' + escapeHtml(s.id) + '">' +
      '<span class="studio-switcher__bubble-icon">' + (i === 0 ? '🧘' : i === 1 ? '💪' : '🏠') + '</span>' +
      '<span class="studio-switcher__bubble-name">' + escapeHtml(s.name || 'Studio') + '</span>' +
      '</button>';
  }).join('');

  // Bind switch clicks
  listEl.querySelectorAll('.studio-switcher__bubble').forEach(btn => {
    btn.addEventListener('click', () => {
      const sid = btn.dataset.studioId;
      appState.activeStudioId = sid;
      listEl.querySelectorAll('.studio-switcher__bubble').forEach(b => b.classList.remove('studio-switcher__bubble--active'));
      btn.classList.add('studio-switcher__bubble--active');
      renderCommunityList();
    });
  });
}

function renderCommunityList() {
  const listEl = document.getElementById('communityList');
  const countEl = document.getElementById('communityCount');
  if (!listEl) return;

  const user = appState.user;
  const dontShow = localStorage.getItem('bnco_community_hidden') === 'true';
  const studioId = appState.activeStudioId || appState.studioId;

  // Update studio section title with real studio name
  const sectionTitle = document.querySelector('#communitySection .section__title');
  const sectionSubtitle = document.querySelector('#communitySection .section__subtitle');
  if (sectionTitle && studioId) {
    const studios = appState.user?.studios || JSON.parse(localStorage.getItem('bnco_user_studios') || '[]');
    const activeStudio = studios.find(s => s.id === studioId);
    if (activeStudio) {
      const studioName = activeStudio.name || 'Your Studio';
      const studioLocation = activeStudio.city && activeStudio.state
        ? activeStudio.city + ', ' + activeStudio.state
        : (activeStudio.city || activeStudio.state || '');
      sectionTitle.textContent = studioName;
      if (sectionSubtitle && studioLocation) {
        sectionSubtitle.textContent = studioLocation;
      } else if (sectionSubtitle) {
        sectionSubtitle.textContent = 'See who\'s here today and cheer each other on';
      }
    }
  }

  // Check if user hasn't joined any studio
  const userStudios = JSON.parse(localStorage.getItem('bnco_user_studios') || '[]');
  const hasStudios = (appState.user?.studios?.length > 0) || userStudios.length > 0 || appState.studioId;

  if (!hasStudios && !user) {
    listEl.innerHTML = '<div class="community__empty">' +
      '<div style="font-size: 2rem; margin-bottom: 8px;">🔗</div>' +
      '<p style="color: var(--text-muted, #888); font-size: 0.9rem;">Join a studio to see your community! Ask your studio owner for a join code.</p>' +
      '</div>';
    if (countEl) countEl.textContent = '';
    return;
  }

  // Show loading state
  listEl.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-muted,#888);">Loading community...</div>';

  // Fetch real moods from API as primary data source
  if (studioId) {
    Promise.all([
      getStudioMoods(studioId),
      getStudioMembers(studioId),
    ]).then(([moodsResult, membersResult]) => {
      const members = [];
      const myMood = localStorage.getItem('bnco_my_mood') || '😊';

      // Build mood lookup from API
      const moodsMap = {};
      if (moodsResult.ok && moodsResult.data?.moods) {
        moodsResult.data.moods.forEach(m => {
          moodsMap[m.user_id] = {
            emoji: m.emoji,
            moodId: m.id,
            moodTime: m.updated_at || m.created_at,
            moodLikes: parseInt(m.like_count || 0, 10),
            userLiked: m.liked_by_me || m.user_liked || false,
          };
        });
      }

      // Build member list from API
      const apiMembers = (membersResult.ok && membersResult.data?.members) ? membersResult.data.members : [];

      // Add current user first
      if (user && !dontShow) {
        const myMoodData = moodsMap[user.id];
        members.push({
          id: user.id || 'me',
          name: user.display_name || user.name || 'You',
          initials: getInitials(user.display_name || user.name || 'You'),
          mood: myMoodData ? myMoodData.emoji : myMood,
          moodTime: myMoodData ? myMoodData.moodTime : (localStorage.getItem('bnco_my_mood_time') || null),
          moodId: myMoodData ? myMoodData.moodId : (localStorage.getItem('bnco_my_mood_id') || null),
          moodLikes: myMoodData ? myMoodData.moodLikes : 0,
          userLiked: false,
          streak: parseInt(localStorage.getItem('bnco_streak_days') || '0'),
          isMe: true,
          here: true,
        });
      }

      // Add API members (not self)
      apiMembers.forEach(m => {
        if (m.id === (user?.id || 'self')) return;
        const moodData = moodsMap[m.id];
        members.push({
          id: m.id,
          name: m.name || 'Unknown',
          initials: getInitials(m.name || 'Unknown'),
          mood: moodData ? moodData.emoji : '',
          moodTime: moodData ? moodData.moodTime : null,
          moodId: moodData ? moodData.moodId : null,
          moodLikes: moodData ? moodData.moodLikes : 0,
          userLiked: moodData ? moodData.userLiked : false,
          streak: 0,
          isMe: false,
          here: !!moodData,
        });
      });

      // Also add anyone who has a mood but isn't in member list
      if (moodsResult.ok && moodsResult.data?.moods) {
        moodsResult.data.moods.forEach(mood => {
          if (mood.user_id === user?.id) return;
          if (members.find(m => m.id === mood.user_id)) return;
          members.push({
            id: mood.user_id,
            name: mood.user_name || 'Unknown',
            initials: getInitials(mood.user_name || 'Unknown'),
            mood: mood.emoji,
            moodId: mood.id,
            moodTime: mood.updated_at || mood.created_at,
            moodLikes: parseInt(mood.like_count || 0, 10),
            userLiked: mood.liked_by_me || mood.user_liked || false,
            streak: 0,
            isMe: false,
            here: true,
          });
        });
      }

      renderCommunityMembers(listEl, countEl, members);
    }).catch(() => {
      // Fallback: render from localStorage
      const members = [];
      const myMood = localStorage.getItem('bnco_my_mood') || '😊';
      if (user && !dontShow) {
        members.push({
          id: user.id || 'me',
          name: user.display_name || user.name || 'You',
          initials: getInitials(user.display_name || user.name || 'You'),
          mood: myMood,
          moodTime: localStorage.getItem('bnco_my_mood_time') || null,
          moodId: localStorage.getItem('bnco_my_mood_id') || null,
          moodLikes: 0,
          userLiked: false,
          streak: parseInt(localStorage.getItem('bnco_streak_days') || '0'),
          isMe: true,
          here: true,
        });
      }
      renderCommunityMembers(listEl, countEl, members);
    });
  } else {
    // No studio, just show current user
    const members = [];
    const myMood = localStorage.getItem('bnco_my_mood') || '😊';
    if (user && !dontShow) {
      members.push({
        id: user.id || 'me',
        name: user.display_name || user.name || 'You',
        initials: getInitials(user.display_name || user.name || 'You'),
        mood: myMood,
        moodTime: localStorage.getItem('bnco_my_mood_time') || null,
        moodId: localStorage.getItem('bnco_my_mood_id') || null,
        moodLikes: 0,
        userLiked: false,
        streak: parseInt(localStorage.getItem('bnco_streak_days') || '0'),
        isMe: true,
        here: true,
      });
    }
    renderCommunityMembers(listEl, countEl, members);
  }
}

function renderCommunityMembers(listEl, countEl, members) {
  if (members.length === 0) {
    listEl.innerHTML = '<div class="community__empty">' +
      '<div style="font-size: 2rem; margin-bottom: 8px;">👋</div>' +
      '<p style="color: var(--text-muted, #888); font-size: 0.9rem;">No one else here yet. Share your studio code to invite others!</p>' +
      '</div>';
    if (countEl) countEl.textContent = '';
    return;
  }

  if (countEl) countEl.textContent = members.length + (members.length === 1 ? ' member' : ' members');

  listEl.innerHTML = members.map(m => {
    const statusClass = m.here ? 'community__member-status--here' : 'community__member-status--away';
    const memberClass = m.here ? 'community__member community__member--here' : 'community__member';
    const heartIcon = m.isMe ? '' : (m.userLiked ? '❤️' : '🤍');
    const moodTimeStr = m.moodTime ? relativeTime(m.moodTime) : '';

    return '<div class="' + memberClass + '" data-member="' + escapeHtml(m.id) + '">' +
      '<div class="community__member-left">' +
      '<div class="community__member-avatar">' +
      '<span class="community__member-initials">' + escapeHtml(m.initials) + '</span>' +
      '<span class="community__member-status ' + statusClass + '">&#x25CF;</span>' +
      '</div>' +
      '<div class="community__member-info">' +
      '<div class="community__member-name">' + escapeHtml(m.name) + (m.isMe ? ' (You)' : '') + '</div>' +
      '<div class="community__member-meta">' +
      '<span class="community__member-streak">🔥 ' + m.streak + ' days</span>' +
      (moodTimeStr ? '<span class="community__member-mood-time" style="color:var(--text-muted,#999);font-size:0.75rem;margin-left:6px;">' + moodTimeStr + '</span>' : '') +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="community__member-right">' +
      '<button class="community__member-mood" data-member-id="' + escapeHtml(m.id) + '" data-is-me="' + (m.isMe ? 'true' : 'false') + '">' + m.mood + '</button>' +
      (m.isMe ? '' : '<button class="community__heart-btn" data-mood-id="' + escapeHtml(m.moodId || '') + '" data-member-id="' + escapeHtml(m.id) + '" data-liked="' + (m.userLiked ? 'true' : 'false') + '">' +
        '<span class="community__heart-icon">' + heartIcon + '</span>' +
        '<span class="community__heart-count">' + (m.moodLikes || 0) + '</span>' +
        '</button>') +
      '</div>' +
      '</div>';
  }).join('');

  // Bind mood buttons (only for current user)
  listEl.querySelectorAll('.community__member-mood[data-is-me="true"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const moodPicker = document.getElementById('moodPicker');
      if (moodPicker) {
        moodPicker.style.display = moodPicker.style.display === 'none' ? '' : 'none';
      }
    });
  });

  // Bind member click to open profile
  listEl.querySelectorAll('.community__member').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      if (e.target.closest('.community__member-mood') || e.target.closest('.community__heart-btn')) return;
      const memberId = el.dataset.member;
      if (memberId && memberId !== (appState.user?.id || 'me')) {
        showMemberProfile(memberId);
      }
    });
  });

  // Bind heart/like buttons - calls likeMood/unlikeMood API
  listEl.querySelectorAll('.community__heart-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const moodId = btn.dataset.moodId;
      if (!moodId) return;
      const isLiked = btn.dataset.liked === 'true';
      const icon = btn.querySelector('.community__heart-icon');
      const count = btn.querySelector('.community__heart-count');
      let currentCount = parseInt(count?.textContent || '0', 10);

      if (isLiked) {
        btn.dataset.liked = 'false';
        if (icon) icon.textContent = '🤍';
        if (count) count.textContent = Math.max(0, currentCount - 1);
        await unlikeMood(moodId);
      } else {
        btn.dataset.liked = 'true';
        if (icon) icon.textContent = '❤️';
        if (count) count.textContent = currentCount + 1;
        await likeMood(moodId);
      }
    });
  });
}

// ── Member Profile Modal ──────────────────────────────────
async function showMemberProfile(userId) {
  document.getElementById('memberProfileModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'memberProfileModal';
  modal.className = 'pricing-modal';
  modal.innerHTML = '<div class="pricing-modal__backdrop"></div>' +
    '<div class="pricing-modal__content" style="max-width: 420px; padding: 32px 24px;">' +
    '<button class="pricing-modal__close" id="memberProfileClose">&times;</button>' +
    '<div style="text-align:center;padding:40px 0;color:var(--text-muted,#888);">Loading profile...</div>' +
    '</div>';

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('pricing-modal--visible'));

  const closeModal = () => {
    modal.classList.remove('pricing-modal--visible');
    setTimeout(() => modal.remove(), 400);
  };
  document.getElementById('memberProfileClose')?.addEventListener('click', closeModal);
  modal.querySelector('.pricing-modal__backdrop')?.addEventListener('click', closeModal);

  try {
    const result = await getUserProfile(userId);
    if (!result.ok || !result.data?.profile) {
      modal.querySelector('.pricing-modal__content').innerHTML =
        '<button class="pricing-modal__close" id="memberProfileClose2">&times;</button>' +
        '<div style="text-align:center;padding:40px 0;color:var(--text-muted,#888);">Could not load profile.</div>';
      document.getElementById('memberProfileClose2')?.addEventListener('click', closeModal);
      return;
    }

    const p = result.data.profile;
    const initials = getInitials(p.name || 'Unknown');
    const avatarHtml = p.avatar_url
      ? '<img src="' + escapeHtml(p.avatar_url) + '" alt="" style="width:72px;height:72px;border-radius:50%;object-fit:cover;" referrerpolicy="no-referrer" />'
      : '<div style="width:72px;height:72px;border-radius:50%;background:var(--sage,#7C9082);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:600;">' + escapeHtml(initials) + '</div>';

    // Determine friend action button
    let friendBtnHtml = '';
    if (!p.is_me) {
      if (p.friendship && p.friendship.status === 'accepted') {
        friendBtnHtml = '<button class="btn btn--outline btn--sm" id="profileFriendBtn" data-action="remove" data-friendship-id="' + escapeHtml(p.friendship.id) + '">Remove Friend</button>';
      } else if (p.friendship && p.friendship.status === 'pending') {
        if (p.friendship.requester_id === (appState.user?.id || '')) {
          friendBtnHtml = '<button class="btn btn--outline btn--sm" disabled>Request Sent</button>';
        } else {
          friendBtnHtml = '<button class="btn btn--primary btn--sm" id="profileFriendBtn" data-action="accept" data-friendship-id="' + escapeHtml(p.friendship.id) + '">Accept Request</button>';
        }
      } else {
        friendBtnHtml = '<button class="btn btn--primary btn--sm" id="profileFriendBtn" data-action="add" data-user-id="' + escapeHtml(userId) + '">Add Friend</button>';
      }
    }

    const content = modal.querySelector('.pricing-modal__content');
    content.innerHTML =
      '<button class="pricing-modal__close" id="memberProfileClose2">&times;</button>' +
      '<div style="text-align:center;">' +
      '<div style="display:flex;justify-content:center;margin-bottom:12px;">' + avatarHtml + '</div>' +
      '<h3 style="font-size:1.2rem;font-weight:600;margin-bottom:4px;">' + escapeHtml(p.name || 'Unknown') + '</h3>' +
      (p.bio ? '<p style="color:var(--text-muted,#888);font-size:0.85rem;margin-bottom:12px;">' + escapeHtml(p.bio) + '</p>' : '') +
      '<div style="display:flex;justify-content:center;gap:24px;margin:16px 0;">' +
      '<div><span style="font-weight:600;font-size:1.1rem;">' + (p.friend_count || 0) + '</span><br><span style="font-size:0.8rem;color:var(--text-muted,#888);">Friends</span></div>' +
      '<div><span style="font-weight:600;font-size:1.1rem;">' + (p.post_count || 0) + '</span><br><span style="font-size:0.8rem;color:var(--text-muted,#888);">Posts</span></div>' +
      '</div>' +
      (friendBtnHtml ? '<div style="margin-top:16px;">' + friendBtnHtml + '</div>' : '') +
      '</div>';

    document.getElementById('memberProfileClose2')?.addEventListener('click', closeModal);

    // Bind friend action
    const friendBtn = document.getElementById('profileFriendBtn');
    if (friendBtn) {
      friendBtn.addEventListener('click', async () => {
        const action = friendBtn.dataset.action;
        friendBtn.disabled = true;
        friendBtn.textContent = 'Working...';
        try {
          if (action === 'add') {
            await sendFriendRequest(friendBtn.dataset.userId);
            friendBtn.textContent = 'Request Sent';
          } else if (action === 'accept') {
            await respondToFriendRequest(friendBtn.dataset.friendshipId, 'accepted');
            friendBtn.textContent = 'Friends!';
            friendBtn.className = 'btn btn--outline btn--sm';
          } else if (action === 'remove') {
            await removeFriend(friendBtn.dataset.friendshipId);
            friendBtn.textContent = 'Add Friend';
            friendBtn.dataset.action = 'add';
            friendBtn.dataset.userId = userId;
            friendBtn.disabled = false;
            friendBtn.className = 'btn btn--primary btn--sm';
          }
        } catch {
          friendBtn.textContent = 'Error';
          friendBtn.disabled = false;
        }
      });
    }
  } catch {
    modal.querySelector('.pricing-modal__content').innerHTML =
      '<button class="pricing-modal__close" id="memberProfileClose3">&times;</button>' +
      '<div style="text-align:center;padding:40px 0;color:var(--text-muted,#888);">Error loading profile.</div>';
    document.getElementById('memberProfileClose3')?.addEventListener('click', closeModal);
  }
}

// ── Add User to Studio (shared helper) ────────────────────
function addUserToStudio(studioId, studioName) {
  // Add to studio's member list
  const membersKey = 'bnco_studio_members_' + studioId;
  const members = JSON.parse(localStorage.getItem(membersKey) || '[]');
  const userName = appState.user?.display_name || appState.user?.name || 'Athlete';
  const userId = appState.user?.id || 'self';

  if (!members.find(m => m.id === userId)) {
    members.push({
      id: userId,
      name: userName,
      joinedAt: new Date().toISOString(),
      streak: 0,
      lastActive: null,
    });
    localStorage.setItem(membersKey, JSON.stringify(members));
  }

  // Add to user's studio list
  const userStudios = JSON.parse(localStorage.getItem('bnco_user_studios') || '[]');
  if (!userStudios.find(s => s.id === studioId)) {
    userStudios.push({ id: studioId, name: studioName });
    localStorage.setItem('bnco_user_studios', JSON.stringify(userStudios));
  }

  // Update appState
  if (!appState.user) appState.user = {};
  if (!appState.user.studios) appState.user.studios = [];
  if (!appState.user.studios.find(s => s.id === studioId)) {
    appState.user.studios.push({ id: studioId, name: studioName });
  }
  appState.activeStudioId = studioId;
}

function showJoinCodeModal() {
  document.getElementById('joinCodeModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'joinCodeModal';
  modal.className = 'pricing-modal';
  modal.innerHTML = '<div class="pricing-modal__backdrop"></div>' +
    '<div class="pricing-modal__content" style="max-width: 400px; text-align: center; padding: 40px 30px;">' +
    '<button class="pricing-modal__close" id="joinCodeClose">&times;</button>' +
    '<div style="font-size: 2.5rem; margin-bottom: 16px;">🔗</div>' +
    '<h2 class="pricing-modal__title" style="font-size: 1.3rem;">Join a Studio</h2>' +
    '<p style="color: var(--text-muted, #888); margin: 12px 0 20px; font-size: 0.9rem;">Enter the join code from your studio owner to connect.</p>' +
    '<input type="text" class="form-input" id="joinCodeModalInput" placeholder="e.g. LEQYPP" maxlength="10" style="text-align: center; font-size: 1.1rem; letter-spacing: 3px; margin-bottom: 12px; text-transform: uppercase;" />' +
    '<div id="joinCodeModalResult" style="min-height: 20px; font-size: 0.85rem; margin-bottom: 16px;"></div>' +
    '<button class="btn btn--primary btn--full" id="joinCodeModalSubmit">Join Studio</button>' +
    '</div>';

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('pricing-modal--visible'));

  const closeModal = () => {
    modal.classList.remove('pricing-modal--visible');
    setTimeout(() => modal.remove(), 400);
  };

  document.getElementById('joinCodeClose')?.addEventListener('click', closeModal);
  modal.querySelector('.pricing-modal__backdrop')?.addEventListener('click', closeModal);

  document.getElementById('joinCodeModalSubmit')?.addEventListener('click', async () => {
    const input = document.getElementById('joinCodeModalInput');
    const resultEl = document.getElementById('joinCodeModalResult');
    let code = input?.value?.trim()?.toUpperCase();
    if (!code) {
      if (resultEl) { resultEl.textContent = 'Please enter a code.'; resultEl.style.color = '#cc3333'; }
      return;
    }

    // Strip any BNCO- prefix if user typed it
    code = code.replace(/^BNCO-/, '');

    if (resultEl) { resultEl.textContent = 'Checking...'; resultEl.style.color = 'var(--text-muted, #888)'; }

    // Try the backend API first (this is the ONLY reliable cross-device method)
    let apiWorked = false;
    try {
      const result = await joinByCode(code);
      if (result.ok && result.data?.joined) {
        const studioName = result.data?.studio?.name || 'Studio';
        const studioId = result.data?.studio?.id || code;

        addUserToStudio(studioId, studioName);

        if (resultEl) { resultEl.textContent = 'Joined ' + studioName + '!'; resultEl.style.color = '#22c55e'; }
        setTimeout(() => {
          closeModal();
          renderStudioSwitcher();
          renderCommunityList();
        }, 1000);
        return;
      }
      // API returned error - check if it's "already member"
      if (result.status === 409 && result.data?.studio) {
        addUserToStudio(result.data.studio.id, result.data.studio.name || 'Studio');
        if (resultEl) { resultEl.textContent = 'You\'re already a member!'; resultEl.style.color = '#22c55e'; }
        setTimeout(() => { closeModal(); renderStudioSwitcher(); renderCommunityList(); }, 1000);
        return;
      }
      if (result.status === 404) {
        if (resultEl) { resultEl.textContent = 'Invalid code. Check with your studio owner.'; resultEl.style.color = '#cc3333'; }
        return;
      }
      if (result.status === 401) {
        if (resultEl) { resultEl.textContent = 'Please log in first to join a studio.'; resultEl.style.color = '#cc3333'; }
        return;
      }
      // Other API error
      if (resultEl) { resultEl.textContent = result.message || 'Could not join. Try again.'; resultEl.style.color = '#cc3333'; }
    } catch (err) {
      // Network error - API completely unreachable
      if (resultEl) { resultEl.textContent = 'Connection error. Check your internet and try again.'; resultEl.style.color = '#cc3333'; }
    }
  });
}

// ── Mobile Tab Bar ────────────────────────────────────────

function initMobileTabBar() {
  const mobileHome = document.getElementById('mobileHome');
  const mobileCommunity = document.getElementById('mobileCommunity');
  const mobileGoals = document.getElementById('mobileGoals');
  const mobileExplore = document.getElementById('mobileExplore');
  const mobileFriends = document.getElementById('mobileFriends');
  const allBtns = [mobileHome, mobileCommunity, mobileGoals, mobileExplore, mobileFriends].filter(Boolean);

  function setActive(btn) {
    allBtns.forEach(b => b.classList.remove('mobile-tab-bar__btn--active'));
    btn?.classList.add('mobile-tab-bar__btn--active');
  }

  // Hide explore/friends views when switching to a scroll-based tab
  function hideOverlayViews() {
    const exploreView = document.getElementById('exploreView');
    const friendsView = document.getElementById('friendsView');
    if (exploreView) exploreView.style.display = 'none';
    if (friendsView) friendsView.style.display = 'none';
  }

  mobileHome?.addEventListener('click', () => {
    setActive(mobileHome);
    hideOverlayViews();
    const target = document.getElementById('profileCard') || document.getElementById('athleteView');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  mobileCommunity?.addEventListener('click', () => {
    setActive(mobileCommunity);
    hideOverlayViews();
    const target = document.getElementById('communitySection');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  mobileGoals?.addEventListener('click', () => {
    setActive(mobileGoals);
    hideOverlayViews();
    const target = document.getElementById('goalsSection');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  mobileExplore?.addEventListener('click', () => {
    setActive(mobileExplore);
    switchView('explore');
  });

  mobileFriends?.addEventListener('click', () => {
    setActive(mobileFriends);
    switchView('friends');
  });
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
      item.querySelector('.lb__podium-avatar').textContent = escapeHtml(d.initials);
      item.querySelector('.lb__podium-name').textContent = escapeHtml(d.name);
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
          <div class="lb__avatar">${escapeHtml(d.initials)}</div>
          <div class="lb__name">${escapeHtml(d.name)}${d.isYou ? ' (You)' : ''}</div>
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

  // Zero state - no previous sessions to compare
  if (ghostBar) ghostBar.setAttribute('data-label', 'Your Best - no data yet');
  if (youBar) youBar.setAttribute('data-label', 'You Now - no data yet');
  if (ghostBar) ghostBar.style.width = '0%';
  if (youBar) youBar.style.width = '0%';

  if (minutesContainer) {
    const minutes = [0, 5, 10, 15, 20, 25, 30];
    minutesContainer.innerHTML = minutes.map(m => `<span>${m} min</span>`).join('');
  }
  // No animation until real data exists
}

// ── Achievements ──────────────────────────────────────────
function initAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;

  grid.innerHTML = ACHIEVEMENTS.map(a => `
    <div class="achievement ${a.earned ? 'achievement--earned' : 'achievement--locked'}">
      <div class="achievement__icon">${a.icon}</div>
      <div class="achievement__name">${escapeHtml(a.name)}</div>
      <div class="achievement__desc">${escapeHtml(a.desc)}</div>
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
          <div class="mission-item__name">${escapeHtml(m.name)}</div>
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
  // Set studio name + location header
  updateStudioNameHeader();

  // Configure join code card based on ownership
  configureJoinCodeCard();

  // Load join code
  loadStudioJoinCode();

  // Init team goal form
  initTeamGoalForm();

  // Render active team goals (studio owner view)
  renderStudioTeamGoals();

  // Render athlete-facing team goals
  renderAthleteTeamGoals();

  // Render studio member list
  renderStudioMemberList();

  // Update studio stats
  updateStudioStats();
}

// ── Studio Name + Location Header ─────────────────────────
function updateStudioNameHeader() {
  const titleEl = document.getElementById('studioNameTitle');
  const subtitleEl = document.getElementById('studioLocationSubtitle');
  if (!titleEl) return;

  const studioId = appState.studioId || appState.activeStudioId;
  const studios = appState.user?.studios || JSON.parse(localStorage.getItem('bnco_user_studios') || '[]');
  const studio = studios.find(s => s.id === studioId);

  if (studio && studio.name) {
    titleEl.textContent = studio.name;
    const location = studio.city && studio.state
      ? studio.city + ', ' + studio.state
      : (studio.city || studio.state || '');
    if (subtitleEl) subtitleEl.textContent = location || 'Studio Dashboard';
  } else {
    titleEl.textContent = 'Studio Dashboard';
    if (subtitleEl) subtitleEl.textContent = 'Your studio at a glance';
  }
}

// ── Join Code Card Configuration ──────────────────────────
function configureJoinCodeCard() {
  const card = document.getElementById('studioJoinCodeCard');
  if (!card) return;

  const hasStudio = !!appState.studioId;
  const isOwner = appState.userRole === 'studio_admin' && hasStudio;

  if (isOwner) {
    // Show normal join code card
    card.innerHTML =
      '<div class="join-code__header">' +
      '<h3 class="card__title">🔗 Your Studio Join Code</h3>' +
      '<p class="join-code__desc">Share this code with athletes so they can find and join your studio.</p>' +
      '</div>' +
      '<div class="join-code__display">' +
      '<span class="join-code__value" id="studioJoinCodeValue">Loading...</span>' +
      '<button class="btn btn--outline btn--sm" id="copyJoinCodeBtn">Copy</button>' +
      '</div>' +
      '<p class="join-code__note">Share this 6-character code with your athletes. They enter it to join your studio.</p>';
  } else {
    // No studio registered: show "Claim a Studio" prompt
    card.innerHTML =
      '<div style="text-align: center; padding: 24px 16px;">' +
      '<div style="font-size: 2rem; margin-bottom: 12px;">🏢</div>' +
      '<h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">Claim Your Studio</h3>' +
      '<p style="color: var(--text-muted, #888); font-size: 0.85rem; margin-bottom: 16px;">Register your Pilates studio to get a join code, manage members, and unlock analytics.</p>' +
      '<button class="btn btn--primary" id="claimStudioBtn">Register a Studio</button>' +
      '</div>';
    document.getElementById('claimStudioBtn')?.addEventListener('click', () => {
      showOnboarding(handleStudioUpgradeComplete, 'studio_admin');
    });
  }
}

function loadStudioJoinCode() {
  const codeEl = document.getElementById('studioJoinCodeValue');
  const copyBtn = document.getElementById('copyJoinCodeBtn');
  if (!codeEl) return;

  codeEl.textContent = 'Loading...';

  const studioId = appState.studioId;

  // ALWAYS try backend first - the code in the DB is the real one
  if (studioId) {
    getJoinCode(studioId).then(result => {
      if (result.ok && result.data?.join_code) {
        codeEl.textContent = result.data.join_code;
      } else {
        codeEl.textContent = 'Error';
      }
    }).catch(() => {
      codeEl.textContent = 'Offline';
    });
  } else {
    codeEl.textContent = 'Create a studio first';
  }

  copyBtn?.addEventListener('click', () => {
    const text = codeEl.textContent;
    if (!text || text === 'Loading...' || text === 'Error' || text === 'Offline' || text === 'Create a studio first') return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = orig; }, 2000);
    }).catch(() => {});
  });
}

// ── Studio Member List (Dashboard) ────────────────────────
function renderStudioMemberList() {
  const listEl = document.getElementById('studioMembersList');
  const emptyEl = document.getElementById('studioMembersEmpty');
  if (!listEl) return;

  const studioId = appState.activeStudioId || appState.studioId;

  // Always show owner first
  const ownerName = appState.user?.display_name || appState.user?.name || 'You';
  listEl.innerHTML = '<div class="studio-member-row">' +
    '<div class="studio-member-row__left">' +
    '<div class="studio-member-row__initials">' + escapeHtml(getInitials(ownerName)) + '</div>' +
    '<div class="studio-member-row__info">' +
    '<div class="studio-member-row__name">' + escapeHtml(ownerName) + ' (You)</div>' +
    '<div class="studio-member-row__meta">Studio Owner</div>' +
    '</div>' +
    '</div>' +
    '<div class="studio-member-row__right">🔥 0</div>' +
    '</div>';

  if (!studioId) {
    if (emptyEl) emptyEl.style.display = '';
    return;
  }

  // Fetch real members from API
  getStudioMembers(studioId).then(result => {
    if (result.ok && result.data?.members?.length > 0) {
      const members = result.data.members.filter(m => m.id !== appState.user?.id);
      if (members.length === 0) {
        if (emptyEl) emptyEl.style.display = '';
        return;
      }
      if (emptyEl) emptyEl.style.display = 'none';

      const rows = members.map(m => {
        const initials = getInitials(m.name || 'Unknown');
        const score = m.avg_score_30d || '--';
        return '<div class="studio-member-row">' +
          '<div class="studio-member-row__left">' +
          '<div class="studio-member-row__initials">' + escapeHtml(initials) + '</div>' +
          '<div class="studio-member-row__info">' +
          '<div class="studio-member-row__name">' + escapeHtml(m.name || 'Unknown') + '</div>' +
          '<div class="studio-member-row__meta">Athlete</div>' +
          '</div>' +
          '</div>' +
          '<div class="studio-member-row__right">' + escapeHtml(String(score)) + '</div>' +
          '</div>';
      }).join('');

      listEl.innerHTML += rows;
    } else {
      if (emptyEl) emptyEl.style.display = '';
    }
  }).catch(() => {
    if (emptyEl) emptyEl.style.display = '';
  });
}

function updateStudioStats() {
  const studioId = appState.activeStudioId || appState.studioId || 'default';
  const localMembers = JSON.parse(localStorage.getItem('bnco_studio_members_' + studioId) || '[]');
  const goals = getTeamGoals();

  // Members count - try API first for real cross-device count, fall back to localStorage
  const membersEl = document.getElementById('statMembers');

  // Set initial count from localStorage while API loads
  if (membersEl) {
    const localCount = localMembers.length + 1; // +1 for owner
    membersEl.textContent = localCount;
    membersEl.dataset.count = localCount;
  }

  // Fetch real member count from API (overrides localStorage count)
  if (studioId && studioId !== 'default') {
    getStudioMembers(studioId).then(result => {
      if (result.ok && result.data?.members) {
        const apiCount = result.data.members.length;
        if (membersEl && apiCount > 0) {
          membersEl.textContent = apiCount;
          membersEl.dataset.count = apiCount;
        }
      }
    }).catch(() => {
      // API failed, keep localStorage count
    });
  }

  // Active today: check lastActive dates
  const today = new Date().toISOString().slice(0, 10);
  const activeToday = localMembers.filter(m => m.lastActive && m.lastActive.startsWith(today)).length;
  const activeTodayEl = document.getElementById('statActiveToday');
  if (activeTodayEl) {
    activeTodayEl.textContent = activeToday;
    activeTodayEl.dataset.count = activeToday;
  }

  // Average streak
  const allStreaks = localMembers.map(m => m.streak || 0);
  const avgStreak = allStreaks.length > 0 ? Math.round(allStreaks.reduce((a, b) => a + b, 0) / allStreaks.length) : 0;
  const avgStreakEl = document.getElementById('statAvgStreak');
  if (avgStreakEl) {
    avgStreakEl.textContent = avgStreak;
    avgStreakEl.dataset.count = avgStreak;
  }

  // Active goals
  const activeGoalsEl = document.getElementById('statActiveGoals');
  if (activeGoalsEl) {
    activeGoalsEl.textContent = goals.length;
    activeGoalsEl.dataset.count = goals.length;
  }
}

// ── Team Goals System ─────────────────────────────────────

const TEAM_GOALS_KEY = 'bnco_team_goals';

async function getTeamGoals() {
  const studioId = appState.activeStudioId || appState.studioId;
  if (studioId) {
    try {
      const result = await getTeamGoalsAPI(studioId);
      if (result.ok && result.data?.goals) {
        return result.data.goals.map(g => ({
          id: g.id,
          name: g.name,
          type: g.type,
          target: g.target,
          current: g.current_progress || 0,
          start: g.start_date,
          end: g.end_date,
          reward: g.reward,
          complete: g.complete,
        }));
      }
    } catch { /* fallback to localStorage */ }
  }
  // Fallback to localStorage
  const key = studioId || 'default';
  const all = JSON.parse(localStorage.getItem(TEAM_GOALS_KEY) || '{}');
  return all[key] || [];
}

function saveTeamGoals(goals) {
  // Only used as localStorage fallback
  const studioId = appState.activeStudioId || appState.studioId || 'default';
  const all = JSON.parse(localStorage.getItem(TEAM_GOALS_KEY) || '{}');
  all[studioId] = goals;
  localStorage.setItem(TEAM_GOALS_KEY, JSON.stringify(all));
}

function initTeamGoalForm() {
  const form = document.getElementById('teamGoalForm');
  if (!form) return;

  // Set default dates
  const startInput = document.getElementById('teamGoalStart');
  const endInput = document.getElementById('teamGoalEnd');
  if (startInput && !startInput.value) {
    const today = new Date();
    startInput.value = today.toISOString().slice(0, 10);
    const nextWeek = new Date(today.getTime() + 7 * 86400000);
    if (endInput) endInput.value = nextWeek.toISOString().slice(0, 10);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('teamGoalName')?.value?.trim();
    const type = document.getElementById('teamGoalType')?.value;
    const target = parseInt(document.getElementById('teamGoalTarget')?.value, 10);
    const start = document.getElementById('teamGoalStart')?.value;
    const end = document.getElementById('teamGoalEnd')?.value;
    const reward = document.getElementById('teamGoalReward')?.value?.trim() || '+50 XP for everyone';

    if (!name || !target) return;

    const studioId = appState.activeStudioId || appState.studioId;

    if (studioId) {
      // Save to API
      const result = await createTeamGoal(studioId, {
        name,
        type: type || 'custom',
        target,
        reward,
        start_date: start || null,
        end_date: end || null,
      });
      if (!result.ok) {
        console.warn('Failed to save team goal to API:', result.message);
      }
    } else {
      // localStorage fallback
      const goals = JSON.parse(localStorage.getItem(TEAM_GOALS_KEY) || '{}');
      const key = 'default';
      if (!goals[key]) goals[key] = [];
      goals[key].unshift({
        id: Date.now().toString(36),
        name, type, target, current: 0, start, end, reward, complete: false,
      });
      localStorage.setItem(TEAM_GOALS_KEY, JSON.stringify(goals));
    }

    form.reset();
    await renderStudioTeamGoals();
    await renderAthleteTeamGoals();
  });
}

async function renderStudioTeamGoals() {
  const listEl = document.getElementById('teamGoalsList');
  const emptyEl = document.getElementById('teamGoalsEmpty');
  if (!listEl) return;

  const goals = await getTeamGoals();

  if (goals.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = '';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = goals.map(g => {
    const pct = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
    const fillClass = g.complete ? 'team-goal-item__bar-fill--complete' : '';
    const badgeClass = g.complete ? 'team-goal-item__badge--complete' : '';
    const badgeText = g.complete ? 'Complete!' : g.type;

    return '<div class="team-goal-item" data-goal-id="' + g.id + '">' +
      '<div class="team-goal-item__header">' +
      '<span class="team-goal-item__name">' + escapeHtml(g.name) + '</span>' +
      '<span class="team-goal-item__badge ' + badgeClass + '">' + escapeHtml(badgeText) + '</span>' +
      '</div>' +
      '<div class="team-goal-item__progress">' +
      '<div class="team-goal-item__bar"><div class="team-goal-item__bar-fill ' + fillClass + '" style="width:' + pct + '%"></div></div>' +
      '<div class="team-goal-item__stats"><span>' + g.current + ' / ' + g.target + '</span><span>' + pct + '%</span></div>' +
      '</div>' +
      '<div class="team-goal-item__reward">Reward: ' + escapeHtml(g.reward) + '</div>' +
      '<div class="team-goal-item__dates">' + (g.start || '') + ' to ' + (g.end || '') + '</div>' +
      '<button class="team-goal-item__delete" data-goal-id="' + g.id + '">Remove</button>' +
      '</div>';
  }).join('');

  // Bind delete buttons
  const studioId = appState.activeStudioId || appState.studioId;
  listEl.querySelectorAll('.team-goal-item__delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const goalId = btn.dataset.goalId;
      if (studioId) {
        await deleteTeamGoal(studioId, goalId);
      } else {
        const all = JSON.parse(localStorage.getItem(TEAM_GOALS_KEY) || '{}');
        const key = 'default';
        all[key] = (all[key] || []).filter(g => g.id !== goalId);
        localStorage.setItem(TEAM_GOALS_KEY, JSON.stringify(all));
      }
      await renderStudioTeamGoals();
      await renderAthleteTeamGoals();
    });
  });
}

async function renderAthleteTeamGoals() {
  const listEl = document.getElementById('athleteTeamGoalsList');
  const emptyEl = document.getElementById('athleteTeamGoalsEmpty');
  if (!listEl) return;

  const goals = await getTeamGoals();

  if (goals.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = '';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = goals.map(g => {
    const pct = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
    const fillClass = g.complete ? 'team-goal-item__bar-fill--complete' : '';
    const badgeClass = g.complete ? 'team-goal-item__badge--complete' : '';
    const badgeText = g.complete ? 'Complete! 🎉' : 'In Progress';

    return '<div class="team-goal-item">' +
      '<div class="team-goal-item__header">' +
      '<span class="team-goal-item__name">' + escapeHtml(g.name) + '</span>' +
      '<span class="team-goal-item__badge ' + badgeClass + '">' + escapeHtml(badgeText) + '</span>' +
      '</div>' +
      '<div class="team-goal-item__progress">' +
      '<div class="team-goal-item__bar"><div class="team-goal-item__bar-fill ' + fillClass + '" style="width:' + pct + '%"></div></div>' +
      '<div class="team-goal-item__stats"><span>' + g.current + ' / ' + g.target + '</span><span>' + pct + '%</span></div>' +
      '</div>' +
      '<div class="team-goal-item__reward">Reward: ' + escapeHtml(g.reward) + '</div>' +
      '<div class="team-goal-item__dates">' + (g.start || '') + ' to ' + (g.end || '') + '</div>' +
      '</div>';
  }).join('');
}

// ── System Controls ───────────────────────────────────────
function initSystemControls() {
  const controls = document.querySelectorAll('#studioControlsSection .control-item input[type="checkbox"]');

  controls.forEach(ctrl => {
    ctrl.addEventListener('change', () => {
      recalculateWeights();
    });
  });
}

function recalculateWeights() {
  const controls = document.querySelectorAll('#studioControlsSection .control-item input[type="checkbox"]');
  const active = [];
  controls.forEach(c => {
    if (c.checked) active.push(c.dataset.metric);
  });

  if (active.length === 0) {
    controls.forEach(c => { c.checked = true; });
    recalculateWeights();
    return;
  }

  const defaultWeights = { strain: 40, hr: 35, recovery: 25 };
  const totalDefault = active.reduce((s, m) => s + (defaultWeights[m] || 0), 0);

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
  // Replaced by team goal system - kept as stub for compatibility
  const form = document.getElementById('missionForm');
  if (form) form.style.display = 'none';
}

// ── BTL Integration ───────────────────────────────────────
function initBTL() {
  // Zero state - no workout data yet
  const vibeEl = document.getElementById('btlVibeScore');
  if (vibeEl) vibeEl.textContent = '--';

  const providerNameEl = document.getElementById('btlProviderName');
  if (providerNameEl) providerNameEl.textContent = 'NO DEVICE';

  const badgeEl = document.getElementById('btlActivityBadge');
  if (badgeEl) {
    badgeEl.textContent = 'Connect a wearable';
    badgeEl.className = 'btl__badge btl__badge--generic';
  }

  const cats = [
    { barId: 'btlPowerBar', valId: 'btlPower' },
    { barId: 'btlFlowBar', valId: 'btlFlow' },
    { barId: 'btlGritBar', valId: 'btlGrit' },
    { barId: 'btlZenBar', valId: 'btlZen' },
  ];

  cats.forEach(({ barId, valId }) => {
    const barEl = document.getElementById(barId);
    const valEl = document.getElementById(valId);
    if (valEl) valEl.textContent = '--';
    if (barEl) barEl.style.width = '0%';
  });

  const bonusesEl = document.getElementById('btlBonuses');
  if (bonusesEl) bonusesEl.innerHTML = '';

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

  // Add to profile card sections (immediate)
  const profileCardSection = document.getElementById('profileCardSection');
  if (profileCardSection) profileCardSection.classList.add('app-animate');
  const resSection = document.getElementById('resSection');
  if (resSection) resSection.classList.add('app-animate');
  const btlSection = document.getElementById('btlSection');
  if (btlSection) btlSection.classList.add('app-animate');
  const bncoScoreSection = document.getElementById('bncoScoreSection');
  if (bncoScoreSection) bncoScoreSection.classList.add('app-animate');

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

  const goals = getPersonalGoals();

  if (goals.length === 0) {
    grid.innerHTML = '<div style="color: var(--text-muted, #888); text-align: center; padding: 20px;">No goals yet. Set one below!</div>';
    return;
  }

  grid.innerHTML = goals.map((g, idx) => {
    const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
    return `
      <div class="card card--goal">
        <div class="goal__header">
          <span class="goal__icon">${g.icon}</span>
          <span class="goal__label">${escapeHtml(g.label)}</span>
          <span class="goal__pct">${pct}%</span>
        </div>
        <div class="goal__progress-track">
          <div class="goal__progress-fill" style="width: ${pct}%"></div>
        </div>
        <div class="goal__meta">
          <span>${g.current} / ${g.target}</span>
          <button class="team-goal-item__delete" data-goal-idx="${idx}" style="margin-left:auto;">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  // Bind delete buttons
  grid.querySelectorAll('.team-goal-item__delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const goals = getPersonalGoals();
      goals.splice(parseInt(btn.dataset.goalIdx, 10), 1);
      savePersonalGoals(goals);
      renderGoals();
    });
  });
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

    const goals = getPersonalGoals();
    goals.push({
      type,
      label: labels[type] || type,
      target,
      current: 0,
      icon: icons[type] || '⭐',
    });
    savePersonalGoals(goals);

    renderGoals();
    form.reset();
  });
}

// ── Studio Challenges (Athlete Leaderboard) ───────────────
function initStudioChallenges() {
  const container = document.getElementById('studioChallengeMatchups');
  if (!container) return;
  // No fake data - empty state
  container.innerHTML = '<div style="color: var(--text-muted, #888); text-align: center; padding: 16px;">No studio challenges yet.</div>';
}

// ── Studio War Room ───────────────────────────────────────
function initStudioWarRoom() {
  renderAtRiskMembers();
}

function renderAtRiskMembers() {
  const list = document.getElementById('atRiskList');
  if (!list) return;

  // Real data from localStorage member registry
  const studioId = appState.activeStudioId || appState.studioId || 'default';
  const members = JSON.parse(localStorage.getItem('bnco_studio_members_' + studioId) || '[]');

  if (members.length === 0) {
    list.innerHTML = '<div style="color: var(--text-muted, #888); text-align: center; padding: 16px;">No members to track yet. Share your join code to grow your studio.</div>';
    return;
  }

  // Check for at-risk: members inactive > 5 days or streak = 0
  const atRisk = members.filter(m => {
    const lastActive = m.lastActive ? new Date(m.lastActive) : null;
    if (!lastActive) return true; // never active
    const daysSince = Math.floor((Date.now() - lastActive.getTime()) / 86400000);
    return daysSince > 5 || (m.streak || 0) === 0;
  });

  if (atRisk.length === 0) {
    list.innerHTML = '<div style="color: var(--text-muted, #888); text-align: center; padding: 16px;">Everyone is on track! No at-risk members.</div>';
    return;
  }

  list.innerHTML = atRisk.map(m => {
    const initials = getInitials(m.name || 'Unknown');
    const lastActive = m.lastActive ? new Date(m.lastActive) : null;
    const reason = !lastActive ? 'Never tracked a class' : 'Inactive for ' + Math.floor((Date.now() - lastActive.getTime()) / 86400000) + ' days';
    return '<div class="at-risk__item at-risk__item--medium">' +
      '<div class="at-risk__avatar">' + escapeHtml(initials) + '</div>' +
      '<div class="at-risk__info">' +
      '<div class="at-risk__name">' + escapeHtml(m.name || 'Unknown') + '</div>' +
      '<div class="at-risk__reason">' + escapeHtml(reason) + '</div>' +
      '</div>' +
      '</div>';
  }).join('');
}

// ═══════════════════════════════════════════════════════════
// SOCIAL FEATURES (Moods, Posts, Explore, Friends, Notifications, SSE)
// ═══════════════════════════════════════════════════════════

// ── Relative Time Helper ──────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return new Date(dateStr).toLocaleDateString();
}

// ── Social State ──────────────────────────────────────────
const socialState = {
  exploreFeed: [],
  exploreTab: 'for_you',
  exploreOffset: 0,
  exploreLoading: false,
  friends: [],
  pending: [],
  notifications: [],
  unreadCount: 0,
  sseCleanup: null,
};

// ── Init All Social Features ──────────────────────────────
function initSocialFeatures() {
  initNotificationBell();
  initExploreView();
  initFriendsView();
  initCreatePostModal();
  initMoodAPI();
  startSSE();
  loadNotifications();
}

// ── SSE Real-Time ─────────────────────────────────────────
function startSSE() {
  if (socialState.sseCleanup) {
    socialState.sseCleanup();
    socialState.sseCleanup = null;
  }

  const token = getToken();
  if (!token) return;

  const studioId = appState.activeStudioId || appState.studioId || '';
  const sseHandle = connectSSE(studioId, (eventType, data) => {
    if (!eventType) return;

    if (eventType === 'mood_update' || eventType === 'mood_like' || eventType === 'mood') {
      renderCommunityList();
    } else if (eventType === 'new_post' || eventType === 'post_like' || eventType === 'post') {
      const exploreView = document.getElementById('exploreView');
      if (exploreView && exploreView.style.display !== 'none') {
        loadExploreFeed();
      }
    } else if (eventType === 'notification') {
      socialState.unreadCount++;
      updateBellBadge();
      const panel = document.getElementById('notificationPanel');
      if (panel && panel.style.display !== 'none') {
        loadNotifications();
      }
    } else if (eventType === 'friend_request' || eventType === 'friend_accepted') {
      loadFriendsData();
    }
  });

  socialState.sseCleanup = sseHandle ? () => sseHandle.close() : null;
}

// ── Notification Bell ─────────────────────────────────────
function initNotificationBell() {
  const bell = document.getElementById('navNotificationBell');
  const panel = document.getElementById('notificationPanel');
  const markAllBtn = document.getElementById('markAllReadBtn');

  if (!bell || !panel) return;

  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : '';
    if (!isVisible) loadNotifications();
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== bell && !bell.contains(e.target)) {
      panel.style.display = 'none';
    }
  });

  markAllBtn?.addEventListener('click', async () => {
    await markNotificationsRead();
    socialState.unreadCount = 0;
    updateBellBadge();
    panel.querySelectorAll('.notification-item--unread').forEach(el => {
      el.classList.remove('notification-item--unread');
    });
  });
}

function updateBellBadge() {
  const badge = document.getElementById('navBellBadge');
  if (!badge) return;
  if (socialState.unreadCount > 0) {
    badge.style.display = '';
    badge.textContent = socialState.unreadCount > 99 ? '99+' : socialState.unreadCount;
  } else {
    badge.style.display = 'none';
  }
}

async function loadNotifications() {
  const result = await getNotifications();
  if (!result.ok) return;

  socialState.notifications = result.data.notifications || [];
  socialState.unreadCount = result.data.unread_count || 0;
  updateBellBadge();

  const list = document.getElementById('notificationList');
  const empty = document.getElementById('notificationEmpty');
  if (!list) return;

  if (socialState.notifications.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = socialState.notifications.map(n => {
    const unreadClass = n.is_read ? '' : ' notification-item--unread';
    const avatarHtml = n.actor_avatar
      ? '<img src="' + escapeHtml(n.actor_avatar) + '" alt="" />'
      : '<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:var(--sage-light,#e8ede9);font-weight:600;font-size:0.8rem;">' + escapeHtml(getInitials(n.actor_name || '')) + '</span>';

    let text = '';
    if (n.type === 'mood_like') text = '<strong>' + escapeHtml(n.actor_name || 'Someone') + '</strong> liked your mood';
    else if (n.type === 'post_like') text = '<strong>' + escapeHtml(n.actor_name || 'Someone') + '</strong> liked your post';
    else if (n.type === 'post_comment') text = '<strong>' + escapeHtml(n.actor_name || 'Someone') + '</strong> commented on your post';
    else if (n.type === 'friend_request') text = '<strong>' + escapeHtml(n.actor_name || 'Someone') + '</strong> sent you a friend request';
    else if (n.type === 'friend_accepted') text = '<strong>' + escapeHtml(n.actor_name || 'Someone') + '</strong> accepted your friend request';
    else text = escapeHtml(n.message || 'New notification');

    return '<div class="notification-item' + unreadClass + '" data-notif-id="' + escapeHtml(n.id) + '">' +
      '<div class="notification-item__avatar">' + avatarHtml + '</div>' +
      '<div class="notification-item__body">' +
      '<div class="notification-item__text">' + text + '</div>' +
      '<div class="notification-item__time">' + relativeTime(n.created_at) + '</div>' +
      '</div></div>';
  }).join('');
}

// ── Mood API Integration ──────────────────────────────────
function initMoodAPI() {
  // No-op: mood picking is now handled by delegated event on moodPicker in initCommunity()
}

// ── Explore View ──────────────────────────────────────────
function initExploreView() {
  const tabs = document.querySelectorAll('.explore__tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('explore__tab--active'));
      tab.classList.add('explore__tab--active');
      socialState.exploreTab = tab.dataset.tab;
      socialState.exploreOffset = 0;
      socialState.exploreFeed = [];
      loadExploreFeed();
    });
  });

  document.getElementById('createPostBtn')?.addEventListener('click', () => {
    const modal = document.getElementById('createPostModal');
    if (modal) modal.style.display = '';
  });
}

async function loadExploreFeed() {
  if (socialState.exploreLoading) return;
  socialState.exploreLoading = true;

  const feedEl = document.getElementById('exploreFeed');
  const emptyEl = document.getElementById('exploreFeedEmpty');
  const loadingEl = document.getElementById('exploreFeedLoading');

  if (loadingEl) loadingEl.style.display = '';

  const result = await getFeed(socialState.exploreTab, {
    offset: socialState.exploreOffset,
    limit: 20,
  });

  if (loadingEl) loadingEl.style.display = 'none';
  socialState.exploreLoading = false;

  if (!result.ok || !result.data) {
    if (feedEl) feedEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = '';
    return;
  }

  const posts = result.data.posts || [];
  if (socialState.exploreOffset === 0) {
    socialState.exploreFeed = posts;
  } else {
    socialState.exploreFeed = [...socialState.exploreFeed, ...posts];
  }
  renderExploreFeed();
}

function renderExploreFeed() {
  const feedEl = document.getElementById('exploreFeed');
  const emptyEl = document.getElementById('exploreFeedEmpty');
  if (!feedEl) return;

  if (socialState.exploreFeed.length === 0) {
    feedEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = '';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  const userId = appState.user?.id;

  feedEl.innerHTML = socialState.exploreFeed.map(post => {
    const avatarHtml = post.author_avatar
      ? '<img src="' + escapeHtml(post.author_avatar) + '" alt="" />'
      : '<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:var(--sage-light,#e8ede9);font-weight:600;font-size:0.85rem;">' + escapeHtml(getInitials(post.author_name || '')) + '</span>';

    const liked = post.user_liked;
    const heartIcon = liked ? '❤️' : '🤍';

    const imageHtml = post.image_url
      ? '<img class="post-card__image" src="' + escapeHtml(post.image_url) + '" alt="" loading="lazy" />'
      : '';

    const studioTag = post.studio_name
      ? '<div class="post-card__studio-tag">@ ' + escapeHtml(post.studio_name) + '</div>'
      : '';

    const commentsPreview = (post.comment_count || 0) > 0
      ? '<div class="post-card__comments-preview">View all ' + post.comment_count + ' comments</div>'
      : '';

    const deleteBtn = (post.user_id === userId)
      ? '<button class="post-card__action-btn post-card__delete-btn" data-post-id="' + escapeHtml(post.id) + '" title="Delete">🗑️</button>'
      : '';

    return '<div class="post-card" data-post-id="' + escapeHtml(post.id) + '">' +
      '<div class="post-card__header">' +
      '<div class="post-card__avatar">' + avatarHtml + '</div>' +
      '<div class="post-card__meta">' +
      '<div class="post-card__author">' + escapeHtml(post.author_name || 'Anonymous') + '</div>' +
      studioTag +
      '</div>' +
      '<div class="post-card__time">' + relativeTime(post.created_at) + '</div>' +
      '</div>' +
      imageHtml +
      '<div class="post-card__actions">' +
      '<button class="post-card__action-btn post-card__like-btn" data-post-id="' + escapeHtml(post.id) + '" data-liked="' + (liked ? 'true' : 'false') + '">' +
      '<span>' + heartIcon + '</span>' +
      '<span class="post-card__action-count">' + (post.like_count || 0) + '</span>' +
      '</button>' +
      '<button class="post-card__action-btn post-card__comment-btn" data-post-id="' + escapeHtml(post.id) + '">' +
      '<span>💬</span>' +
      '<span class="post-card__action-count">' + (post.comment_count || 0) + '</span>' +
      '</button>' +
      deleteBtn +
      '</div>' +
      '<div class="post-card__caption"><strong>' + escapeHtml(post.author_name || '') + '</strong> ' + escapeHtml(post.caption || '') + '</div>' +
      commentsPreview +
      '</div>';
  }).join('');

  // Bind like buttons
  feedEl.querySelectorAll('.post-card__like-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const postId = btn.dataset.postId;
      const isLiked = btn.dataset.liked === 'true';
      const countEl = btn.querySelector('.post-card__action-count');
      const iconEl = btn.querySelector('span:first-child');
      let count = parseInt(countEl?.textContent || '0', 10);

      if (isLiked) {
        btn.dataset.liked = 'false';
        if (iconEl) iconEl.textContent = '🤍';
        if (countEl) countEl.textContent = Math.max(0, count - 1);
        await unlikePost(postId);
      } else {
        btn.dataset.liked = 'true';
        if (iconEl) iconEl.textContent = '❤️';
        if (countEl) countEl.textContent = count + 1;
        await likePost(postId);
      }
    });
  });

  // Bind delete buttons
  feedEl.querySelectorAll('.post-card__delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this post?')) return;
      const postId = btn.dataset.postId;
      const result = await deletePost(postId);
      if (result.ok) {
        socialState.exploreFeed = socialState.exploreFeed.filter(p => p.id !== postId);
        renderExploreFeed();
      }
    });
  });

  // Bind comment buttons
  feedEl.querySelectorAll('.post-card__comment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = btn.dataset.postId;
      const card = feedEl.querySelector('.post-card[data-post-id="' + postId + '"]');
      if (!card) return;

      let commentSection = card.querySelector('.post-card__comment-section');
      if (commentSection) { commentSection.remove(); return; }

      commentSection = document.createElement('div');
      commentSection.className = 'post-card__comment-section';
      commentSection.style.cssText = 'padding: 8px 16px 12px; display: flex; gap: 8px;';
      commentSection.innerHTML = '<input type="text" class="form-input" placeholder="Add a comment..." style="flex:1; padding: 8px 12px; font-size: 0.85rem;" />' +
        '<button class="btn btn--primary btn--sm" style="white-space: nowrap;">Post</button>';

      card.appendChild(commentSection);
      const input = commentSection.querySelector('input');
      const postBtn = commentSection.querySelector('button');
      input?.focus();

      postBtn?.addEventListener('click', async () => {
        const text = input?.value?.trim();
        if (!text) return;
        const result = await commentOnPost(postId, text);
        if (result.ok) {
          commentSection.remove();
          const countEl = btn.querySelector('.post-card__action-count');
          if (countEl) countEl.textContent = parseInt(countEl.textContent || '0', 10) + 1;
        }
      });

      input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') postBtn?.click();
      });
    });
  });
}

// ── Create Post Modal ─────────────────────────────────────
function initCreatePostModal() {
  const modal = document.getElementById('createPostModal');
  const overlay = document.getElementById('createPostOverlay');
  const closeBtn = document.getElementById('createPostClose');
  const form = document.getElementById('createPostForm');
  const imageInput = document.getElementById('postImageInput');
  const preview = document.getElementById('postImagePreview');
  const previewImg = document.getElementById('postImagePreviewImg');
  const submitBtn = document.getElementById('postSubmitBtn');

  if (!modal || !form) return;

  const closeModal = () => { modal.style.display = 'none'; form.reset(); if (preview) preview.style.display = 'none'; };

  overlay?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);

  imageInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (previewImg) previewImg.src = ev.target.result;
      if (preview) preview.style.display = '';
    };
    reader.readAsDataURL(file);
  });

  // Populate studio tag dropdown
  const studioSelect = document.getElementById('postStudioTag');
  if (studioSelect) {
    const studios = appState.user?.studios || JSON.parse(localStorage.getItem('bnco_user_studios') || '[]');
    studios.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name || 'My Studio';
      studioSelect.appendChild(opt);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sharing...'; }

    const caption = document.getElementById('postCaption')?.value?.trim() || '';
    const studioTag = document.getElementById('postStudioTag')?.value || null;
    let imageUrl = null;

    const file = imageInput?.files?.[0];
    if (file) {
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve) => {
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
      const uploadResult = await uploadImage(dataUrl);
      if (uploadResult.ok) {
        imageUrl = uploadResult.data.url || dataUrl;
      } else {
        imageUrl = dataUrl;
      }
    }

    const result = await createPost({ caption, image_url: imageUrl, studio_id: studioTag });

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Share Post'; }

    if (result.ok) {
      closeModal();
      socialState.exploreOffset = 0;
      loadExploreFeed();
    } else {
      alert('Failed to create post. Try again.');
    }
  });
}

// ── Friends View ──────────────────────────────────────────
function initFriendsView() {
  const searchInput = document.getElementById('friendSearchInput');
  let searchTimeout = null;

  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (q.length < 2) {
      document.getElementById('friendSearchResults').innerHTML = '';
      return;
    }
    searchTimeout = setTimeout(() => searchFriends(q), 300);
  });
}

async function searchFriends(query) {
  const resultsEl = document.getElementById('friendSearchResults');
  if (!resultsEl) return;

  const result = await searchUsers(query);
  if (!result.ok || !result.data?.users) {
    resultsEl.innerHTML = '<p style="color:var(--text-muted,#888);padding:8px 0;">No results found.</p>';
    return;
  }

  const users = result.data.users.filter(u => u.id !== appState.user?.id);
  if (users.length === 0) {
    resultsEl.innerHTML = '<p style="color:var(--text-muted,#888);padding:8px 0;">No results found.</p>';
    return;
  }

  resultsEl.innerHTML = users.map(u => {
    const avatarHtml = u.avatar_url
      ? '<img src="' + escapeHtml(u.avatar_url) + '" alt="" />'
      : escapeHtml(getInitials(u.display_name || u.name || ''));

    const isFriend = socialState.friends.some(f => f.id === u.id);
    const isPending = socialState.pending.some(p => p.user_id === u.id || p.friend_id === u.id);

    let actionHtml = '';
    if (isFriend) actionHtml = '<span style="color:var(--sage,#7C9082);font-size:0.85rem;">Friends</span>';
    else if (isPending) actionHtml = '<span style="color:var(--text-muted,#888);font-size:0.85rem;">Pending</span>';
    else actionHtml = '<button class="btn btn--primary btn--sm friend-add-btn" data-user-id="' + escapeHtml(u.id) + '">Add</button>';

    return '<div class="friend-row">' +
      '<div class="friend-row__avatar">' + avatarHtml + '</div>' +
      '<div class="friend-row__info">' +
      '<div class="friend-row__name">' + escapeHtml(u.display_name || u.name || 'Unknown') + '</div>' +
      '</div>' +
      '<div class="friend-row__action">' + actionHtml + '</div>' +
      '</div>';
  }).join('');

  resultsEl.querySelectorAll('.friend-add-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId;
      btn.disabled = true;
      btn.textContent = 'Sent';
      await sendFriendRequest(userId);
    });
  });
}

async function loadFriendsData() {
  const result = await getMyFriends();
  if (!result.ok) return;

  socialState.friends = result.data.friends || [];
  socialState.pending = result.data.pending || [];

  renderFriendsList();
  renderPendingRequests();
}

function renderFriendsList() {
  const listEl = document.getElementById('friendsList');
  const emptyEl = document.getElementById('friendsListEmpty');
  if (!listEl) return;

  if (socialState.friends.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = '';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = socialState.friends.map(f => {
    const avatarHtml = f.avatar_url
      ? '<img src="' + escapeHtml(f.avatar_url) + '" alt="" />'
      : escapeHtml(getInitials(f.display_name || f.name || ''));

    return '<div class="friend-row">' +
      '<div class="friend-row__avatar">' + avatarHtml + '</div>' +
      '<div class="friend-row__info">' +
      '<div class="friend-row__name">' + escapeHtml(f.display_name || f.name || 'Unknown') + '</div>' +
      '</div>' +
      '<div class="friend-row__action">' +
      '<button class="btn btn--outline btn--sm friend-remove-btn" data-friendship-id="' + escapeHtml(f.friendship_id || f.id) + '" data-user-id="' + escapeHtml(f.id) + '">Remove</button>' +
      '</div></div>';
  }).join('');

  listEl.querySelectorAll('.friend-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this friend?')) return;
      const friendshipId = btn.dataset.friendshipId;
      const userId = btn.dataset.userId;
      await removeFriend(friendshipId);
      socialState.friends = socialState.friends.filter(f => f.id !== userId);
      renderFriendsList();
    });
  });
}

function renderPendingRequests() {
  const card = document.getElementById('pendingRequestsCard');
  const listEl = document.getElementById('pendingRequestsList');
  if (!card || !listEl) return;

  const incoming = socialState.pending.filter(p => p.direction === 'received');

  if (incoming.length === 0) { card.style.display = 'none'; return; }
  card.style.display = '';

  listEl.innerHTML = incoming.map(p => {
    const avatarHtml = p.avatar_url
      ? '<img src="' + escapeHtml(p.avatar_url) + '" alt="" />'
      : escapeHtml(getInitials(p.display_name || p.name || ''));

    return '<div class="friend-row">' +
      '<div class="friend-row__avatar">' + avatarHtml + '</div>' +
      '<div class="friend-row__info">' +
      '<div class="friend-row__name">' + escapeHtml(p.display_name || p.name || 'Unknown') + '</div>' +
      '<div class="friend-row__status">Wants to be friends</div>' +
      '</div>' +
      '<div class="friend-row__action" style="display:flex;gap:6px;">' +
      '<button class="btn btn--primary btn--sm friend-accept-btn" data-friendship-id="' + escapeHtml(p.friendship_id || p.id) + '">Accept</button>' +
      '<button class="btn btn--outline btn--sm friend-reject-btn" data-friendship-id="' + escapeHtml(p.friendship_id || p.id) + '">Decline</button>' +
      '</div></div>';
  }).join('');

  listEl.querySelectorAll('.friend-accept-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await respondToFriendRequest(btn.dataset.friendshipId, 'accepted');
      loadFriendsData();
    });
  });

  listEl.querySelectorAll('.friend-reject-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await respondToFriendRequest(btn.dataset.friendshipId, 'rejected');
      loadFriendsData();
    });
  });
}
