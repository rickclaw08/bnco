// ============================================================================
// TokenTether - Logger
// ============================================================================
//
// Simple structured logger with level filtering. Outputs to stdout/stderr
// with timestamps and color coding. No external dependencies.
// ============================================================================

'use strict';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS = {
  debug: '\x1b[90m',   // gray
  info: '\x1b[36m',    // cyan
  warn: '\x1b[33m',    // yellow
  error: '\x1b[31m',   // red
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
};

class Logger {
  constructor(level = 'info') {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.info;
    this.useColor = process.stdout.isTTY !== false;
  }

  /**
   * Update the minimum log level at runtime.
   */
  setLevel(level) {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.info;
  }

  /**
   * Format a log line with timestamp and level prefix.
   */
  _format(level, args) {
    const now = new Date().toISOString();
    const prefix = `[${now}] [${level.toUpperCase().padEnd(5)}]`;

    if (this.useColor) {
      const color = COLORS[level] || COLORS.reset;
      return `${COLORS.dim}${now}${COLORS.reset} ${color}${COLORS.bright}${level.toUpperCase().padEnd(5)}${COLORS.reset} ${args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')}`;
    }

    return `${prefix} ${args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')}`;
  }

  debug(...args) {
    if (this.level <= LOG_LEVELS.debug) {
      console.log(this._format('debug', args));
    }
  }

  info(...args) {
    if (this.level <= LOG_LEVELS.info) {
      console.log(this._format('info', args));
    }
  }

  warn(...args) {
    if (this.level <= LOG_LEVELS.warn) {
      console.warn(this._format('warn', args));
    }
  }

  error(...args) {
    if (this.level <= LOG_LEVELS.error) {
      console.error(this._format('error', args));
    }
  }
}

// Singleton instance - level gets set once config loads
const logger = new Logger(process.env.TT_LOG_LEVEL || 'info');

module.exports = { Logger, logger };
