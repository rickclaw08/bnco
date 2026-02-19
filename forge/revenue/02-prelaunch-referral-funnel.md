# FORGE — Pre-Launch Referral Funnel

---

## Landing Page Structure

### Hero Section
- **Headline:** "Your beard deserves better. FORGE is coming."
- **Subhead:** "Premium beard care. No filler. No fragrance overload. Just results. Be first in line."
- **Email capture:** Single field + CTA button "Get Early Access"
- **Visual:** Dark background, product silhouette or founder using product. Masculine, minimal.

### Below the Fold
- **3 value props** (icons + one-liners):
  - 🧴 All-natural oils, zero synthetic garbage
  - 🔬 Formulated for growth, thickness, and softness
  - 📦 Subscribe & save up to 20%
- **Social proof ticker:** "1,247 men already on the waitlist" (live counter)
- **FAQ accordion:** 3-4 questions (When do you launch? What products? Pricing?)

### Post-Signup: Thank You / Referral Page
This is where the viral loop lives. After email submit, redirect to:

- **Headline:** "You're in. Want to cut the line?"
- **Their unique referral link** (copy button + share buttons)
- **Reward tiers displayed:**

| Referrals | Reward |
|-----------|--------|
| 1 | 10% off launch order |
| 3 | Free shipping for life (first year) |
| 5 | Free product on launch day |
| 10 | Founding Member kit (full product line free) |

- **Share buttons:** Copy link, Twitter/X, Facebook, WhatsApp, SMS, Email
- **Leaderboard teaser:** "You're #847 on the waitlist. Refer friends to move up."

---

## Referral Mechanic

### Give $10, Get 10%
- **Referrer:** Gets 10% off for each successful referral signup
- **Referred friend:** Gets $10 off their first order ($35+ minimum)
- Codes auto-generated, unique per referrer
- Tracked via UTM + referral platform cookies

### How It Works (User Flow)
1. Visitor lands on pre-launch page
2. Enters email → added to Klaviyo list (tag: "pre-launch")
3. Redirected to thank-you page with unique referral link
4. Shares link via social/DM/text
5. Friend clicks link → lands on same page with referral cookie
6. Friend signs up → referrer gets credit
7. Both receive confirmation emails with reward status

---

## Viral Loop Design

```
[Ad / Organic] → Landing Page → Email Signup
                                      ↓
                              Thank You + Referral Link
                                      ↓
                         Share (Social / DM / Text / Email)
                                      ↓
                     Friend Clicks → Landing Page (w/ ref cookie)
                                      ↓
                              Friend Signs Up → Referrer Gets Credit
                                      ↓
                         Friend Gets OWN Referral Link → Loop Repeats
```

**Key viral coefficient drivers:**
- Tiered rewards (gamification — people chase the next tier)
- Waitlist position (moving up creates urgency)
- Limited "Founding Member" slots (scarcity)
- Easy sharing (pre-written copy for each platform)

**Pre-written share copy:**
- **Text/DM:** "Yo, check out FORGE — new beard care brand dropping soon. Use my link and you get $10 off: [LINK]"
- **Twitter:** "My beard's about to level up. @ForgeGrooming is launching soon and I'm on the early list. $10 off if you join through me → [LINK] #beardcare #FORGE"
- **Email subject:** "You need to see this beard care brand"

---

## Platform Setup: Viral Loops

### Why Viral Loops over KickoffLabs
- Better referral tracking and fraud prevention
- Native Klaviyo integration
- Milestone/tier rewards built in
- Embeddable widgets

### Viral Loops Setup Guide

**1. Create Campaign**
- Template: "Pre-launch" (Harry's-style referral)
- Campaign name: FORGE Pre-Launch Waitlist

**2. Configure Rewards (Milestones)**
- Milestone 1 (1 referral): Tag "tier_1" → 10% discount code
- Milestone 2 (3 referrals): Tag "tier_2" → free shipping code
- Milestone 3 (5 referrals): Tag "tier_3" → free product flag
- Milestone 4 (10 referrals): Tag "tier_4" → founding member flag

**3. Design**
- Use FORGE brand colors (dark/charcoal + amber/gold accent)
- Upload logo
- Customize widget text to match brand voice
- Widget placement: embed on thank-you page (not popup)

**4. Integrations**
- Connect Klaviyo:
  - Viral Loops → Settings → Integrations → Klaviyo
  - Add Klaviyo API key
  - Map: email, referral_count, referral_link, milestone tags
  - On signup → add to Klaviyo list "Pre-Launch Waitlist"
  - On milestone hit → update Klaviyo profile property

**5. Embed Code**
```html
<!-- Add to thank-you page <head> -->
<script src="https://app.viral-loops.com/widgetjs/YOUR_CAMPAIGN_ID.js"></script>

<!-- Add widget where you want it -->
<div data-vl-widget="referral"></div>
```

**6. Domain & Tracking**
- Custom referral domain: share.forgegrooming.com (or just use default)
- UTM structure: `?utm_source=viralloops&utm_medium=referral&utm_campaign=prelaunch`
- Add Facebook Pixel and GA4 to landing page

**7. Anti-Fraud**
- Enable email verification (Viral Loops setting)
- Block disposable email domains
- IP-based duplicate detection
- Manual review for 10+ referral milestone claims

---

## Pre-Launch Email Sequence (via Klaviyo, triggered by Viral Loops signup)

| # | Delay | Subject | Content |
|---|-------|---------|---------|
| PL1 | Immediate | You're on the list. | Confirm signup. Show referral link. Explain tiers. |
| PL2 | +3 days | You're [X] referrals from free shipping. | Progress update. Re-share referral link. |
| PL3 | +7 days | Sneak peek: what's in the box. | Product reveal. Build hype. Referral reminder. |
| PL4 | Launch day | We're live. Your rewards are ready. | Launch announcement. Apply their earned rewards automatically. |

---

## Metrics to Track

- **Signups/day** — target: 50-100/day in first 2 weeks
- **Viral coefficient (K)** — referrals per user. Target: >0.3
- **Conversion rate** — landing page visitors → signups. Target: 25%+
- **Share rate** — % of signups who share their link. Target: 15%+
- **Top referrers** — identify potential ambassadors/affiliates
