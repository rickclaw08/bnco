# bnco Onboarding & Verification System

## Two Signup Paths

### Path 1: Athlete Signup
1. **Sign up** via Google OAuth or Email/Password
2. **Onboarding Questions** (first-time only):
   - "Which studio(s) do you go to?" (search/select from registered studios, or "I do Pilates at home")
   - "How often do you hit Pilates?" (e.g., "3 days a week", "5 days a week", "daily")
   - "Do you wear a WHOOP or Apple Watch?" (connect devices)
   - Optional: Name, avatar
3. **Studio Association**: When athlete selects a studio, a "pending" membership is created
4. **Approval**: Studio admin approves manually OR auto-approved via billing verification

### Path 2: Studio Signup
1. **Sign up** via Google OAuth or Email/Password
2. **Studio Registration**:
   - Studio name, city, state
   - Logo upload, accent color
   - Billing system integration (for auto-approval)
3. **Demo Dashboard**: Shown immediately after signup - interactive walkthrough of:
   - Member management (pending approvals, active members)
   - Leaderboard view
   - Weekly Tension Goals
   - Lobby Feed preview
   - At-risk member alerts
4. **Go Live**: Studio publishes, athletes can find and request to join

## Membership Verification

### Manual Approval
- Studio admin sees pending athlete requests in dashboard
- Can approve or deny with one click
- Athlete gets notified on approval

### Auto-Approval via Billing Integration
- Studio connects their billing system (MindBody, Mariana Tek, Stripe, etc.)
- When an athlete requests to join, bnco checks:
  - Does this email match an active paying member in the studio's billing system?
  - If YES: auto-approve immediately
  - If NO: route to manual approval queue
- Reduces studio admin workload to near-zero for existing members

## Data Model Updates

### studio_memberships (replaces studio_members)
- Adds `status` field: pending, active, denied, expired
- Adds `verified_via`: manual, billing_auto, invite_code
- Adds `billing_customer_id` for cross-referencing

### user_onboarding
- Tracks onboarding completion
- Stores pilates_frequency, preferred_studios, device_preferences
