// ============================================================================
// TokenTether - Alert Manager
// ============================================================================
//
// Handles sending alerts through multiple channels:
//   1. Webhook (Slack, Discord, or any HTTP endpoint)
//   2. Email (via SMTP/nodemailer)
//   3. File-based (writes JSON alert files to a directory)
//   4. Console (always, via logger)
//
// Alerts are throttled to prevent spam. The same alert type won't fire more
// than once per throttle window (default: 5 minutes).
// ============================================================================

'use strict';

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

// Throttle window: don't send the same alert type more than once per 5 min
const THROTTLE_MS = 5 * 60 * 1000;

class AlertManager {
  constructor(config) {
    this.config = config;

    // Track when each alert type was last sent
    this.lastAlertTime = {};

    // Lazy-load nodemailer only if SMTP is configured
    this.mailer = null;
    if (config.smtpHost) {
      this._initMailer();
    }

    logger.info(`Alerts configured: ${this._describeChannels()}`);
  }

  /**
   * Send an alert through all configured channels.
   *
   * @param {string} type - Alert type: 'warn', 'limit_reached', 'session_killed'
   * @param {object} data - Alert payload with usage details
   */
  async sendAlert(type, data) {
    // Throttle check
    const now = Date.now();
    const lastSent = this.lastAlertTime[type] || 0;
    if (now - lastSent < THROTTLE_MS) {
      logger.debug(`Alert "${type}" throttled (sent ${Math.round((now - lastSent) / 1000)}s ago)`);
      return;
    }
    this.lastAlertTime[type] = now;

    const alert = this._formatAlert(type, data);

    // Fire all channels in parallel, don't let any failure block others
    const promises = [];

    if (this.config.webhookUrl) {
      promises.push(this._sendWebhook(alert).catch((err) => {
        logger.error(`Webhook alert failed: ${err.message}`);
      }));
    }

    if (this.mailer && this.config.alertEmail) {
      promises.push(this._sendEmail(alert).catch((err) => {
        logger.error(`Email alert failed: ${err.message}`);
      }));
    }

    if (this.config.alertDir) {
      promises.push(this._writeFile(alert).catch((err) => {
        logger.error(`File alert failed: ${err.message}`);
      }));
    }

    await Promise.all(promises);
  }

  // =========================================================================
  // Alert formatting
  // =========================================================================

  /**
   * Create a structured alert object from the type and data.
   */
  _formatAlert(type, data) {
    const titles = {
      warn: 'TokenTether Warning: Approaching Spending Limit',
      limit_reached: 'TokenTether ALERT: Spending Limit Reached',
      session_killed: 'TokenTether: Session Terminated',
    };

    const descriptions = {
      warn: `Your OpenClaw API spending has reached ${((data.percentUsed || 0) * 100).toFixed(1)}% of your configured limit. Current spend: $${(data.totalCostUsd || 0).toFixed(4)} / $${(data.limitUsd || 0).toFixed(2)}.`,
      limit_reached: `HARD STOP ACTIVATED. Your OpenClaw API spending has hit the configured limit of $${(data.limitUsd || 0).toFixed(2)}. New sessions will be blocked until the counter resets or the limit is increased.`,
      session_killed: `Session "${data.sessionId || 'unknown'}" was terminated because it exceeded the per-session spending limit. Session cost: $${(data.sessionCostUsd || 0).toFixed(4)} / $${(data.limitUsd || 0).toFixed(2)}.`,
    };

    const severities = {
      warn: 'warning',
      limit_reached: 'critical',
      session_killed: 'high',
    };

    return {
      type,
      severity: severities[type] || 'info',
      title: titles[type] || `TokenTether Alert: ${type}`,
      description: descriptions[type] || JSON.stringify(data),
      data,
      timestamp: new Date().toISOString(),
      source: 'token-tether',
      version: '1.0.0',
    };
  }

  // =========================================================================
  // Channel implementations
  // =========================================================================

  /**
   * Send alert via webhook (supports Slack, Discord, and generic JSON POST).
   */
  async _sendWebhook(alert) {
    const url = new URL(this.config.webhookUrl);

    // Detect webhook type and format accordingly
    let body;

    if (url.hostname.includes('discord.com') || url.hostname.includes('discordapp.com')) {
      // Discord webhook format
      const colors = { warning: 0xffaa00, critical: 0xff0000, high: 0xff6600 };
      body = JSON.stringify({
        embeds: [{
          title: alert.title,
          description: alert.description,
          color: colors[alert.severity] || 0x00aaff,
          timestamp: alert.timestamp,
          footer: { text: 'TokenTether v1.0.0' },
        }],
      });
    } else if (url.hostname.includes('slack.com') || url.pathname.includes('/services/')) {
      // Slack webhook format
      const emojis = { warning: ':warning:', critical: ':rotating_light:', high: ':exclamation:' };
      body = JSON.stringify({
        text: `${emojis[alert.severity] || ':bell:'} *${alert.title}*\n${alert.description}`,
      });
    } else {
      // Generic JSON POST
      body = JSON.stringify(alert);
    }

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'TokenTether/1.0.0',
        },
      };

      const protocol = url.protocol === 'https:' ? https : http;

      const req = protocol.request(url, options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            logger.info(`Webhook alert sent: ${alert.type}`);
            resolve();
          } else {
            reject(new Error(`Webhook returned ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy(new Error('Webhook timeout (10s)'));
      });
      req.write(body);
      req.end();
    });
  }

  /**
   * Send alert via email using nodemailer.
   */
  async _sendEmail(alert) {
    if (!this.mailer) return;

    const emojis = { warning: '!', critical: '!!!', high: '!!' };

    await this.mailer.sendMail({
      from: `"TokenTether" <${this.config.smtpUser}>`,
      to: this.config.alertEmail,
      subject: `${emojis[alert.severity] || ''} ${alert.title}`,
      text: `${alert.description}\n\nTimestamp: ${alert.timestamp}\nSeverity: ${alert.severity}\n\nDetails:\n${JSON.stringify(alert.data, null, 2)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: ${alert.severity === 'critical' ? '#ff0000' : '#ff8800'};">${alert.title}</h2>
          <p>${alert.description}</p>
          <hr>
          <p><strong>Timestamp:</strong> ${alert.timestamp}</p>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${JSON.stringify(alert.data, null, 2)}</pre>
          <p style="color: #888; font-size: 12px;">Sent by TokenTether v1.0.0</p>
        </div>
      `,
    });

    logger.info(`Email alert sent to ${this.config.alertEmail}: ${alert.type}`);
  }

  /**
   * Write alert to a JSON file in the configured alert directory.
   */
  async _writeFile(alert) {
    if (!fs.existsSync(this.config.alertDir)) {
      fs.mkdirSync(this.config.alertDir, { recursive: true });
    }

    const filename = `alert-${alert.type}-${Date.now()}.json`;
    const filepath = path.join(this.config.alertDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(alert, null, 2));
    logger.info(`Alert written to ${filepath}`);
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Initialize the nodemailer transport.
   */
  _initMailer() {
    try {
      const nodemailer = require('nodemailer');
      this.mailer = nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpPort === 465,
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPass,
        },
      });
      logger.info('Email alerts configured');
    } catch (err) {
      logger.warn(`Could not initialize email alerts: ${err.message}`);
      this.mailer = null;
    }
  }

  /**
   * Describe which alert channels are active (for startup log).
   */
  _describeChannels() {
    const channels = ['console (always)'];
    if (this.config.webhookUrl) channels.push('webhook');
    if (this.mailer && this.config.alertEmail) channels.push('email');
    if (this.config.alertDir) channels.push('file');
    return channels.join(', ');
  }
}

module.exports = { AlertManager };
