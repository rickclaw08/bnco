/**
 * ClawOps Scanner - Nearby Competitors Module
 */

import { nearbySearchByType, getPlaceDetails, placeDetailsToNAP } from '../lib/places';
import { logger } from '../lib/logger';
import type { NearbyCompetitor } from './geoSchema';

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findNearbyCompetitors(args: {
  placeId: string;
  lat: number;
  lng: number;
  type: string;
  radius?: number;
  limit?: number;
}): Promise<NearbyCompetitor[]> {
  const { placeId, lat, lng, type, radius = 10000, limit = 10 } = args;

  logger.info('[NearbyCompetitors] Searching', { placeId, lat, lng, type, radius });

  const results = await nearbySearchByType({ lat, lng, radius, type });

  const competitors: NearbyCompetitor[] = [];
  for (const r of results) {
    if (r.place_id === placeId) continue;
    if (competitors.length >= limit) break;

    try {
      const details = await getPlaceDetails(r.place_id);
      const distance = details.geometry?.location
        ? haversineDistance(lat, lng, details.geometry.location.lat, details.geometry.location.lng)
        : 0;

      competitors.push({
        place_id: r.place_id,
        name: details.name || r.name || 'Unknown',
        rating: details.rating || 0,
        reviews: details.user_ratings_total || 0,
        distance_m: Math.round(distance),
        types: details.types || [],
      });
    } catch (err: any) {
      logger.warn('[NearbyCompetitors] Failed to get details', { placeId: r.place_id, error: err.message });
    }
  }

  return competitors.sort((a, b) => a.distance_m - b.distance_m);
}
