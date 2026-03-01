# Lead Monitoring Setup: Reddit Keyword Tracking + Qualification
*Created: 2026-02-28 | Agent: Flint (SDR)*
*Source: SDR research + team synthesis*

---

## 1. Keyword Monitoring List

Set up alerts (F5Bot, GummySearch, or manual search) for these keyword groups. Check daily.

### Group A: Direct Buyer Intent (Highest Priority)
These phrases mean someone is actively shopping for a solution right now.

- "answering service"
- "virtual receptionist"
- "need receptionist"
- "missed calls"
- "missing calls"
- "can't answer the phone"
- "can't answer phone"
- "after hours calls"
- "after-hours calls"
- "phone answering service"
- "who answers your phone"
- "my receptionist quit"
- "AI phone"
- "AI answering"
- "voicemail is full"
- "nobody leaves voicemails"
- "people don't leave voicemails"

### Group B: Pain-Adjacent (High Priority)
These phrases signal operational pain that our product solves, but the person may not know a solution exists yet.

- "losing leads"
- "losing jobs because"
- "missed a call"
- "can't keep up with calls"
- "phone keeps ringing"
- "on a job and can't answer"
- "customers keep calling"
- "call handling"
- "emergency calls at night"
- "spam calls mixed with real"
- "wife is answering the phone"
- "turned off my phone"
- "too many hats"
- "one-man shop"

### Group C: GHL/Agency-Specific (Reseller Channel)
These phrases identify potential white-label partners who can bring 10-100 clients each.

- "GHL voice"
- "GoHighLevel voice AI"
- "GHL missed call text back"
- "voice AI quality"
- "Vapi"
- "Bland AI"
- "Retell AI"
- "white-label fulfillment"
- "white label partner"
- "sub-account churn"
- "client retention"
- "SaaS mode revenue"
- "AI receptionist"
- "voice agent"

### Group D: Tech Curiosity / Early Stage
Lower urgency but worth tracking for relationship building.

- "what CRM do you use"
- "what tools for my business"
- "automate my business"
- "AI for small business"
- "just started my business what tools"
- "look more professional"
- "first hire"
- "business phone line"

---

## 2. Subreddit Priority Tiers

### Tier 1: Direct Prospect Pools
**Check daily. Comment and DM here.**

| Subreddit | Target Audience | Peak Signal |
|-----------|----------------|-------------|
| r/smallbusiness | SMB owners across industries | Missed calls, need admin help, receptionist pain |
| r/HVAC | HVAC business owners, techs going solo | Seasonal call volume spikes, one-man shop overwhelm |
| r/Plumbing | Plumbing business owners | Emergency after-hours calls, can't answer on jobs |
| r/electricians | Electrical business owners | Missing leads during jobs, growth pain |
| r/lawncare | Lawn care operators | Spring/summer call volume explosion (March-May) |
| r/landscaping | Landscaping business owners | Same seasonal pattern as lawncare |
| r/contractor | General contractors | Admin overwhelm, hiring vs. outsourcing debate |
| r/HomeImprovement | Homeowners (indirect) | "Called 5 plumbers, nobody answered" = social proof ammo |
| r/sweatystartup | Home service entrepreneurs | Operational bottleneck discussions, scaling pain |

### Tier 2: Agency/Reseller Channels
**Check 3-4x/week. Build relationships. One deal here = 10-50 end clients.**

| Subreddit | Target Audience | Why It Matters |
|-----------|----------------|----------------|
| r/GoHighLevel | GHL agency owners | #1 highest-leverage subreddit. Missed-call text-back is their top automation. Voice AI quality is their top complaint. |
| r/msp | Managed service providers | Already bundle phone/IT for SMBs. AI receptionist fits their stack. |
| r/digital_marketing | Marketing agency owners | Looking for new service lines to upsell clients |
| r/SaaS | SaaS founders | AI voice agent builders, potential partners |

### Tier 3: Intelligence Only
**Browse weekly. Learn tactics and buyer psychology. Do NOT prospect here.**

| Subreddit | Use Case |
|-----------|----------|
| r/sales | SDR tactics, cold outreach strategies, what's working now |
| r/Entrepreneur | Mix of intel and occasional prospects. Good for building-in-public posts. |

---

## 3. Lead Qualification Criteria

### Buying Readiness Levels

**HOT (DM within 24 hours)**
The person is actively looking for a solution. They've named the problem and want an answer.

Signals:
- Explicitly asks for a recommendation ("What answering service do you use?")
- Describes lost revenue from missed calls ("I lost a $5K job because I couldn't pick up")
- Mentions an urgent trigger event ("My receptionist quit", "We're getting slammed")
- Asks about specific tools ("Anyone use AI for phone answering?")
- Posts in a recommendation thread requesting solutions
- Their problem is the exact thing we solve and they know it

**WARM (Comment helpfully, DM if they engage)**
The person has the pain but hasn't connected it to a solution yet, or is early in their search.

Signals:
- Describes growth pain ("Can't keep up", "Wearing too many hats")
- Asks about after-hours operations without mentioning specific tools
- Complains about operational overwhelm in general
- Shows tech curiosity ("What software should I use?")
- Partner/spouse answering business calls (family tension = urgency)
- Posted about hiring first employee (cost comparison opportunity)

**COOL (Engage in thread, build relationship, no DM yet)**
The person fits our ICP but hasn't shown active pain. Worth building a relationship.

Signals:
- Shares a business milestone ("Just hit $100K revenue")
- Asks about professionalization ("How do I look more legit?")
- Discusses business phone setup
- Active in relevant subreddits but hasn't posted about our problem space
- New business owner asking general "what tools" questions

### Disqualify If:
- Account is clearly a competitor or vendor
- Post is about a completely different industry with no crossover
- Person already has a solution they're happy with
- Business is too early stage (pre-launch, no revenue, no phone volume)
- Located in a region we can't serve

---

## 4. Lead Tracking Spreadsheet Template

Use this structure in Google Sheets, Notion, or Airtable. One row per lead.

### Columns

| Column | Description | Values/Format |
|--------|-------------|---------------|
| **Date Found** | When you first spotted this lead | YYYY-MM-DD |
| **Username** | Reddit username (no u/ prefix) | Text |
| **Subreddit** | Where they posted | r/subreddit |
| **Thread URL** | Direct link to their post or comment | URL |
| **Signal Phrase** | The exact words that triggered this lead (quote them) | Text, quoted |
| **Signal Group** | Which keyword group matched | A / B / C / D |
| **Business Type** | Their industry/trade if identifiable | HVAC, Plumbing, Electrical, Lawn Care, Contractor, Restaurant, Agency, Other |
| **Buying Readiness** | How close to purchase | Hot / Warm / Cool |
| **Commented** | Did we comment on their thread? | Y / N |
| **Comment Date** | When we commented | YYYY-MM-DD |
| **DM Sent** | Did we send a DM? | Y / N |
| **DM Date** | When the DM was sent | YYYY-MM-DD |
| **DM Template Used** | Which template was the basis | A / B / C / D / GHL / Custom |
| **Response** | Did they reply? | No Reply / Replied / Call Booked / Closed / Blocked |
| **Response Date** | When they replied | YYYY-MM-DD |
| **Notes** | Context, post history intel, personal details for follow-up | Free text |

### Example Row

| Date Found | Username | Subreddit | Thread URL | Signal Phrase | Signal Group | Business Type | Buying Readiness | Commented | Comment Date | DM Sent | DM Date | DM Template Used | Response | Response Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-03-01 | hvacguy_mike | r/HVAC | reddit.com/r/HVAC/xxx | "I missed 4 calls today while on a roof unit" | A | HVAC | Hot | Y | 2026-03-01 | Y | 2026-03-01 | A | Replied | 2026-03-02 | Solo operator in TX, 3 years in business, growing fast |

---

## 5. Monitoring Tools Setup

### F5Bot (Free, Do First)
1. Go to f5bot.com, create account
2. Add keyword alerts for every phrase in Group A and Group C
3. Set email delivery to daily digest
4. Check email each morning as part of the daily scan

### Google Search Bookmarks (Free)
Save these as browser bookmarks. Run once per day.

```
site:reddit.com r/smallbusiness "answering service" OR "missed calls" OR "virtual receptionist"
site:reddit.com r/HVAC OR r/Plumbing OR r/electricians "can't answer" OR "missed calls" OR "losing leads"
site:reddit.com r/GoHighLevel "voice AI" OR "voice agent" OR "missed call text back" OR "white label"
site:reddit.com r/contractor OR r/lawncare "phone" OR "calls" OR "receptionist"
```

### Reddit RSS Feeds (Free)
Append `.rss` to any Reddit search URL. Pipe into a feed reader (Feedly, Inoreader).

```
https://www.reddit.com/r/smallbusiness/search.rss?q=missed+calls+answering+phone&sort=new
https://www.reddit.com/r/GoHighLevel/search.rss?q=voice+AI+missed+call&sort=new
https://www.reddit.com/r/HVAC/search.rss?q=answering+calls+phone+leads&sort=new
```

### GummySearch (Paid, When Budget Allows)
- Purpose-built Reddit prospecting tool
- Set up audience tracking for all Tier 1 and Tier 2 subreddits
- Filter by pain points, solution requests, and buying intent
- Export leads directly with post context

---

## 6. Daily Monitoring Routine (30-45 min)

### Morning Scan (10 min)
1. Check F5Bot email digest for overnight keyword hits
2. Open any relevant posts from alerts
3. Log new leads into tracking spreadsheet
4. Flag any HOT signals for immediate action

### Comment Pass (15 min)
1. Visit top 3-5 Tier 1 subreddits, sort by New
2. Read last 24 hours of posts
3. Comment helpfully on 3-5 threads where you can add value
4. Zero selling, zero linking, just useful operational advice
5. Log which threads you commented on

### DM Pass (5-10 min)
1. Review yesterday's HOT leads from the spreadsheet
2. For anyone who posted a red-hot signal and didn't get a great answer in the thread, send a DM
3. Use the appropriate template (see ghl-dm-templates.md for agency leads, outreach-templates.md for direct)
4. Cap at 5-10 DMs per day max
5. Log every DM sent

### Weekly GHL Scan (15 min, 3-4x/week)
1. Check r/GoHighLevel sorted by New and Hot
2. Look for voice AI complaint threads, pricing questions, white-label requests
3. Comment with genuine expertise
4. DM warm leads using GHL-specific templates

---

## 7. Account Health Rules

Your Reddit account is a long-term asset. Protect it.

- Account must be 30+ days old before any DMs (6+ months ideal)
- Post at least 2-3 genuine, helpful comments per day across relevant subs
- Mix in non-business activity (hobbies, sports, general questions) so the profile looks human
- Never DM more than 10 people in a single day
- Never copy-paste the exact same message to multiple people
- If someone doesn't reply to your DM, do NOT follow up on Reddit. Move on.
- Never link to your website or mention your company name in the first DM
- Keep your comment history clean of anything that looks like shilling

---

*Reference files:*
- *DM templates for GHL agency owners: `ghl-dm-templates.md`*
- *General outreach templates: `outreach-templates.md`*
- *Lead scoring: `lead-scoring-framework.md`*
- *SDR research source: `research/sdr-study-2026-02-28.md`*
