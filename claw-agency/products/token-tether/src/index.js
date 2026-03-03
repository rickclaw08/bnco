#!/usr/bin/env node

// ============================================================================
// TokenTether - Hard-Stop Billing Controller for OpenClaw
// ============================================================================
//
// This is the primary entry point. It launches the WebSocket proxy that sits
// between clients and the OpenClaw gateway, monitoring all traffic for token
// usage and enforcing hard spending limits.
//
// Architecture:
//   Client --> TokenTether (proxy port) --> OpenClaw Gateway (18789)
//
// TokenTether intercepts WebSocket messages, extracts token usage data from
// LLM API responses flowing through the gateway, tracks cumulative spend,
// and kills sessions that exceed configured thresholds.
//
// IMPORTANT: This process never throws unhandled exceptions. All errors are
// caught and logged. If TokenTether crashes, OpenClaw keeps running - it just
// loses the safety net.
// ============================================================================

'use strict';

const path = require('path');

// Load environment variables from .env file in project root
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { ProxyServer } = require('./proxy');
const { UsageTracker } = require('./tracker');
const { AlertManager } = require('./alerts');
const { DashboardServer } = require('./dashboard');
const { loadConfig, validateConfig } = require('./config');
const { logger } = require('./logger');

// ============================================================================
// Global error handlers - TokenTether must NEVER crash the host
// ============================================================================

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception (TokenTether survived):', err.message);
  logger.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection (TokenTether survived):', reason);
});

// ============================================================================
// Main startup
// ============================================================================

async function main() {
  logger.info('='.repeat(60));
  logger.info('  TokenTether v1.0.0 - Hard-Stop Billing Controller');
  logger.info('  by ClawOps (https://theclawops.com)');
  logger.info('='.repeat(60));

  // Load and validate configuration
  const config = loadConfig();
  const validation = validateConfig(config);

  if (!validation.valid) {
    logger.error('Configuration errors:');
    validation.errors.forEach((e) => logger.error(`  - ${e}`));
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach((w) => logger.warn(`  - ${w}`));
  }

  logger.info(`Proxy port:     ${config.proxyPort}`);
  logger.info(`Gateway target: ${config.gatewayHost}:${config.gatewayPort}`);
  logger.info(`Hard limit:     $${config.hardLimitUsd.toFixed(2)}`);
  logger.info(`Warn threshold: ${(config.warnThresholdPct * 100).toFixed(0)}%`);
  logger.info(`Reset interval: ${config.resetInterval}`);
  logger.info(`Dashboard:      ${config.dashboardEnabled ? `port ${config.dashboardPort}` : 'disabled'}`);

  // Initialize the usage tracker (in-memory + optional file persistence)
  const tracker = new UsageTracker(config);

  // Initialize the alert manager (webhook, email, file-based)
  const alertManager = new AlertManager(config);

  // Wire up alert triggers from the tracker
  tracker.on('warn', (data) => {
    logger.warn(`WARN: Usage at ${(data.percentUsed * 100).toFixed(1)}% of limit ($${data.totalCostUsd.toFixed(4)}/$${data.limitUsd.toFixed(2)})`);
    alertManager.sendAlert('warn', data);
  });

  tracker.on('limit_reached', (data) => {
    logger.error(`HARD STOP: Usage hit limit! $${data.totalCostUsd.toFixed(4)} >= $${data.limitUsd.toFixed(2)}`);
    alertManager.sendAlert('limit_reached', data);
  });

  tracker.on('session_killed', (data) => {
    logger.error(`SESSION KILLED: ${data.sessionId} exceeded per-session limit ($${data.sessionCostUsd.toFixed(4)})`);
    alertManager.sendAlert('session_killed', data);
  });

  // Start the WebSocket proxy
  const proxy = new ProxyServer(config, tracker);
  await proxy.start();

  // Start the dashboard if enabled
  let dashboard = null;
  if (config.dashboardEnabled) {
    dashboard = new DashboardServer(config, tracker);
    await dashboard.start();
  }

  logger.info('');
  logger.info('TokenTether is running. Your OpenClaw spending is protected.');
  logger.info('Press Ctrl+C to stop.');
  logger.info('');

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`\nReceived ${signal}. Shutting down gracefully...`);

    // Save current state before exit
    tracker.persistState();

    if (dashboard) {
      await dashboard.stop();
    }

    await proxy.stop();

    logger.info('TokenTether stopped. OpenClaw gateway is now unprotected.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Run it
main().catch((err) => {
  logger.error('Fatal startup error:', err.message);
  logger.error(err.stack);
  process.exit(1);
});
