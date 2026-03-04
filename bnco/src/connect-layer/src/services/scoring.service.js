// bnco Scoring Engine v2
// Integrates both:
// 1. bnco Score (Control + Stillness + Respiratory) - Pilates-specific
// 2. BTL Vibe Score (Power + Flow + Grit + Zen) - from SKILL.md
// 3. RES (Relative Effort Score) - from scoring_math.md

const BNCO_WEIGHTS = {
  control: 0.40,
  stillness: 0.35,
  respiratory: 0.25,
};

const VIBE_WEIGHTS = { power: 0.30, flow: 0.25, grit: 0.25, zen: 0.20 };

const RES_WEIGHTS = { strain: 0.35, hr: 0.25, steps: 0.20, recovery: 0.20 };

const HR_ZONE_CEILINGS = [0.50, 0.60, 0.70, 0.80, 0.90, 1.00];

const HRV_PERCENTILES = {
  '18-29': { p25: 30, p50: 55, p75: 80, p95: 120 },
  '30-39': { p25: 25, p50: 45, p75: 70, p95: 105 },
  '40-49': { p25: 20, p50: 38, p75: 60, p95: 90 },
  '50-59': { p25: 15, p50: 30, p75: 50, p95: 75 },
  '60+':   { p25: 12, p50: 25, p75: 42, p95: 65 },
};

const RECOVERY_CEILINGS = {
  '18-29': 100, '30-39': 98, '40-49': 95, '50-59': 90, '60+': 85,
};

function clamp(val, min = 0, max = 100) {
  return Math.min(Math.max(val, min), max);
}

function ageBand(age) {
  if (age < 30) return '18-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  return '60+';
}

function estimateMaxHR(age) {
  return 207 - 0.7 * age;
}

// ============================================================
// bnco Score (Pilates-specific: Control + Stillness + Respiratory)
// ============================================================

function calculateControlScore(muscularLoad, durationMinutes) {
  if (!muscularLoad || !durationMinutes || durationMinutes <= 0) return null;
  const loadPerMinute = muscularLoad / durationMinutes;
  const idealRange = { min: 5, max: 15 };

  if (loadPerMinute >= idealRange.min && loadPerMinute <= idealRange.max) {
    const center = (idealRange.min + idealRange.max) / 2;
    const deviation = Math.abs(loadPerMinute - center) / (center - idealRange.min);
    return Math.round(85 + (1 - deviation) * 15);
  } else if (loadPerMinute < idealRange.min) {
    return Math.round((loadPerMinute / idealRange.min) * 85);
  } else {
    const excess = loadPerMinute - idealRange.max;
    return Math.max(20, Math.round(85 - excess * 5));
  }
}

function calculateStillnessScore(stabilityVariance) {
  if (stabilityVariance === null || stabilityVariance === undefined) return null;
  const clamped = Math.max(0, Math.min(1, stabilityVariance));
  const inverted = 1 - clamped;
  const curved = Math.pow(inverted, 0.8);
  return Math.round(curved * 100);
}

function calculateRespiratoryScore(respiratoryRate) {
  if (!respiratoryRate || respiratoryRate <= 0) return null;
  const idealMin = 8;
  const idealMax = 14;
  const idealCenter = 11;

  if (respiratoryRate >= idealMin && respiratoryRate <= idealMax) {
    const deviation = Math.abs(respiratoryRate - idealCenter) / (idealCenter - idealMin);
    return Math.round(90 + (1 - deviation) * 10);
  } else if (respiratoryRate < idealMin) {
    return Math.max(10, Math.round((respiratoryRate / idealMin) * 70));
  } else {
    const excess = respiratoryRate - idealMax;
    return Math.max(20, Math.round(90 - excess * 8));
  }
}

/**
 * Calculate composite bnco Score from sub-scores.
 * Handles null sub-scores gracefully by redistributing weights proportionally
 * among available scores. This is critical for WHOOP-only data where stillness
 * is null (no Apple Watch stability data) - control and respiratory weights
 * are scaled up proportionally to sum to 1.0.
 *
 * Example: stillness=null -> control gets 0.40/0.65 (~0.615), respiratory gets 0.25/0.65 (~0.385)
 */
function calculateBncoScore(controlScore, stillnessScore, respiratoryScore) {
  const scores = [];
  let totalWeight = 0;

  if (controlScore !== null && controlScore !== undefined) {
    scores.push({ score: controlScore, weight: BNCO_WEIGHTS.control });
    totalWeight += BNCO_WEIGHTS.control;
  }
  if (stillnessScore !== null && stillnessScore !== undefined) {
    scores.push({ score: stillnessScore, weight: BNCO_WEIGHTS.stillness });
    totalWeight += BNCO_WEIGHTS.stillness;
  }
  if (respiratoryScore !== null && respiratoryScore !== undefined) {
    scores.push({ score: respiratoryScore, weight: BNCO_WEIGHTS.respiratory });
    totalWeight += BNCO_WEIGHTS.respiratory;
  }

  if (scores.length === 0 || totalWeight === 0) return null;

  // Redistribute weights proportionally among available scores
  const weighted = scores.reduce((sum, { score, weight }) => {
    return sum + score * (weight / totalWeight);
  }, 0);

  return Math.round(clamp(weighted, 0, 100));
}

// ============================================================
// BTL Vibe Score (Power + Flow + Grit + Zen)
// ============================================================

function calcPower(muscularStrain, activeCal, avgHR, age) {
  const maxHR = estimateMaxHR(age || 30);
  const zone2Ceiling = maxHR * HR_ZONE_CEILINGS[2];
  let score;

  if (muscularStrain != null && activeCal != null) {
    const strainNorm = clamp((muscularStrain / 21) * 100);
    const calNorm = clamp(Math.min(activeCal / 600, 1) * 100);
    score = strainNorm * 0.70 + calNorm * 0.30;
  } else if (muscularStrain != null) {
    score = clamp((muscularStrain / 21) * 100);
  } else if (activeCal != null) {
    score = clamp(Math.min(activeCal / 600, 1) * 100);
  } else {
    return null;
  }

  // Precision Power bonus
  if (muscularStrain != null && muscularStrain > 12 && avgHR != null && avgHR < zone2Ceiling) {
    score += 8;
  }

  return clamp(Math.round(score * 100) / 100);
}

function calcFlow(hrZones, respiratoryRate, classDurationMin) {
  if (!hrZones) return null;
  const z1 = hrZones.zone1Min || 0;
  const z2 = hrZones.zone2Min || 0;
  const z4 = hrZones.zone4Min || 0;
  const totalZoneMin = (hrZones.zone0Min || 0) + z1 + z2 + (hrZones.zone3Min || 0) + z4;
  const effectiveDuration = classDurationMin || totalZoneMin || 1;

  let score = clamp(((z1 + z2) / effectiveDuration) * 100);

  if (respiratoryRate != null) {
    if (respiratoryRate >= 12 && respiratoryRate <= 18) {
      score += 10;
    } else {
      const deviation = respiratoryRate < 12 ? 12 - respiratoryRate : respiratoryRate - 18;
      score += clamp(10 - deviation * 2, 0, 10);
    }
  }

  const zone4Pct = z4 / effectiveDuration;
  if (zone4Pct > 0.10) {
    const penaltyMultiplier = clamp(1 - (zone4Pct - 0.10), 0.5, 1.0);
    score *= penaltyMultiplier;
  }

  return clamp(Math.round(score * 100) / 100);
}

function calcGrit(durationMin, totalStrain, isStudioSession) {
  if (!isStudioSession) return 0;
  if (durationMin == null) return null;

  const durationScore = clamp((durationMin / 60) * 50, 0, 50);

  if (totalStrain != null) {
    const strainScore = clamp((totalStrain / 21) * 50, 0, 50);
    return clamp(Math.round((durationScore + strainScore) * 100) / 100);
  }

  return clamp((durationMin / 60) * 100);
}

function calcZen(hrv, recoveryPct, age) {
  if (hrv == null && recoveryPct == null) return null;

  const band = ageBand(age || 30);
  const pctls = HRV_PERCENTILES[band];

  if (hrv != null && recoveryPct != null) {
    const hrvNorm = clamp(percentileScore(hrv, pctls));
    const recNorm = clamp(recoveryPct);
    return clamp(Math.round((hrvNorm * 0.60 + recNorm * 0.40) * 100) / 100);
  } else if (hrv != null) {
    return clamp(percentileScore(hrv, pctls));
  } else {
    return clamp(recoveryPct);
  }
}

function percentileScore(hrv, pctls) {
  if (hrv <= pctls.p25) return (hrv / pctls.p25) * 25;
  if (hrv <= pctls.p50) return 25 + ((hrv - pctls.p25) / (pctls.p50 - pctls.p25)) * 25;
  if (hrv <= pctls.p75) return 50 + ((hrv - pctls.p50) / (pctls.p75 - pctls.p50)) * 25;
  if (hrv <= pctls.p95) return 75 + ((hrv - pctls.p75) / (pctls.p95 - pctls.p75)) * 25;
  return 100;
}

function computeVibeScore(categories) {
  const entries = Object.entries(VIBE_WEIGHTS)
    .filter(([key]) => categories[key] != null);
  if (entries.length === 0) return null;
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  const score = entries.reduce((sum, [key, w]) => sum + (w / totalWeight) * categories[key], 0);
  return clamp(Math.round(score * 100) / 100);
}

// ============================================================
// RES (Relative Effort Score) - Baseline-relative
// ============================================================

function calcStrainSub(strainToday, baselineStrain) {
  if (!strainToday || !baselineStrain) return null;
  const ratio = (strainToday - baselineStrain) / baselineStrain;
  return clamp(50 + 50 * ratio);
}

function calcHRSub(avgHR, age) {
  if (!avgHR) return null;
  const maxHR = estimateMaxHR(age || 30);
  const pctMax = avgHR / maxHR;
  return clamp((pctMax / 0.90) * 100);
}

function calcStepsSub(stepsToday, baselineSteps) {
  if (!stepsToday || !baselineSteps) return null;
  const ratio = (stepsToday - baselineSteps) / baselineSteps;
  return clamp(50 + 50 * ratio);
}

function calcRecoverySub(recoveryPct, age, sStrain, sHR) {
  if (recoveryPct == null) return null;
  const band = ageBand(age || 30);
  const ceiling = RECOVERY_CEILINGS[band];
  const recoveryNorm = recoveryPct / ceiling;
  const effortContext = ((sStrain || 50) + (sHR || 50)) / 2;
  return clamp(recoveryNorm * 50 + effortContext * 0.5);
}

function computeRES(metrics, baselines, age, weights) {
  const w = weights || [RES_WEIGHTS.strain, RES_WEIGHTS.hr, RES_WEIGHTS.steps, RES_WEIGHTS.recovery];
  const sStrain = calcStrainSub(metrics.strain, baselines.strain);
  const sHR = calcHRSub(metrics.hr_avg, age);
  const sSteps = calcStepsSub(metrics.steps, baselines.steps);
  const sRecovery = calcRecoverySub(metrics.recovery, age, sStrain, sHR);

  const scores = [sStrain, sHR, sSteps, sRecovery];
  const active = scores.map((s, i) => s != null ? { w: w[i], s } : null).filter(Boolean);

  if (active.length === 0) return null;
  const totalW = active.reduce((sum, a) => sum + a.w, 0);
  const res = active.reduce((sum, a) => sum + (a.w / totalW) * a.s, 0);
  return Math.round(res * 100) / 100;
}

module.exports = {
  // bnco Score
  calculateControlScore,
  calculateStillnessScore,
  calculateRespiratoryScore,
  calculateBncoScore,
  BNCO_WEIGHTS,

  // BTL Vibe Score
  calcPower,
  calcFlow,
  calcGrit,
  calcZen,
  computeVibeScore,
  VIBE_WEIGHTS,

  // RES
  computeRES,
  calcStrainSub,
  calcHRSub,
  calcStepsSub,
  calcRecoverySub,
  RES_WEIGHTS,

  // Utilities
  clamp,
  ageBand,
  estimateMaxHR,
  percentileScore,
  HRV_PERCENTILES,
  RECOVERY_CEILINGS,
};
