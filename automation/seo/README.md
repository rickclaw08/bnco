# ClawOps SEO Monitoring System

Automated SEO monitoring and opportunity discovery for theclawops.com. This system tracks keyword rankings, finds backlink opportunities, analyzes content gaps, and monitors business directory citations.

## System Overview

| Module | Purpose | Schedule | Output |
|--------|---------|----------|--------|
| Backlink Scanner | Finds guest post, directory, and link opportunities | Every 6 hours | `data/backlink-opportunities.json` |
| Content Gap Analyzer | Identifies keywords/topics competitors cover that we do not | Daily 3 AM EST | `data/content-gaps.json` |
| Rank Monitor | Tracks keyword rankings via GSC, alerts on changes | Daily 6 AM EST | `data/rank-history.json` |
| Citation Tracker | Checks business directory listings for accuracy | Weekly Mon 2 AM EST | `data/citations.json` |

## Quick Start

### 1. Install dependencies

```bash
cd automation/seo
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Run a test

```bash
node backlink-scanner.js
node content-gap.js
node rank-monitor.js
node citation-tracker.js
```

### 4. Set up cron

See `cron-config.md` for full crontab instructions.

## Modules

### 1. Backlink Opportunity Scanner (`backlink-scanner.js`)

Discovers backlink opportunities across the AI automation, SaaS, small business, and productivity niches.

**What it does:**
- Searches for "write for us" and guest post pages in relevant niches
- Maintains a curated database of known high-value directories (Product Hunt, G2, Capterra, Crunchbase, etc.)
- Scores opportunities by relevance and estimated domain authority
- Analyzes opportunity pages for submission forms and contact emails
- Deduplicates by domain and tracks discovery dates

**Output fields:**
- `summary` - Counts by type, status, and niche
- `opportunities[]` - Sorted by estimated DA, includes type (directory/guest_post), relevance score, contact info

**Environment variables:**
- `BRAVE_API_KEY` - Required for web search discovery (optional but recommended)
- `MOZ_API_KEY` - Optional, for real domain authority data

---

### 2. Content Gap Analyzer (`content-gap.js`)

Compares competitor content against our coverage to find topics and keywords worth targeting.

**What it does:**
- Fetches blog content from 8 competitors (Zapier, Make, n8n, Relevance AI, Bardeen, Workato, Tray.io, Activepieces)
- Extracts topics from competitor blog URLs and sitemaps
- Checks keyword gaps using Brave Search (which competitors rank for, where we do not appear)
- Maintains a database of 30+ target keywords with volume estimates
- Generates blog post suggestions with priority levels and format recommendations

**Output fields:**
- `summary` - Competitor count, gaps found, suggestion counts by priority
- `competitors[]` - Each competitor with article counts
- `keywordGaps[]` - Keywords where competitors rank and we do not
- `blogPostSuggestions[]` - Actionable content ideas with target keywords

**Environment variables:**
- `BRAVE_API_KEY` - Enables real keyword gap analysis (works without it using heuristics)

---

### 3. GSC Rank Monitor (`rank-monitor.js`)

Tracks keyword rankings for theclawops.com using Google Search Console data.

**What it does:**
- Connects to Google Search Console API for real ranking data
- Tracks 20 priority keywords (AI automation agency, AI workflow automation, etc.)
- Detects significant rank changes (5+ positions up or down)
- Generates alerts with severity levels (warning at 5+ positions, critical at 10+)
- Stores 90 days of ranking history per keyword
- Falls back to Brave Search-based rank estimation when GSC is not configured

**Output fields:**
- `currentSummary` - Average position, total clicks/impressions, top-10/20/50 keyword counts
- `trackedKeywords[]` - Current positions for priority keywords
- `recentAlerts[]` - Rank changes exceeding the threshold
- `dailySnapshots[]` - Historical daily snapshots (90-day retention)

**Alert format:**
```json
{
  "keyword": "AI automation agency",
  "previousPosition": 15.2,
  "currentPosition": 8.7,
  "change": 6.5,
  "direction": "improved",
  "severity": "warning"
}
```

**Environment variables (pick one auth method):**

| Method | Variables |
|--------|-----------|
| Service account key file | `GSC_SERVICE_ACCOUNT_KEY` (path to JSON) |
| Service account env vars | `GSC_CLIENT_EMAIL`, `GSC_PRIVATE_KEY` |
| OAuth2 | `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, `GSC_REFRESH_TOKEN` |

**GSC Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable the Search Console API
3. Create a service account and download the JSON key
4. Add the service account email as a user in Search Console (Settings > Users and permissions)
5. Set `GSC_SERVICE_ACCOUNT_KEY=/path/to/key.json` in `.env`

---

### 4. Local Citation Tracker (`citation-tracker.js`)

Monitors business directory listings for ClawOps to ensure NAP (Name, Address, Phone) consistency and identify new listing opportunities.

**What it does:**
- Checks 30+ directories across 6 categories (major, tech, AI, business, startup, reviews)
- Verifies listing existence via search or direct URL checks
- Tracks listing status changes over time
- Generates priority action lists for missing critical/high-value directories
- Provides recommendations for improving citation coverage

**Directories tracked:**
- **Major:** Google Business, Yelp, BBB, LinkedIn, Facebook, Apple Maps, Bing Places
- **Tech:** Clutch, G2, Capterra, Crunchbase, Product Hunt
- **AI:** There's An AI For That, Futurepedia, Toolify.ai, TopAI.tools
- **Reviews:** Trustpilot, GoodFirms
- **Startup:** BetaList, SaaSHub, AlternativeTo, StackShare
- **Business:** Manta, Hotfrog, Foursquare, Chamber of Commerce

**Output fields:**
- `summary` - Coverage percentage, counts by category and priority
- `priorityActions[]` - Missing listings sorted by importance
- `citations[]` - Full status of each directory
- `recommendations[]` - Actionable improvement suggestions

**Environment variables:**
- `BRAVE_API_KEY` - For searching directory listings (recommended)
- `BUSINESS_PHONE`, `BUSINESS_EMAIL`, `BUSINESS_ADDRESS`, etc. - For NAP verification

## File Structure

```
automation/seo/
├── README.md              # This file
├── .env.example           # Environment variable template
├── .env                   # Your configuration (not in git)
├── package.json           # Node.js dependencies
├── cron-config.md         # Cron schedule documentation
├── backlink-scanner.js    # Backlink opportunity discovery
├── content-gap.js         # Content gap analysis
├── rank-monitor.js        # Keyword rank tracking
├── citation-tracker.js    # Directory citation monitoring
└── data/                  # Output data (auto-created)
    ├── backlink-opportunities.json
    ├── content-gaps.json
    ├── rank-history.json
    ├── rank-alerts.json
    └── citations.json
```

## API Keys Required

| Key | Module(s) | Required | Where to Get |
|-----|-----------|----------|--------------|
| `BRAVE_API_KEY` | All modules | Recommended | [Brave Search API](https://api.search.brave.com/) |
| GSC credentials | Rank Monitor | For GSC data | [Google Cloud Console](https://console.cloud.google.com) |
| `MOZ_API_KEY` | Backlink Scanner | Optional | [Moz API](https://moz.com/products/api) |

**Minimum setup:** The system works without any API keys but provides limited data. Adding `BRAVE_API_KEY` significantly improves all modules. GSC credentials are needed for accurate rank tracking.

## Data Retention

- Rank history: 90 daily snapshots
- Rank alerts: Last 500 alerts
- Backlink opportunities: Cumulative (deduplicated by domain)
- Content gaps: Replaced each run with trend comparison
- Citations: Replaced each run with status change tracking

## Error Handling

All modules include:
- Graceful degradation when API keys are missing
- Request timeouts (10-15 seconds)
- Rate limiting between API calls (300-1000ms delays)
- Try/catch around all network requests
- Existing data preservation on partial failures
- Exit code 1 on fatal errors for cron monitoring

## Troubleshooting

**No data in output files:**
- Check that at least `BRAVE_API_KEY` is set in `.env`
- Run manually and check console output for errors

**GSC returns no data:**
- GSC data has a 2-3 day delay; new properties may take a week
- Verify the service account has access in Search Console settings
- Check that the site URL format matches (`sc-domain:` vs `https://`)

**Rate limiting errors:**
- Brave Search free tier allows 1 request/second
- The system includes built-in delays but heavy use may hit limits
- Consider upgrading to a paid Brave API plan

**Cron not running:**
- Verify the Node.js path in crontab matches your system (`which node`)
- Check cron logs: `grep CRON /var/log/syslog` (Linux) or `log show --predicate 'process == "cron"'` (macOS)
