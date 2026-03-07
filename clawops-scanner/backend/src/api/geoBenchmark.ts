/**
 * ClawOps Scanner - GEO Benchmark API Handler
 * GET /api/geo/benchmark?placeId=xxx
 * POST /api/geo/refresh - Force refresh GEO data
 */

import { Request, Response } from 'express';
import { getPlaceDetails } from '../lib/places';
import { runGEOScan } from '../geo/geoEngine';
import { findNearbyCompetitors } from '../geo/competitors';
import { logger } from '../lib/logger';
import { geoBenchmarkCache } from '../lib/cache';

export async function handleGEOBenchmark(req: Request, res: Response) {
  try {
    const placeId = req.query.placeId as string;
    if (!placeId) {
      return res.status(400).json({ error: 'Missing required query parameter: placeId' });
    }

    // Check cache
    const cacheKey = `geo_bench:${placeId}`;
    const cached = geoBenchmarkCache.get(cacheKey);
    if (cached) {
      logger.info('[GEO Benchmark] Cache hit', { placeId });
      return res.json(cached);
    }

    logger.info('[GEO Benchmark] Running benchmark', { placeId });
    const place = await getPlaceDetails(placeId);

    // Run GEO scan for target
    const targetScan = await runGEOScan({ place, queryCount: 8 });

    // Find nearby competitors and run their GEO scans
    const lat = place.geometry?.location?.lat;
    const lng = place.geometry?.location?.lng;
    const primaryType = place.types?.[0] || 'business';

    const competitorEntries: any[] = [];

    if (lat && lng) {
      const nearbyComps = await findNearbyCompetitors({
        placeId, lat, lng, type: primaryType, radius: 10000, limit: 3,
      });

      for (const comp of nearbyComps.slice(0, 3)) {
        try {
          const compPlace = await getPlaceDetails(comp.place_id);
          const compScan = await runGEOScan({ place: compPlace, queryCount: 6 });
          competitorEntries.push({
            placeId: comp.place_id,
            businessName: comp.name,
            geoScore: compScan.score,
            mentionRate: compScan.mentionRate,
            avgRank: compScan.avgRank,
            queriesUsed: compScan.queriesUsed,
            queriesFound: compScan.queriesFound,
          });
        } catch (err: any) {
          logger.warn('[GEO Benchmark] Competitor scan failed', { placeId: comp.place_id, error: err.message });
        }
      }
    }

    const allScores = [targetScan.score, ...competitorEntries.map(c => c.geoScore)];
    const industryAvg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const sorted = [...allScores].sort((a, b) => b - a);
    const targetRank = sorted.indexOf(targetScan.score) + 1;

    const result = {
      target: {
        placeId,
        businessName: place.name,
        geoScore: targetScan.score,
        mentionRate: targetScan.mentionRate,
        avgRank: targetScan.avgRank,
        queriesUsed: targetScan.queriesUsed,
        queriesFound: targetScan.queriesFound,
        results: targetScan.results,
      },
      competitors: competitorEntries,
      summary: {
        targetRank,
        totalCompared: competitorEntries.length + 1,
        topCompetitor: competitorEntries.length > 0
          ? competitorEntries.sort((a, b) => b.geoScore - a.geoScore)[0].businessName
          : null,
        industryAvgScore: Math.round(industryAvg),
      },
      generatedAt: new Date().toISOString(),
    };

    // Cache for 1 hour
    geoBenchmarkCache.set(cacheKey, result, 1000 * 60 * 60);

    return res.json(result);
  } catch (error: any) {
    logger.error('[GEO Benchmark] Error', { error: error.message });
    return res.status(500).json({ error: 'Benchmark failed', message: error.message });
  }
}

export async function handleGEORefresh(req: Request, res: Response) {
  try {
    const { placeId } = req.body;
    if (!placeId) {
      return res.status(400).json({ error: 'Missing required field: placeId' });
    }

    // Clear cache
    geoBenchmarkCache.delete(`geo_bench:${placeId}`);

    logger.info('[GEO Refresh] Running fresh scan', { placeId });
    const place = await getPlaceDetails(placeId);
    const geoResult = await runGEOScan({ place, queryCount: 8 });

    return res.json({
      placeId,
      businessName: place.name,
      score: geoResult.score,
      grade: geoResult.grade,
      mentionRate: geoResult.mentionRate,
      avgRank: geoResult.avgRank,
      insights: geoResult.insights,
      results: geoResult.results,
      refreshedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('[GEO Refresh] Error', { error: error.message });
    return res.status(500).json({ error: 'Refresh failed', message: error.message });
  }
}
