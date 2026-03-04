/* ═══════════════════════════════════════════════════════════
   BNCO — Biometric Translation Layer (BTL)
   Converts raw Whoop / Apple HealthKit JSON into Pilates
   stat categories: Power · Flow · Grit · Zen
   ═══════════════════════════════════════════════════════════ */

// ── Constants ─────────────────────────────────────────────

/** Recognised Pilates / [solidcore] activity labels (lowercased) */
const PILATES_LABELS = [
    'pilates', 'solidcore', '[solidcore]', 'reformer', 'megaformer',
    'club pilates', 'lagree', 'core reform', 'barre',
];

/** Generic labels that receive the 0.8× Power penalty */
const GENERIC_LABELS = [
    'functional training', 'strength training', 'traditional strength training',
    'functional strength training', 'other', 'mixed cardio',
];

/** Vibe Score composite weights */
const VIBE_WEIGHTS = { power: 0.30, flow: 0.25, grit: 0.25, zen: 0.20 };

/** HR zone ceilings as % of estimated max HR */
const HR_ZONE_CEILINGS = [0.50, 0.60, 0.70, 0.80, 0.90, 1.00]; // Z0→Z5

/** HRV population percentile anchors (ms RMSSD) by age band */
const HRV_PERCENTILES = {
    '18-29': { p25: 30, p50: 55, p75: 80, p95: 120 },
    '30-39': { p25: 25, p50: 45, p75: 70, p95: 105 },
    '40-49': { p25: 20, p50: 38, p75: 60, p95: 90 },
    '50-59': { p25: 15, p50: 30, p75: 50, p95: 75 },
    '60+': { p25: 12, p50: 25, p75: 42, p95: 65 },
};

// ── Utilities ─────────────────────────────────────────────

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
    return 207 - 0.7 * age; // Gellish formula (same as scoring_math.md)
}

// ── Raw Data Parsers ──────────────────────────────────────

/**
 * Parse a Whoop session payload into canonical BTL fields.
 * @param {Object} json — raw Whoop API response for a single session
 * @returns {Object}    — canonical fields (nulls for missing)
 */
export function parseWhoopSession(json) {
    return {
        provider: 'whoop',
        muscularStrain: json.muscular_strain ?? json.strain?.muscular ?? null,
        totalStrain: json.total_strain ?? json.strain?.total ?? null,
        respiratoryRate: json.respiratory_rate ?? json.sleep?.respiratory_rate ?? null,
        hrv: json.hrv ?? json.recovery?.hrv ?? null,
        recoveryPct: json.recovery_pct ?? json.recovery?.score ?? null,
        avgHR: json.avg_hr ?? json.hr?.average ?? null,
        maxHR: json.max_hr ?? json.hr?.max ?? null,
        hrZones: json.hr_zones ?? null, // { zone0Min, zone1Min, ..., zone4Min }
        activeCal: json.active_calories ?? json.calories?.active ?? null,
        durationMin: json.duration_min ?? (json.duration_ms ? json.duration_ms / 60000 : null),
        workoutType: (json.workout_type || json.sport || '').toLowerCase(),
    };
}

/**
 * Parse an Apple HealthKit workout payload into canonical BTL fields.
 * @param {Object} json — HealthKit workout sample
 * @returns {Object}    — canonical fields (nulls for missing)
 */
export function parseAppleHealthSession(json) {
    // Apple provides hr_zones as an array [z0min, z1min, z2min, z3min, z4min]
    // or as an object { zone0: min, zone1: min, ... }
    let hrZones = null;
    if (Array.isArray(json.hr_zones)) {
        hrZones = {
            zone0Min: json.hr_zones[0] ?? 0,
            zone1Min: json.hr_zones[1] ?? 0,
            zone2Min: json.hr_zones[2] ?? 0,
            zone3Min: json.hr_zones[3] ?? 0,
            zone4Min: json.hr_zones[4] ?? 0,
        };
    } else if (json.hr_zones && typeof json.hr_zones === 'object') {
        hrZones = {
            zone0Min: json.hr_zones.zone0 ?? json.hr_zones.zone0Min ?? 0,
            zone1Min: json.hr_zones.zone1 ?? json.hr_zones.zone1Min ?? 0,
            zone2Min: json.hr_zones.zone2 ?? json.hr_zones.zone2Min ?? 0,
            zone3Min: json.hr_zones.zone3 ?? json.hr_zones.zone3Min ?? 0,
            zone4Min: json.hr_zones.zone4 ?? json.hr_zones.zone4Min ?? 0,
        };
    }

    return {
        provider: 'apple_health',
        muscularStrain: null, // Apple does not provide muscular strain
        totalStrain: null, // Apple does not provide total strain natively
        respiratoryRate: null, // Not available per-session in HealthKit
        hrv: json.hrv ?? null,
        recoveryPct: null, // Apple does not provide a recovery score
        avgHR: json.hr_avg ?? json.average_heart_rate ?? null,
        maxHR: json.hr_max ?? json.max_heart_rate ?? null,
        hrZones,
        activeCal: json.active_calories ?? json.activeEnergyBurned ?? null,
        durationMin: json.workout_duration ?? json.duration ?? null,
        workoutType: (json.workout_type || json.activityType || '').toLowerCase(),
    };
}

// ── Activity Type Detection ───────────────────────────────

/**
 * Detect whether a workout label is a recognised Pilates type.
 * @param {string} label
 * @returns {{ isPilates: boolean, isGeneric: boolean, multiplier: number }}
 */
export function detectActivityType(label) {
    const lower = (label || '').toLowerCase().trim();

    if (PILATES_LABELS.some(p => lower.includes(p))) {
        return { isPilates: true, isGeneric: false, multiplier: 1.0, label: lower };
    }

    if (GENERIC_LABELS.some(g => lower.includes(g))) {
        return { isPilates: false, isGeneric: true, multiplier: 0.8, label: lower };
    }

    // Unrecognised label — treat as generic
    return { isPilates: false, isGeneric: true, multiplier: 0.8, label: lower };
}

// ── Stat Category Calculators ─────────────────────────────

/**
 * POWER (Intensity)
 * Source: muscular_strain (70%) + active_calories (30%)
 * Bonus: "Precision Power" if high strain + low avg HR
 *
 * @param {number|null} muscularStrain  0–21 scale
 * @param {number|null} activeCal       kcal
 * @param {number|null} avgHR           bpm (for Precision Power check)
 * @param {number}      age             user age
 * @returns {number}                    0–100
 */
export function calcPower(muscularStrain, activeCal, avgHR = null, age = 30) {
    const maxHR = estimateMaxHR(age);
    const zone2Ceiling = maxHR * HR_ZONE_CEILINGS[2]; // 70% of max HR

    let score;

    if (muscularStrain != null && activeCal != null) {
        // Both sources available — weighted blend
        const strainNorm = clamp((muscularStrain / 21) * 100);
        const calNorm = clamp(Math.min(activeCal / 600, 1) * 100); // 600 kcal = 100
        score = strainNorm * 0.70 + calNorm * 0.30;
    } else if (muscularStrain != null) {
        // Whoop-only
        score = clamp((muscularStrain / 21) * 100);
    } else if (activeCal != null) {
        // Apple-only fallback — calories are the sole signal
        score = clamp(Math.min(activeCal / 600, 1) * 100);
    } else {
        return null; // No data available for Power
    }

    // Precision Power bonus: high strain but controlled HR
    let bonus = 0;
    if (muscularStrain != null && muscularStrain > 12 && avgHR != null && avgHR < zone2Ceiling) {
        bonus = 8;
    }

    return clamp(Math.round((score + bonus) * 100) / 100);
}

/**
 * FLOW (Control)
 * Source: HR zones (time in Z1+Z2) + respiratory rate steadiness
 * Penalty: if Zone 4 > 10% of class duration
 *
 * @param {Object|null}  hrZones         { zone0Min, zone1Min, zone2Min, zone3Min, zone4Min }
 * @param {number|null}  respiratoryRate breaths-per-minute
 * @param {number|null}  classDurationMin total class duration in minutes
 * @returns {number}                     0–100
 */
export function calcFlow(hrZones, respiratoryRate = null, classDurationMin = null) {
    if (!hrZones) return null;

    const z1 = hrZones.zone1Min || 0;
    const z2 = hrZones.zone2Min || 0;
    const z4 = hrZones.zone4Min || 0;
    const totalZoneMin = (hrZones.zone0Min || 0) + z1 + z2
        + (hrZones.zone3Min || 0) + z4;

    const effectiveDuration = classDurationMin || totalZoneMin || 1;

    // Base score: % of class spent in Zone 1 + Zone 2
    const controlPct = (z1 + z2) / effectiveDuration;
    let score = clamp(controlPct * 100);

    // Respiratory rate steadiness bonus (0–10 pts)
    // Optimal Pilates breathing: 12–18 bpm → full bonus
    // Outside that range → scaled reduction
    if (respiratoryRate != null) {
        if (respiratoryRate >= 12 && respiratoryRate <= 18) {
            score += 10;
        } else {
            const deviation = respiratoryRate < 12
                ? 12 - respiratoryRate
                : respiratoryRate - 18;
            score += clamp(10 - deviation * 2, 0, 10);
        }
    }

    // Zone 4 penalty: if > 10% of class in Zone 4, penalize
    const zone4Pct = z4 / effectiveDuration;
    if (zone4Pct > 0.10) {
        const penaltyMultiplier = clamp(1 - (zone4Pct - 0.10), 0.5, 1.0);
        score *= penaltyMultiplier;
    }

    return clamp(Math.round(score * 100) / 100);
}

/**
 * GRIT (Duration / Volume)
 * Source: workout duration + total strain
 * Only counts verified studio sessions.
 *
 * @param {number|null} durationMin   minutes in studio session
 * @param {number|null} totalStrain   0–21 scale
 * @param {boolean}     isStudioSession verified studio check-in
 * @returns {number}                  0–100
 */
export function calcGrit(durationMin, totalStrain = null, isStudioSession = true) {
    if (!isStudioSession) return 0; // Non-studio sessions do not earn Grit

    if (durationMin == null) return null;

    // Duration component: 60 min = 50 pts (linear)
    const durationScore = clamp((durationMin / 60) * 50, 0, 50);

    // Strain component: strain / 21 * 50
    let strainScore = 0;
    if (totalStrain != null) {
        strainScore = clamp((totalStrain / 21) * 50, 0, 50);
    } else {
        // Apple-only: scale duration component to full range
        return clamp((durationMin / 60) * 100);
    }

    return clamp(Math.round((durationScore + strainScore) * 100) / 100);
}

/**
 * ZEN (Recovery)
 * Source: HRV + Recovery %
 * A daily leaderboard for "Best Recovered Athlete"
 *
 * @param {number|null} hrv          ms (RMSSD)
 * @param {number|null} recoveryPct  0–100
 * @param {number}      age          user age
 * @returns {number}                 0–100
 */
export function calcZen(hrv, recoveryPct = null, age = 30) {
    if (hrv == null && recoveryPct == null) return null;

    const band = ageBand(age);
    const pctls = HRV_PERCENTILES[band];

    let score;

    if (hrv != null && recoveryPct != null) {
        // Full data — HRV 60%, Recovery 40%
        const hrvNorm = clamp(percentileScore(hrv, pctls));
        const recNorm = clamp(recoveryPct);
        score = hrvNorm * 0.60 + recNorm * 0.40;
    } else if (hrv != null) {
        // HRV only (Apple with HealthKit HRV)
        score = clamp(percentileScore(hrv, pctls));
    } else {
        // Recovery only (Whoop without HRV reading)
        score = clamp(recoveryPct);
    }

    return clamp(Math.round(score * 100) / 100);
}

/**
 * Map an HRV value to a 0–100 score using population percentiles.
 */
function percentileScore(hrv, pctls) {
    if (hrv <= pctls.p25) return (hrv / pctls.p25) * 25;
    if (hrv <= pctls.p50) return 25 + ((hrv - pctls.p25) / (pctls.p50 - pctls.p25)) * 25;
    if (hrv <= pctls.p75) return 50 + ((hrv - pctls.p50) / (pctls.p75 - pctls.p50)) * 25;
    if (hrv <= pctls.p95) return 75 + ((hrv - pctls.p75) / (pctls.p95 - pctls.p75)) * 25;
    return 100;
}

// ── Master Normalization Function ─────────────────────────

/**
 * normalizePilatesScore — the primary BTL entry point.
 *
 * Takes raw provider data (Whoop or Apple HealthKit JSON) and returns
 * the four Pilates stat categories plus a composite Vibe Score.
 *
 * @param {Object} providerData — raw JSON from Whoop or Apple HealthKit
 * @param {Object} options
 * @param {number} options.age             — user age (default 30)
 * @param {boolean} options.isStudioSession — verified studio check-in (default true)
 * @returns {Object} { power, flow, grit, zen, vibeScore, categories, activityType, provider, bonuses }
 */
export function normalizePilatesScore(providerData, options = {}) {
    const { age = 30, isStudioSession = true } = options;

    // 1. Detect provider and parse
    const parsed = autoDetectAndParse(providerData);

    // 2. Detect activity type
    const activity = detectActivityType(parsed.workoutType);

    // 3. Calculate the four stat categories
    let power = calcPower(parsed.muscularStrain, parsed.activeCal, parsed.avgHR, age);
    const flow = calcFlow(parsed.hrZones, parsed.respiratoryRate, parsed.durationMin);
    const grit = calcGrit(parsed.durationMin, parsed.totalStrain, isStudioSession);
    const zen = calcZen(parsed.hrv, parsed.recoveryPct, age);

    // 4. Apply activity-type multiplier to Power
    const bonuses = [];
    if (power != null && activity.multiplier < 1.0) {
        bonuses.push({
            type: 'activity_penalty',
            category: 'power',
            multiplier: activity.multiplier,
            reason: `Generic "${activity.label}" label — use a Pilates tracking mode for full credit`,
        });
        power = clamp(Math.round(power * activity.multiplier * 100) / 100);
    }

    // Precision Power bonus reporting
    if (power != null && parsed.muscularStrain > 12 && parsed.avgHR != null) {
        const zone2Ceiling = estimateMaxHR(age) * HR_ZONE_CEILINGS[2];
        if (parsed.avgHR < zone2Ceiling) {
            bonuses.push({
                type: 'precision_power',
                category: 'power',
                bonus: 8,
                reason: 'High strain with controlled heart rate',
            });
        }
    }

    // 5. Compute Vibe Score — weighted composite, handling nulls
    const categories = { power, flow, grit, zen };
    const vibeScore = computeVibeScore(categories);

    return {
        power,
        flow,
        grit,
        zen,
        vibeScore,
        categories,
        activityType: activity,
        provider: parsed.provider,
        bonuses,
        raw: parsed,
    };
}

/**
 * Auto-detect provider from data shape and return parsed canonical fields.
 */
function autoDetectAndParse(data) {
    // If already parsed (has provider field), return as-is
    if (data.provider === 'whoop' || data.provider === 'apple_health') return data;

    // Whoop signals: muscular_strain, recovery.score, strain.total
    if (data.muscular_strain != null || data.strain?.muscular != null
        || data.recovery?.score != null || data.recovery_pct != null) {
        return parseWhoopSession(data);
    }

    // Apple signals: activityType, activeEnergyBurned, workout_type with Apple-style labels
    if (data.activeEnergyBurned != null || data.activityType != null
        || data.average_heart_rate != null || data.workout_duration != null) {
        return parseAppleHealthSession(data);
    }

    // Fallback: try to parse common field names
    return parseAppleHealthSession(data);
}

/**
 * Compute the weighted Vibe Score, redistributing weights from null categories.
 */
function computeVibeScore(categories) {
    const entries = Object.entries(VIBE_WEIGHTS)
        .filter(([key]) => categories[key] != null);

    if (entries.length === 0) return null;

    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);

    const score = entries.reduce((sum, [key, w]) => {
        return sum + (w / totalWeight) * categories[key];
    }, 0);

    return clamp(Math.round(score * 100) / 100);
}

// ── Simulated Demo Data ───────────────────────────────────

/** Sample Whoop session for demo / testing */
export const SAMPLE_WHOOP = {
    muscular_strain: 14.8,
    total_strain: 16.2,
    respiratory_rate: 15.4,
    hrv: 62,
    recovery_pct: 81,
    avg_hr: 128,
    max_hr: 165,
    hr_zones: {
        zone0Min: 3, zone1Min: 12, zone2Min: 18, zone3Min: 8, zone4Min: 4,
    },
    active_calories: 420,
    duration_min: 45,
    workout_type: '[solidcore]',
};

/** Sample Apple HealthKit session for demo / testing */
export const SAMPLE_APPLE = {
    active_calories: 385,
    hr_avg: 134,
    hr_max: 170,
    hr_zones: [2, 10, 20, 10, 3],
    hrv: 48,
    workout_duration: 50,
    workout_type: 'Pilates',
};

/**
 * Run the demo — returns results for both Whoop and Apple sample data.
 */
export function runBTLDemo(age = 32) {
    const whoopResult = normalizePilatesScore(SAMPLE_WHOOP, { age, isStudioSession: true });
    const appleResult = normalizePilatesScore(SAMPLE_APPLE, { age, isStudioSession: true });

    return { whoop: whoopResult, apple: appleResult };
}
