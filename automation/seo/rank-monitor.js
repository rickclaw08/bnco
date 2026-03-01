#!/usr/bin/env node
/**
 * GSC Rank Monitor for ClawOps
 * 
 * Integrates with Google Search Console API to track keyword rankings
 * for theclawops.com. Alerts on significant rank changes (up or down 5+
 * positions). Stores ranking history for trend analysis.
 * 
 * Runs daily at 6 AM EST via cron.
 * Output: automation/seo/data/rank-history.json
 */

'use strict';

require('dotenv').config({ path: __dirname + '/.env' });

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'rank-history.json');
const ALERTS_FILE = path.join(DATA_DIR, 'rank-alerts.json');

const SITE_URL = 'sc-domain:theclawops.com'; // or 'https://theclawops.com/'
const ALERT_THRESHOLD = 5; // positions change to trigger alert

// Priority keywords to specifically track
const TRACKED_KEYWORDS = [
  'AI automation agency',
  'AI automation services',
  'ClawOps',
  'the claw ops',
  'AI workflow automation',
  'AI business automation',
  'custom AI solutions',
  'AI consulting agency',
  'automation agency',
  'AI agent development',
  'small business AI automation',
  'AI process automation',
  'AI tools for small business',
  'AI chatbot agency',
  'workflow automation consultant',
  'AI integration services',
  'business automation AI',
  'no code AI automation',
  'AI customer service automation',
  'AI lead generation',
];

// Authenticate with Google Search Console API
async function getAuthClient() {
  const keyFile = process.env.GSC_SERVICE_ACCOUNT_KEY;
  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const privateKey = process.env.GSC_PRIVATE_KEY;

  if (keyFile && fs.existsSync(keyFile)) {
    // Service account JSON key file
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
    return auth.getClient();
  }

  if (clientEmail && privateKey) {
    // Service account from environment variables
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
    await auth.authorize();
    return auth;
  }

  // OAuth2 flow
  const clientId = process.env.GSC_CLIENT_ID;
  const clientSecret = process.env.GSC_CLIENT_SECRET;
  const refreshToken = process.env.GSC_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
  }

  return null;
}

// Fetch search analytics data from GSC
async function fetchSearchAnalytics(auth, startDate, endDate) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query', 'page'],
        rowLimit: 1000,
        dataState: 'final',
      },
    });

    return response.data.rows || [];
  } catch (err) {
    if (err.code === 403) {
      console.error('[ERROR] GSC access denied. Ensure the service account has access to the property.');
    } else if (err.code === 401) {
      console.error('[ERROR] GSC authentication failed. Check credentials.');
    } else {
      console.error(`[ERROR] GSC API error: ${err.message}`);
    }
    return [];
  }
}

// Get date string in YYYY-MM-DD format
function getDateString(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Load existing rank history
function loadHistory() {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    }
  } catch (err) {
    console.error(`[WARN] Could not load history: ${err.message}`);
  }
  return {
    keywords: {},
    dailySnapshots: [],
    alerts: [],
    lastUpdated: null,
  };
}

// Calculate rank changes and generate alerts
function detectRankChanges(currentRankings, history) {
  const alerts = [];
  const previousSnapshot = history.dailySnapshots.length > 0
    ? history.dailySnapshots[history.dailySnapshots.length - 1]
    : null;

  if (!previousSnapshot) return alerts;

  const prevRankings = {};
  for (const entry of previousSnapshot.rankings || []) {
    prevRankings[entry.keyword] = entry;
  }

  for (const current of currentRankings) {
    const prev = prevRankings[current.keyword];
    if (!prev) continue;

    const positionChange = prev.position - current.position; // positive = improved
    if (Math.abs(positionChange) >= ALERT_THRESHOLD) {
      alerts.push({
        keyword: current.keyword,
        previousPosition: Math.round(prev.position * 10) / 10,
        currentPosition: Math.round(current.position * 10) / 10,
        change: Math.round(positionChange * 10) / 10,
        direction: positionChange > 0 ? 'improved' : 'declined',
        page: current.page,
        clicks: current.clicks,
        impressions: current.impressions,
        date: getDateString(),
        severity: Math.abs(positionChange) >= 10 ? 'critical' : 'warning',
      });
    }
  }

  return alerts;
}

// Generate a summary of overall site performance
function generatePerformanceSummary(rankings) {
  if (rankings.length === 0) {
    return {
      totalKeywords: 0,
      averagePosition: null,
      totalClicks: 0,
      totalImpressions: 0,
      averageCTR: null,
      top10Keywords: 0,
      top20Keywords: 0,
      top50Keywords: 0,
    };
  }

  const totalClicks = rankings.reduce((sum, r) => sum + (r.clicks || 0), 0);
  const totalImpressions = rankings.reduce((sum, r) => sum + (r.impressions || 0), 0);
  const avgPosition = rankings.reduce((sum, r) => sum + r.position, 0) / rankings.length;

  return {
    totalKeywords: rankings.length,
    averagePosition: Math.round(avgPosition * 10) / 10,
    totalClicks,
    totalImpressions,
    averageCTR: totalImpressions > 0
      ? Math.round((totalClicks / totalImpressions) * 10000) / 100
      : 0,
    top10Keywords: rankings.filter(r => r.position <= 10).length,
    top20Keywords: rankings.filter(r => r.position <= 20).length,
    top50Keywords: rankings.filter(r => r.position <= 50).length,
  };
}

// Fallback: simulate rank checking via Brave Search
async function fallbackRankCheck() {
  const axios = require('axios');
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    console.log('[SKIP] No BRAVE_API_KEY and no GSC credentials. Cannot check rankings.');
    return [];
  }

  const rankings = [];
  console.log('[FALLBACK] Using Brave Search to estimate rankings...');

  for (const keyword of TRACKED_KEYWORDS) {
    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        headers: { 'X-Subscription-Token': apiKey },
        params: { q: keyword, count: 20 },
        timeout: 15000,
      });

      const results = response.data.web?.results || [];
      const ourResult = results.findIndex(r =>
        r.url.includes('theclawops.com')
      );

      rankings.push({
        keyword,
        position: ourResult >= 0 ? ourResult + 1 : null,
        page: ourResult >= 0 ? results[ourResult].url : null,
        clicks: null,
        impressions: null,
        ctr: null,
        source: 'brave_search_estimate',
        tracked: true,
      });

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`  [ERROR] Failed to check "${keyword}": ${err.message}`);
    }
  }

  return rankings;
}

// Main monitor function
async function runMonitor() {
  console.log('[RANK MONITOR] Starting daily rank check at', new Date().toISOString());

  const history = loadHistory();
  let rankings = [];

  // Try GSC first
  const auth = await getAuthClient();

  if (auth) {
    console.log('[STEP 1] Fetching data from Google Search Console...');
    
    // GSC data has a 2-3 day delay, so we look at the last 7 days
    const endDate = getDateString(2); // 2 days ago (most recent available)
    const startDate = getDateString(9); // 9 days ago (7-day window)

    const rows = await fetchSearchAnalytics(auth, startDate, endDate);
    console.log(`[STEP 1] Retrieved ${rows.length} keyword-page combinations from GSC`);

    // Transform GSC data
    for (const row of rows) {
      const keyword = row.keys[0];
      const page = row.keys[1];
      
      rankings.push({
        keyword,
        position: row.position,
        page,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: Math.round(row.ctr * 10000) / 100,
        source: 'gsc',
        tracked: TRACKED_KEYWORDS.some(tk =>
          keyword.toLowerCase().includes(tk.toLowerCase()) ||
          tk.toLowerCase().includes(keyword.toLowerCase())
        ),
      });
    }
  } else {
    console.log('[STEP 1] No GSC credentials configured. Using fallback rank checking...');
    rankings = await fallbackRankCheck();
  }

  console.log(`[STEP 2] Processing ${rankings.length} keyword rankings...`);

  // Detect rank changes
  const alerts = detectRankChanges(rankings, history);
  if (alerts.length > 0) {
    console.log(`[ALERT] ${alerts.length} significant rank changes detected:`);
    for (const alert of alerts) {
      const arrow = alert.direction === 'improved' ? '↑' : '↓';
      console.log(`  ${arrow} "${alert.keyword}": ${alert.previousPosition} -> ${alert.currentPosition} (${alert.change > 0 ? '+' : ''}${alert.change})`);
    }
  } else {
    console.log('[STEP 2] No significant rank changes detected');
  }

  // Generate performance summary
  const summary = generatePerformanceSummary(rankings);

  // Track keyword history over time
  for (const ranking of rankings) {
    if (!history.keywords[ranking.keyword]) {
      history.keywords[ranking.keyword] = {
        firstSeen: getDateString(),
        history: [],
      };
    }
    history.keywords[ranking.keyword].history.push({
      date: getDateString(),
      position: ranking.position,
      clicks: ranking.clicks,
      impressions: ranking.impressions,
    });
    // Keep only 90 days of per-keyword history
    if (history.keywords[ranking.keyword].history.length > 90) {
      history.keywords[ranking.keyword].history =
        history.keywords[ranking.keyword].history.slice(-90);
    }
  }

  // Add daily snapshot
  const snapshot = {
    date: getDateString(),
    timestamp: new Date().toISOString(),
    summary,
    rankings: rankings.slice(0, 200), // Top 200 keywords
    alerts,
    source: auth ? 'gsc' : 'brave_fallback',
  };

  history.dailySnapshots.push(snapshot);
  // Keep 90 days of snapshots
  if (history.dailySnapshots.length > 90) {
    history.dailySnapshots = history.dailySnapshots.slice(-90);
  }

  // Store accumulated alerts
  history.alerts = [...(history.alerts || []), ...alerts].slice(-500);
  history.lastUpdated = new Date().toISOString();

  // Build output
  const output = {
    lastUpdated: history.lastUpdated,
    currentSummary: summary,
    recentAlerts: alerts,
    trackedKeywords: rankings.filter(r => r.tracked).map(r => ({
      keyword: r.keyword,
      currentPosition: r.position,
      page: r.page,
      clicks: r.clicks,
      impressions: r.impressions,
    })),
    keywords: history.keywords,
    dailySnapshots: history.dailySnapshots,
    alerts: history.alerts,
    configuration: {
      siteUrl: SITE_URL,
      alertThreshold: ALERT_THRESHOLD,
      trackedKeywordCount: TRACKED_KEYWORDS.length,
      dataSource: auth ? 'google_search_console' : 'brave_search_fallback',
    },
  };

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  // Write alerts separately for easy consumption
  if (alerts.length > 0) {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify({
      date: getDateString(),
      alerts,
      summary: {
        improved: alerts.filter(a => a.direction === 'improved').length,
        declined: alerts.filter(a => a.direction === 'declined').length,
        critical: alerts.filter(a => a.severity === 'critical').length,
      },
    }, null, 2));
  }

  console.log(`[RANK MONITOR] Complete.`);
  console.log(`  Keywords tracked: ${rankings.length}`);
  console.log(`  Alerts: ${alerts.length}`);
  console.log(`  Output: ${OUTPUT_FILE}`);

  return output;
}

// Run if called directly
if (require.main === module) {
  runMonitor()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[FATAL]', err);
      process.exit(1);
    });
}

module.exports = { runMonitor };
