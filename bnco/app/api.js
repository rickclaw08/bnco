/* ═══════════════════════════════════════════════════════════
   BNCO - API Client Module
   Handles all backend communication, auth tokens, error handling
   ═══════════════════════════════════════════════════════════ */

// Base URL - configurable via Vite env or defaults to localhost
const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';

// ── Token Management ──────────────────────────────────────

const TOKEN_KEY = 'bnco_auth_token';
const REFRESH_KEY = 'bnco_refresh_token';
const USER_KEY = 'bnco_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_KEY, token);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Core Request Helper ───────────────────────────────────

let isRefreshing = false;
let refreshQueue = [];

/**
 * Structured error returned by all API methods on failure.
 * @typedef {Object} ApiError
 * @property {boolean} ok - always false
 * @property {number} status - HTTP status code (0 for network errors)
 * @property {string} message - human-readable error message
 * @property {Object|null} errors - validation errors from server, if any
 */

/**
 * Make an authenticated request to the API.
 * Automatically attaches Bearer token and handles 401 refresh.
 */
async function request(path, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    skipAuth = false,
    isRetry = false,
  } = options;

  const url = `${API_BASE}${path}`;

  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions = {
    method,
    headers: reqHeaders,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: 'Network error. Check your connection.',
      errors: null,
    };
  }

  // Handle 401 - attempt token refresh
  if (response.status === 401 && !skipAuth && !isRetry) {
    const refreshResult = await attemptTokenRefresh();
    if (refreshResult) {
      // Retry original request with new token
      return request(path, { ...options, isRetry: true });
    }
    // Refresh failed - clear tokens, signal auth required
    clearTokens();
    window.dispatchEvent(new CustomEvent('bnco:auth-required'));
    return {
      ok: false,
      status: 401,
      message: 'Session expired. Please log in again.',
      errors: null,
    };
  }

  // Parse response
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: data?.message || data?.error || `Request failed (${response.status})`,
      errors: data?.errors || null,
    };
  }

  return {
    ok: true,
    status: response.status,
    data,
  };
}

/**
 * Attempt to refresh the auth token using the refresh token.
 */
async function attemptTokenRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (isRefreshing) {
    // Queue this request to wait for refresh
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      isRefreshing = false;
      refreshQueue.forEach(cb => cb(false));
      refreshQueue = [];
      return false;
    }

    const data = await response.json();
    setToken(data.token || data.access_token);
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
    }

    isRefreshing = false;
    refreshQueue.forEach(cb => cb(true));
    refreshQueue = [];
    return true;
  } catch {
    isRefreshing = false;
    refreshQueue.forEach(cb => cb(false));
    refreshQueue = [];
    return false;
  }
}

// ── Auth Endpoints ────────────────────────────────────────

/**
 * Register a new user.
 * @param {Object} params - { email, password, display_name }
 */
export async function register({ email, password, display_name }) {
  const result = await request('/auth/register', {
    method: 'POST',
    body: { email, password, name: display_name },
    skipAuth: true,
  });

  if (result.ok && result.data) {
    if (result.data.token) setToken(result.data.token);
    if (result.data.refresh_token) setRefreshToken(result.data.refresh_token);
    if (result.data.user) setCachedUser(result.data.user);
  }

  return result;
}

/**
 * Log in with email/password.
 * @param {Object} params - { email, password }
 */
export async function login({ email, password }) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });

  if (result.ok && result.data) {
    if (result.data.token) setToken(result.data.token);
    if (result.data.refresh_token) setRefreshToken(result.data.refresh_token);
    if (result.data.user) setCachedUser(result.data.user);
  }

  return result;
}

/**
 * Authenticate via Google Sign-In.
 * @param {string} credential - Google ID token from GSI
 */
export async function googleAuth(credential) {
  const result = await request('/auth/google', {
    method: 'POST',
    body: { google_token: credential },
    skipAuth: true,
  });

  if (result.ok && result.data) {
    if (result.data.token) setToken(result.data.token);
    if (result.data.refresh_token) setRefreshToken(result.data.refresh_token);
    if (result.data.user) setCachedUser(result.data.user);
  }

  return result;
}

// ── User Endpoints ────────────────────────────────────────

/**
 * Get the current user's profile.
 */
export async function getProfile() {
  const result = await request('/users/me');
  if (result.ok && result.data) {
    setCachedUser(result.data);
  }
  return result;
}

// ── Workout Endpoints ─────────────────────────────────────

/**
 * Submit a new workout.
 * @param {Object} workoutData - workout payload
 */
export async function submitWorkout(workoutData) {
  return request('/workouts', {
    method: 'POST',
    body: workoutData,
  });
}

/**
 * Get the current user's workouts.
 * @param {Object} params - optional filters { limit, offset, from, to }
 */
export async function getMyWorkouts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/workouts/me?${qs}` : '/workouts/me';
  return request(path);
}

/**
 * Get the current user's aggregated stats.
 */
export async function getMyStats() {
  return request('/workouts/me/stats');
}

// ── Studio Endpoints ──────────────────────────────────────

/**
 * Get available studios. Supports search query.
 * @param {Object} params - { q, city, limit }
 */
export async function getStudios(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/studios?${qs}` : '/studios';
  return request(path);
}

/**
 * Join a studio.
 * @param {string} studioId
 */
export async function joinStudio(studioId) {
  return request(`/studios/${studioId}/join`, {
    method: 'POST',
  });
}

/**
 * Get leaderboard for a studio.
 * @param {string} studioId
 * @param {Object} params - { scope, period }
 */
export async function getLeaderboard(studioId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const path = qs
    ? `/studios/${studioId}/leaderboard?${qs}`
    : `/studios/${studioId}/leaderboard`;
  return request(path);
}

/**
 * Get the active goal/mission for a studio.
 * @param {string} studioId
 */
export async function getGoal(studioId) {
  return request(`/studios/${studioId}/goal`);
}

// ── Lobby Endpoints ───────────────────────────────────────

/**
 * Get the lobby feed data for a studio.
 * @param {string} slug - studio slug
 */
export async function getLobbyFeed(slug) {
  return request(`/lobby/${slug}/feed`, { skipAuth: true });
}

/**
 * Create an SSE connection to the lobby stream.
 * @param {string} slug - studio slug
 * @returns {EventSource}
 */
export function createLobbyStream(slug) {
  return new EventSource(`${API_BASE}/lobby/${slug}/stream`);
}

// ── Onboarding Endpoints ──────────────────────────────────

/**
 * Complete onboarding.
 * @param {Object} data - { studio_id, frequency, devices }
 */
export async function completeOnboarding(data) {
  return request('/onboarding/complete', {
    method: 'POST',
    body: data,
  });
}

// ── Device Endpoints ──────────────────────────────────────

/**
 * Get user's connected devices.
 */
export async function getDevices() {
  return request('/users/me/devices');
}

/**
 * Initiate WHOOP OAuth connection.
 * Returns { auth_url } to redirect/open.
 */
export async function connectWhoop() {
  return request('/users/me/devices/whoop', {
    method: 'POST',
  });
}

/**
 * Disconnect WHOOP device.
 */
export async function disconnectWhoop() {
  return request('/users/me/devices/whoop', {
    method: 'DELETE',
  });
}

/**
 * Trigger a manual WHOOP data sync.
 * Pulls recent workouts from WHOOP API into our database.
 */
export async function syncWhoop() {
  return request('/users/me/devices/whoop/sync', {
    method: 'POST',
  });
}

/**
 * Get WHOOP sync status (last sync time, connection state).
 */
export async function getWhoopStatus() {
  return request('/users/me/devices/whoop/status');
}

/**
 * Sync Apple Health workout data.
 * Accepts an array of workout sessions from the iOS app.
 * @param {Array} workouts - array of workout objects
 */
export async function syncAppleHealth(workouts) {
  return request('/users/me/devices/apple/sync', {
    method: 'POST',
    body: { workouts },
  });
}

/**
 * Get Apple Health sync status.
 */
export async function getAppleHealthStatus() {
  return request('/users/me/devices/apple/status');
}

// ── Export API base for external use ──────────────────────

export { API_BASE };
