/**
 * ClawOps Scanner - Nearby Competitors API Handler
 * GET /api/nearby-competitors?placeId=xxx
 */

import { Request, Response } from 'express';
import { getPlaceDetails } from '../lib/places';
import { findNearbyCompetitors } from '../geo/competitors';
import { logger } from '../lib/logger';

export async function handleNearbyCompetitors(req: Request, res: Response) {
  try {
    const placeId = req.query.placeId as string;
    if (!placeId) {
      return res.status(400).json({ error: 'Missing required query parameter: placeId' });
    }

    const radius = parseInt(req.query.radius as string) || 10000;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);

    logger.info('[NearbyCompetitors] Fetching', { placeId, radius, limit });
    const place = await getPlaceDetails(placeId);

    const lat = place.geometry?.location?.lat;
    const lng = place.geometry?.location?.lng;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Place has no location data' });
    }

    const primaryType = place.types?.[0] || 'business';

    const competitors = await findNearbyCompetitors({
      placeId, lat, lng, type: primaryType, radius, limit,
    });

    return res.json({
      placeId,
      businessName: place.name,
      location: { lat, lng },
      competitors,
      count: competitors.length,
    });
  } catch (error: any) {
    logger.error('[NearbyCompetitors] Error', { error: error.message });
    return res.status(500).json({ error: 'Failed to find competitors', message: error.message });
  }
}
