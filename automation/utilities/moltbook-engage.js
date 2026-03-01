#!/usr/bin/env node
/**
 * Moltbook Engagement Script
 * 
 * Automated engagement with Moltbook (or similar social/community platform).
 * Likes, comments, and engages with relevant posts.
 * Rate-limited to avoid spam flags. Logs all engagement actions.
 * 
 * Environment Variables:
 *   MOLTBOOK_API_URL     - Moltbook API base URL
 *   MOLTBOOK_API_KEY     - API key for authentication
 *   MOLTBOOK_USERNAME    - Account username
 *   MOLTBOOK_PASSWORD    - Account password (if token-based auth not available)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG_PATH = path.join(__dirname, 'moltbook-config.json');
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'moltbook-engage.log');
const STATE_FILE = path.join(__dirname, 'data', 'moltbook-state.json');
const DATA_DIR = path.join(__dirname, 'data');

// Default configuration
const DEFAULT_CONFIG = {
  platform: {
    name: 'Moltbook',
    apiUrl: '',
    authType: 'api-key',
  },
  targeting: {
    topics: ['AI', 'automation', 'small business', 'SaaS', 'productivity'],
    hashtags: ['#ai', '#automation', '#smallbusiness', '#saas', '#productivity', '#nocode', '#startup'],
    keywords: ['artificial intelligence', 'machine learning', 'workflow automation', 'business tools', 'productivity hack'],
    excludeTopics: ['spam', 'nsfw', 'gambling'],
  },
  engagement: {
    maxLikesPerRun: 10,
    maxCommentsPerRun: 5,
    maxSharesPerRun: 3,
    delayBetweenActionsMs: 3000,
    maxActionsPerHour: 30,
    maxActionsPerDay: 100,
    commentTemplates: [
      'Great insights on {topic}! This aligns well with what we are seeing in the industry.',
      'Really interesting perspective on {topic}. Have you considered how this applies to small businesses?',
      'This is solid content about {topic}. Automation is key for scaling these kinds of workflows.',
      'Appreciate you sharing this about {topic}. The future of {topic} is exciting!',
      'Well put! {topic} is becoming more accessible every day.',
    ],
  },
  schedule: {
    activeHoursStart: 8,
    activeHoursEnd: 22,
    timezone: 'America/New_York',
    daysActive: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  safety: {
    dryRun: true,
    respectCooldown: true,
    cooldownMinutes: 60,
    skipOwnPosts: true,
    skipAlreadyEngaged: true,
  },
};

/**
 * Logger utility
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  console.log(line);
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (err) {
    console.error(`Failed to write log: ${err.message}`);
  }
}

/**
 * Load configuration
 */
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    log('INFO', 'No config found, creating default config at: ' + CONFIG_PATH);
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return DEFAULT_CONFIG;
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(raw);
    // Merge with defaults for any missing fields
    return deepMerge(DEFAULT_CONFIG, config);
  } catch (err) {
    log('ERROR', `Failed to parse config: ${err.message}`);
    return DEFAULT_CONFIG;
  }
}

/**
 * Deep merge two objects
 */
function deepMerge(defaults, overrides) {
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (
      typeof defaults[key] === 'object' &&
      !Array.isArray(defaults[key]) &&
      defaults[key] !== null &&
      typeof overrides[key] === 'object' &&
      !Array.isArray(overrides[key])
    ) {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

/**
 * Load engagement state
 */
function loadState() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(STATE_FILE)) {
    return {
      lastRun: null,
      totalEngagements: 0,
      todayEngagements: 0,
      todayDate: null,
      engagedPostIds: [],
      hourlyActions: {},
    };
  }

  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {
      lastRun: null,
      totalEngagements: 0,
      todayEngagements: 0,
      todayDate: null,
      engagedPostIds: [],
      hourlyActions: {},
    };
  }
}

/**
 * Save engagement state
 */
function saveState(state) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Make an HTTP request (generic, works with any REST API)
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ClawOps-Moltbook-Engage/1.0',
        ...(options.headers || {}),
      },
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if current time is within active hours
 */
function isWithinActiveHours(config) {
  const now = new Date();
  const hour = parseInt(
    now.toLocaleString('en-US', {
      timeZone: config.schedule.timezone,
      hour: 'numeric',
      hour12: false,
    }),
    10,
  );

  const dayName = now.toLocaleString('en-US', {
    timeZone: config.schedule.timezone,
    weekday: 'long',
  });

  if (!config.schedule.daysActive.includes(dayName)) {
    log('INFO', `Not an active day (${dayName}). Skipping.`);
    return false;
  }

  if (hour < config.schedule.activeHoursStart || hour >= config.schedule.activeHoursEnd) {
    log('INFO', `Outside active hours (${hour}h, active: ${config.schedule.activeHoursStart}-${config.schedule.activeHoursEnd}). Skipping.`);
    return false;
  }

  return true;
}

/**
 * Check rate limits
 */
function checkRateLimits(state, config) {
  const today = new Date().toISOString().slice(0, 10);

  // Reset daily counter if new day
  if (state.todayDate !== today) {
    state.todayDate = today;
    state.todayEngagements = 0;
    state.hourlyActions = {};
  }

  // Check daily limit
  if (state.todayEngagements >= config.engagement.maxActionsPerDay) {
    log('WARN', `Daily action limit reached (${config.engagement.maxActionsPerDay}). Skipping.`);
    return false;
  }

  // Check hourly limit
  const currentHour = new Date().getHours().toString();
  const hourlyCount = state.hourlyActions[currentHour] || 0;
  if (hourlyCount >= config.engagement.maxActionsPerHour) {
    log('WARN', `Hourly action limit reached (${config.engagement.maxActionsPerHour}). Skipping.`);
    return false;
  }

  // Check cooldown
  if (config.safety.respectCooldown && state.lastRun) {
    const lastRun = new Date(state.lastRun);
    const cooldownMs = config.safety.cooldownMinutes * 60 * 1000;
    if (Date.now() - lastRun.getTime() < cooldownMs) {
      const remainingMin = Math.ceil((cooldownMs - (Date.now() - lastRun.getTime())) / 60000);
      log('INFO', `Cooldown active. ${remainingMin} minutes remaining.`);
      return false;
    }
  }

  return true;
}

/**
 * Check if post content matches target topics
 */
function isRelevantPost(post, config) {
  const content = (post.content || post.text || post.title || '').toLowerCase();

  // Check exclusions first
  for (const excluded of config.targeting.excludeTopics) {
    if (content.includes(excluded.toLowerCase())) {
      return false;
    }
  }

  // Check topics
  for (const topic of config.targeting.topics) {
    if (content.includes(topic.toLowerCase())) {
      return true;
    }
  }

  // Check keywords
  for (const keyword of config.targeting.keywords) {
    if (content.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  // Check hashtags
  for (const hashtag of config.targeting.hashtags) {
    if (content.includes(hashtag.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Generate a contextual comment
 */
function generateComment(post, config) {
  const templates = config.engagement.commentTemplates;
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Determine which topic the post is about
  const content = (post.content || post.text || post.title || '').toLowerCase();
  let matchedTopic = 'this topic';

  for (const topic of config.targeting.topics) {
    if (content.includes(topic.toLowerCase())) {
      matchedTopic = topic;
      break;
    }
  }

  return template.replace(/\{topic\}/g, matchedTopic);
}

/**
 * Record an engagement action
 */
function recordAction(state, actionType, postId, details) {
  state.totalEngagements++;
  state.todayEngagements++;

  const currentHour = new Date().getHours().toString();
  state.hourlyActions[currentHour] = (state.hourlyActions[currentHour] || 0) + 1;

  if (postId && !state.engagedPostIds.includes(postId)) {
    state.engagedPostIds.push(postId);
    // Keep only last 500 post IDs to prevent unbounded growth
    if (state.engagedPostIds.length > 500) {
      state.engagedPostIds = state.engagedPostIds.slice(-500);
    }
  }

  log('INFO', `Action: ${actionType} | Post: ${postId || 'N/A'} | Details: ${details}`);
}

/**
 * Platform adapter - Moltbook API interactions
 * This is the integration layer that would be customized per platform.
 */
class MoltbookAdapter {
  constructor(config) {
    this.config = config;
    this.apiUrl = process.env.MOLTBOOK_API_URL || config.platform.apiUrl;
    this.apiKey = process.env.MOLTBOOK_API_KEY || '';
    this.username = process.env.MOLTBOOK_USERNAME || '';
  }

  getHeaders() {
    const headers = {};
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async fetchFeed() {
    if (!this.apiUrl) {
      log('WARN', 'No API URL configured. Returning mock feed for dry run.');
      return this._mockFeed();
    }

    try {
      const response = await makeRequest(`${this.apiUrl}/feed`, {
        headers: this.getHeaders(),
      });
      return response.data.posts || response.data || [];
    } catch (err) {
      log('ERROR', `Failed to fetch feed: ${err.message}`);
      return [];
    }
  }

  async likePost(postId) {
    if (!this.apiUrl) {
      log('INFO', `[DRY RUN] Would like post: ${postId}`);
      return true;
    }

    try {
      const response = await makeRequest(`${this.apiUrl}/posts/${postId}/like`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return response.status >= 200 && response.status < 300;
    } catch (err) {
      log('ERROR', `Failed to like post ${postId}: ${err.message}`);
      return false;
    }
  }

  async commentOnPost(postId, comment) {
    if (!this.apiUrl) {
      log('INFO', `[DRY RUN] Would comment on post ${postId}: "${comment}"`);
      return true;
    }

    try {
      const response = await makeRequest(`${this.apiUrl}/posts/${postId}/comments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: { content: comment },
      });
      return response.status >= 200 && response.status < 300;
    } catch (err) {
      log('ERROR', `Failed to comment on post ${postId}: ${err.message}`);
      return false;
    }
  }

  async sharePost(postId) {
    if (!this.apiUrl) {
      log('INFO', `[DRY RUN] Would share post: ${postId}`);
      return true;
    }

    try {
      const response = await makeRequest(`${this.apiUrl}/posts/${postId}/share`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return response.status >= 200 && response.status < 300;
    } catch (err) {
      log('ERROR', `Failed to share post ${postId}: ${err.message}`);
      return false;
    }
  }

  _mockFeed() {
    return [
      { id: 'mock-1', content: 'How AI is transforming small business operations in 2026', author: 'techuser1' },
      { id: 'mock-2', content: 'Top 10 SaaS productivity tools every startup needs', author: 'saasreviewer' },
      { id: 'mock-3', content: 'Automation workflows that save 20 hours per week', author: 'automator99' },
      { id: 'mock-4', content: 'Check out this random unrelated post about cooking', author: 'foodie' },
      { id: 'mock-5', content: 'Machine learning for small business: a practical guide', author: 'mlpractitioner' },
    ];
  }
}

/**
 * Main engagement function
 */
async function runEngagement() {
  const startTime = Date.now();
  log('INFO', '=== Moltbook Engagement Run Started ===');

  const config = loadConfig();
  const state = loadState();
  const adapter = new MoltbookAdapter(config);

  // Check if we should run
  if (!isWithinActiveHours(config)) {
    saveState(state);
    return;
  }

  if (!checkRateLimits(state, config)) {
    saveState(state);
    return;
  }

  if (config.safety.dryRun) {
    log('INFO', 'Running in DRY RUN mode. Set safety.dryRun to false in config to perform real actions.');
  }

  // Fetch feed
  const posts = await adapter.fetchFeed();
  log('INFO', `Fetched ${posts.length} posts from feed.`);

  // Filter relevant posts
  const relevantPosts = posts.filter(post => {
    if (config.safety.skipAlreadyEngaged && state.engagedPostIds.includes(post.id)) {
      return false;
    }
    if (config.safety.skipOwnPosts && post.author === adapter.username) {
      return false;
    }
    return isRelevantPost(post, config);
  });

  log('INFO', `${relevantPosts.length} relevant posts after filtering.`);

  let likesCount = 0;
  let commentsCount = 0;
  let sharesCount = 0;

  for (const post of relevantPosts) {
    // Like
    if (likesCount < config.engagement.maxLikesPerRun) {
      const success = await adapter.likePost(post.id);
      if (success) {
        recordAction(state, 'like', post.id, `Liked post by ${post.author}`);
        likesCount++;
      }
      await sleep(config.engagement.delayBetweenActionsMs);
    }

    // Comment (only on some posts, not all)
    if (commentsCount < config.engagement.maxCommentsPerRun && Math.random() > 0.4) {
      const comment = generateComment(post, config);
      const success = await adapter.commentOnPost(post.id, comment);
      if (success) {
        recordAction(state, 'comment', post.id, `Commented: "${comment.slice(0, 60)}..."`);
        commentsCount++;
      }
      await sleep(config.engagement.delayBetweenActionsMs);
    }

    // Share (sparingly)
    if (sharesCount < config.engagement.maxSharesPerRun && Math.random() > 0.7) {
      const success = await adapter.sharePost(post.id);
      if (success) {
        recordAction(state, 'share', post.id, `Shared post by ${post.author}`);
        sharesCount++;
      }
      await sleep(config.engagement.delayBetweenActionsMs);
    }

    // Check rate limits after each post
    if (!checkRateLimits(state, config)) {
      log('INFO', 'Rate limit reached mid-run. Stopping.');
      break;
    }
  }

  // Update state
  state.lastRun = new Date().toISOString();
  saveState(state);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log('INFO', `=== Engagement Complete: ${likesCount} likes, ${commentsCount} comments, ${sharesCount} shares (${elapsed}s) ===`);
}

// Run
runEngagement().catch(err => {
  log('ERROR', `Unhandled error: ${err.message}`);
  process.exit(1);
});
