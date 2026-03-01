#!/usr/bin/env node
/**
 * Content Gap Analyzer for ClawOps
 * 
 * Analyzes competitor content in AI automation, agency, and SaaS niches.
 * Identifies keywords and topics competitors rank for that ClawOps does not cover.
 * Suggests blog post topics with estimated search volume indicators.
 * 
 * Runs daily at 3 AM EST via cron.
 * Output: automation/seo/data/content-gaps.json
 */

'use strict';

require('dotenv').config({ path: __dirname + '/.env' });

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'content-gaps.json');

// Our domain
const OUR_DOMAIN = 'theclawops.com';

// Competitor domains to analyze
const COMPETITORS = [
  { name: 'Zapier', domain: 'zapier.com', blogPath: '/blog', niche: 'automation' },
  { name: 'Make (Integromat)', domain: 'make.com', blogPath: '/blog', niche: 'automation' },
  { name: 'n8n', domain: 'n8n.io', blogPath: '/blog', niche: 'automation' },
  { name: 'Relevance AI', domain: 'relevanceai.com', blogPath: '/blog', niche: 'AI automation' },
  { name: 'Bardeen', domain: 'bardeen.ai', blogPath: '/blog', niche: 'AI automation' },
  { name: 'Workato', domain: 'workato.com', blogPath: '/resources', niche: 'enterprise automation' },
  { name: 'Tray.io', domain: 'tray.io', blogPath: '/blog', niche: 'integration' },
  { name: 'Activepieces', domain: 'activepieces.com', blogPath: '/blog', niche: 'open source automation' },
];

// Target keyword themes for ClawOps
const TARGET_THEMES = [
  'AI automation',
  'AI agent',
  'workflow automation',
  'business process automation',
  'small business automation',
  'AI for small business',
  'no code automation',
  'AI productivity',
  'automated workflows',
  'AI integration',
  'AI consulting',
  'automation agency',
  'AI implementation',
  'AI chatbot',
  'AI customer service',
  'lead generation automation',
  'email automation AI',
  'sales automation',
  'marketing automation AI',
  'AI tools for business',
  'custom AI solutions',
  'AI strategy consulting',
  'robotic process automation',
  'intelligent automation',
  'hyperautomation',
];

// Seed keywords with estimated volume indicators (H/M/L)
const KEYWORD_DATABASE = [
  { keyword: 'AI automation for small business', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'AI agent workflow', volumeEstimate: 'medium', difficulty: 'low' },
  { keyword: 'how to automate business with AI', volumeEstimate: 'high', difficulty: 'high' },
  { keyword: 'AI automation agency services', volumeEstimate: 'low', difficulty: 'low' },
  { keyword: 'best AI automation tools 2025', volumeEstimate: 'high', difficulty: 'high' },
  { keyword: 'AI workflow builder', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'custom AI agent development', volumeEstimate: 'low', difficulty: 'low' },
  { keyword: 'AI process automation examples', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'small business AI tools', volumeEstimate: 'high', difficulty: 'high' },
  { keyword: 'AI chatbot for business', volumeEstimate: 'high', difficulty: 'high' },
  { keyword: 'automation consulting services', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'AI email automation', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'lead generation AI automation', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'AI sales automation', volumeEstimate: 'high', difficulty: 'high' },
  { keyword: 'no code AI automation', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'AI customer support automation', volumeEstimate: 'high', difficulty: 'high' },
  { keyword: 'business AI implementation guide', volumeEstimate: 'medium', difficulty: 'low' },
  { keyword: 'AI automation ROI', volumeEstimate: 'medium', difficulty: 'low' },
  { keyword: 'AI vs RPA', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'AI automation case studies', volumeEstimate: 'medium', difficulty: 'low' },
  { keyword: 'automate repetitive tasks AI', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'AI data entry automation', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'AI scheduling automation', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'AI invoice processing', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'AI document automation', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'how to hire AI automation agency', volumeEstimate: 'low', difficulty: 'low' },
  { keyword: 'AI automation pricing', volumeEstimate: 'low', difficulty: 'low' },
  { keyword: 'AI automation for ecommerce', volumeEstimate: 'medium', difficulty: 'medium' },
  { keyword: 'AI automation for real estate', volumeEstimate: 'medium', difficulty: 'low' },
  { keyword: 'AI automation for healthcare', volumeEstimate: 'medium', difficulty: 'medium' },
];

// Fetch competitor blog sitemap or page listing
async function fetchCompetitorContent(competitor) {
  const articles = [];

  // Try sitemap first
  const sitemapUrls = [
    `https://${competitor.domain}/sitemap.xml`,
    `https://${competitor.domain}/sitemap_index.xml`,
    `https://${competitor.domain}/blog-sitemap.xml`,
    `https://${competitor.domain}/post-sitemap.xml`,
  ];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const resp = await axios.get(sitemapUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ClawOps SEO Bot/1.0)' },
      });

      const $ = cheerio.load(resp.data, { xmlMode: true });
      $('url loc').each((_, el) => {
        const url = $(el).text().trim();
        if (url.includes('/blog/') || url.includes('/resources/') || url.includes('/learn/')) {
          articles.push(url);
        }
      });

      if (articles.length > 0) {
        console.log(`  [SITEMAP] Found ${articles.length} blog URLs from ${sitemapUrl}`);
        break;
      }
    } catch {
      // Try next sitemap URL
    }
  }

  // Fallback: scrape the blog listing page
  if (articles.length === 0) {
    try {
      const blogUrl = `https://${competitor.domain}${competitor.blogPath}`;
      const resp = await axios.get(blogUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ClawOps SEO Bot/1.0)' },
      });

      const $ = cheerio.load(resp.data);
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const fullUrl = href.startsWith('http') ? href : `https://${competitor.domain}${href}`;
        if (
          (fullUrl.includes('/blog/') || fullUrl.includes('/resources/')) &&
          fullUrl.includes(competitor.domain) &&
          !fullUrl.endsWith('/blog/') &&
          !fullUrl.endsWith('/blog')
        ) {
          articles.push(fullUrl);
        }
      });
      console.log(`  [SCRAPE] Found ${articles.length} blog URLs from ${blogUrl}`);
    } catch (err) {
      console.error(`  [ERROR] Failed to fetch blog for ${competitor.name}: ${err.message}`);
    }
  }

  return [...new Set(articles)].slice(0, 100); // Cap at 100 articles per competitor
}

// Extract topics/keywords from article URLs and titles
function extractTopicsFromUrls(urls) {
  const topics = [];
  for (const url of urls) {
    try {
      const pathPart = new URL(url).pathname;
      const slug = pathPart.split('/').filter(Boolean).pop() || '';
      const words = slug.replace(/-/g, ' ').replace(/_/g, ' ').toLowerCase();
      if (words.length > 3) {
        topics.push({
          url,
          slug,
          extractedTopic: words,
        });
      }
    } catch {
      // Skip malformed URLs
    }
  }
  return topics;
}

// Check if a topic is relevant to our niche
function isRelevantTopic(topic) {
  const text = topic.toLowerCase();
  const relevantTerms = [
    'ai', 'automation', 'workflow', 'automate', 'bot', 'chatbot',
    'productivity', 'integration', 'api', 'no-code', 'nocode', 'low-code',
    'small business', 'saas', 'tool', 'agent', 'process',
    'lead', 'email', 'sales', 'marketing', 'customer', 'support',
    'data', 'invoice', 'document', 'schedule', 'task',
  ];
  return relevantTerms.some(term => text.includes(term));
}

// Search Brave for what our site currently ranks for
async function checkOurContent() {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    console.log('[SKIP] No BRAVE_API_KEY, using limited self-analysis');
    return [];
  }

  const ourTopics = [];
  try {
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: { 'X-Subscription-Token': apiKey },
      params: { q: `site:${OUR_DOMAIN}`, count: 20 },
      timeout: 15000,
    });

    const results = response.data.web?.results || [];
    for (const r of results) {
      ourTopics.push({
        url: r.url,
        title: r.title,
        description: r.description || '',
      });
    }
  } catch (err) {
    console.error(`[ERROR] Failed to check our content: ${err.message}`);
  }

  return ourTopics;
}

// Search for competitor keyword rankings
async function searchCompetitorKeywords(keyword, competitor) {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: { 'X-Subscription-Token': apiKey },
      params: { q: keyword, count: 10 },
      timeout: 15000,
    });

    const results = response.data.web?.results || [];
    const competitorResult = results.findIndex(r =>
      r.url.includes(competitor.domain)
    );
    const ourResult = results.findIndex(r =>
      r.url.includes(OUR_DOMAIN)
    );

    return {
      keyword,
      competitorRank: competitorResult >= 0 ? competitorResult + 1 : null,
      competitorUrl: competitorResult >= 0 ? results[competitorResult].url : null,
      ourRank: ourResult >= 0 ? ourResult + 1 : null,
      isGap: competitorResult >= 0 && ourResult < 0,
    };
  } catch {
    return null;
  }
}

// Generate blog post suggestions from gaps
function generateBlogSuggestions(gaps, competitorTopics) {
  const suggestions = [];

  // From keyword gaps
  for (const gap of gaps) {
    if (gap.isGap) {
      suggestions.push({
        title: `Guide: ${capitalizeWords(gap.keyword)}`,
        targetKeyword: gap.keyword,
        source: 'keyword_gap',
        competitorCovering: gap.competitorName || 'multiple',
        competitorUrl: gap.competitorUrl,
        priority: gap.volumeEstimate === 'high' ? 'high' : gap.volumeEstimate === 'medium' ? 'medium' : 'low',
        suggestedFormat: determineBestFormat(gap.keyword),
      });
    }
  }

  // From competitor content analysis
  const coveredSlugs = new Set();
  for (const topic of competitorTopics) {
    if (coveredSlugs.has(topic.extractedTopic)) continue;
    if (isRelevantTopic(topic.extractedTopic)) {
      coveredSlugs.add(topic.extractedTopic);
      suggestions.push({
        title: `${capitalizeWords(topic.extractedTopic)}`,
        targetKeyword: topic.extractedTopic,
        source: 'competitor_content',
        competitorUrl: topic.url,
        priority: 'medium',
        suggestedFormat: determineBestFormat(topic.extractedTopic),
      });
    }
  }

  // Deduplicate by similar keywords
  const seen = new Set();
  return suggestions.filter(s => {
    const key = s.targetKeyword.split(' ').sort().join(' ');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 50); // Cap at 50 suggestions
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function determineBestFormat(keyword) {
  const kw = keyword.toLowerCase();
  if (kw.includes('how to') || kw.includes('guide')) return 'how-to guide';
  if (kw.includes('vs') || kw.includes('comparison')) return 'comparison post';
  if (kw.includes('best') || kw.includes('top')) return 'listicle';
  if (kw.includes('example') || kw.includes('case stud')) return 'case study';
  if (kw.includes('what is') || kw.includes('definition')) return 'explainer';
  if (kw.includes('review')) return 'review';
  if (kw.includes('template') || kw.includes('checklist')) return 'template/resource';
  return 'long-form article';
}

// Load existing data for trend tracking
function loadExistingData() {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    }
  } catch (err) {
    console.error(`[WARN] Could not load existing data: ${err.message}`);
  }
  return { gaps: [], suggestions: [], lastUpdated: null };
}

// Main analyzer function
async function runAnalyzer() {
  console.log('[CONTENT GAP ANALYZER] Starting analysis at', new Date().toISOString());

  const existingData = loadExistingData();
  const allCompetitorTopics = [];
  const allGaps = [];

  // 1. Fetch competitor content
  console.log('[STEP 1] Fetching competitor blog content...');
  for (const competitor of COMPETITORS) {
    console.log(`  Analyzing ${competitor.name} (${competitor.domain})...`);
    const urls = await fetchCompetitorContent(competitor);
    const topics = extractTopicsFromUrls(urls);
    allCompetitorTopics.push(...topics.map(t => ({ ...t, competitor: competitor.name })));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log(`[STEP 1] Found ${allCompetitorTopics.length} total competitor topics`);

  // 2. Check our existing content
  console.log('[STEP 2] Checking our existing content...');
  const ourContent = await checkOurContent();
  console.log(`[STEP 2] Found ${ourContent.length} pages on ${OUR_DOMAIN}`);

  // 3. Check keyword gaps
  console.log('[STEP 3] Analyzing keyword gaps...');
  const apiKey = process.env.BRAVE_API_KEY;
  
  if (apiKey) {
    for (const kw of KEYWORD_DATABASE) {
      for (const competitor of COMPETITORS.slice(0, 3)) { // Top 3 competitors only for API limits
        const result = await searchCompetitorKeywords(kw.keyword, competitor);
        if (result) {
          allGaps.push({
            ...result,
            competitorName: competitor.name,
            volumeEstimate: kw.volumeEstimate,
            difficulty: kw.difficulty,
          });
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } else {
    console.log('[STEP 3] No BRAVE_API_KEY, generating gaps from keyword database and competitor topics');
    // Generate synthetic gap analysis from our keyword database
    for (const kw of KEYWORD_DATABASE) {
      const matchingCompetitorTopics = allCompetitorTopics.filter(t =>
        kw.keyword.split(' ').some(word => t.extractedTopic.includes(word))
      );
      if (matchingCompetitorTopics.length > 0) {
        allGaps.push({
          keyword: kw.keyword,
          isGap: true, // Assume gap since we can't verify our rankings
          competitorName: matchingCompetitorTopics[0].competitor,
          competitorUrl: matchingCompetitorTopics[0].url,
          volumeEstimate: kw.volumeEstimate,
          difficulty: kw.difficulty,
          ourRank: null,
          competitorRank: null,
        });
      }
    }
  }

  console.log(`[STEP 3] Identified ${allGaps.filter(g => g.isGap).length} keyword gaps`);

  // 4. Generate blog post suggestions
  console.log('[STEP 4] Generating blog post suggestions...');
  const suggestions = generateBlogSuggestions(allGaps, allCompetitorTopics);

  // 5. Build output
  const output = {
    lastUpdated: new Date().toISOString(),
    analysisVersion: 2,
    summary: {
      competitorsAnalyzed: COMPETITORS.length,
      totalCompetitorTopics: allCompetitorTopics.length,
      keywordGapsFound: allGaps.filter(g => g.isGap).length,
      blogPostSuggestions: suggestions.length,
      ourIndexedPages: ourContent.length,
      highPrioritySuggestions: suggestions.filter(s => s.priority === 'high').length,
      mediumPrioritySuggestions: suggestions.filter(s => s.priority === 'medium').length,
      lowPrioritySuggestions: suggestions.filter(s => s.priority === 'low').length,
    },
    competitors: COMPETITORS.map(c => ({
      name: c.name,
      domain: c.domain,
      niche: c.niche,
      articlesFound: allCompetitorTopics.filter(t => t.competitor === c.name).length,
    })),
    keywordGaps: allGaps
      .filter(g => g.isGap)
      .sort((a, b) => {
        const volOrder = { high: 3, medium: 2, low: 1 };
        return (volOrder[b.volumeEstimate] || 0) - (volOrder[a.volumeEstimate] || 0);
      }),
    blogPostSuggestions: suggestions.sort((a, b) => {
      const pOrder = { high: 3, medium: 2, low: 1 };
      return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
    }),
    ourExistingContent: ourContent,
    targetKeywordThemes: TARGET_THEMES,
    previousAnalysis: existingData.lastUpdated ? {
      date: existingData.lastUpdated,
      previousGaps: (existingData.keywordGaps || []).length,
      previousSuggestions: (existingData.blogPostSuggestions || []).length,
    } : null,
  };

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`[CONTENT GAP ANALYZER] Complete.`);
  console.log(`  Gaps found: ${output.summary.keywordGapsFound}`);
  console.log(`  Blog suggestions: ${output.summary.blogPostSuggestions}`);
  console.log(`  Output: ${OUTPUT_FILE}`);

  return output;
}

// Run if called directly
if (require.main === module) {
  runAnalyzer()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[FATAL]', err);
      process.exit(1);
    });
}

module.exports = { runAnalyzer };
