/**
 * ClawOps Scanner - GEO Engine (Orchestrator)
 * Coordinates query generation, ranking, and scoring
 */

import { generateGEOQueries } from './queryGenerator';
import { runGEORankingBatch } from './rankingEngine';
import { calculateGEOScore, type GEOScoreResult } from './geoScoring';
import { classifyIndustry } from './industryClassifier';
import { logger } from '../lib/logger';
import type { PlaceDetails } from '../types';

export interface GEOScanResult extends GEOScoreResult {
  businessName: string;
  placeId: string;
  category: string;
  city: string;
  results: Array<{
    query: string;
    mentioned: boolean;
    rank: number | null;
    snippet: string | null;
  }>;
  scanDurationMs: number;
}

/**
 * Run full GEO scan for a business
 */
export async function runGEOScan(args: {
  place: PlaceDetails;
  queryCount?: number;
}): Promise<GEOScanResult> {
  const { place, queryCount = 8 } = args;
  const startTime = Date.now();

  const businessName = place.name || '';
  const address = place.formatted_address || '';
  const types = place.types || [];

  // Extract city from address
  const addressParts = address.split(',').map(p => p.trim());
  const city = addressParts.length >= 2 ? addressParts[addressParts.length - 3] || addressParts[0] : address;

  // Classify industry
  const category = classifyIndustry(types, businessName);
  const businessType = place.primaryTypeDisplayName?.text ||
    types[0]?.replace(/_/g, ' ') ||
    'business';

  logger.info('[GEO Engine] Starting scan', { businessName, city, category, businessType });

  // Generate queries
  const queries = await generateGEOQueries({
    businessName, businessType, city, category, count: queryCount,
  });

  logger.info('[GEO Engine] Generated queries', { count: queries.length });

  // Run ranking
  const rankingResults = await runGEORankingBatch({
    queries: queries.map(q => q.query),
    businessName,
    city,
  });

  // Calculate score
  const scoreResult = calculateGEOScore(rankingResults);

  const scanDurationMs = Date.now() - startTime;
  logger.info('[GEO Engine] Scan complete', {
    businessName, score: scoreResult.score, grade: scoreResult.grade,
    mentionRate: scoreResult.mentionRate, durationMs: scanDurationMs,
  });

  return {
    ...scoreResult,
    businessName,
    placeId: place.place_id,
    category,
    city,
    results: rankingResults.map(r => ({
      query: r.query,
      mentioned: r.mentioned,
      rank: r.rank,
      snippet: r.snippet,
    })),
    scanDurationMs,
  };
}
