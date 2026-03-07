/**
 * ClawOps Scanner - Scan API Handler
 * POST /api/scan - Run full MEO + GEO scan
 */

import { Request, Response } from 'express';
import { findPlaceFromText, getPlaceDetails, placeDetailsToNAP } from '../lib/places';
import { calculateMEOScore } from '../meo/meoEngine';
import { runGEOScan } from '../geo/geoEngine';
import { logger } from '../lib/logger';

export async function handleScan(req: Request, res: Response) {
  const startTime = Date.now();

  try {
    const { query, placeId, websiteOverride } = req.body;

    if (!query && !placeId) {
      return res.status(400).json({
        error: 'Missing required field: provide either "query" (business name) or "placeId"',
      });
    }

    // Resolve place ID
    let resolvedPlaceId = placeId;
    if (!resolvedPlaceId && query) {
      logger.info('[Scan] Finding place from query', { query });
      resolvedPlaceId = await findPlaceFromText(query);
      if (!resolvedPlaceId) {
        return res.status(404).json({
          error: 'Business not found. Try a more specific name or provide a Google Place ID.',
        });
      }
    }

    logger.info('[Scan] Fetching place details', { placeId: resolvedPlaceId });
    const place = await getPlaceDetails(resolvedPlaceId);
    const nap = placeDetailsToNAP(place);

    // Run MEO scan
    logger.info('[Scan] Running MEO scoring', { businessName: place.name });
    const meoResult = await calculateMEOScore(
      place.name || query || '',
      place.formatted_address || '',
      place
    );

    // Run GEO scan
    logger.info('[Scan] Running GEO scan', { businessName: place.name });
    const geoResult = await runGEOScan({ place, queryCount: 6 });

    // Combined score (weighted: MEO 60%, GEO 40%)
    const meoScore = meoResult.body.meoScore;
    const geoScore = geoResult.score;
    const combinedScore = Math.round(meoScore * 0.6 + geoScore * 0.4);

    const totalMs = Date.now() - startTime;

    logger.info('[Scan] Complete', {
      businessName: place.name,
      meo: meoScore,
      geo: geoScore,
      combined: combinedScore,
      durationMs: totalMs,
    });

    return res.json({
      business: {
        name: nap.name,
        address: nap.address,
        phone: nap.phone,
        website: websiteOverride || nap.website || null,
        placeId: resolvedPlaceId,
        category: meoResult.body.category,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
      },
      scores: {
        meo: {
          score: meoScore,
          grade: meoResult.body.grade,
          confidence: meoResult.body.confidence,
          breakdown: meoResult.body.scoringBreakdown,
          why: meoResult.body.meoWhy,
          deficiencies: meoResult.body.deficiencies,
          bonuses: meoResult.body.bonuses,
          optimizationTips: meoResult.body.optimizationTips,
          growthPath: meoResult.body.growthPath,
          marketContext: meoResult.body.marketContext,
        },
        geo: {
          score: geoScore,
          grade: geoResult.grade,
          confidence: geoResult.confidence,
          mentionRate: geoResult.mentionRate,
          avgRank: geoResult.avgRank,
          queriesUsed: geoResult.queriesUsed,
          queriesFound: geoResult.queriesFound,
          insights: geoResult.insights,
          results: geoResult.results,
        },
        combined: {
          score: combinedScore,
          formula: '0.6 * MEO + 0.4 * GEO',
        },
      },
      timing: {
        totalMs,
        geoScanMs: geoResult.scanDurationMs,
      },
    });
  } catch (error: any) {
    logger.error('[Scan] Error', { error: error.message, stack: error.stack });
    return res.status(500).json({
      error: 'Scan failed',
      message: error.message,
    });
  }
}
