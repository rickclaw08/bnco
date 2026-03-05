# BNCO COO Audit Report
**Date:** March 4, 2026
**Auditor:** Harper (COO)
**Subject:** Full UX/Product Audit - bnco.studio Web App

---

## Executive Summary

BNCO has a strong visual identity, a thoughtful onboarding flow, and a clear value proposition. The landing page is compelling, the gamification mechanics are well-designed, and the dual-view (Athlete/Studio Owner) architecture is sound. However, the app has several critical and high-priority issues that will hurt conversion, retention, and trust if not resolved before a real marketing push. The biggest themes: dead links eroding credibility, heavy reliance on demo/fake data without clear indicators, missing operational infrastructure (support, analytics, password reset), and some UX friction points that will frustrate mobile users.

---

## 1. CRITICAL (Blocks Launch)

### 1.1 All Footer and Settings Links Are Dead (#-anchors)
**What:** The footer links for About, Privacy, Terms, and Contact all point to `href="#"` and go nowhere. The Settings page links for Privacy Policy, Terms of Service, and Contact Support also point to `href="#"`.
**Why it matters:** Privacy Policy and Terms of Service are legally required before collecting user data (email, birthday, gender, location). Google OAuth requires a valid privacy policy URL. App Store submission (for the iOS app mentioned in onboarding) will be rejected without these. Contact Support being dead means users have zero way to get help.
**Fix:** Create actual pages or hosted documents for Privacy Policy, Terms of Service, and a Contact/Support page. Even a simple mailto: link for Contact Support is better than nothing. Do this before any paid acquisition.

### 1.2 No Password Reset Flow
**What:** The auth modal has email/password sign-in and sign-up, but there is zero "Forgot Password?" link or password reset functionality anywhere in auth.js or the HTML.
**Why it matters:** Users who forget their password are permanently locked out. This is a guaranteed churn vector. Every competitor has this. Users will assume the product is broken or unfinished.
**Fix:** Add a "Forgot Password?" link below the password field in the login form. Implement a reset-password endpoint on the backend and a simple email flow.

### 1.3 Fake Vanity Metrics on Landing Page
**What:** The landing page hero stats show "12,847 Athletes," "342 Studios," and "89 Cities" - these are hardcoded `data-count` values with animated counters. They are not pulled from any API.
**Why it matters:** If a user signs up and sees an empty leaderboard, they will immediately realize these numbers were fabricated. This destroys trust and credibility. If a journalist, investor, or studio owner checks, this is a liability.
**Fix:** Either (a) pull real counts from the API, (b) remove the stats section entirely until you have real numbers, or (c) replace with aspirational copy like "Join the growing community" without specific numbers.

### 1.4 Testimonials Are Fabricated
**What:** Three testimonial cards on the landing page (Sarah K., Jessica M., Alex L.) appear to be fictional. "Our studio retention went up 40% after joining BNCO" is an unsubstantiated claim.
**Why it matters:** Fabricated testimonials violate FTC guidelines. If someone investigates and these people don't exist, it damages brand credibility severely. The "40% retention increase" is a specific, measurable claim that could be challenged.
**Fix:** Remove testimonials until you have real ones. Replace with a waitlist count, beta user quotes (with permission), or social proof from actual usage. Even "Built by Pilates athletes, for Pilates athletes" is safer than fake quotes.

---

## 2. HIGH (Hurts Conversion/Retention)

### 2.1 No Analytics or Tracking Whatsoever
**What:** There is zero analytics integration. No Google Analytics, no Plausible, no PostHog, no Mixpanel, no Segment, no Hotjar - nothing. No event tracking on sign-ups, onboarding completion, feature usage, or drop-off points.
**Why it matters:** You are flying completely blind. You cannot measure conversion rates, identify where users drop off in the funnel, understand which features get used, or prove ROI to studio owners. At $549/month pricing, studio owners will want to see data proving value.
**Fix:** Integrate a lightweight analytics tool (Plausible for privacy-friendly, or PostHog for product analytics). Track: landing page views, sign-up starts, sign-up completions, onboarding step completion rates, daily active users, feature engagement.

### 2.2 Demo Data Blends Invisibly with Real Data
**What:** When API calls fail, the app silently falls back to hardcoded demo data (leaderboard names, missions, studio challenges, at-risk members, studio rankings). There is a `DEMO_BANNER` injected for unsubscribed studio owners, but athletes seeing demo data get no indicator at all. The demo leaderboard has specific names like "Sarah Mitchell" hardcoded as the user, "Jake R." at #1, etc.
**Why it matters:** New users cannot tell what is real vs. fake. An athlete who signs up, sees a full leaderboard with scores, then realizes none of it is their data - that is a trust-breaking moment. Studio owners paying $549/month seeing demo data instead of real member data is a support nightmare.
**Fix:** Add a clear "Sample Data" badge on any card showing demo data. Create proper empty states for new users (see 2.3). Make the demo-to-real data transition explicit.

### 2.3 Missing Empty States for New Users
**What:** When a new athlete has no workouts, no wearable connected, and no studio joined, many dashboard sections will either show demo data or render with hardcoded placeholder values (the profile still shows "Sarah Mitchell," "Level 12," "VANGUARD," "2,740 / 4,000 XP"). The settings page handles empty wearable state well ("No devices connected yet"), but the main dashboard does not.
**Why it matters:** A new user's first experience after onboarding is seeing someone else's fake profile. This is confusing and breaks the "this is MY dashboard" feeling. The moment of "first value" - seeing your own data - never arrives cleanly.
**Fix:** Create dedicated empty states for: (a) Profile card when no data exists, (b) Leaderboard when user has no scores, (c) Missions when none are active, (d) bnco Score when no wearable data synced. Each should have a clear CTA guiding the user to the next action (connect wearable, join studio, etc.).

### 2.4 Studio Pricing - "Coming Soon" on Lifetime Plan
**What:** The landing page pricing section has two cards: Monthly ($549/mo) with a live Stripe link, and Lifetime ($2,000) with `href="#"` and text "Coming Soon." However, in the modal pricing (shown to studio owners in-app), the Lifetime plan has a real Stripe link.
**Why it matters:** Inconsistency. Landing page visitors see "Coming Soon" and may not sign up, waiting for it. Meanwhile, in-app users can actually purchase it. This leaks revenue from the landing page and confuses the value proposition.
**Fix:** Either enable the Stripe link on the landing page Lifetime card too, or remove the Lifetime option from the landing page entirely if you are not ready to sell it publicly.

### 2.5 Logout Is Hidden Behind Avatar Click with confirm()
**What:** The only way to log out is clicking the avatar in the nav bar, which triggers a `confirm('Log out?')` dialog. There is no visible "Log Out" button in Settings or anywhere else.
**Why it matters:** Users expect to find logout in Settings. Using a browser confirm dialog feels unpolished. Some users will never discover this and feel trapped. On mobile, the avatar is small and not obviously interactive.
**Fix:** Add a visible "Log Out" button at the bottom of the Settings section. Keep the avatar shortcut, but replace the `confirm()` dialog with a styled confirmation modal consistent with the app's design language.

### 2.6 Apple Watch / iOS App Does Not Exist
**What:** The onboarding flow and settings reference a "BNCO iOS app" required for Apple Watch integration. Clicking the Apple Watch button shows an `alert()` saying "Download the iOS app from the App Store." There is an `ios/` directory and `capacitor.config.ts` in the repo, suggesting Capacitor is being used, but no App Store listing exists.
**Why it matters:** Promising a feature that does not exist yet (iOS app with Apple Health integration) sets false expectations. Users who only have an Apple Watch cannot use the core wearable feature. The `alert()` dialog is jarring and unprofessional.
**Fix:** If the iOS app is not published, replace the Apple Watch section with "Coming Soon" styling (greyed out, with an email capture for notification). Do not present it as a live option during onboarding. Remove the "iOS App Required" button that opens a useless alert.

### 2.7 Google Places API Key Exposed in Client-Side Code
**What:** `onboarding.js` contains `const PLACES_API_KEY = import.meta.env?.VITE_PLACES_API_KEY || 'AIzaSyDp8gHtmxcJ5tnsmUz7YDm8wwpR3qJXBgs'` - a hardcoded fallback API key directly in source code.
**Why it matters:** Anyone can extract this key from the built JS bundle and use it for their own purposes, running up your Google Cloud bill. API key abuse is a known attack vector. Google may also flag the key.
**Fix:** Remove the hardcoded fallback. Use only the environment variable. Restrict the API key in the Google Cloud Console to your domain(s) only (HTTP referrer restrictions). Set usage quotas.

---

## 3. MEDIUM (Should Improve)

### 3.1 Onboarding Studio Search Falls Back to Cincinnati Demo Data
**What:** The athlete onboarding studio search (Step 1) has a `DEMO_NEARBY_STUDIOS` array hardcoded with 8 Cincinnati-area studios. If the Places API and backend both fail, or if geolocation is denied, users see Cincinnati studios regardless of their actual location. The detect button shows "Location denied - showing Cincinnati area."
**Why it matters:** Users outside Cincinnati will see irrelevant studios, creating confusion. The fallback should at least be transparent about being demo data, or the feature should degrade more gracefully.
**Fix:** When falling back to demo data, show a message like "We could not detect studios near you. Search by name or enter a join code." Remove the Cincinnati-specific demo data from production, or make it contextually appropriate.

### 3.2 Onboarding Join Code is Client-Generated (Not from Backend)
**What:** In the studio owner onboarding, the invite code shown at Step 3 is generated client-side with `generateInviteCode()` using random characters prefixed with "BNCO-". The `getJoinCode()` API function exists but is only called elsewhere (studio registration modal). The onboarding flow generates its own code and sends it in the `completeOnboarding` payload.
**Why it matters:** If the backend does not validate or store this code properly, it will not work when athletes try to use it. Client-generated codes could also collide. The code shown during onboarding might not match what the backend expects.
**Fix:** Have the backend generate the join code after studio creation, then display the server-returned code in the onboarding UI. This guarantees the code is valid and stored.

### 3.3 Mobile Tab Bar Only Has Two Tabs
**What:** The mobile bottom tab bar has only "Athlete" and "Studio" tabs. There is no direct mobile navigation to Settings, Profile, or any specific section. The settings gear icon is in the top nav, which requires scrolling to the top.
**Why it matters:** On mobile (the primary target), users must scroll all the way down to find Settings. There is no quick way to jump between dashboard sections. The two-tab bar feels empty and underutilized.
**Fix:** Add at least a "Settings" or "Profile" tab to the mobile tab bar. Consider adding a "Home" tab that scrolls to top and a "Score" tab for quick access to the bnco Score widget.

### 3.4 WHOOP OAuth Connection May Not Complete Properly
**What:** The WHOOP connect flow opens a popup window (`window.open`), but there is no `postMessage` listener or popup polling to detect when OAuth completes. The app relies on the URL param `?whoop=connected` being set after redirect, which the `handleWhoopCallback()` in settings.js checks on page load. If the OAuth callback goes to the popup (not the main window), the connection state will never update until a full page reload.
**Why it matters:** Users click "Connect via OAuth," a window opens, they authorize, and... nothing happens in the main app. They have to manually reload. This feels broken.
**Fix:** Implement a `postMessage` bridge between the OAuth popup and the main window, or use a polling interval to check connection status after the popup opens. Alternatively, handle the OAuth redirect in the main window with a loading state.

### 3.5 No Confirmation or Success States After Key Actions
**What:** After completing onboarding, connecting a device, or creating a mission, there are no success toasts, confetti animations, or confirmation messages. The onboarding just closes. Device connection shows "Connected" text but no celebratory feedback. Mission creation silently adds to the list.
**Why it matters:** Gamified platforms thrive on dopamine hits. Every successful action should feel rewarding. The target demographic (women 25-45 in Pilates) responds well to positive reinforcement and celebration moments.
**Fix:** Add toast notifications for key actions. Consider a confetti animation on onboarding completion. Show a "Welcome to BNCO!" celebration screen between onboarding and the dashboard. Add micro-animations when achievements unlock.

### 3.6 No FAQ or Help Documentation
**What:** There is no FAQ, help center, knowledge base, or onboarding tutorial. The "Contact Support" link in Settings goes nowhere (see 1.1).
**Why it matters:** Users will have questions about how bnco Scores work, how leaderboards are calculated, what wearable data is used, etc. Without self-service help, every question becomes a support ticket you cannot handle (because there is no support channel).
**Fix:** Create a simple FAQ page covering: What is a bnco Score? How are leaderboards ranked? What wearable data do you use? How do I connect my WHOOP? What is a Studio Mission? How does pricing work?

### 3.7 Studio Dashboard Shows All Demo Data Without Subscription Check on Initial Load
**What:** When a studio owner first loads the dashboard, `loadDemoData()` populates everything with fake metrics (248 Active Members, Avg bnco Score 67, City Rank #3, 5 Active Missions, at-risk members, studio wars). The demo banner is injected, but all the data cards render fully before the subscription check completes.
**Why it matters:** Studio owners see a fully populated dashboard with impressive fake numbers, then notice the small "DEMO" banner. This creates a bait-and-switch feeling. They might screenshot the demo and expect their real dashboard to look similar.
**Fix:** Show a clear "Demo Preview" watermark or overlay on the entire studio view for unsubscribed users. Make demo data visually distinct (different card styling, greyed out, or behind a frosted glass effect with a "Subscribe to see your real data" overlay).

### 3.8 Profile Card Hardcoded in HTML
**What:** The HTML file has "Sarah Mitchell," "VANGUARD," "Level 12," and "2,740 / 4,000 XP" hardcoded in the profile card. These are overwritten by JS when data loads, but they flash briefly on page load before JS executes (FOUC - Flash of Unstyled Content).
**Why it matters:** Users will see "Sarah Mitchell" for a split second before their own name appears. On slow connections, this could be visible for several seconds.
**Fix:** Set default/empty values in the HTML (blank name, "Loading..." or skeleton placeholders). Let JS populate everything. This is already partially done with `showLoadingStates()` adding a `card--loading` class, but the text content is still "Sarah Mitchell" underneath.

---

## 4. LOW (Polish)

### 4.1 Alert() and Confirm() Dialogs Used for UI Interactions
**What:** Multiple places use browser-native `alert()` and `confirm()` dialogs: Apple Watch info, WHOOP disconnect confirmation, logout confirmation, studio challenge creation (uses `prompt()`), and WHOOP connection fallback.
**Why it matters:** Native dialogs break the immersive feel of the app. They look different on every browser and cannot be styled. On mobile, they are especially jarring and feel like error messages.
**Fix:** Replace all `alert()`, `confirm()`, and `prompt()` with styled in-app modals consistent with the auth modal design. Low priority but significant for perceived quality.

### 4.2 "Become a Studio Owner" Button in Settings
**What:** Athletes see a "Become a Studio Owner" button in Settings that triggers the studio onboarding flow. This is a good upsell path, but the button text and placement could be more compelling.
**Why it matters:** The upgrade path exists, which is great. But "Become a Studio Owner" in a settings list is easy to miss and does not convey the value proposition.
**Fix:** Consider a more prominent upsell card in the athlete dashboard (already partially implemented with the inline CTA). Make the Settings button more descriptive: "Upgrade to Studio Dashboard - Manage your athletes."

### 4.3 Dark Mode Toggle Placement
**What:** Dark mode toggle is buried inside a "Privacy" settings card alongside the leaderboard visibility toggle. These are unrelated settings grouped together.
**Why it matters:** Users looking for dark mode will not think to check "Privacy" settings. The setting grouping is confusing.
**Fix:** Move dark mode to an "Appearance" card or a general "Preferences" card, separate from privacy/leaderboard controls.

### 4.4 Landing Page "About" Link Goes Nowhere
**What:** The footer "About" link points to `href="#"`.
**Why it matters:** Minor, but users who want to learn about the company/team before signing up hit a dead end. For a $549/month product, credibility matters.
**Fix:** Create a simple About page with the team story, mission, and contact info.

### 4.5 Service Worker Cleanup Script in Production HTML
**What:** The index.html includes an inline script that unregisters all service workers and clears all caches. The comment says "Unregister stale service workers from previous deploys."
**Why it matters:** This is cleanup code that should have been temporary. It runs on every page load, adding unnecessary JS execution. It also prevents any future service worker/PWA functionality from working.
**Fix:** Remove the service worker cleanup script once you are confident old SWs are cleared. If you plan to add PWA support later, this script will actively block it.

### 4.6 Hardcoded Studio Name in Studio View
**What:** The Studio Dashboard subtitle is hardcoded as "CorePower Pilates - Cincinnati, OH" in the HTML.
**Why it matters:** Every studio owner will see this before their real studio name loads. On slow connections, this is visible.
**Fix:** Use a placeholder like "Your Studio" or load from the user's profile data.

### 4.7 Ghost Racing Feature Has No Real Implementation
**What:** The "Ghost Racing" section in the athlete view (race against yesterday's top performer) has UI but the ghost data is generated from demo data arrays. There is no actual mechanism to record, store, or replay a user's workout as a "ghost."
**Why it matters:** Ghost racing is mentioned in testimonials and value props as a key feature. Users who try to use it will realize it is not real. This is a feature promise without delivery.
**Fix:** Either build the ghost racing backend integration or remove references to it from the landing page testimonials and value props. Keep it in the dashboard as "Coming Soon" if you plan to build it.

### 4.8 No Responsive Images or Lazy Loading
**What:** Profile pictures are loaded as base64 data URLs or external URLs without any size optimization. No `loading="lazy"` attributes on images.
**Why it matters:** Minor performance concern. Base64 profile pictures stored in localStorage could get large. On mobile data connections, this adds load time.
**Fix:** Implement image compression for uploaded profile pictures. Add `loading="lazy"` to any below-the-fold images.

---

## 5. User Journey Map

### Happy Path (Athlete)
1. **Landing Page** - Clear value prop, strong CTA. Stats and testimonials boost credibility (but see 1.3, 1.4).
2. **Sign Up** - Auth modal is clean. Google OAuth works well. Email/password flow is standard.
3. **Role Selection** - Clear, visual cards. Good distinction between Athlete and Studio Owner.
4. **Studio Selection (Step 1)** - Google Places search is impressive. Join code option is smart. Geolocation detection is a nice touch. Skip option available.
5. **Wearable Connection (Step 2)** - WHOOP OAuth flow exists. Apple Watch references non-existent iOS app (see 2.6). Skip option available.
6. **Personal Info (Step 3)** - Birthday and gender. Clean dropdowns. Skip option available.
7. **Training Frequency (Step 4)** - Nice card UI. Skip option available.
8. **Dashboard** - Profile card, bnco Score, leaderboards, achievements, missions, goals. Extensive feature set.

### Pain Points in Journey
- **After sign-up:** User sees someone else's hardcoded data before their own loads.
- **After onboarding:** No celebration moment. No "what to do next" guidance.
- **Without wearable:** Most dashboard features show demo data. No clear path to value without connecting a device.
- **Without studio:** Leaderboard context is meaningless. "Class" scope has no real meaning without a studio.
- **Finding settings:** Must scroll or click tiny gear icon. No mobile shortcut.
- **Getting help:** Impossible. All support/help links are dead.
- **Logging out:** Hidden behind avatar click.

---

## 6. Conversion Optimization Assessment

### Strengths
- Landing page value proposition is clear and compelling
- "Get Started Free" CTA is prominent and repeated
- Google Sign-In reduces friction significantly
- Onboarding has skip options at every step (reduces abandonment)
- Pricing is clearly presented for studio owners
- Role-based paths are well-differentiated

### Weaknesses
- Fake social proof (stats, testimonials) is a conversion risk if discovered
- No email capture for visitors who are not ready to sign up
- "Coming Soon" on the Lifetime plan discourages immediate purchase
- No free trial for studio owners - $549/month with no trial is a hard sell
- No demo or video showing what the dashboard looks like
- Footer links going nowhere undermines trust at the decision point

---

## 7. Operational Readiness Assessment

| Area | Status | Notes |
|------|--------|-------|
| User Support | Not Ready | No support channel, no FAQ, no help docs |
| Legal/Compliance | Not Ready | No Privacy Policy, no Terms of Service |
| Analytics | Not Ready | Zero tracking or measurement |
| Error Handling | Partial | API errors fall silently to demo data; auth errors shown in modal |
| Monitoring | Not Ready | No error reporting (Sentry, etc.) |
| Password Recovery | Not Ready | No forgot password flow |
| Payment Processing | Partial | Stripe links exist but no subscription verification loop |

---

## 8. Priority Action Plan

### Week 1 (Before Any Marketing)
1. Create and publish Privacy Policy and Terms of Service
2. Fix all dead links (footer, settings)
3. Remove or replace fake stats and testimonials
4. Add password reset flow
5. Restrict Google Places API key to your domain

### Week 2
6. Integrate basic analytics (Plausible or PostHog)
7. Create proper empty states for new users
8. Add a visible logout button in Settings
9. Fix Apple Watch messaging (Coming Soon, not "iOS App Required")
10. Create a basic FAQ page

### Week 3
11. Add toast/success notifications for key actions
12. Replace all alert()/confirm() with styled modals
13. Improve demo data indicators
14. Fix WHOOP OAuth popup completion detection
15. Add Contact Support email (even just a mailto: link)

---

*End of audit. Questions or deep-dives on any finding - just ask.*
