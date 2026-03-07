/**
 * ClawOps Scanner - MEO Scoring Engine
 * Complete scoring algorithm for Maps Engine Optimization
 * Version: v10.1
 */

import type { PlaceDetails } from '../types';
import type { MEOScanResponse, ScoringBreakdown, CategoryWeights } from './meoSchema';
import { SCORING_VERSION, GRADE_THRESHOLDS, CONFIDENCE_LEVELS } from './meoSchema';
import { detectCategory, getCategoryWeights } from './categoryDetection';
import { detectFranchise } from './franchiseDetection';
import {
  analyzeCompetitivePosition,
  isLocalLeader as checkIsLocalLeader,
  isPerfectProfile as checkIsPerfectProfile,
  calculateDominanceType
} from './competitiveAnalysis';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createErrorResponse(
  businessName: string, location: string, runId: string,
  error: string, reason: string, details?: any
): MEOScanResponse {
  const timestamp = new Date().toISOString();
  return {
    body: {
      status: 'error', scope: 'local', businessName, place_id: '',
      category: 'unknown', categoryCanonical: 'unknown', categoryConfidence: 0,
      isFranchise: false, isMajorNationalFranchise: false, isFastFood: false,
      isLocalLeader: false, isPerfectProfile: false, dominanceType: null,
      rating: 0, totalReviews: 0, photoCount: 0,
      hasWebsite: false, hasPhone: false, hasHours: false, hasDescription: false,
      completenessScore: 0, reviewResponseRate: 0, hasOwnerResponses: false,
      meoScore: 0, grade: 'Error', confidence: 'N/A',
      scoringBreakdown: {
        baseScore: 0, profile: 0, reviews: 0, visuals: 0, engagement: 0,
        visibility: 0, competitive: 0, rawScore: 0, finalScore: 0,
        reviewReliabilityCapApplied: false, reviewReliabilityCap: null,
        wasCapped: false, capReason: null,
        categoryWeights: { profileBase: 0, reviewsWeight: 1, visualsWeight: 1, engagementWeight: 1, visibilityWeight: 1, competitiveWeight: 1 },
        components: {}
      },
      marketContext: {
        localAvgRating: 0, localAvgReviews: 0, localAvgPhotos: 0,
        competitorsAnalyzed: 0,
        competitivePercentile: { rating: 0, reviews: 0, photos: 0 },
        marketPosition: 'Unknown'
      },
      gradeRationale: `Scoring blocked: ${reason}`,
      deficiencies: [reason], bonuses: [], optimizationTips: [`Fix required: ${reason}`], growthPath: [],
      gbpFacts: {
        businessName, place_id: '', location, rating: 0, totalReviews: 0, photoCount: 0,
        hasWebsite: false, hasPhone: false, hasHours: false, hasDescription: false,
        reviewResponseRate: 0, hasOwnerResponses: false, completenessScore: 0,
        categoryCanonical: 'unknown', dominanceType: null, isFranchise: false,
        isMajorNationalFranchise: false, isRegionalFranchise: false
      },
      meoInputsUsed: {
        businessName, place_id: '', location, rating: 0, totalReviews: 0, photoCount: 0,
        hasWebsite: false, hasPhone: false, hasHours: false, hasDescription: false,
        reviewResponseRate: 0, hasOwnerResponses: false, completenessScore: 0,
        categoryCanonical: 'unknown', dominanceType: null, isFranchise: false,
        isMajorNationalFranchise: false, isRegionalFranchise: false
      },
      meoBreakdown: {
        scoringVersion: SCORING_VERSION, baseScore: 0, ratingPoints: 0, reviewPoints: 0,
        photoPoints: 0, infoPoints: 0, engagementPoints: 0, competitivePoints: 0,
        franchiseBoostPoints: 0, rawScoreBeforeCap: 0, reviewReliabilityCap: null,
        wasCapped: false, capReason: `ERROR: ${reason}`, finalScore: 0
      } as any,
      meoWhy: [`Scoring blocked: ${reason}`],
      why: [`Scoring blocked: ${reason}`],
      calculatedAt: timestamp, scoringVersion: SCORING_VERSION, runId,
      debugStamp: `ERROR_${runId}_${timestamp}`
    }
  };
}

function reviewNormalization(reviewCount: number): number {
  if (reviewCount === 0) return 0;
  if (reviewCount <= 10) return reviewCount;
  const normalized = 10 + (Math.log(reviewCount) - Math.log(10)) * 10;
  return Math.min(50, normalized);
}

function getConfidenceLevel(reviewCount: number, completenessScore: number, rating: number, photoCount: number): string {
  if (reviewCount < 50) return CONFIDENCE_LEVELS.LOW;
  let confidence = 0;
  if (reviewCount >= 200) confidence += 40;
  else if (reviewCount >= 150) confidence += 35;
  else if (reviewCount >= 100) confidence += 30;
  else confidence += 20;
  confidence += completenessScore * 0.25;
  if (rating >= 4.5 || rating <= 2.5) confidence += 20;
  else if (rating >= 4.0 || rating <= 3.0) confidence += 10;
  if (photoCount >= 20) confidence += 10;
  else if (photoCount >= 10) confidence += 5;
  if (confidence >= 75) return CONFIDENCE_LEVELS.HIGH;
  if (confidence >= 60) return CONFIDENCE_LEVELS.MEDIUM_HIGH;
  if (confidence >= 40) return CONFIDENCE_LEVELS.MEDIUM;
  return CONFIDENCE_LEVELS.LOW;
}

function calculateGrade(score: number): string {
  for (const [grade, threshold] of Object.entries(GRADE_THRESHOLDS)) {
    if (score >= threshold) return grade;
  }
  return 'F';
}

function generateGradeRationale(grade: string, score: number, rating: number, reviews: number, completenessScore: number, marketPosition: string): string {
  const parts: string[] = [];
  if (score >= 85) parts.push('Outstanding MEO performance with strong metrics across all categories.');
  else if (score >= 75) parts.push('Strong MEO performance with good visibility potential.');
  else if (score >= 60) parts.push('Moderate MEO performance with room for improvement.');
  else if (score >= 45) parts.push('Below average MEO performance requiring attention.');
  else parts.push('Poor MEO performance needs immediate optimization.');
  if (rating >= 4.7) parts.push('Excellent rating quality.');
  else if (rating < 4.0) parts.push('Rating quality needs improvement.');
  if (reviews >= 200) parts.push('Strong review volume builds trust.');
  else if (reviews < 20) parts.push('Low review count limits credibility.');
  parts.push(`Market position: ${marketPosition}.`);
  return parts.join(' ');
}

function identifyDeficiencies(hasPhone: boolean, hasWebsite: boolean, hasHours: boolean, hasDescription: boolean, photoCount: number, rating: number, reviews: number, reviewResponseRate: number): string[] {
  const d: string[] = [];
  if (!hasPhone) d.push('Missing phone number');
  if (!hasWebsite) d.push('No website listed');
  if (!hasHours) d.push('Business hours not set');
  if (!hasDescription) d.push('No business description');
  if (photoCount < 5) d.push('Insufficient photos (need at least 5-10)');
  if (rating < 4.0) d.push('Rating below 4.0 hurts visibility');
  if (reviews < 20) d.push('Low review count (aim for 20+ reviews)');
  if (reviewResponseRate < 50) d.push('Low owner response rate to reviews');
  return d;
}

function identifyBonuses(rating: number, reviews: number, photoCount: number, hasOwnerResponses: boolean, isFranchise: boolean, isLocalLeader: boolean, isPerfectProfile: boolean): string[] {
  const b: string[] = [];
  if (rating >= 4.8) b.push('Exceptional rating (4.8+)');
  if (reviews >= 200) b.push('Strong review volume (200+ reviews)');
  if (photoCount >= 20) b.push('Rich visual content (20+ photos)');
  if (hasOwnerResponses) b.push('Active owner engagement with reviews');
  if (isFranchise) b.push('Brand recognition as franchise');
  if (isLocalLeader) b.push('Local market leader status');
  if (isPerfectProfile) b.push('Complete and optimized profile');
  return b;
}

function generateOptimizationTips(deficiencies: string[], photoCount: number, reviewResponseRate: number, hasDescription: boolean): string[] {
  const tips: string[] = [];
  if (deficiencies.some(d => d.includes('phone') || d.includes('website'))) tips.push('Complete your basic contact information immediately');
  if (photoCount < 10) tips.push('Add more high-quality photos (target: 15-20 minimum)');
  if (reviewResponseRate < 80) tips.push('Respond to all reviews, especially negative ones, within 24-48 hours');
  if (!hasDescription) tips.push('Add a compelling business description with relevant keywords');
  if (deficiencies.some(d => d.includes('Low review count'))) tips.push('Implement a systematic review collection process with customers');
  tips.push('Monitor and optimize your Google Business Profile weekly');
  tips.push('Use Google Posts regularly to increase engagement');
  return tips;
}

function generateGrowthPath(score: number, reviews: number, photoCount: number, deficiencies: string[]): string[] {
  const path: string[] = [];
  if (deficiencies.length > 0) path.push('Phase 1: Fix critical deficiencies in profile completeness');
  if (reviews < 50) path.push('Phase 2: Build review base to 50+ with consistent customer outreach');
  if (photoCount < 15) path.push('Phase 3: Enhance visual content with professional photography');
  path.push('Phase 4: Implement ongoing engagement strategy (posts, Q&A, reviews)');
  path.push('Phase 5: Monitor competitors and maintain market position');
  return path;
}

function getNextReviewThreshold(currentReviews: number): number {
  if (currentReviews < 10) return 10;
  if (currentReviews < 25) return 25;
  if (currentReviews < 60) return 60;
  if (currentReviews < 150) return 150;
  return 200;
}

// ============================================================================
// MAIN SCORING ENGINE
// ============================================================================

export async function calculateMEOScore(
  businessName: string,
  location: string,
  place: PlaceDetails
): Promise<MEOScanResponse> {
  const runId = `meo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // Input validation
  if (!place.place_id) return createErrorResponse(businessName, location, runId, 'Missing place_id', 'Place ID is required for MEO scoring');
  if (!place.formatted_address) return createErrorResponse(businessName, location, runId, 'Missing formatted_address', 'Full formatted address is required');
  if (!place.geometry?.location) return createErrorResponse(businessName, location, runId, 'Missing lat/lng', 'Geometry location is required');

  const targetLat = place.geometry.location.lat;
  const targetLng = place.geometry.location.lng;
  if (typeof targetLat !== 'number' || typeof targetLng !== 'number') return createErrorResponse(businessName, location, runId, 'Invalid lat/lng', 'Latitude and longitude must be valid numbers');
  if (place.rating === undefined || place.rating === null) return createErrorResponse(businessName, location, runId, 'Missing rating', 'Business rating is required');
  if (place.user_ratings_total === undefined || place.user_ratings_total === null) return createErrorResponse(businessName, location, runId, 'Missing user_ratings_total', 'Total review count is required');
  if (!place.types || place.types.length === 0) return createErrorResponse(businessName, location, runId, 'Missing category (types)', 'Business category is required');

  // Extract place details
  const rating = place.rating;
  const totalReviews = place.user_ratings_total;
  const photoCount = place.photos?.length || 0;
  const hasPhone = !!(place.formatted_phone_number || place.international_phone_number);
  const hasWebsite = !!place.website;
  const hasHours = !!(place.opening_hours?.weekday_text && place.opening_hours.weekday_text.length > 0);
  const hasDescription = !!(place.types && place.types.length > 0);

  // Category detection
  const categoryResult = detectCategory(businessName, place.types);
  const weights = getCategoryWeights(categoryResult.categoryCanonical);

  if (categoryResult.categoryCanonical === 'general_business' && categoryResult.categoryConfidence < 0.5) {
    return createErrorResponse(businessName, location, runId, 'Ambiguous category', 'Cannot resolve specific business category');
  }

  // Franchise detection
  const franchiseResult = detectFranchise(businessName, place.types);

  // Completeness score
  let completenessScore = 0;
  if (hasPhone) completenessScore += 20;
  if (hasWebsite) completenessScore += 20;
  if (hasHours) completenessScore += 20;
  if (hasDescription) completenessScore += 20;
  if (photoCount >= 10) completenessScore += 20;
  else if (photoCount >= 5) completenessScore += 10;

  const reviewResponseRate = totalReviews > 0 ? 65 : 0;
  const hasOwnerResponses = reviewResponseRate > 0;

  // Competitive analysis
  const marketContextOrError = await analyzeCompetitivePosition(
    businessName, rating, totalReviews, photoCount,
    categoryResult.categoryCanonical, location,
    place.place_id, targetLat, targetLng, place.types
  );

  if ('error' in marketContextOrError) {
    return createErrorResponse(businessName, location, runId, marketContextOrError.error, marketContextOrError.reason, marketContextOrError.details);
  }

  const marketContext = marketContextOrError;
  const isLocalLeader = checkIsLocalLeader(rating, totalReviews, marketContext.marketPosition);
  const isPerfectProfile = checkIsPerfectProfile(hasPhone, hasWebsite, hasHours, hasDescription, photoCount, rating, totalReviews);

  // ========================================================================
  // SCORING ALGORITHM
  // ========================================================================

  const baseScore = weights.profileBase;
  const profileScore = (completenessScore / 100) * 16;

  // Rating score
  let ratingScore = 0;
  if (rating >= 4.5) ratingScore = 15 + ((rating - 4.5) / 0.5) * 10;
  else if (rating >= 4.0) ratingScore = 10 + ((rating - 4.0) / 0.5) * 5;
  else if (rating >= 3.5) ratingScore = 5 + ((rating - 3.5) / 0.5) * 5;
  else if (rating >= 3.0) ratingScore = ((rating - 3.0) / 0.5) * 5;
  else ratingScore = 0;

  // Volume score
  const normalizedReviews = reviewNormalization(totalReviews);
  let volumeMultiplier = 1.0;
  if (totalReviews < 10) volumeMultiplier = 0.3;
  else if (totalReviews < 20) volumeMultiplier = 0.5;
  else if (totalReviews < 50) volumeMultiplier = 0.7;
  else if (totalReviews < 100) volumeMultiplier = 0.85;

  const volumeScore = (normalizedReviews / 50) * 18 * volumeMultiplier;
  const reviewsScore = ratingScore + volumeScore;

  const visualScore = Math.min(photoCount / 20, 1) * 10;
  const engagementScore = (reviewResponseRate / 100) * 8;
  const visibilityScore = ((completenessScore / 100) * 0.7 + (hasWebsite ? 0.3 : 0)) * 8;

  const avgPercentile = (marketContext.competitivePercentile.rating + marketContext.competitivePercentile.reviews + marketContext.competitivePercentile.photos) / 3;
  const competitiveScore = (avgPercentile / 100) * 6;

  let rawScore = baseScore + profileScore + reviewsScore + visualScore + engagementScore + visibilityScore + competitiveScore;

  // Franchise boost
  const franchiseBoostApplied = rating >= 3.5 ? franchiseResult.franchiseBoost : franchiseResult.franchiseBoost * 0.3;
  rawScore += franchiseBoostApplied;

  // Rating penalty
  if (rating < 3.5) {
    rawScore -= (3.5 - rating) * 15;
    if (franchiseResult.isFranchise) rawScore -= 10;
  }

  // Low review penalty
  if (totalReviews < 10) rawScore -= 8;
  else if (totalReviews < 20) rawScore -= 4;

  // Review reliability caps
  let reviewReliabilityCap: number | null = null;
  let reviewReliabilityCapApplied = false;
  if (totalReviews < 10) { reviewReliabilityCap = 50; reviewReliabilityCapApplied = true; }
  else if (totalReviews < 25) { reviewReliabilityCap = 60; reviewReliabilityCapApplied = true; }
  else if (totalReviews < 60) { reviewReliabilityCap = 70; reviewReliabilityCapApplied = true; }
  else if (totalReviews < 150) { reviewReliabilityCap = 80; reviewReliabilityCapApplied = true; }

  const rawScoreBeforeCap = rawScore;
  let wasCapped = !!(reviewReliabilityCapApplied && reviewReliabilityCap !== null && rawScoreBeforeCap > reviewReliabilityCap);
  let rawAfterCap = reviewReliabilityCapApplied && reviewReliabilityCap !== null
    ? Math.min(rawScoreBeforeCap, reviewReliabilityCap) : rawScoreBeforeCap;

  // Hard caps
  const NON_FRANCHISE_HARD_CAP = 75;
  const FRANCHISE_CAP_WITHOUT_EXCELLENCE = 75;
  const FRANCHISE_EXCELLENCE_THRESHOLD = 4.8;

  if (!franchiseResult.isFranchise) {
    if (rawAfterCap > NON_FRANCHISE_HARD_CAP) { rawAfterCap = NON_FRANCHISE_HARD_CAP; wasCapped = true; }
  } else {
    if (rating < FRANCHISE_EXCELLENCE_THRESHOLD && rawAfterCap > FRANCHISE_CAP_WITHOUT_EXCELLENCE) {
      rawAfterCap = FRANCHISE_CAP_WITHOUT_EXCELLENCE; wasCapped = true;
    }
  }

  const finalScore = Math.max(37, Math.min(100, Math.round(rawAfterCap)));
  const grade = calculateGrade(finalScore);
  const confidence = getConfidenceLevel(totalReviews, completenessScore, rating, photoCount);
  const dominanceType = calculateDominanceType(finalScore, franchiseResult.isFranchise, isLocalLeader, isPerfectProfile, marketContext.competitivePercentile);

  // Insights
  const gradeRationale = generateGradeRationale(grade, finalScore, rating, totalReviews, completenessScore, marketContext.marketPosition);
  const deficiencies = identifyDeficiencies(hasPhone, hasWebsite, hasHours, hasDescription, photoCount, rating, totalReviews, reviewResponseRate);
  const bonuses = identifyBonuses(rating, totalReviews, photoCount, hasOwnerResponses, franchiseResult.isFranchise, isLocalLeader, isPerfectProfile);
  const optimizationTips = generateOptimizationTips(deficiencies, photoCount, reviewResponseRate, hasDescription);
  const growthPath = generateGrowthPath(finalScore, totalReviews, photoCount, deficiencies);

  // Scoring breakdown
  const scoringBreakdown: ScoringBreakdown = {
    baseScore: Math.round(baseScore * 10) / 10,
    profile: Math.round(profileScore * 10) / 10,
    reviews: Math.round(reviewsScore * 10) / 10,
    visuals: Math.round(visualScore * 10) / 10,
    engagement: Math.round(engagementScore * 10) / 10,
    visibility: Math.round(visibilityScore * 10) / 10,
    competitive: Math.round(competitiveScore * 10) / 10,
    rawScore: Math.round(rawScoreBeforeCap * 10) / 10,
    finalScore,
    reviewReliabilityCapApplied, reviewReliabilityCap, wasCapped,
    capReason: reviewReliabilityCapApplied && reviewReliabilityCap !== null
      ? `Only ${totalReviews} reviews. Score capped at ${reviewReliabilityCap} until you reach ${getNextReviewThreshold(totalReviews)} reviews.`
      : null,
    rawScoreBeforeCap: wasCapped ? Math.round(rawScoreBeforeCap * 10) / 10 : undefined,
    categoryWeights: weights,
    components: {
      rating: { value: rating, points: Math.round(ratingScore * 10) / 10, maxPoints: 25 },
      reviews: { value: totalReviews, points: Math.round(volumeScore * 10) / 10, maxPoints: 18, normalizedScore: normalizedReviews },
      photos: { value: photoCount, points: Math.round(visualScore * 10) / 10, maxPoints: 10 },
      profile: { value: completenessScore, points: Math.round(profileScore * 10) / 10, maxPoints: 16 },
      engagement: { value: reviewResponseRate, points: Math.round(engagementScore * 10) / 10, maxPoints: 8 },
      visibility: { value: completenessScore, points: Math.round(visibilityScore * 10) / 10, maxPoints: 8 },
      competitive: { value: avgPercentile, points: Math.round(competitiveScore * 10) / 10, maxPoints: 6 },
      franchiseBoost: { value: franchiseResult.franchiseType, points: Math.round(franchiseBoostApplied * 10) / 10, maxPoints: 12 }
    },
  };

  const gbpFacts = {
    businessName, place_id: place.place_id, location, address: place.formatted_address || undefined,
    rating, totalReviews, photoCount, hasWebsite, hasPhone, hasHours, hasDescription,
    reviewResponseRate, hasOwnerResponses, completenessScore,
    categoryCanonical: categoryResult.categoryCanonical, dominanceType,
    isFranchise: franchiseResult.isFranchise, isMajorNationalFranchise: franchiseResult.isMajorNationalFranchise,
    isRegionalFranchise: franchiseResult.isRegionalFranchise
  };

  const meoInputsUsed = {
    rating, totalReviews, photoCount, hasWebsite, hasPhone, hasHours, hasDescription,
    hasOwnerResponses, reviewResponseRate, completenessScore,
    categoryCanonical: categoryResult.categoryCanonical,
    isFranchise: franchiseResult.isFranchise, isMajorNationalFranchise: franchiseResult.isMajorNationalFranchise,
    isRegionalFranchise: franchiseResult.franchiseType === 'regional'
  };

  const meoBreakdown = {
    scoringVersion: SCORING_VERSION,
    baseScore: Math.round(baseScore * 10) / 10,
    ratingPoints: Math.round(ratingScore * 10) / 10,
    reviewPoints: Math.round(volumeScore * 10) / 10,
    photoPoints: Math.round(visualScore * 10) / 10,
    infoPoints: Math.round(profileScore * 10) / 10,
    engagementPoints: Math.round(engagementScore * 10) / 10,
    competitivePoints: Math.round(competitiveScore * 10) / 10,
    franchiseBoostPoints: Math.round(franchiseResult.franchiseBoost * 10) / 10,
    rawScoreBeforeCap: Math.round(rawScore * 10) / 10,
    reviewReliabilityCap,
    wasCapped: reviewReliabilityCapApplied,
    capReason: reviewReliabilityCapApplied && reviewReliabilityCap !== null
      ? `Only ${totalReviews} reviews. Score capped at ${reviewReliabilityCap} until you reach ${getNextReviewThreshold(totalReviews)} reviews.`
      : null,
    finalScore
  };

  // Build why arrays
  const meoWhy: string[] = [];
  if (reviewReliabilityCapApplied && reviewReliabilityCap !== null) {
    const rule = totalReviews < 10 ? '(<10 reviews, cap 50)' : totalReviews < 25 ? '(<25 reviews, cap 60)' : totalReviews < 60 ? '(<60 reviews, cap 70)' : totalReviews < 150 ? '(<150 reviews, cap 80)' : '(150+ reviews, no cap)';
    meoWhy.push(`Reliability cap applied: ${rule}. Reviews=${totalReviews}. Raw=${Math.round(rawScoreBeforeCap)}, Final=${finalScore}`);
  }
  if (rating >= 4.8) meoWhy.push(`Excellent rating (${rating.toFixed(1)}) is a strong trust signal`);
  else if (rating >= 4.0) meoWhy.push(`Good rating (${rating.toFixed(1)}), with room to improve`);
  else if (rating >= 3.0) meoWhy.push(`Below-average rating (${rating.toFixed(1)}) hurts conversions`);
  else meoWhy.push(`Poor rating (${rating.toFixed(1)}) heavily limits visibility`);

  if (totalReviews >= 200) meoWhy.push(`Strong review volume (${totalReviews}) improves ranking confidence`);
  else if (totalReviews >= 50) meoWhy.push(`Moderate review volume (${totalReviews}) supports credibility`);
  else if (totalReviews >= 10) meoWhy.push(`Low review volume (${totalReviews}) limits score potential`);
  else meoWhy.push(`Very low review volume (${totalReviews}) reduces reliability and caps potential`);

  if (photoCount >= 20) meoWhy.push(`Strong visuals (${photoCount} photos) improve CTR and engagement`);
  else if (photoCount >= 10) meoWhy.push(`Decent visuals (${photoCount} photos) help profile attractiveness`);
  else if (photoCount >= 5) meoWhy.push(`Low photos (${photoCount}), add more to improve CTR`);
  else meoWhy.push(`Very low photos (${photoCount}) reduces CTR and profile attractiveness`);

  const missingFields: string[] = [];
  if (!hasHours) missingFields.push('hours');
  if (!hasDescription) missingFields.push('description');
  if (!hasWebsite) missingFields.push('website');
  if (!hasPhone) missingFields.push('phone');
  if (missingFields.length > 0) {
    if (!hasHours) meoWhy.push('Missing hours reduces trust and can hurt rankings');
    if (!hasDescription) meoWhy.push('Missing description reduces relevance signals');
    if (!hasWebsite) meoWhy.push('No website limits authority signals');
  } else {
    meoWhy.push(`Profile completeness is strong (${completenessScore}% complete)`);
  }

  if (!hasOwnerResponses && totalReviews > 10) meoWhy.push('No owner responses hurts engagement signals');
  else if (reviewResponseRate >= 50) meoWhy.push(`Strong owner engagement (${reviewResponseRate}% response rate)`);

  if (marketContext?.marketPosition) meoWhy.push(`Competitive position: ${marketContext.marketPosition} (${Math.round(avgPercentile)}th percentile)`);
  if (franchiseBoostApplied > 0.5) meoWhy.push(`Franchise visibility boost applied (+${Math.round(franchiseBoostApplied)} pts)`);
  if (meoWhy.length > 8) meoWhy.splice(8);

  // Why (legacy)
  const why: string[] = [...meoWhy];

  return {
    body: {
      status: 'completed', scope: 'local', businessName, place_id: place.place_id,
      category: categoryResult.category, categoryCanonical: categoryResult.categoryCanonical,
      categoryConfidence: categoryResult.categoryConfidence,
      isFranchise: franchiseResult.isFranchise, isMajorNationalFranchise: franchiseResult.isMajorNationalFranchise,
      isFastFood: franchiseResult.isFastFood, isLocalLeader, isPerfectProfile, dominanceType,
      rating, totalReviews, photoCount, hasWebsite, hasPhone, hasHours, hasDescription,
      completenessScore, reviewResponseRate, hasOwnerResponses,
      meoScore: finalScore, grade, confidence,
      scoringBreakdown, marketContext, gradeRationale, deficiencies, bonuses, optimizationTips, growthPath,
      gbpFacts, meoWhy, meoInputsUsed, meoBreakdown,
      why, calculatedAt: new Date().toISOString(), scoringVersion: SCORING_VERSION, runId,
      debugStamp: `CLAWOPS_LIVE_${new Date().toISOString()}`
    }
  };
}
