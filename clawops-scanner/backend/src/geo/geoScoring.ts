/**
 * ClawOps Scanner - GEO Scoring Engine
 * Calculates Generative Engine Optimization score
 */

import type { GEOQueryResult } from './geoSchema';
import { logger } from '../lib/logger';

export interface GEOScoreResult {
  score: number;
  grade: string;
  mentionRate: number;
  avgRank: number | null;
  queriesUsed: number;
  queriesFound: number;
  confidence: string;
  insights: string[];
}

const GRADE_THRESHOLDS: Record<string, number> = {
  'A+': 95, 'A': 90, 'A-': 85,
  'B+': 80, 'B': 75, 'B-': 70,
  'C+': 65, 'C': 60, 'C-': 55,
  'D+': 50, 'D': 45, 'D-': 40,
  'F': 0,
};

function calculateGrade(score: number): string {
  for (const [grade, threshold] of Object.entries(GRADE_THRESHOLDS)) {
    if (score >= threshold) return grade;
  }
  return 'F';
}

/**
 * Calculate GEO score from query results
 */
export function calculateGEOScore(results: GEOQueryResult[]): GEOScoreResult {
  if (results.length === 0) {
    return {
      score: 0, grade: 'F', mentionRate: 0, avgRank: null,
      queriesUsed: 0, queriesFound: 0, confidence: 'low',
      insights: ['No query results available'],
    };
  }

  const mentioned = results.filter(r => r.mentioned);
  const mentionRate = mentioned.length / results.length;
  const ranks = mentioned.filter(r => r.rank !== null).map(r => r.rank!);
  const avgRank = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : null;

  // Score components
  // 1. Mention rate (0-60 points)
  const mentionScore = mentionRate * 60;

  // 2. Rank quality (0-25 points)
  let rankScore = 0;
  if (avgRank !== null) {
    if (avgRank <= 1) rankScore = 25;
    else if (avgRank <= 3) rankScore = 20;
    else if (avgRank <= 5) rankScore = 15;
    else if (avgRank <= 10) rankScore = 10;
    else rankScore = 5;
  }

  // 3. Consistency bonus (0-15 points)
  const consistencyRatio = results.length >= 5 ? mentioned.length / results.length : 0;
  const consistencyScore = consistencyRatio * 15;

  const rawScore = mentionScore + rankScore + consistencyScore;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));
  const grade = calculateGrade(score);

  // Confidence based on sample size
  let confidence = 'low';
  if (results.length >= 8 && mentioned.length >= 3) confidence = 'high';
  else if (results.length >= 5 && mentioned.length >= 2) confidence = 'medium';

  // Generate insights
  const insights: string[] = [];
  if (mentionRate >= 0.7) {
    insights.push(`Strong AI visibility: mentioned in ${Math.round(mentionRate * 100)}% of queries`);
  } else if (mentionRate >= 0.3) {
    insights.push(`Moderate AI visibility: mentioned in ${Math.round(mentionRate * 100)}% of queries`);
  } else if (mentionRate > 0) {
    insights.push(`Low AI visibility: mentioned in only ${Math.round(mentionRate * 100)}% of queries`);
  } else {
    insights.push('Not currently visible to AI assistants for these query types');
  }

  if (avgRank !== null) {
    if (avgRank <= 3) {
      insights.push(`Strong ranking: average position #${avgRank.toFixed(1)} when mentioned`);
    } else {
      insights.push(`Ranking could improve: average position #${avgRank.toFixed(1)} when mentioned`);
    }
  }

  if (mentionRate < 0.5) {
    insights.push('Focus on building online authority: reviews, content, and structured data help AI visibility');
  }

  return {
    score, grade, mentionRate, avgRank,
    queriesUsed: results.length,
    queriesFound: mentioned.length,
    confidence, insights,
  };
}
