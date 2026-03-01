#!/usr/bin/env node
/**
 * Local Citation Tracker for ClawOps
 * 
 * Checks major business directories for ClawOps listings.
 * Verifies listing accuracy and consistency (NAP: Name, Address, Phone).
 * Identifies new directories to list on.
 * 
 * Runs weekly on Mondays at 2 AM EST via cron.
 * Output: automation/seo/data/citations.json
 */

'use strict';

require('dotenv').config({ path: __dirname + '/.env' });

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'citations.json');

// ClawOps business information (canonical/correct data)
const BUSINESS_INFO = {
  name: 'ClawOps',
  alternateName: 'The Claw Ops',
  domain: 'theclawops.com',
  website: 'https://theclawops.com',
  // Set these via environment variables for privacy
  phone: process.env.BUSINESS_PHONE || '',
  email: process.env.BUSINESS_EMAIL || '',
  address: process.env.BUSINESS_ADDRESS || '',
  city: process.env.BUSINESS_CITY || '',
  state: process.env.BUSINESS_STATE || '',
  zip: process.env.BUSINESS_ZIP || '',
  country: process.env.BUSINESS_COUNTRY || 'US',
  category: 'AI Automation Agency',
  description: 'AI automation services for small businesses and startups',
};

// Directories to check for listings
const DIRECTORIES = [
  // Major business directories
  {
    name: 'Google Business Profile',
    url: 'https://www.google.com/maps',
    searchUrl: 'https://www.google.com/search?q=ClawOps+AI+automation',
    category: 'major',
    priority: 'critical',
    estimatedDA: 99,
    notes: 'Most important citation. Claim via business.google.com',
    checkMethod: 'search',
  },
  {
    name: 'Yelp',
    url: 'https://www.yelp.com',
    searchUrl: 'https://www.yelp.com/search?find_desc=ClawOps',
    category: 'major',
    priority: 'high',
    estimatedDA: 93,
    notes: 'Claim free business page at biz.yelp.com',
    checkMethod: 'search',
  },
  {
    name: 'Better Business Bureau',
    url: 'https://www.bbb.org',
    searchUrl: 'https://www.bbb.org/search?find_text=ClawOps',
    category: 'major',
    priority: 'high',
    estimatedDA: 91,
    notes: 'Apply for BBB accreditation or free listing',
    checkMethod: 'search',
  },
  {
    name: 'LinkedIn Company Page',
    url: 'https://www.linkedin.com/company/clawops',
    category: 'major',
    priority: 'critical',
    estimatedDA: 98,
    notes: 'Create company page with full details',
    checkMethod: 'direct',
  },
  {
    name: 'Facebook Business Page',
    url: 'https://www.facebook.com',
    category: 'major',
    priority: 'high',
    estimatedDA: 96,
    notes: 'Create business page with NAP consistency',
    checkMethod: 'search',
  },
  {
    name: 'Apple Maps',
    url: 'https://mapsconnect.apple.com',
    category: 'major',
    priority: 'medium',
    estimatedDA: 99,
    notes: 'Submit via Apple Maps Connect',
    checkMethod: 'manual',
  },
  {
    name: 'Bing Places',
    url: 'https://www.bingplaces.com',
    category: 'major',
    priority: 'medium',
    estimatedDA: 95,
    notes: 'Claim via Bing Places for Business',
    checkMethod: 'manual',
  },

  // Tech and SaaS directories
  {
    name: 'Clutch.co',
    url: 'https://clutch.co',
    searchUrl: 'https://clutch.co/search?q=ClawOps',
    category: 'tech',
    priority: 'high',
    estimatedDA: 85,
    notes: 'B2B reviews platform, create company profile',
    checkMethod: 'search',
  },
  {
    name: 'G2',
    url: 'https://www.g2.com',
    searchUrl: 'https://www.g2.com/search?query=ClawOps',
    category: 'tech',
    priority: 'high',
    estimatedDA: 92,
    notes: 'Software review platform',
    checkMethod: 'search',
  },
  {
    name: 'Capterra',
    url: 'https://www.capterra.com',
    category: 'tech',
    priority: 'high',
    estimatedDA: 93,
    notes: 'Software reviews and comparisons',
    checkMethod: 'search',
  },
  {
    name: 'Crunchbase',
    url: 'https://www.crunchbase.com',
    searchUrl: 'https://www.crunchbase.com/textsearch?q=ClawOps',
    category: 'tech',
    priority: 'high',
    estimatedDA: 91,
    notes: 'Startup and business database',
    checkMethod: 'search',
  },
  {
    name: 'AngelList / Wellfound',
    url: 'https://wellfound.com',
    category: 'tech',
    priority: 'medium',
    estimatedDA: 88,
    notes: 'Startup community and jobs',
    checkMethod: 'search',
  },
  {
    name: 'Product Hunt',
    url: 'https://www.producthunt.com',
    searchUrl: 'https://www.producthunt.com/search?q=ClawOps',
    category: 'tech',
    priority: 'high',
    estimatedDA: 91,
    notes: 'Launch products for visibility',
    checkMethod: 'search',
  },

  // AI-specific directories
  {
    name: 'There\'s An AI For That',
    url: 'https://theresanaiforthat.com',
    category: 'ai',
    priority: 'high',
    estimatedDA: 68,
    notes: 'AI tools directory, submit at theresanaiforthat.com/submit',
    checkMethod: 'search',
  },
  {
    name: 'Futurepedia',
    url: 'https://www.futurepedia.io',
    category: 'ai',
    priority: 'medium',
    estimatedDA: 62,
    notes: 'AI tools directory',
    checkMethod: 'search',
  },
  {
    name: 'Toolify.ai',
    url: 'https://www.toolify.ai',
    category: 'ai',
    priority: 'medium',
    estimatedDA: 55,
    notes: 'AI tool discovery platform',
    checkMethod: 'search',
  },
  {
    name: 'AI Tool Directory',
    url: 'https://aitoptools.com',
    category: 'ai',
    priority: 'medium',
    estimatedDA: 45,
    notes: 'Growing AI tools aggregator',
    checkMethod: 'search',
  },
  {
    name: 'TopAI.tools',
    url: 'https://topai.tools',
    category: 'ai',
    priority: 'medium',
    estimatedDA: 42,
    notes: 'AI tools listing',
    checkMethod: 'search',
  },

  // General business directories
  {
    name: 'Manta',
    url: 'https://www.manta.com',
    category: 'business',
    priority: 'low',
    estimatedDA: 70,
    notes: 'Small business directory',
    checkMethod: 'search',
  },
  {
    name: 'Hotfrog',
    url: 'https://www.hotfrog.com',
    category: 'business',
    priority: 'low',
    estimatedDA: 55,
    notes: 'Business directory with free listings',
    checkMethod: 'search',
  },
  {
    name: 'Foursquare',
    url: 'https://foursquare.com',
    category: 'business',
    priority: 'low',
    estimatedDA: 88,
    notes: 'Location-based business listing',
    checkMethod: 'search',
  },
  {
    name: 'Chamber of Commerce',
    url: 'https://www.chamberofcommerce.com',
    category: 'business',
    priority: 'low',
    estimatedDA: 60,
    notes: 'Local business directory',
    checkMethod: 'search',
  },

  // Startup directories
  {
    name: 'BetaList',
    url: 'https://betalist.com',
    category: 'startup',
    priority: 'medium',
    estimatedDA: 65,
    notes: 'Submit at betalist.com/submit',
    checkMethod: 'search',
  },
  {
    name: 'SaaSHub',
    url: 'https://www.saashub.com',
    category: 'startup',
    priority: 'medium',
    estimatedDA: 60,
    notes: 'SaaS product directory',
    checkMethod: 'search',
  },
  {
    name: 'AlternativeTo',
    url: 'https://alternativeto.net',
    category: 'startup',
    priority: 'medium',
    estimatedDA: 80,
    notes: 'Software alternatives directory',
    checkMethod: 'search',
  },
  {
    name: 'StackShare',
    url: 'https://stackshare.io',
    category: 'startup',
    priority: 'medium',
    estimatedDA: 75,
    notes: 'Tech stack sharing platform',
    checkMethod: 'search',
  },
  {
    name: 'F6S',
    url: 'https://www.f6s.com',
    category: 'startup',
    priority: 'low',
    estimatedDA: 70,
    notes: 'Founder and startup community',
    checkMethod: 'search',
  },

  // Review platforms
  {
    name: 'Trustpilot',
    url: 'https://www.trustpilot.com',
    searchUrl: 'https://www.trustpilot.com/search?query=ClawOps',
    category: 'reviews',
    priority: 'high',
    estimatedDA: 93,
    notes: 'Consumer review platform, claim free profile',
    checkMethod: 'search',
  },
  {
    name: 'GoodFirms',
    url: 'https://www.goodfirms.co',
    category: 'reviews',
    priority: 'medium',
    estimatedDA: 65,
    notes: 'IT services review platform',
    checkMethod: 'search',
  },
];

// Check if a listing exists via Brave Search
async function checkListingViaBrave(directory) {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) return { found: null, method: 'skipped_no_api_key' };

  try {
    const query = `site:${new URL(directory.url).hostname} "ClawOps" OR "theclawops"`;
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: { 'X-Subscription-Token': apiKey },
      params: { q: query, count: 5 },
      timeout: 15000,
    });

    const results = response.data.web?.results || [];
    if (results.length > 0) {
      return {
        found: true,
        method: 'brave_search',
        listingUrl: results[0].url,
        listingTitle: results[0].title,
        snippet: results[0].description,
      };
    }
    return { found: false, method: 'brave_search' };
  } catch (err) {
    return { found: null, method: 'brave_search_error', error: err.message };
  }
}

// Check listing by directly fetching a URL
async function checkListingDirect(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClawOps Citation Bot/1.0)',
      },
      maxRedirects: 3,
      validateStatus: status => status < 400,
    });

    const $ = cheerio.load(response.data);
    const pageText = $('body').text().toLowerCase();
    const hasClawOps = pageText.includes('clawops') || pageText.includes('claw ops');

    return {
      found: hasClawOps,
      method: 'direct_check',
      statusCode: response.status,
      pageTitle: $('title').text().trim(),
    };
  } catch (err) {
    return {
      found: null,
      method: 'direct_check_error',
      error: err.message,
    };
  }
}

// Verify NAP consistency in a listing
function checkNAPConsistency(listingData) {
  const issues = [];
  const info = BUSINESS_INFO;

  if (!info.phone && !info.address) {
    return { consistent: null, issues: ['Business contact info not configured in env vars'] };
  }

  // These would be checked if we can extract data from the listing page
  // For now, flag for manual review
  return {
    consistent: null,
    issues: ['NAP consistency requires manual verification'],
    requiresManualReview: true,
  };
}

// Load existing citation data
function loadExistingData() {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    }
  } catch (err) {
    console.error(`[WARN] Could not load existing data: ${err.message}`);
  }
  return { citations: [], lastChecked: null, checkCount: 0 };
}

// Main tracker function
async function runTracker() {
  console.log('[CITATION TRACKER] Starting weekly check at', new Date().toISOString());

  const existingData = loadExistingData();
  const citations = [];
  let foundCount = 0;
  let notFoundCount = 0;
  let unknownCount = 0;

  // Check each directory
  console.log('[STEP 1] Checking directory listings...');
  for (const directory of DIRECTORIES) {
    console.log(`  Checking ${directory.name}...`);

    let result;
    if (directory.checkMethod === 'direct' && directory.url) {
      result = await checkListingDirect(directory.url);
    } else if (directory.checkMethod === 'search' || directory.checkMethod === 'direct') {
      result = await checkListingViaBrave(directory);
    } else {
      result = { found: null, method: 'manual_check_required' };
    }

    const napCheck = result.found ? checkNAPConsistency(result) : null;

    // Check existing data for this directory
    const existingEntry = (existingData.citations || []).find(c => c.name === directory.name);

    const citation = {
      name: directory.name,
      url: directory.url,
      category: directory.category,
      priority: directory.priority,
      estimatedDA: directory.estimatedDA,
      notes: directory.notes,
      listing: {
        found: result.found,
        checkMethod: result.method,
        listingUrl: result.listingUrl || null,
        listingTitle: result.listingTitle || null,
        lastChecked: new Date().toISOString(),
        previousStatus: existingEntry ? existingEntry.listing?.found : null,
        statusChanged: existingEntry ? existingEntry.listing?.found !== result.found : false,
      },
      napConsistency: napCheck,
      actionRequired: !result.found
        ? 'create_listing'
        : napCheck?.requiresManualReview
          ? 'verify_nap'
          : 'none',
    };

    citations.push(citation);

    if (result.found === true) foundCount++;
    else if (result.found === false) notFoundCount++;
    else unknownCount++;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`[STEP 1] Complete: ${foundCount} found, ${notFoundCount} not found, ${unknownCount} unknown`);

  // 2. Identify priority actions
  console.log('[STEP 2] Identifying priority actions...');
  const priorityActions = citations
    .filter(c => c.actionRequired === 'create_listing')
    .sort((a, b) => {
      const pOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
    });

  console.log(`[STEP 2] ${priorityActions.length} listings need to be created`);
  for (const action of priorityActions.slice(0, 5)) {
    console.log(`  [${action.priority.toUpperCase()}] ${action.name} (DA: ${action.estimatedDA})`);
  }

  // 3. Build output
  const output = {
    lastChecked: new Date().toISOString(),
    checkCount: (existingData.checkCount || 0) + 1,
    businessInfo: {
      name: BUSINESS_INFO.name,
      domain: BUSINESS_INFO.domain,
      website: BUSINESS_INFO.website,
      category: BUSINESS_INFO.category,
      contactConfigured: !!(BUSINESS_INFO.phone || BUSINESS_INFO.address),
    },
    summary: {
      totalDirectories: DIRECTORIES.length,
      listingsFound: foundCount,
      listingsNotFound: notFoundCount,
      listingsUnknown: unknownCount,
      coveragePercent: Math.round((foundCount / DIRECTORIES.length) * 100),
      byCategory: {},
      byPriority: {},
    },
    priorityActions: priorityActions.map(a => ({
      directory: a.name,
      url: a.url,
      priority: a.priority,
      estimatedDA: a.estimatedDA,
      notes: a.notes,
    })),
    citations: citations.sort((a, b) => {
      // Sort: found first, then by priority
      if (a.listing.found !== b.listing.found) {
        return a.listing.found ? -1 : 1;
      }
      const pOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
    }),
    statusChanges: citations.filter(c => c.listing.statusChanged),
    recommendations: generateRecommendations(citations),
  };

  // Calculate summary stats
  for (const citation of citations) {
    const cat = citation.category;
    const pri = citation.priority;
    if (!output.summary.byCategory[cat]) {
      output.summary.byCategory[cat] = { total: 0, found: 0 };
    }
    output.summary.byCategory[cat].total++;
    if (citation.listing.found) output.summary.byCategory[cat].found++;

    if (!output.summary.byPriority[pri]) {
      output.summary.byPriority[pri] = { total: 0, found: 0 };
    }
    output.summary.byPriority[pri].total++;
    if (citation.listing.found) output.summary.byPriority[pri].found++;
  }

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`[CITATION TRACKER] Complete.`);
  console.log(`  Coverage: ${output.summary.coveragePercent}%`);
  console.log(`  Priority actions: ${priorityActions.length}`);
  console.log(`  Output: ${OUTPUT_FILE}`);

  return output;
}

// Generate actionable recommendations
function generateRecommendations(citations) {
  const recs = [];

  // Critical missing listings
  const criticalMissing = citations.filter(
    c => c.priority === 'critical' && c.actionRequired === 'create_listing'
  );
  if (criticalMissing.length > 0) {
    recs.push({
      priority: 'critical',
      action: 'Create listings on critical directories',
      directories: criticalMissing.map(c => c.name),
      impact: 'High visibility and trust signals',
    });
  }

  // High-DA missing listings
  const highDAMissing = citations.filter(
    c => c.estimatedDA >= 80 && c.actionRequired === 'create_listing'
  );
  if (highDAMissing.length > 0) {
    recs.push({
      priority: 'high',
      action: 'Submit to high-authority directories',
      directories: highDAMissing.map(c => `${c.name} (DA: ${c.estimatedDA})`),
      impact: 'Strong backlinks and citation signals',
    });
  }

  // AI-specific directories
  const aiMissing = citations.filter(
    c => c.category === 'ai' && c.actionRequired === 'create_listing'
  );
  if (aiMissing.length > 0) {
    recs.push({
      priority: 'high',
      action: 'List on AI-specific directories for niche authority',
      directories: aiMissing.map(c => c.name),
      impact: 'Niche relevance and targeted traffic',
    });
  }

  // NAP verification
  const napReview = citations.filter(
    c => c.listing.found && c.napConsistency?.requiresManualReview
  );
  if (napReview.length > 0) {
    recs.push({
      priority: 'medium',
      action: 'Manually verify NAP consistency on existing listings',
      directories: napReview.map(c => c.name),
      impact: 'Consistent NAP improves local SEO trust',
    });
  }

  // Review platform presence
  const reviewMissing = citations.filter(
    c => c.category === 'reviews' && c.actionRequired === 'create_listing'
  );
  if (reviewMissing.length > 0) {
    recs.push({
      priority: 'medium',
      action: 'Establish presence on review platforms',
      directories: reviewMissing.map(c => c.name),
      impact: 'Social proof and review-based trust signals',
    });
  }

  return recs;
}

// Run if called directly
if (require.main === module) {
  runTracker()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[FATAL]', err);
      process.exit(1);
    });
}

module.exports = { runTracker };
