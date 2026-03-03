// ============================================================================
// TokenTether - Usage Tracker
// ============================================================================
//
// Tracks token usage across sessions, models, and time periods. Emits events
// when thresholds are crossed. Persists state to disk for crash recovery.
//
// This is the "brain" of TokenTether. It receives usage reports from the
// proxy, calculates costs using the model pricing table, and decides whether
// to allow, warn, or kill sessions.
//
// Events emitted:
//   'warn'           - Usage crossed the warning threshold
//   'limit_reached'  - Usage hit the hard limit
//   'session_killed' - A specific session exceeded its per-session limit
// ============================================================================

'use strict';

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

class UsageTracker extends EventEmitter {
  /**
   * @param {object} config - Loaded configuration object
   */
  constructor(config) {
    super();

    this.config = config;
    this.pricing = config.modelPricing;

    // -----------------------------------------------------------------------
    // State: all monetary values in USD
    // -----------------------------------------------------------------------

    // Global totals for the current period
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.totalCostUsd = 0;

    // Per-session tracking: { sessionId: { inputTokens, outputTokens, costUsd, model, startedAt } }
    this.sessions = new Map();

    // Per-model tracking: { modelName: { inputTokens, outputTokens, costUsd } }
    this.models = new Map();

    // Alert state (avoid spamming the same alert)
    this.warnAlertSent = false;
    this.limitAlertSent = false;

    // Period tracking
    this.periodStartedAt = Date.now();
    this.requestCount = 0;

    // History for dashboard charts (last 100 data points)
    this.costHistory = [];

    // Try to restore state from disk
    this._restoreState();

    // Set up periodic reset if configured
    if (config.resetInterval !== 'never' && config.resetIntervalMs) {
      this._scheduleReset();
    }

    logger.info(`Usage tracker initialized. Period started: ${new Date(this.periodStartedAt).toISOString()}`);
  }

  // =========================================================================
  // Public API
  // =========================================================================

  /**
   * Record token usage from an intercepted API response.
   *
   * @param {string} sessionId - The OpenClaw session ID
   * @param {string} model - The model name (e.g., "claude-3.5-sonnet")
   * @param {number} inputTokens - Number of input/prompt tokens
   * @param {number} outputTokens - Number of output/completion tokens
   * @returns {{ allowed: boolean, reason: string }} Whether the session should continue
   */
  recordUsage(sessionId, model, inputTokens, outputTokens) {
    // Normalize the model name for pricing lookup
    const normalizedModel = this._normalizeModel(model);
    const pricing = this.pricing[normalizedModel] || this.pricing['_default'];

    // Calculate cost for this usage event
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const eventCost = inputCost + outputCost;

    // Update global totals
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    this.totalCostUsd += eventCost;
    this.requestCount += 1;

    // Update per-session tracking
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        model: normalizedModel,
        startedAt: Date.now(),
        requestCount: 0,
      });
    }
    const session = this.sessions.get(sessionId);
    session.inputTokens += inputTokens;
    session.outputTokens += outputTokens;
    session.costUsd += eventCost;
    session.requestCount += 1;
    session.lastModel = normalizedModel;

    // Update per-model tracking
    if (!this.models.has(normalizedModel)) {
      this.models.set(normalizedModel, {
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        requestCount: 0,
      });
    }
    const modelStats = this.models.get(normalizedModel);
    modelStats.inputTokens += inputTokens;
    modelStats.outputTokens += outputTokens;
    modelStats.costUsd += eventCost;
    modelStats.requestCount += 1;

    // Record for history
    this.costHistory.push({
      timestamp: Date.now(),
      costUsd: this.totalCostUsd,
      eventCost,
      model: normalizedModel,
      sessionId,
    });
    // Keep history bounded
    if (this.costHistory.length > 500) {
      this.costHistory = this.costHistory.slice(-500);
    }

    logger.debug(
      `Usage: session=${sessionId} model=${normalizedModel} ` +
      `in=${inputTokens} out=${outputTokens} ` +
      `cost=$${eventCost.toFixed(6)} total=$${this.totalCostUsd.toFixed(4)}`
    );

    // Check per-session limit
    if (this.config.sessionLimitUsd > 0 && session.costUsd >= this.config.sessionLimitUsd) {
      if (!this.config.passthroughMode) {
        this.emit('session_killed', {
          sessionId,
          sessionCostUsd: session.costUsd,
          limitUsd: this.config.sessionLimitUsd,
          model: normalizedModel,
        });
        return { allowed: false, reason: `Session spending limit reached ($${session.costUsd.toFixed(4)}/$${this.config.sessionLimitUsd.toFixed(2)})` };
      }
    }

    // Check warning threshold
    const percentUsed = this.totalCostUsd / this.config.hardLimitUsd;
    if (percentUsed >= this.config.warnThresholdPct && !this.warnAlertSent) {
      this.warnAlertSent = true;
      this.emit('warn', {
        totalCostUsd: this.totalCostUsd,
        limitUsd: this.config.hardLimitUsd,
        percentUsed,
        sessionId,
        model: normalizedModel,
      });
    }

    // Check hard limit
    if (this.totalCostUsd >= this.config.hardLimitUsd) {
      if (!this.limitAlertSent) {
        this.limitAlertSent = true;
        this.emit('limit_reached', {
          totalCostUsd: this.totalCostUsd,
          limitUsd: this.config.hardLimitUsd,
          percentUsed: 1.0,
        });
      }

      if (this.config.limitAction === 'block' && !this.config.passthroughMode) {
        return { allowed: false, reason: `Global spending limit reached ($${this.totalCostUsd.toFixed(4)}/$${this.config.hardLimitUsd.toFixed(2)})` };
      }
    }

    return { allowed: true, reason: 'ok' };
  }

  /**
   * Check if a new session should be allowed to start.
   * Called before proxying any new WebSocket connection.
   */
  canStartSession() {
    if (this.config.passthroughMode) {
      return { allowed: true, reason: 'passthrough mode' };
    }

    if (this.config.limitAction === 'block' && this.totalCostUsd >= this.config.hardLimitUsd) {
      return {
        allowed: false,
        reason: `Global spending limit reached ($${this.totalCostUsd.toFixed(4)}/$${this.config.hardLimitUsd.toFixed(2)}). Reset at next period or increase TT_HARD_LIMIT_USD.`,
      };
    }

    return { allowed: true, reason: 'ok' };
  }

  /**
   * Get a snapshot of current usage for the dashboard or API.
   */
  getSnapshot() {
    const sessionList = [];
    for (const [id, data] of this.sessions) {
      sessionList.push({ id, ...data });
    }

    const modelList = [];
    for (const [name, data] of this.models) {
      modelList.push({ name, ...data });
    }

    return {
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalCostUsd: this.totalCostUsd,
      hardLimitUsd: this.config.hardLimitUsd,
      percentUsed: this.totalCostUsd / this.config.hardLimitUsd,
      requestCount: this.requestCount,
      periodStartedAt: this.periodStartedAt,
      periodDurationMs: Date.now() - this.periodStartedAt,
      activeSessions: this.sessions.size,
      sessions: sessionList.sort((a, b) => b.costUsd - a.costUsd),
      models: modelList.sort((a, b) => b.costUsd - a.costUsd),
      costHistory: this.costHistory.slice(-100),
      limitReached: this.totalCostUsd >= this.config.hardLimitUsd,
      warningSent: this.warnAlertSent,
      passthroughMode: this.config.passthroughMode,
    };
  }

  /**
   * Manually reset all counters. Called by the periodic reset timer or via API.
   */
  resetCounters() {
    logger.info(`Resetting usage counters. Previous period: $${this.totalCostUsd.toFixed(4)} across ${this.requestCount} requests.`);

    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.totalCostUsd = 0;
    this.requestCount = 0;
    this.sessions.clear();
    this.models.clear();
    this.warnAlertSent = false;
    this.limitAlertSent = false;
    this.periodStartedAt = Date.now();
    this.costHistory = [];

    this.persistState();
  }

  /**
   * Remove a session from tracking (e.g., when WebSocket disconnects).
   */
  removeSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      logger.debug(`Session ended: ${sessionId} cost=$${session.costUsd.toFixed(4)} requests=${session.requestCount}`);
      // We keep the session data for the period - just mark it as ended
      session.endedAt = Date.now();
    }
  }

  /**
   * Save current state to disk for crash recovery.
   */
  persistState() {
    try {
      const stateDir = path.dirname(this.config.stateFile);
      if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
      }

      const state = {
        version: 1,
        savedAt: Date.now(),
        periodStartedAt: this.periodStartedAt,
        totalInputTokens: this.totalInputTokens,
        totalOutputTokens: this.totalOutputTokens,
        totalCostUsd: this.totalCostUsd,
        requestCount: this.requestCount,
        warnAlertSent: this.warnAlertSent,
        limitAlertSent: this.limitAlertSent,
      };

      fs.writeFileSync(this.config.stateFile, JSON.stringify(state, null, 2));
      logger.debug(`State persisted to ${this.config.stateFile}`);
    } catch (err) {
      logger.error(`Failed to persist state: ${err.message}`);
    }
  }

  // =========================================================================
  // Private methods
  // =========================================================================

  /**
   * Normalize model names to match pricing table keys.
   * Handles variations like "claude-3-5-sonnet-20241022" -> "claude-3.5-sonnet"
   */
  _normalizeModel(model) {
    if (!model) return '_default';

    const lower = model.toLowerCase().trim();

    // Direct match first
    if (this.pricing[lower]) return lower;

    // Try common variations
    // Strip date suffixes (e.g., "-20241022", "-20240620")
    const stripped = lower.replace(/-\d{8}$/, '');
    if (this.pricing[stripped]) return stripped;

    // Handle "claude-3-5-sonnet" -> "claude-3.5-sonnet"
    const dotted = stripped.replace(/claude-(\d)-(\d)/, 'claude-$1.$2');
    if (this.pricing[dotted]) return dotted;

    // Handle copilot-proxy/ prefix (OpenClaw passes model names with provider prefix)
    const withoutPrefix = lower.replace(/^[^/]+\//, '');
    if (this.pricing[withoutPrefix]) return withoutPrefix;

    // Try prefix-stripped with date removal too
    const withoutPrefixStripped = withoutPrefix.replace(/-\d{8}$/, '');
    if (this.pricing[withoutPrefixStripped]) return withoutPrefixStripped;

    const withoutPrefixDotted = withoutPrefixStripped.replace(/claude-(\d)-(\d)/, 'claude-$1.$2');
    if (this.pricing[withoutPrefixDotted]) return withoutPrefixDotted;

    // Partial match: find the first pricing key that's a substring
    for (const key of Object.keys(this.pricing)) {
      if (key === '_default') continue;
      if (lower.includes(key) || withoutPrefix.includes(key)) return key;
    }

    logger.debug(`Unknown model "${model}", using default pricing`);
    return '_default';
  }

  /**
   * Restore state from disk after a restart.
   */
  _restoreState() {
    try {
      if (fs.existsSync(this.config.stateFile)) {
        const raw = fs.readFileSync(this.config.stateFile, 'utf-8');
        const state = JSON.parse(raw);

        if (state.version !== 1) {
          logger.warn('State file version mismatch, starting fresh');
          return;
        }

        // Check if the saved state is from the current period
        if (this.config.resetIntervalMs && state.periodStartedAt) {
          const elapsed = Date.now() - state.periodStartedAt;
          if (elapsed >= this.config.resetIntervalMs) {
            logger.info('Saved state is from a previous period, starting fresh');
            return;
          }
        }

        this.periodStartedAt = state.periodStartedAt || Date.now();
        this.totalInputTokens = state.totalInputTokens || 0;
        this.totalOutputTokens = state.totalOutputTokens || 0;
        this.totalCostUsd = state.totalCostUsd || 0;
        this.requestCount = state.requestCount || 0;
        this.warnAlertSent = state.warnAlertSent || false;
        this.limitAlertSent = state.limitAlertSent || false;

        logger.info(`Restored state: $${this.totalCostUsd.toFixed(4)} spent, ${this.requestCount} requests since ${new Date(this.periodStartedAt).toISOString()}`);
      }
    } catch (err) {
      logger.warn(`Could not restore state (starting fresh): ${err.message}`);
    }
  }

  /**
   * Schedule the periodic counter reset.
   */
  _scheduleReset() {
    const elapsed = Date.now() - this.periodStartedAt;
    const remaining = Math.max(0, this.config.resetIntervalMs - elapsed);

    logger.info(`Next counter reset in ${Math.round(remaining / 1000 / 60)} minutes`);

    this._resetTimer = setTimeout(() => {
      this.resetCounters();
      // Schedule the next reset
      this._scheduleReset();
    }, remaining);

    // Don't prevent process exit
    if (this._resetTimer.unref) {
      this._resetTimer.unref();
    }
  }
}

module.exports = { UsageTracker };
