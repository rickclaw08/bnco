# Lead Hunter Operational Playbook

**Version:** 1.0
**Created:** 2026-03-01
**Reference:** [Lead Hunter Spec](./lead-hunter-spec.md)

---

## How to Use This Playbook

This is the step-by-step operating manual for the Lead Hunter agent. Follow it sequentially during each shift. The spec defines *what* - this defines *how*.

---

## Phase 1: Shift Startup (5 minutes)

### Step 1: Load Context
1. Read `lead-hunter-spec.md` for product knowledge, scoring criteria, and templates
2. Read yesterday's lead file (`fresh-leads-YYYY-MM-DD.md`) to avoid duplicates
3. Read `hot-leads.md` pipeline to know what's already being worked
4. Check `dm-log` for any pending follow-ups

### Step 2: Check Status
1. Note current time and determine which scanning window you're in (morning/lunch/evening/weekend)
2. Check if any urgent flags were left by previous shift or sales team
3. Verify Reddit API access is working (quick test fetch)

---

## Phase 2: Reddit Scanning (Primary Activity)

### Step 3: Tier 1 Subreddit Sweep

Execute in this order (highest ROI first):

#### 3a. r/gohighlevel
```bash
curl -s -A "Mozilla/5.0 (compatible; LeadHunter/1.0)" \
  "https://www.reddit.com/r/gohighlevel/new.json?limit=25" | \
  jq '.data.children[].data | {title, selftext, author, url, created_utc, num_comments, score}'
```

**What to scan for:**
- Posts about "adding services", "client retention", "new offering", "white label"
- Questions about phone/voice/call handling integrations
- Frustration posts about client churn or service gaps
- Anyone asking "what else can I sell my clients?"

**Action on match:**
1. Open the full post (click through to Reddit)
2. Read all comments for additional context
3. Score the lead using criteria from spec Section 5
4. Log in today's fresh-leads file immediately
5. If HOT (80+): Draft DM using Template B, queue for review
6. If relevant thread: Draft comment using Template D

#### 3b. r/msp
```bash
curl -s -A "Mozilla/5.0 (compatible; LeadHunter/1.0)" \
  "https://www.reddit.com/r/msp/new.json?limit=25" | \
  jq '.data.children[].data | {title, selftext, author, url, created_utc, num_comments, score}'
```

**What to scan for:**
- Phone system migrations or complaints
- "What tools do you offer clients?" threads
- VoIP, call center, or communication stack discussions
- Managed service providers looking to expand offerings

#### 3c. r/AgencyOwners
```bash
curl -s -A "Mozilla/5.0 (compatible; LeadHunter/1.0)" \
  "https://www.reddit.com/r/AgencyOwners/new.json?limit=25" | \
  jq '.data.children[].data | {title, selftext, author, url, created_utc, num_comments, score}'
```

**What to scan for:**
- Revenue diversification discussions
- Client service offerings
- White-label product searches
- Agency scaling challenges

### Step 4: Tier 2 Subreddit Sweep

Same process as Step 3, applied to:

1. **r/smallbusiness** - Focus on: operational pain, hiring struggles, phone complaints
2. **r/Entrepreneur** - Focus on: service business builders, automation seekers
3. **r/AI_Agents** - Focus on: voice AI interest, business automation use cases
4. **r/HVAC** - Focus on: business owners (not techs), growth/scaling posts
5. **r/Plumbing** - Focus on: shop owners, customer management issues
6. **r/electricians** - Focus on: running a business, not technical electrical questions
7. **r/sweatystartup** - Focus on: service business launches, operational challenges

**Template command (replace {subreddit}):**
```bash
curl -s -A "Mozilla/5.0 (compatible; LeadHunter/1.0)" \
  "https://www.reddit.com/r/{subreddit}/new.json?limit=25" | \
  jq '.data.children[].data | {title, selftext, author, url, created_utc, num_comments, score}'
```

### Step 5: Keyword Search Across Reddit

For high-value keywords, search across all of Reddit:

```bash
curl -s -A "Mozilla/5.0 (compatible; LeadHunter/1.0)" \
  "https://www.reddit.com/search.json?q=%22need+a+receptionist%22&sort=new&limit=25" | \
  jq '.data.children[].data | {title, subreddit, author, url, created_utc}'
```

**Priority keyword searches (rotate through daily):**
1. `"need a receptionist"` OR `"hiring receptionist"`
2. `"missing calls"` OR `"missed calls"` OR `"miss calls"`
3. `"answering service"` OR `"virtual receptionist"`
4. `"AI receptionist"` OR `"AI phone"` OR `"voice AI"`
5. `"white label"` AND `"voice"` OR `"phone"` OR `"AI"`
6. `"after hours calls"` OR `"24/7 answering"`
7. `"losing leads"` OR `"losing customers"` AND `"phone"`

---

## Phase 3: Google Maps Prospecting (2 hours daily)

### Step 6: Select Today's Target

**Pick ONE industry + 3-4 cities from the rotation:**

**Week 1 Rotation Example:**
| Day | Industry | Cities |
|-----|----------|--------|
| Mon | HVAC | Houston, Dallas, San Antonio, Austin |
| Tue | Plumbing | Phoenix, Tucson, Las Vegas, Denver |
| Wed | Electrical | Atlanta, Charlotte, Nashville, Jacksonville |
| Thu | Roofing | Miami, Tampa, Orlando, Lakeland |
| Fri | Pest Control | Raleigh, Richmond, Birmingham, Huntsville |
| Sat | Landscaping | Indianapolis, Columbus, Louisville, Memphis |
| Sun | Mixed/Catch-up | Wherever quota is behind |

### Step 7: Execute Google Maps Search

For each city/industry combo:

1. **Search Google Maps**: `"{industry} contractor near {city}"`
2. **Filter results**: Look for businesses with:
   - 3.5-4.5 stars
   - 50-500 reviews
   - Website listed
   - Phone number listed
3. **Review mining**: Click into each business, scan reviews for:
   - "never called back"
   - "hard to reach"
   - "went to voicemail"
   - "took days to respond"
   - "couldn't get through"
4. **Capture lead data**:
   - Business name
   - Owner name (check website About page)
   - Phone number
   - Email (check website Contact page)
   - Address/city
   - Star rating + review count
   - Any negative review quotes about call handling
5. **Score and log** in today's fresh-leads file

### Step 8: Enrich Google Maps Leads

For each Maps lead scored WARM or higher:

1. **Check website** for:
   - Owner/founder name
   - Contact email (not info@ if possible)
   - Business size indicators (team page, fleet photos, service area)
   - Current tech stack (scheduling tools, chat widgets)
2. **Check social media**: LinkedIn, Facebook for owner info
3. **Note current phone setup**: Call their number. Does a human answer? Voicemail? IVR? This tells us their pain level.

---

## Phase 4: Lead Processing & Output

### Step 9: Score Every Lead

Apply the scoring matrix from spec Section 5:

**Quick Scoring Checklist:**
- [ ] Explicit need stated? (+25)
- [ ] Decision maker? (+20)
- [ ] Right industry? (+20)
- [ ] Budget signals? (+15)
- [ ] Urgency indicators? (+10)
- [ ] Recent/active post? (+10)

**Thresholds:**
- 80-100 = HOT
- 50-79 = WARM
- 20-49 = COOL
- <20 = DISQUALIFIED (don't log)

### Step 10: Log Leads in Daily File

Create/update: `claw-agency/sales/leads/fresh-leads-YYYY-MM-DD.md`

Use the exact output format from spec Section 6. Every lead gets its own entry.

**Save after every 3-5 leads. Do not batch.**

### Step 11: Handle HOT Leads Immediately

For any lead scored 80+:

1. **Alert immediately** - Flag in hot-leads pipeline
2. **Draft outreach** - Select appropriate DM template from spec Section 7:
   - Pain about missed calls/need receptionist = Template A
   - Agency owner/white-label interest = Template B
   - Problem aware but not solution seeking = Template C
   - Public Reddit comment opportunity = Template D
   - Google Maps cold outreach = Template E
3. **Personalize the template** - Replace all variables, add specific references to their post/business
4. **Queue for review** or send if pre-approved
5. **Log in dm-log** with timestamp and template used

---

## Phase 5: End of Shift

### Step 12: Daily Summary

Create a summary at the top of today's lead file:

```markdown
# Lead Hunter Daily Report - YYYY-MM-DD

## Summary
- Total Leads Found: XX
- HOT: XX | WARM: XX | COOL: XX
- Sources: Reddit (XX), Google Maps (XX)
- Top Subreddit Today: r/{sub}
- DMs Drafted: XX
- Quota Status: MET/BEHIND (XX/20)

## Action Items
1. ...
2. ...

## Notes for Next Shift
- ...
```

### Step 13: Pipeline Updates

1. Move any converted leads from `hot-leads.md` to archive
2. Add new HOT leads to `hot-leads.md`
3. Update `warm-nurture.md` with new WARM leads
4. Note any subreddit or keyword performance insights

### Step 14: Quota Check

- **If quota met (20+ leads):** Note top sources and any trends
- **If quota not met:** Document why and what was tried. Suggest adjustments for next shift.
- **If quota crushed (30+):** Note what worked so well and replicate

---

## Troubleshooting

### Reddit API Returns 429 (Rate Limited)
- Wait 60 seconds, retry
- Switch to web_search as fallback: `site:reddit.com "{keyword}"`
- Use alternative user agents
- Space out requests (minimum 2 seconds between calls)

### Low Lead Volume Day
1. Expand to Tier 3 subreddits
2. Broaden keyword searches (use WARM keywords instead of just HOT)
3. Increase Google Maps city rotation
4. Search Reddit with date filters for past 48 hours instead of just today
5. Try cross-platform: search Twitter/X for same keywords

### Lead Quality Dropping
1. Tighten scoring criteria - add minimum thresholds
2. Review recent DISQUALIFIEDs - are good leads being missed?
3. Check if subreddit demographics have shifted
4. Discuss with CRO about updating ideal customer profile

### Duplicate Leads
- Always check existing pipeline files before logging
- Search by username (Reddit) or business name (Maps)
- If found: update existing entry instead of creating new one

---

## Metrics to Track (Weekly)

| Metric | How to Measure |
|--------|----------------|
| Leads per subreddit | Count by source in daily files |
| Score accuracy | Compare initial score to outcome (did HOT leads actually convert?) |
| DM response rate | Responses received / DMs sent |
| Template performance | Which template gets best response rate |
| Time to lead | How fast from post to DM |
| Google Maps hit rate | Qualified leads / businesses reviewed |
| Keyword ROI | Leads found per keyword search |

---

## Appendix: Quick Reference Commands

### Reddit JSON API Patterns

```bash
# New posts in a subreddit
curl -s -A "Mozilla/5.0" "https://www.reddit.com/r/{sub}/new.json?limit=25"

# Search within a subreddit
curl -s -A "Mozilla/5.0" "https://www.reddit.com/r/{sub}/search.json?q={query}&restrict_sr=1&sort=new&limit=25"

# Search all of Reddit
curl -s -A "Mozilla/5.0" "https://www.reddit.com/search.json?q={query}&sort=new&limit=25"

# Get post comments
curl -s -A "Mozilla/5.0" "https://www.reddit.com/comments/{post_id}.json"

# User profile (check if they're a business owner)
curl -s -A "Mozilla/5.0" "https://www.reddit.com/user/{username}/about.json"
```

### jq Filters

```bash
# Extract post essentials
jq '.data.children[].data | {title, selftext, author, url, created_utc, num_comments, score}'

# Filter by keyword in title
jq '.data.children[].data | select(.title | test("receptionist|missed calls|answering"; "i")) | {title, author, url}'

# Get posts from last 24 hours (Unix timestamp math)
jq --argjson cutoff $(date -d '24 hours ago' +%s) '.data.children[].data | select(.created_utc > $cutoff) | {title, author, url, created_utc}'
```

---

*This playbook should be reviewed and updated weekly based on what's actually working.*
