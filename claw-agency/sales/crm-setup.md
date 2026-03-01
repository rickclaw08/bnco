# CRM Setup Guide — ClawOps

## Recommended CRM: HubSpot (Free Tier)

**Why HubSpot Free:**
- Unlimited contacts and users
- Built-in email tracking, templates, and sequences
- Pipeline management with drag-and-drop
- Meeting scheduler (replaces Calendly)
- Integrates with Gmail/Outlook, Slack, Zapier
- Scales with you — paid tiers available when needed
- Actually good UX (your team will use it)

**Alternatives if HubSpot isn't your vibe:**
- **Folk CRM** — lightweight, great for small teams
- **Attio** — modern, flexible, free for small teams
- **Google Sheets** — if you truly want zero setup (template below)

---

## Pipeline Stages

Set up this exact pipeline in HubSpot → Deals → Pipeline Settings:

| Stage | Description | Expected Time in Stage |
|-------|-------------|----------------------|
| **1. New Lead** | Just entered our world — form fill, DM, referral, cold reply | < 2 days |
| **2. Qualified** | Passed BANT (score ≥ 8/12). Worth pursuing. | < 3 days |
| **3. Discovery Scheduled** | Discovery call is booked on calendar | Until call date |
| **4. Discovery Completed** | Call done. We understand their problem and they're interested. | < 3 days |
| **5. Proposal Sent** | Proposal delivered. Clock starts on follow-up cadence. | < 7 days |
| **6. Negotiation** | They're engaged — discussing scope, pricing, or terms | < 7 days |
| **7. Closed Won** ✅ | Signed contract + payment received | — |
| **8. Closed Lost** ❌ | Dead deal. Log the reason. | — |

### Lost Reasons (track these):
- Too expensive
- Went with competitor
- Decided to build internally
- No budget / timing
- Ghosted
- Not a fit

---

## HubSpot Setup Checklist

### Step 1: Create Account
1. Go to [hubspot.com](https://www.hubspot.com) → Start free
2. Use your business email
3. Company name: ClawOps

### Step 2: Configure Pipeline
1. Go to **Settings → Objects → Deals → Pipelines**
2. Edit default pipeline or create new: "Sales Pipeline"
3. Add the 8 stages above in order
4. Set win probability for each stage:
   - New Lead: 10%
   - Qualified: 20%
   - Discovery Scheduled: 30%
   - Discovery Completed: 50%
   - Proposal Sent: 60%
   - Negotiation: 75%
   - Closed Won: 100%
   - Closed Lost: 0%

### Step 3: Custom Properties
Add these deal properties:
- **Lead Source** (dropdown): LinkedIn, Cold Email, Reddit, Referral, Inbound, Other
- **BANT Score** (number): 1–12
- **Lost Reason** (dropdown): see list above
- **Service Tier** (dropdown): Starter, Growth, Enterprise

### Step 4: Contact Properties
Add:
- **Company Size** (dropdown): 1–10, 11–50, 51–200, 200+
- **Industry** (dropdown): Marketing Agency, E-commerce, Real Estate, SaaS, Coaching, Other
- **Current Tools** (text): what they're using now

### Step 5: Email Integration
1. **Settings → Integrations → Email** → connect your Gmail/Outlook
2. Enable email tracking (opens & clicks)
3. Enable logging (auto-log emails to contacts)

### Step 6: Meeting Link
1. **Sales → Meetings** → create your booking page
2. Set availability: your actual calendar
3. Duration: 30 min for discovery calls
4. Add to email signature and proposals

### Step 7: Templates
Create email templates for:
- [ ] Initial outreach response
- [ ] Discovery call confirmation
- [ ] Proposal follow-up (Day 1, 3, 7, 14, 30 — from playbook)
- [ ] Closed Won welcome email
- [ ] Closed Lost graceful exit

---

## Daily CRM Routine (10 min)

| Task | Frequency |
|------|-----------|
| Update deal stages for any movement | Daily |
| Log notes after every call | After each call |
| Check deals stuck > 7 days in one stage | Daily |
| Review pipeline value (total + by stage) | Weekly |
| Clean up dead leads (move to Closed Lost) | Weekly |

---

## Google Sheets Fallback

If you want to start before setting up HubSpot, use this structure:

| Column | Example |
|--------|---------|
| Contact Name | Jane Smith |
| Company | Acme Co |
| Email | jane@acme.com |
| Phone | 555-1234 |
| Lead Source | LinkedIn |
| Stage | Discovery Completed |
| BANT Score | 10 |
| Deal Value | $2,000/mo |
| Next Action | Send proposal by Friday |
| Notes | Wants to automate client onboarding |
| Last Contact Date | 2026-02-18 |

Create a Google Sheet with these columns and move to HubSpot once you have 10+ leads.

---

## Key Rule

**If it's not in the CRM, it didn't happen.** Log every interaction. Future-you will thank present-you.
