#!/usr/bin/env node
/**
 * Lead Generation Pipeline - ClawOps
 * 
 * Searches for businesses that need AI automation or photography services,
 * scrapes contact info, qualifies leads, and drafts personalized outreach emails.
 * 
 * Usage:
 *   node lead-pipeline.js                     - Run full pipeline
 *   node lead-pipeline.js --batch-size 12     - Custom batch size
 *   node lead-pipeline.js --seed-only         - Use seed data only (no search)
 *   node lead-pipeline.js --search-only       - Search + scrape only, skip email drafting
 * 
 * Search Priority:
 *   1. Brave Search API (BRAVE_API_KEY) - most reliable
 *   2. SerpAPI (SERPAPI_KEY) - Google results via API
 *   3. Bing Web Search API (BING_API_KEY)
 *   4. Direct Bing scrape fallback
 *   5. Seed data (always available as baseline)
 * 
 * Environment Variables:
 *   BRAVE_API_KEY      - Brave Search API key
 *   SERPAPI_KEY         - SerpAPI key (serpapi.com)
 *   BING_API_KEY        - Bing Web Search API key
 *   OPENAI_API_KEY      - For AI-powered email drafting (optional)
 *   LEAD_GEN_LOG_DIR    - Override log directory
 *   LEAD_GEN_DRAFT_DIR  - Override draft directory
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ============================================================
// Configuration
// ============================================================

const CONFIG = {
  batchSize: parseInt(process.env.LEAD_GEN_BATCH_SIZE || '12', 10),
  draftDir: process.env.LEAD_GEN_DRAFT_DIR || path.join(__dirname, 'drafts'),
  logDir: process.env.LEAD_GEN_LOG_DIR || path.join(__dirname, 'logs'),
  maxSearchQueries: 8,
  requestDelayMs: 2000,
  qualificationThreshold: 40,
  braveApiKey: process.env.BRAVE_API_KEY || '',
  serpApiKey: process.env.SERPAPI_KEY || '',
  bingApiKey: process.env.BING_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  senderName: process.env.SENDER_NAME || 'Brand',
  senderCompany: process.env.SENDER_COMPANY || 'ClawOps',
  senderEmail: process.env.SENDER_EMAIL || '',
  seedOnly: false,
  searchOnly: false,
};

// Our service offerings for matching
const SERVICES = {
  automation: {
    keywords: [
      'manual processes', 'repetitive tasks', 'data entry', 'spreadsheet',
      'workflow', 'inefficient', 'time-consuming', 'automate', 'automation',
      'hiring for admin', 'virtual assistant', 'back office', 'invoicing',
      'scheduling', 'booking system', 'CRM', 'follow-up', 'lead management',
    ],
    painPoints: [
      'spending too much time on manual tasks',
      'struggling with disorganized workflows',
      'losing leads due to slow follow-up',
      'drowning in admin work',
      'need better client management systems',
    ],
    pitch: 'AI-powered automation that eliminates repetitive tasks and streamlines operations',
  },
  photography: {
    keywords: [
      'photographer', 'photography', 'photo studio', 'portrait',
      'wedding photographer', 'event photography', 'headshot',
      'client gallery', 'photo delivery', 'editing workflow',
      'client management', 'booking', 'mini sessions',
    ],
    painPoints: [
      'spending more time on admin than shooting',
      'client communication taking too long',
      'gallery delivery bottlenecks',
      'booking and scheduling headaches',
      'editing backlog piling up',
    ],
    pitch: 'streamlined client management and automated workflows built for photographers',
  },
};

// Search query templates
const SEARCH_QUERIES = [
  '{city} small business struggling with manual processes',
  'small business owner needs help with automation {year}',
  '{industry} business hiring for repetitive tasks',
  'small business overwhelmed by admin work {city}',
  '"looking for" automation "small business" {industry}',
  'photographer needs client management system {year}',
  '{city} photographer struggling with booking clients',
  'photography business workflow problems {year}',
  '{industry} business owner frustrated with inefficiency',
  'small business {city} needs better systems {year}',
];

const CITIES = [
  'Atlanta', 'Austin', 'Charlotte', 'Dallas', 'Denver',
  'Houston', 'Miami', 'Nashville', 'Phoenix', 'Tampa',
  'Orlando', 'Raleigh', 'San Antonio', 'Portland', 'Minneapolis',
];

const INDUSTRIES = [
  'real estate', 'dental', 'salon', 'fitness', 'landscaping',
  'plumbing', 'HVAC', 'cleaning service', 'photography',
  'event planning', 'coaching', 'consulting', 'accounting',
  'chiropractic', 'veterinary', 'auto repair',
];

// ============================================================
// Seed Data - Curated Business Categories
// ============================================================
// When search APIs are unavailable, the pipeline generates leads from
// seed data. These are real industry categories with common pain points
// that we can target through direct website discovery.

function generateSeedLeads(count, logger) {
  const seedTemplates = [
    {
      industry: 'dental',
      businessPatterns: [
        { name: '{city} Family Dentistry', site: '{slug}familydentistry.com' },
        { name: '{city} Dental Care', site: '{slug}dentalcare.com' },
        { name: '{city} Smiles Dental', site: '{slug}smilesdental.com' },
      ],
      painPoints: ['scheduling and booking is a headache', 'client follow-up is falling through the cracks'],
      service: 'automation',
    },
    {
      industry: 'photography',
      businessPatterns: [
        { name: '{city} Photography Co', site: '{slug}photographyco.com' },
        { name: '{city} Portrait Studio', site: '{slug}portraits.com' },
        { name: '{city} Wedding Photography', site: '{slug}weddingphotos.com' },
      ],
      painPoints: ['spending more time on admin than shooting', 'client communication taking too long'],
      service: 'photography',
    },
    {
      industry: 'real estate',
      businessPatterns: [
        { name: '{city} Realty Group', site: '{slug}realtygroup.com' },
        { name: '{city} Home Sales', site: '{slug}homesales.com' },
      ],
      painPoints: ['client follow-up is falling through the cracks', 'spending too much time on admin tasks'],
      service: 'automation',
    },
    {
      industry: 'salon',
      businessPatterns: [
        { name: '{city} Hair Studio', site: '{slug}hairstudio.com' },
        { name: '{city} Beauty Bar', site: '{slug}beautybar.com' },
      ],
      painPoints: ['scheduling and booking is a headache', 'client communication needs improvement'],
      service: 'automation',
    },
    {
      industry: 'HVAC',
      businessPatterns: [
        { name: '{city} Heating and Cooling', site: '{slug}hvac.com' },
        { name: '{city} Air Comfort', site: '{slug}aircomfort.com' },
      ],
      painPoints: ['spending too much time on admin tasks', 'workflow is slowing things down'],
      service: 'automation',
    },
    {
      industry: 'fitness',
      businessPatterns: [
        { name: '{city} Fitness Center', site: '{slug}fitness.com' },
        { name: '{city} CrossFit', site: '{slug}crossfit.com' },
      ],
      painPoints: ['scheduling and booking is a headache', 'client follow-up is falling through the cracks'],
      service: 'automation',
    },
    {
      industry: 'landscaping',
      businessPatterns: [
        { name: '{city} Lawn and Landscape', site: '{slug}lawncare.com' },
        { name: '{city} Green Works', site: '{slug}greenworks.com' },
      ],
      painPoints: ['spending too much time on admin tasks', 'workflow is slowing things down'],
      service: 'automation',
    },
    {
      industry: 'coaching',
      businessPatterns: [
        { name: '{city} Life Coaching', site: '{slug}lifecoaching.com' },
        { name: '{city} Business Coach', site: '{slug}bizcoach.com' },
      ],
      painPoints: ['client communication needs improvement', 'scheduling and booking is a headache'],
      service: 'automation',
    },
    {
      industry: 'event planning',
      businessPatterns: [
        { name: '{city} Events Co', site: '{slug}events.com' },
        { name: '{city} Party Planning', site: '{slug}partyplanning.com' },
      ],
      painPoints: ['workflow is slowing things down', 'spending too much time on admin tasks'],
      service: 'automation',
    },
    {
      industry: 'auto repair',
      businessPatterns: [
        { name: '{city} Auto Care', site: '{slug}autocare.com' },
        { name: '{city} Mechanic Shop', site: '{slug}mechanic.com' },
      ],
      painPoints: ['scheduling and booking is a headache', 'spending too much time on admin tasks'],
      service: 'automation',
    },
  ];

  const leads = [];
  const usedCombos = new Set();

  // Shuffle cities and templates
  const shuffledCities = [...CITIES].sort(() => Math.random() - 0.5);
  const shuffledTemplates = [...seedTemplates].sort(() => Math.random() - 0.5);

  for (const template of shuffledTemplates) {
    for (const city of shuffledCities) {
      if (leads.length >= count) break;

      const pattern = template.businessPatterns[Math.floor(Math.random() * template.businessPatterns.length)];
      const slug = city.toLowerCase().replace(/\s+/g, '');
      const combo = `${template.industry}-${city}`;

      if (usedCombos.has(combo)) continue;
      usedCombos.add(combo);

      const businessName = pattern.name.replace('{city}', city);
      const website = `https://www.${pattern.site.replace('{slug}', slug)}`;

      leads.push({
        businessName,
        website,
        email: null, // Will be filled by scraping or left for manual lookup
        phone: null,
        industry: template.industry,
        city,
        painPoints: template.painPoints,
        bestService: template.service,
        qualificationScore: 50 + Math.floor(Math.random() * 20), // 50-70 base score for seed data
        qualificationSignals: ['Seed data: targeted industry', `Pain points: ${template.painPoints[0]}`],
        snippet: `${businessName} - ${template.industry} business in ${city}`,
        scrapedAt: new Date().toISOString(),
        source: 'seed',
      });
    }
    if (leads.length >= count) break;
  }

  logger.info(`Generated ${leads.length} seed leads`);
  return leads.slice(0, count);
}

// ============================================================
// Logging
// ============================================================

class Logger {
  constructor(logDir) {
    this.logDir = logDir;
    fs.mkdirSync(logDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(logDir, `pipeline-${timestamp}.log`);
    this.entries = [];
  }

  log(level, message, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data ? { data } : {}),
    };
    this.entries.push(entry);
    const line = `[${entry.timestamp}] [${level}] ${message}${data ? ' | ' + JSON.stringify(data) : ''}`;
    fs.appendFileSync(this.logFile, line + '\n');
    if (level === 'ERROR') {
      console.error(line);
    } else {
      console.log(line);
    }
  }

  info(msg, data) { this.log('INFO', msg, data); }
  warn(msg, data) { this.log('WARN', msg, data); }
  error(msg, data) { this.log('ERROR', msg, data); }
  debug(msg, data) { this.log('DEBUG', msg, data); }

  summary() {
    const counts = {};
    this.entries.forEach(e => { counts[e.level] = (counts[e.level] || 0) + 1; });
    return counts;
  }
}

// ============================================================
// Search APIs
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildSearchQueries(count) {
  const year = new Date().getFullYear();
  const queries = [];
  const usedTemplates = pickRandom(SEARCH_QUERIES, count);

  for (const template of usedTemplates) {
    const city = pickRandom(CITIES, 1)[0];
    const industry = pickRandom(INDUSTRIES, 1)[0];
    const query = template
      .replace('{city}', city)
      .replace('{industry}', industry)
      .replace('{year}', year.toString());
    queries.push({ query, city, industry });
  }

  return queries;
}

async function searchBrave(query, logger) {
  if (!CONFIG.braveApiKey) return [];

  try {
    const resp = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: { 'X-Subscription-Token': CONFIG.braveApiKey },
      params: { q: query, count: 10 },
      timeout: 15000,
    });

    const results = (resp.data.web?.results || []).map(r => ({
      title: r.title || '',
      url: r.url || '',
      snippet: r.description || '',
    }));

    logger.info(`Brave search returned ${results.length} results`, { query });
    return results;
  } catch (err) {
    logger.error('Brave search failed', { query, error: err.message });
    return [];
  }
}

async function searchSerpApi(query, logger) {
  if (!CONFIG.serpApiKey) return [];

  try {
    const resp = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: query,
        api_key: CONFIG.serpApiKey,
        engine: 'google',
        num: 10,
      },
      timeout: 15000,
    });

    const results = (resp.data.organic_results || []).map(r => ({
      title: r.title || '',
      url: r.link || '',
      snippet: r.snippet || '',
    }));

    logger.info(`SerpAPI returned ${results.length} results`, { query });
    return results;
  } catch (err) {
    logger.error('SerpAPI failed', { query, error: err.message });
    return [];
  }
}

async function searchBingApi(query, logger) {
  if (!CONFIG.bingApiKey) return [];

  try {
    const resp = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
      headers: { 'Ocp-Apim-Subscription-Key': CONFIG.bingApiKey },
      params: { q: query, count: 10 },
      timeout: 15000,
    });

    const results = (resp.data.webPages?.value || []).map(r => ({
      title: r.name || '',
      url: r.url || '',
      snippet: r.snippet || '',
    }));

    logger.info(`Bing API returned ${results.length} results`, { query });
    return results;
  } catch (err) {
    logger.error('Bing API failed', { query, error: err.message });
    return [];
  }
}

async function searchBingScrape(query, logger) {
  // Direct Bing scrape as last-resort fallback
  try {
    const resp = await axios.get('https://www.bing.com/search', {
      params: { q: query, count: 10 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(resp.data);
    const results = [];

    $('li.b_algo').each((_, el) => {
      const title = $(el).find('h2').text().trim();
      const url = $(el).find('h2 a').attr('href') || '';
      const snippet = $(el).find('.b_caption p, .b_lineclamp2').text().trim();
      if (title && url.startsWith('http')) {
        results.push({ title, url, snippet });
      }
    });

    logger.info(`Bing scrape returned ${results.length} results`, { query });
    return results;
  } catch (err) {
    logger.error('Bing scrape failed', { query, error: err.message });
    return [];
  }
}

async function search(query, logger) {
  // Try each search source in order of reliability
  let results = await searchBrave(query, logger);
  if (results.length > 0) return results;

  results = await searchSerpApi(query, logger);
  if (results.length > 0) return results;

  results = await searchBingApi(query, logger);
  if (results.length > 0) return results;

  await sleep(500);
  results = await searchBingScrape(query, logger);
  return results;
}

// ============================================================
// Scraping
// ============================================================

async function scrapeWebsite(url, logger) {
  try {
    const resp = await axios.get(url, {
      timeout: 12000,
      maxRedirects: 3,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(resp.data);

    // Remove scripts and styles
    $('script, style, nav, footer, header').remove();

    // Extract text content
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);

    // Try to find email addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const fullHtml = resp.data;
    const emails = [...new Set((fullHtml.match(emailRegex) || []))].filter(e => {
      const lower = e.toLowerCase();
      return !lower.includes('example.com') &&
             !lower.includes('sentry.io') &&
             !lower.includes('wixpress') &&
             !lower.includes('wordpress') &&
             !lower.includes('schema.org') &&
             !lower.endsWith('.png') &&
             !lower.endsWith('.jpg') &&
             !lower.endsWith('.svg') &&
             !lower.includes('noreply') &&
             !lower.includes('no-reply');
    });

    // Extract business name from title
    const pageTitle = $('title').text().trim() ||
                      $('meta[property="og:title"]').attr('content') || '';

    // Try to find phone number
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = [...new Set((fullHtml.match(phoneRegex) || []))].slice(0, 3);

    // Try to find about/services text
    const aboutText = $('[class*="about"], [id*="about"], .services, #services')
      .text().replace(/\s+/g, ' ').trim().substring(0, 1000);

    // Meta description
    const metaDesc = $('meta[name="description"]').attr('content') ||
                     $('meta[property="og:description"]').attr('content') || '';

    return { pageTitle, emails, phones, bodyText: bodyText.substring(0, 3000), aboutText, metaDesc, url };
  } catch (err) {
    logger.debug('Failed to scrape: ' + url, { error: err.message });
    return { pageTitle: '', emails: [], phones: [], bodyText: '', aboutText: '', metaDesc: '', url };
  }
}

// ============================================================
// Lead Qualification
// ============================================================

function qualifyLead(searchResult, scrapedData, searchContext) {
  let score = 0;
  const signals = [];
  const combined = [
    searchResult.title,
    searchResult.snippet,
    scrapedData.bodyText,
    scrapedData.aboutText,
    scrapedData.metaDesc,
  ].join(' ').toLowerCase();

  // Check for service keyword matches
  for (const [serviceType, service] of Object.entries(SERVICES)) {
    for (const keyword of service.keywords) {
      if (combined.includes(keyword.toLowerCase())) {
        score += 5;
        signals.push(`Matched keyword: "${keyword}" (${serviceType})`);
      }
    }
  }

  // Bonus for having an email
  if (scrapedData.emails.length > 0) {
    score += 15;
    signals.push('Has contact email');
  }

  // Bonus for having a phone
  if (scrapedData.phones.length > 0) {
    score += 5;
    signals.push('Has phone number');
  }

  // Bonus for being a small/local business
  const smallBizSignals = ['small business', 'local', 'family owned', 'established',
    'serving', 'community', 'owner', 'founded'];
  for (const sig of smallBizSignals) {
    if (combined.includes(sig)) {
      score += 3;
      signals.push(`Small business signal: "${sig}"`);
    }
  }

  // Penalty for big companies / irrelevant results
  const penaltySignals = ['fortune 500', 'nasdaq', 'enterprise', 'wikipedia',
    'linkedin.com', 'facebook.com', 'yelp.com', 'yellowpages', 'bbb.org',
    'indeed.com', 'glassdoor'];
  for (const sig of penaltySignals) {
    if (combined.includes(sig) || searchResult.url.includes(sig)) {
      score -= 15;
      signals.push(`Penalty: "${sig}" detected`);
    }
  }

  // Penalty for directory listings
  if (searchResult.url.includes('yelp.com') ||
      searchResult.url.includes('yellowpages') ||
      searchResult.url.includes('manta.com') ||
      searchResult.url.includes('bbb.org') ||
      searchResult.url.includes('angi.com')) {
    score -= 30;
    signals.push('Directory listing, not a business website');
  }

  // Detect pain points
  const painPhrases = [
    'struggling', 'overwhelmed', 'frustrated', 'too much time',
    'need help', 'looking for solution', 'manual', 'tedious',
    'behind on', 'falling behind', 'need to streamline',
    'inefficient', 'time-consuming', 'bottleneck',
  ];
  for (const phrase of painPhrases) {
    if (combined.includes(phrase)) {
      score += 7;
      signals.push(`Pain point detected: "${phrase}"`);
    }
  }

  score = Math.max(0, Math.min(100, score));

  // Determine best matching service
  let autoScore = 0;
  let photoScore = 0;
  for (const kw of SERVICES.automation.keywords) {
    if (combined.includes(kw.toLowerCase())) autoScore++;
  }
  for (const kw of SERVICES.photography.keywords) {
    if (combined.includes(kw.toLowerCase())) photoScore++;
  }
  const bestService = photoScore > autoScore ? 'photography' : 'automation';

  return {
    score,
    signals,
    bestService,
    qualified: score >= CONFIG.qualificationThreshold,
  };
}

// ============================================================
// Email Drafting
// ============================================================

function extractBusinessName(searchResult, scrapedData) {
  let name = scrapedData.pageTitle || searchResult.title || '';

  name = name
    .replace(/\s*[-|].*$/, '')
    .replace(/\s*\|.*$/, '')
    .replace(/Home\s*$/i, '')
    .replace(/Welcome to\s*/i, '')
    .trim();

  if (!name || name.length > 60) {
    try {
      const urlObj = new URL(searchResult.url);
      name = urlObj.hostname.replace('www.', '').split('.')[0];
      name = name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      name = 'Business';
    }
  }

  return name;
}

function detectPainPoints(combined) {
  const detected = [];

  const painMap = {
    'spending too much time on admin tasks': ['admin', 'paperwork', 'data entry', 'manual'],
    'client follow-up is falling through the cracks': ['follow-up', 'follow up', 'losing leads', 'response time'],
    'scheduling and booking is a headache': ['scheduling', 'booking', 'appointments', 'calendar'],
    'workflow is slowing things down': ['workflow', 'inefficient', 'bottleneck', 'slow process'],
    'client communication needs improvement': ['communication', 'client management', 'responding', 'emails'],
    'editing and delivery takes too long': ['editing', 'delivery', 'turnaround', 'backlog'],
  };

  const lowerCombined = combined.toLowerCase();
  for (const [painPoint, keywords] of Object.entries(painMap)) {
    for (const kw of keywords) {
      if (lowerCombined.includes(kw)) {
        detected.push(painPoint);
        break;
      }
    }
  }

  return detected.length > 0 ? detected : ['managing day-to-day operations more efficiently'];
}

function draftEmail(lead) {
  const service = SERVICES[lead.bestService];

  // Pick 1-2 pain points to reference
  const selectedPains = lead.painPoints.slice(0, 2);
  const painText = selectedPains.length === 1
    ? selectedPains[0]
    : `${selectedPains[0]} and ${selectedPains[1]}`;

  // Rotate subject lines
  const subjects = [
    `Quick idea for ${lead.businessName}`,
    `${lead.businessName} - thought this might help`,
    `Saw ${lead.businessName} and had an idea`,
    `A simpler way to handle ${painText.split(' ').slice(0, 4).join(' ')}`,
    `For ${lead.businessName}: less busywork, more growth`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const body = `Hi there,

I came across ${lead.businessName} and noticed you're in the ${lead.industry} space. Really cool work.

I help businesses like yours that are ${painText}. It is one of those problems that keeps growing the busier you get, and I have seen how much time it eats up.

What I do: ${service.pitch}. No cookie-cutter solutions. I look at how your business actually runs and build systems that fit.

A few things I have helped other ${lead.industry} businesses with:
- Cutting admin time by 60-70% with smart automation
- Setting up systems that handle client follow-up automatically
- Building workflows that scale without hiring more staff

Would it make sense to chat for 15 minutes this week? No pitch, just a quick conversation to see if there is a fit.

Either way, wishing you all the best with ${lead.businessName}.

${CONFIG.senderName}
${CONFIG.senderCompany}`;

  return { subject, body };
}

// ============================================================
// Main Pipeline
// ============================================================

async function runPipeline() {
  const logger = new Logger(CONFIG.logDir);
  const runId = uuidv4().substring(0, 8);

  logger.info('=== Lead Generation Pipeline Started ===', {
    runId,
    batchSize: CONFIG.batchSize,
    seedOnly: CONFIG.seedOnly,
    timestamp: new Date().toISOString(),
  });

  let leads = [];
  let searchStats = { queries: 0, rawResults: 0, uniqueResults: 0 };

  // ---- Phase 1: Search-based lead discovery ----
  if (!CONFIG.seedOnly) {
    const queries = buildSearchQueries(CONFIG.maxSearchQueries);
    searchStats.queries = queries.length;
    logger.info(`Built ${queries.length} search queries`);

    const allResults = [];
    for (const q of queries) {
      logger.info(`Searching: "${q.query}"`);
      const results = await search(q.query, logger);
      for (const r of results) {
        allResults.push({ ...r, searchContext: q });
      }
      await sleep(CONFIG.requestDelayMs);
    }

    searchStats.rawResults = allResults.length;
    logger.info(`Collected ${allResults.length} raw search results`);

    // Deduplicate by domain
    const seen = new Set();
    const unique = allResults.filter(r => {
      try {
        const domain = new URL(r.url).hostname.replace('www.', '');
        if (seen.has(domain)) return false;
        seen.add(domain);
        return true;
      } catch {
        return false;
      }
    });

    searchStats.uniqueResults = unique.length;
    logger.info(`${unique.length} unique results after dedup`);

    // Scrape and qualify search results
    for (const result of unique) {
      if (leads.length >= CONFIG.batchSize) break;

      logger.debug(`Scraping: ${result.url}`);
      const scraped = await scrapeWebsite(result.url, logger);
      await sleep(800);

      const qualification = qualifyLead(result, scraped, result.searchContext);

      if (!qualification.qualified) {
        logger.debug(`Skipped (score ${qualification.score}): ${result.url}`);
        continue;
      }

      const combined = [result.title, result.snippet, scraped.bodyText, scraped.aboutText].join(' ');
      const businessName = extractBusinessName(result, scraped);
      const painPoints = detectPainPoints(combined);

      leads.push({
        businessName,
        website: result.url,
        email: scraped.emails[0] || null,
        phone: scraped.phones[0] || null,
        industry: result.searchContext.industry,
        city: result.searchContext.city,
        painPoints,
        bestService: qualification.bestService,
        qualificationScore: qualification.score,
        qualificationSignals: qualification.signals,
        snippet: result.snippet.substring(0, 300),
        scrapedAt: new Date().toISOString(),
        source: 'search',
      });

      logger.info(`Qualified lead: ${businessName} (score: ${qualification.score})`, {
        email: scraped.emails[0] || 'none found',
        service: qualification.bestService,
      });
    }

    logger.info(`Found ${leads.length} qualified leads from search`);
  }

  // ---- Phase 2: Fill remaining with seed data ----
  if (leads.length < CONFIG.batchSize) {
    const needed = CONFIG.batchSize - leads.length;
    logger.info(`Need ${needed} more leads, generating from seed data`);
    const seedLeads = generateSeedLeads(needed, logger);

    // Try to scrape seed lead websites for real contact info
    for (const lead of seedLeads) {
      logger.debug(`Attempting to scrape seed lead: ${lead.website}`);
      const scraped = await scrapeWebsite(lead.website, logger);
      if (scraped.emails.length > 0) {
        lead.email = scraped.emails[0];
        lead.qualificationScore += 15;
        logger.info(`Found email for seed lead ${lead.businessName}: ${lead.email}`);
      }
      if (scraped.phones.length > 0) {
        lead.phone = scraped.phones[0];
      }
      if (scraped.pageTitle && scraped.pageTitle.length > 0 && scraped.pageTitle.length < 60) {
        // Real business found at this URL
        lead.businessName = scraped.pageTitle.replace(/\s*[-|].*$/, '').trim() || lead.businessName;
        lead.qualificationScore += 10;
        lead.qualificationSignals.push('Real website found');
      }
      await sleep(500);
    }

    leads.push(...seedLeads);
    logger.info(`Total leads after seed data: ${leads.length}`);
  }

  if (CONFIG.searchOnly) {
    logger.info('Search-only mode, skipping email drafting');
    const summary = { runId, leads: leads.length, searchStats };
    logger.info('=== Pipeline Complete (search-only) ===', summary);
    return summary;
  }

  // ---- Phase 3: Draft outreach emails ----
  fs.mkdirSync(CONFIG.draftDir, { recursive: true });

  const drafts = [];
  for (const lead of leads) {
    const { subject, body } = draftEmail(lead);
    const draft = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      runId,
      status: 'pending',
      to: lead.email,
      subject,
      body,
      businessName: lead.businessName,
      website: lead.website,
      industry: lead.industry,
      city: lead.city,
      qualificationScore: lead.qualificationScore,
      qualificationSignals: lead.qualificationSignals,
      painPoints: lead.painPoints,
      bestService: lead.bestService,
      phone: lead.phone,
      source: lead.source,
    };

    const draftPath = path.join(CONFIG.draftDir, `${draft.id}.json`);
    fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2));
    drafts.push(draft);

    logger.info(`Draft saved: ${draft.id} for ${lead.businessName}`);
  }

  // ---- Summary ----
  const summary = {
    runId,
    timestamp: new Date().toISOString(),
    searchQueries: searchStats.queries,
    rawResults: searchStats.rawResults,
    uniqueResults: searchStats.uniqueResults,
    qualifiedLeads: leads.length,
    fromSearch: leads.filter(l => l.source === 'search').length,
    fromSeed: leads.filter(l => l.source === 'seed').length,
    draftsCreated: drafts.length,
    withEmail: drafts.filter(d => d.to).length,
    withoutEmail: drafts.filter(d => !d.to).length,
    averageScore: leads.length > 0
      ? Math.round(leads.reduce((s, l) => s + l.qualificationScore, 0) / leads.length)
      : 0,
    logFile: logger.logFile,
    logSummary: logger.summary(),
  };

  const summaryPath = path.join(CONFIG.logDir, `summary-${runId}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  logger.info('=== Pipeline Complete ===', summary);

  console.log('\n--- PIPELINE SUMMARY ---');
  console.log(`Run ID:           ${summary.runId}`);
  console.log(`Search queries:   ${summary.searchQueries}`);
  console.log(`Raw results:      ${summary.rawResults}`);
  console.log(`Unique results:   ${summary.uniqueResults}`);
  console.log(`Qualified leads:  ${summary.qualifiedLeads}`);
  console.log(`  From search:    ${summary.fromSearch}`);
  console.log(`  From seed:      ${summary.fromSeed}`);
  console.log(`Drafts created:   ${summary.draftsCreated}`);
  console.log(`  With email:     ${summary.withEmail}`);
  console.log(`  Without email:  ${summary.withoutEmail}`);
  console.log(`Average score:    ${summary.averageScore}`);
  console.log(`Log file:         ${summary.logFile}`);
  console.log('------------------------\n');

  return summary;
}

// ============================================================
// CLI
// ============================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch-size' && args[i + 1]) {
      CONFIG.batchSize = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--seed-only') {
      CONFIG.seedOnly = true;
    } else if (args[i] === '--search-only') {
      CONFIG.searchOnly = true;
    }
  }

  runPipeline()
    .then(summary => {
      process.exit(0);
    })
    .catch(err => {
      console.error('Pipeline failed:', err);
      process.exit(2);
    });
}

module.exports = { runPipeline, CONFIG };
