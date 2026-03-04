# Frontend Upgrade Changelog

**Date:** 2026-03-04
**Author:** Kai (R&D/Tech Lead)
**Scope:** Upgrade BNCO frontend from static demo to production-ready API-connected app

---

## Summary

Transformed the static demo app into a functional frontend that connects to the BNCO backend API. Added authentication, onboarding, real-time lobby display, and maintained full backward compatibility with existing demo data as fallback.

---

## New Files

### `api.js` - API Client Module
- Configurable base URL via `VITE_API_URL` environment variable (default: `http://localhost:3001/api`)
- Token management in localStorage (auth token + refresh token + cached user)
- Automatic 401 handling with token refresh and retry queue
- Structured error responses on all methods (`{ ok, status, message, errors }`)
- All backend endpoints covered:
  - Auth: `register()`, `login()`, `googleAuth()`
  - User: `getProfile()`
  - Workouts: `submitWorkout()`, `getMyWorkouts()`, `getMyStats()`
  - Studios: `getStudios()`, `joinStudio()`, `getLeaderboard()`, `getGoal()`
  - Lobby: `getLobbyFeed()`, `createLobbyStream()` (SSE)
  - Onboarding: `completeOnboarding()`

### `auth.js` - Authentication Module
- Login/Register modal with tab switching UI
- Google Sign-In integration via GSI library (lazy-loaded)
- Session management: `checkAuthState()`, `getCurrentUser()`, `isLoggedIn()`, `logout()`
- Custom events: `bnco:auth-success`, `bnco:auth-required`
- Loading states and error display
- Matches dark Pilates aesthetic with glass-morphism design

### `onboarding.js` - Onboarding Flow
- 3-step onboarding matching backend expectations:
  1. **Studio Selection** - search + select from API with debounced search
  2. **Frequency** - grid selector (1-2, 3-4, 5-6, 7+/week) with descriptive tags
  3. **Device Connection** - WHOOP OAuth button + Apple Watch toggle
- Progress bar with step indicators
- Skip options at each step
- Submits to `/api/onboarding/complete` on finish
- Animated step transitions

### `lobby.html` + `lobby.js` - Studio TV Lobby Display
- Standalone page accessed via `/lobby.html?studio=<slug>`
- Full-screen, auto-refreshing layout designed for studio TVs
- Displays: weekly goal progress, athlete of the week, top 5 leaderboard, active challenges
- SSE connection to `/api/lobby/:slug/stream` for real-time updates
- Named event listeners for granular updates (`goal`, `leaderboard`, `athlete`, `challenges`)
- Exponential backoff reconnection (max 30s)
- Fallback to HTTP polling every 60s
- Connection status indicator
- Demo data fallback when API unavailable
- Live clock in footer

### `vite.config.js` - Build Configuration
- Multi-page entry points: `index.html` + `lobby.html`
- Dev server proxy: `/api` routes to `http://localhost:3001`

### `.env.example` - Environment Configuration
- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_CLIENT_ID` - Google Sign-In client ID

---

## Modified Files

### `main.js` - Complete Overhaul
- **Imports** auth, api, onboarding modules
- **Auth flow**: On load checks auth state, shows login modal or loads app
- **API integration**: Profile, leaderboard, stats, missions all fetched from API
- **Demo fallback**: When not authenticated or API fails, uses original hardcoded data
- **Loading states**: Cards show shimmer animation during API calls
- **Event handling**: Listens for `bnco:auth-success` and `bnco:auth-required`
- **Onboarding**: Triggers onboarding flow when `needs_onboarding: true`
- **Nav updates**: Avatar shows user initials, level badge from real XP
- **Logout**: Click avatar to log out (with confirmation)
- **CTA guards**: Hero CTA buttons require auth before navigating

### `style.css` - Extended (No Breaking Changes)
All new styles appended after existing rules:
- **Auth modal**: Full-screen overlay, glass card, tab toggle, error display, spinner
- **Onboarding**: Progress bar, step dots, studio search dropdown, frequency grid, device cards
- **Loading states**: Skeleton shimmer animation, pulse animation
- **Error states**: Icon + message + retry button component
- **Lobby page**: Full-screen grid layout, goal progress bar, leaderboard rows, challenge bars, live indicator, connection status, responsive
- **Mobile overrides**: Auth and onboarding responsive adjustments

---

## Architecture Decisions

1. **Module separation**: API, auth, and onboarding are independent ES modules that communicate via custom events and imports. No global state pollution.

2. **Graceful degradation**: Every API call has a demo data fallback. The app works offline/without backend as a static demo, identical to the original.

3. **Token refresh**: Uses a queue pattern so concurrent 401s don't trigger multiple refresh attempts.

4. **SSE for lobby**: Server-Sent Events chosen over WebSocket for simplicity and automatic reconnection. Named events allow targeted UI updates.

5. **No new dependencies**: Everything built with vanilla JS/CSS. No React, no Tailwind, no state management library. Keeps the bundle small and the aesthetic consistent.

---

## Build Verification

```
vite v7.3.1 building client environment for production...
✓ 10 modules transformed.
dist/lobby.html                 3.70 kB
dist/index.html                24.13 kB
dist/assets/api-bXtH_l9O.css   48.52 kB
dist/assets/api-plaE8Nj4.js     3.92 kB
dist/assets/lobby-CoxqkAF7.js   4.68 kB
dist/assets/main-BekZHNDz.js   41.86 kB
✓ built in 111ms
```

Zero errors. Zero warnings.
