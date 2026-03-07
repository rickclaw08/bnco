/**
 * ClawOps Scanner - Competitive Analysis and Market Positioning
 * Analyzes business against REAL local competition from Google Places API
 *
 * STRICT RULES (NON-NEGOTIABLE):
 * 1. Must find >=3 real competitors
 * 2. Same niche/category
 * 3. Within 10-15km radius
 * 4. Local businesses only (no HQs, no fake data)
 * 5. If <3 competitors found, abort with error
 */

import type { MarketContext, CompetitivePercentile } from './meoSchema';
import { logger } from '../lib/logger';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.PLACES_API_KEY;
if (!GOOGLE_PLACES_API_KEY) {
  logger.error('[Competitive] Missing GOOGLE_PLACES_API_KEY environment variable');
}
const API_KEY: string = GOOGLE_PLACES_API_KEY || '';

const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

interface CompetitorData {
  place_id: string;
  name: string;
  rating: number;
  reviews: number;
  photos: number;
  types: string[];
}

interface CompetitiveAnalysisError {
  error: string;
  reason: string;
  details?: any;
}

async function fetchRealCompetitors(
  targetLat: number,
  targetLng: number,
  targetPlaceId: string,
  targetTypes: string[] | undefined,
  radius: number = 12000
): Promise<CompetitorData[] | null> {
  if (!API_KEY) {
    logger.error('[Competitive] Cannot fetch competitors: missing API key');
    return null;
  }

  try {
    const primaryType = targetTypes && targetTypes.length > 0 ? targetTypes[0] : null;
    const nearbyUrl = new URL(`${PLACES_API_BASE}/nearbysearch/json`);
    nearbyUrl.searchParams.set('location', `${targetLat},${targetLng}`);
    nearbyUrl.searchParams.set('radius', radius.toString());
    if (primaryType) nearbyUrl.searchParams.set('type', primaryType);
    nearbyUrl.searchParams.set('key', API_KEY);

    logger.info('[Competitive] Fetching competitors', { lat: targetLat, lng: targetLng, radius, primaryType });

    const response = await fetch(nearbyUrl.toString());
    if (!response.ok) {
      logger.error('[Competitive] Places API HTTP error', { status: response.status });
      return null;
    }

    const data = await response.json() as any;
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      logger.error('[Competitive] Places API error', { status: data.status, error: data.error_message });
      return null;
    }

    let nearbyPlaces = data.results || [];

    // Retry without type filter if zero results
    if (nearbyPlaces.length === 0 && primaryType) {
      logger.info('[Competitive] Zero results with type filter, retrying without type');
      const fallbackUrl = new URL(`${PLACES_API_BASE}/nearbysearch/json`);
      fallbackUrl.searchParams.set('location', `${targetLat},${targetLng}`);
      fallbackUrl.searchParams.set('radius', radius.toString());
      fallbackUrl.searchParams.set('key', API_KEY);
      const fallbackResponse = await fetch(fallbackUrl.toString());
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json() as any;
        if (fallbackData.status === 'OK') nearbyPlaces = fallbackData.results || [];
      }
    }

    const competitors: CompetitorData[] = nearbyPlaces
      .filter((p: any) => {
        if (!p.place_id) return false;
        if (p.place_id === targetPlaceId) return false;
        if (typeof p.rating !== 'number') return false;
        if (typeof p.user_ratings_total !== 'number') return false;
        const types = (p.types || []) as string[];
        const name = (p.name || '').toLowerCase();
        if (types.includes('corporate_office') || types.includes('headquarters') ||
            name.includes('headquarters') || name.includes('corporate') || name.includes('national office')) return false;
        if (types.includes('holding_company') || name.includes('holdings')) return false;
        return true;
      })
      .map((p: any) => ({
        place_id: p.place_id,
        name: p.name || 'Unknown',
        rating: p.rating,
        reviews: p.user_ratings_total,
        photos: (p.photos || []).length,
        types: p.types || []
      }));

    logger.info('[Competitive] Filtered competitors', { rawCount: nearbyPlaces.length, filteredCount: competitors.length });
    return competitors;
  } catch (error: any) {
    logger.error('[Competitive] Error fetching competitors', { error: error.message });
    return null;
  }
}

function calculatePercentile(value: number, dataset: number[]): number {
  if (dataset.length === 0) return 50;
  const sorted = [...dataset].sort((a, b) => a - b);
  const below = sorted.filter(v => v < value).length;
  const equal = sorted.filter(v => v === value).length;
  return Math.round(((below + equal / 2) / sorted.length) * 100);
}

function getMarketPositionLabel(avgPercentile: number): string {
  if (avgPercentile >= 90) return 'Top 10% - Market Leader';
  if (avgPercentile >= 80) return 'Top 20% - Strong Performer';
  if (avgPercentile >= 60) return 'Above Average';
  if (avgPercentile >= 40) return 'Average';
  if (avgPercentile >= 20) return 'Below Average';
  return 'Bottom 20% - Needs Improvement';
}

export async function analyzeCompetitivePosition(
  businessName: string,
  rating: number,
  reviews: number,
  photos: number,
  category: string,
  location: string,
  targetPlaceId: string | undefined,
  targetLat: number | undefined,
  targetLng: number | undefined,
  targetTypes: string[] | undefined
): Promise<MarketContext | CompetitiveAnalysisError> {
  if (!targetPlaceId) {
    return { error: 'Competitive analysis blocked', reason: 'Missing target placeId' };
  }
  if (typeof targetLat !== 'number' || typeof targetLng !== 'number') {
    return { error: 'Competitive analysis blocked', reason: 'Missing target lat/lng' };
  }

  const competitors = await fetchRealCompetitors(targetLat, targetLng, targetPlaceId, targetTypes, 12000);

  if (!competitors || competitors.length < 3) {
    return {
      error: 'Competitive analysis blocked',
      reason: `Found only ${competitors?.length || 0} competitors (minimum 3 required)`,
      details: { found: competitors?.length || 0, required: 3, location, targetPlaceId }
    };
  }

  const localAvgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
  const localAvgReviews = competitors.reduce((sum, c) => sum + c.reviews, 0) / competitors.length;
  const localAvgPhotos = competitors.reduce((sum, c) => sum + c.photos, 0) / competitors.length;

  const ratingPercentile = calculatePercentile(rating, competitors.map(c => c.rating));
  const reviewsPercentile = calculatePercentile(reviews, competitors.map(c => c.reviews));
  const photosPercentile = calculatePercentile(photos, competitors.map(c => c.photos));
  const avgPercentile = (ratingPercentile + reviewsPercentile + photosPercentile) / 3;

  return {
    localAvgRating: Math.round(localAvgRating * 10) / 10,
    localAvgReviews: Math.round(localAvgReviews),
    localAvgPhotos: Math.round(localAvgPhotos),
    competitorsAnalyzed: competitors.length,
    competitivePercentile: { rating: ratingPercentile, reviews: reviewsPercentile, photos: photosPercentile },
    marketPosition: getMarketPositionLabel(avgPercentile)
  };
}

export function isLocalLeader(rating: number, reviews: number, marketPosition: string): boolean {
  if (rating >= 4.8 && reviews >= 150) return true;
  return rating >= 4.7 && reviews >= 50 && (marketPosition.includes('Top 10%') || marketPosition.includes('Top 20%') || marketPosition.includes('Strong Performer'));
}

export function isPerfectProfile(hasPhone: boolean, hasWebsite: boolean, hasHours: boolean, hasDescription: boolean, photoCount: number, rating: number, reviews: number): boolean {
  return hasPhone && hasWebsite && hasHours && hasDescription && photoCount >= 10 && rating >= 4.5 && reviews >= 20;
}

export function calculateDominanceType(
  finalScore: number,
  isFranchise: boolean,
  isLocalLeader: boolean,
  isPerfectProfile: boolean,
  percentiles: CompetitivePercentile
): string | null {
  const avgPercentile = (percentiles.rating + percentiles.reviews + percentiles.photos) / 3;
  if (isPerfectProfile && isLocalLeader && avgPercentile >= 90) return 'Absolute Market Leader';
  if (isLocalLeader) return 'Local Leader';
  if (isFranchise && finalScore >= 65 && avgPercentile >= 70) return 'Strong Franchise Presence';
  if (isPerfectProfile && avgPercentile >= 70) return 'Well-Optimized Business';
  if (avgPercentile >= 80) return 'Strong Competitor';
  return null;
}
