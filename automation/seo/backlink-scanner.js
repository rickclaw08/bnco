#!/usr/bin/env node
/**
 * Backlink Opportunity Scanner for ClawOps
 * 
 * Searches for backlink opportunities including guest post sites,
 * directories, relevant blogs, and forums in the AI automation,
 * small business, SaaS, and productivity niches.
 * 
 * Runs every 6 hours via cron.
 * Output: automation/seo/data/backlink-opportunities.json
 */

'use strict';

require('dotenv').config({ path: __dirname + '/.env' });

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'backlink-opportunities.json');

// Search queries for finding backlink opportunities
const SEARCH_QUERIES = [
  // Guest post opportunities
  'AI automation "write for us"',
  'SaaS "write for us" OR "guest post"',
  'small business automation "contribute" OR "guest post"',
  'productivity tools "write for us"',
  'business technology "submit a guest post"',
  'artificial intelligence blog "guest author"',
  'workflow automation "become a contributor"',
  
  // Directory listings
  'AI tools directory submit',
  'SaaS directory listing free',
  'business automation software directory',
  'startup directory submit',
  'AI company directory',
  
  // Forum and community opportunities
  'AI automation forum community',
  'small business technology forum',
  'SaaS founders community',
  
  // Resource page link building
  'AI automation tools resources list',
  'business automation resources roundup',
  'best AI tools for small business list',
];

// Known high-value directories and platforms for backlinks
const KNOWN_DIRECTORIES = [
  {
    name: 'Product Hunt',
    url: 'https://www.producthunt.com',
    type: 'directory',
    niche: 'SaaS/Tech',
    estimatedDA: 91,
    status: 'to_submit',
    notes: 'Launch product page for ClawOps',
  },
  {
    name: 'G2',
    url: 'https://www.g2.com',
    type: 'directory',
    niche: 'Software Reviews',
    estimatedDA: 92,
    status: 'to_submit',
    notes: 'Claim and optimize business profile',
  },
  {
    name: 'Capterra',
    url: 'https://www.capterra.com',
    type: 'directory',
    niche: 'Software Reviews',
    estimatedDA: 93,
    status: 'to_submit',
    notes: 'Free listing for software products',
  },
  {
    name: 'AlternativeTo',
    url: 'https://alternativeto.net',
    type: 'directory',
    niche: 'Software Alternatives',
    estimatedDA: 80,
    status: 'to_submit',
    notes: 'List ClawOps as alternative to similar tools',
  },
  {
    name: 'Crunchbase',
    url: 'https://www.crunchbase.com',
    type: 'directory',
    niche: 'Startup/Business',
    estimatedDA: 91,
    status: 'to_submit',
    notes: 'Company profile with backlink',
  },
  {
    name: 'AngelList / Wellfound',
    url: 'https://wellfound.com',
    type: 'directory',
    niche: 'Startup',
    estimatedDA: 88,
    status: 'to_submit',
    notes: 'Startup profile with company page',
  },
  {
    name: 'BetaList',
    url: 'https://betalist.com',
    type: 'directory',
    niche: 'Startup Launch',
    estimatedDA: 65,
    status: 'to_submit',
    notes: 'Submit for early-stage exposure',
  },
  {
    name: 'SaaSHub',
    url: 'https://www.saashub.com',
    type: 'directory',
    niche: 'SaaS Directory',
    estimatedDA: 60,
    status: 'to_submit',
    notes: 'SaaS-specific directory listing',
  },
  {
    name: 'StackShare',
    url: 'https://stackshare.io',
    type: 'directory',
    niche: 'Tech Stack',
    estimatedDA: 75,
    status: 'to_submit',
    notes: 'List technology stack and tools',
  },
  {
    name: 'There\'s An AI For That',
    url: 'https://theresanaiforthat.com',
    type: 'directory',
    niche: 'AI Tools',
    estimatedDA: 68,
    status: 'to_submit',
    notes: 'AI-specific tools directory',
  },
  {
    name: 'Futurepedia',
    url: 'https://www.futurepedia.io',
    type: 'directory',
    niche: 'AI Tools',
    estimatedDA: 62,
    status: 'to_submit',
    notes: 'AI tools directory with categories',
  },
  {
    name: 'AI Tool Directory',
    url: 'https://aitoptools.com',
    type: 'directory',
    niche: 'AI Tools',
    estimatedDA: 45,
    status: 'to_submit',
    notes: 'Growing AI tools aggregator',
  },
  {
    name: 'Toolify.ai',
    url: 'https://www.toolify.ai',
    type: 'directory',
    niche: 'AI Tools',
    estimatedDA: 55,
    status: 'to_submit',
    notes: 'AI tool discovery platform',
  },
  {
    name: 'F6S',
    url: 'https://www.f6s.com',
    type: 'directory',
    niche: 'Startup/Founder',
    estimatedDA: 70,
    status: 'to_submit',
    notes: 'Founder and startup community',
  },
  {
    name: 'Clutch.co',
    url: 'https://clutch.co',
    type: 'directory',
    niche: 'Agency Reviews',
    estimatedDA: 85,
    status: 'to_submit',
    notes: 'B2B service provider directory',
  },
];

// Known guest post opportunities in the niche
const KNOWN_GUEST_POST_SITES = [
  {
    name: 'Towards Data Science (Medium)',
    url: 'https://towardsdatascience.com',
    type: 'guest_post',
    niche: 'AI/ML',
    estimatedDA: 85,
    status: 'to_pitch',
    notes: 'Medium publication, submit via Medium',
  },
  {
    name: 'HackerNoon',
    url: 'https://hackernoon.com',
    type: 'guest_post',
    niche: 'Tech/Startup',
    estimatedDA: 80,
    status: 'to_pitch',
    notes: 'Free tech publishing platform',
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to',
    type: 'guest_post',
    niche: 'Development/Tech',
    estimatedDA: 85,
    status: 'to_pitch',
    notes: 'Developer community, self-publish',
  },
  {
    name: 'DZone',
    url: 'https://dzone.com',
    type: 'guest_post',
    niche: 'Tech/Development',
    estimatedDA: 82,
    status: 'to_pitch',
    notes: 'Tech content, apply as contributor',
  },
  {
    name: 'SmallBizTrends',
    url: 'https://smallbiztrends.com',
    type: 'guest_post',
    niche: 'Small Business',
    estimatedDA: 78,
    status: 'to_pitch',
    notes: 'Small business focused, pitch via email',
  },
  {
    name: 'Entrepreneur.com',
    url: 'https://www.entrepreneur.com',
    type: 'guest_post',
    niche: 'Business/Startup',
    estimatedDA: 92,
    status: 'to_pitch',
    notes: 'High DA, competitive but valuable',
  },
  {
    name: 'Business2Community',
    url: 'https://www.business2community.com',
    type: 'guest_post',
    niche: 'Business/Marketing',
    estimatedDA: 75,
    status: 'to_pitch',
    notes: 'Business content, contributor program',
  },
  {
    name: 'ReadWrite',
    url: 'https://readwrite.com',
    type: 'guest_post',
    niche: 'Tech/Innovation',
    estimatedDA: 80,
    status: 'to_pitch',
    notes: 'Technology news and analysis',
  },
  {
    name: 'The Next Web',
    url: 'https://thenextweb.com',
    type: 'guest_post',
    niche: 'Tech/Startup',
    estimatedDA: 90,
    status: 'to_pitch',
    notes: 'Major tech publication, contributor program',
  },
  {
    name: 'VentureBeat',
    url: 'https://venturebeat.com',
    type: 'guest_post',
    niche: 'AI/Enterprise Tech',
    estimatedDA: 91,
    status: 'to_pitch',
    notes: 'AI and enterprise tech focus',
  },
];

// Brave Search API for discovering new opportunities
async function searchForOpportunities(query) {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    console.log(`[SKIP] No BRAVE_API_KEY set, skipping web search for: "${query}"`);
    return [];
  }

  try {
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: { 'X-Subscription-Token': apiKey },
      params: {
        q: query,
        count: 10,
        search_lang: 'en',
        country: 'US',
      },
      timeout: 15000,
    });

    const results = response.data.web?.results || [];
    return results.map(r => ({
      title: r.title,
      url: r.url,
      description: r.description || '',
      source: 'brave_search',
      query: query,
    }));
  } catch (err) {
    console.error(`[ERROR] Search failed for "${query}": ${err.message}`);
    return [];
  }
}

// Check if a page is a genuine guest post / write-for-us page
function scoreOpportunity(result) {
  const text = `${result.title} ${result.description}`.toLowerCase();
  let score = 0;

  // Guest post signals
  if (text.includes('write for us')) score += 3;
  if (text.includes('guest post')) score += 3;
  if (text.includes('contribute')) score += 2;
  if (text.includes('submit')) score += 1;
  if (text.includes('guest author')) score += 3;
  if (text.includes('contributor')) score += 2;

  // Niche relevance
  if (text.includes('ai') || text.includes('artificial intelligence')) score += 2;
  if (text.includes('automation')) score += 2;
  if (text.includes('saas')) score += 2;
  if (text.includes('small business')) score += 2;
  if (text.includes('productivity')) score += 1;
  if (text.includes('technology')) score += 1;
  if (text.includes('startup')) score += 1;

  // Directory signals
  if (text.includes('directory')) score += 2;
  if (text.includes('listing')) score += 1;
  if (text.includes('tools list')) score += 2;
  if (text.includes('resources')) score += 1;

  return score;
}

// Estimate domain authority from URL patterns (rough heuristic)
function estimateDA(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    
    // Known high-DA domains
    const highDA = {
      'medium.com': 95, 'github.com': 96, 'reddit.com': 97,
      'quora.com': 93, 'linkedin.com': 98, 'youtube.com': 99,
      'twitter.com': 94, 'facebook.com': 96, 'forbes.com': 95,
      'techcrunch.com': 94, 'entrepreneur.com': 92,
      'producthunt.com': 91, 'g2.com': 92, 'capterra.com': 93,
      'dev.to': 85, 'hackernoon.com': 80,
    };

    for (const [domain, da] of Object.entries(highDA)) {
      if (hostname.includes(domain)) return da;
    }

    // Use Moz API if available
    if (process.env.MOZ_API_KEY) {
      // Future: integrate Moz API for real DA values
      return null;
    }

    return null; // Unknown
  } catch {
    return null;
  }
}

// Fetch and analyze a page for backlink opportunity details
async function analyzePage(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClawOps SEO Bot/1.0)',
      },
      maxRedirects: 3,
    });

    const $ = cheerio.load(response.data);
    const title = $('title').text().trim();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    
    // Look for submission forms or email addresses
    const hasForm = $('form').length > 0;
    const emailMatches = response.data.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    const contactEmails = emailMatches.filter(e => 
      !e.includes('example') && !e.includes('test') && !e.includes('noreply')
    );

    return {
      title,
      metaDescription: metaDesc,
      hasSubmissionForm: hasForm,
      contactEmails: [...new Set(contactEmails)].slice(0, 3),
      accessible: true,
    };
  } catch (err) {
    return {
      title: '',
      metaDescription: '',
      hasSubmissionForm: false,
      contactEmails: [],
      accessible: false,
      error: err.message,
    };
  }
}

// Deduplicate opportunities by domain
function deduplicateByDomain(opportunities) {
  const seen = new Map();
  return opportunities.filter(opp => {
    try {
      const domain = new URL(opp.url).hostname.replace('www.', '');
      if (seen.has(domain)) {
        // Keep the one with higher score
        const existing = seen.get(domain);
        if ((opp.relevanceScore || 0) > (existing.relevanceScore || 0)) {
          seen.set(domain, opp);
          return true;
        }
        return false;
      }
      seen.set(domain, opp);
      return true;
    } catch {
      return true;
    }
  });
}

// Load existing data
function loadExistingData() {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    }
  } catch (err) {
    console.error(`[WARN] Could not load existing data: ${err.message}`);
  }
  return { opportunities: [], lastUpdated: null, scanCount: 0 };
}

// Main scanner function
async function runScanner() {
  console.log('[BACKLINK SCANNER] Starting scan at', new Date().toISOString());
  
  const existingData = loadExistingData();
  const newOpportunities = [];

  // 1. Search for new opportunities via Brave API
  console.log('[STEP 1] Searching for new opportunities...');
  for (const query of SEARCH_QUERIES) {
    const results = await searchForOpportunities(query);
    for (const result of results) {
      const score = scoreOpportunity(result);
      if (score >= 3) {
        newOpportunities.push({
          ...result,
          relevanceScore: score,
          estimatedDA: estimateDA(result.url),
          type: result.title.toLowerCase().includes('directory') ? 'directory' : 'guest_post',
          discoveredAt: new Date().toISOString(),
          status: 'new',
        });
      }
    }
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`[STEP 1] Found ${newOpportunities.length} potential opportunities from search`);

  // 2. Analyze top opportunities for more details
  console.log('[STEP 2] Analyzing top opportunities...');
  const topOpps = newOpportunities
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);

  for (const opp of topOpps) {
    const details = await analyzePage(opp.url);
    Object.assign(opp, {
      pageTitle: details.title,
      hasSubmissionForm: details.hasSubmissionForm,
      contactEmails: details.contactEmails,
      accessible: details.accessible,
    });
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 3. Merge with known directories and guest post sites
  console.log('[STEP 3] Merging with known opportunity database...');
  const allKnown = [
    ...KNOWN_DIRECTORIES.map(d => ({ ...d, discoveredAt: d.discoveredAt || '2025-01-01T00:00:00Z', source: 'curated' })),
    ...KNOWN_GUEST_POST_SITES.map(g => ({ ...g, discoveredAt: g.discoveredAt || '2025-01-01T00:00:00Z', source: 'curated' })),
  ];

  // 4. Merge with existing data, avoiding duplicates
  const existingUrls = new Set(
    (existingData.opportunities || []).map(o => {
      try { return new URL(o.url).hostname.replace('www.', ''); } catch { return o.url; }
    })
  );

  const freshDiscoveries = deduplicateByDomain(newOpportunities).filter(opp => {
    try {
      const domain = new URL(opp.url).hostname.replace('www.', '');
      return !existingUrls.has(domain);
    } catch {
      return true;
    }
  });

  // 5. Build final output
  const output = {
    lastUpdated: new Date().toISOString(),
    scanCount: (existingData.scanCount || 0) + 1,
    summary: {
      totalOpportunities: 0,
      byType: {},
      byStatus: {},
      byNiche: {},
      newThisScan: freshDiscoveries.length,
    },
    opportunities: [],
  };

  // Combine: existing confirmed + curated + new discoveries
  const combined = [
    ...(existingData.opportunities || []),
    ...allKnown,
    ...freshDiscoveries,
  ];

  // Deduplicate final list
  output.opportunities = deduplicateByDomain(combined);
  output.summary.totalOpportunities = output.opportunities.length;

  // Calculate summary stats
  for (const opp of output.opportunities) {
    const type = opp.type || 'unknown';
    const status = opp.status || 'new';
    const niche = opp.niche || 'general';

    output.summary.byType[type] = (output.summary.byType[type] || 0) + 1;
    output.summary.byStatus[status] = (output.summary.byStatus[status] || 0) + 1;
    output.summary.byNiche[niche] = (output.summary.byNiche[niche] || 0) + 1;
  }

  // Sort by estimated DA (highest first), then by relevance score
  output.opportunities.sort((a, b) => {
    const daA = a.estimatedDA || 0;
    const daB = b.estimatedDA || 0;
    if (daB !== daA) return daB - daA;
    return (b.relevanceScore || 0) - (a.relevanceScore || 0);
  });

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`[BACKLINK SCANNER] Complete. ${output.summary.totalOpportunities} total opportunities.`);
  console.log(`[BACKLINK SCANNER] New discoveries this scan: ${freshDiscoveries.length}`);
  console.log(`[BACKLINK SCANNER] Output: ${OUTPUT_FILE}`);

  return output;
}

// Run if called directly
if (require.main === module) {
  runScanner()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[FATAL]', err);
      process.exit(1);
    });
}

module.exports = { runScanner };
