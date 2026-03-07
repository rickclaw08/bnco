/**
 * ClawOps Scanner - MEO Explain API Handler
 * GET /api/meo/explain?placeId=xxx
 */

import { Request, Response } from 'express';
import { getPlaceDetailsForExplain } from '../lib/places';
import { calculateMEOScore } from '../meo/meoEngine';
import { buildMEOExplainData } from '../meo/meoExplain';
import { logger } from '../lib/logger';

export async function handleMEOExplain(req: Request, res: Response) {
  try {
    const placeId = req.query.placeId as string;
    if (!placeId) {
      return res.status(400).json({ error: 'Missing required query parameter: placeId' });
    }

    logger.info('[MEO Explain] Fetching details', { placeId });
    const place = await getPlaceDetailsForExplain(placeId);

    logger.info('[MEO Explain] Calculating MEO score', { businessName: place.name });
    const meoResult = await calculateMEOScore(
      place.name || '',
      place.formatted_address || '',
      place
    );

    const explainData = buildMEOExplainData({
      place,
      meo: meoResult.body,
    });

    return res.json(explainData);
  } catch (error: any) {
    logger.error('[MEO Explain] Error', { error: error.message });
    return res.status(500).json({ error: 'Failed to generate MEO explanation', message: error.message });
  }
}
