# BNCO - CLO Legal & Compliance Audit Report

**Prepared by:** Quinn, Chief Legal Officer  
**Date:** March 4, 2026  
**Scope:** Full legal, compliance, and security audit of the BNCO web application  
**Frontend:** https://bnco.studio (GitHub Pages)  
**Backend API:** https://bnco-api.fly.dev  

---

## Executive Summary

BNCO is a gamified B2B2C Pilates platform that collects health/biometric data, processes payments, and uses Google OAuth. The app has a draft Privacy Policy (in `ios-metadata/`) but is missing critical legal infrastructure. Several security vulnerabilities exist in the frontend code. The platform cannot legally launch to the public in its current state.

**Findings by severity:**  
- CRITICAL: 7  
- HIGH: 8  
- MEDIUM: 6  
- LOW: 5  

---

## CRITICAL FINDINGS (Must Fix Before Any Public Launch)

### C-1: Google Places API Key Hardcoded in Frontend Source

**What:** The file `app/onboarding.js` (line 9) contains a hardcoded Google Places API key as a fallback:  
```
const PLACES_API_KEY = import.meta.env?.VITE_PLACES_API_KEY || 'AIzaSyDp8gHtmxcJ5tnsmUz7YDm8wwpR3qJXBgs';
```
This key is exposed in the production JavaScript bundle and used in at least 4 places to call Google Places APIs.

**Why it matters:** Anyone can extract this key from the browser and use it for their own purposes, running up charges on your Google Cloud account. This also creates abuse vectors (scraping, quota exhaustion). Google considers exposed API keys a security incident.

**Fix:**  
1. Immediately rotate this API key in Google Cloud Console.  
2. Remove the hardcoded fallback. Only use the env variable.  
3. Apply API key restrictions in GCP: restrict by HTTP referrer (only `bnco.studio` and `localhost`) and restrict to Places API only.  
4. Consider proxying Places requests through your backend so the key never reaches the client.

---

### C-2: No Terms of Service Published or Linked

**What:** The footer of `index.html` contains `<a href="#">Terms</a>` - a dead link. There is no Terms of Service document anywhere in the codebase. The settings page also links to `<a href="#" class="settings__about-link">Terms of Service</a>` - another dead link.

**Why it matters:** Without enforceable Terms of Service, you have no legal basis to:  
- Limit liability for injuries or incorrect health data  
- Terminate abusive accounts  
- Establish governing law and dispute resolution  
- Protect your intellectual property  
- Define acceptable use of the platform  
- Disclaim warranties on health/fitness data accuracy  

For a fitness/health platform, this is especially dangerous. If someone relies on inaccurate biometric scoring and gets injured, you have no liability shield.

**Fix:** Draft and publish a Terms of Service before any public launch. See Section 6 below for required content outline.

---

### C-3: Privacy Policy Not Linked or Accessible in the App

**What:** A draft Privacy Policy exists at `app/ios-metadata/privacy-policy.md`, but it is not served at any URL. The app links `<a href="#">Privacy</a>` and `<a href="#" class="settings__about-link">Privacy Policy</a>` - both are dead `#` links.

**Why it matters:** Under CCPA and GDPR, a privacy policy must be "conspicuously available" at the point of data collection. Linking to `#` (nowhere) means you have no compliant privacy disclosure. This exposes the company to regulatory action and fines.

**Fix:**  
1. Host the Privacy Policy at `https://bnco.studio/privacy` (or similar).  
2. Update all `href="#"` links in `index.html` to point to the actual URL.  
3. Review and finalize the draft policy (see C-4 for issues with the current draft).  
4. The policy must be accessible BEFORE account creation, not just after.

---

### C-4: Privacy Policy Draft Has Gaps and Inaccuracies

**What:** The existing draft in `ios-metadata/privacy-policy.md` has several problems:  
- References "Fitbit" and "Garmin" as connected devices, but the app only supports WHOOP and Apple Health.  
- References "Relative Effort Score (RES)" which does not appear in the codebase (the app uses "Vibe Score" and "BNCO Score").  
- Does not mention collection of birthday, gender, or geolocation data (all collected during onboarding).  
- Does not mention Google OAuth data collection (name, email, profile picture from Google).  
- Does not specify data retention for WHOOP tokens stored in the database.  
- Contact email (`support@bnco.studio`) likely does not exist yet.  
- No mention of cookies or localStorage usage (the app stores auth tokens, user data, theme preferences, and profile photos in localStorage).

**Why it matters:** An inaccurate privacy policy is arguably worse than no policy. It creates a false representation of data practices and exposes you to FTC enforcement for deceptive practices.

**Fix:** Rewrite the Privacy Policy to accurately reflect current data collection, including: birthday, gender, geolocation, Google profile data, WHOOP tokens, Apple Health data, localStorage usage, and all actual scoring metrics.

---

### C-5: No Account Deletion or Data Export Capability

**What:** There is no endpoint or UI for users to delete their account or export their data. Searching the backend code for "delete account," "DELETE user," "data export," "GDPR," or "CCPA" returns zero results.

**Why it matters:**  
- **GDPR (EU users):** Article 17 "Right to Erasure" requires the ability to delete personal data on request.  
- **CCPA (California users):** Requires the right to delete and the right to know/access data.  
- **Apple App Store:** Requires account deletion functionality for all apps (if you plan an iOS release, this is mandatory).  
- The existing Privacy Policy (draft) promises users can "Delete your account and associated data" - a promise the app cannot currently fulfill.

**Fix:**  
1. Add a `DELETE /api/users/me` endpoint that cascades: deletes user record, workout sessions, studio memberships, onboarding data, and clears WHOOP tokens.  
2. Add a `GET /api/users/me/export` endpoint that returns all user data in JSON or CSV format.  
3. Add a "Delete My Account" button in Settings.  
4. Implement a 30-day grace period for recovery (optional, but recommended).

---

### C-6: WHOOP OAuth Tokens Stored in Plaintext in Database

**What:** WHOOP access tokens and refresh tokens are stored directly in the `users` table columns (`whoop_token`, `whoop_refresh_token`) without encryption. The code in `user.routes.js` line 192 writes them as plaintext:
```sql
UPDATE users SET whoop_token = $1, whoop_refresh_token = $2 ...
```

**Why it matters:** WHOOP tokens grant access to users' biometric data (heart rate, strain, recovery, HRV). If the database is compromised, an attacker gains access to every connected user's WHOOP account. This is a health data breach. Under state health data privacy laws and potentially HIPAA (if B2B partners are covered entities), this is a serious liability.

**Fix:**  
1. Encrypt tokens at rest using AES-256 before storing in the database.  
2. Store the encryption key in a secrets manager (not in .env files or code).  
3. Alternatively, use PostgreSQL `pgcrypto` extension for column-level encryption.  

---

### C-7: Billing API Keys Stored Without Encryption (TODO in Code)

**What:** In `membership.routes.js` line 112, there is a comment:
```javascript
// In production: encrypt api_key before storing
[studioId, provider, api_key, api_endpoint] // TODO: encrypt api_key
```
Studio billing API keys (for Stripe, MindBody, Mariana Tek integrations) are stored as plaintext in the `studio_billing_integrations` table.

**Why it matters:** Billing API keys provide access to payment systems. Plaintext storage in the database means a data breach exposes every studio's payment infrastructure. This violates PCI-DSS requirements for protecting payment credentials.

**Fix:**  
1. Implement encryption before storage (AES-256-GCM recommended).  
2. Never store raw API keys. Encrypt on write, decrypt on read.  
3. This is marked as a TODO - it needs to be resolved before launch, not after.

---

## HIGH FINDINGS (Should Fix Soon)

### H-1: No Cookie/Local Storage Consent Mechanism

**What:** The app stores the following in localStorage without user consent:  
- `bnco_auth_token` (JWT auth token)  
- `bnco_refresh_token` (refresh token)  
- `bnco_user` (full user profile as JSON)  
- `bnco_pfp` (profile photo as base64 data URL)  
- `bnco_user_role`, `bnco_current_view`, `bnco_theme`  
- `bnco_leaderboard_visible`  

No cookie banner, consent dialog, or localStorage notice is presented.

**Why it matters:** Under GDPR/ePrivacy Directive, storing non-essential data on a user's device requires informed consent. While strictly essential auth tokens may qualify for an exemption, user preferences (theme, leaderboard visibility) and cached profile data do not.

**Fix:**  
1. Add a cookie/storage consent banner for EU users.  
2. Separate essential storage (auth tokens) from non-essential (preferences, cached user data).  
3. Only set non-essential localStorage items after consent.

---

### H-2: No Refund Policy or Subscription Cancellation Disclosure

**What:** The app offers two paid plans: $549/mo and $2,000 lifetime. Stripe payment links are used directly. There is no refund policy, cancellation policy, or auto-renewal disclosure anywhere in the codebase or UI.

**Why it matters:**  
- **FTC Act:** Auto-renewing subscriptions require clear disclosure of recurring charges, cancellation methods, and consent before billing.  
- **California Auto-Renewal Law (ARL):** Requires clear terms, affirmative consent, and easy cancellation for any auto-renewal plan. Violations carry penalties of up to $2,500 per violation.  
- **Stripe ToS:** Merchants are expected to clearly communicate pricing and refund terms.  
- The `index.html` mentions "No recurring charges ever" under the lifetime plan, which is good, but the monthly plan says nothing about auto-renewal.

**Fix:**  
1. Add a Refund Policy page (even if the policy is "no refunds," it must be stated).  
2. Add auto-renewal disclosure on the monthly pricing card: "Renews monthly at $549/mo. Cancel anytime."  
3. Add cancellation instructions (link to Stripe customer portal or manual process).  
4. Ensure consent is captured before redirecting to Stripe checkout.

---

### H-3: JWT Has No Refresh Token Rotation

**What:** The `/auth/refresh` endpoint (line ~128, `auth.routes.js`) accepts the expired access token itself in the Authorization header, verifies it with `ignoreExpiration: true`, and issues a new token. There is no actual refresh token stored server-side. The frontend stores a "refresh token" in localStorage (`bnco_refresh_token`), but the backend refresh endpoint does not use it.

**Why it matters:** If a JWT is stolen, an attacker can refresh it indefinitely - the token never truly expires. This eliminates the security benefit of short-lived tokens. Additionally, using `ignoreExpiration: true` means any stolen token (even years old) can be used to get a fresh one.

**Fix:**  
1. Implement proper refresh tokens: generate a separate opaque refresh token on login, store a hash of it server-side, and require it for refresh.  
2. Implement refresh token rotation: issue a new refresh token each time the old one is used, and invalidate the old one.  
3. Add a maximum token age that cannot be bypassed with `ignoreExpiration`.  
4. Consider a token revocation mechanism (blacklist in Redis).

---

### H-4: No Health Data Disclaimer

**What:** The app calculates health-related scores (BNCO Score, Control Score, Stillness Score, Respiratory Score) from biometric data. There is no disclaimer that these are for entertainment/informational purposes only and not medical advice.

**Why it matters:** If a user interprets their "Vibe Score" as a health indicator and makes medical decisions based on it, BNCO could face negligence claims. Health apps that do not provide medical disclaimers have been successfully sued.

**Fix:**  
1. Add a visible disclaimer in the app: "BNCO scores are for entertainment and fitness tracking purposes only. They are not medical advice. Consult your healthcare provider before making health decisions."  
2. Include this disclaimer in the Terms of Service.  
3. Display it during onboarding when connecting wearables.

---

### H-5: Google OAuth Client ID Hardcoded in Frontend

**What:** `auth.js` line 264 contains a hardcoded Google OAuth Client ID as a fallback:
```
const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '912618975610-b36sq6pqjfgkme3j2c99im002jglpb5q.apps.googleusercontent.com';
```

**Why it matters:** While Google OAuth Client IDs are semi-public by nature (they appear in the auth flow), hardcoding them as fallbacks means you cannot easily rotate them if compromised. The Client ID combined with the Client Secret (which should be server-side only) is the full credential. An attacker knowing the exact Client ID can craft more convincing phishing pages that mimic your OAuth flow.

**Fix:**  
1. Remove the hardcoded fallback. Require it to be set via environment variable at build time.  
2. Verify the Client Secret is never in frontend code (confirmed: it is not - good).  
3. Ensure authorized redirect URIs in GCP are locked to only your domains.

---

### H-6: Health Data (WHOOP/Apple Health) - HIPAA Considerations

**What:** BNCO collects heart rate, HRV, respiratory rate, muscular strain, and recovery data from WHOOP and Apple Health. This is biometric/health data. The data is shared with studio owners who can see individual member performance.

**Why it matters:**  
- BNCO itself is likely not a HIPAA-covered entity (it is not a healthcare provider, health plan, or clearinghouse). However:  
- If any B2B studio partner IS a covered entity (e.g., a physical therapy studio), then BNCO could become a Business Associate, triggering HIPAA obligations.  
- Several states have health data privacy laws beyond HIPAA: Washington's My Health My Data Act, Connecticut's health privacy law, and others. These apply to ALL entities handling health data, not just covered entities.  
- The app collects and displays individual biometric data to studio owners without explicit consent for that specific sharing.

**Fix:**  
1. Add explicit consent during onboarding: "Your biometric data will be shared with your studio owner for leaderboard and performance tracking purposes."  
2. Prepare a BAA (Business Associate Agreement) template for studio partners who are covered entities.  
3. Review state-specific health data laws (WA, CT, NV, CO) and ensure compliance.  
4. Consider allowing athletes to opt out of individual data sharing while still participating in anonymous leaderboards.

---

### H-7: Birthday and Gender Data Collected Without Clear Purpose Disclosure

**What:** During athlete onboarding (Step 3), birthday and gender are collected. The UI says "Helps us personalize your experience and keep things fair." The backend accepts these fields but the onboarding route (`onboarding.routes.js` line 72) extracts `birthday` and `gender` from the request body - though it does not appear to store them in the `user_onboarding` table.

**Why it matters:**  
- Birthday is personally identifiable information. Combined with email and name, it creates a risk profile.  
- COPPA requires age verification if users under 13 might use the service.  
- Gender data is sensitive under GDPR (special category data).  
- The data appears to be collected but not stored, which is confusing - either use it for a stated purpose or do not collect it.

**Fix:**  
1. If birthday/gender are needed, store them properly and disclose the specific purpose in the Privacy Policy.  
2. If not needed, remove the collection step.  
3. Use birthday for age verification (enforce 13+ minimum, 18+ if handling health data in certain jurisdictions).  
4. Allow users to decline gender identification without consequence.

---

### H-8: User Input Not Consistently Sanitized

**What:** While the backend uses Joi validation on auth and workout endpoints, several routes accept and process user input without sanitization:  
- `PATCH /users/me` accepts `name` and `avatar_url` without validation or sanitization.  
- Studio creation accepts `name` through Joi but does not sanitize for XSS.  
- The frontend renders user names and studio names directly into HTML via string concatenation (e.g., `onboarding.js` renders studio names into innerHTML).  

**Why it matters:** Cross-site scripting (XSS) attacks. A malicious user could set their display name to include a `<script>` tag, which would execute in other users' browsers when their name appears on a leaderboard.

**Fix:**  
1. Add input sanitization on all user-supplied text (names, studio names, descriptions).  
2. Use a library like `DOMPurify` or built-in text encoding for frontend rendering.  
3. Replace `innerHTML` with `textContent` where only text is needed.  
4. Add Joi string validation patterns on the `PATCH /users/me` endpoint.

---

## MEDIUM FINDINGS (Fix Before Scaling)

### M-1: No CORS Configuration for Production Domain

**What:** The backend CORS configuration in `index.js` line 24:
```javascript
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
```
This defaults to `localhost:3000`. The production frontend is at `https://bnco.studio`. If `FRONTEND_URL` is not set correctly on Fly.dev, CORS will either block legitimate requests or be misconfigured.

**Why it matters:** Misconfigured CORS can either break the app or allow unauthorized cross-origin requests.

**Fix:** Verify that the `FRONTEND_URL` environment variable on Fly.dev is set to `https://bnco.studio`. Consider allowing an array of origins to support staging environments.

---

### M-2: Rate Limiting Not Applied to All Routes

**What:** Rate limiters are defined in `rateLimit.js` but the main `index.js` does not apply them to routes. The rate limit middleware is imported and defined but there is no `app.use(apiLimiter)` or route-specific application visible in the server setup.

**Why it matters:** Without rate limiting actually applied, the API is vulnerable to brute-force attacks on auth endpoints, abuse of data endpoints, and denial-of-service.

**Fix:**  
1. Apply `authLimiter` to `/api/auth` routes.  
2. Apply `apiLimiter` to all `/api` routes.  
3. Apply `webhookLimiter` to `/api/webhooks` routes.

---

### M-3: Geolocation Collected During Onboarding Without Explicit Consent

**What:** The "Detect My Studio" feature in onboarding calls `navigator.geolocation.getCurrentPosition()`, which triggers the browser's native permission prompt. However, there is no BNCO-specific disclosure about how location data is used or retained.

**Why it matters:** While the browser prompt provides basic consent, best practice (and some state laws) require disclosing the purpose and retention of location data in your own UI and Privacy Policy.

**Fix:**  
1. Add a brief disclosure before requesting location: "We'll use your location to find nearby studios. We don't store your location."  
2. Document location data handling in the Privacy Policy.

---

### M-4: Lobby Feed is Publicly Accessible Without Authentication

**What:** The lobby endpoint `GET /api/lobby/:slug` and the SSE stream `GET /api/lobby/:slug/stream` have `skipAuth: true` and no auth middleware. Anyone with a studio slug can view the leaderboard, athlete of the week, and recent workout scores.

**Why it matters:** This exposes user names, avatars, and performance scores to the public without user consent. While some users might expect leaderboard visibility, the Privacy Policy does not clearly state that leaderboard data is publicly accessible without even logging in.

**Fix:**  
1. Add a studio-level setting for "public lobby" vs. "members only."  
2. If public, clearly disclose in the Privacy Policy that leaderboard data is visible to anyone.  
3. Consider requiring authentication for the SSE stream at minimum.

---

### M-5: No HTTPS Enforcement in Backend

**What:** The Express server does not enforce HTTPS. While Fly.dev handles TLS termination at the proxy level, there is no `Strict-Transport-Security` header explicitly configured (helmet adds a basic one, but it should be verified).

**Why it matters:** Without HSTS, users could be downgraded to HTTP in certain attack scenarios.

**Fix:**  
1. Verify Fly.dev's TLS configuration.  
2. Configure helmet with explicit HSTS settings: `helmet({ hsts: { maxAge: 31536000, includeSubDomains: true, preload: true } })`.  
3. Add your domain to the HSTS preload list.

---

### M-6: No Trademark Protection for BNCO

**What:** There is no evidence of trademark registration for "BNCO" or "Vibe Score" or the BNCO logo.

**Why it matters:** Without trademark protection, another company could use the BNCO name in the fitness/Pilates space. As the brand grows, the risk of infringement increases and it becomes harder to establish priority.

**Fix:**  
1. File a trademark application with the USPTO for "BNCO" in Class 42 (software/SaaS) and Class 41 (fitness/exercise services).  
2. Consider filing for "Vibe Score" as a trademark.  
3. Use the TM symbol immediately (no registration required for common law trademark).  
4. Budget approximately $250-350 per class for USPTO filing fees.

---

## LOW FINDINGS (Nice to Have)

### L-1: No Alt Text on Any Images

**What:** The `index.html` file contains zero `alt` attributes. All visual content uses SVGs without accessible labels (beyond one `aria-hidden="true"` on decorative particles).

**Why it matters:** Fails WCAG 2.1 Level A (Success Criterion 1.1.1). This creates accessibility barriers for screen reader users and could expose the company to ADA lawsuits - which have increased significantly for web apps.

**Fix:**  
1. Add `alt` text to all meaningful images.  
2. Add `aria-label` to interactive SVGs.  
3. Add `role="img"` and `aria-label` to decorative SVGs that convey meaning.

---

### L-2: Limited Keyboard Navigation Support

**What:** While the app uses semantic `<button>` elements (good), custom components like the role selector cards, frequency buttons, and studio type buttons rely solely on click handlers without keyboard event handling.

**Why it matters:** WCAG 2.1 Level A requires all functionality to be operable via keyboard. Users who cannot use a mouse are excluded.

**Fix:**  
1. Add `tabindex="0"` and `keydown` handlers (Enter/Space) to all interactive custom elements.  
2. Add visible focus indicators (`:focus-visible` styles).  
3. Test with keyboard-only navigation.

---

### L-3: Google Fonts - Privacy Consideration

**What:** Google Fonts are loaded directly from Google's CDN (fonts.googleapis.com). This is legally fine for licensing, but Google collects user IP addresses when fonts are loaded.

**Why it matters:** A German court ruled in 2022 that loading Google Fonts from Google servers without consent violates GDPR (transferring IP to Google/US). While enforcement has been limited, it is a known risk for EU users.

**Fix:**  
1. Self-host the Google Fonts (download and serve from bnco.studio). This eliminates the data transfer to Google.  
2. Alternatively, disclose Google Fonts usage in the Privacy Policy.

---

### L-4: Error Messages May Leak Information

**What:** In development mode, the error handler in `index.js` returns the actual error message:
```javascript
error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
```
This is properly handled for production, but the auth routes return specific messages like "Email already registered" (line 37 in `auth.routes.js`) that could be used for user enumeration.

**Why it matters:** An attacker can determine which email addresses have accounts by attempting registration. This is an information disclosure issue.

**Fix:**  
1. Use generic auth error messages: "Registration failed" instead of "Email already registered."  
2. Alternatively, accept the trade-off for better UX but implement account enumeration protections (CAPTCHA, stricter rate limiting on registration).

---

### L-5: No Third-Party Dependency Audit

**What:** The app depends on npm packages (express, jsonwebtoken, bcryptjs, joi, google-auth-library, etc.) but there is no evidence of dependency auditing or automated vulnerability scanning.

**Why it matters:** Known vulnerabilities in dependencies are one of the most common attack vectors. Without regular auditing, critical patches can be missed.

**Fix:**  
1. Run `npm audit` regularly and fix critical/high vulnerabilities.  
2. Add a GitHub Dependabot or Snyk integration for automated alerts.  
3. Pin dependency versions and review updates before merging.

---

## Section 6: Required Legal Documents Before Launch

### 1. Terms of Service (ToS)
**Outline:**
- Acceptance of terms  
- Eligibility (age requirement: 13+ or 18+)  
- Account responsibilities  
- Acceptable use policy  
- Health/fitness data disclaimer: "Not medical advice"  
- Intellectual property (BNCO brand, user-generated content license)  
- Payment terms (for studio dashboard)  
  - Auto-renewal disclosure for monthly plan  
  - Cancellation process  
  - Refund policy  
- Third-party integrations (WHOOP, Apple Health, Google)  
- Limitation of liability  
- Indemnification  
- Termination  
- Governing law and dispute resolution  
- Modification clause  

### 2. Privacy Policy (Rewrite of Current Draft)
**Must cover:**
- Exact data collected (with accurate product references)  
- Google OAuth data (name, email, picture)  
- Biometric/health data from WHOOP and Apple Health  
- Birthday, gender, geolocation  
- localStorage usage and what is stored  
- How data is shared with studio owners  
- Third-party services (Google Cloud, Fly.dev, Stripe, Redis)  
- CCPA rights (for California users)  
- GDPR rights (for EU users, if applicable)  
- Data retention schedule  
- Account deletion process  
- Contact information (with working email)  

### 3. Refund & Cancellation Policy
**Must cover:**
- Monthly plan ($549/mo): how to cancel, when billing stops, proration  
- Lifetime plan ($2,000): refund eligibility window (if any)  
- Process for requesting refunds  

### 4. Cookie & Storage Policy
**Must cover:**
- What localStorage items are set  
- Essential vs. non-essential storage  
- How to clear/manage stored data  

### 5. Health Data Disclaimer
**Must cover:**
- BNCO scores are not medical metrics  
- Consult healthcare provider before relying on data  
- Biometric data accuracy limitations  

### 6. Acceptable Use Policy (can be part of ToS)
**Must cover:**
- Prohibited activities  
- Data scraping/abuse  
- Account sharing restrictions  

### 7. Studio Owner Agreement (B2B)
**Must cover:**
- Studio dashboard pricing and payment terms  
- Data access rights and responsibilities  
- Member data handling obligations  
- Indemnification  
- Service level expectations  

### 8. Business Associate Agreement (BAA) Template
**Must have ready for:**
- Studio partners who are HIPAA-covered entities  
- Defines BNCO's obligations as a business associate  

---

## Summary Action Items (Priority Order)

| Priority | Item | Effort |
|----------|------|--------|
| CRITICAL | C-1: Rotate and restrict Google Places API key | 1 hour |
| CRITICAL | C-5: Build account deletion + data export endpoints | 1-2 days |
| CRITICAL | C-6: Encrypt WHOOP tokens at rest | 4-6 hours |
| CRITICAL | C-7: Encrypt billing API keys at rest | 2-4 hours |
| CRITICAL | C-2 + C-3: Draft and publish ToS + Privacy Policy | 2-3 days |
| CRITICAL | C-4: Rewrite Privacy Policy with accurate data | 1 day |
| HIGH | H-2: Add refund policy and auto-renewal disclosures | 1 day |
| HIGH | H-3: Fix JWT refresh token implementation | 1 day |
| HIGH | H-4: Add health data disclaimer | 2 hours |
| HIGH | H-8: Add input sanitization | 1 day |
| HIGH | H-1: Add storage consent mechanism | 1 day |
| HIGH | H-6: Add biometric data sharing consent | 4 hours |
| HIGH | H-7: Fix birthday/gender collection flow | 2 hours |
| HIGH | H-5: Remove hardcoded Google Client ID fallback | 30 min |
| MEDIUM | M-2: Apply rate limiters to routes | 1 hour |
| MEDIUM | M-1: Verify CORS production config | 30 min |
| MEDIUM | M-4: Add auth option for lobby endpoint | 2-4 hours |
| MEDIUM | M-5: Verify HSTS configuration | 30 min |
| MEDIUM | M-3: Add geolocation consent disclosure | 1 hour |
| MEDIUM | M-6: File trademark applications | 1-2 weeks |

---

**Bottom line:** The core product is well-built from an engineering perspective. The backend uses proper password hashing (bcrypt, cost factor 12), Joi validation on key endpoints, helmet for basic security headers, and parameterized SQL queries (no SQL injection risk). However, the legal and compliance layer is almost entirely absent. The 7 critical items above must be resolved before any public launch, beta invites, or marketing campaigns. Most can be addressed in a focused 1-2 week sprint.

*Report generated by Quinn (CLO) - March 4, 2026*
