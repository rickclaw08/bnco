# CHANGELOG - Wearable Settings & Role-Based Onboarding

**Date:** 2026-03-04
**Author:** Ethan (Backend/Fullstack Lead)

---

## Task 1: Wearable Connection Settings Page

### Frontend (app/)

**index.html**
- Added Settings section (`#settingsSection`) after Achievements in the athlete view
- Includes Connected Devices card (WHOOP + Apple Watch) with status indicators
- Includes Data Privacy card with leaderboard visibility toggle
- Added gear icon button (`#navSettingsBtn`) in the nav bar next to user avatar

**settings.js** (new)
- `initSettings()` - binds events, loads device status, handles WHOOP callback
- `loadDeviceStatus()` - fetches from `GET /api/users/me/devices`
- `handleWhoopAction()` - connects via `POST /api/users/me/devices/whoop` (opens OAuth in new window) or disconnects via `DELETE /api/users/me/devices/whoop`
- `handleWhoopCallback()` - detects `?whoop=connected` URL param after OAuth redirect
- `renderDeviceStatus()` - updates status dots (green pulse = syncing, gray = disconnected)
- `renderDevicesList()` - shows "Active Connections" summary
- Privacy toggle persisted to `localStorage`

**api.js**
- Added `getDevices()` - GET /users/me/devices
- Added `connectWhoop()` - POST /users/me/devices/whoop
- Added `disconnectWhoop()` - DELETE /users/me/devices/whoop

**style.css**
- Added `.settings-grid`, `.settings__device`, `.settings__device-status--connected/--disconnected`
- `.settings__appstore-badge` for Apple Watch App Store placeholder
- `.settings__privacy-item` for toggle row
- `.nav__settings-btn` gear icon styling
- Responsive breakpoints for 480px and 768px

**main.js**
- Imported and initialized `initSettings()` in `initAppUI()`

### Backend (src/connect-layer/src/routes/user.routes.js)

- `GET /users/me/devices` - returns list of connected devices (WHOOP, Apple Watch) from user record
- `POST /users/me/devices/whoop` - initiates WHOOP OAuth (stub mode returns frontend redirect if no WHOOP credentials configured)
- `GET /users/me/devices/whoop/callback` - handles WHOOP OAuth callback, exchanges code for tokens, stores in DB
- `DELETE /users/me/devices/whoop` - nulls out WHOOP tokens/user ID
- `POST /users/me/devices/apple` - confirms Apple Watch connection

---

## Task 2: Separate Athlete vs Studio Login Flows

### Frontend (app/)

**onboarding.js** (rewritten)
- Step 0: Role Selector - "I'm an Athlete" / "I'm a Studio Owner" cards
- Role selection sets `selectedRole` and routes to the correct flow

**Athlete Flow (3 steps):**
1. "Which studio do you train at?" - studio search/select (unchanged behavior)
2. "Connect your wearable" - WHOOP OAuth button + Apple Watch toggle
3. "How often do you train?" - frequency selector (1-2/3-4/5-6/7+)

**Studio Owner Flow (3 steps):**
1. "Register your studio" - name, location, studio type (pilates/reformer/barre/HIIT/yoga/hybrid)
2. "Studio settings" - public leaderboard toggle, anonymous mode toggle
3. "Invite your members" - generated BNCO-XXXX code with copy button

- Each flow sends role-specific payload to `POST /api/onboarding/complete`
- Back button on step 1 returns to role selector
- Skip buttons available on relevant steps

**auth.js**
- Register form submit now always dispatches `needsOnboarding: true` so the role selector appears

**style.css**
- `.role-selector`, `.role-selector__card`, `.role-selector__card--active`
- `.studio-onboarding__field`, `.studio-onboarding__type-grid`, `.studio-onboarding__type-btn`
- `.studio-onboarding__invite-code`, `.studio-onboarding__invite-copy`
- `.studio-onboarding__leaderboard-option`
- Responsive for mobile (480px)

---

## Design Consistency
- All new UI uses the existing palette: cream (#F5F0EB), sage (#7C9082), blush (#D4A5A5), terracotta (#C4917A), charcoal (#2D2D2D)
- Typography: Outfit headings, DM Sans body
- Card styles, shadows, border-radius match existing `.card` patterns
- Toggle uses existing `.toggle` / `.toggle__slider` classes
- No em dashes used anywhere

## Build Verification
- `vite build` passes cleanly (exit code 0)
- 11 modules transformed, output in dist/
