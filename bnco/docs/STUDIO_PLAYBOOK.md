# bnco Studio Playbook

How Pilates studios adopt and get the most out of bnco.

---

## 1. Why Studios Use bnco

bnco solves three problems for studios:

1. **Retention** - Members who see their progress and compete on leaderboards stay longer
2. **Community** - Shared weekly goals and studio-vs-studio challenges create belonging
3. **Insight** - At-risk member alerts catch churn before it happens

Studios don't need to change how they teach. bnco works passively in the background, powered by wearable data members already own.

---

## 2. Studio Onboarding Flow

### Step 1: Sign Up

Studio owner creates an account at bnco.app:

- **Google sign-in** or **email/password**
- Select role: `Studio Admin`
- Account is created immediately

### Step 2: Register Your Studio

After signup, complete studio registration:

| Field | Required | Example |
|-------|----------|---------|
| Studio Name | Yes | CorePower Pilates |
| Slug (URL) | Yes | `corepower-pilates` (used in lobby URL) |
| City | Recommended | Cincinnati |
| State | Recommended | OH |
| Logo | Optional | PNG/JPG, displayed on lobby feed |
| Accent Color | Optional | Hex color (default: `#4ade80`) |

The slug determines your lobby feed URL: `lobby.bnco.app/corepower-pilates`

### Step 3: Connect Billing (Optional but Recommended)

Connecting your billing system enables **auto-member verification**. When athletes request to join, bnco checks if their email matches an active paying member in your system.

**Without billing integration:** You manually approve every member request.
**With billing integration:** Active paying members are auto-approved instantly.

### Step 4: Demo Dashboard

After registration, you get an interactive walkthrough of:

- Member management (pending approvals, active members)
- Precision Leaderboard
- Weekly Tension Goals
- Lobby Feed preview
- At-risk member alerts

### Step 5: Invite Members

Share your studio with members:

1. Members search for your studio during onboarding ("Which studio do you go to?")
2. Share your studio name directly - athletes search by name or city
3. Members request to join, then you approve (or billing auto-approves)

---

## 3. Billing Integration

### Supported Providers

| Provider | Best For | Integration Type |
|----------|---------|-----------------|
| **Stripe** | Studios using Stripe for subscriptions | API key - checks active subscriptions by email |
| **MindBody** | Studios on the MindBody platform | API key + endpoint - checks active client status |
| **Mariana Tek** | Studios using Mariana Tek booking | API key + endpoint - checks member status |
| **Manual** | Studios without compatible billing | All approvals are manual |

### Setup

```
POST /api/studios/{studio_id}/billing
{
  "provider": "stripe",
  "api_key": "sk_live_...",
  "api_endpoint": null
}
```

From the Studio Dashboard:
1. Go to **Settings > Billing Integration**
2. Select your provider
3. Enter your API credentials
4. Test the connection
5. Enable auto-approval

### How Auto-Approval Works

```
Athlete requests to join your studio
  -> bnco checks their email against your billing system
  -> Email matches an active paying member?
     YES -> Auto-approved instantly, athlete notified
     NO  -> Routed to your manual approval queue
```

This reduces admin work to near-zero for existing members. New prospects or trial members still go through manual approval, giving you control.

### Security

- API keys are encrypted at rest (production environment)
- bnco only reads member status (active/inactive) - never billing amounts or payment details
- You can disconnect billing integration at any time

---

## 4. Configuring the Lobby Feed

The Lobby Feed is a full-screen web page designed for TVs in your studio lobby. It shows real-time progress and community highlights.

### Setting Up the Display

1. **Get your lobby URL:** `https://lobby.bnco.app/{your-studio-slug}`
2. **Open it on a TV browser** (Smart TV, Apple TV, Chromecast, Fire TV, or any device with a web browser)
3. **Set the display to landscape 1080p** for the best layout
4. **Optional:** Set a lobby PIN in Settings for security (prevents unauthorized access)

### What the Lobby Shows

| Section | Description | Update Frequency |
|---------|-------------|-----------------|
| Weekly Tension Goal | Animated progress bar toward your weekly target | Real-time (SSE) |
| Athlete of the Week | Member with highest avg bnco score (min 2 sessions) | Updated on each workout |
| Top 5 Leaderboard | Opt-in members ranked by avg bnco score | Updated on each workout |
| Active Challenges | Studio-vs-studio challenge scoreboard | Updated on each workout |
| Recent Highlights | Top 3 scores from the last 48 hours | Updated on each workout |

### Real-Time Updates

The lobby page connects via Server-Sent Events (SSE) to receive live updates. When a member finishes a workout, their score appears on the lobby within seconds.

No manual refresh needed. The page auto-updates.

### Customization

From the Studio Dashboard:
- **Accent color** - Matches your lobby's color scheme to your brand
- **Logo** - Displayed on the lobby header
- **PIN protection** - Optional 6-digit PIN to access the lobby URL

### Technical Requirements

- Any device with a modern web browser (Chrome, Safari, Edge)
- Stable internet connection (WiFi)
- Screen resolution: 1920x1080 recommended
- The page auto-refreshes data via SSE; no need to reload

---

## 5. Managing Members

### Approval Queue

When athletes request to join your studio, you see them in the **Pending Requests** section of your dashboard.

For each request, you see:
- Member name and email
- Avatar (if set)
- Request timestamp

**Actions:**
- **Approve** - Member becomes active, can contribute to leaderboard and goals
- **Deny** - Member is rejected, can request again later

### Member List

View all active members with:
- Name and email
- 30-day average bnco score
- Number of sessions in last 30 days
- Leaderboard opt-in status
- Join date

Filter by status: Active, Pending, Denied, Expired

### At-Risk Alerts

bnco flags members who might be disengaging:

**Triggers:**
1. **No workout in 14+ days** - Member hasn't logged a studio workout
2. **Score decline of 20%+** - Their 7-day avg score dropped below 80% of their 30-day avg

**What you see:**
- Member name and email
- 7-day avg score vs. 30-day avg score
- Date of their last workout

**What to do:**
- Reach out personally (text, email, or in-studio conversation)
- Offer a modified class or recovery session
- Check if there's an injury or schedule conflict
- Consider a studio challenge to re-engage the whole community

---

## 6. Creating Studio Challenges

Studio-to-studio challenges ("Precision Wars") are a powerful engagement tool.

### How to Create a Challenge

1. Go to **Challenges** in your dashboard
2. Click **Create Challenge**
3. Select the studio you want to challenge
4. Set the metric: Average Stability Score or Average bnco Score
5. Set start and end dates (1-4 weeks recommended)
6. Send the challenge

The defending studio's owner receives a notification and can accept or decline.

### Challenge Mechanics

- **Metric:** Average score across all participating members during the challenge period
- **Participation:** Every active member's workouts count automatically
- **Visibility:** Active challenges appear on both studios' lobby feeds
- **Winner:** Studio with the higher average when the challenge ends
- **Prize:** In-app badge + display on the lobby feed

### Best Practices for Challenges

| Do | Don't |
|----|-------|
| Challenge studios of similar size | Challenge a 500-member studio with your 20-member studio |
| Run 2-week challenges to start | Run month-long challenges (fatigue sets in) |
| Announce the challenge in class | Let it happen silently |
| Celebrate the result either way | Only celebrate if you win |
| Use it to re-engage after holidays | Run challenges back-to-back |

### Challenge Display on Lobby

When a challenge is active, the lobby shows:
- Both studio names
- Current average scores
- Days remaining
- Which studio is leading

---

## 7. Setting Weekly Tension Goals

Weekly Tension Goals create a shared target for the whole studio.

### What Is a Tension Goal?

A cumulative muscular load target for the week. Every member with a wearable contributes their raw muscular load from each workout to a shared progress bar.

**Example:** Studio sets 30,000 Muscular Load Units for the week. 50 members each contribute ~600 units across their workouts. Progress bar fills up as workouts are logged.

### Setting a Goal

1. Go to **Goals** in your dashboard
2. Set `target_load_units` for the current week
3. The goal resets every Monday at midnight

### Choosing the Right Target

| Studio Size | Suggested Weekly Target | Reasoning |
|-------------|------------------------|-----------|
| 10-25 members | 5,000 - 15,000 | ~500-600 per active member per week |
| 25-50 members | 15,000 - 30,000 | Not all members wear devices yet |
| 50-100 members | 30,000 - 60,000 | Assume 50-70% device adoption |
| 100+ members | 60,000+ | Scale with active wearable users |

**Tip:** Start lower than you think. Hitting the goal feels good and builds momentum. You can always increase it.

### Visibility

The weekly goal progress bar appears:
- On the studio's lobby TV (prominent, animated)
- On the studio's in-app page
- In each member's app (their personal contribution)

---

## 8. Best Practices for Member Engagement

### Getting Members to Connect Wearables

| Strategy | Details |
|----------|---------|
| Announce it in class | "We're on bnco now - connect your WHOOP or Apple Watch to see your Precision Score" |
| Put a QR code in the lobby | Link to bnco.app signup page |
| Show the lobby feed on the TV | Social proof - members see scores and want to participate |
| Run a launch challenge | First studio challenge creates buzz |
| Highlight top scores | Call out the Athlete of the Week in class |

### Driving Consistent Usage

| Strategy | Details |
|----------|---------|
| Set weekly tension goals | Shared goals create accountability |
| Run monthly challenges | Keeps competition fresh |
| Celebrate milestones | "Jane just hit a 90+ bnco Score!" |
| Address at-risk members early | A quick text can prevent churn |
| Keep the lobby feed visible | Constant reminder that scores matter |

### Privacy Considerations

- Members choose whether to appear on the leaderboard (opt-in, default: visible)
- No raw health data is ever shown to studio admins - only bnco scores
- Members can leave a studio at any time
- Studios never see heart rate, HRV, or other raw biometrics

### Instructor Tips

- Don't turn bnco into pressure - it's about precision, not intensity
- Praise consistency over high scores
- Use the leaderboard to celebrate regulars, not shame newcomers
- Frame the weekly goal as a team effort, not individual responsibility
- Reference the Stillness Score specifically: "Keep your wrists still in the straps - your score will thank you"

---

## 9. Pricing for Studios (Planned)

| Tier | Price | Features |
|------|-------|----------|
| Free | $0/mo | Up to 25 members, basic leaderboard, no lobby feed |
| Pro | $49/mo | Unlimited members, lobby feed, weekly goals, at-risk alerts |
| Enterprise | Custom | Multi-location, API access, white-label lobby, priority support |

Pricing is subject to change before launch.

---

## 10. Support & FAQ

**Q: Do my instructors need to do anything different?**
No. bnco works passively through wearables. Instructors teach normally.

**Q: What if a member doesn't have a WHOOP or Apple Watch?**
They can still join the studio and community features. They just won't have scores until they connect a device.

**Q: Can I see my members' heart rate or health data?**
No. Studio admins only see bnco scores (0-100), session counts, and trend indicators. Raw biometrics are private to the member.

**Q: How often does the lobby feed update?**
In real-time. When a member finishes a workout, their score appears on the lobby within seconds via SSE (Server-Sent Events).

**Q: Can I run multiple challenges at once?**
Yes, but we recommend one at a time for maximum engagement.

**Q: What happens if we don't hit our weekly goal?**
Nothing punitive. The progress bar resets Monday. Adjust the target based on what your community can realistically achieve.
