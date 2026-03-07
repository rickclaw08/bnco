/**
 * ClawOps Scanner - Places Autocomplete Proxy
 * GET /api/places/autocomplete?input=QUERY
 * Proxies Google Places Autocomplete to avoid exposing API keys in frontend
 */

import { Request, Response } from 'express';
import { logger } from '../lib/logger';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.PLACES_API_KEY;

export async function handlePlacesAutocomplete(req: Request, res: Response) {
  try {
    const input = (req.query.input as string || '').trim();

    if (!input || input.length < 2) {
      return res.json({ predictions: [] });
    }

    if (!GOOGLE_PLACES_API_KEY) {
      logger.error('[Autocomplete] Missing Google Places API key');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', input);
    url.searchParams.set('types', 'establishment');
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) {
      logger.error('[Autocomplete] Google API error', { status: response.status });
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = (await response.json()) as any;

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      logger.warn('[Autocomplete] Google API status', { status: data.status, error: data.error_message });
      return res.json({ predictions: [] });
    }

    const predictions = (data.predictions || []).slice(0, 5).map((p: any) => ({
      placeId: p.place_id,
      name: p.structured_formatting?.main_text || p.description?.split(',')[0] || '',
      address: p.structured_formatting?.secondary_text || p.description || '',
      description: p.description || '',
      types: p.types || [],
    }));

    return res.json({ predictions });
  } catch (error: any) {
    logger.error('[Autocomplete] Error', { error: error.message });
    return res.status(500).json({ error: 'Autocomplete failed' });
  }
}
