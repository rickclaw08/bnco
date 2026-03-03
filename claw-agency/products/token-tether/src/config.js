// ============================================================================
// TokenTether - Configuration Loader
// ============================================================================
//
// Loads all configuration from environment variables. Every setting has a
// sensible default so TokenTether works out of the box with minimal setup.
//
// All monetary values are in USD. All time values are in seconds unless noted.
// ============================================================================

'use strict';

// ============================================================================
// Model pricing table (cost per 1K tokens, USD)
// Updated for current OpenAI, Anthropic, and common model pricing.
// Users can override via MODEL_PRICING_JSON env var.
// ============================================================================

const DEFAULT_MODEL_PRICING = {
  // OpenAI
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'o1': { input: 0.015, output: 0.06 },
  'o1-mini': { input: 0.003, output: 0.012 },
  'o1-pro': { input: 0.15, output: 0.6 },
  'o3-mini': { input: 0.0011, output: 0.0044 },
  // Anthropic
  'claude-opus-4': { input: 0.015, output: 0.075 },
  'claude-sonnet-4': { input: 0.003, output: 0.015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3.5-haiku': { input: 0.0008, output: 0.004 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  // Google
  'gemini-2.0-flash': { input: 0.0001, output: 0.0004 },
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  // DeepSeek
  'deepseek-chat': { input: 0.00014, output: 0.00028 },
  'deepseek-reasoner': { input: 0.00055, output: 0.00219 },
  // Fallback for unknown models
  '_default': { input: 0.005, output: 0.015 },
};

/**
 * Parse a duration string like "1h", "30m", "24h", "7d" into milliseconds.
 * Supports: s (seconds), m (minutes), h (hours), d (days).
 */
function parseDuration(str) {
  if (!str) return null;
  const match = str.trim().match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

/**
 * Load configuration from environment variables.
 * Every value has a sensible default.
 */
function loadConfig() {
  // Try to parse custom model pricing if provided
  let modelPricing = { ...DEFAULT_MODEL_PRICING };
  if (process.env.MODEL_PRICING_JSON) {
    try {
      const custom = JSON.parse(process.env.MODEL_PRICING_JSON);
      modelPricing = { ...modelPricing, ...custom };
    } catch (e) {
      // Will be caught by validation
    }
  }

  return {
    // -- Network --
    // Port TokenTether listens on (clients connect here instead of 18789)
    proxyPort: parseInt(process.env.TT_PROXY_PORT || '18788', 10),

    // OpenClaw gateway host and port (where TokenTether forwards traffic)
    gatewayHost: process.env.TT_GATEWAY_HOST || '127.0.0.1',
    gatewayPort: parseInt(process.env.TT_GATEWAY_PORT || '18789', 10),

    // -- Spending Limits --
    // Hard spending limit in USD. When reached, ALL new sessions are blocked.
    hardLimitUsd: parseFloat(process.env.TT_HARD_LIMIT_USD || '50.00'),

    // Per-session spending limit in USD. Individual sessions exceeding this get killed.
    sessionLimitUsd: parseFloat(process.env.TT_SESSION_LIMIT_USD || '10.00'),

    // Per-model spending limit in USD. Optional, 0 = no per-model limit.
    modelLimitUsd: parseFloat(process.env.TT_MODEL_LIMIT_USD || '0'),

    // Warning threshold as a percentage of the hard limit (0.0 - 1.0).
    // Alert fires when spending crosses this threshold.
    warnThresholdPct: parseFloat(process.env.TT_WARN_THRESHOLD_PCT || '0.80'),

    // -- Reset --
    // How often to reset the usage counters. Options: "1h", "24h", "7d", "30d", "never"
    resetInterval: process.env.TT_RESET_INTERVAL || '24h',
    resetIntervalMs: parseDuration(process.env.TT_RESET_INTERVAL || '24h'),

    // -- Alerts --
    // Webhook URL for alerts (Slack, Discord, or any HTTP endpoint)
    webhookUrl: process.env.TT_WEBHOOK_URL || '',

    // Email alerts via SMTP
    smtpHost: process.env.TT_SMTP_HOST || '',
    smtpPort: parseInt(process.env.TT_SMTP_PORT || '587', 10),
    smtpUser: process.env.TT_SMTP_USER || '',
    smtpPass: process.env.TT_SMTP_PASS || '',
    alertEmail: process.env.TT_ALERT_EMAIL || '',

    // File-based alerts (write alert JSON to this directory)
    alertDir: process.env.TT_ALERT_DIR || '',

    // -- Dashboard --
    dashboardEnabled: process.env.TT_DASHBOARD_ENABLED !== 'false',
    dashboardPort: parseInt(process.env.TT_DASHBOARD_PORT || '18790', 10),

    // -- Persistence --
    // File path to persist usage state across restarts
    stateFile: process.env.TT_STATE_FILE || './data/usage-state.json',

    // -- Model Pricing --
    modelPricing,

    // -- Behavior --
    // When hard limit is reached: "block" (reject new sessions) or "warn" (log only)
    limitAction: process.env.TT_LIMIT_ACTION || 'block',

    // Log level: debug, info, warn, error
    logLevel: process.env.TT_LOG_LEVEL || 'info',

    // Enable passthrough mode (monitor only, never block)
    passthroughMode: process.env.TT_PASSTHROUGH === 'true',
  };
}

/**
 * Validate the loaded configuration.
 * Returns { valid: boolean, errors: string[], warnings: string[] }
 */
function validateConfig(config) {
  const errors = [];
  const warnings = [];

  // Port validation
  if (config.proxyPort < 1 || config.proxyPort > 65535) {
    errors.push(`TT_PROXY_PORT must be 1-65535, got ${config.proxyPort}`);
  }
  if (config.gatewayPort < 1 || config.gatewayPort > 65535) {
    errors.push(`TT_GATEWAY_PORT must be 1-65535, got ${config.gatewayPort}`);
  }
  if (config.proxyPort === config.gatewayPort) {
    errors.push(`TT_PROXY_PORT and TT_GATEWAY_PORT cannot be the same (${config.proxyPort})`);
  }

  // Spending limits
  if (config.hardLimitUsd <= 0) {
    errors.push('TT_HARD_LIMIT_USD must be greater than 0');
  }
  if (config.sessionLimitUsd < 0) {
    errors.push('TT_SESSION_LIMIT_USD cannot be negative');
  }
  if (config.sessionLimitUsd > config.hardLimitUsd) {
    warnings.push('TT_SESSION_LIMIT_USD exceeds TT_HARD_LIMIT_USD; sessions will hit global limit first');
  }

  // Warn threshold
  if (config.warnThresholdPct < 0.1 || config.warnThresholdPct > 1.0) {
    errors.push('TT_WARN_THRESHOLD_PCT must be between 0.1 and 1.0');
  }

  // Reset interval
  if (config.resetInterval !== 'never' && !config.resetIntervalMs) {
    errors.push(`Invalid TT_RESET_INTERVAL: "${config.resetInterval}". Use format like "1h", "24h", "7d", or "never"`);
  }

  // Limit action
  if (!['block', 'warn'].includes(config.limitAction)) {
    errors.push(`TT_LIMIT_ACTION must be "block" or "warn", got "${config.limitAction}"`);
  }

  // Log level
  if (!['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
    errors.push(`TT_LOG_LEVEL must be debug/info/warn/error, got "${config.logLevel}"`);
  }

  // Alert config warnings
  if (!config.webhookUrl && !config.smtpHost && !config.alertDir) {
    warnings.push('No alert channels configured. Alerts will only appear in logs.');
  }

  if (config.passthroughMode) {
    warnings.push('PASSTHROUGH MODE enabled: TokenTether will monitor but never block sessions.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  loadConfig,
  validateConfig,
  DEFAULT_MODEL_PRICING,
  parseDuration,
};
