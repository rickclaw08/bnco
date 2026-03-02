# ManyChat Setup Guide for @theclawops

## Prerequisites Checklist

Before starting, make sure these are in place:

- [ ] @theclawops is a Professional Account (Business or Creator) on Instagram
- [ ] @theclawops is connected to a Facebook Page
- [ ] You have admin access to that Facebook Page
- [ ] You have the Facebook account credentials that own the Page

If @theclawops is still a Personal account, switch it:
Instagram > Settings > Account > Switch to Professional Account > Choose "Business"

---

## Step 1: Create ManyChat Account

1. Go to https://manychat.com
2. Click "Get Started Free"
3. Sign up with the Facebook account that manages the @theclawops Facebook Page
4. When prompted, select "Instagram" as your channel
5. Authorize ManyChat to access your Instagram Professional account
6. Select @theclawops from the list of connected accounts
7. Grant all requested permissions (message management, page access, etc.)

**Time: 5 minutes**

---

## Step 2: Connect Instagram Account

1. In ManyChat dashboard, go to Settings > Instagram
2. Click "Connect Instagram Account"
3. Log in with the Facebook account (not Instagram directly)
4. Select the Facebook Page linked to @theclawops
5. Select @theclawops as the Instagram account to connect
6. Verify the connection shows "Connected" with a green indicator

**Troubleshooting:** If @theclawops doesn't appear, check that:
- The IG account is Professional (not Personal)
- The IG account is linked to the Facebook Page
- You have admin role on the Facebook Page

**Time: 5 minutes**

---

## Step 3: Create the "DEMO" Keyword Trigger

1. In ManyChat, go to **Automation** > **Triggers**
2. Click **+ New Trigger**
3. Select trigger type: **Instagram DM Keyword**
4. Configure the keyword:
   - Keyword: `DEMO`
   - Match type: Select "Is" (exact match) or "Contains" (catches "demo", "DEMO", "Demo", etc.)
   - Recommended: Use "Contains" to catch variations like "demo please", "DEMO!", "I want a demo"
5. Click **Create**

**Time: 3 minutes**

---

## Step 4: Build the Main Automation Flow

After creating the trigger, you'll be taken to the Flow Builder. Build this:

### Message 1: Instant Reply (triggers immediately when "DEMO" is received)

```
Hey! Thanks for reaching out to ClawOps.

Want to see our AI receptionist in action? Call our live demo line right now:

(888) 457-8980

It picks up 24/7. Try asking it about pricing, booking an appointment, or anything you'd throw at a real receptionist.

After you call, let me know how it went! I'd love to hear your thoughts.
```

**Settings for this message:**
- Type: Text message
- Add a Quick Reply button: "I just called!" (this triggers the next step)
- Add a second Quick Reply button: "I'll call later"

---

## Step 5: Build Conditional Follow-Up Branches

### Branch A: User clicks "I just called!" or responds after calling

Trigger: User sends any message after the initial reply (within the conversation)

Create a new message in the flow:

```
Awesome! What did you think?

Was the AI receptionist what you expected? Any questions about how it would work for your business?
```

**Add Quick Reply buttons:**
- "That was impressive"
- "I have questions"
- "Not for me"

### Branch A1: User clicks "That was impressive" or responds positively

Trigger: Positive response keywords ("impressive", "amazing", "great", "love it", "interested", "sign me up", "yes")

```
Glad you liked it! Here's how we can get you set up.

Book a quick call with our team and we'll walk you through exactly how ClawOps plugs into your business:

https://theclawops.com/book/

No pressure, no hard sell. Just a straight conversation about whether it's a fit.
```

### Branch A2: User clicks "I have questions"

```
Of course! What would you like to know?

Some common ones:
- How does it integrate with my phone system?
- What does pricing look like?
- How long does setup take?

Or you can book a call and we'll walk through everything live:

https://theclawops.com/book/
```

### Branch B: User clicks "I'll call later"

Trigger: User clicks the "I'll call later" button

```
No worries! The demo line is live 24/7:

(888) 457-8980

Just DM me "called" when you've tried it and I'll follow up.
```

---

## Step 6: Set Up the 24-Hour Nudge Sequence

1. In the Flow Builder, after Message 1 (the initial reply), add a **Smart Delay**
2. Set delay to: **24 hours**
3. Add a condition: "Only send if user has NOT replied since the first message"
   - In ManyChat, use the "Has Not Replied" condition
4. After the delay + condition, add this message:

```
Hey! Just checking in. Did you get a chance to try our AI receptionist demo?

(888) 457-8980

Give it a ring when you get a minute. It only takes 30 seconds and you'll see exactly why businesses are switching to AI receptionists.
```

**Add Quick Reply buttons:**
- "Just called!"
- "Remind me tomorrow"

### If "Remind me tomorrow" is clicked:
Add another 24-hour delay, then:

```
Hey! Friendly last nudge. Our demo line is still live:

(888) 457-8980

Try it out and let me know what you think. If it's not your thing, no worries at all.
```

**Important:** Stop the sequence after 2 nudges max. Don't spam. Instagram will flag accounts that over-message.

---

## Step 7: Set Up Comment-to-DM Automation (Bonus, High Value)

This is the real growth hack. When you post a Reel or Post, tell viewers to comment "DEMO" and ManyChat auto-DMs them.

1. Go to **Automation** > **Triggers**
2. Click **+ New Trigger**
3. Select: **Instagram Comment Keyword**
4. Keyword: `DEMO`
5. Match type: "Contains"
6. Select which posts/reels to monitor (or all posts)
7. Connect it to the same flow you built above

**How to use in content:**
- End every Reel with: "Comment DEMO to try our AI receptionist live"
- Pin a comment on posts: "Comment DEMO and I'll send you the demo link"
- Story CTAs: "DM me DEMO to try it yourself"

This is how the big IG funnel operators get thousands of DMs. The content drives comments, comments trigger DMs, DMs drive calls, calls drive bookings.

---

## Step 8: Test Everything

1. Use a personal Instagram account (not @theclawops)
2. Send a DM to @theclawops saying "DEMO"
3. Verify the instant reply fires within seconds
4. Click through each Quick Reply button and verify the branches work
5. Wait 24 hours (or temporarily set the delay to 5 minutes for testing) and verify the nudge fires
6. Test the comment trigger by commenting "DEMO" on a test post
7. Check ManyChat analytics to confirm all events are tracked

---

## Step 9: Go Live Checklist

- [ ] All flow messages reviewed for typos and accuracy
- [ ] Phone number (888) 457-8980 is correct and demo is live
- [ ] Booking link https://theclawops.com/book/ is working
- [ ] 24-hour nudge delay is set to actual 24 hours (not test mode)
- [ ] Comment-to-DM trigger is active on all relevant posts
- [ ] ManyChat is on Pro plan (if over 1,000 contacts or need advanced features)
- [ ] Quick Reply buttons all route to correct branches
- [ ] "Not for me" branch exists (graceful exit, don't leave people hanging)

---

## Ongoing Maintenance

### Weekly (5 minutes)
- Check ManyChat analytics: how many "DEMO" triggers fired, response rate, booking link clicks
- Review any conversations where automation handed off to live chat

### Monthly (15 minutes)
- Update message copy if phone number or booking link changes
- Review conversion funnel: DMs > Calls > Bookings
- A/B test message variations (ManyChat Pro supports this)
- Check ManyChat billing and contact count

### As Needed
- Add new keyword triggers (e.g., "PRICING", "SETUP", "HELP")
- Build new flows for different content campaigns
- Adjust nudge timing based on conversion data
