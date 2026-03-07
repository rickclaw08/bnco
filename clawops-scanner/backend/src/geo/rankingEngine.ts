/**
 * ClawOps Scanner - GEO Ranking Engine
 * Tests business visibility in AI model responses
 */

import { openaiClient, OPENAI_GEO_MODEL } from '../lib/openaiClient';
import { geoQueryCache } from '../lib/redisClient';
import { logger } from '../lib/logger';
import type { GEOQueryResult } from './geoSchema';

/**
 * Run a single GEO query against the AI model and check for business mention
 */
async function runSingleQuery(args: {
  query: string;
  businessName: string;
  city: string;
}): Promise<GEOQueryResult> {
  const { query, businessName, city } = args;
  const cacheKey = `geo:query:${query}:${city}`;

  // Check cache
  const cached = await geoQueryCache.get<GEOQueryResult>(cacheKey);
  if (cached) {
    logger.info('[GEO Ranking] Cache hit', { query });
    return cached;
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: OPENAI_GEO_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful local business recommendation assistant. Answer the question with specific local business recommendations. Include business names, brief descriptions, and why you recommend them. Be specific and factual.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content || '';
    const contentLower = content.toLowerCase();
    const businessNameLower = businessName.toLowerCase();

    // Check if business is mentioned
    const mentioned = contentLower.includes(businessNameLower);

    // Find rank (position in list if mentioned)
    let rank: number | null = null;
    if (mentioned) {
      // Try to find numbered position
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(businessNameLower)) {
          // Check for numbering pattern
          const numMatch = lines[i].match(/^(\d+)[.)]/);
          if (numMatch) {
            rank = parseInt(numMatch[1], 10);
          } else {
            rank = i + 1;
          }
          break;
        }
      }
    }

    // Extract snippet
    let snippet: string | null = null;
    if (mentioned) {
      const idx = contentLower.indexOf(businessNameLower);
      const start = Math.max(0, idx - 50);
      const end = Math.min(content.length, idx + businessName.length + 150);
      snippet = content.slice(start, end).trim();
    }

    const result: GEOQueryResult = {
      query,
      mentioned,
      rank,
      snippet,
      source: 'openai',
      context: content.slice(0, 500),
    };

    // Cache result
    await geoQueryCache.set(cacheKey, result);

    return result;
  } catch (error: any) {
    logger.error('[GEO Ranking] Query failed', { query, error: error.message });
    return {
      query,
      mentioned: false,
      rank: null,
      snippet: null,
      source: 'openai',
      context: `Error: ${error.message}`,
    };
  }
}

/**
 * Run multiple GEO queries and aggregate results
 */
export async function runGEORankingBatch(args: {
  queries: string[];
  businessName: string;
  city: string;
  concurrency?: number;
}): Promise<GEOQueryResult[]> {
  const { queries, businessName, city, concurrency = 3 } = args;
  const results: GEOQueryResult[] = [];

  // Process in batches for rate limiting
  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(query => runSingleQuery({ query, businessName, city }))
    );
    results.push(...batchResults);
  }

  return results;
}
