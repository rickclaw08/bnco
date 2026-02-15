# ClawOps Discord Server Setup

## Server Structure

### Categories & Channels

**📋 WELCOME**
- #rules (locked, admin only)
- #announcements (locked, admin only)
- #introductions
- #roadmap (locked, show upcoming features)

**💬 GENERAL**
- #general-chat
- #showcase (show off your agents!)
- #memes-and-fun

**🆘 SUPPORT**
- #quick-help (for DIY kit users)
- #error-fixes (paste errors, get solutions)
- #installation-help
- #model-setup
- #cost-optimization

**🎓 RESOURCES**
- #guides-and-tutorials
- #fix-library-updates
- #video-walkthroughs
- #community-scripts

**🚀 ADVANCED**
- #multi-agent-setups
- #custom-skills
- #integrations
- #performance-tuning

**💼 TIERS** (Role-locked channels)
- #dwy-clients (Done With You customers only)
- #dfy-clients (Done For You customers only)  
- #care-vip (Monthly Care customers only)

**🔧 ADMIN** (Staff only)
- #team-chat
- #support-tickets
- #daily-standup

---

## Roles Setup

### Customer Roles (Auto-assigned on join)
- **@DIY Explorer** - DIY Kit buyers (Blue)
- **@DWY Builder** - Done With You buyers (Green)
- **@DFY Executive** - Done For You buyers (Gold)
- **@Care VIP** - Monthly care subscribers (Purple)

### Community Roles (Earned)
- **@Helper** - Active community helpers (Orange)
- **@Expert** - Recognized OpenClaw experts (Red)
- **@Pioneer** - Early adopters/beta testers (Pink)

### Staff Roles
- **@Support** - ClawOps support team (Light Blue)
- **@Admin** - Server administrators (Dark Red)
- **@Founder** - Agency owner (Crown icon)

---

## Auto-Moderator Rules

### Rule 1: No API Keys
- Trigger: Message contains "sk-", "key=", "api_key"
- Action: Delete message + DM warning
- Message: "Never share API keys publicly! Use our secure sharing method."

### Rule 2: Spam Prevention
- Trigger: 5 messages in 10 seconds
- Action: 5-minute timeout
- Message: "Slow down! You've been timed out for spam."

### Rule 3: External Links
- Trigger: Links outside approved list
- Action: Delete if from new users (<7 days)
- Approved: github.com, openclaw docs, clawops.com

### Rule 4: Promotion
- Trigger: "DM me", "check out my", "for hire"
- Action: Flag for review
- Note: Allow in #showcase only

---

## Welcome Flow

### New Member Joins:

**Bot DM:**
```
Welcome to ClawOps Discord! 🚀

I see you purchased the {tier} package. You've been given the @{role} role.

**Quick Start:**
1. Introduce yourself in #introductions
2. Your tier channels: {list_channels}
3. Need help? Start in #quick-help
4. Read #rules for guidelines

**Your Resources:**
- Fix Library: {link}
- Video Guides: {link}
- Support Ticket: {link}

Let's get your OpenClaw running!
```

**Auto-Actions:**
1. Grant role based on email/purchase
2. Send welcome DM
3. Post in #team-chat: "New {tier} customer: {username}"

---

## Channel Templates

### #rules
```
# ClawOps Community Rules

1. **Be Helpful** - We're all learning together
2. **No API Keys** - Never share keys publicly
3. **Search First** - Check #fix-library before asking
4. **Stay On Topic** - Use the right channel
5. **Respect Tiers** - Some channels are tier-specific
6. **No Spam/Promotion** - Ask before sharing projects
7. **English Primary** - For broadest help

Breaking rules = warning → timeout → ban
```

### #quick-help Template
```
**Need Help? Use This Format:**

**Environment:** Mac/Linux/Docker/Windows
**Error:** (paste the exact error)
**What I Tried:** (list your attempts)
**Goal:** (what you're trying to do)

**Before Posting:**
- [ ] Checked #error-fixes 
- [ ] Searched the fix library
- [ ] Read the relevant guide
```

### #showcase Template
```
**Share Your Agent!**

**Agent Name:**
**What It Does:**
**Cool Features:**
**Tech Stack:**
**Screenshot/Demo:**
**Learned:** (tips for others)
```

---

## Engagement Strategies

### Daily
- "Error of the Day" in #error-fixes
- Answer questions in #quick-help
- Share new fixes in #fix-library-updates

### Weekly  
- "Win of the Week" - feature cool agents
- Office Hours in voice channel
- Fix Library stats (most common errors)

### Monthly
- Community Call (screen share demos)
- Expert Badge awards
- Feature updates announcement

---

## Bot Commands

**MEE6 or Dyno Custom Commands:**

`!fix [error]` - Searches fix library
`!docs` - Links to documentation
`!tier` - Shows user's purchase tier
`!upgrade` - DMs upgrade options
`!ticket` - Creates private support thread
`!status` - Shows OpenClaw service status page

---

## Metrics to Track

- Daily active users by tier
- Most common help requests
- Upgrade conversions from Discord
- Time to first response
- Helper/Expert contributions
- Fix library usage

---

## Voice Channels

**🔊 Voice Rooms**
- General Voice (open)
- Screen Share Support (DWY+)
- Office Hours (scheduled)
- VIP Lounge (Care only)

**Stage Channel**
- Weekly Demo Stage (everyone can listen)

---

## Integration Webhooks

1. **Purchase → Discord**
   - Auto-assign role
   - Welcome DM
   - Log to #team-chat

2. **Ticket System → Discord**
   - New ticket → #support-tickets
   - Resolved → Update thread

3. **Fix Library → Discord**
   - New fix → #fix-library-updates
   - Popular fix → Pin in #error-fixes