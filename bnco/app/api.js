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
      data: data || null,
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

/**
 * Update the current user's profile (e.g., role, display_name).
 * @param {Object} data - fields to update
 */
export async function updateUserProfile(data) {
  return request('/users/me', {
    method: 'PATCH',
    body: data,
  });
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
 * Create a new studio.
 * @param {Object} data - { name, slug, city, state }
 */
export async function createStudio(data) {
  return request('/studios', { method: 'POST', body: data });
}

/**
 * Get the join code for a studio (owner only).
 * @param {string} studioId
 */
export async function getJoinCode(studioId) {
  return request(`/studios/${studioId}/join-code`);
}

/**
 * Join a studio via invite code.
 * @param {string} code - the join code
 */
export async function joinByCode(code) {
  return request('/studios/join-by-code', { method: 'POST', body: { code } });
}

/**
 * Get studio members (admin only).
 * @param {string} studioId
 */
export async function getStudioMembers(studioId) {
  return request(`/studios/${studioId}/members`);
}

/**
 * Get team goals for a studio.
 * @param {string} studioId
 */
export async function getTeamGoalsAPI(studioId) {
  return request(`/studios/${studioId}/team-goals`);
}

/**
 * Create a team goal (studio owner only).
 * @param {string} studioId
 * @param {Object} goal - { name, type, target, reward, start_date, end_date }
 */
export async function createTeamGoal(studioId, goal) {
  return request(`/studios/${studioId}/team-goals`, { method: 'POST', body: goal });
}

/**
 * Delete a team goal (studio owner only).
 * @param {string} studioId
 * @param {string} goalId
 */
export async function deleteTeamGoal(studioId, goalId) {
  return request(`/studios/${studioId}/team-goals/${goalId}`, { method: 'DELETE' });
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
    method: 'GET',
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

/**
 * Delete account and all associated data.
 */
export async function deleteAccount() {
  return request('/users/me', { method: 'DELETE' });
}

// ── Export API base for external use ──────────────────────

export { API_BASE };

// ============================================================
// SOCIAL API (Moods, Posts, Friends, Notifications)
// ============================================================

// ── Moods ─────────────────────────────────────────────────

export async function setMood(emoji, studioId) {
  return request('/social/moods', { method: 'POST', body: { emoji, studio_id: studioId || null } });
}

export async function getStudioMoods(studioId) {
  return request(`/social/moods/studio/${studioId}`);
}

export async function getUserMood(userId) {
  return request(`/social/moods/user/${userId}`);
}

export async function likeMood(moodId) {
  return request(`/social/moods/${moodId}/like`, { method: 'POST' });
}

export async function unlikeMood(moodId) {
  return request(`/social/moods/${moodId}/like`, { method: 'DELETE' });
}

// ── Posts ─────────────────────────────────────────────────

export async function createPost({ image_url, caption, studio_id, city, state, lat, lng }) {
  return request('/social/posts', { method: 'POST', body: { image_url, caption, studio_id, city, state, lat, lng } });
}

export async function getFeed(tab, { limit, offset, lat, lng } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (offset) params.set('offset', offset);
  if (lat) params.set('lat', lat);
  if (lng) params.set('lng', lng);
  return request(`/social/posts/feed/${tab}?${params.toString()}`);
}

export async function getPost(postId) {
  return request(`/social/posts/${postId}`);
}

export async function likePost(postId) {
  return request(`/social/posts/${postId}/like`, { method: 'POST' });
}

export async function unlikePost(postId) {
  return request(`/social/posts/${postId}/like`, { method: 'DELETE' });
}

export async function commentOnPost(postId, body) {
  return request(`/social/posts/${postId}/comments`, { method: 'POST', body: { body } });
}

export async function deletePost(postId) {
  return request(`/social/posts/${postId}`, { method: 'DELETE' });
}

export async function uploadImage(imageDataUri) {
  return request('/social/upload', { method: 'POST', body: { image: imageDataUri } });
}

// ── Friends ───────────────────────────────────────────────

export async function sendFriendRequest(userId) {
  return request('/social/friends/request', { method: 'POST', body: { user_id: userId } });
}

export async function respondToFriendRequest(friendshipId, action) {
  return request(`/social/friends/${friendshipId}`, { method: 'PATCH', body: { action } });
}

export async function removeFriend(friendshipId) {
  return request(`/social/friends/${friendshipId}`, { method: 'DELETE' });
}

export async function getMyFriends() {
  return request('/social/friends');
}

export async function getUserFriends(userId) {
  return request(`/social/friends/user/${userId}`);
}

// ── Notifications ─────────────────────────────────────────

export async function getNotifications(limit) {
  return request(`/social/notifications?limit=${limit || 30}`);
}

export async function markNotificationsRead(ids) {
  return request('/social/notifications/read', { method: 'PATCH', body: { ids: ids || [] } });
}

// ── Search & Profiles ─────────────────────────────────────

export async function searchUsers(query) {
  return request(`/social/users/search?q=${encodeURIComponent(query)}`);
}

export async function getUserProfile(userId) {
  return request(`/social/users/${userId}/profile`);
}

export async function updatePrivacy(isPrivate) {
  return request('/social/users/privacy', { method: 'PATCH', body: { is_private: isPrivate } });
}

// ── Real-time SSE ─────────────────────────────────────────

export function connectSSE(studioId, onEvent) {
  const token = localStorage.getItem('bnco_token');
  if (!token) return null;

  const params = new URLSearchParams({ studio_id: studioId || '' });
  const url = `${API_BASE}/social/stream?${params.toString()}`;

  // EventSource doesn't support custom headers, so pass token as query param
  // We need a small workaround - use fetch-based SSE
  const controller = new AbortController();

  fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
    signal: controller.signal,
  }).then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    function read() {
      reader.read().then(({ done, value }) => {
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = 'message';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onEvent(eventType, data);
            } catch (e) {
              // skip malformed
            }
            eventType = 'message';
          }
        }
        read();
      }).catch(() => {});
    }
    read();
  }).catch(() => {});

  return { close: () => controller.abort() };
}
